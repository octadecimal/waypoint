# Live Visual Companion

Use the live companion by default when browser clicks, automatic reloads, or
several visual revisions will make a design decision easier. Use it when inline
rendering is unavailable or device support is unknown. For a simple one-screen
preview, a standalone HTML file is sufficient.

Preview work is reversible. Existing task authority is enough to render or revise
a preview; do not add a separate consent gate. A click records a design preference.
It never authorizes implementation, publication, deployment, or merge.

## Start a task-owned session

The launcher requires an explicit directory owned by this task. Use a durable,
untracked location and record it in the task checkpoint so the same port and key
can be reused after a restart. Do not serve a repository root, `.git`, credentials,
or another task's directory.

```text
node <plugin-root>/skills/astra-plan/scripts/start-server.cjs start \
  --session-dir <absolute-task-preview-directory> --open
```

The command stays in the foreground so the harness owns its process handle. Run it
with the harness's supported long-running/background command mechanism. It prints:

```json
{"type":"server-started","url":"http://localhost:.../?key=...","screen_dir":".../content","state_dir":".../state"}
```

Use the complete keyed URL. The key authenticates HTTP and WebSocket requests and
is stored with the port in the session directory. Restarting the same directory
reuses both when possible. `--open` uses an argument-array platform launcher; it
does not invoke a shell command string. Use it for the first desktop preview unless
the user explicitly requests no opening or host tool restrictions forbid it. Honor
a requested browser through the permitted browser/preview tool when possible.
Missing browser automation alone does not make the environment headless; the
launcher may still open the OS browser. After launch, verify the complete keyed
URL. Do not claim the browser opened unless the launch result proves it, or claim
visual verification unless the rendered page was inspected. In a genuinely
headless or remote environment, or after a launch failure, provide the verified
URL and state the limitation.

If the server is already running, `start --session-dir <same-directory> --open`
requests browser opening without restarting it or changing its port/key. Omit
`--open` when only checking/reusing the session; revisions reload the existing tab.
`server-existing` alone confirms reuse, not browser opening. Check the reported
browser launch result; OS acceptance is not proof that the page rendered.

The default bind is loopback. A remote/container environment may use `--host` and
`--url-host`, but expose it only through an operator-approved route. The session
key remains required. Set `--idle-timeout-minutes N` when four hours is unsuitable.

## Push screens

Write each screen as a new `.html` file in `screen_dir`. Use semantic, monotonic
names such as `01-layouts.html`, `02-layouts-revised.html`, and `03-waiting.html`.
The newest file by modification time is displayed. A new screen clears the prior
browser event file and all connected browsers reload automatically. Keep and reuse
the original tab throughout the iteration instead of opening revision tabs.

Use an HTML fragment by default. The server wraps it in the bundled responsive
frame and injects the connection/event helper:

```html
<h2>Which navigation is easier to scan?</h2>
<p class="subtitle">Compare the hierarchy at desktop and narrow widths.</p>
<div class="cards">
  <button type="button" class="card" data-choice="sidebar" aria-pressed="false" onclick="toggleSelect(this)">
    <span class="card-image">Sidebar mockup</span>
    <span class="card-body"><strong>Sidebar</strong><span>Persistent section navigation</span></span>
  </button>
  <button type="button" class="card" data-choice="topbar" aria-pressed="false" onclick="toggleSelect(this)">
    <span class="card-image">Top navigation mockup</span>
    <span class="card-body"><strong>Top navigation</strong><span>More content width</span></span>
  </button>
</div>
```

Fragments can use `.options`, `.option`, `.cards`, `.card`, `.mockup`, `.split`,
`.pros-cons`, `.placeholder`, `.mock-nav`, `.mock-sidebar`, `.mock-content`,
`.mock-button`, and `.mock-input`. Add `data-multiselect` to an `.options` or
`.cards` container for multiple selections.

Files beginning with `<!DOCTYPE` or `<html` are served as complete documents;
the helper is still injected before `</body>`. Put local images, CSS, or scripts
beside the screens in `screen_dir` and reference them through `/files/<name>`.
Only regular single-link files directly inside that directory are served. Symlinks,
hard links, dotfiles, nested paths, and traversal attempts are rejected.

Keep previews self-contained and non-sensitive. Do not add analytics, remote fonts,
remote images, credentials, or live product writes. Use semantic controls, visible
focus, readable contrast, responsive layout, and realistic sample states. State
which depicted interactions are illustrative.

## Read feedback and iterate

Clicks on elements with `data-choice` append JSON lines to `state_dir/events`:

```json
{"type":"click","choice":"sidebar","text":"Sidebar Persistent section navigation","timestamp":1706000101}
```

Read the event file after the user replies in chat. Chat is the authoritative
feedback; events add structured context and may show exploration before a final
choice. A full document can send a custom choice with:

```js
window.astraPreview.choice('compact', { revision: 2 });
```

That records the same stable `choice` field as a click:

```json
{"type":"choice","choice":"compact","revision":2,"timestamp":1706000115}
```

Revise the same design question until resolved, then record the selected revision
and the user's stated reasoning in the plan/checkpoint. When work moves back to a
text question, push a small waiting screen so the browser does not show a stale
choice. In auto mode, state the selected direction and continue within existing
authority when no consequential uncertainty remains.

## Health, restart, and stop

Before sharing an existing URL, check it:

```text
node <plugin-root>/skills/astra-plan/scripts/start-server.cjs status \
  --session-dir <absolute-task-preview-directory>
```

If stopped, run `start` again with the same directory. Open tabs reconnect and
reload through the stored key. The helper shows a paused overlay during a longer
outage and uses bounded exponential reconnect delays. A crashed launcher can
leave a start lock; the next start reclaims it only when its recorded process is
demonstrably gone. A live or ambiguous owner remains untouched.

Stop only this task's authenticated server:

```text
node <plugin-root>/skills/astra-plan/scripts/start-server.cjs stop \
  --session-dir <absolute-task-preview-directory>
```

The launcher reads that directory's private server record and calls its keyed stop
endpoint. It does not scan ports or kill by process name. Preview files and events
remain for review; remove them only under the repository's ownership policy.

If browser automation is unavailable, still attempt permitted OS browser opening
as described above; the missing automation limits visual inspection and interaction,
not opening. If opening is unavailable or fails, share the verified URL and state
the limitation. Never claim a preview was visually verified when only its HTTP
response or source was checked.
