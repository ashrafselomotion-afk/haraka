#!/usr/bin/env node
// Controlled screenshots through Chrome DevTools Protocol (no npm deps).
// Usage: node scripts/shoot.mjs <url> <out.png> [--w 420] [--h 760] [--dpr 2] [--eval file.js] [--wait 1500] [--full]
import { spawn } from 'node:child_process';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const url = args[0], out = args[1];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
const W = +opt('w', 420), H = +opt('h', 760), DPR = +opt('dpr', 2), WAIT = +opt('wait', 1500);
const evalFile = opt('eval', null), full = args.includes('--full'), light = args.includes('--light'), dark = args.includes('--dark');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9222 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), 'shoot-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function targets() {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}/json`); return await r.json(); } catch { await sleep(100); }
  }
  throw new Error('chrome did not start');
}
try {
  const list = await targets();
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DPR, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }].concat(light ? [{ name: 'prefers-color-scheme', value: 'light' }] : dark ? [{ name: 'prefers-color-scheme', value: 'dark' }] : []) });
  await send('Page.navigate', { url });
  await sleep(WAIT);
  if (evalFile) {
    const src = readFileSync(evalFile, 'utf8');
    const r = await send('Runtime.evaluate', { expression: src, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) console.error('eval error:', JSON.stringify(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails));
    await sleep(600);
  }
  let clip;
  if (full) {
    const m = await send('Page.getLayoutMetrics');
    const h = Math.ceil(m.result.cssContentSize.height);
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: h, deviceScaleFactor: DPR, mobile: false });
    await sleep(300);
  }
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!full, clip });
  writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
  console.log('saved', out);
  ws.close();
} finally {
  chrome.kill('SIGKILL');
}
