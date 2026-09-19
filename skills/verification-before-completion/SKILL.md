---
name: verification-before-completion
description: Use before claiming work is complete, fixed, passing, ready for review, or ready for testing, and before committing, publishing a PR, or handing work back.
---

# Verification before completion

Evidence must match the exact claim, contents, environment, and revision. Confidence,
review, and earlier green output are not substitutes.

## The claim gate

Before a positive status claim:

1. **Identify** the observable claim and the command or external state that proves it.
2. **Run** the complete check after the last relevant change.
3. **Read** the output, exit code, failure count, skipped checks, and warnings.
4. **Match** the evidence to the claim and current workspace or revision.
5. **Report** the result precisely, including gaps. Only then say it passes.

If a check cannot run, say it was not run and why. Never replace missing evidence
with "should," "looks right," or an invented success statement.

## Evidence by claim

| Claim | Required evidence | Insufficient evidence |
| --- | --- | --- |
| Bug fixed | Original reproduction or regression check now passes | Code inspection alone |
| Regression protected | Intended red failure followed by green, or honest retrospective test evidence | A new test that only passed |
| Tests pass | Named complete test command exits successfully with zero relevant failures | A focused subset or old run |
| Build succeeds | Build command exits successfully | Typecheck or lint alone |
| Requirements met | Acceptance criteria checked against behavior and diff | Tests alone |
| Worker finished correctly | Inspect diff/artifacts and run the relevant check | Worker summary |
| PR ready for testing | Current head SHA has expected passing CI and no relevant pending/failing checks | Local green or an older SHA |

Use the narrowest check during iteration. Before handoff, run the repository's
appropriate complete gate when scope and risk warrant it. Do not rerun unchanged
checks merely for ceremony; rerun whenever relevant contents, dependencies,
configuration, environment, base revision, or merge candidate changed.

## Authorized PR delivery

Read [delivery authority and CI completion](../../references/ci-completion.md).
Once the user requests implementation—including an ordinary "fix this," "add
this," "build this," or "change this"—or approves a concrete implementation plan,
invoke `$waypoint-complete` after local verification. That standing authorization
covers normal commit, push, PR creation/update, CI diagnosis, and in-scope repair;
do not ask for the same permission again. Design approval, a request for hands-on
testing by itself, and automatic skill discovery do not imply implementation or
publication authority.

Handoff only after the expected checks for the PR's current head SHA are passing
and no relevant check is pending or failed. Confirm the PR URL, head SHA, base,
state, and check results from the host. An empty check list does not prove green CI.
Skipped or neutral checks require evidence that they are legitimately inapplicable.

Honor an explicit plan-only, local-only, no-push, or no-PR boundary, including one
set earlier in the task. Merge and deployment remain separate. Merge stays governed
by `$waypoint-complete`, including hands-on testing and explicit approval of the exact
revision.

## Safe verification

- Use fake drivers, temporary repositories/databases, and test credentials.
- Do not start paid API traffic or consume live subscription capacity as routine
  verification. A real-service smoke test requires explicit opt-in.
- Do not use operator data or active worktrees as fixtures.
- Do not disable tests, loosen assertions, or bypass branch protection to get green.
- Do not expose secrets in commands, logs, screenshots, or reports.

## Handoff evidence

State:

- exact commands and summarized results;
- the revision or workspace contents they cover;
- acceptance criteria exercised;
- CI links and current head SHA when PR delivery was authorized;
- anything not verified and the reason.

Do not claim a platform, browser, integration, or manual flow was checked when the
evidence covers only a different layer.

## Stop signs

- Satisfaction language before running the check.
- Treating a successful lint as proof of build or runtime behavior.
- Extrapolating from one package to the whole repository.
- Trusting a stale run after an edit or rebase.
- Trusting a worker's "done" without inspecting the result.
- Calling CI green while checks are missing, queued, cancelled, or tied to another SHA.
- Declaring a regression test meaningful without observed red evidence.
