# How the doc pages work

The mechanics behind every page in `packages/docs`:  what loads, what the runtime builds, what the checks check.
For people:  `spell-docs.html` beside this explains the concept and `/epic`;  this is the distilled version.
How to WRITE a page (headings, widgets, code, links):  `../AGENTS.md`.  The scripts are the truth where this drifts.

@spell-app/ui is unfinished, and these pages are also a test of it.  Work around a UI problem here when that's
reasonable, fix it in `spell-ui` when it's a real `ui` bug, and record it either way in `spell-ui-findings.md`.

## History

- Until 2026-09-30 each page was GENERATED:  a hand-written `<name>.html` (styled by `doc.css` / `doc.js`) went
  through `to-spell.mjs` (a Playwright DOM transform) into `<name>.spell.html`, and both were kept to compare.
- Since then the `ui-*` pages ARE the sources:  `to-spell.mjs`, `doc.css`, `doc.js` and the plain sources are gone,
  the runtime builds the navigation (the rail) itself, and pages are plain `<name>.html`
  (the docs root is `index.html`, so a browser opens it for the folder).

## Hard constraints

- Pages are opened straight from disk (`file://`).  Browsers block ES modules there, so a page loads ONE classic
  script, `_assets/spell-ui.js`:  an IIFE bundle of Solid + @spell-app/ui + the page runtime.  No `type="module"`, no
  `import()` at runtime, no fetches of sibling files.
- Icons:  UI's icon packs load with `import()` + `fetch`, so they can't work here.  The bundle carries the icons the
  widgets and pages use (`ICONS` in `scripts/bundle-spell-ui.js`), `UI.icons.register()`ed at start-up, and drops the
  packs (`UI.icons.reset()`) so nothing is requested.  An icon name not in `ICONS` draws nothing:  add it there.
- highlight.js from cdnjs (`11.9.0`) colors code;  offline, code stays plain monospace.
- Exactly ONE copy of Solid in the bundle (UI requires it);  the bundler fails the build otherwise.

## Files

| File | What |
|---|---|
| `scripts/update.js` (`epic pages update`) | bundle, `docs index`, `doc-links.js --check`, `check-spell.js` on every page |
| `scripts/bundle-spell-ui.js` | builds UI (fork + `yarn build`), then bundles `_assets/spell-ui.entry.js` -> `_assets/spell-ui.js` |
| `scripts/index.js` (`epic pages index`) | rewrites the lists in `index.html` from every page's title and description |
| `scripts/pages.js` | where the docs are, `findPages()`, `tidy()` (link targets + oxfmt) -- shared by the scripts |
| `scripts/check-spell.js` | Playwright checks + four screenshots of one page |
| `scripts/doc-links.js` | links `<code>path</code>` references;  `--check` verifies every link |
| `scripts/to-ui-section.js` | converts old `section.s2|s3` pages to `<ui-section>` |
| `_assets/spell-ui.entry.js` | the bundle's entry:  icons first, then UI, then the runtime |
| `_assets/spell-doc-runtime.js` | page behaviour (below) |
| `_assets/spell-doc.css` | page layout and what UI doesn't cover;  reaches into widgets via UI tokens and `::part()` |
| `spell-docs/ui-section-test.html` | the runtime's test page:  every piece of the `<ui-section>` page markup |

## Page skeleton

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Short Title</title>
    <meta name="description" content="One sentence:  shown on its list page." />
    <link rel="stylesheet" href="../../spell-epic/src/tools/_assets/spell-doc.css" />
  </head>
  <body class="spell-doc-page">
    <div class="spell-doc">
      <main class="spell-doc-main">
        <h1>Short Title</h1>
        <p class="lede">One line.</p>
        <ui-section id="summary" header="1. Summary" sticky collapsible dividing collapsed>
          <ui-icon slot="icon" name="lightbulb"></ui-icon>
          ...
          <ui-section id="a-part" header="1.1 A part" sticky collapsible dividing collapsed>
            ...  <!-- sub-sub-items stay plain:  <h4 id> -->
          </ui-section>
        </ui-section>
        <ui-section id="api" sticky collapsible dividing collapsed>
          <span slot="header">2. The <code>x</code> API</span>  <!-- a title with markup -->
          ...
        </ui-section>
      </main>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script src="../../spell-epic/src/tools/_assets/spell-ui.js"></script>
  </body>
</html>
```

- `../_assets/` is relative to the page's folder:  `_assets/` at the top level, `../../_assets/` two deep.
- No navigation in the markup:  the runtime adds the rail.
- EVERY section is `sticky collapsible dividing collapsed`:  a rule under every title, every section folds, and every
  one STARTS folded (code blocks too:  no `open`);  the reader opens what they want.  A sticky page header goes above
  them on every page:  `<ui-sticky class="spell-h1"><header class="spell-page-head">` around the h1.
- The saga pages keep the OLD markup, which the runtime still drives:  `section.s2|s3` >
  `<ui-sticky class="spell-h2|spell-h3">` > `<h2|h3 id>`, `data-fold="closed"` to start folded.
- `spell-docs/ui-section-test.html` is the runtime's TEST page:  every piece of the `<ui-section>` markup (3 deep,
  an h4, a `slot="header"` title, a folded section with a link into it, plan items with `data-status`).  Check
  runtime changes against it, and against an old-markup page.

## Runtime behaviour (`_assets/spell-doc-runtime.js` + `spell-doc.css`)

- Outline (`outlineOf()`):  both markups are read into one outline, which everything below works from.
  - `<ui-section>` pages (`main > ui-section` exists):  top-level sections are the groups;  nested sections, and
    the h3s / h4s in a section's own content (CHEATSHEET cards, sub-sub-items), are their entries, at any depth.
    An entry's label is its `header`, else the text of its `slot="header"` child;  its icon its slotted `<ui-icon>`,
    else its `icon` attribute.
  - old markup:  h2s are the groups, h3s their entries, h4s under the h3 before them
  - an entry with no `id` gets a slug of its label -- but give entries other pages link to an explicit, stable id
- No contents sidebar any more (removed 2026-10-08, P14 of epic `epic-components`:  Owen, "useless"):  the toolbar
  is the one navigation.
- Layout:  one centred content column (max ~880px);  at narrow widths the content runs to the window's edge.
- Toolbar (`buildPageToolbar()`, `nav.spell-toolbar`;  epic `airplane` P8, in place of the floating right-edge
  rail):  the last row of the sticky page header (`.spell-page-head`), so it sticks with it:
  - plain elements, styled by `spell-doc.css` "Toolbar":  one `a.spell-toolbar-item[data-rail]` per top-level
    section, its icon (else its number) and its title;  a red badge counts the items that need Owen (none:  none);
    scroll-follow marks the current section's `selected`
  - titles end in `...` when they don't all fit;  under 50px each, they go (icons only, the title the tooltip:
    `fitTitles()`);  the row scrolls sideways if even that doesn't fit
  - a page without a sticky page header:  the last row of its filter bar, else a sticky bar of its own
  - an epic page's (`buildToolbar()`):  icons only, in `<epic-page>`'s header
  - it can run again (a page updated in place):  it replaces what it built first
- The site header (`<spell-site-header>`, `spell/server/site`):  fixed on top of every page, its height
  `--spell-site-header-height` on `:root` (`siteHeaderHeight()`).  Everything that sticks or lands starts below it:
  the page header and its toolbar, the filter bar, the titles.
- Sticky titles (`trackStickyHeights()`):  an optional page header (`ui-sticky.spell-h1`) just below the site header,
  and the CHEATSHEET's `.spell-filter` bar;  their height is `--spell-top` on `main`, re-measured on resize.
  - `<ui-section>`:  the runtime sets each TOP-LEVEL section's `offset` to the site header + `--spell-top`;  nested
    sections stack their titles below their parents' by themselves.  It also writes `--spell-section-top` (where the
    title sticks) and `--spell-stack` (the bottom of its stack of stuck titles) on every section:
    `scroll-margin-top` reads them, so a section lands with its title at its sticky line and anything in it below
    its stack.
  - old markup:  h2 sticks below the header in its `section.s2`, h3 just below its section's h2 (the runtime sets
    each `<ui-sticky>`'s `offset`);  `--spell-h2-h` / `--spell-h3-h` on the sections feed `scroll-margin-top`
  - LANDING:  every CSS variable and `scroll-margin-top` leaves the site header OUT;  whoever scrolls adds it once
    -- the runtime's `scrollTo()` jumps explicitly, the browser's own jumps through `:root`'s `scroll-padding-top`
    (the site header's height, installed by the element)
  - stuck titles reserve their room as the page's `scroll-padding-top` (`StickyWatch`, both elements:  an INLINE
    style on `<html>`, the lowest stuck edge, so it includes the site header and overrides `:root`'s while
    anything is stuck), so the browser's Page Down / Space skip what's under them (Chromium, Firefox;  Safari pages
    by the full viewport).  Chromium pages by the viewport minus that padding minus its own 40px overlap -- the
    padding where it STARTS, so a title that sticks on the way covered the old bottom:  the runtime pages itself
    (`wirePaging()`), measuring the titles stuck at the destination.
- Folding (`wireFolds()`), saved per page in `localStorage` (`spell-folds:<path>`, `{ [id]: folded }`):
  - `<ui-section collapsible>` folds itself (its chevron, or a click on its title);  the runtime restores the saved
    folds before the sections first draw (else the markup's `collapsed` stands) and saves the reader's toggles
    (`ui-open` / `ui-close`).  A `ui-open` that can't be cancelled is the browser's reveal (find-in-page, a `#hash`
    load opening `hidden="until-found"` content):  not saved.
  - old markup:  the runtime adds a chevron `ui-button.spell-fold` to every h2 / h3;  it or a click on the heading
    folds the section (`section.spell-folded`:  CSS hides all but the heading).  `data-fold="closed"` starts one
    folded.
- Counts (`countItems()`):  a top-level section with `[data-status]` items shows "open/all" on its title:  its
  `badge` (`<ui-section>`), or a `ui-label.spell-count` at its h2's right.  Nested sections get no count of their own.
  Not open:  `done`, and `decided` (an answered question:  "Questions" counts the ones still waiting).
- Anchors (`wireAnchors()`):  any same-page link to an id in `main` -- a section, a heading or a plan item -- is the
  runtime's:  it unfolds every folded section around the target (`collapsed = false`:  not saved), opens the
  target's panel (a plan item's `ui-accordion`), and scrolls by the site header plus the target's
  `scroll-margin-top` (the browser's own jump would add the stuck titles' scroll padding on top).
  - an unfolded `<ui-section>` unfolds without its animation (`--ui-section-duration: 0s` on `main` for a few
    frames) and draws on the next frames:  the jump lands then, and once more after a fold transition's time
    unless the reader scrolled (a `#hash` load lets the browser open the fold itself, animated)
  - the target's entry becomes current even when the page can't scroll it to its line (`follow.pin()`)
- Scroll-follow (`followScroll()`):  the current entry -- the last section / heading whose top has passed its
  landing line, skipping ones hidden by the filter or inside a folded section -- has its toolbar button highlighted, and
  the address follows it.
- Cheat sheets:  `ui-input[data-spell-filter]` filters `ui-card`s by text (every word must match), hides sections
  (`section` or `ui-section`, by `hidden`) with no visible card, remembers the filter in `localStorage`.
- Light / dark:  follows UI's scheme (the OS);  page colors from UI's `--ui-*` tokens.

## Verification

- `epic pages update` must pass;  `--skip-ui-build` reuses `../ui/dist`, `--no-check` skips the browser checks.
- `node scripts/check-spell.js <page> [outDir]` checks one page and writes four screenshots -- look at them.
  - fails on:  console errors, undefined or unrendered `ui-*`, a toolbar that doesn't list every top-level section or
    isn't stuck at the top at phone width, phone-width overflow, a top-level title that doesn't stick (a `<ui-section>` must
    also say `:state(stuck)`;  an h2 its short section pushed out, `:state(bound)`, is fine)
  - the FOLD check (in the JSON as `fold`):  clicks a top-level section's toggle as a reader would (the shadow
    `button[part~=toggle]`, or the old chevron `ui-button.spell-fold`), expects it folded with its content hidden,
    still folded after a reload, unfolded by a second click;  then clears the page's saved folds
- `scripts/to-ui-section.js` converts a page:  ids kept (an old `<section id>` is dropped, its links go to the
  heading's id), `data-fold="closed"` -> `collapsed`, a title with markup -> `<span slot="header">`, `level` set
  where nesting would change the outline
- Open pages as `file://` URLs:  that's how they're read.
