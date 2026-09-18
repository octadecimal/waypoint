# Astra Workflow

A private Codex plugin that replaces all 14 Superpowers workflows with Codex-native
planning, execution, debugging, testing, reviews, worktrees, skill authoring, and
completion. Astra owns planning and design; economical subagents do bounded
implementation; authorized PR delivery continues until the current revision passes CI.

## Use

Start a new Codex thread after installing. Select a skill in the composer, or use:

```text
Use $astra-plan to brainstorm export filters. Do not implement yet.
```

```text
Use $astra-plan in auto mode to implement export filters. Use cheaper workers
where the result is easy to verify.
```

```text
Use $astra-complete to finish this branch and prepare it for my hands-on testing.
```

The two main entry points are [astra-plan](skills/astra-plan/SKILL.md) for new
work and [astra-complete](skills/astra-complete/SKILL.md) for finishing a branch.
[using-astra-workflow](skills/using-astra-workflow/SKILL.md) routes debugging,
TDD, planning, execution, parallel work, reviews, verification, worktrees, and
skill authoring to the appropriate standalone skill. The
[full replacement map](references/superpowers-parity.md) lists every original
workflow, its replacement, preserved helpers, and intentional behavior changes.

Collaborative mode is the default: approve the concrete implementation plan once.
That approval includes commit, push, an open or updated PR, and current-head green
CI unless the user explicitly says plan-only, local-only, no-push, or no-PR. A
normal "yes" or "go ahead" to implementation is enough; do not add a separate PR
approval gate. Auto mode proceeds within the requested scope without routine
approval prompts. Design or mockup approval alone does not authorize production
implementation, and automatic skill selection grants no authority by itself. See
[delivery authority and CI completion](references/ci-completion.md).

The skill uses Astra in the main conversation when available, otherwise creates
an Astra planning child automatically. Astra also creates and revises UI designs
and mockups, including their HTML/CSS/interaction code. Routine production tests
and implementation edits go automatically to an explicitly selected economical worker, including small or
sequential tasks. The same worker owns the coupled red/green cycle; Astra
coordinates and verifies. Model choices adapt to the live allowlist; see
[routing](references/model-routing.md). A skill cannot switch the main model,
guarantee model access, or measure savings without usage evidence.

After implementation is requested or approved, ordinary CI failures stay with the
agent until fixed or genuinely blocked. Once the PR is open, the agent starts the
applicable feature-worktree test stack and prepares a brief testing checklist while
CI runs. The normal handoff waits for both current-head green CI and a healthy stack
serving that revision, then gives the clickable local URL and user actions with
expected results. Explicit local-only or no-push/no-PR instructions keep publication
local but still allow local testing unless the user says not to run it. Merge
requires hands-on testing and explicit approval of the current revision. This plugin
does not change GitHub branch protection; repositories retain their own enforcement
and merge rules.

## Preview UI designs

```text
Use $astra-plan to compare two settings-page layouts. Show previews before we
decide; do not implement yet.
```

Use inline mockups when the current client is known to support them; otherwise
use a browser preview and open it automatically on a supported desktop. Missing
browser automation does not prevent the companion from opening the default browser.
Failed embeds automatically fall back to an accessible
browser/file link before asking for visual feedback. The bundled live companion
preserves browser mockups, fragment themes, click feedback, automatic refresh,
authenticated sessions, and reconnect behavior. Its Node launcher runs on Windows
and Unix without Bash. It serves only a task-owned preview directory on loopback
by default, retains artifacts, and has no promotional telemetry.

For a simple comparison, the standalone [example](assets/ui-preview.html) uses
native radio inputs to compare sidebar and top navigation without JavaScript.
See the [preview workflow](references/ui-previews.md) for choosing a surface,
revision feedback, responsive checks, and honest validation limits. Preview clicks
express design preferences, never permission to implement or merge.

## Optional Chrome DevTools MCP

Astra Workflow automatically uses an available
[Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) for
evidence-based frontend debugging and applicable browser health checks. It is an
external MCP configured separately in Codex, not a server bundled or registered by
this plugin. After adding or changing the MCP configuration, start a new Codex
thread if the tools are not present in the current thread's live schema.

Browser checks use an isolated task-owned browser and local or fake application
data. They do not attach to normal browser profiles or consume provider quota, and
a headless check does not replace opening a visible preview when the workflow calls
for one.

## Replace Superpowers completely

Install and validate this plugin first, then uninstall the original through Codex:

```text
codex plugin remove superpowers@claude-plugins-official
```

Use the actual installed marketplace identifier if different. Do not manually
remove plugin-cache files. Preserve unrelated plugins and personal instructions.
Route legacy names through the [replacement map](references/superpowers-parity.md):
`brainstorming` becomes `astra-plan`, `finishing-a-development-branch` becomes
`astra-complete`, and `using-superpowers` becomes `using-astra-workflow`; all other
skill names retain their names under the `astra-workflow` namespace.

Add this to personal Codex instructions (`~/.codex/AGENTS.md`), preserving any
existing content:

```text
For development work, use astra-workflow:using-astra-workflow to select relevant
skills. Astra Workflow fully replaces Superpowers; route legacy skill references
through its replacement map. Preserve prior decisions and plan-only, local-only,
and auto execution boundaries. Do not reinstall Superpowers or duplicate its gates.
```

Start a new thread and verify all 14 Astra skills are available and the original
plugin's skills are absent. Existing threads retain already-loaded instructions.
The original MIT notice is retained in [licenses/superpowers-MIT.txt](licenses/superpowers-MIT.txt);
see the replacement map for source version and derivation scope.

## Install locally

This repository is private. Authenticate Git access as an account with access to
`octadecimal/astra-workflow`. The plugin uses Codex's existing tools and account;
it contains no MCP server, session hooks, or paid API integration. Node.js 22+ is
needed only for the live preview companion and JavaScript helper tools. Python
3.12+ supports validation and the portable execution/debugging helpers. Graphviz
is optional and needed only to render skill-authoring diagrams.
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

Validation uses Python 3.12+, development-only PyYAML, and Node.js 22+:

```text
python -m pip install -r requirements-test.txt
python -m unittest discover -s tests -v
node --test tests/preview-companion.test.cjs
```

GitHub Actions runs those checks on Ubuntu and Windows for pushes and pull requests.
They validate the complete skill catalogue, metadata, local references, and runnable
preview/execution helpers.
They do not run paid model calls or prove agent behavior. The repeatable manual
[behavior scenarios](tests/scenarios.md) cover planning ownership, routing,
authorization, CI freshness, and the human testing boundary.

When modifying the skills, also use the Codex plugin-creator and skill-creator
validators if available. Run behavior trials for changed decisions, inspect their
actual actions, and correct demonstrated failures rather than accumulating rules.
