(function () {
  'use strict';
  const site = window.Sywen = window.Sywen || {};

  // 「返回顶部」与页面滚动进度（PROJECT_PLAN §16.2、§16.3）。
  // 两个控件在 HTML 中默认 hidden；本模块初始化成功后才揭示，失败时页面保持原基线。
  const SHOW_AFTER = 480;    // §16.2：滚动超过 480px 后显示（浏览器取整可能落在 480～481 之间）
  const SETTLE_MAX = 700;    // 无 scrollend 时的兜底等待上限

  let progress = null;
  let frame = 0;
  let settleTimer = 0;
  let settleHandler = null;

  function motionQuery() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)'); } catch (_) { return null; }
  }
  const prefersReducedMotion = () => {
    const query = motionQuery();
    return Boolean(query && query.matches);
  };

  // §16.3：当前滚动距离 ÷（文档总高度 − 视口高度），限制 0～100%；不足一屏按 100%。
  function measure() {
    const scroller = document.scrollingElement || document.documentElement;
    if (!scroller) return 0;
    const max = scroller.scrollHeight - scroller.clientHeight;
    if (!(max > 0)) return 100;
    return Math.max(0, Math.min(100, Math.round((scroller.scrollTop / max) * 100)));
  }

  // §20.2：向菜单等调用者提供当前进度值；未初始化时返回 null。
  site.getReadingProgress = () => progress;
  site.prefersReducedMotion = prefersReducedMotion;

  function init() {
    const bar = document.getElementById('reading-progress');
    const button = document.getElementById('back-to-top');
    const title = document.querySelector('.page-title, .hero__title');
    if (title && !title.hasAttribute('tabindex')) title.tabIndex = -1;

    function scroller() { return document.scrollingElement || document.documentElement; }

    function update() {
      frame = 0;
      const value = measure();
      if (bar) {
        progress = value;
        bar.style.transform = 'scaleX(' + value / 100 + ')';
        bar.setAttribute('aria-valuenow', String(value));
      }
      if (button) {
        // 持焦时保持可见，避免键盘焦点落在不可见控件上。480 为边界（§16.2）。
        const show = scroller().scrollTop >= SHOW_AFTER || button === document.activeElement;
        button.classList.toggle('is-visible', show);
      }
    }

    function schedule() {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    }

    function cancelSettle() {
      if (!settleTimer) return;
      clearTimeout(settleTimer);
      settleTimer = 0;
      if (settleHandler) {
        window.removeEventListener('scrollend', settleHandler);
        settleHandler = null;
      }
    }

    function focusTop() {
      cancelSettle();
      const target = title || document.getElementById('main');
      if (!target) return;
      try { target.focus({ preventScroll: true }); } catch (_) { target.focus(); }
      // 焦点回到标题后按当前滚动位置重算一次，避免平滑滚动尾部的事件把按钮重新点亮。
      update();
    }

    function toTop() {
      if (prefersReducedMotion()) {
        try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch (_) { window.scrollTo(0, 0); }
        update();
        window.requestAnimationFrame(focusTop);
        return;
      }
      try { window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); } catch (_) { window.scrollTo(0, 0); }
      // 滚动停止后再接管焦点；期间用户自行滚动则放弃，不把页面拉回顶部。
      settleHandler = () => {
        window.removeEventListener('scrollend', settleHandler);
        settleHandler = null;
        update();      // 回到顶部后立刻收起按钮，不等过渡或兜底计时
        focusTop();
      };
      window.addEventListener('scrollend', settleHandler, { once: true });
      window.addEventListener('wheel', cancelSettle, { passive: true, once: true });
      window.addEventListener('touchstart', cancelSettle, { passive: true, once: true });
      settleTimer = window.setTimeout(focusTop, SETTLE_MAX);
    }

    if (bar) {
      bar.hidden = false;
      progress = 0;
    }
    if (button) {
      button.hidden = false;
      button.classList.remove('is-visible');
      button.addEventListener('click', toTop);
      // 页脚为浮动按钮预留空间（css/pages.css），无脚本时保持基线留白。
      document.documentElement.classList.add('has-reading');
    }

    site.updateReadingProgress = schedule;
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    document.querySelectorAll('img').forEach((img) => {
      img.addEventListener('load', schedule);
      img.addEventListener('error', schedule);
    });
    update();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
