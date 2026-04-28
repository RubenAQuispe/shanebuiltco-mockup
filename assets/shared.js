// Shane Built Co — shared interactive logic.
// (Vanilla JS, no dependencies.)

(function() {
  'use strict';

  // ============== Hero carousel ==============
  function initCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-indicators button');
    if (!slides.length) return;

    let idx = 0;
    let timer = null;
    const interval = 5500; // 5.5s per slide
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(i) {
      slides.forEach((s, n) => s.classList.toggle('active', n === i));
      dots.forEach((d, n) => d.classList.toggle('active', n === i));
      idx = i;
    }

    function next() { show((idx + 1) % slides.length); }

    function start() {
      if (reduced) return;
      stop();
      timer = setInterval(next, interval);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { show(i); start(); });
    });

    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    show(0);
    start();
  }

  // ============== Active nav highlighting ==============
  function highlightActiveNav() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav ul a').forEach(link => {
      const href = link.getAttribute('href').replace(/\/$/, '') || '/';
      if (href === path || (href !== '/' && path.startsWith(href))) {
        link.classList.add('active');
      }
    });
  }

  // Init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initCarousel(); highlightActiveNav(); });
  } else {
    initCarousel(); highlightActiveNav();
  }
})();
