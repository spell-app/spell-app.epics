# Sweep 2:  ui-docs-tools

Area:  `spell-ui/src/docs-components/`, `spell-ui/src/tools/`, `spell-ui/site/`, `spell-ui/scripts/`.
By the coherence agent, 2026-10-26 (epic `coherence`, sweep 2).  No files changed.

- Read in the `coherence` worktree, level with `main` but for spell-ui's I142 (8b484a50) and one spell-epic CSS commit:
  `SiteSections.ts` lines are `main`'s (`git show main:site/_src/SiteSections.ts`).
- The score at the start:  80 / 100, 238 copies.
  This area holds 28 of them:  15 real (findings 5, 8, 10, 15, and two harmless ones), 1 left by sweep 1 (the Docker
  sleep), 12 false (below, "Score lines that overcount").
- Owners are `epic owns <path> --json`, branch owners only.

## Findings

### 1. One open / close chevron and one open-all / close-all button, in Spell UI

- **Kind:**  twice, and a plan's:  ui-gaps P14 ("Move Into Spell UI", its plan accepted, building) moves
  `<ui-docs-toc>` into Spell UI as `<ui-toc>`, these copies inside it.
- **Where:**
  - `spell-ui/src/docs-components/ui-docs-toc/UIDocsToc.tsx:214-260` (`foldButton()`, `toggleAllButton()`),
    `:464-492` (their class words and the two double-chevron paths)
  - `spell-ui/src/docs-components/ui-docs-toc/UIDocsToc.css:61-133` (the buttons' look, the chevron's turn)
  - `spell-epic/src/components/epic-item/Fold.tsx:114-120` (`Fold.chevron()`), `:131-140` (`collapseAllButton()`),
    `:146-164` (`toggleAllButton()`), `:187-194` (`expandAllButton()`)
  - `spell-epic/src/components/epic-item/CollapseAll.css:9-44`, `spell-epic/src/components/epic-item/Fold.css:38-60`
  - the plan:  `epics/ui-gaps/parts/p-move-into-spell-ui.html`, "`<ui-toc>`, from `<ui-docs-toc>`":  "The family moves
    to spell-ui/src/components/ui-toc/:  UIToc, its vocabulary ..., sheet, types, TocIndex, HashLanding,
    TocPreferences";  nothing in it shares the glyphs
- **Shared:**
  - byte for byte:  the chevron `M6 3.5 10.5 8 6 12.5` (UIDocsToc.tsx:233 = Fold.tsx:117);  the down and up double
    chevrons (UIDocsToc.tsx:489, 492 = Fold.tsx:135, 160, 191)
  - ONE button that opens everything, then closes everything:  `aria-pressed`, its label swapping (UIDocsToc.tsx:243-260
    ~= Fold.tsx:146-164)
  - drawn inline "on screen in the first frame" (both docstrings);  a square, muted button, the link's colour on hover,
    a 2px focus ring;  the chevron turned 90° while `aria-expanded="true"`
  - the toc says whose:  "the epic pages' chevron", "the epic pages' double chevron" (UIDocsToc.tsx:217, 240)
- **Differs:**  sizes (the toc's in em, Fold's in px);  Fold's reduced-motion rule (Fold.css:55-59);  Fold's two
  single-purpose buttons beside the one toggle.
- **The one:**  Spell UI's, since spell-epic sits above it:  an `OpenCloseControls` in `spell-ui/src/elements/` (core,
  as `ClipboardCopy` is), with `chevron()`, `toggleAllButton({ openLabel, closeLabel, isOpen, onToggle, part })`,
  `openAllButton()`, `closeAllButton()` and ONE sheet, adopted under one name.
  - `<ui-toc>` draws them;  spell-epic's `Fold` keeps its four methods as one-line calls (it imports `spell-ui/core`).
- **Net effect:**
  - the glyphs and their sheet live once, in Spell UI;  the toc's copy goes as P14 moves it
  - `CollapseAll.css` and Fold.css's chevron rules fold into the shared sheet;  a size token where the two differ
  - every open / close control on the docs sites and the epic pages looks and turns one way
- **Saves:**  about 45 lines of TSX and 45 of CSS, 1 copy;  the next list that opens and closes (the nav, the notebook)
  would copy it again.
- **Evidence:**
  - `git grep -n "M6 3.5 10.5 8 6 12.5"` (UIDocsToc.tsx:233, Fold.tsx:117);
    `git grep -n "M4 3.5 8 7.5 12 3.5"` (UIDocsToc.tsx:489, Fold.tsx:160, 191)
  - the toc's copy:  epic-engine P42 (986550da, 2026-10-25 14:52);  owners:  UIDocsToc elemental-spell, Fold none

### 2. open / close in the page contents, not fold, expand and collapse

- **Kind:**  two words, and a plan's:  ui-gaps P14 makes these `<ui-toc>`'s public names, and plans their Spanish as
  "Plegar {section}", "Expandir todo", "Plegar todo".
- **Where:**
  - `spell-ui/src/docs-components/ui-docs-toc/UIDocsToc.en.ts:25-26` ("Each section folds"), `:43-47` (the attribute
    `expanded`), `:66-82` (parts `fold`, `toggle-all`;  "the expand all / collapse all toggle"), `:96-99` (texts
    "Fold {section}", "Expand all", "Collapse all")
  - `UIDocsToc.types.ts:77-91` (`TOC_ALL_FOLDS = ["expanded", "collapsed"]`, kept in the browser;  `TocFolds`;
    `TOC_PREFS.folds`)
  - `UIDocsToc.tsx:101-162` (`handFolds`, `allFolds`, `toggleSection()`, `toggleAll()`);  `TocPreferences.ts:6-36`
  - the plan:  `epics/ui-gaps/parts/p-move-into-spell-ui.html`, its Spanish texts
  - the same pair, other areas:  `spell-epic/src/components/epic-page/EpicPage.en.ts:429-438`,
    `spell-epic/src/components/epic-choices-bar/EpicChoicesBar.en.ts:65-66`,
    `spell-epic/src/tools/_assets/spell-doc-runtime.js:1990-1991`, `spell-epic/src/tools/_assets/spell-syntax.entry.js:14`
- **Shared:**  one idea:  a section's entries shown or hidden, one at a time or all at once.
- **Differs:**  words only.
  `<ui-section>` already says it the decided way:  "Close this section" / "Open this section"
  (`spell-ui/src/components/ui-section/UISection.en.ts:310-311`;  Spanish "Cerrar esta sección" / "Abrir esta sección",
  `UISection.es.ts:16-17`).
- **The one:**  words.md, "open / close" (elemental-spell Q65, Q68, 2026-10-24;  Q74 for these tooltips).
  - P14 already renames `header` to `heading` and drops `collapsed` as it moves the toc:  the same list takes
    `expanded` => `open` (every section's entries open), the texts "Close {section}" / "Open {section}",
    "Open all" / "Close all" (Spanish "Cerrar {section}", "Abrir {section}", "Abrir todo", "Cerrar todo"), the part
    `fold` => `toggle` (`<ui-section>`'s), the kept values `open` / `closed` (the old two moved once,
    `PrefStore.moveOldKey()` or read both).
- **Net effect:**
  - `<ui-toc>` ships with the decided words:  nothing renames a public attribute after it's out
  - the word score's two hits in this area go (UIDocsToc.tsx:147, UIDocsToc.types.ts:81)
  - spell-epic's "Expand all" / "Collapse all" follow in their own repo (Owen asked "expandall/collapseall" in r31:
    words.md writes the decided word)
- **Saves:**  no lines;  2 word-score hits, and a rename before the API is public rather than after.
- **Evidence:**  `git grep -n '"collapsed"' spell-ui/src/docs-components`;  the day:  Q74 moved SiteSections and
  NavPreferences to open / close at 14:12 (41257632), then the toc's P42 wrote "Fold" and "expanded" / "collapsed"
  at 14:52 (986550da).

### 3. One keeper of a page's open and closed sections

- **Kind:**  twice.  Left out in P8 ("the docs runtime script and the site sections");  still 3 copies, and I142 shows
  what they cost.
- **Where:**
  - `spell-ui/site/_src/SiteSections.ts` (main):  `restoreClosed()` 248-260, `onToggle()` 267-274, `openAround()`
    277-292, `landingRules().reveal` 367-382, `instantly()` 516-519, `isClosed()` / `setClosed()` 525-534,
    `readClosed()` / `writeClosed()` 536-545;  its key, `spell-ui/site/_src/site.types.ts:16-19` (main)
  - `spell-ui/src/docs-components/ui-docs-toc/HashLanding.ts:159-175` (`reveal()`, the default rules)
  - `spell-ui/src/docs-components/ui-docs-toc/TocIndex.ts:283-289` (`folded()`)
  - `spell-epic/src/tools/_assets/spell-doc-runtime.js:212` (its key), `:1490-1512` (`isCollapsed()`, `setCollapsed()`,
    `foldAttribute()`), `:2007-2027` (`foldAll()`, `wireSectionFolds()`), `:2101-2107` (`onToggle()`), `:2161-2178`
    (`reveal()`'s section loop)
- **Shared:**
  - a section is closed by `open="false"`, set silently:  the attribute is controlled, so no event and nothing saved
  - the viewer's cancelable `ui-opening` / `ui-closing` saved per page as `{ [id]: closed }` under `spell-folds:<path>`:
    since I142 the SAME key and shape in both, written by two pieces of code
  - a landing opens every section around its target with `--ui-section-duration: 0s` for a few frames, because it
    measures right after (SiteSections.ts:516-519;  the runtime's 2172-2178, and `foldAll()`'s 2008-2016)
- **Differs:**
  - what opens and closes:  the runtime adds the epic blocks (`EPIC_OPENERS`), accordion panels and the saga pages'
    old headings
  - where:  the site only inside its `main`, and only its own tabs (`#site-tabs`);  an epic page starts closed
- **The one:**  a plain-DOM `OpenSections` in Spell UI, beside `<ui-section>`
  (`spell-ui/src/components/ui-section/OpenSections.ts`, a leaf the docs runtime imports alone, as it does `ImageZoom`):
  `isClosed()`, `setClosed()`, `openAround(target, { within, opensTarget, instantly })`, `remember(root, { key })`.
  - `HashLanding`'s default `reveal` and `TocIndex.folded()` call it;  the runtime keeps its epic blocks on top.
- **Net effect:**
  - one rule for "closed", one for opening around a target, one memory:  the next attribute change edits one file
  - the default landing opens WITHOUT the animation too:  today it opens with it and measures 3 frames later
    (`REVEAL_FRAMES`), the very thing the site and the runtime each turned off;  the defaults serve the notebook's API
    tables today, and every page with `<ui-toc>` once P14 makes it public
  - SiteSections loses its open / close half (about 45 lines), the runtime about 30
- **Saves:**  about 70 lines, 3 copies (and TocIndex's check).
- **Evidence:**
  - I142 (spell-ui 8b484a50, 2026-10-26):  "SiteSections restored and opened sections through the old collapsed
    attribute, which <ui-section> stopped reading in ui-gaps P13, so a reload undid every fold ... it reads and writes
    open="false" now, as the docs runtime does, under the docs runtime's key spell-folds:<path>"
  - owners:  SiteSections ui-gaps;  the runtime epic-engine and ui-gaps;  TocIndex elemental-spell.
    HashLanding and TocIndex move into `ui-toc/` in ui-gaps P14.
  - seen on the way:  the runtime's `OPENING` / `CLOSING` (spell-doc-runtime.js:156-157) each name one event twice,
    a rename's leftover (harmless:  the browser drops a repeated listener)

### 4. A page's markup with its byte ranges:  parse5's, as the page editor reads it

- **Kind:**  twice
- **Where:**
  - `spell-ui/scripts/site-sections.ts:558-645` (`HtmlNode`), `:649-800` (`HtmlParser`:  void and raw-text elements,
    an attribute regex, its own table of 12 entities)
  - `src/server/page/PageEditor.ts:140-216` (`ElementRange`, `findById()`:  parse5 with `sourceCodeLocationInfo`)
  - parse5 7.3.0 is in the install:  the kit's server's
- **Shared:**  a page's elements as character offsets (`start`, the start tag's end, `innerStart` / `innerEnd`, `end`:
  `ElementRange` is `HtmlNode`'s shape), so an edit replaces one range and keeps every other byte;  `<template>`s
  looked into.
- **Differs:**  site-sections reads text and comment nodes too, and attributes as written (entities kept, to write them
  back):  parse5 gives every node and every attribute a location, so their raw text is a slice of the source.
- **The one:**  the kit's reading, lifted out of `PageEditor` into a small `spell/server` helper (a tree of nodes with
  their `ElementRange`s and raw attribute slices);  `findById()` and site-sections' converter both read it.
  Spell UI's site tools may use `spell/server`.
- **Net effect:**
  - site-sections drops its own parser and entity table (HTML's full table instead of 12 names)
  - one reader for every tool that edits a page in place
  - checked by `yarn site:sections --check` over every page, byte for byte, before and after
- **Saves:**  about 180 lines, 1 copy.
- **Evidence:**  `git grep -n "sourceCodeLocationInfo"` (PageEditor.ts:156);  site-sections.ts:646-647 ("Just enough
  HTML parsing for hand-written, well-formed pages");  owners:  site-sections ui-gaps.

### 5. The docs search on Spell UI's combobox pieces

- **Kind:**  rebuilt.  The catalog lists the docs search as "not swept yet" under the arrow keys and the highlighted
  option, and as a copy under the keyboard shortcut.
- **Where:**  `spell-ui/src/docs-components/ui-docs-search/UIDocsSearch.tsx`
  - the highlight:  `highlightedIndex` 250, `activeIndex` 253-255, kept in view 258-261, hover 264-267, the wrapping
    step 355-356
  - the results card as a popover:  `cardIsWanted` / `isOpen` 278-285, `onOpenChanged()`, `openCard()`, `closeCard()`
    291-305, focus leaving 328-332, `aria-expanded` 486
  - `/` and Cmd / Ctrl+K:  a document `keydown` listener of its own, 649-677
  - `deepActive()` 698-702
  - the model:  `spell-ui/src/components/ui-search/UISearch.tsx:233` (`F.HighlightedOption`), `:264-278`
    (`F.PopoverPanel`), `:655-690` (its keys)
- **Shared:**  an ARIA combobox:  one highlighted option (`aria-activedescendant`), arrows step it, Enter picks, Escape
  closes, a results panel in the top layer that closes as focus leaves;  a page shortcut;  the focused element through
  shadow roots.
- **Differs:**  it wraps at the ends;  its panel opens on focus and typing, not an `open` attribute;  Escape in three
  steps (close, clear, back to where `/` came from);  its options are links;  its shortcut summons a field in a closed
  drawer.
- **The one:**
  - `F.HighlightedOption` (`spell-ui/src/elements/HighlightedOption.ts`):  `move(delta, { wrap: true })`
  - `F.PopoverPanel` (`spell-ui/src/elements/PopoverPanel.ts`):  its overlay entry closes on Escape and a click outside
  - `UI.keyboard.register()` (`spell-ui/src/runtime/Keyboard.ts:61`), whose docstring names this very case:  "with
    every component listening for keys on its own, an open modal can't stop the page's `/` search shortcut";  today it
    has two users (`Overlays`, the app's notebook)
  - `UI.focus.activeElementDeep()` (`spell-ui/src/runtime/Focus.ts:22`)
  - `spell-ui/forms` is in the site bundle already (`spell-ui/site/_src/SitePacks.ts:35`)
- **Net effect:**
  - the docs search highlights, opens and closes as `<ui-search>` does;  its shortcuts step aside for an open modal
  - the score loses 10 copies (6 "highlighted option", 3 "arrow keys", 1 "disclosure")
- **Saves:**  about 45 lines, 4 copies.
- **Evidence:**  `node bin/spell.mjs coherence score --json` (UIDocsSearch.tsx in three entries);  owners:  ui-gaps.

### 6. Spell UI's generators through the kit's generated-file helpers, formatted in memory

- **Kind:**  rebuilt
- **Where:**
  - `spell-ui/src/tools/generatedFiles.ts:15-28` (`formatFiles()`:  `yarn vp fmt <files>` as a child, about 0.5s a run)
  - `spell-ui/scripts/gen-root.ts:46-58`, `spell-ui/scripts/gen-styles.ts:28-35`:  write every run, then
    `formatFiles()`;  no `--check`
  - `spell-ui/scripts/tokens-alias.ts:54-59`:  writes, then `formatFiles()`
  - `spell-ui/scripts/readme-components.ts:57-63`:  `yarn vp fmt --stdin-filepath`, a child
  - `spell-ui/src/tools/ReportTables.ts:47-61`:  its own splice between `<!-- generated:<name> -->` markers, the file
    written every run
  - `spell-ui/scripts/site-kitchen.ts:244-260, 325-326` (`PlaygroundWriter`):  a regex splice between
    `<!-- playground:start ... -->` markers, many to a page
  - the homes:  `src/element-tools/generatedFiles.ts:28` (`writeOrCheck()`), `:54` (`spliceGenerated()`);
    `src/server/format.ts:23` (`formatHTML()`:  in memory, any file its extension names:  Spell UI's
    `ElementManifests.ts:271` already formats `jsx.ts` with it)
  - the same child run in spell-epic:  `spell-epic/src/tools/pages.js:395-410` (`tidy()`)
- **Shared:**  a script writes a file, or blocks of one, formatted as `yarn format` would, and changes nothing when
  nothing changed.
- **Differs:**  several named blocks in one file (the report's tables, a page's playgrounds);  a missing marker skipped
  (the report) where `spliceGenerated()` throws;  `tokens:alias` rewrites hand-kept sheets, so it has no `--check`.
- **The one:**  the kit's two helpers, plus `formatHTML()` named for what it does (`formatText(file, text)`), and a
  many-blocks form of `spliceGenerated()` (a block per name, or per match).
- **Net effect:**
  - `formatFiles()` goes;  every generator formats in memory, so `writeOrCheck()` compares formatted text and leaves an
    unchanged file alone
  - `gen:root`, `gen:styles` and `report` gain `--check` (today only tests comparing squashed text catch a stale sheet)
  - the report's tables and the playgrounds splice one way
- **Saves:**  about 45 lines, 6 copies;  every new generator copies one of them.
- **Evidence:**  `git grep -n '"vp", "fmt"'` (generatedFiles.ts:24, readme-components.ts:59, pages.js:402, 425);
  ReportTables.ts:52;  owners:  gen-styles debut;  readme-components and site-kitchen ui-gaps.

### 7. One site-data load for the docs elements

- **Kind:**  twice
- **Where:**
  - `spell-ui/src/docs-components/ui-docs-api/UIDocsApi.tsx:82-103` (`siteData`, `loadError`, `fetched`, `isLoading`,
    `fetch()`)
  - `spell-ui/src/docs-components/ui-docs-tokens/UIDocsTokens.tsx:64-84`:  the same block, its docstrings word for word
  - `spell-ui/src/docs-components/ui-docs-nav/UIDocsNav.tsx:129-133, 141-145` (`navIndex`, `loadError` as text)
  - `spell-ui/src/docs-components/ui-docs-search/UIDocsSearch.tsx:157-188` (the site's data and the search's, settled)
- **Shared:**  `SiteData.load()` once per element;  its result and its error as reactive state;  a "loading" state;  the
  error made an `Error`.
- **Differs:**  what each builds from it (tables, a `NavIndex`, a `SearchIndex`);  the nav keeps the message only;  the
  search loads two files.
- **The one:**  a small reactive holder beside `SiteData` (`spell-ui/src/docs-components/SiteData.ts`), a field as
  `HighlightedOption` is:  `readonly data = new SiteDataLoad()`, with `value`, `error`, `isLoading` and a `loaded`
  promise.
- **Net effect:**  each docs element holds one field instead of a block;  the next one (the inspector, a new widget) gets
  it free.
- **Saves:**  about 30 lines, 2-3 copies.
- **Evidence:**  UIDocsApi.tsx:82-103 beside UIDocsTokens.tsx:64-84;  owners:  UIDocsApi, UIDocsTokens ui-gaps.

### 8. A wait with a time limit:  `within()`

- **Kind:**  twice;  a sibling of the catalog's Wanted "Waiting until something is true"
- **Where:**
  - `spell-ui/src/tools/visual/fixture.ts:144-146` (`within(promise, ms)`)
  - `spell-app/src/spaces/server/node/routes/ProjectBuild.ts:197-203` (`within(work, deadline)`:  the same name,
    written apart)
  - `src/server/page/BundleBuild.ts:192-203` (`untilBuilt()`), `src/cli/run.ts:22-24` (stdout's drain)
  - `spell-ui/src/components/ui-root/UIRoot.tsx:345-347` (on `E.after()`)
  - `spell-epic/src/tools/_assets/spell-comments.entry.js:332`, `spell-epic/src/tools/_assets/spell-doc-runtime.js:908`
- **Shared:**  race a promise against a timer;  three clear the timer after;  the caller goes on either way.
- **Differs:**  seconds, ms or a deadline;  whether it says which won (BundleBuild, UIRoot);  where it runs (the docs
  bundles may load no `spell/element`:  DraftSaver's note).
- **The one:**  `within(promise, seconds)` in the kit's generic util, beside the Wanted `waitUntil()`
  (e.g. `spell/util/wait`):  the value, or `undefined` on time out, its timer cleared;  every bundle may load it.
- **Net effect:**  7 copies onto one;  each raw `setTimeout()` among them leaves the Timing count (76).
- **Saves:**  about 20 lines, 7 copies;  every new "wait, but at most N" copies it again.
- **Evidence:**  `git grep -nP 'Promise\.race\(\['` over each repo's code.

### 9. A family's example sections, read once

- **Kind:**  twice
- **Where:**
  - `spell-ui/scripts/site-kitchen.ts:129-135` (`mainSections()`), `:165-174` (`exampleFile()`:  `types.html` first),
    `:180-202` (`sections()`:  line regexes for `<section>` and `<h4>`), `:213-217` (`trim()`)
  - `spell-ui/src/tools/DesignComponents.ts:364-389` (`examples()`:  `types.html` first, a regex per `<section>`, its
    `<h\d>` as the title, `dedent()`), `:392-395` (`allFolders()`)
- **Shared:**  a family's `examples/elements/*.html`, its main file first;  each `<section>`, its heading the title, its
  body dedented;  a file without sections is one.
- **Differs:**  what each drops (the kitchen:  `stub-*` stand-ins;  the design export:  sections loading a `source`);
  the kitchen keeps a section's class as a wrapping `<div>`;  the design export strips tags from a title.
- **The one:**  `FamilyExamples` beside `FamilyFiles` (`spell-ui/src/tools/`):  `files(folder)`, `sections(file)` =>
  `{ title, className, body }`;  each caller filters.
- **Net effect:**  the kitchen sink, its playgrounds and the claude.ai design export show the same sections by one rule.
- **Saves:**  about 35 lines, 1 copy.
- **Evidence:**  site-kitchen.ts:185, 196 beside DesignComponents.ts:374, 379;  owners:  site-kitchen ui-gaps.

### 10. A sheet's custom properties, read by `ComponentTokens.declarations()`

- **Kind:**  rebuilt
- **Where:**  `spell-ui/src/tools/DesignTokens.ts:470-507` (`rootDeclarations()`:  a character scanner for the `:root`
  tokens outside `@media` / `@container` / `@supports`);  the home, `spell-ui/src/styles/ComponentTokens.ts:153-190`
  (`declarations()`, each with its `selector` and `nested`);  `spell-ui/src/tools/FoundationTokens.ts:32-33` reads the
  same sheets' `:root` tokens through it.
- **Shared:**  every custom property declared on `:root` in a sheet, its value's parentheses balanced, comments out.
- **Differs:**  the design export wants `--spell-*` tokens too (a prefix list);  it keeps the last value per name.
- **The one:**  `ComponentTokens.declarations(css, prefix)` with FoundationTokens' filter
  (`declaration.nested || !ROOT.test(declaration.selector)`), a call per prefix.
- **Net effect:**  one reader of the token sheets for the site's token tables and the design export;  the score's
  "A new syntax" hit at DesignTokens.ts:481 goes.
- **Saves:**  about 30 lines, 1 copy.
- **Evidence:**  DesignTokens.ts:481 (`const char = text[index]`), counted under "A new syntax".

### 11. A name as a title:  `titleCase()` in `spell/util/string`

- **Kind:**  twice, for the catalog's Wanted
- **Where:**
  - `spell-ui/scripts/site-new.ts:247-253` (`titleCase()`:  `getting-started` => `Getting Started`)
  - `spell-ui/src/components/components.types.ts:1889` (`ThemeNames.titleOf()`)
  - `spell-ui/src/tools/DesignComponents.ts:428-432` (`titleFor()`:  the first word only)
  - `spell-epic/src/tool/PlanDocCommands.ts:1450-1453` (`titleCase()`), `spell-app/scripts/examples-readme.ts:150-153`
    (`titleFor()`), `spell-parser/src/spell/SpellLocation.ts:294-300` (`titleFor()`, a kebab name only)
- **Shared:**  a kebab name's words, each capitalised, joined by spaces.
- **Differs:**  `[-_\s]+` or `-` as the break;  the design export capitalises the first word only;  SpellLocation leaves
  a non-kebab name as it is.
- **The one:**  `titleCase(name)` in `spell/util/string` (generic, standalone:  plain `node` and Spell UI load it),
  beside `kebabCase()` and `camelCase()`.
- **Net effect:**  one rule for every generated title;  the catalog's "Text" entry lists it.
- **Saves:**  about 20 lines, 5-6 copies.
- **Evidence:**  the six functions, 3-6 lines each.

### 12. Text cut at its matches, into `<mark>` pieces

- **Kind:**  twice
- **Where:**  `spell-ui/src/components/ui-dropdown/UIDropdown.tsx:642-656` and
  `spell-ui/src/components/ui-search/UISearch.tsx:578-593` (`markedText()`, the same loop);
  `spell-ui/src/docs-components/ui-docs-search/UIDocsSearch.tsx:704-715` (`segments()`), its `TitleSegment`
  (`UIDocsSearch.types.ts:99`)
- **Shared:**  a text and its match ranges => plain and marked pieces, in order.
- **Differs:**  JSX pieces (the dropdown, the search) or `{ text, isMarked }` (the docs search).
- **The one:**  beside `MenuOptions.highlights()` (`spell-ui/src/elements/MenuOptions.ts:177`), a pure
  `marked(text, ranges)` => `{ text, isMarked }[]`;  each draws its `<mark>`.
- **Net effect:**  one splitter for every list that marks matches.
- **Saves:**  about 16 lines, 2 copies.
- **Evidence:**  the three loops, line for line.

### 13. Lines of code, counted once

- **Kind:**  twice
- **Where:**  `spell-ui/src/tools/LocCount.ts:64-99` (`countText()`, `yarn report`'s tables) and
  `spell-epic/src/command/LinesOfCode.ts:239-266` (`countsOf()`, `epic loc`'s guide)
- **Shared:**  a file's lines that hold code:  blank and comment-only lines left out.
- **Differs:**  the comment rules:  only Spell UI's knows HTML `<!-- -->`, only spell-epic's Python `#`;  spell-epic's
  counts characters too.  So the two reports give Spell UI two sizes.
- **The one:**  `codeLines(text, extension)` in the kit, both rules in it;  each tool keeps its own file list (globs, or
  git's tracked files).
- **Net effect:**  `yarn report` and `epic loc` agree on a file.
- **Saves:**  about 30 lines, 1 copy.
- **Evidence:**  the two functions.

### 14. One reduced-motion query

- **Kind:**  twice
- **Where:**  `spell-ui/src/docs-components/ui-docs-toc/HashLanding.ts:119, 253`;  `spell-ui/site/_src/SiteRouter.ts:222,
  434`;  `spell-ui/src/docs-components/ui-docs-nav/UIDocsNav.types.ts:161` with `UIDocsNav.tsx:409` (the
  `no-preference` form);  `spell-epic/src/tools/_assets/spell-doc-runtime.js:2625`;  Spell UI's runtime's,
  `spell-ui/src/runtime/Browser.ts:73-76` (`UI.browser.isReducedMotion`)
- **Shared:**  `matchMedia("(prefers-reduced-motion: reduce)").matches`, read as the motion starts.
- **Differs:**  plain-DOM code can't wait for `UI` (HashLanding, the docs runtime);  the nav asks it the other way round.
- **The one:**  as P12 made `DARK_QUERY` one:  the query and `isReducedMotion()` in the kit's generic `spell/util/dom`
  (beside `nextFrame()`, which HashLanding and the runtime load already);  `Browser.isReducedMotion` reads it;  the nav,
  a component, asks `UI.browser`.
- **Net effect:**  one place says what "less motion" is.
- **Saves:**  about 8 lines, 4 copies.
- **Evidence:**  `git grep -n "prefers-reduced-motion"` over the code (CSS rules aside).

### 15. Small copies of helpers that exist, one each

- **Kind:**  rebuilt
- **Where, and the helper each should call:**
  - `spell-ui/src/tools/SmokeRunner.ts:46, 98-109`:  its own Chromium, page errors and console messages => the kit's
    `BrowserPage.launch()` / `newPage()` with `consoleTypes: ["error", "warning"]` (`onProblem`'s kind tells them
    apart);  its offline route stays.  The score's "A headless page check" 2 => 0.
  - `spell-ui/src/tools/DesignExport.ts:318-336` (`readGit()`):  its own never-throwing git =>
    `SRV.Git.out(args, folder) ?? "unknown"` (`src/server/Git.ts:47`).  "Running git" loses 1.
  - `spell-ui/src/docs-components/SiteData.ts:66-80` (`request()`):  its own fetch and check => `E.fetchOk()` and
    `E.answerOf()` (`spell-ui/src/runtime/runtime.types.ts:502, 536`, through the `spell-ui/core` it imports).
    Left out in sweep 1 ("`$fetch()` can't be used");  P10 has since made `fetchOk()` for exactly this.
  - `spell-ui/scripts/site-dev.ts:49-62` and `spell-ui/src/tools/SiteCheck.ts:176-191`:  the same `spell server start`,
    "parsed from the first `{`" => one `ensurePageServer()` in `spell-ui/src/tools/pageServer.ts`, beside the
    `KIT_ROOT` / `SPELL_CLI` both import (or `SRV.PageServer.ensure(KIT_ROOT)` in-process, as spell-epic's
    `airplane.ts:80` does)
  - `spell-ui/site/_src/SitePatch.ts:99-102, 112-113` and `spell-ui/site/_src/SiteRouter.ts:342-345`:
    `globalThis.SPELL_SERVER` with their own types, the kit's `PageChange` "spelled out" => the kit's `serverConfig()`
    and its `ServerConfig` / `PageChange` (`spell/server/site`, `src/server/site/SiteHeader.ts:337`;
    `src/server/liveClient.ts:33, 86`), which the site already imports from.  spell-epic's `ServerInfo`
    (`spell-epic/src/review/review.types.ts:262`) is a third shape of it.
  - `spell-ui/scripts/site-kitchen.ts:148-151` (`KitchenSinkWriter.indented()`) => the kit's `indented()`
    (`src/util/string.ts:222`):  written in debut P16 (29d4824c, 14:44), half an hour after P6 put it in the kit
    (8c0c0fc9, 14:13)
  - `spell-ui/src/docs-components/ui-docs-api/UIDocsApi.tsx:441-451` (`idForHash()`) => `TocIndex.decode()`
    (`TocIndex.ts:211`), which it imports already;  `decode()` could take the hash with its `#`, which its five callers
    strip themselves (HashLanding.ts:82, SiteSections.ts:307 on main, spell-doc-runtime.js:289, 2486, 2703)
  - `spell-ui/scripts/site-kitchen.ts:314-316` (`ID_REFERENCES`, 10 attributes) beside
    `spell-ui/src/static/StaticInteractions.ssr.ts:128-144` (`REFERENCES`, 14):  the kitchen's misses `aria-details`,
    `aria-errormessage`, `aria-activedescendant`, `headers` and `anchor`, so a playground naming an id that way keeps
    the Examples tab's id => one exported list
  - the site's pages listed four ways:  `spell-ui/scripts/site-kitchen.ts:347-349`,
    `spell-ui/scripts/site-sections.ts:805-810` (`sitePages()`), `spell-ui/src/tools/SiteSearchBuilder.ts:109-116` =>
    `SiteCheck.allPages()` (`spell-ui/src/tools/SiteCheck.ts:135-142`), moved beside `SITE_PAGES` in `tools.types.ts`
  - Spell UI's own folder, worked out 14 times:  `scripts/` gen-emoji.ts:163, gen-icons.ts:46,
    readme-components.ts:39, site-dev.ts:30, site-index.ts:32, site-kitchen.ts:53, site-new.ts:45, site-sections.ts:63,
    tokens-alias.ts:26;  `src/tools/` generatedFiles.ts:28, SiteCheck.ts:671, package.config.ts:10, screenshots.ts:89,
    visual/VisualSettings.ts:18;  six still documented as the old "`packages/ui/`" => one constant beside `SITE_PAGES`
    (`PACKAGE.root` has it, but loads the Vite config)
  - `spell-ui/site/_src/SiteSections.ts:95-98` (main):  a raw `requestAnimationFrame()` scroll throttle =>
    `E.beforeNextPaint()`, as `UIDocsToc.schedule()` does
- **Saves:**  about 100 lines, 10 copies.
- **Evidence:**  each place above;  owners:  SiteCheck, SitePatch, SiteRouter, SiteSections, site-kitchen,
  site-sections, UIDocsApi ui-gaps;  the rest none.

## Score lines that overcount

The area's 12 false hits, and a tighter line for each.
- **Arrow keys through a list:**  `UIDocsSearch.tsx:346, 347, 355`:  the docs search's arrows move a highlight, as
  `<ui-search>`'s do, which the line leaves out already.
  Add `spell-ui/src/docs-components/ui-docs-search/` to its `not`;  the copy is the highlighted option's (finding 5).
- **Building a bundle on demand:**  `spell-ui/src/tools/BundleMeasure.ts:243, 331` (built in memory, to measure),
  `HostApp.ts:32` (the smoke page's host app), `PeerVendor.ts:66` (peers vendored for import-map pages):  none is a
  bundle the page server serves.
  Add `· not spell-ui/src/tools/BundleMeasure.ts, spell-ui/src/tools/HostApp.ts, spell-ui/src/tools/PeerVendor.ts`,
  with a "Fine:" line saying why.
- **Fetching in Spell UI:**  `spell-ui/src/tools/visual/VisualRunner.ts:167`:  a node tool asking the visual tests' dev
  server, not the runtime's fetch.  Add `· not spell-ui/src/tools/`.  (`SiteData.ts:76` is real:  finding 15.)
- **The next frame:**  `spell-ui/src/tools/screenshots.ts:83`:  inside `page.evaluate()`, which Playwright runs in the
  page, where nothing can be imported (as PerfRun's is left).  Add `· not spell-ui/src/tools/screenshots.ts`, a Fine
  line.
- **Remembering a preference:**  `spell-ui/src/tools/SiteCheck.ts:351`:  Playwright seeding a page's fold memory, the
  check's setup.  Add `· not spell-ui/src/tools/SiteCheck.ts`.
- **Timing:**  `spell-ui/src/tools/frameworks/check.js:84`, `frameworks/solid/app.tsx:132`:  the framework host pages,
  framework-free on purpose (sweep 1).  Add `· not spell-ui/src/tools/frameworks/`.
  (`visual/DockerBrowserServer.ts:193`, sweep 1's sleep, and `visual/fixture.ts:145`, finding 8, are real.)
- **A new syntax:**  `spell-ui/src/tools/DesignTokens.ts:481`:  real, but a copy of `ComponentTokens.declarations()`
  (finding 10), not of the tokenizer:  CSS isn't a format of ours.  It goes with finding 10.
- Real but harmless:  **Local dates and times**, `spell-ui/src/tools/visual/ParityReport.ts:36` (a stamp that says it's
  UTC;  the other reports use `localDate()`, so `localMinutes()` would match them);  **The shared content folder**,
  `spell-ui/src/tools/cli.ts:94` (a `../spell.epics` fallback after `contentFolderOf()`, whose own rule for none is
  "look in the checkout").
- Undercounts:
  - **A keyboard shortcut:**  0 copies, while its Copies list six:  every copy writes `(event.metaKey || event.ctrlKey)`,
    which `(?<!!)\b\w+\.(metaKey|ctrlKey) &&` misses (`UIDocsSearch.tsx:651`, `spell-doc-toolbar.js:360`,
    `src/server/liveClient.ts:647`, `spell-app/src/app/pages/editorHotkeys.ts:53`, `spell-doc-comments.js:893` ...).
    Try `\(\w+\.metaKey \|\| \w+\.ctrlKey\)`, read once:  a Cmd+Enter in a field and a new-tab Enter
    (UIDocsSearch.tsx:413) aren't shortcuts.
  - **A file a script writes, kept current:**  misses finding 6's copies.  Add `"vp", "fmt"|<!-- generated:`.
  - **The section being read;  landing on a link:**  misses `UIDocsApi.tsx:447`, a hash decoded without `location.`.

## Considered, left out

- `OldNames`' own tag regexes (ui-gaps P6):  it rewrites markup inside JSX, Markdown and escaped code samples, which no
  HTML parser reads.
- `HtmlFormatter`'s own parse (the example's code pane):  browser code formatting live markup, as sweep 1 found.
- The YAML reader in `gen-icons.ts:422`:  one file of Font Awesome's, read strictly;  no YAML library in the install.
- `SearchIndex` beside `<ui-search>`'s `SearchMatcher`:  a ranked site index against Fomantic's local search;  different
  rules.
- The API table's landed-row flash beside EpicPage's copied flash:  different jobs.
- The nav's group and topic folds (`UIDocsNav.tsx:381-489`):  many in one state, as the accordion's, which the
  disclosure entry leaves.
- SiteCheck's in-page `landedState()`:  a check works its expectation out on its own, on purpose.
- `IconPackBuilder` keeping hand edits:  a merge by key, not a marked block.
- The visual tests' `StaticPages`:  a Vite plugin with its own narrow path test.
- Start tags hand-wrapped at 120 (`site-index.ts:81-85`, `SiteSections.startTag()` at `site-sections.ts:319-324`):
  `docs/` is kept out of oxfmt on purpose (`spell-ui/vite.config.ts:246`), so the layout is the site's own;  its two
  writers could share `startTag()`, 5 lines.
- Tables that never stack (`UIDocsApi`'s `stack-by="none"`, `UIDocsTokens`' token, the epic pages' one rule):  each
  element's own default;  Spell UI's pages' tables are demos.
- `SitePatch`:  already on the kit's `PagePatch`.
