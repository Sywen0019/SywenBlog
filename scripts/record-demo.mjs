// Optional coursework demonstration recording, using the README verification setup.
import { chromium } from '../.tmp-browser/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
const out = path.resolve('docs/evidence/baseline');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'light',
  recordVideo: { dir: out, size: { width: 1280, height: 800 } } });
const p = await context.newPage();
const pause = () => p.waitForTimeout(1000);
try {
  await p.goto('https://sywen-blog.pages.dev/'); await pause();
  await p.locator('#theme-toggle').click(); await pause();
  await p.reload(); await pause();
  await p.locator('#theme-toggle').click();
  await p.goto('https://sywen-blog.pages.dev/blog.html'); await pause();
  await p.locator('#search-input').fill('JavaScript DOM'); await pause();
  await p.locator('[data-category="coding"]').click(); await pause();
  await p.locator('[data-category="life"]').click(); await pause();
  await p.locator('#empty-reset').click(); await pause();
  await p.locator('#search-input').fill('论文');
  await p.locator('[data-category="research"]').click(); await pause();
  await p.reload(); await pause();
  await p.locator('#blog-results .post-entry__link').click(); await pause();
} finally {
  await context.close();
  const target = path.join(out, 'baseline-demo.webm');
  if (fs.existsSync(target)) fs.unlinkSync(target);
  await p.video().saveAs(target);
  await p.video().delete();
  await browser.close();
  console.log(target);
}
