# Codex skill authoring guidance

This is the practical reference for skill structure and content. It adapts useful
ideas from the upstream Superpowers writing-skills materials to Codex. Anthropic
product paths, model names, and runtime guarantees from the upstream source are not
Codex documentation.

## Structure

```text
skill-name/
|-- SKILL.md
|-- agents/
|   `-- openai.yaml       optional UI metadata
|-- references/           conditional guidance
|-- scripts/              deterministic reusable helpers
`-- assets/               files copied into generated output
```

Create only directories with a real use. A simple skill may need only `SKILL.md`.

## Frontmatter

```yaml
---
name: example-skill
description: Use when [specific trigger, symptom, or request].
---
```

The name uses lowercase letters, digits, and hyphens and matches the folder. Keep
the description concise, in third person, and discriminating. It answers "should
this skill load now?" without teaching the workflow.

Useful discovery language names symptoms and user intent: flaky, race condition,
timeout, redline, merge, schema migration, or the relevant file type. Avoid generic
names such as `helper` and descriptions such as "helps with files."

## Entry point

An effective `SKILL.md` usually contains:

1. purpose and core decision;
2. conditions or modes that change the workflow;
3. required safety and permission boundaries;
4. the smallest reusable procedure;
5. links to conditional references and scripts;
6. observable verification and honest stopping conditions.

This is a menu, not a mandatory outline. Remove sections that do not earn their
context cost.

## Progressive disclosure

Keep the main workflow in `SKILL.md`; move substantial conditional detail to a
directly linked reference. Prefer one level of references so an agent can discover
all relevant material from the entry point. A long reference benefits from a short
contents list and searchable headings.

Do not duplicate the same rule across files. Put it where the agent needs it and
link there. Assets are output material, not instructions.

## Instruction precision

Use high freedom when several approaches are sound and depend on context. Use a
preferred pattern when consistency helps but parameters vary. Use an exact command
or script when the operation is fragile, destructive, or repeatedly error-prone.

Every absolute rule needs a concrete reason. Preserve these as hard boundaries:
input validation at trust boundaries, data-loss prevention, security,
accessibility, permissions, billing, and explicit user requirements.

## Scripts

Add a script when deterministic execution is safer or cheaper than regenerating
logic. Document whether to run it or read it, its inputs and outputs, dependencies,
and useful failure messages. Prefer standard-library implementations and portable
forward-slash paths. Validate scripts with controlled fixtures.

## UI metadata

Use `agents/openai.yaml` when display metadata is useful:

```yaml
interface:
  display_name: "Example Skill"
  short_description: "Describe the user-visible capability"
  default_prompt: "Use $example-skill to handle this request."
policy:
  allow_implicit_invocation: true
```

Quote strings. Keep `short_description` concise. Preserve existing policy and
dependency fields when editing. Set implicit invocation false only when explicitly
requested.

## Examples and visuals

One complete example beats several shallow language variants. Use a flowchart only
for a non-obvious decision or loop; use prose for linear steps and a table for
comparisons. See [Graphviz conventions](graphviz-conventions.dot). Render `dot`
blocks for inspection with:

```bash
node scripts/render_graphs.mjs path/to/skill
node scripts/render_graphs.mjs path/to/skill --combine
```

The renderer requires Graphviz `dot`. Generated diagrams are review artifacts and
should not be committed unless they are an explicit deliverable.

## Review checklist

- The skill addresses a reusable failure or decision.
- The trigger is specific and excludes likely false matches.
- The body contains non-obvious guidance rather than generic competence.
- Permission and side-effect boundaries match the host environment.
- Every link and resource has a caller.
- Examples and references are current, portable, and attributed where needed.
- Validation tests behavior or structure that can realistically regress.
