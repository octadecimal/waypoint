---
name: test-driven-development
description: Use when implementing a feature, bug fix, or intentional behavior change before writing the production change, especially when a regression could recur.
---

# Test-driven development

Before RED, a coordinator reads [model routing](../../references/model-routing.md),
records the task/model/effort and reason, and dispatches or reuses the selected
edit-only worker. That worker owns the complete RED/GREEN cycle and performs it
without recursive delegation. The coordinator reviews and integrates its result.

For behavior changes, prove the test can detect the missing behavior before writing
the fix. The useful cycle is evidence, not ceremony:

```text
RED: focused test fails for the intended reason
GREEN: smallest production change makes it pass
REFACTOR: improve structure while relevant tests stay green
```

## Decide whether TDD applies

Use the red-green cycle for features, bug fixes, parsing, branching, state changes,
permissions, money or security paths, and any regression worth preventing.

Use a characterization test that already passes before and after a strictly
behavior-preserving refactor. A failing test is not expected when no behavior is
changing.

Do not manufacture behavioral tests for trivial, reversible prose-only edits,
comments, spelling, or metadata that has no executable contract. Run the relevant
format, link, schema, or packaging validator when one exists. Generated output and
explicit throwaway exploration follow their owning workflow; discard exploratory
code before starting the production change.

When unsure, ask: **what realistic production regression would this test catch?**
If there is no answer, the test does not earn maintenance cost.

## RED: specify one observable behavior

1. Name the regression or missing behavior.
2. Choose the narrowest responsible layer that exposes it.
3. Derive expected values independently from the implementation.
4. Exercise real code; mock only an external or impractically slow boundary.
5. Run the focused test and preserve the command and failure.

The failure must be an assertion caused by the missing behavior. A syntax error,
bad fixture, unavailable dependency, or unrelated failure is not red. If the test
passes immediately, it does not prove the proposed change; revise or remove it.

For a bug, reproduce the reported symptom. For a new feature, test the smallest
user-visible contract. Read [writing good tests](references/writing-good-tests.md)
whenever adding mocks, shared fixtures, cleanup helpers, or a nontrivial regression
test.

## GREEN: make the focused test pass

Implement the smallest coherent change at the responsible layer. Reuse existing
helpers and patterns. Do not add speculative options, unrelated cleanup, or future
extension points.

Run the focused test. If it fails, change the implementation unless the observed
red evidence proved the test expectation wrong. Do not weaken the assertion merely
to obtain green.

## REFACTOR: preserve the evidence

With the focused test green, remove duplication or improve naming only when the
change supports the current work. Rerun the focused test after refactoring, then
run the narrowest relevant surrounding suite.

For async behavior, wait on observable conditions rather than arbitrary sleeps;
see `$systematic-debugging`. For an unexpected failure, stop changing code and use
that skill to find the cause.

## Evidence contract

Record enough to distinguish real TDD from a retrospective claim:

- RED command and the expected failure signal.
- GREEN command and passing result after the implementation.
- Broader relevant verification after the last edit.

Do not break working production code after implementation just to stage a red run.
Do not claim TDD for inherited code when the red step was never observed. State
that a regression test was added and verified instead.

## Common shortcuts that fail

| Shortcut | Why it fails |
| --- | --- |
| Write the implementation, then add a passing test | The test was never shown to detect the absence of the behavior. |
| Assert source text or private structure | Refactors fail while real regressions can pass. |
| Assert mock calls as the outcome | This proves the double was configured, not that the system behaves correctly. |
| Compute expected values with production helpers | The same bug can occur on both sides of the assertion. |
| Add broad tests for a tiny change | Failures become noisy and ownership is unclear. |
| Skip red because the fix is obvious | Obvious fixes still need proof that the regression is captured. |

Before completion, invoke `$verification-before-completion`; red-green evidence
does not replace the repository's build, lint, integration, or PR checks.
