# Bundle size and delivery:  what Spell ships to a browser

Epic `solid-2-final`, performance research, agent `solid-2-final-perf-bundle`, 2026-11-20.
- Goal (Owen):  apps built with Spell as tight as possible;  "as performant as VS Code";  the editor on a 2-year-old
  Android phone over good 5G without memory problems;  move to the server what needn't ship to the browser.
- A QUICK pass, about an hour:  sizes are MEASURED unless marked (estimated).
- Built from the worktree `solid-2-final` at `cb4309c92`, into a scratch folder:  no tracked file changed.
- Sizes in KB (1024 bytes).  Gzip is level 9, brotli quality 11, each file on its own, as a browser fetches them.
- How to run it again:  "Scripts" at the end.

## 1. The short version

1. **Nothing Spell serves is compressed, and nothing is cached.**
   - Every static answer is `Cache-Control: no-store`, with no `Content-Encoding`
     (`StaticHandler`, which the page server, the editor's production server and the cloud all use).
   - So the editor's first screen is **~5.7 MB on the wire, every visit**:  ~1.2 MB with brotli,
     and ~6 KB on a warm visit with normal caching.
   - An epic or docs page is **~5.2 MB, every page and every live reload**:  ~1.13 MB with brotli.
2. The editor's first load (no project yet) is **1,014 KB of JavaScript, brotli** (4,879 KB raw, 85 files).
   - With a project open (runtime and CodeMirror):  **~1,500 KB brotli** (estimated, about 6.8 MB raw).
   - vscode.dev, measured today:  **~6.4 MB gzip on the wire**, cached for a year.
     So with compression on, Spell's editor is about 4x lighter than vscode.dev cold.
     Today, uncompressed, it's about the same, and is paid again on every visit.
3. The biggest things in the editor's first load are code the first screen never runs:
   - the CSS language service and its data:  182 KB brotli, 1,251 KB raw (its `webCustomData` alone 640 KB raw)
   - Spanish dictionaries:  71 KB brotli, for every reader
   - Semantic UI's whole sheet:  75 KB brotli, 598 KB raw
4. The docs bundle, `spell-ui.js`, is **every Spell UI family in one classic script:  3,980 KB raw / 873 KB brotli**,
   on every docs and epic page.
   - It was one script so pages worked from `file://`.
     Pages are always served since epic `epic-engine` P46, so it can split like the Spell UI site's
     (whose first load is 169 KB brotli).
5. Spell's grammar (`parser/src/spell`, both languages) is in the editor's first load (267 KB brotli, 1,427 KB raw),
   and **three times** in the element builds (`<spell-editor>`, `<spell-code>`, the layout:  791 KB brotli in all).
6. Mermaid and its family (ELK, cytoscape, KaTeX, its parser):  **1.24 MB brotli**, already lazy in the editor.
   - In the docs bundle its classic script is 5,513 KB raw / 1,186 KB brotli, with ELK's 1,580 KB raw a second time
     beside it.
   - Drawn on the server, a docs page with a diagram would ship an SVG instead.

## 2. Every shipped bundle

The eager set:  an entry and every chunk it imports statically (Vite's `modulepreload` list, for the editor).
Lazy:  what `import()` can reach from there.

| Bundle | Build | Entry | Eager files | Eager raw | Eager gzip | Eager brotli | Lazy reachable, brotli | All JS, brotli |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| The editor | app's `yarn build` | `index.html` | 85 JS | 4,879 | 1,252 | **1,014** | 2,482 (689 files) | 3,771 (782 files) |
| The editor's CSS | same | 5 stylesheets in the html | 5 | 683 | (estimated) 115 | 91 | | |
| A cloud app:  `<spell-viewer>` + its runtime | `yarn build:element` | `spell-viewer.js`, `spell-solid.js`, `spell-runtime.js` | 30 | 1,407 | 457 | **391** | 2,634 | 4,670 (element builds) |
| `<spell-editor>` on a page | `yarn build:element` | `spell-editor.js`, `spell-solid.js` | 29 | 3,809 | 927 | **724** | 2,410 | same |
| A Python program's page side | `yarn build:page` | `spell-page.js`, `spell-solid.js` | 31 | 944 | 309 | **270** | 2,350 | 2,996 |
| VS Code's Run Project webview | `yarn build:runner` | `runner.js`, `spell-solid.js`, `spell-runtime.js` | 30 | 1,094 | 356 | **308** | 2,448 | 2,787 |
| The `spell-ui` library (npm) | ui's `yarn build` | `index.js` (every family) | 120 | 3,066 | 851 | 740 | 1,795 | 2,572 (449 files) |
| ... one family's page | same | `core.js` + a family | 1 + | 220 + | 62 + | **52** + | | |
| The Spell UI site (`/components/<set>/`) | `yarn site:bundle` | `site.js` + `site.css` | 33 + 1 | 736 | 215 | **185** | families lazy | 2,455 |
| ... plus what every set's layout loads | | `epics.pack.js`, `spell-comments.js` | 2 | 1,221 | 354 | 263 | | |
| The docs bundle (epic and docs pages) | `bundle-spell-ui.js` | `spell-ui.js` (classic, all families) | 1 | 3,980 | 1,149 | **873** | engines below | |
| ... plus what every docs page loads | | `epics.pack.js`, `spell-doc.css` (+ 2 imports) | 4 | 1,202 | 344 | 255 | | |
| The epics pack | `spell-pack build` | `epics.pack.js` (49 families, classic) | 1 | 1,091 | 309 | 225 | | |

The docs bundle's lazy engines, each a classic script loaded on first use:

| Script | Raw | Gzip | Brotli |
| --- | --- | --- | --- |
| `lazy/mermaid-engine.js` (Mermaid, every diagram kind, its own ELK inside) | 5,513 | 1,592 | 1,186 |
| `lazy/elk-engine.js` | 1,580 | 493 | 377 |
| `lazy/code-engine.js` (highlight.js, every language) | 153 | 49 | 37 |
| `lazy/markdown-engine.js` (marked) | 50 | 16 | 14 |
| `lazy/markdown-sanitizer.js` (DOMPurify) | 33 | 13 | 12 |
| `emoji/<set>/<letter>.js` | 424 in all | | per letter |

Not JS but shipped beside the editor and the element builds:  2,167 icon SVGs (`icon-packs/`), the sound library,
Semantic UI's icon fonts (`icons.woff2` 39 KB, `brand-icons.woff2` 53 KB, and their `.eot` / `.ttf` / `.svg` twins).

### 2.1 The editor's first load, in detail

| Piece | Raw | Brotli | Eager because |
| --- | --- | --- | --- |
| `spell-*.js`:  the grammar, English AND Spanish rule texts, the Python writer | 1,526 | 284 | `index.tsx` imports `spell/parser/parser` |
| `lsp-*.js`:  the language service, with VS Code's CSS service and its data | 1,251 | 180 | `editor-*.js` imports it, and CodeMirror's menu, peek and `solid-*.js` |
| `solid-*.js`:  the Inspector, the palette, the app's Solid UI, `SpellEditor.spell` | 410 | 103 | the app's Solid UI |
| `decode-*.js`:  the parser's tokenizer, AST and every writer (JS, TS) | 302 | 83 | the parser |
| `editor-*.js`, `index-*.js`, `core-*.js`, `web-*.js` ... (77 more) | 1,390 | 364 | |
| JS in all | **4,879** | **1,014** | |
| `semantic.min.css` (Semantic UI, all of it, fonts inlined as data URIs) | 598 | 75 | `index.html` links it |
| the app's own CSS (`solid-*.css`, `index-*.css`, Lato's `index.css`) | 85 | 16 | |
| Lato, regular and bold (woff2) | 33 | 33 | (estimated:  2 of its 8 files) |
| `index.html` | 22 | 6 | |
| **First screen, no project** | **~5,617** | **~1,144** | |
| `spell-runtime.js` and what it alone imports | 394 | 111 | `editor.loadRuntime()`, as a project opens |
| `codemirror-*.js` and what it alone imports | 755 | 216 | the code pane |
| Spell UI families the screen draws, icons | (estimated) 200 | (estimated) 60 | `<ui-root>`'s loader, one SVG fetch per icon |
| **With a project open** | **~6,966** (estimated) | **~1,531** (estimated) | |

What the first dialog costs:  `modals-*.js` pulls 192 files not loaded yet, **543 KB brotli, 1,866 KB raw**.

## 3. The biggest modules and dependencies

Grouped by npm package, or by kit folder.
- A chunk's gzip and brotli are shared out by each module's share of it (Rolldown's `renderedLength`):
  exact per chunk, an estimate per module.
- Element builds:  `<spell-viewer>`, `<spell-editor>`, `<spell-code>`, `spell-runtime.js` and the shared Solid build.
- Copies:  how many files of the element builds hold some of it.

| Group | Editor:  raw / brotli (eager brotli) | Element builds:  raw / brotli (viewer's eager brotli) | `spell-ui` lib, brotli | Files in element builds |
| --- | --- | --- | --- | --- |
| `parser/src/spell` (the grammar, en + es) | 1,427 / 267 (267) | **4,228 / 791** (1) | | 7:  three copies |
| mermaid | 1,731 / 424 (0) | 1,724 / 419 (0) | 464 | 65 |
| elkjs | 1,503 / 344 (0) | 1,503 / 343 (0) | 363 | 1 |
| `parser/src/parser` (tokenizer, AST, writers) | 262 / 72 (72) | 743 / 180 (61) | | 3 |
| vscode-css-languageservice | 887 / 127 (**127**) | 893 / 137 (0) | | 1 |
| cytoscape | 456 / 120 (0) | 456 / 120 (0) | 130 | 1 |
| @mermaid-js/parser (and chevrotain / langium under it) | 683 / 114 (0) | 680 / 109 (0) | 117 | 2 |
| `app/src/app/ui` (AppTexts en + es, CodeMirror glue) | 242 / 74 (16) | 363 / 102 (9) | | 7 |
| `app/src/app/solid` (the editor's Solid UI) | 374 / 97 (85) | 44 / 13 (11) | | 3 |
| `ui-emoji` (its data) | 465 / 92 (0) | 466 / 92 (0) | 4 | 56 |
| `ui/src/styles` (themes, token sheets) | 404 / 87 (0) | 436 / 85 (0) | 19 | 26 |
| lodash (CommonJS, whole) | 137 / 39 (15) | 294 / 74 (**45**) | | 5 |
| xlsx | 258 / 71 (0) | 258 / 71 (0) | | 1 |
| katex | 270 / 63 (0) | 270 / 63 (0) | 67 | 1 |
| `parser/src/core` (the runtime) | 222 / 62 (1) | 224 / 63 (61) | | 5 |
| `ui/src/vocabulary` (incl. `help.generated.ts` 150 raw, `defaults.generated.ts` 82 raw) | 256 / 60 (24) | 23 / 8 (7) | 8 | 5 |
| @codemirror/view | 195 / 53 (0) | 207 / 57 (0) | | 1 |
| `src/util` | 98 / 33 (22) | 207 / 56 (19) | 22 | 34 |
| `src/places` | 175 / 52 (4) | 170 / 47 (4) | | 4 |
| `ui-theme-editor` | 137 / 38 (2) | 136 / 37 (0) | 39 | 7 |
| highlight.js | 143 / 35 (0) | 143 / 35 (0) | 38 | 1 |
| Solid (@solidjs/signals, web, router, solid-js, h) | 114 / 35 (35) | (estimated) ~250 / ~45 (35) | | 3 |
| `app/src/app/components` | 92 / 21 (7) | 133 / 32 (2) | | 13 |
| `app/src/app/runner` | 117 / 31 (13) | 88 / 23 (22) | | 5 |
| json5 | 33 / 8 (8) | 125 / 29 (7) | 8 | 4 |
| layout-base, cose-base (cytoscape's layouts) | 181 / 41 (0) | 181 / 41 (0) | 45 | 4 |
| `ui/src/icons` (`search.json`:  108 raw) | 110 / 28 (1) | 110 / 28 (1) | 1 | 3 |
| `app/src/app/pages` | 97 / 26 (25) | | | |
| `ui-menu` | 104 / 25 (0) | 104 / 25 (0) | 26 | 6 |
| `src/element` | 68 / 18 (17) | 68 / 20 (19) | 26 | 6 |
| `ui-tree` | 97 / 24 (0) | 96 / 24 (0) | 25 | 4 |
| marked | 79 / 22 (0) | 78 / 22 (0) | 25 | 2 |
| temporal-polyfill | 92 / 19 (0) | | 21 | |

By kind, in the editor:

| Kind | Raw | Brotli | Of it eager, brotli |
| --- | --- | --- | --- |
| Spanish dictionaries (177 `*.es.ts`) | 392 | 85 | **71** |
| English vocabularies (185 `*.en.ts`) | 826 | 219 | 96 |
| Python (`parser/src/py`, `@lezer/python` ...) | 83 | 20 | 8 |
| Solid itself | 114 | 35 | 35 |
| Mermaid and everything under it | 5,321 | 1,238 | 0 |

Notes:
- Solid itself is small (35 KB brotli).
  The element builds re-export it WHOLE (`spell-solid.js`, so every other build can share it), about 10 KB more.
- The viewer's eager `spell-shared.js` (597 raw / 159 brotli) is more than a quarter lodash (278 KB of its 990 KB
  before minifying), and the compiler's writers (196 KB):  a cloud app that only RUNS compiled Spell ships the compiler.
- `vscode-css-languageservice`'s `webCustomData.js`, every CSS property's description:  640 KB raw, 92 brotli, eager.

## 4. CSS

| What | Minified (estimated:  comments and spaces dropped) | Brotli |
| --- | --- | --- |
| Spell UI's 96 families' sheets | 829 | 137 (each on its own) |
| ... the biggest:  `ui-menu`, `ui-table`, `ui-parts`, `ui-button`, `ui-dropdown` | 52, 47, 39, 32, 31 | 7, 6, 5, 5, 5 |
| Spell UI's global sheets (`src/styles/`) | 148 | 13 |
| `reset.css`, in every shadow root | 5 | |
| The epics pack's sheets (49 families, source) | 345 (source) | |
| The editor's Semantic UI sheet | 598 (as shipped) | 75 |
| The docs pages' `spell-doc.css` + its two imports | 111 (as shipped) | 30 |

- Each family's sheet ships inside its JS chunk, as a string (`UIButton.css?inline`).
- **Shadow roots share their sheets:**  `UI.styles` keeps ONE constructable sheet per name per page, and every shadow
  root adopts that same object (`adoptedStyleSheets`).  No root gets a copy.
  - The one per-element sheet:  `hostLayout` (`<ui-stack>`, `<ui-cell>`, `<ui-terms>`, `<ui-root>`), a
    `CSSStyleSheet` per instance holding its `:host { ... }`.  A thousand `<ui-stack>`s are a thousand sheets.
  - `UI.styles` also keeps every sheet's text (`texts`), to compare on hot reload:  the CSS lives twice in memory,
    as text and as rules.
- Unused CSS (estimated, not measured):
  - The families are Fomantic ports, with every size, colour and variation of a tag.
    On a typical page, most of a loaded family's rules match nothing:  70-85% (estimated).
  - Semantic UI in the editor:  85-90% unused (estimated:  the editor's own UI is Spell UI's now;
    `loadUI.ts` draws a few Fomantic names).
  - To measure it:  Playwright's CSS coverage over the editor and a few docs pages.

## 5. The heavy things, and what to do with each

Options:  (a) lazy on first use, (b) drawn on the server and shipped as static output, (c) a web worker,
(d) a smaller library or our own, (e) dedupe, (f) drop.
"Keeps it all" says whether full functionality survives.

| # | Thing | Today | Option | Keeps it all | Saving |
| --- | --- | --- | --- | --- | --- |
| 1 | No compression anywhere | editor 5.7 MB, docs page 5.2 MB on the wire | brotli files written at build time (`.br` beside each), served when `Accept-Encoding` allows;  gzip on the fly for the rest | yes | **editor -4.5 MB (-80%) cold;  docs page -4.1 MB** |
| 2 | No caching (`no-store` on everything) | every visit and reload downloads it all again | hashed `assets/*` `immutable, max-age=1y`;  `index.html` and fixed names `no-cache` + `ETag` (a 304);  dev worktrees keep `no-store` | yes | **warm editor visit 5.7 MB -> ~6 KB** |
| 3 | The CSS language service, eager | 1,251 raw / 180 br in the first load | (a) load on the first CSS edit, or (c) the whole language service in a worker, as VS Code runs its | yes | **-180 KB br, -1.25 MB raw to parse** at start |
| 4 | Spanish dictionaries for everyone | 71 KB br eager | (a) load a language's dictionaries when a page or program is in it | yes (a language switch waits on one fetch) | **-71 KB br** eager |
| 5 | Semantic UI's whole sheet in the editor | 598 raw / 75 br eager | (f) drop with the last Fomantic markup;  until then (d) only the rules the editor uses | yes | **-65 to -75 KB br** |
| 6 | The docs bundle:  every family, one script | 3,980 raw / 873 br per page | ES modules, each family a lazy chunk (as the site bundle);  classic scripts only for `file://`, which pages no longer use | yes | **~-700 KB br per page** (estimated, from the site's 169) |
| 7 | The epics pack:  49 families at once | 1,091 raw / 225 br per page | the same:  a family per chunk, loaded by `<ui-root>` as Spell UI's are | yes | ~-150 KB br (estimated) |
| 8 | Docs and epic pages draw after JS loads | ~1.13 MB br before they're whole | (b) the static render (`spell/ui/static`) into Declarative Shadow DOM, JS only for what's live | yes, once each element hydrates | first paint without JS (not measured) |
| 9 | Mermaid on docs pages | 1,186 br (+ ELK 377) on a page with a diagram | (b) the page server draws each diagram to SVG, cached by its source's hash | yes for reading;  live editing keeps a renderer | **-1.19 to -1.56 MB br** on such a page |
| 10 | Mermaid while editing | 1,238 br family, lazy | (b) a server round-trip per edit, debounced;  or (a) the lazy chunk as now on desktop.  Not (c):  Mermaid measures text in the DOM | yes;  a round trip per edit (~100-300 ms, estimated) | 1.24 MB br and its heap off the phone |
| 11 | ELK twice in the docs bundle | Mermaid's script holds its own ELK beside `elk-engine.js` | (e) one ELK | yes | ~-377 KB br when both load |
| 12 | The grammar, three times in the element builds | 791 br across `spell-editor-spell.js`, `spell-code-spell.js`, `LayoutSpell.js` | (e) one shared chunk for every element build | yes | ~-285 to -530 KB br on a page with two of them (estimated) |
| 13 | `<spell-code>` colouring on docs pages | the grammar, 285 br, to colour read-only code | (b) coloured on the server, as HTML spans | yes for reading | **-285 KB br** per page showing Spell |
| 14 | A cloud app ships the compiler | viewer eager 391 br, incl. the writers and a whole lodash | (b) compile on the server (`ServerCompileStore` exists), ship compiled JS and the runtime only | yes, for running;  the editor keeps its compiler | ~-100 KB br (estimated) |
| 15 | lodash (CommonJS, not tree-shaken) | 74 br in the element builds, 45 eager in the viewer;  39 in the editor | (d) `lodash-es`, as Spell UI already requires, through the `spell/util` barrel | yes | ~-45 KB br in the viewer, ~-15 in the editor (estimated) |
| 16 | The first dialog | 192 files, 543 KB br more | (a) a chunk per dialog, not one `modals` barrel | yes | ~-400 KB br on the first dialog (estimated) |
| 17 | The grammar in the editor's first load | 267 br eager, en + es | (a) its Spanish half with #4;  (c) the parser and the language service in a worker, keeping the main thread free | yes | ~-120 KB br eager for #4's half (estimated) |
| 18 | One request per icon | 2,167 SVGs, a fetch per icon shown, re-fetched every visit (#2) | (b) a sprite of the names an app uses, at build time, or `UI.icons.register()` them into the bundle (the docs bundle already does) | yes | tens of requests (not measured) |
| 19 | `defaults.generated.ts` eager | 82 raw / 17 br | (a), or (b):  the compiler's `<ui-defaults>` check on the server | yes | -17 KB br |
| 20 | Emoji data | 465 raw / 92 br, lazy, per letter | fine as is;  (b) a search on the server if the picker grows | yes | |
| 21 | xlsx, KaTeX, highlight.js, Temporal polyfill | 71, 63, 35, 19 br, all lazy | fine as is | | |
| 22 | The runtime, copied per program | `spell-runtime.js` (394 raw) loaded from a fresh `blob:` URL per `<spell-viewer>`, the layout and the tests | one module making several runtimes, instead of a module copy each:  a blob URL is compiled again each time, and holds its own `core` | yes, a refactor | memory per copy (for the memory agent) |

## 6. Delivery

| Question | Today | Where |
| --- | --- | --- |
| Compression (brotli / gzip)? | **None.**  No `Content-Encoding` from the page server, the editor's production server, the cloud;  Caddy's house-network site has no `encode` | `src/server/StaticHandler.ts`, `WebServer.ts`;  app's `routes/cli.ts`, `EditorServer.ts`, `SpellCloud.ts`, `LocalSiteServer.ts` |
| Hashed names? | the editor's `assets/*-<hash>.js`:  yes.  The element builds, the docs bundle, the epics pack, the site's entries:  fixed names | the Vite configs;  `bundle-spell-ui.js` |
| Long cache headers? | **No.**  Every static answer is `no-store` (an `ETag` too, for page editors' `If-Match`);  one route answers `max-age=3600` | `StaticHandler` |
| HTTP/2? | the page server and the cloud:  plain HTTP/1.1 (node's `http`), so 85 eager files share 6 connections;  Caddy's site:  HTTP/2 and HTTP/3 | |
| Service worker, offline cache? | **None** | |
| `modulepreload`? | the editor:  84 hints, every eager chunk, from Vite;  nothing else preloads | `index.html` in the build |
| The house network's editor (test.spell.app) | the Vite DEV server through Caddy:  hundreds of unbundled modules, unminified | `LocalSiteServer.ts` |

What a phone on 5G downloads (the editor, first screen, then a project open):

| Visit | Today | Compressed | Compressed and cached |
| --- | --- | --- | --- |
| Cold | ~5.6 MB, then ~7.0 MB (estimated) | ~1.14 MB, then ~1.53 MB (estimated) | the same |
| Warm (a reload, the next day) | **the same as cold** | the same as cold | ~6 KB (`index.html`'s 304s), plus what the API answers |

- On "good 5G" (~100 Mbps) 7 MB is about 0.6 s of transfer;  at Alex Russell's P75 network (7.2 Mbps) it's about 8 s,
  and 1.5 MB is about 1.7 s (estimated, transfer only).
- On a phone the bigger cost is CPU and memory:  4.9 MB of raw JS to parse and compile at start (estimated 1-2 s on a
  2-year-old mid-range Android, not measured).
  Compression doesn't shrink that:  #3, #4, #5, #17 do.
- Suspected bug, not checked:  the built editor's `index.html` links `../static/semantic-ui-css/semantic.min.css` and
  Lato, but in production (`NODE_ENV=production`) the server mounts only `dist/` at `/`, which has no `static/`.

## 7. A size budget

Brotli, on the wire, first load.  Reference points first.

| Reference | Number |
| --- | --- |
| vscode.dev, measured 2026-11-20 (build `8a14f0cc`) | `workbench.web.main.internal.js` 22,078 KB raw, served gzip at 5,726 KB (brotli would be 4,349);  its CSS 1,852 raw / 227 gzip;  `nls.messages.js` 428 gzip;  `index.html` 79 brotli.  Cold ~6.4 MB.  Cached a year (`max-age=31536000`), HTTP/2 |
| VS Code's own `workbench.js`, desktop | 12.3 MB -> 9.8 MB raw after name mangling ([the VS Code blog](https://code.visualstudio.com/blogs/2023/07/20/mangling-vscode)) |
| Alex Russell, 2024 baseline ([The Performance Inequality Gap, 2024](https://infrequently.org/2024/01/performance-inequality-gap-2024/)) | 5-second first load:  650 KiB JS + 650 KiB other;  3-second:  365 KiB JS + 365 other.  A Galaxy A51-class phone, 7.2 Mbps, 94 ms |
| HTTP Archive 2025, median mobile page | ~697 KB of JS (a secondary report, not checked against the Almanac) |

| Bundle | Today, brotli | Budget | What gets it there |
| --- | --- | --- | --- |
| Editor, first screen (JS) | 1,014 | **400** | #3, #4, #5, #17, #19;  the Inspector and palette lazy |
| Editor, first screen (all) | ~1,144 | **500** | the same, and fonts as used |
| Editor, project open (all) | ~1,531 (estimated) | **700** (Russell's 5-second line) | the above, CodeMirror's languages per language |
| A cloud app (`<spell-viewer>` + runtime) | 391 | **150** | #14, #15 |
| A docs or epic page (JS) | ~1,128 | **250** | #6, #7, #13;  #8 for first paint |
| A Spell UI site page | ~448 | **200** | #7 |
| Any lazy chunk | up to 1,186 (Mermaid) | **150** | #9, #10, #11 |
| A warm visit | = cold | **10** | #2, a service worker for offline |

- Hold them in CI:  a check over these scripts' JSON, failing a bundle over its line
  (a `spell` command:  ask first, per the commands guide).

## 8. What I couldn't build or measure

1. The docs bundle and the epics pack were NOT rebuilt:  `bundle-spell-ui.js` and `spell-pack build` write only into
   tracked folders (`epic/src/tools/_assets/`, `components/__pack/`).
   - Measured as they are in the worktree (`spell-ui.js` there is one of the 4 generated files already changed, not
     mine;  `HEAD`'s is 4,074,552 bytes, within 1 KB of it).
   - No per-module breakdown for them:  no source maps, no metafile.
2. No browser run:  "eager" is the static import graph and the html, not a network log.
   What `<ui-root>`, icons and the runtime load once the editor runs is estimated.
   No parse / compile times, no memory, no CSS coverage.
3. The `spell-ui` library:  measured from its `dist/` as built today (10:14), through its source maps;
   385 KB brotli of it didn't map to a package.
4. The Spell UI site:  its `site/_assets/` as built today (no source maps);  its import graph read from the code.
5. When `<spell-viewer>` loads `LayoutSpell.js` (1,429 raw / 261 brotli):  not traced.

## 9. Scripts

In this folder's `perf-scripts/`:
- `build-all.sh <kit> <out> [editor element page runner]`:  every app build, as its yarn script does, into `<out>`,
  with module stats.
- `build-stats.mjs <kit> <config> <outDir> [<stats.json>] [--keep]`:  one Vite config, built with the kit's Vite,
  each chunk's modules recorded.
- `analyze.mjs <dir> [--stats <json>] [--entry <file>...] [--html <index.html>] [--json <out>] [--top N]`:
  raw / gzip / brotli of every file, eager vs lazy, the biggest files, groups and modules (from the stats, else from
  source maps).

```sh
S=<scratch>/bundle;  P=spell.epics/epics/solid-2-final/research/perf-scripts
bash $P/build-all.sh ~/www/spell.worktrees/solid-2-final $S
node $P/analyze.mjs $S/editor --stats $S/editor.stats.json --html $S/editor/index.html --json $S/editor.summary.json
```

- The editor builds in about 5 s;  each analysis takes about 15 s (brotli over 2,000 icon files).
