---
name: astra-plan
description: Brainstorm and plan new projects, features, UI designs, components, and behavior changes with Astra before implementation. Replaces the original brainstorming workflow, with UI mockup previews, economical workers, and optional execution through a green PR. For finishing an existing branch, use astra-complete.
---

# Astra Plan

Turn the user's goal into verified work. Astra owns planning; one coordinator
owns integration. Follow the repository's instructions and permissions. This
skill explicitly permits bounded subagent delegation and model selection.

This is the brainstorming entry point, not a second design gate after another
brainstorming skill. Carry existing decisions and approvals forward. A feasibility
request can end with findings; do not turn a throwaway probe into product work.

If you are already a dispatched worker, perform only your assigned task. Do not
restart this workflow, create another planner, or broaden your authority.

## 1. Establish mode and planning ownership

Read [model routing](../../references/model-routing.md) before any edit or dispatch.
If the current model is Astra, plan and make visual design decisions here.
Otherwise automatically dispatch an available Astra model as a read-only planner
with a focused brief and reuse it as the designer when visual work is needed.
Design assignments may grant that Astra child write access only to task-owned
preview files; the planner remains read-only elsewhere. Relay user answers and
evidence to that same planner; use its plan for execution. Return material plan
changes and the integrated result to Astra for review. A planner child returns
questions to the coordinator, performs its own assigned preview work, and never
starts a second planner.

Use the user's latest intent:

| Intent | Behavior |
| --- | --- |
| Brainstorm, explore options, or explicitly plan only | Research and discuss; stop with a proposal. |
| Collaborative execution (default) | Present a concrete plan. Ask once only if implementation has not already been requested or approved; then deliver through a green PR. |
| Auto, proceed autonomously, or work through to a green PR | State the plan and proceed within the authorized scope; do not request the same approval again. |

Read [delivery authority and CI completion](../../references/ci-completion.md). An
explicit plan-only, local-only, no-push, or no-PR request overrides the green-PR
default and remains in force unless the user changes it. A normal "yes" or "go
ahead" to the concrete implementation plan authorizes implementation and green-PR
delivery. Approval of a design or mockup alone does not. Skill discovery grants no
authority by itself. Ask about a material unresolved design choice when needed,
but do not turn planning into a second implementation or publication gate. Neither
mode grants merge or deployment approval.

Distinguish a needed design review from an execution handoff. Label a human review
clearly and state what approval will unlock. When the user approves that checkpoint
inside an already-authorized implementation task, acknowledge in commentary and
perform the next action in the same turn. Do not finish with a recap or "next is
implementing" when that work is authorized and unblocked. Preserve explicit
brainstorm-only, design-only, and plan-only limits.

## 2. Understand and plan proportionally

Inspect relevant code, callers, tests, project guidance, and CI definitions before
choosing a solution. Use the repository's required navigation tools. Reuse existing
behavior. Ask only questions whose answers materially affect the result; ask one
at a time when brainstorming. For clear requests, propose a short plan. For real
ambiguity, compare plausible approaches and recommend one. Avoid compulsory specs,
ceremonial questions, or unrelated refactors.

Choose the depth explicitly: a **spike** answers a feasibility question with
clearly disposable artifacts; **bounded** work changes an existing understood
flow with a short in-chat design; **architectural** work introduces or changes
component boundaries and needs a durable design and executable plan. Upgrade
the depth when evidence exposes hidden complexity, preserving existing authority
unless the intended outcome changes. Decompose several independent subsystems
into ordered slices before designing all of them in detail.

For architectural work, compare two or three plausible approaches, then describe
architecture, components, data flow, errors, boundaries, and verification. Keep
the design in the task checkpoint directory unless it is an explicit repository
deliverable; do not commit scratch specs by default. Self-review for completeness,
contradictions, ambiguity, scope, and unrequested features using the
[spec review checklist](spec-document-reviewer-prompt.md). Use independent review
where the risk warrants it. Refine the concrete proposal before its one approval;
auto mode does not introduce a spec approval gate. Then use
[writing-plans](../writing-plans/SKILL.md) for executable tasks.

For visual decisions about layout, navigation, hierarchy, or interaction, use
[UI mockup previews](../../references/ui-previews.md) at the point they help the
user decide. Visual design, layout, interaction, mockup authoring, revision, and
interpretation of visual feedback are Astra work even when the preview uses HTML,
CSS, or JavaScript. The current Astra may author it directly; a non-Astra
coordinator reuses its Astra planner/designer with the scoped preview-file authority
above. Cheaper workers may do bounded lookup or mechanical checks, not original
design or feedback interpretation. A requested preview is part of brainstorming,
not production implementation. Keep conceptual questions in chat. In auto mode,
choose a justified visual direction and continue; do not invent a new approval gate
for every mockup. Use a browser preview when inline rendering support on the user's
device is unknown, open its first desktop view automatically unless the user says
not to, and reuse the same tab for revisions. An advertised visualization skill is
not proof of display support, while missing browser automation is not proof that no
OS browser can open. Recover failed embeds to an automatically opened preview or,
when opening truly is unavailable, a verified browser/file link before asking for
visual feedback. Report opening and visual inspection only when actually observed.

Present:

- Outcome, scope, exclusions, and observable acceptance criteria.
- Chosen approach, significant assumptions, and unresolved decisions.
- For UI work, the current preview revision and the user's selected direction,
  distinguishing visual preferences from implementation authorization.
- Tasks, dependencies, file ownership, selected worker model and effort, and a
  short routing rationale.
- TDD checks, integration verification, expected CI checks, and delivery target.

In auto mode, choose reasonable defaults for reversible implementation details.
Ask for missing information only when it blocks safe progress or materially changes
the authorized outcome; continue independent work while awaiting the answer.

## 3. Execute and integrate

Use an isolated worktree according to repository policy. The coordinator owns
staging, commits, pushes, PR updates, and CI decisions. Give each worker a bounded
task, relevant evidence, file ownership, dependencies, acceptance checks, and
instructions to return changed paths, commands/results, and unresolved risks.
Workers edit only their assigned files and do not commit, push, or spawn more
workers.

Dispatch or reuse a cheaper capable edit-only worker for every routine code or
test task under the routing guide, including production implementation of an
accepted visual design. One worker owns the full RED/GREEN cycle for a coupled
task; serialize dependencies without moving their edits to the coordinator.

Use [worktree setup](../using-git-worktrees/SKILL.md) for isolation,
[subagent-driven development](../subagent-driven-development/SKILL.md) for a
multi-task execution ledger and task reviews, or
[executing plans](../executing-plans/SKILL.md) when resuming an existing plan.

Parallelize only independent work with nonoverlapping ownership. Serialize shared
files and integrate dependencies before dependent tasks start. Do useful local
work while workers run; do not duplicate their investigation.

For behavior changes, observe a focused test fail for the intended missing behavior
before implementing the smallest passing change; refactor with tests green. Existing
regression tests can supply the red step when their failure is observed. Keep red
and green command/result evidence. For behavior-preserving refactors, establish
coverage before edits. For prose and metadata, use relevant validation rather than
manufacturing behavioral tests. Follow stricter project requirements.
Use [TDD](../test-driven-development/SKILL.md) for its full red/green discipline
and [systematic debugging](../systematic-debugging/SKILL.md) for unknown failures.

Inspect worker output and run integration checks. Use independent review when
cross-component behavior, security, persistence, concurrency, or other material
risk warrants it. Review against the request and acceptance criteria, including
test adequacy. Fix concrete findings; do not add ritual review rounds.

## 4. Finish or resume

For approved implementation, invoke [Astra Complete](../astra-complete/SKILL.md)
and continue through green-PR delivery without another routine permission prompt.
An explicit plan-only, local-only, no-push, or no-PR request keeps its stated
boundary.

For work spanning multiple tasks or turns, maintain the
[delivery checkpoint](../../references/delivery-checkpoint.md), including runtime
ownership, data source, URL, and served revision when applicable. Keep it out of
commits and reconcile live evidence on resume. Update it before handing off.
