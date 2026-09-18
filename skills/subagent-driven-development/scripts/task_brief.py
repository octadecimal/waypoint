#!/usr/bin/env python3
"""Extract one task from an implementation plan into its artifact workspace."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from sdd_workspace import workspace_for


TASK = re.compile(r"^#{1,6}\s+Task\s+(\d+)(?:\D|$)", re.IGNORECASE)
FENCE = re.compile(r"^\s*(`{3,}|~{3,})")
HEADING = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
GLOBAL_CONSTRAINTS = re.compile(r"^Global Constraints\s*#*\s*$", re.IGNORECASE)


def extract_task(plan: Path, number: int) -> str:
    lines = plan.read_text(encoding="utf-8").splitlines(keepends=True)
    selected: list[str] = []
    active = False
    fence: tuple[str, int] | None = None

    for line in lines:
        fence_match = FENCE.match(line)
        if fence_match:
            token = fence_match.group(1)
            if fence is None:
                fence = (token[0], len(token))
            elif token[0] == fence[0] and len(token) >= fence[1]:
                fence = None
            if active:
                selected.append(line)
            continue

        match = None if fence else TASK.match(line)
        if match:
            current = int(match.group(1))
            if active and current != number:
                break
            active = current == number
        if active:
            selected.append(line)

    if not selected:
        raise ValueError(f"task {number} not found in {plan}")
    return "".join(selected).rstrip() + "\n"


def extract_global_constraints(plan: Path) -> str:
    lines = plan.read_text(encoding="utf-8").splitlines(keepends=True)
    selected: list[str] = []
    active = False
    level = 0
    fence: tuple[str, int] | None = None

    for line in lines:
        fence_match = FENCE.match(line)
        if fence_match:
            token = fence_match.group(1)
            if fence is None:
                fence = (token[0], len(token))
            elif token[0] == fence[0] and len(token) >= fence[1]:
                fence = None
            if active:
                selected.append(line)
            continue

        heading = None if fence else HEADING.match(line)
        if not active and heading and GLOBAL_CONSTRAINTS.match(heading.group(2)):
            active = True
            level = len(heading.group(1))
            continue
        if active and (TASK.match(line) or (heading and len(heading.group(1)) <= level)):
            break
        if active:
            selected.append(line)

    return "".join(selected).strip()


def build_brief(plan: Path, number: int) -> str:
    constraints = extract_global_constraints(plan)
    if not constraints:
        constraints = "_No Global Constraints section was found in the plan._"
    return (
        f"# Task Brief\n\nSource plan: `{plan}`\n\n"
        f"## Binding Global Constraints\n\n{constraints}\n\n"
        f"## Task\n\n{extract_task(plan, number)}"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plan_file")
    parser.add_argument("task_number", type=int)
    parser.add_argument("outfile", nargs="?")
    args = parser.parse_args()

    try:
        plan = Path(args.plan_file).resolve()
        if not plan.is_file():
            raise ValueError(f"no such plan file: {plan}")
        output = (
            Path(args.outfile).resolve()
            if args.outfile
            else workspace_for(str(plan)) / f"task-{args.task_number}-brief.md"
        )
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(build_brief(plan, args.task_number), encoding="utf-8")
        print(output)
    except (OSError, ValueError) as error:
        print(error, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
