# vilasrhegde.github.io

Personal site of Vilas Hegde. One page that looks and behaves like a terminal: tabs you swipe on a phone, one long page on a wide screen, every chart drawn as text sized to the screen.

Plain HTML, CSS and JavaScript. No frameworks, no packages, no trackers, no web fonts.

## Edit

1. Change `data/site.json` (text, numbers, projects, career, links, photos).
2. Run `node scripts/build.mjs`.
3. Commit everything, including the generated files.

Code lives in `assets/src/` (`app.js`, `site.css`). The build copies them to content-hashed files in `assets/` and writes `index.html`, `404.html`, `sitemap.xml`, `robots.txt`, `llms.txt`, `card.txt`, `vilas.vcf` and `manifest.webmanifest`. Do not edit those by hand.

## Photos

Six photos live in `images/photos/` as 560 x 420 WebP (about 10 to 50 KB each). To change one, add the file there and set its name (without `.webp`) in `photos` in `data/site.json`. Names may use letters, numbers, `-` and `_`.

## Preview

`python3 -m http.server 8080`, then open http://localhost:8080.

## Keys

`/` or Ctrl/Cmd K search, `?` all shortcuts, `1`-`6` sections, `j` `k` next and previous, `h` `l` tabs, `g g` / `G` top and bottom, `v` tabs or one page, `t` light or dark, `y` copy link.
