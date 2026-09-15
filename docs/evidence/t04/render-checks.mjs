// T04 浏览器渲染检查（Edge headless + CDP，临时脚本，经 stdin 运行，不落盘）
// 用法：node - --port=PORT --out=DIR [--serve=http://127.0.0.1:8123]
// 输出：docs/evidence/t04/render-checks.json 与截图
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.join('=')];
}));
const port = Number(args.port || 9333);
const outDir = args.out || 'L:/Sywen-Blog/docs/evidence/t04';
const base = args.serve || 'http://127.0.0.1:8123';
const shots = args.shots !== 'false';

const log = [];
const note = (s) => { log.push(s); console.log(s); };

// ---------- Edge 启动（--attach=PORT 时复用已由外部启动的实例） ----------
import { spawn } from 'node:child_process';
import os from 'node:os';
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profile = args.profile || path.join(os.tmpdir(), `t04-edge-${port}`);
let child = null;
if (args.attach !== 'true') {
  child = spawn(edge, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-component-extensions-with-background-pages',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1440,900',
    'about:blank',
  ], { stdio: 'ignore', windowsHide: true });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getVersion() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return await res.json();
    } catch { /* 尚未就绪 */ }
    await sleep(250);
  }
  throw new Error('无法连接 Edge 调试端口');
}

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.events = []; this.queue = Promise.resolve(); }
  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws error')); });
    const c = new CDP(ws);
    c.tag = wsUrl.slice(-8);
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (process.env.T04_TRACE) console.log(`<< [${c.tag}] ${JSON.stringify(msg).slice(0, 160)}`);
      if (msg.id && c.pending.has(msg.id)) {
        const { res, rej } = c.pending.get(msg.id);
        c.pending.delete(msg.id);
        msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
      } else if (msg.method) c.events.push(msg);
    };
    ws.onclose = (e) => { c.closed = `${e.code} ${e.reason}`; if (process.env.T04_TRACE) console.log(`!! [${c.tag}] closed ${c.closed}`); };
    return c;
  }
  send(method, params = {}) {
    const id = ++this.id;
    // 串行发送，避免交错写入
    const run = () => new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      const payload = JSON.stringify({ id, method, params });
      if (process.env.T04_TRACE) console.log(`>> [${this.tag}] ${payload.slice(0, 160)}`);
      this.ws.send(payload);
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); rej(new Error('CDP 超时: ' + method)); } }, 25000);
    });
    this.queue = this.queue.then(run, run);
    return this.queue;
  }
  async evaluate(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''));
    return r.result.value;
  }
  close() { try { this.ws.close(); } catch { /* ignore */ } }
}

const version = await getVersion();
note(`浏览器: ${version.Browser}`);

// 每个场景使用独立 page target，并直接连接该页面的 WebSocket（Edge 153 的 flatten session 不复用）
async function withPage(fn) {
  const created = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  const target = await created.json();
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);
  try {
    return await fn(cdp);
  } finally {
    cdp.close();
    try { await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`); } catch { /* ignore */ }
  }
}

async function navigate(cdp, url) {
  cdp.consoleErrors = [];
  cdp.pageErrors = [];
  cdp.failedRequests = [];
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable').catch(() => null);
  watchErrors(cdp);
  await cdp.send('Page.navigate', { url });
  // 等待文档与图片、字体就绪
  for (let i = 0; i < 100; i++) {
    const state = await cdp.evaluate(`(() => {
      const imgs = Array.from(document.images);
      return { ready: document.readyState, imgs: imgs.length, done: imgs.every((i) => i.complete) };
    })()`).catch(() => null);
    if (state && state.ready === 'complete' && state.done) break;
    await sleep(120);
  }
  await cdp.evaluate('document.fonts ? document.fonts.ready.then(() => true) : true').catch(() => null);
  await sleep(150);
}

function watchErrors(cdp) {
  cdp.events.length = 0;
  const pending = [];
  const scan = setInterval(() => {
    while (cdp.events.length) {
      const e = cdp.events.shift();
      if (e.method === 'Runtime.exceptionThrown') cdp.pageErrors.push(e.params.exceptionDetails.text + ' ' + (e.params.exceptionDetails.exception?.description || ''));
      if (e.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(e.params.type)) cdp.consoleErrors.push(e.params.type + ': ' + e.params.args.map((a) => a.value ?? a.description ?? a.type).join(' '));
      if (e.method === 'Log.entryAdded' && e.params.entry.level === 'error') cdp.consoleErrors.push('log: ' + e.params.entry.text + ' ' + (e.params.entry.url || ''));
      if (e.method === 'Network.loadingFailed') cdp.failedRequests.push(e.params.errorText + ' ' + (e.params.type || ''));
    }
  }, 100);
  cdp.stopWatch = () => clearInterval(scan);
  void pending;
}

async function setViewport(cdp, w, h) {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
}

async function screenshot(cdp, file) {
  // 关闭主题色过渡，避免把 180ms 过渡的中间色拍进证据（DESIGN_SPEC §15）
  await cdp.evaluate(`(() => {
    const s = document.createElement('style');
    s.id = 't04-evidence-freeze';
    s.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
    document.head.appendChild(s);
    return true;
  })()`).catch(() => null);
  await sleep(80);
  const r = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, fromSurface: true });
  fs.writeFileSync(path.join(outDir, file), Buffer.from(r.data, 'base64'));
  return file;
}

// 页面内采集脚本（返回可序列化对象）
const probe = `(() => {
  const cs = (el, p) => el ? getComputedStyle(el).getPropertyValue(p).trim() : null;
  const rect = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  const px = (v) => v ? parseFloat(v) : null;
  const root = document.documentElement;
  const body = document.body;
  const heroArt = document.querySelector('.art-frame__image');
  const wide = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > root.clientWidth + 1) {
      wide.push(el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : '') + ' right=' + Math.round(r.right));
    }
  });
  const failed = performance.getEntriesByType('resource').filter((e) => e.responseStatus >= 400).map((e) => e.name + ' ' + e.responseStatus);
  const hiddenCheck = ['theme-toggle','quick-menu-button','reading-progress','back-to-top','site-notice','copy-panel','context-menu','blog-filters','blog-results','blog-empty']
    .map((id) => { const el = document.getElementById(id); return el ? id + '=' + getComputedStyle(el).display : id + '=absent'; });
  const minHeights = {};
  ['.site-nav__link', '.button--primary', '.category-link', '.post-entry__link'].forEach((sel) => {
    const el = document.querySelector(sel);
    minHeights[sel] = el ? Math.round(el.getBoundingClientRect().height) : null;
  });
  return {
    title: document.title,
    lang: root.lang,
    theme: root.getAttribute('data-theme'),
    colorScheme: cs(root, 'color-scheme'),
    tokens: {
      paper: cs(root, '--color-paper'), ink: cs(root, '--color-ink'), muted: cs(root, '--color-muted'),
      accent: cs(root, '--color-accent'), note: cs(root, '--color-note'), surface: cs(root, '--color-surface'),
      gutter: cs(root, '--gutter'), heroArtHeight: cs(root, '--hero-art-height'), entryDateWidth: cs(root, '--entry-date-width'),
      textBody: cs(root, '--text-body'), textH2: cs(root, '--text-h2'), space6: cs(root, '--space-6')
    },
    bodyBg: cs(body, 'background-color'),
    bodyColor: cs(body, 'color'),
    bodyFont: cs(body, 'font-family').slice(0, 40),
    overflowX: root.scrollWidth > root.clientWidth,
    scrollWidth: root.scrollWidth,
    clientWidth: root.clientWidth,
    wideElements: wide.slice(0, 6),
    h1: (document.querySelector('h1') || {}).textContent || null,
    h1Overflow: document.querySelector('h1') ? document.querySelector('h1').scrollWidth > document.querySelector('h1').clientWidth + 1 : null,
    heroArt: heroArt ? { natural: heroArt.naturalWidth + 'x' + heroArt.naturalHeight, w: Math.round(heroArt.getBoundingClientRect().width), h: Math.round(heroArt.getBoundingClientRect().height), complete: heroArt.complete, bg: cs(heroArt, 'background-color'), maxW: cs(heroArt, 'max-width') } : null,
    artFrame: rect('.art-frame'),
    heroText: rect('.hero__text'),
    heroArtBox: rect('.hero-art'),
    heroTape: rect('.hero-art__tape'),
    heroDots: rect('.hero-art__dots'),
    aboutGrid: (() => {
      const intro = document.querySelector('.about-intro');
      if (!intro) return null;
      const cs = getComputedStyle(intro);
      const first = intro.querySelector('p');
      const art = intro.querySelector('.about-hero-art');
      const r1 = first.getBoundingClientRect(), r2 = art.getBoundingClientRect();
      // 文本与角色图是否落在同一行区间（桌面两列）
      const sameBand = Math.abs(r1.top - r2.top) < Math.max(r1.height, r2.height);
      const sideBySide = r1.right <= r2.left + 1 && r1.left < r2.left;
      return { display: cs.display, columns: cs.gridTemplateColumns, textCol: Math.round(r1.left), artCol: Math.round(r2.left), textRow: Math.round(r1.top), artRow: Math.round(r2.top), textInRow1: r1.top < r2.top, sameBand, sideBySide, artSize: Math.round(r2.width) + 'x' + Math.round(r2.height) };
    })(),
    containerPadding: (() => { const el = document.querySelector('.site-main .container'); const cs = getComputedStyle(el); return { paddingLeft: cs.paddingLeft, clientWidth: el.clientWidth, contentWidth: Math.round(el.clientWidth - parseFloat(cs.paddingLeft) * 2) }; })(),
    viewportClientWidth: document.documentElement.clientWidth,
    postParagraphWidth: (() => { const p = document.querySelector('.post-body > p'); return p ? Math.round(p.getBoundingClientRect().width) : null; })(),
    postHeaderWidth: (() => { const h = document.querySelector('.post-header'); return h ? Math.round(h.getBoundingClientRect().width) : null; })(),
    heroCaption: document.querySelector('.hero-art__caption') ? { text: document.querySelector('.hero-art__caption').textContent, color: cs(document.querySelector('.hero-art__caption'), 'color'), size: cs(document.querySelector('.hero-art__caption'), 'font-size') } : null,
    heroTitleSize: px(cs(document.querySelector('.hero__title'), 'font-size')),
    pageTitleSize: px(cs(document.querySelector('.page-title'), 'font-size')),
    bodyTextSize: px(cs(document.querySelector('.post-body > p') || document.querySelector('.about-section > p'), 'font-size')),
    postBodyMaxWidth: cs(document.querySelector('.post'), 'max-width'),
    postBodyWidth: rect('.post') ? rect('.post').w : null,
    aboutIntroDisplay: cs(document.querySelector('.about-intro'), 'display'),
    footerNoteColor: cs(document.querySelector('.site-footer__note'), 'color'),
    navLinkCount: document.querySelectorAll('.site-nav__link').length,
    navLinkHeight: rect('.site-nav__link') ? rect('.site-nav__link').h : null,
    headerRect: rect('.site-header'),
    navRect: rect('.site-nav'),
    hiddenCheck: hiddenCheck,
    minHeights: minHeights,
    failedResources: failed,
    imgSrcs: Array.from(document.images).map((i) => i.getAttribute('src')),
    stylesheets: Array.from(document.styleSheets).map((s) => s.href).filter(Boolean),
    emptyStateVisible: document.getElementById('blog-empty') ? getComputedStyle(document.getElementById('blog-empty')).display !== 'none' : null,
    staticListVisible: document.getElementById('blog-static-list') ? getComputedStyle(document.getElementById('blog-static-list')).display !== 'none' : null,
    noteCols: cs(document.querySelector('.note-panel__list'), 'grid-template-columns'),
    tapeDisplay: cs(document.querySelector('.hero-art__tape'), 'display'),
    dotsDisplay: cs(document.querySelector('.hero-art__dots'), 'display')
  };
})()`;

function contrast(rgb1, rgb2) {
  const lum = (c) => {
    const [r, g, b] = c.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const l1 = lum(rgb1), l2 = lum(rgb2);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}
const parse = (s) => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);

// ---------- 场景 ----------
const results = { generatedAt: new Date().toISOString(), base, scenarios: [] };
const widths = [320, 360, 390, 768, 1024, 1440];
const pages = {
  home: 'index.html',
  blog: 'blog.html',
  about: 'about.html',
  post: 'posts/dom-search-notes.html',
};

for (const [name, rel] of Object.entries(pages)) {
  for (const w of widths) {
    const data = await withPage(async (cdp) => {
      await setViewport(cdp, w, 900);
      await navigate(cdp, `${base}/${rel}`);
      const d = await cdp.evaluate(probe);
      const themeApplied = await cdp.evaluate('document.documentElement.setAttribute("data-theme","dark"), getComputedStyle(document.documentElement).getPropertyValue("--color-paper").trim()');
      await sleep(120);
      return { ...d, themeAppliedPaper: themeApplied, consoleErrors: cdp.consoleErrors, pageErrors: cdp.pageErrors, failedRequests: cdp.failedRequests };
    });
    results.scenarios.push({ page: name, width: w, ...data });
    note(`${name} @${w}px  视口可用=${data.viewportClientWidth} 内容列=${data.containerPadding.contentWidth} 角色图=${data.heroArt ? data.heroArt.w + 'x' + data.heroArt.h : '-'} 正文段=${data.postParagraphWidth ?? '-'} 头部=${data.postHeaderWidth ?? '-'} 横向溢出=${data.overflowX} 错误=${data.pageErrors.length + data.consoleErrors.length}`);
  }
}

// 主题显式切换（浅 / 深）与对比度
for (const theme of ['light', 'dark']) {
  const data = await withPage(async (cdp) => {
    await setViewport(cdp, 1440, 900);
    await navigate(cdp, `${base}/index.html`);
    await cdp.evaluate(`document.documentElement.setAttribute('data-theme','${theme}')`);
    await sleep(250);
    const d = await cdp.evaluate(probe);
    const extra = await cdp.evaluate(`(() => {
      const cs = (el, p) => el ? getComputedStyle(el).getPropertyValue(p).trim() : null;
      const btn = document.querySelector('.button--primary');
      const card = document.querySelector('.note-panel');
      return {
        colorScheme: cs(document.documentElement, 'color-scheme'),
        button: { bg: cs(btn, 'background-color'), color: cs(btn, 'color') },
        panel: { bg: cs(card, 'background-color'), color: cs(card, 'color') },
        navCurrent: { bg: cs(document.querySelector('.site-nav__link[aria-current]'), 'background-color'), color: cs(document.querySelector('.site-nav__link[aria-current]'), 'color'), weight: cs(document.querySelector('.site-nav__link[aria-current]'), 'font-weight'), decoration: cs(document.querySelector('.site-nav__link[aria-current]'), 'text-decoration-line') },
        categoryButton: { bg: cs(document.querySelector('.category-button'), 'background-color') },
        focusProbe: (() => { document.querySelector('.site-nav__link').focus(); return true; })()
      };
    })()`);
    return { ...d, ...extra };
  });
  const cBody = contrast(parse(data.bodyColor), parse(data.bodyBg));
  const cMuted = contrast(parse(data.footerNoteColor), parse(data.bodyBg));
  const cButton = contrast(parse(data.button.color), parse(data.button.bg));
  const cPanel = contrast(parse(data.panel.color), parse(data.panel.bg));
  results.themes = results.themes || {};
  results.themes[theme] = { ...data, contrast: { bodyOnPaper: cBody, mutedOnPaper: cMuted, buttonInkOnAccent: cButton, inkOnSurface: cPanel } };
  note(`主题 ${theme}: paper=${data.tokens.paper} ink=${data.tokens.ink} 对比度 body=${cBody} muted=${cMuted} 按钮=${cButton} 面板=${cPanel}`);
}

// 键盘：第一个 Tab 是跳转链接且可见
const tab = await withPage(async (cdp) => {
  await setViewport(cdp, 1440, 900);
  await navigate(cdp, `${base}/index.html`);
  await cdp.evaluate('document.body.focus(), document.activeElement.blur()');
  await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 9, key: 'Tab', code: 'Tab' });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 9, key: 'Tab', code: 'Tab' });
  await sleep(200);
  const d = await cdp.evaluate(`(() => {
    const el = document.activeElement;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { tag: el.tagName, cls: el.className, text: el.textContent, outlineWidth: cs.outlineWidth, outlineOffset: cs.outlineOffset, outlineColor: cs.outlineColor, transform: cs.transform, visibleInViewport: r.top >= 0 && r.left >= 0 && r.width > 0 };
  })()`);
  const focusImg = await screenshot(cdp, 'focus-skip-link-1440-light.png');
  return { ...d, screenshot: focusImg };
});
results.focusFirstTab = tab;
note(`首个 Tab 焦点: ${tab.tag}.${tab.cls} outline=${tab.outlineWidth}/${tab.outlineOffset} 可见=${tab.visibleInViewport}`);

// 组件状态抽查：默认 / Hover / 选中 / 按下 的可见差异
const states = await withPage(async (cdp) => {
  await setViewport(cdp, 1440, 900);
  await navigate(cdp, `${base}/index.html`);
  return cdp.evaluate(`(async () => {
    const cs = (sel, p) => getComputedStyle(document.querySelector(sel)).getPropertyValue(p).trim();
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const out = {};
    out.primaryDefault = { bg: cs('.button--primary', 'background-color'), shadow: cs('.button--primary', 'box-shadow'), radius: cs('.button--primary', 'border-radius') };
    out.secondaryDefault = { bg: cs('.button--secondary', 'background-color'), shadow: cs('.button--secondary', 'box-shadow') };
    out.categoryLinkDefault = { color: cs('.category-link', 'color'), decoration: cs('.category-link', 'text-decoration-line') };
    out.navCurrent = { weight: cs('.site-nav__link[aria-current]', 'font-weight'), decoration: cs('.site-nav__link[aria-current]', 'text-decoration-line'), thickness: cs('.site-nav__link[aria-current]', 'text-decoration-thickness') };
    out.navOther = { weight: cs('.site-nav__item:nth-child(2) .site-nav__link', 'font-weight'), decoration: cs('.site-nav__item:nth-child(2) .site-nav__link', 'text-decoration-line') };
    out.tape = { w: cs('.hero-art__tape', 'width'), h: cs('.hero-art__tape', 'height'), transform: cs('.hero-art__tape', 'transform'), bg: cs('.hero-art__tape', 'background-color'), pointer: cs('.hero-art__tape', 'pointer-events'), ariaHidden: document.querySelector('.hero-art__tape').getAttribute('aria-hidden') };
    out.dots = { w: cs('.hero-art__dots', 'width'), h: cs('.hero-art__dots', 'height'), image: cs('.hero-art__dots', 'background-image').slice(0, 90), opacity: cs('.hero-art__dots', 'opacity'), ariaHidden: document.querySelector('.hero-art__dots').getAttribute('aria-hidden'), pointer: cs('.hero-art__dots', 'pointer-events') };
    out.frame = { border: cs('.art-frame', 'border-top-width'), padding: cs('.art-frame', 'padding-top'), radius: cs('.art-frame', 'border-top-left-radius'), bg: cs('.art-frame', 'background-color') };
    out.image = { bg: cs('.art-frame__image', 'background-color'), objFit: cs('.art-frame__image', 'object-fit'), ratio: cs('.art-frame__image', 'aspect-ratio') };
    // 状态切换：分类按钮选中 / 主 CTA 按下 / 输入框焦点
    const btn = document.querySelector('.button--primary');
    const beforeShadow = getComputedStyle(btn).boxShadow;
    btn.focus();
    out.focusOutline = { width: getComputedStyle(btn).outlineWidth, offset: getComputedStyle(btn).outlineOffset };
    btn.blur();
    out.primaryShadow = beforeShadow;
    return out;
  })()`);
});
results.componentStates = states;
note(`组件状态: primary=${JSON.stringify(states.primaryDefault)} secondary=${JSON.stringify(states.secondaryDefault)}`);

// Blog 控件状态：分类按钮选中、输入框焦点
const blogStates = await withPage(async (cdp) => {
  await setViewport(cdp, 1440, 900);
  await navigate(cdp, `${base}/blog.html`);
  return cdp.evaluate(`(() => {
    const cs = (el, p) => getComputedStyle(el).getPropertyValue(p).trim();
    const filters = document.getElementById('blog-filters');
    filters.hidden = false;
    filters.setAttribute('aria-hidden', 'true');
    const all = document.querySelector('.category-button[data-category="all"]');
    const ai = document.querySelector('.category-button[data-category="ai"]');
    ai.setAttribute('aria-pressed', 'true');
    all.setAttribute('aria-pressed', 'false');
    const input = document.getElementById('search-input');
    input.focus();
    return {
      selected: { bg: cs(ai, 'background-color'), weight: cs(ai, 'font-weight'), ariaPressed: ai.getAttribute('aria-pressed') },
      unselected: { bg: cs(all, 'background-color'), weight: cs(all, 'font-weight'), border: cs(all, 'border-top-width') },
      input: { h: Math.round(input.getBoundingClientRect().height), bg: cs(input, 'background-color'), border: cs(input, 'border-top-width'), radius: cs(input, 'border-top-left-radius'), maxWidth: cs(input, 'max-width'), outline: cs(input, 'outline-width') },
      resetHeight: Math.round(document.getElementById('reset-filters').getBoundingClientRect().height),
      searchWidth: Math.round(document.querySelector('.blog-search').getBoundingClientRect().width)
    };
  })()`);
});
results.blogStates = blogStates;
note(`Blog 控件: 选中=${JSON.stringify(blogStates.selected)} 未选=${JSON.stringify(blogStates.unselected)} 输入框=${JSON.stringify(blogStates.input)}`);

// 交互状态与语义：Hover / 按下 / 控件语义 / 跳转链接动作
const interaction = await withPage(async (cdp) => {
  await setViewport(cdp, 1440, 900);
  await navigate(cdp, `${base}/index.html`);
  const hover = await cdp.evaluate(`(() => {
    const cs = (sel, p) => getComputedStyle(document.querySelector(sel)).getPropertyValue(p).trim();
    return {
      secondaryBg: cs('.button--secondary', 'background-color'),
      navCurrentWeight: cs('.site-nav__link[aria-current]', 'font-weight'),
      navCurrentDecor: cs('.site-nav__link[aria-current]', 'text-decoration-line'),
      navCurrentThickness: cs('.site-nav__link[aria-current]', 'text-decoration-thickness'),
      navOtherWeight: cs('.site-nav__item:nth-child(2) .site-nav__link', 'font-weight'),
      navOtherDecor: cs('.site-nav__item:nth-child(2) .site-nav__link', 'text-decoration-line'),
      h1Color: cs('.hero__title', 'color'),
      h2Color: cs('.section-header__title', 'color'),
      bodyColor: cs('body', 'color'),
      buttons: Array.from(document.querySelectorAll('button')).map((b) => b.id || b.className).join(','),
      menuRoles: document.querySelectorAll('[role="menu"]').length,
      links: document.querySelectorAll('a[href]').length
    };
  })()`);
  // 真实 Hover：把指针移到次按钮中心
  const box = await cdp.evaluate(`(() => { const r = document.querySelector('.button--secondary').getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; })()`);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: box.x, y: box.y, button: 'none', buttons: 0 });
  await sleep(250);
  const afterHover = await cdp.evaluate(`getComputedStyle(document.querySelector('.button--secondary')).backgroundColor`);
  // 真实按下：主 CTA
  const box2 = await cdp.evaluate(`(() => { const r = document.querySelector('.button--primary').getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; })()`);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: box2.x, y: box2.y, button: 'left', buttons: 1, clickCount: 1 });
  await sleep(120);
  const pressed = await cdp.evaluate(`(() => { const cs = getComputedStyle(document.querySelector('.button--primary')); return { transform: cs.transform, shadow: cs.boxShadow }; })()`);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box2.x, y: box2.y, button: 'left', buttons: 0, clickCount: 1 });
  // 跳转链接动作：Tab 聚焦后 Enter，焦点应落到 #main
  await cdp.evaluate('document.activeElement.blur()');
  await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 9, key: 'Tab', code: 'Tab' });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 9, key: 'Tab', code: 'Tab' });
  await sleep(150);
  await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 13, key: 'Enter', code: 'Enter' });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 13, key: 'Enter', code: 'Enter' });
  await sleep(400);
  const afterSkip = await cdp.evaluate(`({ tag: document.activeElement.tagName, id: document.activeElement.id, hash: location.hash, scrollY: Math.round(window.scrollY) })`);
  return { ...hover, afterHover, pressed, afterSkip };
});
results.interaction = interaction;
note(`交互: 次按钮 Hover ${interaction.secondaryBg} → ${interaction.afterHover}；主 CTA 按下 transform=${interaction.pressed.transform} shadow=${interaction.pressed.shadow}`);
note(`语义: 当前导航 ${interaction.navCurrentWeight}/${interaction.navCurrentDecor}/${interaction.navCurrentThickness}，其余 ${interaction.navOtherWeight}/${interaction.navOtherDecor}；role=menu 数量 ${interaction.menuRoles}；按钮 ${interaction.buttons}`);
note(`跳转链接 Enter 后: ${interaction.afterSkip.tag}#${interaction.afterSkip.id} hash=${interaction.afterSkip.hash}`);

// 空状态（临时注入，不写入文件）：去掉 hidden 后检查与截图
const empty = await withPage(async (cdp) => {
  await setViewport(cdp, 1440, 900);
  await navigate(cdp, `${base}/blog.html`);
  const d = await cdp.evaluate(`(() => {
    const filters = document.getElementById('blog-filters');
    const list = document.getElementById('blog-static-list');
    const empty = document.getElementById('blog-empty');
    filters.hidden = false; filters.setAttribute('aria-hidden', 'true');
    list.hidden = true;
    empty.hidden = false;
    const avatar = document.querySelector('.empty-state__avatar');
    const cs = (el, p) => getComputedStyle(el).getPropertyValue(p).trim();
    return {
      filtersDisplay: cs(filters, 'display'),
      avatarRect: (() => { const r = avatar.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), natural: avatar.naturalWidth + 'x' + avatar.naturalHeight }; })(),
      emptyDisplay: cs(empty, 'display'),
      emptyMaxWidth: cs(empty, 'max-width'),
      tapTargets: Array.from(document.querySelectorAll('.category-button, #reset-filters, #empty-reset')).map((el) => Math.round(el.getBoundingClientRect().height))
    };
  })()`);
  const shot = await screenshot(cdp, 'blog-preview-empty-1440-light.png');
  return { ...d, screenshot: shot, tampered: false };
});
results.emptyStatePreview = empty;
note(`空状态预览: 头像 ${empty.avatarRect.w}×${empty.avatarRect.h}（natural ${empty.avatarRect.natural}）控件高度 ${empty.tapTargets.join('/')}`);

// 截图（全页）
if (shots) {
  const shotList = [
    ['home', 'index.html', 390, 'light', 'home-390-light.png'],
    ['home', 'index.html', 390, 'dark', 'home-390-dark.png'],
    ['home', 'index.html', 1440, 'light', 'home-1440-light.png'],
    ['home', 'index.html', 1440, 'dark', 'home-1440-dark.png'],
    ['home', 'index.html', 768, 'light', 'home-768-light.png'],
    ['home', 'index.html', 320, 'light', 'home-320-light.png'],
    ['blog', 'blog.html', 1440, 'light', 'blog-1440-light.png'],
    ['blog', 'blog.html', 390, 'dark', 'blog-390-dark.png'],
    ['about', 'about.html', 1440, 'light', 'about-1440-light.png'],
    ['about', 'about.html', 390, 'light', 'about-390-light.png'],
    ['post', 'posts/dom-search-notes.html', 1440, 'light', 'post-1440-light.png'],
    ['post', 'posts/dom-search-notes.html', 390, 'light', 'post-390-light.png'],
  ];
  results.screenshots = [];
  for (const [name, rel, w, theme, file] of shotList) {
    const done = await withPage(async (cdp) => {
      await setViewport(cdp, w, 900);
      await navigate(cdp, `${base}/${rel}`);
      if (theme === 'dark') await cdp.evaluate(`document.documentElement.setAttribute('data-theme','dark')`);
      await sleep(200);
      return screenshot(cdp, file);
    });
    results.screenshots.push({ page: name, width: w, theme, file: done });
    note(`截图 ${done}`);
  }
}

// 断点两侧边界（§14：另检查 767/768 与 1023/1024）
results.boundaries = [];
for (const w of [767, 768, 1023, 1024]) {
  for (const [name, rel] of [['home', 'index.html'], ['about', 'about.html'], ['post', 'posts/dom-search-notes.html']]) {
    const d = await withPage(async (cdp) => {
      await setViewport(cdp, w, 900);
      await navigate(cdp, `${base}/${rel}`);
      return cdp.evaluate(probe);
    });
    const heroes = d.heroText && d.heroArtBox ? { text: d.heroText, art: d.heroArtBox } : null;
    const overlap = heroes ? !(heroes.text.x + heroes.text.w <= heroes.art.x || heroes.art.x + heroes.art.w <= heroes.text.x || heroes.text.y + heroes.text.h <= heroes.art.y || heroes.art.y + heroes.art.h <= heroes.text.y) : null;
    results.boundaries.push({
      page: name, width: w, overflowX: d.overflowX, wideElements: d.wideElements,
      contentWidth: d.containerPadding.contentWidth, heroArt: d.heroArt ? d.heroArt.w + 'x' + d.heroArt.h : null,
      postParagraphWidth: d.postParagraphWidth, aboutGrid: d.aboutGrid ? { display: d.aboutGrid.display, sideBySide: d.aboutGrid.sideBySide } : null,
      heroOverlap: overlap, failedResources: d.failedResources.length
    });
    note(`边界 ${name}@${w}px 溢出=${d.overflowX} 内容列=${d.containerPadding.contentWidth} 角色图=${d.heroArt ? d.heroArt.w + 'x' + d.heroArt.h : '-'} 正文段=${d.postParagraphWidth ?? '-'} Hero重叠=${overlap} About两列=${d.aboutGrid ? d.aboutGrid.sideBySide : '-'}`);
  }
}

// ---------- 汇总 ----------
const summary = { total: 0, overflowX: [], wideElements: [], failedResources: [], imageIssues: [], hiddenIssues: [], smallTargets: [], scriptErrors: [], consoleErrors: [], layout: [] };
// 期望内容列 = min(1120, 视口可用宽 - 2×gutter)；视口可用宽用 clientWidth（扣除滚动条）
const gutterOf = (w) => (w >= 1024 ? 32 : w >= 768 ? 24 : 16);
for (const s of results.scenarios) {
  summary.total++;
  if (s.overflowX) summary.overflowX.push(`${s.page}@${s.width} scrollWidth=${s.scrollWidth}>clientWidth=${s.clientWidth} [${s.wideElements.join(' | ')}]`);
  if (s.wideElements.length && !s.overflowX) summary.wideElements.push(`${s.page}@${s.width} ${s.wideElements.join(' | ')}`);
  if (s.failedResources.length) summary.failedResources.push(`${s.page}@${s.width} ${s.failedResources.join(' | ')}`);
  if (s.heroArt && s.heroArt.natural !== '320x600') summary.imageIssues.push(`${s.page}@${s.width} 自然尺寸 ${s.heroArt.natural}`);
  if (s.heroArt && s.heroArt.complete === false) summary.imageIssues.push(`${s.page}@${s.width} 图片未加载完成`);
  for (const h of s.hiddenCheck) if (!/=(none|absent)$/.test(h)) summary.hiddenIssues.push(`${s.page}@${s.width} ${h}`);
  for (const [sel, h] of Object.entries(s.minHeights)) if (h !== null && h < 24) summary.smallTargets.push(`${s.page}@${s.width} ${sel}=${h}px`);
  if (s.pageErrors.length) summary.scriptErrors.push(`${s.page}@${s.width} ${s.pageErrors.join(' | ')}`);
  if (s.consoleErrors.length) summary.consoleErrors.push(`${s.page}@${s.width} ${s.consoleErrors.join(' | ')}`);
  if (s.failedRequests.length) summary.consoleErrors.push(`${s.page}@${s.width} 请求失败 ${s.failedRequests.join(' | ')}`);
  // 内容列宽：--width-site 为内容上限，不含 gutter（§6.1）
  if (s.containerPadding && s.viewportClientWidth) {
    const expected = Math.min(1120, s.viewportClientWidth - 2 * gutterOf(s.width));
    if (Math.abs(s.containerPadding.contentWidth - expected) > 1) summary.layout.push(`${s.page}@${s.width} 内容列 ${s.containerPadding.contentWidth}px ≠ 期望 ${expected}px`);
  }
  // 角色图显示上限（§9.2）
  if (s.page === 'home' && s.heroArt) {
    const cap = s.width >= 1024 ? 360 : s.width >= 768 ? 300 : 220;
    if (s.heroArt.h > cap) summary.layout.push(`${s.page}@${s.width} 角色图高 ${s.heroArt.h} > ${cap}`);
  }
  if (s.page === 'about' && s.heroArt) {
    const cap = s.width >= 1024 ? 300 : s.width >= 768 ? 240 : 220;
    if (s.heroArt.h > cap) summary.layout.push(`${s.page}@${s.width} About 角色图高 ${s.heroArt.h} > ${cap}`);
  }
  // 移动端隐藏装饰（§8、§14）：仅在含装饰的页面断言
  if (s.width <= 390 && s.heroTape !== null && s.heroTape !== undefined) {
    if (s.tapeDisplay !== 'none') summary.layout.push(`${s.page}@${s.width} 胶带未隐藏 display=${s.tapeDisplay}`);
    if (s.dotsDisplay && s.dotsDisplay !== 'none') summary.layout.push(`${s.page}@${s.width} 网点未隐藏 display=${s.dotsDisplay}`);
  }
  // 正文阅读列上限（§11.3）：正文段与头部各 ≤740px
  if (s.postParagraphWidth && s.postParagraphWidth > 740) summary.layout.push(`${s.page}@${s.width} 正文段宽 ${s.postParagraphWidth} > 740`);
  if (s.postHeaderWidth && s.postHeaderWidth > 740) summary.layout.push(`${s.page}@${s.width} 文章头部宽 ${s.postHeaderWidth} > 740`);
  // About 桌面两列（§11.4）
  if (s.page === 'about' && s.width >= 1024 && s.aboutGrid) {
    const g = s.aboutGrid;
    if (g.display !== 'grid') summary.layout.push(`about@${s.width} 未启用两列`);
    else if (!g.sideBySide) summary.layout.push(`about@${s.width} 介绍与角色图未并排 textCol=${g.textCol} artCol=${g.artCol} textRow=${g.textRow} artRow=${g.artRow}`);
  }
}
results.summary = summary;
fs.writeFileSync(path.join(outDir, 'render-checks.json'), JSON.stringify(results, null, 2));
note(`\n汇总: 溢出 ${summary.overflowX.length}、越界元素 ${summary.wideElements.length}、资源错误 ${summary.failedResources.length}、图片问题 ${summary.imageIssues.length}、隐藏项异常 ${summary.hiddenIssues.length}、脚本错误 ${summary.scriptErrors.length}、控制台错误 ${summary.consoleErrors.length}、布局偏差 ${summary.layout.length}`);
for (const k of ['overflowX', 'wideElements', 'failedResources', 'imageIssues', 'hiddenIssues', 'scriptErrors', 'consoleErrors', 'layout']) {
  if (summary[k].length) summary[k].forEach((v) => note(`  ${k}: ${v}`));
}
note(`结果: ${summary.overflowX.length + summary.failedResources.length + summary.imageIssues.length + summary.hiddenIssues.length + summary.layout.length === 0 ? 'PASS' : 'CHECK'}`);

try { if (child) child.kill(); } catch { /* ignore */ }
process.exit(0);
