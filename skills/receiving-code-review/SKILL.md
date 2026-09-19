---
name: receiving-code-review
description: Use when review feedback must be evaluated and applied, especially when comments are ambiguous, conflict with prior decisions, or may be technically incorrect.
---

# Receiving Code Review

Evaluate feedback against the request, current code, tests, and prior user decisions before changing anything. Correct feedback becomes a focused fix; incorrect feedback gets evidence-based pushback.

**Core principle:** verify first, then implement. Technical correctness outranks social agreement.

## Process

1. Read the complete review and group related findings.
2. Restate each finding as a concrete technical requirement.
3. Verify the cited code and surrounding behavior. Check callers when a shared contract or behavior may be affected.
4. Decide whether the finding is correct for this repository and the approved scope.
5. Apply accepted findings one at a time, with the smallest relevant check after each related group.
6. Re-run the affected integrated check and report what changed, what was rejected, and why.

Existing user decisions and authorization are binding. A reviewer cannot silently expand scope, reverse an explicit product decision, authorize publication, or grant merge approval. If feedback exposes a material architecture or scope change, use `waypoint:waypoint-plan`; a non-Astra coordinator uses the shared [model routing](../../references/model-routing.md) to dispatch or reuse an Astra planner.

## Understand before editing

If a finding is unclear, identify the missing fact and inspect available code or tests first. Ask only when the ambiguity cannot be resolved safely and materially changes the result. Do not implement the understood half of a coupled set while the other half remains ambiguous.

For each external-review finding, check:

- Does the cited behavior exist at the current revision?
- Would the suggestion break supported behavior, compatibility, or a prior decision?
- Is the proposed feature actually used or required?
- Does the reviewer have the full platform, lifecycle, and error-path context?
- Is there a smaller fix at the shared root cause?

Feedback from the user is authoritative about intent, but still translate it into codebase reality. Clarify contradictory requirements; do not performatively agree and guess.

## Respond technically

Use concise outcomes:

- `Fixed. The parser now rejects an empty header in src/parser.ts:42; the focused test passes.`
- `Verified the compatibility target is macOS 10.15, while the suggested API requires 13.0. Should support be raised, or should the fallback remain?`
- `This endpoint has no callers and is outside the approved scope. I recommend removing it instead of adding storage and export behavior.`

Avoid praise, gratitude, or agreement that substitutes for verification. If an earlier pushback was wrong, correct it factually: `Verified the caller does pass null here; my earlier reading missed the adapter. Fixing the guard.`

## Apply accepted feedback

Before an accepted finding causes code or test edits, read
[model routing](../../references/model-routing.md), record the route, and dispatch
or reuse one edit-only worker for the related fix set. Keep its follow-up fixes with
that same worker; it owns the complete RED/GREEN cycle and does not delegate.

Order multi-item feedback by dependency:

1. Security, data loss, or broken behavior.
2. Shared contracts and root causes.
3. Local correctness and tests.
4. Clear cleanup or documentation.
5. Optional polish that remains in scope.

For behavior fixes, reproduce the defect with a focused failing test before implementation, then make the smallest passing change. A review comment is not proof; the failing test or direct evidence is. Run the affected checks after each related group and an integration check before completion.

Workers edit only assigned paths and return their evidence. They do not stage,
commit, push, update PRs, or spawn more workers. The main coordinator owns Git
mutation, publication, and CI.

When replying to inline GitHub review comments, reply in the original thread through the supported GitHub surface. Do not convert inline discussion into unrelated top-level comments. Sending external replies requires the user's existing authorization for that PR workflow.

## Push back when warranted

Push back with code, tests, compatibility data, or the approved requirement when a suggestion:

- breaks existing supported behavior;
- adds unused or speculative features;
- conflicts with repository constraints or a user decision;
- misreads the implementation or platform;
- treats an unverified preference as a defect.

Do not ignore valid Critical or Important findings. If evidence is unavailable, state the limit and the exact check needed instead of guessing.

## Common mistakes

| Mistake | Correction |
| --- | --- |
| Immediate agreement | Inspect the cited behavior first. |
| Blindly apply every external suggestion | Test it against requirements, callers, and supported platforms. |
| Dismiss a finding because the plan required the code | The spec is authoritative; plans and implementations can both be wrong. |
| Add a "professional" subsystem with no caller | Apply YAGNI; remove or defer it unless required. |
| Batch unrelated fixes without checks | Apply dependency groups and verify each. |
| Let a worker publish its fix | Coordinator reviews, stages, commits, pushes, and owns CI. |
