# UI mockup previews

Show the proposed interface when seeing it helps resolve a design question. Use
wireframes for structure and polished mockups for visual hierarchy. Carry forward
the product's known design system and use realistic, non-sensitive sample content.
Offer two or three meaningfully different alternatives when a choice would help;
do not manufacture alternatives for an already settled design.

## Choose a preview surface

1. If the session offers an inline visualization/mockup capability, use it and
   follow its current instructions. In Codex, an available `visualize` skill can
   render interactive mockups in the conversation. This is optional integration,
   not a dependency on that plugin. Use its host controls for design variations
   when supported; do not assume a browser click sends feedback to the agent.
2. Otherwise create a self-contained HTML prototype in a task-owned preview
   directory. Start from [the browser preview](../assets/ui-preview.html) when it
   helps, then adapt the content and styles to the actual question. The bundled
   sample changes between sidebar and top navigation using native controls.
   For a host that takes HTML fragments, author a fragment using that host's
   contract instead of sending this full standalone document unchanged.
3. Open the standalone prototype through an available browser/preview tool, or
   give the user a local file link. If file navigation is unsupported, use the
   repository's existing preview service or Python's standard static server:
   `python -u -m http.server 0 --bind 127.0.0.1 --directory <preview-directory>`.
   Capture the actual assigned port and keep the process in the harness's
   supported background session. Verify the exact preview URL responds before
   presenting it. No custom server or package installation is needed.

If a preview tool is missing, use the next available surface. If no renderer is
available, provide the inspectable HTML and explain what remains unpreviewed.
Do not claim the user can see a preview that the host cannot display.

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
  mode. A prior request for previews is sufficient; do not ask permission again
  merely to render the next revision. If preview preparation is unusually costly,
  explain the tradeoff instead of silently consuming a large budget.
- Revise the same design when feedback calls for it, using clear revision labels.
  Record the selected revision and the user's actual feedback in the plan/checkpoint.
  A radio selection or preview click alone is not approval to implement, publish,
  or merge. Use explicit chat feedback or a supported confirmed feedback action.
- In auto mode, state the selected direction and proceed under existing authority;
  pause only for consequential unresolved choices. No mandatory approval carousel.
- Stop only the preview process this task owns when finished. Keep the selected
  mockup available for the agreed handoff, and never claim a stopped URL is live.

This workflow does not use Superpowers scripts, browser event files, or its preview
server. A preview is a design artifact; production code still follows the plan,
TDD, integration review, and CI completion workflow.
