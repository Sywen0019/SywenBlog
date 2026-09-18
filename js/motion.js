(function () {
  'use strict';

  const root = document.documentElement;
  const page = root.dataset.page;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = [];

  function add(selector, options) {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.add('motion-reveal');
      if (options && options.delay) element.style.setProperty('--motion-delay', options.delay);
      targets.push(element);
    });
  }

  root.classList.add('motion-ready');

  if (page === 'home') {
    add('.hero__eyebrow', { delay: '0ms' });
    add('.hero__title', { delay: '40ms' });
    add('.hero__intro', { delay: '80ms' });
    add('.hero__actions', { delay: '120ms' });
    add('.hero-art', { delay: '160ms' });
    add('.home-section');
  } else if (page === 'blog') {
    add('.page-header');
    add('.blog-filters');
    add('#blog-results');
    add('#blog-static-list');
  } else if (page === 'about') {
    add('.page-header');
    add('.about-section');
  } else if (page === 'post') {
    add('.post-header');
  }

  if (reduce || !targets.length || typeof IntersectionObserver !== 'function') {
    targets.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      instance.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

  targets.forEach((element) => observer.observe(element));
  requestAnimationFrame(() => {
    targets.filter((element) => element.getBoundingClientRect().top < window.innerHeight * 0.92)
      .forEach((element) => element.classList.add('is-visible'));
  });
})();
