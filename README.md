# Astra Workflow

A private Codex plugin that replaces the original brainstorming workflow with
Astra-led design, UI mockup previews, economical subagents, and delivery through
an open pull request with passing CI.

## Use

Start a new Codex thread after installing. Select a skill in the composer, or use:

```text
Use $astra-plan to brainstorm export filters. Do not implement yet.
```

```text
Use $astra-plan in auto mode to implement export filters and deliver an open PR
with passing CI. Use cheaper workers where the result is easy to verify.
```

```text
Use $astra-complete to finish this branch and prepare it for my hands-on testing.
```

| Skill | Responsibility |
| --- | --- |
| [astra-plan](skills/astra-plan/SKILL.md) | Default brainstorming, UI previews, Astra planning, model assignments, TDD, integration, completion handoff |
| [astra-complete](skills/astra-complete/SKILL.md) | Verify existing work, open/update a PR, repair CI, prepare testing, merge only after post-test approval |

Collaborative mode is the default: approve the concrete plan once. Auto mode
proceeds within the requested scope without routine approval prompts. An explicit
plan-only or local-only instruction always keeps that boundary. Automatic skill
selection is enabled; selection itself never grants publishing authority.

The skill uses Astra in the main conversation when available, otherwise creates
an Astra planning child automatically. Workers can use lower-cost models and
explicit reasoning effort. Model choices adapt to the live allowlist; see
[routing](references/model-routing.md). A skill cannot switch the main model,
guarantee model access, or measure savings without usage evidence.

For authorized PR delivery, ordinary CI failures stay with the agent until fixed
or genuinely blocked. The normal handoff is an open PR with current passing CI,
verification evidence, and concrete manual test steps. Merge requires hands-on
testing and explicit approval of the current revision. This plugin does not change
GitHub branch protection; repositories retain their own enforcement and merge rules.

## Preview UI designs

```text
Use $astra-plan to compare two settings-page layouts. Show previews before we
decide; do not implement yet.
```

Use Codex's inline mockup surface when available. Otherwise use an inspectable,
self-contained browser prototype. The bundled [example](assets/ui-preview.html)
compares sidebar and top navigation with a native radio selector. It needs no
JavaScript, server package, or Superpowers installation. The illustrated product
screen is static; the layout selector is interactive.

The [preview workflow](references/ui-previews.md) covers revision feedback,
responsive checks, auto mode, and a loopback-only static-server fallback. Python
is optional for that fallback; it is not required for inline or local-file previews.
Preview selections record design preferences, not permission to implement or merge.

## Replace the original brainstorming skill

Astra Plan handles new projects, features, components, UI decisions, and behavior
changes. Use it directly rather than running two brainstorming gates. Existing
decisions and approvals carry forward; auto mode remains available.

If the original skill is bundled in Superpowers, removing the whole plugin would
also remove unrelated skills. Disable only `superpowers:brainstorming` using the
host's skill controls after validating this replacement. In Codex versions with
the name selector, the app-server operation is:

```json
{"method":"skills/config/write","params":{"name":"superpowers:brainstorming","enabled":false}}
```

Verify the actual available schema before using this operation. Name selection
avoids a version-specific cache path. Older hosts may support only the full
`SKILL.md` path in `[[skills.config]]`; recheck after plugin updates in that case.
Do not delete files from a plugin-managed cache. This disables the bundled skill;
it does not uninstall the rest of Superpowers or erase the bundled file.

When the user requests full replacement, add a narrow personal instruction routing
legacy references to `brainstorming` or `superpowers:brainstorming` to
`astra-workflow:astra-plan`. Preserve unrelated personal instructions. Verify Astra
skills remain enabled and other Superpowers skills retain their previous state.
Restart Codex or start a fresh session as required by the host; an existing
conversation may still contain the previous skill's instructions.

## Install locally

This repository is private. Authenticate Git access as an account with access to
`octadecimal/astra-workflow`. The plugin uses Codex's existing tools and account;
it contains no MCP server, hooks, paid API integration, or runtime dependency.
Subagent model selection requires a Codex session that exposes it. PR delivery
requires authenticated Git/GitHub access; examples use `gh`.

The standard personal-marketplace layout is:

```text
~/plugins/astra-workflow/                 # this repository or its worktree
~/.agents/plugins/marketplace.json        # personal catalog, outside this repo
```

Clone the repository into that plugin directory if it is not already present:

```text
git clone https://github.com/octadecimal/astra-workflow.git ~/plugins/astra-workflow
```

Before the initial implementation PR is merged, check out `feat/astra-workflow`
to test that version. Do not clone over an existing checkout or worktree.

Register the following entry in the `plugins` array of the personal marketplace,
preserving existing entries and metadata:

```json
{
  "name": "astra-workflow",
  "source": { "source": "local", "path": "./plugins/astra-workflow" },
  "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
  "category": "Productivity"
}
```

For a new personal marketplace, use top-level `name: "personal"`,
`interface: {"displayName": "Personal"}`, and the `plugins` array. Install with:

```text
codex plugin add astra-workflow@personal
```

Use the existing marketplace name if yours differs. Codex discovers the standard
personal marketplace automatically. The source repository is a plugin, not a
standalone marketplace, so do not pass its GitHub URL to `plugin marketplace add`.

After source updates, follow Codex's plugin cache/reinstall procedure and start a
new thread. Editing the source does not prove an existing thread loaded it.

## Validate

Python 3.12+ and PyYAML are development-only dependencies:

```text
python -m pip install -r requirements-test.txt
python -m unittest discover -s tests -v
```

GitHub Actions runs those checks on Ubuntu and Windows for pushes and pull requests.
They validate package metadata, skill discovery, UI metadata, and local references.
They do not run paid model calls or prove agent behavior. The repeatable manual
[behavior scenarios](tests/scenarios.md) cover planning ownership, routing,
authorization, CI freshness, and the human testing boundary.

When modifying the skills, also use the Codex plugin-creator and skill-creator
validators if available. Run behavior trials for changed decisions, inspect their
actual actions, and correct demonstrated failures rather than accumulating rules.
