# Astra Workflow

A private Codex plugin for taking development work from an idea to a tested pull
request. Astra owns planning and visual design; explicitly selected economical
subagents implement and test the changes. The coordinator opens the PR, fixes CI
failures, and prepares a running application for your hands-on testing.

It replaces all 14 Superpowers workflows: brainstorming, planning, execution,
delegation, TDD, debugging, reviews, worktrees, verification, skill authoring, and
completion. See the [replacement map](references/superpowers-parity.md) for the
complete skill inventory and preserved helpers.

## How it works

1. **Understand and plan.** Astra investigates the request, resolves meaningful
   choices, and scales the plan to the size of the change.
2. **Preview when useful.** For UI work, Astra creates and revises mockups. Browser
   previews open automatically when supported; choosing a mockup selects a design.
3. **Implement and verify.** A suitable economical worker owns the focused
   red/green test cycle and implementation. The coordinator reviews and integrates
   the work, runs appropriate checks, and preserves unrelated changes.
4. **Open the PR and own CI.** An implementation request or approval includes
   intended commits, push, and PR creation or updates. The agent diagnoses and fixes
   ordinary failures until expected checks pass for the current head.
5. **Prepare testing while CI runs.** For a runnable UI or service, start or safely
   reuse the feature-worktree stack and prepare a short user checklist. If a repair
   changes the revision, refresh and recheck the stack.
6. **Hand off, then merge with approval.** Once CI and the applicable stack are
   healthy at the same revision, provide the PR, working URL, and usually two to
   four user actions with expected results. Keep the stack and worktree available.
   Merge follows your hands-on testing and explicit approval of that revision.

Docs and other work without a runnable surface get a focused review walkthrough
instead of an invented URL. A genuine access, infrastructure, or scope blocker is
reported explicitly; pending CI or a broken stack is not a successful handoff.

Long-running work keeps a local [delivery checkpoint](references/delivery-checkpoint.md)
with authorization, CI evidence, stack URL, process and data ownership, and served
revision. Resuming checks those facts against live state. Progress updates focus on
meaningful changes; required host heartbeats stay brief.

## Use natural prompts

No special phrase or skill name is required. The skills allow automatic selection
for matching development tasks. Add the [personal instructions below](#replace-superpowers-completely)
to make Astra Workflow your default across repositories, then start a new thread.

For example:

- “The session panel feels busy. Can we simplify it?”
- “Implement option A.”
- “Fix the loading indicator that never finishes.”
- “Finish this branch and get it ready for me to test.”

Explicit skill selection remains available in the composer or by mentioning a
skill when you want a particular entry point:

| Need | Entry point |
| --- | --- |
| Brainstorm, plan, or design a UI | [Astra Plan](skills/astra-plan/SKILL.md), `$astra-plan` |
| Diagnose a failure before editing | [Systematic Debugging](skills/systematic-debugging/SKILL.md), `$systematic-debugging` |
| Finish a branch, repair CI, or perform an approved merge | [Astra Complete](skills/astra-complete/SKILL.md), `$astra-complete` |
| Select the relevant development workflow | [Using Astra Workflow](skills/using-astra-workflow/SKILL.md), `$using-astra-workflow` |

## Control how far it goes

Collaborative mode is the default: discuss material choices and present a concrete
plan. If implementation was already requested or approved, continue without asking
for the same approval again. In auto mode, state the plan and proceed within the
authorized scope.

“Brainstorm only” or “do not implement” stops at a proposal. “Keep it local,”
“no push,” and “no PR” prevent publication. Local-only work can still run a local
test stack; “do not run it” prevents startup. Choosing a mockup alone does not
authorize implementation. Merge and deployment remain separate decisions.

See [delivery authority and CI completion](references/ci-completion.md) for the
full authorization and evidence rules. Repository instructions, available tools,
credentials, and explicit task limits still apply.

## Model routing

Astra owns architecture, planning, UI design, mockup authoring, and interpretation
of visual feedback. If the coordinator is not Astra, it delegates those tasks to
an available Astra planner/designer.

Routine implementation, tests, and bounded investigations use an explicitly
selected capable worker. Luna is a starting candidate for narrow tasks; Terra or
Sol for broader implementation; harder diagnosis and review may use stronger
models. The same worker owns coupled tests and implementation. The coordinator
owns integration, publication, and the CI loop.

Selection follows the live model allowlist and task difficulty; these are routing
candidates, not a fixed price ranking or a promise of measured savings. A skill
cannot change the main conversation's model or guarantee access to another model.
See [model routing](references/model-routing.md) for the detailed policy.

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

A fresh clone uses the default `main` branch. Do not clone over an existing
checkout or worktree.

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
authorization, CI freshness, and the human testing boundary. Use the
[regression trial kit](tests/behavioral-regressions.md) for repeatable agent trials
with recorded tool evidence and explicit simulation limits.

When modifying the skills, also use the Codex plugin-creator and skill-creator
validators if available. Run behavior trials for changed decisions, inspect their
actual actions, and correct demonstrated failures rather than accumulating rules.
