// Additional sample boundaries, contrast and native viewport evidence.
import { chromium } from '../../../.tmp-browser/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../../..');
const base = process.env.E06_BASE || 'http://127.0.0.1:8766/';
const before = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'before/checks.json')));
const report = { at: new Date().toISOString(), checks: [] };
const hash = b => createHash('sha256').update(b).digest('hex');
async function check(name, fn) {
  try { report.checks.push({ name, pass: true, detail: await fn() }); }
  catch(e) { report.checks.push({ name, pass: false, error: e.message }); console.error(name, e.message); }
}
const browser = await chromium.launch({ channel: 'msedge' });
try {
  await check('Original raster assets unchanged', () => {
    const assets = Object.entries(before.hashes).filter(([p]) => /\.(webp|jpg|png)$/.test(p));
    for (const [p, expected] of assets) assert.equal(hash(fs.readFileSync(path.join(root, p))), expected);
    return { assets: assets.length };
  });
  const oldCSS = Object.fromEntries(['base', 'components', 'narrative', 'pages'].map(n => [`/css/${n}.css`, execFileSync('git', ['show', `${before.parentCommit}:css/${n}.css`], { cwd: root })]));
  for (const file of ['blog.html', 'posts/ncs-figure-design.html', 'posts/research-reading.html', 'posts/leave-some-space.html']) {
    assert.equal(hash(fs.readFileSync(path.join(root, file))), before.hashes[file]);
    for (const width of [390, 1440]) for (const theme of ['light', 'dark']) await check(`Unscoped page pixel equality: ${file}/${width}/${theme}`, async () => {
      const captures = [];
      for (const original of [true, false]) {
        const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: 'reduce' });
        try {
          if (original) await ctx.route('**/css/*.css', route => route.fulfill({ contentType: 'text/css', body: oldCSS[new URL(route.request().url()).pathname] }));
          const p = await ctx.newPage(); await p.goto(base + file);
          await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
          captures.push(hash(await p.screenshot({ animations: 'disabled' })));
        } finally { await ctx.close(); }
      }
      assert.equal(captures[0], captures[1]); return { sha256: captures[1] };
    });
  }
  for (const theme of ['light', 'dark']) await check(`Sample contrast and decoration geometry: ${theme}`, async () => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme, reducedMotion: 'reduce' });
    try {
      const p = await ctx.newPage(); await p.goto(base + 'about.html');
      const detail = await p.evaluate(() => {
        const nums = c => c.match(/[\d.]+/g).slice(0,3).map(Number);
        const luminance = c => nums(c).map(v => { const n=v/255; return n<=0.04045?n/12.92:((n+0.055)/1.055)**2.4; }).reduce((s,n,i)=>s+n*[.2126,.7152,.0722][i],0);
        const style = getComputedStyle(document.documentElement);
        const test = document.createElement('span'); document.body.append(test);
        const resolve = token => { test.style.color=style.getPropertyValue(token); return getComputedStyle(test).color; };
        const paper=resolve('--color-paper'), ink=resolve('--color-ink'), muted=resolve('--color-muted');
        const ratio = color => { const a=luminance(color),b=luminance(paper); return (Math.max(a,b)+.05)/(Math.min(a,b)+.05); };
        const contrast={ink:ratio(ink),muted:ratio(muted)}; test.remove();
        const controls=[...document.querySelectorAll('a,button,input')].filter(n=>n.getClientRects().length).map(n=>n.getBoundingClientRect());
        for (const n of document.querySelectorAll('.line-art')) {
          if (!n.closest('[aria-hidden="true"]') || getComputedStyle(n).pointerEvents!=='none' || n.querySelector('a,button,input,[tabindex]')) throw Error('decoration accessibility');
          const r=n.getBoundingClientRect();
          if(controls.some(c=>r.left<c.right&&r.right>c.left&&r.top<c.bottom&&r.bottom>c.top)) throw Error('decoration overlap');
        }
        return contrast;
      });
      assert.ok(detail.ink >= 4.5 && detail.muted >= 4.5); return detail;
    } finally { await ctx.close(); }
  });
  await check('Comparison viewer loads all default evidence', async () => {
    const p = await browser.newPage();
    try { await p.goto(base + 'docs/evidence/e06/review.html'); await p.evaluate(() => Promise.all([...document.images].map(n => {n.loading='eager'; return n.decode();}))); assert.equal(await p.locator('h1').innerText(), 'E06 · 四页视觉样板'); }
    finally { await p.close(); }
  });
} finally {
  await browser.close();
  report.passed=report.checks.filter(c=>c.pass).length; report.failed=report.checks.filter(c=>!c.pass).length;
  fs.writeFileSync(path.join(import.meta.dirname,'sample-audit.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,failed:report.failed})); process.exitCode=report.failed?1:0;
}
