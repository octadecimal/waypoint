const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { execFile, spawn } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const { browserLauncherForPlatform } = require('./server.cjs');

function usage() {
  return `Usage:
  node start-server.cjs start --session-dir PATH [--open] [--host HOST] [--url-host HOST] [--idle-timeout-minutes N]
  node start-server.cjs status --session-dir PATH
  node start-server.cjs stop --session-dir PATH`;
}

function parseArguments(argv) {
  const args = [...argv];
  const command = args[0] && !args[0].startsWith('--') ? args.shift() : 'start';
  const options = { command, open: false };
  while (args.length) {
    const flag = args.shift();
    if (flag === '--open') options.open = true;
    else if (['--session-dir', '--host', '--url-host', '--idle-timeout-minutes'].includes(flag)) {
      if (!args.length) throw new Error(`${flag} requires a value`);
      options[flag.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = args.shift();
    } else throw new Error(`Unknown argument: ${flag}`);
  }
  if (!['start', 'status', 'stop'].includes(command)) throw new Error(`Unknown command: ${command}`);
  if (!options.sessionDir) throw new Error('--session-dir is required');
  options.sessionDir = path.resolve(options.sessionDir);
  if (options.idleTimeoutMinutes !== undefined && (!/^\d+$/.test(options.idleTimeoutMinutes) || Number(options.idleTimeoutMinutes) < 1)) {
    throw new Error('--idle-timeout-minutes must be a positive integer');
  }
  return options;
}

function readServerInfo(sessionDir) {
  const file = path.join(sessionDir, 'state', 'server-info');
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return null; }
}

function acquireStartLock(sessionDir) {
  const stateDir = path.join(sessionDir, 'state');
  const lockFile = path.join(stateDir, 'start.lock');
  fs.mkdirSync(stateDir, { recursive: true, mode: 0o700 });
  const record = JSON.stringify({ pid: process.pid, instance_id: randomUUID() }) + '\n';

  for (;;) {
    let handle;
    try {
      handle = fs.openSync(lockFile, 'wx', 0o600);
      fs.writeFileSync(handle, record);
      fs.closeSync(handle);
      break;
    } catch (error) {
      if (handle !== undefined) fs.closeSync(handle);
      if (error.code !== 'EEXIST') throw error;

      let existing;
      let owner;
      try {
        existing = fs.readFileSync(lockFile, 'utf8');
        owner = JSON.parse(existing);
      } catch (_) {
        throw new Error(`preview start lock is ambiguous for ${sessionDir}`);
      }
      if (!Number.isInteger(owner.pid) || owner.pid <= 0 || typeof owner.instance_id !== 'string' || !owner.instance_id) {
        throw new Error(`preview start lock is ambiguous for ${sessionDir}`);
      }
      let ownerExists = true;
      try { process.kill(owner.pid, 0); } catch (ownerError) {
        if (ownerError.code === 'ESRCH') ownerExists = false;
        else throw new Error(`preview start lock owner cannot be verified for ${sessionDir}`);
      }
      if (ownerExists) throw new Error(`preview start already in progress for ${sessionDir}`);

      let unchanged;
      try { unchanged = fs.readFileSync(lockFile, 'utf8') === existing; } catch (readError) {
        if (readError.code === 'ENOENT') continue;
        throw readError;
      }
      if (!unchanged) throw new Error(`preview start lock changed while checking ${sessionDir}`);
      try { fs.unlinkSync(lockFile); } catch (unlinkError) {
        if (unlinkError.code !== 'ENOENT') throw unlinkError;
      }
    }
  }

  return () => {
    try {
      if (fs.readFileSync(lockFile, 'utf8') === record) fs.unlinkSync(lockFile);
    } catch (_) {}
  };
}

function localHost(host) {
  if (host === '0.0.0.0') return '127.0.0.1';
  if (host === '::' || host === '[::]') return '::1';
  return host || '127.0.0.1';
}

function requestServer(info, method, route) {
  const key = new URL(info.url).searchParams.get('key');
  return new Promise((resolve, reject) => {
    const request = http.request({
      host: localHost(info.host), port: info.port, method,
      path: `${route}?key=${encodeURIComponent(key)}`, timeout: 1500
    }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body }));
    });
    request.on('timeout', () => request.destroy(new Error('preview request timed out')));
    request.on('error', reject);
    request.end();
  });
}

async function runningServer(sessionDir) {
  const info = readServerInfo(sessionDir);
  if (!info) return null;
  try {
    const response = await requestServer(info, 'GET', '/__health');
    return response.status === 200 ? info : null;
  } catch (_) {
    return null;
  }
}

function launchBrowser(url, options = {}) {
  const host = options.host || new URL(url).hostname;
  if (!['127.0.0.1', 'localhost', '::1', '[::1]'].includes(host)) {
    return Promise.resolve({ status: 'launch-blocked', reason: 'non-loopback-host' });
  }
  const launcher = browserLauncherForPlatform(url, options);
  if (!launcher) return Promise.resolve({ status: 'headless' });
  return new Promise(resolve => {
    try {
      (options.execFile || execFile)(launcher.bin, launcher.args, error => resolve(error
        ? { status: 'launch-failed', error: error.message }
        : { status: 'launch-accepted', command: launcher.bin }));
    } catch (error) {
      resolve({ status: 'launch-failed', error: error.message });
    }
  });
}

async function start(options, launchOptions = {}) {
  const existing = await runningServer(options.sessionDir);
  if (existing) {
    const result = { ...existing, type: 'server-existing' };
    if (options.open) result.browser = await launchBrowser(existing.url, { ...launchOptions, host: existing.host });
    process.stdout.write(JSON.stringify(result) + '\n');
    return result;
  }
  fs.mkdirSync(options.sessionDir, { recursive: true, mode: 0o700 });
  const releaseStartLock = acquireStartLock(options.sessionDir);
  const env = {
    ...process.env,
    ASTRA_PREVIEW_SESSION_DIR: options.sessionDir,
    ASTRA_PREVIEW_OWNER_PID: String(process.pid),
    ASTRA_PREVIEW_OPEN: options.open ? '1' : '0'
  };
  if (options.host) env.ASTRA_PREVIEW_HOST = options.host;
  if (options.urlHost) env.ASTRA_PREVIEW_URL_HOST = options.urlHost;
  if (options.idleTimeoutMinutes) env.ASTRA_PREVIEW_IDLE_TIMEOUT_MS = String(Number(options.idleTimeoutMinutes) * 60 * 1000);

  const child = spawn(process.execPath, [path.join(__dirname, 'server.cjs')], { env, stdio: 'inherit', windowsHide: true });
  const stopOwnedChild = () => { if (!child.killed) child.kill('SIGTERM'); };
  process.on('SIGINT', stopOwnedChild);
  process.on('SIGTERM', stopOwnedChild);
  child.on('error', error => { releaseStartLock(); console.error(error.message); process.exitCode = 1; });
  child.on('exit', code => { releaseStartLock(); process.exitCode = code === null ? 1 : code; });
}

async function status(options) {
  const info = await runningServer(options.sessionDir);
  if (!info) {
    process.stdout.write(JSON.stringify({ status: 'not_running', session_dir: options.sessionDir }) + '\n');
    process.exitCode = 1;
    return;
  }
  process.stdout.write(JSON.stringify({ status: 'running', ...info }) + '\n');
}

async function stop(options) {
  const info = readServerInfo(options.sessionDir);
  if (!info) {
    process.stdout.write(JSON.stringify({ status: 'not_running', session_dir: options.sessionDir }) + '\n');
    return;
  }
  try {
    const response = await requestServer(info, 'POST', '/__stop');
    if (response.status !== 202) {
      process.stdout.write(JSON.stringify({
        status: 'rejected', session_dir: options.sessionDir,
        http_status: response.status, error: response.body.trim() || `server returned ${response.status}`
      }) + '\n');
      process.exitCode = 1;
      return;
    }
    process.stdout.write(JSON.stringify({ status: 'stopping', session_dir: options.sessionDir }) + '\n');
  } catch (error) {
    process.stdout.write(JSON.stringify({ status: 'stale_session', session_dir: options.sessionDir, error: error.message }) + '\n');
    process.exitCode = 1;
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.command === 'start') await start(options);
  else if (options.command === 'status') await status(options);
  else await stop(options);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message);
    console.error(usage());
    process.exit(2);
  });
}

module.exports = { parseArguments, readServerInfo, requestServer, runningServer, acquireStartLock, launchBrowser, start };
