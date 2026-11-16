/* 23 hand-drawn, animated scenes: one per project, each drawn from what that project actually does.
   Uses theme colours (--c1..--c4, --acc, --ink, --mute, --s1, --s2, --line) so every palette works. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', A = window.ART = {};
  function e(t, a, p) { var n = document.createElementNS(NS, t); for (var k in a) n.setAttribute(k, a[k]); if (p) p.appendChild(n); return n; }
  var c1 = 'var(--c1)', c2 = 'var(--c2)', c3 = 'var(--c3)', c4 = 'var(--c4)', ink = 'var(--ink)', mute = 'var(--mute)', ln = 'var(--line)', s2 = 'var(--s2)', s1 = 'var(--s1)', bg = 'var(--bg)', acc = 'var(--acc)';
  function box(slug, fn) { A[slug] = function () { var s = e('svg', { viewBox: '0 0 320 190', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' }); fn(e('g', {}, s), s); return s; }; }
  function R(g, x, y, w, h, f, o, rx, cls) { return e('rect', { x: x, y: y, width: w, height: h, rx: rx == null ? 3 : rx, fill: f, opacity: o == null ? 1 : o, 'class': cls || '' }, g); }
  function C(g, x, y, r, f, o, cls) { return e('circle', { cx: x, cy: y, r: r, fill: f, opacity: o == null ? 1 : o, 'class': cls || '' }, g); }
  function L(g, x1, y1, x2, y2, st, w, cls, o) { return e('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: st, 'stroke-width': w || 2, 'stroke-linecap': 'round', 'class': cls || '', opacity: o == null ? 1 : o }, g); }
  function P(g, d, st, w, f, cls, o) { return e('path', { d: d, stroke: st || 'none', 'stroke-width': w || 2, fill: f || 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'class': cls || '', opacity: o == null ? 1 : o }, g); }
  function T(g, x, y, t, sz, f, anc, cls) { var n = e('text', { x: x, y: y, 'font-size': sz || 12, fill: f || ink, 'text-anchor': anc || 'start', 'font-family': 'ui-monospace,Menlo,monospace', 'class': cls || '' }, g); n.textContent = t; return n; }
  

  /* 1 chat: 10 million connections. Bubbles travel from phones through a gateway and fan out */
  box('whatsapp-backend', function (g, s) {
    
    for (var i = 0; i < 4; i++) { R(g, 18, 30 + i * 36, 18, 28, s2, 1, 5); R(g, 18, 30 + i * 36, 18, 28, 'none', 1, 5).setAttribute('stroke', mute); C(g, 27, 54 + i * 36, 1.5, mute); var m = R(g, 44, 38 + i * 36, 14, 9, [c1, c2, c3, c4][i], 1, 4, 'm'); m.style.animationDelay = (i * .7) + 's'; }
    R(g, 130, 60, 26, 70, s2, 1, 6); L(g, 138, 74, 148, 74, mute, 2); L(g, 138, 88, 148, 88, mute, 2); L(g, 138, 102, 148, 102, c1, 2);
    for (var j = 0; j < 6; j++) { L(g, 156, 95, 250, 22 + j * 29, ln, 1.5); C(g, 262, 22 + j * 29, 7, [c1, c2, c3, c4, c2, c1][j], .95, 'pop'); }
    
  });
  /* 2 traffic jam: cars in lanes, a load balancer, a latency graph */
  box('traffic-jam', function (g, s) {
    
    [0, 1, 2].forEach(function (l) { R(g, 0, 28 + l * 34, 320, 26, s2, .8, 0); L(g, 0, 41 + l * 34, 320, 41 + l * 34, ln, 1.5).setAttribute('stroke-dasharray', '10 12'); for (var k = 0; k < 3; k++) { var c = R(g, 0, 33 + l * 34, 30, 16, [c1, c2, c3][(l + k) % 3], 1, 5, 'car'); c.style.animationDelay = (-k * 1.7 - l * .6) + 's'; c.style.animationDuration = (4 + l * 1.3) + 's'; } });
    P(g, 'M8 170 L50 160 L92 164 L134 146 L176 150 L218 128 L260 140 L312 118', c4, 3).setAttribute('class', 'pls'); R(g, 4, 112, 312, 1, 'none', 0);
  });
  /* 3 job hunter: a conveyor of job cards, magnifier scores them */
  box('job-hunter', function (g, s) {
    
    for (var i = 0; i < 5; i++) { var j = e('g', { 'class': 'jc' }, g); j.style.animationDelay = (-i * 1.2) + 's'; R(j, 0, 52, 78, 54, s2, 1, 8); R(j, 8, 62, 40, 6, mute, .8, 3); R(j, 8, 75, 54, 5, ln, 1, 3); R(j, 8, 88, 26, 10, i % 2 ? c2 : c1, 1, 5); }
    var m = e('g', { 'class': 'mag' }, g); C(m, 160, 100, 28, 'none').setAttribute('stroke', acc); m.firstChild.setAttribute('stroke-width', 5); L(m, 180, 120, 204, 146, acc, 6);
    T(g, 160, 40, '40+ companies', 11, mute, 'middle');
  });
  /* 4 autoconnect: polite robot sends with natural pauses */
  box('autoconnect', function (g, s) {
    
    R(g, 20, 54, 70, 80, s2, 1, 14); C(g, 42, 86, 5, ink); C(g, 68, 86, 5, ink); R(g, 40, 108, 30, 5, mute, 1, 3); L(g, 55, 54, 55, 40, mute, 3); C(g, 55, 36, 5, c3, 1, 'hb');
    for (var i = 0; i < 3; i++) { P(g, 'M96 ' + (80 + i * 8) + ' C 150 ' + (40 + i * 30) + ' 190 ' + (60 + i * 30) + ' 230 ' + (50 + i * 40), c1, 2.5, null, 'sd').style.animationDelay = (-i * .6) + 's'; C(g, 250, 48 + i * 40, 14, [c2, c4, c2][i]); C(g, 250, 44 + i * 40, 4.5, bg, .8); P(g, 'M241 ' + (60 + i * 40) + ' q9 -9 18 0', bg, 2, null, '', .8); }
    T(g, 160, 170, 'slow and polite', 12, mute, 'middle');
  });
  /* 5 chart builder: upload a file, get a chart that draws itself */
  box('custom-data-visualisation', function (g, s) {
    
    L(g, 30, 160, 300, 160, mute, 2); L(g, 30, 30, 30, 160, mute, 2);
    [90, 60, 110, 80, 130, 100, 120].forEach(function (h, i) { var b = R(g, 44 + i * 36, 160 - h, 22, h, [c1, c2, c4][i % 3], .95, 4, 'cbar'); b.style.animationDelay = (i * .1) + 's'; });
    P(g, 'M55 110 C 100 60 130 100 175 70 S 250 40 290 50', c3, 3.5, null, 'ln');
  });
  /* 6 hacker news clone: ranked links, upvotes tick up */
  box('hackernews-graphql', function (g, s) {
    
    [['Prisma tips', 0], ['Apollo cache', 38], ['GraphQL live', 76], ['Why I over-fetch', 114]].forEach(function (r, i) { var q = e('g', { 'class': i === 1 ? 'sw' : i === 2 ? 'sw2' : '' }, g); R(q, 24, 26 + r[1], 272, 32, s2, 1, 8); P(q, 'M40 46 l8 -12 l8 12z', mute, 0, mute, 'up'); R(q, 70, 34 + 0, 0, 0, 'none'); T(q, 70, 46 + r[1] - r[1], r[0], 12, ink); q.querySelectorAll('text').forEach(function (t) { t.setAttribute('y', 46 + r[1]); }); q.querySelector('path').setAttribute('transform', 'translate(0 ' + r[1] + ')'); T(q, 280, 46 + r[1], String(40 - i * 8), 11, mute, 'end'); });
  });
  /* 7 superstore dashboard: KPI + bars + a donut sweeping */
  box('superstore-analysis', function (g, s) {
    
    R(g, 16, 20, 86, 48, s2, 1, 8); T(g, 26, 38, 'SALES', 9, mute); T(g, 26, 58, '1.5k', 16, acc, 'start', 'kp'); R(g, 112, 20, 86, 48, s2, 1, 8); T(g, 122, 38, 'GROWTH', 9, mute); T(g, 122, 58, '+5%', 16, c2);
    C(g, 262, 52, 24, 'none').setAttribute('stroke', ln); g.lastChild.setAttribute('stroke-width', 9); var d = C(g, 262, 52, 24, 'none', 1, 'dn'); d.setAttribute('stroke', c1); d.setAttribute('stroke-width', 9); d.setAttribute('transform', 'rotate(-90 262 52)');
    for (var i = 0; i < 12; i++) R(g, 18 + i * 22, 150 - (30 + i * 7 + (i % 3) * 8), 15, 30 + i * 7 + (i % 3) * 8, i > 8 ? 'none' : c1, i > 8 ? 1 : .9, 3).setAttribute('stroke', i > 8 ? c3 : 'none');
  });
  /* 8 news app: headline cards sliding in with category chips */
  box('news-app', function (g, s) {
    
    ['Tech', 'Sport', 'Science', 'World'].forEach(function (t, i) { R(g, 16 + i * 52, 16, 46, 18, i === 0 ? c1 : s2, 1, 9); T(g, 39 + i * 52, 29, t, 9, i === 0 ? bg : mute, 'middle'); });
    for (var i = 0; i < 3; i++) { var n = e('g', { 'class': 'nw' }, g); n.style.animationDelay = (i * .35) + 's'; R(n, 16, 46 + i * 44, 288, 36, s2, 1, 8); R(n, 24, 54 + i * 44, 20, 20, [c1, c2, c4][i], 1, 5); R(n, 54, 56 + i * 44, 170 - i * 20, 7, ink, .85, 3); R(n, 54, 69 + i * 44, 110, 5, mute, .7, 3); }
  });
  /* 9 image processing: a picture becomes numbers */
  box('image-processing', function (g, s) {
    
    var cols = [c4, c4, c4, c4, c4, c4, c1, c1, c4, c4, c2, c2, c2, c2, c2, c2];
    for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) { R(g, 30 + x * 28, 38 + y * 28, 26, 26, cols[y * 4 + x], 1, 3, 'px').style.animationDelay = (x * .05) + 's'; T(g, 43 + x * 28, 56 + y * 28, String([210, 180, 120, 60][y] - x * 9), 9, ink, 'middle', 'num'); }
    P(g, 'M152 90 h30 m-8 -8 l8 8 l-8 8', acc, 3); T(g, 240, 84, '[210,', 11, mute, 'middle'); T(g, 240, 100, ' 180,', 11, mute, 'middle'); T(g, 240, 116, ' 120 ...]', 11, mute, 'middle');
  });
  /* 10 youtube: four channels racing as bars */
  box('youtube-data-analysis', function (g, s) {
    
    [['A', 220, c1], ['B', 130, c2], ['C', 260, c3], ['D', 70, c4]].forEach(function (c, i) { T(g, 22, 52 + i * 38, c[0], 14, mute); var b = R(g, 44, 36 + i * 38, c[1], 24, c[2], 1, 12, 'rc'); b.style.animationDelay = (i * .2) + 's'; });
    P(g, 'M270 20 l14 8 l-14 8z', c3, 1, c3); R(g, 262, 14, 30, 28, 'none', 1, 7).setAttribute('stroke', c3);
  });
  /* 11 news summary: long text collapses into a short summary */
  box('news-summary', function (g, s) {
    
    for (var i = 0; i < 9; i++) { var keep = i === 1 || i === 5; R(g, 24, 20 + i * 12, 200 - ((i * 37) % 70), 6, keep ? acc : mute, keep ? 1 : .6, 3, keep ? 'keep' : 'ln2'); }
    var sm = e('g', { 'class': 'sm' }, g); R(sm, 24, 128, 270, 46, s2, 1, 10); R(sm, 34, 140, 200, 6, ink, .9, 3); R(sm, 34, 154, 140, 6, ink, .6, 3); C(sm, 270, 151, 11, c2); P(sm, 'M264 151 l4 4 l8 -9', bg, 2.5);
  });
  /* 12 fraud: ocean of dots, a few red ones get caught */
  box('credit-card-fraud', function (g, s) {
    
    for (var i = 0; i < 80; i++) { var x = 16 + (i % 20) * 14.6, y = 26 + Math.floor(i / 20) * 24 + ((i * 7) % 5); var bad = i === 13 || i === 46 || i === 71; C(g, x, y, bad ? 5 : 3.4, bad ? c3 : mute, bad ? 1 : .5, bad ? 'fr' : ''); }
    R(g, 0, 20, 14, 108, acc, .18, 0, 'sc'); T(g, 160, 164, '1,000 transactions, 10 fraud', 11, mute, 'middle');
  });
  /* 13 loan: a scale tipping yes/no */
  box('loan-status-prediction', function (g, s) {
    
    L(g, 160, 50, 160, 150, mute, 4); R(g, 120, 148, 80, 8, mute, 1, 4); var b = e('g', { 'class': 'bm' }, g); L(b, 70, 56, 250, 56, ink, 4); C(b, 70, 56, 4, ink); C(b, 250, 56, 4, ink); P(b, 'M40 112 h60 l-8 -8 h-44z', c2, 2, s2); R(b, 46, 82, 48, 22, c2, 1, 6); T(b, 70, 98, 'YES', 11, bg, 'middle'); R(b, 226, 82, 48, 22, c3, 1, 6); T(b, 250, 98, 'NO', 11, bg, 'middle');
    L(b, 70, 60, 70, 82, mute, 2); L(b, 250, 60, 250, 82, mute, 2);
  });
  /* 14 kmeans: three clusters, centroids pulse */
  box('market-data-kmeans', function (g, s) {
    
    [[80, 70, c1], [220, 60, c2], [150, 134, c3]].forEach(function (c, j) { for (var q = 0; q < 14; q++) { var a = q * 2.4 + j * 1.3, r = 8 + ((q * 19) % 34); var d = C(g, c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * .8, 4, c[2], .85, 'dr'); d.style.animationDelay = (-q * .3) + 's'; } var m = C(g, c[0], c[1], 7, 'none', 1, 'cen'); m.setAttribute('stroke', ink); m.setAttribute('stroke-width', 3); });
  });
  /* 15 fake news: headline stamped real/fake */
  box('fake-news-detection', function (g, s) {
    
    R(g, 30, 22, 260, 146, s2, 1, 10); R(g, 46, 38, 140, 12, ink, .9, 3); R(g, 46, 58, 200, 6, mute, .6, 3); R(g, 46, 72, 180, 6, mute, .6, 3); R(g, 46, 86, 210, 6, mute, .6, 3); R(g, 46, 100, 120, 6, mute, .6, 3);
    var st = e('g', { 'class': 'st' }, g); R(st, 168, 116, 100, 36, 'none', 1, 6).setAttribute('stroke', c3); st.firstChild.setAttribute('stroke-width', 4); T(st, 218, 141, 'FAKE', 22, c3, 'middle');
  });
  /* 16 neumorphism: soft extruded buttons that press */
  box('university-neumorphism', function (g, s) {
    
    R(g, 0, 0, 320, 190, s1, 1, 0);
    var sh = '<defs></defs>'; var defs = e('defs', {}, g); var f = e('filter', { id: 'neu', x: '-30%', y: '-30%', width: '160%', height: '160%' }, defs); e('feDropShadow', { dx: 6, dy: 6, stdDeviation: 6, 'flood-color': '#000', 'flood-opacity': .38 }, f); e('feDropShadow', { dx: -6, dy: -6, stdDeviation: 6, 'flood-color': '#fff', 'flood-opacity': .13 }, f);
    [[40, 60, 100, 46], [170, 60, 110, 46], [40, 124, 70, 38]].forEach(function (b, i) { var r = R(g, b[0], b[1], b[2], b[3], s1, 1, 22, i === 0 ? 'nu' : ''); r.setAttribute('filter', 'url(#neu)'); });
    var k = C(g, 250, 142, 24, s1); k.setAttribute('filter', 'url(#neu)'); T(g, 90, 88, 'Apply', 13, ink, 'middle'); T(g, 225, 88, 'Courses', 13, ink, 'middle'); T(g, 75, 148, 'Hi', 13, mute, 'middle'); C(g, 250, 142, 5, acc);
  });
  /* 17 jobapp: form being filled, a row appears in admin view */
  box('jobapp', function (g, s) {
    
    R(g, 16, 18, 130, 154, s2, 1, 10); R(g, 26, 34, 110, 20, bg, 1, 6); P(g, 'M32 44 h60', ink, 3, null, 'ty'); R(g, 26, 64, 110, 20, bg, 1, 6); P(g, 'M32 74 h40', mute, 3, null, 'ty'); R(g, 26, 100, 110, 26, c1, 1, 13); T(g, 81, 118, 'Apply', 12, bg, 'middle');
    R(g, 166, 18, 138, 154, 'none', 1, 10).setAttribute('stroke', ln); T(g, 176, 38, 'ADMIN', 9, mute); for (var i = 0; i < 4; i++) { R(g, 176, 50 + i * 28, 118, 20, s2, 1, 6, i === 3 ? 'rw' : ''); R(g, 184, 57 + i * 28, 50, 6, ink, .8, 3, i === 3 ? 'rw' : ''); C(g, 280, 60 + i * 28, 5, [c2, c1, c4, c2][i], 1, i === 3 ? 'rw' : ''); }
  });
  /* 18 fun activities: dice, rock-paper-scissors */
  box('fun-activities', function (g, s) {
    
    var d = R(g, 40, 60, 66, 66, ink, 1, 14, 'dc'); [[58, 78], [88, 78], [73, 93], [58, 108], [88, 108]].forEach(function (p) { C(g, p[0], p[1], 5, bg, 1, 'dc'); });
    [['R', 150, c1], ['P', 200, c2], ['S', 250, c3]].forEach(function (h, i) { var q = e('g', { 'class': 'hd' }, g); q.style.animationDelay = (i * .3) + 's'; C(q, h[1], 96, 22, h[2], .95); T(q, h[1], 102, h[0], 18, bg, 'middle'); });
    T(g, 220, 156, 'you win', 12, mute, 'middle');
  });
  /* 19 marketplace: items on shelves with price tags */
  box('marketplace', function (g, s) {
    
    L(g, 12, 100, 308, 100, mute, 4); L(g, 12, 176, 308, 176, mute, 4);
    R(g, 30, 60, 46, 40, c1, 1, 6); R(g, 100, 40, 34, 60, c2, 1, 6); C(g, 190, 78, 22, c4); R(g, 236, 52, 50, 48, c3, 1, 6);
    R(g, 30, 140, 70, 36, c4, 1, 6); R(g, 130, 124, 40, 52, c1, 1, 6); R(g, 200, 144, 90, 32, c2, 1, 6).setAttribute('class', 'cartd');
    [[53, 66], [117, 46], [190, 56], [261, 58]].forEach(function (t, i) { var tg = e('g', { 'class': 'tg' }, g); tg.style.animationDelay = (i * .4) + 's'; R(tg, t[0] - 14, t[1] - 22, 28, 15, acc, 1, 5); T(tg, t[0], t[1] - 11, '₹' + (25 + i * 40), 8, bg, 'middle'); });
  });
  /* 20 learnbro: chat bubbles inside topic rooms */
  box('learnbro', function (g, s) {
    
    ['# Python', '# Photo', '# Trek'].forEach(function (t, i) { R(g, 16 + i * 66, 14, 60, 20, i === 0 ? c1 : s2, 1, 10); T(g, 46 + i * 66, 28, t, 10, i === 0 ? bg : mute, 'middle'); });
    [[20, 50, 150, c2], [100, 86, 190, c4], [20, 122, 130, c1]].forEach(function (b, i) { var q = e('g', { 'class': 'bb' }, g); q.style.animationDelay = (i * 1.2) + 's'; R(q, b[0], b[1], b[2], 28, b[3], .9, 14); C(q, b[0] + 14, b[1] + 14, 6, bg, .6); R(q, b[0] + 28, b[1] + 11, b[2] - 48, 6, bg, .6, 3); });
  });
  /* 21 bank: coin drops into a vault, balance counts */
  box('bank-operations', function (g, s) {
    
    R(g, 60, 80, 120, 90, s2, 1, 12, 'vb'); C(g, 120, 126, 26, 'none').setAttribute('stroke', mute); g.lastChild.setAttribute('stroke-width', 5); L(g, 120, 126, 138, 112, acc, 4); C(g, 120, 126, 5, acc); R(g, 80, 70, 80, 10, mute, 1, 4);
    C(g, 120, 40, 14, acc, 1, 'cn'); T(g, 120, 45, '₹', 14, bg, 'middle', 'cn'); R(g, 204, 40, 100, 54, s2, 1, 10); T(g, 254, 62, 'BALANCE', 9, mute, 'middle'); T(g, 254, 82, '₹1000', 18, c2, 'middle'); R(g, 204, 108, 100, 20, 'none', 1, 10).setAttribute('stroke', ln); T(g, 254, 122, '+1000', 11, mute, 'middle');
  });
  /* 22 t20: a cricket field, ball arcs, run rate line */
  box('t20wc-analysis', function (g, s) {
    
    e('ellipse', { cx: 110, cy: 100, rx: 92, ry: 74, fill: c2, opacity: .18 }, g); e('ellipse', { cx: 110, cy: 100, rx: 92, ry: 74, fill: 'none', stroke: c2, 'stroke-width': 2, opacity: .7 }, g); R(g, 104, 62, 12, 76, c1, .45, 2); L(g, 104, 66, 116, 66, ink, 2); L(g, 104, 134, 116, 134, ink, 2);
    P(g, 'M110 134 Q 160 40 210 70', acc, 2.5, null, 'rn'); C(g, 110, 130, 5, acc, 1, 'ball'); R(g, 226, 30, 80, 120, s2, 1, 10); P(g, 'M234 138 L250 112 L266 124 L284 78 L298 60', c1, 3, null, 'rn'); T(g, 266, 46, 'RR', 10, mute, 'middle');
  });
  /* 23 gdp: a country growth curve with a needed-growth dashed one */
  box('gdp-prediction', function (g, s) {
    
    L(g, 28, 160, 300, 160, mute, 2); L(g, 28, 24, 28, 160, mute, 2); P(g, 'M28 150 C 100 144 160 120 300 92', c2, 3.5, null, 'gd'); P(g, 'M28 150 C 120 130 200 70 300 30', acc, 3, null, 'gd2');
    [0, 1, 2, 3, 4, 5].forEach(function (i) { C(g, 44 + i * 48, 150 - i * 12 - ((i * 7) % 10), 4, c3, 1, 'gp'); }); T(g, 296, 24, 'target', 11, acc, 'end'); T(g, 296, 108, 'trend', 11, c2, 'end');
  });

  /* tidy: the placeholder junk in two scenes is harmless but keep text lengths sane */
  window.projectArt = function (slug) { return (A[slug] || A['gdp-prediction'])(); };
  /* which projects get a live demo: the ones where playing teaches something */
  window.DEMO = { 'whatsapp-backend': 1, 'traffic-jam': 1, 'job-hunter': 1, 'autoconnect': 1, 'custom-data-visualisation': 1, 'hackernews-graphql': 1, 'superstore-analysis': 1, 'credit-card-fraud': 1, 'loan-status-prediction': 1, 'market-data-kmeans': 1, 'fake-news-detection': 1, 'university-neumorphism': 1, 'gdp-prediction': 1, 'image-processing': 1, 'news-summary': 1 };
})();
