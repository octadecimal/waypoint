---
name: subagent-driven-development
description: Use when an implementation plan has independent tasks that benefit from fresh workers and task-scoped review in the current session.
---

# Subagent-Driven Development

Execute a plan with a fresh edit-only implementer for each independent task, a task-scoped review before integration, and an Astra whole-branch review at the end.

**Core principle:** focused worker + staged review package + coordinator-owned checkpoint + final Astra review.

The coordinator retains the plan, cross-task context, Git state, publication
authority, and CI loop. Edit-only workers never stage, commit, push, update a PR,
mutate CI, or spawn subagents.

Read [model routing](../../references/model-routing.md) before dispatching. Dispatch
or reuse cheaper capable workers for routine code and test edits, and scale up only
with evidence. Material planning and replanning belong to Astra. The live
collaboration schema is authoritative: a full-history fork (`fork_turns: "all"`)
inherits the parent model and cannot take a model override; use `"none"` or a
supported numeric string when selecting a model.

## Preserve mode and authority

- Plan-only: do not execute.
- Collaborative execution: one approved concrete implementation plan authorizes execution and the standing green-PR delivery target; do not ask between tasks or before publication.
- Auto / proceed autonomously / green PR: execute through the stated target without duplicate approval prompts.

Read [delivery authority and CI completion](../../references/ci-completion.md).
Explicit plan-only, local-only, no-push, or no-PR decisions override the green-PR
default. Design approval alone does not authorize implementation. Execution
authority does not grant merge authority. `astra-workflow:astra-complete` still
requires current-head green CI before hands-on testing and explicit post-test
approval before merge.

## Process

1. Verify the isolated worktree and a clean baseline.
2. Resolve the plan-owned artifact workspace and ledger.
3. Read the plan/spec once and perform a cross-task consistency scan.
4. For each task: create a brief, dispatch an implementer, stage only its owned paths, package the staged diff, review, fix and re-review, then let the coordinator commit the accepted task when authorized.
5. Package and dispatch an Astra whole-branch review.
6. Route accepted work to `astra-workflow:astra-complete` when the delivery target includes a PR.

Do not pause for routine progress permission between tasks. Stop only for an unauthorized destructive or irreversible action, unresolved security-sensitive action, material scope beyond current authority, or a plan so incomplete that every path is guesswork. In auto mode, reversible implementation rulings and Astra replans continue without another prompt.

## Setup

Use `astra-workflow:using-git-worktrees` to create or verify an isolated workspace. Never implement on a primary branch without explicit user authorization. Require a clean index and working tree at the start; preserve ambiguous changes instead of absorbing or deleting them.

Resolve this plan's artifact workspace:

```text
python <skill-dir>/scripts/sdd_workspace.py <plan-file>
```

The helper creates a plan-specific directory under `<worktree>/.astra-workflow/sdd/` with a marker containing the exact plan and repository root. Its parent is self-ignored. It refuses to overwrite an ambiguous ignore file or reuse a workspace whose marker does not match. The helper never deletes artifacts.

The plan may live in the worktree or under `<git-common-dir>/astra-workflow/<task-id>/plan.md`. Run helpers from the feature worktree so they bind to the correct checkout.

Create `<workspace>/progress.md` with:

```markdown
# SDD ledger — plan: <absolute plan path>

Mode: <plan-only | collaborative | auto>
Authorization: <source and delivery boundary>
Worktree: <absolute path>
Branch/base: <branch> / <merge-base SHA>
```

If the ledger exists, verify its plan, worktree, branch, and live Git state. A `Task N: complete` line plus its coordinator commit proves the task finished. Resume a mid-loop task at the next recorded round. If identity or ownership is ambiguous, preserve the workspace and create no replacement over it.

The ledger survives conversation compaction. After compaction, reconcile it with `git log`, the staged diff, and live agents before dispatching work. Never infer completion from memory alone.

## Plan preflight

Read the plan and its referenced spec. The spec and accepted user decisions are binding; the plan is their executable argument. Extract Global Constraints, task ownership, interfaces, checks, mode, and delivery target.

Before Task 1, write a table to the ledger:

- one row per task comparing its code steps, tests, paths, and acceptance criteria;
- one row per pair of tasks sharing a file or interface, comparing producer and consumer;
- one row for each conflict with a global constraint or known repository behavior.

Record each material decision:

```text
Ruling: <decision> — <evidence/reason> — <cost if wrong>
```

Small corrections use the spec and repository evidence. Architecture, scope, acceptance-criteria, or task-decomposition changes go to the current Astra planner or one read-only Astra child selected through the routing guide. Reuse that planner for later material replans. In auto mode, apply an in-scope replan and continue. In collaborative mode, return only scope that exceeds the approved plan.

## Model selection

Use the shared routing guide rather than duplicating a price table:

- Complete-code transcription or a single-file mechanical edit: lowest-cost capable worker.
- Routine implementation, integration, or investigation: balanced coding worker.
- Subtle concurrency, persistence, security, or broad diagnosis: stronger coding model.
- Planning, material replanning, and final whole-branch review: Astra.
- Task review: match model strength to the diff and consequence of error.
- Fix rounds 4-5: fresh worker at a stronger supported tier than the stuck implementer.

Specify model and reasoning effort explicitly with a focused `fork_turns: "none"`
or supported numeric history. Routine implementation delegation is required under
the shared routing guide; briefing cost, task size, and coupling are not exceptions.

## Task briefs and artifacts

Extract a task without copying the whole plan through coordinator context:

```text
python <skill-dir>/scripts/task_brief.py <plan-file> <task-number>
```

It prepends the plan's complete `Global Constraints` section to the extracted task,
writes `<workspace>/task-N-brief.md`, and prints the path. If the section is missing,
the brief says so explicitly. Name the worker report `<workspace>/task-N-report.md`.

The dispatch contains:

1. One line describing where the task fits.
2. The brief path as the authoritative task requirements and binding Global Constraints.
3. Interfaces and rulings from earlier tasks that the brief cannot know.
4. Exact owned and excluded paths.
5. The report path and output contract.
6. The edit-only, no-subagent boundary.

Do not paste accumulated task history. Exact values remain in the brief. Carry a pointer to any relevant parked finding in the ledger.

Before dispatch, run `git rev-parse HEAD`, record the result as `TASK_BASE`, and
confirm the index and working tree contain no unexplained residue from another task.
The recorded base, not `HEAD~1`, bounds this task through review and its coordinator
checkpoint commit.

Use [implementer prompt](implementer-prompt.md). Record the worker identity so rounds 1-3 can use `collaboration.followup_task` when available.

Independent workers may run concurrently only when ownership does not overlap and
tasks have no unfinished dependency. Follow
`astra-workflow:dispatching-parallel-agents`. Serialize tasks that share files,
interfaces, mutable resources, or test infrastructure, while keeping each task with
one worker. The shared filesystem makes fake independence dangerous.

## Handle the implementer report

Follow [continuation](../../references/continuation.md): consume the report,
inspect evidence, and advance the review/integration loop in the same turn.
Do not stop to ask the user to acknowledge a completed worker assignment.

The worker returns:

- `DONE`: implementation and required checks completed.
- `DONE_WITH_CONCERNS`: completed, with named correctness or scope concerns.
- `NEEDS_CONTEXT`: blocked on missing facts.
- `BLOCKED`: cannot complete with the current scope or capability.

Read the report file. For missing context, supply the missing evidence and resume. For insufficient reasoning, select a stronger supported model. For an oversized task, split it along real ownership boundaries and update the ledger. For a plan defect, obtain an Astra ruling or replan.

Never force an unchanged retry. Do not treat a worker's summary or test claim as review approval.

## Stage and package the task

After a worker returns, the coordinator:

1. Inspects `git status --short` and the named changed paths.
2. Rejects ownership violations or ambiguous changes before staging.
3. Stages only explicit task-owned paths, including intended new files.
4. Inspects `git diff --cached --stat` and `git diff --cached`.
5. Records the staged snapshot with `git write-tree`; keep this tree ID as the
   prior reviewed state if a fix round is needed.
6. Generates a staged package against the `TASK_BASE` recorded before dispatch:

```text
python <skill-dir>/scripts/review_package.py <plan-file> <TASK_BASE> --staged
```

The package includes staged file status, stat, and binary-capable diff. The helper hashes the staged diff into the filename so fix rounds cannot overwrite prior evidence. If nothing is staged, it fails.

Pass the brief, worker report, package, task base, and exact Global Constraints to the reviewer. Use [task reviewer prompt](task-reviewer-prompt.md). The reviewer is read-only and does not rerun broad suites merely to duplicate fresh worker evidence.

Resolve every `Cannot verify` item in the coordinator. A confirmed gap enters the fix loop. A verified cross-task condition is recorded in the ledger.

## Task review gate

Task review requires both:

- requirements verdict: compliant for all verifiable task requirements;
- quality verdict: approved, with no open Critical or Important finding.

Minor findings are recorded as:

```text
Task N: minor deferred — <finding> — <reason>
```

They do not enter the task fix loop, but the final Astra reviewer receives them.

A plan-mandated defect is still a defect. Route a conflict between review and plan to the existing Astra planner, record the ruling, then fix or preserve the implementation accordingly.

## Fix loop

A task enters the loop for a requirements failure, a confirmed gap, or any Critical or Important finding. One round is one implementation fix plus one scoped re-review. Maximum: five rounds.

Rounds 1-3 resume the original implementer with the findings verbatim and the same brief/report paths. If resuming is unavailable, dispatch a fresh worker with those artifacts.

Rounds 4-5 use a fresh, stronger worker. Tell it how many attempts occurred and require it to read the report before editing.

Every fix worker:

1. edits only task-owned paths;
2. reruns the focused tests covering the amended code;
3. appends command, output, changes, and risks to the same report;
4. returns the short status contract;
5. does not stage, commit, push, publish, or dispatch workers.

For each re-review, the coordinator restages the explicit task paths and records the current index tree as the reviewed state:

```text
git write-tree
```

Use the prior reviewed tree as `FIX_BASE`, then generate only the fix diff:

```text
python <skill-dir>/scripts/review_package.py <plan-file> <FIX_BASE> --staged
```

Dispatch [scoped re-review prompt](re-review-prompt.md) with the open findings, brief, report, and package. Each finding receives `ADDRESSED` or `NOT ADDRESSED`; new Critical/Important breakage in the fix diff joins the open list. Out-of-scope observations become deferred ledger items and do not expand the loop.

After each round:

```text
Task N: fix round R/5 — X addressed, Y open — index <tree> — <findings>
```

At round five, stop dispatching. The coordinator adjudicates each residual finding with plan/spec evidence:

- Reviewer is wrong or the point is contestable: park it with a ruling.
- Real but nonblocking: park it with a ruling and cost.
- Real and load-bearing: obtain an Astra replan/ruling for the smallest safe correction. Stop only if every path exceeds authority or is guesswork.

Every parked item stays visible to the final Astra review. No silent discard.

## Accept and checkpoint a task

After task review accepts the staged diff, and the plan already authorizes local checkpoint commits, the coordinator:

1. inspects the staged diff again;
2. commits using repository conventions;
3. records the commit and review evidence in the ledger;
4. verifies the index and working tree contain no unexplained residue;
5. marks the task complete.

```text
Task N: complete — commit <sha> — review package <path> — checks <summary>
```

Task-review acceptance is the review gate; it is not a new user approval prompt. Existing plan authorization covers the checkpoint commit. If the plan explicitly forbids commits, do not use commit-dependent SDD task checkpoints; use `astra-workflow:executing-plans` or replan the execution method.

Never begin a dependent task while the prior task has unresolved load-bearing findings.

## Final whole-branch review

After all task commits and integrated local checks pass:

```text
python <skill-dir>/scripts/review_package.py <plan-file> <MERGE_BASE> <HEAD>
```

Dispatch an Astra reviewer using `astra-workflow:requesting-code-review` and its [reviewer template](../requesting-code-review/code-reviewer.md). Include the plan/spec, Global Constraints, full branch package, and every deferred minor and parked ruling. Confirm the head SHA has not changed before acting on the verdict.

If final review finds issues, send the complete set to one fix worker. The worker remains edit-only. The coordinator stages its explicit paths, generates a staged package, and performs one scoped re-review. Residual findings are adjudicated and recorded; a load-bearing design defect returns to Astra. Do not create one worker per finding or endless whole-branch review rounds.

Run the integrated local gate after final fixes. The coordinator creates the final authorized commit only after the scoped re-review accepts the staged change.

## Finish and preserve artifacts

Copy every ledger `Ruling:` line into the final handoff with its cost if wrong. Record the final head, checks, deferred items, and artifact workspace path in the Astra task checkpoint.

Do not automatically delete the SDD workspace. It contains the ledger, task briefs, reports, and review packages needed across CI repair and hands-on testing. Cleanup is allowed only after integration or explicit abandonment, after verifying the marker matches the exact plan and worktree and no live task depends on it. Never delete a sibling workspace or a directory with missing, invalid, or mismatched ownership metadata.

For an explicit local-only/no-push/no-PR target, report the verified result and
preserved workspace. Otherwise approved implementation flows into
`astra-workflow:astra-complete`; continue through current-head green CI without
another routine prompt. Stop for user testing at that point; merge requires
explicit approval after the user tests that exact revision.

## Common rationalizations

| Excuse | Reality |
| --- | --- |
| "The worker can commit its own task" | Workers are edit-only; coordinator review precedes every Git mutation. |
| "The report is detailed, so review is redundant" | Claims are not diff verification. Package the staged change. |
| "Use `HEAD~1`" | Multi-commit or resumed tasks break that assumption; record the real base. |
| "One more fix round" | Five rounds is the cap; adjudicate and route material defects to Astra. |
| "This plan says to do it, so the finding is invalid" | Plans can be wrong; the spec and current user decisions are authoritative. |
| "Delete the workspace now that code is committed" | It remains audit and recovery evidence through delivery and testing. |
| "Full-history fork lets the worker understand everything" | It bloats context, and model overrides do not apply to `all`; write a focused brief. |
| "Green local tests mean the PR is ready" | `astra-complete` requires expected CI green on the current PR head SHA. |
