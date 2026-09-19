#!/usr/bin/env python3
"""Write a committed-range or staged-index package for a read-only reviewer."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from sdd_workspace import workspace_for


def git(repo: Path, *args: str, allow_diff: bool = False) -> str:
    result = subprocess.run(
        ["git", "-C", str(repo), *args],
        encoding="utf-8",
        errors="replace",
        capture_output=True,
    )
    allowed = {0, 1} if allow_diff else {0}
    if result.returncode not in allowed:
        raise ValueError(result.stderr.strip() or f"git {' '.join(args)} failed")
    return result.stdout


def short(repo: Path, revision: str) -> str:
    return git(repo, "rev-parse", "--short", revision).strip()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plan_file")
    parser.add_argument("base")
    parser.add_argument("head", nargs="?")
    parser.add_argument("--staged", action="store_true")
    parser.add_argument("--output")
    args = parser.parse_args()

    try:
        plan = Path(args.plan_file).resolve()
        if not plan.is_file():
            raise ValueError(f"no such plan file: {plan}")
        root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel").strip()).resolve()
        base = git(root, "rev-parse", "--verify", args.base).strip()

        if args.staged:
            if args.head:
                raise ValueError("HEAD is not accepted with --staged")
            index_tree = git(root, "write-tree").strip()
            names = git(root, "diff", "--name-status", base, index_tree)
            stat = git(root, "diff", "--stat", base, index_tree)
            diff = git(root, "diff", "-U10", "--binary", base, index_tree)
            if not diff.strip():
                raise ValueError(f"no staged changes relative to {base}")
            default_name = f"review-{short(root, base)}..index-{index_tree[:12]}.diff"
            header = f"# Staged review package: {base}..{index_tree}"
            sections = [
                header,
                "",
                "## Staged files",
                names.rstrip(),
                "",
                "## Stat",
                stat.rstrip(),
                "",
                "## Diff",
                diff.rstrip(),
                "",
            ]
        else:
            if not args.head:
                raise ValueError("HEAD is required unless --staged is used")
            head = git(root, "rev-parse", "--verify", args.head).strip()
            commits = git(root, "log", "--oneline", f"{base}..{head}")
            stat = git(root, "diff", "--stat", f"{base}..{head}")
            diff = git(root, "diff", "-U10", "--binary", f"{base}..{head}")
            if not diff.strip():
                raise ValueError(f"no committed changes in {base}..{head}")
            default_name = f"review-{short(root, base)}..{short(root, head)}.diff"
            header = f"# Review package: {base}..{head}"
            sections = [
                header,
                "",
                "## Commits",
                commits.rstrip(),
                "",
                "## Stat",
                stat.rstrip(),
                "",
                "## Diff",
                diff.rstrip(),
                "",
            ]

        output = (
            Path(args.output).resolve()
            if args.output
            else workspace_for(str(plan)) / default_name
        )
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text("\n".join(sections), encoding="utf-8")
        print(output)
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        print(error, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
