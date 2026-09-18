# Codex tool guidance

The actual tool schema, available models, permissions, and repository instructions
are authoritative. Do not edit global model/billing settings or enable paid API
fallbacks to make this workflow run.

- Read [model routing](../../../references/model-routing.md). Astra owns planning
  and material replanning. Use cheaper capable workers for bounded, verifiable
  assignments; escalate based on evidence, not habit.
- With `collaboration.spawn_agent`, specify a supported model and effort when
  routing. Use `fork_turns: "none"` or a supported numeric history count for
  overrides; a full-history `"all"` fork inherits the parent and cannot override
  them. Supply relevant context explicitly. Never invent `agent_type`, role-file,
  lifecycle, or fork parameters absent from the live schema.
- Reuse an implementer with `followup_task` for fixes. `send_message` communicates
  without starting an idle turn. `interrupt_agent` is for steering/stopping owned
  work; interruption does not undo edits. These are separate direct tool calls,
  not functions inside `functions.exec`.
- Work locally while workers run. When idle, use the event-based wait tool with
  a duration compatible with the host's progress-update limits. Avoid busy polling.
  Do not call a nonexistent close operation; use only available lifecycle tools.
- If delegation/model selection is unavailable, state the limitation and perform
  bounded work locally when allowed. Do not claim Astra planning occurred without
  an available Astra model; honor any hard model requirement before dependent work.
- Read-only `git rev-parse --git-dir`, `--git-common-dir`, `git worktree list`, and
  `git branch --show-current` identify linked worktrees and detached HEAD. Inspect
  ownership before creating branches or moving work. Do not assume detached HEAD
  proves a sandbox restriction; use actual tool results.
- If an actual permission/tool constraint blocks branch/push/PR operations, finish
  permitted verification and report the precise remaining action and evidence.
  Use a supported native worktree/handoff surface when available. Do not invent
  UI controls or commit unrelated files to manufacture a handoff.
- Preview UI through supported native visualization/browser tools or the bundled
  companion. Report what was rendered and exercised, distinguishing HTTP checks
  from browser layout/interaction validation.
