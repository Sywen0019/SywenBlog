// E01 文章小画体系检查（验证用；网站本身没有 npm 或运行时依赖）
//
// 用法：
//   node docs/evidence/e01/illustration-checks.mjs                     Edge + Chrome + Firefox（有则跑）
//   node docs/evidence/e01/illustration-checks.mjs --browser=edge
//   node docs/evidence/e01/illustration-checks.mjs --browser=chrome
//   $env:PLAYWRIGHT_BROWSERS_PATH='L:/Sywen-Blog/.tmp-browser/browsers'; node docs/evidence/e01/illustration-checks.mjs --browser=firefox
//
// 输出：illustration-checks-<browser>.json、illustration-report.txt、e01-*.png
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { chromium, firefox } from '../../../.tmp-browser/node_modules/playwright/index.mjs';

const root = path.resolve(import.meta.dirname, '../../..');
const out = import.meta.dirname;
const LIMIT_BYTES = 40 * 1024;
const CATEGORIES = [
  { id: 'study', name: '学业', count: 3, file: 'cat-study.webp' },
  { id: 'life', name: '生活', count: 1, file: 'cat-life.webp' },
  { id: 'favorites', name: '我喜欢的', count: 0, file: 'cat-favorites.webp' },
];
const STATIC_CATEGORY = {
  'attention-intuition': 'study',
  'dom-search-notes': 'study',
  'paper-reading-notes': 'study',
  'leave-some-space': 'life',
};
const WIDTHS = [320, 390, 767, 768, 769, 1024, 1440];
const LIMITATIONS = [
  '未使用实体手机与屏幕阅读器；移动端为浏览器视口模拟。',
  '观感类判据（线条协调、卡片节奏）由 E06 的 VC2 正式判定，本脚本只记录可测量事实；本轮仅本地，不宣告 VC2 通过。',
];

const arg = (name) => {
  const hit = process.argv.find((value) => value.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const requested = (arg('browser') || 'edge,chrome,firefox').split(',').map((value) => value.trim());
const sha256 = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');

// ---------------------------------------------------------------------------
// 1) 静态资产与清单（在浏览器之外完成）
// ---------------------------------------------------------------------------
const fileChecks = [];
function checkFile(name, fn) {
  try { fn(); fileChecks.push({ name, pass: true }); }
  catch (error) { fileChecks.push({ name, pass: false, error: error.message }); console.error('FAIL', name, error.message); }
}
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/category-assets.json'), 'utf8'));
assert.equal(manifest.length, 3);
for (const cat of CATEGORIES) {
  const rel = `assets/images/${cat.file}`;
  const abs = path.join(root, rel);
  const record = manifest.find((item) => item.category === cat.id);
  checkFile(`${rel} exists`, () => assert.ok(fs.existsSync(abs)));
  checkFile(`${rel} <=40KB`, () => { const n = fs.statSync(abs).size; assert.ok(n <= LIMIT_BYTES, `${n} > ${LIMIT_BYTES}`); });
  checkFile(`${rel} is WebP (RIFF/WEBP)`, () => {
    const head = fs.readFileSync(abs).subarray(0, 12).toString('latin1');
    assert.equal(head.slice(0, 4), 'RIFF');
    assert.equal(head.slice(8, 12), 'WEBP');
  });
  checkFile(`${rel} manifest bytes/sha/4:3`, () => {
    assert.ok(record, 'manifest record missing');
    assert.equal(record.file, rel);
    assert.equal(record.bytes, fs.statSync(abs).size);
    assert.equal(record.sha256, sha256(abs));
    assert.equal(record.width, 640);
    assert.equal(record.height, 480);
  });
}

// ---------------------------------------------------------------------------
// 本地服务器（含 /course/blog/ 子目录映射）
// ---------------------------------------------------------------------------
const server = http.createServer((req, res) => {
  try {
    let name = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    if (name.startsWith('/course/blog/')) name = name.slice('/course/blog'.length);
    if (name.endsWith('/')) name += 'index.html';
    const file = path.resolve(root, '.' + name);
    if (!file.startsWith(root + path.sep) || !fs.statSync(file).isFile()) throw new Error('not found');
    const type = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.json': 'application/json' }[path.extname(file)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(fs.readFileSync(file));
  } catch (_) { res.writeHead(404); res.end('Not found'); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/`;

async function shot(page, name) {
  const file = path.join(out, name + '.png');
  try { await page.screenshot({ path: file, fullPage: true }); }
  catch (_) { await new Promise((r) => setTimeout(r, 250)); await page.screenshot({ path: file, fullPage: true }); }
  return name + '.png';
}
// 触发懒加载并等待指定图片全部解码完成（持续滚入视口，兼容 Firefox 的懒加载调度）。
async function settleImages(page, selector) {
  await page.evaluate(async (sel) => {
    const nodes = Array.from(document.querySelectorAll(sel));
    const pending = () => nodes.filter((img) => !img.complete || img.naturalWidth === 0);
    const deadline = Date.now() + 6000;
    while (pending().length && Date.now() < deadline) {
      pending().forEach((img) => img.scrollIntoView({ block: 'center' }));
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await Promise.all(nodes.map((img) => img.decode().catch(() => {})));
    window.scrollTo(0, 0);
  }, selector);
}

async function runBrowser(label, launch) {
  let browser;
  const checks = [];
  const screenshots = [];
  const failures = [];
  async function check(name, fn) {
    try { const detail = await fn(); checks.push({ name, pass: true, detail }); }
    catch (error) { failures.push(name); checks.push({ name, pass: false, error: error.message }); console.error('FAIL', `[${label}]`, name, error.message); }
  }
  try {
    browser = await launch();
    checks.push({ name: 'version', pass: true, detail: browser.version() });

    // --- 首页分类卡：桌面 -------------------------------------------------
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push('pageerror:' + e.message));
      page.on('response', (r) => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
      await page.goto(base + 'index.html');
      await settleImages(page, '#home-categories img');
      await check('home: three category cards map to study/life/favorites', async () => {
        const cards = await page.$$eval('#home-categories .category-link', (els) => els.map((a) => ({
          href: a.getAttribute('href'),
          img: a.querySelector('img')?.getAttribute('src'),
          name: a.querySelector('.category-link__name')?.textContent,
          count: a.querySelector('[data-category-count]')?.textContent,
          tone: ['study', 'life', 'favorites'].find((id) => a.classList.contains('category-link--' + id)) || null,
          number: a.querySelector('.category-link__number')?.textContent || null,
        })));
        assert.deepEqual(cards.map((c) => c.img), CATEGORIES.map((c) => `./assets/images/${c.file}`));
        assert.deepEqual(cards.map((c) => c.name), CATEGORIES.map((c) => c.name));
        assert.deepEqual(cards.map((c) => c.count), CATEGORIES.map((c) => String(c.count)));
        cards.forEach((c, i) => {
          assert.ok(c.href.includes(`category=${CATEGORIES[i].id}`));
          // 2026-09-18 起分类入口不再使用完整卡片外框，改用编号 + 结构线 + 分类气质类。
          assert.equal(c.tone, CATEGORIES[i].id);
          assert.equal(c.number, `C-0${i + 1}`);
        });
      });
      await check('home: card art is decorative 640x480 lazy and loaded', async () => {
        const facts = await page.$$eval('#home-categories .art-frame--category', (frames) => frames.map((f) => {
          const img = f.querySelector('img');
          return { aria: f.getAttribute('aria-hidden'), alt: img.alt, loading: img.loading, decoding: img.decoding,
            w: img.getAttribute('width'), h: img.getAttribute('height'), natural: [img.naturalWidth, img.naturalHeight],
            tab: img.tabIndex, frameFailed: f.classList.contains('is-failed') };
        }));
        assert.equal(facts.length, 3);
        facts.forEach((f) => {
          assert.equal(f.aria, 'true');
          assert.equal(f.alt, '');
          assert.equal(f.loading, 'lazy');
          assert.equal(f.decoding, 'async');
          assert.equal(f.w, '640');
          assert.equal(f.h, '480');
          assert.deepEqual(f.natural, [640, 480]);
          assert.equal(f.tab, -1);
          assert.equal(f.frameFailed, false);
        });
      });
      await check('home: desktop card art is full-width 4:3 above the label', async () => {
        const boxes = await page.$$eval('#home-categories .category-link', (els) => els.map((a) => {
          const art = a.querySelector('.category-link__art').getBoundingClientRect();
          const body = a.querySelector('.category-link__body').getBoundingClientRect();
          const num = a.querySelector('.category-link__number').getBoundingClientRect();
          return { aw: art.width, ah: art.height, artBottom: art.bottom, bodyTop: body.top,
            aw2: a.getBoundingClientRect().width, numBottom: num.bottom, artTop: art.top };
        }));
        boxes.forEach((b) => {
          assert.ok(Math.abs(b.ah - b.aw * 0.75) <= 2, `aspect ${b.aw}x${b.ah}`);
          // 去卡片化后小画通栏占满分类入口宽度，只受图框 1px 边框影响。
          assert.ok(Math.abs(b.aw - (b.aw2 - 2)) <= 2, `art width ${b.aw} vs entry ${b.aw2}`);
          assert.ok(b.artBottom <= b.bodyTop + 4, 'art should sit above label');
          assert.ok(b.numBottom <= b.artTop + 4, 'number should sit above art');
        });
      });
      await check('home: recent articles stay text-only (no thumbnails)', async () => {
        assert.equal(await page.locator('#home-recent img').count(), 0);
        assert.equal(await page.locator('#home-recent .post-entry__thumb').count(), 0);
        // 归档编号是 Narrative 装饰，不承担信息；Home 与 Blog 共用同一套档案编号。
        const numbers = await page.locator('#home-recent .post-entry__number').allInnerTexts();
        assert.deepEqual(numbers, ['A-01', 'A-02', 'A-03']);
      });
      await check('home: no resource/JS errors', () => assert.deepEqual(errors, []));
      screenshots.push(await shot(page, 'e01-home-1440-light'));
      await ctx.close();
    }

    // --- 首页分类卡：手机 + 深色 ------------------------------------------
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, colorScheme: 'dark' });
      const page = await ctx.newPage();
      await page.goto(base + 'index.html');
      await settleImages(page, '#home-categories img');
      await check('home: mobile card art is 96x72 to the left of label', async () => {
        const boxes = await page.$$eval('#home-categories .category-link', (els) => els.map((a) => {
          const art = a.querySelector('.category-link__art').getBoundingClientRect();
          const body = a.querySelector('.category-link__body').getBoundingClientRect();
          return { aw: art.width, ah: art.height, artRight: art.right, bodyLeft: body.left, overlap: !(art.bottom < body.top || art.top > body.bottom) };
        }));
        boxes.forEach((b) => {
          assert.ok(Math.abs(b.aw - 96) <= 1, `w ${b.aw}`);
          assert.ok(Math.abs(b.ah - 72) <= 1, `h ${b.ah}`);
          assert.ok(b.artRight <= b.bodyLeft + 2, 'art should be left of label');
          assert.ok(b.overlap, 'art and label should share a row');
        });
      });
      await check('home: dark theme keeps warm art frame (no inversion)', async () => {
        const frameBg = await page.locator('#home-categories .art-frame--category').first().evaluate((f) => getComputedStyle(f).backgroundColor);
        const filter = await page.locator('#home-categories .art-frame--category img').first().evaluate((img) => getComputedStyle(img).filter);
        assert.equal(frameBg, 'rgb(255, 255, 255)');
        assert.equal(filter, 'none');
      });
      screenshots.push(await shot(page, 'e01-home-390-dark'));
      await ctx.close();
    }

    // --- Blog 动态缩略：桌面尺寸 + 分类映射 -------------------------------
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push('pageerror:' + e.message));
      page.on('response', (r) => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
      await page.goto(base + 'blog.html');
      await page.locator('#search-input').waitFor({ state: 'visible' });
      await settleImages(page, '#blog-results img');
      await check('blog: JS renders dynamic list and hides static fallback', async () => {
        assert.equal(await page.locator('#blog-results').isHidden(), false);
        assert.equal(await page.locator('#blog-static-list').isHidden(), true);
        assert.equal(await page.locator('#blog-results .post-entry').count(), 4);
      });
      await check('blog: entries carry archive numbers and category marks, no thumbnails', async () => {
        // 2026-09-18 视觉架构重构：取消分类缩略图作为默认文章封面，
        // Blog 条目改为日期 + 编号 + 标题 + 摘要 + 分类 mark。
        const rows = await page.$$eval('#blog-results .post-entry', (els) => els.map((li) => ({
          slug: li.dataset.postId,
          images: li.querySelectorAll('img').length,
          withThumb: li.classList.contains('post-entry--with-thumb'),
          number: li.querySelector('.post-entry__number')?.textContent || null,
          mark: li.querySelector('.category-mark svg use')?.getAttribute('href') || null,
        })));
        assert.equal(rows.length, 4);
        assert.deepEqual(rows.map((r) => r.number), ['A-01', 'A-02', 'A-03', 'A-04']);
        rows.forEach((r) => {
          assert.equal(r.images, 0, r.slug);
          assert.equal(r.withThumb, false, r.slug);
          assert.ok(r.mark && r.mark.includes('marks.svg#mark-'), `${r.slug}: ${r.mark}`);
        });
      });
      await check('blog: filtering keeps the list consistent (study=3, life=1)', async () => {
        await page.locator('[data-category="study"]').click();
        assert.equal(await page.locator('#blog-results .post-entry').count(), 3);
        assert.equal(await page.locator('#blog-results img').count(), 0);
        await page.locator('[data-category="life"]').click();
        assert.equal(await page.locator('#blog-results .post-entry').count(), 1);
        // 编号跟着文章本身，不跟着筛选结果，因此 life 那篇仍是 A-04。
        assert.deepEqual(await page.locator('#blog-results .post-entry__number').allInnerTexts(), ['A-04']);
        await page.locator('[data-category="all"]').click();
      });
      await check('blog: no resource/JS errors', () => assert.deepEqual(errors, []));
      screenshots.push(await shot(page, 'e01-blog-1440-light'));
      await ctx.close();
    }

    // --- Blog 手机尺寸 ----------------------------------------------------
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, colorScheme: 'light' });
      const page = await ctx.newPage();
      await page.goto(base + 'blog.html');
      await page.locator('#search-input').waitFor({ state: 'visible' });
      await settleImages(page, '#blog-results img');
      await check('blog: mobile entries stay text-only with numbers', async () => {
        assert.equal(await page.locator('#blog-results img').count(), 0);
        assert.deepEqual(await page.locator('#blog-results .post-entry__number').allInnerTexts(), ['A-01', 'A-02', 'A-03', 'A-04']);
      });
      screenshots.push(await shot(page, 'e01-blog-390-light'));
      await ctx.close();
    }

    // --- 图片失败：收起图框、文字与链接保持完整 -----------------------------
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
      const page = await ctx.newPage();
      await page.route('**/cat-*.webp', (route) => route.abort());
      await page.goto(base + 'blog.html');
      await page.locator('#search-input').waitFor({ state: 'visible' });
      await check('blog: list requests no category art, entries and links remain', async () => {
        assert.equal(await page.locator('#blog-results img').count(), 0);
        assert.equal(await page.locator('#blog-results .post-entry__link:visible').count(), 4);
      });
      await page.goto(base + 'index.html');
      await page.evaluate(() => document.querySelector('#home-categories').scrollIntoView());
      await page.waitForFunction(() => Array.from(document.querySelectorAll('#home-categories .art-frame--category')).every((f) => f.classList.contains('is-failed')), null, { timeout: 8000 });
      await check('home: failed card art collapses but cards/links remain', async () => {
        const hidden = await page.$$eval('#home-categories .art-frame--category', (els) => els.map((e) => getComputedStyle(e).display === 'none'));
        assert.deepEqual(hidden, [true, true, true]);
        assert.equal(await page.locator('#home-categories .category-link:visible').count(), 3);
        const names = await page.locator('#home-categories .category-link__name').allInnerTexts();
        assert.deepEqual(names, ['学业', '生活', '我喜欢的']);
      });
      screenshots.push(await shot(page, 'e01-image-failed-1440'));
      await ctx.close();
    }

    // --- 无脚本：静态列表与静态分类卡一致 ----------------------------------
    {
      const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 }, colorScheme: 'dark' });
      const page = await ctx.newPage();
      await page.goto(base + 'blog.html');
      await check('no-js: static blog list keeps four text entries with archive numbers', async () => {
        assert.equal(await page.locator('#blog-filters').isVisible(), false);
        assert.equal(await page.locator('#blog-static-list img').count(), 0);
        assert.deepEqual(await page.locator('#blog-static-list .post-entry__number').allInnerTexts(), ['A-01', 'A-02', 'A-03', 'A-04']);
        assert.equal(await page.locator('#blog-static-list .post-entry__link:visible').count(), 4);
      });
      await page.goto(base + 'index.html');
      await check('no-js: home cards present with hardcoded counts', async () => {
        assert.equal(await page.locator('#home-categories .category-link').count(), 3);
        const counts = await page.locator('#home-categories [data-category-count]').allInnerTexts();
        assert.deepEqual(counts, ['3', '1', '0']);
      });
      screenshots.push(await shot(page, 'e01-home-nojs-390-dark'));
      await ctx.close();
    }

    // --- 子目录部署 -------------------------------------------------------
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
      const page = await ctx.newPage();
      const errors = [];
      page.on('response', (r) => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
      await page.goto(base + 'course/blog/blog.html');
      await page.locator('#search-input').waitFor({ state: 'visible' });
      await check('subdirectory: blog list stays text-only and numbered', async () => {
        assert.equal(await page.locator('#blog-results img').count(), 0);
        assert.equal(await page.locator('#blog-results .post-entry').count(), 4);
      });
      await page.goto(base + 'course/blog/index.html');
      await settleImages(page, '#home-categories img');
      await check('subdirectory: home card art resolves under /course/blog/', async () => {
        const ok = await page.$$eval('#home-categories img', (els) => els.every((i) => i.complete && i.naturalWidth === 640));
        assert.equal(ok, true);
      });
      await check('subdirectory: no 404s', () => assert.deepEqual(errors, []));
      await ctx.close();
    }

    // --- 响应式溢出矩阵（浅/深） ------------------------------------------
    for (const theme of ['light', 'dark']) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme });
      const page = await ctx.newPage();
      for (const name of ['index.html', 'blog.html']) {
        for (const width of WIDTHS) {
          await check(`${theme} ${name} ${width}px no horizontal overflow / no broken art`, async () => {
            await page.setViewportSize({ width, height: 900 });
            await page.goto(base + name);
            if (name === 'blog.html') await page.locator('#search-input').waitFor({ state: 'visible' });
            await settleImages(page, 'img');
            const result = await page.evaluate(() => ({
              scroll: document.documentElement.scrollWidth,
              viewport: innerWidth,
              broken: Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0 && !i.closest('.art-frame.is-failed')).map((i) => i.src),
            }));
            assert.ok(result.scroll <= width + 1, JSON.stringify({ width, ...result }));
            assert.deepEqual(result.broken, []);
          });
        }
      }
      await ctx.close();
    }
  } catch (error) {
    failures.push('availability');
    checks.push({ name: 'availability', pass: false, error: error.message });
    console.error('FAIL', `[${label}]`, error.message);
  } finally {
    if (browser) await browser.close();
  }

  const report = {
    task: 'E01 category illustrations', browser: label,
    at: new Date().toISOString(),
    passed: checks.filter((c) => c.pass).length,
    failed: failures.length,
    checks, screenshots, limitations: LIMITATIONS,
  };
  fs.writeFileSync(path.join(out, `illustration-checks-${label}.json`), JSON.stringify(report, null, 2));
  return report;
}

const runners = [];
if (requested.includes('edge')) runners.push(['edge', () => chromium.launch({ channel: 'msedge', headless: true })]);
if (requested.includes('chrome')) runners.push(['chrome', () => chromium.launch({ channel: 'chrome', headless: true })]);
if (requested.includes('firefox')) runners.push(['firefox', () => firefox.launch({ headless: true })]);

const reports = [];
for (const [label, launch] of runners) {
  try { reports.push(await runBrowser(label, launch)); }
  catch (error) { reports.push({ browser: label, failed: 1, checks: [{ name: 'launch', pass: false, error: error.message }] }); }
}
server.close();

const lines = [];
lines.push('E01 illustration checks');
for (const c of fileChecks) lines.push(`${c.pass ? 'PASS' : 'FAIL'}  [file] ${c.name}${c.pass ? '' : ' — ' + c.error}`);
let totalFailed = fileChecks.filter((c) => !c.pass).length;
for (const r of reports) {
  lines.push('');
  lines.push(`## ${r.browser}: ${r.passed ?? 0} passed, ${r.failed} failed`);
  (r.checks || []).filter((c) => !c.pass).forEach((c) => lines.push(`FAIL  [${r.browser}] ${c.name} — ${c.error}`));
  totalFailed += r.failed || 0;
}
lines.push('');
lines.push(totalFailed === 0 ? 'ALL CHECKS PASSED' : `${totalFailed} CHECK(S) FAILED`);
fs.writeFileSync(path.join(out, 'illustration-report.txt'), lines.join('\n') + '\n');
console.log(lines.join('\n'));
process.exitCode = totalFailed ? 1 : 0;
