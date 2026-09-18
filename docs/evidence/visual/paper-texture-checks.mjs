// Paper texture contract and layout regression checks.
// Usage: node docs/evidence/visual/paper-texture-checks.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from '../../../.tmp-browser/node_modules/playwright/index.mjs';

const root = path.resolve(import.meta.dirname, '../../..');
const outDir = path.join(root, 'docs/evidence/visual/paper-texture');
const outFile = path.join(outDir, 'checks.json');
const pages = [
  ['home', 'index.html'],
  ['blog', 'blog.html'],
  ['about', 'about.html'],
  ['post', 'posts/ncs-figure-design.html'],
];
const widths = [390, 768, 1024, 1440];
const themes = ['light', 'dark'];
const typeByExtension = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const css = fs.readFileSync(path.join(root, 'css/base.css'), 'utf8');
const report = { checks: [], scenarios: [], passed: 0, failed: 0 };
const server = http.createServer((req, res) => {
  try {
    let requestPath = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    if (requestPath.startsWith('/course/blog/')) requestPath = requestPath.slice('/course/blog'.length);
    if (requestPath.endsWith('/')) requestPath += 'index.html';
    const file = path.resolve(root, '.' + requestPath);
    if (!file.startsWith(root + path.sep) || !fs.statSync(file).isFile()) throw new Error('not found');
    res.writeHead(200, { 'Content-Type': typeByExtension[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  } catch (_) {
    res.writeHead(404);
    res.end('Not found');
  }
});

const referenceFile = path.join(root, 'docs/evidence/visual/cold-paper/capture.json');
const reference = fs.existsSync(referenceFile) ? JSON.parse(fs.readFileSync(referenceFile, 'utf8')) : [];
const referenceHeights = new Map(reference.map((item) => [`${item.page}|${item.width}|${item.theme}`, item.height]));

function record(name, pass, detail) {
  report.checks.push({ name, pass, detail });
  if (pass) report.passed += 1;
  else report.failed += 1;
  if (!pass) console.error(`FAIL ${name}: ${detail}`);
}

try {
  record('SVG grain contract', /type='fractalNoise' baseFrequency='\.85' numOctaves='2' seed='21' stitchTiles='stitch'/.test(css)
    && /feColorMatrix type='matrix' values='0 0 0 0 0\.45 0 0 0 0 0\.45 0 0 0 0 0\.45 0 0 0 0\.16 0'/.test(css),
    'fixed SVG noise parameters plus alpha-baked intensity present');
  record('No repeating gradient texture', !/repeating-(?:linear|radial)-gradient/i.test(css),
    'texture layer uses no repeating gradient');
  // The grain is now a native 1:1 tile: the intensity is baked into the SVG alpha,
  // so there is NO opacity on the layer and no blend mode. `cover` was removed
  // because it magnified the tile and destroyed the fine grain.
  record('Grain overlay contract', /html::after[\s\S]*?background-repeat: repeat[\s\S]*?background-size: var\(--paper-grain-size\)/.test(css)
    && /--paper-grain-size:\s*256px 256px/.test(css)
    && !/--paper-grain-opacity/.test(css), 'native 1:1 tiled overlay, no opacity token');
  record('No blend modes on the texture', !/mix-blend-mode\s*:(?!\s*(?:normal|initial|inherit|unset))/i.test(css)
    && !/background-blend-mode\s*:/i.test(css),
    'texture uses normal compositing only (overlay/soft-light measured to have zero effect on html::after)');
  record('No texture animation', !/html::(?:before|after)[\s\S]*?animation\s*:/i.test(css), 'overlay has no animation declaration');

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  for (const theme of themes) {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme });
      const page = await context.newPage();
      for (const [name, file] of pages) {
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(base + file, { waitUntil: 'load', timeout: 30000 });
        await page.evaluate((selectedTheme) => {
          document.documentElement.setAttribute('data-theme', selectedTheme);
        }, theme);
        const facts = await page.evaluate(() => {
          const rootStyle = getComputedStyle(document.documentElement);
          const before = getComputedStyle(document.documentElement, '::before');
          const after = getComputedStyle(document.documentElement, '::after');
          const bodyStyle = getComputedStyle(document.body);
          const post = document.querySelector('.post');
          return {
            rootBackground: rootStyle.backgroundColor,
            bodyBackground: bodyStyle.backgroundColor,
            beforeImage: before.backgroundImage,
            beforePosition: before.position,
            beforePointerEvents: before.pointerEvents,
            beforeRepeat: before.backgroundRepeat,
            beforeSize: before.backgroundSize,
            afterImage: after.backgroundImage,
            afterOpacity: after.opacity,
            afterPosition: after.position,
            afterPointerEvents: after.pointerEvents,
            afterRepeat: after.backgroundRepeat,
            afterSize: after.backgroundSize,
            afterAnimation: after.animationName,
            afterTransitionDuration: after.transitionDuration,
            scrollWidth: document.documentElement.scrollWidth,
            bodyScrollWidth: document.body.scrollWidth,
            viewport: innerWidth,
            height: document.documentElement.scrollHeight,
            postWidth: post ? post.getBoundingClientRect().width : null,
          };
        });

        // Light tokens are grain-compensated (pre-composite) values: the grain
        // darkens the page, so the base colour is lifted to keep the RENDERED
        // paper at the previously confirmed tone. Dark keeps flat tokens and
        // instead uses a weaker neutral grain.
        const expected = theme === 'light'
          ? {
            rootBackground: 'rgb(246, 248, 250)',
            bodyBackground: 'rgba(0, 0, 0, 0)',
            beforeImage: true,
            afterImage: true,
            afterOpacity: '1',
          }
          : {
            rootBackground: 'rgb(32, 34, 35)',
            bodyBackground: 'rgba(0, 0, 0, 0)',
            beforeImage: false,
            afterImage: true,
            afterOpacity: '1',
          };
        const imageState = (value) => value !== 'none';
        const grainImageState = (value) => value !== 'none' && value.includes('data:image/svg+xml');
        const scenario = {
          page: name,
          theme,
          width,
          ...facts,
          beforeImage: imageState(facts.beforeImage),
          afterImage: grainImageState(facts.afterImage),
          errors,
        };
        report.scenarios.push(scenario);

        record(`${theme} ${name} ${width}px: computed texture contract`,
          facts.rootBackground === expected.rootBackground
            && facts.bodyBackground === expected.bodyBackground
            && imageState(facts.beforeImage) === expected.beforeImage
            && grainImageState(facts.afterImage) === expected.afterImage
            && facts.afterOpacity === expected.afterOpacity
            && facts.afterPosition === 'fixed'
            && facts.afterPointerEvents === 'none'
            && facts.afterRepeat === 'repeat'
            && facts.afterSize === '256px 256px'
            && facts.afterAnimation === 'none'
            && facts.afterTransitionDuration === '0s',
          JSON.stringify(facts));
        record(`${theme} ${name} ${width}px: no overflow`, facts.scrollWidth <= width + 1 && facts.bodyScrollWidth <= width + 1,
          JSON.stringify({ scrollWidth: facts.scrollWidth, bodyScrollWidth: facts.bodyScrollWidth, viewport: width }));
        record(`${theme} ${name} ${width}px: article width`, facts.postWidth === null || facts.postWidth <= 741,
          String(facts.postWidth));
        const referenceHeight = referenceHeights.get(`${name}|${width}|${theme}`);
        if (referenceHeight !== undefined) {
          const contentChanged = name === 'blog' || name === 'post';
          record(`${theme} ${name} ${width}px: document height unchanged`, contentChanged || facts.height === referenceHeight,
            contentChanged
              ? `${facts.height} vs archived ${referenceHeight}; recorded because the five-post list and new representative article intentionally changed the page height`
              : `${facts.height} vs ${referenceHeight}`);
        }
        record(`${theme} ${name} ${width}px: no page errors`, errors.length === 0, errors.join('; '));
        page.removeAllListeners('pageerror');
      }
      await context.close();
    }
  }

  // ---- pixel proof that the grain is actually perceptible -------------------
  // The shipped 0.015-opacity layer measured a band-passed rms of ~0.49, i.e.
  // under one 8-bit level: the texture existed in the CSS but was invisible.
  // This renders the real page background + grain on an isolated full-paper
  // element and measures the micro-texture amplitude in the browser.
  {
    const pixelContext = await browser.newContext({ viewport: { width: 600, height: 300 }, deviceScaleFactor: 1 });
    const pixelPage = await pixelContext.newPage();
    await pixelPage.goto(base + 'index.html', { waitUntil: 'load', timeout: 30000 });
    await pixelPage.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      const probe = document.createElement('div');
      probe.id = 'paper-pixel-probe';
      document.body.appendChild(probe);
      const style = document.createElement('style');
      // Full paper coverage: background-color = token, background-image = grain.
      style.textContent = '#paper-pixel-probe{position:fixed;inset:0;z-index:0;' +
        'background-color:var(--color-paper);background-image:var(--paper-grain-layer);' +
        'background-size:var(--paper-grain-size);background-repeat:repeat}';
      document.head.appendChild(style);
    });
    await pixelPage.waitForTimeout(400);
    const shot = await pixelPage.screenshot({ type: 'png' });
    const grain = await pixelPage.evaluate(async (dataUrl) => {
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      const W = c.width, H = c.height;
      const lum = new Float64Array(W * H);
      for (let i = 0; i < W * H; i++) {
        lum[i] = 0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2];
      }
      // Separable box blur (radius 4) as the low-pass; signal minus low-pass is
      // the band-passed micro-texture ("paper tooth").
      const R = 4;
      const tmp = new Float64Array(W * H), low = new Float64Array(W * H);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const x0 = Math.max(0, x - R), x1 = Math.min(W - 1, x + R);
          let s = 0;
          for (let k = x0; k <= x1; k++) s += lum[y * W + k];
          tmp[y * W + x] = s / (x1 - x0 + 1);
        }
      }
      for (let x = 0; x < W; x++) {
        for (let y = 0; y < H; y++) {
          const y0 = Math.max(0, y - R), y1 = Math.min(H - 1, y + R);
          let s = 0;
          for (let k = y0; k <= y1; k++) s += tmp[k * W + x];
          low[y * W + x] = s / (y1 - y0 + 1);
        }
      }
      let mean = 0;
      for (let i = 0; i < W * H; i++) mean += lum[i] - low[i];
      mean /= W * H;
      let sum2 = 0, den = 0;
      for (let i = 0; i < W * H; i++) { sum2 += (lum[i] - low[i] - mean) ** 2; den += (lum[i] - low[i] - mean) ** 2; }
      const ac = [];
      for (const lag of [1, 2]) {
        let num = 0;
        for (let y = 0; y < H; y++) {
          for (let x = 0; x + lag < W; x++) num += (lum[y * W + x] - low[y * W + x] - mean) * (lum[y * W + x + lag] - low[y * W + x + lag] - mean);
        }
        ac.push(den === 0 ? 0 : num / den);
      }
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < W * H; i++) { r += d[i * 4]; g += d[i * 4 + 1]; b += d[i * 4 + 2]; }
      const n = W * H;
      return { rms: Math.sqrt(sum2 / n), ac1: ac[0], ac2: ac[1], r: r / n, g: g / n, b: b / n, W, H };
    }, 'data:image/png;base64,' + shot.toString('base64'));
    await pixelContext.close();

    const composite = `rgb(${grain.r.toFixed(2)}, ${grain.g.toFixed(2)}, ${grain.b.toFixed(2)})`;
    record('Grain is perceptible (band-passed rms >= 1.0)',
      grain.rms >= 1.0,
      `rms=${grain.rms.toFixed(3)} (shipped 0.015 layer measured ~0.49; below 1.0 is invisible in 8-bit)`);
    record('Grain reads as fibre, not cloud',
      Math.abs(grain.ac1) <= 0.3 && grain.ac2 < 0.5,
      `lag1=${grain.ac1.toFixed(3)} lag2=${grain.ac2.toFixed(3)}`);
    // The compensated tokens must land the RENDERED paper back on the previously
    // confirmed tone; the token itself is deliberately lighter than that.
    record('Rendered paper tone preserved',
      Math.abs(grain.r - 241) <= 1.5 && Math.abs(grain.g - 243) <= 1.5 && Math.abs(grain.b - 245) <= 1.5,
      `${composite} vs confirmed rgb(241, 243, 245)`);
    report.grainPixel = { ...grain, composite };
  }

  await browser.close();
} catch (error) {
  record('paper texture harness availability', false, error.message);
} finally {
  server.close();
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({ ...report, passed: report.passed, failed: report.failed }, null, 2) + '\n');
}

console.log(JSON.stringify({ passed: report.passed, failed: report.failed, scenarios: report.scenarios.length }));
process.exitCode = report.failed ? 1 : 0;
