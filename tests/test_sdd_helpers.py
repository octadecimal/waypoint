from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


PLUGIN_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = PLUGIN_ROOT / "skills" / "subagent-driven-development" / "scripts"


def run(*args: str, cwd: Path, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [*args],
        cwd=cwd,
        check=check,
        text=True,
        capture_output=True,
    )


class SddHelperTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.repo = Path(self.temp.name).resolve()
        run("git", "init", cwd=self.repo)
        run("git", "config", "user.email", "test@example.com", cwd=self.repo)
        run("git", "config", "user.name", "Test User", cwd=self.repo)
        (self.repo / "tracked.txt").write_text("base\n", encoding="utf-8")
        (self.repo / "plans").mkdir()
        self.plan = self.repo / "plans" / "feature.md"
        self.plan.write_text(
            """# Feature Plan

## Global Constraints

- Preserve UTF-8 text such as “smart quotes”.
- Add no dependencies.

```markdown
### Task 99: Example only
```

### Task 1: First

Do first work.

### Task 2: Second

Do second work.
""",
            encoding="utf-8",
        )
        run("git", "add", "tracked.txt", "plans/feature.md", cwd=self.repo)
        run("git", "commit", "-m", "test: baseline", cwd=self.repo)

    def tearDown(self) -> None:
        self.temp.cleanup()

    def helper(self, name: str, *args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
        return run(sys.executable, str(SCRIPTS / name), *args, cwd=self.repo, check=check)

    def test_workspace_is_plan_scoped_and_refuses_ambiguous_ownership(self) -> None:
        result = self.helper("sdd_workspace.py", str(self.plan))
        workspace = Path(result.stdout.strip())

        self.assertTrue(workspace.is_dir())
        self.assertEqual(workspace.parent, self.repo / ".astra-workflow" / "sdd")
        marker = json.loads((workspace / ".workspace.json").read_text(encoding="utf-8"))
        self.assertEqual(Path(marker["plan"]), self.plan)
        self.assertEqual(Path(marker["repo_root"]), self.repo)
        self.assertEqual((workspace.parent / ".gitignore").read_text(encoding="utf-8"), "*\n")

        marker["plan"] = str(self.repo / "plans" / "other.md")
        (workspace / ".workspace.json").write_text(json.dumps(marker), encoding="utf-8")
        failed = self.helper("sdd_workspace.py", str(self.plan), check=False)
        self.assertNotEqual(failed.returncode, 0)
        self.assertIn("ownership marker", failed.stderr)

    def test_task_brief_extracts_one_task_and_ignores_fenced_examples(self) -> None:
        result = self.helper("task_brief.py", str(self.plan), "1")
        brief = Path(result.stdout.strip())
        text = brief.read_text(encoding="utf-8")

        self.assertIn("### Task 1: First", text)
        self.assertIn("Do first work.", text)
        self.assertIn("## Binding Global Constraints", text)
        self.assertIn("Preserve UTF-8 text such as “smart quotes”.", text)
        self.assertIn("Add no dependencies.", text)
        self.assertNotIn("Task 99", text)
        self.assertNotIn("Task 2", text)

    def test_task_brief_keeps_longer_outer_fence_open(self) -> None:
        self.plan.write_text(
            """# Feature Plan

````markdown
```typescript
### Task 1: Example only
```
````

### Task 1: Real task

Implement the real behavior.
""",
            encoding="utf-8",
        )

        result = self.helper("task_brief.py", str(self.plan), "1")
        text = Path(result.stdout.strip()).read_text(encoding="utf-8")

        self.assertIn("### Task 1: Real task", text)
        self.assertIn("Implement the real behavior.", text)
        self.assertNotIn("Example only", text)

    def test_workspace_rejects_symlink_escape(self) -> None:
        with tempfile.TemporaryDirectory() as outside_name:
            outside = Path(outside_name).resolve()
            self.assertFalse(outside.is_relative_to(self.repo))
            link = self.repo / ".astra-workflow"
            try:
                os.symlink(outside, link, target_is_directory=True)
            except OSError as error:
                self.skipTest(f"directory symlinks unavailable: {error}")

            failed = self.helper("sdd_workspace.py", str(self.plan), check=False)

            self.assertNotEqual(failed.returncode, 0)
            self.assertIn("escapes the repository", failed.stderr)
            self.assertFalse((outside / "sdd" / ".gitignore").exists())

    def test_review_package_captures_staged_tracked_and_new_files(self) -> None:
        base = run("git", "rev-parse", "HEAD", cwd=self.repo).stdout.strip()
        (self.repo / "tracked.txt").write_text("changed\n", encoding="utf-8")
        (self.repo / "new.txt").write_text("new\n", encoding="utf-8")
        run("git", "add", "tracked.txt", "new.txt", cwd=self.repo)

        result = self.helper("review_package.py", str(self.plan), base, "--staged")
        package = Path(result.stdout.strip())
        text = package.read_text(encoding="utf-8")

        self.assertIn("## Staged files", text)
        self.assertIn("tracked.txt", text)
        self.assertIn("new.txt", text)
        self.assertIn("+changed", text)
        self.assertIn("+new", text)

    def test_review_package_decodes_utf8_diff_on_windows(self) -> None:
        base = run("git", "rev-parse", "HEAD", cwd=self.repo).stdout.strip()
        (self.repo / "tracked.txt").write_text("changed with ” smart quote\n", encoding="utf-8")
        run("git", "add", "tracked.txt", cwd=self.repo)

        result = self.helper("review_package.py", str(self.plan), base, "--staged")
        text = Path(result.stdout.strip()).read_text(encoding="utf-8")

        self.assertIn("+changed with ” smart quote", text)

    def test_review_package_captures_committed_range(self) -> None:
        base = run("git", "rev-parse", "HEAD", cwd=self.repo).stdout.strip()
        (self.repo / "tracked.txt").write_text("committed\n", encoding="utf-8")
        run("git", "add", "tracked.txt", cwd=self.repo)
        run("git", "commit", "-m", "test: change", cwd=self.repo)
        head = run("git", "rev-parse", "HEAD", cwd=self.repo).stdout.strip()

        result = self.helper("review_package.py", str(self.plan), base, head)
        text = Path(result.stdout.strip()).read_text(encoding="utf-8")

        self.assertIn("test: change", text)
        self.assertIn("+committed", text)
        self.assertIn(f"# Review package: {base}..{head}", text)

    def test_review_package_resolves_symbolic_revisions_once(self) -> None:
        base = run("git", "rev-parse", "HEAD", cwd=self.repo).stdout.strip()
        (self.repo / "tracked.txt").write_text("committed\n", encoding="utf-8")
        run("git", "add", "tracked.txt", cwd=self.repo)
        run("git", "commit", "-m", "test: symbolic", cwd=self.repo)
        head = run("git", "rev-parse", "HEAD", cwd=self.repo).stdout.strip()

        result = self.helper("review_package.py", str(self.plan), "HEAD~1", "HEAD")
        text = Path(result.stdout.strip()).read_text(encoding="utf-8")

        self.assertIn(f"# Review package: {base}..{head}", text)
        self.assertNotIn("HEAD~1..HEAD", text)


if __name__ == "__main__":
    unittest.main()
