# Browser performance scripts

How fast, how big and how heavy Spell's pages are in a real browser, on a desktop and on a mid-range phone.
- Made for epic `solid-2-final` (its notes:  `../perf-browser.md`).
- Headless Chromium through Playwright;  never a real browser window.
- `analyze.mjs`, `build-stats.mjs` and `build-all.sh` here are the bundle-size agent's (`../perf-bundle.md`), not these.

## Run it

From the kit's root, on a QUIET machine:

```sh
spell server start        # the page server must be up:  it serves the docs and epic pages, and the editor's API
node /Users/owen/www/spell/spell.epics/epics/solid-2-final/research/perf-scripts/perf-run.mjs
```

- It waits for the machine to be quiet first:
  a 1-minute load under half the CPU count (9 on an 18-core Mac), re-checked every 30s for up to `--wait` minutes.
  - Still busy after that:  it runs anyway, and marks the result `"busyMachine": true`, with a warning.
  - `--force`:  don't wait.
- It builds the editor twice into a temp folder (production, and unminified so the CPU profile has names),
  serves both with `vp preview`, measures, then stops them.
  Nothing in the kit changes:  the editor's writes to the server are refused while it's measured.
- It writes `../perf-results/<YYYY-MM-DD-HHMM>.json` (the numbers, the load before and after, the git sha,
  Chrome's version, the flags), then prints every number against the previous dated file:
  its change, `WORSE` when worse by more than 10%.

### Flags

| Flag | What it does |
| --- | --- |
| `--page editor,docs,epic,run` | which pages (default all four) |
| `--profile desktop` or `phone` | one profile (default both);  `phone` also runs the editor at `phonewide` |
| `--runs N` | cold loads per page and profile, medians reported (default 5) |
| `--steps load,leaks,typing,a11y,listeners,sheets,cpu` | which measurements (default all) |
| `--wait <minutes>` | how long to wait for a quiet machine (default 10) |
| `--force` | don't wait |
| `--editor <url>`, `--editor-nomin <url>` | editor builds you're already serving:  skips the builds |
| `--out <file>` | write there instead of the dated file (a trial run) |

### How long it takes

On the M5 Pro, with the defaults (5 runs):  about 30-40 minutes (estimated from a 3-run pass on a busy machine).
- The editor's phone loads are the slow part:  20-35s each, waiting for 3s with no long task.
- A quick check of one page:  `--page docs --profile desktop --runs 1 --steps load` takes about a minute.

## The pages

| Name | What | Ready when |
| --- | --- | --- |
| `editor` | the editor, Solitaire, Debug (the Program panel) and the Inspector open:  Owen's standard heavy case | its cards are drawn, and the code pane has a line (at phone width:  the cards alone, as no code pane shows) |
| `docs` | Spell UI's kitchen sink, `/components/ui/kitchen-sink.html` | every element is defined |
| `epic` | epic-engine's epic page, the biggest | every element is defined |
| `run` | Solitaire running alone, the editor's Run mode, `/run/@spell/examples/Solitaire` | its cards are drawn |

## The profiles

| Name | What |
| --- | --- |
| `desktop` | 1600 x 1000, no slowing down |
| `phone` | Playwright's Pixel 7 (412 x 839, touch), the CPU slowed 4x, ~5G (20ms, 50 Mbps down, 20 Mbps up), cold cache |
| `phonewide` | the phone's CPU and network at 1280 x 800:  the editor shows its code pane and Inspector there, as on a tablet |

- 4x on this Mac stands in for a 2023 mid-range phone (Pixel 7a, Galaxy A54) (estimated:  their single-core scores are
  roughly a quarter to a third of an M5 Pro's).
- Memory isn't limited:  the heap numbers say what a phone would need to hold.

## The scripts

Each runs on its own too, and writes a JSON file (`--out`);  `perf-run.mjs` runs them and gathers their numbers.

| Script | What it measures |
| --- | --- |
| `perf-run.mjs` | everything, waiting for a quiet machine first;  the one to run |
| `perf-lib.mjs` | shared:  the pages, the profiles, opening a page cold, the metrics, the DOM census |
| `perf-load.mjs <page> <profile> [--runs N]` | FCP, LCP, ready, TTI-like (last long task before 3s quiet), long tasks, TBT-like;  requests and bytes (transferred, decoded, a gzip estimate of the JS), the top 10 files;  heap, DOM nodes and listeners after load and after a forced GC;  elements through shadow roots, custom elements, shadow roots, adopted style sheets and whether they're shared |
| `perf-leaks.mjs <page> [profile]` | an interaction repeated (switch files, fold a card, open a menu, type;  open a dropdown or modal;  open an epic item), heap / nodes / listeners after GC before and after, per cycle |
| `perf-typing.mjs [desktop or phonewide]` | 100 keys typed into a comment, one every 120ms:  key to next paint (Event Timing, as INP measures it) and key to next frame |
| `perf-a11y.mjs <page> [profile]` | axe-core's violations by rule;  30 Tabs, where focus lands and whether it's visibly marked (a heuristic);  animations with `prefers-reduced-motion` set and not |
| `perf-listeners.mjs <page> [profile]` | every event listener on the page by event type and by element |
| `perf-sheets.mjs <page> [profile]` | the style sheets shadow roots adopt:  each distinct one's size, rules, custom properties, and how many roots adopt it |
| `perf-cpu.mjs [profile]` | a CPU profile of the editor's load and of typing:  the top 15 functions by self time, and by file;  point `PERF_EDITOR` at an unminified build |

## Reading the numbers

- On a busy machine, trust bytes, heap, node and listener counts and growth per cycle:  they don't move with load.
  Wall-clock times (ready, TTI, TBT, typing) do.
- `uptime` is recorded with every run, and the result says `busyMachine` when the 1-minute load went over half the CPUs.
