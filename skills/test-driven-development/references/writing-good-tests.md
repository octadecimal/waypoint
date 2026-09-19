# Writing good tests

A useful test catches a specific production break through observable behavior.

## Name the break

Before writing the body, answer:

> Which production mutation should make this test fail, and would that mutation be
> a bug rather than an intentional redesign?

Good targets include a wrong branch, omitted side effect, invalid transition,
boundary error, missing authorization, malformed output, or lost persistence.
Exact prose, constant values, private method calls, and implementation shape are
usually decisions rather than behavior.

Derive expectations by hand. Prefer literal expected values or a hand-checked
fixture. Never use the implementation or its helper to compute both actual and
expected results.

```ts
// Bad: the same logic builds both sides.
expect(buildQuery(input)).toBe(buildQuery(input));

// Good: independently derived contract.
expect(buildQuery({ tag: "urgent" })).toBe('tag:"urgent"');
```

## Exercise the real thing

Test the component boundary the product owns. Do not retest framework mechanics.
Mock only the slow, external, nondeterministic, or destructive boundary below the
behavior under test.

Before mocking a method, list its side effects. Keep every side effect the test
depends on real. A mock response must match the real documented shape, including
fields downstream code can read. If mock setup is larger than the behavior being
tested, prefer a small integration test with real local components.

Do not assert that a mock exists or was rendered as the user-visible outcome.
Arguments, count, and order are valid assertions only when they are part of the
component's contract.

## Keep test support in tests

Cleanup and reset methods used only by tests belong in test utilities. Production
objects should own lifecycle methods only when production callers need that
lifecycle.

Use temporary directories, fake drivers, and disposable databases. Tests must not
touch operator credentials, active worktrees, runtime databases, live services, or
paid API/session capacity.

## Mutation check

Before finishing, mentally apply realistic mutations:

- wrong branch or argument;
- missing state transition or side effect;
- empty/default return;
- omitted validation for empty, zero, malformed, or unauthorized input;
- reordered event or duplicate persistence.

At least one test should fail for each mutation that would violate the changed
contract. If none would fail, strengthen the behavioral assertion or acknowledge
that the behavior remains unprotected.

## Quick review

| Check | Expected |
| --- | --- |
| Test name | States one observable behavior. |
| Red run | Fails for the missing behavior, not setup. |
| Expected value | Literal or independently derived. |
| Doubles | Only at earned boundaries; complete realistic shape. |
| Cleanup | Test utility unless production owns the lifecycle. |
| Scope | Smallest layer that can prove the contract. |
| Maintenance | Catches a bug, not a deliberate text or structure change. |
