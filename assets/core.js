/* Shared pieces for the three mocks. Reads window.D (data.js). No libraries. */
(function () {
  'use strict';
  var D = window.D, doc = document, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var RT = window.ROOT || '', IMG = RT + 'images/photography/';
  function el(t, c, x) { var e = doc.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function a(href, c, x) { var e = el('a', c, x); e.href = href; return e; }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  var C = window.C = {};

  /* ---- palette dock ---- */
  var PAL = [['ember', '#ff7a30', '#130f0c'], ['glacier', '#4cc9f0', '#091017'], ['dusk', '#ff6f9c', '#110e18'], ['pine', '#79d99c', '#0a120e'], ['fog', '#c2410c', '#edf0f1']];
  C.dock = function () {
    var d = el('div', 'dock'); d.setAttribute('role', 'group'); d.setAttribute('aria-label', 'Try a colour palette'); d.appendChild(el('span', '', 'Palette'));
    var saved = null; try { saved = localStorage.getItem('v2pal'); } catch (e) { /* ignore */ }
    function set(n) { doc.documentElement.setAttribute('data-pal', n); try { localStorage.setItem('v2pal', n); } catch (e) { /* ignore */ } [].forEach.call(d.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.p === n)); }); if (C.onPal) C.onPal(); }
    PAL.forEach(function (p) { var b = el('button'); b.type = 'button'; b.dataset.p = p[0]; b.title = p[0]; b.setAttribute('aria-label', p[0] + ' palette'); b.style.background = 'linear-gradient(135deg,' + p[2] + ' 50%,' + p[1] + ' 50%)'; b.addEventListener('click', function () { set(p[0]); }); d.appendChild(b); });
    doc.body.appendChild(d); set(saved && PAL.some(function (p) { return p[0] === saved; }) ? saved : 'ember');
  };

  /* ---- hero: contour lines of a drifting terrain that bends around the pointer ---- */
  C.topo = function (cv) {
    var g = cv.getContext('2d'), W = 0, H = 0, dpr = 1, GX = 0, GY = 0, cell = 18, f = null, mx = -9999, my = -9999, vis = true, t0 = performance.now();
    var perm = new Uint8Array(512), i; for (i = 0; i < 256; i++) perm[i] = i; for (i = 255; i > 0; i--) { var j = (i * 7919 + 13) % (i + 1), tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp; } for (i = 0; i < 256; i++) perm[i + 256] = perm[i];
    function grad(h, x, y) { var u = (h & 1) ? x : -x, v = (h & 2) ? y : -y; return u + v; }
    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function noise(x, y) { var X = Math.floor(x) & 255, Y = Math.floor(y) & 255; x -= Math.floor(x); y -= Math.floor(y); var u = fade(x), v = fade(y), A = perm[X] + Y, B = perm[X + 1] + Y; return (1 - v) * ((1 - u) * grad(perm[A], x, y) + u * grad(perm[B], x - 1, y)) + v * ((1 - u) * grad(perm[A + 1], x, y - 1) + u * grad(perm[B + 1], x - 1, y - 1)); }
    function size() { var r = cv.parentElement.getBoundingClientRect(); W = Math.max(2, r.width); H = Math.max(2, r.height); dpr = Math.min(devicePixelRatio || 1, 2); cv.width = W * dpr | 0; cv.height = H * dpr | 0; cell = W < 700 ? 16 : 20; GX = Math.ceil(W / cell) + 2; GY = Math.ceil(H / cell) + 2; f = new Float32Array(GX * GY); }
    var LV = 15;
    function col(n) { return getComputedStyle(doc.documentElement).getPropertyValue(n).trim(); }
    var cAcc = '#ff7a30', cInk = '#f4ede4';
    C.onPal = function () { cAcc = col('--acc'); cInk = col('--ink'); };
    function draw(now) {
      if (!vis) { requestAnimationFrame(draw); return; }
      var t = RM ? 0 : (now - t0) / 1000, x, y, k;
      for (y = 0; y < GY; y++) for (x = 0; x < GX; x++) {
        var px = x * cell, py = y * cell, v = noise(px * 0.0032 + t * 0.018, py * 0.0032 + 3.7) * 0.8 + noise(px * 0.008 - t * 0.03, py * 0.008) * 0.25;
        var dx = px - mx, dy = py - my, d2 = dx * dx + dy * dy; v += 0.9 * Math.exp(-d2 / (2 * 170 * 170));
        f[y * GX + x] = v;
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); g.lineWidth = 1.1; g.lineJoin = 'round';
      for (k = 0; k < LV; k++) {
        var lv = -0.55 + k * 0.09, major = k % 4 === 0; g.beginPath();
        for (y = 0; y < GY - 1; y++) for (x = 0; x < GX - 1; x++) {
          var a0 = f[y * GX + x], b0 = f[y * GX + x + 1], c0 = f[(y + 1) * GX + x + 1], d0 = f[(y + 1) * GX + x];
          var s = (a0 > lv ? 8 : 0) | (b0 > lv ? 4 : 0) | (c0 > lv ? 2 : 0) | (d0 > lv ? 1 : 0); if (s === 0 || s === 15) continue;
          var X = x * cell, Y = y * cell;
          var tp = [X + cell * (lv - a0) / (b0 - a0), Y], rt = [X + cell, Y + cell * (lv - b0) / (c0 - b0)], bt = [X + cell * (lv - d0) / (c0 - d0), Y + cell], lf = [X, Y + cell * (lv - a0) / (d0 - a0)], seg;
          switch (s) { case 1: case 14: seg = [lf, bt]; break; case 2: case 13: seg = [bt, rt]; break; case 3: case 12: seg = [lf, rt]; break; case 4: case 11: seg = [tp, rt]; break; case 6: case 9: seg = [tp, bt]; break; case 7: case 8: seg = [lf, tp]; break; case 5: g.moveTo(lf[0], lf[1]); g.lineTo(tp[0], tp[1]); seg = [bt, rt]; break; case 10: g.moveTo(lf[0], lf[1]); g.lineTo(bt[0], bt[1]); seg = [tp, rt]; break; }
          if (seg) { g.moveTo(seg[0][0], seg[0][1]); g.lineTo(seg[1][0], seg[1][1]); }
        }
        g.globalAlpha = major ? 0.9 : 0.34; g.strokeStyle = major ? cAcc : cInk; if (major) g.globalAlpha = 0.85; g.stroke();
      }
      g.globalAlpha = 1;
      if (!RM) requestAnimationFrame(draw);
    }
    var host = cv.parentElement; if ('ResizeObserver' in window) new ResizeObserver(function () { size(); if (RM) draw(0); }).observe(host); else { size(); addEventListener('resize', function () { size(); if (RM) draw(0); }); }
    host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; if (RM) draw(0); }, { passive: true });
    host.addEventListener('pointerleave', function () { mx = my = -9999; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(cv);
    C.onPal(); requestAnimationFrame(draw);
  };

  /* ---- sections ---- */
  C.snapshot = function () {
    var dl = el('dl', 'snap');
    [['Now', 'Senior Application Engineer at Okta'], ['Focus', 'Integrations, identity, GenAI and automation'], ['Led', 'More than 20 people across teams'], ['Off duty', 'Treks, waterfalls, forts and photography']].forEach(function (r) { var d = el('div'); d.appendChild(el('dt', '', r[0])); d.appendChild(el('dd', '', r[1])); dl.appendChild(d); });
    return dl;
  };
  C.featured = function () {
    var box = el('div', 'feat');
    D.featured.forEach(function (s) {
      var p = D.projects.filter(function (x) { return x.slug === s; })[0]; if (!p) return;
      var l = a(RT + 'work/#' + s, ''); l.dataset.slug = s; var left = el('div'); left.appendChild(el('h3', '', p.title)); l.appendChild(left);
      var right = el('div'); right.appendChild(el('p', '', p.line)); l.appendChild(right); l.appendChild(el('small', '', p.tags.slice(0, 5).join(', '))); box.appendChild(l);
    });
    return box;
  };
  C.index = function (limit) {
    var wrap = el('div'), cats = ['All']; D.projects.forEach(function (p) { if (cats.indexOf(p.cat) < 0) cats.push(p.cat); });
    var chips = el('div', 'chips'); chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Filter projects'); var ul = el('ul', 'idx'); wrap.appendChild(chips); wrap.appendChild(ul);
    function paint(c) { clear(ul); D.projects.filter(function (p) { return c === 'All' || p.cat === c; }).slice(0, limit || 99).forEach(function (p) { var li = el('li'), l = a(RT + 'work/#' + p.slug, ''); l.appendChild(el('b', '', p.title)); l.appendChild(el('span', '', p.line)); l.appendChild(el('em', '', p.cat)); li.appendChild(l); ul.appendChild(li); }); if (C.afterPaint) C.afterPaint(ul); }
    cats.forEach(function (c, i) { var b = el('button', 'chip', c); b.type = 'button'; b.setAttribute('aria-pressed', String(i === 0)); b.addEventListener('click', function () { [].forEach.call(chips.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); paint(c); }); chips.appendChild(b); });
    paint('All'); return wrap;
  };
  C.career = function () {
    var ol = el('ol', 'tl');
    D.career.filter(function (c) { return c.w !== 'Saturn'; }).slice().reverse().forEach(function (c, i) {
      var li = el('li', i === 0 ? 'now' : ''); li.appendChild(el('time', '', c.y)); var b = el('div'); b.appendChild(el('h3', '', c.h)); b.appendChild(el('p', '', c.p));
      if (c.hl && c.hl.length && i < 3) { var u = el('ul'); c.hl.slice(0, 3).forEach(function (h) { u.appendChild(el('li', '', h)); }); b.appendChild(u); }
      li.appendChild(b); ol.appendChild(li);
    });
    return ol;
  };
  C.skills = function () {
    var box = el('div', 'skills'), groups = [['Build', ['Backend & APIs', 'Frontend', 'Distributed Systems', 'Architecture', 'Integrations']], ['Run', ['Reliability', 'Observability', 'Cloud & Containers', 'Security', 'Identity & Access']], ['Learn from data', ['Data & Databases', 'GenAI', 'Machine Learning', 'Analytics', 'Automation']], ['Lead', ['Leadership']]];
    groups.forEach(function (g) { var s = el('section'); s.appendChild(el('h3', '', g[0])); var dl = el('dl'); g[1].forEach(function (n) { var sk = D.skills.filter(function (x) { return x.n === n; })[0]; if (!sk) return; var d = el('div'); d.appendChild(el('dt', '', n)); d.appendChild(el('dd', '', sk.s.slice(0, 6).join(', '))); dl.appendChild(d); }); s.appendChild(dl); box.appendChild(s); });
    return box;
  };

  /* photographs: albums as tabs, lazy masonry, lightbox */
  C.photos = function (opts) {
    opts = opts || {}; var box = el('div', 'gallery'), tabs = el('div', 'alb'), mas = el('div', 'jrows'), cur = 0, list = [];
    tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Photo albums');
    function target() { return innerWidth < 600 ? 150 : innerWidth < 1000 ? 210 : 270; }
    function layout() {
      var w = mas.clientWidth; if (!w) return; var gap = innerWidth < 600 ? 6 : 10, th = target(), row = [], rw = 0, figs = [].slice.call(mas.children);
      function flush(last) { if (!row.length) return; var tot = row.reduce(function (s, f) { return s + f.ar; }, 0), h = last && tot * th < w - gap * row.length ? th : (w - gap * (row.length - 1)) / tot; row.forEach(function (f) { f.el.style.width = (f.ar * h) + 'px'; f.el.style.height = h + 'px'; }); row = []; rw = 0; }
      var rows = [], cur2 = [], w2 = 0; figs.forEach(function (f) { var ar = +f.dataset.ar || 1.33; cur2.push({ el: f, ar: ar }); w2 += ar * th + gap; if (w2 - gap >= w) { rows.push(cur2); cur2 = []; w2 = 0; } }); if (cur2.length) { if (cur2.length < 3 && rows.length) { cur2 = rows.pop().concat(cur2); } rows.push(cur2); } rows.forEach(function (r2, ix) { row = r2; var tot = row.reduce(function (s, f) { return s + f.ar; }, 0), h = (w - gap * (row.length - 1)) / tot; if (ix === rows.length - 1 && h > th * 1.35) h = th * 1.35; row.forEach(function (f) { f.el.style.width = (f.ar * h) + 'px'; f.el.style.height = h + 'px'; }); });
    }
    function paint() {
      clear(mas); list = D.albums[cur].photos.slice(0, opts.limit || 99);
      list.forEach(function (p, i) {
        var f = el('figure'), b = el('button'); f.dataset.ar = (p.w / p.h).toFixed(3); b.type = 'button'; b.setAttribute('aria-label', 'Open: ' + p.t);
        var im = el('img'); im.alt = p.a || p.t; im.loading = 'lazy'; im.decoding = 'async'; im.width = p.w; im.height = p.h; im.src = IMG + 'thumbs/' + encodeURIComponent(p.f); im.addEventListener('load', function () { im.classList.add('on'); }); if (im.complete) im.classList.add('on');
        b.appendChild(im); f.appendChild(b); f.appendChild(el('figcaption', '', p.t)); b.addEventListener('click', function () { open(i); }); mas.appendChild(f);
      });
      layout(); if (window.Anim) Anim.refresh(box);
    }
    D.albums.forEach(function (al, i) { var b = el('button', '', al.title.replace(/ & /g, ' & ')); b.type = 'button'; b.setAttribute('aria-pressed', String(i === 0)); b.appendChild(el('small', '', String(al.photos.length))); b.addEventListener('click', function () { cur = i; [].forEach.call(tabs.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); paint(); }); tabs.appendChild(b); });
    box.appendChild(tabs); box.appendChild(mas); paint(); if ('ResizeObserver' in window) new ResizeObserver(layout).observe(mas); else addEventListener('resize', layout);
    var lb = el('div', 'lb'); lb.hidden = true; lb.tabIndex = -1; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo viewer');
    var fig = el('figure'), im2 = el('img'); fig.appendChild(im2); var ft = el('footer'), cap = el('span'), nav = el('div'), pv = el('button', '', 'Previous'), nx = el('button', '', 'Next'), x = el('button', 'x', 'Close');
    [pv, nx, x].forEach(function (b) { b.type = 'button'; }); nav.appendChild(pv); nav.appendChild(doc.createTextNode(' ')); nav.appendChild(nx); ft.appendChild(cap); ft.appendChild(nav); lb.appendChild(fig); lb.appendChild(ft); lb.appendChild(x); doc.body.appendChild(lb);
    var idx = 0, from = null;
    function show() { var p = list[idx]; im2.src = IMG + 'md/' + encodeURIComponent(p.f); im2.alt = p.a || p.t; cap.textContent = p.t + ' (' + (idx + 1) + ' of ' + list.length + ')'; }
    function open(i) { from = doc.activeElement; idx = i; show(); lb.hidden = false; doc.documentElement.style.overflow = 'hidden'; x.focus(); }
    function close() { lb.hidden = true; doc.documentElement.style.overflow = ''; if (from) from.focus(); }
    pv.addEventListener('click', function () { idx = (idx + list.length - 1) % list.length; show(); }); nx.addEventListener('click', function () { idx = (idx + 1) % list.length; show(); }); x.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target === fig) close(); });
    doc.addEventListener('keydown', function (e) { if (lb.hidden) return; if (e.key === 'Tab') { var f = [pv, nx, x], k = f.indexOf(doc.activeElement); e.preventDefault(); f[(k + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); } else if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') nx.click(); else if (e.key === 'ArrowLeft') pv.click(); });
    return box;
  };

  /* the things I keep falling into */
  C.journey = function () {
    var box = el('div', 'jr'), nav = el('nav'), right = el('div'), items = el('div', 'items'), desc = el('div', 'desc'); nav.setAttribute('aria-label', 'Interest groups');
    function pick(r, k) { clear(items); r.items.forEach(function (it, i) { var b = el('button', 'chip', it.n); b.type = 'button'; b.setAttribute('aria-pressed', String(i === 0)); b.addEventListener('click', function () { [].forEach.call(items.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); say(it); }); items.appendChild(b); }); say(r.items[0]); }
    function say(it) { desc.setAttribute('aria-live', 'polite'); clear(desc); desc.appendChild(el('b', '', it.n)); desc.appendChild(el('p', '', it.d)); }
    D.realms.forEach(function (r, k) { var b = el('button', '', r.n); b.type = 'button'; b.setAttribute('aria-pressed', String(k === 0)); b.addEventListener('click', function () { [].forEach.call(nav.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); pick(r, k); }); nav.appendChild(b); });
    right.appendChild(items); right.appendChild(desc); box.appendChild(nav); box.appendChild(right); pick(D.realms[0], 0); return box;
  };
  C.about = function () {
    var box = el('div', 'about'), im = el('img'); im.src = RT + 'images/vilas-portrait.webp'; im.alt = 'Vilas Hegde'; im.width = 480; im.height = 600; im.loading = 'lazy'; box.appendChild(im);
    var r = el('div'); r.appendChild(el('p', 'lede', D.bio));
    r.appendChild(el('p', 'mute', 'I started by scripting away small, boring tasks and never stopped. These days I design the systems that let products talk to each other safely, and I like teaching what I learn. Away from the desk I am on a trail, at a waterfall or inside an old fort with a camera.'));
    r.appendChild(el('blockquote', '', D.quotes[1])); box.appendChild(r); return box;
  };
  C.contact = function () {
    var box = el('div', 'contact'); box.appendChild(el('h2', '', 'Got an interesting problem? Let us talk.'));
    box.appendChild(el('p', 'lede mute', 'Questions, opportunities, or just talking technology. I read every message.'));
    var rows = el('div', 'rows'); D.social.forEach(function (s) { var l = a(s.u, '', s.l); l.target = '_blank'; l.rel = 'noopener noreferrer'; l.appendChild(el('span', '', s.h)); rows.appendChild(l); }); box.appendChild(rows); return box;
  };
  C.paths = function (items) { var box = el('nav', 'paths'); box.setAttribute('aria-label', 'Where would you like to start'); items.forEach(function (i) { var l = a(i[2], ''); l.appendChild(el('b', '', i[0])); l.appendChild(el('span', '', i[1])); box.appendChild(l); }); return box; };
  C.sec = function (id, title, sub, body, cls) { var s = el('section', 'sec ' + (cls || '')); s.id = id; var w = el('div', 'wrap'), h = el('div', 'sec-h'); h.appendChild(el('h2', '', title)); if (sub) h.appendChild(el('p', '', sub)); w.appendChild(h); w.appendChild(body); s.appendChild(w); return s; };
  C.hero = function (opts) {
    var s = el('header', 'hero'); s.style.cssText = 'position:relative;min-height:' + (opts.h || '100svh') + ';display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;padding:110px 0 0';
    var cv = null; if (opts.canvas !== false) { cv = el('canvas', 'topo'); cv.setAttribute('aria-hidden', 'true'); s.appendChild(cv); } s.appendChild(el('div', 'topo-fade'));
    var w = el('div', 'wrap'); w.style.cssText = 'position:relative;z-index:2;width:100%';
    var h1 = el('h1', 'display hero-name'); h1.setAttribute('aria-label', 'Vilas Hegde'); ['Vilas', 'Hegde'].forEach(function (n) { var l = el('span', 'ln'); l.setAttribute('aria-hidden', 'true'); l.appendChild(el('span', '', n)); h1.appendChild(l); }); w.appendChild(h1);
    var sub = el('div', 'hero-sub'); sub.style.cssText = 'display:flex;gap:18px 48px;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;margin:clamp(20px,3vw,36px) 0 clamp(28px,4vw,48px)';
    var p = el('p', 'lede', 'Senior Application Engineer at Okta. I build integrations, identity systems and GenAI workflows, and I climb things to photograph them.'); sub.appendChild(p);
    var act = el('div'); act.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap'; (opts.actions || []).forEach(function (x) { act.appendChild(a(x[1], 'btn' + (x[2] ? ' p' : ''), x[0])); }); sub.appendChild(act); w.appendChild(sub);
    if (opts.paths) w.appendChild(C.paths(opts.paths)); s.appendChild(w); if (cv) C.topo(cv); return s;
  };
  C.bar = function (links, cur) {
    var h = el('header', 'bar'), w = el('div', 'wrap'); var home = a(links.home || '#top', 'brand', 'Vilas Hegde'); w.appendChild(home);
    var n = el('nav'); n.setAttribute('aria-label', 'Main'); links.items.forEach(function (x) { var l = a(x[1], '', x[0]); if (x[0] === cur) l.setAttribute('aria-current', 'page'); n.appendChild(l); }); w.appendChild(n);
    var c = a(links.cta[1], 'btn p', links.cta[0]); w.appendChild(c); h.appendChild(w); return h;
  };
  C.pagehead = function (title, sub) {
    var h = el('header', 'phead'); h.id = 'top'; var w = el('div', 'wrap'); w.appendChild(el('h1', 'h2', title)); if (sub) w.appendChild(el('p', 'lede mute', sub)); h.appendChild(w); return h;
  };
  C.mount = function (nodes) {
    var m = doc.getElementById('app'), main = el('main'); main.id = 'main'; nodes.forEach(function (n) { (n.classList && (n.classList.contains('bar') || n.classList.contains('tabbar') || n.tagName === 'FOOTER') ? m : main).appendChild(n); });
    m.insertBefore(main, m.querySelector('footer') || m.querySelector('.tabbar'));
    doc.body.classList.add('hasbar');
    var tm = doc.querySelector('meta[name=theme-color]') || doc.head.appendChild(el('meta')); tm.name = 'theme-color';
    var prev = C.onPal; C.onPal = function () { if (prev) prev(); tm.content = getComputedStyle(doc.documentElement).getPropertyValue('--bg').trim(); };
    /* the nav highlights the chapter you are reading */
    var links = [].slice.call(doc.querySelectorAll('.bar nav a[href^="#"]'));
    if (links.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) links.forEach(function (l) { if (l.getAttribute('href') === '#' + e.target.id) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); }); }); }, { rootMargin: '-40% 0px -55% 0px' });
      links.forEach(function (l) { var t = doc.querySelector(l.getAttribute('href')); if (t) io.observe(t); });
    }
  };
  C.tabbar = function (items, cur) { var n = el('nav', 'tabbar'); n.setAttribute('aria-label', 'Sections'); items.forEach(function (x) { var l = a(x[1], '', x[0]); if (x[0] === cur) l.setAttribute('aria-current', 'page'); n.appendChild(l); }); return n; };
  C.foot = function () { var f = el('footer', 'end'), w = el('div', 'wrap'); w.appendChild(el('p', '', 'Vilas Hegde. All photographs are my own.')); f.appendChild(w); return f; };
})();
