---
name: dispatching-parallel-agents
description: Use when two or more tasks can be completed independently without shared files, mutable state, or sequential dependencies.
---

# Dispatching Parallel Agents

Delegate one bounded problem domain to each worker and run independent work concurrently. Workers share the filesystem, so parallelism is safe only when ownership and external side effects do not overlap.

**Core principle:** parallelize independent work, keep integration under one coordinator.

Read [model routing](../../references/model-routing.md) before choosing workers. Use the least expensive available model that can reliably complete each task. The live collaboration tool schema and available-model list are authoritative.

## Decide whether work is independent

Use parallel workers when all of these are true:

- There are at least two concrete tasks.
- Each task can be understood from a focused brief.
- Each task owns distinct files or is read-only.
- One task does not consume another task's unfinished output.
- The tasks do not contend for the same database, process, port, browser state, test fixture, or external resource.

Keep work sequential when failures may share a root cause, tasks touch the same
files, a later task depends on an earlier interface, or broad investigation must
first identify the boundaries. Sequential tasks still use workers under the shared
routing guide; wait for or reuse a worker rather than moving routine edits inline.

## Build the task graph

Group work by problem domain, then record each task's dependencies and owned paths. Tasks with no edge between them may run together. If ownership is uncertain, resolve it before dispatch.

Example:

| Task | Owns | Depends on | Parallel? |
| --- | --- | --- | --- |
| Fix approval-flow tests | `src/approval/**`, focused tests | none | yes |
| Repair abort handling | `src/abort/**`, focused tests | none | yes |
| Update shared event contract | `packages/contracts/**` | both consumers | no; run first or last with integration |

## Write focused briefs

Each worker brief contains:

1. One outcome and why it matters.
2. Exact scope and owned paths.
3. Relevant errors, requirements, interfaces, and evidence.
4. Explicit exclusions and dependencies.
5. The smallest verification that proves the result.
6. A report contract: changed paths, commands/results, findings, and unresolved risks.

Workers edit only their assigned files. They do not stage, commit, push, open or
update PRs, run CI mutations, or spawn more workers. The main coordinator owns all
Git mutation, integration, publication, and CI decisions.

Do not pass the entire conversation by default. With `collaboration.spawn_agent`, use `fork_turns: "none"` for a self-contained brief or a supported numeric string for limited recent context. A full-history fork (`"all"`) inherits the parent model and cannot take a model override. Never invent unsupported fork values.

## Dispatch concurrently

Issue independent `spawn_agent` calls together when the harness supports concurrent calls. Respect the live slot limit and reserve coordinator capacity. Use explicit model and reasoning settings only when the tool schema supports them.

Good brief:

```text
Diagnose and fix the three failures in src/abort/agent-tool-abort.test.ts.

Own only src/abort/** and its focused tests. Another worker owns approval flow.
Determine whether the failures come from timing or production behavior. Replace
arbitrary sleeps with observable event waits when timing is the cause. Do not
change shared contracts.

Run the focused test file. Return changed paths, the root cause, commands and
results, and any remaining risk. Do not stage, commit, push, or spawn workers.
```

## Coordinate without duplicating work

While workers run, prepare integration checks, inspect shared contracts, or work on a separate coordinator-owned task. Do not investigate the same issue in parallel.

Use the collaboration status surface to reconcile live workers. Wait in bounded intervals when idle, then follow up only when a worker needs context or has failed to report. If a worker fails:

- Missing context: send the missing evidence or a corrected brief.
- Task is larger than expected: split it along real boundaries.
- Reasoning is insufficient: retry with a stronger supported model or effort.
- Tasks were not independent: stop the conflicting worker and serialize the work.

Do not repeat an unchanged dispatch after a failure.

## Review and integrate

When workers return:

1. Read every report and inspect every changed path.
2. Check ownership violations and overlapping edits before staging anything.
3. Resolve conflicts in the coordinator; do not let workers race on shared files.
4. Run focused checks, then the integration check that covers the combined result.
5. Use `waypoint:requesting-code-review` when the combined change warrants independent review.
6. Let the coordinator alone stage, commit, push, update the PR, and observe CI.

Parallel completion is not integrated completion. A green focused test from each worker does not prove the combined branch.

## Common mistakes

| Mistake | Correction |
| --- | --- |
| "Fix all failures" | Give one domain, evidence, owned paths, and an output contract. |
| Two workers edit one shared helper | Serialize or assign the helper to one worker, then hand off its interface. |
| Worker commits its own changes | Keep workers edit-only; coordinator reviews and performs Git mutation. |
| Full-history fork plus model override | Use `none` or a numeric fork when selecting a model. |
| Cheapest worker for ambiguous architecture | Use Astra for planning and a model matched to the task through the routing guide. |
| Trust each worker's tests as integration proof | Inspect all diffs and run a combined check. |
