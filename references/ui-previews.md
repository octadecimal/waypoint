# UI mockup previews

Show the proposed interface when seeing it helps resolve a design question. Use
wireframes for structure and polished mockups for visual hierarchy. Carry forward
the product's known design system and use realistic, non-sensitive sample content.
Offer two or three meaningfully different alternatives when a choice would help;
do not manufacture alternatives for an already settled design.

## Choose a preview surface

1. Use inline visualization only when the current client is known to render it,
   or the user explicitly requests that surface. A listed `visualize` skill or
   successful artifact creation does not prove device support. When support is
   unknown, use a browser preview instead. Follow the inline tool's instructions
   when using it; this plugin does not depend on it.
2. For interactive alternatives, recorded selections, or iterative UI design, use
   the [live visual companion](../skills/astra-plan/visual-companion.md). Its Node
   launcher serves the task-owned preview directory, authenticates HTTP and
   WebSocket access, records choices, and refreshes revisions. Verify its HTTP
   response and give the user the complete keyed browser URL before requesting
   visual feedback. Browser automation is optional; its absence does not prevent
   serving a preview for the user to open.
3. For a simple one-screen comparison, create a self-contained HTML prototype in
   a task-owned preview directory. Start from [the browser preview](../assets/ui-preview.html)
   when useful. Open it through an available browser/preview tool or give the user
   a local file link. If file navigation is unsupported, serve only that directory
   with Python's standard loopback server. No custom package is needed.
If inline rendering fails or the user sees "Visualization unavailable on this
device", reuse the existing HTML in the browser workflow and provide the verified
URL in the same task. Do not repeat the failed embed, ask for a layout decision
against invisible content, or require a separate request to repair the preview.
If serving is unavailable too, provide a real clickable HTML file link and explain
the limitation. A filename alone is not a delivered preview. In remote environments,
use an already-authorized route the user's browser can reach; do not present a
remote loopback URL as locally accessible. Preserve the plan-only boundary during
recovery. HTTP success is reachability evidence, not browser rendering evidence.

## Prototype and feedback loop

- State one design question and label the alternatives and revision clearly.
  Keep prototype framing outside the depicted product. Put actual product
  navigation and controls where users would expect them.
- Keep the mockup self-contained: semantic controls, visible focus, readable
  contrast, responsive layout, and sample state. No live writes, credentials,
  analytics, or external data requests. Buttons inside the depicted product may
  illustrate appearance; identify any interactions that are not implemented.
- Keep draft files outside tracked production paths, such as a dedicated temp
  preview directory or an explicitly ignored task directory. Serve only that
  directory, never the repository root or `.git` containing unrelated data.
  Bind to loopback; do not expose or publicly deploy the mockup implicitly.
- Inspect browser previews at a representative desktop and narrow width where
  supported. Exercise the interactions used to make the decision. For an inline
  surface, follow its own verification rules. Report limitations honestly.
- Share the preview and ask for the specific visual decision in collaborative
  mode. Preview rendering and revision are reversible actions covered by the
  current task; do not add a new consent gate. If preview preparation is unusually
  costly, explain the tradeoff instead of silently consuming a large budget.
- Revise the same design when feedback calls for it, using clear revision labels.
  Record the selected revision and the user's actual feedback in the plan/checkpoint.
  A radio selection or preview click alone is not approval to implement, publish,
  or merge. Use explicit chat feedback or a supported confirmed feedback action.
- In auto mode, state the selected direction and proceed under existing authority;
  pause only for consequential unresolved choices. No mandatory approval carousel.
- Stop only the preview process this task owns when finished. Keep the selected
  mockup available for the agreed handoff, and never claim a stopped URL is live.

A preview is a design artifact; production code still follows the plan, TDD,
integration review, and CI completion workflow.
