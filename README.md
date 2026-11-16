# Vilas Hegde: portfolio

Plain HTML, CSS and JavaScript. No frameworks, no third-party scripts, no tracking, no dependencies.
Hosted on GitHub Pages: https://vilasrhegde.github.io/

## Pages

| Route | What is on it |
|---|---|
| `/` | ID card on a lanyard, photo stack, stats, the career as a commit history, skills network, about, contact |
| `/work/` | All projects; most open a small live model you can play with |
| `/photos/` | All photographs by album, with a viewer |
| `/explore/` | Signal 32, a small sci-fi game about 32 kinds of adventure |

Every page also contains its full text in plain HTML, so it works without JavaScript and search engines can read it.

## Edit the content

All text lives in `data/`. Change a file, then run `node scripts/build.mjs`.

| File | What it holds |
|---|---|
| `data/site.json` | name, title, bio, career, skills, achievements, quotes, adventures, social links |
| `data/lab.json` | one entry per project: description and which live model it uses |
| `data/repos.json` | GitHub stats per repository |
| `data/albums.json` | which photo goes in which album, and the favourites |
| `data/photos.json` | the title and alt text of each photograph |
| `data/faq.json` | questions and answers (shown on the home page without JavaScript) |

## Add photographs

Put three WebP versions of each photo in `images/photography/`: the original (max 1920 px), `md/` (max 1100 px)
and `thumbs/` (400 px wide, 560 px for panoramas). Remove location data first. Add the file name to an album in
`data/albums.json`, give it a title and alt text in `data/photos.json`, then build.

## Build

```
node scripts/build.mjs
```

This writes the four pages and `404.html`, `assets/data.js`, `assets/labdata.js`, `sitemap.xml` (with every photo),
`llms.txt`, `card.txt` and `resume.json`. Asset URLs carry a content hash, so visitors always get the newest files.

## Security

Every page sets a strict Content Security Policy (scripts and styles from this site only, no inline code). External
links open with `noopener noreferrer`. Photos have their location data removed.
