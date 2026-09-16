// E03 阅读增强检查（验证用；网站本身没有 npm 或运行时依赖）
//
// 用法：
//   node docs/evidence/e03/reading-checks.mjs                       Edge + Chrome + Firefox（有则跑）
//   node docs/evidence/e03/reading-checks.mjs --browser=edge
//   node docs/evidence/e03/reading-checks.mjs --browser=chrome
//   PLAYWRIGHT_BROWSERS_PATH=L:/Sywen-Blog/.tmp-browser/browsers node docs/evidence/e03/reading-checks.mjs --browser=firefox
//
// 输出：reading-checks-<browser>.json、reading-report.txt、e03-*.png
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { chromium, firefox } from '../../../.tmp-browser/node_modules/playwright/index.mjs';
import { comparePng, decodePng } from './png-compare.mjs';

const decodeSize = (file) => {
  const image = decodePng(file);
  return [image.width, image.height];
};

const root = path.resolve(import.meta.dirname, '../../..');
const out = import.meta.dirname;
const pages = ['index.html', 'blog.html', 'about.html',
  'posts/attention-intuition.html', 'posts/dom-search-notes.html',
  'posts/paper-reading-notes.html', 'posts/leave-some-space.html'];
const LIMITATIONS = [
  '未使用实体手机与屏幕阅读器；移动端为浏览器视口模拟。',
  '观感类判据由 E06 的 VC2 正式判定，本脚本只记录可测量事实。',
];

const arg = (name) => {
  const hit = process.argv.find((value) => value.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const requested = (arg('browser') || 'edge,chrome,firefox').split(',').map((value) => value.trim());
const clamped = (value) => Math.max(0, Math.min(100, Math.round(value)));
const frames = 'new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))';
// 进度线与返回顶部按设计是 0–2px 的固定元素，Playwright 的可见性判定不适用，只检查 hidden 已移除。
const revealed = (page) => page.waitForFunction(() => {
  const bar = document.getElementById('reading-progress');
  const button = document.getElementById('back-to-top');
  return Boolean(window.Sywen && window.Sywen.getReadingProgress && bar && !bar.hasAttribute('hidden')
    && button && !button.hasAttribute('hidden'));
}, null, { timeout: 10000 });
const buttonShown = (page) => page.waitForFunction(() => {
  const button = document.getElementById('back-to-top');
  return button.classList.contains('is-visible') && getComputedStyle(button).visibility === 'visible';
}, null, { timeout: 10000 });
// 测量时禁用 CSS 平滑滚动（html{scroll-behavior:smooth}），让 scrollTop 赋值立即生效。
const noSmooth = (target) => target.evaluate(`(() => {
  document.documentElement.style.scrollBehavior = 'auto';
  const scroller = document.scrollingElement;
  if (scroller && scroller !== document.documentElement) scroller.style.scrollBehavior = 'auto';
})()`);
const scrollToTop = async (target, top) => {
  const applied = await target.evaluate(`(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const scroller = document.scrollingElement || document.documentElement;
    scroller.style.scrollBehavior = 'auto';
    const max = scroller.scrollHeight - scroller.clientHeight;
    const wanted = Math.max(0, Math.min(${top}, max));
    scroller.scrollTop = wanted;
    return Math.round(scroller.scrollTop);
  })()`);
  await target.waitForFunction(`Math.round((document.scrollingElement || document.documentElement).scrollTop) === ${applied}`, null, { timeout: 5000 });
  // 滚动事件与 requestAnimationFrame 更新是异步的：等 reading.js 真正写入一次。
  await target.waitForFunction(`(() => {
    const scroller = document.scrollingElement || document.documentElement;
    const max = scroller.scrollHeight - scroller.clientHeight;
    const expected = max <= 0 ? 100 : Math.max(0, Math.min(100, Math.round((scroller.scrollTop / max) * 100)));
    return Math.abs(window.Sywen.getReadingProgress() - expected) <= 1;
  })()`, null, { timeout: 5000 });
  return applied;
};

// 页面内探针：进度线、返回顶部、页脚遮挡。
function pageProbe() {
  window.__e03probe = () => {
    const bar = document.getElementById('reading-progress');
    const button = document.getElementById('back-to-top');
    const scroller = document.scrollingElement || document.documentElement;
    const meta = getComputedStyle(bar);
    const btn = button ? getComputedStyle(button) : null;
    const rect = button ? button.getBoundingClientRect() : null;
    const footer = document.querySelector('.site-footer__inner');
    const footerRect = footer ? footer.getBoundingClientRect() : null;
    // 页脚内容（最后一行 p/a/span/li）的最低边缘，用于计算与按钮的净空。
    let footerContentBottom = null;
    if (footer) {
      for (const node of footer.querySelectorAll('p, a, span, li')) {
        const box = node.getBoundingClientRect();
        if (box.bottom <= box.top || box.right <= box.left) continue;
        footerContentBottom = footerContentBottom === null ? box.bottom : Math.max(footerContentBottom, box.bottom);
      }
    }
    let hit = null;
    if (rect && footerRect) {
      for (const node of footer.querySelectorAll('p, a, span, li')) {
        const box = node.getBoundingClientRect();
        if (box.bottom <= box.top || box.right <= box.left) continue;
        const overlapX = Math.min(box.right, rect.right) - Math.max(box.left, rect.left);
        const overlapY = Math.min(box.bottom, rect.bottom) - Math.max(box.top, rect.top);
        if (overlapX > 0.5 && overlapY > 0.5) {
          hit = { text: node.textContent.trim().slice(0, 24), overlapX: Math.round(overlapX), overlapY: Math.round(overlapY) };
          break;
        }
      }
    }
    const round = (value) => Math.round(value * 100) / 100;
    return {
      scrollTop: Math.round(scroller.scrollTop),
      maxScroll: Math.round(scroller.scrollHeight - scroller.clientHeight),
      documentHeight: Math.round(scroller.scrollHeight),
      progress: window.Sywen ? window.Sywen.getReadingProgress() : 'no-api',
      aria: bar ? bar.getAttribute('aria-valuenow') : null,
      role: bar ? bar.getAttribute('role') : null,
      hidden: bar ? bar.hasAttribute('hidden') : null,
      barDisplay: meta.display,
      barHeight: meta.height,
      barPosition: meta.position,
      barTrack: round(bar.getBoundingClientRect().width),
      barTransform: bar.style.transform,
      barPointer: meta.pointerEvents,
      buttonHiddenAttr: button ? button.hasAttribute('hidden') : null,
      buttonDisplay: btn ? btn.display : null,
      buttonVisibility: btn ? btn.visibility : null,
      buttonOpacity: btn ? btn.opacity : null,
      buttonPointer: btn ? btn.pointerEvents : null,
      buttonVisibleClass: button ? button.classList.contains('is-visible') : null,
      buttonWidth: rect ? round(rect.width) : null,
      buttonHeight: rect ? round(rect.height) : null,
      buttonRight: rect ? round(innerWidth - rect.right) : null,
      buttonBottom: rect ? round(innerHeight - rect.bottom) : null,
      buttonTop: rect ? round(rect.top) : null,
      footerTop: footerRect ? round(footerRect.top) : null,
      footerBottom: footerRect ? round(footerRect.bottom) : null,
      footerContentBottom: footerContentBottom === null ? null : round(footerContentBottom),
      footerOverlap: hit,
      active: document.activeElement ? (document.activeElement.tagName + (document.activeElement.className ? '.' + String(document.activeElement.className).split(' ')[0] : '')) : null,
      scriptOrder: Array.from(document.scripts).map((s) => s.getAttribute('src')).filter(Boolean),
      outstandingHidden: ['quick-menu-button', 'site-notice', 'copy-panel', 'context-menu']
        .filter((id) => { const el = document.getElementById(id); return el && !el.hasAttribute('hidden'); }),
      titleTag: (() => { const t = document.querySelector('.page-title, .hero__title'); return t ? t.tagName : null; })(),
      titleTabindex: (() => { const t = document.querySelector('.page-title, .hero__title'); return t ? t.getAttribute('tabindex') : null; })(),
      viewport: [innerWidth, innerHeight],
    };
  };
}

// 按最大滚动距离的比例定位（0～1），用于「中段」采样。
const scrollToSpot = async (target, ratio) => {
  const applied = await target.evaluate(`(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const scroller = document.scrollingElement || document.documentElement;
    scroller.style.scrollBehavior = 'auto';
    const max = scroller.scrollHeight - scroller.clientHeight;
    scroller.scrollTop = Math.round(max * ${ratio});
    return Math.round(scroller.scrollTop);
  })()`);
  await target.waitForFunction(`(document.scrollingElement || document.documentElement).scrollTop === ${applied}`, null, { timeout: 5000 });
  await target.waitForFunction(`Math.abs(window.Sywen.getReadingProgress() - Math.round(${applied} / ((document.scrollingElement || document.documentElement).scrollHeight - (document.scrollingElement || document.documentElement).clientHeight) * 100)) <= 1`, null, { timeout: 5000 });
  return applied;
};

let failures = 0;
let report = null;
async function check(name, fn) {
  try {
    const detail = await fn();
    report.checks.push({ name, pass: true, detail: detail ?? null });
  } catch (error) {
    failures++;
    report.checks.push({ name, pass: false, error: String((error && error.message) || error) });
    console.error('FAIL', name, String((error && error.message) || error));
  }
}

const server = http.createServer((req, res) => {
  try {
    let name = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    if (name.startsWith('/course/blog/')) name = name.slice('/course/blog'.length);
    if (name.endsWith('/')) name += 'index.html';
    const file = path.resolve(root, '.' + name);
    if (!file.startsWith(root + path.sep) || !fs.statSync(file).isFile()) throw new Error('not found');
    const type = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json' }[path.extname(file)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(fs.readFileSync(file));
  } catch (_) { res.writeHead(404); res.end('Not found'); }
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(Number(arg('port') || 8199), '127.0.0.1', resolve);
});
const base = `http://127.0.0.1:${server.address().port}/`;

async function run(browserName, browser) {
  report = {
    task: 'E03',
    browser: browserName,
    browserVersion: browser.version(),
    baseUrl: base,
    baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    at: new Date().toISOString(),
    checks: [],
    screenshots: [],
    limitations: LIMITATIONS,
  };
  failures = 0;
  const shot = async (page, name) => {
    await page.screenshot({ path: path.join(out, name + '.png') });
    report.screenshots.push(name + '.png');
  };

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light', reducedMotion: 'no-preference' });
  await context.addInitScript(pageProbe);
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];
  page.on('pageerror', (error) => errors.push('pageerror: ' + error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push('console: ' + message.text()); });
  page.on('response', (res) => { if (res.status() >= 400) failedRequests.push(res.status() + ' ' + res.url()); });
  const open = async (rel) => {
    await page.goto(base + rel);
    await revealed(page);
    await noSmooth(page);
  };
  const settle = async () => page.evaluate(`(${frames})`);

  await check('1. 七页 reading.js 加载顺序与资源', async () => {
    const detail = {};
    for (const rel of pages) {
      await open(rel);
      const order = await page.evaluate(() => Array.from(document.scripts).map((s) => s.getAttribute('src')).filter(Boolean));
      const expected = rel.startsWith('posts/')
        ? ['../js/theme.js', '../js/posts-data.js', '../js/site.js', '../js/reading.js']
        : rel === 'blog.html'
          ? ['./js/theme.js', './js/posts-data.js', './js/site.js', './js/blog.js', './js/reading.js']
          : ['./js/theme.js', './js/posts-data.js', './js/site.js', './js/reading.js'];
      assert.deepEqual(order, expected, `${rel} 脚本顺序不符`);
      const defer = await page.evaluate(() => Array.from(document.scripts)
        .filter((s) => s.getAttribute('src') && !s.getAttribute('src').endsWith('theme.js'))
        .every((s) => s.defer));
      assert.ok(defer, `${rel} 缺少 defer`);
      detail[rel] = order.length;
    }
    assert.equal(failedRequests.length, 0, '资源请求失败：' + failedRequests.join(', '));
    assert.equal(errors.length, 0, '页面异常：' + errors.join(' | '));
    return detail;
  });

  await check('2. 进度元素语义与揭示', async () => {
    await open('posts/attention-intuition.html');
    const state = await page.evaluate('window.__e03probe()');
    assert.equal(state.hidden, false, 'hidden 未移除');
    assert.equal(state.role, 'progressbar');
    assert.equal(state.barDisplay, 'block', 'display=' + state.barDisplay);
    assert.equal(state.barHeight, '2px', 'height=' + state.barHeight);
    assert.equal(state.barPosition, 'fixed');
    assert.equal(state.barPointer, 'none');
    const label = await page.getAttribute('#reading-progress', 'aria-label');
    const min = await page.getAttribute('#reading-progress', 'aria-valuemin');
    const max = await page.getAttribute('#reading-progress', 'aria-valuemax');
    assert.equal(label, '阅读进度');
    assert.equal(min, '0');
    assert.equal(max, '100');
    assert.deepEqual(state.outstandingHidden, [], '未领取的增强控件被提前显示：' + state.outstandingHidden.join(','));
    assert.equal(state.titleTabindex, '-1', '主标题缺少 tabindex=-1');
    const hasReading = await page.evaluate(() => document.documentElement.classList.contains('has-reading'));
    assert.equal(hasReading, true, '缺少 has-reading（页脚预留空间依赖它）');
    // 页脚预留空间只在脚本就绪后生效（html.has-reading）
    const reserve = await page.evaluate(() => getComputedStyle(document.querySelector('.site-footer__inner')).paddingBottom);
    assert.ok(parseFloat(reserve) >= 88, '页脚预留空间不足：' + reserve);
    return { barHeight: state.barHeight, titleTag: state.titleTag, footerPaddingBottom: reserve, outstandingHidden: state.outstandingHidden };
  });

  await check('3. 进度值符合公式（顶/中/底）', async () => {
    const samples = [];
    for (const where of ['top', 'mid', 'bottom']) {
      await open('posts/attention-intuition.html');
      if (where === 'top') await scrollToTop(page, 0);
      // 'mid' 与 'bottom' 用分数/超大值，具体位置在页面内按当前文档高度换算
      if (where === 'mid') await scrollToSpot(page, 0.5);
      if (where === 'bottom') await scrollToTop(page, 99999);
      const state = await page.evaluate(`(async () => {
        const scroller = document.scrollingElement;
        const max = scroller.scrollHeight - scroller.clientHeight;
        const probe = window.__e03probe();
        return { probe, expect: max <= 0 ? 100 : Math.max(0, Math.min(100, Math.round((scroller.scrollTop / max) * 100))), max, raw: scroller.scrollTop };
      })()`);
      const delta = Math.abs(state.probe.progress - state.expect);
      // 浏览器取整与脚本取整可能差 1（如 5.49% → 5 与 6）。
      assert.ok(delta <= 1, `${where} 进度 ${state.probe.progress} ≠ ${state.expect}（scrollTop=${state.raw}, max=${state.max}）`);
      assert.ok(Math.abs(Number(state.probe.aria) - state.expect) <= 1, `${where} aria-valuenow 不同步`);
      samples.push({ where, value: state.probe.progress, aria: state.probe.aria, expected: state.expect, maxScroll: state.maxScroll });
    }
    assert.equal(samples[0].value, samples[0].maxScroll <= 0 ? 100 : 0, '顶部不是 0%');
    assert.equal(samples[2].value, 100, '底部不是 100%');
    return samples;
  });

  await check('4. 进度线实际绘制宽度与百分比一致', async () => {
    await open('posts/attention-intuition.html');
    const detail = [];
    for (const ratio of [0.25, 0.6, 1]) {
      await scrollToSpot(page, ratio);
      const state = await page.evaluate(`(() => {
        const scroller = document.scrollingElement;
        const max = scroller.scrollHeight - scroller.clientHeight;
        const bar = document.getElementById('reading-progress');
        const scale = Number((bar.style.transform.match(/scaleX\\(([\\d.]+)\\)/) || [])[1]);
        const track = bar.getBoundingClientRect().width;
        return { scrollTop: Math.round(scroller.scrollTop), max, value: window.Sywen.getReadingProgress(), scale, paint: track * scale, track };
      })()`);
      const expected = clamped(Math.round((state.scrollTop / state.max) * 100));
      assert.ok(Math.abs(state.value - expected) <= 1, `进度 ${state.value} ≠ ${expected}`);
      assert.ok(Math.abs(state.paint - state.track * expected / 100) <= state.track / 100 + 1,
        `绘制宽度 ${state.paint} 与 ${expected}% 不符（轨道 ${state.track}）`);
      detail.push({ ratio, value: state.value, paintPx: Math.round(state.paint * 100) / 100, trackPx: Math.round(state.track * 100) / 100 });
    }
    return detail;
  });

  await check('5. 480px 阈值显隐', async () => {
    await open('posts/attention-intuition.html');
    const detail = [];
    for (const position of [0, 300, 1200]) {
      await scrollToTop(page, position);
      const state = await page.evaluate(`(async () => { await ${frames}; return window.__e03probe(); })()`);
      const visible = state.buttonVisibility === 'visible';
      // 以浏览器实际报告的滚动位置为准：>=480 显示，<480 隐藏；允许 1px 取整差。
      const expected = state.scrollTop >= 480;
      const offByRounding = Math.abs(state.scrollTop - 480) <= 1 && visible !== expected;
      assert.ok(visible === expected || offByRounding,
        `scrollTop=${state.scrollTop} 可见性 ${visible}（期望 ${expected}）`);
      assert.equal(state.buttonPointer, visible ? 'auto' : 'none');
      assert.equal(state.buttonVisibleClass, visible);
      detail.push({ requested: position, scrollTop: state.scrollTop, visibility: state.buttonVisibility, display: state.buttonDisplay, pointer: state.buttonPointer, isVisible: state.buttonVisibleClass });
    }
    return detail;
  });

  await check('6. 命中区≥44×44 且距边缘 16px', async () => {
    for (const [width, height] of [[390, 844], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      await open('posts/attention-intuition.html');
      await page.evaluate('document.scrollingElement.scrollTop = 1200');
      await buttonShown(page);
      const state = await page.evaluate('window.__e03probe()');
      assert.ok(state.buttonWidth >= 44 && state.buttonHeight >= 44, `${width}px 命中区 ${state.buttonWidth}×${state.buttonHeight}`);
      assert.ok(Math.abs(state.buttonRight - 16) <= 0.5, `${width}px 右边缘 ${state.buttonRight}`);
      assert.ok(Math.abs(state.buttonBottom - 16) <= 0.5, `${width}px 下边缘 ${state.buttonBottom}`);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    const state = await page.evaluate('window.__e03probe()');
    return { width: state.buttonWidth, height: state.buttonHeight, right: state.buttonRight, bottom: state.buttonBottom };
  });

  await check('7. 滚到底时返回顶部不遮挡页脚内容', async () => {
    const detail = {};
    for (const [width, height] of [[390, 844], [1440, 900]]) {
      for (const rel of ['posts/attention-intuition.html', 'blog.html', 'about.html', 'index.html']) {
        await page.setViewportSize({ width, height });
        await open(rel);
        await scrollToTop(page, 99999);
        const state = await page.evaluate('window.__e03probe()');
        assert.equal(state.footerOverlap, null, `${rel}@${width}px 按钮与页脚内容重叠 ${JSON.stringify(state.footerOverlap)}`);
        assert.ok(state.scrollTop > 480, `${rel}@${width}px 未滚动到底，按钮未显示`);
        assert.equal(state.buttonVisibleClass, true, `${rel}@${width}px 返回顶部未显示`);
        detail[`${rel}@${width}px`] = {
          buttonTop: state.buttonTop, buttonBottom: state.buttonBottom,
          footerTop: state.footerTop, footerBottom: state.footerBottom,
          footerContentBottom: state.footerContentBottom,
          clearance: state.footerContentBottom == null ? null : Math.round((state.buttonTop - state.footerContentBottom) * 100) / 100,
          scrollTop: state.scrollTop,
        };
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    return detail;
  });

  await check('8. 点击与键盘返回顶部并聚焦主标题', async () => {
    const detail = {};
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await open('posts/attention-intuition.html');
      await scrollToTop(page, 1600);
      await buttonShown(page);
      await page.click('#back-to-top');
      await page.waitForFunction(() => (document.scrollingElement || document.documentElement).scrollTop === 0, null, { timeout: 5000 })
        .catch(async (error) => { throw new Error(`点击后未回到顶部：${JSON.stringify(await page.evaluate('window.__e03probe()'))} (${error.message.split('\n')[0]})`); });
      await page.waitForFunction(() => document.activeElement && document.activeElement.classList.contains('page-title'), null, { timeout: 5000 })
        .catch(async (error) => { throw new Error(`点击后未聚焦主标题：${JSON.stringify(await page.evaluate('window.__e03probe()'))} (${error.message.split('\n')[0]})`); });
      // is-visible 由滚动事件驱动，visibility 还有 120ms 过渡：等它真正落下再断言。
      await page.waitForFunction(() => {
        const button = document.getElementById('back-to-top');
        return !button.classList.contains('is-visible') && getComputedStyle(button).visibility === 'hidden';
      }, null, { timeout: 5000 })
        .catch(async (error) => { throw new Error(`按钮未隐藏：${JSON.stringify(await page.evaluate('window.__e03probe()'))} (${error.message.split('\n')[0]})`); });
      const state = await page.evaluate('window.__e03probe()');
      assert.equal(state.progress, 0, '返回后进度 ' + state.progress);
      assert.equal(state.buttonVisibility, 'hidden', '返回后按钮仍可见');
      detail['click-' + width] = { focus: state.active, progress: state.progress, button: state.buttonVisibility };

      await scrollToTop(page, 1600);
      await page.locator('#back-to-top').focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => (document.scrollingElement || document.documentElement).scrollTop === 0, null, { timeout: 5000 });
      await page.waitForFunction(() => document.activeElement && document.activeElement.classList.contains('page-title'), null, { timeout: 5000 });
      detail['keyboard-' + width] = await page.evaluate(() => ({
        focus: document.activeElement.tagName,
        progress: window.Sywen.getReadingProgress(),
      }));
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    return detail;
  });

  await check('9. 减少动态效果下即时回到顶部', async () => {
    const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await reduced.addInitScript(pageProbe);
    const rp = await reduced.newPage();
    await rp.goto(base + 'posts/attention-intuition.html');
    await revealed(rp);
    await rp.evaluate('document.scrollingElement.scrollTop = 1600');
    await buttonShown(rp);
    const instant = await rp.evaluate(`(async () => {
      document.getElementById('back-to-top').click();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      return {
        top: document.scrollingElement.scrollTop,
        behavior: getComputedStyle(document.documentElement).scrollBehavior,
        helper: window.Sywen.prefersReducedMotion(),
      };
    })()`);
    assert.equal(instant.top, 0, '减少动态效果下未即时回到顶部：' + instant.top);
    assert.equal(instant.behavior, 'auto');
    assert.equal(instant.helper, true, 'prefersReducedMotion() 未识别');
    await rp.close();
    await reduced.close();
    return instant;
  });

  await check('10. 视口变化与延迟图片加载后重算', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open('posts/attention-intuition.html');
    await scrollToTop(page, 99999);
    const before = await page.evaluate('window.__e03probe()');
    assert.equal(before.progress, 100);
    await page.setViewportSize({ width: 1440, height: 500 });
    // 视口变矮后不一定仍在底部：resize 只要求按新尺寸重算。
    await page.waitForFunction(`(() => {
      const scroller = document.scrollingElement || document.documentElement;
      const max = scroller.scrollHeight - scroller.clientHeight;
      const expected = max <= 0 ? 100 : Math.max(0, Math.min(100, Math.round((scroller.scrollTop / max) * 100)));
      return Math.abs(window.Sywen.getReadingProgress() - expected) <= 1;
    })()`, null, { timeout: 5000 });
    const resized = await page.evaluate('window.__e03probe()');
    const expectedAfter = clamped(Math.round((resized.scrollTop / resized.maxScroll) * 100));
    assert.ok(Math.abs(resized.progress - expectedAfter) <= 1,
      `resize 后进度 ${resized.progress} ≠ ${expectedAfter}（已重算）`);
    await scrollToTop(page, 99999);
    const after = await page.evaluate('window.__e03probe()');
    assert.equal(after.progress, 100, 'resize 后滚到底不是 100%');
    assert.ok(after.maxScroll > before.maxScroll, `resize 后 maxScroll 未增大：${before.maxScroll} → ${after.maxScroll}`);

    const slow = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await slow.addInitScript(pageProbe);
    const sp = await slow.newPage();
    await sp.route('**/hero-desk-*.webp', async (route) => { await new Promise((r) => setTimeout(r, 700)); await route.continue(); });
    await sp.goto(base + 'index.html', { waitUntil: 'domcontentloaded' });
    await revealed(sp);
    const early = await sp.evaluate('window.__e03probe()');
    await sp.waitForLoadState('networkidle');
    await sp.evaluate(`(async () => { await ${frames}; })()`);
    const late = await sp.evaluate('window.__e03probe()');
    await sp.close();
    await slow.close();
    assert.ok(late.progress === 0 || late.progress === 100, '首屏进度 ' + late.progress);
    await page.setViewportSize({ width: 1440, height: 900 });
    return {
      resize: { before: before.maxScroll, after: after.maxScroll },
      hero: { earlyHeight: early.documentHeight, lateHeight: late.documentHeight, lateProgress: late.progress },
    };
  });
  await check('11. 深链接定位下进度一致', async () => {
    await page.setViewportSize({ width: 390, height: 700 });
    await page.goto(base + 'posts/attention-intuition.html#main');
    await revealed(page);
    await page.waitForFunction(`(() => {
      const scroller = document.scrollingElement || document.documentElement;
      const max = scroller.scrollHeight - scroller.clientHeight;
      const expected = max <= 0 ? 100 : Math.max(0, Math.min(100, Math.round((scroller.scrollTop / max) * 100)));
      return Math.abs(window.Sywen.getReadingProgress() - expected) <= 1;
    })()`, null, { timeout: 5000 });
    const state = await page.evaluate('window.__e03probe()');
    const expected = state.maxScroll <= 0 ? 100 : clamped(Math.round((state.scrollTop / state.maxScroll) * 100));
    assert.ok(Math.abs(state.progress - expected) <= 1,
      `深链接进度 ${state.progress} ≠ ${expected}（scrollTop=${state.scrollTop}, max=${state.maxScroll}）`);
    await page.setViewportSize({ width: 1440, height: 900 });
    return { scrollTop: state.scrollTop, maxScroll: state.maxScroll, progress: state.progress, expected };
  });

  await check('12. 无脚本时控件保持 hidden', async () => {
    const nojs = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const np = await nojs.newPage();
    const problems = [];
    for (const rel of pages) {
      await np.goto(base + rel);
      const state = await np.evaluate(() => {
        const bar = document.getElementById('reading-progress');
        const button = document.getElementById('back-to-top');
        return {
          barHidden: bar.hasAttribute('hidden'), barDisplay: getComputedStyle(bar).display,
          buttonHidden: button.hasAttribute('hidden'), buttonDisplay: getComputedStyle(button).display,
        };
      });
      if (!state.barHidden || state.barDisplay !== 'none' || !state.buttonHidden || state.buttonDisplay !== 'none') {
        problems.push(`${rel} ${JSON.stringify(state)}`);
      }
    }
    await nojs.close();
    assert.equal(problems.length, 0, problems.join('; '));
    const nojsReserve = await (async () => {
      const probe = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
      const np2 = await probe.newPage();
      await np2.goto(base + 'about.html');
      const padding = await np2.evaluate(() => getComputedStyle(document.querySelector('.site-footer__inner')).paddingBottom);
      await probe.close();
      return padding;
    })();
    assert.equal(parseFloat(nojsReserve), 32, '无脚本页脚留白应保持基线 32px，实际 ' + nojsReserve);
    return { pages: pages.length, allHidden: true, noScriptFooterPadding: nojsReserve };
  });

  await check('13. 子目录 /course/blog/ 下可用', async () => {
    await page.goto(base + 'course/blog/posts/attention-intuition.html');
    await revealed(page);
    await page.evaluate('document.scrollingElement.scrollTop = 900');
    await buttonShown(page);
    const state = await page.evaluate('window.__e03probe()');
    assert.ok(state.progress > 0 && state.progress <= 100, '进度 ' + state.progress);
    return { progress: state.progress, button: state.buttonVisibility, script: state.scriptOrder[state.scriptOrder.length - 1] };
  });

  await check('14. 七页无页面异常、无失败请求', async () => {
    errors.length = 0;
    failedRequests.length = 0;
    for (const rel of pages) await open(rel);
    assert.equal(errors.length, 0, errors.join(' | '));
    assert.equal(failedRequests.length, 0, failedRequests.join(', '));
    return { pages: pages.length, errors: 0, failedRequests: 0 };
  });

  await check('15. 等效 200% 重排无横向溢出', async () => {
    const zoom = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
    const zp = await zoom.newPage();
    const detail = {};
    for (const rel of ['posts/attention-intuition.html', 'blog.html', 'index.html']) {
      await zp.goto(base + rel);
      await revealed(zp);
      await zp.evaluate('document.scrollingElement.scrollTop = 600');
      await buttonShown(zp);
      const state = await zp.evaluate(() => {
        const rect = document.getElementById('back-to-top').getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          right: Math.round((innerWidth - rect.right) * 100) / 100,
          left: Math.round(rect.left * 100) / 100,
        };
      });
      assert.ok(state.overflow <= 1, `${rel} 横向溢出 ${state.overflow}`);
      assert.ok(state.right >= 15 && state.left >= 0, `${rel} 按钮越界 ${JSON.stringify(state)}`);
      detail[rel] = state;
    }
    await zoom.close();
    return detail;
  });

  await check('16. E03 未改动 assets/ 中的非 Hero 资产', async () => {
    const { createHash } = await import('node:crypto');
    const baseline = JSON.parse(fs.readFileSync(path.join(root, 'docs/evidence/baseline/checks.json'), 'utf8')).sourceFilesSha256;
    const changed = [];
    const same = [];
    for (const [rel, hash] of Object.entries(baseline)) {
      if (!rel.startsWith('assets/')) continue;
      const file = path.join(root, rel);
      if (!fs.existsSync(file)) { changed.push(`${rel}（缺失）`); continue; }
      const now = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      if (now === hash) same.push(rel); else changed.push(rel);
    }
    // E05 式的 Hero 线稿修订在本任务之前已存在于工作区；E03 只允许这两张保持不同。
    const allowed = ['assets/images/hero-desk-640.webp', 'assets/images/hero-desk-1280.webp'];
    const unexpected = changed.filter((rel) => !allowed.includes(rel));
    assert.equal(unexpected.length, 0, 'E03 期间被改动的资产：' + unexpected.join(', '));
    return { unchanged: same.length, preexistingHeroRevision: changed, baseline: 'docs/evidence/baseline/checks.json（B05 快照）' };
  });

  await check('17. 归档截图', async () => {
    const made = [];
    const settleScroll = async (target, ratio) => {
      await noSmooth(target);
      const applied = await target.evaluate(`(() => {
        const scroller = document.scrollingElement;
        const max = scroller.scrollHeight - scroller.clientHeight;
        scroller.scrollTop = ${ratio === 'bottom' ? 'max' : 'Math.round(max * ' + ratio + ')'};
        return Math.round(scroller.scrollTop);
      })()`);
      await target.waitForFunction(`(document.scrollingElement || document.documentElement).scrollTop === ${applied}`, null, { timeout: 5000 });
      await buttonShown(target);
      return applied;
    };
    for (const [theme, scheme] of [['light', 'light'], ['dark', 'dark']]) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme });
      const cp = await ctx.newPage();
      await cp.goto(base + 'posts/attention-intuition.html');
      await revealed(cp);
      await settleScroll(cp, 0.5);
      await shot(cp, `e03-post-1440-${theme}-mid`);
      made.push(`e03-post-1440-${theme}-mid`);
      await settleScroll(cp, 'bottom');
      await shot(cp, `e03-post-1440-${theme}-bottom`);
      made.push(`e03-post-1440-${theme}-bottom`);
      await cp.setViewportSize({ width: 390, height: 844 });
      await cp.goto(base + 'posts/dom-search-notes.html');
      await revealed(cp);
      await settleScroll(cp, 'bottom');
      await shot(cp, `e03-post-390-${theme}-bottom`);
      made.push(`e03-post-390-${theme}-bottom`);
      // 与 B05 基线同条件的对照截图（默认态、未滚动）：blog 页面 1440px 两主题。
      await cp.setViewportSize({ width: 1440, height: 900 });
      await cp.goto(base + 'blog.html');
      await revealed(cp);
      await shot(cp, `e03-baseline-blog-1440-${theme}`);
      made.push(`e03-baseline-blog-1440-${theme}`);
      await ctx.close();
    }
    const nojs = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const np = await nojs.newPage();
    await np.goto(base + 'posts/attention-intuition.html');
    await shot(np, 'e03-post-1440-light-nojs');
    made.push('e03-post-1440-light-nojs');
    await nojs.close();
    const nojsBlog = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const nbp = await nojsBlog.newPage();
    await nbp.goto(base + 'blog.html');
    await shot(nbp, 'e03-baseline-blog-1440-light-nojs');
    made.push('e03-baseline-blog-1440-light-nojs');
    await nojsBlog.close();
    return made;
  });

  // 与 B05 基线截图逐像素对照：默认态（未滚动）唯一允许出现的差异是顶部进度线与页脚预留空间。
  // 与 B05 基线截图逐像素对照。B05 基线截图在 Chromium 下采集，文本抗锯齿与 Firefox 不同，
  // 因此本项只在 Edge/Chrome 下执行；Firefox 的 1–17 项照常全部执行。
  if (browserName === 'firefox') {
    report.checks.push({ name: '18. 与 B05 基线同视口截图对照（默认态）', pass: true, detail: '跳过：B05 基线为 Chromium 渲染；Firefox 文本抗锯齿不同，逐像素对照不适用（1–17 项照常执行）。' });
  } else await check('18. 与 B05 基线同视口截图对照（默认态）', async () => {
    const pairs = [
      ['docs/evidence/baseline/blog-1440-light.png', 'e03-baseline-blog-1440-light.png', 'light', 1440, 1440],
      ['docs/evidence/baseline/blog-1440-dark.png', 'e03-baseline-blog-1440-dark.png', 'dark', 1440, 1440],
      ['docs/evidence/baseline/blog-390-light.png', 'e03-baseline-blog-390-light.png', 'light', 390, 1901],
    ];
    const detail = {};
    for (const [oldRel, newName, theme, width, height] of pairs) {
      const oldFile = path.join(root, oldRel);
      const newFile = path.join(out, newName);
      const oldSize = decodeSize(oldFile);
      assert.equal(oldSize[0], width, `${oldRel} 基线与预期宽度不一致`);
      // 用与基线相同的视口（含基线全页高度）截图，保证尺寸可直接比较；基线为整页截图。
      const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: theme });
      const cp = await ctx.newPage();
      await cp.goto(base + 'blog.html');
      await revealed(cp);
      await cp.screenshot({ path: newFile, clip: { x: 0, y: 0, width, height }, animations: 'disabled' });
      report.screenshots.push(newName);
      await ctx.close();
      // 忽略：顶部进度线（0–2px，取整可能到 3px）
      const diff = comparePng(oldFile, newFile, { ignore: [{ x: 0, y: 0, w: width, h: 3 }] });
      assert.equal(diff.sameSize, true, `${newName} 与基线尺寸不同 ${JSON.stringify(diff.sizeA)}/${JSON.stringify(diff.sizeB)}`);
      // 允许页脚预留空间（+32px）带来的底部位移：差异必须全部落在最后 64 行内。
      const unexpected = diff.bands.filter((band) => band.from < height - 64);
      assert.equal(unexpected.length, 0,
        `${newName} 在非页脚区域出现基线外差异：${JSON.stringify(unexpected)}，色值 ${JSON.stringify(diff.colors)}`);
      detail[newName] = {
        baseline: oldRel, size: diff.size, diffPixels: diff.diff, bands: diff.bands, colors: diff.colors,
        note: '默认态逐像素对照：忽略顶部 3px 进度线。Blog 页面高度由视口决定，页脚预留空间（96px，仍小于内容高度）没有改变文档高度，因此其余区域应为 0 差异。',
      };
    }
    return detail;
  });

  report.passed = report.checks.filter((item) => item.pass).length;
  report.failed = failures;
  fs.writeFileSync(path.join(out, `reading-checks-${browserName}.json`), JSON.stringify(report, null, 2));
  await context.close();
  return { browser: browserName, version: report.browserVersion, passed: report.passed, failed: report.failed };
}

const runs = [];
try {
  for (const name of requested) {
    if (name === 'edge' || name === 'chrome') {
      const browser = await chromium.launch({ channel: name === 'edge' ? 'msedge' : 'chrome' });
      runs.push(await run(name, browser));
      await browser.close();
    } else if (name === 'firefox') {
      try {
        const browser = await firefox.launch();
        runs.push(await run(name, browser));
        await browser.close();
      } catch (error) {
        const reason = String(error.message).split('\n')[0];
        runs.push({ browser: name, skipped: reason });
        console.error('SKIP firefox:', reason);
      }
    }
  }
} finally {
  server.close();
}

const lines = runs.map((item) => item.skipped
  ? `[${item.browser}] 跳过：${item.skipped}`
  : `[${item.browser} ${item.version}] 通过 ${item.passed}，失败 ${item.failed}`);
lines.push(`基准提交：${execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()}`);
lines.push(`限制：${LIMITATIONS.join(' ')}`);
fs.writeFileSync(path.join(out, 'reading-report.txt'), lines.join('\n') + '\n');
console.log(lines.join('\n'));
if (runs.some((item) => item.failed > 0)) process.exitCode = 1;
