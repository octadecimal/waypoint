---
name: astra-plan
description: Plan repository work with Astra when a user wants adaptive brainstorming, economical subagents, or optional automatic execution through a PR with passing CI. For finishing an existing branch, use astra-complete.
---

# Astra Plan

Turn the user's goal into verified work. Astra owns planning; one coordinator
owns integration. Follow the repository's instructions and permissions. This
skill explicitly permits bounded subagent delegation and model selection.

If you are already a dispatched worker, perform only your assigned task. Do not
restart this workflow, create another planner, or broaden your authority.

## 1. Establish mode and planning ownership

Read [model routing](../../references/model-routing.md) before dispatching.
If the current model is Astra, plan here. Otherwise automatically dispatch an
available Astra model as a read-only planner with a focused brief. Relay user
answers and evidence to that same planner; use its plan for execution. Return
material plan changes and the integrated result to Astra for review. A planner
child returns questions to the coordinator, never starts a second planner.

Use the user's latest intent:

| Intent | Behavior |
| --- | --- |
| Brainstorm, explore options, or explicitly plan only | Research and discuss; stop with a proposal. |
| Collaborative execution (default) | Present a concrete plan and obtain one go-ahead before implementation. |
| Auto, proceed autonomously, or work through to a green PR | State the plan and proceed within the authorized scope; do not request the same approval again. |

An explicit plan-only request overrides an earlier auto preference for this task.
Skill discovery alone grants no publishing authority. Include the delivery target
in the proposed plan: local changes or commit, push, and open PR. Explicit approval
of that concrete plan authorizes its stated actions; an explicit green-PR request
already supplies that authority. Neither mode grants merge or deployment approval.

## 2. Understand and plan proportionally

Inspect relevant code, callers, tests, project guidance, and CI definitions before
choosing a solution. Use the repository's required navigation tools. Reuse existing
behavior. Ask only questions whose answers materially affect the result; ask one
at a time when brainstorming. For clear requests, propose a short plan. For real
ambiguity, compare plausible approaches and recommend one. Avoid compulsory specs,
ceremonial questions, or unrelated refactors.

Present:

- Outcome, scope, exclusions, and observable acceptance criteria.
- Chosen approach, significant assumptions, and unresolved decisions.
- Tasks, dependencies, file ownership, selected model and effort, and a short
  routing rationale. Identify work that is cheaper to perform directly.
- TDD checks, integration verification, expected CI checks, and delivery target.

In auto mode, choose reasonable defaults for reversible implementation details.
Ask for missing information only when it blocks safe progress or materially changes
the authorized outcome; continue independent work while awaiting the answer.

## 3. Execute and integrate

Use an isolated worktree according to repository policy. The coordinator owns
staging, commits, pushes, PR updates, and CI decisions. Give each worker a bounded
task, relevant evidence, file ownership, dependencies, acceptance checks, and
instructions to return changed paths, commands/results, and unresolved risks.
Workers may edit their assigned files, but do not commit, push, or spawn more
workers unless explicitly assigned that authority.

Parallelize only independent work with nonoverlapping ownership. Serialize shared
files and integrate dependencies before dependent tasks start. Do useful local
work while workers run; do not duplicate their investigation.

For behavior changes, observe a focused test fail for the intended missing behavior
before implementing the smallest passing change; refactor with tests green. Existing
regression tests can supply the red step when their failure is observed. Keep red
and green command/result evidence. For behavior-preserving refactors, establish
coverage before edits. For prose and metadata, use relevant validation rather than
manufacturing behavioral tests. Follow stricter project requirements.

Inspect worker output and run integration checks. Use independent review when
cross-component behavior, security, persistence, concurrency, or other material
risk warrants it. Review against the request and acceptance criteria, including
test adequacy. Fix concrete findings; do not add ritual review rounds.

## 4. Finish or resume

For an authorized PR delivery, invoke [Astra Complete](../astra-complete/SKILL.md)
and continue through CI without another routine permission prompt. A plan-only or
local-only request keeps its stated boundary.

For work spanning multiple tasks or turns, keep a short checkpoint under
`<git-common-dir>/astra-workflow/<task-id>.md` using a safe task identifier. Record
scope, mode, authorization source, branch/worktree, task owners, pending work,
verification revision, and PR/check links. Keep it out of commits and omit secrets.
On resume, verify live state and current instructions; a checkpoint is a continuity
aid, never a substitute for fresh merge approval. Update it before handing off.
