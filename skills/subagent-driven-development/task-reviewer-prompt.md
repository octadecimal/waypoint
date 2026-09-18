# Task Reviewer Prompt Template

Use this after the coordinator stages only the task-owned paths and generates a staged review package.

```text
collaboration.spawn_agent:
  task_name: "review_task_[N]"
  fork_turns: "none"
  model: [MODEL FROM LIVE SCHEMA]
  reasoning_effort: [SUPPORTED EFFORT]
  message: |
    Review Task [N] as a read-only gate. First judge requirements compliance,
    then implementation quality. A separate Astra whole-branch review follows.

    Task brief: [BRIEF_FILE]
    Implementer report: [REPORT_FILE]
    Staged diff package: [DIFF_FILE]
    Task base: [BASE_SHA]

    Binding global constraints:
    [GLOBAL_CONSTRAINTS]

    Read the brief, report, and package. The package is your view of the staged
    change and includes file status, stat, and full diff. Do not rerun Git commands
    merely to recreate it. If a hunk ends mid-function, inspect only enough unchanged
    code to resolve that named risk. Shared API, lock ordering, persistence, security,
    or lifecycle changes justify focused caller inspection; name the risk and check.

    ## Read-only boundary

    Do not edit files, stage, commit, push, move HEAD, update a PR, mutate CI, or
    spawn subagents. Do not crawl the repository. The coordinator owns integration.

    ## Evidence discipline

    Treat the implementer report as unverified claims. Compare it with the diff.
    Do not rerun a broad suite to duplicate fresh evidence. Run a focused test only
    for a concrete doubt not answered by the report; otherwise name the check the
    coordinator should run. Missing or garbled RED/GREEN evidence is a finding when
    the task requires TDD. Unexplained warnings are findings.

    ## Requirements review

    Check every brief requirement and owned path:
    - Missing behavior, files, tests, or error cases.
    - Extra behavior, scope creep, or speculative abstractions.
    - Misunderstood behavior or mismatched exact values.
    - Produced interfaces that disagree with named consumers.

    When a requirement lives in unchanged code or spans later tasks, report
    `Cannot verify from this diff` with the exact coordinator check. Do not broaden
    your search to manufacture certainty.

    ## Quality review

    Check correctness, failure handling, security, data preservation, concurrency,
    compatibility, clarity, and repository conventions where relevant. Confirm
    tests assert observable behavior and meaningful edge cases. Flag duplication or
    abstraction only when it creates real maintenance or correctness cost.

    A plan can require defective code. Label such an issue `plan-mandated`; do not
    suppress it or reduce severity. The coordinator routes material replanning to
    Astra.

    Severity:
    - Critical: security, data loss, severe regression, broken core behavior.
    - Important: missed requirement, incorrect or fragile behavior, compatibility
      break, or maintainability damage that blocks task acceptance.
    - Minor: bounded improvement that does not block the requested outcome.

    ## Output

    ### Requirements verdict
    - Compliant | Issues found
    - Cannot verify: [item and exact coordinator check]

    ### Strengths
    Specific file:line evidence.

    ### Issues
    #### Critical
    #### Important
    #### Minor

    For each issue: file:line, defect, impact, and smallest viable fix.

    ### Checks performed
    Focused inspection or command and result.

    ### Task quality
    **Approved | Needs fixes**
    **Reasoning:** one or two technical sentences.
```

The reviewer returns two gates: requirements and quality. A missing verdict is not approval.
