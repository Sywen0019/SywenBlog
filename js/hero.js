(function () {
  'use strict';
  const name = document.querySelector('.hero-name');
  if (!name || !window.CSS || !CSS.supports('clip-path', 'circle(40px at 20px 20px)')
      || !(CSS.supports('mask-image', 'radial-gradient(circle, transparent, black)')
        || CSS.supports('-webkit-mask-image', 'radial-gradient(circle, transparent, black)'))) return;

  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let x = 0;
  let y = 0;
  let inside = false;

  function reset() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    inside = false;
    name.classList.remove('is-lens-active');
    name.style.removeProperty('--lens-x');
    name.style.removeProperty('--lens-y');
  }

  function paint() {
    frame = 0;
    if (!inside || !pointer.matches || reduced.matches) return;
    name.style.setProperty('--lens-x', x + 'px');
    name.style.setProperty('--lens-y', y + 'px');
    name.classList.add('is-lens-active');
  }

  name.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || !pointer.matches || reduced.matches) return;
    const bounds = name.getBoundingClientRect();
    x = event.clientX - bounds.left;
    y = event.clientY - bounds.top;
    inside = true;
    if (!frame) frame = window.requestAnimationFrame(paint);
  }, { passive: true });
  name.addEventListener('pointerleave', reset);
  name.addEventListener('pointercancel', reset);
  window.addEventListener('blur', reset);
  window.addEventListener('resize', reset);
  window.addEventListener('scroll', reset, { passive: true });
  pointer.addEventListener('change', reset);
  reduced.addEventListener('change', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
})();
