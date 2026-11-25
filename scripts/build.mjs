/* Builds the site from data/site.json. Plain Node, no dependencies.
   Usage: node scripts/build.mjs
   Reads:  data/site.json, assets/src/app.js, assets/src/site.css, images/photos/*.webp
   Writes: index.html, 404.html, assets/app.<hash>.js, assets/site.<hash>.css,
           sitemap.xml, robots.txt, llms.txt, card.txt, vilas.vcf, manifest.webmanifest
   index.html carries every word as plain HTML (search engines, link previews, readers without
   JavaScript). The script then draws the terminal view on top and removes the plain copy. */
import { readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = (...a) => path.join(ROOT, ...a);
const D = JSON.parse(await readFile(p('data/site.json'), 'utf8'));
const S = D.site, P = D.profile;
const URL0 = S.url;
const TODAY = new Date().toISOString().slice(0, 10);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const json = o => JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const hash = s => createHash('sha256').update(s).digest('hex').slice(0, 10);
const safeUrl = u => /^https?:\/\//i.test(String(u || '')) ? u : '#';
const short = u => String(u).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
const fail = m => { console.error('build: ' + m); process.exit(1); };

/* ---------- checks, so a typo in site.json fails here and not on the live site ---------- */
for (const k of ['profile', 'week', 'now', 'principles', 'workTime', 'focusByHour', 'projects', 'projectKinds', 'career', 'photos', 'links', 'uses'])
  if (!(k in D)) fail(`data/site.json is missing "${k}"`);
for (const l of D.links) if (safeUrl(l.url) === '#') fail(`link "${l.k}" needs an http(s) url`);
const photoFiles = new Set((await readdir(p('images/photos'))).filter(f => f.endsWith('.webp')).map(f => f.slice(0, -5)));
for (const ph of D.photos) {
  if (!/^[\w-]+$/.test(ph.file)) fail(`photo file name "${ph.file}" may only use letters, numbers, - and _`);
  if (!photoFiles.has(ph.file)) fail(`images/photos/${ph.file}.webp does not exist`);
}
for (const f of photoFiles) if (!D.photos.some(ph => ph.file === f)) console.warn(`build: images/photos/${f}.webp is not in data/site.json (unused, safe to delete)`);
const link = k => (D.links.find(l => l.k === k) || {}).url;
const LI = link('linkedin'), GH = link('github'), X = link('x'), IG = link('instagram');
const gh = repo => GH.replace(/\/$/, '') + '/' + encodeURIComponent(repo);

/* ---------- assets, content-hashed so browsers can cache them forever ---------- */
for (const f of await readdir(p('assets'))) if (/^(app|site)\.[0-9a-f]{10}\.(js|css)$/.test(f)) await rm(p('assets', f));
const jsSrc = await readFile(p('assets/src/app.js'), 'utf8');
const cssSrc = await readFile(p('assets/src/site.css'), 'utf8');
const JS = `assets/app.${hash(jsSrc)}.js`, CSS = `assets/site.${hash(cssSrc)}.css`;
await writeFile(p(JS), jsSrc);
await writeFile(p(CSS), cssSrc);

/* The data the script reads. Only what the page shows; "site" and "_note" stay out. */
const { site: _s, _note, ...pageData } = D;
const DATA = json(pageData);

/* ---------- head ---------- */
const CSP = ["default-src 'none'", "script-src 'self'", "style-src 'self'", "img-src 'self'", "manifest-src 'self'",
  "base-uri 'none'", "form-action 'none'", "object-src 'none'", 'upgrade-insecure-requests'].join('; ');
const role = `${P.role} at ${P.company}`;
const person = {
  '@type': 'Person', '@id': URL0 + '#person', name: P.name, url: URL0, image: URL0 + 'images/og-image.jpg',
  jobTitle: P.role, worksFor: { '@type': 'Organization', name: P.company },
  description: P.intro, sameAs: D.links.map(l => l.url),
  knowsAbout: ['Identity and access management', 'Integrations', 'GenAI', 'System design', 'Automation', 'Distributed systems']
};
function head({ title, desc, path: pth, noindex, ld, base = '' }) {
  /* base "" = relative (index.html, works from disk too); "/" = absolute (404.html, served at any depth) */
  const canon = URL0 + pth;
  return `<!doctype html>
<html lang="${S.lang}" class="boot">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="${esc(P.name)}">
<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="${S.themeLight}" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="${S.themeDark}" media="(prefers-color-scheme: dark)">
<link rel="canonical" href="${canon}">
<link rel="icon" href="${base}images/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="${base}images/icon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="${base}images/apple-touch-icon.png">
<link rel="manifest" href="${base}manifest.webmanifest">
<link rel="alternate" type="text/plain" href="${base}llms.txt" title="llms.txt">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="${esc(P.name)}">
<meta property="og:locale" content="${S.locale}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canon}">
<meta property="og:image" content="${URL0}images/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(P.name)}, ${esc(role)}">
<meta property="profile:first_name" content="${esc(P.name.split(' ')[0])}">
<meta property="profile:last_name" content="${esc(P.name.split(' ').slice(1).join(' '))}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:creator" content="@${esc(short(X).split('/').pop())}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${URL0}images/og-image.jpg">
<link rel="stylesheet" href="${base}${CSS}">
${ld ? `<script type="application/ld+json">${json(ld)}</script>\n` : ''}<script defer src="${base}${JS}"></script>
</head>`;
}

/* ---------- the plain-HTML copy of everything (no JS needed to read it) ---------- */
const A = (u, t, rel = 'noopener noreferrer') => `<a href="${esc(safeUrl(u))}" rel="${rel}">${esc(t)}</a>`;
const blk = (cmd, inner) => `<section class="blk"><h2>$ ${esc(cmd)}</h2>${inner}</section>`;
const fbar = () => `<nav class="fbar" id="fbar" aria-label="Sections"></nav>`;
const staticBody = `<main class="pi static" id="static">
<p class="lead">${esc(P.line)}</p>
<p class="intro">${esc(P.intro)}</p>
${blk('whoami', `<dl>${P.facts.map(f => `<dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd>`).join('')}</dl>`)}
${blk('cat now.txt', `<ul>${D.now.map(n => `<li>${esc(n)}</li>`).join('')}</ul>`)}
${blk('cat principles.md  # how I think', `<ol>${D.principles.map(x => `<li><b>${esc(x.t)}</b> ${esc(x.why)}</li>`).join('')}</ol>`)}
${blk('ls ~/projects', `<ul>${D.projects.map(x => `<li>${A(gh(x.repo), x.name)}: ${esc(x.desc)} <span class="mute">(${esc(x.stack)})</span></li>`).join('')}</ul><p>More on ${A(GH, short(GH))}.</p>`)}
${blk('git log career', `<ol>${D.career.map(c => `<li>${esc(c.year)}: ${esc(c.role)}, ${esc(c.org)}${c.branch.length ? '. ' + esc(c.branch.join('; ')) : ''}</li>`).join('')}</ol><p>The full history is on ${A(LI, 'LinkedIn')}.</p>`)}
${blk('ls ~/photos', `<ul>${D.photos.map(x => `<li>${esc(x.alt)}</li>`).join('')}</ul><p>Every other photo is on ${A(IG, 'Instagram')}.</p>`)}
${blk('cat links.txt', `<ul>${D.links.map(l => `<li>${A(l.url, l.k, 'me noopener noreferrer')}: ${esc(l.note)}</li>`).join('')}</ul>`)}
${blk('cat uses.txt', `<dl>${D.uses.map(u => `<dt>${esc(u.k)}</dt><dd>${esc(u.v)}</dd>`).join('')}</dl>`)}
</main>`;
const dialogs = `<dialog class="sheet pal" aria-label="Search">
<div class="pin"><span class="p">&gt;</span><input type="text" placeholder="section, site or command" aria-label="Search" autocomplete="off" spellcheck="false" enterkeyhint="go"></div>
<ul role="listbox"></ul>
<p class="pk kb"><kbd>&uarr;</kbd><kbd>&darr;</kbd> move <kbd>Enter</kbd> run <kbd>Esc</kbd> close</p>
</dialog>
<dialog class="sheet help" aria-labelledby="help-t"><h2 id="help-t">$ man shortcuts</h2><div class="hbody"></div><button type="button" class="btn" data-close>close</button></dialog>
<div class="toast" role="status" aria-live="polite"></div>`;

const desc = S.description;
const index = `${head({
  title: S.title, desc, path: '',
  ld: { '@context': 'https://schema.org', '@graph': [person,
    { '@type': 'WebSite', '@id': URL0 + '#website', url: URL0, name: P.name, inLanguage: S.lang, publisher: { '@id': URL0 + '#person' } },
    { '@type': 'ProfilePage', '@id': URL0 + '#page', url: URL0, name: S.title, description: desc, inLanguage: S.lang, isPartOf: { '@id': URL0 + '#website' }, mainEntity: { '@id': URL0 + '#person' }, dateModified: TODAY }] }
})}
<body>
<div class="app" id="app">
<header class="tb"><h1 id="t-name">${esc(P.name)}</h1><span class="tr2 mute" id="t-role">${esc(role)}</span><span class="clk" data-clock></span></header>
<div class="panes" id="panes" tabindex="-1">
${staticBody}
</div>
${fbar()}
</div>
${dialogs}
<script type="application/json" id="site-data">${DATA}</script>
</body>
</html>
`;
await writeFile(p('index.html'), index);

const notFound = `${head({ title: `Not found | ${P.name}`, desc: 'This page does not exist.', path: '404.html', noindex: true, base: '/' })}
<body class="nf">
<main class="pi nfm">
<pre class="art">$ cd ./this-page
<span class="r">zsh: no such file or directory</span>
$ ls ~
<a href="/">index.html</a>  <a href="/llms.txt">llms.txt</a>  <a href="/card.txt">card.txt</a>
$ <a href="/">cd ~</a></pre>
</main>
</body>
</html>
`;
await writeFile(p('404.html'), notFound);

/* ---------- plain-text versions and machine-readable files ---------- */
await writeFile(p('robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${URL0}sitemap.xml\n`);
await writeFile(p('sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
<url><loc>${URL0}</loc><lastmod>${TODAY}</lastmod>${D.photos.map(x => `<image:image><image:loc>${URL0}images/photos/${x.file}.webp</image:loc></image:image>`).join('')}</url>
</urlset>
`);
const llms = `# ${P.name}

> ${role}. ${P.intro}

${P.line}

## How I think
${D.principles.map(x => `- ${x.t} ${x.why}`).join('\n')}

## Now
${D.now.map(n => `- ${n}`).join('\n')}

## Featured projects
${D.projects.map(x => `- [${x.name}](${gh(x.repo)}): ${x.desc} (${x.stack})`).join('\n')}

## Career
${D.career.map(c => `- ${c.year}: ${c.role}, ${c.org}${c.branch.length ? ' (' + c.branch.join('; ') + ')' : ''}`).join('\n')}

## Links
${D.links.map(l => `- [${l.k}](${l.url}): ${l.note}`).join('\n')}

## Uses
${D.uses.map(u => `- ${u.k}: ${u.v}`).join('\n')}
`;
await writeFile(p('llms.txt'), llms);
const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n);
await writeFile(p('card.txt'), `
  ${P.name.toUpperCase()}
  ${role}
  ${'-'.repeat(role.length)}

  ${P.line}

${P.facts.map(f => `  ${pad(f.k, 10)} ${f.v}`).join('\n')}

  ${pad('web', 10)} ${URL0}
${D.links.map(l => `  ${pad(l.k, 10)} ${short(l.url)}`).join('\n')}

  Try:  curl ${short(URL0)}/card.txt
`);
const [first, ...rest] = P.name.split(' ');
await writeFile(p('vilas.vcf'), ['BEGIN:VCARD', 'VERSION:3.0', `N:${rest.join(' ')};${first};;;`, `FN:${P.name}`, `ORG:${P.company}`, `TITLE:${P.role}`,
  `URL:${URL0}`, ...D.links.map(l => `URL;TYPE=${l.k}:${l.url}`), `NOTE:${P.intro}`, 'END:VCARD', ''].join('\r\n'));
await writeFile(p('manifest.webmanifest'), JSON.stringify({
  name: P.name, short_name: first, description: desc, start_url: '/', scope: '/', display: 'standalone',
  background_color: S.themeDark, theme_color: S.themeDark,
  icons: [{ src: 'images/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'images/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }]
}, null, 2) + '\n');

console.log(`built index.html (${(index.length / 1024).toFixed(1)} KB), ${JS}, ${CSS}, 404.html, sitemap.xml, llms.txt, card.txt, vilas.vcf`);
