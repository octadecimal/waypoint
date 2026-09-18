# Model routing in Codex

Use the live tool schema and available-model list as authoritative. A skill cannot
switch the main conversation's model. Do not invent model identifiers, available
tools, reasoning levels, prices, or measured savings. Do not change account billing
or global model settings to make a route work.

## Planning ownership

When available, `gpt-6-astra` with `high` effort is the planning default; use more
effort when the problem warrants it. Astra is the high-capability planner, not the
cheap exploration worker. A non-Astra coordinator automatically creates one Astra
planner and reuses it for user decisions, material replanning, and final review.
Pass the user's actual request, constraints, authorization boundary, and relevant
evidence. Ask it to return decisions, open questions, tasks, and acceptance checks.

If the current model's identity is unknown, do not claim it is Astra. Prefer an
explicitly selected Astra child when available. If neither an Astra conversation
nor an Astra child is available, explain the limitation and ask for a planning
fallback or a model switch; do not silently label another model Astra.

## Balanced routing, cheaper first when checkable

Minimize the cost of reaching a verified result, including context, retries, and
review. Choose capability using ambiguity, consequence of error, and strength of
acceptance checks. The following are starting candidates, conditional on the
session's actual allowlist and capability/cost information, not a price table:

| Work | Starting candidate | Effort |
| --- | --- | --- |
| Narrow lookup, mechanical edit, bounded fix with a strong regression check | `gpt-5.6-luna` | low or medium |
| Routine implementation or investigation needing broader coding context | `gpt-5.6-terra` or `gpt-5.6-sol` | medium |
| Difficult diagnosis or consequential review | `gpt-5.6-sol` or `gpt-6-astra` | high |
| Architecture, task decomposition, material replanning, integrated plan review | `gpt-6-astra` | high |

Do not assume relative prices among middle-tier models without session evidence.
When a preferred worker is unavailable, use an available model suited to the task
and disclose the fallback. Honor user cost limits; if none of the available choices
fits, surface the constraint. Do not force delegation for a task whose brief and
review would cost more than doing it directly.

## Dispatch and escalation

Set model and reasoning effort explicitly when supported. In the current
`collaboration.spawn_agent` surface, use `fork_turns: "none"` for a focused brief,
or a supported numeric string for a small partial history. A full-history fork
inherits the parent and does not accept overrides. Never send the literal value
`"partial"`. Adapt to the actual tool schema when it differs.

Keep workers' context limited to their task, shared contracts, relevant paths and
evidence, acceptance checks, and constraints. Reuse an existing worker for fixes
using the session's supported follow-up tool. Respect the session's slot limit;
avoid nested fan-out and idle duplicate agents.

On failure, inspect the evidence first. Missing context calls for a corrected
brief; difficult reasoning calls for a stronger supported model or effort. Do not
repeat an unchanged prompt or assume every failing test is model incapability.
After a repeated failure without new evidence, stop that attempt, re-scope or
escalate. Report a genuine blocker when no authorized path remains. Do not invent
an arbitrary success claim to stay within a budget.
