# Root-cause tracing

Use this when the visible failure is several calls away from the bad input or
state. Trace backward until reaching the earliest incorrect decision.

## Backward trace

1. Pin the exact failing operation and its inputs.
2. Find the caller that supplied each suspicious value.
3. Repeat through the call chain, event producer, serializer, or persistence read.
4. At each step, distinguish the first bad value from code that merely exposes it.
5. Fix the earliest layer that owns the violated invariant.
6. Keep downstream validation only where it protects an independent boundary.

Example:

```text
git init ran in the source tree
  <- cwd resolved from an empty projectDir
  <- workspace creation received ""
  <- session initialization copied an uninitialized fixture value
  <- test read setup state before setup ran        [original trigger]
```

A guard around `git init` prevents damage, but the root-cause fix is to make
premature fixture access impossible or explicit. Both changes can be justified
because they protect different boundaries.

## Instrument when the chain is hidden

Add temporary diagnostics immediately before the dangerous operation. Capture:

- safe input values or shapes;
- current working directory and relevant non-secret configuration;
- state or event identifiers;
- a stack trace or causal event identifier;
- timestamps only when ordering matters.

In tests, emit diagnostics through a channel the runner does not suppress. Remove
temporary noise after the cause is established unless it has lasting operational
value. Never log credentials, tokens, personal data, or full secret-bearing
payloads.

## Event-driven systems

Call stacks often end at a queue or event handler. Continue through durable event
IDs, correlation IDs, enqueue/dequeue records, and state transitions. Identify the
first event whose payload or ordering differs from the contract. A later handler
that rejects the event is the detector, not automatically the cause.
