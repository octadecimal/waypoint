---
name: using-astra-workflow
description: Use at the start of Codex development work to select the relevant Astra Workflow skills, establish the user's execution mode, and preserve authorization through planning, delegated work, verification, and completion.
---

# Using Astra Workflow

If dispatched as a worker, execute your bounded assignment; do not restart the
coordinator workflow. For the coordinator, identify requested or relevant skills
before taking task actions, read them, and briefly announce their purpose. Reuse
skills already read in this conversation. Do not load unrelated skills merely
because a keyword appears.

Before any edit, read [model routing](../../references/model-routing.md) and apply
its required worker routing. This skill explicitly authorizes bounded delegation
and model selection; the user does not need to mention agents. A dispatched
edit-only worker performs its assignment itself and does not delegate again.

User intent and higher-priority instructions govern. Carry existing decisions
forward and read [delivery authority and CI completion](../../references/ci-completion.md).
Once implementation is requested or approved, the standing target is a green PR;
preserve explicit plan-only, local-only, no-push, or no-PR limits. Design approval
alone and skill discovery are not implementation authority. Merge, deployment,
billing, and unrelated repositories remain outside that authority. Read
[Codex tool guidance](references/codex-tools.md) when delegating or resuming a
workflow.

## Choose the entry point

| Task | Skill |
| --- | --- |
| New behavior, project, feature, UI direction, or feasibility question | [astra-plan](../astra-plan/SKILL.md) |
| Turn an accepted design into executable tasks | [writing-plans](../writing-plans/SKILL.md) |
| Execute an existing plan in this session with workers | [subagent-driven-development](../subagent-driven-development/SKILL.md) |
| Resume or execute a plan with a lightweight sequential worker path | [executing-plans](../executing-plans/SKILL.md) |
| Several independent investigations or work packages | [dispatching-parallel-agents](../dispatching-parallel-agents/SKILL.md) |
| Unknown failure, regression, flaky test, or performance issue | [systematic-debugging](../systematic-debugging/SKILL.md) |
| Implement a behavior change or bug fix | [test-driven-development](../test-driven-development/SKILL.md) |
| Isolate feature work or inspect an existing worktree | [using-git-worktrees](../using-git-worktrees/SKILL.md) |
| Obtain independent implementation review | [requesting-code-review](../requesting-code-review/SKILL.md) |
| Evaluate review findings before changing code | [receiving-code-review](../receiving-code-review/SKILL.md) |
| Make a completion, test, build, or fix claim | [verification-before-completion](../verification-before-completion/SKILL.md) |
| Finish a branch, deliver a green PR, repair CI, or approved post-test merge | [astra-complete](../astra-complete/SKILL.md) |
| Create, edit, or validate agent skills | [writing-skills](../writing-skills/SKILL.md) |

Process skills set the approach; domain skills then supply implementation detail.
Do not make a bug investigation repeat brainstorming unless it exposes a material
design decision. Do not make a completed design repeat the design gate before
execution. Scale checklists to the work and preserve the required evidence.

## Continuity

Read and apply [continuation](../../references/continuation.md) before ending a
coordinator turn: if authorized, unblocked work remains, act instead of handing
back a description of the next step. Resolve short replies against the recorded
pending decision, keep worker handoffs internal, and ask only consequential
questions. Required human reviews and explicit task boundaries still apply.

Use the [delivery checkpoint](../../references/delivery-checkpoint.md) for task
state, authority, workers, verification, and runtime ownership. On resume, reconcile
live Git, PR, CI, worker, and runtime evidence before acting. Never mistake a
checkpoint, old green check, or mockup click for current merge approval. Continue
useful independent work while workers or CI run, following the
[progress guidance](../../references/ci-completion.md#progress-without-repetition).

Read [the migration map](../../references/superpowers-parity.md) when interpreting
legacy workflow names. This plugin contains its own implementation and helpers;
the original plugin is not required.
