/* Backdrops and scroll animation styles for the mocks. No libraries.
   BACKDROPS (fixed, behind everything): clean, aurora, grid, fireflies, ridges, photos.
   MOTION styles (how content arrives):
     choreo  each kind of content arrives its own way (default)
     rise    soft rise with blur-in
     scatter pieces fly in from different directions and settle
     flip    cards turn over like pages
     scrub   everything is tied to scroll position, continuous, reversible
     calm    no movement, only a fade
   Everything is visible without JavaScript, and under reduced motion nothing moves. */
(function () {
  'use strict';
  var doc = document, HE = doc.documentElement, RM = matchMedia('(prefers-reduced-motion: reduce)').matches, M = Math;
  var Anim = window.Anim = {}, RT = window.ROOT || '';
  function el(t, c, x) { var e = doc.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function css(n) { return getComputedStyle(HE).getPropertyValue(n).trim(); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------------------------------------------------------------- backdrops */
  var BACK = [['clean', 'Clean', 'Plain colour. Fastest and calmest.'], ['aurora', 'Aurora', 'Slow drifting glows that follow the palette.'], ['grid', 'Dot grid', 'A quiet grid of dots that ripples under the cursor.'], ['fireflies', 'Fireflies', 'Small lights drifting upward, like a night camp.'], ['ridges', 'Ridge sky', 'Layered mountain silhouettes that shift as you scroll.'], ['photos', 'Photo wash', 'Your own photographs, softly blurred behind the page.']];
  var cv = null, g = null, W = 0, H = 0, dpr = 1, mode = 'clean', raf = 0, mx = -999, my = -999, sy = 0, tsy = 0, parts = [], vis = true, colors = {}, photo = null, photoI = 0, photoT = 0;
  function readColors() { colors = { acc: css('--acc'), ink: css('--ink'), bg: css('--bg'), c1: css('--c1'), c2: css('--c2'), c3: css('--c3'), c4: css('--c4'), s2: css('--s2') }; }
  function size() { W = innerWidth; H = innerHeight; dpr = M.min(devicePixelRatio || 1, 1.5); cv.width = W * dpr | 0; cv.height = H * dpr | 0; seed(); }
  function seed() {
    parts = []; var n, i;
    if (mode === 'fireflies') { n = W < 700 ? 38 : 70; for (i = 0; i < n; i++) parts.push({ x: M.random() * W, y: M.random() * H, r: .8 + M.random() * 2.2, vx: (M.random() - .5) * .25, vy: -.1 - M.random() * .35, p: M.random() * 6, c: i % 4 }); }
    if (mode === 'grid') { var step = W < 700 ? 30 : 34; for (var y = step / 2; y < H + step; y += step) for (var x = step / 2; x < W + step; x += step) parts.push({ x: x, y: y }); }
  }
  function ridgePath(y0, amp, seed2, off, k) { var d = [], x; for (x = -40; x <= W + 40; x += 36) { d.push([x, y0 - (M.sin((x + off) * .006 + seed2) * .5 + M.sin((x + off) * .013 + seed2 * 2) * .3 + M.sin((x + off) * .029 + seed2 * 3) * .2 + 1) * amp]); } return d; }
  function draw(now) {
    raf = requestAnimationFrame(draw); if (!vis || doc.hidden) return; sy += (tsy - sy) * .08; var t = RM ? 0 : now / 1000, i;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    if (mode === 'aurora') {
      var cs = [colors.c1, colors.c2, colors.c3, colors.c4], pos = [[.2, .25], [.8, .3], [.35, .85], [.85, .8]];
      g.globalCompositeOperation = 'source-over';
      for (i = 0; i < 4; i++) { var x = (pos[i][0] + M.sin(t * .08 + i * 1.7) * .14) * W, y = (pos[i][1] + M.cos(t * .06 + i * 2.3) * .12) * H - sy * .02 * (i + 1), r = M.max(W, H) * (.38 + .06 * M.sin(t * .1 + i)); var gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, cs[i]); gr.addColorStop(1, 'transparent'); g.globalAlpha = HE.getAttribute('data-pal') && /ridge|mist/.test(HE.getAttribute('data-pal')) ? .2 : .17; g.fillStyle = gr; g.fillRect(0, 0, W, H); }
      g.globalAlpha = 1;
    } else if (mode === 'grid') {
      var R2 = 150 * 150; g.fillStyle = colors.ink;
      for (i = 0; i < parts.length; i++) { var p = parts[i], dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy, near = d2 < R2 ? 1 - d2 / R2 : 0, wave = .5 + .5 * M.sin(p.x * .01 + p.y * .012 + t * .6 - sy * .002); g.globalAlpha = .1 + wave * .08 + near * .6; g.beginPath(); g.arc(p.x, p.y - near * 6, 1.1 + near * 2.2 + wave * .4, 0, 6.283); g.fill(); }
      g.globalAlpha = 1;
    } else if (mode === 'fireflies') {
      var cc = [colors.c1, colors.c2, colors.acc, colors.c4];
      for (i = 0; i < parts.length; i++) { var f = parts[i]; f.x += f.vx + M.sin(t * .5 + f.p) * .18; f.y += f.vy + sy * 0; if (f.y < -10) { f.y = H + 10; f.x = M.random() * W; } if (f.x < -10) f.x = W + 10; if (f.x > W + 10) f.x = -10; var dx2 = f.x - mx, dy2 = f.y - my, d = M.sqrt(dx2 * dx2 + dy2 * dy2); if (d < 120) { f.x += dx2 / d * (120 - d) * .02; f.y += dy2 / d * (120 - d) * .02; } var tw = .45 + .55 * M.sin(t * 1.2 + f.p * 3); var gr2 = g.createRadialGradient(f.x, f.y - sy * .0, 0, f.x, f.y, f.r * 7); gr2.addColorStop(0, cc[f.c]); gr2.addColorStop(1, 'transparent'); g.globalAlpha = tw * .55; g.fillStyle = gr2; g.beginPath(); g.arc(f.x, f.y, f.r * 7, 0, 6.283); g.fill(); g.globalAlpha = tw; g.fillStyle = cc[f.c]; g.beginPath(); g.arc(f.x, f.y, f.r, 0, 6.283); g.fill(); }
      g.globalAlpha = 1;
    } else if (mode === 'ridges') {
      var layers = [[.62, 110, 1, .05, colors.c4, .16], [.74, 90, 2.4, .1, colors.c2, .2], [.86, 80, 4.1, .18, colors.c1, .22], [.97, 70, 6.2, .3, colors.s2, .5]];
      for (i = 0; i < layers.length; i++) { var l = layers[i], pts = ridgePath(H * l[0], l[1], l[2], sy * l[3] + t * 4 * (i + 1) * .15, l[3]); g.beginPath(); g.moveTo(-40, H + 10); for (var k = 0; k < pts.length; k++) g.lineTo(pts[k][0], pts[k][1]); g.lineTo(W + 40, H + 10); g.closePath(); g.globalAlpha = l[5]; g.fillStyle = l[4]; g.fill(); }
      g.globalAlpha = .5; g.fillStyle = colors.acc; g.beginPath(); g.arc(W * .82, H * .2 - sy * .01, M.min(W, H) * .06, 0, 6.283); g.fill(); g.globalAlpha = 1;
    } else if (mode === 'photos') {
      if (photo && photo.complete && photo.naturalWidth) { var fade = clamp((now - photoT) / 1200, 0, 1); var iw = photo.naturalWidth, ih = photo.naturalHeight, s = M.max(W / iw, H / ih) * 1.12; var ox = (W - iw * s) / 2 + M.sin(t * .05) * 20, oy = (H - ih * s) / 2 - (sy * .03 % 40); g.globalAlpha = .34 * fade; g.filter = 'blur(26px) saturate(1.15)'; g.drawImage(photo, ox, oy, iw * s, ih * s); g.filter = 'none'; g.globalAlpha = 1; }
    }
  }
  function nextPhoto() {
    if (mode !== 'photos') return; var all = []; (window.D ? D.albums : []).forEach(function (a) { a.photos.forEach(function (p) { all.push(p.f); }); }); if (!all.length) return;
    var im = new Image(); im.onload = function () { photo = im; photoT = performance.now(); }; im.src = RT + 'images/photography/thumbs/' + encodeURIComponent(all[(photoI = (photoI * 7 + 13) % all.length)]);
  }
  Anim.setBack = function (m) {
    mode = m; HE.setAttribute('data-back', m); if (!cv) { cv = el('canvas', 'backdrop'); cv.setAttribute('aria-hidden', 'true'); doc.body.insertBefore(cv, doc.body.firstChild); g = cv.getContext('2d'); readColors(); size(); addEventListener('resize', size); addEventListener('scroll', function () { tsy = scrollY; }, { passive: true }); addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true }); doc.addEventListener('visibilitychange', function () { vis = !doc.hidden; }); raf = requestAnimationFrame(draw); setInterval(nextPhoto, 14000); }
    readColors(); seed(); cv.style.display = m === 'clean' ? 'none' : 'block'; if (m === 'photos') nextPhoto();
  };

  /* ---------------------------------------------------------------- motion styles */
  var MOT = [['choreo', 'Choreographed', 'Each kind of content arrives its own way.'], ['rise', 'Soft rise', 'Fade up with a little blur, nothing more.'], ['scatter', 'Scatter and settle', 'Pieces fly in from different sides and land.'], ['flip', 'Page turn', 'Cards turn over like pages of a book.'], ['scrub', 'Tied to scroll', 'Position follows your scroll continuously, both ways.'], ['calm', 'Calm', 'Only a gentle fade.']];
  var mot = 'choreo', io = null, items = [], scrubItems = [], ticking = false;
  function kindOf(n) {
    if (n.matches('h1,h2')) return 'head'; if (n.matches('.stat')) return 'stat'; if (n.matches('.tile')) return 'tile'; if (n.matches('.door2')) return 'door'; if (n.matches('.ctile')) return 'ctile'; if (n.matches('.mas figure')) return 'photo'; if (n.matches('.gcard,.gdet,.chartcard,.tcard,.jwrap')) return 'panel'; if (n.matches('.pwrap')) return 'portrait'; return 'text';
  }
  var SEL = 'h2,.phead h1,.sec-h p,.lede,.about blockquote,.about .mute,.stat,.door2,.tile,.ctile,.gcard,.gdet,.chartcard,.tcard,.pwrap,.mas figure,.cta-row,.wallbar,.walltools,.explain';
  Anim.refresh = function (root) {
    root = root || doc; [].forEach.call(root.querySelectorAll(SEL), function (n) {
      if (n.dataset.an || n.closest('.film,dialog,.hero,.g-world')) return; n.dataset.an = '1'; n.classList.add('an'); n.dataset.k = kindOf(n); var idx = items.length; n.style.setProperty('--i', String(idx % 6)); items.push(n);
      if (n.dataset.k === 'head') split(n);
      if (n.dataset.k === 'tile' || n.dataset.k === 'photo' || n.dataset.k === 'stat' || n.dataset.k === 'door' || n.dataset.k === 'ctile') { var sib = n.parentNode ? [].indexOf.call(n.parentNode.children, n) : 0; n.style.setProperty('--i', String(sib % 8)); }
      if (mot === 'scrub') scrubItems.push(n); else watch(n);
    }); Anim.apply(); onScroll();
  };
  function split(h) { if (h.dataset.sp) return; h.dataset.sp = '1'; var t = h.textContent; h.setAttribute('aria-label', t); h.textContent = ''; t.split(' ').forEach(function (w, i) { var o = el('span', 'w'); o.setAttribute('aria-hidden', 'true'); o.style.setProperty('--w', i); o.appendChild(el('span', '', w)); h.appendChild(o); h.appendChild(doc.createTextNode(' ')); }); }
  function watch(n) { if (RM || !('IntersectionObserver' in window)) { n.classList.add('in'); return; } if (!io) io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px', threshold: .08 }); io.observe(n); }
  function onScroll() {
    if (ticking) return; ticking = true; requestAnimationFrame(function () {
      ticking = false; if (mot !== 'scrub' || RM) return; var vh = innerHeight;
      scrubItems.forEach(function (n) { var r = n.getBoundingClientRect(), p = clamp(1 - (r.top - vh * .38) / (vh * .55), 0, 1), k = n.dataset.k, e = p * p * (3 - 2 * p); n.style.setProperty('--p', e.toFixed(3)); });
    });
  }
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
  function sweepAll() { if (mot === 'scrub') return; var vh = innerHeight; items.forEach(function (n) { if (n.classList.contains('in')) return; var r = n.getBoundingClientRect(); if (r.top < vh * .95) n.classList.add('in'); }); }
  addEventListener('scroll', function () { requestAnimationFrame(sweepAll); }, { passive: true });
  Anim.apply = function () { };
  Anim.setMotion = function (m) {
    mot = m; HE.setAttribute('data-mot', m); scrubItems = []; if (io) { io.disconnect(); io = null; }
    items.forEach(function (n) { n.classList.remove('in'); n.style.removeProperty('--p'); });
    if (RM) { items.forEach(function (n) { n.classList.add('in'); }); return; }
    items.forEach(function (n) { if (m === 'scrub') scrubItems.push(n); else watch(n); }); onScroll();
  };

  Anim.init = function () {
    var b = 'grid', m = 'choreo';
    if (!BACK.some(function (x) { return x[0] === b; })) b = 'grid'; if (!MOT.some(function (x) { return x[0] === m; })) m = 'choreo';
    mot = m; HE.setAttribute('data-mot', m); Anim.setBack(b); Anim.refresh();
    var pe = window.X && X.onPal; if (window.X) X.onPal = function () { if (pe) pe(); readColors(); };
  };
})();
