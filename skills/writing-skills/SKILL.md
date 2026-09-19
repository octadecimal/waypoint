---
name: writing-skills
description: Use when creating, revising, packaging, or evaluating a Codex skill whose discovery, instructions, resources, or pressure-tested behavior must be reliable.
---

# Writing skills

A skill is reusable decision guidance, not a story about one successful task.
Write only information that changes a capable Codex agent's choices, then verify
the result at the level the skill affects.

For a standalone or material skill project, use `$astra-plan` to establish scope,
acceptance criteria, file ownership, validation, and delivery target. Do not add a
second planning gate when an approved Astra plan already covers the work.

## 1. Define the job

State the requests that should trigger the skill, nearby requests that should not,
the observable outcome, and any permission or safety boundary. Create a skill only
for reusable guidance. Put repository-specific rules in the repository's agent
instructions; automate mechanical constraints with a validator when practical.

Choose the instruction form from the failure:

| Observed failure | Effective form |
| --- | --- |
| Agent violates a known rule under pressure | Bright-line rule, stop sign, and evidence-derived rationalization counter |
| Output has the wrong shape | Positive output contract or template |
| Agent omits a required field | Required structural slot in the artifact |
| Behavior varies by circumstance | Conditional keyed to an observable predicate |
| Deterministic repeated operation | Script with explicit inputs, outputs, and errors |

Do not create prohibition lists for a shaping problem. Tell the agent what the
result contains and in what order.

## 2. Establish evaluation evidence

For a new discipline or behavior-shaping skill, define representative scenarios
before writing the instructions. When subagent delegation is authorized, read
[model routing](../../references/model-routing.md), then use
[testing skills with subagents](references/testing-skills-with-subagents.md) to
capture an unskilled baseline, skilled result, and any rationalizations.

For Astra Workflow regressions, use the
[repeatable trial kit](../../tests/behavioral-regressions.md) to select a changed
decision and a nearby control. Capture actual dispatch and RED/GREEN tool evidence
for routing trials; label simulated delivery decisions separately from live checks.

Do not use paid API calls, live production sessions, or subscription-consuming
smoke tests for skill evaluation. Local packaging checks and authorized Codex
subagents are sufficient. If isolated subagent evaluation is unavailable or not
authorized, write the scenarios and report that behavioral evaluation was not run;
never invent a baseline or passing result.

Pure reference updates, trivial prose corrections, and reversible metadata changes
do not need manufactured pressure tests. Validate their actual contract: links,
frontmatter, schema, script behavior, or packaging.

## 3. Author for discovery and progressive disclosure

Every skill directory needs `SKILL.md` with YAML `name` and `description`.

- Use lowercase letters, digits, and hyphens for the folder and name.
- Make the description a short third-person trigger beginning with "Use when".
  Describe the situation, not the workflow the body will teach.
- Put shared purpose, decisions, constraints, and routing in `SKILL.md`.
- Put conditional detail in `references/`, deterministic helpers in `scripts/`,
  and output assets in `assets/`.
- Link every supporting resource from `SKILL.md` at the point it becomes relevant.
- Keep references shallow and focused; avoid README files, changelogs, placeholders,
  copied manuals, and historical scratch logs.
- Add `agents/openai.yaml` when UI metadata helps discovery. Its default prompt must
  mention `$skill-name`; automatic invocation stays enabled unless the user asks
  for explicit-only use.

Read [Codex skill authoring guidance](references/skill-authoring-guidance.md) for
structure, metadata, examples, scripts, and flowchart decisions.
When a skill needs Graphviz, follow the
[diagram conventions](references/graphviz-conventions.dot) and run the
[`render_graphs.mjs`](scripts/render_graphs.mjs) helper for visual inspection.

## 4. Write the minimum effective instruction

Lead with the core decision. Match specificity to risk: leave open-ended work room
for judgment; use exact steps only for fragile sequences, security, permissions,
or destructive operations. Preserve user intent and existing authorization. A
skill cannot silently grant publishing, billing, deployment, merge, or messaging
authority.

Use one strong, runnable example when an example materially helps. Keep language
and paths portable. Never depend on a legacy skill namespace or a tool that the
target Codex environment does not expose.

For discipline skills, add only rationalization counters observed in evaluation.
For output-shaping skills, refine the positive contract. Read
[persuasion principles](references/persuasion-principles.md) only when designing a
rule agents predictably skip under pressure; it is an attributed research summary,
not current Codex product documentation.

## 5. Validate and iterate

Run the available skill validator and package tests. Execute every new or changed
script on controlled inputs. Check:

- frontmatter parses and name matches the directory;
- description routes correctly without restating the process;
- all real relative links resolve inside the package;
- referenced skills use the current namespace;
- instructions preserve permission and billing boundaries;
- examples contain no secrets or repository-specific residue;
- scripts fail clearly and avoid destructive defaults.

For evaluated skills, compare the baseline and skilled outcomes against the same
rubric. Inspect responses manually. Fix observed gaps, then rerun the affected
scenario. Do not claim a skill is pressure-tested when only its prose or regex was
checked.

Before handoff, use `$verification-before-completion`. If the authorized delivery
target is a PR, continue through `$astra-complete` until expected CI is green for
the current head SHA.

## Common mistakes

- Description summarizes the workflow, so the agent never reads the body.
- The skill restates knowledge Codex already has instead of encoding a decision.
- References are unlinked, nested several levels deep, or copied wholesale.
- A wording assertion is called a behavior evaluation.
- One successful model response is called proof.
- Test scenarios or creation logs ship as product guidance.
- Anthropic-specific paths, tools, or model claims are presented as Codex facts.
- A helper script is added without running it.
