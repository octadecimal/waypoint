from __future__ import annotations

import shutil
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


PLUGIN_ROOT = Path(__file__).resolve().parents[1]
POLLUTER = (
    PLUGIN_ROOT / "skills" / "systematic-debugging" / "scripts" / "find_test_polluter.py"
)
RENDERER = PLUGIN_ROOT / "skills" / "writing-skills" / "scripts" / "render_graphs.mjs"


class QualityHelperTests(unittest.TestCase):
    @unittest.skipUnless(shutil.which("node"), "Node.js is required")
    def test_combined_graph_preserves_edges_after_inline_rank_direction(self) -> None:
        script = (
            "import assert from 'node:assert/strict';"
            f"import {{ graphBody }} from {json.dumps(RENDERER.as_uri())};"
            "assert.equal(graphBody('digraph x { rankdir=LR; a -> b; }'), 'a -> b;');"
        )
        result = subprocess.run(["node", "--input-type=module", "-e", script],
                                capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_polluter_reports_first_file_that_creates_path(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            (root / "a.test").write_text("clean", encoding="utf-8")
            (root / "b.test").write_text("pollute", encoding="utf-8")
            runner = root / "runner.py"
            runner.write_text(
                "from pathlib import Path\n"
                "import sys\n"
                "if Path(sys.argv[1]).read_text() == 'pollute': Path('leak').mkdir()\n",
                encoding="utf-8",
            )

            result = subprocess.run(
                [
                    sys.executable,
                    str(POLLUTER),
                    "leak",
                    "*.test",
                    sys.executable,
                    str(runner),
                    "{test}",
                ],
                cwd=root,
                capture_output=True,
                text=True,
                check=False,
            )

            self.assertEqual(result.returncode, 1, result.stderr)
            self.assertIn("Polluter: b.test", result.stdout)

    def test_polluter_refuses_dirty_start(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            (root / "leak").mkdir()
            (root / "only.test").touch()

            result = subprocess.run(
                [
                    sys.executable,
                    str(POLLUTER),
                    "leak",
                    "*.test",
                    sys.executable,
                    "{test}",
                ],
                cwd=root,
                capture_output=True,
                text=True,
                check=False,
            )

            self.assertEqual(result.returncode, 2)
            self.assertIn("pollution already exists", result.stderr)

    def test_polluter_reports_missing_test_command(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            (root / "only.test").touch()

            result = subprocess.run(
                [
                    sys.executable,
                    str(POLLUTER),
                    "leak",
                    "*.test",
                    "definitely-not-a-real-test-command",
                    "{test}",
                ],
                cwd=root,
                capture_output=True,
                text=True,
                check=False,
            )

            self.assertEqual(result.returncode, 2)
            self.assertIn("Could not run test command", result.stderr)

    @unittest.skipUnless(shutil.which("node"), "Node.js is required")
    def test_renderer_accepts_skill_without_graphviz_diagrams(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            (root / "SKILL.md").write_text(
                "---\nname: example\ndescription: Use when testing.\n---\n\nNo diagrams.\n",
                encoding="utf-8",
            )

            result = subprocess.run(
                ["node", str(RENDERER), str(root)],
                capture_output=True,
                text=True,
                check=False,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("No dot blocks found", result.stdout)
            self.assertFalse((root / "diagrams").exists())


if __name__ == "__main__":
    unittest.main()
