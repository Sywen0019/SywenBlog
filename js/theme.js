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
      const label = theme === 'dark' ? '切换至浅色' : '切换至深色';
      // 工具按钮是紧凑图标按钮：可见文字收进 .theme-toggle__label（视觉隐藏），
      // 无障碍名称由 aria-label 承担，tooltip 由 title 承担，两者始终同步。
      const span = button.querySelector('.theme-toggle__label');
      if (span) span.textContent = label;
      else button.textContent = label;
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
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
