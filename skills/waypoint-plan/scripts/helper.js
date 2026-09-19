(function () {
  const MIN_RECONNECT_MS = 500;
  const MAX_RECONNECT_MS = 30000;
  const TOMBSTONE_AFTER_MS = 15000;

  function nextReconnectDelay(current, max) {
    return Math.min(current * 2, max);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { nextReconnectDelay, MIN_RECONNECT_MS, MAX_RECONNECT_MS, TOMBSTONE_AFTER_MS };
  }
  if (typeof window === 'undefined') return;

  let ws = null;
  let eventQueue = [];
  let reconnectDelay = MIN_RECONNECT_MS;
  let reconnectTimer = null;
  let disconnectedSince = null;
  let everConnected = false;
  let tombstoneShown = false;

  function sessionKey() {
    try {
      return window.sessionStorage && window.sessionStorage.getItem('waypoint-preview-session-key');
    } catch (_) {
      return null;
    }
  }

  function websocketUrl() {
    const key = sessionKey();
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    return protocol + window.location.host + (key ? '/?key=' + encodeURIComponent(key) : '');
  }

  function reloadAfterRecovery() {
    const key = sessionKey();
    if (key) window.location.replace('/?key=' + encodeURIComponent(key));
    else window.location.reload();
  }

  function setStatus(state) {
    const el = document.querySelector('.status');
    if (!el) return;
    const states = {
      connecting: ['Connecting…', 'var(--text-tertiary)'],
      connected: ['Connected', 'var(--success)'],
      reconnecting: ['Reconnecting…', 'var(--warning)'],
      disconnected: ['Disconnected', 'var(--error)']
    };
    const [label, color] = states[state] || states.disconnected;
    el.textContent = label;
    el.style.setProperty('--status-color', color);
  }

  function showTombstone() {
    if (tombstoneShown) return;
    tombstoneShown = true;
    const el = document.createElement('div');
    el.id = 'waypoint-preview-paused';
    el.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;' +
      'align-items:center;justify-content:center;padding:2rem;text-align:center;' +
      'background:rgba(20,20,22,.92);color:#f5f5f7;font-family:system-ui,sans-serif';
    el.innerHTML = '<div style="max-width:480px"><h2 style="margin:0 0 .5rem">Preview paused</h2>' +
      '<p style="margin:0;opacity:.85">Ask your coding agent to restart this preview. ' +
      'The page reconnects automatically.</p></div>';
    if (document.body) document.body.appendChild(el);
  }

  function connect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    setStatus(everConnected ? 'reconnecting' : 'connecting');
    ws = new WebSocket(websocketUrl());

    ws.onopen = () => {
      const recovered = tombstoneShown;
      everConnected = true;
      disconnectedSince = null;
      reconnectDelay = MIN_RECONNECT_MS;
      tombstoneShown = false;
      setStatus('connected');
      eventQueue.forEach(event => ws.send(JSON.stringify(event)));
      eventQueue = [];
      if (recovered) reloadAfterRecovery();
    };

    ws.onmessage = message => {
      let data;
      try { data = JSON.parse(message.data); } catch (_) { return; }
      if (data.type === 'reload') window.location.reload();
    };

    ws.onclose = () => {
      ws = null;
      if (disconnectedSince === null) disconnectedSince = Date.now();
      if (Date.now() - disconnectedSince >= TOMBSTONE_AFTER_MS) {
        setStatus('disconnected');
        showTombstone();
      } else {
        setStatus('reconnecting');
      }
      reconnectTimer = setTimeout(connect, reconnectDelay);
      reconnectDelay = nextReconnectDelay(reconnectDelay, MAX_RECONNECT_MS);
    };
    ws.onerror = () => { try { ws.close(); } catch (_) {} };
  }

  function sendEvent(event) {
    event.timestamp = Date.now();
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(event));
    else eventQueue.push(event);
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('[data-choice]');
    if (!target) return;
    sendEvent({
      type: 'click',
      text: target.textContent.trim(),
      choice: target.dataset.choice,
      id: target.id || null
    });
  });

  window.selectedChoice = null;
  function setSelected(element, selected) {
    if (selected) element.classList.add('selected');
    else element.classList.remove('selected');
    if (typeof element.setAttribute === 'function') element.setAttribute('aria-pressed', String(selected));
  }

  window.toggleSelect = function (element) {
    const container = element.closest('.options') || element.closest('.cards');
    const multi = container && container.dataset.multiselect !== undefined;
    if (container && !multi) {
      container.querySelectorAll('.option, .card').forEach(option => setSelected(option, false));
    }
    setSelected(element, multi ? !element.classList.contains('selected') : true);
    window.selectedChoice = element.dataset.choice;
  };

  window.waypointPreview = {
    send: sendEvent,
    choice: (choice, metadata = {}) => sendEvent({ ...metadata, type: 'choice', choice })
  };

  connect();
})();
