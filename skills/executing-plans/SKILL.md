---
name: executing-plans
description: Use when a written implementation plan should be executed in the current session without a worker-per-task workflow.
---

# Executing Plans

Load the plan, check it against current repository reality, execute every authorized task, verify the integrated result, and hand delivery to `astra-workflow:astra-complete` when the plan includes a PR.

Use `astra-workflow:subagent-driven-development` instead when independent tasks justify fresh workers and task-scoped review. Use this skill for tightly coupled tasks, limited collaboration capacity, or a plan that calls for direct coordinator execution.

## Preserve the task mode

The user's latest direction controls execution:

| Mode | Behavior |
| --- | --- |
| Plan-only | Do not execute. Return to `astra-workflow:astra-plan`. |
| Collaborative execution | Execute after the concrete plan has been approved. Do not seek approval again for actions already included in that approval. |
| Auto / proceed autonomously / green PR | Continue through the authorized delivery target without routine re-prompts. |

Existing decisions and authorization override generic workflow prompts. Do not turn a plan-only request into implementation, and do not treat implementation approval as merge approval.

## 1. Load and review the plan

1. Use `astra-workflow:using-git-worktrees` to create or verify the isolated workspace. Never implement on the repository's primary branch unless the user explicitly authorized that exception.
2. Read the plan, its referenced spec, repository instructions, affected code, callers, tests, and relevant CI definitions.
3. Compare paths, symbols, commands, assumptions, and dependencies with the current checkout.
4. Create task tracking from the plan and mark already completed work only when Git state and verification evidence prove it.
5. Record a short durable checkpoint when work spans tasks or turns. Use the repository's established checkpoint location; otherwise use `<git-common-dir>/astra-workflow/<safe-task-id>.md`. Include plan path, mode, authorization source, branch/worktree, current task, verification revision, and pending work. Do not store secrets or commit the checkpoint.

Fix stale paths, harmless typos, and reversible implementation details directly. Material changes to architecture, scope, acceptance criteria, or task decomposition require Astra planning. Read [model routing](../../references/model-routing.md); if the current model is not Astra, dispatch or reuse one read-only Astra planner with the plan, spec, evidence, and authorization boundary. In auto mode, apply its justified replan without asking again unless the new scope exceeds the user's authorization. In collaborative mode, return a materially expanded scope to the user.

Stop only when every safe path depends on missing information, a destructive or irreversible action lacks authority, a security-sensitive decision is unresolved, or required external access is unavailable. A routine plan defect is a replan, not an automatic user interruption.

## 2. Execute each task

For each task:

1. Mark it in progress and identify the task's acceptance check.
2. For behavior changes, write or select the focused test, run it, and observe the expected failure before implementation. Existing failing regression tests may supply the red step. For behavior-preserving work, establish passing coverage before editing. Prose and metadata use relevant validation instead of manufactured behavioral tests.
3. Implement the smallest change that satisfies the task. Reuse repository patterns and avoid unrelated refactors.
4. Run the focused check and inspect the output. Keep red and green commands/results in the checkpoint or task report.
5. Inspect the task diff against the plan. Resolve concrete defects before moving on.
6. Let the main coordinator alone stage and create any authorized checkpoint commit. Use explicit paths, inspect the staged diff, and follow repository commit conventions.
7. Mark the task complete and update the durable checkpoint in the same turn.

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

If the authorized target is local changes, stop after reporting the verified result and preserved workspace. If it includes a commit, the coordinator stages explicit intended paths, inspects the staged diff, commits, and verifies the recorded revision.

If it includes a PR, invoke `astra-workflow:astra-complete`. Continue through publication and CI repair without another routine permission prompt when the approved plan or auto request already authorized those actions. The PR is ready for hands-on testing only when expected CI checks pass for its current head SHA. Merge still requires the user's post-test report and explicit approval for that same revision.

## Common mistakes

| Mistake | Correction |
| --- | --- |
| Execute a plan-only request | Stop with the plan. |
| Re-ask after auto mode authorized a green PR | Continue within the stated scope. |
| Follow a stale plan literally | Reconcile with the checkout; send material replanning to Astra. |
| Ask the user about every reversible detail | Make a ruling, record it, and continue. |
| Continue after a failed acceptance check | Diagnose and restore green before the next task. |
| Let a worker stage or commit | The main coordinator owns Git mutation and CI. |
| Hand off while current-SHA CI is pending | Continue through `astra-complete` until green or concretely blocked. |
