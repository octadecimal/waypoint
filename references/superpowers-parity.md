# Superpowers replacement map

Baseline: Superpowers 6.3.0, commit
`b36e0829c6d0140e93cfef2ca599b1b07d4a7797`. Adapted material retains its
[MIT license](../licenses/superpowers-MIT.txt), copyright Jesse Vincent (2025).
This is a Codex-focused derivative, not an upstream Superpowers release.

| Original skill | Replacement | Preserved capability and intentional adaptation |
| --- | --- | --- |
| brainstorming | [waypoint-plan](../skills/waypoint-plan/SKILL.md) | Context, feasibility/bounded/architectural design, alternatives, scope, spec review, UI companion; Astra planning and one approval or authorized auto execution |
| using-superpowers | [using-waypoint](../skills/using-waypoint/SKILL.md) | Skill selection, precedence, continuity, tool adaptation; relevant skills instead of indiscriminate loading |
| writing-plans | [writing-plans](../skills/writing-plans/SKILL.md) | Executable tasks, exact files, verification, self-review and execution handoff |
| executing-plans | [executing-plans](../skills/executing-plans/SKILL.md) | Existing-plan execution, progress, blockers, checkpoints and completion |
| subagent-driven-development | [subagent-driven-development](../skills/subagent-driven-development/SKILL.md) | Fresh task briefs, review packets, ledger, fix loops and integration; economical models and coordinator-owned Git mutations |
| dispatching-parallel-agents | [dispatching-parallel-agents](../skills/dispatching-parallel-agents/SKILL.md) | Independent work decomposition, scoped dispatch, conflict avoidance and synthesis |
| systematic-debugging | [systematic-debugging](../skills/systematic-debugging/SKILL.md) | Evidence-first root cause, hypotheses, tracing, layered validation, condition waits and pollution isolation |
| test-driven-development | [test-driven-development](../skills/test-driven-development/SKILL.md) | Observed red/green/refactor and good-test guidance; proportional validation for prose/metadata |
| requesting-code-review | [requesting-code-review](../skills/requesting-code-review/SKILL.md) | Independent spec/quality review, severity, revision context and feedback loop |
| receiving-code-review | [receiving-code-review](../skills/receiving-code-review/SKILL.md) | Technical assessment, clarification, pushback, prioritized fixes and verification |
| using-git-worktrees | [using-git-worktrees](../skills/using-git-worktrees/SKILL.md) | Isolation, directory/ignore checks, baseline setup, native workspace awareness and ownership |
| verification-before-completion | [verification-before-completion](../skills/verification-before-completion/SKILL.md) | Fresh command/result evidence tied to the actual claim and revision |
| finishing-a-development-branch | [waypoint-complete](../skills/waypoint-complete/SKILL.md) | Verify, integrate, retain or explicitly abandon work; authorized PRs must reach current green CI, then hands-on test and explicit merge approval |
| writing-skills | [writing-skills](../skills/writing-skills/SKILL.md) | Discovery descriptions, progressive disclosure, pressure testing, test-driven skill revision and supporting authoring tools |

The visual companion preserves fragments/full documents, choices, recorded click
feedback, automatic reload, persistent sessions, authenticated HTTP/WebSockets,
restart/reconnect, and safe lifecycle handling. A native inline surface and static
HTML remain alternatives. Clicks express preferences, never implementation or
merge authorization.

The original Codex manifest declares no session hook. Other harness installers,
Claude/Cursor hooks, provider tool mappings, promotional assets/telemetry, and
historical creation logs are not Codex capabilities and are not required here.
Personal Codex instructions load the workflow entry point. Portable Python helpers
replace Bash execution/debugging utilities; the preview launcher runs on Node
without Bash. Graphviz remains optional for authoring diagrams. No runtime
reference requires the uninstalled plugin's cache.

Approved changes supersede original fixed rituals: no duplicate design approvals,
mandatory doc commits, unconditional expensive reviewers, worker-owned commits,
automatic workspace deletion, or premature handoff while CI is pending. Local-only,
plan-only, feasibility, keep-work, and explicit abandonment remain valid endpoints.
