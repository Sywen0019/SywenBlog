(function () {
  'use strict';
  const site = window.Sywen = window.Sywen || {};
  const base = new URL(document.documentElement.dataset.siteRoot || './', location.href);
  site.resolveUrl = (path) => new URL(path, base).href;

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
    meta.textContent = '/ ' + post.readingTime + ' 分钟' + (post.isDemo ? ' · 示例' : '');
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
