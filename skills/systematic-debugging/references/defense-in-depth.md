# Defense in depth

Use layered validation after tracing invalid data across multiple trust or safety
boundaries. Each layer must prevent a distinct failure; repeated checks with no
separate purpose add noise.

| Boundary | Purpose |
| --- | --- |
| External entry | Reject malformed or unauthorized input. |
| Domain operation | Protect business invariants independent of the caller. |
| Dangerous side effect | Refuse unsafe filesystem, process, billing, or network actions. |
| Diagnostics | Preserve enough safe context to investigate an unexpected bypass. |

Apply it in this order:

1. Trace the bad value from origin to effect.
2. Fix the source that created or admitted it.
3. List boundaries where bypass would cause a different material risk.
4. Add the smallest validation at those boundaries.
5. Test the behavior each layer uniquely owns.

Do not add the same guard everywhere. Validation belongs at a layer only when that
layer owns an invariant or can prevent damage even if an upstream caller changes,
is mocked, or fails.
