#!/usr/bin/env python3
"""Resolve a plan-owned, git-ignored SDD artifact workspace."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path


MARKER = ".workspace.json"


def git(repo: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(repo), *args],
        check=True,
        encoding="utf-8",
        errors="strict",
        capture_output=True,
    )
    return result.stdout.strip()


def workspace_for(plan_arg: str) -> Path:
    plan = Path(plan_arg).resolve()
    if not plan.is_file():
        raise ValueError(f"no such plan file: {plan}")

    invocation_dir = Path.cwd().resolve()
    try:
        root = Path(git(invocation_dir, "rev-parse", "--show-toplevel")).resolve()
        common_raw = git(invocation_dir, "rev-parse", "--git-common-dir")
        common = Path(common_raw)
        if not common.is_absolute():
            common = invocation_dir / common
        common = common.resolve()
    except subprocess.CalledProcessError as error:
        raise ValueError(f"plan is not inside a Git worktree: {plan}") from error

    if not any(_is_within(plan, parent) for parent in (root, common)):
        raise ValueError(
            f"plan must be inside the current Git worktree or common Git directory: {plan}"
        )

    slug = re.sub(r"[^A-Za-z0-9._-]+", "-", plan.stem).strip(".-")
    if not slug:
        raise ValueError(f"cannot derive workspace name from: {plan}")
    digest = hashlib.sha256(str(plan).encode("utf-8")).hexdigest()[:12]

    base = root / ".astra-workflow" / "sdd"
    resolved_base = base.resolve(strict=False)
    if not _is_within(resolved_base, root):
        raise ValueError(
            f"artifact workspace escapes the repository through a symlink: {base} -> {resolved_base}"
        )
    ignore = base / ".gitignore"
    if ignore.exists() and ignore.read_text(encoding="utf-8") != "*\n":
        raise ValueError(f"refusing to overwrite ambiguous ignore file: {ignore}")
    base.mkdir(parents=True, exist_ok=True)
    if not ignore.exists():
        ignore.write_text("*\n", encoding="utf-8")

    workspace = base / f"{slug}-{digest}"
    resolved_workspace = workspace.resolve(strict=False)
    if not _is_within(resolved_workspace, resolved_base):
        raise ValueError(
            f"plan workspace escapes the owned artifact directory: {workspace} -> {resolved_workspace}"
        )
    marker = workspace / MARKER
    identity = {"version": 1, "plan": str(plan), "repo_root": str(root)}

    if workspace.exists():
        if not marker.is_file():
            raise ValueError(f"workspace has no ownership marker: {workspace}")
        try:
            existing = json.loads(marker.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise ValueError(f"invalid ownership marker: {marker}") from error
        if existing != identity:
            raise ValueError(f"ownership marker does not match this plan: {marker}")
    else:
        workspace.mkdir()
        marker.write_text(json.dumps(identity, indent=2) + "\n", encoding="utf-8")

    return workspace


def _is_within(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
    except ValueError:
        return False
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plan_file")
    args = parser.parse_args()
    try:
        print(workspace_for(args.plan_file))
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        print(error, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
