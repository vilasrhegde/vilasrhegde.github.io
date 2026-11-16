/* Playable simulators for the repositories on GitHub.
   Every simulator is a small model with made-up sample data, built to show the idea behind the project.
   Safe by construction: text goes in with textContent, nothing is parsed as HTML, no inline style attributes. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x !== undefined && x !== null) e.textContent = x; return e; }
  function sv(t, a) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function add(p) { for (var i = 1; i < arguments.length; i++) if (arguments[i]) p.appendChild(arguments[i]); return p; }
  function btn(txt, cls, fn) { var b = el('button', cls || 'btn o', txt); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; }
  function chip(txt, on, fn) { var b = el('button', 'chip', txt); b.type = 'button'; b.setAttribute('aria-pressed', String(!!on)); b.addEventListener('click', function () { fn(b); }); return b; }
  function row() { var r = el('div', 'lrow'); for (var i = 0; i < arguments.length; i++) if (arguments[i]) r.appendChild(arguments[i]); return r; }
  function label(txt) { return el('p', 'lbl', txt); }
  function slider(min, max, val, step, fn) { var s = el('input'); s.type = 'range'; s.min = min; s.max = max; s.value = val; if (step) s.step = step; s.addEventListener('input', function () { fn(+s.value); }); return s; }
  function bar(p, cls) { var b = el('div', 'lbar'), i = el('i', cls || ''); b.appendChild(i); b.set = function (v) { i.style.width = Math.max(0, Math.min(100, v)) + '%'; }; b.set(p || 0); return b; }
  function sel(opts, fn, val) { var s = el('select', 'lsel'); opts.forEach(function (o) { var op = el('option', '', o); op.value = o; s.appendChild(op); }); if (val) s.value = val; s.addEventListener('change', function () { fn(s.value); }); return s; }
  function out() { var o = el('div', 'lout'); o.setAttribute('aria-live', 'polite'); return o; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rnd(seed) { var s = seed || 1; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function chart(w, h) { var s = sv('svg', { viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'class': 'lsvg' }); return s; }
  function T(svg, x, y, t, anc, cls) { var e = sv('text', { x: x, y: y, 'text-anchor': anc || 'middle', 'class': cls || 'lt' }); e.textContent = t; svg.appendChild(e); return e; }
  var SFX = function (n) { if (window.__sfx && window.__sfx[n]) window.__sfx[n](); };
  var S = {};

  /* ---------- AutoConnect: automation that respects the platform ---------- */
  S.ratelimit = function (box) {
    var rate = 12, polite = true, running = false, sent = 0, trust = 100, t = 0, timer = 0, flagged = false;
    var rl = el('span', 'lv', rate + '/min'), o = out(), tb = bar(100, 'good'), sb = bar(0);
    var rs = slider(1, 60, rate, 1, function (v) { rate = v; rl.textContent = v + '/min'; });
    var pb = chip('Polite random delays', true, function (b) { polite = !polite; b.setAttribute('aria-pressed', String(polite)); });
    var go = btn('Start the script', 'btn', function () { if (running) stop(); else start(); });
    function stop() { running = false; clearInterval(timer); go.textContent = 'Start the script'; }
    function start() { sent = 0; trust = 100; t = 0; flagged = false; running = true; go.textContent = 'Stop'; timer = setInterval(tick, 250); }
    function tick() {
      t += 1; var per = rate / 60 * 4 * 0.25 * 4; sent += per; var limit = polite ? 30 : 15, over = Math.max(0, rate - limit);
      trust = clamp(trust - over * 0.18 + (over === 0 ? 0.4 : 0), 0, 100); tb.set(trust);
      var msg = trust > 70 ? 'Looks like a person. Carry on.' : trust > 30 ? 'Warning: this pattern looks automated.' : 'Slowed down by the platform. Rules matter.';
      if (trust <= 0 && !flagged) { flagged = true; SFX('dead'); }
      o.textContent = 'Requests sent: ' + Math.floor(sent) + '   Time: ' + Math.floor(t / 4) + 's   ' + msg; if (t > 160) stop();
    }
    add(box, label('Connection requests per minute'), row(rs, rl), row(pb, go), label('Platform trust'), tb, o);
    o.textContent = 'Press start. Push the rate up and turn the delays off to see what happens.';
    box.__stop = stop;
  };

  /* ---------- Custom Data Visualisation ---------- */
  S.chartbuilder = function (box) {
    var DS = { 'Monthly sales': [12, 18, null, 25, 31, 28, null, 40, 44, 39, 52, 58], 'Website visits': [220, 240, 260, 255, 300, 320, 310, 360, 350, 390, 410, 430], 'Signups': [5, 8, 7, 9, 14, 12, 18, 16, 22, 20, 27, 31] };
    var names = Object.keys(DS), cur = names[0], type = 'Bars', qc = false, host = el('div', 'lchart'), info = out();
    var M = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    function draw() {
      clear(host); var d = DS[cur], W = 360, H = 190, s = chart(W, H), max = 0; d.forEach(function (v) { if (v !== null && v > max) max = v; }); var miss = d.filter(function (v) { return v === null; }).length;
      var pts = d.map(function (v, i) { return v === null ? null : [30 + i * (W - 40) / 11, H - 28 - (H - 52) * v / max]; });
      s.appendChild(sv('line', { x1: 24, y1: H - 28, x2: W - 6, y2: H - 28, 'class': 'ax' }));
      d.forEach(function (v, i) {
        var x = 30 + i * (W - 40) / 11; T(s, x, H - 12, M[i]);
        if (v === null) { if (qc) { s.appendChild(sv('rect', { x: x - 11, y: 14, width: 22, height: H - 44, 'class': 'miss' })); T(s, x, 28, '?', 'middle', 'lt warn'); } return; }
        if (type === 'Bars') s.appendChild(sv('rect', { x: x - 10, y: pts[i][1], width: 20, height: H - 28 - pts[i][1], rx: 3, 'class': 'bar' }));
      });
      if (type === 'Line') { var path = '', open = false; pts.forEach(function (p) { if (!p) { open = false; return; } path += (open ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); open = true; }); s.appendChild(sv('path', { d: path, 'class': 'ln' })); pts.forEach(function (p) { if (p) s.appendChild(sv('circle', { cx: p[0], cy: p[1], r: 3.5, 'class': 'dot' })); }); }
      host.appendChild(s);
      var vals = d.filter(function (v) { return v !== null; }); var sum = vals.reduce(function (a, b) { return a + b; }, 0);
      info.textContent = qc ? 'Data quality: ' + miss + ' of 12 values are missing. Mean of the rest: ' + (sum / vals.length).toFixed(1) + '.' : 'Tip: switch on the quality check before you trust the picture.';
    }
    add(box, label('Dataset'), row(sel(names, function (v) { cur = v; draw(); })), label('Chart'), row(chip('Bars', true, function (b) { type = 'Bars'; sync(); }), chip('Line', false, function () { type = 'Line'; sync(); }), chip('Data quality check', false, function (b) { qc = !qc; b.setAttribute('aria-pressed', String(qc)); draw(); })), host, info);
    var chips = box.querySelectorAll('.chip'); function sync() { chips[0].setAttribute('aria-pressed', String(type === 'Bars')); chips[1].setAttribute('aria-pressed', String(type === 'Line')); draw(); }
    draw();
  };

  /* ---------- HackerNews GraphQL clone ---------- */
  S.hn = function (box) {
    var L = [['GraphQL subscriptions in five minutes', 41], ['Why I stopped over-fetching', 33], ['Apollo cache, explained', 28], ['Prisma schema tips', 19], ['A tiny React pattern I like', 14], ['Pagination without pain', 9], ['Show: my weekend project', 6], ['Ask: how do you test resolvers?', 4]];
    var items = L.map(function (x, i) { return { t: x[0], v: x[1], id: i }; }), page = 0, live = false, timer = 0, list = el('ol', 'hnlist'), nid = 100, info = out();
    var inp = el('input', 'linp'); inp.type = 'text'; inp.placeholder = 'New link title'; inp.maxLength = 60; inp.setAttribute('aria-label', 'New link title');
    function draw() {
      clear(list); items.sort(function (a, b) { return b.v - a.v; }); var per = 4, pages = Math.ceil(items.length / per); page = clamp(page, 0, pages - 1);
      items.slice(page * per, page * per + per).forEach(function (it, k) { var li = el('li', 'hnrow'); var up = btn('▲', 'vote', function () { it.v++; SFX('tick'); draw(); }); up.setAttribute('aria-label', 'Upvote ' + it.t); add(li, up, el('span', 'ht', it.t), el('span', 'hv', it.v + ' points')); list.appendChild(li); });
      info.textContent = 'Page ' + (page + 1) + ' of ' + pages + (live ? '   · live updates on' : '');
    }
    var prev = btn('← Prev', 'btn o', function () { page--; draw(); }), next = btn('Next →', 'btn o', function () { page++; draw(); });
    var lv = chip('Live updates (subscription)', false, function (b) { live = !live; b.setAttribute('aria-pressed', String(live)); clearInterval(timer); if (live) timer = setInterval(function () { items[Math.floor(Math.random() * items.length)].v += 1 + Math.floor(Math.random() * 3); draw(); }, 1400); draw(); });
    var post = btn('Post link', 'btn', function () { var t = inp.value.trim(); if (!t) return; items.push({ t: t, v: 1, id: nid++ }); inp.value = ''; SFX('got'); draw(); });
    add(box, row(inp, post), row(lv), list, row(prev, next), info); draw(); box.__stop = function () { clearInterval(timer); };
  };

  /* ---------- Superstore dashboard ---------- */
  S.dash = function (box) {
    var CAT = { Furniture: [20, 24, 22, 28, 26, 31, 30, 34, 33, 38, 42, 47], 'Office Supplies': [30, 28, 33, 35, 34, 40, 42, 41, 46, 48, 52, 55], Technology: [35, 40, 38, 45, 52, 50, 58, 61, 60, 68, 74, 83] }, M = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    var cats = Object.keys(CAT), on = { Furniture: true, 'Office Supplies': true, Technology: true }, growth = 5, host = el('div', 'lchart'), info = out();
    function draw() {
      clear(host); var W = 380, H = 200, s = chart(W, H), tot = [], f = [];
      for (var i = 0; i < 12; i++) tot.push(cats.reduce(function (a, c) { return a + (on[c] ? CAT[c][i] : 0); }, 0));
      var last = tot[11], max = Math.max.apply(null, tot.concat([last * Math.pow(1 + growth / 100, 3) * 1.02, 10]));
      for (var k = 1; k <= 3; k++) f.push(last * Math.pow(1 + growth / 100, k));
      var all = tot.concat(f), bw = (W - 40) / 15;
      s.appendChild(sv('line', { x1: 24, y1: H - 26, x2: W - 6, y2: H - 26, 'class': 'ax' }));
      all.forEach(function (v, i) { var h = (H - 54) * v / max, x = 30 + i * bw; s.appendChild(sv('rect', { x: x, y: H - 26 - h, width: bw - 5, height: h, rx: 3, 'class': i >= 12 ? 'bar fc' : 'bar' })); T(s, x + (bw - 5) / 2, H - 10, i < 12 ? M[i] : 'F' + (i - 11)); });
      host.appendChild(s); info.textContent = 'This year: ' + tot.reduce(function (a, b) { return a + b; }, 0) + ' (sample units). Forecast next quarter: ' + Math.round(f.reduce(function (a, b) { return a + b; }, 0)) + ' at ' + growth + '% monthly growth.';
    }
    var cs = row(); cats.forEach(function (c) { cs.appendChild(chip(c, true, function (b) { on[c] = !on[c]; b.setAttribute('aria-pressed', String(on[c])); draw(); })); });
    var gl = el('span', 'lv', growth + '%');
    add(box, label('Click a category to filter every chart'), cs, label('Forecast: monthly growth'), row(slider(-5, 15, growth, 1, function (v) { growth = v; gl.textContent = v + '%'; draw(); }), gl), host, info); draw();
  };

  /* ---------- News app ---------- */
  S.feed = function (box) {
    var N = [['Tech', 'A new chip makes phones last two days'], ['Tech', 'Open-source tool speeds up web builds'], ['Sport', 'Underdogs win the cup in extra time'], ['Sport', 'Marathon record falls in cool weather'], ['Science', 'Telescope spots a faint new moon'], ['Science', 'Scientists teach bees to count to four'], ['World', 'Coastal towns plan for stronger storms'], ['World', 'Two countries agree on a shared river plan'], ['Tech', 'Small team ships a tiny but speedy browser']];
    var q = '', topic = 'All', list = el('ul', 'newslist'), view = el('div', 'newsview');
    var inp = el('input', 'linp'); inp.type = 'search'; inp.placeholder = 'Search headlines'; inp.setAttribute('aria-label', 'Search headlines'); inp.addEventListener('input', function () { q = inp.value.toLowerCase(); draw(); });
    var tc = row(); ['All', 'Tech', 'Sport', 'Science', 'World'].forEach(function (t) { tc.appendChild(chip(t, t === 'All', function () { topic = t; [].forEach.call(tc.children, function (b) { b.setAttribute('aria-pressed', String(b.textContent === t)); }); draw(); })); });
    function draw() { clear(list); var n = 0; N.forEach(function (x) { if ((topic !== 'All' && x[0] !== topic) || (q && x[1].toLowerCase().indexOf(q) < 0)) return; n++; var li = el('li'), b = el('button', 'newsbtn'); b.type = 'button'; add(b, el('small', '', x[0]), el('span', '', x[1])); b.addEventListener('click', function () { clear(view); add(view, el('small', '', x[0].toUpperCase()), el('h4', '', x[1]), el('p', '', 'Sample article text. In the real app this comes from the News API, fetched with Axios and rendered by React.')); }); li.appendChild(b); list.appendChild(li); }); if (!n) list.appendChild(el('li', 'empty', 'No stories match. Try another word.')); }
    add(box, inp, tc, list, view); draw();
  };

  /* ---------- Image processing ---------- */
  S.imglab = function (box) {
    var N = 16, px = [], r = rnd(7); for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) { var sky = y < 9, d = Math.hypot(x - 11, y - 4); px.push(d < 2.6 ? [255, 210, 80] : sky ? [60 + y * 8, 120 + y * 8, 210] : (x + y) % 5 === 0 ? [40, 110, 70] : [50, 140 + (x % 3) * 12, 80]); }
    var size = 16, grey = false, cv = el('canvas', 'limg'); cv.width = 256; cv.height = 256; cv.setAttribute('aria-label', 'Sample image'); var g = cv.getContext('2d'), o = out(), tbl = el('pre', 'lcode');
    function get(x, y) { var sx = Math.floor(x * N / size), sy = Math.floor(y * N / size), p = px[sy * N + sx]; if (grey) { var v = Math.round(.299 * p[0] + .587 * p[1] + .114 * p[2]); return [v, v, v]; } return p; }
    function draw() { g.imageSmoothingEnabled = false; var c = 256 / size; for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) { var p = get(x, y); g.fillStyle = 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')'; g.fillRect(x * c, y * c, Math.ceil(c), Math.ceil(c)); }
      var lines = []; for (var j = 0; j < 3; j++) { var rowv = []; for (var i = 0; i < 3; i++) { var q = get(i, j); rowv.push(grey ? String(q[0]).padStart(3, ' ') : '(' + q.join(',') + ')'); } lines.push('[' + rowv.join(' ') + ' ...]'); }
      tbl.textContent = 'top-left of the array\n' + lines.join('\n'); o.textContent = size + ' x ' + size + ' pixels = ' + size * size * (grey ? 1 : 3) + ' numbers. ' + (grey ? 'Greyscale needs a third of the numbers.' : 'Colour keeps three numbers per pixel.'); }
    var rz = row(); [16, 8, 4].forEach(function (s) { rz.appendChild(chip(s + ' px', s === 16, function () { size = s; [].forEach.call(rz.children, function (b) { b.setAttribute('aria-pressed', String(b.textContent === s + ' px')); }); draw(); })); });
    add(box, cv, label('Resize'), rz, row(chip('Greyscale (RGB → 1 channel)', false, function (b) { grey = !grey; b.setAttribute('aria-pressed', String(grey)); draw(); })), tbl, o); draw();
  };

  /* ---------- YouTube analysis ---------- */
  S.ytbars = function (box) {
    var CH = [['Channel A', 4.2, 310, [5, 4, 6, 3, 7, 5, 4, 6, 8, 5, 4, 7]], ['Channel B', 2.6, 190, [2, 3, 3, 4, 2, 3, 5, 4, 3, 2, 4, 3]], ['Channel C', 7.9, 880, [8, 9, 6, 7, 9, 10, 8, 7, 9, 11, 8, 9]], ['Channel D', 1.1, 60, [1, 1, 2, 1, 2, 3, 2, 1, 2, 2, 1, 2]]], metric = 'Subscribers (M)', pick = 0, host = el('div', 'lchart'), host2 = el('div', 'lchart'), info = out();
    var M = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    function draw() {
      clear(host); clear(host2); var W = 360, H = 150, s = chart(W, H), k = metric.indexOf('Sub') === 0 ? 1 : 2, max = Math.max.apply(null, CH.map(function (c) { return c[k]; }));
      CH.forEach(function (c, i) { var h = (H - 40) * c[k] / max, x = 30 + i * 80; var r = sv('rect', { x: x, y: H - 24 - h, width: 56, height: h, rx: 4, 'class': i === pick ? 'bar sel' : 'bar', tabindex: 0, role: 'button', 'aria-label': c[0] + ' ' + c[k] }); r.addEventListener('click', function () { pick = i; draw(); }); r.addEventListener('keydown', function (e) { if (e.key === 'Enter') { pick = i; draw(); } }); s.appendChild(r); T(s, x + 28, H - 8, c[0].replace('Channel ', 'Ch. ')); T(s, x + 28, H - 28 - h, c[k]); });
      host.appendChild(s); var s2 = chart(W, 110), v = CH[pick][3], m2 = Math.max.apply(null, v);
      v.forEach(function (n, i) { var h = 62 * n / m2, x = 24 + i * 27; s2.appendChild(sv('rect', { x: x, y: 82 - h, width: 18, height: h, rx: 3, 'class': 'bar fc' })); T(s2, x + 9, 98, M[i]); }); T(s2, 6, 12, 'Videos per month: ' + CH[pick][0], 'start');
      host2.appendChild(s2); var bi = v.indexOf(m2); info.textContent = CH[pick][0] + ' posted the most in ' + ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][bi] + ' (' + m2 + ' videos).';
    }
    add(box, label('Metric'), row(sel(['Subscribers (M)', 'Total views (M)'], function (v) { metric = v; draw(); })), host, host2, info); draw();
  };

  /* ---------- News summariser ---------- */
  S.summ = function (box) {
    var SAMPLE = 'The city opened a new riverside park on Saturday and thousands of people came to enjoy it. Planners said the park cleans rainwater before it reaches the river, which is great news for fish. Local cafes reported their best weekend this year. A few visitors complained about the long queues for ice cream, but most were delighted. The mayor said more green spaces like this one are planned across the city.';
    var ta = el('textarea', 'lta'); ta.value = SAMPLE; ta.rows = 6; ta.setAttribute('aria-label', 'Article text'); var o = el('div', 'lsumm');
    var POS = 'great delighted best enjoy good happy love wonderful win free safe'.split(' '), NEG = 'complained bad worst angry sad fail loss danger unsafe crisis queue queues'.split(' '), STOP = 'the a an and or of to in on at for is are was were it its this that with by from as be been has have had they their which who'.split(' ');
    function run() {
      var text = ta.value.trim(), sents = text.split(/(?<=[.!?])\s+/).filter(Boolean), words = text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean), f = {};
      words.forEach(function (w) { if (STOP.indexOf(w) < 0) f[w] = (f[w] || 0) + 1; });
      var sc = sents.map(function (s, i) { var ws = s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean); var v = ws.reduce(function (a, w) { return a + (f[w] || 0); }, 0) / Math.sqrt(ws.length || 1); return { s: s, v: v, i: i }; });
      var top = sc.slice().sort(function (a, b) { return b.v - a.v; }).slice(0, 2).sort(function (a, b) { return a.i - b.i; });
      var pos = words.filter(function (w) { return POS.indexOf(w) >= 0; }).length, neg = words.filter(function (w) { return NEG.indexOf(w) >= 0; }).length, pol = (pos - neg) / Math.max(1, pos + neg);
      var kw = Object.keys(f).sort(function (a, b) { return f[b] - f[a]; }).slice(0, 5);
      clear(o); add(o, el('h4', '', 'Summary'), el('p', '', top.map(function (t) { return t.s; }).join(' ')), el('p', 'meta', 'Keywords: ' + kw.join(', ')), el('p', 'meta', 'Sentiment polarity: ' + pol.toFixed(2) + (pol > .2 ? ' (positive)' : pol < -.2 ? ' (negative)' : ' (neutral)') + '. ' + words.length + ' words, ' + sents.length + ' sentences.'));
    }
    add(box, label('Paste an article (this runs only in your browser)'), ta, row(btn('Summarise', 'btn', run)), o); run();
  };

  /* ---------- Credit card fraud ---------- */
  S.fraud = function (box) {
    var cv = el('canvas', 'lcan'); cv.width = 400; cv.height = 150; cv.setAttribute('aria-label', 'Transactions: grey are legitimate, red are fraud'); var g = cv.getContext('2d'), o = out(), mode = 0;
    function dots(nl, nf) { g.clearRect(0, 0, 400, 150); var r = rnd(3), cols = 50, n = nl + nf, mark = {}; for (var i = 0; i < nf; i++) mark[Math.floor((i + .5) * n / nf)] = 1; var rows = Math.ceil(n / cols), cell = Math.min(8, 400 / cols, 150 / rows); for (var k = 0; k < n; k++) { g.fillStyle = mark[k] ? '#ff5a5a' : 'rgba(255,255,255,.4)'; g.beginPath(); g.arc(6 + (k % cols) * cell, 6 + Math.floor(k / cols) * cell, cell / 2.3, 0, 6.3); g.fill(); } }
    function show() {
      if (mode === 0) { dots(990, 10); o.textContent = '1,000 transactions, 10 are fraud. A lazy model that says "legit" every time is 99% accurate and catches 0 of 10 frauds. Accuracy lies on unbalanced data.'; }
      else if (mode === 1) { dots(10, 10); o.textContent = 'Balanced sample: 10 legit picked at random, plus all 10 fraud. Now the two classes have equal weight and the model has to learn the difference.'; }
      else { dots(10, 10); o.textContent = 'Trained logistic regression on the balanced sample, 80% train / 20% test, label ratio kept equal in both halves. Training accuracy 92%, test accuracy 90%. Close scores mean it is not overfitting.'; }
    }
    add(box, cv, row(btn('1. Raw data', 'btn o', function () { mode = 0; show(); }), btn('2. Balance it', 'btn o', function () { mode = 1; show(); }), btn('3. Train and test', 'btn', function () { mode = 2; show(); SFX('got'); })), o); show();
  };

  /* ---------- Loan status ---------- */
  S.loan = function (box) {
    var f = { 'Credit history': 'Good', Income: 'Medium', Education: 'Graduate', 'Property area': 'Semiurban', Married: 'Yes' }, W = { 'Credit history': { Good: 3, Poor: -3 }, Income: { Low: -1, Medium: 0.5, High: 1.5 }, Education: { Graduate: 0.5, 'Not graduate': -0.3 }, 'Property area': { Rural: -0.2, Semiurban: 0.6, Urban: 0.2 }, Married: { Yes: 0.3, No: 0 } };
    var o = el('div', 'lout big'), why = el('div', 'lwhy');
    function run() { var tot = -0.5, rows = []; Object.keys(f).forEach(function (k) { var w = W[k][f[k]]; tot += w; rows.push([k, w]); }); clear(why); rows.forEach(function (r) { var line = el('div', 'lwr'); add(line, el('span', '', r[0] + ': ' + f[r[0]]), el('span', r[1] >= 0 ? 'pos' : 'neg', (r[1] >= 0 ? '+' : '') + r[1].toFixed(1))); why.appendChild(line); }); o.textContent = tot > 0 ? 'Loan sanctioned' : 'Not sanctioned'; o.className = 'lout big ' + (tot > 0 ? 'yes' : 'no'); }
    add(box, label('An applicant (made-up weights, not the real trained model)'));
    Object.keys(f).forEach(function (k) { add(box, row(el('span', 'lk', k), sel(Object.keys(W[k]), function (v) { f[k] = v; run(); }, f[k]))); });
    add(box, o, why); run();
  };

  /* ---------- K-means ---------- */
  S.kmeans = function (box) {
    var cv = el('canvas', 'lcan'); cv.width = 400; cv.height = 240; cv.setAttribute('aria-label', 'Customers by income and spending'); var g = cv.getContext('2d'), o = out(), elbow = el('div', 'lchart');
    var r = rnd(11), P = [], C = [[80, 60], [80, 180], [200, 120], [320, 50], [320, 190]]; C.forEach(function (c) { for (var i = 0; i < 26; i++) P.push([clamp(c[0] + (r() - .5) * 90, 8, 392), clamp(c[1] + (r() - .5) * 70, 8, 232)]); });
    var K = 5, cent = [], lab = [], COL = ['#ff5a5a', '#3ddc97', '#5b8cff', '#ffd24d', '#b57bff', '#ff9933', '#2ad4d4', '#ff7ac6'];
    function init(k) { cent = []; var rr = rnd(5 + k); for (var i = 0; i < k; i++) cent.push(P[Math.floor(rr() * P.length)].slice()); assign(); }
    function assign() { lab = P.map(function (p) { var b = 0, bd = 1e9; cent.forEach(function (c, i) { var d = (p[0] - c[0]) * (p[0] - c[0]) + (p[1] - c[1]) * (p[1] - c[1]); if (d < bd) { bd = d; b = i; } }); return b; }); }
    function update() { cent = cent.map(function (c, i) { var sx = 0, sy = 0, n = 0; P.forEach(function (p, j) { if (lab[j] === i) { sx += p[0]; sy += p[1]; n++; } }); return n ? [sx / n, sy / n] : c; }); }
    function wcss() { var s = 0; P.forEach(function (p, j) { var c = cent[lab[j]]; s += (p[0] - c[0]) * (p[0] - c[0]) + (p[1] - c[1]) * (p[1] - c[1]); }); return s; }
    function draw() { g.clearRect(0, 0, 400, 240); P.forEach(function (p, j) { g.fillStyle = COL[lab[j] % 8]; g.beginPath(); g.arc(p[0], p[1], 3.4, 0, 6.3); g.fill(); }); cent.forEach(function (c) { g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.arc(c[0], c[1], 7, 0, 6.3); g.fill(); g.stroke(); }); o.textContent = 'k = ' + K + '   WCSS = ' + Math.round(wcss() / 1000) + 'k   X: annual income, Y: spending score (sample data)'; }
    function curve() { clear(elbow); var s = chart(360, 110), vals = []; for (var k = 1; k <= 8; k++) { var sv0 = cent, sl = lab; init(k); for (var it = 0; it < 12; it++) { update(); assign(); } vals.push(wcss()); } init(K); for (var it2 = 0; it2 < 0; it2++) update(); var mx = vals[0]; vals.forEach(function (v, i) { var x = 30 + i * 42, y = 90 - 74 * v / mx; s.appendChild(sv('circle', { cx: x, cy: y, r: 4, 'class': i + 1 === K ? 'dot sel' : 'dot' })); if (i) s.appendChild(sv('line', { x1: 30 + (i - 1) * 42, y1: 90 - 74 * vals[i - 1] / mx, x2: x, y2: y, 'class': 'ln' })); T(s, x, 106, String(i + 1)); }); T(s, 4, 12, 'Elbow: WCSS for k = 1 to 8. Look for the bend.', 'start'); elbow.appendChild(s); }
    var kl = el('span', 'lv', String(K));
    add(box, cv, row(el('span', 'lk', 'Clusters'), slider(1, 8, K, 1, function (v) { K = v; kl.textContent = v; init(K); draw(); curve(); }), kl), row(btn('Step (move centroids)', 'btn', function () { update(); assign(); draw(); SFX('tick'); }), btn('Reset', 'btn o', function () { init(K); draw(); })), o, elbow); init(K); for (var i = 0; i < 12; i++) { update(); assign(); } draw(); curve();
    for (var q = 0; q < 12; q++) { update(); assign(); } draw();
  };

  /* ---------- Fake news ---------- */
  S.fakenews = function (box) {
    var STOP = 'the a an and or of to in on at for is are was were it its this that with by from as be been has have had they their which who you will not but so what did because'.split(' '), CLICK = 'shocking secret miracle unbelievable exposed hoax breaking you won\'t believe conspiracy truth banned cure instantly'.split(' '), CALM = 'report study says officials announced according data published council research'.split(' ');
    var inp = el('input', 'linp'); inp.type = 'text'; inp.maxLength = 140; inp.value = 'Shocking secret miracle cure exposed, doctors banned from telling you'; inp.setAttribute('aria-label', 'Headline'); var o = el('div', 'lsteps');
    function stem(w) { return w.replace(/(ing|ed|ly|es|s)$/, function (m, a, off) { return off > 2 ? '' : m; }); }
    function run() {
      var raw = inp.value, low = raw.toLowerCase().replace(/[^a-z\s']/g, ' ').replace(/\s+/g, ' ').trim(), ws = low.split(' ').filter(Boolean), keep = ws.filter(function (w) { return STOP.indexOf(w) < 0; }), st = keep.map(stem);
      var bad = ws.filter(function (w) { return CLICK.indexOf(w) >= 0; }).length, good = ws.filter(function (w) { return CALM.indexOf(w) >= 0; }).length, sc = bad - good;
      clear(o); [['1. Lowercase, letters only', low], ['2. Remove stop words', keep.join(' ')], ['3. Stem to the root', st.join(' ')], ['4. Vectorise: words become counts', st.slice(0, 6).map(function (w) { return w + ':1'; }).join('  ')]].forEach(function (s) { add(o, el('div', 'lstep', null)); var d = o.lastChild; add(d, el('b', '', s[0]), el('code', '', s[1] || '(empty)')); });
      var v = el('div', 'lout big ' + (sc > 0 ? 'no' : 'yes'), sc > 0 ? 'Looks fake (toy score ' + sc + ')' : sc < 0 ? 'Looks real (toy score ' + sc + ')' : 'Not sure (toy score 0)'); o.appendChild(v); o.appendChild(el('p', 'meta', 'The real model is a logistic regression over thousands of articles. This toy only counts a few tell-tale words.'));
    }
    inp.addEventListener('input', run); add(box, label('Type a headline'), inp, o); run();
  };

  /* ---------- Neumorphism ---------- */
  S.neu = function (box) {
    var d = 12, b = 26, it = 40, rad = 28, inset = false, pv = el('div', 'neuprev'), code = el('pre', 'lcode'), stage = el('div', 'neustage'); stage.appendChild(pv);
    function draw() { var a = it / 100, dark = 'rgba(163,177,198,' + (0.35 + a) + ')', light = 'rgba(255,255,255,' + (0.5 + a) + ')'; var sh = (inset ? 'inset ' : '') + d + 'px ' + d + 'px ' + b + 'px ' + dark + ', ' + (inset ? 'inset ' : '') + '-' + d + 'px -' + d + 'px ' + b + 'px ' + light; pv.style.boxShadow = sh; pv.style.borderRadius = rad + 'px'; code.textContent = 'background: #e0e5ec;\nborder-radius: ' + rad + 'px;\nbox-shadow:\n  ' + sh.replace(', ', ',\n  ') + ';'; }
    function ctl(name, min, max, val, fn) { var l = el('span', 'lv', String(val)); return row(el('span', 'lk', name), slider(min, max, val, 1, function (v) { fn(v); l.textContent = v; draw(); }), l); }
    add(box, stage, ctl('Distance', 2, 30, d, function (v) { d = v; }), ctl('Blur', 4, 60, b, function (v) { b = v; }), ctl('Intensity', 0, 60, it, function (v) { it = v; }), ctl('Radius', 0, 60, rad, function (v) { rad = v; }), row(chip('Pressed (inset)', false, function (bt) { inset = !inset; bt.setAttribute('aria-pressed', String(inset)); draw(); })), code); draw();
  };

  /* ---------- Job application CRUD ---------- */
  S.crud = function (box) {
    var rows = [{ n: 'Asha', p: 'Developer', s: 'Received' }, { n: 'Ravi', p: 'Analyst', s: 'Interview' }, { n: 'Meera', p: 'Developer', s: 'Reviewing' }], admin = false, view = el('div'), POS = ['Developer', 'Analyst', 'Designer'], ST = ['Received', 'Reviewing', 'Interview', 'Offer'], filt = 'All', q = '';
    function draw() {
      clear(view);
      if (!admin) { var nm = el('input', 'linp'); nm.type = 'text'; nm.placeholder = 'Your name'; nm.maxLength = 30; nm.setAttribute('aria-label', 'Your name'); var ps = sel(POS, function () { }); var msg = out(); add(view, label('Apply for a job'), nm, row(ps, btn('Submit application', 'btn', function () { var v = nm.value.trim(); if (!v) { msg.textContent = 'Please enter your name.'; return; } rows.push({ n: v, p: ps.value, s: 'Received' }); msg.textContent = 'Thanks ' + v + '. You can see your status in the admin view.'; nm.value = ''; SFX('got'); })), msg); return; }
      var sr = el('input', 'linp'); sr.type = 'search'; sr.placeholder = 'Search by name'; sr.value = q; sr.setAttribute('aria-label', 'Search by name'); sr.addEventListener('input', function () { q = sr.value; fill(); });
      var tb = el('div', 'ltable'); add(view, row(sr, sel(['All'].concat(POS), function (v) { filt = v; fill(); }, filt)), tb);
      var chartw = el('div', 'lchart'); view.appendChild(chartw);
      function fill() { clear(tb); rows.forEach(function (r, i) { if ((filt !== 'All' && r.p !== filt) || (q && r.n.toLowerCase().indexOf(q.toLowerCase()) < 0)) return; var tr = el('div', 'ltr'); add(tr, el('span', '', r.n), el('span', 'meta', r.p), sel(ST, function (v) { r.s = v; fill(); }, r.s), btn('Delete', 'btn o sm', function () { rows.splice(i, 1); fill(); })); tb.appendChild(tr); });
        clear(chartw); var s = chart(360, 80); ST.forEach(function (st, k) { var n = rows.filter(function (r) { return r.s === st; }).length, h = Math.min(40, n * 12); s.appendChild(sv('rect', { x: 20 + k * 85, y: 50 - h, width: 60, height: h, rx: 3, 'class': 'bar' })); T(s, 50 + k * 85, 68, st + ' ' + n); }); chartw.appendChild(s); }
      fill();
    }
    add(box, row(chip('Applicant view', true, function () { admin = false; sync(); draw(); }), chip('Admin view', false, function () { admin = true; sync(); draw(); })), view);
    var cs = box.firstChild.children; function sync() { cs[0].setAttribute('aria-pressed', String(!admin)); cs[1].setAttribute('aria-pressed', String(admin)); } draw();
  };

  /* ---------- Fun activities ---------- */
  S.fun = function (box) {
    var area = el('div'), tab = 'Games';
    function games() {
      var ws = 0, ls = 0, o = out(), sc = el('p', 'meta', 'You 0 · Computer 0'); var rs = row(); ['Rock', 'Paper', 'Scissors'].forEach(function (m, i) { rs.appendChild(btn(m, 'btn o', function () { var c = Math.floor(Math.random() * 3), res = i === c ? 'Draw' : (i - c + 3) % 3 === 1 ? 'You win' : 'You lose'; if (res === 'You win') ws++; else if (res === 'You lose') ls++; o.textContent = 'You: ' + ['Rock', 'Paper', 'Scissors'][i] + '  Computer: ' + ['Rock', 'Paper', 'Scissors'][c] + '  →  ' + res; sc.textContent = 'You ' + ws + ' · Computer ' + ls; SFX('tick'); })); });
      var secret = 1 + Math.floor(Math.random() * 20), g = out(); var gi = el('input', 'linp'); gi.type = 'number'; gi.min = 1; gi.max = 20; gi.setAttribute('aria-label', 'Your guess, 1 to 20'); gi.placeholder = '1 to 20';
      add(area, label('Rock Paper Scissors'), rs, o, sc, label('Guess the number (1 to 20)'), row(gi, btn('Guess', 'btn', function () { var v = +gi.value; if (!v) return; if (v === secret) { g.textContent = 'Correct! New number picked.'; secret = 1 + Math.floor(Math.random() * 20); SFX('got'); } else g.textContent = v < secret ? 'Higher' : 'Lower'; })), g);
    }
    function tools() {
      var ta = el('textarea', 'lta'); ta.rows = 3; ta.value = 'the quick brown fox jumps over the lazy dog'; ta.setAttribute('aria-label', 'Text'); var o = out();
      function stats() { var w = ta.value.trim().split(/\s+/).filter(Boolean).length; o.textContent = w + ' words · about ' + Math.max(1, Math.ceil(w / 200 * 60)) + ' seconds to read'; }
      ta.addEventListener('input', stats);
      var h = ta.value; var bmw = el('input', 'linp'); bmw.type = 'number'; bmw.placeholder = 'kg'; bmw.setAttribute('aria-label', 'Weight in kilograms'); var bmh = el('input', 'linp'); bmh.type = 'number'; bmh.placeholder = 'cm'; bmh.setAttribute('aria-label', 'Height in centimetres'); var bo = out();
      add(area, label('Text utilities'), ta, row(btn('UPPERCASE', 'btn o', function () { ta.value = ta.value.toUpperCase(); stats(); }), btn('lowercase', 'btn o', function () { ta.value = ta.value.toLowerCase(); stats(); }), btn('Capitalise Each Word', 'btn o', function () { ta.value = ta.value.replace(/\b\w/g, function (m) { return m.toUpperCase(); }); stats(); })), o, label('BMI'), row(bmw, bmh, btn('Calculate', 'btn', function () { var kg = +bmw.value, cm = +bmh.value; if (!kg || !cm) return; var b = kg / Math.pow(cm / 100, 2); bo.textContent = 'BMI ' + b.toFixed(1); })), bo); stats();
    }
    function sw(t) { tab = t; clear(area); (t === 'Games' ? games : tools)(); [].forEach.call(box.firstChild.children, function (b) { b.setAttribute('aria-pressed', String(b.textContent === t)); }); }
    add(box, row(chip('Games', true, function () { sw('Games'); }), chip('Tools', false, function () { sw('Tools'); })), area); games();
  };

  /* ---------- Marketplace ---------- */
  S.market = function (box) {
    var IT = [['Desk lamp', 'Home', 25], ['Road bike', 'Sports', 180], ['Used laptop', 'Tech', 320], ['Sofa', 'Home', 140], ['Headphones', 'Tech', 60], ['Yoga mat', 'Sports', 15], ['Bookshelf', 'Home', 55], ['Camera', 'Tech', 210]], cat = 'All', q = '', sort = 'Newest', grid = el('div', 'mgrid2'), chat = el('div', 'mchat');
    var inp = el('input', 'linp'); inp.type = 'search'; inp.placeholder = 'Search items'; inp.setAttribute('aria-label', 'Search items'); inp.addEventListener('input', function () { q = inp.value.toLowerCase(); draw(); });
    var cc = row(); ['All', 'Home', 'Sports', 'Tech'].forEach(function (c) { cc.appendChild(chip(c, c === 'All', function () { cat = c; [].forEach.call(cc.children, function (b) { b.setAttribute('aria-pressed', String(b.textContent === c)); }); draw(); })); });
    function draw() { clear(grid); var l = IT.filter(function (x) { return (cat === 'All' || x[1] === cat) && (!q || x[0].toLowerCase().indexOf(q) >= 0); }); if (sort === 'Price: low to high') l.sort(function (a, b) { return a[2] - b[2]; }); if (!l.length) grid.appendChild(el('p', 'empty', 'Nothing found.')); l.forEach(function (x) { var b = el('button', 'mitem'); b.type = 'button'; add(b, el('b', '', x[0]), el('small', '', x[1]), el('span', '', '₹' + x[2])); b.addEventListener('click', function () { open(x); }); grid.appendChild(b); }); }
    function open(x) { clear(chat); var log = el('div', 'mlog'); add(chat, el('h4', '', x[0] + ' · ₹' + x[2]), el('p', 'meta', 'Related: ' + IT.filter(function (y) { return y[1] === x[1] && y !== x; }).map(function (y) { return y[0]; }).slice(0, 2).join(', ')), log); var mi = el('input', 'linp'); mi.type = 'text'; mi.maxLength = 80; mi.placeholder = 'Message the seller'; mi.setAttribute('aria-label', 'Message the seller'); var go = function () { var v = mi.value.trim(); if (!v) return; log.appendChild(el('p', 'me', v)); mi.value = ''; setTimeout(function () { log.appendChild(el('p', 'them', 'Hi! Yes, it is still available.')); }, 700); }; add(chat, row(mi, btn('Send', 'btn', go))); }
    add(box, inp, cc, row(el('span', 'lk', 'Sort'), sel(['Newest', 'Price: low to high'], function (v) { sort = v; draw(); })), grid, chat); draw();
  };

  /* ---------- Community rooms ---------- */
  S.rooms = function (box) {
    var R = { Python: ['Anyone tried Django REST?', 'Yes, it saves a lot of time.'], Photography: ['Golden hour tips?', 'Shoot 30 minutes before sunset.'], Trekking: ['Best monsoon trail?', 'Try the waterfall circuit.'] }, cur = null, log = el('div', 'mlog'), timer = 0, side = el('div', 'rooms');
    function join(n) { cur = n; clear(log); R[n].forEach(function (m, i) { log.appendChild(el('p', i ? 'them' : 'them', m)); }); draw(); }
    function draw() { clear(side); Object.keys(R).forEach(function (n) { side.appendChild(chip('# ' + n, n === cur, function () { join(n); })); }); }
    var mi = el('input', 'linp'); mi.type = 'text'; mi.maxLength = 80; mi.placeholder = 'Say something'; mi.setAttribute('aria-label', 'Message'); var host = el('input', 'linp'); host.type = 'text'; host.maxLength = 20; host.placeholder = 'Host a new room'; host.setAttribute('aria-label', 'New room name');
    var send = function () { var v = mi.value.trim(); if (!v || !cur) return; log.appendChild(el('p', 'me', v)); mi.value = ''; SFX('tick'); setTimeout(function () { log.appendChild(el('p', 'them', ['Good point.', 'Thanks for sharing!', 'I agree.', 'Tell me more.'][Math.floor(Math.random() * 4)])); log.scrollTop = 1e6; }, 800); log.scrollTop = 1e6; };
    add(box, label('Rooms'), side, log, row(mi, btn('Send', 'btn', send)), row(host, btn('Host room', 'btn o', function () { var v = host.value.trim(); if (!v || R[v]) return; R[v] = ['Welcome to ' + v + '!']; host.value = ''; join(v); }))); join('Python');
  };

  /* ---------- Bank (Go) ---------- */
  S.bank = function (box) {
    var bal = 1000, tx = [['Opening balance', 1000]], amt = el('input', 'linp'); amt.type = 'number'; amt.min = 1; amt.placeholder = 'Amount'; amt.setAttribute('aria-label', 'Amount'); var o = out(), st = el('div', 'ltable'), bl = el('div', 'lout big');
    function draw() { bl.textContent = 'Balance: ₹' + bal; clear(st); tx.slice(-6).forEach(function (t) { var r = el('div', 'ltr'); add(r, el('span', '', t[0]), el('span', t[1] >= 0 ? 'pos' : 'neg', (t[1] >= 0 ? '+' : '') + t[1])); st.appendChild(r); }); }
    function go(sign) { var v = Math.floor(+amt.value); if (!v || v <= 0) { o.textContent = 'Enter a positive amount.'; return; } if (sign < 0 && v > bal) { o.textContent = 'Refused: insufficient funds.'; SFX('dead'); return; } bal += sign * v; tx.push([sign > 0 ? 'Deposit' : 'Withdraw', sign * v]); o.textContent = (sign > 0 ? 'Deposited ' : 'Withdrew ') + v + '.'; amt.value = ''; SFX('got'); draw(); }
    add(box, bl, row(amt, btn('Deposit', 'btn', function () { go(1); }), btn('Withdraw', 'btn o', function () { go(-1); })), o, label('Statement (last 6)'), st); draw();
  };

  /* ---------- T20 World Cup dashboard ---------- */
  S.cricket = function (box) {
    var P = [['A. Sharma', 'Batter', 52], ['B. Khan', 'Batter', 47], ['C. Perera', 'All-rounder', 41], ['D. Smith', 'Batter', 45], ['E. Rao', 'Bowler', 18], ['F. Lee', 'All-rounder', 38], ['G. Singh', 'Bowler', 12], ['H. Ali', 'Bowler', 15], ['I. Brown', 'Batter', 39], ['J. Patel', 'All-rounder', 36], ['K. Das', 'Bowler', 9], ['L. Wood', 'Bowler', 11]], role = 'All', picked = {}, grid = el('div', 'mgrid2'), summary = out();
    var rc = row(); ['All', 'Batter', 'Bowler', 'All-rounder'].forEach(function (r) { rc.appendChild(chip(r, r === 'All', function () { role = r; [].forEach.call(rc.children, function (b) { b.setAttribute('aria-pressed', String(b.textContent === r)); }); draw(); })); });
    function draw() { clear(grid); P.forEach(function (p) { if (role !== 'All' && p[1] !== role) return; var b = el('button', 'mitem' + (picked[p[0]] ? ' on' : '')); b.type = 'button'; b.setAttribute('aria-pressed', String(!!picked[p[0]])); add(b, el('b', '', p[0]), el('small', '', p[1]), el('span', '', 'avg ' + p[2])); b.addEventListener('click', function () { if (picked[p[0]]) delete picked[p[0]]; else if (Object.keys(picked).length < 11) picked[p[0]] = 1; else summary.textContent = 'Already 11. Remove someone first.'; SFX('tick'); draw(); }); grid.appendChild(b); }); var n = Object.keys(picked).length, tot = P.filter(function (p) { return picked[p[0]]; }).reduce(function (a, p) { return a + p[2]; }, 0); if (n) summary.textContent = 'My XI: ' + n + '/11 picked · combined average ' + tot + '. Names and numbers are made up.'; else summary.textContent = 'Tap players to build your XI. Names and numbers are made up.'; }
    add(box, rc, grid, summary); draw();
  };

  /* ---------- GDP prediction ---------- */
  S.gdp = function (box) {
    var C = { India: [2500, 6.2], Brazil: [9200, 2.1], Vietnam: [4100, 5.6], Germany: [52000, 1.2], Kenya: [2100, 4.8] }, cur = 'India', target = 3, years = 10, host = el('div', 'lchart'), info = out();
    function draw() {
      clear(host); var g0 = C[cur][0], base = C[cur][1] / 100, W = 380, H = 170, s = chart(W, H), goal = g0 * target, need = Math.pow(target, 1 / years) - 1, top = Math.max(goal, g0 * Math.pow(1 + base, years)) * 1.05;
      function line(rate, cls) { var d = ''; for (var y = 0; y <= years; y++) { var v = g0 * Math.pow(1 + rate, y), x = 34 + y * (W - 50) / years, yy = H - 24 - (H - 44) * v / top; d += (y ? 'L' : 'M') + x.toFixed(1) + ' ' + yy.toFixed(1); } s.appendChild(sv('path', { d: d, 'class': cls })); }
      s.appendChild(sv('line', { x1: 30, y1: H - 24, x2: W - 6, y2: H - 24, 'class': 'ax' })); line(base, 'ln'); line(need, 'ln fc'); T(s, 34, 12, 'Solid: model baseline. Dashed: needed to hit the target.', 'start'); T(s, 34, H - 8, 'now', 'start'); T(s, W - 12, H - 8, years + 'y', 'end'); host.appendChild(s);
      info.textContent = cur + ': GDP per capita ' + g0.toLocaleString() + ' (sample). To reach ' + target + 'x in ' + years + ' years it needs ' + (need * 100).toFixed(1) + '% a year; the baseline is ' + (base * 100).toFixed(1) + '%. ' + (need <= base ? 'On track.' : 'Gap of ' + ((need - base) * 100).toFixed(1) + ' points: consider investing in skills, exports and infrastructure.');
    }
    var tl = el('span', 'lv', target + 'x'), yl = el('span', 'lv', years + ' yrs');
    add(box, label('Country (made-up sample numbers)'), row(sel(Object.keys(C), function (v) { cur = v; draw(); })), label('Growth target'), row(slider(1.2, 5, target, .1, function (v) { target = v; tl.textContent = v.toFixed(1) + 'x'; draw(); }), tl), label('Years'), row(slider(3, 25, years, 1, function (v) { years = v; yl.textContent = v + ' yrs'; draw(); }), yl), host, info); tl.textContent = target.toFixed(1) + 'x'; draw();
  };

  window.LAB = { sims: S, el: el, btn: btn, chip: chip, row: row, clear: clear };
})();
