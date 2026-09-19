const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const test = require('node:test');
const vm = require('node:vm');

const pluginRoot = path.resolve(__dirname, '..');
const scriptsDir = path.join(pluginRoot, 'skills', 'astra-plan', 'scripts');
const launcher = path.join(scriptsDir, 'start-server.cjs');
const serverModule = require(path.join(scriptsDir, 'server.cjs'));
const helper = require(path.join(scriptsDir, 'helper.js'));
const launcherModule = require(launcher);

function waitFor(predicate, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const check = () => {
      try {
        const value = predicate();
        if (value) return resolve(value);
      } catch (_) {}
      if (Date.now() >= deadline) return reject(new Error('timed out waiting for condition'));
      setTimeout(check, 25);
    };
    check();
  });
}

function request(info, requestPath, { method = 'GET', cookie } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: info.host === '0.0.0.0' ? '127.0.0.1' : info.host,
      port: info.port,
      path: requestPath,
      method,
      headers: cookie ? { Cookie: cookie } : {},
      timeout: 2000
    }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({
        status: response.statusCode,
        headers: response.headers,
        body: Buffer.concat(chunks).toString()
      }));
    });
    req.on('timeout', () => req.destroy(new Error('request timed out')));
    req.on('error', reject);
    req.end();
  });
}

function waitForExit(child, timeoutMs = 5000) {
  if (child.exitCode !== null) return Promise.resolve(child.exitCode);
  return Promise.race([
    new Promise(resolve => child.once('exit', resolve)),
    new Promise((_, reject) => setTimeout(() => reject(new Error('process did not exit')), timeoutMs))
  ]);
}

async function waitForClose(running, timeoutMs = 2000) {
  let timer;
  try {
    await Promise.race([
      running.closed,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('process pipes did not close')), timeoutMs); })
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function stopOwnedPreview(sessionDir, running) {
  if (fs.existsSync(path.join(sessionDir, 'state', 'server-info'))) {
    const stopped = stopPreview(sessionDir);
    if (stopped.status === 0) {
      try { await waitForClose(running); return; } catch (_) {}
    }
  }
  if (running.child.exitCode === null && running.child.signalCode === null) {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/PID', String(running.child.pid), '/T', '/F'], {
        encoding: 'utf8', timeout: 5000, windowsHide: true
      });
    } else {
      running.child.kill('SIGTERM');
    }
  }
  await waitForClose(running);
}

async function startPreview(sessionDir, { args = [launcher, 'start', '--session-dir', sessionDir], timeoutMs = 5000, onSpawn } = {}) {
  const child = spawn(process.execPath, args, {
    cwd: pluginRoot, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true
  });
  const running = { child, closed: new Promise(resolve => child.once('close', resolve)) };
  if (onSpawn) onSpawn(child);
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  const infoFile = path.join(sessionDir, 'state', 'server-info');
  try {
    const info = await waitFor(() => {
      if (child.exitCode !== null) throw new Error(`launcher exited ${child.exitCode}: ${stderr}`);
      if (!fs.existsSync(infoFile)) return null;
      return JSON.parse(fs.readFileSync(infoFile, 'utf8'));
    }, timeoutMs);
    return { ...running, info, output: () => ({ stdout, stderr }) };
  } catch (error) {
    try { await stopOwnedPreview(sessionDir, running); } catch (cleanupError) { error.cause = cleanupError; }
    throw error;
  }
}

function stopPreview(sessionDir) {
  return spawnSync(process.execPath, [launcher, 'stop', '--session-dir', sessionDir], {
    cwd: pluginRoot, encoding: 'utf8', timeout: 5000, windowsHide: true
  });
}

function maskedTextFrame(text) {
  const payload = Buffer.from(text);
  const mask = crypto.randomBytes(4);
  assert(payload.length < 126);
  const frame = Buffer.alloc(6 + payload.length);
  frame[0] = 0x81;
  frame[1] = 0x80 | payload.length;
  mask.copy(frame, 2);
  for (let index = 0; index < payload.length; index += 1) frame[6 + index] = payload[index] ^ mask[index % 4];
  return frame;
}

function serverFrameText(buffer) {
  const length = buffer[1] & 0x7f;
  const offset = length === 126 ? 4 : length === 127 ? 10 : 2;
  const size = length === 126 ? buffer.readUInt16BE(2) : length === 127 ? Number(buffer.readBigUInt64BE(2)) : length;
  return buffer.subarray(offset, offset + size).toString();
}

function openWebSocket(info, token, origin = `http://${info.host}:${info.port}`) {
  return new Promise((resolve, reject) => {
    const socket = net.connect(info.port, info.host);
    const key = crypto.randomBytes(16).toString('base64');
    let buffer = Buffer.alloc(0);
    let settled = false;
    const timeout = setTimeout(() => { socket.destroy(); reject(new Error('WebSocket handshake timed out')); }, 3000);
    socket.on('connect', () => socket.write(
      `GET /?key=${encodeURIComponent(token)} HTTP/1.1\r\n` +
      `Host: ${info.host}:${info.port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n` +
      `Sec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\nOrigin: ${origin}\r\n\r\n`
    ));
    const onData = chunk => {
      buffer = Buffer.concat([buffer, chunk]);
      const marker = buffer.indexOf('\r\n\r\n');
      if (marker < 0) return;
      clearTimeout(timeout);
      socket.off('data', onData);
      const header = buffer.subarray(0, marker).toString();
      if (!header.startsWith('HTTP/1.1 101')) {
        socket.destroy();
        settled = true;
        reject(new Error(`WebSocket rejected: ${header}`));
        return;
      }
      settled = true;
      resolve({ socket, remainder: buffer.subarray(marker + 4) });
    };
    socket.on('data', onData);
    socket.once('error', reject);
    socket.once('close', () => {
      if (!settled) {
        clearTimeout(timeout);
        settled = true;
        reject(new Error('WebSocket closed before handshake'));
      }
    });
  });
}

function nextSocketChunk(socket, existing = Buffer.alloc(0)) {
  if (existing.length) return Promise.resolve(existing);
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timed out waiting for WebSocket frame')), 3000);
    socket.once('data', chunk => { clearTimeout(timeout); resolve(chunk); });
    socket.once('error', error => { clearTimeout(timeout); reject(error); });
  });
}

test('WebSocket helpers preserve RFC framing and bounds', () => {
  assert.equal(serverModule.computeAcceptKey('dGhlIHNhbXBsZSBub25jZQ=='), 's3pPLMBiTxaQ9kYGzzhZRbK+xOo=');
  const payload = Buffer.from('hello');
  const encoded = serverModule.encodeFrame(serverModule.OPCODES.TEXT, payload);
  assert.equal(encoded[0], 0x81);
  assert.equal(encoded.subarray(2).toString(), 'hello');
  const decoded = serverModule.decodeFrame(maskedTextFrame('choice'));
  assert.equal(decoded.payload.toString(), 'choice');
  const oversized = Buffer.alloc(10);
  oversized[0] = 0x81;
  oversized[1] = 0xff;
  oversized.writeBigUInt64BE(BigInt(serverModule.MAX_FRAME_PAYLOAD_BYTES + 1), 2);
  assert.throws(() => serverModule.decodeFrame(oversized), /exceeds maximum/);
});

test('helper reconnect delay is bounded', () => {
  assert.equal(helper.nextReconnectDelay(500, 30000), 1000);
  assert.equal(helper.nextReconnectDelay(20000, 30000), 30000);
  assert.equal(helper.MIN_RECONNECT_MS, 500);
  assert.equal(helper.MAX_RECONNECT_MS, 30000);
});

test('documented custom choice API sends the persisted choice field', () => {
  const sent = [];
  class FakeWebSocket {
    static OPEN = 1;
    constructor() { FakeWebSocket.instance = this; this.readyState = FakeWebSocket.OPEN; }
    send(message) { sent.push(JSON.parse(message)); }
    close() {}
  }
  const window = {
    location: { protocol: 'http:', host: 'localhost:5000', replace() {}, reload() {} },
    sessionStorage: { getItem: () => 'session-key' }
  };
  const document = {
    addEventListener() {}, querySelector() { return null; }, body: { appendChild() {} }, createElement() { return {}; }
  };
  const source = fs.readFileSync(path.join(scriptsDir, 'helper.js'), 'utf8');
  vm.runInNewContext(source, { window, document, WebSocket: FakeWebSocket, setTimeout, clearTimeout, Date, JSON });
  FakeWebSocket.instance.onopen();
  window.astraPreview.choice('compact', { revision: 2 });
  assert.equal(sent.at(-1).type, 'choice');
  assert.equal(sent.at(-1).choice, 'compact');
  assert.equal(sent.at(-1).revision, 2);
  assert.equal('value' in sent.at(-1), false);
});

test('selection helper keeps native button aria-pressed state in sync', () => {
  class FakeWebSocket { static OPEN = 1; constructor() { this.readyState = 1; } send() {} close() {} }
  const makeButton = () => {
    const classes = new Set();
    const attributes = new Map([['aria-pressed', 'false']]);
    return {
      classList: {
        add: name => classes.add(name), remove: name => classes.delete(name),
        toggle: name => classes.has(name) ? (classes.delete(name), false) : (classes.add(name), true),
        contains: name => classes.has(name)
      },
      dataset: {},
      setAttribute: (name, value) => attributes.set(name, value),
      getAttribute: name => attributes.get(name)
    };
  };
  const first = makeButton();
  const second = makeButton();
  const container = { dataset: {}, querySelectorAll: () => [first, second] };
  first.dataset.choice = 'first';
  second.dataset.choice = 'second';
  first.closest = second.closest = () => container;
  const window = {
    location: { protocol: 'http:', host: 'localhost:5000', replace() {}, reload() {} },
    sessionStorage: { getItem: () => 'session-key' }
  };
  const document = {
    addEventListener() {}, querySelector() { return null; }, body: { appendChild() {} }, createElement() { return {}; }
  };
  vm.runInNewContext(fs.readFileSync(path.join(scriptsDir, 'helper.js'), 'utf8'), {
    window, document, WebSocket: FakeWebSocket, setTimeout, clearTimeout, Date, JSON
  });

  window.toggleSelect(first);
  assert.equal(first.getAttribute('aria-pressed'), 'true');
  assert.equal(second.getAttribute('aria-pressed'), 'false');
  window.toggleSelect(second);
  assert.equal(first.getAttribute('aria-pressed'), 'false');
  assert.equal(second.getAttribute('aria-pressed'), 'true');
});

test('browser launch uses argument arrays and stays headless without a display', () => {
  const url = 'http://localhost:5000/?key=x&unsafe=$(echo nope)';
  const windows = serverModule.browserLauncherForPlatform(url, { platform: 'win32', osRelease: '', env: {} });
  assert.equal(windows.bin, 'rundll32.exe');
  assert.deepEqual(windows.args, ['url.dll,FileProtocolHandler', url]);
  assert.equal(serverModule.browserLauncherForPlatform(url, { platform: 'linux', osRelease: '', env: {} }), null);
});

test('failed preview startup closes its owned child', { timeout: 10000 }, async () => {
  const sessionDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astra-preview-start-failure-'));
  let child;
  try {
    await assert.rejects(startPreview(sessionDir, {
      args: ['-e', 'setInterval(() => {}, 1000)'], timeoutMs: 100,
      onSpawn: spawned => { child = spawned; }
    }), /timed out waiting for condition/);
    assert.ok(child.exitCode !== null || child.signalCode !== null, 'startup failure left child running');
    assert.equal(child.stdout.destroyed, true, 'startup failure left stdout open');
    assert.equal(child.stderr.destroyed, true, 'startup failure left stderr open');
  } finally {
    if (child && child.exitCode === null && child.signalCode === null) {
      child.kill('SIGTERM');
      await waitForExit(child);
    }
  }
});

test('existing preview honors --open without starting another server', { timeout: 10000 }, async t => {
  const sessionDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astra-preview-existing-'));
  const running = await startPreview(sessionDir);
  t.after(() => stopOwnedPreview(sessionDir, running));

  const originalInfo = fs.readFileSync(path.join(sessionDir, 'state', 'server-info'), 'utf8');
  let noOpenCalls = 0;
  const noOpen = await launcherModule.start({ sessionDir, open: false }, {
    execFile() { noOpenCalls += 1; }
  });
  assert.equal(noOpenCalls, 0);
  assert.equal(noOpen.browser, undefined);

  const calls = [];
  const reopened = await launcherModule.start({ sessionDir, open: true }, {
    platform: 'win32', osRelease: '', env: {},
    execFile(bin, args, callback) { calls.push({ bin, args }); callback(null); }
  });
  assert.deepEqual(calls, [{
    bin: 'rundll32.exe', args: ['url.dll,FileProtocolHandler', running.info.url]
  }]);
  assert.equal(reopened.type, 'server-existing');
  assert.equal(reopened.browser.status, 'launch-accepted');
  assert.equal(fs.readFileSync(path.join(sessionDir, 'state', 'server-info'), 'utf8'), originalInfo);
  assert.equal(running.child.exitCode, null);
});

test('existing preview browser launch reports headless, failure, and unsafe hosts', async () => {
  const url = 'http://localhost:5000/?key=safe';
  assert.equal((await launcherModule.launchBrowser(url, {
    platform: 'linux', osRelease: '', env: {}
  })).status, 'headless');
  const failed = await launcherModule.launchBrowser(url, {
    platform: 'win32', osRelease: '', env: {},
    execFile(_bin, _args, callback) { callback(new Error('opener unavailable')); }
  });
  assert.deepEqual(failed, { status: 'launch-failed', error: 'opener unavailable' });
  assert.deepEqual(await launcherModule.launchBrowser(url, {
    host: '0.0.0.0', platform: 'win32',
    execFile() { throw new Error('non-loopback launch must stay blocked'); }
  }), { status: 'launch-blocked', reason: 'non-loopback-host' });
});

test('launcher requires an explicit session and locks concurrent starts', () => {
  assert.throws(() => launcherModule.parseArguments(['start']), /session-dir is required/);
  const sessionDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astra-preview-lock-'));
  const release = launcherModule.acquireStartLock(sessionDir);
  assert.throws(() => launcherModule.acquireStartLock(sessionDir), /already in progress/);
  release();
  const secondRelease = launcherModule.acquireStartLock(sessionDir);
  secondRelease();
});

test('launcher reclaims a lock owned by an exited process', () => {
  const sessionDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astra-preview-stale-lock-'));
  const child = spawnSync(process.execPath, [
    '-e',
    `require(${JSON.stringify(launcher)}).acquireStartLock(${JSON.stringify(sessionDir)})`
  ], { encoding: 'utf8', timeout: 5000, windowsHide: true });
  assert.equal(child.status, 0, child.stderr);

  const release = launcherModule.acquireStartLock(sessionDir);
  release();
  assert.equal(fs.existsSync(path.join(sessionDir, 'state', 'start.lock')), false);
});

test('live companion authenticates, serves safely, records events, reloads, and restarts stably', { timeout: 30000 }, async t => {
  const sessionDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astra-preview-'));
  let first;
  let second;
  t.after(async () => {
    for (const running of [first, second]) {
      if (running && running.child.exitCode === null && running.child.signalCode === null) {
        await stopOwnedPreview(sessionDir, running);
      }
    }
  });

  first = await startPreview(sessionDir);
  const token = new URL(first.info.url).searchParams.get('key');
  assert.match(token, /^[0-9a-f]{64}$/);

  const forbidden = await request(first.info, '/');
  assert.equal(forbidden.status, 403);
  assert.equal(forbidden.headers['x-frame-options'], 'DENY');

  const bootstrap = await request(first.info, `/?key=${token}`);
  assert.equal(bootstrap.status, 200);
  assert.match(bootstrap.body, /astra-preview-session-key/);
  assert.match(bootstrap.headers['set-cookie'][0], /HttpOnly/);
  assert.match(bootstrap.headers['set-cookie'][0], /SameSite=Strict/);
  const cookie = bootstrap.headers['set-cookie'][0].split(';')[0];

  const contentDir = first.info.screen_dir;
  fs.writeFileSync(path.join(contentDir, '01-fragment.html'), '<h2>Choose</h2><div data-choice="a">A</div>');
  await waitFor(() => first.output().stdout.includes('screen-added'));
  const fragment = await request(first.info, '/', { cookie });
  assert.equal(fragment.status, 200);
  assert.match(fragment.body, /Astra workflow preview/);
  assert.match(fragment.body, /window\.astraPreview/);

  fs.writeFileSync(path.join(contentDir, 'asset.txt'), 'local asset');
  assert.equal((await request(first.info, `/files/asset.txt?key=${token}`)).body, 'local asset');
  fs.writeFileSync(path.join(contentDir, '.secret'), 'hidden');
  assert.equal((await request(first.info, `/files/.secret?key=${token}`)).status, 404);
  assert.equal((await request(first.info, `/files/..%2F.secret?key=${token}`)).status, 404);
  const outside = path.join(sessionDir, 'outside.txt');
  const hardLink = path.join(contentDir, 'hard-link.txt');
  fs.writeFileSync(outside, 'outside');
  fs.linkSync(outside, hardLink);
  assert.equal((await request(first.info, `/files/hard-link.txt?key=${token}`)).status, 404);
  assert.equal((await request(first.info, `/?key=wrong`, { cookie })).status, 403);

  await assert.rejects(openWebSocket(first.info, token, 'http://evil.example'), /closed|rejected/);
  const ws = await openWebSocket(first.info, token);
  ws.socket.write(maskedTextFrame(JSON.stringify({ type: 'choice', choice: 'compact', revision: 2 })));
  const eventsFile = path.join(first.info.state_dir, 'events');
  await waitFor(() => fs.existsSync(eventsFile) && fs.readFileSync(eventsFile, 'utf8').includes('"choice":"compact"'));
  assert.match(fs.readFileSync(eventsFile, 'utf8'), /"revision":2/);

  await new Promise(resolve => setTimeout(resolve, 20));
  fs.writeFileSync(path.join(contentDir, '02-full.html'), '<!DOCTYPE html><html><head><title>Full</title></head><body><main>Full document</main></body></html>');
  const reloadFrame = await nextSocketChunk(ws.socket, ws.remainder);
  assert.equal(JSON.parse(serverFrameText(reloadFrame)).type, 'reload');
  await waitFor(() => !fs.existsSync(eventsFile));
  const full = await request(first.info, '/', { cookie });
  assert.match(full.body, /<title>Full<\/title>/);
  assert.doesNotMatch(full.body, /Astra workflow preview/);
  assert.match(full.body, /window\.astraPreview/);
  ws.socket.destroy();

  const infoFile = path.join(first.info.state_dir, 'server-info');
  const originalInfoText = fs.readFileSync(infoFile, 'utf8');
  const poisoned = { ...first.info, url: first.info.url.replace(token, '0'.repeat(64)) };
  fs.writeFileSync(infoFile, JSON.stringify(poisoned));
  const rejectedStop = stopPreview(sessionDir);
  assert.equal(rejectedStop.status, 1);
  assert.match(rejectedStop.stdout, /"status":"rejected"/);
  assert.equal((await request(first.info, `/__health?key=${token}`)).status, 200);
  fs.writeFileSync(infoFile, originalInfoText);

  const duplicateStart = spawnSync(process.execPath, [launcher, 'start', '--session-dir', sessionDir], {
    cwd: pluginRoot, encoding: 'utf8', timeout: 5000, windowsHide: true
  });
  assert.equal(duplicateStart.status, 0, duplicateStart.stderr);
  assert.match(duplicateStart.stdout, /"type":"server-existing"/);

  const stopped = stopPreview(sessionDir);
  assert.equal(stopped.status, 0, stopped.stderr);
  assert.match(stopped.stdout, /"status":"stopping"/);
  await waitForExit(first.child);

  second = await startPreview(sessionDir);
  const restartedToken = new URL(second.info.url).searchParams.get('key');
  assert.equal(second.info.port, first.info.port);
  assert.equal(restartedToken, token);
  assert.equal(stopPreview(sessionDir).status, 0);
  await waitForExit(second.child);
});
