# Solid TLDR: answers to Owen's comments

Epic `solid-2-final`.  The page:  `epics/solid-2-final/details/solid-tldr.html`;  his answers:  `solid-tldr.answer.json5`.
Item numbers are the page's own (its labels), not the order in `tldr-data.js`.
"Measured" means I measured it for this answer, or the research notes did;  "estimated" means a guess, with what it's based on.

---

## 1. Item 6, reactive nested JSON:  "Way to opt out of it?"

Yes, and the cheapest opt-out needs no new Spell at all:  the engine never puts a proxy on data it doesn't have to.
Then one optional phrase covers the rare program that really needs a plain value.

- What the item does (`research/cells-and-stores.md`, "Nested JSON a program holds"):
  - a list or object made of plain data, with no class, gets a proxy on trackers the first time something reads it
  - each nested object gets its own record and cells when it's first read through the proxy
  - a read costs about 2.5 times a plain one.  That's inferred from the Solid 2 guide's proxy measurement, not measured on nested data.
- Who pays today, and who wouldn't:
  - Things (class instances) use accessors, not proxies (`agents/solid/solid-2.md`, "Accessors for Things, a `Proxy` only for class-less data").
  - Rows from a place are already reactive field by field, through cells, in `PlaceCache.keep()` (`src/places/PlaceCache.ts`), so they need no proxy.
  - So the cost lands only on plain JSON a program holds itself:  a reply it parsed, a settings blob, a big table.
- The ways to opt out, cheapest first:
  1. **Engine rules, no phrase.**  Never wrap a frozen object, a class instance, a place's row, or anything Spell's own code marks raw.
     - Spell's own code (core, places) would mark a value raw with a small helper in `spell/util/reactive`, the way Vue's `markRaw` works.
     - Solid's own `markRaw` exists only on 2.0.3, and it also turns off reactivity for every instance of a class (cells-and-stores 6e).
     - Cost:  nothing for programs;  one rule to document.
  2. **One phrase for a value:  PROPOSAL, needs your OK.**  `set the scores to a frozen copy of the reply`
     - Behaviour:  no proxy at all, so reads cost the same as plain JavaScript.
       Changing it in place is an error that says "make a copy first";  it never fails silently.
     - Where it could be misread:
       - "frozen" might read as the screen freezing, or as data held cold somewhere
       - someone might expect a frozen copy to stay in step with the reply.  It doesn't:  it's a copy taken once.
     - Other words considered:  "plain copy" (sounds like plain text), "fixed copy" (sounds like repaired), "read only copy".
       The last one clashes with a place's `it is read only` (`parser/src/spell/ingest/PlaceSpell.ts`), which means the program can't write back to the place.
  3. Per place:  rows from a place with `it is read only` stay unwrapped.
     - No new phrase, but it ties two separate ideas together (can't write back, and not reactive).  Not recommended.
  4. A switch for a whole program:  not recommended.
     - The same line would behave differently from one program to the next, and that's one more thing to explain.
- **Recommend:**  build way 1 as part of the item, and measure a 10,000-row JSON loop with the proxy and without.
  Add way 2 only if a real program shows the cost.  The phrase waits for your OK, and is then checked for ambiguity like any new language.

---

## 2. Item 23, one grammar copy in builds:  "Can we strip them out during the build instead?  ...  Or one file per rule folder per language?"

Yes:  a build step can strip them, and it's a better fit than moving them.
"Them" means the rule tests:  every `addRule(Rule, { tests: [...] })` in `parser/src/spell/rules/<folder>/<folder>.en.ts` and `.es.ts` (`constants.es.ts`, for one).

- How big they are (measured now, on source):  793 `tests:` blocks in the 42 language files, **838 KB of the files' 1,165 KB, 72%**.
  - That's raw source, comments included.  Built and brotli-compressed, the share will be smaller:  the strings compress well.
  - The grammar is 267 KB brotli in the editor's first load, and 791 KB across the three element builds (`research/perf-bundle.md` §1.5, §3).
  - Estimated saving:  about 100 to 160 KB brotli in the editor's first load, and the same in each element-build copy.
    `yarn build` would confirm it in an hour.
- The build step:
  - a small Vite plugin, used only by `build` (`apply: "build"`), in the kit's toolchain so every build can share it
  - it would run in the editor's `app/app/vite.config.ts` and `vite.element.config.ts`, and in the docs bundle's esbuild run, beside `sourceNames()`
  - it reads each `rules/**/*.{en,es}.ts` with TypeScript's parser and removes the `tests` property with `magic-string`
    - both are in the install already, so no new dependency
  - it fails the build on a `tests` value it can't read as a plain array, so it can't go wrong silently
  - dev, Vitest, `spell speedtest` and the syntax table all read the source, so they keep every test
- **Gotcha found:  the language service reads rule tests while the editor runs.**
  - `SpellLanguageService.firstExample()` (`app/src/lsp/SpellLanguageService.ts`, line 3284) shows a rule's first test input as its example.
  - So the plugin keeps each rule's first test and drops the rest.
    Or the language service could read the `example` that `spellSyntax.ts` already generates.
  - Also, `SP.spellParser.speedTest()` typed into a BUILT editor's console would find nothing to time.
    Dev and `spell speedtest` are unaffected.
- One test file per rule folder per language (`constants.en.tests.ts`, `research/perf-code.md` idea 3):
  - 42 new files, and a rule's syntax and its examples end up in different files, which you said you'd rather not have
  - it needs a registration step (`addTests(Rule, ...)`), and `ruleNames.test.ts` and the syntax table would have to find the tests there
  - its one advantage:  no build magic
- **Recommend:**  strip at build time (S, about a day), keeping each rule's first test.
  Keep the item's other half, one shared grammar chunk across the element builds, as planned.
  Rewrite the item's "Adds a limit" line:  no limit is added any more.

---

## 3. Item 24, stop matching 400 KB of CSS:  "a small shared base for every component, plus each component's own?"

Yes:  that's the natural second step after item 24.  The registry that hands sheets to each root already allows it.

- Today (`ui/src/runtime/Styles.ts`, `UIRuntime.ts`, `registerFoundation()`):
  - every shadow root adopts the same foundation sheets:  `layers`, `reset`, `tokens`, `colors`, `sizes`, `animations`
  - then its own family's sheets, then `utilities`, then the theme sheets (`shadow: true`)
  - measured (`research/perf-browser.md` §1, `perf-results/*-sheets-editor.json`):  **about 400 KB of CSS for every root**
    - colours:  163 KB, starting with `:root`, holding 874 custom properties
    - transitions:  52 KB
    - the colour class rules:  41 KB
    - tokens:  33 KB
    - and more
  - the cost:  the kitchen sink spends 22.7 s on style, 62 s on a phone (4,467 roots).  The editor:  2.0 s, 9.6 s on a phone.
  - Each token sheet also carries a backup copy for pages that never loaded it:
    the same tokens again on `:host`, inside `@container not style(--ui-sheet-colors: loaded)` (`colors.css` line 747, likewise sizes, tokens and utilities).
    So every root holds every token twice, and checks that condition for itself (inferred).
- The split:
  - **For every root:**  `layers` and `reset` only, about 16 KB.
    Tokens live on the page once and reach every shadow root by inheritance (that's item 24 itself).
  - **Only for the families that use them:**
    - the colour class rules (`.ui:is(.red, …)`), for families whose vocabulary has a `color` attribute
    - the size rules, for families with `size`
    - `animations`, for families that animate (their `elementSetup.animation`)
    - `utilities`, only where a family's own markup uses a utility class.
      That needs a check across all 101 families.
  - **The backup token sheet:**  adopted only when the page has no tokens.
    Checked once per page by reading `--ui-sheet-colors` on the document, not once per root.
- How it's built:
  - `yarn gen:styles` (`StyleGenerator.ts`, `styles.en.ts`) writes each of colours, sizes and tokens as two sheets:  page tokens, and rules for roots
  - each family's list of sheets comes from its vocabulary (the attributes it accepts), worked out when the root catalog is built (`gen:root`).
    Nobody writes the list by hand.
  - `Styles.adoptInto()` takes the base, then the family's list
- What it saves:
  - estimated:  a plain root (`<ui-icon>`, `<ui-item>`) drops from about 400 KB to roughly 30 to 60 KB
  - style time is likely to fall several-fold on the kitchen sink.  That's a guess, so `perf-sheets.mjs` measures before and after each step.
- Risks:
  - a family that quietly relied on a sheet it didn't name would change how it looks.
    The visual tests catch it, so expect snapshot updates (item 24 already expects them).
  - `componentTokens.test.ts` isn't affected:  no public token moves into a family's sheet
  - themes stay in every root.  They're small (8 to 25 KB).
- Effort:  item 24 is M (a week);  the per-family split adds about another week.
- **Recommend:**  one phase in two steps, measured after each.
  1. Item 24:  tokens on the page, and no `:root` rules or backup tokens inside roots.
  2. Each family's sheets taken from its vocabulary.

---

## 4. Item 30, HTTP/2:  "Make a spell script to create a local certificate, run automatically if necessary"

Most of this exists already:  `spell space local setup` (`app/src/cli/commands/localCommand.ts`) makes a certificate with mkcert, checks this Mac trusts it, and trusts it if not.
The work is to lift that into the kit and point it at `localhost`.

- How it would work:
  - mkcert's own certificate authority (CA), already on this Mac (`~/Library/Application Support/mkcert/rootCA.pem`), signs a certificate for `localhost`, `127.0.0.1` and `::1`
    - kept in `~/.spell/`, beside the local site's
    - trusted through the macOS keychain (`security verify-cert`, then the trust command `setup()` already uses)
  - the page server:  `http2.createSecureServer({ key, cert, allowHTTP1: true })` in place of `http.createServer` (`src/server/WebServer.ts` line 111)
    - `allowHTTP1` keeps the `upgrade` event working, so live reload's websockets (`LiveReload.ts`) still connect over HTTP/1.1, the way browsers fall back
  - the editor's Vite server:  `server.https: { key, cert }`
    - **Vite drops to HTTP/1.1 over TLS whenever `server.proxy` is set**, and the editor's config proxies to the page server.
      So the dev editor may get no HTTP/2 at all unless that proxy goes (to check).
- **The command, suggested before building** (the commands guide:  reuse a noun before inventing one):
  - `spell server certificate [--check] [--undo]`, a verb under the page server's own noun, rather than a new `spell cert`
  - it would replace the certificate half of `spell space local setup`, which would call it too
  - roadmap:  more of the CLI driving everything
  - `spell server start` runs it when HTTPS is on and the certificate is missing, expired, or doesn't cover the name
    - it asks for your password once, in the terminal, only on the first trust
    - if it can't do that (no terminal, not a Mac, no mkcert), the server starts on plain HTTP and says why in one line
  - the code goes in the kit, a `LocalCertificate` in `src/server`:  `src/cli` and the server may not import the app, so `localCommand.ts` would use it from there
  - `commands.json5` updated, and `spell commands check` run, in the same change
- The gotchas:
  1. **Node doesn't trust the macOS keychain by itself.**  Every `spell` and `epic` command that calls the page server over HTTPS would fail.
     Fixes:  give it mkcert's root as `ca`, or Node 24's `--use-system-ca`;  or keep a plain-HTTP port on 127.0.0.1 for the tools.
  2. Firefox may keep its own list of trusted authorities.
     - mkcert installs into it only if `certutil` is there (`brew install nss`)
     - newer Firefox reads the system's list (`security.enterprise_roots.enabled`).  I haven't checked this on your Mac.
  3. CI and the tests stay on plain HTTP.  Playwright would need `ignoreHTTPSErrors` for any HTTPS check.
  4. Every saved `http://localhost:4747` link, and the VS Code side bar's address, moves to `https://`.
     The side bar runs on Electron, which uses the keychain, so it should be fine once trusted.
  5. Another person's Mac has to trust its own CA:  a one-time step, the same one the local site has now.
- New dependency?  No npm package.
  - mkcert is a Homebrew tool (`brew install mkcert`) that `spell space local setup` already needs, so making the page server depend on it needs your OK.
  - Without mkcert we'd need an npm package to make certificates (`selfsigned`, `@peculiar/x509`), because node can't make one by itself.
- **Recommend:**  keep item 30 at priority 2, after item 12 (caching).
  Lift the certificate code into `spell server certificate`, started automatically by `spell server start`, with plain HTTP as the fallback.
  Decide gotcha 1 first:  my pick is a plain-HTTP loopback port for the tools.

---

## 5. Item 33, bound a running app's memory:  "a setting for this and a time to cache;  TanStack Query has good options"

Spell already has TanStack's "how fresh" setting, `check it every`.  What it lacks is TanStack's "how long to hold data nothing uses":  that's item 33.

| TanStack Query (v5) | What it means | Spell today |
| --- | --- | --- |
| `staleTime` (default 0) | how long data counts as fresh before it's asked for again | `- check it every 5 minutes` (`CheckedEvery.ts`);  a device copy is "fresh until the place's next check" (`src/places/AGENTS.md`) |
| `gcTime` (default 5 min;  `cacheTime` until v5) | how long data nothing uses stays in memory | **nothing:  rows a place read are held forever** (`PlaceCache`);  `PlaceReads` keeps about ten released reads, by count not time |
| `refetchInterval` | asking again on a timer | `check it every`, for places that can't announce changes |
| `refetchOnWindowFocus` / `refetchOnReconnect` (on) | ask again, if stale, when the tab comes back or the network returns | not found for reads;  only `SaveQueue` and `PickedFilePlace` listen for `visibilitychange` |
| `retry` (3) | resend after a failure | `WebPlace` resends after a 5xx or 429 |
| `maxPages` (infinite lists) | a cap on pages held | item 50's cap on rows far off screen |

- Why TanStack's names confuse people:  "stale" and "cache" both sound like they're about freshness.
  The rename from `cacheTime` to `gcTime` happened because people read it as freshness.
  So Spell's words should say what happens to the data, not name a mechanism.
- Proposal (Spell phrases are a **PROPOSAL**, each needing your OK):
  1. Freshness:  keep `check it every`.
     - New, no phrase:  a place that has one checks at once when the page comes back after being hidden for longer than that.
       That matches TanStack's focus default.
  2. Memory, for a place:  `- hold what it read for 5 minutes after nothing uses it`
     - Default if unwritten:  5 minutes, TanStack's default.
     - Where it could be misread:
       - "hold" could read as "pause" or "hold back"
       - "uses" means drawn or read by the program;  someone might think a write counts too
     - Avoid "forget":  it sounds like deleting data from the place.
     - Avoid "remember":  Spell already uses it for remembered things.
     - Avoid "keep":  it clashes with `- keep a copy on this device`, which is about the disk, not memory.
  3. For the whole app:  the same two defaults in the app's settings, which each place can override.
     The console's size goes there too, as "the console keeps the last 1,000 lines" (the item's capped ring).
- **Recommend:**  build the time-based hold in `PlaceCache` and `PlaceReads` with the 5-minute default and no phrase first.
  Add the focus re-check.  Bring the two phrases to you before any Spell changes.

---

## 6. Item 39:  "Do you have 'make the editor lazy' anywhere?  If not, add a phase."

No item makes the editor's modes lazy.  Some neighbours cover parts of it:
- 17 · Lazy CSS language service
- 29 · Smaller lazy pieces (dialogs, routes)
- 27 · Load Spanish only when needed
- 39 itself (run mode gets a runner of its own)

Neither the TLDR data, the performance page nor the research mentions Anatomy or Design mode (searched all three).

Draft phase:  **"The editor loads each mode on first use"**
- What the start loads today (`research/perf-bundle.md` §2.1):
  - 85 files, **1,014 KB brotli of JavaScript before the first screen**, 4.9 MB raw
  - the Solid UI chunk alone is 103 KB brotli (the Inspector, the palette, the app's UI), and the language service is 180 KB
  - Solitaire in run mode loads the same 306 scripts, 8.7 MB decoded, as the editor (`perf-browser.md`)
- Already lazy:  CodeMirror (`LazyCodeMirror`), the dialogs (`import()` of `./modals`), Mermaid
- To load on first use:  all of these are exported from `app/src/app/solid/index.ts`, so the editor gets them at start.
  Source sizes (raw, not built):
  - Anatomy mode:  `AppAnatomy*`, 64 KB
  - Design mode:  `Design*`, 58 KB
  - the Debugger:  15 KB
  - the tours:  10 KB
  - Change This and Explain This:  37 KB
  - the palette:  61 KB, on its first key
  - the Inspector and its cards:  381 KB, when its side bar first opens, or each card when it first unfolds
  - the CSS language service, on the first CSS edit (item 17, folded in)
  - the type and thing explorers:  51 KB
- How:
  - each mode or panel becomes a lazy component (`import()` behind a Spell UI loader in its place)
  - it loads ahead while the pointer rests on its tab, as item 29 plans for routes
  - the barrel stops exporting them, with the same NOTE it has for `./codemirror` and `./modals`
  - first entry into a mode may take a second or two, which you said is fine
- What it saves:  estimated, from those source sizes and the Solid chunk's share, **roughly 150 to 300 KB brotli off the start** (with item 17's 180 KB inside it).
  The first phase step is to measure it with `yarn build`'s chunk report.
- Effort:  M.  Risk:  low, but tours and hotkeys that open a mode must wait for it (`editorHotkeys.ts`, `EditorTours.tsx`).
- **Recommend:**  add it as its own phase, priority 2, next to item 29, and fold item 17 in.

---

## 7. Item 90, test how AIs write Spell:  "Another epic is working on this."

It's epic **`agents-in-spell`** ("Agents in Spell", started 2026-11-20, still in its overview).
- Its Q43:  "What's in the clean-Spell test set?"  It's still open, from the guide `guides/agents-in-spell/clean-spell.html`.
  - The recommended answer:  about 20 asks, built from existing examples, scored on four things.
    1. whether the first try parses
    2. whether it lints clean
    3. how many CSS lines it writes
    4. how much of the page is Spell UI
  - The same runs log token counts, for its Q22 and Q35.
- Also its Q7 (decided):  "How does a small local model learn to write Spell?"  Your reply there asked for "a measure of how often a model's first Spell parses".
- One gap:  item 90 compares against React, and Q43 scores Spell on its own.
- **Recommend:**  drop item 90 from this epic, link `agents-in-spell` Q43 from the plan, and `/send agents-in-spell` the React-comparison half.

---

## 8. Page note:  simplify Spell UI by setting simple looks from the component, not through CSS for every attribute?

Partly yes.  But most of the slowness comes from the foundation sheets every root takes in (item 24), not from the attribute rules.
The attribute rules add size and complexity more than time.

- How attributes become looks today:
  - an attribute goes through the vocabulary to class words on the root's top box, Fomantic style (`ui small primary button`, `UIComponent.rootClass`, `src/element/UIComponent.tsx` line 1151)
  - those words are matched by Fomantic-derived rules:  `.ui.basic:is(.button, .buttons)`, `.ui[class*="left attached"].buttons`
  - colour and size already switch by token remap (`--ui-color`, `--ui-scale`, "ONE generic rule set", `ui/AGENTS.md`)
  - counted now:  1.49 MB of family CSS across 101 families
    - about 2,950 `.ui.` rules
    - **774 `[class*=…]` substring selectors**, the slowest kind to match
  - the biggest sheets:  `UIMenu.css` 84 KB, `UITable.css` 71 KB, `UIParts.css` 64 KB, `UIButton.css` 52 KB
- What setting simple looks from the component would gain:
  - far fewer combined-class rules, smaller family sheets, components easier to read, no `[class*=]` matching
  - a family sheet is adopted only by roots of that family, so the speed gain is real but smaller than item 24's (inferred)
- What it would cost if done with inline styles (`style="padding: …"`):
  - an inline style beats every rule but `!important`.
    So page CSS, themes, `::part()` and the `ui.theme` / `ui.app` layers could no longer override it, and that breaks theming.
  - the static render (`spell/ui/static`) would have to write the same styles
  - 101 families each with their own attribute logic:  a long migration, each step needing visual test updates
- **The middle way:**
  - the component works out PRIVATE custom properties from its attributes and sets them on its top box (`--_button-pad`, `--_button-scale`)
  - the CSS reads public token first, then private value:  `padding: var(--ui-button-padding, var(--_button-pad))`
  - overriding still works through tokens and parts, and `componentTokens.test.ts`'s rule still holds
  - the rules that just combine size, colour, compact or fluid fold into a few generic ones
  - real layout variants (`labeled`, `attached`, `animated`, `vertical`) keep their class words:  they genuinely change the structure
  - `[class*="left attached"]` becomes a plain class word or a `data-` value
- **Recommend:**  its own epic, not this one.
  - It's a rewrite across every family, with visual review:  a new future epic, "Lean Spell UI CSS".
    - Not `semantic-ui-migration`:  that one builds a tool to move other people's Semantic UI markup to `ui-*` tags.
  - This epic does item 24 (with the per-family split in answer 3) first.
    Item 24's measurements then show how much the attribute rules still cost, which sizes the other epic.
  - Cheap first step either epic could take:  replace the 774 `[class*=]` selectors with class words, then measure.
