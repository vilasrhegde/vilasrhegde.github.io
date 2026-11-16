/* The career journey as three different scroll-driven pieces. All are pinned, eased, continuous and reversible.
   ascent  : a climber goes up one long mountain; the camera follows; flags are planted on the way
   graph   : a git-style branch graph that is drawn as you scroll; commits light up, the branch grows
   tower   : a tower that builds floor by floor; each floor is a role and the view from it changes
   Pick with ?journey=ascent|graph|tower or in the Style panel. */
(function () {
  'use strict';
  var D = window.D, doc = document, NS = 'http://www.w3.org/2000/svg', RM = matchMedia('(prefers-reduced-motion: reduce)').matches, M = Math, J = window.Journey = {};
  function el(t, c, x) { var e = doc.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function sv(t, a, p) { var e = doc.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - M.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var STEPS = function () { return D.career.filter(function (c) { return c.w !== 'Saturn'; }); };
  var CAPS = ['It started with one boring task.', 'Four years of algorithms, then out into the world.', 'First job: learning what production feels like.', 'A new company, and a team of twenty to lead.', 'Now the architecture decisions are mine.'];

  /* shared shell: a tall section with a pinned stage and a progress value 0..1 */
  function shell(kind, title) {
    var steps = STEPS(), n = steps.length, sec = el('section', 'jny jny-' + kind), stage = el('div', 'jstage'); sec.id = 'journey'; sec.setAttribute('aria-label', 'Career journey');
    sec.style.setProperty('--n', n); var h = el('div', 'jhead'); h.appendChild(el('h2', '', title)); h.appendChild(el('p', 'mute', 'Scroll to climb. The animation follows your scroll exactly, forwards and backwards.')); stage.appendChild(h);
    var card = el('div', 'jcard'); card.setAttribute('aria-live', 'polite'); var time = el('time'), hh = el('h3'), pp = el('p'), hl = el('div', 'hl'); card.appendChild(time); card.appendChild(hh); card.appendChild(pp); card.appendChild(hl); stage.appendChild(card);
    var prog = el('div', 'jprog'); prog.setAttribute('role', 'tablist'); prog.setAttribute('aria-label', 'Chapters'); var dots = steps.map(function (s, i) { var b = el('button'); b.type = 'button'; b.setAttribute('aria-label', s.y + ': ' + s.h); b.addEventListener('click', function () { go(i); }); b.appendChild(el('span', '', s.y)); prog.appendChild(b); return b; }); stage.appendChild(prog);
    var skip = el('a', 'skipfilm', 'Skip the journey'); skip.href = '#after-journey'; stage.appendChild(skip); sec.appendChild(stage); var after = el('span'); after.id = 'after-journey'; sec.appendChild(after);
    var cur = -1;
    function show(i) { if (i === cur) return; cur = i; var c = steps[i]; time.textContent = c.y; hh.textContent = c.h; pp.textContent = c.p; while (hl.firstChild) hl.removeChild(hl.firstChild); (c.hl || []).slice(0, 3).forEach(function (x) { hl.appendChild(el('span', '', x)); }); dots.forEach(function (d, j) { d.setAttribute('aria-current', j === i ? 'true' : 'false'); d.classList.toggle('done', j <= i); }); card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap'); }
    function go(i) { var top = sec.getBoundingClientRect().top + scrollY, per = (sec.offsetHeight - innerHeight) / n; window.scrollTo({ top: top + per * (i + .5), behavior: RM ? 'auto' : 'smooth' }); }
    var p = 0, tp = 0, raf = 0, on = false;
    function target() { var r = sec.getBoundingClientRect(), span = sec.offsetHeight - innerHeight; return clamp(-r.top / span, 0, 1); }
    function loop() { raf = 0; p += (tp - p) * .12; if (M.abs(tp - p) < .0004) p = tp; sec._draw(p); show(clamp(M.floor(p * n * .999), 0, n - 1)); if (p !== tp) raf = requestAnimationFrame(loop); }
    function onScroll() { tp = target(); if (RM) { p = tp; sec._draw(p); show(clamp(M.floor(p * n * .999), 0, n - 1)); return; } if (!raf) raf = requestAnimationFrame(loop); }
    sec._start = function () { addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll(); };
    sec._stage = stage; sec._n = n; sec._steps = steps; return sec;
  }

  /* ------------------------------------------------ 1. ASCENT: one long mountain, a climber, planted flags, weather */
  J.ascent = function () {
    var sec = shell('ascent', 'The climb'), stage = sec._stage, n = sec._n, steps = sec._steps, W = 1200, H = 760;
    var svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'jsvg', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' }); stage.insertBefore(svg, stage.firstChild);
    var defs = sv('defs', {}, svg); var gr = sv('linearGradient', { id: 'sk', x1: 0, y1: 0, x2: 0, y2: 1 }, defs); sv('stop', { offset: 0, 'stop-color': 'var(--c4)', 'stop-opacity': .35 }, gr); sv('stop', { offset: 1, 'stop-color': 'var(--bg)', 'stop-opacity': 0 }, gr);
    var world = sv('g', {}, svg); sv('rect', { x: -400, y: -1400, width: 2000, height: 2600, fill: 'url(#sk)' }, world);
    var stars = sv('g', { 'class': 'jstars' }, world); for (var i = 0; i < 70; i++) sv('circle', { cx: (i * 173) % 1500 - 150, cy: -1100 + (i * 97) % 900, r: i % 5 ? 1.2 : 2.2, fill: 'var(--ink)', opacity: .7 }, stars);
    var sun = sv('circle', { cx: 960, cy: 120, r: 54, fill: 'var(--c1)', opacity: .9 }, world);
    /* one tall mountain path: left-right switchbacks climbing up */
    var pts = [[120, 640]]; for (i = 0; i < n; i++) pts.push([i % 2 ? 260 + (i * 37) % 80 : 880 - (i * 41) % 90, 640 - (i + 1) * 300 / 1.0]);
    function peaks(seed, base, amp, col, op, snow) { var d = 'M-500 1100', x, i2 = 0; for (x = -500; x <= 1700; x += 70) { var hgt = base - (M.sin(x * .004 + seed) * .5 + M.sin(x * .011 + seed * 2.3) * .35 + M.sin(x * .027 + seed * 3.1) * .15 + 1) * amp; d += ' L' + x + ' ' + hgt.toFixed(0); i2++; } d += ' L1700 1100Z'; sv('path', { d: d, fill: col, opacity: op }, world); }
    [[1, 380, 230, 'var(--c4)', .22], [2.2, 470, 200, 'var(--c2)', .26], [3.6, 560, 170, 'var(--s2)', .8]].forEach(function (l, q) { var gg = sv('g', { 'class': 'jpar', 'data-k': (q + 1) * .14, transform: 'translate(0 ' + (-q * 120 - 260) + ')' }, world); var d2 = 'M-500 1100'; for (var xx = -500; xx <= 1700; xx += 60) { var hh = l[1] - (M.sin(xx * .004 + l[0]) * .5 + M.sin(xx * .011 + l[0] * 2.3) * .35 + M.sin(xx * .027 + l[0] * 3.1) * .15 + 1) * l[2]; d2 += ' L' + xx + ' ' + hh.toFixed(0); } d2 += ' L1700 1100Z'; sv('path', { d: d2, fill: l[3], opacity: l[4] }, gg); });
    var mtn = sv('path', { d: 'M-200 800 L' + pts[0][0] + ' 640', fill: 'var(--s1)' }, world); var d = 'M-300 800 L120 640'; for (i = 1; i < pts.length; i++) { d += ' L' + pts[i][0] + ' ' + pts[i][1]; } d += ' L' + (pts[pts.length - 1][0] + 40) + ' -1400 L1500 -1400 L1500 800Z'; mtn.setAttribute('d', 'M-300 800 L-300 -1400 L' + (pts[pts.length - 1][0] - 20) + ' -1400 L' + pts[pts.length - 1][0] + ' ' + pts[pts.length - 1][1] + ' ' + pts.slice(0, -1).reverse().map(function (p) { return 'L' + p[0] + ' ' + p[1]; }).join(' ') + ' L-300 800Z'); mtn.setAttribute('fill', 'color-mix(in srgb,var(--c2) 38%,var(--s1))'); for (i = 0; i < 26; i++) { var pp = pts[M.min(pts.length - 1, i % pts.length)], tx2 = pp[0] + (i % 2 ? 90 : -90) + (i * 17) % 70, ty2 = pp[1] + 40 + (i * 29) % 120; sv('path', { d: 'M' + tx2 + ' ' + ty2 + ' l12 -42 l12 42z M' + tx2 + ' ' + (ty2 - 22) + ' l10 -34 l10 34z', fill: 'color-mix(in srgb,var(--c2) 70%,#000)', opacity: .8 }, world); }
    var ridge = sv('path', { d: 'M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L'), fill: 'none', stroke: 'var(--line)', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '2 12' }, world);
    var walked = sv('path', { d: 'M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L'), fill: 'none', stroke: 'var(--acc)', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, world); var LEN = walked.getTotalLength(); walked.style.strokeDasharray = LEN; walked.style.strokeDashoffset = LEN;
    var flags = pts.slice(1).map(function (p, i) { var g = sv('g', { transform: 'translate(' + p[0] + ' ' + p[1] + ')', 'class': 'jflag' }, world); sv('line', { x1: 0, y1: 0, x2: 0, y2: -64, stroke: 'var(--ink)', 'stroke-width': 3 }, g); var pen = sv('path', { d: 'M0 -64 H' + (p[0] > 600 ? -120 : 120) + ' L' + (p[0] > 600 ? -108 : 108) + ' -48 L' + (p[0] > 600 ? -120 : 120) + ' -32 H0Z', fill: 'var(--acc)' }, g); var t = sv('text', { x: p[0] > 600 ? -12 : 12, y: -44, 'text-anchor': p[0] > 600 ? 'end' : 'start', fill: 'var(--accInk)', 'font-size': 18, 'font-weight': 700, 'font-family': 'ui-sans-serif,system-ui' }, g); t.textContent = steps[i].y.split(' to')[0]; return g; });
    var me = sv('g', { 'class': 'jme' }, world); sv('circle', { cx: 0, cy: -34, r: 9, fill: 'var(--ink)' }, me); sv('path', { d: 'M0 -24 L0 -2 M0 -18 L-12 -6 M0 -18 L14 -22 M0 -2 L-9 18 M0 -2 L9 18 M14 -22 L16 14', stroke: 'var(--ink)', 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none', 'class': 'legs' }, me); sv('path', { d: 'M-8 -24 L-12 -2 L8 -2 L8 -24Z', fill: 'var(--c3)' }, me);
    var clouds = [0, 1, 2, 3, 4, 5].map(function (i) { var g = sv('g', { 'class': 'jcloud', opacity: .5 }, world); sv('ellipse', { cx: 0, cy: 0, rx: 80, ry: 22, fill: 'var(--ink)', opacity: .16 }, g); sv('ellipse', { cx: 36, cy: -12, rx: 50, ry: 18, fill: 'var(--ink)', opacity: .16 }, g); g.setAttribute('transform', 'translate(' + (i * 230 - 100) + ' ' + (-i * 240 + 500) + ')'); return g; });
    sec._draw = function (p) {
      var segs = n, f = p * segs, seg = clamp(M.floor(f), 0, segs - 1), local = f - seg, e = ease(clamp(local * 1.15, 0, 1)); var a = pts[seg], b = pts[seg + 1]; var x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e);
      walked.style.strokeDashoffset = LEN * (1 - (seg + e) / segs); me.setAttribute('transform', 'translate(' + x + ' ' + y + ')'); me.classList.toggle('walk', local > .02 && local < .9);
      var camY = clamp(y - 360, -1400, 0) * -1, camX = (x - 600) * -.12; world.setAttribute('transform', 'translate(' + (camX + (innerWidth > 900 ? 240 : 0)) + ' ' + camY + ')');
      flags.forEach(function (g, i) { var up = p * segs > i + .85 ? 1 : clamp((p * segs - (i + .5)) / .35, 0, 1); g.style.opacity = i <= seg - 0 && local > .85 || i < seg ? 1 : .0; g.setAttribute('class', 'jflag' + (i < seg || (i === seg && local > .85) ? ' up' : '')); });
      var alt = clamp(p, 0, 1); stars.style.opacity = clamp((alt - .45) * 2.2, 0, 1); [].forEach.call(world.querySelectorAll('.jpar'), function (g2) { g2.setAttribute('transform', 'translate(' + (-p * 120 * g2.getAttribute('data-k') * 4) + ' ' + (-(+g2.getAttribute('data-k') / .14 - 1) * 120 - 260 + p * 140 * g2.getAttribute('data-k')) + ')'); }); sun.setAttribute('cy', 120 - alt * 40); stage.style.setProperty('--alt', alt);
      clouds.forEach(function (c, i) { var base = [(i * 230 - 100), (-i * 240 + 500)]; c.setAttribute('transform', 'translate(' + (base[0] + p * 260 * (i % 2 ? 1 : -1)) + ' ' + base[1] + ')'); });
    };
    sec._start(); return sec;
  };

  /* ------------------------------------------------ 2. GRAPH: a git history that grows as you scroll */
  /* ------------------------------------------------ 2. COMMIT HISTORY: git log --graph, drawn as you scroll.
     main runs upward; each role is a feature branch that forks, collects small commits (the highlights) and merges back.
     Laid out in real pixels inside a window panel, rebuilt on resize, so labels never collide with the card or chips. */
  J.graph = function () {
    var sec = shell('graph', 'The commit history'), stage = sec._stage, n = sec._n, steps = sec._steps; sec.querySelector('.jhead p').textContent = 'Scroll to replay the log. Every role is a branch that merged into main.';
    var nextRole = D.career.filter(function (c) { return c.w === 'Saturn'; })[0];
    var JOKE = ['', 'revert: "sleep eight hours"', 'fix: works on my machine, now on theirs too', 'docs: wrote the doc. people read it. shocking', 'perf: coffee-to-commit ratio improved'];
    var PRE = ['feat', 'feat', 'docs', 'perf', 'refactor'];
    var LANE = ['var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c1)'];
    function slug(s) { return s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
    var used = {}, BR = steps.map(function (s, k) { if (!k) return 'main'; var parts = s.h.split(', '), b = slug(parts.length > 1 ? parts[parts.length - 1] : s.h.split(' ')[0]); if (used[b]) b += '-' + slug(parts[0].split(' ')[0]); used[b] = 1; return 'feature/' + b; });
    function hash(k, j) { var h = 2166136261 ^ (k * 97 + j * 13 + 7); for (var i = 0; i < 6; i++) { h ^= h >>> 13; h = M.imul(h, 16777619); } return ('0000000' + (h >>> 0).toString(16)).slice(-7); }

    var win = el('div', 'gwin'), bar = el('div', 'gwin-bar'); ['r', 'y', 'g'].forEach(function (c) { bar.appendChild(el('i', 'gw-' + c)); }); bar.appendChild(el('code', '', '~/vilas $ git log --graph --all')); var br = el('span', 'gwin-br', 'main'); bar.appendChild(br); win.appendChild(bar);
    var svg = sv('svg', { 'class': 'gsvg', 'aria-hidden': 'true' }); win.appendChild(svg); stage.insertBefore(win, stage.firstChild);
    var G = null, lastP = 0;

    function txt(par, x, y, s, a) { var t = sv('text', Object.assign({ x: x, y: y }, a), par); t.textContent = s; return t; }
    function fit(t, maxW) { var s = t.textContent; if (t.getComputedTextLength() <= maxW) return; while (s.length > 4 && t.getComputedTextLength() > maxW) { s = s.slice(0, -2); t.textContent = s.replace(/\s+\S*$/, '') + '...'; } }

    function build() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var W = svg.clientWidth || 600, H = svg.clientHeight || 400, small = W < 520;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      /* one row unit U: every line of text sits on a whole row, so the gaps are identical everywhere */
      var U = small ? 28 : 32, MX = small ? 60 : 70, LX = MX + (small ? 30 : 50), TX = LX + (small ? 22 : 30), avail = W - TX - 14, mono = small ? 10.5 : 12.5, serif = small ? 18 : 24, R = U;
      var defs = sv('defs', {}, svg), fl = sv('filter', { id: 'ggl', x: '-80%', y: '-80%', width: '260%', height: '260%' }, defs); sv('feGaussianBlur', { stdDeviation: 6 }, fl);
      var world = sv('g', {}, svg);
      /* messages per role, then a fixed height per role: title row, empty row, one row per commit, branch label row, gap */
      var MS = steps.map(function (s, k) { var m = (s.hl || []).slice(0, 3).map(function (h, j) { return PRE[(k + j) % PRE.length] + ': ' + (/^[A-Z][a-z]/.test(h) ? h.charAt(0).toLowerCase() + h.slice(1) : h); }); if (JOKE[k]) m.push(JOKE[k]); return m; });
      var Ys = [0]; for (var q = 1; q < n; q++) Ys[q] = Ys[q - 1] - (3 + MS[q].length) * U;
      var Y = function (k) { return Ys[k]; };
      var top = Ys[n - 1] - U * 8, bot = Ys[0] + U * 6;
      for (var ry = M.ceil(top / U) * U + U / 2; ry < bot; ry += U) sv('line', { x1: 0, x2: W, y1: ry, y2: ry, 'class': 'grules' }, world);
      sv('line', { x1: MX, x2: MX, y1: bot, y2: Ys[n - 1], 'class': 'gmain' }, world);
      sv('line', { x1: MX, x2: MX, y1: Ys[n - 1], y2: top, 'class': 'gmain fut' }, world);
      var live = sv('line', { x1: MX, x2: MX, y1: bot, y2: bot, 'class': 'glive' }, world), liveG = sv('line', { x1: MX, x2: MX, y1: bot, y2: bot, 'class': 'glive gl', filter: 'url(#ggl)' }, world);
      var roles = [], sides = [];
      steps.forEach(function (s, k) {
        var col = k ? LANE[(k - 1) % 4] : 'var(--acc)', y = Y(k), msgs = MS[k], path = null, len = 0, fy = 0;
        if (k) {
          fy = Ys[k - 1] - U * .5;
          path = sv('path', { d: 'M' + MX + ' ' + fy + ' C' + MX + ' ' + (fy - R * .9) + ' ' + LX + ' ' + (fy - R * .5) + ' ' + LX + ' ' + (fy - R * 1.5) + ' L' + LX + ' ' + (y + R * 1.5) + ' C' + LX + ' ' + (y + R * .5) + ' ' + MX + ' ' + (y + R * .9) + ' ' + MX + ' ' + y, 'class': 'gbranch', stroke: col }, world);
          len = path.getTotalLength(); path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
          var lbl = txt(world, TX, y + (1 + msgs.length) * U + 4, BR[k], { 'class': 'gbrname', fill: col, 'font-size': mono }); lbl.style.opacity = 0; fit(lbl, avail);
          msgs.forEach(function (m, j) {
            var cy = y + (1 + j) * U, g = sv('g', { 'class': 'gside' + (j === msgs.length - 1 && JOKE[k] ? ' joke' : ''), transform: 'translate(' + LX + ' ' + cy + ')' }, world);
            sv('circle', { r: small ? 4.5 : 5.5, fill: 'var(--s2)', stroke: col, 'stroke-width': 2.5 }, g);
            var t = txt(g, TX - LX, 4, (small ? '' : hash(k, j + 1) + '  ') + m, { 'font-size': mono, 'class': 'gsmsg' }); fit(t, avail);
            sides.push({ g: g, k: k, at: (fy - cy) / (fy - y), lbl: lbl });
          });
        }
        var g = sv('g', { 'class': 'grole', transform: 'translate(' + MX + ' ' + y + ')' }, world); g.style.setProperty('--lc', col);
        sv('circle', { r: 24, fill: col, 'class': 'ghalo', filter: 'url(#ggl)' }, g);
        sv('circle', { r: small ? 10 : 12, 'class': 'gnode', stroke: col, 'stroke-width': small ? 4 : 5, fill: 'var(--s2)' }, g);
        var lab = sv('g', { 'class': 'glab', transform: 'translate(' + (TX - MX) + ' 0)' }, g);
        var meta = txt(lab, 0, -U + 4, hash(k, 0) + (k ? '  Merge ' + BR[k] : '  initial commit') + '  tag: ' + s.y, { 'font-size': mono, fill: col, 'class': 'gmeta' }); fit(meta, avail);
        var title = txt(lab, 0, serif * .32, s.h, { 'font-size': serif, 'class': 'gtitle' });
        if (title.getComputedTextLength() > avail && s.h.indexOf(', ') > 0) { title.textContent = s.h.split(', ')[0]; fit(title, avail); }
        else fit(title, avail);
        roles.push({ g: g, path: path, len: len, k: k, col: col, fy: fy, y: y });
      });
      /* the commit that has not happened yet, two rows above the newest role */
      var nxY = Ys[n - 1] - U * 4, nx = sv('g', { 'class': 'gnext', transform: 'translate(' + MX + ' ' + nxY + ')' }, world), d = Ys[n - 1] - nxY;
      sv('path', { d: 'M0 ' + d + ' C0 ' + (d - R * .9) + ' ' + (LX - MX) + ' ' + (d - R * .5) + ' ' + (LX - MX) + ' ' + (d - R * 1.5) + ' L' + (LX - MX) + ' ' + R * 1.5 + ' C' + (LX - MX) + ' ' + R * .5 + ' 0 ' + R * .9 + ' 0 0', 'class': 'gbranch dash', stroke: 'var(--mute)' }, nx);
      sv('circle', { r: small ? 10 : 12, fill: 'var(--s2)', stroke: 'var(--mute)', 'stroke-width': 3, 'stroke-dasharray': '4 4' }, nx);
      var nl = sv('g', { transform: 'translate(' + (TX - MX) + ' 0)' }, nx);
      txt(nl, 0, -U + 4, '???????  untracked: feature/next', { 'font-size': mono, fill: 'var(--mute)', 'class': 'gmeta' });
      var nt = txt(nl, 0, serif * .32, (nextRole && nextRole.h) || 'Destination: open', { 'font-size': serif, 'class': 'gtitle' }); fit(nt, avail - 16);
      sv('rect', { x: nt.getComputedTextLength() + 6, y: -serif * .62, width: small ? 8 : 11, height: serif, 'class': 'gcaret' }, nl);
      fit(txt(nl, 0, U + 4, small ? 'Got a problem? It merges here.' : 'Have an interesting problem? This is where it merges.', { 'font-size': mono, fill: 'var(--mute)', 'class': 'gsmsg' }), avail);
      var head = sv('g', { 'class': 'ghead' }, world); sv('circle', { r: 7, fill: 'var(--acc)' }, head); sv('circle', { r: 16, fill: 'var(--acc)', opacity: .35, filter: 'url(#ggl)' }, head);
      var hp = sv('g', { transform: 'translate(-' + (small ? 50 : 60) + ' 0)' }, head); sv('rect', { x: 0, y: -11, width: small ? 40 : 48, height: 22, rx: 11, 'class': 'gheadpill' }, hp); txt(hp, (small ? 20 : 24), 4, 'HEAD', { 'font-size': small ? 9.5 : 11, 'text-anchor': 'middle', 'class': 'gheadtxt' });
      G = { W: W, H: H, U: U, MX: MX, world: world, live: live, liveG: liveG, roles: roles, sides: sides, nx: nx, head: head, Ys: Ys };
    }

    sec._draw = function (p) {
      lastP = p; if (!G) return; var f = clamp(p * n - .5, 0, n - 1), i0 = M.floor(f), i1 = M.min(i0 + 1, n - 1), hy = lerp(G.Ys[i0], G.Ys[i1], f - i0);
      var endT = clamp(f - (n - 2), 0, 1); endT = endT * endT * (3 - 2 * endT); G.world.setAttribute('transform', 'translate(0 ' + (G.H * .55 - hy + endT * G.U * 2) + ')');
      G.live.setAttribute('y2', hy); G.liveG.setAttribute('y2', hy); G.head.setAttribute('transform', 'translate(' + G.MX + ' ' + hy + ')');
      var cur = clamp(M.round(f), 0, n - 1);
      G.roles.forEach(function (r) {
        var bp = r.k ? clamp((r.fy - hy) / (r.fy - r.y), 0, 1) : 1; if (r.path) r.path.style.strokeDashoffset = r.len * (1 - bp);
        var on = f >= r.k - .02; r.g.classList.toggle('on', on); r.g.classList.toggle('cur', r.k === cur); r.g.style.opacity = f > r.k - 1.1 ? 1 : .25;
      });
      G.sides.forEach(function (x) { var r = G.roles[x.k], bp = clamp((r.fy - hy) / (r.fy - r.y), 0, 1); x.g.classList.toggle('on', bp >= x.at - .02); x.g.style.opacity = f > x.k - 1.2 ? 1 : .25; if (x.lbl) x.lbl.style.opacity = bp > .05 ? 1 : 0; });
      G.nx.style.opacity = f > n - 1.6 ? 1 : .25;
      br.textContent = cur ? BR[cur] + ' -> main' : 'main';
    };
    var rt = 0; function rebuild() { build(); sec._draw(lastP); }
    addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(rebuild, 120); });
    requestAnimationFrame(function () { rebuild(); if (RM) sec._draw(1); });
    sec._start(); return sec;
  };

  /* ------------------------------------------------ 3. TOWER: a building that stacks a floor per role, the sky changes behind it */
  J.tower = function () {
    var sec = shell('tower', 'Building upward'), stage = sec._stage, n = sec._n, steps = sec._steps, W = 1200, H = 760;
    var svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'jsvg', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' }); stage.insertBefore(svg, stage.firstChild);
    var defs = sv('defs', {}, svg); var gr = sv('linearGradient', { id: 'ts', x1: 0, y1: 0, x2: 0, y2: 1 }, defs); var s0 = sv('stop', { offset: 0, 'stop-color': 'var(--c4)', 'stop-opacity': .4 }, gr); sv('stop', { offset: 1, 'stop-color': 'var(--bg)', 'stop-opacity': 0 }, gr);
    sv('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#ts)' }, svg);
    var sky = sv('g', {}, svg); for (var i = 0; i < 60; i++) sv('circle', { cx: (i * 211) % 1200, cy: (i * 83) % 500, r: i % 6 ? 1.2 : 2, fill: 'var(--ink)', opacity: .0, 'class': 'tstar' }, sky);
    var cl = [0, 1, 2, 3].map(function (i) { var g = sv('g', { opacity: .35 }, sky); sv('ellipse', { cx: 0, cy: 0, rx: 90, ry: 24, fill: 'var(--ink)', opacity: .18 }, g); sv('ellipse', { cx: 44, cy: -14, rx: 54, ry: 20, fill: 'var(--ink)', opacity: .18 }, g); return g; });
    var city = sv('g', { opacity: .55 }, svg); for (i = 0; i < 14; i++) { var h = 70 + (i * 61) % 150, x = i * 90 - 20; sv('rect', { x: x, y: 700 - h, width: 70, height: h + 100, fill: 'var(--s2)' }, city); }
    var ground = sv('rect', { x: 0, y: 700, width: W, height: 100, fill: 'var(--s1)' }, svg);
    var tower = sv('g', {}, svg), FH = 118, TW = 360, TX = 420, floors = steps.map(function (s, k) {
      var g = sv('g', { 'class': 'tfloor', transform: 'translate(' + TX + ' ' + (700 - (k + 1) * FH) + ')' }, tower); sv('rect', { width: TW, height: FH - 6, rx: 6, fill: 'var(--s2)', stroke: 'var(--line)', 'stroke-width': 2 }, g); sv('rect', { width: TW, height: 8, fill: ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--acc)'][k % 5] }, g);
      for (var w = 0; w < 5; w++) sv('rect', { x: 22 + w * 66, y: 28, width: 44, height: 50, rx: 4, fill: 'var(--bg)', opacity: .8, 'class': 'twin' }, g);
      var t = sv('text', { x: TW / 2, y: FH - 20, 'text-anchor': 'middle', fill: 'var(--mute)', 'font-size': 15, 'font-family': 'ui-monospace,Menlo,monospace' }, g); t.textContent = s.y; return g; });
    var crane = sv('g', { 'class': 'tcrane' }, svg); sv('path', { d: 'M0 0 V-260 H-170 M0 -260 H160 M0 -260 L-60 -330 M0 -260 L60 -330', stroke: 'var(--c1)', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }, crane); sv('line', { x1: -140, y1: -260, x2: -140, y2: -190, stroke: 'var(--ink)', 'stroke-width': 3 }, crane); var load = sv('rect', { x: -176, y: -190, width: 72, height: 30, fill: 'var(--acc)', 'class': 'tload' }, crane);
    var flag = sv('g', {}, tower); sv('line', { x1: 0, y1: 0, x2: 0, y2: -70, stroke: 'var(--ink)', 'stroke-width': 4 }, flag); sv('path', { d: 'M0 -70 L70 -54 L0 -38Z', fill: 'var(--acc)', 'class': 'tflag' }, flag);
    sec._draw = function (p) {
      var f = p * n, seg = clamp(M.floor(f), 0, n - 1), local = f - seg, built = seg + clamp(local * 1.5, 0, 1); var topY = 700 - built * FH;
      floors.forEach(function (g, k) { var t = clamp(built - k, 0, 1), e2 = ease(t); g.style.opacity = t > 0 ? 1 : 0; g.setAttribute('transform', 'translate(' + TX + ' ' + (700 - (k + 1) * FH + (1 - e2) * -260) + ')'); g.style.opacity = e2; g.querySelectorAll('.twin').forEach(function (w, i) { w.setAttribute('opacity', t >= 1 ? ((i + k) % 3 ? .35 + .5 * (.5 + .5 * M.sin(i + k)) : .15) : .1); }); });
      flag.setAttribute('transform', 'translate(' + (TX + TW / 2) + ' ' + (topY - 4) + ')'); crane.setAttribute('transform', 'translate(' + (TX + TW + 70) + ' ' + (topY + 20) + ')'); load.setAttribute('y', -190 + M.sin(local * 6.28) * 6);
      var camY = clamp((built - 3) * FH * .85, 0, 600); var shiftX = innerWidth > 900 ? 230 : 0; tower.setAttribute('transform', 'translate(' + shiftX + ' ' + camY + ')'); crane.parentNode === svg && crane.setAttribute('transform', 'translate(' + (TX + TW + 70 + shiftX) + ' ' + (topY + 20 + camY) + ')'); city.setAttribute('transform', 'translate(0 ' + camY * .5 + ')'); ground.setAttribute('transform', 'translate(0 ' + camY + ')');
      var alt = clamp(p, 0, 1); s0.setAttribute('stop-opacity', .25 + alt * .35); sky.querySelectorAll('.tstar').forEach(function (s) { s.setAttribute('opacity', clamp((alt - .4) * 2, 0, .8)); });
      cl.forEach(function (c, i) { c.setAttribute('transform', 'translate(' + ((i * 330 + p * 240 * (i % 2 ? 1 : -1) + 100) % 1400 - 100) + ' ' + (120 + i * 110 + camY * (.2 + i * .1)) + ')'); });
    };
    sec._start(); return sec;
  };

  J.make = function () { return J.graph(); };
  J.KINDS = [['ascent', 'The climb', 'A climber ascends one mountain, flags planted at each role. Altitude changes the sky.'], ['graph', 'Commit history', 'A git-style branch grows and lights up each role as a commit.'], ['tower', 'Building upward', 'A tower rises one floor per role, the city and sky shift around it.']];
})();
