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
   the [live visual companion](../skills/waypoint-plan/visual-companion.md) by default.
   Its Node
   launcher serves the task-owned preview directory, authenticates HTTP and
   WebSocket access, records choices, and refreshes revisions. Start the companion
   and open its complete keyed URL automatically in the user's requested browser
   or a permitted desktop preview/browser surface. Verify its HTTP response and
   share that URL before requesting visual feedback. The launcher's `--open` may
   open the tab before this verification. Reuse that tab for revisions; do not create
   a new tab for each screen.
3. For a simple one-screen comparison, create a self-contained HTML prototype in
   a task-owned preview directory. Start from [the browser preview](../assets/ui-preview.html)
   when useful. Open it automatically through an available browser/preview tool.
   If file navigation is unsupported, serve only that directory with Python's
   standard loopback server and open its URL. No custom package is needed.

For the first browser preview, target a representative desktop viewport. Respect
an explicitly requested browser and an explicit instruction not to open one. A
missing browser-automation API does not establish that the environment is headless:
use the companion's `--open` launcher or another permitted OS browser mechanism.
Fall back to a verified clickable link only when the environment is actually
headless or remote, opening is disallowed, or launch fails, and state the
limitation. Do not claim the browser opened without evidence, or claim visual
verification unless the rendered page was inspected.
If inline rendering fails or the user sees "Visualization unavailable on this
device", reuse the existing HTML in the browser workflow and provide the verified
URL in the same task, opening it automatically when permitted. Do not repeat the
failed embed, ask for a layout decision against invisible content, or require a
separate request to repair the preview.
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
- When human design review is needed, label the handoff **Design review needed**,
  link the preview, name the decision, and say what happens after approval. Do not
  leave the user guessing whether a preview update requires a reply. Preview
  rendering and revision are reversible actions covered by the
  current task; do not add a new consent gate. If preview preparation is unusually
  costly, explain the tradeoff instead of silently consuming a large budget.
- Revise the same design when feedback calls for it, using clear revision labels.
  Record the selected revision and the user's actual feedback in the plan/checkpoint.
  A radio selection, preview click, or "yes" to the visual choice approves only the
  design. Production implementation still needs an explicit implementation request
  or approval of the concrete implementation plan.
- Once the user answers that review with "ok", "looks good", or equivalent,
  record the selected design and perform the next authorized action in the same
  turn. In an implementation workflow, the review was a checkpoint inside existing
  authority: continue planning, dispatch implementation, and deliver through the
  agreed verification/PR target. Acknowledge briefly in commentary, then act; do not
  end with "next is implementing" or require another "go ahead". If the task was
  explicitly brainstorm-only, design-only, or plan-only, keep that boundary. A
  preview click alone is still not implementation authorization.
- In auto mode, state the selected direction and proceed under existing authority;
  pause only for consequential unresolved choices. No mandatory approval carousel.
- Stop only the preview process this task owns when finished. Keep the selected
  mockup available for the agreed handoff, and never claim a stopped URL is live.

A preview is a design artifact; production code still follows the plan, TDD,
integration review, and CI completion workflow. Opening or revising a preview does
not authorize publication, deployment, or merge.
