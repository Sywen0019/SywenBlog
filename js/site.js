(function () {
  'use strict';
  const site = window.Sywen = window.Sywen || {};
  const base = new URL(document.documentElement.dataset.siteRoot || './', location.href);
  site.resolveUrl = (path) => new URL(path, base).href;

  // Chromium and Firefox do not consistently allow a file:// document to use
  // an external SVG symbol through <use>. Keep the normal sprite for HTTP(S),
  // but provide the same small mark set inline when the site is opened from a
  // local file, so the functional header controls do not become empty boxes.
  const LOCAL_FILE = location.protocol === 'file:';
  const MARK_FALLBACKS = Object.freeze({
    'mark-book-stack': '<path d="M3 8.5h13.5v4H3z"/><path d="M5 8.5V6h13.5v2.5"/><path d="M4 12.5h13v4H4z"/><path d="M17 14.5h3.5v4H17"/><path d="M6.6 10.5h1.4M7.6 14.5h1.4"/>',
    'mark-notebook': '<path d="M6.5 3.5h11v17h-11z"/><path d="M6.5 3.5v17"/><path d="M9.5 7.5h5M9.5 11h5M9.5 14.5h3"/><path d="M4.5 7h2M4.5 12h2M4.5 17h2"/>',
    'mark-flower': '<path d="M12 12.5c-3.4-1-4.6-3-3.7-4.8.9-1.8 3-1.6 3.7 1.2"/><path d="M12 12.5c3.4-1 4.6-3 3.7-4.8-.9-1.8-3-1.6-3.7 1.2"/><path d="M12 12.5c-.6 3.5 0 5.4 2 5.7 2 .3 2.8-1.6.6-3.6"/><path d="M12 12.5c-.6-3.5-2.4-4.9-4.2-4.1-1.8.8-1.4 2.9 1.4 3.5"/><circle cx="12" cy="12.5" r="1.3"/>',
    'mark-laptop': '<path d="M5.5 6.5h13v9h-13z"/><path d="M3.5 17.5h17"/><path d="M10.5 15.5h3"/>',
    'mark-tablet-pen': '<path d="M4.5 4.5h11v15h-11z"/><path d="M7.5 8h5M7.5 11.5h5M7.5 15h3"/><path d="M18.4 6.2l1.4 1.4-6.6 6.6-1.9.5.5-1.9z"/>',
    'mark-reading': '<path d="M12 6.8C10.3 5.3 7.9 4.8 4.5 5.2v12.6c3.4-.4 5.8.1 7.5 1.6"/><path d="M12 6.8c1.7-1.5 4.1-2 7.5-1.6v12.6c-3.4-.4-5.8.1-7.5 1.6"/><path d="M12 6.8v12.6"/>',
    'mark-coffee': '<path d="M4.5 8.5h12v6a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4z"/><path d="M16.5 10h1.8a2.2 2.2 0 0 1 0 4.4h-1.8"/><path d="M4.5 21h12"/><path d="M8 5.5c0-1 .8-1 .8-2M11.6 5.5c0-1 .8-1 .8-2"/>',
    'mark-headphones': '<path d="M4.5 15v-3a7.5 7.5 0 0 1 15 0v3"/><path d="M4.5 13.5h2.2v5H5.6a1.1 1.1 0 0 1-1.1-1.1z"/><path d="M19.5 13.5h-2.2v5h1.1a1.1 1.1 0 0 0 1.1-1.1z"/>',
    'mark-arrow-right': '<path d="M4.5 12h14"/><path d="M13.5 7l5 5-5 5"/>',
    'mark-archive': '<path d="M4 5.5h16v3.5H4z"/><path d="M5.5 9v9.5h13V9"/><path d="M10 12.5h4"/>',
    'mark-grid': '<path d="M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z"/>',
    'mark-sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8"/>',
    'mark-moon': '<path d="M19 14.6A8 8 0 0 1 9.4 5a8 8 0 1 0 9.6 9.6z"/>',
    'mark-menu': '<path d="M4 7h16M4 12h16M4 17h16"/>'
  });

  function useLocalMark(svg, symbol) {
    const markup = MARK_FALLBACKS[symbol];
    if (!markup) return false;
    if (!svg.hasAttribute('viewBox')) svg.setAttribute('viewBox', '0 0 24 24');
    svg.innerHTML = markup;
    return true;
  }

  function hydrateLocalMarks() {
    if (!LOCAL_FILE) return;
    document.querySelectorAll('svg > use').forEach((use) => {
      const href = use.getAttribute('href') || use.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
      const hash = href.lastIndexOf('#');
      if (hash < 0) return;
      useLocalMark(use.parentElement, href.slice(hash + 1));
    });
  }

  // 统一状态提示与复制（PROJECT_PLAN §15.6、§16.4）。
  // 这里是唯一的提示与剪贴板入口：菜单、复制面板等都调用同一份实现，不维护第二套。
  const NOTICE_MS = 3000;
  let noticeTimer = 0;

  // §16.4：复制成功等短消息走统一状态区，不弹出 alert()。元素缺失时静默。
  site.notify = function (message, options) {
    const notice = document.getElementById('site-notice');
    if (!notice) return;
    const ms = options && typeof options.duration === 'number' ? options.duration : NOTICE_MS;
    if (noticeTimer) { clearTimeout(noticeTimer); noticeTimer = 0; }
    notice.textContent = message;
    notice.hidden = false;
    if (ms > 0) noticeTimer = window.setTimeout(() => { noticeTimer = 0; notice.hidden = true; }, ms);
  };

  site.hideNotice = function () {
    if (noticeTimer) { clearTimeout(noticeTimer); noticeTimer = 0; }
    const notice = document.getElementById('site-notice');
    if (notice) notice.hidden = true;
  };

  // §15.6：优先 Clipboard API。它要求安全上下文，写入也可能失败，因此一律转成布尔结果，
  // 由调用方决定是否展示手动复制面板；本函数不抛异常、不写存储。
  site.copyText = function (text) {
    const value = String(text == null ? '' : text);
    const secure = location.protocol === 'https:' || location.protocol === 'http:';
    if (!secure || !navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      return Promise.resolve(false);
    }
    try {
      return Promise.resolve(navigator.clipboard.writeText(value)).then(() => true, () => false);
    } catch (_) {
      return Promise.resolve(false);
    }
  };

  // §15.2「复制页面链接」＝当前完整地址（含查询与片段），由调用方决定何时使用。
  site.siteUrl = () => location.href;

  // §15.2「复制文章链接」＝不含查询和片段的文章地址。
  site.publicUrl = function () {
    let url = location.href;
    // 与 URL 解析一致地只截断搜索串与片段，不误伤编码后的其他字符。
    const hash = url.indexOf('#');
    if (hash !== -1) url = url.slice(0, hash);
    const query = url.indexOf('?');
    if (query !== -1) url = url.slice(0, query);
    return url;
  };

  // §15.2「搜索文章」：列表页聚焦搜索框，其他页进入 blog.html?focus=search（由 blog.js 聚焦）。
  site.focusSearch = function () {
    const input = document.getElementById('search-input');
    if (input) {
      input.focus();
      return true;
    }
    location.href = site.resolveUrl('blog.html?focus=search');
    return false;
  };

  // §15.2「返回顶部」：复用 reading.js 的唯一实现（不复制滚动与聚焦逻辑）。
  site.goTop = function () {
    if (typeof site.requestTop === 'function') site.requestTop();
    else window.scrollTo(0, 0);
  };

  // Editorial Marks（docs/visual-architecture.md §6）：装饰性线稿符号，
  // 永远 aria-hidden、不可聚焦，只作 editorial annotation。
  site.createMark = function (name, modifier) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'mark' + (modifier ? ' mark--' + modifier : ''));
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    if (LOCAL_FILE && useLocalMark(svg, 'mark-' + name)) return svg;
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', site.resolveUrl('assets/icons/marks.svg#mark-' + name));
    svg.append(use);
    return svg;
  };

  // 档案编号：编号跟着文章本身，不跟着当前筛选结果，避免同一篇在筛选后换号。
  site.archiveNumber = function (post) {
    const list = Array.isArray(site.posts) ? site.posts : [];
    const position = list.findIndex((item) => item.slug === post.slug);
    return position < 0 ? null : position + 1;
  };

  site.createPostEntry = function (post, headingLevel, options) {
    const category = site.categories.find((item) => item.id === post.category);
    if (!category || typeof post.title !== 'string' || typeof post.summary !== 'string'
        || !Array.isArray(post.tags) || !post.tags.every((tag) => typeof tag === 'string')
        || !/^posts\/[a-z0-9-]+\.html$/.test(post.url) || !/^\d{4}-\d{2}-\d{2}$/.test(post.date)) {
      throw new Error('Invalid registered article');
    }
    const index = options && Number.isInteger(options.index)
      ? options.index
      : (site.archiveNumber(post) || 1) - 1;
    const entry = document.createElement('li');
    entry.className = 'post-entry';
    entry.dataset.postId = post.slug;
    const date = document.createElement('time');
    date.className = 'post-entry__date';
    date.dateTime = post.date;
    date.textContent = post.date;
    const content = document.createElement('div');
    content.className = 'post-entry__content';
    const label = document.createElement('p');
    label.className = 'post-entry__category';
    // Blog 条目按档案页语法带上编号与分类 mark；两者都是装饰，不承担信息。
    const number = document.createElement('span');
    number.className = 'post-entry__number';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = 'A-' + String(index + 1).padStart(2, '0');
    label.append(number);
    if (category.mark && typeof site.createMark === 'function') {
      const mark = document.createElement('span');
      mark.className = 'category-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.append(site.createMark(category.mark, 'small'));
      label.append(mark);
    }
    label.append(document.createTextNode(category.name + ' '));
    const meta = document.createElement('span');
    meta.className = 'post-entry__meta';
    meta.textContent = '/ ' + post.readingTime + ' 分钟' + (post.isDemo ? ' · 示例' : '') + (post.isTestSample ? ' · 测试样例' : '');
    label.append(meta);
    const heading = document.createElement(headingLevel === 3 ? 'h3' : 'h2');
    heading.className = 'post-entry__title';
    const link = document.createElement('a');
    link.className = 'post-entry__link';
    link.href = site.resolveUrl(post.url);
    link.textContent = post.title;
    heading.append(link);
    const summary = document.createElement('p');
    summary.className = 'post-entry__summary';
    summary.textContent = post.summary;
    content.append(label, heading, summary);
    entry.append(date, content);
    return entry;
  };

  // Static HTML is replaced only after every new entry has been created.
  try {
    if (Array.isArray(site.posts) && Array.isArray(site.categories)) {
      site.posts = site.posts.slice().sort((a, b) => b.date.localeCompare(a.date) || a.id - b.id);
      const recent = document.getElementById('home-recent');
      if (recent) {
        const fragment = document.createDocumentFragment();
        site.posts.slice(0, 3).forEach((post) => fragment.append(site.createPostEntry(post, 3)));
        recent.replaceChildren(fragment);
      }
      document.querySelectorAll('[data-category-count]').forEach((node) => {
        node.textContent = site.posts.filter((post) => post.category === node.dataset.categoryCount).length;
      });
    }
  } catch (_) { /* Existing article links remain available. */ }

  // Static marks are already in the DOM; dynamic marks use the same fallback
  // in createMark above, so both Home and Blog remain complete under file://.
  hydrateLocalMarks();

  // 图片加载状态：成功隐藏 Sywen 文本回退，失败隐藏破损图标并显示短文本。
  // 抽成函数，供 createPostEntry 动态生成的分类缩略图复用。
  function watchImage(img) {
    function update() {
      const failed = img.naturalWidth === 0;
      img.classList.toggle('is-failed', failed);
      img.classList.toggle('is-loaded', !failed);
      const frame = img.closest('.art-frame');
      if (frame) frame.classList.toggle('is-failed', failed);
      else if (failed && img.alt === '') img.hidden = true;
    }
    img.addEventListener('load', update);
    img.addEventListener('error', update);
    if (img.complete) update();
  }
  document.querySelectorAll('img').forEach(watchImage);
})();
