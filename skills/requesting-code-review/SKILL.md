---
name: requesting-code-review
description: Use when completed work needs independent review against its requirements before integration, PR handoff, or merge.
---

# Requesting Code Review

Dispatch a read-only reviewer with a precise requirements package and a fixed diff range. Keep review evidence out of the coordinator's context when a file can carry it.

**Core principle:** review the actual change at a named revision against the actual requirements.

Read [model routing](../../references/model-routing.md) before dispatch. Use a lower-cost reviewer for a small mechanical diff, a stronger coding model for cross-file or subtle behavior, and Astra for consequential architecture, final whole-branch review, or material plan assessment. The live collaboration schema is authoritative.

## When to request review

Review is expected:

- after a task in `waypoint:subagent-driven-development`;
- after a major feature or cross-component change;
- before a branch is handed to `waypoint:waypoint-complete`;
- before merge when new code has appeared since the last relevant review.

A tiny, low-risk change with strong automated proof may be reviewed directly by the coordinator. Avoid ritual reviewers that add no independent judgment.

## Assemble the review package

Record immutable bounds:

```bash
git rev-parse <base>
git rev-parse HEAD
git diff --stat <base>..<head>
git diff -U10 <base>..<head>
```

For uncommitted task work in the subagent workflow, the coordinator stages only the task-owned paths and uses that skill's `review_package.py --staged` helper. Workers never stage their own work.

The reviewer receives:

- what changed and why;
- the authoritative requirements or plan path;
- base and head SHAs, or a staged review-package path;
- relevant global constraints and known deferred findings;
- exact review scope and output contract.

Use [code reviewer prompt](code-reviewer.md). Keep the worker isolated: with `collaboration.spawn_agent`, use `fork_turns: "none"` or a supported numeric history window when choosing a model. A full-history fork inherits the parent model and cannot use a model override.

The reviewer is read-only. It does not edit files, move HEAD, stage, commit, push, update PRs, run CI mutations, or spawn another reviewer. The main coordinator owns every Git mutation and CI decision.

## Handle findings

Use `waypoint:receiving-code-review`:

- Fix Critical findings before proceeding.
- Fix Important findings before integration unless an evidence-backed ruling rejects them.
- Record Minor findings that are deliberately deferred.
- Resolve `cannot verify` items in the coordinator, which holds the broader task context.
- Push back on incorrect findings with code or test evidence.

For a fix round, give a scoped re-reviewer the original findings and only the fix diff. Do not pay for a fresh broad review after every correction. The subagent-development workflow provides its dedicated re-review template.

## Current-revision rule

Review approval applies only to the reviewed content. A later edit, rebase, merge, generated artifact, or dependency change may invalidate it. Before PR handoff, confirm the final review's head still matches the branch. `waypoint:waypoint-complete` separately verifies expected CI on the PR's current head SHA before manual testing.

Review does not authorize a push, PR, merge, or deployment. Carry the user's existing delivery authorization forward, and never treat reviewer approval as post-test merge approval.

## Common mistakes

| Mistake | Correction |
| --- | --- |
| Give the reviewer the whole conversation | Give requirements, constraints, and a fixed diff package. |
| Use `HEAD~1` for a multi-commit task | Record the task base before implementation. |
| Reviewer edits while reviewing | Keep review read-only; coordinator routes fixes. |
| Omit model selection | Follow the routing guide and live schema. |
| Full-history fork with a model override | Use `none` or a numeric fork. |
| Treat an earlier review as approval of later code | Re-review the changed range. |
| Equate review with green CI or merge authority | Verify current-SHA CI; require post-test merge approval. |
