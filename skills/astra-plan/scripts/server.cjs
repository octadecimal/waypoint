const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');

const OPCODES = { TEXT: 0x01, CLOSE: 0x08, PING: 0x09, PONG: 0x0a };
const WS_MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const MAX_FRAME_PAYLOAD_BYTES = 10 * 1024 * 1024;
const DEFAULT_IDLE_TIMEOUT_MS = 4 * 60 * 60 * 1000;
const MIME_TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml'
};

function computeAcceptKey(clientKey) {
  return crypto.createHash('sha1').update(clientKey + WS_MAGIC).digest('base64');
}

function encodeFrame(opcode, payload) {
  const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
  let header;
  if (body.length < 126) {
    header = Buffer.from([0x80 | opcode, body.length]);
  } else if (body.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(body.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(body.length), 2);
  }
  return Buffer.concat([header, body]);
}

function decodeFrame(buffer) {
  if (buffer.length < 2) return null;
  const opcode = buffer[0] & 0x0f;
  const masked = (buffer[1] & 0x80) !== 0;
  let payloadLength = buffer[1] & 0x7f;
  let offset = 2;
  if (!masked) throw new Error('Client frames must be masked');
  if (payloadLength === 126) {
    if (buffer.length < 4) return null;
    payloadLength = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLength === 127) {
    if (buffer.length < 10) return null;
    const extended = buffer.readBigUInt64BE(2);
    if (extended > BigInt(MAX_FRAME_PAYLOAD_BYTES)) throw new Error('WebSocket frame payload exceeds maximum');
    payloadLength = Number(extended);
    offset = 10;
  }
  if (payloadLength > MAX_FRAME_PAYLOAD_BYTES) throw new Error('WebSocket frame payload exceeds maximum');
  const totalLength = offset + 4 + payloadLength;
  if (buffer.length < totalLength) return null;
  const mask = buffer.subarray(offset, offset + 4);
  const source = buffer.subarray(offset + 4, totalLength);
  const payload = Buffer.alloc(payloadLength);
  for (let index = 0; index < payloadLength; index += 1) payload[index] = source[index] ^ mask[index % 4];
  return { opcode, payload, bytesConsumed: totalLength };
}

function browserLauncherForPlatform(url, options = {}) {
  const platform = options.platform || process.platform;
  const release = options.osRelease || os.release();
  const env = options.env || process.env;
  const isWsl = platform === 'linux' && /microsoft/i.test(release);
  if (platform === 'darwin') return { bin: 'open', args: [url] };
  if (platform === 'win32' || isWsl) return { bin: 'rundll32.exe', args: ['url.dll,FileProtocolHandler', url] };
  if (env.DISPLAY || env.WAYLAND_DISPLAY) return { bin: 'xdg-open', args: [url] };
  return null;
}

function timingSafeEqualString(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function parseCookies(header) {
  const cookies = {};
  for (const part of String(header || '').split(';')) {
    const separator = part.indexOf('=');
    if (separator > 0) cookies[part.slice(0, separator).trim()] = part.slice(separator + 1).trim();
  }
  return cookies;
}

function urlHost(host) {
  const value = String(host);
  if (value.startsWith('[') && value.endsWith(']')) return value;
  return value.includes(':') ? `[${value}]` : value;
}

function securityHeaders(extra = {}) {
  return {
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "frame-ancestors 'none'",
    'Cross-Origin-Resource-Policy': 'same-origin',
    ...extra
  };
}

function isFullDocument(html) {
  const start = html.trimStart().toLowerCase();
  return start.startsWith('<!doctype') || start.startsWith('<html');
}

function bootstrapPage(key) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Opening preview</title></head><body><script>try { sessionStorage.setItem('astra-preview-session-key', ${JSON.stringify(String(key))}); } catch (_) {} location.replace('/');</script></body></html>`;
}

function waitingPage() {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Astra UI Preview</title><style>body{font:16px system-ui,sans-serif;max-width:50rem;margin:4rem auto;padding:0 1rem;color:#444}</style></head><body><h1>Astra UI Preview</h1><p>Waiting for the agent to add a screen…</p></body></html>';
}

const FORBIDDEN_PAGE = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Session key required</title></head><body><h1>Session key required</h1><p>Open the complete preview URL from your coding agent, including its <code>?key=…</code> value.</p></body></html>';

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function readStoredPort(file) {
  try {
    const value = Number(fs.readFileSync(file, 'utf8').trim());
    return Number.isInteger(value) && value >= 0 && value < 65536 ? value : 0;
  } catch (_) {
    return 0;
  }
}

function readStoredToken(file) {
  try {
    const value = fs.readFileSync(file, 'utf8').trim();
    if (/^[0-9a-f]{32,}$/i.test(value)) return value;
  } catch (_) {}
  return generateToken();
}

function writePrivate(file, value) {
  fs.writeFileSync(file, String(value), { mode: 0o600 });
  try { fs.chmodSync(file, 0o600); } catch (_) {}
}

function createPreviewServer(options) {
  const sessionDir = path.resolve(options.sessionDir);
  const contentDir = path.join(sessionDir, 'content');
  const stateDir = path.join(sessionDir, 'state');
  const portFile = path.join(stateDir, 'port');
  const tokenFile = path.join(stateDir, 'token');
  const infoFile = path.join(stateDir, 'server-info');
  const stoppedFile = path.join(stateDir, 'server-stopped');
  const eventsFile = path.join(stateDir, 'events');
  const host = options.host || '127.0.0.1';
  const displayHost = options.urlHost || (host === '127.0.0.1' ? 'localhost' : host);
  const idleTimeoutMs = Number(options.idleTimeoutMs) > 0 ? Number(options.idleTimeoutMs) : DEFAULT_IDLE_TIMEOUT_MS;
  const lifecycleCheckMs = Number(options.lifecycleCheckMs) > 0 ? Number(options.lifecycleCheckMs) : 60000;
  const ownerPid = Number(options.ownerPid) > 0 ? Number(options.ownerPid) : null;
  const requestedPort = options.port === undefined ? readStoredPort(portFile) : Number(options.port);
  const token = options.token || readStoredToken(tokenFile);
  const frameTemplate = fs.readFileSync(path.join(__dirname, 'frame-template.html'), 'utf8');
  const helperScript = fs.readFileSync(path.join(__dirname, 'helper.js'), 'utf8');
  const helperInjection = `<script>\n${helperScript}\n</script>`;
  const clients = new Set();
  const debounceTimers = new Map();
  let lastActivity = Date.now();
  let browserOpened = false;
  let watcher;
  let lifecycleTimer;
  let stopping = false;
  let actualPort = requestedPort;
  let cookieName = 'astra-preview-key';

  fs.mkdirSync(contentDir, { recursive: true, mode: 0o700 });
  fs.mkdirSync(stateDir, { recursive: true, mode: 0o700 });
  try { fs.unlinkSync(stoppedFile); } catch (_) {}

  function touchActivity() { lastActivity = Date.now(); }
  function previewUrl() { return `http://${urlHost(displayHost)}:${actualPort}/?key=${token}`; }
  function requestUrl(req) {
    try { return new URL(req.url, `http://${req.headers.host || 'localhost'}`); } catch (_) { return null; }
  }
  function isAuthorized(req) {
    const parsed = requestUrl(req);
    if (parsed && parsed.searchParams.has('key')) return timingSafeEqualString(parsed.searchParams.get('key'), token);
    return timingSafeEqualString(parseCookies(req.headers.cookie)[cookieName] || '', token);
  }
  function isAllowedOrigin(req) {
    const origin = req.headers.origin;
    return !origin || Boolean(req.headers.host && origin === `http://${req.headers.host}`);
  }
  function regularContentFile(file) {
    try {
      const stat = fs.lstatSync(file);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1) return false;
      const root = fs.realpathSync(contentDir);
      return fs.realpathSync(file).startsWith(root + path.sep);
    } catch (_) {
      return false;
    }
  }
  function newestScreen() {
    return fs.readdirSync(contentDir)
      .filter(name => !name.startsWith('.') && name.endsWith('.html'))
      .map(name => {
        const file = path.join(contentDir, name);
        return regularContentFile(file) ? { file, modified: fs.statSync(file).mtimeMs } : null;
      })
      .filter(Boolean)
      .sort((left, right) => right.modified - left.modified)[0]?.file || null;
  }
  function renderScreen() {
    const screen = newestScreen();
    const raw = screen ? fs.readFileSync(screen, 'utf8') : waitingPage();
    const html = screen && !isFullDocument(raw) ? frameTemplate.replace('<!-- CONTENT -->', raw) : raw;
    return html.includes('</body>') ? html.replace('</body>', `${helperInjection}\n</body>`) : html + helperInjection;
  }
  function send(res, status, body, contentType = 'text/plain; charset=utf-8') {
    res.writeHead(status, securityHeaders({ 'Content-Type': contentType }));
    res.end(body);
  }
  function handleRequest(req, res) {
    if (!isAuthorized(req)) return send(res, 403, FORBIDDEN_PAGE, 'text/html; charset=utf-8');
    touchActivity();
    res.setHeader('Set-Cookie', `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/`);
    const parsed = requestUrl(req);
    if (!parsed) return send(res, 400, 'Bad request');
    if (req.method === 'GET' && parsed.pathname === '/' && parsed.searchParams.has('key')) {
      return send(res, 200, bootstrapPage(parsed.searchParams.get('key')), 'text/html; charset=utf-8');
    }
    if (req.method === 'GET' && parsed.pathname === '/') return send(res, 200, renderScreen(), 'text/html; charset=utf-8');
    if (req.method === 'GET' && parsed.pathname === '/__health') return send(res, 200, JSON.stringify({ status: 'ok', port: actualPort }), 'application/json');
    if (req.method === 'POST' && parsed.pathname === '/__stop') {
      if (!isAllowedOrigin(req)) return send(res, 403, 'Forbidden');
      send(res, 202, JSON.stringify({ status: 'stopping' }), 'application/json');
      setImmediate(() => stop('authenticated stop'));
      return;
    }
    if (req.method === 'GET' && parsed.pathname.startsWith('/files/')) {
      let name;
      try { name = decodeURIComponent(parsed.pathname.slice('/files/'.length)); } catch (_) { return send(res, 404, 'Not found'); }
      if (!name || name.startsWith('.') || name.includes('/') || name.includes('\\')) return send(res, 404, 'Not found');
      const file = path.join(contentDir, name);
      if (!regularContentFile(file)) return send(res, 404, 'Not found');
      return send(res, 200, fs.readFileSync(file), MIME_TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
    }
    return send(res, 404, 'Not found');
  }
  function handleMessage(text) {
    let event;
    try { event = JSON.parse(text); } catch (_) { return; }
    touchActivity();
    process.stdout.write(JSON.stringify({ source: 'user-event', ...event }) + '\n');
    if (event && typeof event.choice === 'string' && event.choice) {
      fs.appendFileSync(eventsFile, JSON.stringify(event) + '\n');
    }
  }
  function handleUpgrade(req, socket) {
    const parsed = requestUrl(req);
    if (!parsed || parsed.pathname !== '/' || !isAuthorized(req) || !isAllowedOrigin(req)) return socket.destroy();
    const clientKey = req.headers['sec-websocket-key'];
    if (!clientKey) return socket.destroy();
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + computeAcceptKey(clientKey) + '\r\n\r\n');
    let buffer = Buffer.alloc(0);
    clients.add(socket);
    socket.on('data', chunk => {
      buffer = Buffer.concat([buffer, chunk]);
      while (buffer.length) {
        let frame;
        try { frame = decodeFrame(buffer); } catch (_) { socket.end(encodeFrame(OPCODES.CLOSE, Buffer.alloc(0))); clients.delete(socket); return; }
        if (!frame) return;
        buffer = buffer.subarray(frame.bytesConsumed);
        if (frame.opcode === OPCODES.TEXT) handleMessage(frame.payload.toString());
        else if (frame.opcode === OPCODES.PING) socket.write(encodeFrame(OPCODES.PONG, frame.payload));
        else if (frame.opcode === OPCODES.CLOSE) { socket.end(encodeFrame(OPCODES.CLOSE, Buffer.alloc(0))); clients.delete(socket); return; }
        else if (frame.opcode !== OPCODES.PONG) { socket.end(encodeFrame(OPCODES.CLOSE, Buffer.from([0x03, 0xeb]))); clients.delete(socket); return; }
      }
    });
    socket.on('close', () => clients.delete(socket));
    socket.on('error', () => clients.delete(socket));
  }
  function broadcast(message) {
    const frame = encodeFrame(OPCODES.TEXT, Buffer.from(JSON.stringify(message)));
    for (const client of clients) {
      try { client.write(frame); } catch (_) { clients.delete(client); }
    }
  }
  function maybeOpenBrowser() {
    if (browserOpened || !options.openBrowser || clients.size || !['127.0.0.1', 'localhost', '::1'].includes(host)) return;
    browserOpened = true;
    const launcher = browserLauncherForPlatform(previewUrl());
    if (launcher) {
      try { execFile(launcher.bin, launcher.args, () => {}); } catch (_) {}
    }
  }
  function stop(reason) {
    if (stopping) return;
    stopping = true;
    process.stdout.write(JSON.stringify({ type: 'server-stopped', reason }) + '\n');
    try { fs.unlinkSync(infoFile); } catch (_) {}
    writePrivate(stoppedFile, JSON.stringify({ reason, timestamp: Date.now() }) + '\n');
    if (watcher) watcher.close();
    if (lifecycleTimer) clearInterval(lifecycleTimer);
    for (const timer of debounceTimers.values()) clearTimeout(timer);
    for (const client of clients) { try { client.destroy(); } catch (_) {} }
    server.close(() => { if (options.exitOnStop) process.exit(0); });
  }
  function ownerAlive() {
    if (!ownerPid) return true;
    try { process.kill(ownerPid, 0); return true; } catch (error) { return error.code === 'EPERM'; }
  }

  const server = http.createServer(handleRequest);
  server.on('upgrade', handleUpgrade);

  async function start() {
    const knownScreens = new Set(fs.readdirSync(contentDir).filter(name => !name.startsWith('.') && name.endsWith('.html')));
    watcher = fs.watch(contentDir, (_event, fileName) => {
      const name = fileName && fileName.toString();
      if (!name || name.startsWith('.') || !name.endsWith('.html')) return;
      if (debounceTimers.has(name)) clearTimeout(debounceTimers.get(name));
      debounceTimers.set(name, setTimeout(() => {
        debounceTimers.delete(name);
        const file = path.join(contentDir, name);
        if (!fs.existsSync(file)) return;
        touchActivity();
        if (!knownScreens.has(name)) {
          knownScreens.add(name);
          try { fs.unlinkSync(eventsFile); } catch (_) {}
          process.stdout.write(JSON.stringify({ type: 'screen-added', file }) + '\n');
          maybeOpenBrowser();
        } else {
          process.stdout.write(JSON.stringify({ type: 'screen-updated', file }) + '\n');
        }
        broadcast({ type: 'reload' });
      }, 100));
    });

    await new Promise((resolve, reject) => {
      let retried = false;
      server.on('error', error => {
        if (error.code === 'EADDRINUSE' && !retried) {
          retried = true;
          server.listen(0, host);
        } else reject(error);
      });
      server.on('listening', resolve);
      server.listen(Number.isInteger(requestedPort) ? requestedPort : 0, host);
    });
    actualPort = server.address().port;
    cookieName = `astra-preview-key-${actualPort}`;
    writePrivate(portFile, actualPort);
    writePrivate(tokenFile, token);
    const info = {
      type: 'server-started', port: actualPort, host, url_host: displayHost,
      url: previewUrl(), screen_dir: contentDir, state_dir: stateDir,
      session_dir: sessionDir, idle_timeout_ms: idleTimeoutMs
    };
    writePrivate(infoFile, JSON.stringify(info) + '\n');
    process.stdout.write(JSON.stringify(info) + '\n');
    if (newestScreen()) maybeOpenBrowser();
    lifecycleTimer = setInterval(() => {
      if (!ownerAlive()) stop('owner process exited');
      else if (Date.now() - lastActivity > idleTimeoutMs) stop('idle timeout');
    }, lifecycleCheckMs);
    lifecycleTimer.unref();
    return info;
  }

  return { start, stop, server, sessionDir, contentDir, stateDir };
}

function configurationFromEnvironment() {
  const sessionDir = process.env.ASTRA_PREVIEW_SESSION_DIR;
  if (!sessionDir) throw new Error('ASTRA_PREVIEW_SESSION_DIR is required');
  return {
    sessionDir,
    host: process.env.ASTRA_PREVIEW_HOST,
    urlHost: process.env.ASTRA_PREVIEW_URL_HOST,
    port: process.env.ASTRA_PREVIEW_PORT === undefined ? undefined : Number(process.env.ASTRA_PREVIEW_PORT),
    token: process.env.ASTRA_PREVIEW_TOKEN,
    ownerPid: process.env.ASTRA_PREVIEW_OWNER_PID,
    idleTimeoutMs: process.env.ASTRA_PREVIEW_IDLE_TIMEOUT_MS,
    lifecycleCheckMs: process.env.ASTRA_PREVIEW_LIFECYCLE_CHECK_MS,
    openBrowser: process.env.ASTRA_PREVIEW_OPEN === '1',
    exitOnStop: true
  };
}

if (require.main === module) {
  let preview;
  try {
    preview = createPreviewServer(configurationFromEnvironment());
    preview.start().catch(error => { console.error(error.message); process.exit(1); });
    process.on('SIGINT', () => preview.stop('SIGINT'));
    process.on('SIGTERM', () => preview.stop('SIGTERM'));
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
}

module.exports = {
  computeAcceptKey, encodeFrame, decodeFrame, browserLauncherForPlatform,
  createPreviewServer, isFullDocument, OPCODES, MAX_FRAME_PAYLOAD_BYTES
};
