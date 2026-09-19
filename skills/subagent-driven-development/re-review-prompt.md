# Scoped Re-Review Prompt Template

Use after one fix round. The package must contain the staged diff from the prior reviewed index tree to the current staged index.

```text
collaboration.spawn_agent:
  task_name: "rereview_task_[N]_round_[R]"
  fork_turns: "none"
  model: [MODEL FROM LIVE SCHEMA]
  reasoning_effort: [SUPPORTED EFFORT]
  message: |
    Re-review Task [N], fix round [R]. Verify each prior finding and inspect only
    the fix diff for new breakage. This is not a fresh broad review.

    Task brief: [BRIEF_FILE]
    Implementer report with appended fix evidence: [REPORT_FILE]
    Prior reviewed index tree: [FIX_BASE]
    Current staged diff package: [DIFF_FILE]

    Findings to verify, copied verbatim:
    [FINDINGS]

    Read the package and report. Do not recreate the diff, edit files, stage, commit,
    push, move HEAD, update a PR, mutate CI, or spawn subagents.

    Verdict every listed finding. `Attempted` is not addressed: the defect must no
    longer exist, with file:line evidence. Inspect the fix diff for Critical or
    Important breakage introduced by the correction. An issue entirely outside the
    fix diff is an out-of-scope observation and cannot extend this round.

    Confirm the appended report names covering tests, commands, and output. Do not
    rerun a broad suite. Run a focused check only for a concrete unanswered doubt.

    ### Finding verdicts
    - **[finding]** — ADDRESSED | NOT ADDRESSED — [file:line evidence]

    ### New breakage in fix diff
    [severity, file:line, defect, impact, smallest fix | None]

    ### Out-of-scope observations
    [nonblocking observation | None]

    ### Verdict
    **All findings addressed, no new Critical/Important breakage | Findings remain**
    Open findings: [list | None]
```

Use a cheap-to-mid model for a small mechanical fix diff and a stronger model for subtle behavior. Follow the live routing guide; never use a full-history fork with a model override.
