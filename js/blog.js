(function () {
  'use strict';
  const site = window.Sywen;
  const filters = document.getElementById('blog-filters');
  const results = document.getElementById('blog-results');
  const fallback = document.getElementById('blog-static-list');
  const empty = document.getElementById('blog-empty');
  const input = document.getElementById('search-input');
  const form = document.getElementById('search-form');
  const count = document.getElementById('result-count');
  const categories = document.getElementById('blog-categories');
  const reset = document.getElementById('reset-filters');
  const emptyReset = document.getElementById('empty-reset');
  if (!filters || !results || !fallback || !empty || !input || !form || !count || !categories || !reset || !emptyReset) return;
  let category = 'all';
  let composing = false;
  let timer;
  let initialized = false;

  function restoreStatic() {
    clearTimeout(timer);
    filters.hidden = true;
    results.hidden = true;
    empty.hidden = true;
    fallback.hidden = false;
    initialized = false;
  }

  try {
    if (!site || !Array.isArray(site.posts) || !site.posts.length || !Array.isArray(site.categories)
        || typeof site.createPostEntry !== 'function') return;
    // Validate the complete dataset before revealing any controls, including filtered-out entries.
    site.posts.forEach((post) => site.createPostEntry(post, 2));
    const buttons = Array.from(categories.querySelectorAll('button[data-category]'));
    const isCategory = (value) => site.categories.some((item) => item.id === value);
    function readUrl() {
      const params = new URL(location.href).searchParams;
      input.value = params.get('q') || '';
      category = isCategory(params.get('category')) ? params.get('category') : 'all';
    }
    function render(syncUrl = true) {
      const query = input.value.trim();
      const words = query.toLowerCase().split(/\s+/).filter(Boolean);
      const matches = site.posts.filter((post) => {
        const text = [post.title, post.summary, ...post.tags].join(' ').toLowerCase();
        return (category === 'all' || post.category === category) && words.every((word) => text.includes(word));
      });
      const list = document.createElement('ol');
      list.className = 'post-list';
      matches.forEach((post) => list.append(site.createPostEntry(post, 2)));
      results.replaceChildren(list);
      results.hidden = matches.length === 0;
      empty.hidden = matches.length !== 0;
      buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
      clearTimeout(timer);
      const message = '找到 ' + matches.length + ' 篇文章';
      if (!initialized) count.textContent = message;
      else timer = setTimeout(() => { count.textContent = message; }, 300);
      if (syncUrl) {
        try {
          const url = new URL(location.href);
          if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
          if (category !== 'all') url.searchParams.set('category', category); else url.searchParams.delete('category');
          history.replaceState(null, '', url);
        } catch (_) { /* Filtering also works when URL updates are unavailable. */ }
      }
    }
    function update() {
      if (!initialized) return;
      try { render(); } catch (_) { restoreStatic(); }
    }
    readUrl();
    render(false);
    input.addEventListener('compositionstart', () => { composing = true; });
    input.addEventListener('compositionend', () => { composing = false; update(); });
    input.addEventListener('input', (event) => { if (!composing && !event.isComposing) update(); });
    form.addEventListener('submit', (event) => { event.preventDefault(); if (!composing) update(); });
    buttons.forEach((button) => button.addEventListener('click', () => {
      category = button.dataset.category;
      update();
    }));
    function clear() {
      input.value = '';
      category = 'all';
      composing = false;
      input.focus(); // Move away from the empty-state reset before hiding that state.
      update();
    }
    reset.addEventListener('click', clear);
    emptyReset.addEventListener('click', clear);
    window.addEventListener('popstate', () => {
      if (!initialized) return;
      try { readUrl(); render(false); } catch (_) { restoreStatic(); }
    });
    fallback.hidden = true;
    filters.hidden = false;
    initialized = true;
    if (new URL(location.href).searchParams.get('focus') === 'search') input.focus();
  } catch (_) { restoreStatic(); }
})();
