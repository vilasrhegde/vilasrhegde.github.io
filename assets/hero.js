/* Right side of the landing hero. Five options to compare; pick with ?hero=terminal|badge|polaroids|now|orbit or in the Colours panel.
   No libraries. Every option has a reduced-motion fallback and a compact layout for small screens. */
(function () {
  'use strict';
  var D = window.D, doc = document, NS = 'http://www.w3.org/2000/svg', M = Math, RM = matchMedia('(prefers-reduced-motion: reduce)').matches, RT = window.ROOT || '', IMG = RT + 'images/photography/';
  var H = window.Hero = {}, timers = [];
  function el(t, c, x) { var e = doc.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function ico(k) { var s = doc.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.7'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true'); var d = new DOMParser().parseFromString('<svg xmlns="' + NS + '">' + ((window.ICONS || {})[k] || '') + '</svg>', 'image/svg+xml'); [].forEach.call(d.documentElement.childNodes, function (n) { s.appendChild(doc.importNode(n, true)); }); return s; }
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function every(fn, ms) { var t = setInterval(fn, ms); timers.push(t); return t; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function photo(album, i) { var a = (D.albums || []).filter(function (x) { return x.id === album; })[0]; return a && a.photos[i % a.photos.length]; }
  function tilt(node, max) { if (RM || !matchMedia('(hover:hover)').matches) return; var raf = 0, tx = 0, ty = 0; node.addEventListener('pointermove', function (e) { var r = node.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - .5) * 2; ty = ((e.clientY - r.top) / r.height - .5) * 2; if (!raf) raf = requestAnimationFrame(function () { raf = 0; node.style.transform = 'perspective(900px) rotateY(' + (tx * max) + 'deg) rotateX(' + (-ty * max) + 'deg)'; node.style.setProperty('--gx', (50 + tx * 40) + '%'); node.style.setProperty('--gy', (50 + ty * 40) + '%'); }); }); node.addEventListener('pointerleave', function () { node.style.transform = ''; }); }

  /* 1. TERMINAL: a shell that types out who I am, with commit-history flavour */
  H.terminal = function () {
    var box = el('div', 'hr-term'), bar = el('div', 'hr-tbar'); ['r', 'y', 'g'].forEach(function (c) { bar.appendChild(el('i', 'gw-' + c)); }); bar.appendChild(el('code', '', 'vilas@okta: ~')); box.appendChild(bar);
    var out = el('pre', 'hr-tout'); out.setAttribute('aria-label', 'A terminal introducing Vilas'); box.appendChild(out);
    var SCRIPT = [
      ['whoami', ['vilas hegde: senior application engineer @ okta']],
      ['cat focus.txt', ['identity, integrations, GenAI workflows', 'and pipelines that make the next thing faster']],
      ['git log --oneline -3', ['c3d4e5f feat: senior application engineer', '2c3d4e5 perf: led 20+ people', 'b2c3d4e fix: survived exam season']],
      ['./trek --next', ['searching for a peak with no crowd...', 'found 0. retrying on sunday.']],
      ['sudo make coffee', ['[sudo] password for vilas: ********', 'brewing. this one never fails CI.']]
    ];
    var lines = [];
    function render(cursor) { while (out.firstChild) out.removeChild(out.firstChild); lines.forEach(function (l, i) { var row = el('span', 'hr-l ' + l.c); if (l.c === 'cmd') { row.appendChild(el('b', 'hr-ps', '$ ')); } row.appendChild(doc.createTextNode(l.t)); if (cursor && i === lines.length - 1) row.appendChild(el('i', 'hr-cur')); out.appendChild(row); }); }
    if (RM) { SCRIPT.slice(0, 3).forEach(function (s) { lines.push({ c: 'cmd', t: s[0] }); s[1].forEach(function (o) { lines.push({ c: 'out', t: o }); }); }); render(false); return box; }
    var si = 0;
    function run() {
      if (si >= SCRIPT.length) { later(function () { lines = []; si = 0; run(); }, 3200); return; }
      var s = SCRIPT[si++], cmd = { c: 'cmd', t: '' }; lines.push(cmd); while (lines.length > 11) lines.shift(); var ch = 0;
      (function type() { cmd.t = s[0].slice(0, ++ch); render(true); if (ch < s[0].length) later(type, 45 + M.random() * 60); else later(function () { s[1].forEach(function (o, j) { later(function () { lines.push({ c: 'out', t: o }); while (lines.length > 11) lines.shift(); render(j === s[1].length - 1); }, 220 * (j + 1)); }); later(run, 220 * s[1].length + 1100); }, 380); })();
    }
    later(run, 700); return box;
  };

  /* 2. BADGE: an identity access card (it is Okta, after all). Tilts with the pointer, scans, grants access. */
  H.badge = function (still) {
    var wrap = el('div', 'hr-badge-w'), lan = el('div', 'hr-lan'); wrap.appendChild(lan);
    var c = el('div', 'hr-badge'); c.setAttribute('role', 'img'); if (!still) c.addEventListener('pointerdown', function () { c.classList.remove('scan', 'ok'); void c.offsetWidth; c.classList.add('scan'); later(function () { c.classList.add('ok'); }, 1400); }); c.setAttribute('aria-label', 'Access card: Vilas Hegde, Senior Application Engineer. Clearance: curious.');
    var top = el('div', 'hr-bt'); top.appendChild(el('span', '', 'ACCESS CARD')); top.appendChild(el('span', 'hr-chip')); c.appendChild(top);
    var me = el('div', 'hr-me'), im = el('img'); im.src = RT + 'images/vilas-circle.webp'; im.alt = ''; im.width = 160; im.height = 160; im.decoding = 'async'; me.appendChild(im); c.appendChild(me);
    c.appendChild(el('b', 'hr-bn', 'Vilas Hegde')); c.appendChild(el('span', 'hr-br', 'Senior Application Engineer'));
    var dl = el('dl', 'hr-dl'); [['Clearance', 'Curious'], ['MFA', 'Coffee + push'], ['Session', 'Never expires']].forEach(function (r) { var d = el('div'); d.appendChild(el('dt', '', r[0])); d.appendChild(el('dd', '', r[1])); dl.appendChild(d); }); c.appendChild(dl);
    var bc = el('div', 'hr-bar'); for (var i = 0; i < 34; i++) { var s = el('i'); s.style.width = (1 + (i * 7 % 4)) + 'px'; bc.appendChild(s); } c.appendChild(bc);
    c.appendChild(el('span', 'hr-scan')); var ok = el('span', 'hr-ok', 'Access granted'); c.appendChild(ok);
    wrap.appendChild(c); tilt(c, 9);
    if (still) { /* physical card: no scan loop */ } else if (!RM) { var cyc = function () { c.classList.remove('scan', 'ok'); void c.offsetWidth; c.classList.add('scan'); later(function () { c.classList.add('ok'); }, 1500); }; later(cyc, 900); every(cyc, 7000); } else c.classList.add('ok');
    return wrap;
  };

  /* 3. POLAROIDS: a little stack of my own photographs; it shuffles on its own, tap to shuffle */
  H.polaroids = function () {
    /* one photograph from every album, so the stack is a tour of the whole collection */
    /* round-robin through the albums (one from each, then the next one from each...) so consecutive photos always come
       from different categories and the stack walks through the whole collection, not the same few */
    var picks = [], A = (D.albums || []).map(function (a) { return a.photos.slice(); }), most = M.max.apply(null, A.map(function (x) { return x.length; }).concat([0]));
    for (var r = 0; r < most && picks.length < 5; r++) A.forEach(function (list) { if (list[r] && picks.length < 5) picks.push(list[r]); });
    var box = el('button', 'hr-pol'); box.type = 'button'; box.setAttribute('aria-label', 'Shuffle the photographs');
    var cards = picks.map(function (p, i) {
      var f = el('figure'), im = el('img'); im.dataset.src = IMG + 'md/' + encodeURIComponent(p.f); im.src = im.dataset.src; im.alt = p.a || ''; im.loading = i < 2 ? 'eager' : 'lazy'; im.decoding = 'async'; im.width = p.w; im.height = p.h;
      f.appendChild(im); var cap = el('figcaption'); cap.appendChild(el('b', '', p.t)); f.appendChild(cap); box.appendChild(f); return f;
    });
    var order = cards.map(function (_, i) { return i; }), tossing = null, tossT = 0, lastUser = 0;
    function lay() { order.forEach(function (ci, pos) { var f = cards[ci]; if (pos < 4) { var im2 = f.querySelector('img'); if (!im2.getAttribute('src')) im2.src = im2.dataset.src; } f.style.setProperty('--pos', pos); f.style.zIndex = String(20 - pos); f.classList.toggle('front', pos === 0); f.classList.toggle('show', pos < 3); }); }
    /* finish a toss that is still flying: the tossed photo goes to the back and the stack is laid out again */
    function settle() { if (!tossing) return; clearTimeout(tossT); order.push(order.shift()); tossing.classList.remove('toss'); tossing = null; lay(); }
    /* the front photo flies off to the side, then slides in at the back; the next one is already underneath.
       A tap during a toss completes it at once and starts the next, so every tap always brings a new photo forward. */
    function next() {
      settle(); var top = cards[order[0]]; tossing = top; top.classList.add('toss');
      if (RM) { settle(); return; }
      tossT = setTimeout(settle, 420); timers.push(tossT);
    }
    lay(); box.addEventListener('click', function () { lastUser = Date.now(); next(); });
    var note = el('span', 'hr-pnote', 'All mine, from every album. Tap to shuffle.'); var w = el('div', 'hr-pol-w'); w.appendChild(box); w.appendChild(note);
    if (!RM) every(function () { if (!box.matches(':hover') && !doc.hidden && !tossing && Date.now() - lastUser > 5000) next(); }, 3800);
    return w;
  };

  /* 4. NOW: a live status board. Real local time, slightly unreliable everything else */
  H.now = function () {
    var box = el('div', 'hr-now'); box.appendChild(el('span', 'hr-nk', 'Right now'));
    var clock = el('b', 'hr-clock'), sub = el('span', 'hr-csub'); box.appendChild(clock); box.appendChild(sub);
    var rows = el('dl', 'hr-rows'); function row(k, v, ik) { var d = el('div'); var dt = el('dt'); dt.appendChild(ico(ik)); dt.appendChild(doc.createTextNode(k)); d.appendChild(dt); var dd = el('dd', '', v); d.appendChild(dd); rows.appendChild(d); return dd; }
    var hb = M.floor((Date.now() / 3600000)) % 7;
    row('Building', 'GenAI integrations at Okta', 'code'); var mood = row('Mood', '', 'star'); row('Last summit', (photo('peaks', 2) || {}).t || 'A ridge with a view', 'mountain-treks'); var cof = row('Coffee today', '', 'chart'); row('Open to', 'Interesting problems', 'key');
    box.appendChild(rows);
    var heat = el('div', 'hr-heat'); heat.setAttribute('aria-hidden', 'true'); var seed = 7; for (var i = 0; i < 26 * 7; i++) { seed = (seed * 9301 + 49297) % 233280; var v = seed / 233280, lv = v > .86 ? 4 : v > .66 ? 3 : v > .42 ? 2 : v > .2 ? 1 : 0; heat.appendChild(el('i', 'h' + lv)); } box.appendChild(heat); box.appendChild(el('span', 'hr-hk', 'Commits and treks, last six months. Roughly.'));
    var MOODS = ['Deep in a design doc', 'Reviewing a pull request kindly', 'Debugging, calmly', 'Planning the weekend trek', 'Explaining OAuth with a drawing', 'Renaming a variable. Again.', 'Shipping'];
    function tick() {
      var now = new Date(), t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(now), h = +t.slice(0, 2);
      clock.textContent = t; sub.textContent = 'Bengaluru time. ' + (h < 7 ? 'Probably asleep. Or deploying.' : h < 10 ? 'First coffee in progress.' : h < 19 ? 'Probably at work.' : h < 23 ? 'Probably editing photos.' : 'Should be asleep.');
      mood.textContent = MOODS[(hb + M.floor(now.getTime() / 60000 / 7)) % MOODS.length]; cof.textContent = String(clamp(M.floor((h - 7) / 3) + 1, 0, 4)) + ' of an unknown limit';
    }
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    tick(); every(tick, 20000); return box;
  };

  /* 5. ORBIT: the portrait with the things I do circling it. Hover a moon to read it. */
  H.orbit = function () {
    var box = el('div', 'hr-orb'), core = el('div', 'hr-core'), im = el('img'); im.src = RT + 'images/vilas-circle.webp'; im.alt = 'Portrait of Vilas Hegde'; im.width = 300; im.height = 300; im.decoding = 'async'; core.appendChild(im); box.appendChild(core);
    var R = [['code', 'Writes integrations'], ['shield', 'Thinks about identity'], ['bot', 'Wires up GenAI'], ['camera', 'Photographs trails'], ['mountain-treks', 'Climbs the hill first'], ['forts', 'Visits old forts'], ['git-branch', 'Merges responsibly'], ['chat', 'Talks too much about OAuth']];
    [[0, 4, 40], [4, 8, 64]].forEach(function (g, ri) {
      var ring = el('div', 'hr-ring r' + ri); ring.style.setProperty('--d', (ri ? 64 : 40) + 's');
      R.slice(g[0], g[1]).forEach(function (r, i, arr) { var m = el('span', 'hr-moon'); m.style.setProperty('--a', (i / arr.length * 360 + ri * 22) + 'deg'); m.tabIndex = 0; m.setAttribute('aria-label', r[1]); var inner = el('span', 'hr-mi'); inner.appendChild(ico(r[0])); inner.appendChild(el('em', '', r[1])); m.appendChild(inner); ring.appendChild(m); });
      box.appendChild(ring);
    });
    box.appendChild(el('span', 'hr-onote', 'Gravity: mostly curiosity.'));
    return box;
  };

  /* 6. ID + POLAROIDS: the access card takes the place of the big name on the left, the photo stack sits on the right */
  H.idcard = function () { return H.polaroids(); };
  /* The ID card, simulated as a real rigid body (mass, moment of inertia, gravity, air drag, collisions).
     HANGING: the clip hangs from a lanyard tied under the name in the top bar. The card pivots on the clip like a pendulum,
       driven by gravity and by how the clip moves, so it swings and settles the way a real card does.
     DRAG: grab it anywhere. It hangs from your finger at the point you grabbed, and lags behind when you move.
       Pull too far and the lanyard snaps.
     LOOSE: once it is off the lanyard it lives on the page itself. It falls with gravity all the way to the very bottom of the
       page (the "lost and found" floor in the footer), tumbles, bounces off the floor and the side walls, and comes to rest.
     REHANG: carry it up to the dangling strap under the name (the top bar is always visible) and let go. It clicks on. */
  var fx = null;
  function idfx(hero, nm) {
    var holder = el('div', 'hr-id'); nm.parentNode.insertBefore(holder, nm);
    var card = H.badge(true).querySelector('.hr-badge'); card.classList.remove('scan', 'ok'); ['.hr-scan', '.hr-ok'].forEach(function (q) { var n = card.querySelector(q); if (n) n.remove(); });
    var led = el('span', 'idc-led'); led.setAttribute('aria-hidden', 'true'); card.querySelector('.hr-bt').appendChild(led);
    var box = el('div', 'idc'), layer = el('div', 'idfx'); box.appendChild(el('i', 'idc-clip')); box.appendChild(card); box.tabIndex = 0;
    box.setAttribute('role', 'img'); box.setAttribute('aria-label', 'Vilas Hegde ID card. Drag it around. Hang it back under the name for a surprise.');
    var cv = el('canvas', 'idfx-cv'); cv.setAttribute('aria-hidden', 'true'); var ghost = el('div', 'idghost'); ghost.setAttribute('aria-hidden', 'true');
    var toast = el('div', 'idtoast'); toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
    layer.appendChild(cv); layer.appendChild(ghost); layer.appendChild(box); layer.appendChild(toast); doc.body.appendChild(layer);
    var g2 = cv.getContext('2d'), DPR = M.min(2, devicePixelRatio || 1), brand = doc.querySelector('.bar .brand'), bar = brand.closest('.bar');
    var foot = doc.querySelector('footer.end'), floorEl = null;
    if (foot) { floorEl = el('div', 'idfloor'); floorEl.id = 'id-floor'; floorEl.appendChild(el('span', 'idfloor-k', 'Lost and found')); floorEl.appendChild(el('span', 'idfloor-t', 'Dropped something? Pick it up and hang it back under my name.')); foot.appendChild(floorEl); }
    var offs = []; function on(t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(function () { t.removeEventListener(ev, fn, o); }); }
    var W = 230, Hc = 330; function measure() { W = box.offsetWidth || W; Hc = box.offsetHeight || Hc; }
    function size() { cv.width = innerWidth * DPR; cv.height = innerHeight * DPR; measure(); holder.style.height = (Hc + 24) + 'px'; fitHolder(); }
    /* the card hangs a little below the top of its slot (the strap comes down from the bar): grow the slot to match, measured live */
    function fitHolder() { if (mode !== 'hang' || drag) return; var r = box.getBoundingClientRect(), h = holder.getBoundingClientRect(); if (!r.height) return; var need = r.bottom - h.top + 16; if (need > h.height + 2 && need < Hc * 2) holder.style.height = M.round(need) + 'px'; }
    size(); on(window, 'resize', size);
    /* physics constants (pixels, seconds) */
    var G = 2200, DRAGQ = G / (3000 * 3000), ICM = function () { return (W * W + Hc * Hc) / 12; }, CLIPY = function () { return -Hc / 2 + 11; };
    /* body: centre of mass (x,y), velocity (vx,vy), angle a (clockwise, radians), angular velocity w */
    var b = { x: 0, y: 0, vx: 0, vy: 0, a: 0, w: 0, rest: 0 }, frame = 'view'; /* 'view' = viewport coords (hanging), 'page' = page coords (loose) */
    var mode = 'hang', P = { x: 0, y: 0, vx: 0, vy: 0 }, L = 0, rope = [[], []], stub = [[], []], N = 12;
    var drag = null, raf = 0, last = 0, sleepT = 0, rewards = 0, hungAt = 0, sv = 0, lastY = scrollY;
    function rot(x, y, a) { var c = M.cos(a), s = M.sin(a); return { x: x * c - y * s, y: x * s + y * c }; }
    function anchors() { var r = brand.getBoundingClientRect(), br = bar.getBoundingClientRect(), mx = M.max(r.left + r.width * .5, W / 2 + 12), y = br.top + br.height * .55; return [{ x: mx - 15, y: y }, { x: mx + 15, y: y }]; }
    function amid() { var A = anchors(); return { x: (A[0].x + A[1].x) / 2, y: A[0].y }; }
    function home() { var h = holder.getBoundingClientRect(); return { x: M.max(W / 2 + 10, M.min(innerWidth - W / 2 - 10, h.left + W / 2)), y: M.max(bar.getBoundingClientRect().bottom + 40, h.top + 6) }; }
    function clipWorld() { var o = rot(0, CLIPY(), b.a); return { x: b.x + o.x, y: b.y + o.y }; }
    function placeFromClip(cx, cy) { var o = rot(0, -CLIPY(), b.a); b.x = cx + o.x; b.y = cy + o.y; }
    function chain(A, B, slackLen) { var R = []; for (var i = 0; i <= N; i++) { var t = i / N, x = A.x + (B.x - A.x) * t, y = A.y + (B.y - A.y) * t; R.push({ x: x, y: y, ox: x, oy: y }); } R.len = slackLen; return R; }
    function initHang(cp, keepW) {
      mode = 'hang'; frame = 'view'; var Am = amid(); L = M.max(60, M.hypot(cp.x - Am.x, cp.y - Am.y));
      P.x = cp.x; P.y = cp.y; P.vx = 0; P.vy = 0; if (!keepW) { b.a = .06; b.w = 0; } placeFromClip(P.x, P.y);
      var A = anchors(); rope = [0, 1].map(function (k) { return chain(A[k], { x: cp.x + (k ? 5 : -5), y: cp.y }, L / N); });
    }
    function pageBottom() { var tb = doc.querySelector('.tabbar'), inset = 12; if (tb && getComputedStyle(tb).display !== 'none') inset += tb.offsetHeight; return doc.documentElement.scrollHeight - inset; }
    function pageRight() { return doc.documentElement.clientWidth; }
    /* pendulum about a moving pivot: d = pivot -> centre of mass; A = pivot acceleration; c = angular damping */
    function swing(dt, d, Ax, Ay, c) { var Ip = ICM() + d.x * d.x + d.y * d.y, tau = d.x * (G - Ay) - d.y * (-Ax); b.w += (tau / Ip) * dt; b.w *= M.exp(-c * dt); b.w = M.max(-3.2, M.min(3.2, b.w)); b.a += b.w * dt; }
    function verletRope(R, A0, A1, dt, segLen) { /* A1 null = free end */
      var g = G * dt * dt * .6; for (var i = 1; i < R.length; i++) { var p = R[i], vx = (p.x - p.ox) * .96, vy = (p.y - p.oy) * .96; p.ox = p.x; p.oy = p.y; p.x += vx; p.y += vy + g; }
      for (var it = 0; it < 10; it++) { R[0].x = A0.x; R[0].y = A0.y; if (A1) { var e = R[R.length - 1]; e.x = A1.x; e.y = A1.y; }
        for (var j = 0; j < R.length - 1; j++) { var a = R[j], q = R[j + 1], dx = q.x - a.x, dy = q.y - a.y, d = M.hypot(dx, dy) || 1, f = d > segLen ? (d - segLen) / d : 0, wa = j ? .5 : 0, wq = (A1 && j === R.length - 2) ? 0 : (j ? .5 : 1); if (!wa && !wq) continue; var s = wa + wq; a.x += dx * f * wa / s; a.y += dy * f * wa / s; q.x -= dx * f * wq / s; q.y -= dy * f * wq / s; } }
    }
    function collide(dt) {
      var floor = pageBottom(), right = pageRight(), I = ICM(), contact = false, hw = W / 2, hh = Hc / 2;
      [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].forEach(function (cn) {
        var r = rot(cn[0], cn[1], b.a);
        [[0, -1, floor, 'y'], [1, 0, 0, 'x'], [-1, 0, right, 'x'], [0, 1, 0, 'y']].forEach(function (wl) {
          var nx = wl[0], ny = wl[1], px = b.x + r.x, py = b.y + r.y, pen = wl[3] === 'y' ? (ny < 0 ? py - wl[2] : wl[2] - py) : (nx > 0 ? wl[2] - px : px - wl[2]);
          if (pen <= 0) return; if (ny < 0) contact = true;
          b.x += nx * pen; b.y += ny * pen;
          var vpx = b.vx - b.w * r.y, vpy = b.vy + b.w * r.x, vn = vpx * nx + vpy * ny; if (vn >= 0) return;
          var rn = r.x * ny - r.y * nx, e = vn < -260 ? .22 : 0, j = -(1 + e) * vn / (1 + rn * rn / I);
          b.vx += j * nx; b.vy += j * ny; b.w += rn * j / I;
          var tx = -ny, ty = nx, vt = (b.vx - b.w * r.y) * tx + (b.vy + b.w * r.x) * ty, rt = r.x * ty - r.y * tx, jt = -vt / (1 + rt * rt / I), mu = .55 * j; jt = M.max(-mu, M.min(mu, jt));
          b.vx += jt * tx; b.vy += jt * ty; b.w += rt * jt / I; b.w = M.max(-3, M.min(3, b.w));
        });
      });
      return contact;
    }
    function step(dt) {
      var A = anchors(), Am = amid();
      if (mode === 'hang') {
        if (drag) {
          var piv = { x: drag.cx, y: drag.cy }, pax = (piv.x - drag.px) / dt, pay = (piv.y - drag.py) / dt, ax = (pax - drag.pvx) / dt, ay = (pay - drag.pvy) / dt; drag.px = piv.x; drag.py = piv.y; drag.pvx = pax; drag.pvy = pay; drag.ax = drag.ax * .7 + ax * .3; drag.ay = drag.ay * .7 + ay * .3;
          var d = rot(-drag.gx, -drag.gy, b.a); swing(dt, d, drag.ax, drag.ay, 4); var dd = rot(-drag.gx, -drag.gy, b.a); b.x = piv.x + dd.x; b.y = piv.y + dd.y;
          var cw = clipWorld(), nvx = (cw.x - P.x) / dt, nvy = (cw.y - P.y) / dt; P.x = cw.x; P.y = cw.y; P.vx = P.vx * .92 + nvx * .08; P.vy = P.vy * .92 + nvy * .08;
          if (M.hypot(P.x - Am.x, P.y - Am.y) > L + 480) { snap(true); return; }
        } else {
          var ovx = P.vx, ovy = P.vy; P.vy += G * dt; P.vx *= M.exp(-2.4 * dt); P.vy *= M.exp(-2.4 * dt); P.x += P.vx * dt; P.y += P.vy * dt;
          var dx = P.x - Am.x, dy = P.y - Am.y, dist = M.hypot(dx, dy);
          /* elastic lanyard: past its length it pulls back like a stretchy strap (spring + damping), never a hard jump */
          if (dist > L) { var nx = dx / dist, ny = dy / dist, ext = dist - L, vr = P.vx * nx + P.vy * ny, k = 26, cdamp = 5.5;
            var f = -(k * ext + cdamp * vr); P.vx += f * nx * dt; P.vy += f * ny * dt;
            /* once nearly back to length, the strap is taut again: no outward speed, no deeper stretch */
            if (ext < 2 && vr > 0) { P.vx -= vr * nx; P.vy -= vr * ny; } }
          var axp = (P.vx - ovx) / dt, ayp = (P.vy - ovy) / dt;
          var d2 = rot(0, -CLIPY(), b.a); swing(dt, d2, axp, ayp, 1.6); placeFromClip(P.x, P.y);
        }
        var cw2 = clipWorld(), ends = [0, 1].map(function (k) { var o = rot(k ? 5 : -5, 0, b.a); return { x: cw2.x + o.x, y: cw2.y + o.y }; });
        [0, 1].forEach(function (k) { var span = M.hypot(ends[k].x - A[k].x, ends[k].y - A[k].y); verletRope(rope[k], A[k], ends[k], dt, M.max(L, span) / N); });
      } else {
        if (drag) {
          var pv = { x: drag.cx, y: drag.cy + scrollY }, vx2 = (pv.x - drag.px) / dt, vy2 = (pv.y - drag.py) / dt, ax2 = (vx2 - drag.pvx) / dt, ay2 = (vy2 - drag.pvy) / dt; drag.px = pv.x; drag.py = pv.y; drag.pvx = vx2; drag.pvy = vy2; drag.ax = drag.ax * .7 + ax2 * .3; drag.ay = drag.ay * .7 + ay2 * .3;
          var d3 = rot(-drag.gx, -drag.gy, b.a); swing(dt, d3, drag.ax, drag.ay, 4); var d4 = rot(-drag.gx, -drag.gy, b.a); b.x = pv.x + d4.x; b.y = pv.y + d4.y; b.vx = vx2 - b.w * d4.y; b.vy = vy2 + b.w * d4.x;
        } else {
          b.vy += G * dt; var sp = M.hypot(b.vx, b.vy); b.vx -= DRAGQ * sp * b.vx * dt; b.vy -= DRAGQ * sp * b.vy * dt; b.w *= M.exp(-1.6 * dt); b.w = M.max(-2.6, M.min(2.6, b.w));
          b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.w * dt;
          b.w += -M.sin(b.a) * M.min(1, M.hypot(b.vx, b.vy) / 900) * 3 * dt;
          var touching = collide(dt);
          if (touching && M.hypot(b.vx, b.vy) < 300) { /* it tips over onto its back and slides to rest the right way up */ var tw = M.round(b.a / (2 * M.PI)) * 2 * M.PI + b.rest, da = tw - b.a; b.w += (da * 9 - b.w * 4.5) * dt; b.vx *= M.exp(-3 * dt); }
          if (touching && M.hypot(b.vx, b.vy) < 14 && M.abs(b.w) < .08) sleepT += dt; else sleepT = 0;
        }
        [0, 1].forEach(function (k) { if (stub[k].length) verletRope(stub[k], A[k], null, dt, stub[k].len); });
      }
    }
    function strand(R, col) { if (R.length < 2) return; g2.beginPath(); g2.moveTo(R[0].x, R[0].y); for (var i = 1; i < R.length - 1; i++) g2.quadraticCurveTo(R[i].x, R[i].y, (R[i].x + R[i + 1].x) / 2, (R[i].y + R[i + 1].y) / 2); g2.lineTo(R[R.length - 1].x, R[R.length - 1].y); g2.lineCap = 'round'; g2.lineJoin = 'round'; g2.strokeStyle = 'rgba(0,0,0,.14)'; g2.lineWidth = 9; g2.stroke(); g2.strokeStyle = col; g2.lineWidth = 6.5; g2.stroke(); g2.strokeStyle = 'rgba(255,255,255,.25)'; g2.lineWidth = 1.5; g2.stroke(); }
    function hookPt() { var s0 = stub[0], s1 = stub[1]; if (!s0.length) { var Am = amid(); return { x: Am.x, y: Am.y + 50 }; } var a = s0[s0.length - 1], c = s1[s1.length - 1]; return { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 }; }
    function draw() {
      var oy = frame === 'page' ? scrollY : 0;
      box.style.transform = 'translate(' + (b.x - W / 2) + 'px,' + (b.y - Hc / 2 - oy) + 'px) rotate(' + b.a + 'rad)';
      g2.setTransform(DPR, 0, 0, DPR, 0, 0); g2.clearRect(0, 0, innerWidth, innerHeight);
      var col = getComputedStyle(doc.documentElement).getPropertyValue('--acc').trim() || '#b4442a';
      if (mode === 'hang') { strand(rope[0], col); strand(rope[1], col); }
      else { strand(stub[0], col); strand(stub[1], col); var h = hookPt(); g2.fillStyle = '#8d98a3'; g2.beginPath(); g2.arc(h.x, h.y, 4, 0, 6.3); g2.fill(); }
      if (drag && mode === 'loose') { var hk = hookPt(), cw = clipWorld(), near = M.min(M.hypot(cw.x - hk.x, cw.y - scrollY - hk.y), M.hypot(drag.cx - hk.x, drag.cy - hk.y)) < 110; ghost.style.opacity = near ? 1 : .6; ghost.classList.toggle('near', near); ghost.style.transform = 'translate(' + (hk.x - 18) + 'px,' + (hk.y - 6) + 'px)'; } else ghost.style.opacity = 0;
    }
    function loop(now) {
      raf = 0; var el2 = M.min(.05, ((now - (last || now)) / 1000) || 1 / 60); last = now; if (el2 <= 0) el2 = 1 / 60;
      var n = M.ceil(el2 / (1 / 240)), dt = el2 / n; for (var i = 0; i < n; i++) { step(dt); if (mode === 'hang' && drag === 'gone') break; }
      draw();
      var asleep = mode === 'loose' && !drag && sleepT > .4 && stub.every(function (R) { return R.every(function (p) { return M.abs(p.x - p.ox) < .05 && M.abs(p.y - p.oy) < .05; }); });
      if (!asleep) raf = requestAnimationFrame(loop); else { last = 0; b.vx = b.vy = b.w = 0; }
    }
    function kick() { sleepT = 0; if (!raf) { last = 0; raf = requestAnimationFrame(loop); } }
    function blink() { led.classList.remove('on'); void led.offsetWidth; led.classList.add('on'); }
    function say(t, ms) { toast.textContent = t; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove('on'); }, ms || 3600); }
    function gone(show) { while (holder.firstChild) holder.removeChild(holder.firstChild); if (!show) return; var g = el('div', 'hr-gone'); g.appendChild(el('b', '', 'My ID card fell off the lanyard.')); g.appendChild(el('span', '', 'It dropped all the way to the bottom of the page.')); var a = el('a', 'link', 'Go and pick it up'); a.href = '#id-floor'; g.appendChild(a); holder.appendChild(g); }
    /* hanging (viewport) -> loose (page): velocity in page frame adds the scroll velocity */
    function snap(torn) {
      if (mode !== 'hang') return; var cw = clipWorld(), wv = { vx: P.vx - b.w * (b.y - cw.y), vy: P.vy + b.w * (b.x - cw.x) };
      mode = 'loose'; frame = 'page'; hungAt = 0; b.rest = (M.random() - .5) * .14; b.y += scrollY; b.vx = wv.vx; b.vy = wv.vy + sv; if (torn) b.w += (b.vx > 0 ? 1 : -1) * .3; b.w = M.max(-1.5, M.min(1.5, b.w)); b.vx = M.max(-900, M.min(900, b.vx)); b.vy = M.max(-600, M.min(1200, b.vy));
      var keep = M.ceil(N * .42); stub = rope.map(function (R) { var s = R.slice(0, keep).map(function (p) { return { x: p.x, y: p.y, ox: p.x - (M.random() - .5) * 4, oy: p.y + 3 }; }); s.len = (L / N) * .9; return s; });
      if (drag) { drag = null; layer.classList.remove('grab'); doc.documentElement.classList.remove('nosel'); }
      gone(true); layer.classList.add('loose'); kick();
    }
    var REWARDS = [
      function () { say('Clipped back on. Access restored. Thanks for returning company property.'); },
      function () { var q = D.quotes || []; say('Reward unlocked: "' + (q[M.floor(M.random() * q.length)] || 'Live the moment.') + '"', 5200); },
      function () { var w = D.wins || [], x = w[M.floor(M.random() * w.length)]; say(x ? 'Secret file: ' + x.t + '. ' + x.d : 'Secret file: still loading.', 6200); },
      function () { say('Rehung ' + rewards + ' times. HR has been notified. They said thanks.', 4200); }
    ];
    function rehang() {
      var cw = clipWorld(), cp = { x: cw.x, y: cw.y - scrollY }; b.y -= scrollY; frame = 'view'; stub = [[], []]; layer.classList.remove('loose');
      var keepW = b.w; initHang(cp, true); b.w = keepW * .5; var Am = amid(); L = M.max(L, M.min(M.hypot(home().x - Am.x, home().y - Am.y), 260)); rope.forEach(function (R) { R.len = L / N; });
      gone(false); holder.style.height = (Hc + 24) + 'px'; rewards++; hungAt = scrollY; blink(); card.classList.add('hung'); setTimeout(function () { card.classList.remove('hung'); }, 900);
      REWARDS[M.min(REWARDS.length - 1, rewards - 1)](); kick();
    }
    /* pointer: grab point is stored in card-local coordinates */
    on(box, 'pointerdown', function (e) {
      e.preventDefault(); box.setPointerCapture(e.pointerId); layer.classList.add('grab'); doc.documentElement.classList.add('nosel');
      var oy = frame === 'page' ? scrollY : 0, lx = e.clientX - b.x, ly = e.clientY + oy - b.y, g = rot(lx, ly, -b.a), pvx = e.clientX, pvy = e.clientY + oy;
      drag = { gx: g.x, gy: g.y, cx: e.clientX, cy: e.clientY, px: pvx, py: pvy, pvx: 0, pvy: 0, ax: 0, ay: 0 }; blink(); kick();
    });
    on(box, 'pointermove', function (e) { if (!drag) return; drag.cx = e.clientX; drag.cy = e.clientY; kick(); });
    function release() {
      if (!drag) return; layer.classList.remove('grab'); doc.documentElement.classList.remove('nosel');
      var v = drag; drag = null;
      if (mode === 'hang') { var spd = M.hypot(P.vx, P.vy); if (spd > 1800) { P.vx *= 1800 / spd; P.vy *= 1800 / spd; } }
      else { var hk = hookPt(), cw = clipWorld(); if (M.min(M.hypot(cw.x - hk.x, cw.y - scrollY - hk.y), M.hypot(v.cx - hk.x, v.cy - hk.y)) < 110) { if (M.hypot(cw.x - hk.x, cw.y - scrollY - hk.y) > 40) { b.a = 0; b.w = 0; var o2 = rot(0, -CLIPY(), 0); b.x = hk.x + o2.x; b.y = hk.y + scrollY + o2.y; } rehang(); return; } b.vx = M.max(-1400, M.min(1400, b.vx)); b.vy = M.max(-1400, M.min(1400, b.vy)); b.w = M.max(-2, M.min(2, b.w)); }
      kick();
    }
    on(box, 'pointerup', release); on(box, 'pointercancel', release);
    on(box, 'keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (mode === 'loose') { var hk = hookPt(), o = rot(0, -CLIPY(), b.a); b.x = hk.x + o.x; b.y = hk.y + scrollY + o.y; rehang(); } else { b.w += .8; kick(); } return; }
      var d = { ArrowLeft: [-30, 0], ArrowRight: [30, 0], ArrowUp: [0, -30], ArrowDown: [0, 30] }[e.key]; if (!d) return; e.preventDefault();
      if (mode === 'hang') { P.vx += d[0] * 12; P.vy += d[1] * 12; } else { b.vx += d[0] * 14; b.vy += d[1] * 14 - (d[1] < 0 ? 600 : 0); } kick();
    });
    var TH = function () { return hungAt ? 360 : M.min(260, innerHeight * .3); };
    on(window, 'scroll', function () {
      var dy = scrollY - lastY; lastY = scrollY; sv = sv * .6 + (dy * 60) * .4;
      if (mode === 'hang') { b.w += M.max(-.4, M.min(.4, -dy * .002)); if (!drag && M.abs(scrollY - hungAt) > TH() && (hungAt || scrollY > TH())) snap(false); kick(); }
      else { if (raf) return; draw(); }
    }, { passive: true });
    on(window, 'resize', function () { measure(); if (mode === 'hang' && !drag) initHang({ x: home().x, y: hungAt ? bar.getBoundingClientRect().bottom + 70 : home().y }, true); kick(); });
    if (window.ResizeObserver) { var ro = new ResizeObserver(function () { if (mode === 'loose') kick(); }); ro.observe(doc.body); offs.push(function () { ro.disconnect(); }); }
    H._id = function () { var r = box.getBoundingClientRect(); return { mode: mode, frame: frame, x: M.round(b.x), y: M.round(b.y), a: +b.a.toFixed(3), w: +b.w.toFixed(3), v: [M.round(b.vx), M.round(b.vy)], sy: M.round(scrollY), box: [M.round(r.left), M.round(r.top), M.round(r.bottom)], ih: innerHeight, floor: M.round(pageBottom()), rewards: rewards, hook: hookPt() }; };
    measure(); initHang(home(), false);
    requestAnimationFrame(function () { measure(); if (mode === 'hang' && !drag) initHang(home(), true); kick(); setTimeout(fitHolder, 900); });
    if (RM) { /* reduced motion: the card just sits where the name was; it can still be dragged, physics stays gentle */ }
    if (scrollY > TH()) { snap(false); b.x = M.min(pageRight() - W / 2 - 10, M.max(W / 2 + 10, b.x)); b.y = pageBottom() - Hc / 2 - 1; b.vx = b.vy = 0; b.a = 0; b.w = 0; }
    kick();
    return function () { cancelAnimationFrame(raf); offs.forEach(function (f) { f(); }); layer.remove(); if (floorEl) floorEl.remove(); };
  }
  H.KINDS = [['idcard', 'ID card + polaroids', 'Access card on the left instead of the big name, photo stack on the right.'], ['terminal', 'Terminal', 'A shell that types out who I am, git log included.'], ['badge', 'Access card', 'An identity badge that tilts, scans and grants access.'], ['polaroids', 'Polaroids', 'A stack of my photographs that shuffles.'], ['now', 'Right now', 'Live Bengaluru time, mood, coffee count, activity grid.'], ['orbit', 'Orbit', 'My portrait with what I do circling it.'], ['none', 'Nothing', 'Keep the right side empty, like before.']];
  H.mount = function (hero, kind) {
    timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = []; if (fx) { fx(); fx = null; }
    var old = hero.querySelector('.hr-slot'); if (old) old.parentNode.removeChild(old);
    var k = 'idcard'; if (!H[k] || k === 'mount' || k === 'KINDS' || k === 'set') k = k === 'none' ? 'none' : 'idcard';
    hero.setAttribute('data-hero', k); if (k === 'none') return;
    var slot = el('div', 'hr-slot'); slot.dataset.k = k; slot.className = 'hr-slot'; slot.appendChild(H[k]()); var w = hero.querySelector('.wrap'); w.appendChild(slot);
    var oldId = hero.querySelector('.hr-id'); if (oldId) oldId.parentNode.removeChild(oldId);
    if (k === 'idcard') fx = idfx(hero, hero.querySelector('.hero-name'));
  };
  H.set = function (k) { store('v5hero', k); var h = doc.querySelector('header.hero'); if (h) H.mount(h, k); };
})();
