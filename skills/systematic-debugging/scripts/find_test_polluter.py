#!/usr/bin/env python3
"""Run test files one at a time and identify the first that creates a path."""

from __future__ import annotations

import argparse
import glob
import subprocess
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Find the first test file that creates an unwanted path."
    )
    parser.add_argument("pollution", help="File or directory that must not appear")
    parser.add_argument("pattern", help="Recursive glob for test files")
    parser.add_argument(
        "command",
        nargs=argparse.REMAINDER,
        help="Test command containing one {test} placeholder",
    )
    args = parser.parse_args()
    if args.command[:1] == ["--"]:
        args.command = args.command[1:]
    if args.command.count("{test}") != 1:
        parser.error("command must contain exactly one {test} placeholder")
    return args


def main() -> int:
    args = parse_args()
    pollution = Path(args.pollution)
    if pollution.exists():
        print(f"Refusing to start: pollution already exists: {pollution}", file=sys.stderr)
        return 2

    tests = sorted(Path(path) for path in glob.glob(args.pattern, recursive=True))
    tests = [path for path in tests if path.is_file()]
    if not tests:
        print(f"No test files matched: {args.pattern}", file=sys.stderr)
        return 2

    for index, test_file in enumerate(tests, 1):
        command = [str(test_file) if part == "{test}" else part for part in args.command]
        print(f"[{index}/{len(tests)}] {test_file}")
        try:
            subprocess.run(command, check=False)
        except OSError as error:
            print(f"Could not run test command: {error}", file=sys.stderr)
            return 2
        if pollution.exists():
            print(f"Polluter: {test_file}\nCreated: {pollution}")
            return 1

    print(f"No polluter found across {len(tests)} test files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
