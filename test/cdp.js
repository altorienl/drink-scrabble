/* Minimal CDP driver using only Node built-ins. */
const { spawn } = require('child_process');
const os = require('os'), fs = require('fs'), path = require('path');
const http = require('http');

/* Node's global fetch intermittently throws a bogus "Failed to parse URL" on these
   loopback calls. node:http has no such quirk, so use it for the CDP HTTP endpoints. */
function httpJson(pathname, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: '127.0.0.1', port: PORT, path: pathname, method, timeout: 5000 },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (c) => body += c);
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error('HTTP ' + res.statusCode));
          try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
        });
      });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    req.end();
  });
}

const BIN = path.join(os.homedir(),
  'Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell');
let PORT = 0; // set from the browser's own DevTools banner once it starts

async function launch() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-prof-'));
  const proc = spawn(BIN, [
    '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-sandbox', '--disable-gpu',
    '--window-size=1440,1100', '--hide-scrollbars'
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  // Port 0 lets the OS pick a free one; the browser prints it. Parsing the banner
  // is the only way to know which port it actually got.
  PORT = await new Promise((resolve, reject) => {
    let buf = '';
    const to = setTimeout(() => reject(new Error('no DevTools banner: ' + buf.slice(0, 300))), 20000);
    proc.stderr.on('data', (d) => {
      buf += d;
      const m = buf.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//);
      if (m) { clearTimeout(to); resolve(Number(m[1])); }
    });
    proc.on('exit', (c) => { clearTimeout(to); reject(new Error('browser exited code ' + c + ': ' + buf.slice(0, 300))); });
  });
  let up = false, lastErr = null;
  for (let i = 0; i < 80; i++) {
    if (proc.exitCode !== null) throw new Error(`browser exited early with code ${proc.exitCode}`);
    try {
      await httpJson('/json/version');
      up = true; break;
    } catch (e) { lastErr = e; }
    await new Promise(r => setTimeout(r, 150));
  }
  if (!up) throw new Error(`browser never came up on port ${PORT}: ${lastErr && lastErr.message}`);
  return { proc, profile };
}

class Page {
  constructor(ws) { this.ws = ws; this.id = 0; this.waiters = new Map(); this.logs = []; this.errors = []; }
  static async open(url) {
    // Reuse the browser's existing blank target; /json/new chokes on some schemes.
    let t = null;
    for (let i = 0; i < 20 && !t; i++) {
      const list = await httpJson('/json/list');
      t = list.find(x => x.type === 'page');
      if (!t) {
        try { t = await httpJson('/json/new?about:blank', 'PUT'); }
        catch { await new Promise(s => setTimeout(s, 150)); }
      }
    }
    if (!t || !t.webSocketDebuggerUrl) throw new Error('could not get a page target');
    const ws = new WebSocket(t.webSocketDebuggerUrl);
    const page = new Page(ws);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && page.waiters.has(m.id)) { page.waiters.get(m.id)(m); page.waiters.delete(m.id); }
      if (m.method === 'Runtime.consoleAPICalled') {
        page.logs.push(m.params.args.map(a => a.value ?? a.description ?? JSON.stringify(a.preview ?? '')).join(' '));
      }
      if (m.method === 'Runtime.exceptionThrown') {
        page.errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
      }
    };
    await page.send('Runtime.enable');
    await page.send('Page.enable');
    return page;
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.waiters.set(id, (m) => m.error ? reject(new Error(method + ': ' + JSON.stringify(m.error))) : resolve(m.result));
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async goto(url) {
    await this.send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 400));
    for (let i = 0; i < 80; i++) {
      const s = await this.eval('document.readyState');
      if (s === 'complete') break;
      await new Promise(r => setTimeout(r, 100));
    }
  }
  async eval(expr) {
    const r = await this.send('Runtime.evaluate', {
      expression: `(() => { ${/\breturn\b/.test(expr) ? expr
        : (expr.includes(';') ? expr : 'return (' + expr + ')')} })()`,
      returnByValue: true, awaitPromise: true
    });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  }
  async shot(file, full = false) {
    const p = { format: 'png', captureBeyondViewport: full };
    if (full) {
      const m = await this.send('Page.getLayoutMetrics');
      p.clip = { x: 0, y: 0, width: m.cssContentSize.width, height: Math.min(m.cssContentSize.height, 9000), scale: 1 };
    }
    const r = await this.send('Page.captureScreenshot', p);
    fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
    return file;
  }
  async key(text) {
    for (const ch of text) {
      await this.send('Input.dispatchKeyEvent', { type: 'keyDown', text: ch, key: ch });
      await this.send('Input.dispatchKeyEvent', { type: 'keyUp', key: ch });
    }
  }
  async special(key, code, keyCode) {
    await this.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
  }
}
module.exports = { launch, Page, PORT };
