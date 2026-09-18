---
name: writing-plans
description: Use when a specification or approved design needs a concrete multi-step implementation plan before code changes begin.
---

# Writing Plans

Turn an approved goal or design into a buildable plan with exact paths, interfaces, test cycles, task boundaries, review points, and delivery authority.

**Planning owner:** Astra owns standalone implementation planning and material replanning. Read [model routing](../../references/model-routing.md). If the current model is Astra, plan directly. Otherwise dispatch or reuse one read-only Astra planner with the user's request, existing decisions, repository evidence, and authorization boundary. A planner does not edit code, stage, commit, push, or publish.

This skill is the detailed-planning phase of `astra-workflow:astra-plan`, not a second brainstorming gate. Carry accepted design decisions forward. Ask only when missing information materially changes the outcome and cannot be resolved from the repository. Plan-only stays plan-only. In auto mode, create the plan and continue with the appropriate executor without asking for the same approval again.

## Inspect before planning

Read repository instructions, the approved spec or conversation decisions, relevant code and callers, existing tests, build commands, CI workflows, and operational documentation. Follow the repository's required navigation tools. Reuse existing helpers and patterns.

Map the affected surfaces before tasks:

- files created, modified, or deleted and each file's responsibility;
- interfaces produced and consumed across tasks;
- contract, persistence, runtime, UI, permissions, migration, or workspace effects;
- platform and compatibility constraints;
- exact verification and expected CI checks;
- delivery target: local changes, local commits, or a green PR.

Do not add speculative abstractions, setup-only tasks, or broad cleanup. Fold scaffolding, configuration, and documentation into the task whose behavior needs them. Split tasks where one can be independently implemented, tested, and rejected without invalidating its neighbors.

## Plan location and identity

Honor a user or repository plan location. Save a tracked repository document only
when the plan itself is an explicit deliverable or repository policy requires it.
Otherwise keep execution state out of the working tree at:

```text
<git-common-dir>/astra-workflow/<safe-task-id>/plan.md
```

Resolve the Git common directory from the active worktree and use a stable,
filesystem-safe task identifier. The plan path becomes the identity for task briefs,
artifact workspaces, and ledgers, so do not rename it during execution without
migrating those records. Do not store secrets in the plan.

## Required plan header

Every implementation plan starts with:

```markdown
# [Feature Name] Implementation Plan

> **Execution:** Use `astra-workflow:subagent-driven-development` for independent
> tasks with worker review, or `astra-workflow:executing-plans` for tightly coupled
> work. Both routes dispatch edit-only implementation workers; the coordinator owns
> Git, integration, PRs, and CI.

**Goal:** [One observable sentence]

**Architecture:** [Two or three sentences describing the chosen approach and why]

**Tech stack:** [Relevant languages, frameworks, and existing dependencies]

**Spec:** [Path or durable source for the approved requirements]

**Mode:** [plan-only | collaborative | auto]

**Delivery target:** [plan only | local changes | local commits | open PR with green CI]

**Authorization:** [User statement or approved-plan boundary; merge remains separate]

## Global constraints

- [Exact compatibility, dependency, security, naming, copy, platform, and safety rules]
- [Exact values and relationships copied from the approved spec]

## Acceptance criteria

- [Observable result]
- [Failure behavior]
- [Verification and expected CI]

---
```

If no separate spec exists, cite the user-approved decision record or include the exact requirements in the plan. Do not invent a spec path.

## Task size and order

A task is the smallest unit that carries one coherent test cycle and a meaningful review gate. Order tasks by dependency. Tasks that share files or interfaces name that relationship explicitly; independent tasks name nonoverlapping ownership so the dispatcher can parallelize safely.

Each step is one concrete action. For behavior changes, include the complete red-green-refactor sequence:

1. Add the focused failing test.
2. Run it and state the expected failure.
3. Implement the minimum behavior.
4. Run the focused test and state the expected pass.
5. Run the relevant regression check.
6. Self-review and write the task report.

Workers never receive a commit step. `subagent-driven-development` has the coordinator
stage explicit paths after implementation, package the staged diff for review, and
create an already-authorized checkpoint commit only after task review accepts the
staged change. Task-review acceptance is not a second human approval gate.

For prose, metadata, generated artifacts, or behavior-preserving work, specify the meaningful validation instead of manufacturing a failing behavioral test.

## Task template

````markdown
### Task N: [Deliverable]

**Purpose:** [Why this task exists and what independently works afterward]

**Ownership:**
- Create: `exact/path/to/file`
- Modify: `exact/path/to/file:relevant symbol or section`
- Test: `exact/path/to/test`
- Excludes: [paths or behavior owned elsewhere]

**Interfaces:**
- Consumes: [exact earlier symbols, signatures, schemas, or files]
- Produces: [exact symbols, signatures, schemas, or behavior later tasks use]

**Acceptance:**
- [Observable result and error behavior]

- [ ] **Step 1: Write the failing test**

```typescript
test('describes the requested behavior', () => {
  expect(subject(input)).toEqual(expected);
});
```

- [ ] **Step 2: Verify the red state**

Run: `pnpm test path/to/test.ts -t "describes the requested behavior"`
Expected: FAIL because [specific missing behavior], not a setup or syntax error.

- [ ] **Step 3: Implement the minimum change**

```typescript
export function subject(input: Input): Output {
  return expected;
}
```

- [ ] **Step 4: Verify the green state**

Run: `pnpm test path/to/test.ts -t "describes the requested behavior"`
Expected: PASS with no warnings.

- [ ] **Step 5: Run the regression check**

Run: `[exact repository command]`
Expected: [observable pass criteria].

- [ ] **Step 6: Self-review and report**

Confirm the diff matches this task, then report changed paths, RED/GREEN evidence,
regression results, and unresolved risks. Do not stage, commit, push, or publish.
````

Use the repository's actual language and test commands. Include exact code when it makes the plan executable and stable; for code whose exact implementation depends on local context, provide signatures, behavior, and constraints instead of brittle pseudocode.

## No placeholders

Before saving, remove:

- `TBD`, `TODO`, `implement later`, and `fill in details`;
- `add validation`, `handle errors`, or `write tests` without exact cases;
- `similar to Task N` instead of the required content;
- symbols never defined by the plan or existing code;
- commands without expected results;
- worker instructions to stage, commit, push, open a PR, or run CI mutations.

## Plan self-review

Review the complete plan against the spec:

1. **Coverage:** map every requirement and acceptance criterion to a task.
2. **Scope:** remove unrequested behavior and abstractions.
3. **Task consistency:** compare each task's files, tests, code, and acceptance criteria.
4. **Cross-task consistency:** check shared files, produced/consumed interfaces, names, types, and ordering.
5. **Authorization:** ensure the mode and delivery target preserve the user's latest decision.
6. **Execution:** ensure workers are edit-only and coordinator Git/CI ownership is explicit.

For a substantial or high-risk plan, dispatch a read-only Astra plan reviewer using [plan reviewer prompt](plan-document-reviewer-prompt.md). Fix concrete gaps in the plan. A reviewer does not create a second planning authority; return material choices to the same Astra planner.

## Handoff

- Plan-only: present the plan and stop.
- Collaborative: present the concrete plan and ask once for implementation approval when it has not already been given.
- Auto: state the saved plan and proceed. Use `astra-workflow:subagent-driven-development` for independent tasks or `astra-workflow:executing-plans` for tightly coupled work. Do not ask again.

An approved delivery target that includes a green PR flows into `astra-workflow:astra-complete`. Current-head passing CI is required before hands-on testing. Merge requires a later, explicit approval after the user tests that revision.
