# Condition-based waiting

Use this when a test waits for asynchronous work, intermittently times out, or
passes only after increasing a sleep.

Wait for the observable condition the test needs. Keep a timeout so failures end
with a useful error.

```ts
export async function waitFor<T>(
  read: () => T | undefined | null | false,
  description: string,
  timeoutMs = 5_000,
  pollMs = 10,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;

  while (true) {
    const value = read();
    if (value) return value;
    if (Date.now() >= deadline) {
      throw new Error(`Timed out waiting for ${description} after ${timeoutMs}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
}
```

Call `read` inside the loop so each poll sees fresh state. Prefer an existing
framework wait helper or an event/drain promise when one already expresses the
condition.

| Need | Condition |
| --- | --- |
| event | matching event exists |
| state | state equals the terminal value |
| count | observed count reaches the expected minimum |
| file | file exists and, if relevant, has expected contents |
| queue | queue drained and dependent state is visible |

An arbitrary delay is appropriate only when elapsed time is the behavior under
test, such as debounce or lease expiry. First synchronize on the event that starts
the interval, then wait for a duration derived from the configured timing and
explain why that duration is necessary.

Common failures:

- Polling cached state instead of reading again.
- No timeout, producing a hung suite.
- Polling every millisecond and wasting CPU.
- Using truthiness when `0`, `false`, or an empty collection is a valid result.
- Waiting for an internal detail when a public state transition is observable.
