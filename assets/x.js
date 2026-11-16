/* Round 3 components: palette picker, project wall with live demos, skills graph, career trail, interests film. No libraries. */
(function () {
  'use strict';
  var D = window.D, doc = document, NS = 'http://www.w3.org/2000/svg', RM = matchMedia('(prefers-reduced-motion: reduce)').matches, RT = window.ROOT || '';
  var X = window.X = {};
  function el(t, c, x) { var e = doc.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function sv(t, a, p) { var e = doc.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function icon(key, cls) { var s = sv('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', 'class': cls || 'ic' }); var inner = (window.ICONS || {})[key]; if (inner) { var d = new DOMParser().parseFromString('<svg xmlns="' + NS + '">' + inner + '</svg>', 'image/svg+xml'); [].forEach.call(d.documentElement.childNodes, function (n) { s.appendChild(doc.importNode(n, true)); }); } return s; }
  function css(n) { return getComputedStyle(doc.documentElement).getPropertyValue(n).trim(); }

  /* ------------------------------------------------------------ palette picker (with a custom colour) */
  var PALS = [['tea', 'Tea estate', ['#131a0f', '#e7b172', '#9fc27a']], ['ridge', 'Ridge light', ['#e8eff5', '#b4442a', '#2f6f9f']], ['twilight', 'Fort twilight', ['#17151f', '#f2c987', '#9bb5cd']], ['storm', 'Rooftop storm', ['#1b222d', '#f0e1a6', '#88a2c8']], ['mist', 'Waterfall mist', ['#e9e8ee', '#5a47a8', '#1f6f78']], ['nightsky', 'Milky Way', ['#130810', '#ff9d8a', '#a9b8ff']]];
  function hexToHsl(h) { var r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, s = 0, hh = 0; if (mx !== mn) { var d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; } return [hh, s, l]; }
  X.palette = function () {
    var wrap = el('div', 'pdock'), btn = el('button'), pan = el('div', 'pan'); btn.type = 'button'; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-haspopup', 'true'); pan.hidden = true;
    var sw = el('span', 'sw'); btn.appendChild(sw); btn.appendChild(doc.createTextNode('Colours')); wrap.appendChild(btn); wrap.appendChild(pan);
    pan.appendChild(el('h3', '', 'Pick a mood. All taken from my own photographs.')); var cards = el('div', 'cards'); pan.appendChild(cards);
    function paintSw(el2, cols) { clear(el2); cols.forEach(function (c) { var i = el('i'); i.style.background = c; el2.appendChild(i); }); }
    function apply(id) {
      var root = doc.documentElement; root.removeAttribute('style'); root.setAttribute('data-pal', id); try { localStorage.setItem('v5pal', id); localStorage.removeItem('v4acc'); } catch (e) { /* ignore */ }
      [].forEach.call(cards.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.p === id)); });
      var p = PALS.filter(function (x) { return x[0] === id; })[0]; if (p) paintSw(sw, p[2]); if (window.C && C.onPal) C.onPal(); if (X.onPal) X.onPal();
    }
    PALS.forEach(function (p) { var b = el('button'); b.type = 'button'; b.dataset.p = p[0]; b.setAttribute('aria-pressed', 'false'); var s = el('span', 'sw'); paintSw(s, p[2]); b.appendChild(s); b.appendChild(el('b', '', p[1])); b.addEventListener('click', function () { apply(p[0]); }); cards.appendChild(b); });
    var cust = el('div', 'cust'), lab = el('label', '', 'Or choose your accent'), inp = el('input'); inp.type = 'color'; inp.value = '#e7b172'; inp.id = 'acc'; lab.htmlFor = 'acc'; var rs = el('button', '', 'Reset'); rs.type = 'button';
    inp.addEventListener('input', function () { var h = inp.value, hsl = hexToHsl(h), root = doc.documentElement, light = root.style.colorScheme === 'light' || css('color-scheme').indexOf('light') === 0; root.style.setProperty('--acc', h); root.style.setProperty('--accInk', hsl[2] > 0.58 ? '#14110c' : '#ffffff'); root.style.setProperty('--c1', h); try { localStorage.setItem('v4acc', h); } catch (e) { /* ignore */ } if (window.C && C.onPal) C.onPal(); if (X.onPal) X.onPal(); });
    rs.addEventListener('click', function () { apply(doc.documentElement.getAttribute('data-pal') || 'ridge'); });
    cust.appendChild(lab); cust.appendChild(inp); cust.appendChild(rs); pan.appendChild(cust);
    btn.addEventListener('click', function () { var o = pan.hidden; pan.hidden = !o; btn.setAttribute('aria-expanded', String(o)); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pan.hidden) { pan.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.focus(); } });
    doc.addEventListener('click', function (e) { if (!wrap.contains(e.target) && !pan.hidden) { pan.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
    doc.body.appendChild(wrap);
    var saved = null, acc = null; try { saved = localStorage.getItem('v5pal'); acc = localStorage.getItem('v4acc'); } catch (e) { /* ignore */ }
    apply(saved && PALS.some(function (p) { return p[0] === saved; }) ? saved : 'ridge'); if (acc) { inp.value = acc; inp.dispatchEvent(new Event('input')); }
  };

  /* ------------------------------------------------------------ stat strip */
  X.stats = function () {
    var box = el('div', 'stats'); var N = D.projects.length, P = D.albums.reduce(function (n, a) { return n + a.photos.length; }, 0);
    [[20, '+', 'people led across teams', '#journey', 'See the career journey'], [N, '', 'public projects you can play with', PAGE('work'), 'Open the projects'], [D.skills.length, '', 'skill areas, from identity to GenAI', '#skills', 'See the skills'], [P, '', 'photographs from trails and forts', PAGE('photos'), 'Open the photographs'], [D.realms.reduce(function (n, r) { return n + r.items.length; }, 0), '', 'kinds of adventure, so far', PAGE('explore'), 'Play Signal 32']].forEach(function (s) {
      var d = el('a', 'stat metric'), b = el('b'); d.href = s[3]; d.setAttribute('aria-label', s[0] + (s[1] || '') + ' ' + s[2] + '. ' + s[4]); b.textContent = String(s[0]); d.appendChild(b); if (s[1]) b.appendChild(doc.createTextNode(s[1])); d.appendChild(el('span', '', s[2])); box.appendChild(d);
    }); return box;
  };

  /* ------------------------------------------------------------ doors with real previews */
  X.doors = function () {
    var box = el('div', 'doors2');
    /* two rows drifting in opposite directions, each tile repeated once so the loop is seamless.
       Work: one tile from each project category (five at most). Photographs: one photo from each album (five at most), shown whole, never cropped. */
    function marquee(items) { var m = el('div', 'wmarq'); m.setAttribute('aria-hidden', 'true'); [items, items.slice(2).concat(items.slice(0, 2)).reverse()].forEach(function (row, ri) { var r = el('div', 'wrow' + (ri ? ' rev' : '')); row.concat(row).forEach(function (f) { r.appendChild(f()); }); m.appendChild(r); }); return m; }
    var a1 = el('a', 'door2 workdoor'); a1.href = PAGE('work'); var seen = {}, pick5 = []; D.projects.forEach(function (p) { if (!seen[p.cat] && pick5.length < 5) { seen[p.cat] = 1; pick5.push(p); } });
    a1.appendChild(marquee(pick5.map(function (p) { return function () { var c = el('span', 'wcell'); c.appendChild(projectArt(p.slug)); c.appendChild(el('em', '', p.cat)); return c; }; })));
    a1.appendChild(el('b', '', 'Work')); a1.appendChild(el('span', '', D.projects.length + ' projects you can play with, and the skills behind them.')); box.appendChild(a1);
    var a2 = el('a', 'door2 photodoor'); a2.href = PAGE('photos'); var total = D.albums.reduce(function (n, a) { return n + a.photos.length; }, 0);
    var shots = D.albums.slice(0, 5).map(function (al) { var ls = al.photos.filter(function (x) { return x.w >= x.h; }), p = ls.filter(function (x) { var q = x.w / x.h; return q > 1.25 && q < 1.65; })[1] || ls[0] || al.photos[0]; return { al: al, p: p }; });
    a2.appendChild(marquee(shots.map(function (o) { return function () { var c = el('span', 'wcell pcell'), im = el('img'); im.src = RT + 'images/photography/thumbs/' + encodeURIComponent(o.p.f); im.alt = ''; im.loading = 'lazy'; im.decoding = 'async'; im.width = o.p.w; im.height = o.p.h; c.appendChild(im); c.appendChild(el('em', '', o.al.title + ' · ' + o.al.photos.length)); return c; }; })));
    a2.appendChild(el('b', '', 'Photographs')); a2.appendChild(el('span', '', total + ' frames in ' + D.albums.length + ' albums: peaks, waterfalls, forts, skies, cities and close-ups.')); box.appendChild(a2);
    return box;
  };

  /* ------------------------------------------------------------ about: portrait, never cropped */
  X.about = function () {
    /* a small solar system: the sun glows behind my portrait, nine icons orbit on three rings (3 + 3 + 3).
       Icons only; each has an accessible name and a label that appears on hover, focus or tap. */
    var box = el('div', 'about'), w = el('div', 'sol'); w.appendChild(el('span', 'sun-rays')); w.appendChild(el('span', 'sun-glow')); w.appendChild(el('span', 'sun-core'));
    var RINGS = [
      [['shield', 'Identity at Okta'], ['git-branch', 'Integrations'], ['bot', 'GenAI']],
      [['layers', 'Architecture'], ['database', 'Data and SQL'], ['brain', 'Machine learning']],
      [['mountain-treks', 'Treks'], ['camera', 'Photography'], ['forts', 'Old forts']]
    ];
    RINGS.forEach(function (ring, ri) {
      var rg = el('span', 'orbit o' + (ri + 1)); rg.appendChild(el('span', 'track'));
      ring.forEach(function (o, i) { var slot = el('span', 'slot'); slot.style.setProperty('--a', (i * 120 + ri * 47) + 'deg'); var pl = el('i', 'planet'); pl.tabIndex = 0; pl.setAttribute('role', 'img'); pl.setAttribute('aria-label', o[1]); var face = el('span', 'pf'); face.appendChild(icon(o[0])); face.appendChild(el('em', '', o[1])); pl.appendChild(face); slot.appendChild(pl); rg.appendChild(slot); });
      w.appendChild(rg);
    });
    var im = el('img', 'portrait'); im.src = RT + 'images/vilas-circle.webp'; im.alt = 'Vilas Hegde'; im.width = 900; im.height = 900; im.loading = 'lazy'; w.appendChild(im);
    var key = el('div', 'okey'); [['o1', 'The job'], ['o2', 'The craft'], ['o3', 'Away from the desk']].forEach(function (k) { var s2 = el('span', k[0]); s2.textContent = k[1]; key.appendChild(s2); });
    var left = el('div', 'aleft'); left.appendChild(w); left.appendChild(key); box.appendChild(left); var r = el('div');
r.appendChild(el('p', 'lede', D.bio)); r.appendChild(el('p', 'mute', 'I started by scripting away small, boring tasks and never stopped. These days I design the systems that let products talk to each other safely, and I like teaching what I learn. Away from the desk I am on a trail, at a waterfall or inside an old fort with a camera.')); r.appendChild(el('blockquote', '', D.quotes[1])); box.appendChild(r); return box;
  };

  /* ------------------------------------------------------------ generative project art: one small animated scene per project */
  var KIND = { chat: 0, jam: 1, jobs: 2, ratelimit: 3, chartbuilder: 4, hn: 5, dash: 6, feed: 7, imglab: 8, ytbars: 9, summ: 10, fraud: 11, loan: 12, kmeans: 13, fakenews: 14, neu: 15, crud: 16, fun: 17, market: 18, rooms: 19, bank: 20, cricket: 21, gdp: 22 };
  function glyph(slug, size) {
    var p = D.projects.filter(function (x) { return x.slug === slug; })[0] || {}, W = 300, H = 180, s = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid slice' });
    var c1 = 'var(--c1)', c2 = 'var(--c2)', c3 = 'var(--c3)', c4 = 'var(--c4)', ink = 'var(--mute)', line = 'var(--line)', i, g = sv('g', {}, s);
    function rc(x, y, w, h, f, o, cls, rx) { return sv('rect', { x: x, y: y, width: w, height: h, rx: rx || 3, fill: f, opacity: o == null ? 1 : o, 'class': cls || '' }, g); }
    function ci(x, y, r, f, o, cls) { return sv('circle', { cx: x, cy: y, r: r, fill: f, opacity: o == null ? 1 : o, 'class': cls || '' }, g); }
    function ln(x1, y1, x2, y2, st, w, cls, o) { return sv('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: st, 'stroke-width': w || 1.5, 'class': cls || '', opacity: o == null ? 1 : o, 'stroke-linecap': 'round' }, g); }
    var k = p.sim || slug;
    switch (slug) {
      case 'whatsapp-backend': for (i = 0; i < 5; i++) { ci(40, 30 + i * 30, 7, c2); ln(47, 30 + i * 30, 138, 90, c2, 1.4, 'g-pulse', .7); ln(162, 90, 253, 30 + (4 - i) * 30, c1, 1.4, 'g-pulse', .7); ci(260, 30 + i * 30, 7, c1); } rc(138, 70, 24, 40, c3, 1, 'g-bob', 6); break;
      case 'traffic-jam': for (i = 0; i < 4; i++) { ln(0, 40 + i * 34, W, 40 + i * 34, line, 1); } for (i = 0; i < 9; i++) { var yy = 28 + (i % 4) * 34; rc(10 + i * 32, yy, 22, 12, [c1, c2, c3, c4][i % 4], .9, 'g-belt', 3); } break;
      case 'job-hunter': for (i = 0; i < 6; i++) { rc(34, 22 + i * 24, 20 + ((i * 53) % 150) + 60, 14, i < 2 ? c1 : line, i < 2 ? 1 : .8, '', 7); } ci(246, 60, 26, 'none'); sv('circle', { cx: 246, cy: 70, r: 22, fill: 'none', stroke: c2, 'stroke-width': 4 }, g); ln(262, 86, 282, 112, c2, 5); break;
      case 'autoconnect': for (i = 0; i < 6; i++) { ci(50 + (i % 3) * 100, 50 + Math.floor(i / 3) * 80, 14, i === 4 ? c3 : c2); } ln(64, 50, 136, 50, c1, 2, 'g-pulse'); ln(164, 50, 236, 50, c1, 2, 'g-pulse'); ln(64, 130, 136, 130, c1, 2, 'g-pulse'); ln(150, 64, 150, 116, c1, 2, 'g-pulse'); break;
      case 'custom-data-visualisation': case 'superstore-analysis': case 't20wc-analysis': case 'youtube-data-analysis': for (i = 0; i < 7; i++) { var h = 30 + ((i * 47 + 20) % 90); rc(30 + i * 36, 150 - h, 24, h, [c1, c2, c4][i % 3], .95, 'g-bar', 4); } ln(20, 152, 285, 152, ink, 1.5); sv('path', { d: 'M30 90 Q100 40 150 80 T280 40', fill: 'none', stroke: c3, 'stroke-width': 3, 'stroke-linecap': 'round' }, g); break;
      case 'hackernews-graphql': case 'news-app': for (i = 0; i < 4; i++) { rc(30, 24 + i * 36, 18, 18, i === 1 ? c1 : line, 1, '', 4); rc(60, 26 + i * 36, 120 + ((i * 41) % 80), 8, ink, .7, '', 4); rc(60, 40 + i * 36, 70 + ((i * 23) % 50), 6, line, 1, '', 3); } sv('path', { d: 'M250 40 l12 -16 l12 16', stroke: c1, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g); break;
      case 'image-processing': for (i = 0; i < 80; i++) { var cx = i % 10, cy = Math.floor(i / 10); rc(60 + cx * 18, 22 + cy * 18, 16, 16, [c1, c2, c3, c4][(cx * 3 + cy * 5) % 4], .25 + ((cx + cy * 3) % 5) * .17, '', 2); } break;
      case 'news-summary': case 'fake-news-detection': for (i = 0; i < 8; i++) rc(40, 24 + i * 17, 220 - ((i * 37) % 90), 8, i % 3 === 0 ? c1 : line, 1, '', 4); sv('path', { d: 'M236 130 l12 12 l26 -28', stroke: c2, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); break;
      case 'credit-card-fraud': case 'loan-status-prediction': for (i = 0; i < 38; i++) { var sx = (i * 73) % 250 + 28, sy = 150 - ((i * 41) % 100) - 12; ci(sx, sy, 5, (i % 9 === 0) ? c3 : c2, .9, 'g-bob'); } ln(22, 150, 22, 24, ink, 1.4); ln(22, 150, 285, 150, ink, 1.4); sv('path', { d: 'M24 130 Q150 120 282 30', stroke: c1, 'stroke-width': 2.5, fill: 'none', 'stroke-dasharray': '6 6' }, g); break;
      case 'market-data-kmeans': [[80, 60, c1], [210, 70, c2], [150, 125, c3]].forEach(function (c, j) { for (var q = 0; q < 12; q++) { var a = q * 2.4 + j, rr = 8 + ((q * 17) % 26); ci(c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr, 4.5, c[2], .85, 'g-bob'); } ci(c[0], c[1], 8, 'none'); sv('circle', { cx: c[0], cy: c[1], r: 38, fill: 'none', stroke: c[2], 'stroke-width': 1.5, 'stroke-dasharray': '3 5', opacity: .8 }, g); }); break;
      case 'university-neumorphism': rc(40, 30, 220, 120, 'var(--s2)', 1, '', 24); rc(60, 50, 80, 22, 'var(--bg)', 1, '', 11); rc(60, 86, 180, 12, line, 1, '', 6); rc(60, 108, 140, 12, line, 1, '', 6); ci(222, 62, 18, 'var(--bg)'); break;
      case 'jobapp': case 'marketplace': case 'learnbro': case 'fun-activities': for (i = 0; i < 4; i++) { rc(30 + (i % 2) * 130, 26 + Math.floor(i / 2) * 66, 112, 54, 'var(--s2)', 1, 'g-bob', 8); ci(50 + (i % 2) * 130, 46 + Math.floor(i / 2) * 66, 9, [c1, c2, c3, c4][i]); rc(66 + (i % 2) * 130, 40 + Math.floor(i / 2) * 66, 60, 7, ink, .7, '', 3); rc(66 + (i % 2) * 130, 54 + Math.floor(i / 2) * 66, 40, 6, line, 1, '', 3); } break;
      case 'bank-operations': rc(50, 40, 200, 100, 'var(--s2)', 1, '', 10); rc(50, 60, 200, 18, c1, .9, '', 0); for (i = 0; i < 3; i++) rc(70 + i * 56, 98, 40, 10, line, 1, '', 5); rc(70, 118, 90, 10, ink, .6, '', 5); break;
      case 'gdp-prediction': sv('path', { d: 'M20 140 C80 130 120 100 160 80 S250 30 285 24', stroke: c1, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, g); sv('path', { d: 'M20 140 C90 138 150 120 285 70', stroke: c2, 'stroke-width': 2.5, fill: 'none', 'stroke-dasharray': '6 6' }, g); for (i = 0; i < 6; i++) ci(30 + i * 46, 140 - i * 16 - ((i * 7) % 12), 4, c3); break;
      default: ci(150, 90, 40, c1, .7);
    }
    return s;
  }
  X.glyph = glyph;

  /* ------------------------------------------------------------ project wall + theater with the real playable models */
  X.wall = function (opts) {
    opts = opts || {}; var box = el('div', 'wallbox'), bar = el('div', 'wallbar'), tiles = el('div', 'tiles'), cur = 'All', q = '', list = D.projects.slice();
    var tools = el('div', 'walltools'), sr = el('input'); sr.type = 'search'; sr.placeholder = 'Search 23 projects…'; sr.setAttribute('aria-label', 'Search projects'); sr.autocomplete = 'off'; sr.spellcheck = false; sr.name = 'q';
    var cats = ['All']; D.projects.forEach(function (p) { if (cats.indexOf(p.cat) < 0) cats.push(p.cat); }); bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Filter projects');
    cats.forEach(function (c, i) { var b = el('button', 'chip', c); b.type = 'button'; b.setAttribute('aria-pressed', String(i === 0)); b.addEventListener('click', function () { cur = c; [].forEach.call(bar.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); paint(); }); bar.appendChild(b); });
    sr.addEventListener('input', function () { q = sr.value.trim().toLowerCase(); paint(); });
    tools.appendChild(sr); tools.appendChild(bar); box.appendChild(tools); var cnt = el('p', 'wallcount'); cnt.setAttribute('aria-live', 'polite'); box.appendChild(cnt);
    function match(p) { if (cur !== 'All' && p.cat !== cur) return false; if (!q) return true; return (p.title + ' ' + p.line + ' ' + p.tags.join(' ')).toLowerCase().indexOf(q) > -1; }
    function paint() {
      clear(tiles); var shown = list.filter(match); cnt.textContent = shown.length === list.length ? '' : shown.length + ' of ' + list.length + ' projects'; 
      if (!shown.length) { var em = el('p', 'empty', 'Nothing matches “' + q + '”. Try a tool name like Python, React or Kafka.'); tiles.appendChild(em); return; }
      shown.forEach(function (p) {
        var demo = !!(window.DEMO && DEMO[p.slug]), t = el(demo ? 'button' : 'a', 'tile'); if (demo) { t.type = 'button'; t.setAttribute('aria-label', 'Play with ' + p.title); } else { t.href = 'https://github.com/vilasrhegde/' + p.repo; t.target = '_blank'; t.rel = 'noopener noreferrer'; }
        var art = el('div', 'art'); art.appendChild(window.projectArt ? projectArt(p.slug) : glyph(p.slug)); t.appendChild(art);
        var body = el('div', 'tb'); body.appendChild(el('h3', '', p.title)); body.appendChild(el('p', '', p.line)); t.appendChild(body);
        var go = el('span', 'go'); go.appendChild(doc.createTextNode(demo ? 'Try it live ' : 'See the code ')); go.appendChild(icon(demo ? 'play' : 'arrow')); t.appendChild(go);
        if (demo) t.addEventListener('click', function () { X.theater(p.slug, t); }); tiles.appendChild(t);
      });
      if (window.Anim) Anim.refresh(tiles);
    }
    box.appendChild(tiles); paint(); return box;
  };
  var dlg = null, curSlug = '', from = null;
  X.theater = function (slug, opener) {
    from = opener || doc.activeElement; curSlug = slug;
    if (!dlg) {
      dlg = el('dialog', 'theater'); dlg.setAttribute('aria-label', 'Project demo'); doc.body.appendChild(dlg);
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('close', function () { var m = dlg.querySelector('main'); if (m && m.__stop) try { m.__stop(); } catch (e) { /* ignore */ } doc.documentElement.style.overflow = ''; if (from && from.focus) from.focus(); });
    }
    var P = D.projects.filter(function (z) { return window.DEMO && DEMO[z.slug]; }), i = P.map(function (p) { return p.slug; }).indexOf(slug), p = P[i], full = (window.LABDATA || []).filter(function (x) { return x.slug === slug; })[0] || {};
    clear(dlg); var th = el('div', 'th'), aside = el('aside'), main = el('main'), nav = el('div', 'nav');
    var pv = el('button', '', 'Previous'), nx = el('button', '', 'Next'), cl = el('button', '', 'Close'); [pv, nx, cl].forEach(function (b) { b.type = 'button'; nav.appendChild(b); });
    pv.addEventListener('click', function () { X.theater(P[(i + P.length - 1) % P.length].slug, from); }); nx.addEventListener('click', function () { X.theater(P[(i + 1) % P.length].slug, from); }); cl.addEventListener('click', function () { dlg.close(); });
    aside.appendChild(el('h2', '', p.title)); aside.appendChild(el('p', '', full.what ? full.what.split('. ').slice(0, 2).join('. ') + '.' : p.line));
    var tags = el('div', 'tags'); p.tags.forEach(function (t) { tags.appendChild(el('span', '', t)); }); aside.appendChild(tags);
    if (full.tryit) { var tr = el('div', 'try'); tr.appendChild(el('small', '', 'Try this')); tr.appendChild(doc.createTextNode(full.tryit)); aside.appendChild(tr); }
    if (full.how) { var dt = el('details'); dt.appendChild(el('summary', '', 'How it works')); var u = el('ul'); u.style.cssText = 'margin:8px 0 0;padding-left:18px;color:var(--mute);font-size:15px;display:grid;gap:6px'; full.how.slice(0, 4).forEach(function (h) { u.appendChild(el('li', '', h)); }); dt.appendChild(u); aside.appendChild(dt); }
    var acts = el('div', 'acts'), g = el('a', 'btn', 'Code on GitHub'); g.href = 'https://github.com/vilasrhegde/' + p.repo; g.target = '_blank'; g.rel = 'noopener noreferrer'; acts.appendChild(g); aside.appendChild(acts);
    var lb = el('div', 'labbox'); main.appendChild(lb); main.style.position = 'relative'; th.appendChild(aside); th.appendChild(main); dlg.appendChild(nav); dlg.appendChild(th);
    if (!dlg.open) { dlg.showModal(); doc.documentElement.style.overflow = 'hidden'; }
    try { window.LAB.mount(lb, slug, window.LABDATA || []); main.__stop = lb.__stop; } catch (e) { lb.appendChild(el('p', '', 'This demo needs a moment. Try another project.')); }
    dlg.querySelector('.nav button:last-child').focus();
  };

  /* ------------------------------------------------------------ skills: a living network + real usage charts */
  X.skills = function () {
    /* hand-drawn notebook look: wobbly pencil outlines, hatch fills, sticky-note detail. Everything is drawn from real data. */
    var out = el('div', 'sketch'), S = D.skills, E = D.edges, W = 760, H = 470, PEN = '#2a2a2e';
    var GN = ['Build', 'Run', 'Data', 'Learn from data'], GI = { 0: 0, 1: 0, 2: 0, 5: 0, 6: 0, 9: 0, 3: 1, 4: 1, 7: 1, 8: 1, 10: 1, 11: 2, 14: 2, 12: 3, 13: 3, 15: 3 };
    var COL = ['#e0644a', '#4a90c9', '#d9a441', '#6dae4a'], uid = 'sk' + Math.random().toString(36).slice(2, 6);
    function rnd(seed) { return function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }; }
    function blob(r, rad, j) { var pts = [], n = 24, o = r() * 6, i; for (i = 0; i <= n + 2; i++) { var a = i / n * Math.PI * 2 + o * .1, q = rad + (r() - .5) * j; pts.push((q * Math.cos(a)).toFixed(1) + ' ' + (q * Math.sin(a)).toFixed(1)); } return 'M' + pts.join(' L'); }
    function wline(r, x1, y1, x2, y2, j) { return 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Q' + ((x1 + x2) / 2 + (r() - .5) * j * 2).toFixed(1) + ' ' + ((y1 + y2) / 2 + (r() - .5) * j * 2).toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1); }
    function hatch(defs, id, col, ang, sz) { var p = sv('pattern', { id: id, width: sz, height: sz, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(' + ang + ')' }, defs); sv('rect', { width: sz, height: sz, fill: col, opacity: .2 }, p); sv('line', { x1: 0, y1: 0, x2: 0, y2: sz, stroke: col, 'stroke-width': 2.4 }, p); return 'url(#' + id + ')'; }
    function nbOf(i) { var r = []; E.forEach(function (e) { if (e[0] === i) r.push(e[1]); else if (e[1] === i) r.push(e[0]); }); return r; }
    function projFor(n) { var T = { 'Backend & APIs': ['Django', 'GraphQL', 'Go', 'WebSockets', 'PHP'], Frontend: ['React', 'Bootstrap', 'CSS'], 'Distributed Systems': ['Kafka', 'Redis', 'Cassandra'], Observability: ['Observability', 'Prometheus', 'Grafana'], 'Cloud & Containers': ['Docker', 'Nginx'], 'Data & Databases': ['SQLite', 'MySQL', 'Cassandra'], GenAI: [], 'Machine Learning': ['scikit-learn', 'OpenCV', 'NLTK', 'TensorFlow'], Analytics: ['Power BI', 'pandas', 'Streamlit', 'Dashboards'], Automation: ['Automation', 'Scraping'] }[n] || []; return D.projects.filter(function (p) { return p.tags.some(function (t) { return T.indexOf(t) > -1; }); }); }
    var deg = S.map(function (s, i) { return nbOf(i).length; });
    /* deterministic layout: groups pull to the four corners, links pull together, nodes push apart, then stretch to fill */
    var gc = [[200, 130], [560, 125], [190, 355], [570, 355]], P = S.map(function (s, i) { var c = gc[GI[i]]; return { x: c[0] + Math.cos(i * 2.1) * 60, y: c[1] + Math.sin(i * 1.7) * 50, r: 15 + deg[i] * 1.7, vx: 0, vy: 0 }; }), it;
    for (it = 0; it < 420; it++) { var k = 1 - it / 420; P.forEach(function (a, i) { var c = gc[GI[i]]; a.vx = (c[0] - a.x) * .006; a.vy = (c[1] - a.y) * .006; P.forEach(function (b, j) { if (i === j) return; var dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, m = a.r + b.r + 60; if (d < m) { a.vx += dx / d * (m - d) * .35; a.vy += dy / d * (m - d) * .35; } }); });
      E.forEach(function (e) { var a = P[e[0]], b = P[e[1]], dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, f = (d - 150) * .0012; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f; });
      P.forEach(function (a) { a.x += a.vx * (.3 + k) * 2; a.y += a.vy * (.3 + k) * 2; a.x = Math.max(70, Math.min(W - 70, a.x)); a.y = Math.max(42, Math.min(H - 52, a.y)); }); }
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; P.forEach(function (a) { x0 = Math.min(x0, a.x); x1 = Math.max(x1, a.x); y0 = Math.min(y0, a.y); y1 = Math.max(y1, a.y); });
    P.forEach(function (a) { a.x = 80 + (a.x - x0) / (x1 - x0 || 1) * (W - 160); a.y = 44 + (a.y - y0) / (y1 - y0 || 1) * (H - 110); });

    var grid = el('div', 'gwrap'), card = el('div', 'gcard skn-card'), det = el('aside', 'gdet note'); det.setAttribute('aria-live', 'polite');
    card.appendChild(el('h3', 'sk-h', 'The skill network')); card.appendChild(el('p', 'sk-p', 'Bigger means connected to more skills. Hover or tap a skill to light up its links.'));
    var svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'group', 'aria-label': 'Skill network. Select a skill to see what connects to it.' }), defs = sv('defs', {}, svg), r = rnd(7), eg = sv('g', {}, svg), ng = sv('g', {}, svg), edges = [], nodes = [], sel = -1;
    E.forEach(function (e) { edges.push({ a: e[0], b: e[1], el: sv('path', { d: wline(r, P[e[0]].x, P[e[0]].y, P[e[1]].x, P[e[1]].y, 5), 'class': 'ske' }, eg) }); });
    S.forEach(function (s, i) {
      var p = P[i], col = COL[GI[i]], g = sv('g', { 'class': 'skg', tabindex: '0', role: 'button', 'aria-label': s.n, transform: 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')' }, ng), fill = hatch(defs, uid + 'h' + i, col, 30 + i * 17, 6);
      sv('path', { d: blob(r, p.r, 3), fill: fill, stroke: 'none' }, g); sv('path', { d: blob(r, p.r, 3.5), fill: 'none', stroke: PEN, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g); sv('path', { d: blob(r, p.r + 1.5, 4), fill: 'none', stroke: PEN, 'stroke-width': 1, opacity: .5 }, g);
      sv('text', { y: p.r + 18, 'text-anchor': 'middle', 'class': 'sklab' }, g).textContent = s.n;
      g.addEventListener('click', function () { pick(i); }); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } });
      g.addEventListener('pointerenter', function () { if (sel < 0) hov(i, true); }); g.addEventListener('pointerleave', function () { if (sel < 0) hov(i, false); }); nodes.push(g);
    });
    function hov(i, on) { card.classList.toggle('sel', on); var nb = nbOf(i); nodes.forEach(function (n, j) { n.classList.toggle('on', on && j === i); n.classList.toggle('nb', on && nb.indexOf(j) > -1); }); edges.forEach(function (e) { var m = on && (e.a === i || e.b === i); e.el.classList.toggle('on', m); e.el.style.stroke = m ? COL[GI[i]] : ''; }); }
    function pick(i) {
      if (sel > -1) hov(sel, false); sel = i; hov(i, true); var s = S[i], nb = nbOf(i); clear(det);
      var sm = el('small', '', GN[GI[i]]); sm.style.color = COL[GI[i]]; det.appendChild(sm); det.appendChild(el('h3', '', s.n));
      var tl = el('div', 'tools'); (Array.isArray(s.s) ? s.s : String(s.s).split(',')).slice(0, 8).forEach(function (t) { tl.appendChild(el('span', '', String(t).trim())); }); det.appendChild(tl);
      var pf = projFor(s.n); if (pf.length) { var u = el('div', 'uses'); u.appendChild(el('small', '', 'Used in ' + pf.length + (pf.length === 1 ? ' project' : ' projects') + '. Open one:')); pf.slice(0, 5).forEach(function (p) { var b = el('button', '', p.title.split(':')[0].split(' built')[0]); b.type = 'button'; b.addEventListener('click', function () { X.theater(p.slug, b); }); u.appendChild(b); }); det.appendChild(u); }
      if (nb.length) { var u2 = el('div', 'uses'); u2.appendChild(el('small', '', 'Works closely with:')); nb.forEach(function (j) { var b = el('button', '', S[j].n); b.type = 'button'; b.addEventListener('click', function () { pick(j); }); u2.appendChild(b); }); det.appendChild(u2); }
    }
    function showDefault() { clear(det); det.appendChild(el('h3', '', 'Sixteen skills, one notebook page.')); det.appendChild(el('p', 'where', 'Select a skill to see its tools, the projects that used it, and which skills it works closely with.')); }
    svg.addEventListener('click', function (e) { if (e.target === svg) { if (sel > -1) hov(sel, false); sel = -1; showDefault(); } });
    card.appendChild(svg); var leg = el('div', 'gleg'); GN.forEach(function (n, i) { var sp = el('span'), d = el('i'); d.style.background = COL[i]; sp.appendChild(d); sp.appendChild(doc.createTextNode(n)); leg.appendChild(sp); }); card.appendChild(leg);
    showDefault(); grid.appendChild(card); grid.appendChild(det); out.appendChild(grid);

    /* bars: tool counts from the real projects, hatched pencil bars */
    var row = el('div', 'chartrow'), c1 = el('div', 'chartcard'), c2 = el('div', 'chartcard');
    c1.appendChild(el('h3', '', 'What I reach for most')); c1.appendChild(el('p', '', 'Counted from the tools tagged on my ' + D.projects.length + ' public projects.'));
    var cnt = {}; D.projects.forEach(function (p) { p.tags.forEach(function (t) { cnt[t] = (cnt[t] || 0) + 1; }); }); var top = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).slice(0, 8), RH = 44, X0 = 130, XW = 370, mx = cnt[top[0]];
    var bs = sv('svg', { viewBox: '0 0 560 ' + (top.length * RH + 8), role: 'img', 'aria-label': 'Most used tools: ' + top.map(function (k) { return k + ' ' + cnt[k]; }).join(', ') }), bd = sv('defs', {}, bs), bars = [], rb = rnd(3);
    top.forEach(function (k, i) {
      var y = i * RH + 8, v = cnt[k], w = v / mx * XW, col = COL[i % 4], g = sv('g', { 'class': 'skbar' }, bs); sv('text', { x: 0, y: y + 22, 'class': 'sktx' }, g).textContent = k;
      sv('path', { d: wline(rb, X0, y + 30, X0 + XW, y + 30, 1.5), stroke: PEN, 'stroke-width': 1, fill: 'none', opacity: .35 }, g);
      var bar = sv('path', { d: 'M' + X0 + ' ' + (y + 10) + ' L' + (X0 + w) + ' ' + (y + 9 + (rb() - .5) * 3).toFixed(1) + ' L' + (X0 + w + (rb() - .5) * 3).toFixed(1) + ' ' + (y + 26) + ' L' + X0 + ' ' + (y + 27) + 'Z', fill: hatch(bd, uid + 'b' + i, col, 45, 7), stroke: PEN, 'stroke-width': 2.2, 'stroke-linejoin': 'round', 'class': 'skfill' }, g); bar.style.transformOrigin = X0 + 'px ' + (y + 18) + 'px'; bars.push(bar);
      sv('text', { x: X0 + XW + 36, y: y + 23, 'text-anchor': 'end', 'class': 'sknum' }, g).textContent = v;
    });
    c1.appendChild(bs);
    /* donut: hand-drawn wedges */
    c2.appendChild(el('h3', '', 'What the projects are about')); c2.appendChild(el('p', '', 'The ' + D.projects.length + ' projects, by kind.'));
    var cat = {}; D.projects.forEach(function (p) { cat[p.cat] = (cat[p.cat] || 0) + 1; }); var keys = Object.keys(cat), TOT = D.projects.length, DC = [COL[0], COL[1], COL[2], COL[3], '#7b8794'];
    var ds = sv('svg', { viewBox: '-130 -130 260 260', role: 'img', 'aria-label': 'Projects by kind: ' + keys.map(function (k) { return k + ' ' + cat[k]; }).join(', ') }), dd = sv('defs', {}, ds), segs = [], a0 = -Math.PI / 2, rd = rnd(11), dn = el('div', 'donut2'), lg = el('div', 'leg');
    function arcP(r0, r1, a, b) { var x = function (rr, t) { return (rr * Math.cos(t)).toFixed(2) + ' ' + (rr * Math.sin(t)).toFixed(2); }, big = b - a > Math.PI ? 1 : 0; return 'M' + x(r1, a) + ' A' + r1 + ' ' + r1 + ' 0 ' + big + ' 1 ' + x(r1, b) + ' L' + x(r0, b) + ' A' + r0 + ' ' + r0 + ' 0 ' + big + ' 0 ' + x(r0, a) + 'Z'; }
    function wob(rr, a, b) { var pts = [], n = Math.max(6, Math.round((b - a) * rr / 6)), i; for (i = 0; i <= n; i++) { var t = a + (b - a) * i / n, q = rr + (rd() - .5) * 2.2; pts.push((q * Math.cos(t)).toFixed(1) + ' ' + (q * Math.sin(t)).toFixed(1)); } return pts; }
    var cn = sv('text', { y: 8, 'text-anchor': 'middle', 'class': 'skbig' }), cl = sv('text', { y: 30, 'text-anchor': 'middle', 'class': 'sksmall' });
    keys.forEach(function (k, i) {
      var a1 = a0 + cat[k] / TOT * Math.PI * 2, g = sv('g', { 'class': 'sksg' }, ds), col = DC[i];
      sv('path', { d: arcP(70, 112, a0 + .03, a1 - .03), fill: hatch(dd, uid + 'd' + i, col, 20 + i * 25, 6) }, g);
      sv('path', { d: 'M' + wob(112, a0 + .03, a1 - .03).join(' L') + ' L' + wob(70, a1 - .03, a0 + .03).join(' L') + 'Z', fill: 'none', stroke: PEN, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
      segs.push(g); a0 = a1;
      var b = el('button'); b.type = 'button'; var d = el('i'); d.style.background = col; b.appendChild(d); b.appendChild(el('span', '', k)); b.appendChild(el('em', '', String(cat[k])));
      function on() { segs.forEach(function (s, j) { s.style.opacity = j === i ? 1 : .25; }); cn.textContent = String(cat[k]); cl.textContent = k.split(' ')[0].toUpperCase(); }
      function off() { segs.forEach(function (s) { s.style.opacity = 1; }); cn.textContent = String(TOT); cl.textContent = 'PROJECTS'; }
      b.addEventListener('pointerenter', on); b.addEventListener('focus', on); b.addEventListener('pointerleave', off); b.addEventListener('blur', off); lg.appendChild(b);
    });
    ds.appendChild(cn); ds.appendChild(cl); cn.textContent = String(TOT); cl.textContent = 'PROJECTS'; dn.appendChild(ds); dn.appendChild(lg); c2.appendChild(dn);
    row.appendChild(c1); row.appendChild(c2); out.appendChild(row);
    var drawn = false; function draw() { if (drawn) return; drawn = true; bars.forEach(function (b, i) { b.style.animationDelay = (i * 70) + 'ms'; b.classList.add('go'); }); }
    if ('IntersectionObserver' in window && !RM) new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { draw(); o.disconnect(); } }, { threshold: .2 }).observe(c1); else draw();
    return out;
  };

  /* ------------------------------------------------------------ career: a trail you walk */
  X.trail = function () {
    var steps = D.career.filter(function (c) { return c.w !== 'Saturn'; }), box = el('div', 'trail'), card = el('div', 'tcard'), W = 960, H = 340, svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'group', 'aria-label': 'Career trail. Select a flag to read that chapter.' });
    var pts = [[56, 292], [240, 252], [430, 262], [620, 178], [800, 94]], n = Math.min(steps.length, pts.length); pts = pts.slice(0, n);
    var d = 'M' + pts[0][0] + ' ' + pts[0][1]; for (var i = 1; i < n; i++) { var p0 = pts[i - 1], p1 = pts[i], mx = (p0[0] + p1[0]) / 2; d += ' C' + mx + ' ' + p0[1] + ' ' + mx + ' ' + p1[1] + ' ' + p1[0] + ' ' + p1[1]; }
    sv('path', { d: d + ' L' + (pts[n - 1][0] + 60) + ' ' + (pts[n - 1][1] + 8) + ' L' + W + ' ' + H + ' L0 ' + H + ' L0 ' + (pts[0][1] + 6) + ' Z', fill: 'var(--s2)', opacity: .55 }, svg);
    sv('path', { d: 'M0 ' + (pts[0][1] + 46) + ' C200 ' + (pts[0][1] + 10) + ' 360 ' + (pts[1][1] + 70) + ' 540 ' + (pts[3][1] + 80) + ' S800 ' + (pts[4][1] + 70) + ' ' + W + ' ' + (pts[4][1] + 50) + ' L' + W + ' ' + H + ' L0 ' + H + ' Z', fill: 'var(--s1)', opacity: .9 }, svg);
    sv('path', { d: d, fill: 'none', stroke: 'var(--line)', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': '2 9' }, svg);
    var walked = sv('path', { d: d, fill: 'none', stroke: 'var(--acc)', 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
    var L = walked.getTotalLength(); walked.style.strokeDasharray = L; walked.style.strokeDashoffset = L; var flags = [], det = el('div', 'tdet'); det.setAttribute('aria-live', 'polite');
    var hiker = sv('g', { 'class': 'hiker' }, svg); sv('circle', { cx: 0, cy: -17, r: 5 }, hiker); sv('path', { d: 'M0 -11 L0 3 M0 -7 L-6 1 M0 -7 L8 -10 M0 3 L-5 13 M0 3 L5 13 M8 -10 L10 14', stroke: 'var(--acc)', 'stroke-width': 3, 'stroke-linecap': 'round', fill: 'none' }, hiker);
    steps.slice(0, n).forEach(function (c, i) {
      var parts = c.h.split(', '), l1 = parts[0], l2 = (parts[1] ? parts[1] + '  ·  ' : '') + c.y;
      var w = Math.max(l1.length, l2.length) * 8 + 34, flip = pts[i][0] + w > W - 14, dir = flip ? -1 : 1;
      var g = sv('g', { 'class': 'flag', tabindex: '0', role: 'button', 'aria-label': c.y + ': ' + c.h, transform: 'translate(' + pts[i][0] + ' ' + pts[i][1] + ')' }, svg); sv('line', { x1: 0, y1: 0, x2: 0, y2: -62, 'class': 'pole' }, g);
      var x2 = dir * w, notch = dir * (w - 14); sv('path', { d: 'M0 -62 H' + x2 + ' L' + notch + ' -42 L' + x2 + ' -22 H0 Z', 'class': 'pen' }, g);
      var tx = sv('text', { x: dir * 12, y: -43, 'class': 't', 'text-anchor': flip ? 'end' : 'start' }, g); tx.textContent = l1; var t2 = sv('text', { x: dir * 12, y: -29, 'class': 'yr t2', 'text-anchor': flip ? 'end' : 'start' }, g); t2.textContent = l2;
      g.addEventListener('click', function () { pick(i); }); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } }); flags.push(g);
    });
    function place(i) { hiker.setAttribute('transform', 'translate(' + (pts[i][0] - 22) + ' ' + (pts[i][1] - 2) + ')'); walked.style.transition = RM ? 'none' : 'stroke-dashoffset 1.1s cubic-bezier(.2,.7,.2,1)'; walked.style.strokeDashoffset = L * (1 - (n > 1 ? i / (n - 1) : 1)); }
    function pick(i) {
      var c = steps[i]; flags.forEach(function (f, j) { f.classList.toggle('on', j === i); f.classList.toggle('reached', j <= i); }); place(i);
      clear(det); det.appendChild(el('time', '', c.y)); var r = el('div'); r.appendChild(el('h3', '', c.h)); r.appendChild(el('p', '', c.p)); if (c.hl && c.hl.length) { var h = el('div', 'hl'); c.hl.slice(0, 4).forEach(function (x) { h.appendChild(el('span', '', x)); }); r.appendChild(h); } det.appendChild(r);
    }
    card.appendChild(svg); card.appendChild(det); box.appendChild(card);
    var hint = el('p', 'mute'); hint.style.cssText = 'margin-top:14px;font-size:15px'; hint.textContent = 'Tap a flag to walk the trail. It starts at the first script and ends where I am now.'; box.appendChild(hint);
    var started = false, tm = 0; function start() { if (started) return; started = true; var i = 0; pick(0); if (RM) { pick(n - 1); return; } tm = setInterval(function () { i++; if (i >= n) { clearInterval(tm); return; } pick(i); }, 1500); }
    flags.forEach(function (f) { f.addEventListener('click', function () { clearInterval(tm); started = true; }); });
    pick(0); if ('IntersectionObserver' in window) new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { start(); o.disconnect(); } }, { threshold: .35 }).observe(box); else pick(n - 1);
    return box;
  };

  /* ------------------------------------------------------------ contact */
  X.contact = function () {
    var box = el('div', 'contact ct2');
    var top = el('div', 'ct-top'), tl = el('div');
    tl.appendChild(el('span', 'ct-kick', 'Status: accepting interesting problems'));
    tl.appendChild(el('h2', '', 'Got an interesting problem? Let us talk.'));
    tl.appendChild(el('p', 'lede mute', 'Job offers, wild ideas, bug reports, trek invites. Pick a door below, each one gets a slightly different version of me.'));
    top.appendChild(tl);
    /* excuse generator: picks a reason to say hi and points at the right channel */
    var EX = [['You have a system that works on Tuesdays only.', 'linkedin'], ['You found a bug in one of my demos. Rude, but welcome.', 'github'], ['You want to argue tabs versus spaces. I will lose politely.', 'x'], ['You know a trek with a view and no crowd. I will post only the flattering photos.', 'instagram'], ['You need someone to read a 40 page design doc. Voluntarily.', 'linkedin'], ['You want to trade a waterfall photo for a code review.', 'instagram'], ['Your pull request has been open since the last full moon.', 'github'], ['You want my unfiltered hot take on identity and access. It is already typed.', 'x']];
    var gen = el('div', 'ct-gen'); gen.setAttribute('aria-live', 'polite');
    gen.appendChild(el('span', 'ct-genk', 'Need a reason to say hi?'));
    var line = el('p', 'ct-line', 'Press the button. Science will provide one.'); gen.appendChild(line);
    var gb = el('button', 'btn ct-gb', 'Give me an excuse'); gb.type = 'button'; gen.appendChild(gb); top.appendChild(gen); box.appendChild(top);
    var NOTE = { github: ['GitHub', 'See the code', 'Reply time: one commit', 'Issues welcome. Stars accepted as payment.'], linkedin: ['LinkedIn', 'Work and roles', 'Reply time: one business day', 'The serious one. I wear a collar here.'], x: ['X', 'Unfiltered thoughts', '', 'Everything I think, unfiltered. The draft folder is empty because nothing stays in there.'], instagram: ['Instagram', 'My good side only', '', 'The curated me. Best angles, golden hour, zero blurry selfies. X has the rest.'] };
    var row = el('div', 'ct-row'), byKey = {}, ix = -1;
    D.social.forEach(function (s, i) {
      var n = NOTE[s.k] || [s.l, s.h, '', ''], a = el('a', 'ct-ch'); a.href = s.u; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.style.setProperty('--i', i); a.setAttribute('aria-label', n[0] + ': ' + n[1] + ' (opens in a new tab)');
      var b = (window.BRAND || {})[s.k], bi = el('span', 'bi'); if (b) { bi.style.background = b.bg; var src = b.svg.indexOf('xmlns') < 0 ? b.svg.replace('<svg', '<svg xmlns="' + NS + '"') : b.svg; var d = new DOMParser().parseFromString(src, 'image/svg+xml'); var s0 = doc.importNode(d.documentElement, true); s0.setAttribute('aria-hidden', 'true'); bi.appendChild(s0); }
      var hd = el('div', 'ct-hd'); hd.appendChild(bi); var nm = el('div'); nm.appendChild(el('b', '', n[0])); nm.appendChild(el('small', '', n[1])); hd.appendChild(nm); hd.appendChild(icon('external', 'ct-ext')); a.appendChild(hd);
      a.appendChild(el('p', 'ct-joke', n[3]));
      byKey[s.k] = a; row.appendChild(a);
    });
    box.appendChild(row);
    gb.addEventListener('click', function () { var j; do { j = Math.floor(Math.random() * EX.length); } while (j === ix && EX.length > 1); ix = j; var e = EX[j], ch = byKey[e[1]]; line.textContent = e[0] + ' Best channel: ' + ((NOTE[e[1]] || [e[1]])[0]) + '.'; line.classList.remove('pop'); void line.offsetWidth; line.classList.add('pop'); gb.textContent = 'Another one'; Object.keys(byKey).forEach(function (k) { byKey[k].classList.toggle('pick', byKey[k] === ch); }); });
    var cta = el('div', 'ct-cta'), v = el('a', 'btn p', 'Save my contact'); v.href = RT + 'vilas.vcf'; v.setAttribute('download', 'vilas-hegde.vcf'); cta.appendChild(v); cta.appendChild(el('span', 'mute', 'A .vcf card. I promise not to call at 3am.')); box.appendChild(cta);
    return box;
  };
})();

