// Narrative Layer contract checks for the Visual Vertical Slice.
// Usage:
//   node docs/evidence/visual/narrative-checks.mjs
//
// Verifies the accessibility and geometry contract in
// docs/visual-architecture.md §2 and §11:
//   1. every Narrative element has an aria-hidden ancestor;
//   2. it is not focusable and contains nothing focusable;
//   3. pointer-events resolves to none;
//   4. it does not cover any interactive element;
//   5. it does not enter the 740px reading column on article pages;
//   6. Blog lists carry no images, filter/reset/no-JS keep working.
import { chromium } from '../../../.tmp-browser/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.SLICE_BASE || 'http://127.0.0.1:8123/';
const out = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const PAGES = [
  ['home', 'index.html'],
  ['blog', 'blog.html'],
  ['about', 'about.html'],
  ['post', 'posts/attention-intuition.html']
];
const WIDTHS = [1440, 1200, 1024, 768, 390];

const NARRATIVE_SELECTOR = [
  '.narrative', '.hand-note', '.paper-slip', '.short-rule', '.post-rail', '.mark',
  '.narrative-tape', '.narrative-dots', '.narrative-branch', '.narrative-plant',
  '.section-header__note', '.post-entry__number', '.category-mark', '.page-header__eyebrow',
  '.now-slip__stamp', '.study-notes__index', '.section-header__number'
].join(', ');

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const checks = [];
const problems = [];

async function check(name, fn) {
  try {
    const detail = await fn();
    checks.push({ name, pass: true, detail });
  } catch (error) {
    checks.push({ name, pass: false, error: error.message });
    problems.push(`${name}: ${error.message}`);
    console.error('FAIL', name, error.message);
  }
}

for (const width of WIDTHS) {
  for (const [name, file] of PAGES) {
    await check(`${name}@${width} narrative contract`, async () => {
      const ctx = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await ctx.newPage();
      await page.goto(BASE + file, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(200);
      const result = await page.evaluate((selector) => {
        const narrative = [...document.querySelectorAll(selector)].filter((el) => !el.closest('button, a'));
        const issues = [];
        const rect = (el) => el.getBoundingClientRect();
        const label = (el) => el.tagName.toLowerCase() + '.' + String(el.getAttribute('class') || '');
        const peChain = (node) => {
          for (let cur = node; cur && cur !== document.documentElement; cur = cur.parentElement) {
            if (getComputedStyle(cur).pointerEvents === 'none') return true;
          }
          return false;
        };
        for (const el of narrative) {
          const id = label(el);
          if (!el.closest('[aria-hidden="true"]')) issues.push(`no aria-hidden ancestor: ${id}`);
          if (el.matches('a, button, input, select, textarea, [tabindex]')) issues.push(`focusable: ${id}`);
          if (el.querySelector('a, button, input, select, textarea, [tabindex]')) issues.push(`contains focusable: ${id}`);
          if (!peChain(el)) issues.push(`pointer-events not none: ${id}`);
          const box = rect(el);
          if (box.width <= 0 || box.height <= 0) continue;
          for (const target of document.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]')) {
            if (el === target || el.contains(target) || target.contains(el)) continue;
            const tb = rect(target);
            if (tb.width === 0 || tb.height === 0) continue;
            const overlapX = Math.min(box.right, tb.right) - Math.max(box.left, tb.left);
            const overlapY = Math.min(box.bottom, tb.bottom) - Math.max(box.top, tb.top);
            if (overlapX > 4 && overlapY > 4) issues.push(`covers ${label(target)}: ${id}`);
          }
        }
        // Article: Narrative must not enter the 740px reading column.
        const post = document.querySelector('.post');
        if (post) {
          const col = post.getBoundingClientRect();
          for (const el of narrative) {
            if (!post.contains(el)) continue;
            const box = rect(el);
            if (box.width <= 0 || box.height <= 0) continue;
            if (box.left >= col.left - 1 && box.right <= col.right + 1) {
              issues.push(`inside the reading column: ${label(el)}`);
            }
          }
        }
        return { count: narrative.length, issues };
      }, NARRATIVE_SELECTOR);
      await ctx.close();
      if (result.issues.length) throw new Error(result.issues.slice(0, 4).join(' | '));
      return { narrative: result.count };
    });
  }
}

await check('blog: no images in list, count matches, filter and reset work', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + 'blog.html', { waitUntil: 'load' });
  await page.waitForTimeout(300);
  const images = await page.locator('#blog-results img').count();
  const entries = await page.locator('#blog-results .post-entry').count();
  const countText = await page.locator('#result-count').innerText();
  if (images !== 0) throw new Error(`list contains ${images} images`);
  if (entries !== 4) throw new Error(`list contains ${entries} entries`);
  if (!/4/.test(countText)) throw new Error(`result count: ${countText}`);
  await page.locator('button[data-category="life"]').click();
  await page.waitForTimeout(400);
  const life = await page.locator('#blog-results .post-entry').count();
  const lifeNumbers = await page.locator('#blog-results .post-entry__number').allInnerTexts();
  await page.locator('#reset-filters').click();
  await page.waitForTimeout(400);
  const afterReset = await page.locator('#blog-results .post-entry').count();
  await ctx.close();
  if (life !== 1) throw new Error(`life filter returned ${life}`);
  if (afterReset !== 4) throw new Error(`reset returned ${afterReset}`);
  // Archive numbers follow the article, not the filtered result.
  if (lifeNumbers.join() !== 'A-04') throw new Error(`life numbers: ${lifeNumbers.join()}`);
  return { images, entries, countText, life, afterReset };
});

await check('blog no-JS: static list complete without images', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(BASE + 'blog.html', { waitUntil: 'load' });
  const entries = await page.locator('#blog-static-list .post-entry').count();
  const images = await page.locator('#blog-static-list img').count();
  const links = await page.locator('#blog-static-list .post-entry__link:visible').count();
  await ctx.close();
  if (entries !== 4 || images !== 0 || links !== 4) throw new Error(`entries=${entries} images=${images} links=${links}`);
  return { entries, images, links };
});

await browser.close();

const report = {
  task: 'Narrative Layer Visual Vertical Slice',
  at: new Date().toISOString(),
  passed: checks.filter((c) => c.pass).length,
  failed: problems.length,
  checks,
  limitations: [
    '未使用实体手机、屏幕阅读器与真实浏览器 UI 缩放；移动端为浏览器视口模拟。',
    '观感类判据（是否成立 Editorial Notebook、mark 是否过于工程化）由用户视觉审核判定，本脚本只记录可测量事实。',
    '本轮只覆盖样板区域，全域页面仍待 Phase 4／Phase 5。'
  ]
};
fs.writeFileSync(path.join(out, 'narrative-checks.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`\n${report.passed} passed, ${report.failed} failed`);
process.exitCode = problems.length ? 1 : 0;
