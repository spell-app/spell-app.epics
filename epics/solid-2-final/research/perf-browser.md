# Browser performance:  where Spell falls down now

DRAFT -- the numbers are being filled in from the measurement run.

## How it was measured

- Machine:  Apple M5 Pro, 18 cores, 64 GB, macOS 26 (Darwin 25.6);  Chromium 153 (Playwright 1.63), headless.
- **BUSY MACHINE:  every number here was taken while other sessions loaded the Mac** (1-minute load 14-47, over the
  "quiet" line of 9 = half the cores).
  - Trust the bytes, heap, node, listener and sheet counts, and the growth per cycle:  load doesn't move them.
  - The times (paint, ready, long tasks, typing) are inflated, by an unknown factor (estimated 1.2-2x).
- Re-run on a quiet machine, from the kit's root, with the page server up:

  ```sh
  node /Users/owen/www/spell/spell.epics/epics/solid-2-final/research/perf-scripts/perf-run.mjs
  ```

  - It waits up to 10 minutes for the load to drop, builds the editor, measures everything 5 times, writes a dated
    result in `perf-results/` and prints the change from the last one.
  - [Its README](perf-scripts/README.md) has the flags, and how long it takes (about 30-40 minutes, estimated).
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
