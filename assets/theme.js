/* Locked look: Ridge light palette, Frosted glass surfaces, Cursor halo backdrop. theme.js only feeds the cursor position
   to the halo (CSS variables --mx/--my). The attributes themselves are written into each page's <html> tag by the build. */
(function () {
  'use strict';
  /* where the site root is, relative to this page (pages live at /, /work/, /photos/, /explore/; 404 is served from any path) */
  var pg = document.documentElement.getAttribute('data-page') || 'index';
  window.ROOT = pg === '404' ? '/' : (pg === 'index' ? '' : '../');
  /* link to a page of this site. On GitHub Pages "work/" serves work/index.html. When the files are opened straight from
     disk (file://) a folder link would show a folder listing instead, so there we point at the index.html file itself. */
  var LOCAL = location.protocol === 'file:';
  if (LOCAL && pg === '404') window.ROOT = '';
  window.PAGE = function (name, hash) {
    var R = window.ROOT, h = hash ? '#' + hash : '';
    if (!name || name === 'home' || name === 'index') return (LOCAL ? R + 'index.html' : (R || './')) + h;
    return R + name + '/' + (LOCAL ? 'index.html' : '') + h;
  };
  var HE = document.documentElement, raf = 0, mx = 50, my = 30;
  window.Theme = { set: function () {} };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    mx = e.clientX / innerWidth * 100; my = e.clientY / innerHeight * 100;
    if (!raf) raf = requestAnimationFrame(function () { raf = 0; HE.style.setProperty('--mx', mx.toFixed(1) + '%'); HE.style.setProperty('--my', my.toFixed(1) + '%'); });
  }, { passive: true });
})();
