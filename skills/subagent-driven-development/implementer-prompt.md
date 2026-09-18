# Implementer Worker Prompt Template

Use this for one bounded implementation task. Fill every bracketed field from the task brief, ledger, and live routing guide.

```text
collaboration.spawn_agent:
  task_name: "implement_task_[N]"
  fork_turns: "none"
  model: [MODEL FROM LIVE SCHEMA]
  reasoning_effort: [SUPPORTED EFFORT]
  message: |
    Implement Task [N]: [TASK NAME]. This task contributes [ONE-LINE CONTEXT].

    Read this first. It is your authoritative task requirements. It begins with
    the plan's binding Global Constraints, followed by the task's exact values and
    checks: [BRIEF_FILE]

    Worktree: [ABSOLUTE_WORKTREE]
    Own only: [OWNED_PATHS]
    Do not edit: [EXCLUDED_PATHS]

    Earlier interfaces and rulings that this task consumes:
    [DEPENDENCIES_AND_RULINGS]

    Write your full report to: [REPORT_FILE]

    ## Boundaries

    You are an edit-only implementer. Do not stage, commit, push, open or update a
    PR, mutate CI, switch branches, move HEAD, delete worktrees or checkpoints, or
    spawn subagents. The coordinator owns Git, review, integration, publication,
    and CI. Do not edit outside your owned paths; report a dependency instead.

    Follow repository instructions and use its required navigation tools. Read the
    task brief and the smallest surrounding code needed to understand callers and
    established patterns. Do not broaden the task or add speculative abstractions.

    ## Before editing

    If a required fact is absent and cannot be discovered safely, return
    NEEDS_CONTEXT with the exact missing fact. If the task requires an architectural
    decision, conflicts with the plan, or exceeds owned paths, return BLOCKED with
    evidence. Do not guess.

    ## Implementation

    For behavior changes, follow the task's TDD steps: run the focused test and
    observe the expected RED failure before implementation, write the minimum code,
    then observe GREEN. Existing failing regression tests can provide RED. For
    behavior-preserving or non-code work, run the validation named in the brief.

    Run focused checks while iterating and the task's regression check once before
    reporting. Test observable behavior. Keep output free of unexplained warnings.

    ## Self-review

    Inspect your unstaged diff and untracked files. Confirm:
    - every requirement and acceptance criterion is implemented;
    - changed paths stay inside ownership;
    - names, errors, interfaces, and edge cases match surrounding code;
    - tests prove behavior and RED/GREEN evidence is real;
    - no unrelated cleanup or future-facing framework was added.

    Fix concrete self-review findings before reporting.

    ## Fix rounds

    If resumed with review findings, address only the open findings and any breakage
    caused by the fix. Re-run covering tests and append a dated fix-round section to
    the same report. Do not rewrite earlier evidence.

    ## Report file

    Write:
    - Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
    - Implemented behavior or attempted work
    - Changed paths
    - RED: command, relevant failing output, and expected reason (when required)
    - GREEN: command and relevant passing output
    - Regression checks: commands and results
    - Self-review findings and corrections
    - Concerns, missing context, or remaining risk

    Then reply in at most 15 lines with status, one-line check summary, concerns,
    changed paths, and the report path. If blocked, include the blocking evidence in
    the reply so the coordinator can act without guessing.
```

For fix rounds 1-3, send findings with `collaboration.followup_task` to the original worker when possible. For rounds 4-5, create a fresh stronger worker with the same brief/report paths and state how many attempts occurred.
