from __future__ import annotations

import json
import re
import unittest
from pathlib import Path
from urllib.parse import unquote, urlparse

import yaml


PLUGIN_ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = PLUGIN_ROOT / ".codex-plugin" / "plugin.json"
EXPECTED_SKILLS = {"astra-plan", "astra-complete"}
SEMVER = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$")
MARKDOWN_LINK = re.compile(r"!?\[[^]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)")


class PackageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

    def test_manifest_metadata_and_skill_root(self) -> None:
        for field in ("name", "version", "description"):
            self.assertIsInstance(self.manifest.get(field), str)
            self.assertTrue(self.manifest[field].strip(), field)
        self.assertEqual(self.manifest["name"], "astra-workflow")
        self.assertRegex(self.manifest["version"], SEMVER)
        author = self.manifest.get("author")
        self.assertIsInstance(author, dict)
        self.assertTrue(isinstance(author.get("name"), str) and author["name"].strip())

        skills_value = self.manifest.get("skills")
        self.assertIsInstance(skills_value, str)
        skills_root = (PLUGIN_ROOT / skills_value).resolve()
        self.assertTrue(skills_root.is_relative_to(PLUGIN_ROOT.resolve()))
        self.assertTrue(skills_root.is_dir())

    def test_exact_skills_and_skill_documents(self) -> None:
        skills_root = (PLUGIN_ROOT / self.manifest["skills"]).resolve()
        skill_dirs = {path.name for path in skills_root.iterdir() if path.is_dir()}
        self.assertEqual(skill_dirs, EXPECTED_SKILLS)

        for skill_name in EXPECTED_SKILLS:
            skill_path = skills_root / skill_name / "SKILL.md"
            self.assertTrue(skill_path.is_file(), skill_path)
            text = skill_path.read_text(encoding="utf-8")
            self.assertTrue(text.startswith("---\n"))
            parts = text.split("\n---\n", 1)
            self.assertEqual(len(parts), 2, skill_path)
            metadata = yaml.safe_load(parts[0][4:])
            self.assertIsInstance(metadata, dict)
            self.assertEqual(metadata.get("name"), skill_name)
            self.assertIsInstance(metadata.get("description"), str)
            self.assertTrue(metadata["description"].strip())
            self.assertGreaterEqual(len(parts[1].strip().split()), 10, skill_path)

    def test_relative_markdown_links_resolve_inside_plugin(self) -> None:
        markdown_paths = [
            *(PLUGIN_ROOT / "skills").rglob("*.md"),
            *(PLUGIN_ROOT / "references").rglob("*.md"),
        ]
        for markdown_path in markdown_paths:
            for target in MARKDOWN_LINK.findall(markdown_path.read_text(encoding="utf-8")):
                parsed = urlparse(target)
                if parsed.scheme or target.startswith("//") or target.startswith("#"):
                    continue
                path = (markdown_path.parent / unquote(parsed.path)).resolve()
                self.assertTrue(path.is_relative_to(PLUGIN_ROOT.resolve()), target)
                self.assertTrue(path.is_file(), target)

    def test_optional_metadata_and_explicit_invocation(self) -> None:
        interface = self.manifest.get("interface")
        if interface is not None:
            self.assertIsInstance(interface, dict)
            for field in ("displayName", "shortDescription", "longDescription", "developerName", "category"):
                self.assertIsInstance(interface.get(field), str)
                self.assertTrue(interface[field].strip(), field)
            prompt = interface.get("defaultPrompt")
            self.assertTrue(
                isinstance(prompt, str) and prompt.strip()
                or isinstance(prompt, list) and prompt and all(isinstance(item, str) and item.strip() for item in prompt)
            )
            if "capabilities" in interface:
                self.assertIsInstance(interface["capabilities"], list)

        for metadata_path in (PLUGIN_ROOT / "skills").glob("*/agents/openai.yaml"):
            metadata = yaml.safe_load(metadata_path.read_text(encoding="utf-8"))
            self.assertIsInstance(metadata, dict)
            interface = metadata.get("interface")
            self.assertIsInstance(interface, dict)
            for field in ("display_name", "short_description"):
                self.assertIsInstance(interface.get(field), str)
                self.assertTrue(interface[field].strip(), field)
            for field in ("icon_small", "icon_large", "default_prompt"):
                if field in interface:
                    self.assertIsInstance(interface[field], str)
                    self.assertTrue(interface[field].strip(), field)
            policy = metadata.get("policy")
            if policy is not None:
                self.assertIsInstance(policy, dict)
                if "allow_implicit_invocation" in policy:
                    self.assertIsInstance(policy["allow_implicit_invocation"], bool)
                    self.assertTrue(policy["allow_implicit_invocation"])


if __name__ == "__main__":
    unittest.main()
