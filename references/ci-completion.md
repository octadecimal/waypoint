# CI evidence and repair

CI passing is part of delivery, not an optional follow-up. Use GitHub's actual
results, not a worker's prediction or an earlier commit's green badge. Commands
below illustrate GitHub CLI use; inspect available fields/help when versions
differ. Other hosts require their equivalent authoritative checks.

## Delivery authority

Once the user requests implementation—including natural requests such as "fix,"
"add," "build," or "change"—or approves a concrete implementation plan, the
standing delivery target is a green PR: the coordinator commits the intended
changes, pushes, opens or updates the PR, and owns the repair-and-wait loop until
expected checks pass for its current head. A normal "yes" or "go ahead" in response
to that plan supplies this implementation approval; do not ask separately whether
to implement locally, push, or open the PR.

Plan-only, brainstorm-only, local-only, no-push, and no-PR instructions override
that default. Preserve an earlier explicit override unless the user later changes
it. Approval of a design direction, mockup, or preview alone chooses the design; it
does not authorize production implementation. Automatic skill discovery is also
not implementation authority, and authority for one task or repository does not
extend to another.

Merge and deployment remain separate. Merge requires hands-on testing and explicit
approval of the exact revision. Missing remote access, credentials, or usable CI is
a concrete blocker to green-PR delivery, not a successful local handoff.

## Observe the current revision

1. Read the PR head SHA, base, state, draft state, mergeability, and check rollup:
   `gh pr view <number> --json url,state,isDraft,headRefOid,headRefName,baseRefName,mergeable,statusCheckRollup`.
   After pushing, require the coordinator's intended local `git rev-parse HEAD` to
   equal `headRefOid`. If they differ, reconcile branch ownership and push the
   intended revision before treating any PR or CI result as delivery evidence.
2. Determine expected checks from checked-in workflows and applicable repository
   rules. Check required checks when the host exposes them:
   `gh pr checks <number> --required`. Also inspect the full check list; required
   checks alone can miss relevant failing verification.
3. Inspect run details and failed logs with `gh run view <run-id>` and
   `gh run view <run-id> --log-failed`. Confirm the run belongs to the current PR
   revision. Account for PR merge refs and merge-queue checks; do not compare a
   merge-ref SHA naively to the source head SHA.
4. Wait on supported check notifications or bounded watches, while giving progress
   updates. Re-read the PR head after completion. A new push, base update, or changed
   merge candidate invalidates prior applicable evidence.

Queued, in-progress, cancelled, timed-out, missing, and failed checks are not passes.
A skipped or neutral required check requires investigation. An optional conditional
check may be legitimately inapplicable; verify and state why. An empty check list
does not prove green CI. If the repository has no CI, state that explicitly and
resolve the requested CI requirement rather than inventing success. If permissions
hide rules or checks, disclose the evidence limit and resolve it before claiming
all required checks passed.

## Repair with evidence

- Product or test failure: inspect logs, reproduce with the narrowest meaningful
  check, fix the responsible behavior, rerun affected validation, and push.
- Platform difference: investigate that platform's path, shell, dependency, or
  environment behavior. Local Linux success does not prove a Windows fix.
- Suspected infrastructure failure: establish evidence before a bounded rerun.
  Repeated flakiness calls for diagnosis, not rerunning until luck produces green.
- Unrelated failure: determine whether a small repair is within the agreed scope.
  Do not silently expand the task or waive the failing check.
- Behind/conflicting base: follow repository policy, integrate safely, then rerun
  applicable verification and obtain new CI results. Never force-push or overwrite
  another contributor's work without explicit authority.

The coordinator may delegate a bounded diagnosis/fix using the routing guide, but
retains publication and CI ownership. A repeated failed approach with no new
evidence triggers replanning or model escalation. When no authorized action can
make progress, report the PR, revision, failing/pending job links, diagnosis,
attempts, and the smallest intervention needed. Do not wait indefinitely on an
external outage or ask the user to choose a CI bypass.

## Completion evidence

At handoff, record the current head SHA, relevant passing run/check URLs, legitimate
inapplicable checks, and local verification. Required reviews or merge-queue checks
that become available only during merge remain explicit merge gates; they are not
falsely reported as already satisfied. If the PR is a draft and authorized work is
ready, mark it ready unless the user requested it remain a draft. Reconfirm live
state before merging after hands-on testing and explicit approval.

## Runnable testing preparation

After opening or updating the PR, automatically start the repository's documented
local test or development stack from the feature worktree while CI runs when the
change has a runnable UI or service and the user has not said not to run it. Prepare
the user-facing test checklist at the same time: usually two to four brief actions
with expected results, without terminal or setup commands the agent can perform.
For local-only, no-push, or no-PR work, do this after the applicable local
verification; those limits block publication, not local hands-on testing. Starting
a local test stack is not deployment and grants no production mutation authority.

Use the repository's commands and discovered configuration, including dynamically
selected ports. Do not invent a generic launcher or assume a project, command, or
port. Before reusing a running stack, prove it belongs to the intended worktree and
revision and has the required UI and backend; preserve unknown processes. Start new
processes with a lifetime that survives the handoff, verify they remain alive, and
state their actual lifetime rather than promising persistence the tool cannot
provide. If a CI repair changes the revision, rebuild or restart the task-owned
stack as needed and prove it now serves that revision.

For PR delivery, final handoff requires green current-head CI and, when applicable,
a healthy stack serving that same revision. Local-only delivery uses its applicable
local verification instead of CI. Verify the complete URL and every required local backend with
appropriate HTTP, health, or browser checks before calling the branch ready. Give
the clickable URL and prepared checklist. Use safe local/fake data and credentials;
never exercise live billed providers or operator data merely as test evidence.

When the runnable surface includes a browser UI and the Chrome DevTools MCP is
available, use it for the applicable browser health check. Inspect only the page,
console, network, DOM or accessibility state, and screenshot evidence needed for
the changed behavior; capture a performance trace only when performance is in
scope. Use an isolated task-owned browser and fake or local application data, with
one browser owner. Preserve normal profiles and live sessions, and never bypass
authentication or another security boundary. If the MCP is unavailable, use an
existing repository-supported check and disclose the missing browser evidence.
Headless browser health does not mean a visible preview was opened for the user.

If startup or reachability fails, diagnose and repair bounded task-owned failures,
rerun affected verification and current-head CI when code changes, then retry. A
concrete environmental or authorization blocker is a blocked handoff, not a ready
handoff with commands for the user to run. Honor explicit no-run instructions. For
docs, metadata, libraries, and other changes with no applicable runnable surface,
give a focused walkthrough and do not invent a URL.
