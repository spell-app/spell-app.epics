# Performance from the code:  what's expensive in Spell, and what to try

Epic `solid-2-final`, research by agent `solid-2-final-perf-code`, 2026-11-20.
Read from the code and its docs only:  no browser runs, no bundle builds
(two other agents measure those, beside this file in `perf-results/`).

- The goal (Owen):  apps built with Spell as tight as possible in speed, memory, bundle size and accessibility;
  "as performant as VS Code";  the editor usable on a 2-year-old Android phone (Pixel 7a / Galaxy A54) over 5G.
- How to read it:
  - every claim names a file (links are from the kit's root, as `../../../../<path>`) or a URL
  - **(inferred)** marks what I worked out but didn't measure:  each is a thing for the browser agent to check
  - phone numbers assume a phone runs JavaScript about 4x slower than Owen's Mac, the slowdown Lighthouse's mobile
    profile simulates ([Lighthouse throttling](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md)) **(inferred)**
- The two ranked lists are at the end:  "Most expensive today" and "What to explore".

## 1. The editing pipeline, step by step

What happens after one key is pressed in the code pane, in the order it really runs.
Everything below runs on the page's MAIN THREAD:  there is no worker anywhere in the kit's browser code
(a search for `new Worker(`, `SharedWorker`, `?worker` over `src/`, `parser/src/`, `ui/src/`, `app/src/`, `epic/src/`
finds none;  Monaco's worker went with Monaco, epic `codemirror`).

1. **CodeMirror takes the key** (CodeMirror 6, its text a B-tree of chunks, like VS Code's piece tree).
   - Typing helps run first ([CodeMirrorTyping](../../../../app/src/app/ui/codemirror/CodeMirrorTyping.ts)):
     plain functions of the lines, cheap.
   - The bubbly marks move with the edit at once (`decorations.map()`), and are drawn only for the lines on screen
     ([CodeMirrorRelayout](../../../../app/src/app/ui/codemirror/CodeMirrorRelayout.ts), epic `codemirror` P7).  Good.
2. **The file takes the text, the WHOLE text, every key**
   ([FileStates.stateEdited()](../../../../app/src/app/ui/codemirror/FileStates.ts), line 523):
   - `entry.state.doc.toString()` flattens the rope into one string, then compares it with `file.contents`.
   - `file.contents = text` is reactive:  its follower (`whenContentsChange()`) calls `doc.toString()` again in a
     microtask, to compare once more (`contentsChanged()`, line 558).
   - `project.takeText()` only notes the file as waiting ([SpellProject](../../../../parser/src/spell/SpellProject.ts), line 1464):
     no parse yet.  Good.
   - `editor.onFileEdited()` ([editor.ts](../../../../app/src/app/editor.ts), line 2348):
     `editor.edits++` (a reactive counter), `keepEdit()`, and a compile timer set again for 2 seconds.
   - `editor.edits++` re-runs everything that reads it, on every key:  `hasUnsavedEdits` (looks at every file of the
     project), `canRevertChanges`, the Palette's `isPageShown` (reads the page's chunk tree, once per text, so once per
     key on a page file), Design's `hasEditor`, the Inspector's own-editor page, the notebook's text
     ([Palette.tsx](../../../../app/src/app/solid/Palette.tsx) line 123, [Design.tsx](../../../../app/src/app/solid/Design.tsx) line 433,
     [Inspector.tsx](../../../../app/src/app/solid/Inspector.tsx) line 3691).
   - Cost:  2 whole-text copies and a handful of reactive re-runs a key.
     For Solitaire's biggest file (a few KB) that's microseconds;  it grows with the file **(inferred)**.
3. **The parse waits for a 200 ms pause** (`FileStates.PARSE_WAIT`, line 135), then
   `project.parseWaitingText()` re-parses as little as possible
   ([PARSING.md, "Incremental parsing"](../../../../parser/src/spell/PARSING.md), line 2707):
   - The incremental parser gets the file's new TEXT, and diffs old and new top-level items itself:
     CodeMirror already knows exactly what changed (its `ChangeSet`), but that's thrown away at step 2.
   - Its own measured costs, Solitaire, on Owen's Mac (PARSING.md line 2835 on):
     - a body edit ~10 ms;  a comment, blank line or top-level statement ~1-2 ms
     - a member or a kind added in `Card.spell` ~45-75 ms
     - a declaration edit near the START of the first file ~110 ms, a full parse
   - On a phone, 4x:  a declaration near the top of a project is ~450 ms with the page frozen **(inferred)**.
   - Anything that needs the parse sooner forces it:  a hover, a suggestion, any click or focus on the page
     (`pointerdown` / `focusin` listeners, FileStates line 82).
4. **Problems:**  each file whose parse changed gets `service.diagnostics(file)`, turned into CodeMirror's,
   after another `doc.toString()` check (`parseChanged()`, FileStates line 584).
5. **The bubbly look is laid out again from the WHOLE file**, at the pause or as the parse arrives
   (`SP.BubblyLayout.of(text, parser)`, [CodeMirrorRelayout](../../../../app/src/app/ui/codemirror/CodeMirrorRelayout.ts);
   the marks themselves only for lines on screen).  O(file) a pause **(inferred)**.
6. **Language features** (hover, completion, signature help, go to definition, rename, format) are
   `LSP.SpellLanguageService`, IN-PROCESS, on the main thread
   ([CodeMirrorLanguage](../../../../app/src/app/ui/codemirror/CodeMirrorLanguage.ts), its header).
   - Each asks `fileReady()`, which parses what's waiting and compares `file.contents === doc.toString()`:
     a whole-text copy per hover and per completion request.
   - Suggestions and signature help wait for the typing to pause (800 ms, `hoverDelay()`).  Good.
7. **The compile, 2 seconds after the typing stops** (`EDIT_COMPILE_DELAY = 2`, editor.ts line 2526),
   `editor.compileApp()` (line 570) => `project.compile()` (SpellProject line 426):
   1. it hashes every file's text and every import's declarations (SHA-256, `crypto.subtle`,
      [CompileCache.ts](../../../../parser/src/spell/CompileCache.ts) line 131)
   2. reuses the incremental parse, then writes the WHOLE project again, every file, for every target the project
      file lists (`"Combining output"`, SpellProject line 862):  "a project compiles as one module, so any edit compiles
      it all again" ([spell's AGENTS.md](../../../../parser/src/spell/AGENTS.md), "Built when needed")
      - the writer re-reads the whole project first (`P.WriterProject`, `forProject()`)
      - with a source map made as it writes (`P.SourceMarks`), the declarations split out, each declaration's place
        (`SpellDeclarationPlaces`), the words files
      - none of the built-in examples lists a second target today (no `"targets"` in any `__project.json5`), so it's
        the JavaScript target alone;  a project that lists `ts/solid` and `py` writes three programs a pause
   3. **then SAVES what it wrote, before the program runs**:  the last task of the compile is `saveOutput()`
      (SpellProject line 1007, 1024), each file one `fetch` PUT, one after another
      ([LoadableFile.getSaver()](../../../../src/util/spell/LoadableFile.ts), line 123):
      the declarations, the title words, each words file, the source map, the compiled JavaScript;
      then the compile cache's own PUT of all of it again ([ServerCompileStore.put()](../../../../app/src/app/ServerCompileStore.ts))
      - On localhost that's free.  Over 5G, 5 round trips in a row is ~150-300 ms before the app takes the edit,
        and ~100 KB uploaded a pause for Solitaire **(inferred:  Solitaire's build is 36 KB of code, a 29 KB map,
        16 KB of declarations, `app/build/spaces/@spell/examples/Solitaire/`)**.
   4. logs the whole compiled program, line-numbered, into the app's console AND the browser's
      (editor.ts line 588-597;  [console.ts](../../../../parser/src/core/console.ts) forwards plain values to `console.log`)
   5. works out the Types tab's scope tree again (`refreshScopes()`)
8. **The program runs again** (`executeCompiledApp()`, editor.ts line 838 => [runCompiled()](../../../../app/src/app/runner/runCompiled.ts)):
   - each imported project's compiled code is fetched again ("fetched afresh, so a recompiled library shows at once",
     editor.ts line 835)
   - the source map is parsed and the code stamped with its places (`SourceMarks.stamped()`), then the map is inlined
     as base64 (`SourceMarks.inline()`, [SourceMarks.ts](../../../../parser/src/parser/writers/SourceMarks.ts) line 206,
     a byte at a time into a string), sources' full text included
   - `LiveEdit.between()` diffs the old and new compiled code by lines:  if the edit is inside a type, only that
     type's views draw again ([LiveEdit](../../../../app/src/app/runner/LiveEdit.ts)).  Good.
   - **either way the code is imported from a NEW `blob:` URL**, live edit included (runCompiled lines 32, 168, 299, 312):
     a page never lets go of a module it imported (section 7).

What's redone that needn't be, per pause:  the uploads (7.3), the whole-project write when one body changed (7.2),
the console dump (7.4), the re-fetch of unchanged imports (8), and the hash of every file (7.1).

**The parser's speed test covers none of this pipeline.**
- `SP.spellParser.speedTest()` ([Parser.ts](../../../../parser/src/parser/Parser.ts) line 682) times the RULE TESTS:
  hundreds of one-line snippets, a warm-up, then 20 runs.
- `spell speedtest` ([speedtestCommand.ts](../../../../app/src/cli/commands/speedtestCommand.ts)) runs it in fresh
  processes, against a baseline commit, with `--budget <percent>`.
- Not timed:  a whole project's parse, an incremental edit, a compile, the writer, the source map, a run, startup.
  The incremental tests ([IncrementalEdits.test.ts](../../../../app/tests/spell/parserTests/IncrementalEdits.test.ts))
  make exactly the right edits, but check correctness only.

## 2. Web workers

Nothing runs in a worker today (section 1).  What could, and what each costs to move.

| Work | Today | Move it? | The catch |
| --- | --- | --- | --- |
| Parse + compile + language service | main thread, in-process | yes, the big one | much of the UI reads the parse directly (below) |
| Bubbly layout of a file | main, from the parse | with the parse | its decorations would come back as data |
| Diagnostics, formatting, rename | main (`LSP.SpellLanguageService`) | with the parse | already LSP-shaped answers |
| Mermaid | main, lazy | layout only | Mermaid measures text in the DOM;  ELK alone can move |
| ELK layout | main, `elk.bundled.js`, 1.6 MB / 470 KB zipped ([ElkEngine](../../../../ui/src/util/ElkEngine.ts)) | yes, easy | elkjs ships a real worker build (`elk-worker`) |
| highlight.js for `<ui-code>` | main, lazy ([CodeEngine](../../../../ui/src/components/ui-code/CodeEngine.ts)) | not worth it | small snippets;  better server-side (section 5) |
| marked for `<ui-markdown>` | main, lazy | not worth it | fast already |
| Emoji search | main, lazy name chunks (179 KB zipped, ui's report) | no | small, rare |
| Places' sync | main;  network I/O is async already | only big JSON | `response.json()` of a large list parses on the main thread **(inferred)** |

- **The parse is the hard one, because so much reads `file.match` directly:**
  `CodeEditorFeatures`, `SP.BubblyLayout`, the side bar's `SourceHomes`, `SourceEdits`, the Inspector's data,
  the scope explorer, the notebook's cells.
  - Moving the parser means each of those asks a question by message instead, and gets an answer later.
- **What makes it feasible:**  the language service already answers in LSP's shapes
  (`vscode-languageserver` types, turned into CodeMirror's by ONE converter,
  [LspToCodeMirror](../../../../app/src/app/ui/codemirror/LspToCodeMirror.ts)).
  - That's exactly what VS Code for the Web does:  its language servers run in web workers, speaking LSP over
    `postMessage` ([VS Code web extensions guide](https://code.visualstudio.com/api/extension-guides/web-extensions)).
  - The VS Code language server already runs the same service in a node process
    ([SpellLanguageServer.ts](../../../../app/src/lsp/SpellLanguageServer.ts)):  a worker is that, in a browser.
- **Three ways to cut it, cheapest first:**
  1. Keep it all on the main thread, but YIELD:  the compile is already a `TaskList` of tasks, one per file
     (SpellProject line 845);  `await scheduler.yield()` between them (falling back to a `MessageChannel` tick)
     lets a key land mid-compile.  No data moves.
  2. A compile worker:  a SECOND parser in a worker takes the files' text (strings copy fast) and hands back the
     compiled code, its map and its declarations (strings).  The editor keeps its own incremental parse for the
     language features.
     - Takes the 2-second compile, the biggest block, off the main thread.
     - Costs a second parse tree in memory:  bad on a phone (section 7).
  3. The VS Code way:  parse, compile and the language service all in one worker;  the main thread a thin client.
     - The Inspector, the side bar and the bubbly look move onto messages.  Largest change, biggest win.
- **Data passing:**
  - Text, compiled code, maps, diagnostics, decorations as plain arrays:  structured clone copies them, fast for
    strings and arrays of numbers.
  - Transferables (`ArrayBuffer`) only help for big binary data:  images, a Wasm heap.
  - `SharedArrayBuffer` needs the page cross-origin isolated (COOP + COEP headers):  every image, font and frame from
    another origin must then opt in (or COEP `credentialless`), which a Spell app reading places from the web would
    trip over.  A message-passing design doesn't need it.

## 3. WebAssembly

Owen's rule:  the latest tech, if it's been generally available 2+ years, or he OKs it.

- **The parser engine:  measured, and rejected for now** ([Choice.ts](../../../../parser/src/parser/rules/Choice.ts), lines 21-30;
  epic `language` P37):
  - the tokenizer, base rules and Rulex matching are at most 54% of a warm Solitaire parse:  at BEST 2.2x overall
  - a toy showed nearly all the gain came from FLAT DATA (words as numbers, arrays), which plain JavaScript gets too;
    Wasm added 1.2-1.35x on top
  - each rule's TypeScript would still be called 63,000-155,000 times a parse, across the boundary
  - its own advice:  look again if matching is over ~35% of a large project's time;  flat data in JS first,
    then Wasm for the tokenizer and quick tests only
- **tree-sitter for other languages:**  not needed.
  The editor shows compiled JavaScript and Python with CodeMirror's own Lezer grammars
  ([SpellCodeMirror](../../../../app/src/app/ui/codemirror/SpellCodeMirror.ts), lines 2-3), incremental and in JS already.
  tree-sitter would add a Wasm runtime plus a grammar file per language.
- **oxc's Wasm build** (TS / JS parsing in the browser):  nothing in the browser needs it.
  The kit's one TypeScript reader is node-only, on oxc's native parser ([typescript.ts](../../../../src/util/node/typescript.ts)).
- **A Wasm / WasmGC target for Spell programs:**
  - WasmGC is on by default in Chrome 119 and Firefox 120 (late 2023), and Safari 18.2 (December 2024)
    ([Chrome's WasmGC post](https://developer.chrome.com/blog/wasmgc)):  it meets the 2-year rule in December 2026.
  - But a Spell program is mostly DOM, Solid and reactive reads:  every one of those would cross the JS-Wasm
    boundary, and Spell's text would be copied each time it crosses **(inferred)**.
    VS Code's own Wasm work notes the same:  values are copied across, and object graphs can't be passed
    ([VS Code, "Using WebAssembly for extension development"](https://code.visualstudio.com/blogs/2024/05/08/wasm)).
  - V8 already compiles the JavaScript target to machine code.
  - Worth it only for compute kernels a program might hold (a game's search, a simulation), later, as `call native`'s
    cousin.  Not as a target.
- **Image work** (thumbnails, uploads):  `createImageBitmap()` and an `OffscreenCanvas` in a worker first;
  a Wasm codec (AVIF, WebP encoders) only if the canvas's own `toBlob()` isn't enough.

## 4. Rewriting tools in Rust / Go / Zig

- **Already native:**
  - Vite+ ([the kit's AGENTS.md](../../../../AGENTS.md), "Toolchain:  Vite+"):  Rolldown (bundler), oxc (transforms),
    oxlint, oxfmt, tsgolint:  Rust and Go
  - TypeScript 7 (`yarn tsc`):  Go
  - esbuild, under `tsx` and the decorator pre-pass ([decorators.ts](../../../../src/toolchain/decorators.ts)):  Go
  - uv and ruff for the Python side:  Rust
- **Still JavaScript, and what's slow:**
  - every `spell` command transpiles the kit's source through `tsx` as it starts ([bin/spell.mjs](../../../../bin/spell.mjs)):
    its cache once grew to 953 MB and slowed every start (papercuts, 2026-11-04, "a hook run 2.5s => 0.9s" once cleared)
  - the tests:  `yarn test:all` ~10 min (papercuts line 895);  `app:integration` ~15 min, ONE FILE AT A TIME because they
    share one editor ([app's AGENTS.md](../../../../app/AGENTS.md))
  - `spell content check`:  every example compiled by the Spell parser, in node
  - pyright (the Python target's check) is node
- **What would gain, without a rewrite:**
  - run `spell` from a prebuilt bundle:  `spell publish` already builds the kit into `dist/`
    ([PackageBuild.ts](../../../../src/cli/publish/PackageBuild.ts));  a local `dist` build (Rolldown) with a stale
    check would skip `tsx`'s transform on every start.  `tsx` stays for decorators and JSX until node runs them.
  - `spell content check` and the compile-every-example steps across `worker_threads`:  one parser per thread
  - integration tests:  one editor per worker, so files run side by side
- **What a rewrite would buy:**
  - the page server, the epic tool, the CLI:  I/O-bound, not CPU-bound.  No gain worth a second language.
  - the Spell parser and compiler in Rust:  one engine for the CLI, the language server and (as Wasm) the browser.
    But Choice.ts's numbers above cap the gain at ~2x unless the rule classes move too, and they're the language.
    Not now.
- **Stays TypeScript:**  everything Solid, Spell UI, the rule classes, the runtime core.

## 5. Server instead of browser

What could be the server's, and what that costs offline.
Spell has offline copies to keep working:  the static preview build keeps a visitor's projects and edits in IndexedDB
(`StaticFiles`, `DatabasePlace`;  [app/src/app's AGENTS.md](../../../../app/src/app/AGENTS.md)), and `DevicePlace` keeps a
program's data on the device ([places' AGENTS.md](../../../../src/places/AGENTS.md)).

- **Stop uploading what the browser compiled while you type** (the cheapest, biggest change here).
  - The server can compile for itself:  spaces' API already compiles a project whose built file is missing, and the page
    server compiles the built-in projects as it starts ([spell's AGENTS.md](../../../../parser/src/spell/AGENTS.md), "Built when needed").
  - So the editor's 2-second compile could be `save: false` (the option exists, `compileBehind()` uses it), with the
    build files written on Save / AutoSave's keep, or by the server when someone asks for them.
  - Offline:  unchanged, the browser still compiles to run.
- **Compile on the server, for the running app:**  possible for a server-backed editor (the text is already sent by
  AutoSave), but a round trip plus a compile per pause, and the static build and offline editing need the browser's
  compiler anyway.  Keep the browser compile;  make it cheaper (section 1).
- **The language server on a server:**  no.  Hovers and suggestions need answers in milliseconds;
  VS Code for the Web keeps language features in the browser too
  ([vscode.dev announcement](https://code.visualstudio.com/blogs/2021/10/20/vscode-dev)).
- **Spell code on docs and README pages, coloured on the server:**
  `<spell-code>` loads the whole parser (two grammars, section 6) in a lazy chunk, just to colour snippets
  ([SpellLanguage](../../../../app/src/app/components/spell-code/SpellLanguage.ts)).
  The page server, or the static build, could write the coloured spans once.  Pages are served by the page server
  anyway, so offline reading still works.
- **Mermaid drawn once, kept on the server:**  the first browser to draw a diagram posts its SVG, kept by the diagram's
  text hash, as the compile cache keeps compiles (`SRV.DiskCache`);  every later view takes the SVG.
  Mermaid itself needs a real DOM to measure text, so true server rendering means a headless browser.
- **Pre-rendered pages, Declarative Shadow DOM:**
  - `StaticRenderer` ([StaticRenderer.ts](../../../../ui/src/tools/StaticRenderer.ts)) renders Spell UI on the server already,
    for the visual tests and `spell ssr`.
  - Its cost today:  **about 147 kB of CSS inlined per element instance**, because a declarative shadow root can't share a
    constructed sheet ([ui's report](../../../../spell.epics/guides/ui/notes/report.md), "SSR / Declarative Shadow DOM");
    and no hydration, so the client renders everything again.
  - To make it pay:  inline only the component's own sheet, and `<link rel="stylesheet">` the shared foundation inside
    each shadow root (the browser fetches and parses it once) **(inferred:  check the paint)**;  then hydrate instead of
    replace.  Then the editor's shell and a Spell app's first screen can paint before any script on a phone.
- **Search indexes, catalogs, help tables:**  Spell UI's help table (`help.generated.ts`, 172 KB of source) goes into the
  editor through spaces' `spellUIPack.ts`, for the language service's hovers.  It could load on first hover, or be asked
  of the server, with a cached copy for offline.

## 6. Expensive patterns in the code

Rough cost:  **S** small, **M** noticeable on a phone, **L** what would hurt first.

| Pattern | Evidence | Cost | Notes |
| --- | --- | --- | --- |
| Every run imports a new module, never freed | [runCompiled.ts](../../../../app/src/app/runner/runCompiled.ts) lines 32, 168, 299, 312;  [CODE-DEBT](../../../../spell.epics/agents/CODE-DEBT.md) "Each `<spell-app>`'s runtime stays in memory" | **L** | section 7 |
| Compile awaits ~5 sequential uploads | SpellProject `saveOutput()` line 1024, inside the compile (line 1007) | **L** over 5G | section 1, step 7.3 |
| Both grammars built at load, tests included | `export { spanish }` in the [SP barrel](../../../../parser/src/spell/index.ts) line 87;  `addRule()` compiles each syntax eagerly ([Parser.ts](../../../../parser/src/parser/Parser.ts) line 500, "better at startup") | **L** startup | 777 English registrations;  the `.en.ts` files are 592 KB of source, the `.es.ts` 555 KB, much of it `tests` with expected JS and TS **(inferred share)** |
| Everything on the main thread | section 1, 2 | **L** on a phone | |
| Projects never leave memory in a session | `SpellProject.registry`, `SpellFile.registry`, `SpellJSFile.registry`:  removed only `onRemove()` ([SpellProject.ts](../../../../parser/src/spell/SpellProject.ts) line 41);  `FileStates` keeps each file's state and undo;  the editor's `parsedImports` | **M-L** | each example visited stays parsed **(inferred)** |
| ~165 KB of foundation CSS adopted in EVERY shadow root | `FOUNDATION_SHEETS` ([UIRuntime.ts](../../../../ui/src/runtime/UIRuntime.ts) line 204):  layers, reset (14 KB), tokens (15 KB), colors (81 KB), sizes (11 KB), animations (28 KB, 58 `@keyframes`), then utilities (13 KB) ([Styles.push()](../../../../ui/src/runtime/Styles.ts) line 233) | **M** | sheets are shared objects (good), but each shadow root is a style scope matching against all of them;  colors' and tokens' `:host` blocks are fallbacks behind a container style query each host evaluates |
| A drawn view watches its whole shadow tree | `SpellElement.loadSpellUIFamilies()`:  a subtree `MutationObserver` per view, each mutation a `querySelectorAll(":is(:not(:defined), :state(pending))")` plus `fillActionMenus()` ([SpellElement.tsx](../../../../app/src/app/runner/SpellElement.tsx) line 1419;  [RootLoader.undefinedTags()](../../../../ui/src/components/ui-root/RootLoader.ts) line 90) | **M** | a list of 500 drawn things = 500 observers **(inferred)** |
| Every Solid computation wrapped by a spell-cell `Reaction` | `bridgeSolid()` ([bridges.ts](../../../../src/util/reactive/bridges.ts) line 27):  `enableExternalSource`'s factory makes a `Reaction` per memo, effect and JSX expression on the page | **M** | Spell UI's internals pay it too, reading no cell **(inferred)** |
| One error boundary per drawn thing | `drawInBoundary()` on Solid's `<Errored>` ([drawing.ts](../../../../parser/src/core/drawing.ts) lines 10-17) | **S-M** | right for 52 cards;  per row in a long list it's an owner and a boundary each |
| Compiled drawings use `h()`, not compiled templates | [drawing.ts](../../../../parser/src/core/drawing.ts) lines 4-9:  `h("span", { class: "suit" }, () => ...)` | **M** for big drawings | Solid's compiler clones a template once per shape;  `h()` builds each node by calls **(inferred:  measure)** |
| Long lists grow, never shrink | `drawnInWindow()`:  24 at once (`MOST_AT_ONCE`), "What's drawn stays drawn" ([drawnWindow.ts](../../../../src/element/drawnWindow.ts) lines 15, 38) | **M** | scroll 5,000 rows and 5,000 rows stay in the DOM;  `<ui-tree>` opens 5,000 rows in 33 ms ([catalog](../../../../agents/coherence/catalog.md), "A long list") |
| Places' rows kept for ever | `PlaceCache`:  one row per type and id, a reactive cell per field, forgotten only on delete ([PlaceCache.ts](../../../../src/places/PlaceCache.ts)) | **M** | a search-as-you-type over a big place keeps every row it ever saw |
| The console copies itself on every line, and never stops | `activeGroup.lines = [...lines, line]` ([console.ts](../../../../parser/src/core/console.ts) line 101), no cap | **M** | a program printing 10,000 lines copies ~50 million entries **(inferred)** |
| The compiled program logged each compile | editor.ts lines 588-597 | **S-M** | Chromium keeps recent console messages even with DevTools closed **(inferred)** |
| Whole-text copies per key and per hover | `doc.toString()` in FileStates lines 525, 560, 586;  CodeMirrorLanguage `fileReady()` | **S** now, grows with file | VS Code's lesson:  don't make strings you throw away (section 9) |
| Copy-on-write scope lists | "`ScopeList.add()` / `.replace()`, which swap in a NEW items array" ([PARSING.md](../../../../parser/src/spell/PARSING.md) line 2714) | **S** | O(n) per declaration added |
| Rule syntax compiled at every page load | `Parser.addRule()` throws on bad syntax "at startup" (line 500) | **M** startup | a build-time grammar snapshot would skip it |
| Spell UI help table in the editor | `help.generated.ts` 172 KB, through `spellUIPack.ts` | **S-M** | load on first hover |
| Source map inlined into every run | `SourceMarks.inline()` base64, its sources' full text ([SourceMarks.ts](../../../../parser/src/parser/writers/SourceMarks.ts) line 206) | **S** CPU, **L** with the module leak | |
| ELK on the main thread | [ElkEngine.ts](../../../../ui/src/util/ElkEngine.ts) | **M** when a diagram lays out | a worker build exists |

Checked, and fine:
- **Shadow root stylesheets are shared**, one `CSSStyleSheet` per name, roots held weakly ([Styles.ts](../../../../ui/src/runtime/Styles.ts) header).
- **Elements are defined early from a catalog, families load on first use** ([element's AGENTS.md](../../../../src/element/AGENTS.md), "Defined early").
- **Event delegation:**  one listener per event type per render root;  `ShadowEvents` adds a wrapper call per delegated
  event, a `composedPath()` only for nested roots ([ShadowEvents.ts](../../../../src/element/ShadowEvents.ts) header).
- **Polling:**  one helper, skipped while the page is hidden;  the editor polls the open file only when the live
  channel is down, every 30 s (`pollWhileVisible()`, `FILE_FALLBACK_POLL`, editor.ts line 2532).
- **Websockets:**  one `ReconnectingSocket`, 1 s backing off to 10 s.
- **Decorators:**  lowered by esbuild to ES2022, ONE shared helper module, so the cost is a wrapper per decorated
  accessor and `keepNames`' bytes ([decorators.ts](../../../../src/toolchain/decorators.ts)).
- **`structuredClone`, `JSON.parse(JSON.stringify(...))`:**  none in hot paths (2 uses in ui, 1 in the parser, 0 round trips).
- **Layout reads:**  `getBoundingClientRect()` 81 times in ui and 78 in the app, with `Queued` and `beforeNextPaint()`
  batching measures ([catalog](../../../../agents/coherence/catalog.md), "Once, however often asked");
  no audit for read-write-read loops was done here.
- **Spell UI's own dropdown benchmark:**  1,000 options, 3.7 ms an average keystroke update, dev build
  ([ui's report](../../../../spell.epics/guides/ui/notes/report.md), "Performance").

## 7. Memory on a phone

- **The phones:**  Pixel 7a has 8 GB;  Galaxy A54 6 or 8 GB.
- **What Chrome on Android does under pressure** (no per-tab number is published):
  - On low-RAM Android, 60-70% of foreground renderer crash reports are out-of-memory, and the foreground tab itself
    gets killed (Chromium's memory design notes, in
    [Investigating crashes due to scarcity of memory](https://groups.google.com/a/chromium.org/g/chromium-dev/c/7lE7uB8IFTY)).
  - Background renderers are very likely to be killed, their state lost;  Android's low-memory killer ends the least
    needed processes first ([Android, memory allocation among processes](https://developer.android.com/topic/performance/memory-management)).
  - Android has no swap:  a heap that outgrows memory gets the process killed
    ([V8, heap size limit](https://v8.dev/blog/heap-size-limit)).
  - Spell's own guard against a lost tab:  edits are kept 2 s after the typing pauses (`KEEP_DELAY_MS`, editor.ts line 2552).
- **A working budget (inferred):**  keep the editor's tab under a few hundred MB, its JavaScript heap under ~200 MB,
  so switching to another app and back doesn't reload it.  The browser agent should measure where Solitaire sits.
- **What grows, and what blows up first:**
  1. **Every run of the program, for ever.**
     - Each compile and each live edit imports the program from a new `blob:` URL (section 1, step 8).
     - The HTML standard's module map keys each module by URL and has no way to drop one
       ([HTML, module map](https://html.spec.whatwg.org/multipage/webappapis.html#module-map));
       revoking the URL doesn't free the module **(inferred:  standard behaviour, check with a heap snapshot)**.
     - Each retired run keeps:  its source text with the base64 map and every source file's text (~75 KB for Solitaire),
       its compiled functions, and everything its module's exports still point at:  its classes, and its top-level things
       unless the next run carried the same objects over **(inferred)**.
     - One run every 2-second pause:  an hour of editing is hundreds of runs, so tens to a few hundred MB **(inferred)**.
     - The code-debt log already names the cure for `<spell-app>`:  an iframe, which a page CAN drop.
  2. **Every project opened stays parsed** (registries, `FileStates`, `parsedImports`;  section 6).
     A parse is a tree of `Match` objects, a journal of every change, an outline of every lookup, per file
     ([PARSING.md](../../../../parser/src/spell/PARSING.md), "Incremental parsing").
  3. **Two grammars and their test tables**, whatever language the project is in (section 6).
  4. **A running app's data:**  `PlaceCache` rows, long lists drawn whole, console lines (section 6).
  5. Proportional, and fine:  each file's CodeMirror state is a rope;  marks are drawn for the screen only.

## 8. Accessibility architecture

What's solid:
- **Semantic shadow markup** everywhere:  `<button>`, `<dialog>`, `<input>` inside, never a `<div>` for one
  ([ui's AGENTS.md](../../../../ui/AGENTS.md), "UI rules").
- **`delegatesFocus`** on interactive elements (104 places in ui and the element core);
  ElementInternals for form association, validity and ARIA (`@aria`, 22 uses;  `internals.aria*`, 13).
- **Keyboard:**  the APG combobox pattern with real key events;  arrows, Home / End, type-ahead
  ([ui's report](../../../../spell.epics/guides/ui/notes/report.md), "Forms & accessibility");  `<ui-tree>` keys.
- **Labels across shadow roots:**  an element's `aria-label` forwarded to its inner control;
  a combobox's listbox kept in its own shadow root so `aria-activedescendant` works, rich items PROJECTED into it.
- **Reduced motion:**  `prefers-reduced-motion` in the reset and animations sheets, and in 53 files;
  the element core's `motion` setting ([element's AGENTS.md](../../../../src/element/AGENTS.md), "Settings").
- **Contrast:**  OKLCH tokens checked by a test ([colors.contrast.test.ts](../../../../ui/tests/styles/colors.contrast.test.ts));
  axe passes on every element example and every native fallback, `color-contrast` included.

What's missing:
- **No screen-reader testing yet.**  The two VoiceOver checks (a table read as a table;  landmarks and Skip to content)
  wait for Owen (epic `ui-gaps` I3, M2, M3).  No NVDA or TalkBack runs found.
- **The editor has no accessibility tests:**  axe runs in Spell UI's tests, none in the app's.
- **The bubbly code pane may read oddly:**  it hides line breaks under atomic ranges and draws its own selection over
  CodeMirror's ([CodeMirrorRelayout](../../../../app/src/app/ui/codemirror/CodeMirrorRelayout.ts),
  [CodeMirrorSelection](../../../../app/src/app/ui/codemirror/CodeMirrorSelection.ts)) **(inferred:  how a screen reader reads a
  block's feet and joined lines needs a real check)**.
- **Forced colours (Windows High Contrast) are almost unhandled:**  one `forced-colors` / `prefers-contrast` rule in all
  of Spell UI's CSS;  a drawn selection and the bubbly bands may vanish.
- **Cross-root references:**  `aria-labelledby` / `aria-describedby` can't point across a shadow boundary;
  the platform's fix (Reference Target) isn't shipped everywhere, so forwarding stays element by element.
- **Drag and drop in the editor** (the palette, the side bar's moves):  keyboard routes weren't checked here.
- **Announcements:**  `aria-live` / `role="status"` appear in 42 files;  whether compile errors and "Started afresh"
  reach a screen reader wasn't checked.

## 9. VS Code's lessons, applied

- **The text buffer** ([VS Code, "Text buffer reimplementation"](https://code.visualstudio.com/blogs/2018/03/23/text-buffer-reimplementation)):
  - an array of line objects cost ~20x the file's size (a 35 MB file needed ~600 MB);  the piece tree stays close to the
    file's size, and found lines in O(log n)
  - "avoid creating substrings you immediately discard":  the GC's CPU time counts
  - For Spell:  CodeMirror's rope is that already.  **Stop flattening it:**  hand the incremental parser CodeMirror's
    changed ranges instead of the whole text, and compare by the change, not `doc.toString()` (section 1, steps 2-6).
- **Draw only what's on screen** (Monaco's `ViewLines`;  [GitHub's code view post](https://github.blog/engineering/architecture-optimization/crafting-a-better-faster-code-view/)):
  CodeMirror does, and Spell's marks follow it (epic `codemirror` P7).  The whole-file bubbly relayout at each pause is
  the part left.
- **Incremental structures, not re-scans** ([bracket pair colorization, 10,000x faster](https://code.visualstudio.com/blogs/2021/09/29/bracket-pair-colorization)):
  the viewport's brackets come from a tree updated per edit.  Spell's incremental parse is that idea;
  its O(project) cases (a declaration near the top, the whole-project compile) are what's left.
- **Language servers in workers, LSP between** ([VS Code web extensions](https://code.visualstudio.com/api/extension-guides/web-extensions)):
  "WebWorkers can be used as an alternative to forking processes";  the server "can run in a web worker and the
  connection is based on the webworkers `postMessage` protocol".  Spell's service already speaks LSP (section 2).
- **Lazy activation:**  VS Code loads an extension when its language or command is first used.
  Spell builds the Spanish grammar on every page, English projects included (section 6).
- **Start in phases:**  VS Code renders the editor first, and restores the rest after ("Starting, Ready, Restored,
  Eventually", from a 2019 talk, [summarised here](https://besthub.dev/articles/how-vs-code-achieves-sub-second-startup-secrets-from-covalenceconf-2019-ff7aaa570b58);
  third-party summary).  Spell's compile cache already does it:  run what's kept, compile behind it
  ([app/src/app's AGENTS.md](../../../../app/src/app/AGENTS.md), `ServerCompileStore`).
- **Long synchronous work on the extension host's worker is forbidden**
  ([VS Code, WebAssembly post](https://code.visualstudio.com/blogs/2024/05/08/wasm)):  the same rule for Spell's main
  thread argues for yielding inside the compile (section 2, cut 1).
- **vscode.dev's first-load size:**  no primary source found;  the browser agent can measure it beside the editor's.

## 10. Measuring for good

What Spell has:
- `spell speedtest [--against <ref>] [--budget <percent>] [--baseline save]`:  the rule tests' parse time, against a
  saved baseline ([speedtestCommand.ts](../../../../app/src/cli/commands/speedtestCommand.ts), `speedBaseline.json`).
- Spell UI's `yarn measure` (bundle tiers and scenarios, minified and zipped per tier), `yarn smoke`, `yarn report`
  (the dropdown's 1,000-option keystroke benchmark, `PerfRun.ts`) ([ui's package.json](../../../../ui/package.json), lines 47-50).
- `UITree.perf.test.tsx` (5,000 rows), `Expectations.test.ts`'s "quick enough for every keystroke" (2 ms, cold;
  flaky under a full run's load, papercuts line 1963).
- Chunk-shape pins:  `build.test.ts`, `element.build.test.ts` (no React, the entry's imports, the shared Solid).

What a standing check could be, `spell perf` (it belongs in the commands guide's map first:
[commands.md](../../../../spell.epics/guides/dev/commands/commands.md)):
1. **The compiler, whole:**  widen `speedtest` from rule tests to the built-in examples:
   - a cold full parse, a compile, and the edits `IncrementalEdits.test.ts` already makes (a body step, a member renamed,
     a declaration near the top), each timed
   - startup:  the time to `import` the parser with its grammars
2. **The editor in a phone-shaped browser:**  headless Chromium, 4x CPU slowdown and a 5G-like network:
   - open Solitaire:  time to first paint, to the program running
   - type 50 keys and an edit that compiles:  each key's time to paint (Event Timing, the INP number), the compile, the run
   - memory after 100 compiles:  a heap snapshot through the DevTools protocol, so the module leak shows as a slope
3. **A Spell app on its own:**  Solitaire and a long-list example built, opened at 4x:  first paint, a 500-row list,
   memory after scrolling it.
4. **Bundle bytes as budgets:**  `yarn measure`'s tiers and the app's chunks, each with a ceiling, failing CI past it,
   as `--budget` does for speed.
5. **Baselines in the repo, one per check**, as `speedBaseline.json` is;  CI fails on a regression past the budget and
   prints the top movers.
6. **Accessibility in the same run:**  axe over the editor's pages, not only Spell UI's examples.

## Most expensive things today, ranked

1. **Every run of the program in the editor is kept for the life of the page.**
   - What it costs people:  memory that climbs with every 2-second pause;  on a phone, a long editing session ends in a
     killed tab.
   - Where:  `runCompiled()`'s new `blob:` module per run and per live edit, each with a base64 map of every source.
   - **(inferred)**:  confirm with a heap snapshot after 100 edits.
2. **The editor's compile waits on ~5 sequential uploads before the program takes the edit.**
   - What it costs:  ~150-300 ms more per edit over 5G, ~100 KB uploaded a pause, battery **(inferred)**.
   - Where:  `saveOutput()` inside `compile()`, plus the compile cache's PUT.
3. **Everything runs on the main thread, and the expensive steps are O(project).**
   - What it costs:  a declaration typed near the top of a project freezes typing ~110 ms on a Mac, ~450 ms on a phone
     **(inferred)**;  the whole-project write every pause;  no worker anywhere.
4. **The parser starts with both languages' grammars and all their tests.**
   - What it costs:  startup time and memory on every page that loads the parser:  the editor, `<spell-editor>`,
     `<spell-code>` on docs pages.  The Spanish pack is built for English projects too.
5. **Nothing a session opened is ever let go:**  projects, their parses, their editor states, the imports' parses.
6. **Per-element weight in apps built with Spell:**  each drawn view is a custom element with a shadow root adopting
   ~165 KB of foundation CSS, its own error boundary, a subtree `MutationObserver` that re-scans its shadow tree on every
   change, drawn with `h()`;  and every Solid computation on the page carries a spell-cell `Reaction`.
7. **Unbounded growth in a running app:**  `PlaceCache` rows, long lists that only grow, an uncapped console that copies
   itself on every line.
8. **Whole-text copies per key and per hover**, and `editor.edits++` re-running half a dozen readers on every key:
   small now, growing with file size.

## What to explore, ranked

Each:  what it gives people, rough effort (S a day or two, M a week, L a phase or more), risk to what Spell does.

1. **Let old runs go.**
   - Gives:  flat memory while editing, the phone's biggest risk gone.
   - How:  run the program in an iframe re-made every N runs or past a size, carrying things over as `core.carryOver()`
     does;  or link the program as a script evaluated into a function (`new Function` with `//# sourceURL`), which the
     garbage collector CAN free, instead of a module;  and leave the sources' text out of the inline map.
   - Effort M.  Risk:  live edit and carry-over must behave the same;  DevTools' source mapping to check.
2. **Don't upload while typing.**
   - Gives:  ~5 round trips less per edit over 5G, less data and battery.
   - How:  the editor's timed compile passes `save: false`;  build files written on Save / AutoSave's keep, or by the
     server, which can compile already;  the compile cache's PUT off the critical path.
   - Effort S.  Risk:  low;  another project importing this one sees the new build at its next save.
3. **Load a language only when a file speaks it, and ship no rule tests.**
   - Gives:  faster startup and less memory for the editor, `<spell-editor>` and docs pages.
   - How:  `spanish` out of the SP barrel, imported when a `.es.spell` file appears;  each module's `tests` in a file
     of their own (`<module>.en.tests.ts`) that only test runs load;  later a build-time grammar snapshot instead of
     compiling 777 syntaxes at load.
   - Effort M.  Risk:  low;  `ruleNames.test.ts` and the syntax table must still find every test.
4. **Yield, then move the work off the main thread.**
   - Gives:  typing that never waits, on any phone.
   - How:  first `scheduler.yield()` between the compile's per-file tasks (S);  then the VS Code shape, parse + compile +
     language service in a worker speaking LSP, the main thread a client (L).  A compile-only worker in between doubles
     the parse in memory:  only if (1) and (5) have freed room.
   - Risk:  M-L;  the Inspector, side bar and bubbly look read the parse directly today.
5. **Forget projects you've left.**
   - Gives:  memory that doesn't grow as you browse examples.
   - How:  keep the text, drop the parse, scope and editor state of projects not shown for a while (an LRU of 2-3).
   - Effort S-M.  Risk:  a return re-parses (the compile cache makes the run instant).
6. **Hand the parser the edit, not the text.**
   - Gives:  no whole-text copies per key, and the incremental parse skips its own diff.
   - How:  CodeMirror's `ChangeSet` ranges into `IncrementalProject.update()`.
   - Effort M.  Risk:  M;  the incremental tests already check every edit against a full parse.
7. **Bound what a running app keeps.**
   - Gives:  apps that can run all day on a phone.
   - How:  `PlaceCache` rows held only while read (weak references), a console capped as a ring, appended in place;
     an option for `drawnInWindow()` to take far-off rows down.
   - Effort S each.  Risk:  low;  "what's drawn stays drawn" is a deliberate choice for focus and forms, so opt-in.
8. **Lighter drawn elements.**
   - Gives:  faster style recalc and less memory per element in every Spell app.
   - How:  measure which foundation sheets a shadow root needs (custom properties already inherit into shadow trees;
     whether the document's `@keyframes` reach in needs checking per browser);  one `MutationObserver` per app, not per
     view, or none once a drawing's families are known at compile time;  boundaries per type, not per thing, in long lists.
   - Effort M.  Risk:  M;  Spell UI's visual tests will show any style that moved.
9. **Compile drawings to templates.**
   - Gives:  faster first draws of big screens.
   - How:  the JavaScript writer emits Solid's compiled shapes (`template()` once per shape, `insert()`, `effect()`), as
     the TypeScript target already gets from Solid's compiler.
   - Effort L.  Risk:  M;  the snapshot tests cover every example's output.
10. **Server help for docs pages:**  Spell code coloured when the page is served;  Mermaid SVG kept by hash;  ELK in its
    worker build.  Effort S-M each.  Risk:  low;  offline pages keep working through the page server.
11. **`spell perf`, with budgets in CI** (section 10).  Effort M.  Risk:  none;  it's what keeps the rest from drifting back.
12. **Prebuilt `spell` command** (Rolldown `dist`, stale-checked) and tests spread over workers.  Effort S-M.
    Gives Owen faster tooling, not people faster apps.
13. **Not now:**  the parser in Rust or Wasm (Choice.ts caps it at ~2x);  a WasmGC target for Spell programs (DOM-bound);
    tree-sitter (Lezer covers it).

## See also

- Beside this file:  [spell-today.md](spell-today.md), [solid-ecosystem.md](solid-ecosystem.md),
  [web-components-first.md](web-components-first.md), and the other agents' `perf-results/`, `perf-scripts/`
- [PARSING.md](../../../../parser/src/spell/PARSING.md), "Incremental parsing" and "Compile"
- [Spell UI's status report](../../../../spell.epics/guides/ui/notes/report.md):  bundle, performance, accessibility, SSR
- [The code-debt log](../../../../spell.epics/agents/CODE-DEBT.md), "Each `<spell-app>`'s runtime stays in memory"
