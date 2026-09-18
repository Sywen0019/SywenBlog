// Visual Vertical Slice capture harness.
// Usage:
//   node docs/evidence/visual/capture.mjs <outDir> <label>
//   node docs/evidence/visual/capture.mjs docs/evidence/visual after
//
// Requires the repository's ignored local Playwright install and Edge channel
// (see README). Captures the Screenshot Matrix required by
// docs/visual-architecture.md §11 and writes capture.json next to the images.
import { chromium } from '../../../.tmp-browser/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const outDir = process.argv[2] || 'docs/evidence/visual/after';
const label = process.argv[3] || 'after';
const BASE = process.env.SLICE_BASE || 'http://127.0.0.1:8123/';
const WIDTHS = (process.env.SLICE_WIDTHS || '1440,1200,1024,768,390').split(',').map(Number);
const PAGES = [
  ['home', 'index.html'],
  ['blog', 'blog.html'],
  ['about', 'about.html'],
  ['post', 'posts/ncs-figure-design.html']
];

const dest = path.join(outDir, label);
fs.mkdirSync(dest, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = [];

for (const width of WIDTHS) {
  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme });
    const page = await ctx.newPage();
    for (const [name, file] of PAGES) {
      await page.goto(BASE + file, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(250);
      const target = path.join(dest, `${name}-${width}-${theme}.png`);
      await page.screenshot({ path: target, fullPage: true, animations: 'disabled', timeout: 30000 });
      const facts = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > window.innerWidth,
        height: document.documentElement.scrollHeight
      }));
      report.push({ page: name, width, theme, ...facts, file: path.basename(target) });
      console.log(`${label} ${name} ${width} ${theme} h=${facts.height} overflow=${facts.overflow}`);
    }
    await ctx.close();
  }
}

await browser.close();
fs.writeFileSync(path.join(dest, 'capture.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`captured ${report.length} screenshots into ${dest}`);
