(function () {
  'use strict';
  const site = window.Sywen = window.Sywen || {};
  const base = new URL(document.documentElement.dataset.siteRoot || './', location.href);
  site.resolveUrl = (path) => new URL(path, base).href;

  site.createPostEntry = function (post, headingLevel) {
    const category = site.categories.find((item) => item.id === post.category);
    if (!category || typeof post.title !== 'string' || typeof post.summary !== 'string'
        || !Array.isArray(post.tags) || !post.tags.every((tag) => typeof tag === 'string')
        || !/^posts\/[a-z0-9-]+\.html$/.test(post.url) || !/^\d{4}-\d{2}-\d{2}$/.test(post.date)) {
      throw new Error('Invalid registered article');
    }
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
    label.textContent = category.name + ' ';
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

  document.querySelectorAll('img').forEach((img) => {
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
  });
})();
