/* Canvas simulators (chat backend, traffic jam) and the job ranker, plus the mount helper. Needs lab.js first. */
(function () {
  'use strict';
  var L = window.LAB, S = L.sims, el = L.el, btn = L.btn, chip = L.chip, row = L.row, clear = L.clear;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function sfx(n) { if (window.__sfx && window.__sfx[n]) window.__sfx[n](); }
  function stat(label, id) { var d = el('div', 'stat'); d.appendChild(el('small', '', label)); var s = el('strong', '', '0'); d.appendChild(s); d.s = s; return d; }
  /* runs fn each frame while the canvas is on screen and the sim is mounted */
  function loop(box, cv, fn) {
    var alive = true, vis = true, last = 0, io = null;
    if (typeof IntersectionObserver === 'function') { io = new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }); io.observe(cv); }
    function f(ts) { if (!alive) return; requestAnimationFrame(f); var dt = Math.min(.05, (ts - last) / 1000 || .016); last = ts; if (!vis || document.hidden) return; fn(dt); }
    requestAnimationFrame(f);
    var prev = box.__stop; box.__stop = function () { alive = false; if (io) io.disconnect(); if (prev) prev(); };
  }
  function fit(cv, W, H) { var w = Math.max(240, cv.clientWidth || 600), s = w / W; cv.width = Math.round(w * DPR); cv.height = Math.round(W ? (H * s) * DPR : 200); cv.style.height = Math.round(H * s) + 'px'; return s; }

  /* ---------- chat backend ---------- */
  S.chat = function (box) {
    var W = 800, H = 340, cv = el('canvas', 'lcan'); cv.setAttribute('aria-hidden', 'true'); var g = cv.getContext('2d'), sx = 1;
    var CL = [], GW = [{ x: 235, y: 60, alive: true }, { x: 235, y: 170, alive: true }, { x: 235, y: 280, alive: true }], parts = [], st = { s: 0, d: 0, r: 0 };
    for (var i = 0; i < 6; i++) CL.push({ x: 50, y: 30 + i * 56, gw: Math.floor(i / 2), col: ['#ff8a1f', '#5b8cff', '#3ddc97', '#b57bff', '#ff5a8a', '#ffd24d'][i] });
    var KF = { x: 400, y: 20, w: 34, h: 300 }, SV = [{ x: 560, y: 90, n: 'Chat' }, { x: 560, y: 250, n: 'Groups' }], DB = [{ x: 730, y: 90, n: 'Redis' }, { x: 730, y: 250, n: 'Cassandra' }];
    var nS = stat('SENT'), nD = stat('DELIVERED'), nR = stat('REPLAYED'), nL = stat('LOST'); nL.s.textContent = '0'; var live = el('p', 'sr'); live.setAttribute('aria-live', 'polite');
    function alive(i) { if (GW[i].alive) return i; for (var k = 1; k < 3; k++) if (GW[(i + k) % 3].alive) return (i + k) % 3; return -1; }
    function send(a, b, col) { var ga = alive(CL[a].gw), gb = alive(CL[b].gw); st.s++; if (ga < 0) return; var sv = Math.random() < .5 ? 0 : 1; parts.push({ col: col, from: a, to: b, step: 0, t: 0, wp: ['c', 'g', 'k', 's', 'd', 'k2', 'g2', 'c2'], sv: sv, db: sv, gwA: ga, gwB: gb, re: false }); }
    function pos(p) { var f = CL[p.from], t = CL[p.to], k = p.wp[p.step]; if (k === 'c') return [f.x + 12, f.y]; if (k === 'g') return [GW[p.gwA].x, GW[p.gwA].y]; if (k === 'k') return [KF.x + KF.w / 2, GW[p.gwA].y]; if (k === 's') return [SV[p.sv].x, SV[p.sv].y]; if (k === 'd') return [DB[p.db].x, DB[p.db].y]; if (k === 'k2') return [KF.x + KF.w / 2, GW[p.gwB].y]; if (k === 'g2') return [GW[p.gwB].x, GW[p.gwB].y]; return [t.x + 12, t.y]; }
    function step(dt) {
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i], a = pos(p), nx = p.wp[p.step + 1]; if (!nx) { parts.splice(i, 1); st.d++; continue; }
        p.step++; var b = pos(p); p.step--; var len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; p.t += dt * 380 / len;
        var nk = p.wp[p.step + 1]; if ((nk === 'g' && !GW[p.gwA].alive) || (nk === 'g2' && !GW[p.gwB].alive)) { var al = alive(nk === 'g' ? p.gwA : p.gwB); if (al < 0) continue; if (nk === 'g') p.gwA = al; else p.gwB = al; p.re = true; st.r++; }
        if (p.t >= 1) { p.t = 0; p.step++; }
      }
      nS.s.textContent = st.s; nD.s.textContent = st.d; nR.s.textContent = st.r;
    }
    function box2(x, y, n, w, col) { g.fillStyle = '#131b2e'; rr(g, x - w / 2, y - 20, w, 40, 10); g.fill(); g.strokeStyle = col; g.lineWidth = 2; g.stroke(); g.fillStyle = '#e6ecfa'; g.font = '700 13px ui-sans-serif,sans-serif'; g.textAlign = 'center'; g.fillText(n, x, y + 5); }
    function draw() {
      g.setTransform(DPR * sx, 0, 0, DPR * sx, 0, 0); g.clearRect(0, 0, W, H); g.lineWidth = 1;
      CL.forEach(function (c) { var gi = alive(c.gw), w = GW[gi < 0 ? 0 : gi]; g.strokeStyle = GW[c.gw].alive ? c.col : 'rgba(255,90,90,.6)'; g.globalAlpha = .5; g.lineWidth = 2; g.setLineDash(GW[c.gw].alive ? [] : [4, 5]); g.beginPath(); g.moveTo(c.x + 12, c.y); g.lineTo(w.x - 28, w.y); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; });
      g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = 1; GW.forEach(function (w) { g.beginPath(); g.moveTo(w.x + 28, w.y); g.lineTo(KF.x, w.y); g.stroke(); });
      [[SV[0], DB[0]], [SV[1], DB[1]]].forEach(function (p) { g.beginPath(); g.moveTo(p[0].x + 30, p[0].y); g.lineTo(p[1].x - 30, p[1].y); g.stroke(); }); SV.forEach(function (s) { g.beginPath(); g.moveTo(KF.x + KF.w, s.y); g.lineTo(s.x - 30, s.y); g.stroke(); });
      var kg = g.createLinearGradient(KF.x, 0, KF.x + KF.w, 0); kg.addColorStop(0, '#1a2540'); kg.addColorStop(1, '#27375e'); g.fillStyle = kg; rr(g, KF.x, KF.y, KF.w, KF.h, 10); g.fill(); g.strokeStyle = '#5b8cff'; g.lineWidth = 2; g.stroke();
      g.save(); g.translate(KF.x + KF.w / 2, KF.y + KF.h / 2); g.rotate(-Math.PI / 2); g.fillStyle = '#9fb7ff'; g.font = '700 13px ui-monospace,monospace'; g.textAlign = 'center'; g.fillText('KAFKA', 0, 5); g.restore();
      SV.forEach(function (s) { box2(s.x, s.y, s.n, 88, '#3ddc97'); }); DB.forEach(function (d) { box2(d.x, d.y, d.n, 84, '#b57bff'); });
      GW.forEach(function (w, i) { g.fillStyle = w.alive ? '#13243a' : '#3a1318'; rr(g, w.x - 28, w.y - 24, 56, 48, 10); g.fill(); g.strokeStyle = w.alive ? '#ff8a1f' : '#ff5a5a'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#fff'; g.font = '700 13px ui-sans-serif,sans-serif'; g.textAlign = 'center'; g.fillText(w.alive ? 'GW ' + (i + 1) : 'DOWN', w.x, w.y + 4); });
      CL.forEach(function (c, i) { g.fillStyle = c.col; g.beginPath(); g.arc(c.x, c.y, 13, 0, 6.3); g.fill(); g.fillStyle = '#0a0e18'; g.font = '800 13px ui-sans-serif,sans-serif'; g.textAlign = 'center'; g.fillText(String.fromCharCode(65 + i), c.x, c.y + 4.5); });
      parts.forEach(function (p) { var a = pos(p), nx = p.wp[p.step + 1]; if (!nx) return; p.step++; var b = pos(p); p.step--; var x = lerp(a[0], b[0], p.t), y = lerp(a[1], b[1], p.t); g.save(); g.globalCompositeOperation = 'lighter'; var gr = g.createRadialGradient(x, y, 0, x, y, 16); gr.addColorStop(0, p.re ? 'rgba(255,90,90,.9)' : p.col); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - 16, y - 16, 32, 32); g.restore(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 3.4, 0, 6.3); g.fill(); });
    }
    function rnd2() { var a = Math.floor(Math.random() * 6), b; do { b = Math.floor(Math.random() * 6); } while (b === a); return [a, b]; }
    var timers = [];
    add(box, cv, row(btn('Send a message', 'btn', function () { var p = rnd2(); send(p[0], p[1], CL[p[0]].col); sfx('send'); live.textContent = 'Message sent'; }), btn('Group blast x20', 'btn o', function () { sfx('whoosh'); for (var i = 0; i < 20; i++) (function (i) { timers.push(setTimeout(function () { var p = rnd2(); send(p[0], p[1], CL[p[0]].col); }, i * 70)); })(i); }), btn('Kill a gateway', 'btn o', function () { var al = GW.filter(function (w) { return w.alive; }); if (al.length <= 1) { live.textContent = 'Keep at least one gateway alive'; return; } al[Math.floor(Math.random() * al.length)].alive = false; sfx('dead'); live.textContent = 'A gateway went down. Clients reconnect to another.'; }), btn('Bring all back', 'btn o', function () { GW.forEach(function (w) { w.alive = true; }); sfx('got'); })));
    var stats = el('div', 'stats'); [nS, nD, nR, nL].forEach(function (s) { stats.appendChild(s); }); box.appendChild(stats); box.appendChild(live);
    function add(p) { for (var i = 1; i < arguments.length; i++) p.appendChild(arguments[i]); }
    sx = fit(cv, W, H); var onR = function () { sx = fit(cv, W, H); }; window.addEventListener('resize', onR);
    loop(box, cv, function (dt) { step(dt); draw(); }); var prev = box.__stop; box.__stop = function () { window.removeEventListener('resize', onR); timers.forEach(clearTimeout); prev(); };
  };

  /* ---------- traffic jam ---------- */
  S.jam = function (box) {
    var W = 800, H = 340, cv = el('canvas', 'lcan'); cv.setAttribute('aria-hidden', 'true'); var g = cv.getContext('2d'), sx = 1;
    var inst = 1, users = 20, queue = 0, lat = 400, work = 0, hist = [], acc = 0, ramp = 0, nz = 0, said = '';
    for (var i = 0; i < 90; i++) hist.push([400, 0, 0]);
    var sI = stat('INSTANCES'), sW = stat('ACTIVE WORKERS'), sQ = stat('QUEUE'), sL = stat('LATENCY'), live = el('p', 'sr'); live.setAttribute('aria-live', 'polite');
    var usr = el('input'); usr.type = 'range'; usr.min = 0; usr.max = 120; usr.value = 20; usr.setAttribute('aria-label', 'Virtual users'); var uv = el('strong', 'lv', '20');
    usr.addEventListener('input', function () { users = +usr.value; uv.textContent = users; ramp = 0; });
    function tick(dt) {
      if (ramp > 0) { ramp -= dt; users = Math.min(50, users + dt * 30); if (ramp <= 0) users = +usr.value; usr.value = Math.round(users); uv.textContent = Math.round(users); }
      var lam = users * .5, cap = inst * 4 / .4; nz = lerp(nz, (Math.random() - .5) * .3, .1);
      queue = clamp(queue + (lam * (1 + nz) - cap) * dt, 0, 400); var w = clamp(Math.ceil(Math.min(lam + queue, cap) * .4), 0, inst * 4);
      lat = Math.min(2600, 400 + (queue / cap) * 1000); work = lerp(work, w, .2);
      acc += dt; if (acc > .25) { acc = 0; hist.push([lat, queue, work]); hist.shift(); }
      sI.s.textContent = inst; sW.s.textContent = Math.round(work) + '/' + inst * 4; sQ.s.textContent = Math.round(queue); sL.s.textContent = Math.round(lat) + ' ms';
      var s = lat > 1200 ? 'Overloaded' : lat > 700 ? 'Slowing down' : 'Healthy'; if (s !== said) { said = s; live.textContent = s; if (s === 'Overloaded') sfx('dead'); }
    }
    function draw() {
      g.setTransform(DPR * sx, 0, 0, DPR * sx, 0, 0); g.clearRect(0, 0, W, H); g.fillStyle = '#0d1424'; rr(g, 0, 0, W, H, 12); g.fill();
      var gx = 20, gy = 36, gw = 500, gh = 180; g.fillStyle = '#9fb0d0'; g.font = '700 13px ui-monospace,monospace'; g.textAlign = 'left'; g.fillText('LATENCY (ms)', gx, 24);
      g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1; for (var i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(gx, gy + gh * i / 4); g.lineTo(gx + gw, gy + gh * i / 4); g.stroke(); }
      g.beginPath(); hist.forEach(function (h, k) { var x = gx + gw * k / (hist.length - 1), y = gy + gh - gh * clamp(h[0] / 1800, 0, 1); if (k) g.lineTo(x, y); else g.moveTo(x, y); });
      var col = lat > 1200 ? '#ff5a5a' : lat > 700 ? '#ffb020' : '#3ddc97'; g.strokeStyle = col; g.lineWidth = 3; g.lineJoin = 'round'; g.stroke(); g.lineTo(gx + gw, gy + gh); g.lineTo(gx, gy + gh); g.closePath(); g.globalAlpha = .12; g.fillStyle = col; g.fill(); g.globalAlpha = 1;
      g.fillStyle = '#6a7898'; g.fillText('1800', gx + gw + 6, gy + 4); g.fillText('0', gx + gw + 6, gy + gh + 4);
      g.fillStyle = '#9fb0d0'; g.fillText('ACTIVE WORKERS', gx, gy + gh + 40); g.beginPath(); hist.forEach(function (h, k) { var x = gx + gw * k / (hist.length - 1), y = gy + gh + 120 - 60 * clamp(h[2] / (inst * 4 || 1), 0, 1); if (k) g.lineTo(x, y); else g.moveTo(x, y); }); g.strokeStyle = '#5b8cff'; g.lineWidth = 2.5; g.stroke();
      var bx = 580; g.fillStyle = '#9fb0d0'; g.fillText('NGINX', bx, 24); g.fillStyle = '#131b2e'; rr(g, bx, 34, 200, 34, 8); g.fill(); g.strokeStyle = '#3ddc97'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#e6ecfa'; g.font = '700 13px ui-sans-serif,sans-serif'; g.fillText('least-connections  ' + Math.round(users) + ' users', bx + 12, 56);
      for (var n = 0; n < 4; n++) { var y = 92 + n * 58, on = n < inst; g.fillStyle = on ? '#131b2e' : 'rgba(255,255,255,.03)'; rr(g, bx, y, 200, 46, 10); g.fill(); g.strokeStyle = on ? '#ff8a1f' : 'rgba(255,255,255,.12)'; g.lineWidth = 2; g.setLineDash(on ? [] : [4, 4]); g.stroke(); g.setLineDash([]); g.fillStyle = on ? '#e6ecfa' : '#556080'; g.font = '700 13px ui-sans-serif,sans-serif'; g.fillText(on ? 'Instance ' + (n + 1) : 'empty slot', bx + 12, y + 18); if (on) { var per = work / inst; for (var k = 0; k < 4; k++) { g.fillStyle = k < Math.round(per) ? '#ff8a1f' : 'rgba(255,255,255,.12)'; rr(g, bx + 12 + k * 30, y + 26, 24, 10, 3); g.fill(); } } }
      g.fillStyle = '#9fb0d0'; g.font = '700 13px ui-monospace,monospace'; g.fillText('QUEUE', 20, 318); g.fillStyle = 'rgba(255,255,255,.1)'; rr(g, 80, 308, 420, 12, 6); g.fill(); g.fillStyle = queue > 150 ? '#ff5a5a' : '#ffb020'; rr(g, 80, 308, Math.max(8, 420 * queue / 400), 12, 6); g.fill();
    }
    var lab = el('label', 'sl'); lab.appendChild(document.createTextNode('Virtual users ')); lab.appendChild(usr); lab.appendChild(uv);
    var r1 = row(lab, btn('Run k6 (50 users)', 'btn', function () { users = 0; ramp = 1.6; sfx('whoosh'); }), btn('Add instance', 'btn o', function () { if (inst < 4) { inst++; sfx('got'); } })), stats = el('div', 'stats');
    [sI, sW, sQ, sL].forEach(function (s) { stats.appendChild(s); }); box.appendChild(cv); box.appendChild(r1); box.appendChild(stats); box.appendChild(live);
    sx = fit(cv, W, H); var onR = function () { sx = fit(cv, W, H); }; window.addEventListener('resize', onR);
    loop(box, cv, function (dt) { tick(dt); draw(); }); var prev = box.__stop; box.__stop = function () { window.removeEventListener('resize', onR); prev(); };
  };

  /* ---------- job hunter ---------- */
  S.jobs = function (box) {
    var SK = ['Python', 'Kafka', 'Redis', 'IAM', 'React', 'Splunk', 'Grafana', 'SQL', 'Power BI', 'GenAI'], pick = {};
    var JOBS = [['Platform Engineer', 'Big Tech', ['Python', 'Kafka', 'Redis', 'Grafana']], ['Identity Engineer', 'Security / IAM', ['IAM', 'Python', 'Splunk']], ['Backend Developer', 'Indian unicorn', ['Python', 'Redis', 'SQL']], ['Data Analyst', 'Product company', ['SQL', 'Power BI', 'Python']], ['SRE', 'Big Tech', ['Grafana', 'Splunk', 'Python', 'Kafka']], ['Frontend Engineer', 'Indian unicorn', ['React', 'SQL']], ['GenAI Engineer', 'Product company', ['GenAI', 'Python', 'Redis']], ['Security Automation Engineer', 'Security / IAM', ['IAM', 'Python', 'Kafka']], ['Integration Architect', 'Big Tech', ['Kafka', 'IAM', 'Redis', 'GenAI']], ['BI Developer', 'Product company', ['Power BI', 'SQL']]];
    var cs = el('div', 'chips'), list = el('ul', 'jobs'); list.setAttribute('aria-live', 'polite');
    SK.forEach(function (s) { cs.appendChild(chip(s, false, function (b) { pick[s] = !pick[s]; b.setAttribute('aria-pressed', String(!!pick[s])); sfx('pop'); render(); window.dispatchEvent(new CustomEvent('vh:jobs', { detail: Object.keys(pick).filter(function (k) { return pick[k]; }).sort().join(',') })); })); });
    function render() {
      var sel = Object.keys(pick).filter(function (k) { return pick[k]; });
      var rows = JOBS.map(function (j) { var m = j[2].filter(function (s) { return pick[s]; }).length; return { j: j, m: m, p: m / j[2].length }; }).sort(function (a, b) { return b.m - a.m || b.p - a.p; });
      clear(list); rows.forEach(function (r) { var li = el('li'), st = el('strong', '', r.j[0]); if (r.p === 1 && sel.length) st.appendChild(el('span', 'badge', 'FULL MATCH')); li.appendChild(st); li.appendChild(el('span', 'sc', r.m + '/' + r.j[2].length)); li.appendChild(el('small', '', r.j[1] + ' · needs ' + r.j[2].join(', '))); var b = el('div', 'lbar'), f = el('i'); f.style.width = Math.round(r.p * 100) + '%'; b.appendChild(f); li.appendChild(b); list.appendChild(li); });
    }
    box.appendChild(el('p', 'lbl', 'Your skills')); box.appendChild(cs); box.appendChild(el('p', 'lbl', 'Sample roles, ranked by match')); box.appendChild(list); render();
  };

  /* ---------- mount helper ---------- */
  L.mount = function (box, slug, lab) {
    if (box.__stop) { try { box.__stop(); } catch (e) { /* ignore */ } box.__stop = null; }
    clear(box); var p = lab.filter(function (x) { return x.slug === slug; })[0]; if (!p) return null;
    var fn = S[p.sim]; var inner = el('div', 'simbox'); box.appendChild(inner);
    if (!fn) { inner.appendChild(el('p', 'lbl', 'No simulator for this one yet.')); return p; }
    fn(inner); box.__stop = inner.__stop || null; return p;
  };
})();
