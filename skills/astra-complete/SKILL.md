---
name: astra-complete
description: Finish an existing development branch through verification, review, an open PR, and passing CI before handing it to the user for testing. Also use to resume CI repair or complete an approved post-test merge.
---

# Astra Complete

Own delivery until the PR is ready for human testing, or report a concrete blocker.
Use this independently on existing work or after Astra Plan. Do not repeat planning
unless the work exposes a material scope or design decision. When that happens,
read the routing guide and have Astra own the replan: use the current Astra model
or automatically dispatch/reuse a read-only Astra planner. Preserve the existing
mode and authorization boundary; return material scope changes to the user.
This skill authorizes bounded delegation with model selection; read
[model routing](../../references/model-routing.md) if workers would help.

The coordinator is the only integration owner. Follow project instructions for
worktrees, commits, verification, merge method, and runtime safety. Derive repository
paths and the default/base branch from the actual repository; never assume Mesh,
`main`, `master`, ports, startup commands, or a billing provider.

## 1. Establish scope and authority

Inspect repository root, primary checkout, linked worktrees, current branch, working
tree, remote, intended diff, and any matching PR. Confirm the requested branch and
PR belong together. Preserve unrelated edits; if ownership is unclear, stop that
mutation and resolve it. Never discard changes or force-push to simplify completion.

An explicit request to use Astra Complete to prepare this branch for testing, or an
approved plan that includes green-PR delivery, covers normal verification, intended
commits, push, PR creation, and CI fixes. Automatic skill selection alone does not.
Honor local-only or no-push instructions. If PR authority is missing, finish the
local work first and ask only for the concrete remaining publication action.

Merge requires both a user report of hands-on testing of this PR revision and
explicit approval to merge it. Early implementation approval, green CI, agent
browser tests, and silence are insufficient. Preserve the worktree while waiting.

Respect explicit alternative endpoints. For **local-only**, verify and leave the
intended changes or authorized commits locally; do not create a PR. For **keep as
is**, report branch/worktree, remaining verification, and how to resume, then
preserve everything. For **abandon/discard**, first inspect the exact branch,
worktree, untracked files, and unmerged commits. Describe precisely what would be
lost and obtain explicit authorization covering those items before deletion;
never delete unrelated or ambiguously owned work. A request to stop working alone
does not authorize discarding it. An explicitly requested local integration still
requires hands-on testing and explicit approval of the revision, relevant local
checks, and repository merge rules; never claim absent CI passed. Do not offer a
mandatory menu when the user's chosen endpoint is already clear.

## 2. Verify and prepare the PR

Review the complete intended diff and intended untracked files. Confirm acceptance
criteria and appropriate tests; review substantial risks independently. For fixes
you make here, reproduce the failure before changing behavior, then verify the fix.
Use fresh local verification tied to the current contents. Reuse existing evidence
when the relevant contents and environment have not changed; rerun affected checks
after subsequent edits. Do not claim retrospective TDD for inherited code.

Stage explicit intended paths, inspect the staged diff, and commit using repository
conventions. Push normally. Create or update the matching PR against the verified
base. Its title and body describe the final problem, behavior, validation, and
material limits. Include visual evidence for UI changes when project policy calls
for it. Verify the PR's URL, head, base, and open state after publication.

## 3. Own the CI loop

Read [CI evidence and repair](../../references/ci-completion.md). Discover expected
checks from workflows, repository rules, and project guidance. Observe checks for
the current PR revision, diagnose failures, repair authorized problems, validate,
push, and observe again. Pending CI is ongoing work, not a handoff to the user.

Do not disable tests, loosen assertions, bypass protection, or edit workflows merely
to obtain green status. Legitimate test/workflow fixes need evidence that the
requirement remains covered. External outages, missing credentials, required human
review, or out-of-scope changes can be genuine blockers. Explain the exact blocker
and completed evidence; do not present an unverified PR as ready.

## 4. Handoff for hands-on testing

Once expected checks pass for the current revision and no relevant checks remain
pending or failed, verify the PR is ready for review and report:

- PR URL, head revision, and linked CI results.
- What changed, local verification, and any unverified behavior.
- Exact manual steps and observable success criteria for this change.
- Preserved branch/worktree and, if actually started, runtime URL and health.

When project policy or the user requests a test stack, use the repository's
documented startup procedure from the feature worktree. Inspect process ownership
before stopping anything; never kill by name or port pattern. Do not spend live
subscription quota or affect operator data merely to manufacture test evidence.
For docs or metadata changes, provide a file/behavior walkthrough instead.

Stop at this human testing boundary. Keep progress updates separate from requests
for intervention: ordinary CI failures belong to the agent until fixed or blocked.

## 5. Merge only after post-test approval

Verify that the tested and approved revision is still current. If subsequent code
changes invalidate the user's testing, return to the testing handoff. Recheck CI,
review requirements, mergeability, and base freshness under repository policy.
Merge using the project's method only after these gates are satisfied. Confirm
the remote reports the PR merged before cleanup.

Synchronize the primary checkout only when its state allows a safe fast-forward.
Remove only the task-owned, inspected, clean worktree and branch after verifying
their work was integrated. Never switch an active test stack onto a removed
worktree. Restart from the primary checkout only when required and authorized by
the repository's completion procedure or the user. Report exact leftovers and
failures; a Windows directory lock is not permission for forced deletion.

For interrupted work, update the short checkpoint established by Astra Plan, or
create one under `<git-common-dir>/astra-workflow/<task-id>.md`. Record current PR
revision, verification evidence, blockers, and next action. On resume, reconcile
with live Git/GitHub state and current authorization before acting.
