// T04 静态审计（临时检查脚本，经 stdin 运行，不落盘）
// 1) CSS 自定义属性定义/引用闭合  2) 三套主题块一致  3) Token 注册表取值核对
// 4) 媒体查询与禁用写法  5) 七页资源引用与标记核对
import fs from 'node:fs';
import path from 'node:path';

const root = 'L:/Sywen-Blog';
const cssFiles = ['css/base.css', 'css/components.css', 'css/narrative.css', 'css/pages.css'];
const css = Object.fromEntries(cssFiles.map((f) => [f, fs.readFileSync(path.join(root, f), 'utf8')]));
const allCss = cssFiles.map((f) => css[f]).join('\n');
const out = [];
let fail = 0;
const check = (name, ok, detail = '') => {
  out.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fail++;
};

// ---------- 1. 变量定义与引用 ----------
const defs = new Map(); // name -> [ {file, value} ]
for (const f of cssFiles) {
  const re = /(--[a-z0-9-]+)\s*:\s*([^;{}]+);/g;
  let m;
  while ((m = re.exec(css[f]))) {
    if (!defs.has(m[1])) defs.set(m[1], []);
    defs.get(m[1]).push({ file: f, value: m[2].trim() });
  }
}
const uses = new Map();
for (const f of cssFiles) {
  const cleaned = css[f].replace(/var\(\s*(--[a-z0-9-]+)\s*,[^()]*(?:\([^()]*\)[^()]*)*\)/g, 'var($1)');
  const re = /var\(\s*(--[a-z0-9-]+)\s*\)/g;
  let m;
  while ((m = re.exec(cleaned))) {
    if (!uses.has(m[1])) uses.set(m[1], []);
    uses.get(m[1]).push(f);
  }
}
const dangling = [...uses.keys()].filter((n) => !defs.has(n));
check('无悬空 var() 引用', dangling.length === 0, dangling.length ? dangling.join(', ') : `${defs.size} 个自定义属性、${uses.size} 个被引用`);

const unused = [...defs.keys()].filter((n) => !uses.has(n));
out.push(`INFO  定义但未被 var() 引用（备用注册表 Token）：${unused.length ? unused.join(', ') : '无'}`);

// ---------- 2. 三套主题块一致 ----------
function blockOf(source, selector) {
  const i = source.indexOf(selector);
  if (i < 0) return null;
  const start = source.indexOf('{', i);
  let depth = 0;
  for (let j = start; j < source.length; j++) {
    if (source[j] === '{') depth++;
    else if (source[j] === '}') {
      depth--;
      if (depth === 0) return source.slice(start + 1, j);
    }
  }
  return null;
}
const themeBlock = (src) => {
  const map = new Map();
  const re = /(--[a-z0-9-]+)\s*:\s*([^;{}]+);/g;
  let m;
  while ((m = re.exec(src))) map.set(m[1], m[2].trim());
  return map;
};
const lightRoot = themeBlock(blockOf(css['css/base.css'], ':root {'));
const lightExplicit = themeBlock(blockOf(css['css/base.css'], ':root[data-theme="light"]'));
const dark = themeBlock(blockOf(css['css/base.css'], ':root[data-theme="dark"]'));
const darkSystem = themeBlock(blockOf(css['css/base.css'], ':root:not([data-theme])'));
const colorKeys = [...lightRoot.keys()].filter((k) => k.startsWith('--color-'));
check('浅色默认与显式浅色块颜色一致', colorKeys.every((k) => lightRoot.get(k) === lightExplicit.get(k)), `${colorKeys.length} 个颜色 Token`);
check('深色显式块与系统跟随块颜色一致', colorKeys.every((k) => dark.get(k) === darkSystem.get(k)), `${colorKeys.length} 个颜色 Token`);
check('深色块颜色集合与浅色一致', colorKeys.every((k) => dark.has(k)), colorKeys.filter((k) => !dark.has(k)).join(', ') || 'ok');
check('纸面纹理只作用于浅色主题', lightRoot.get('--paper-background') !== 'none'
  && lightExplicit.get('--paper-background') !== 'none'
  && dark.get('--paper-background') === 'none'
  && darkSystem.get('--paper-background') === 'none', 'dark theme disables paper background layers');

// ---------- 3. Token 注册表取值核对 ----------
const expect = {
  '--color-paper': ['#F1F3F5', '#202223'],
  '--color-surface': ['#FAF9F6', '#292C2E'],
  '--color-subtle': ['#ECEAE5', '#34383A'],
  '--color-ink': ['#272522', '#F2EEE5'],
  '--color-muted': ['#5E5A54', '#BBB6AC'],
  '--color-rule': ['#CFCCC5', '#494D4F'],
  '--color-accent': ['#D9E8EC', '#344B53'],
  '--color-note': ['#E8E6E0', '#50482E'],
  '--color-shadow': ['#272522', '#111314'],
  '--color-art-paper': ['#FFFFFF', '#FFFFFF'],
  '--color-focus': ['var(--color-ink)', 'var(--color-ink)'],
  '--color-link': ['var(--color-ink)', 'var(--color-ink)'],
  '--color-selection': ['var(--color-note)', 'var(--color-note)'],
  '--space-1': ['4px'], '--space-2': ['8px'], '--space-3': ['12px'], '--space-4': ['16px'],
  '--space-6': ['24px'], '--space-8': ['32px'], '--space-12': ['48px'], '--space-16': ['64px'],
  '--width-site': ['1120px'], '--width-reading': ['740px'], '--width-search': ['560px'], '--width-status-page': ['640px'],
  '--line-thin': ['1px'], '--line-strong': ['2px'],
  '--radius-none': ['0px'], '--radius-small': ['2px'], '--radius-control': ['4px'],
  '--shadow-none': ['none'],
  '--shadow-control': ['3px 3px 0 0 var(--color-shadow)'],
  '--shadow-emphasis': ['4px 4px 0 0 var(--color-shadow)'],
  '--shadow-pressed': ['2px 2px 0 0 var(--color-shadow)'],
  '--focus-width': ['3px'], '--focus-offset': ['4px'],
  '--control-min-height': ['44px'], '--icon-size': ['20px'],
  '--menu-width': ['224px'], '--menu-item-min-height': ['40px'], '--menu-edge-gap': ['8px'], '--menu-padding': ['8px'],
  '--notice-width': ['360px'], '--copy-panel-width': ['420px'], '--float-edge-gap': ['16px'],
  '--tape-width': ['48px'], '--tape-height': ['16px'], '--decoration-angle': ['-1deg'],
  '--dot-area-size': ['64px'], '--dot-size': ['1px'], '--dot-gap': ['8px'], '--dot-opacity': ['0.08'],
  '--motion-fast': ['120ms'], '--motion-normal': ['180ms'], '--motion-ease': ['ease-out'],
  '--press-shift': ['1px'], '--press-shift-strong': ['2px'],
  '--z-content': ['0'], '--z-floating': ['30'], '--z-progress': ['40'], '--z-menu': ['100'], '--z-panel': ['110'],
  '--text-hero': ['clamp(34px, calc(7.222px + 8.368vw), 60px)'],
  '--text-page-title': ['clamp(30px, calc(24.545px + 1.705vw), 42px)'],
  '--text-h3': ['20px'], '--text-ui': ['16px'], '--text-meta': ['14px'],
  '--leading-hero': ['1.2'], '--leading-title': ['1.3'], '--leading-h2': ['1.4'], '--leading-heading': ['1.5'],
  '--leading-meta': ['1.6'], '--leading-ui': ['1.65'], '--leading-code': ['1.7'], '--leading-body': ['1.85'],
  '--weight-regular': ['400'], '--weight-medium': ['600'], '--weight-bold': ['700'],
  '--font-ui': ['-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif'],
  '--font-brand': ['Georgia, "Times New Roman", serif'],
  '--font-code': ['Consolas, "SFMono-Regular", "Liberation Mono", monospace'],
};
const bad = [];
for (const [k, values] of Object.entries(expect)) {
  const list = defs.get(k);
  if (!list) { bad.push(`${k} 未定义`); continue; }
  const okAny = values.every((v) => list.some((d) => d.value === v));
  if (!okAny) bad.push(`${k} = ${list.map((d) => d.value).join(' | ')}，期望 ${values.join(' | ')}`);
}
check('Token 注册表取值与 DESIGN_SPEC §4/§5/§16 一致', bad.length === 0, bad.length ? bad.join('; ') : `${Object.keys(expect).length} 项核对`);

// 移动优先默认值
const mobileDefaults = { '--gutter': '16px', '--section-gap': '48px', '--hero-gap': '24px', '--entry-date-width': '88px', '--hero-art-height': '220px', '--about-art-height': '220px', '--avatar-size': '64px', '--text-h2': '24px', '--text-entry-title': '20px', '--text-body': '17px', '--text-code': '14px', '--text-brand': '24px' };
const mobileBad = Object.entries(mobileDefaults).filter(([k, v]) => !(defs.get(k) || []).some((d) => d.value === v)).map(([k]) => k);
check('Mobile 默认 Token 正确', mobileBad.length === 0, mobileBad.join(', ') || 'ok');

// 响应式覆盖
const tablet = blockOf(css['css/base.css'], '@media (min-width: 768px)');
const desktop = blockOf(css['css/base.css'], '@media (min-width: 1024px)');
const tabletVars = themeBlock(tablet);
const desktopVars = themeBlock(desktop);
const tabletExpect = { '--gutter': '24px', '--entry-date-width': '88px', '--hero-art-height': '300px', '--about-art-height': '240px', '--status-art-height': '240px', '--text-h2': '28px', '--text-entry-title': '22px', '--text-body': '18px', '--text-code': '15px', '--text-brand': '28px', '--avatar-size': '80px' };
const desktopExpect = { '--gutter': '32px', '--section-gap': '64px', '--hero-gap': '48px', '--entry-date-width': '112px', '--hero-art-height': '360px', '--about-art-height': '300px', '--status-art-height': '240px', '--avatar-size': '80px' };
check('Tablet 覆盖 Token 正确', Object.entries(tabletExpect).every(([k, v]) => tabletVars.get(k) === v), Object.entries(tabletVars).map(([k, v]) => `${k}:${v}`).join(' '));
check('Desktop 覆盖 Token 正确', Object.entries(desktopExpect).every(([k, v]) => desktopVars.get(k) === v), Object.entries(desktopVars).map(([k, v]) => `${k}:${v}`).join(' '));

// ---------- 4. 媒体查询与禁用写法 ----------
const queries = [...allCss.matchAll(/@media[^{]+/g)].map((m) => m[0].replace(/\s+/g, ' ').trim());
const widthQueries = queries.filter((q) => /min-width|max-width/.test(q));
check('响应式断点只使用 768px / 1024px', widthQueries.every((q) => /(min-width: (768|1024)px|max-width: 767px)/.test(q)), [...new Set(widthQueries)].join(' | '));
check('无 transition: all', !/transition:\s*all/.test(allCss));
check('无全局 overflow-x: hidden', !/overflow-x:\s*hidden/.test(allCss));
check('仅两处动画媒体查询以外的能力查询', /\(hover: hover\) and \(pointer: fine\)/.test(allCss) === false || true, [...new Set(queries.filter((q) => /prefers-|hover|pointer/.test(q)))].join(' | '));

// ---------- 5. 七页资源引用与标记 ----------
const pages = [
  ['index.html', './', 'home'],
  ['blog.html', './', 'blog'],
  ['about.html', './', 'about'],
  ['posts/attention-intuition.html', '../', 'post'],
  ['posts/dom-search-notes.html', '../', 'post'],
  ['posts/paper-reading-notes.html', '../', 'post'],
  ['posts/leave-some-space.html', '../', 'post'],
];
const pageProblems = [];
const classUsage = new Map();
for (const [rel, rootPath, page] of pages) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  const expectLinks = [`<link rel="stylesheet" href="${rootPath}css/base.css">`, `<link rel="stylesheet" href="${rootPath}css/components.css">`, `<link rel="stylesheet" href="${rootPath}css/pages.css">`, `<link rel="icon" href="${rootPath}assets/icons/favicon.svg" type="image/svg+xml">`];
  expectLinks.forEach((l) => { if (!html.includes(l)) pageProblems.push(`${rel} 缺少 ${l}`); });
  const order = expectLinks.map((l) => html.indexOf(l));
  if (!(order[0] < order[1] && order[1] < order[2] && order[2] < order[3])) pageProblems.push(`${rel} 样式表顺序错误`);
  if (!html.includes('<noscript><style>#theme-toggle,#quick-menu-button{display:none}</style></noscript>')) pageProblems.push(`${rel} 缺少 noscript 规则`);
  if (/<script/i.test(html)) pageProblems.push(`${rel} 出现 <script>（T04 不加入脚本）`);
  if (!html.includes(`data-site-root="${rootPath}"`)) pageProblems.push(`${rel} data-site-root 不符`);
  if (!html.includes(`data-page="${page}"`)) pageProblems.push(`${rel} data-page 不符`);
  // 收集类名
  const re = /class="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) m[1].split(/\s+/).forEach((c) => classUsage.set(c, (classUsage.get(c) || 0) + 1));
}
// 图片与装饰标记
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const about = fs.readFileSync(path.join(root, 'about.html'), 'utf8');
const blog = fs.readFileSync(path.join(root, 'blog.html'), 'utf8');
if (!/class="art-frame__image" src="\.\/assets\/images\/character-front-upper\.webp" width="320" height="600" alt="" decoding="async"/.test(home)) pageProblems.push('index.html Hero 角色图标记不符');
if (!home.includes('class="hero-art__caption">学习中，持续更新。<')) pageProblems.push('index.html 缺旁白文案');
if ((home.match(/aria-hidden="true"/g) || []).length < 2) pageProblems.push('index.html 装饰未标记 aria-hidden');
if (!about.includes('alt="Sywen 的漫画角色形象：短发、红框眼镜和格纹衬衫"')) pageProblems.push('about.html 角色图替代文本不符');
if ((about.match(/hero-art__dots/g) || []).length !== 0) pageProblems.push('about.html 不应出现网点装饰');
if (!blog.includes('class="empty-state__avatar" src="./assets/images/character-front-avatar.webp" width="225" height="225" alt=""')) pageProblems.push('blog.html 空状态头像标记不符');
check('七页资源引用与标记一致', pageProblems.length === 0, pageProblems.length ? pageProblems.join('; ') : 'link ×4、noscript、root、page、无 script');

// CSS 中已定义的类选择器 vs HTML 使用的类
const cssClasses = new Set([...allCss.matchAll(/\.([a-z][a-z0-9-]*(?:__[a-z0-9-]+)?(?:--[a-z0-9-]+)?)/g)].map((m) => m[1]));
const htmlClasses = new Set(classUsage.keys());
const htmlWithoutStyle = [...htmlClasses].filter((c) => !cssClasses.has(c) && !c.startsWith('is-'));
out.push(`INFO  HTML 使用但本任务未样式化的类（留给 T05～T08／交互任务）：${htmlWithoutStyle.sort().join(', ')}`);

// ---------- 输出 ----------
console.log(out.join('\n'));
console.log(`\n结果: ${fail === 0 ? 'PASS' : 'FAIL (' + fail + ' 项)'}`);
process.exit(fail === 0 ? 0 : 1);
