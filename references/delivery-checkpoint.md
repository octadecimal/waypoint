# Delivery checkpoint

Keep one short Markdown checkpoint at
`<git-common-dir>/waypoint/<task-id>.md` for work spanning turns or tasks.
Reuse the existing checkpoint; link an execution ledger rather than copying it.
This is local continuity evidence, not a committed deliverable or new approval.
Omit secrets, credentials, and authentication query strings.

Update it after a material transition: accepted plan, worker handoff, PR creation,
CI repair/push, stack startup/refresh, blocker, or user testing handoff. Preserve
the source of authorization and distinguish observed facts from pending work.
Use the relevant fields below; mark runtime fields inapplicable for docs, libraries,
or explicit no-run work rather than inventing a stack.

```markdown
# <task>
Workflow provenance: <guidance version, skill path/source, evidence captured when read;
                      loaded version unknown if unavailable; installed version separately>
Scope / acceptance: <outcome and remaining conditions>
Request coverage: <original requested outcomes, later explicit exclusions,
                   verification evidence and any remaining omissions>
Mode / authority: <user instruction, delivery target, local-only/no-run limits>
Pending decision: <none, or exact question, artifact/revision, options,
                   existing authority, and action each answer unlocks>
Resolved decision: <answer and user-message source, revision, next authorized action>
Workspace: <repository, worktree, branch, base>
Workers / ledger: <task, agent, actual model/effort, status, evidence pointer>
Revision: <local HEAD, dirty changes if any, PR URL and observed head>
Verification: <checks, results, revision/content tested, evidence links>
CI: <expected checks, current statuses and run links, last observation>
Runtime: <applicable | not applicable with reason | blocked>
  URL / services: <safe complete URL, required backend addresses>
  Ownership: <launcher/session identity; per-process PID, start time,
              executable/command and worktree evidence; task-owned or unknown>
  Data: <fake/local fixture or approved source, exact data path, ownership>
  Served revision: <revision/build identity and how observed; dirty state>
  Health: <UI/backend results and observation time>
  Lifetime / cleanup: <how it survives handoff; what this task owns and may stop>
User testing: <2-4 actions and expected results; tested/approved revision if any>
Next action / blocker: <concrete next step and unresolved evidence>
Unnecessary stops observed: <not assessed, none observed, or stalled action, prior authority,
                            user nudge/evidence, cause if known, resumed outcome>
```

Record only the command information needed to establish ownership; redact secret
arguments. If ownership, data source, lifetime, or served revision is unproven,
write `unknown` with the next verification step. A checkout's HEAD alone does not
prove an already-running process or built asset serves it. Use repository-supported
build/version evidence, or a witnessed build/start from that worktree and content
revision plus an application health check. Record which evidence was available.

## Identify the guidance in use

When first reading workflow guidance, record the version and source tied to that
actual skill path or host-provided loaded-skill metadata. For a versioned plugin
cache path, use its package manifest as corroboration. For a development checkout,
record the source path and revision/dirty state; its manifest alone does not prove
the installed plugin was loaded. If loaded-version evidence is unavailable, record
`unknown` rather than copying the newest installed version.

An install result or fresh discovery request proves what is available for a new
thread, not what an existing thread already loaded. Preserve the original entry
across reinstalls and resume. If guidance is explicitly reread from a new version,
record that source and which guidance changed without claiming the whole thread
reloaded. Note mismatches when investigating a regression; use a new thread to
validate a new installation. Missing provenance alone does not block authorized
work or require a new approval.

## Resume from evidence

1. Reconcile current user instructions, Git/worktree changes, live agents, PR head,
   and current CI status without waiting for CI to finish. Old passes and merge
   approval apply only to the revision they covered; the checkpoint cannot grant
   new authority.
   Resolve any new reply against the recorded pending question using
   [continuation](continuation.md); clear a resolved decision and act on it rather
   than replaying the approval request. Clarify ambiguity without blocking
   independent authorized work.
2. Inspect the live runtime before reuse or mutation. Compare process start time,
   executable/command, and worktree evidence as well as PID: a PID or occupied port
   alone is not ownership. If evidence conflicts, preserve that process and resolve
   ownership or start a separate task-owned instance on a discovered free port.
3. Verify the data source remains appropriate and inspect every required service.
   After code, build, configuration, or data-source changes, refresh only owned
   processes as needed and verify the served revision and health again. Never
   attach tests to unknown/operator data because an old checkpoint called it fake.
   Prepare or repair the authorized fake-data stack while current-head CI is still
   pending; resuming does not make CI completion a prerequisite for local startup.
   A queued check is ongoing work, not itself an external blocker.
4. Update the checkpoint with the reconciled evidence and next action. Resume the
   authorized work without repeating approvals. Hand off only when current-head CI
   (or the local-only verification gate) and the applicable runtime are ready.

A missing checkpoint is recoverable from live evidence. An incomplete checkpoint
is not permission to delete a worktree, kill an unknown process, spend provider
quota, or call the work ready.
