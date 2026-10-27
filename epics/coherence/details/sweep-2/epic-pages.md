# Sweep 2:  epic-pages

Area:  `spell-epic/src/components/`, `spell-epic/src/tools/_assets/` (hand-written only:  `*.entry.js`, `spell-doc-*.js`,
`spell-ui-sources.js`, the `.css`), `spell-epic/src/answers/`, `spell-epic/src/review/`.
By the coherence agent, 2026-10-26 (epic `coherence`, sweep 2).  No code changed.

- Read on the coherence checkout:  spell-epic at `37294db` (one CSS-only commit behind main), the kit at `4d5a866`.
  - epic-engine's unmerged branch read too (`d984eb5`, I147):  findings 10 and 11 meet it.
- Paths:
  - `components/`, `answers/`, `review/` and `_assets/` are spell-epic's (`spell-epic/src/components/` ...);
    a bare `epic-*/` folder is under `components/`;  a bare file name is in the folder last named before it
  - every other path is from the kit's root
- The score at the start:  80 / 100, 238 copies;  45 of them in this area
  (Timing 21, Numbers 5, Text 4, landing 4, a growing text box 4, Fetching 3, and one each of the page server,
  Copying, a toast, a disclosure).

## 1. Timing every epic-page file can reach:  `timing.ts` moves down to `spell/util`

- **Kind:**  twice:  raw timers, because the one mechanism is out of reach.
- **Where:**  20 raw `setTimeout()` / `setInterval()` (the score's Timing count here, the parked goals page aside):
  - the node-safe modules the pack and the docs bundles share:
    `answers/DraftSaver.ts:73, 236`, `answers/AnswerForm.ts:571`, `review/ServerLink.ts:95, 238`,
    `review/SendCountdown.ts:250-254` (a private `every()`:  the kit's, word for word, in ms)
  - the docs scripts:  `_assets/spell-doc-comments.js:393, 734, 862, 1280, 1431`,
    `_assets/spell-doc-runtime.js:254, 783, 908, 1161, 2510`, `_assets/spell-comments.entry.js:184, 293, 332`,
    `_assets/spell-doc-toolbar.js:191`
  - one job among them written by hand seven times, a DEBOUNCE (clear the timer, set it again):
    `spell-doc-comments.js:733-734, 861-862`, `spell-doc-runtime.js:253-254, 782-783`,
    `spell-comments.entry.js:183-184`, `AnswerForm.ts:570-571`, `DraftSaver.ts:66-73`
  - "wait for this, N ms at most" three times:  `spell-comments.entry.js:332`, `spell-doc-runtime.js:908`,
    `spell-doc-runtime.js:1158-1162`;  a sleep:  `spell-comments.entry.js:293`
  - and about 16 raw `requestAnimationFrame()` (`beforeNextPaint()`), which the score doesn't count:
    `spell-doc-runtime.js:528, 529, 570, 772, 893, 2017, 2064, 2070, 2773, 3067`,
    `spell-doc-comments.js:602, 882, 1082`, `spell-comments.entry.js:132, 202`, `spell-doc-helpers.js:197`
- **Shared:**  later, every so often, before the next paint:  what `after()`, `every()`, `soon()` and
  `beforeNextPaint()` name.
- **Differs:**  nothing they lack, but a debounce.
- **Why they can't move today:**
  - `src/element/timing.ts` imports nothing ("Plain JS, importing nothing:  safe to import anywhere", `:13-14`),
    but lives in `spell/element`
  - the pack's build refuses every `spell/element/...` leaf (`src/element-tools/ComponentPack.ts:555`,
    `SHARED_IMPORT`), and `answers/` and `review/` can't take the barrel:  it brings Solid
  - the docs bundles refuse every file of that folder (`spell-epic/src/tools/bundle-spell-ui.js:620-637`)
  - so `DraftSaver` says at the site "NOT on the kit's `after()` ... plain timers" (`DraftSaver.ts:28-29`;
    epic `coherence` P9's "Changed from the plan")
  - only the runtime could reach it now, through `spell-ui/util`, as `HashLanding` does;  the comments' script
    (no Spell UI), the forms and the clients can't
- **The one:**  the same file, moved down:  `src/util/timing.ts`, a generic file importing nothing beside `time.ts`
  and `number.ts`;  `spell/element` and Spell UI's util barrel re-export it, so `E.after()` stays.
  - beside them, one debounce to make (`afterQuiet(seconds, fn)`, each call restarting it), for the seven
- **Net effect:**
  - the kit:  `timing.ts` in `spell/util`;  the catalog's Timing home moves with it
  - spell-epic:  the 20 timers and about 16 frames become `after()`, `every()`, `soon()`, `beforeNextPaint()`;
    `SendCountdown.every()` goes;  the three "at most" waits are `Promise.race([x, after(s)])`
  - `DraftSaver`'s and src/AGENTS.md's "plain timers" notes go
- **Saves:**  about 20 lines;  20 of the score's 76 Timing copies become movable (a quarter of them), and the frames.
- **Evidence:**  `node bin/spell.mjs coherence score --json`, Timing:  `DraftSaver.ts` 2, `ServerLink.ts` 2,
  `SendCountdown.ts` 1, `AnswerForm.ts` 1, `spell-doc-comments.js` 5, `spell-doc-runtime.js` 5,
  `spell-comments.entry.js` 3, `spell-doc-toolbar.js` 1, `goals-live.js` 1.
  `ComponentPack.ts:555`:  `const SHARED_IMPORT = /...|^spell\/element(\/|$)/`.
- **Epic:**  none owns the timers' files (`epic owns`), but the runtime, which is epic-engine's and ui-gaps'
  (their branches change it).

## 2. One page store the elements follow

- **Kind:**  twice.
- **Where:**  six plain classes, each "node-safe at import ... the elements bridge its changes (`subscribe()`)",
  each writing the same members:
  - `answers/AnswerForm.ts:91, 122, 159-171, 222-226, 242-245`
  - `answers/ChoicesForm.ts:70, 82, 110-122, 192-195, 468-471`
  - `answers/RunForm.ts:66, 78, 100-111, 327-336`
  - `review/AgentsClient.ts:34, 40, 57-77, 125-128, 155-158`
  - `review/SendCountdown.ts:36, 50-68, 178-185, 194-197`
  - `review/ReviewClient.ts:90, 96, 138-159, 216-219, 846-849`
  - and their elements, each the same two lines (`@E.state accessor version`, then
    `x.subscribe(() => (this.version = x.version))`):  `components/epic-agents/EpicAgents.tsx:83, 87`,
    `epic-choice-rows/EpicChoiceRow.tsx:139`, `epic-choices-bar/EpicChoicesBar.tsx:68`,
    `epic-choices/EpicOption.tsx:551`, `epic-run/EpicRun.tsx:181`, `epic-send-buttons/EpicSendButtons.tsx:112`,
    `epic-send/EpicSend.tsx:117`, `epic-text-box/EpicTextBox.tsx:116`, `epic-review/ReviewState.ts:57`
- **Shared:**
  - `version = 0`;  a `Set` of listeners;  `subscribe(listener)`, returning the undo
  - a change call (`changed()` / `notify()`):  `version++`, then every listener
  - `private static current`, `static forPage()` making the page's one, `static adopt()` for tests
- **Differs:**  only what `forPage()` makes and starts:  its options, a first read, `watch(window)`.
- **The one:**  a base class to make, `PageStore`, in `spell-epic/review` beside `ServerLink` (node-safe):
  `version`, `subscribe()`, `changed()`, and the page's one (`forPage()` handed its maker, `adopt()`).
  - later, perhaps:  the kit's reactive engine (`spell/util/reactive`), once these pages bridge their Solid onto it
    (`bridgeSolid()`, which no page calls yet)
- **Net effect:**
  - six classes extend `PageStore`;  about 15 lines each go
  - the elements' bridges stay as they are
  - the next client or form starts from it, not from a copy
- **Saves:**  about 80 lines, 6 copies.
- **Evidence:**  `git grep -n "listeners = new Set<() => void>()"` over every repo:  these six, and no other;
  `git grep -n "static adopt("`:  the same six.
- **Epic:**  none:  epic-engine's page names `AnswerForm.ts` and `ReviewClient.ts` (`epic owns`:  `plan` only).

## 3. One landing on an epic page:  the elements still land links themselves

- **Kind:**  twice.  Sweep 1's landing finding (coherence I10, P11) counted the runtime's and Spell UI's;
  these two were missed.
- **Where:**
  - `components/epic-section/EpicFold.tsx:447-510` (`watchHash()`, `followHash()`, `land()`:  its own frame loop
    until the target stays put, stopped by the viewer's input), its constants `:538-547`
  - `components/epic-item/EpicItem.tsx:896-929` (`watchHash()`, `followHash()`:  opens itself, loads its part,
    then `scrollIntoView()`)
  - beside the page's own lander, which does all of it for the same `hashchange`:
    `_assets/spell-doc-runtime.js:2443-2466` (`wireAnchors()`, on Spell UI's `HashLanding.use()`)
    - its `reveal()` opens epic folds and items (`:2161`, `EPIC_OPENERS` `:179`)
    - `hostHolding()` loads the part holding the id (`:1215`)
    - `offsetFor()` lands at the same line (`:2353-2373`)
  - what the two keep in step by hand:  `EPIC_LAND_GAP = 8`, "`EpicFold`'s `LAND_GAP`" (`spell-doc-runtime.js:201-202`);
    the viewer's input list three times (`EpicFold.tsx:547`, `spell-doc-runtime.js:170`,
    `spell-ui/src/docs-components/ui-docs-toc/HashLanding.ts:238`)
- **Shared:**  a `#hash` naming something inside a fold:  open what hides it, load its part, scroll it below the stuck
  titles, follow it while the page settles, stop once the viewer moves.
- **Differs:**  an element answers for its own subtree;  `HashLanding` once for the page.
- **The one:**  `HashLanding` (`spell-ui/src/docs-components/ui-docs-toc/HashLanding.ts`), which the runtime already
  uses on every page (`spell-doc-runtime.js:318`).
  - Spell UI's own elements leave a page-owned hash alone (`landing.isPageOwned`, `UIDocsApi.tsx:434`);
    the epic elements don't look
  - an element keeps at most "open me when the hash names me", for a page whose lander doesn't know epic folds
    (Epic UI's, through the site's `SiteSections`), and never scrolls
- **Net effect:**
  - a link on an epic page scrolls once, by one rule (P11's aim:  "the page scrolls once")
  - `EpicFold.land()` and its four constants go;  so does `EpicItem`'s `scrollIntoView()`
  - the runtime's `EPIC_LAND_GAP` stops being a mirror
- **Saves:**  about 90 lines, 2 copies and 2 mirrored constants.
- **Evidence:**  `node bin/spell.mjs map uses HashLanding`:  in spell-epic, only `spell-doc-runtime.js:116`;
  `git grep -n isPageOwned`:  Spell UI only.
- **Epic:**  epic-engine (its branch changes `EpicItem.tsx` and the runtime).

## 4. One answer box:  a line Owen types over, with its reset

- **Kind:**  rebuilt:  since ui-gaps P14 the growing box is Spell UI's `<ui-textarea grow>`.
- **Where:**  one box, three times:  one line (a pasted line break becomes a space, Enter adds none), growing with
  its text, a round reset once it differs from the proposal:
  - `<epic-choice-row>`, on `<ui-textarea grow>` (ui-gaps P14):
    `components/epic-choice-rows/EpicChoiceRow.tsx:229, 332-342, 372-378`;  `EpicChoiceRows.css:174`
  - `<epic-run-row>`, a raw `<textarea>` with its own `field-sizing`:
    `components/epic-run-row/EpicRunRow.tsx:143, 257-267, 283-286`;  `EpicRunRow.css:64-80` (`.field`, `.box`),
    `:87-105` (`.reset`)
  - the syntax page's boxes, raw `<textarea>`s:  `_assets/spell-syntax.entry.js:291-304` (`box()`),
    `:312-320` (`resetButton()`), `:398-409` (the line-break and Enter handlers);
    `_assets/syntax-choices.css:15-31` (`.spell-choice-field`, `.spell-choice-input`:  the run row's `.field` and
    `.box`, rule for rule), `:43-57` (the reset)
  - its feedback, a `<ui-textarea>` already, growing by its own `field-sizing` and 33vh instead of `grow`:
    `spell-syntax.entry.js:351`, `syntax-choices.css:95-100`
  - the docs helpers' `growField()`, measuring by hand (`_assets/spell-doc-helpers.js:215-218`), for the New epic box
    (`spell-doc-runtime.js:3068, 3115`:  a raw `<textarea>` in an HTML string, `:3076-3091`);
    the comments' fields (`spell-doc-comments.js:611, 1160, 1265, 1395, 1533`) are native by the docs rules, left
- **Shared:**  a box as tall as its text (`field-sizing`, else measured), a third of the window at most;
  as an answer:  one line, Enter adding none, a reset to the proposal.
- **Differs:**  the reset's words and what it puts back;  the run row's picks and tick;  the syntax page's
  many-line boxes (a writer's output).
- **The one:**  `<ui-textarea grow>` (`spell-ui/src/components/ui-input/UITextarea.tsx`) for every growing box;
  the one-line answer box once, the choice row's lifted out, as `<epic-text-box>` is for the notes
  (a `line` type:  breaks become spaces, Enter adds none, `reset`), drawn by both rows and the syntax page.
- **Net effect:**
  - the run row and the syntax page draw the choice row's box;  their `field-sizing` CSS and handlers go
  - the syntax page's feedback says `grow`;  its three rules go
  - the New epic box's field is a `<ui-textarea grow>`;  `growField()` serves only the comments' native fields
  - the catalog's "A growing text box" names `<ui-textarea grow>` its home
- **Saves:**  about 80 lines (CSS about 45, script about 35), 3 copies.
- **Evidence:**  the score, a growing text box:  `EpicRunRow.css` 1, `spell-doc-helpers.js` 1, `syntax-choices.css` 2;
  `EpicRunRow.css:69-75` and `syntax-choices.css:20-26`:  `flex: 1 1 auto;  min-width: 0;  field-sizing: content;
  resize: none;  overflow-wrap: anywhere` in both.
- **Epic:**  ui-gaps P14 (building) moved "the choice pages' answer boxes" and left the syntax page's;
  the run row (epic-engine P23) was in no plan.

## 5. One plural for text in English:  `plural(count, noun)`

- **Kind:**  twice:  a mechanism Spell doesn't have yet ("Wanted").
- **Where:**
  - seven helpers of one line:  `spell-epic/src/tool/InboxCommands.ts:788`, `spell-epic/src/tool/SagaCommands.ts:275`,
    `spell-epic/src/tool/TestCommands.ts:184`, `spell-epic/src/tools/index.js:735`, `spell-epic/src/tools/fuss.ts:195`
    (one / many), the kit's `src/server/page/prune.ts:164`, `spell-parser/src/cli/translateProject.ts:1031`
  - in this area, inline 13 times:  `review/ReviewClient.ts:950, 951`, `_assets/spell-doc-comments.js:519, 667, 1582`,
    `_assets/spell-doc-runtime.js:1577, 1909`, `_assets/spell-doc-toolbar.js:474`,
    `_assets/spell-syntax.entry.js:148, 484 (two), 610`
- **Shared:**  `${count} ${noun}${count === 1 ? "" : "s"}`, or its verb's (`needs` / `need`).
- **Differs:**  an irregular word (`box` / `boxes`):  a third argument.
- **The one:**  `plural(count, one, many = one + "s")` in `spell/util/string`, beside `suggest()`:  generic, so the
  docs scripts and plain `node` reach it.
  - NOT the vocabularies' count-picked pairs (`count === 1 ? "agentRunning" : "agentsRunning"`, 8 in the pack):
    each language words its own;  that's Spell UI's vocabulary layer
  - NOTE: the kit's comments name `pluralize` as `spell/util`'s (`src/util/index.ts:13`, `src/util/spell/index.ts:5`,
    `src/util/AGENTS.md:84`);  it's only spell-parser's dependency now:  stale
- **Net effect:**  seven helpers go;  the 13 read `plural(n, "comment")`;  the next count has its helper.
- **Saves:**  about 25 lines, 20 copies.
- **Evidence:**  `git grep -n "function plural"` over every repo:  the six functions (`translateProject.ts:1031` is a
  `const`);  `grep -n "=== 1 ?"` over the area.
- **Epic:**  none.

## 6. One actions row:  `<epic-actions>` on every page

- **Kind:**  twice:  new since sweep 1 (epic-engine P45).
- **Where:**
  - `<epic-actions>`, on epic pages:  `components/epic-actions/EpicActions.tsx:23-36`, `EpicActions.css:16-48`
  - the plain row on every other page:  `_assets/spell-comments.css:84-131`
    (`.spell-block-actions`, `.spell-block-buttons`, `.at-head-row`, the round buttons)
  - and the code choosing between them:  `_assets/spell-doc-helpers.js:87`
    (`block.closest(EPIC_PAGE) ? epicActionsRow() : plainActionsRow()`), `:113-137` (`BLOCK_ROW`, `buttonsOf()`),
    `:174-175` (a `head-row` attribute, or an `at-head-row` class)
- **Shared:**  a line of no height before its block;  its buttons out of the flow, 2px inside the block's top right
  corner (`--spell-block-gap`), 2px apart;  a table's centred on its header row (`--spell-block-head`);  round, on the
  page's ground.
- **Differs:**  the plain row's rule for a docs example (`spell-comments.css:123-127`:  left of its code button).
- **The one:**  `<epic-actions>`, everywhere:  every page that draws a row has the epics pack (the runtime loads it
  on every page, `spell-doc-runtime.js:272, 352`;  the sets' layouts on theirs, `spell-comments.entry.js:5-6`);
  the example's rule moves into its sheet.
- **Net effect:**  one row, its look in one sheet;  the helpers' branches and `buttonsOf()` go.
- **Saves:**  about 50 lines, 1 copy.
- **Evidence:**  `git show 4d0c6a9 -- src/tools/_assets/spell-doc-helpers.js`:  P45 kept the plain row ("elsewhere a
  `div.spell-block-actions`"):  its plan scoped the element to epic pages.
- **Epic:**  epic-engine (P45, merged);  `spell-comments.css` is ui-gaps' branch's.

## 7. Two words:  the fold tooltips Q74 decided are half renamed

- **Kind:**  two words.
- **Where:**  epic `elemental-spell` Q74 (Owen, A:  "people show and hide, they don't fold");  epic-engine's r30
  renamed what its search found (`Fold this|Unfold this`:  nine vocabularies, spell-epic `60805c9`) and was filed
  done.  25 texts in 13 files still say the old words:
  - `components/epic-answer/EpicMore.en.ts:32-33` ("Fold More Details"), `EpicAnswer.en.ts:68-69` ("Fold the answer")
  - `epic-choices/EpicChoices.en.ts:51-52` ("Fold the choices"), `EpicOption.en.ts:134-135` ("Fold option {letter}")
  - `epic-original/EpicOriginal.en.ts:32-36` ("Fold the original discussion")
  - `epic-item/EpicItem.en.ts:300-301` ("Fold {id}" / "Unfold {id}":  every item line's button)
  - `epic-phase/EpicField.en.ts:84` ("Fold this request", beside `:85` "Open this request":  written after r30)
  - `epic-overview/EpicOverview.en.ts:87`, `epic-prompt/EpicPrompt.en.ts:32` (one text, twice:  "Fold or unfold the
    kickoff prompt")
  - `epic-page/EpicPage.en.ts:263` ("Fold or unfold:  how to restart ..."), `:435` ("Fold everything on the page",
    beside `:430` "Open every section, phase and item")
  - `epic-section/EpicSection.types.ts:98` ("Fold everything in {name}", beside `:93` "Open everything in {name}")
  - `epic-choices-bar/EpicChoicesBar.en.ts:65-66` ("Expand all" / "Collapse all")
  - `_assets/spell-doc-runtime.js:1990-1991` ("Expand all" / "Collapse all"), `:2133` ("Fold / unfold"),
    `:2260` ("Unfold section" / "Fold section")
- **Shared:**  a button that shows or hides a box.
- **The one:**  words.md's open / close:  "Open X" / "Close X", "Open everything" / "Close everything".
- **Net effect:**  every fold says open and close;  no page says fold beside an event called open.
- **Saves:**  no lines;  25 texts.
- **Evidence:**  `grep -n -E 'text: "[^"]*\b(Fold|Unfold|Expand|Collapse)' spell-epic/src/components/*/*.en.ts`;
  `spell.epics/epics/epic-engine/requests/r30/request.md` ("filed:  done at once:  the 9 components' tooltips").
  No Score line counts UI text:  a word-list line over the vocabularies' `text:` would have.
- **Epic:**  epic-engine (r30, filed done).

## 8. The data pages read through `ServerLink`

- **Kind:**  rebuilt:  P9 bundled them, but their reads went beside `ServerLink`.
- **Where:**
  - "not on the page server" three times, each with its own notice:  `_assets/commands.entry.js:65-70`,
    `_assets/core-reference.entry.js:71-76`, `_assets/spell-syntax.entry.js:110-115`;
    each wrapping `dataNotice()` its own way:  `commands.entry.js:185-187`, `core-reference.entry.js:261-263`,
    `spell-syntax.entry.js:388-390`
  - the read, a second `$fetch()` reader with its own 404 default:  `_assets/spell-doc-helpers.js:281-287`
    (`fetchFile()`), `core-reference.entry.js:90-95` (`fetchJSON()`)
  - a data file's old `.json` name, four times:  `commands.entry.js:71-72`, `core-reference.entry.js:91`,
    `_assets/spell-doc-comments.js:249-252` (`inboxPathsOf()`), `review/ServerLink.ts:293-298` (`namedFiles()`)
- **Shared:**  a file from the page server, never the cache;  a 404 is "none";  `file://` never asks.
- **Differs:**  text (JSON5) or JSON;  the notice's words and place.
- **The one:**  `ServerLink.get()` (`review/ServerLink.ts:160-181`):  its `missing` answers a 404 AND `file://`
  (`canRead()`), on `$fetch()`, no-store;  it gains `format: "text"`.
  - `drawThenBoot()` (`spell-doc-helpers.js:260`) says the `file://` notice itself, handed where and what
  - the old `.json` name:  one helper, or none:  every file was renamed by `json5-data-files`, a migration gone
    since repo-split Q45 (src/AGENTS.md, "`data/`")
- **Net effect:**  the three `load()`s lose their `file:` branch and `notice()`;  `fetchFile()` and `fetchJSON()` go;
  the old-name rule once.
- **Saves:**  about 40 lines, 7 copies.
- **Evidence:**  `git grep -n -E 'protocol ?[!=]==? ?"file:"'` over every repo:  `ServerLink.ts:123`, these three, and two
  that can't use it (the kit's `SiteHeader.ts:175`, Spell UI's `Sources.ts:48`);  P9's check searched `!==` only.
- **Epic:**  none.

## 9. One fold button:  the item's line and the option's header still draw their own

- **Kind:**  twice:  P8 made `fold.button()` for the cards and panels.
- **Where:**
  - the item's line:  `components/epic-item/EpicItem.tsx:522-533` (chevron, `aria-expanded`, `aria-controls`,
    tooltip by state);  its band click, `onLineClick()` `:843-853`, line for line `Fold`'s `onHeadingClick()`
    (`components/epic-item/Fold.tsx:216-226`:  the controls under the click, `CONTROLS`, a drag's selection)
  - `<epic-option>`'s review header:  `components/epic-choices/EpicOption.tsx:412-441`, its own button beside the
    `fold.button()` its answering header uses (`:312`)
  - hand-made too, each left by P8 on purpose:  `EpicChange.tsx:138`, `EpicThread.tsx:218`, `EpicNewItem.tsx:89`,
    `EpicPageNoteHead.tsx:42`
- **Shared:**  the chevron, `aria-expanded` as it stands, `aria-controls`, a tooltip saying what a click does;
  a click on the band toggles, but not on a control in it.
- **Differs:**  the item's open state is its own `Disclosure`, with events (`EpicItem.tsx:751`), and its note box under
  the line counts as open (`showsOpen()`);  a name (`aria-label`) not the heading's words;  the option's header is a
  `<span>` when it can't fold.
- **The one:**  `fold.button()` and `fold.heading` (`Fold.tsx:88-104, 206-226`), handed an open state that isn't a
  `Fold`'s and an `ariaLabel`.
- **Net effect:**  every fold button in the pack is drawn by one method:  its words (finding 7) and look change once.
- **Saves:**  about 30 lines, 2 copies.
- **Evidence:**  `grep -n aria-expanded spell-epic/src/components`:  `Fold.tsx:94` and these.
- **Epic:**  epic-engine (its branch changes `EpicItem.tsx`).

## 10. One watch over a page's tables

- **Kind:**  twice:  the third copy in flight.
- **Where:**
  - `_assets/spell-doc-runtime.js:447-530` (`wireTableWidths()`)
  - `_assets/spell-doc-runtime.js:555-650` (`wireTableHeads()`)
  - on epic-engine's branch, unmerged:  `wireTwoColumnTables()` (`d984eb5`, the branch's `spell-doc-runtime.js:544-567`)
- **Shared:**  each table box (`tableBoxes(main)`) wired once, again as live updates add tables:
  `new MutationObserver(() => requestAnimationFrame(watch)).observe(main, { childList: true, subtree: true })`, the
  same line each time (`:528`, `:644`);  a redraw batched to a frame (`frame ||= requestAnimationFrame(...)`);
  the window's `resize`.
- **Differs:**  what each does per table (a width toggle, a stuck header copy, column widths), and what it watches per
  table (a `ResizeObserver`, an `IntersectionObserver`).
- **The one:**  one `eachTable(main, { added(box), redraw(boxes) })` in the runtime:  the skeleton once.
- **Net effect:**  the branch's copy lands on it before it merges;  the next table feature starts from it.
- **Saves:**  about 25 lines, 2 copies (3 once the branch merges).
- **Evidence:**  `git grep -n "new MutationObserver(() => requestAnimationFrame(watch))"`:  `:528`, `:644`;
  `git diff main...epic-engine -- src/tools/_assets/spell-doc-runtime.js`.
- **Epic:**  epic-engine (building:  its branch adds the third, cheapest to fold now).

## 11. `<epic-mark>`'s state, and the status lists, beside I147's `DrawnState`

- **Kind:**  twice:  new since sweep 1 (epic-engine P45), being fixed in part.
- **Where:**
  - an item's state as drawn, three ways on main:
    - `<epic-item>`'s `itemState` (`components/epic-item/EpicItem.tsx:235-244`), with the review's live state:
      worked on, urgency, an approve
    - `<epic-section>`'s `stateOf()` (`components/epic-section/EpicSection.tsx:856-862`) and `<epic-mark>`'s `state`
      (`components/epic-mark/EpicMark.tsx:75-80`), both from attributes only
  - epic-engine's I147, on its branch (`d984eb5`), makes `DrawnState` the one rule for the chip, the section's counts
    and the toolbar's badges;  it leaves `<epic-mark>` (P45's To review chips) on its own copy
  - the closed statuses four times, two named `CLOSED_STATUSES` in the pack, both imported by `EpicSection.tsx`:
    `components/epic-item/EpicItem.types.ts:38`, `components/epic-section/EpicSection.types.ts:237`,
    `spell-epic/src/tool/planDoc.types.ts:179`, `_assets/spell-doc-runtime.js:1552`
  - the status-to-state fallback twice:  `EpicItem.types.ts:47` (`STATUS_STATES`), `spell-doc-runtime.js:1671`
    (`CLOSED_STATES`:  a decided item green "however old", where `ItemAge` greys it after a day)
- **Shared:**  an item's colour from its `state`, its status, its age, and what the review says of it now.
- **Differs:**  the runtime's lists are the Epics list's cards and the parked goal sets' items (`data-status`).
- **The one:**  I147's `DrawnState` (`EpicItem.types.ts`, on the branch):  `<epic-mark>` reads
  `DrawnState.of(DrawnState.fieldsOf(item), reviewState.liveOf(item.id))`;  one `CLOSED_STATUSES`.
- **Net effect:**  a To review chip turns blue while Claude works on its item, as the item's own chip does;
  one closed-status list in the pack.
- **Saves:**  about 15 lines, 1 copy and 2 lists.
- **Evidence:**  `git grep -n DrawnState epic-engine -- src`:  no `EpicMark.tsx`;
  `git show epic-engine:src/components/epic-mark/EpicMark.tsx`:  `:74-80` unchanged.
- **Epic:**  epic-engine (building:  I147, in flight).

## 12. The blocks' review controls:  one `onShowNote()`

- **Kind:**  twice.
- **Where:**
  - three identical handlers in three subclasses of `EpicFold`:  `components/epic-overview/EpicOverview.tsx:83-89`,
    `components/epic-section/EpicSection.tsx:613-619`, `components/epic-phase/EpicPhase.tsx:307-313`
  - `<epic-item>`'s pair, `EpicItem.tsx:711-717` (`onShowNote`) and `:720-727` (`onChosen`);
    `<epic-phase>`'s `onChosen` (r32), `EpicPhase.tsx:298-304`
  - each starts with one guard, "its own controls' only":
    `if ((event.target as Node).getRootNode() !== event.currentTarget) return`, then `stopPropagation()`:  six times
- **Shared:**  hear `epic-show-note` / `epic-chosen` from the review controls in its own shadow root;  open, or fold.
- **Differs:**  `<epic-item>` isn't an `EpicFold`;  its `reveal()` is sync.
- **The one:**  `EpicFold` (`components/epic-section/EpicFold.tsx`):  its subclasses' `onShowNote()` once, there;
  the guard a small helper for the item and the fold.
- **Net effect:**  three copies become one;  the next block with review controls inherits it.
- **Saves:**  about 20 lines, 4 copies.
- **Evidence:**  `git grep -n "getRootNode() !== event.currentTarget" -- src/components`:  six;
  `grep -n "extends EpicFold"`:  the Overview, a section, a phase.
- **Epic:**  epic-engine (its branch changes `EpicItem.tsx`, `EpicSection.tsx`).

## 13. The small helpers, rebuilt in the epic pages

- **Kind:**  rebuilt:  epic `coherence` P6's homes.
- **Where:**
  - a clamp, `Math.max(a, Math.min(b, c))`, five times:  `components/epic-comment-pane/EpicCommentPane.tsx:127, 128`,
    `_assets/spell-doc-toolbar.js:200`, `_assets/spell-doc-runtime.js:2641`, `_assets/spell-comments.entry.js:184`
  - a heading's slug:  `spell-doc-runtime.js:1535-1541` (the kit's `slug()`, cut at 48;  over several lines, so the
    Text score misses it)
  - accents folded by hand:  `spell-doc-toolbar.js:76-79` (`accessLetters()`)
  - a sentence:  `review/ReviewClient.ts:760, 922`, by hand, in a file that imports `sentence()` (`:38`, used at `:487`);
    these two add a second full stop to a message that ends in one
  - an ISO time as `14:04`, three wrappers over the kit's `clockTime()`:  `clockOf()` (`review/review.types.ts:469`),
    `PlanDates.clock()` (`spell-epic/src/dates/PlanDates.ts:38`), the syntax page's `time()`
    (`spell-syntax.entry.js:727`);  and inline twice (`answers/DraftSaver.ts:193`, `answers/RunForm.ts:178`).
    src/AGENTS.md names `PlanDates.clock()` the one;  P14 kept `clockOf()` "as a caller"
- **Shared:**  each a helper the kit has:  `clamp()` (`src/util/number.ts`), `slug()` and `withoutAccents()`
  (`src/util/string.ts`), `sentence()` (`review.types.ts:514`), `clockTime()` (`src/util/time.ts`).
- **Differs:**  the slug's cut (`.slice(0, 48)`);  a time from an ISO string, not a `Date`.
- **The one:**  those;  one ISO-time wrapper, `clockOf()`, the rest its callers.
- **Net effect:**  the copies call the kit;  the double full stop goes;  one clock wrapper.
- **Saves:**  about 20 lines, 13 copies.
- **Evidence:**  `node bin/spell.mjs map uses spell::src_util_number_clamp`:  no user in this area;  the score's Numbers
  (5) and Text (`spell-doc-toolbar.js` 3, of which `:78` is real).
- **Epic:**  epic-engine and ui-gaps change the runtime (their branches);  the rest:  none.

## 14. Copy my answers rebuilds `ClipboardCopy`

- **Kind:**  rebuilt.
- **Where:**  `components/epic-choices-bar/EpicChoicesBar.tsx:57-60, 202-210, 234`:  its own `copyState`, timer and
  two seconds.
- **Shared:**  copy, then "Copied" for a moment:  Spell UI's `ClipboardCopy` (`spell-ui/src/elements/ClipboardCopy.ts`),
  in `spell-ui/core`, which the bar imports as `E` already.
- **Differs:**  the bar remembers a refused copy (`failed`) until the next click.
- **The one:**  `E.ClipboardCopy`;  its `copy()` answers false on a refusal, which the bar keeps.
- **Net effect:**  the bar's timer and constant go.
- **Saves:**  about 8 lines, 1 copy.
- **Evidence:**  `node bin/spell.mjs map uses ClipboardCopy`:  `UICode.tsx`, `UIThemeEditor.tsx` only.
- **Epic:**  none (epic-engine's page names the file:  `plan` only).

## Score lines that overcount (and two that undercount)

- **Fetching** (22):  this area's three are false or parked.
  - `review/ServerLink.ts:207`:  `ServerLink.post()`'s own answer;  `ServerLink` is the epic pages' write home (the
    catalog's "The page server, from an epic page"):  add it to the line's `home`
  - `_assets/spell-ui-sources.js:25`:  its `answer` is `SPELL_SERVER.saveFile()`'s result (`{ ok, status, etag }`,
    `src/server/liveClient.ts:279`), not a response:  `not` the file (keep `answer` in the pattern:  the kit's `answer.ok`
    hits are real responses)
  - `_assets/goals-live.js:434`:  parked
- **The parked goals page** (`_assets/goals-live.js`):  6 of the 238, in Fetching, Timing, the page server, Copying,
  a toast and Text.
  - The catalog calls it "Left" (read only until epic-goals rebuilds it), but the score skips only "Fine:" lines:
    a "Fine as it is" line for it takes all six out.
  - The same gap counts two more of the catalog's own "Left:" copies:
    - `components/epic-new-item/EpicNewItem.tsx:89` (a disclosure)
    - `_assets/spell-comments.entry.js:290` (landing):  the catalog leaves that file, which bundles no Spell UI,
      for its `currentSection()`;  this hit is its `go()`
    - Either the score reads "Left:" lines too, or they become "Fine:".
- **The section being read;  landing on a link** (4 here):
  - `components/epic-test-run/EpicTestRun.tsx:207` reads which test to start on (`#m3`), not a landing:  a false hit
  - `spell-comments.entry.js:290` is in a file the catalog leaves (above)
  - the real ones are finding 3's (`EpicItem.tsx:916`, `EpicFold.tsx:468`)
- **Text** (3 here):  `spell-doc-toolbar.js:92, 94` use `normalize("NFD")` to find a letter's place, the marks kept:
  false hits;  `:78` is real.  Tighter:  `\.normalize\("NFD"\)\s*(\.replace|$)`.
- **A growing text box:**  its home is stale:  the growing box is Spell UI's `<ui-textarea grow>` since ui-gaps P14
  (`spell-ui/src/components/ui-input/UITextarea.tsx`, `UIInput.css`), `<epic-text-box>` one of its users;
  `in spell-epic/src/` misses the other repos.  Suggested:  `home spell-ui/src/components/ui-input/`, no `in`.
  Its four hits here are real (finding 4).
- **The page server, from an epic page** (undercounts):  `protocol !== "file:"` misses the data pages'
  `location.protocol === "file:"` (`commands.entry.js:65`, `core-reference.entry.js:71`, `spell-syntax.entry.js:110`);
  its one hit is the parked goals page.  Suggested:  `SPELL_SERVER\?\.token|protocol [!=]== "file:"` · in
  `spell-epic/src/` · not `spell-epic/src/tools/_assets/goals-live.js`.
- **A keyboard shortcut** (undercounts:  0):  `(?<!!)\b\w+\.(metaKey|ctrlKey) &&` misses how the code writes
  Command-or-Control, `(event.metaKey || event.ctrlKey)`:  eight here.
  - five "⌘ Enter sends this note":  `components/epic-agents/EpicAgents.tsx:323`,
    `components/epic-new-item/EpicNewItem.tsx:243`, `spell-doc-comments.js:1270, 1419`, `spell-doc-runtime.js:3120`
  - `spell-doc-comments.js:893` (⌘ I), `spell-doc-toolbar.js:360` (⌘ K), `goals-live.js:222`
  - Suggested:  `\(\w+\.metaKey \|\| \w+\.ctrlKey\)`.  `UI.keyboard.parse("Mod+Enter").matches(event)` serves them:
    `UI` from `spell-ui/core` in the pack, `window.SpellUI.UI` in the comments' script (as `noteToast()` reaches
    `UI.toast`).
- **Timing** (76):  not an overcount, but 20 of them can't move while the home is in `spell/element` (finding 1);
  `requestAnimationFrame()` isn't counted at all (about 16 here).
- **Numbers** (5 here):  all real clamps (finding 13).

## Considered, left out

- The runtime's state filter (`_assets/spell-doc-runtime.js:1727-1820`, `wireItemFilters()`) beside `<epic-section>`'s:
  it filters the Epics list's cards and the parked goal sets' items;  `<epic-list>` could filter by state itself, but
  the goal sets keep it until epic-goals.
- The docs scripts' `customElements.whenDefined()` (8):  the element rule says `whenAttached()`, which the comments'
  bundle can't import:  a rule question (perhaps a suspected bug on `<ui-root>` pages), not a copy.
- The pack's three raw `MutationObserver`s (`EpicChoices.tsx:211`, `EpicVersion.tsx:47`, `EpicPage.tsx:575`):  each
  says at the site why `@E.watches` can't (ancestors, a parent, a page-wide signal).
- Three Sends:  the docs pages' already draws `<epic-send-buttons>`;  `<epic-send>` answers the details route:
  different jobs.
- The comment pane's placement and drag (`EpicCommentPane.tsx:114-160`), the toolbar's key tip
  (`spell-doc-toolbar.js:184-209`):  a dragged pane and a hover tip, which `PopoverPanel`'s anchor can't hold;
  `PhaseDrag` reorders phases, it doesn't move a box.
- A comment anchor's container, `anchor.split("#")[0]` (`review.types.ts:442`, `ReviewInbox.ts:824`):  one-liners,
  their home `BlockAnchors.js:188`.
- Per-page `PrefStore` keys (a prefix and the path, 6 places):  one store, keys byte for byte by design
  (prefs-and-undo P4).
- The vocabularies' count-picked pairs (8):  a per-language plural, Spell UI's vocabulary layer, not finding 5's.
- I128's "taken in" chip reuses `handledMark()`;  I132 / I133's title fitting moved into `<ui-toolbar shrinkable>`
  (ui-gaps P13):  nothing left.
- The New epic box's HTML string (`spell-doc-runtime.js:3076-3091`):  a rule (no markup in strings), not a copy;
  its box is in finding 4, its ⌘ Enter in the keyboard line.
- `<epic-state-filter counts>` built three times (`EpicSection.tsx:540`, `EpicPage.tsx:984`, `spell-doc-runtime.js:1761`):
  one-liners.
- The comments' native textareas and their `growField()`:  native by the docs rules (P14 left them).
