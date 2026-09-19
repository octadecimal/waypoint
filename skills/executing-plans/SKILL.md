---
name: executing-plans
description: Use when a written implementation plan should be executed through a lightweight sequential worker path without the heavier task-review packaging workflow.
---

# Executing Plans

Load the plan, check it against current repository reality, execute every authorized task, verify the integrated result, and hand delivery to `astra-workflow:astra-complete` when the plan includes a PR.

Use `astra-workflow:subagent-driven-development` instead when independent tasks
justify its task-review packaging. Use this skill for tightly coupled or sequential
tasks and limited collaboration capacity. It still dispatches or reuses one
edit-only worker for each routine code/test task; sequential does not mean inline.

## Preserve the task mode

The user's latest direction controls execution:

| Mode | Behavior |
| --- | --- |
| Plan-only | Do not execute. Return to `astra-workflow:astra-plan`. |
| Collaborative execution | Execute after the concrete plan has been approved, then continue through the standing green-PR target without another approval prompt. |
| Auto / proceed autonomously / green PR | Continue through the authorized delivery target without routine re-prompts. |

Read [delivery authority and CI completion](../../references/ci-completion.md).
Existing explicit plan-only, local-only, no-push, or no-PR decisions override the
green-PR default. Do not treat design approval as implementation approval or
implementation approval as merge approval.

## 1. Load and review the plan

1. Use `astra-workflow:using-git-worktrees` to create or verify the isolated workspace. Never implement on the repository's primary branch unless the user explicitly authorized that exception.
2. Read the plan, its referenced spec, repository instructions, affected code, callers, tests, and relevant CI definitions.
3. Compare paths, symbols, commands, assumptions, and dependencies with the current checkout.
4. Create task tracking from the plan and mark already completed work only when Git state and verification evidence prove it.
5. Record a short durable checkpoint when work spans tasks or turns. Use the repository's established checkpoint location; otherwise use `<git-common-dir>/astra-workflow/<safe-task-id>.md`. Include plan path, mode, authorization source, branch/worktree, current task, verification revision, and pending work. Do not store secrets or commit the checkpoint.

Resolve stale paths, harmless typos, and reversible implementation decisions during
plan review. Material changes to architecture, scope, acceptance criteria, or task
decomposition require Astra planning. Read
[model routing](../../references/model-routing.md); if the current model is not
Astra, dispatch or reuse one read-only Astra planner with the plan, spec, evidence,
and authorization boundary. In auto mode, apply its justified replan without asking
again unless the new scope exceeds the user's authorization. In collaborative mode,
return a materially expanded scope to the user.

Stop only when every safe path depends on missing information, a destructive or irreversible action lacks authority, a security-sensitive decision is unresolved, or required external access is unavailable. A routine plan defect is a replan, not an automatic user interruption.

## 2. Execute each task

Read [model routing](../../references/model-routing.md), record the task/model/effort
and routing reason, then dispatch or reuse the selected worker. One worker owns a
coupled task's complete RED/GREEN cycle. The coordinator retains plan decisions,
review, integration, final checks, checkpoints, and Git operations.

For each task:

1. Mark it in progress and identify the task's acceptance check.
2. Give the worker the task, owned paths, RED/GREEN check, constraints, and report
   contract. The worker edits, tests, reports evidence, and does not delegate.
3. Inspect the task diff and RED/GREEN evidence against the plan. Send concrete
   fixes back to the same worker before moving on.
4. Run the relevant integration check and inspect its output.
5. Let the main coordinator alone stage and create any authorized checkpoint
   commit. Use explicit paths, inspect the staged diff, and follow repository
   commit conventions.
6. Mark the task complete and update the durable checkpoint in the same turn.

Apply [continuation](../../references/continuation.md) after every worker handoff:
review the evidence and advance the next authorized task without a user
acknowledgement. A worker finishing is an internal transition, not completion of
the coordinator's task.

Do not batch past a failed verification. Diagnose the failure, repair it, and rerun the affected check. Escalate repeated failures with new evidence through the model-routing guide rather than repeating the same attempt.

## 3. Review checkpoints

At natural boundaries, compare completed work with the plan and spec:

- Required behavior exists and unrequested behavior did not appear.
- Interfaces produced by earlier tasks match later consumers.
- Tests assert observable behavior and preserve relevant error paths.
- Workspace, permission, persistence, security, and compatibility constraints still hold.
- The working tree contains only intended changes.

Use `astra-workflow:requesting-code-review` for substantial or risky changes. The reviewer is read-only; the coordinator applies accepted feedback using `astra-workflow:receiving-code-review`. Material review findings that invalidate the design return to Astra for replanning.

## 4. Complete the plan

Run the plan's focused checks and the repository's appropriate integrated gate on the current contents. Record exact commands, results, and the revision they cover. Do not claim success from stale output.

If an explicit local-only, no-push, or no-PR instruction applies, stop at that
boundary after reporting the verified result and preserved workspace. Otherwise,
approved implementation includes coordinator commit, push, and PR delivery: invoke
`astra-workflow:astra-complete` and continue through CI repair without another
permission prompt. The PR is ready for hands-on testing only when expected CI
checks pass for its current head SHA. Merge still requires the user's post-test
report and explicit approval for that same revision.

## Common mistakes

| Mistake | Correction |
| --- | --- |
| Execute a plan-only request | Stop with the plan. |
| Ask for separate PR approval after implementation was approved | Continue to a green PR unless an explicit local/no-push/no-PR override applies. |
| Follow a stale plan literally | Reconcile with the checkout; send material replanning to Astra. |
| Ask the user about every reversible detail | Make a ruling, record it, and continue. |
| Treat coupled or one-file work as inline | Give its complete RED/GREEN cycle to one worker. |
| Continue after a failed acceptance check | Diagnose and restore green before the next task. |
| Let a worker stage or commit | The main coordinator owns Git mutation and CI. |
| Hand off while current-SHA CI is pending | Continue through `astra-complete` until green or concretely blocked. |
