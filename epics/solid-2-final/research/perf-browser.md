# Browser performance:  where Spell falls down now

A quick browser pass (epic `solid-2-final`, 2026-11-20):
four pages, desktop and a 2023 mid-range phone, measured headless in Chromium.
- **Every number here is from a BUSY MACHINE** (1-minute load 14-64 on 18 cores;  quiet is under 9).
  - Bytes, heap, nodes, listeners, sheets and growth per cycle don't move with load:  trust them.
  - Times (paints, ready, long tasks, typing) are inflated by an unknown factor (estimated 1.2-2x).
- Re-run them on a quiet machine, from the kit's root, with the page server up (about 45-55 minutes with 5 runs, estimated):

  ```sh
  node /Users/owen/www/spell/spell.epics/epics/solid-2-final/research/perf-scripts/perf-run.mjs
  ```

  - Its README, `perf-scripts/README.md`, has the flags and what it needs.
  - It compares itself with this run's file, `perf-results/2026-11-20-1103.json`.
- The results:  `perf-results/2026-11-20-1103.json` (every page), with two patch-ups after a script fix:
  `2026-11-20-1103-epic.json` (the epic page) and `2026-11-20-1103-leaks-editor.json`, `-sheets-*.json`.

## Where we are falling down now, worst first

1. **Style recalculation on pages with many shadow roots.**
   - The kitchen sink spends 22.7 s of desktop load recalculating style (62 s on the phone), against 1.6 s of script.
     Its first paint comes at 7.1 s on desktop, 24.9 s on the phone, and the phone's largest paint at 63 s.
   - It has 4,467 shadow roots, each adopting 11.3 sheets on average:  ~1 MB of distinct CSS, 133 sheets.
   - The sheets ARE shared (one object per name), so it isn't duplication of objects;  it's what each root takes in.
     **Every shadow root adopts ~400 KB of CSS** (`perf-sheets.mjs`, the editor and the kitchen sink alike):
     - 9 foundation sheets in every root, ~370 KB between them
     - the biggest:  163 KB, 140 rules, **874 custom properties, its first rule `:root`**;
       then 52 KB (transitions), 41 KB (328 colour properties), 33 KB (`:root`, 206 properties), 20 KB (`:root`),
       13 KB (`:root`, 90 properties) ...
     - `:root` matches nothing inside a shadow root:  if those sheets are `:root`-only, every root pays to hold
       ~230 KB of rules that can't apply (check:  only each sheet's first selector was read)
     - each root is its own style scope, so the browser matches its ~12 sheets against its own elements, root by root
   - Inline tables of the top sheets:  `perf-results/2026-11-20-1103-sheets-editor.json` and `-sheets-docs.json`.
   - The editor pays the same way, smaller:  2.0 s of style on desktop, 9.6 s on the phone (phonewide),
     915 roots x 12.3 sheets.
   - Also forced style flushes in a loop:  `ScrollShades.bodyOf()` (`<ui-panel>`) calls `getComputedStyle()` on each
     child every refresh:  3.5 s of the editor's phone load, 0.9 s of 60 keys typed.
   - Where to look:  the per-root foundation sheets (fewer, smaller, or `:host`-only tokens inherited from the page);
     fewer shadow roots for leaf elements (`<ui-icon>` x179, `<ui-text>` x112, `<ui-action>` x149 in the editor).
2. **The editor's start on a phone CPU.**
   - Phone CPU, landscape / tablet width (phonewide):  usable at 7.5 s, then blocked until 27 s;
     14.2 s of blocking time, longest task 2.0 s;  15.4 s of script, 9.6 s of style.
   - Phone width (portrait, which shows the app alone):  usable at 4.7 s, settled at 13.9 s, 7.3 s blocking.
   - Desktop:  usable at 1.4 s, settled at 4.6 s, 1.3 s blocking.
   - **62% of the phone load's CPU profile was the page server's live-reload client** (`servedPath()`,
     `scriptsLoaded()` in `/api/server/live.js`, which the editor joins to hear its project's files change).
     - Each message makes it scan every script on the page (`scriptsLoaded()`:  a `querySelectorAll` and a `new URL()`
       per script, ~400 in the editor).
     - The page server sends a message for every file changed in the kit, so on a busy machine that's a storm:
       one 25 s load of the epic page heard 3,662 messages (its other loads heard 2-6).
     - So part of the editor's phone numbers is this machine's other sessions;  the scan per message is still ours to fix
       (filter messages to the page's own files first;  cache the script list).
     - Also seen while typing:  `URL` (native) 21% and `servedPath` / `scriptsLoaded` 27% of the typing profile.
3. **Memory:  ~100-230 MB of JS heap for small things.**
   - After a forced GC:  the editor on Solitaire 127 MB;  Solitaire alone (Run) 99 MB;
     the kitchen sink 232 MB;  epic-engine's epic page 138 MB.
   - A 6-8 GB phone holds that, but it is far from tight,
     and the DOM and style data come on top (not in these numbers).
4. **Event listeners:  ~5 per element, mostly Solid's delegation in every shadow root.**
   - The editor has 28,700 listeners for 5,594 elements.
   - Of the 20,957 found on elements:  12,821 sit on shadow roots, ~14 per root, the same 14 types each
     (`click`, `pointerdown`, `contextmenu`, `mousedown`, `dblclick`, `keydown`, `focusin`, `focusout`, `input`, `keyup`,
     `submit`, `pointerup`, `pointermove`, `slotchange`):  delegated events installed into every root (estimated:
     Solid's `delegateEvents`).
   - Each Solitaire card image holds 32 (3,456 on 108 images).
   - The kitchen sink has 65,500;  the epic page 40,500.
5. **Run mode ships the whole editor.**
   - Solitaire on its own loads the same 306 scripts, 8.7 MB decoded (2.4 MB gzipped) as the editor,
     and holds 99 MB of heap, for 3,131 elements.
   - On the phone:  usable at 4.0 s, settled at 8.3 s.
   - A runner of its own (the VS Code webview's `runner.js` exists) would be a fraction of it (estimated).
6. **Hundreds of requests at start.**
   - The editor:  308 scripts, 424 requests at load;  the kitchen sink 302 scripts, 447 requests.
   - `spell-runtime.js` (300 KB) is fetched twice:  once as a module, once as text for its copy.
   - The largest files at start:  `spell` 1.56 MB, `lsp` 1.28 MB (the language service, at start, in Run too),
     `solid` 420 KB, `codemirror` 335 KB, `decode` 309 KB, `spell-runtime` 300 KB x2.
7. **The page server sends everything uncompressed, `no-store`.**
   - The kitchen sink transfers 7.7 MB of JS (2.3 MB gzipped, estimated), the epic page 5.4 MB (1.6 MB).
   - It's the dev server;  but the house network's site goes through it too (its Caddy file has no `encode`), so a phone
     there gets the raw bytes (estimated).
8. **Leaks.**
   - `<ui-dropdown>` open / close:  30 kB, 5 nodes and 7.3 listeners kept per cycle, over 50 cycles:  a leak.
   - Epic items opened and folded:  125 kB, 76 nodes, 41 listeners per open, over 10 items:  most likely each item
     keeping its loaded body (by design), not a leak:  check by opening the same items again.
   - The editor's Inspector card and View menu:  ~4 kB per cycle, no nodes, no listeners:  fine.
   - Typing:  26-42 kB of heap kept per key (2.6-4.2 MB for 100 keys):  undo history and compiles, probably;
     worth a heap snapshot.
9. **Typing is fine on desktop, uneven on a phone.**
   - Key to next paint, 100 keys:  desktop median 32 ms, worst 80 ms;  phonewide median 48 ms, worst 216 ms.
   - The key handlers themselves take under 1 ms:  the time is the frame after (style, layout, paint).
10. **Accessibility:  a few real errors, and the code editor's focus doesn't show.**
    - The editor:  `aria-allowed-attr` (critical, 4:  the Code toggle `<ui-item>`), `aria-required-children`
      (critical:  the mode tabs' `tablist`), `aria-input-field-name` (serious:  CodeMirror's content has no name),
      `scrollable-region-focusable`, 11 `region`.
    - Tab-through:  focus reaches controls inside shadow roots and most are visibly marked;
      but in the code pane (`.cm-content`) no ring shows.
    - The kitchen sink:  24 `color-contrast` (the secondary menu demo), a `button-name` (critical:  the Notices button),
      duplicate landmarks (the site's nav and `main`).
    - The epic page:  2 `color-contrast`, nothing else;  every Tab stop marked.
    - `prefers-reduced-motion` IS honoured:  0 animations with it set (2-3 without:  the menu, card moves, the caret blink).
    - `<ui-tooltip>` is never defined on the epic page.

## Is the editor viable on a 2023 mid-range phone today?

- Portrait:  it shows the app alone (Run), usable in ~5 s, steady after ~14 s (busy machine).
- Landscape or a tablet, the full editor:  usable at ~7.5 s, but the page is blocked for another ~20 s;
  once settled, typing is fine (48 ms median).
- Memory fits (127 MB of JS heap), but leaves little room for the person's own app.
- So:  it runs, but the first 20-30 s are not acceptable, and it's not VS Code-class yet.
  Re-measure on a quiet machine first:  part of this is the live-reload storm (2. above).

## What I couldn't measure

- A quiet machine:  the 1-minute load never fell under 9 (14-64) in the hour, so every time is a busy machine's.
- A real phone:  CPU slowing is a stand-in;  it doesn't slow the GPU, and memory isn't limited.
- The editor's file-switch and typing leak loops:  Playwright never found a visible, stable file tab to click
  (twice, forced too);  `perf-leaks.mjs` needs another way to switch files.  Typing's heap is from `perf-typing.mjs`.
- DOM and style memory:  `Performance.getMetrics` gives the JS heap only.
- Gzip on the docs and epic pages:  estimated by compressing the bodies, as the page server sends them raw.
- Safari and Firefox:  Chromium only.

## How it was measured

- Machine:  Apple M5 Pro, 18 cores, 64 GB, macOS 26 (Darwin 25.6);  Chromium 153 (Playwright 1.63), headless.
- **BUSY MACHINE:  every number here was taken while other sessions loaded the Mac** (1-minute load 14-64, over the
  "quiet" line of 9 = half the cores).
  - Trust the bytes, heap, node, listener and sheet counts, and the growth per cycle:  load doesn't move them.
  - The times (paint, ready, long tasks, typing) are inflated, by an unknown factor (estimated 1.2-2x).
- Re-run on a quiet machine, from the kit's root, with the page server up:

  ```sh
  node /Users/owen/www/spell/spell.epics/epics/solid-2-final/research/perf-scripts/perf-run.mjs
  ```

  - It waits up to 10 minutes for the load to drop, builds the editor, measures everything 5 times, writes a dated
    result in `perf-results/` and prints the change from the last one.
  - [Its README](perf-scripts/README.md) has the flags, and how long it takes (about 45-55 minutes with 5 runs, estimated).
- Builds:
  - the editor:  a PRODUCTION build (`vp build`, minified, as `yarn build` makes) served by `vp preview`, which
    gzips and proxies the API to this worktree's page server
  - for the CPU profile only, the same build unminified, so functions keep their names
  - the docs and epic pages:  as this worktree's page server serves them (its dev server:  no compression,
    `Cache-Control: no-store`)
- Cold cache every run:  a new browser and context each time.
- The editor's writes to the server were refused (autosave off, its POSTs of compiled files answered `{}`):
  no file in the kit changed.
- Profiles:
  - desktop:  1600 x 1000, full speed
  - phone:  Playwright's Pixel 7 (412 x 839, touch), CPU slowed 4x through CDP, ~5G (20 ms, 50 Mbps down, 20 Mbps up)
    - 4x on this Mac ~ a 2023 mid-range phone, Pixel 7a or Galaxy A54 (estimated:  their single-core scores are
      roughly a quarter to a third of an M5 Pro's)
  - phonewide:  the phone's CPU and network at 1280 x 800
    - At 767 px and narrower the editor shows the app alone, in Run mode (`SpellEditor`'s `phoneWidth()`), so the code
      pane and Inspector need a wider window:  a phone in landscape (Pixel 7:  839 px) or a tablet.
- "Ready" (usable):  the editor's cards drawn and its code pane showing a line;  the run page's cards;
  the docs and epic pages, every element defined after the first paint.
- "Settled":  the end of the last long task before 3 s without one (a TTI stand-in, capped at 60 s).
- Blocking time:  each long task's time over 50 ms, summed (a TBT stand-in, over the whole load).

## The pages

1. editor:  the editor on Solitaire, Debug (the Program panel) and the Inspector open:  Owen's standard heavy case.
2. docs:  Spell UI's kitchen sink, `/components/ui/kitchen-sink.html`:  every component's examples on one page.
3. epic:  epic-engine's epic page, the biggest (652 KB of HTML;  910 items, 79 phases).
4. run:  Solitaire running on its own:  the editor's Run page, `/run/@spell/examples/Solitaire`.

## The numbers, desktop vs phone

Medians of 3 cold loads (busy machine:  times inflated).  `phonewide`:  the phone's CPU and network at 1280 x 800.

### editor

|  | desktop | phone | phonewide |
| --- | ---: | ---: | ---: |
| first paint (FCP) | 64 ms | 152 ms | 164 ms |
| largest paint (LCP) | 64 ms | 4.8 s | 164 ms |
| usable (ready) | 1.4 s | 4.7 s | 7.5 s |
| settled (last long task) | 4.6 s | 13.9 s | 27.4 s |
| long tasks, total | 2.9 s in 32 | 9.9 s in 51 | 17.6 s in 67 |
| blocking time (TBT-like) | 1.3 s | 7.3 s | 14.2 s |
| longest task | 371 ms | 1.8 s | 2.0 s |
| script / style / layout time | 1.3 / 2.0 / 0.06 s | 5.4 / 3.9 / 0.08 s | 15.4 / 9.6 / 0.32 s |
| requests (JS) | 424 (308) | 415 (307) | 432 (308) |
| JS transferred / decoded | 2.6 MB / 8.7 MB | 2.6 MB / 8.7 MB | 2.6 MB / 8.7 MB |
| JS gzip estimate | 2.4 MB | 2.4 MB | 2.4 MB |
| all transferred | 3.0 MB | 3.0 MB | 3.0 MB |
| JS heap after load / after GC | 141 MB / 127 MB | 139 MB / 118 MB | 152 MB / 127 MB |
| DOM nodes (after GC) | 15,767 | 13,569 | 15,732 |
| event listeners | 28,683 | 27,342 | 28,835 |
| documents | 5 | 5 | 5 |
| elements (through shadow roots) | 5,594 | 4,579 | 5,535 |
| custom elements / shadow roots | 922 / 915 | 841 / 840 | 922 / 915 |
| adopted sheets:  per root / distinct | 12.3 / 55 | 12.4 / 51 | 12.3 / 55 |
| console errors | 0 | 0 | 0 |

### docs

|  | desktop | phone |
| --- | ---: | ---: |
| first paint (FCP) | 7.1 s | 24.9 s |
| largest paint (LCP) | 7.1 s | 62.8 s |
| usable (ready) | 11.8 s | 70.9 s |
| settled (last long task) | 25.8 s | 82.0 s |
| long tasks, total | 22.9 s in 75 | 70.6 s in 113 |
| blocking time (TBT-like) | 18.9 s | 65.0 s |
| longest task | 2.0 s | 12.6 s |
| script / style / layout time | 1.6 / 22.7 / 0.24 s | 14.0 / 62.0 / 1.26 s |
| requests (JS) | 447 (302) | 446 (300) |
| JS transferred / decoded | 7.7 MB / 7.6 MB | 7.6 MB / 7.5 MB |
| JS gzip estimate | 2.3 MB | 2.2 MB |
| all transferred | 11 MB | 11 MB |
| JS heap after load / after GC | 238 MB / 232 MB | 253 MB / 231 MB |
| DOM nodes (after GC) | 90,949 | 90,956 |
| event listeners | 65,501 | 65,885 |
| documents | 35 | 35 |
| elements (through shadow roots) | 32,831 | 32,733 |
| custom elements / shadow roots | 4,467 / 4,467 | 4,467 / 4,467 |
| adopted sheets:  per root / distinct | 11.3 / 133 | 11.3 / 133 |
| console errors | 1 | 1 |


### epic

|  | desktop | phone |
| --- | ---: | ---: |
| first paint (FCP) | 1.5 s | 8.1 s |
| largest paint (LCP) | 1.5 s | 8.1 s |
| usable (ready) | 4.3 s | 8.9 s |
| settled (last long task) | 4.3 s | 22.6 s |
| long tasks, total | 3.9 s in 5 | 20.6 s in 15 |
| blocking time (TBT-like) | 3.6 s | 19.8 s |
| longest task | 2.3 s | 11.0 s |
| script / style / layout time | 1.2 / 0.4 / 0.09 s | 6.9 / 2.1 / 0.51 s |
| requests (JS) | 19 (4) | 24 (4) |
| JS transferred / decoded | 5.4 MB / 5.4 MB | 5.4 MB / 5.4 MB |
| JS gzip estimate | 1.6 MB | 1.6 MB |
| all transferred | 6.9 MB | 6.9 MB |
| JS heap after load / after GC | 156 MB / 138 MB | 153 MB / 139 MB |
| DOM nodes (after GC) | 64,915 | 64,837 |
| event listeners | 40,453 | 40,375 |
| documents | 2 | 2 |
| elements (through shadow roots) | 25,887 | 25,859 |
| custom elements / shadow roots | 2,372 / 2,371 | 2,367 / 2,366 |
| adopted sheets:  per root / distinct | 11.5 / 61 | 11.5 / 61 |
| console errors | 0 | 0 |
| live-reload messages heard | 4 | 6 |


- The epic page's loads are from its patch-up run (`2026-11-20-1103-epic.json`):  in the main run its readiness check waited for `<ui-tooltip>`, which is never defined there.

### run

|  | desktop | phone |
| --- | ---: | ---: |
| first paint (FCP) | 60 ms | 148 ms |
| largest paint (LCP) | 60 ms | 4.0 s |
| usable (ready) | 987 ms | 4.0 s |
| settled (last long task) | 1.4 s | 8.3 s |
| long tasks, total | 714 ms in 4 | 3.9 s in 11 |
| blocking time (TBT-like) | 514 ms | 3.4 s |
| longest task | 330 ms | 1.6 s |
| script / style / layout time | 0.7 / 0.4 / 0.02 s | 3.2 / 1.6 / 0.08 s |
| requests (JS) | 400 (306) | 401 (306) |
| JS transferred / decoded | 2.6 MB / 8.7 MB | 2.6 MB / 8.7 MB |
| JS gzip estimate | 2.4 MB | 2.4 MB |
| all transferred | 2.9 MB | 3.0 MB |
| JS heap after load / after GC | 129 MB / 99 MB | 105 MB / 98 MB |
| DOM nodes (after GC) | 8,074 | 7,948 |
| event listeners | 22,011 | 21,475 |
| documents | 5 | 5 |
| elements (through shadow roots) | 3,131 | 3,131 |
| custom elements / shadow roots | 650 / 649 | 650 / 649 |
| adopted sheets:  per root / distinct | 12.6 / 47 | 12.6 / 47 |
| console errors | 0 | 0 |


## Leaks

Heap after a forced GC, before and after the loop;  a warm-up round first.

| page | loop | cycles | heap per cycle | nodes per cycle | listeners per cycle |
| --- | --- | ---: | ---: | ---: | ---: |
| editor | fold / unfold the Inspector's Code card | 30 | 3-4 kB | 0 | 0 |
| editor | open / close the View menu | 30 | 3-4 kB | 0 | 0 |
| editor | switch files, type 200 characters | -- | not measured (see below) | -- | -- |
| docs | open / close a `<ui-dropdown>` (`open`) | 50 | 30 kB | 5 | 7.3 |
| docs | open / close a `<ui-modal>` (`open`) | 50 | 0 kB | 0 | 0 |
| epic | open / fold an item (`open`), 10 items in turn | 30 | 125 kB | 76 | 41 |

## Typing

100 keys into a comment (Card.spell, line 2), one every 120 ms;  key to the next paint (Event Timing, as INP measures it).

| profile | keys | median | p90 | worst | over 50 ms | over 100 ms | frame median / worst | heap per key |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| desktop | 100 | 32 ms | 40 ms | 80 ms | 1 | 0 | 25 ms / 60 ms | 42 kB |
| phonewide | 100 | 48 ms | 48 ms | 216 ms | 2 | 1 | 38 ms / 211 ms | 26 kB |

- Median handler time under 1 ms (desktop 0.2 ms, phonewide 0.8 ms):  the cost is the frame after.

## Accessibility (desktop)

axe-core 4.13 over the whole page, open shadow roots included;  then 30 Tabs;  then motion with and without `prefers-reduced-motion: reduce`.

- editor:  region (moderate, 11), aria-allowed-attr (critical, 4), aria-input-field-name (serious, 1), aria-required-children (critical, 1), landmark-unique (moderate, 1), scrollable-region-focusable (serious, 1)
  - Tab x30:  7 distinct stops, 11 in shadow roots, 12 visibly marked, 0 on the body
  - motion:  3 animations without a preference, 0 with reduce;  21 reduced-motion rules
- docs:  color-contrast (serious, 24), landmark-unique (moderate, 8), heading-order (moderate, 4), button-name (critical, 1), landmark-main-is-top-level (moderate, 1), landmark-no-duplicate-main (moderate, 1), region (moderate, 1)
  - Tab x30:  14 distinct stops, 27 in shadow roots, 25 visibly marked, 1 on the body
  - motion:  0 animations without a preference, 0 with reduce;  32 reduced-motion rules
- run:  region (moderate, 3), landmark-unique (moderate, 1)
  - Tab x30:  6 distinct stops, 26 in shadow roots, 28 visibly marked, 2 on the body
  - motion:  2 animations without a preference, 0 with reduce;  14 reduced-motion rules

- epic:  color-contrast (serious, 2);  Tab x30:  16 distinct stops, 30 in shadow roots, 30 visibly marked;  motion:  0 / 0

Samples:
- editor `aria-allowed-attr`:  `<ui-item class="CodeToggle" ...>` (4);  `aria-required-children`:  the mode tabs' `<nav role="tablist">`
- editor `aria-input-field-name`, `scrollable-region-focusable`:  CodeMirror's `.cm-content` and `.cm-scroller`;  Tab into the code shows no focus ring
- docs `color-contrast`:  the secondary `<ui-menu>` demo's items;  `button-name`:  `<ui-button title="Notices">`'s inner button

## Event listeners (the editor, desktop)

- by type:  click 3319, pointerdown 1192, contextmenu 1182, mousedown 1096, dblclick 1093, keydown 955, focusin 955, focusout 951, slotchange 926, pointerup 919
- by tag:  #shadow-root 12821, solitaire-card-image 3456, solitaire-card 1664, ui-tree-item 536, ui-action 447, ui-icon 382, ui-text 224, solitaire-column 224, ui-item 148, div 145


## CPU profile tops (the editor, phonewide, unminified build)

Sampled every 0.2 ms, phone CPU (4x).  Self time.  On a busy machine, during a live-reload storm (see finding 2).

### load:  89.8 s sampled

| self | share | function |
| ---: | ---: | --- |
| 37.2 s | 41.5% | `servedPath  live.js:5` |
| 15.4 s | 17.1% | `scriptsLoaded  live.js:9` |
| 5.5 s | 6.1% | `(program)  (native):0` |
| 5.0 s | 5.5% | `querySelectorAll  (native):0` |
| 3.5 s | 3.8% | `bodyOf  ui-panel-sXi-rSNC.js:70` |
| 2.7 s | 3% | `(idle)  (native):0` |
| 2.0 s | 2.2% | `liveAction  live.js:4` |
| 1.8 s | 2% | `glide  spell-runtime.js:19083` |
| 756 ms | 0.8% | `(garbage collector)  (native):0` |
| 687 ms | 0.8% | `eq  dist-CxD2LFnd.js:4399` |
| 668 ms | 0.7% | `(anonymous)  live.js:9` |
| 495 ms | 0.6% | `onChange  live.js:9` |
| 375 ms | 0.4% | `visit  UIRuntime-T_i_2uEC.js:851` |
| 366 ms | 0.4% | `widthIn  CodeMirrorPeek-gMxINRTo.js:10231` |
| 304 ms | 0.3% | `onVisibleChange  ui-popup-CnICmwXb.js:111` |

by file:  live.js 62.1%, (native) 16%, ui-panel-sXi-rSNC.js 3.9%, decode-CldRAnI9.js 3.8%, spell-runtime.js 3%, spell-BLY_JZI4.js 2%

### typing:  20.7 s sampled

| self | share | function |
| ---: | ---: | --- |
| 4.4 s | 21.4% | `URL  (native):0` |
| 3.6 s | 17.4% | `(program)  (native):0` |
| 3.0 s | 14.6% | `scriptsLoaded  live.js:9` |
| 2.6 s | 12.8% | `servedPath  live.js:5` |
| 1.1 s | 5.2% | `querySelectorAll  (native):0` |
| 886 ms | 4.3% | `bodyOf  ui-panel-sXi-rSNC.js:70` |
| 609 ms | 2.9% | `collapse  (native):0` |
| 600 ms | 2.9% | `typeWordsOf  solid-BuiJdJrR.js:11990` |
| 392 ms | 1.9% | `(idle)  (native):0` |
| 276 ms | 1.3% | `liveAction  live.js:4` |
| 274 ms | 1.3% | `scrollingBoxFor  dom-DA9E_LM1.js:142` |
| 174 ms | 0.8% | `(garbage collector)  (native):0` |
| 151 ms | 0.7% | `onChange  live.js:9` |
| 143 ms | 0.7% | `(anonymous)  live.js:9` |
| 106 ms | 0.5% | `linkCell  isEqual-W78dkbdb.js:38` |

by file:  (native) 50.9%, live.js 30.2%, ui-panel-sXi-rSNC.js 4.3%, solid-BuiJdJrR.js 4.1%, dist-CxD2LFnd.js 2.6%, dom-DA9E_LM1.js 1.4%

