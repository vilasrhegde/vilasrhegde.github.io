/* Vilas Hegde's site. One page: tabs on phones, one long page on wide screens.
   Every chart is terminal text drawn to the screen width in characters.
   Values come from data/site.json (built into assets/data.js). No animation loops; one timer a minute.
   The page also ships the same content as plain HTML (#static) for search engines and no-JS readers. */
(function () {
  "use strict";
  try {
  var doc = document, root = doc.documentElement;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, el) { return (el || doc).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var D = (function () { var el = doc.getElementById("site-data"); try { return JSON.parse(el.textContent) || {}; } catch (e) { return {}; } })();
  var th = store.get("vh-theme");
  if (th === "dark" || th === "light") root.setAttribute("data-t", th);

  /* ---------- text helpers ---------- */
  var ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); };
  var arr = function (x) { return Array.isArray(x) ? x : []; };
  var num = function (x) { x = +x; return isFinite(x) ? x : 0; };
  var str = function (x) { return x == null ? "" : String(x); };
  var rep = function (ch, n) { return n > 0 ? new Array(Math.floor(n) + 1).join(ch) : ""; };
  var padR = function (s, n) { s = str(s); return s.length >= n ? s.slice(0, n) : s + rep(" ", n - s.length); };
  var padL = function (s, n) { s = str(s); return s.length >= n ? s : rep(" ", n - s.length) + s; };
  var trunc = function (s, n) { s = str(s); return s.length <= n ? s : (n <= 1 ? s.slice(0, Math.max(n, 0)) : s.slice(0, n - 1) + "…"); };
  var safeUrl = function (u) { u = str(u).trim(); return /^https?:\/\//i.test(u) ? u : "#"; };
  var S = function (cls, t) { return cls ? '<span class="' + cls + '">' + esc(t) + "</span>" : esc(t); };
  var A = function (cls, t, href) { return '<a class="' + (cls || "") + '" href="' + esc(safeUrl(href)) + '" target="_blank" rel="noopener noreferrer">' + esc(t) + "</a>"; };
  var COLORS = ["g", "b", "y", "r", "v", "c"];
  var col = function (i) { return COLORS[i % COLORS.length]; };
  var toks = function (text, cls, href) { return str(text).split(/\s+/).filter(Boolean).map(function (w) { return { t: w, c: cls || "", h: href }; }); };
  var wrapT = function (tokens, width) {
    width = Math.max(4, width);
    var lines = [], cur = [], len = 0;
    tokens.forEach(function (tk) {
      var t = tk.t;
      while (t.length > width) {
        if (len) { lines.push(cur); cur = []; len = 0; }
        lines.push([{ t: t.slice(0, width), c: tk.c, h: tk.h }]); t = t.slice(width);
      }
      if (!t) return;
      if (!len) { cur.push({ t: t, c: tk.c, h: tk.h }); len = t.length; }
      else if (len + 1 + t.length <= width) { cur.push({ t: t, c: tk.c, h: tk.h }); len += 1 + t.length; }
      else { lines.push(cur); cur = [{ t: t, c: tk.c, h: tk.h }]; len = t.length; }
    });
    if (cur.length || !lines.length) lines.push(cur);
    return lines;
  };
  var lineH = function (ln) { return ln.map(function (x) { return x.h ? A(x.c, x.t, x.h) : S(x.c, x.t); }).join(" "); };
  var link = function (k) { var l = arr(D.links).filter(function (x) { return x && x.k === k; })[0]; return l ? safeUrl(l.url) : "#"; };
  var ghBase = function () { return link("github").replace(/\/$/, ""); };
  var SOURCE = function () { return ghBase() + "/vilasrhegde.github.io"; };
  var shortUrl = function (u) { return str(u).replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, ""); };

  /* ---------- time (India) ---------- */
  var ist = function () { var d = new Date(); return new Date(d.getTime() + (330 + d.getTimezoneOffset()) * 60000); };
  var hhmm = function (d) { return padL(d.getHours(), 2).replace(/ /g, "0") + ":" + padL(d.getMinutes(), 2).replace(/ /g, "0"); };
  var yearFrac = function (d) { var s = new Date(d.getFullYear(), 0, 1), e = new Date(d.getFullYear() + 1, 0, 1); return d.getFullYear() + (d - s) / (e - s); };
  var moodAt = function (h) { return h >= 23 || h < 7 ? "probably asleep" : h < 10 ? "probably on coffee" : h < 19 ? "probably working" : "probably outside"; };
  var uptime = function () { var y = Math.floor(yearFrac(ist()) - num((D.profile || {}).since || 2020)); return y + " years writing code"; };

  /* ---------- renderers: each returns HTML for a <pre>, C = columns ---------- */
  var LOGO = ["██    ██ ██   ██",
              "██    ██ ██   ██",
              " ██  ██  ███████",
              "  ████   ██   ██",
              "   ██    ██   ██"];
  function rNeo(C) {
    var p = D.profile || {}, user = str(p.user) || "vilas";
    var facts = arr(p.facts).map(function (f) { return [str(f && f.k), str(f && f.v)]; }).filter(function (f) { return f[0] || f[1]; });
    facts.push(["uptime", uptime()]);
    var side = C >= 56, w = side ? C - 19 : C, right = [];
    right.push(S("g bold", user) + "@" + S("g bold", "home"));
    right.push(S("mute", rep("-", user.length + 5)));
    facts.forEach(function (f) {
      var key = f[0] + ": ";
      wrapT(toks(f[1]), Math.max(8, w - key.length)).forEach(function (ln, i) {
        right.push((i ? rep(" ", key.length) : S("acc bold", f[0]) + ": ") + lineH(ln));
      });
    });
    right.push("");
    right.push(COLORS.map(function (c) { return S(c, "███"); }).join(""));
    var out = [];
    if (side) {
      for (var i = 0; i < Math.max(LOGO.length, right.length); i++) out.push(S("b", padR(LOGO[i] || "", 16)) + "   " + (right[i] || ""));
    } else {
      LOGO.forEach(function (l) { out.push(S("b", l)); });
      out.push("");
      out = out.concat(right);
    }
    return out.join("\n");
  }
  /* htop CPU meters: label [||||||||       58%] */
  function rMeters(list, C) {
    list = arr(list);
    var lw = Math.min(12, list.reduce(function (m, x) { return Math.max(m, str(x.k).length); }, 3));
    var iw = C - lw - 3;
    return list.map(function (x, i) {
      var v = Math.max(0, Math.min(100, num(x.v))), vt = Math.round(num(x.v)) + "%";
      var bars = Math.min(Math.round(v / 100 * iw), iw - vt.length);
      return S("acc", padR(x.k, lw)) + " [" + S(col(i), rep("|", bars)) + rep(" ", iw - vt.length - bars) + S("mute", vt) + "]";
    }).join("\n");
  }
  /* rich progress bars: day ━━━━━━━━━━━╺━━━━  86% 20:38 */
  function rRich(C) {
    var d = ist(), mins = d.getHours() * 60 + d.getMinutes(), dow = (d.getDay() + 6) % 7, yf = yearFrac(d) - d.getFullYear();
    var start = new Date(d.getFullYear(), 0, 1), doy = Math.floor((d - start) / 864e5) + 1;
    var rows = [["day", mins / 1440, hhmm(d)], ["week", (dow * 1440 + mins) / 10080, ["mon", "tue", "wed", "thu", "fri", "sat", "sun"][dow]], ["year", yf, "day " + doy]];
    var ew = 7, bw = Math.max(8, C - 4 - 1 - 1 - 4 - 1 - ew);
    return rows.map(function (r, i) {
      var dn = Math.round(r[1] * bw), cls = ["g", "b", "y"][i];
      var bar = S(cls, rep("━", dn)) + (dn < bw ? S(cls, "╸") + S("dim", rep("━", bw - dn - 1)) : "");
      return S("acc", padR(r[0], 4)) + " " + bar + " " + padL(Math.round(r[1] * 100) + "%", 4) + " " + S("mute", r[2]);
    }).join("\n");
  }
  /* ps: process list of what is running now */
  function rPs(C) {
    var out = [S("hl", padR("  PID S  COMMAND", C))];
    arr(D.now).forEach(function (n, i) {
      wrapT(toks(n), C - 9).forEach(function (ln, j) {
        out.push(j ? rep(" ", 9) + lineH(ln) : S("mute", padL(101 + i, 5)) + " " + S("g", "R") + "  " + lineH(ln));
      });
    });
    out.push(S("mute", padL(100 + arr(D.now).length + 1, 5)) + " " + S("mute", "S") + "  " + S("mute", trunc(C >= 40 ? "sleep 8h  # not on the list" : "sleep 8h", C - 9)));
    return out.join("\n");
  }
  /* bat: line numbers, gutter, a header */
  function rBat(C) {
    var narrow = C < 50, gut = narrow ? 4 : 7, gw = gut + 2, cw = C - gw;
    var top = rep("─", gut) + "┬" + rep("─", C - gut - 1);
    var mid = rep("─", gut) + "┼" + rep("─", C - gut - 1);
    var bot = rep("─", gut) + "┴" + rep("─", C - gut - 1);
    var out = [S("dim", top), rep(" ", gut) + S("dim", "│") + " File: " + S("bold", "principles.md"), S("dim", mid)];
    var n = 0;
    var put = function (tokens, hang) {
      n++;
      wrapT(tokens, cw - (hang || 0)).forEach(function (ln, i) {
        var g = i ? rep(" ", gut) : padL(n, narrow ? 3 : 4) + rep(" ", gut - (narrow ? 3 : 4));
        out.push(S("mute", g) + S("dim", "│") + " " + (i && hang ? rep(" ", hang) : "") + lineH(ln));
      });
    };
    put(toks("# How I think", "acc bold"));
    put([]);
    arr(D.principles).forEach(function (p, i) {
      put([{ t: (i + 1) + ".", c: "r" }].concat(toks(p && p.t, "bold")), 3);
      put([{ t: "  ", c: "" }].concat(toks(p && p.why, "mute")).slice(1).map(function (x, k) { return k ? x : { t: "   " + x.t, c: x.c }; }), 3);
      put([]);
    });
    out.pop(); n--;
    out.push(S("dim", bot));
    return out.join("\n");
  }
  /* dust: tree with proportional bars */
  function rDust(list, C, rootName) {
    list = arr(list);
    var sum = list.reduce(function (s, x) { return s + Math.max(0, num(x.v)); }, 0) || 1;
    var nw = Math.min(Math.floor(C / 2.6), list.reduce(function (m, x) { return Math.max(m, str(x.k).length); }, 4));
    var bw = Math.max(4, C - 4 - nw - 1 - 1 - 4);
    var out = [S("b bold", padR(rootName, C - 5)) + padL("100%", 5)];
    list.forEach(function (x, i) {
      var v = Math.max(0, num(x.v)), f = Math.round(v / sum * bw);
      out.push(S("dim", i === list.length - 1 ? "└── " : "├── ") + padR(trunc(x.k, nw), nw) + " " +
        S(col(i), rep("█", f)) + S("dim", rep("░", bw - f)) + " " + padL(Math.round(v / sum * 100) + "%", 4));
    });
    return out.join("\n");
  }
  /* column chart (btop style), multi-row with eighth blocks */
  var EIGHTHS = ["", "▁", "▂", "▃", "▄", "▅", "▆", "▇"];
  function rFocus(C) {
    var vals = arr(D.focusByHour).map(num), n = vals.length || 1, H = 5;
    var w = Math.max(1, Math.floor((C - 1) / n)), bar = w >= 3 ? w - 1 : w;
    var max = Math.max.apply(null, vals.concat([1])), out = [];
    for (var r = H - 1; r >= 0; r--) {
      var cls = r >= H - 1 ? "r" : r >= H - 2 ? "y" : "g", line = "";
      vals.forEach(function (v) {
        var e = Math.round(v / max * H * 8), ch = e >= (r + 1) * 8 ? "█" : e > r * 8 ? EIGHTHS[e - r * 8] : " ";
        line += rep(ch, bar) + rep(" ", w - bar);
      });
      out.push(S(cls, line.replace(/\s+$/, "")));
    }
    out.push(S("dim", rep("─", n * w)));
    var lab = rep(" ", n * w).split("");
    [0, 6, 12, 18].forEach(function (h) { if (h < n) { var s = padL(h, 2).replace(" ", "0"); lab[h * w] = s[0]; lab[h * w + 1] = s[1]; } });
    out.push(S("mute", lab.join("")));
    return out.join("\n");
  }
  /* ls -la of the featured projects */
  function rLs(C) {
    var wide = C >= 64, ps = arr(D.projects), out = [];
    var total = arr(D.projectKinds).reduce(function (s, x) { return s + num(x.v); }, 0) || ps.length;
    out.push("total " + total);
    ps.forEach(function (p) {
      p = p || {};
      var url = ghBase() + "/" + encodeURIComponent(str(p.repo));
      var head = S("mute", "drwxr-xr-x") + (wide ? S("mute", " vilas ") : " ") + S("y", padR(str(p.updated) || "-", 7)) + " ";
      var nameW = C - (wide ? 25 : 19);
      out.push(head + A("b bold", trunc(str(p.name) + "/", nameW), url) + (p.running ? S("g", " *") : ""));
      wrapT(toks(p.desc, "mute"), C - 4).forEach(function (ln) { out.push("    " + lineH(ln)); });
      if (p.stack) wrapT(toks(p.stack, "c"), C - 4).forEach(function (ln) { out.push("    " + lineH(ln)); });
    });
    out.push(S("mute", "lrwxr-xr-x") + " " + S("c", "more") + " -> " + A("b", trunc(shortUrl(ghBase()), C - 19), ghBase() + "?tab=repositories"));
    out.push(S("mute", "* = still running"));
    return out.join("\n");
  }
  /* termgraph style vertical histogram */
  function rVhist(C) {
    var list = arr(D.projectKinds), n = list.length || 1, H = 6;
    var cw = Math.max(4, Math.min(12, Math.floor(C / n))), bw = Math.min(cw - 2, cw >= 8 ? 4 : 2);
    var max = Math.max.apply(null, list.map(function (x) { return num(x.v); }).concat([1]));
    var es = list.map(function (x) { return Math.round(Math.max(0, num(x.v)) / max * H * 8); });
    var out = [];
    for (var r = H; r >= 0; r--) {
      var line = "";
      list.forEach(function (x, i) {
        var e = es[i], used = Math.ceil(e / 8), cell;
        if (r === used) { var t = str(Math.round(num(x.v))); cell = S("mute", padR(rep(" ", Math.max(0, Math.floor((bw - t.length) / 2))) + t, cw)); }
        else if (r < used) { var ch = e >= (r + 1) * 8 ? "█" : EIGHTHS[e - r * 8] || "█"; cell = S(col(i), rep(ch, bw)) + rep(" ", cw - bw); }
        else cell = rep(" ", cw);
        line += cell;
      });
      out.push(line.replace(/\s+$/, ""));
    }
    out.push(S("dim", rep("─", n * cw)));
    out.push(list.map(function (x) { return padR(trunc(x.k, cw - 1), cw); }).join("").replace(/\s+$/, ""));
    return out.join("\n");
  }
  /* git log --graph */
  function rGit(C) {
    var cs = arr(D.career), out = [];
    cs.forEach(function (c, i) {
      c = c || {};
      var last = i === cs.length - 1, tk = [{ t: str(c.hash) || "0000000", c: "r" }];
      if (i === 0) tk = tk.concat([{ t: "(HEAD", c: "g bold" }, { t: "->", c: "g bold" }, { t: "main)", c: "g bold" }]);
      tk = tk.concat(toks(c.role)).concat(toks("@ " + str(c.org), "acc")).concat([{ t: str(c.year), c: "mute" }]);
      wrapT(tk, C - 2).forEach(function (ln, j) { out.push((j ? S("acc", last ? " " : "|") + " " : S("y bold", "*") + " ") + lineH(ln)); });
      var br = arr(c.branch).filter(Boolean);
      if (br.length) {
        out.push(S("acc", "|") + S("v", "\\"));
        br.forEach(function (b) {
          wrapT(toks(b), C - 4).forEach(function (ln, j) { out.push(S("acc", "|") + " " + (j ? S("v", "|") + " " : S("v bold", "*") + " ") + lineH(ln)); });
        });
        out.push(S("acc", "|") + S("v", "/"));
      } else if (!last) out.push(S("acc", "|"));
    });
    return out.join("\n");
  }
  /* toml config with links and uses */
  function rToml(C) {
    var out = [S("mute", "# ~/.config/vilas.toml"), "", S("r", "[links]")];
    var ls = arr(D.links), kw = ls.reduce(function (m, x) { return Math.max(m, str(x && x.k).length); }, 2);
    ls.forEach(function (l) {
      l = l || {};
      var disp = shortUrl(l.url), inline = C >= 66, room = C - kw - 5;
      if (!inline && l.note) out.push(S("mute", "# " + trunc(l.note, C - 2)));
      out.push(S("b", padR(l.k, kw)) + " = " + S("g", '"') + A("g", trunc(disp, room), l.url) + S("g", '"') + (inline && l.note ? S("mute", "  # " + trunc(l.note, Math.max(4, C - kw - 9 - disp.length))) : ""));
    });
    out.push("", S("r", "[uses]"));
    var us = arr(D.uses), uw = us.reduce(function (m, x) { return Math.max(m, str(x && x.k).length); }, 2);
    us.forEach(function (u) {
      u = u || {};
      var v = str(u.v), one = padR(u.k, uw) + ' = "' + v + '"';
      if (one.length <= C) { out.push(S("b", padR(u.k, uw)) + " = " + S("g", '"' + v + '"')); return; }
      out.push(S("b", u.k) + " = [");
      var items = v.split(/\s*,\s*/).filter(Boolean), cur = "  ", len = 2;
      items.forEach(function (it) {
        var t = '"' + it + '",';
        if (len > 2 && len + 1 + t.length > C) { out.push(cur); cur = "  "; len = 2; }
        cur += (len > 2 ? " " : "") + S("g", trunc(t, C - 2)); len += (len > 2 ? 1 : 0) + Math.min(t.length, C - 2);
      });
      out.push(cur, "]");
    });
    return out.join("\n");
  }
  function rPhotos() {
    return '<div class="ph">' + arr(D.photos).filter(function (p) { return p && /^[\w-]+$/.test(str(p.file)); }).slice(0, 12).map(function (p) {
      var src = "images/photos/" + encodeURIComponent(p.file) + ".webp";
      return '<figure><img src="' + esc(src) + '" alt="' + esc(p.alt) + '" width="' + num(p.w || 400) + '" height="' + num(p.h || 300) + '" loading="lazy" decoding="async"><figcaption>' + esc(p.file) + ".webp</figcaption></figure>";
    }).join("") + "</div>";
  }
  var DEMO = '<details class="demo"><summary><span class="p">$</span> ./job-hunter --try</summary>' +
    '<p class="mute">Type your skills. Five sample roles get ranked by overlap, the same idea Job Hunter uses on real listings.</p>' +
    '<label for="sk">skills&gt;</label> <input id="sk" value="python, kafka, oauth" autocomplete="off" spellcheck="false" autocapitalize="off"><pre class="art rank" aria-live="polite"></pre></details>';

  /* ---------- page structure ---------- */
  var P = function () { return D.profile || {}; };
  var SECTIONS = [
    { id: "top", label: "top", blocks: [
      { id: "lead", kind: "text", render: function () { return '<p class="lead">' + esc(P().line) + '</p><p class="intro">' + esc(P().intro) + "</p>"; } },
      { id: "neo", cmd: "neofetch", render: rNeo },
      { id: "week", cmd: "vtop --week", render: function (C) { return rMeters(D.week, C); }, note: "Roughly, in a normal week." },
      { id: "clock", cmd: "date +%j  # day, week and year so far", render: rRich, note: "India time. Moves once a minute." },
      { id: "ps", cmd: "ps --mine", render: rPs }] },
    { id: "think", label: "think", blocks: [
      { id: "bat", cmd: "bat principles.md", render: rBat },
      { id: "dust", cmd: "dust ~/work-time", render: function (C) { return rDust(D.workTime, C, "work-time/"); } },
      { id: "focus", cmd: "focus --by-hour", render: rFocus, note: "When I do my best thinking, India time." }] },
    { id: "work", label: "work", blocks: [
      { id: "ls", cmd: "ls -la ~/projects", render: rLs },
      { id: "demo", kind: "static", html: DEMO },
      { id: "kinds", cmd: "termgraph kinds.csv --vertical", render: rVhist, note: "The projects I have written up, by kind." }] },
    { id: "log", label: "log", blocks: [
      { id: "git", cmd: "git log --graph --oneline career", render: rGit },
      { id: "li", kind: "text", render: function () { return '<p class="more"># the full history: ' + A("", shortUrl(link("linkedin")), link("linkedin")) + "</p>"; } }] },
    { id: "pics", label: "pics", blocks: [
      { id: "ph", cmd: "kitty +kitten icat ~/photos/best/*", kind: "text", render: rPhotos },
      { id: "ig", kind: "text", render: function () { return '<p class="more"># every other photo: ' + A("", shortUrl(link("instagram")), link("instagram")) + "</p>"; } }] },
    { id: "links", label: "links", blocks: [
      { id: "toml", cmd: "cat ~/.config/vilas.toml", render: rToml },
      { id: "exit", kind: "text", render: function () { return '<p class="ft"><span class="p">$</span> exit<br><span class="mute">logout. Connection to vilas closed.</span></p>'; } }] }
  ];
  var mk = function (tag, cls, txt) { var e = doc.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  var panes = $("#panes"), fbar = $("#fbar"), probe, cmeas;

  SECTIONS.forEach(function (s, i) {
    var sec = mk("section", "pn"); sec.id = s.id; sec.setAttribute("aria-label", s.label);
    var pi = mk("div", "pi");
    if (!i) { probe = mk("div", "probe"); pi.appendChild(probe); cmeas = mk("pre", "art measure"); cmeas.setAttribute("aria-hidden", "true"); cmeas.textContent = rep("M", 10); pi.appendChild(cmeas); }
    pi.appendChild(mk("h2", "vh", s.label));
    s.blocks.forEach(function (b) {
      var d = mk("div", "blk"); d.id = "b-" + b.id;
      if (b.cmd) { b.cmdEl = mk("p", "cmd"); d.appendChild(b.cmdEl); }
      b.out = mk(b.kind ? "div" : "pre", b.kind ? "out" : "art");
      if (b.kind === "static") b.out.innerHTML = b.html;
      d.appendChild(b.out);
      if (b.note) d.appendChild(mk("p", "note", b.note));
      pi.appendChild(d);
    });
    sec.appendChild(pi); panes.appendChild(sec); s.el = sec;
  });
  var fk = mk("div", "fk"), fx = mk("div", "fx");
  SECTIONS.forEach(function (s, i) {
    var a = mk("a"); a.href = "#" + s.id; a.setAttribute("data-i", i);
    a.appendChild(mk("b", "", "F" + (i + 1))); a.appendChild(mk("span", "", s.label)); fk.appendChild(a);
  });
  [["find", "/", "palette", "Search and shortcuts"]].forEach(function (x) {
    var b = mk("button", x[0]); b.type = "button"; b.setAttribute("data-act", x[2]); b.setAttribute("aria-label", x[3]);
    b.appendChild(mk("b", "", x[1])); b.appendChild(mk("span", "", x[0])); fx.appendChild(b);
  });
  fbar.appendChild(fk); fbar.appendChild(fx);
  var tabLinks = $$("a", fk);

  var C = 0;
  function renderAll() {
    var p = P();
    $("#t-name").textContent = str(p.name) || "Vilas Hegde";
    $("#t-role").textContent = [str(p.role), str(p.company)].filter(Boolean).join(" at ");
    SECTIONS.forEach(function (s) {
      s.blocks.forEach(function (b) {
        if (b.cmdEl) b.cmdEl.innerHTML = '<span class="p">$</span> ' + esc(typeof b.cmd === "function" ? b.cmd() : b.cmd);
        if (b.kind === "static") return;
        try { b.out.innerHTML = b.render(C); } catch (e) { b.out.textContent = "error: " + e.message; }
      });
    });
    rank();
  }
  function renderOne(id) {
    SECTIONS.forEach(function (s) { s.blocks.forEach(function (b) { if (b.id === id) b.out.innerHTML = b.render(C); }); });
  }
  function measure(force) {
    var cw = cmeas.getBoundingClientRect().width / 10 || 8;
    var c = Math.max(30, Math.min(100, Math.floor(probe.clientWidth / cw)));
    if (c !== C || force) { C = c; renderAll(); }
  }

  /* ---------- Job Hunter demo ---------- */
  var roles = [["Integration engineer, identity", ["oauth", "saml", "scim", "python", "rest"]], ["Backend engineer, messaging", ["kafka", "redis", "go", "websockets", "cassandra"]],
    ["GenAI platform engineer", ["python", "llm", "rag", "kafka", "typescript"]], ["Data engineer", ["python", "sql", "spark", "airflow", "power bi"]], ["Frontend engineer", ["react", "typescript", "css", "graphql", "testing"]]];
  function rank() {
    var input = $("#sk"), outp = $(".rank"); if (!input || !outp) return;
    var mine = input.value.toLowerCase().split(/[,;]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var rows = roles.map(function (r) { var hit = r[1].filter(function (k) { return mine.indexOf(k) > -1; }).length; return [hit / r[1].length, r[0]]; })
      .sort(function (a, b) { return b[0] - a[0]; });
    var RC = C - 4, bw = Math.max(5, Math.min(20, RC - 36));
    outp.innerHTML = rows.map(function (r) {
      var f = Math.round(r[0] * bw);
      return S("g", rep("■", f)) + S("dim", rep("□", bw - f)) + " " + padL(Math.round(r[0] * 100) + "%", 4) + " " + esc(trunc(r[1], Math.max(10, RC - bw - 6)));
    }).join("\n");
  }
  doc.addEventListener("input", function (e) { if (e.target.id === "sk") rank(); });

  /* ---------- view mode: tabs or scroll ---------- */
  var mq = window.matchMedia("(max-width: 899px)"), cur = 0, pref = store.get("vh-view");
  var mode = function () { return pref === "tabs" || pref === "scroll" ? pref : (mq.matches ? "tabs" : "scroll"); };
  var tabs = function () { return mode() === "tabs"; };
  function mark(i) {
    if (i < 0 || i >= SECTIONS.length) return;
    cur = i;
    tabLinks.forEach(function (a, j) { if (j === i) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    var a = tabLinks[i]; if (fk.scrollWidth > fk.clientWidth) fk.scrollLeft = Math.max(0, a.offsetLeft - 40);
  }
  function go(i, instant) {
    i = (i + SECTIONS.length) % SECTIONS.length;
    var beh = instant || still ? "auto" : "smooth";
    if (tabs()) panes.scrollTo({ left: i * panes.clientWidth, behavior: beh });
    else if (instant && i === 0) window.scrollTo(0, 0);
    else SECTIONS[i].el.scrollIntoView({ behavior: beh });
    mark(i);
  }
  function applyMode() {
    var m = mode();
    var stat = $("#static"); if (stat) stat.remove();
    root.classList.toggle("m-tabs", m === "tabs"); root.classList.toggle("m-scroll", m === "scroll"); root.classList.remove("boot");
    measure(true);
    go(cur, true);
  }
  var raf = 0;
  panes.addEventListener("scroll", function () {
    if (!tabs() || raf) return;
    raf = requestAnimationFrame(function () { raf = 0; mark(Math.round(panes.scrollLeft / Math.max(1, panes.clientWidth))); });
  }, { passive: true });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (list) {
      if (tabs()) return;
      list.forEach(function (en) { if (en.isIntersecting) mark(SECTIONS.findIndex(function (s) { return s.el === en.target; })); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    SECTIONS.forEach(function (s) { io.observe(s.el); });
  }
  if (mq.addEventListener) mq.addEventListener("change", function () { if (!pref) applyMode(); });
  if ("ResizeObserver" in window) new ResizeObserver(function () { measure(false); if (tabs()) panes.scrollLeft = cur * panes.clientWidth; }).observe(probe);
  else window.addEventListener("resize", function () { measure(false); });
  tabLinks.forEach(function (a, i) { a.addEventListener("click", function (e) { e.preventDefault(); go(i); }); });
  var h0 = location.hash.slice(1), hi = SECTIONS.findIndex(function (s) { return s.id === h0; });
  if (hi > 0) cur = hi;
  applyMode();

  /* ---------- clock: once a minute, paused when hidden ---------- */
  var timer = 0;
  function tick() {
    var d = ist();
    $$("[data-clock]").forEach(function (c) { c.textContent = hhmm(d) + " IST"; c.title = moodAt(d.getHours()); });
    renderOne("clock");
  }
  function startClock() { clearInterval(timer); tick(); timer = setInterval(tick, 60000); }
  doc.addEventListener("visibilitychange", function () { if (doc.hidden) clearInterval(timer); else startClock(); });
  startClock();

  /* ---------- toast, theme, copy ---------- */
  var toastEl = $(".toast"), tt = 0;
  function toast(m) { toastEl.textContent = m; toastEl.classList.add("on"); clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove("on"); }, 1900); }
  var isDark = function () { var t = root.getAttribute("data-t"); return t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches; };
  function theme() { var t = isDark() ? "light" : "dark"; root.setAttribute("data-t", t); store.set("vh-theme", t); toast("theme: " + t); }
  function view() { pref = tabs() ? "scroll" : "tabs"; store.set("vh-view", pref); applyMode(); toast("view: " + pref); }
  function copyText(t, ok) {
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(function () { toast(ok); }, function () { toast("could not copy"); });
    else { var ta = mk("textarea"); ta.value = t; doc.body.appendChild(ta); ta.select(); try { doc.execCommand("copy"); toast(ok); } catch (e) { toast("could not copy"); } ta.remove(); }
  }
  var copyLink = function () { copyText(location.href.split("#")[0] + "#" + SECTIONS[cur].id, "link copied"); };
  var openU = function (u) { window.open(safeUrl(u), "_blank", "noopener,noreferrer"); };
  function top(end) {
    if (tabs()) { var pn = SECTIONS[cur].el; pn.scrollTo({ top: end ? pn.scrollHeight : 0, behavior: still ? "auto" : "smooth" }); }
    else window.scrollTo({ top: end ? doc.documentElement.scrollHeight : 0, behavior: still ? "auto" : "smooth" });
  }

  /* ---------- shortcuts, palette, help ---------- */
  var KEYS = [["/", "Ctrl K, ⌘K", "search: jump, open, run"], ["?", "", "this list"], ["1–6", "F1–F6", "jump to a section"],
    ["j k", "", "next / previous section"], ["h l", "← →", "previous / next tab"], ["g g", "G", "top / bottom"],
    ["g t", "g w, g c, g p, g l", "go to think, work, career, pics, links"], ["v", "", "switch tabs / one long page"], ["t", "", "light / dark"],
    ["y", "", "copy a link to this section"], [".", "", "view source on GitHub"], ["Esc", "", "close"], ["q", "", "quit (try it)"]];
  var help = $(".help"), pal = $(".pal"), q = $("input", pal), ul = $("ul", pal), sel = 0, shown = [];
  $(".hbody", help).innerHTML = '<p class="touch-only mute">On a phone: swipe or tap the bar at the bottom, <b>find</b> to search and run commands. With a keyboard:</p><dl class="keys2">' +
    KEYS.map(function (k) { return "<dt><kbd>" + esc(k[0]) + "</kbd>" + (k[1] ? ' <span class="mute">' + esc(k[1]) + "</span>" : "") + "</dt><dd>" + esc(k[2]) + "</dd>"; }).join("") + "</dl>";
  function items() {
    var it = [];
    SECTIONS.forEach(function (s, i) { it.push(["go " + s.label, "F" + (i + 1), function () { go(i); }]); });
    arr(D.links).forEach(function (l) { if (l && l.k) it.push(["open " + l.k, str(l.note), function () { openU(l.url); }]); });
    it.push(["switch view", "v", view], ["toggle theme", "t", theme], ["copy link", "y", copyLink],
      ["view source", ".", function () { openU(SOURCE()); }], ["keyboard shortcuts", "?", function () { help.showModal(); }],
      ["top", "g g", function () { top(false); }], ["bottom", "G", function () { top(true); }]);
    return it;
  }
  function draw() {
    var t = q.value.trim().toLowerCase(), all = items();
    shown = all.filter(function (x) { return !t || (x[0] + " " + x[1]).toLowerCase().indexOf(t) > -1; });
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    ul.textContent = "";
    if (!shown.length) { ul.appendChild(mk("li", "none", "nothing matches")); return; }
    shown.forEach(function (x, i) {
      var li = mk("li"); li.setAttribute("role", "option"); li.setAttribute("aria-selected", i === sel ? "true" : "false");
      li.appendChild(mk("span", "", x[0])); li.appendChild(mk("small", "", x[1]));
      li.addEventListener("click", function () { runIt(i); });
      ul.appendChild(li);
    });
    var on = ul.children[sel]; if (on) on.scrollIntoView({ block: "nearest" });
  }
  function runIt(i) { var x = shown[i]; if (!x) return; pal.close(); x[2](); }
  function showPal() { if (help.open) help.close(); q.value = ""; sel = 0; draw(); pal.showModal(); q.focus(); }
  q.addEventListener("input", function () { sel = 0; draw(); });
  q.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "n")) { e.preventDefault(); sel = (sel + 1) % Math.max(shown.length, 1); draw(); }
    else if (e.key === "ArrowUp" || (e.ctrlKey && e.key === "p")) { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(shown.length, 1); draw(); }
    else if (e.key === "Enter") { e.preventDefault(); runIt(sel); }
  });
  [pal, help].forEach(function (d) { d.addEventListener("click", function (e) { if (e.target === d) d.close(); }); });
  $$("[data-close]").forEach(function (b) { b.addEventListener("click", function () { b.closest("dialog").close(); }); });
  $$("[data-act=palette]").forEach(function (b) { b.addEventListener("click", showPal); });
  var notField = function (e) { return !(e.target.closest && e.target.closest("input,textarea,select")) && !e.metaKey && !e.ctrlKey && !e.altKey; };
  var pend = "", pt = 0, GO = { t: 1, w: 2, c: 3, p: 4, l: 5, h: 0 };
  doc.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); showPal(); return; }
    if (pal.open || help.open || !notField(e)) return;
    var k = e.key;
    if (pend === "g") { pend = ""; clearTimeout(pt); if (k === "g") top(false); else if (k in GO) go(GO[k]); return; }
    var m = /^F?([1-9])$/.exec(k);
    if (m && +m[1] <= SECTIONS.length) { e.preventDefault(); go(+m[1] - 1); return; }
    switch (k) {
      case "/": e.preventDefault(); showPal(); break;
      case "?": e.preventDefault(); help.showModal(); break;
      case "g": pend = "g"; pt = setTimeout(function () { pend = ""; }, 900); break;
      case "G": top(true); break;
      case "j": case "l": case "ArrowRight": if (k === "ArrowRight" && !tabs()) return; e.preventDefault(); go(cur + 1); break;
      case "k": case "h": case "ArrowLeft": if (k === "ArrowLeft" && !tabs()) return; e.preventDefault(); go(cur - 1); break;
      case "t": theme(); break;
      case "v": view(); break;
      case "y": copyLink(); break;
      case ".": openU(SOURCE()); break;
      case "q": toast(":q! will not work either. There is no exit."); break;
    }
  });

  } catch (err) { document.documentElement.classList.remove("boot"); throw err; }
})();
