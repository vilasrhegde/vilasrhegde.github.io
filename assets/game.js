/* SIGNAL 32: a sci-fi investigation and survival game, played on one canvas.
   Story: a transmission reached Earth carrying one person's whole personality in 32 pieces. You are the investigator sent to the
   source on Kepler-23b. Land, scan for anomalies, survive on a limited oxygen supply, analyse each site and recover every fragment.
   Controls: WASD or arrows to walk, Shift to sprint, Space to scan, E to investigate, C for the case file. Tap to walk on touch screens.
   The game has its own dark look, independent of the site palette. No libraries. */
(function () {
  'use strict';
  var D = window.D, doc = document, M = Math, RM = matchMedia('(prefers-reduced-motion: reduce)').matches, Game = window.Game = {}, NS = 'http://www.w3.org/2000/svg';
  function el(t, c, x) { var e = doc.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = M.imul(s ^ s >>> 15, 1 | s); t = t + M.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash2(x, y, s) { var n = M.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453123; return n - M.floor(n); }
  function vnoise(x, y, s) { var xi = M.floor(x), yi = M.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function fbm(x, y, s, o) { var t = 0, a = .5, f = 1, n = 0, i; for (i = 0; i < o; i++) { t += vnoise(x * f, y * f, s + i) * a; n += a; a *= .5; f *= 2.03; } return t / n; }
  function hex(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; }
  function rgba(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')'; }

  var WW = 2800, WH = 2000, CAMP = { x: 1400, y: 1000 };
  var REG = [
    { n: 'Wild', x: 620, y: 540, r: 560, g: [14, 78, 70], ac: '#3dffb4', k: 'forest', hi: 'Sector Wild. The signal is chatty here. It also smells.' },
    { n: 'Roads & ruins', x: 2150, y: 520, r: 470, g: [112, 64, 34], ac: '#ffb347', k: 'ruins', hi: 'Sector Roads and Ruins. Old walls. They have opinions.' },
    { n: 'Thrills & arena', x: 2260, y: 1500, r: 440, g: [88, 30, 106], ac: '#ff54d6', k: 'arena', hi: 'Sector Arena. High static. Adrenaline detected, legally.' },
    { n: 'Stage & screen', x: 1400, y: 1730, r: 380, g: [30, 54, 140], ac: '#62b0ff', k: 'stage', hi: 'Sector Stage. Holographic screens. Please keep phones in pockets.' },
    { n: 'Mind & universe', x: 540, y: 1500, r: 450, g: [50, 32, 120], ac: '#b894ff', k: 'crystal', hi: 'Sector Mind. Crystals hum questions. No answers in stock.' },
    { n: 'Heart & soul', x: 1400, y: 430, r: 350, g: [124, 36, 80], ac: '#ff86b0', k: 'heart', hi: 'Sector Heart. Undefined behaviour. Highly recommended.' }
  ];
  REG.forEach(function (r) { r.c = hex(r.ac); });

  Game.mount = function (host) {
    var box = el('div', 'gx'), cv = el('canvas', 'gx-cv'), vig = el('div', 'gx-fx'), hud = el('div', 'gx-hud'), side = el('div', 'gx-side'), mini = el('canvas', 'gx-mini'), comms = el('div', 'gx-comms'), card = el('div', 'gx-card'), brief = el('div', 'gx-brief'), load = el('div', 'gx-load'), btns = el('div', 'gx-btns'), warn = el('div', 'gx-warn');
    cv.setAttribute('role', 'application'); cv.setAttribute('aria-label', 'Signal 32, a sci-fi investigation game. Walk with arrow keys or tap, scan with space, investigate with E. The case file lists all 32 fragments.'); cv.tabIndex = 0; card.hidden = true; warn.setAttribute('aria-live', 'polite'); comms.setAttribute('aria-live', 'polite');
    [cv, vig, hud, side, comms, btns, warn, card, brief, load].forEach(function (n) { box.appendChild(n); }); host.appendChild(box);
    var g = cv.getContext('2d'), mg = mini.getContext('2d'), W = 0, H = 0, dpr = 1, t0 = performance.now(), last = t0, now = 0, visible = true;

    /* ------------------------------------------------ the planet: generated in slices so the page never freezes */
    var BW = WW / 2, BH = WH / 2, base = doc.createElement('canvas'); base.width = BW; base.height = BH; var bctx = base.getContext('2d'), HG = new Float32Array(BW * BH), ready = false, prog = 0;
    function height(wx, wy) { return fbm(wx / 430 + 3.1, wy / 430 + 7.7, 11, 4); }
    var neutral = [66, 84, 112];
    function genTerrain(done) {
      var img = bctx.createImageData(BW, BH), data = img.data, y = 0, phase = 0, x, i, k;
      function slice() {
        var tt = performance.now();
        if (phase === 0) { while (y < BH && performance.now() - tt < 14) { for (x = 0; x < BW; x++) HG[y * BW + x] = height(x * 2, y * 2); y++; } prog = y / BH * .5; if (y >= BH) { phase = 1; y = 0; } }
        else {
          while (y < BH && performance.now() - tt < 14) {
            for (x = 0; x < BW; x++) {
              i = y * BW + x; var wx = x * 2, wy = y * 2, h = HG[i], hx = HG[y * BW + M.min(BW - 1, x + 1)] - HG[y * BW + M.max(0, x - 1)], hy = HG[M.min(BH - 1, y + 1) * BW + x] - HG[M.max(0, y - 1) * BW + x], lit = clamp(.72 + (-hx - hy) * 8.5, .38, 1.3);
              var wt = .26, r = neutral[0] * .26, gg = neutral[1] * .26, b = neutral[2] * .26, bestW = 0, best = null, dxc = wx - CAMP.x, dyc = wy - CAMP.y, wc = M.exp(-(dxc * dxc + dyc * dyc) / (270 * 270));
              r += 64 * wc * 1.2; gg += 76 * wc * 1.2; b += 96 * wc * 1.2; wt += wc * 1.2;
              for (k = 0; k < 6; k++) { var R = REG[k], dx = (wx - R.x) / R.r, dy = (wy - R.y) / (R.r * .85), w = M.exp(-(dx * dx + dy * dy) * 1.7); r += R.g[0] * w; gg += R.g[1] * w; b += R.g[2] * w; wt += w; if (w > bestW) { bestW = w; best = R; } }
              r /= wt; gg /= wt; b /= wt;
              var rr, g2, bb;
              var water = h < .365 && wc < .12;
              if (water) { var dep = clamp((.365 - h) * 9, 0, 1); rr = lerp(14, 6, dep); g2 = lerp(86, 36, dep); bb = lerp(112, 64, dep); }
              else {
                rr = r * lit * (.86 + h * .32); g2 = gg * lit * (.86 + h * .32); bb = b * lit * (.86 + h * .32);
                var vv = M.abs(fbm(wx / 170 + 40, wy / 170 + 9, 31, 3) - .5); if (vv < .02 && best && bestW > .18) { var f = (1 - vv / .02) * clamp(bestW * 1.4, 0, 1) * 82; rr += best.c[0] / 255 * f; g2 += best.c[1] / 255 * f; bb += best.c[2] / 255 * f; }
                if (h < .4) { var sf = (1 - (h - .365) / .035) * 70; rr += 20 * sf / 70; g2 += 150 * sf / 70; bb += 170 * sf / 70; }
                var gr = (hash2(wx, wy, 5) - .5) * 14; rr += gr; g2 += gr; bb += gr;
                var st = fbm(wx / 54 + 3, wy / 30 + 8, 61, 2); rr *= .88 + st * .26; g2 *= .88 + st * .26; bb *= .88 + st * .26;
                if (hash2(wx * .5, wy * .5, 77) > .9965) { rr += 90; g2 += 110; bb += 130; }
                var cr = M.abs(fbm(wx / 70 + 11, wy / 70 + 2, 91, 3) - .5); if (cr < .014 && best) { var cf = (1 - cr / .014) * 34; rr -= cf; g2 -= cf; bb -= cf; }
              }
              var o = i * 4; data[o] = clamp(rr, 0, 255); data[o + 1] = clamp(g2, 0, 255); data[o + 2] = clamp(bb, 0, 255); data[o + 3] = 255;
            }
            y++;
          }
          prog = .5 + y / BH * .5;
          if (y >= BH) { bctx.putImageData(img, 0, 0); ready = true; done(); return; }
        }
        load.style.setProperty('--p', (prog * 100).toFixed(0) + '%'); setTimeout(slice, 0);
      }
      slice();
    }

    /* ------------------------------------------------ the 32 anomalies (one per interest) */
    var sites = [], R = rng(21), icons = {};
    function iconImg(key, col) { var k = key + col; if (icons[k]) return icons[k]; var inner = (window.ICONS || {})[key] || '', svg = '<svg xmlns="' + NS + '" viewBox="0 0 24 24" fill="none" stroke="' + col + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>', im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); icons[k] = im; return im; }
    function isWater(x, y) { return height(x, y) < .37 && M.hypot(x - CAMP.x, y - CAMP.y) > 190; }
    D.realms.forEach(function (realm, ri) {
      var reg = REG[ri], n = realm.items.length;
      realm.items.forEach(function (it, i) {
        var x, y, tries = 0;
        do { var ang = i / n * 6.283 + ri * 1.7 + (tries * 2.399), rad = reg.r * (.2 + .62 * R()); x = clamp(reg.x + M.cos(ang) * rad, 120, WW - 120); y = clamp(reg.y + M.sin(ang) * rad * .82, 120, WH - 120); tries++; }
        while (tries < 40 && (isWater(x, y) || M.hypot(x - CAMP.x, y - CAMP.y) < 260 || sites.some(function (s) { return M.hypot(s.x - x, s.y - y) < 130; })));
        sites.push({ x: x, y: y, it: it, reg: ri, found: false, ping: -99, ph: R() * 6, idx: sites.length, icon: iconImg(it.k, reg.ac), iconDim: iconImg(it.k, '#9fb6c9') });
      });
    });

    /* ------------------------------------------------ the world's scenery */
    var deco = [], glows = [], RD = rng(5);
    function okPoint(x, y, minSite) { if (x < 40 || y < 40 || x > WW - 40 || y > WH - 40) return false; if (isWater(x, y)) return false; if (M.hypot(x - CAMP.x, y - CAMP.y) < 120) return false; for (var i = 0; i < sites.length; i++) if (M.hypot(sites[i].x - x, sites[i].y - y) < (minSite || 56)) return false; return true; }
    function scatter(ri, type, n, opts) { var reg = REG[ri], c = 0, tries = 0; while (c < n && tries++ < n * 14) { var ang = RD() * 6.283, d = reg.r * 1.12 * M.sqrt(RD()), x = reg.x + M.cos(ang) * d, y = reg.y + M.sin(ang) * d * .82; if (!okPoint(x, y, opts && opts.sp)) continue; var o = { x: x, y: y, t: type, s: .7 + RD() * .8, v: RD(), ri: ri, c: reg.c, ac: reg.ac }; if (opts && opts.glow) { o.glow = opts.glow * (.7 + RD() * .6); glows.push(o); } deco.push(o); c++; } }
    scatter(0, 'tree', 30, { glow: 70 }); scatter(0, 'mush', 80, { glow: 38 }); scatter(0, 'fern', 70); scatter(0, 'rock', 22);
    scatter(1, 'pillar', 40, { glow: 26 }); scatter(1, 'slab', 14, { glow: 54 }); scatter(1, 'rock', 44);
    scatter(2, 'coil', 14, { glow: 90 }); scatter(2, 'spike', 36, { glow: 22 }); scatter(2, 'rock', 34);
    scatter(3, 'screen', 22, { glow: 84 }); scatter(3, 'pylon', 26, { glow: 40 }); scatter(3, 'rock', 20);
    scatter(4, 'crystal', 56, { glow: 62 }); scatter(4, 'orb', 26, { glow: 44 }); scatter(4, 'rock', 24);
    scatter(5, 'orb', 46, { glow: 52 }); scatter(5, 'bloom', 80, { glow: 34 }); scatter(5, 'tree', 12, { glow: 60 });
    for (var q = 0; q < 70; q++) { var rx = RD() * WW, ry = RD() * WH; if (okPoint(rx, ry, 40)) deco.push({ x: rx, y: ry, t: 'rock', s: .6 + RD() * .8, v: RD(), ri: -1, c: [120, 140, 170], ac: '#8aa' }); }
    for (q = 0; q < 8; q++) { var a2 = q / 8 * 6.283 + .3, wx = CAMP.x + M.cos(a2) * (170 + RD() * 120), wy = CAMP.y + M.sin(a2) * (150 + RD() * 100); deco.push({ x: wx, y: wy, t: 'wreck', s: .8 + RD() * .6, v: RD(), ri: -1, c: [160, 180, 200], ac: '#9cf' }); }
    deco.sort(function (a, b) { return a.y - b.y; });
    var VENTS = [[1000, 720], [1830, 700], [880, 1300], [1880, 1330], [1400, 1390], [1400, 640]].map(function (p) { return { x: p[0], y: p[1], ph: RD() * 6 }; });
    var CLOUDS = [[700, 900, 260, 90, .21, 90], [1200, 560, 120, 70, .33, 55], [1900, 900, 200, 120, .26, 80], [1100, 1560, 160, 90, .3, 70], [2100, 1050, 150, 120, .24, 76], [740, 1060, 90, 140, .35, 60], [1650, 1500, 170, 80, .22, 66], [1550, 260, 130, 60, .4, 52]].map(function (c, i) { return { cx: c[0], cy: c[1], ax: c[2], ay: c[3], sp: c[4], r: c[5], ph: i * 1.3, x: c[0], y: c[1] }; });

    /* ------------------------------------------------ state */
    var me = { x: CAMP.x, y: CAMP.y + 60, vx: 0, vy: 0, face: 0, step: 0, o2: 100, scan: 100 }, keys = {}, goal = null, found = 0, tows = 0, started = false, cardOpen = false, shake = 0, mood = '', spent = 0, startAt = 0;
    var expl = doc.createElement('canvas'); expl.width = WW / 8; expl.height = WH / 8; var ec = expl.getContext('2d'), seen = new Uint8Array(expl.width * expl.height);
    var cam = { x: me.x, y: me.y }, parts = [], rings = [], puffs = [], scanRing = null, analyzing = null, lastRegion = -2, commsT = 0, sparks = [], fade = 0, hintTarget = null, hintUntil = 0;
    function explore(wx, wy, r) { var gx = M.floor(wx / 8), gy = M.floor(wy / 8), rr = M.ceil(r / 8); ec.fillStyle = 'rgba(255,255,255,.06)'; ec.beginPath(); ec.arc(wx / 8, wy / 8, rr, 0, 6.283); ec.fill(); for (var yy = -rr; yy <= rr; yy++) for (var xx = -rr; xx <= rr; xx++) if (xx * xx + yy * yy <= rr * rr) { var cx = gx + xx, cy = gy + yy; if (cx >= 0 && cy >= 0 && cx < expl.width && cy < expl.height) seen[cy * expl.width + cx] = 1; } }
    for (var pi = 0; pi < 120; pi++) parts.push({ x: M.random(), y: M.random(), z: .3 + M.random() * .9, p: M.random() * 6, c: pi % 3 });

    function size() { var r = box.getBoundingClientRect(); W = M.max(300, r.width); H = M.max(300, r.height); dpr = M.min(devicePixelRatio || 1, 1.25); cv.width = W * dpr | 0; cv.height = H * dpr | 0; mini.width = 140 * dpr | 0; mini.height = 100 * dpr | 0; lightC.width = M.ceil(W / 2); lightC.height = M.ceil(H / 2); }
    var lightC = doc.createElement('canvas'), lg = lightC.getContext('2d'); size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(box); else addEventListener('resize', size);

    /* ------------------------------------------------ interface */
    function say(speaker, text, hold) { commsT = hold || 5.5; while (comms.firstChild) comms.removeChild(comms.firstChild); comms.appendChild(el('small', '', speaker)); comms.appendChild(el('p', '', text)); comms.classList.remove('on'); void comms.offsetWidth; comms.classList.add('on'); }
    function flash(text) { warn.textContent = text; warn.classList.remove('on'); void warn.offsetWidth; warn.classList.add('on'); }
    var hO2, hScan, hCount, hSector, hRegs = [], hHint, hFill;
    (function buildHud() {
      var t = el('div', 'gx-title'); t.appendChild(el('b', '', 'SIGNAL 32')); t.appendChild(el('span', '', 'Kepler-23b')); hud.appendChild(t);
      hCount = el('div', 'gx-count'); hud.appendChild(hCount);
      function bar(label, cls) { var r = el('div', 'gx-bar ' + cls), l = el('span', '', label), b = el('i'), f = el('u'); b.appendChild(f); r.appendChild(l); r.appendChild(b); hud.appendChild(r); return { r: r, f: f }; }
      hO2 = bar('Oxygen', 'o2'); hScan = bar('Scanner', 'sc'); hSector = el('div', 'gx-sector'); hud.appendChild(hSector); var rg = el('div', 'gx-regs'); REG.forEach(function (r, i) { var s = el('span'); s.style.setProperty('--c', r.ac); s.title = r.n; rg.appendChild(s); hRegs.push(s); }); hud.appendChild(rg);
      var b1 = el('button', 'gx-b', 'Scan'), b2 = el('button', 'gx-b', 'Case file'); b1.type = b2.type = 'button'; b1.appendChild(el('kbd', '', 'Space')); b2.appendChild(el('kbd', '', 'C')); b1.addEventListener('click', doScan); b2.addEventListener('click', openCase); side.appendChild(mini); var row = el('div', 'gx-row'); row.appendChild(b1); row.appendChild(b2); side.appendChild(row); hHint = el('div', 'gx-hint'); side.appendChild(hHint);
      var bi = el('button', 'gx-big', 'Investigate'); bi.type = 'button'; bi.addEventListener('click', interact); btns.appendChild(bi); var bs = el('button', 'gx-big alt', 'Scan'); bs.type = 'button'; bs.addEventListener('click', doScan); btns.appendChild(bs); Game._bi = bi;
    })();
    function paintHud() {
      while (hCount.firstChild) hCount.removeChild(hCount.firstChild); hCount.appendChild(el('b', '', ('0' + found).slice(-2))); hCount.appendChild(el('span', '', ' / 32 fragments recovered'));
      hO2.f.style.width = M.max(0, me.o2) + '%'; hO2.r.classList.toggle('low', me.o2 < 25); hScan.f.style.width = clamp(me.scan, 0, 100) + '%';
      REG.forEach(function (r, i) { var tot = sites.filter(function (s) { return s.reg === i; }), fd = tot.filter(function (s) { return s.found; }).length; hRegs[i].style.setProperty('--f', fd / tot.length); hRegs[i].classList.toggle('done', fd === tot.length); hRegs[i].title = r.n + ': ' + fd + ' of ' + tot.length; });
    }

    /* ------------------------------------------------ case file */
    var dlg = el('dialog', 'gx-case'); doc.body.appendChild(dlg); dlg.setAttribute('aria-label', 'Case file');
    function icoSvg(k) { var svg = doc.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '1.6'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round'); svg.setAttribute('aria-hidden', 'true'); var pr = new DOMParser().parseFromString('<svg xmlns="' + NS + '">' + ((window.ICONS || {})[k] || '') + '</svg>', 'image/svg+xml'); [].forEach.call(pr.documentElement.childNodes, function (nd) { svg.appendChild(doc.importNode(nd, true)); }); return svg; }
    var MOODS = [[0, 'Subject unknown. Could be anyone. Could be a very organised raccoon.'], [1, 'One piece in. Subject likes the outdoors, probably.'], [6, 'A profile is forming. Subject owns more than one pair of hiking shoes.'], [12, 'Pattern detected: curiosity, with occasional bad jokes.'], [20, 'Most of a person. Still missing the parts that explain the snacks.'], [28, 'Almost complete. The subject is starting to feel watched.'], [32, 'Case closed. Subject identified. He would like to say hello.']];
    function openCase() {
      while (dlg.firstChild) dlg.removeChild(dlg.firstChild);
      var mood = MOODS.filter(function (m) { return found >= m[0]; }).pop()[1], pct = found / sites.length;
      var head = el('header', 'cf-head'), ring = el('div', 'cf-ring'); ring.style.setProperty('--p', (pct * 100).toFixed(1)); ring.appendChild(el('b', '', String(found))); ring.appendChild(el('small', '', 'of ' + sites.length)); head.appendChild(ring);
      var ht = el('div', 'cf-ht'); ht.appendChild(el('span', 'cf-kick', 'Case file  /  Signal 32  /  Kepler-23b')); ht.appendChild(el('h2', '', found === sites.length ? 'Case closed' : 'Subject: unidentified')); ht.appendChild(el('p', '', mood)); head.appendChild(ht);
      var x = el('button', 'gx-b cf-x', 'Close'); x.type = 'button'; x.addEventListener('click', function () { dlg.close(); }); head.appendChild(x); dlg.appendChild(head);
      var body = el('div', 'cf-body'), board = el('div', 'cf-board'), view = el('aside', 'cf-view'); view.setAttribute('aria-live', 'polite');
      var sel = null;
      function show(s, btn) {
        if (sel) sel.classList.remove('sel'); sel = btn; if (btn) btn.classList.add('sel');
        while (view.firstChild) view.removeChild(view.firstChild); var r = REG[s.reg]; view.style.setProperty('--c', r.ac);
        var big = el('div', 'cf-big' + (s.found ? ' on' : '')); if (s.found) big.appendChild(icoSvg(s.it.k)); else big.appendChild(el('span', '', '?')); view.appendChild(big);
        view.appendChild(el('span', 'cf-tag', 'Evidence ' + ('0' + (s.idx + 1)).slice(-2) + '  /  Sector ' + r.n));
        if (s.found) { view.appendChild(el('h3', '', s.it.n)); view.appendChild(el('p', 'cf-q', s.it.d)); view.appendChild(el('p', 'cf-stamp', 'Recovered')); }
        else { view.appendChild(el('h3', 'cf-red', 'REDACTED')); view.appendChild(el('p', 'cf-q', 'Signal detected in ' + r.n + '. Walk there, press Scan, follow the arrow.')); view.appendChild(el('p', 'cf-stamp no', 'Not recovered')); }
      }
      var first = null;
      REG.forEach(function (r, ri) {
        var list = sites.filter(function (s) { return s.reg === ri; }), got = list.filter(function (s) { return s.found; }).length;
        var card = el('section', 'cf-sec' + (got === list.length ? ' full' : '')); card.style.setProperty('--c', r.ac);
        var h = el('div', 'cf-sh'); h.appendChild(el('h3', '', r.n)); h.appendChild(el('span', '', got + ' / ' + list.length)); card.appendChild(h);
        var bar = el('i', 'cf-bar'); bar.style.setProperty('--w', (got / list.length * 100) + '%'); card.appendChild(bar);
        var tiles = el('div', 'cf-tiles');
        list.forEach(function (s) { var b = el('button', 'cf-t' + (s.found ? ' on' : '')); b.type = 'button'; b.setAttribute('aria-label', s.found ? s.it.n : 'Redacted evidence in ' + r.n); if (s.found) b.appendChild(icoSvg(s.it.k)); b.addEventListener('click', function () { show(s, b); }); b.addEventListener('mouseenter', function () { if (matchMedia('(hover:hover)').matches) show(s, b); }); tiles.appendChild(b); if (!first || (s.found && !first.s.found)) first = { s: s, b: b }; });
        card.appendChild(tiles); board.appendChild(card);
      });
      body.appendChild(board); body.appendChild(view); dlg.appendChild(body); if (first) show(first.s, first.b);
      var foot = el('footer', 'cf-foot'); foot.appendChild(el('span', '', 'Hover or tap a tile to inspect it.')); var sk = el('button', 'gx-b', 'Skip the game and reveal all 32'); sk.type = 'button'; sk.addEventListener('click', function () { sites.forEach(function (s) { if (!s.found) { s.found = true; found++; } }); paintHud(); dlg.close(); finale(true); }); foot.appendChild(sk); dlg.appendChild(foot);
      if (!dlg.open) dlg.showModal();
    }

    /* ------------------------------------------------ actions */
    function doScan() { if (!started || cardOpen || me.scan < 30 || scanRing) { if (me.scan < 30) flash('Scanner recharging'); return; } me.scan -= 30; scanRing = { x: me.x, y: me.y, t: 0 }; if (window.__sfx && __sfx.whoosh) __sfx.whoosh(); var hits = 0; sites.forEach(function (s) { if (!s.found && M.hypot(s.x - me.x, s.y - me.y) < 560) { s.ping = now; hits++; } }); var un = sites.filter(function (s) { return !s.found; }); un.sort(function (a, b) { return M.hypot(a.x - me.x, a.y - me.y) - M.hypot(b.x - me.x, b.y - me.y); }); hintTarget = un[0] || null; hintUntil = now + 9; say('DRONE', hits ? (hits === 1 ? 'One fragment in range. It is shy.' : hits + ' fragments in range. Follow the arrow.') : 'Nothing in range. The signal is further out. Try another direction.'); }
    function nearestSite() { var best = null, bd = 1e9; sites.forEach(function (s) { if (s.found) return; var d = M.hypot(s.x - me.x, s.y - me.y); if (d < bd) { bd = d; best = s; } }); return bd < 62 ? best : null; }
    function interact() { if (!started) return; if (cardOpen) { closeCard(); return; } var s = nearestSite(); if (s) startAnalyze(s, true); else flash('Nothing to investigate here'); }
    function startAnalyze(s, fast) { if (analyzing && analyzing.s === s) { if (fast) analyzing.t = M.max(analyzing.t, 1.1); return; } analyzing = { s: s, t: fast ? 1.0 : 0 }; }
    function recover(s) {
      s.found = true; found++; me.o2 = M.min(100, me.o2 + 28); me.scan = 100; shake = .3; analyzing = null; if (window.__sfx && __sfx.chime) __sfx.chime(); for (var i = 0; i < 34; i++) sparks.push({ x: s.x, y: s.y - 20, vx: (M.random() - .5) * 280, vy: -50 - M.random() * 240, life: 1, c: REG[s.reg].ac }); rings.push({ x: s.x, y: s.y, t: 0, c: REG[s.reg].ac });
      openCard(s); paintHud();
    }
    function openCard(s) {
      cardOpen = true; while (card.firstChild) card.removeChild(card.firstChild); card.hidden = false; card.style.setProperty('--c', REG[s.reg].ac); card.classList.remove('on'); void card.offsetWidth; card.classList.add('on');
      card.appendChild(el('small', '', 'Evidence ' + ('0' + found).slice(-2) + ' of 32  ·  Sector ' + REG[s.reg].n)); card.appendChild(el('b', '', s.it.n)); card.appendChild(el('i', '', s.it.d)); card.appendChild(el('p', '', 'Oxygen restored by 28 percent. Scanner fully charged.'));
      var row = el('div', 'row'), ok = el('button', 'gx-big', found === 32 ? 'Open the final report' : 'Continue'); ok.type = 'button'; ok.addEventListener('click', function () { closeCard(); if (found === 32) finale(false); }); row.appendChild(ok); card.appendChild(row); ok.focus({ preventScroll: true });
    }
    function closeCard() { cardOpen = false; card.hidden = true; card.classList.remove('on'); cv.focus({ preventScroll: true }); }
    function finale(skipped) {
      cardOpen = true; while (card.firstChild) card.removeChild(card.firstChild); card.hidden = false; card.className = 'gx-card on fin'; card.style.setProperty('--c', '#62b0ff'); var mins = M.floor((performance.now() - startAt) / 60000), secs = M.floor((performance.now() - startAt) / 1000) % 60;
      card.appendChild(el('small', '', 'Transmission complete')); card.appendChild(el('b', '', skipped ? 'Case closed, with shortcuts.' : 'All 32 fragments recovered.'));
      card.appendChild(el('i', '', 'The signal had one source: an engineer who builds integrations, climbs hills and photographs the waterfalls. You were looking at the site the whole time.')); if (!skipped) card.appendChild(el('p', '', 'Mission time ' + mins + ':' + ('0' + secs).slice(-2) + '. Drone tows: ' + tows + (tows ? '. It is not angry, only disappointed.' : '. Impressive. The drone is bored.')));
      var row = el('div', 'row'), a = el('a', 'gx-big', 'See what he builds'); a.href = PAGE('work'); var b = el('button', 'gx-big alt', 'Keep exploring'); b.type = 'button'; b.addEventListener('click', function () { card.className = 'gx-card'; closeCard(); }); row.appendChild(a); row.appendChild(b); card.appendChild(row);
    }
    /* briefing */
    (function () {
      brief.appendChild(el('small', '', 'Incoming transmission  ·  Origin: Kepler-23b')); brief.appendChild(el('h3', '', 'A signal with 32 parts'));
      [['A transmission reached Earth carrying one person, split into 32 fragments: places, habits, passions, bad jokes.'], ['You are the investigator. Land, scan for anomalies, analyse each site and recover every fragment.'], ['Oxygen is limited. Refill at the base camp, at blue vents, or by recovering a fragment. Avoid the spore clouds. They are not friendly.']].forEach(function (t, i) { var p = el('p', '', t[0]); p.style.setProperty('--d', (i * .9 + .3) + 's'); brief.appendChild(p); });
      var go = el('button', 'gx-big', 'Land on Kepler-23b'); go.type = 'button'; go.addEventListener('click', begin); brief.appendChild(go); var kk = el('small', 'k', 'Walk: WASD or arrows. Sprint: Shift. Scan: Space. Investigate: E. Case file: C. On touch: tap to walk, use the buttons.'); brief.appendChild(kk);
    })();
    function begin() { if (started || !ready) { if (!ready) flash('Generating the planet…'); return; } started = true; startAt = performance.now(); brief.classList.add('off'); setTimeout(function () { brief.hidden = true; }, 600); explore(me.x, me.y, 280); say('DRONE', 'Landing complete. Atmosphere: mostly regret. Oxygen: limited. Press Space to scan for anomalies.', 8); cv.focus({ preventScroll: true }); paintHud(); }
    Game.begin = begin;

    /* ------------------------------------------------ input */
    function active() { var r = box.getBoundingClientRect(); return r.bottom > 100 && r.top < innerHeight - 100 && !dlg.open && !/INPUT|TEXTAREA|SELECT/.test((doc.activeElement || {}).tagName || ''); }
    var ctl = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd', 'e', 'c', 'enter', 'escape', 'shift'];
    addEventListener('keydown', function (e) { if (!active()) return; var k = e.key.toLowerCase(); if (ctl.indexOf(k) < 0) return; if (!started) { if (k === 'enter' || k === ' ') { e.preventDefault(); begin(); } return; } if (k === 'escape') { if (cardOpen) closeCard(); return; } if (k === 'e' || k === 'enter') { e.preventDefault(); interact(); return; } if (k === 'c') { openCase(); return; } if (k === ' ') { e.preventDefault(); doScan(); return; } e.preventDefault(); keys[k] = true; goal = null; });
    addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });
    cv.addEventListener('pointerdown', function (e) { if (!started || cardOpen) return; var r = cv.getBoundingClientRect(), wx = e.clientX - r.left - W / 2 + cam.x, wy = e.clientY - r.top - H / 2 + cam.y; var hit = sites.filter(function (s) { return !s.found && M.hypot(s.x - wx, s.y - wy) < 44 && (now - s.ping < 12 || M.hypot(s.x - me.x, s.y - me.y) < 170); })[0]; goal = hit ? { x: hit.x, y: hit.y + 18, site: hit } : { x: clamp(wx, 30, WW - 30), y: clamp(wy, 30, WH - 30) }; rings.push({ x: goal.x, y: goal.y, t: 0, c: '#ffffff', small: true }); cv.focus({ preventScroll: true }); });

    /* ------------------------------------------------ simulation */
    function regionAt(x, y) { var b = -1, bd = 1e9; REG.forEach(function (r, i) { var d = M.hypot((x - r.x) / r.r, (y - r.y) / (r.r * .85)); if (d < bd) { bd = d; b = i; } }); return bd < 1.05 ? b : -1; }
    function step(dt, t) {
      var ax = 0, ay = 0; if (keys.arrowleft || keys.a) ax--; if (keys.arrowright || keys.d) ax++; if (keys.arrowup || keys.w) ay--; if (keys.arrowdown || keys.s) ay++;
      if (goal) { var dx = goal.x - me.x, dy = goal.y - me.y, d = M.hypot(dx, dy); if (d < 10) { if (goal.site) startAnalyze(goal.site, false); goal = null; } else { ax = dx / d; ay = dy / d; } }
      var inWater = isWater(me.x, me.y), sprint = keys.shift && (ax || ay) && me.o2 > 6, sp = 150 * (sprint ? 1.65 : 1) * (inWater ? .5 : 1) * (me.o2 < 6 ? .55 : 1);
      var cloud = null, i; for (i = 0; i < CLOUDS.length; i++) { var c = CLOUDS[i]; if (M.hypot(me.x - c.x, me.y - c.y) < c.r * .92) cloud = c; } if (cloud) sp *= .62;
      var len = M.hypot(ax, ay) || 1, tx = ax ? ax / len * sp : 0, ty = ay ? ay / len * sp : 0; me.vx += (tx - me.vx) * M.min(1, dt * 8); me.vy += (ty - me.vy) * M.min(1, dt * 8);
      me.x = clamp(me.x + me.vx * dt, 24, WW - 24); me.y = clamp(me.y + me.vy * dt, 24, WH - 24); var spd = M.hypot(me.vx, me.vy); if (spd > 12) { me.face = M.atan2(me.vy, me.vx); me.step += spd * dt * .075; if (M.random() < dt * 14) puffs.push({ x: me.x + (M.random() - .5) * 8, y: me.y + 4, t: 0 }); }
      /* oxygen: drains while out, refills at camp and vents */
      var drain = spd > 12 ? (sprint ? 1.5 : .6) : .22; if (inWater) drain += .8; if (cloud) drain += 4.2; var refill = 0, hc = M.hypot(me.x - CAMP.x, me.y - CAMP.y); if (hc < 130) refill = 34; VENTS.forEach(function (v) { if (M.hypot(me.x - v.x, me.y - v.y) < 62) refill = M.max(refill, 26); });
      me.o2 = clamp(me.o2 - drain * dt + refill * dt, 0, 100); me.scan = M.min(100, me.scan + dt * 11);
      if (cloud && !Game._warnedCloud) { Game._warnedCloud = 1; say('DRONE', 'Spore cloud. Oxygen filters degrading. I said the good filters, not the cheap ones.', 6); flash('Spore cloud: oxygen draining fast'); } if (!cloud) Game._warnedCloud = 0;
      if (me.o2 < 25 && !Game._lowWarned && refill === 0) { Game._lowWarned = 1; say('DRONE', 'Oxygen below 25 percent. Suggest less standing, more walking back to base.', 6); flash('Low oxygen'); } if (me.o2 > 45) Game._lowWarned = 0;
      if (refill && me.o2 < 99 && !Game._refillSaid) { Game._refillSaid = 1; flash('Oxygen refilling'); } if (!refill) Game._refillSaid = 0;
      if (me.o2 <= 0) { tows++; fade = 1; me.x = CAMP.x; me.y = CAMP.y + 60; me.vx = me.vy = 0; me.o2 = 70; goal = null; analyzing = null; say('DRONE', tows === 1 ? 'Oxygen depleted. Towing you home. This is fine. I am only slightly judging.' : 'Oxygen depleted again. Tow number ' + tows + '. I am keeping a spreadsheet.', 7); }
      /* analysing a site: stand close and it fills */
      var near = nearestSite(); if (near && !cardOpen) { if (spd < 40) startAnalyze(near, false); } if (analyzing) { var s = analyzing.s; if (M.hypot(s.x - me.x, s.y - me.y) > 74 || s.found) analyzing = null; else { analyzing.t += dt; if (analyzing.t >= 1.5) recover(s); } }
      var rg = regionAt(me.x, me.y); if (rg !== lastRegion) { lastRegion = rg; hSector.textContent = rg < 0 ? 'Open ground' : 'Sector: ' + REG[rg].n; hSector.style.setProperty('--c', rg < 0 ? '#9fb6c9' : REG[rg].ac); if (rg >= 0 && started) say('DRONE', REG[rg].hi, 6); }
      explore(me.x, me.y, 250);
      cam.x += (me.x - cam.x) * M.min(1, dt * 4.5); cam.y += (me.y - cam.y) * M.min(1, dt * 4.5); cam.x = clamp(cam.x, W / 2, WW - W / 2); cam.y = clamp(cam.y, H / 2, WH - H / 2); if (WW < W) cam.x = WW / 2; if (WH < H) cam.y = WH / 2;
      CLOUDS.forEach(function (c) { c.x = c.cx + M.cos(t * c.sp + c.ph) * c.ax; c.y = c.cy + M.sin(t * c.sp * .83 + c.ph) * c.ay; });
      if (commsT > 0) { commsT -= dt; if (commsT <= 0) comms.classList.remove('on'); }
      if (scanRing) { scanRing.t += dt; if (scanRing.t > 1.3) scanRing = null; }
    }

    /* ------------------------------------------------ drawing: scenery pieces */
    function glowDot(x, y, r, c, a) { var gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba(c, a)); gr.addColorStop(1, rgba(c, 0)); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
    function drawDeco(d, t) {
      var x = d.x, y = d.y, s = d.s, c = d.c, sw = M.sin(t * .9 + x * .013) * 2 * s, p = .5 + .5 * M.sin(t * 1.7 + d.v * 9);
      g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(x, y + 3, 14 * s, 5 * s, 0, 0, 6.283); g.fill();
      switch (d.t) {
        case 'tree': g.strokeStyle = rgba([c[0] * .5, c[1] * .5, c[2] * .5], 1); g.lineWidth = 4 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sw, y - 26 * s, x + sw * 1.4, y - 54 * s); g.stroke(); for (var i = 0; i < 5; i++) { var a = -1.2 + i * .6, lx = x + sw * 1.4 + M.cos(a) * 30 * s, ly = y - 54 * s + M.sin(a) * 14 * s - 6 * s; g.strokeStyle = rgba(c, .85); g.lineWidth = 2.2 * s; g.beginPath(); g.moveTo(x + sw * 1.4, y - 54 * s); g.quadraticCurveTo((x + lx) / 2 + sw, y - 70 * s, lx, ly + 18 * s); g.stroke(); glowDot(lx, ly + 18 * s, 7 * s, c, .5 + p * .4); } glowDot(x + sw * 1.4, y - 56 * s, 16 * s, c, .5 + p * .3); break;
        case 'mush': g.fillStyle = rgba([c[0] * .35, c[1] * .35, c[2] * .35], 1); g.fillRect(x - 1.6 * s, y - 12 * s, 3.2 * s, 12 * s); g.fillStyle = rgba(c, .9); g.beginPath(); g.ellipse(x, y - 13 * s, 10 * s, 6 * s, 0, M.PI, 0); g.fill(); g.fillStyle = rgba([255, 255, 255], .6 + p * .3); g.beginPath(); g.arc(x - 3 * s, y - 15 * s, 1.4 * s, 0, 6.283); g.arc(x + 3 * s, y - 14 * s, 1.1 * s, 0, 6.283); g.fill(); glowDot(x, y - 12 * s, 16 * s, c, .35 + p * .25); break;
        case 'fern': g.strokeStyle = rgba(c, .75); g.lineWidth = 2 * s; g.lineCap = 'round'; for (var j = 0; j < 6; j++) { var an = -2.6 + j * .42; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + M.cos(an) * 14 * s + sw, y + M.sin(an) * 20 * s, x + M.cos(an) * 24 * s + sw * 2, y + M.sin(an) * 30 * s + 6 * s); g.stroke(); } break;
        case 'rock': g.fillStyle = rgba([c[0] * .35 + 20, c[1] * .35 + 24, c[2] * .35 + 32], 1); g.beginPath(); g.moveTo(x - 12 * s, y); g.lineTo(x - 8 * s, y - 11 * s); g.lineTo(x + 3 * s, y - 15 * s); g.lineTo(x + 12 * s, y - 6 * s); g.lineTo(x + 10 * s, y); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.moveTo(x - 8 * s, y - 11 * s); g.lineTo(x + 3 * s, y - 15 * s); g.lineTo(x + 2 * s, y - 8 * s); g.closePath(); g.fill(); break;
        case 'pillar': var h = (28 + d.v * 30) * s; g.fillStyle = rgba([c[0] * .55, c[1] * .5, c[2] * .45], 1); g.fillRect(x - 7 * s, y - h, 14 * s, h); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x - 7 * s, y - h, 4 * s, h); g.fillStyle = rgba(c, .5 + p * .4); g.fillRect(x - 3 * s, y - h * .7, 6 * s, 2 * s); g.fillRect(x - 3 * s, y - h * .5, 6 * s, 2 * s); g.beginPath(); g.moveTo(x - 7 * s, y - h); g.lineTo(x - 2 * s, y - h - 6 * s); g.lineTo(x + 7 * s, y - h); g.fill(); break;
        case 'slab': var hh = 64 * s; g.fillStyle = rgba([c[0] * .3, c[1] * .3, c[2] * .3], 1); g.beginPath(); g.moveTo(x - 12 * s, y); g.lineTo(x - 10 * s, y - hh); g.lineTo(x + 4 * s, y - hh - 8 * s); g.lineTo(x + 12 * s, y - hh + 4 * s); g.lineTo(x + 12 * s, y); g.closePath(); g.fill(); g.strokeStyle = rgba(c, .5 + p * .5); g.lineWidth = 1.6 * s; g.beginPath(); g.moveTo(x - 5 * s, y - hh * .8); g.lineTo(x + 5 * s, y - hh * .8); g.moveTo(x, y - hh * .8); g.lineTo(x, y - hh * .5); g.moveTo(x - 5 * s, y - hh * .35); g.lineTo(x + 5 * s, y - hh * .5); g.stroke(); glowDot(x, y - hh * .6, 34 * s, c, .22 + p * .2); break;
        case 'coil': g.fillStyle = '#2a2236'; g.fillRect(x - 6 * s, y - 40 * s, 12 * s, 40 * s); g.strokeStyle = rgba(c, .9); g.lineWidth = 3 * s; g.beginPath(); g.ellipse(x, y - 34 * s, 11 * s, 4 * s, 0, 0, 6.283); g.ellipse(x, y - 22 * s, 11 * s, 4 * s, 0, 0, 6.283); g.stroke(); glowDot(x, y - 44 * s, 20 * s, c, .6 + p * .3); if (M.sin(t * 7 + d.v * 40) > .55) { g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y - 44 * s); var ex = x + (d.v - .5) * 120, ey = y - 20 * s + d.v * 20; for (var m = 1; m <= 5; m++) g.lineTo(lerp(x, ex, m / 5) + (hash2(m, M.floor(t * 18), d.v * 9) - .5) * 14, lerp(y - 44 * s, ey, m / 5) + (hash2(m + 3, M.floor(t * 18), d.v * 9) - .5) * 10); g.stroke(); } break;
        case 'spike': g.fillStyle = rgba([c[0] * .3, c[1] * .3, c[2] * .35], 1); g.beginPath(); g.moveTo(x - 6 * s, y); g.lineTo(x, y - (24 + d.v * 24) * s); g.lineTo(x + 6 * s, y); g.fill(); g.strokeStyle = rgba(c, .5 + p * .4); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y - (24 + d.v * 24) * s); g.lineTo(x, y - 4 * s); g.stroke(); break;
        case 'screen': g.fillStyle = rgba([c[0] * .15, c[1] * .15, c[2] * .3], .5); g.strokeStyle = rgba(c, .9); g.lineWidth = 1.6; var by = y - 30 * s - M.sin(t * 1.3 + d.v * 7) * 3; g.fillRect(x - 24 * s, by - 18 * s, 48 * s, 32 * s); g.strokeRect(x - 24 * s, by - 18 * s, 48 * s, 32 * s); g.fillStyle = rgba(c, .5 + p * .3); for (var l = 0; l < 4; l++) g.fillRect(x - 19 * s, by - 12 * s + l * 7 * s, (28 - l * 4 + d.v * 8) * s, 2.2 * s); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x - 24 * s, by - 18 * s + (t * 22 % 32) * s, 48 * s, 3 * s); break;
        case 'pylon': g.fillStyle = '#26304a'; g.fillRect(x - 2.5 * s, y - 30 * s, 5 * s, 30 * s); g.fillStyle = rgba(c, .95); g.beginPath(); g.arc(x, y - 32 * s, 4.5 * s, 0, 6.283); g.fill(); glowDot(x, y - 32 * s, 24 * s, c, .45 + p * .3); g.fillStyle = rgba(c, .1); g.beginPath(); g.moveTo(x - 3 * s, y - 32 * s); g.lineTo(x - 26 * s, y); g.lineTo(x + 26 * s, y); g.lineTo(x + 3 * s, y - 32 * s); g.fill(); break;
        case 'crystal': for (var k = 0; k < 4; k++) { var cx = x + (k - 1.5) * 8 * s, ch = (14 + ((k * 7 + d.v * 30) % 22)) * s; g.fillStyle = rgba([c[0] * .5 + 40, c[1] * .5 + 30, c[2] * .6 + 40], .92); g.beginPath(); g.moveTo(cx - 5 * s, y); g.lineTo(cx - 3 * s, y - ch); g.lineTo(cx + 1 * s, y - ch - 7 * s); g.lineTo(cx + 5 * s, y - ch + 2 * s); g.lineTo(cx + 6 * s, y); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(cx - 3 * s, y - ch); g.lineTo(cx + 1 * s, y - ch - 7 * s); g.lineTo(cx, y - 2 * s); g.closePath(); g.fill(); } glowDot(x, y - 14 * s, 26 * s, c, .35 + p * .3); break;
        case 'orb': var oy = y - 20 * s - M.sin(t * 1.4 + d.v * 9) * 6; glowDot(x, oy, 22 * s, c, .5 + p * .3); g.fillStyle = rgba([255, 255, 255], .9); g.beginPath(); g.arc(x, oy, 3.2 * s, 0, 6.283); g.fill(); g.fillStyle = rgba(c, .95); g.beginPath(); g.arc(x, oy, 6 * s, 0, 6.283); g.globalAlpha = .55; g.fill(); g.globalAlpha = 1; break;
        case 'bloom': g.strokeStyle = rgba([c[0] * .5, c[1] * .6, c[2] * .5], .9); g.lineWidth = 1.6 * s; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sw, y - 8 * s, x + sw * 1.4, y - 16 * s); g.stroke(); for (var f = 0; f < 5; f++) { var fa = f * 1.2566 + t * .2; g.fillStyle = rgba(c, .85); g.beginPath(); g.ellipse(x + sw * 1.4 + M.cos(fa) * 4 * s, y - 16 * s + M.sin(fa) * 2.4 * s, 3.4 * s, 2 * s, fa, 0, 6.283); g.fill(); } g.fillStyle = '#fff4d0'; g.beginPath(); g.arc(x + sw * 1.4, y - 16 * s, 1.6 * s, 0, 6.283); g.fill(); break;
        case 'wreck': g.fillStyle = '#3c4658'; g.beginPath(); g.moveTo(x - 16 * s, y); g.lineTo(x - 10 * s, y - 12 * s); g.lineTo(x + 8 * s, y - 9 * s); g.lineTo(x + 18 * s, y); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,255,255,.25)'; g.stroke(); g.fillStyle = rgba([255, 120, 80], .5 + .5 * M.sin(t * 5 + d.v * 9)); g.fillRect(x - 2, y - 8 * s, 3, 3); break;
      }
    }
    function drawSite(s, t) {
      var d = M.hypot(s.x - me.x, s.y - me.y), pinged = now - s.ping < 12, vis = s.found || d < 190 || pinged; if (!vis) return; var col = REG[s.reg].c, ac = REG[s.reg].ac, x = s.x, y = s.y, p = .5 + .5 * M.sin(t * 2.2 + s.ph), float = M.sin(t * 1.6 + s.ph) * 4;
      g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x, y + 4, 20, 8, 0, 0, 6.283); g.fill();
      g.strokeStyle = rgba(col, s.found ? .9 : .55 + p * .3); g.lineWidth = 2; g.beginPath(); g.ellipse(x, y + 2, 18, 7, 0, 0, 6.283); g.stroke(); g.beginPath(); g.ellipse(x, y + 2, 28 + p * 4, 11 + p * 2, 0, 0, 6.283); g.globalAlpha = .4; g.stroke(); g.globalAlpha = 1;
      var gr = g.createLinearGradient(x, y, x, y - 70); gr.addColorStop(0, rgba(col, s.found ? .28 : .36)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.beginPath(); g.moveTo(x - 17, y + 2); g.lineTo(x - 9, y - 70); g.lineTo(x + 9, y - 70); g.lineTo(x + 17, y + 2); g.closePath(); g.fill();
      var iy = y - 38 + float; glowDot(x, iy, 30, col, s.found ? .45 : .6 + p * .3); g.save(); g.globalAlpha = s.found ? 1 : .6 + p * .4; var im = s.icon; if (im.complete && im.naturalWidth) g.drawImage(im, x - 15, iy - 15, 30, 30); g.restore();
      if (s.found) { g.fillStyle = '#0b1220'; g.beginPath(); g.arc(x + 15, iy - 14, 8, 0, 6.283); g.fill(); g.strokeStyle = ac; g.lineWidth = 1.5; g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 11.5, iy - 14); g.lineTo(x + 14.5, iy - 11); g.lineTo(x + 19, iy - 17); g.stroke(); }
      if (analyzing && analyzing.s === s) { var f = clamp(analyzing.t / 1.5, 0, 1); g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 5; g.beginPath(); g.arc(x, iy, 26, 0, 6.283); g.stroke(); g.strokeStyle = ac; g.beginPath(); g.arc(x, iy, 26, -M.PI / 2, -M.PI / 2 + 6.283 * f); g.stroke(); g.fillStyle = '#fff'; g.font = '600 12px ui-monospace,Menlo,monospace'; g.textAlign = 'center'; g.fillText('ANALYSING', x, y + 26); }
      else if (!s.found && d < 62 && !cardOpen) { g.fillStyle = 'rgba(8,12,22,.85)'; g.strokeStyle = ac; var lab = 'Press E to investigate'; g.font = '600 13px ui-sans-serif,system-ui'; var w = g.measureText(lab).width + 20; g.beginPath(); g.rect(x - w / 2, y + 16, w, 24); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(lab, x, y + 33); }
    }
    function drawVent(v, t) { var p = .5 + .5 * M.sin(t * 2 + v.ph); g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(v.x, v.y + 3, 22, 8, 0, 0, 6.283); g.fill(); g.fillStyle = '#16304a'; g.beginPath(); g.ellipse(v.x, v.y, 18, 7, 0, 0, 6.283); g.fill(); g.strokeStyle = '#6fd4ff'; g.lineWidth = 2; g.stroke(); var gr = g.createLinearGradient(v.x, v.y, v.x, v.y - 80); gr.addColorStop(0, 'rgba(120,220,255,.5)'); gr.addColorStop(1, 'rgba(120,220,255,0)'); g.fillStyle = gr; g.fillRect(v.x - 10, v.y - 80, 20, 80); for (var i = 0; i < 4; i++) { var ph = ((t * .5 + i / 4 + v.ph) % 1); g.fillStyle = 'rgba(200,240,255,' + (.7 - ph * .7) + ')'; g.beginPath(); g.arc(v.x + M.sin(ph * 9 + i) * 5, v.y - ph * 70, 2.4 - ph, 0, 6.283); g.fill(); } glowDot(v.x, v.y - 10, 40, [110, 210, 255], .3 + p * .25); g.fillStyle = '#bfeaff'; g.font = '600 11px ui-monospace,Menlo,monospace'; g.textAlign = 'center'; g.fillText('O2', v.x, v.y + 24); }
    function drawCamp(t) {
      var x = CAMP.x, y = CAMP.y; g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x, y + 8, 120, 46, 0, 0, 6.283); g.fill(); g.fillStyle = '#1d2a3e'; g.beginPath(); g.ellipse(x, y + 4, 108, 40, 0, 0, 6.283); g.fill(); g.strokeStyle = '#6fa8ff'; g.lineWidth = 2; g.stroke(); for (var i = 0; i < 12; i++) { var a = i / 12 * 6.283; g.fillStyle = (M.floor(t * 3) + i) % 3 ? 'rgba(111,168,255,.35)' : '#9fe4ff'; g.beginPath(); g.arc(x + M.cos(a) * 100, y + 4 + M.sin(a) * 36, 3, 0, 6.283); g.fill(); }
      var gr = g.createLinearGradient(x - 40, y - 60, x + 40, y); gr.addColorStop(0, '#e9eef8'); gr.addColorStop(1, '#8a98b4'); g.fillStyle = gr; g.beginPath(); g.moveTo(x - 38, y + 2); g.quadraticCurveTo(x - 40, y - 52, x, y - 78); g.quadraticCurveTo(x + 40, y - 52, x + 38, y + 2); g.closePath(); g.fill(); g.fillStyle = '#12304f'; g.beginPath(); g.ellipse(x, y - 42, 14, 18, 0, 0, 6.283); g.fill(); g.fillStyle = 'rgba(140,230,255,.5)'; g.beginPath(); g.ellipse(x - 4, y - 48, 5, 8, -.3, 0, 6.283); g.fill(); g.strokeStyle = '#a9b6cf'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 24, y - 60); g.lineTo(x + 34, y - 100); g.stroke(); g.fillStyle = M.floor(t * 2) % 2 ? '#ff6a5a' : '#6a2a2a'; g.beginPath(); g.arc(x + 34, y - 101, 3, 0, 6.283); g.fill();
      g.fillStyle = '#cfe4ff'; g.font = '600 12px ui-monospace,Menlo,monospace'; g.textAlign = 'center'; g.fillText('BASE: OXYGEN REFILL', x, y + 66); glowDot(x, y, 150, [90, 150, 255], .22);
    }
    function drawPlayer(t) {
      var x = me.x, y = me.y, sp = M.hypot(me.vx, me.vy), mv = sp > 12, st = mv ? M.sin(me.step) : 0, bob = mv ? M.abs(st) * 2.6 : M.sin(t * 2) * .5, fx = M.cos(me.face) >= 0 ? 1 : -1;
      g.save(); g.translate(x, y); g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(0, 3, 12, 4.5, 0, 0, 6.283); g.fill(); g.scale(fx, 1);
      g.strokeStyle = '#2b3445'; g.lineWidth = 4.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-3, -12 - bob); g.lineTo(-3 - st * 5, 2); g.moveTo(3, -12 - bob); g.lineTo(3 + st * 5, 2); g.stroke();
      g.fillStyle = '#ff8a3d'; g.beginPath(); g.roundRect ? g.roundRect(-8, -33 - bob, 16, 23, 6) : g.rect(-8, -33 - bob, 16, 23); g.fill(); g.fillStyle = '#e7edf7'; g.beginPath(); g.roundRect ? g.roundRect(-14, -31 - bob, 8, 17, 3) : g.rect(-14, -31 - bob, 8, 17); g.fill(); g.fillStyle = M.floor(t * 2.5) % 2 ? '#7dffb0' : '#1c4a34'; g.beginPath(); g.arc(-10, -28 - bob, 1.6, 0, 6.283); g.fill();
      g.fillStyle = '#e7edf7'; g.beginPath(); g.arc(1, -41 - bob, 8, 0, 6.283); g.fill(); g.fillStyle = '#0c2238'; g.beginPath(); g.ellipse(4, -41 - bob, 5.4, 4.6, 0, 0, 6.283); g.fill(); g.fillStyle = 'rgba(140,230,255,.7)'; g.beginPath(); g.ellipse(3, -43 - bob, 2.6, 1.6, -.4, 0, 6.283); g.fill(); g.strokeStyle = '#9fb0c8'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(9, -22 - bob); g.lineTo(13 + st * 3, 4); g.stroke(); g.restore();
      /* the drone */
      var da = t * 1.5, dx = x + M.cos(da) * 38, dy = y - 46 + M.sin(da * 1.3) * 10 - 4 * M.sin(t * 3); g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(dx, y + 2, 7, 2.6, 0, 0, 6.283); g.fill(); glowDot(dx, dy, 18, [120, 220, 255], .5); g.fillStyle = '#dfe8f5'; g.beginPath(); g.ellipse(dx, dy, 7, 5, 0, 0, 6.283); g.fill(); g.fillStyle = '#26d0ff'; g.beginPath(); g.arc(dx + 2, dy, 2.2, 0, 6.283); g.fill(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(dx - 10, dy - 5 + M.sin(t * 40) * 1.2); g.lineTo(dx + 10, dy - 5 - M.sin(t * 40) * 1.2); g.stroke();
    }
    function drawCloud(c, t) { for (var i = 0; i < 14; i++) { var a = i / 14 * 6.283 + t * .25 * (i % 2 ? 1 : -1), rr = c.r * (.25 + .6 * hash2(i, 3, 9)), px = c.x + M.cos(a) * rr, py = c.y + M.sin(a) * rr * .8, sz = c.r * (.42 + .2 * M.sin(t * .8 + i)); var gr = g.createRadialGradient(px, py, 0, px, py, sz); gr.addColorStop(0, i % 3 ? 'rgba(150,255,120,.20)' : 'rgba(200,110,255,.2)'); gr.addColorStop(1, 'rgba(120,255,120,0)'); g.fillStyle = gr; g.beginPath(); g.arc(px, py, sz, 0, 6.283); g.fill(); } g.strokeStyle = 'rgba(160,255,140,.25)'; g.setLineDash([6, 10]); g.lineWidth = 1.5; g.beginPath(); g.arc(c.x, c.y, c.r * .92, 0, 6.283); g.stroke(); g.setLineDash([]); }

    /* ------------------------------------------------ frame */
    function frame(nowMs) {
      requestAnimationFrame(frame); var dt = M.min(.05, (nowMs - last) / 1000); last = nowMs; var t = (nowMs - t0) / 1000; now = t; if (!visible || !ready) return;
      if (started && !cardOpen && !dlg.open) step(dt, t); else if (started) { scanRing && (scanRing.t += dt); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = '#05070f'; g.fillRect(0, 0, W, H); var sx = shake > 0 && !RM ? (M.random() - .5) * shake * 20 : 0, sy = shake > 0 && !RM ? (M.random() - .5) * shake * 20 : 0; shake = M.max(0, shake - dt);
      var ox = W / 2 - cam.x + sx, oy = H / 2 - cam.y + sy; g.save(); g.translate(ox, oy);
      var vx0 = M.max(0, cam.x - W / 2), vy0 = M.max(0, cam.y - H / 2), vw = M.min(WW - vx0, W), vh = M.min(WH - vy0, H); g.drawImage(base, vx0 / 2, vy0 / 2, vw / 2, vh / 2, vx0, vy0, vw, vh);
      /* region names carved into the ground, and the trails from base */
      g.textAlign = 'center'; REG.forEach(function (r) { g.globalAlpha = .22; g.fillStyle = r.ac; g.font = '600 ' + (r.r > 420 ? 44 : 36) + 'px ui-sans-serif,system-ui'; g.fillText(r.n.toUpperCase(), r.x, r.y - r.r * .66); }); g.globalAlpha = 1;
      g.strokeStyle = 'rgba(160,200,255,.2)'; g.lineWidth = 3; g.setLineDash([3, 14]); g.lineCap = 'round'; REG.forEach(function (r) { g.beginPath(); g.moveTo(CAMP.x, CAMP.y); g.quadraticCurveTo((CAMP.x + r.x) / 2 + (r.y - CAMP.y) * .12, (CAMP.y + r.y) / 2 - (r.x - CAMP.x) * .12, r.x, r.y); g.stroke(); }); g.setLineDash([]);
      puffs.forEach(function (p) { p.t += dt; g.fillStyle = 'rgba(210,225,255,' + M.max(0, .22 - p.t * .45) + ')'; g.beginPath(); g.arc(p.x, p.y, 3 + p.t * 9, 0, 6.283); g.fill(); }); puffs = puffs.filter(function (p) { return p.t < .5; });
      /* scenery, anomalies and the player sorted by depth */
      var drawn = [], x0 = cam.x - W / 2 - 80, x1 = cam.x + W / 2 + 80, y0 = cam.y - H / 2 - 120, y1 = cam.y + H / 2 + 60, i;
      for (i = 0; i < deco.length; i++) { var d = deco[i]; if (d.x < x0 || d.x > x1 || d.y < y0 || d.y > y1) continue; drawn.push({ y: d.y, f: 0, o: d }); }
      sites.forEach(function (s) { if (s.x > x0 && s.x < x1 && s.y > y0 && s.y < y1) drawn.push({ y: s.y, f: 1, o: s }); }); VENTS.forEach(function (v) { if (v.x > x0 && v.x < x1 && v.y > y0 && v.y < y1) drawn.push({ y: v.y, f: 2, o: v }); }); drawn.push({ y: CAMP.y, f: 3 }); drawn.push({ y: me.y, f: 4 }); drawn.sort(function (a, b) { return a.y - b.y; });
      drawn.forEach(function (e) { if (e.f === 0) drawDeco(e.o, t); else if (e.f === 1) drawSite(e.o, t); else if (e.f === 2) drawVent(e.o, t); else if (e.f === 3) drawCamp(t); else drawPlayer(t); });
      CLOUDS.forEach(function (c) { if (c.x > x0 - c.r && c.x < x1 + c.r && c.y > y0 - c.r && c.y < y1 + c.r) drawCloud(c, t); });
      rings.forEach(function (r) { r.t += dt; g.strokeStyle = r.c; g.globalAlpha = M.max(0, 1 - r.t * (r.small ? 2.4 : 1.2)); g.lineWidth = r.small ? 2 : 3; g.beginPath(); g.ellipse(r.x, r.y, r.t * (r.small ? 40 : 130), r.t * (r.small ? 16 : 52), 0, 0, 6.283); g.stroke(); }); g.globalAlpha = 1; rings = rings.filter(function (r) { return r.t < .9; });
      sparks.forEach(function (p) { p.life -= dt * 1.1; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 460 * dt; g.globalAlpha = M.max(0, p.life); g.fillStyle = p.c; g.fillRect(p.x, p.y, 3.4, 3.4); }); g.globalAlpha = 1; sparks = sparks.filter(function (p) { return p.life > 0; });
      /* the scanner pulse, ring and shimmer */
      if (scanRing) { var f = scanRing.t / 1.3, rr = 560 * (1 - M.pow(1 - f, 2.2)); g.strokeStyle = 'rgba(120,230,255,' + (1 - f) * .9 + ')'; g.lineWidth = 3; g.beginPath(); g.ellipse(scanRing.x, scanRing.y, rr, rr * .62, 0, 0, 6.283); g.stroke(); g.strokeStyle = 'rgba(120,230,255,' + (1 - f) * .3 + ')'; g.lineWidth = 12; g.stroke(); }
      g.restore();

      /* darkness with light cut out of it: the player's torch, the explored memory, and every glowing thing */
      var lw = lightC.width, lh = lightC.height; lg.globalCompositeOperation = 'source-over'; lg.fillStyle = 'rgba(2,4,12,.9)'; lg.fillRect(0, 0, lw, lh); lg.globalCompositeOperation = 'destination-out';
      lg.globalAlpha = .5; lg.drawImage(expl, (ox) / 2, (oy) / 2, WW / 2, WH / 2); lg.globalAlpha = 1;
      var px = (me.x + ox) / 2, py = (me.y - 16 + oy) / 2; var lgr = lg.createRadialGradient(px, py, 8, px, py, 190); lgr.addColorStop(0, 'rgba(0,0,0,1)'); lgr.addColorStop(.6, 'rgba(0,0,0,.7)'); lgr.addColorStop(1, 'rgba(0,0,0,0)'); lg.fillStyle = lgr; lg.beginPath(); lg.arc(px, py, 190, 0, 6.283); lg.fill();
      var fa = me.face, cr = lg.createRadialGradient(px, py, 10, px + M.cos(fa) * 150, py + M.sin(fa) * 150, 180); cr.addColorStop(0, 'rgba(0,0,0,.95)'); cr.addColorStop(1, 'rgba(0,0,0,0)'); lg.fillStyle = cr; lg.beginPath(); lg.moveTo(px, py); lg.arc(px, py, 250, fa - .46, fa + .46); lg.closePath(); lg.fill();
      for (i = 0; i < glows.length; i++) { var gl = glows[i]; if (gl.x < x0 - 60 || gl.x > x1 + 60 || gl.y < y0 - 60 || gl.y > y1 + 60) continue; var gx = (gl.x + ox) / 2, gy = (gl.y - 18 + oy) / 2, gR = gl.glow / 2 + 14; var g2 = lg.createRadialGradient(gx, gy, 0, gx, gy, gR); g2.addColorStop(0, 'rgba(0,0,0,.78)'); g2.addColorStop(1, 'rgba(0,0,0,0)'); lg.fillStyle = g2; lg.beginPath(); lg.arc(gx, gy, gR, 0, 6.283); lg.fill(); }
      sites.forEach(function (s) { if (s.found || now - s.ping < 12 || M.hypot(s.x - me.x, s.y - me.y) < 190) { var gx = (s.x + ox) / 2, gy = (s.y - 30 + oy) / 2, g3 = lg.createRadialGradient(gx, gy, 0, gx, gy, 60); g3.addColorStop(0, 'rgba(0,0,0,.95)'); g3.addColorStop(1, 'rgba(0,0,0,0)'); lg.fillStyle = g3; lg.beginPath(); lg.arc(gx, gy, 60, 0, 6.283); lg.fill(); } });
      var cgx = (CAMP.x + ox) / 2, cgy = (CAMP.y - 20 + oy) / 2, cg = lg.createRadialGradient(cgx, cgy, 0, cgx, cgy, 150); cg.addColorStop(0, 'rgba(0,0,0,.95)'); cg.addColorStop(1, 'rgba(0,0,0,0)'); lg.fillStyle = cg; lg.beginPath(); lg.arc(cgx, cgy, 150, 0, 6.283); lg.fill();
      g.globalAlpha = 1; g.imageSmoothingEnabled = true; g.drawImage(lightC, 0, 0, W, H);

      /* colour bloom on top of the dark, so lit things really glow */
      g.save(); g.translate(ox, oy); g.globalCompositeOperation = 'lighter'; for (i = 0; i < glows.length; i++) { var b = glows[i]; if (b.x < x0 || b.x > x1 || b.y < y0 || b.y > y1) continue; var bp = .55 + .45 * M.sin(t * 1.6 + b.v * 9); glowDot(b.x, b.y - 18, b.glow * .8, b.c, .13 * bp); }
      sites.forEach(function (s) { if (s.found || now - s.ping < 12 || M.hypot(s.x - me.x, s.y - me.y) < 190) glowDot(s.x, s.y - 34, 54, REG[s.reg].c, s.found ? .1 : .2); });
      g.globalCompositeOperation = 'source-over';
      /* markers for scanned signals, and the arrow to the nearest */
      sites.forEach(function (s) { if (s.found) return; var age = now - s.ping; if (age < 12 && M.hypot(s.x - me.x, s.y - me.y) >= 190) { var a = clamp(1 - age / 12, 0, 1), mp = .5 + .5 * M.sin(t * 4 + s.ph); g.strokeStyle = rgba(REG[s.reg].c, a); g.lineWidth = 2; g.beginPath(); g.arc(s.x, s.y - 20, 14 + mp * 6, 0, 6.283); g.stroke(); g.fillStyle = rgba(REG[s.reg].c, a); g.font = '700 16px ui-sans-serif,system-ui'; g.textAlign = 'center'; g.fillText('?', s.x, s.y - 14); } });
      if (hintTarget && now < hintUntil && !hintTarget.found) { var ang = M.atan2(hintTarget.y - me.y, hintTarget.x - me.x), dist = M.hypot(hintTarget.x - me.x, hintTarget.y - me.y); if (dist > 90) { var ax2 = me.x + M.cos(ang) * 78, ay2 = me.y - 20 + M.sin(ang) * 58; g.save(); g.translate(ax2, ay2); g.rotate(ang); g.fillStyle = 'rgba(120,230,255,.95)'; g.beginPath(); g.moveTo(14, 0); g.lineTo(-6, -9); g.lineTo(-2, 0); g.lineTo(-6, 9); g.closePath(); g.fill(); g.restore(); g.fillStyle = 'rgba(190,240,255,.95)'; g.font = '600 12px ui-monospace,Menlo,monospace'; g.textAlign = 'center'; g.fillText(M.round(dist / 10) + ' m', ax2, ay2 - 16); } }
      g.restore();
      /* drifting dust and spores in front of the camera */
      g.fillStyle = 'rgba(190,220,255,.5)'; for (i = 0; i < parts.length; i++) { var pp = parts[i], px2 = ((pp.x * W - cam.x * pp.z * .25 + t * 6 * pp.z) % W + W) % W, py2 = ((pp.y * H - cam.y * pp.z * .25 - t * 4 * pp.z) % H + H) % H; g.globalAlpha = .12 + .3 * pp.z * (.5 + .5 * M.sin(t + pp.p)); g.fillRect(px2, py2, 1.6 * pp.z + .6, 1.6 * pp.z + .6); } g.globalAlpha = 1;
      if (fade > 0) { fade -= dt * .7; g.fillStyle = 'rgba(2,4,12,' + clamp(fade, 0, 1) + ')'; g.fillRect(0, 0, W, H); }
      if (started && now - (Game._hudT || 0) > .15) { Game._hudT = now; paintHud(); paintHint(); minimap(); }
      if (!started) minimap();
    }
    function paintHint() { var s = nearestSite(); Game._bi.classList.toggle('ready', !!s); var tx = !started ? '' : s ? 'Fragment in range. Hold still to analyse, or press E.' : hintTarget && now < hintUntil && !hintTarget.found ? 'Signal: ' + M.round(M.hypot(hintTarget.x - me.x, hintTarget.y - me.y) / 10) + ' m' : 'Press Space to scan'; if (hHint.textContent !== tx) hHint.textContent = tx; }
    function minimap() {
      var w = mini.width, h = mini.height; mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, w, h); if (!ready) return; mg.fillStyle = '#04060c'; mg.fillRect(0, 0, w, h); mg.globalAlpha = .75; mg.drawImage(base, 0, 0, w, h); mg.globalAlpha = 1; mg.globalCompositeOperation = 'destination-in'; mg.drawImage(expl, 0, 0, w, h); mg.globalCompositeOperation = 'destination-over'; mg.fillStyle = '#04060c'; mg.fillRect(0, 0, w, h); mg.globalCompositeOperation = 'source-over';
      sites.forEach(function (s) { var x = s.x / WW * w, y = s.y / WH * h; if (s.found) { mg.fillStyle = REG[s.reg].ac; mg.beginPath(); mg.arc(x, y, 3 * dpr, 0, 6.283); mg.fill(); } else if (now - s.ping < 12) { mg.strokeStyle = '#7fe6ff'; mg.lineWidth = 1.2 * dpr; mg.beginPath(); mg.arc(x, y, 3.4 * dpr, 0, 6.283); mg.stroke(); } });
      mg.fillStyle = '#6fa8ff'; mg.fillRect(CAMP.x / WW * w - 2 * dpr, CAMP.y / WH * h - 2 * dpr, 4 * dpr, 4 * dpr); mg.fillStyle = '#fff'; mg.beginPath(); mg.arc(me.x / WW * w, me.y / WH * h, 3.2 * dpr, 0, 6.283); mg.fill(); mg.strokeStyle = 'rgba(255,255,255,.6)'; mg.lineWidth = 1 * dpr; mg.strokeRect((cam.x - W / 2) / WW * w, (cam.y - H / 2) / WH * h, W / WW * w, H / WH * h);
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(box);
    load.appendChild(el('b', '', 'Generating Kepler-23b')); var lb = el('i'); lb.appendChild(el('u')); load.appendChild(lb); load.appendChild(el('span', '', 'Terrain, weather and 32 hidden signals…'));
    genTerrain(function () { load.classList.add('off'); setTimeout(function () { load.hidden = true; }, 500); paintHud(); explore(me.x, me.y, 280); });
    requestAnimationFrame(function (n) { last = n; frame(n); });
    Game.state = function () { return { found: found, total: sites.length, x: me.x, y: me.y, o2: me.o2, tows: tows, started: started, ready: ready, card: cardOpen }; };
    Game.cheat = function (n) { sites.slice(0, n).forEach(function (s) { if (!s.found) { s.found = true; found++; } }); paintHud(); };
    Game.warp = function (i) { var s = sites[i]; me.x = s.x - 20; me.y = s.y + 36; cam.x = me.x; cam.y = me.y; explore(me.x, me.y, 280); };
    Game.places = sites; Game.hurt = function (v) { me.o2 = v; };
    return box;
  };
})();
