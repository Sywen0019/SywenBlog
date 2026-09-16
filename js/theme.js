(function () {
  'use strict';
  const site = window.Sywen = window.Sywen || {};
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = (value) => value === 'light' || value === 'dark';
  let selected = null;
  try {
    const saved = localStorage.getItem('sywen.theme');
    if (valid(saved)) selected = saved;
  } catch (_) {
    // Storage may be disabled. In-memory selection still works.
  }

  function apply() {
    const theme = selected || (system.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    const button = document.getElementById('theme-toggle');
    if (button) {
      button.textContent = theme === 'dark' ? '切换至浅色' : '切换至深色';
      button.setAttribute('aria-pressed', String(theme === 'dark'));
    }
    return theme;
  }

  site.getTheme = () => root.dataset.theme;
  site.toggleTheme = function () {
    selected = site.getTheme() === 'dark' ? 'light' : 'dark';
    apply();
    try { localStorage.setItem('sywen.theme', selected); } catch (_) { /* optional persistence */ }
    return selected;
  };

  apply();
  system.addEventListener('change', () => { if (!selected) apply(); });
  window.addEventListener('storage', (event) => {
    if (event.key !== 'sywen.theme' && event.key !== null) return;
    selected = valid(event.newValue) ? event.newValue : null;
    apply();
  });

  function ready() {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    apply();
    button.addEventListener('click', site.toggleTheme);
    button.hidden = false;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})();
