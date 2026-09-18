---
name: systematic-debugging
description: Use when diagnosing a bug, failing test, flaky behavior, performance regression, build failure, or unexplained system behavior before proposing or implementing a fix.
---

# Systematic Debugging

Find the cause before changing behavior. A plausible patch is not evidence.

If the user asked only for diagnosis, stop after the evidence-backed diagnosis and
recommended next step. Do not turn investigation into an implementation request.

## 1. Establish the failure

1. Read the complete error, stack, exit code, and surrounding warnings.
2. State expected and observed behavior precisely.
3. Reproduce with the narrowest safe command. Record whether it is deterministic.
4. Inspect recent relevant changes, callers, configuration, and environment.
5. Protect real work: use temporary data, fake drivers, and isolated repositories.
   Never spend paid API or live subscription capacity merely to reproduce a bug.

If reproduction is intermittent, collect more observations. Do not convert
uncertainty into a confident cause.

## 2. Locate the failing boundary

For a multi-component path, capture the value and state at each boundary:

```text
input -> caller -> component -> dependency -> persisted/output state
```

Log safe identifiers, shapes, state transitions, and errors. Never print secrets.
Run once, find the first boundary where expected and observed state diverge, then
investigate that component. For a deep stack or corrupted value, read
[root-cause tracing](references/root-cause-tracing.md).

Compare the broken path with a nearby working example. Read the reference pattern
and its callers completely enough to identify every relevant difference. Check
assumptions about initialization, ownership, ordering, permissions, paths, and
cleanup.

## 3. Test one hypothesis

Write one falsifiable statement:

> I think **X** is the root cause because **Y evidence**; if so, **Z observation**
> should change when I vary one thing.

Run the smallest experiment that can disprove it. Change one variable. A failed
hypothesis adds evidence; it is not permission to stack speculative fixes.

After three unsuccessful fix attempts, stop editing. Recheck the reproduction,
assumptions, and component boundary. If each attempt exposes new coupling or
requires broader redesign, return the architectural decision to Astra through
`$astra-plan` rather than attempting a fourth patch.

## 4. Fix the responsible layer

For a behavior change or bug fix, use `$test-driven-development`: observe the
focused regression test fail for the intended reason, implement the smallest
root-cause fix, then observe it pass. Do not claim retrospective TDD for code that
was already written.

Add validation only at boundaries with a distinct job: reject untrusted input,
protect an invariant, prevent a dangerous side effect, or preserve diagnostic
context. Read [defense in depth](references/defense-in-depth.md) when invalid data
can cross several trust boundaries.

For async failures and flaky tests, read
[condition-based waiting](references/condition-based-waiting.md). For tests that
leave files or directories behind, run the portable
[`find_test_polluter.py`](scripts/find_test_polluter.py) helper.

```bash
python scripts/find_test_polluter.py ".git" "src/**/*.test.ts" -- npm test "{test}"
```

Start from a clean state. The helper runs matching files in sorted order and stops
at the first one that creates the unwanted path.

Finish with `$verification-before-completion`. Verify the original symptom and the
appropriate surrounding suite after the last change. Report the evidence and any
remaining uncertainty.

## Delegation

When authorized delegation would materially reduce cost or wall time, read
[model routing](../../references/model-routing.md) and give a worker one bounded
investigation or reproduction task. The coordinator owns the hypothesis, inspects
raw evidence, and never treats a worker's success statement as proof.

## Stop signs

- Proposing a fix before reproducing or locating the failure.
- Changing several variables in one experiment.
- Adding sleeps until a test happens to pass.
- Treating a retry, catch, fallback, or null guard as the cause.
- Trusting an earlier run, a worker summary, or intuition over current output.
- Repeating the same experiment without new evidence.

When the cause is external, timing-sensitive, or environmental after real
investigation, state what was ruled out and implement only evidence-supported
handling such as a bounded retry, timeout, clearer error, or targeted telemetry.
