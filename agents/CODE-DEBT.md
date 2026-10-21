# Code debt

Long-term structural debt -- things we know are wrong, have decided NOT to fix right now,
and do not want to rediscover from scratch every few months.

This is durable project documentation.  Unlike `agents/SUSPECTED-BUGS.md` (a disposable scratch list
of possible bugs), entries here are verified and stay until the underlying work is actually done.

## What goes here

Add an entry when ALL of these are true:

- it is **structural** -- spans several files, or is a shape/convention problem rather than a
  local mistake
- it is **too big to fix in passing** -- fixing it is its own task, not a detour inside another one
- it is **known and tolerated** -- we understand the cause and have chosen to live with it,
  so the next person needs the reasoning, not a rediscovery

Typical triggers:

- a refactor exposes a fragility we decide not to chase, e.g. the `BROKEN_ENTRIES` circular
  imports under `spell`
- a test or lint rule gets **pinned, skipped or widened** to accommodate a known problem --
  pinning records the damage, this file records the intent to undo it
- a convention in `AGENTS.md` is knowingly violated, and the violation is too wide to fix now

## What does NOT go here

- **local** cleanups -- use an inline `REFACTOR:` marker at the code, where it will be seen
- **suspected bugs** -- `agents/SUSPECTED-BUGS.md`
- **tooling papercuts** -- `agents/PAPERCUTS.md`
- anything you are about to fix anyway

## Entry format

One `###` heading per item, under its package's `##` section, `---` between items, then:

- **Cost** -- what we pay for leaving it
- **Cause** -- the actual mechanism, not a guess
- **Fix** -- the shape of the real solution
- **Pinned at** -- where the problem is currently recorded or worked around

---

## spell

### Circular imports through the `$/parser` barrel

- **Cost**: six sub-paths of `$/parser` cannot be imported before `$/parser` itself without
  silently corrupting the barrel.  Latent rather than live: every consumer outside the barrel
  enters via `$/parser`, which is always safe.  It is a trap for new code and for test authors.
- **Cause**: nearly every leaf under `$/parser` does `import { P } from "$/parser"` -- a VALUE
  import of its own barrel.  Entering at a sub-path starts the
  `index` -> sub-barrel -> leaf -> `index` cycle before the leaf's bindings exist.  Damage takes
  two shapes: a leaf throws outright (`Literal extends Rule` extends `undefined`), or a sub-barrel
  silently truncates and the missing names never come back.
- **Fix**: leaves should not import their own barrel as a value.  Use `import type { P }` where
  only types are needed, and import base classes directly from their defining files.  This is
  already the documented convention in `AGENTS.md` -- it is just not applied consistently.
  NOTE: the obvious partial fixes do not work.  `AST.ts` needs `P.Match` and three `Scope`
  subclasses at runtime, but `Match.ts` and the scope files import the barrel as a value
  themselves, so importing them directly only relocates the cycle.  This is all-or-nothing.
- **Pinned at**: `BROKEN_ENTRIES` in `packages/parser/src/barrel.test.ts` -- `$/parser/rules`,
  `$/parser/rules/Rule`, `$/parser/rules/Literal`, `$/parser/tokenizer`, `$/parser/scope`,
  `$/parser/ast`.

#### Sub-item: `export *` makes the truncation permanent

- **Cost**: flattening a namespaced sub-barrel to `export *` costs a safe entry point.
  `$/parser/ast` moved into `BROKEN_ENTRIES` exactly this way, when its AST classes were
  flattened out of `export * as AST`.  (`$/parser/tokenizer` was already listed, for the
  parent reason above.)
- **Cause**: a named re-export (`export { X } from "./X"`) compiles to a LAZY getter, so the key
  exists on the sub-barrel even while the leaf is mid-body.  `export *` must read the leaf's key
  list EAGERLY, and a mid-body leaf has no keys yet -- so nothing is re-exported, ever.
- **Fix**: falls out of the parent item.  Once leaves stop importing the barrel as a value,
  `export *` is safe everywhere.
- **Pinned at**: same `BROKEN_ENTRIES` list; the mechanism is written up there and in `AGENTS.md`.

---

### Review:  editor features added by Claude, 2026-09-27 / 28

Everything below went in over two long sessions, tested (vitest, tsc, lint, a headless-Chromium run of the app,
parser speed test) but NOT yet reviewed line by line.  Check each area, then delete its bullet.

- **Cost**:  a lot of new code in the parser's hot path, the language server and the app editor, reviewed only by
  its tests.  Mistakes in expecting mode or the Monaco glue would show up as odd completions, stale markers or a
  hung editor, not as test failures.
- **Cause**:  built quickly in phases, each stopped for a quick review, not a detailed one.
- **Fix**:  review each area below;  fix, or record here what's knowingly left.
- **Pinned at** -- by area, with the files each touched:
  - **Language server + VS Code extension** (commits `762b1dd`..`4c27a34`)
    - `packages/lsp/src/`:  `SpellLanguageService.ts` (+ test, `__snapshots__`), `SpellLanguageServer.ts`, `server.ts`,
      `stdioGuard.ts`, `lsp.types.ts`, `index.ts`, `server.test.ts`
    - `packages/vscode/` (whole project), `.vscode/launch.json` + `tasks.json`, root `package.json` `vscode*` scripts
    - parser support:  `Rule.declares` / `getDeclaration()`, `highlightAs` (`packages/parser/src/rules/Rule.ts`,
      `rules.types.ts`, and `@proto static highlightAs` on `Keyword` / `Symbol` / spell base rules),
      `TypeScope.getOrStub()` / `claim()` / `declareProperty()`, `P.TokenFormatter` (`packages/parser/src/tokenizer/`)
    - docstrings:  `Block.getDocComments()`, `ASTDocComment` / `ASTBannerComment` (`packages/parser/src/ast/AST.ts`),
      `Block.ts` + `Block.test.ts`
  - **Scripts** (`eab5832`):  `start:*` renames, `yarn stop` (`package.json`, `Dockerfile.*`, `DOCKER.md`,
    `CODEBASE_INDEX.md`).  NOTE: `yarn stop` also kills the language server VS Code started.
  - **Browser-safe `$/lsp` + editing on `SpellProject`** (in `bdc9610`)
    - `packages/lsp/src/SpellWorkspace.ts` removed => `LSP.FileAddresses` (`lsp.types.ts`) + node-only
      `packages/lsp/src/SpellDiskWorkspace.ts`;  `packages/lsp/src/barrel.test.ts`
    - `SpellProject.spellFiles` / `parseError` / `updateText()`, `SpellFile.isActive`
      (`packages/spell/src/SpellProject.ts`, `SpellFile.ts`, `SpellProject.editing.test.ts`)
  - **CodeMirror => Monaco** (in `bdc9610`)
    - new `packages/app/src/ui/monaco/`:  `monaco.ts`, `SpellMonaco.ts`, `SpellTokensProvider.ts`, `MonacoEditor.tsx` (+ `.less`),
      `SpellModels.ts`, `SpellLanguageFeatures.ts`, `LspToMonaco.ts` (+ test), `AppAddresses.ts`, `index.ts`
    - `packages/app/src/editor.ts` (Monaco outside the store, `onInputCursor`, `onInputEffect`, `onFileEdited`, `showFileAt`),
      `InputEditor.tsx`, `OutputEditor.tsx`, `ui/index.ts`, `ui.types.ts`, `pages/SpellEditor.tsx`, `debug.ts`
    - `src/types/monaco-internals.d.ts`, `src/util/Observable.ts` (`raw()`), `package.json` / `yarn.lock` (deps)
    - removed:  `packages/app/src/ui/CodeMirror*`, `codemirror-classes.txt`, `SpellFile.offsetForPosition` / `positionForOffset`
    - its store-proxy workarounds (`raw()` ...) went with `easy-state` (solid-migration P11)
  - **Expecting mode:  what can come next** (in `95cbc54`, plus what's staged after it)
    - new `packages/parser/src/Expectations.ts` (+ test), `P.Expectation` (`parser.types.ts`), `Parser.expectedAfter()`
    - hooks in `packages/parser/src/rules/Sequence.ts` (incl. `allowRunOut`, `within`), `Choice.ts`, `Repeat.ts`, `Subrule.ts`
    - cost:  ~+1% normal parsing per round of hooks (twice);  `Expectations.memoized()` SHARES matches -- only safe
      because expecting-mode matches are thrown away
  - **Completion, signature help, quick fixes** (staged)
    - `SpellLanguageService.ts`:  `expectedNext()`, `expectedItems()`, `methodTail()`, `firstKinds()`, `argNamesOf()`,
      `signatureHelp()`, `codeActions()`, `methodSignatureFor()`, `statementBefore()`, `isUnfinished()`,
      the item builders (`variableItems()`...), `firstWords(followGroups)`
    - `SpellLanguageServer.ts` (signature help + code action capabilities), `server.test.ts`,
      `SpellLanguageFeatures.ts` + `LspToMonaco.ts` (Monaco providers), their tests
    - heuristics to check:  what counts as `continues` (`Choice` with a complete alternative);  the quick fix's
      parameter guessing
    - **quick fix is broad**:  offered for ANY statement with words left over, e.g. `set x to 1 2` => "Define
      `to set (x) to (number) (number)`".  Maybe limit it, e.g. to leftovers after a call to a method or a
      built-in like `shuffle` -- `codeActions()` / `statementBefore()` in `SpellLanguageService.ts`.
  - **Not tried by hand in VS Code** -- only through the service tests and the app's Monaco editor:
    completion (`set y `, `a thingy is a `, `move the card `), signature help (`move `), the quick fix (an unknown
    line), code lens.  Reload the window after `yarn vscode`.
  - **Lazy Monaco + `yarn stop`** (staged)
    - `packages/app/src/ui/LazyMonaco.tsx`, `packages/app/src/ui/monaco/FileEditor.tsx`;  `$/app/ui/monaco` out of the `UI` barrel;
      `editor.ts` (`onInputDidMount(editor, api)`, `inputEditorPath`), `InputEditor.tsx`, `OutputEditor.tsx`,
      `debug.ts` (globals now set by `LazyMonaco`), `MonacoEditor.tsx` (`onMount` gets `monaco`)
    - `scripts/stop.mjs`:  `yarn stop` spares the language server an editor started
  - **Code lens + semantic token deltas** (staged)
    - `SpellLanguageService.ts`:  `codeLens()`, `resolveCodeLens()`, `semanticTokensDelta()`, `tokensBuilderFor()`,
      `pushTokens()`;  `SpellLanguageServer.ts`;  `packages/vscode/src/extension.ts` (`spell.showReferences`);
      `SpellLanguageFeatures.ts` + `LspToMonaco.ts` (`semanticTokens()`);  their tests
    - needs `yarn vscode` to rebuild + reinstall the extension, for the lens command
  - Docs touched throughout:  `PARSING.md` ("Rules and matching", "Language server"), `AGENTS.md` (Overview),
    `readme.md`, `agents/PAPERCUTS.md`, `agents/SUSPECTED-BUGS.md`

---

### VS Code runner can't run a project which imports another

- **Cost**:  "Run Project" in VS Code refuses a project whose `project.json` imports another project's compiled
  JS -- it says to run it in the app instead.  `source: true` imports are fine:  they compile into the project.
- **Cause**:  compiled spell imports another project as `@spell/project/<projectId>`, which the app and
  `<spell-app>` fetch from the server's `/api/projects/compiled/` -- see `runCompiled({ loadImport })`.  The
  runner's webview has no server:  it runs compiled code the extension hands it, and asks for nothing else.
- **Fix**:  `runCompiled()` already links imports, given `loadImport(projectId)` -- `<spell-app>` does it:  each
  imported project's JS onto its own `blob:` URL, deepest first.  The VS Code runner just needs to pass a
  `loadImport` that asks the extension for that project's `<Project>.compiled.js`.
- **Pinned at**:  `runCompiled()` in `packages/app/src/runner/runCompiled.ts` -- its "imports another" message.

---

### Semantic UI popups escape `<spell-app>`'s shadow root

- **Closed on branch `output-targets`** (P11, 2026-10-09), not merged yet:  `SUI.*` is gone, and a dotted tag is an
  error;  programs draw with Spell UI's elements, which render inside their host.  Delete this entry when it merges
  into `main`.
- **Cost**:  in a `<spell-app>`, anything a spell program draws with a Semantic UI PORTAL -- `SUI.Modal`,
  `SUI.Popup`, a `SUI.Dropdown` in some modes -- appears unstyled, outside the app, and page styles apply to it.
  Spell's own `UI` set (`SUIPassThroughs`, the forms) uses none today, so only programs reaching for `SUI.*` see it.
- **Cause**:  portals mount into `document.body`, but the app's styles live only in its shadow root -- see
  `shadowStyles.ts`.
- **Fix**:  the coming web-component widgets, which render inside their host.  Meanwhile, a portal could be given
  `mountNode={spellCore.appRoot}` wherever spell makes one.
- **Pinned at**:  `SpellAppElement` (`packages/app/src/runner/SpellAppElement.tsx`).

---

### `<spell-app src>` needs CORS for another origin's compiled JS

- **Cost**:  a page can run `src="https://elsewhere/App.compiled.js"` only if that host sends CORS headers.  Scope
  packs don't need them.
- **Cause**:  the element fetches compiled JS as TEXT, to point its `@spell/core` and `@spell/project/...` imports
  at the app's own runtime copy -- see `linkModule()`.  A page can't read another origin's text without CORS;
  a module `import()` would need it too.  Scope packs are classic scripts, loaded with a `<script>` tag.
- **Fix**:  compiled output that needs no rewriting -- e.g. its imports as bare names an import map per app could
  resolve, if browsers get scoped import maps -- or a same-origin proxy.
- **Pinned at**:  `runProgram()` in `packages/app/src/runner/SpellAppRunner.tsx`.

---

### The web app's editor doesn't write scope packs

- **Cost**:  a project edited and compiled in the web app keeps a stale `<Project>.scopes.js`, so a `<spell-app>`
  running it shows an out-of-date Type Explorer -- until `yarn scopes`, or a compile in VS Code, rewrites it.
- **Cause**:  packs are written by node code:  `SpellDiskWorkspace.writeScopes()`, from `yarn scopes` and the
  language server.  The app compiles in the browser and POSTs just `<Project>.compiled.js`.
- **Fix**:  the app's in-process language service (see `SpellMonaco`) exports the pack after each compile and
  POSTs it beside the compiled JS -- `ScopeExplorer.exportPack()` is browser-safe.
  `<spell-editor>` does the first half already:  it hands a fresh pack to the apps it feeds (`SpellCompiled.scopes`),
  but writes none either -- so an app NOT linked to it still shows the stale one.
- **Pinned at**:  `SpellDiskWorkspace.writeScopes()`;  `packages/lsp/src/scopes.ts`;  `SpellEditorElement.scopesOf()`.

---

### `<spell-editor>` saves to the server with no say-so

- **Cost**:  anyone with a page holding a `<spell-editor>` open can overwrite that project's files -- each compile
  saves what was edited, and writes `<Project>.compiled.js`.  Fine on the dev server, the only place `/element` is
  served today;  NOT anywhere else.
- **Cause**:  it saves through the same `/api/projects/file` POSTs as the web app's editor, which has no users or
  permissions either.
- **Fix**:  a read-only mode -- edit and run in the page, save nothing -- which `project.compile()` can't do yet, as
  it always saves its output;  and some notion of who may save.
- **Pinned at**:  `SpellEditorElement.save()` / `compileNow()` in `packages/app/src/spellEditor/SpellEditorElement.tsx`.

---

### Mouse moves over a `<spell-editor>` never reach the page's `document`

- **Cost**:  a page's own `mousemove` listener on `document` or `window` hears nothing while the mouse is over the
  text of a `<spell-editor>` -- or any Monaco editor we draw in a shadow root.
- **Cause**:  Monaco watches `mousemove` on `document` to see the mouse leave the editor.  Heard there, a move
  inside a shadow root comes from the HOST, NOT inside the editor, so Monaco thought the mouse left on every move,
  and hid the hover before it showed.  So we stop those moves at the shadow root.
- **Fix**:  Monaco's `MouseHandler` checking `event.composedPath()` instead of `event.target` -- upstream.  Then
  delete the HACK.  NOTE: not reported to Monaco yet.
- **Pinned at**:  `keepMouseMovesInShadowRoot()` in `packages/app/src/ui/monaco/MonacoEditor.tsx`.

---

### `<spell-editor>` and `<spell-app>` together are only checked by hand

- **Cost**:  nothing in the test suite would notice a broken link between them, a hover that stops showing in the
  shadow root, or Monaco's worker failing to load -- each broke once while building them, and passed every test.
- **Cause**:  vitest here has no DOM, and the repo has no browser tests.  `element.build.test.ts` checks only that
  the bundles build, parse, and keep Monaco lazy.  The checks that caught those were Playwright scripts, run by hand
  against the dev server -- Playwright and its Chromium ARE installed, see `agents/PAPERCUTS.md`.
- **Fix**:  a Playwright test against the dev server, after `yarn build:element`, skipped when no server answers:
  link both ways, an edit reaching a linked app, hover in the shadow root, the worker loading.  On a scratch copy
  of a project -- the editor SAVES.
- **Pinned at**:  `element.build.test.ts` (what IS checked);  `agents/PAPERCUTS.md`, 2026-09-30.

---

### `<spell-editor>`'s first compile hands apps no scope pack

- **Cost**:  until the SECOND compile, a linked app's Type Explorer shows the server's `<Project>.scopes.js` --
  stale if the project was edited in the web app, and missing (a 404) for a project that never had one.
- **Cause**:  `scopesOf()` needs a `LSP.SpellLanguageService`, and takes `SpellMonaco`'s -- so it has none until
  Monaco loads, which is AFTER the first compile, on purpose, so apps run straight away.  The service itself needs
  no Monaco:  just an `LSP.FileAddresses`, and ours, `AppAddresses`, lives in `$/app/ui/monaco`, which NOTHING
  outside it may import statically.
- **Fix**:  move `AppAddresses` out of `$/app/ui/monaco` -- it imports no Monaco -- and give the editor its own
  service from the start.
- **Pinned at**:  `SpellEditorElement.scopesOf()` in `packages/app/src/spellEditor/SpellEditorElement.tsx`.

---

### An app `<spell-editor app>` names, added to the page later, waits for the next compile

- **Cost**:  a `<spell-app>` matching an editor's `app` selector, but added to the page after its last compile,
  shows its own project's code -- or "Give <spell-app> a project..." -- until someone edits.
- **Cause**:  the editor hands on each compile once, to the apps its selector finds THEN -- see `pushToApps()`.
  Nothing tells it of an app arriving later.  Linked the other way, `<spell-app editor>`, there's no gap:  the app
  asks for the editor's `compiled` as it joins the page.
- **Fix**:  the app announces itself as it joins -- e.g. an event the editor listens for on its root node -- and a
  matching editor hands it `compiled`.  Or prefer `<spell-app editor>` in the docs.
- **Pinned at**:  the `NOTE` on `SpellEditorElement.pushToApps()`.

---

### Two `<spell-editor>`s of one project share its files

- **Cost**:  typing in one shows in the other, and BOTH compile and hand on each edit -- so an app linked to both
  runs it twice.  There's no way to show two independent copies of one project on a page, e.g. "before" and "after".
- **Cause**:  a `SP.SpellProject` is one per project id (its registry), and so are its `SpellFile`s -- and
  `SpellModels` keeps one Monaco model per file path.  Each editor's `SpellMonaco.onEdit()` listener hears edits to
  ANY file of its project.
- **Fix**:  projects in memory, apart from the registry -- which don't exist yet:  every project loads from, and
  saves to, the server by its id.  Until then, one editor per project.
- **Pinned at**:  `SpellEditorElement`'s docstring;  `SpellEditorElement.loadMonaco()`.

---

### `<spell-editor>` brings its own React

- **Closed on branch `output-targets`** (P11, 2026-10-09), not merged yet:  `app` has no React at all there, so
  neither build carries one.  Delete this entry when it merges into `main`.
- **Cost**:  a page with both elements loads React twice -- `spell-editor.js` has its own, and `spell-app.js` shares
  one with `spell-runtime.js`.  React and React DOM twice, and two copies that can't share context.
- **Cause**:  it's a separate build, `vite.editor.config.ts`, NOT an entry of `vite.element.config.ts`:  with
  `cssCodeSplit: false` a build writes ONE CSS file, and Monaco's would have landed in `spell-app.css`, which every
  `<spell-app>` adopts.
- **Fix**:  one build with a CSS file per entry -- `cssCodeSplit: true`, naming each entry's CSS -- so React goes in
  `spell-shared.js` for both.  Check first that the runtime's CSS still ends up where `<spell-app>` looks for it.
- **Pinned at**:  the header of `vite.editor.config.ts`.

---

### Each `<spell-app>`'s runtime stays in memory for the life of the page

- **Cost**:  adding and removing `<spell-app>`s -- e.g. an app that swaps demos in and out -- keeps every copy of
  `spell-runtime.js` it ever loaded, and whatever that copy still holds.
- **Cause**:  each element imports its own copy from a new `blob:` URL (see `loadRuntime()`), and a page never
  drops a module it's imported.  Restart re-uses the SAME copy, so restarting doesn't add to it.
- **Fix**:  reuse copies -- a pool of released ones -- or run each app in an iframe, which a page CAN drop.
- **Pinned at**:  `loadRuntime()` in `packages/app/src/runner/loadRuntime.ts`.

---

### Thing Explorer's top-level things only update when something else redraws it

- **Cost**:  a top-level variable set to a different thing mid-run, e.g. `the deck is a new deck` in an event
  handler, keeps showing the OLD thing under "Top level" until the explorer redraws for another reason --
  a thing made or dropped, or a click.
- **Cause**:  `ThingRegistry.setTopLevel()` holds the program's module namespace, whose `export let` bindings
  are live -- but a module namespace isn't observable, so nothing tells the explorer that one changed.
  `version` is bumped only as things register, are garbage-collected, or the registry's cleared.
- **Fix**:  have compiled top-level assignments say so, e.g. a `spellCore.things.changed()` after each write
  to a top-level variable -- or compile top-level state into an observable store instead of bare `let`s.
  Either is a compiler change touching every top-level assignment, and every fixture snapshot.
- **Pinned at**:  `ThingRegistry.setTopLevel()` docstring, `packages/core/src/things.ts`.

---

### Collection helpers' results are full instances of the list's type -- so the Thing Explorer ignores them

- **Cost**:  a copy the program keeps -- `the spare is a copy of the deck` -- never shows in the Thing Explorer:
  it's made the same way as scratch results, which are deliberately hidden.  And every scratch result is a real
  `new Deck()` / `new Pile()`, running that type's constructor and `create()` -- see `agents/SUSPECTED-BUGS.md`.
- **Cause**:  `spellCore.map()`, `filter()`, `rangeBetween()`, `duplicateList()` ... build their result
  with `spellCore.newThingLike(collection)`, i.e. `new collection.constructor()`.  So mapping over a pile makes a
  new `Pile`, e.g. in Solitaire's `pile.state` or `reset the game`.  Each one registered as one of the program's
  things, cluttering "All things" with nameless `Pile`s.  `newThingLike()` now makes them
  `ThingRegistry.quietly()` -- which can't tell a throwaway result from a copy the program means to keep.
  And since piles are EXCLUSIVE (P8 of precedence-and-types), each such result is marked scratch too
  (`spellCore.newScratch()`, `List.asScratch()`) so it owns nothing -- else filtering a pile would steal its cards.
  Solitaire relies on a scratch result keeping its type:  `the state of cards-to-move` reads a `Pile`'s getter.
- **Fix**:  helpers that make a throwaway -- `map()`, `filter()`, loops -- build a plain `List` or array, NOT the
  collection's own type.  Only "a copy of" (`duplicateList()`) makes the same type, and registers.  Then
  `newThingLike()` needn't be quiet.  Touches what every collection helper returns, and their tests.
  NOTE: a plain `List` loses its type's members, which a program may read off a result -- `the state of
  cards-to-move` above -- so a range or `where` result probably keeps its type, scratch.
- **Pinned at**:  `spellCore.newThingLike()` (`core.ts`);  test "NOT a collection helper's result" in
  `packages/core/src/things.test.ts`;  "scratch results own nothing" in `packages/core/src/classes/List.test.ts`.

---

### Thing Explorer's "Top level" shows only the main program's top-level things

- **Cost**:  a project the program imports -- e.g. `Solitaire-import` importing `Solitaire` -- keeps its own
  top-level lists, e.g. `all_piles`, and they show nowhere.  Its typed things, e.g. each `Pile`, still show
  under "All things" and their types;  only its PLAIN lists and its variable names are missing.
- **Cause**:  top-level things come from the program module's exports, handed over by `runCompiled()` after
  `import()`ing it:  `spellCore.things.setTopLevel(program)`.  Each imported project is linked and imported by
  the program itself, inside `runCompiled()`'s `link()` -- its module namespace never reaches us.  And a plain
  `List` doesn't register when made, so there's no other way to find it.
- **Fix**:  in `link()`, import each project's module ourselves (same `blob:` URL, so the program shares it) and
  hand its exports over too, under its project id -- `setTopLevel()` taking several, and the explorer showing a
  "Top level" per project.  Mind the order:  a project's module MUST have run before the program's.
- **Pinned at**:  `ThingRegistry.setTopLevel()` (`packages/core/src/things.ts`) and `runCompiled()`
  (`packages/app/src/runner/runCompiled.ts`).

---

### Phase 4 package split:  compromises (2026-09-30)

The split of the old `packages/spell` (`scripts/move-packages.mjs`) moved files as they were.  Four shapes it
knowingly kept:

- **`util/src/spell/` is the old `~/util`, whole.**
  - **Cost**:  `parser` and `core` depend on lodash, `chalk`, `pluralize`, `query-string` and the React-era
    state code (spell cells, and React for `view()` -- `easy-state` went in P11) for a handful of helpers each;  a
    published `@spell-app/parser` would drag them in.  They sit in `util`'s `package.json`, beside the generic helpers
    `ui` bundles, and `ui`'s util barrel must import the generic files one by one to keep them out.
  - Partly done on branch `output-targets` (P10-P11, not merged yet):  the cells, records, `Schema` and decorators
    moved to `util/src/reactive/`, with no lodash and no Solid;  `view()` and React are gone.  `Observable`, `@thing`
    and the rest stay in `src/spell/`.
  - **Cause**:  `~/util` mixed generic helpers (`string`, `assert`, `paths`) with reactive state (`Observable`,
    `extend`), browser fetch (`$fetch`, `Loadable`) and app prefs (`AppPrefStore`, `prefs`).  The split moved it
    whole into `util`, which was then merged into `util` as the sub-folder `src/spell/`.
  - **Fix**:  generic, dependency-free helpers => beside `util`'s generic files;  reactive state => `core`;
    fetch / loadable / prefs => `app` or `spell/node`;  then `src/spell/` and its dependencies go.  Watch `ui`'s
    bundle size (`yarn measure`).
  - **Pinned at**:  `packages/util/package.json` `dependencies`, and `packages/ui/src/util/index.ts`' file-by-file
    imports.
- **The server's request handlers live in `spell`.**
  - **Cost**:  `packages/spell/src/node/project-utils.ts` holds express `request_*` handlers next to the
    disk functions `disk-fetch`, `lsp` and `cli` need;  `response-utils.ts` is all express helpers.  `spell` needs
    `@types/express`.
  - **Cause**:  `disk-fetch` (needed by `lsp`) imports `project-utils` / `file-utils`, which were the server's
    files;  leaving them in `app` made `spell` <-> `app` a cycle.  express is imported as types only.
  - **Fix**:  split `project-utils.ts` into disk functions (stay in `spell/node`) and `request_*` handlers (back to
    `app/src/server`, with `response-utils.ts`).
  - **Pinned at**:  `packages/spell/src/node/{project-utils,response-utils}.ts`.
- **`spell`'s `environment` holds the app's settings.**
  - **Cost**:  `vitePort`, `expressPort`, `api_server`, `staticDir` (`app`'s) live in
    `packages/spell/src/node/environment.ts`, which `app`'s vite configs import by relative path.
  - **Cause**:  one `environment.ts` served the single package;  splitting it was out of scope for a move.
  - **Fix**:  a `app/src/server/environment.ts` for the app's;  `spell`'s keeps `projectsDir` and the roots.
  - **Pinned at**:  `packages/spell/src/node/environment.ts`.
- **`$/app` points at the app's entry, not a barrel.**
  - **Cost**:  `import "$/app"` would boot the app (`src/index.tsx`).  Nothing does today.
  - **Cause**:  the app never had a barrel;  the codemod mapped `#name` to `src/index.*` for every package.
  - **Fix**:  drop the bare `$/app` entry from `tsconfig.base.json`, or add a real barrel.
  - **Pinned at**:  `tsconfig.base.json`.

---

### `respondWithJSON()` answers every throw with 500 and leaks the stack

- **Cost**:  WWOD §10:  a caller mistake answers its own status, and ONE error-body shape per server.  The app's API
  answers `SRV.HttpError` (and every other throw) with 500 and `{ errors: [{ message, trace }] }`, the stack
  included;  `$/server`'s listener answers `{ error }`.  The client parses two shapes, and a 404 reads as a 500.
- **Cause**:  `respondWithJSON()` / `sendError()` (`src/node/response-utils.ts`) predate `SRV.HttpError`.
- **Fix**:  `respondWithJSON()` rethrows mapped errors to the listener (or maps them itself) and answers
  `{ error }`;  no `trace` in a response.  Part of the planned `ApiTransaction` (epic `wwod` T10).
- **Pinned at**:  WWOD §10 "Caller mistakes throw specific error subclasses";  `api.test.ts`.

---

### `src/node/`:  server code without `.server.ts`, kebab-case names

- **Cost**:  WWOD §8 / §10:  every file that runs on the server ends `.server.ts`;  file names are PascalCase (one
  class) or camelCase (a family).  `spell`'s `src/node/` has `response-utils.ts`, `file-utils.ts`,
  `project-utils.ts`, `disk-fetch.ts`, `packageVersion.node.ts`, `environment.ts`.
- **Cause**:  the folder predates both rules;  `$/spell/node/...` is an alias every server imports.
- **Fix**:  rename when next touched (`responseUtils.server.ts` ...), with the alias table and imports in the same
  commit (WWOD §1 "Grep the whole repo BEFORE renaming").
- **Pinned at**:  WWOD §8 "File naming", §10 "Server code stays out of the browser bundle".

---

### `SpellLocation` isn't the value-object shape WWOD §15 describes

- **Cost**:  `new SpellLocation(path)` returns the interned registry entry from its constructor, its `registry` is
  public, and its segment pattern is a local `const`:  callers can't share the pattern, and `new` doesn't read as
  "maybe an existing object".
- **Cause**:  older than WWOD;  works.
- **Fix**:  `protected` constructor, `static xOrDie()` / `optional()` factories, `private static readonly registry`,
  `static PATH_PATTERN`.
- **Pinned at**:  WWOD §15 "Immutable and interned", "Validators".

---

### The "generic" parser holds spell's tree and its writers

- **Cost**:  `packages/parser` is meant to know no language, but `src/ast/AST.ts` is spell's tree (nodes like
  `ASTSpellCoreExpression`, `ASTJSXElement`, `ASTReactiveProperty`), and `src/writers/` (`P.JSWriter`, from epic
  `output-targets` P2, 2026-10-05) writes it as javascript.  Markdown, the second language on the parser, uses
  none of it.
- **Cause**:  the tree was always there;  the writers went beside it (Q4 of `output-targets`) because
  `ASTNode.compile()` -- which `Match.compile()` calls -- must reach `JSWriter` with no new wiring.
- **Fix**:  a package of its own (e.g. `packages/outputs/`) for the tree AND the writers, `spell` -> it ->
  `parser`, with the parser exposing a hook for `Match.compile()`.  Moves 76 classes and every `P.AST*` use.
- **Pinned at**:  `epics/output-targets/output-targets.plan.html`, caveat C1.

---

### The examples and fixtures carry warnings, and stale compiled output

- **Cost**:  the Solitaire examples and fixtures show spell's "never says it has" warning (`A pile never says it has
  a droppable`, `A foundation never says it has a symbol`), and the Cards fixture `A pile never says it has a name`.
  Most system examples' committed `.compiled.js` / `.declarations.json` / `.scopes.js` hold what the OLD source
  compiled to;  `Solitaire-import` reads Solitaire's, which doesn't declare a pile's name.
- **Cause**:  fixtures are frozen on purpose:  their snapshots pin what the writers do with them.  The examples were
  given their types (epic `output-targets` P13, J32) without recompiling, since no check compares them and the app
  and VS Code compile from source anyway;  only Todos - Form Based's was recompiled, as a runner test runs it.
- **Fix**:  add `a pile has a droppable as yes or no` and `a foundation has a symbol as text` to the live examples,
  then `spell compile @examples/<name>` for each, e.g. at the epic's merge.
- **Pinned at**:  `epics/output-targets/output-targets.plan.html`, caveats C22 and C25.

---

## core

### Drawing works around Solid rc.13's `<Errored>`

- **Cost**:  each drawn thing's error boundary is three parts, not one:  `<Errored>`, a memo running `draw()`, and a
  `try` / `catch` that makes the stand-in.  And the boundary makes `h()`'s thunk at once (`madeOnce()`), so a
  javascript drawing builds every element it names, even one a later step throws away.
- **Cause**:  rc.13's `<Errored>` re-reads its children on ANY change under it, and makes its fallback again each time
  (measured:  a card added to a pile made a new stand-in for the pile's broken card).  So the stand-in is made in the
  memo, once;  and the boundary calls `@solidjs/h`'s thunk at once, as a thunk would be built again on every re-read.
  (Before epic `output-targets` P20, `spellCore.element()` did that;  it's gone since P22.)
- **Fix**:  once Solid's `<Errored>` keeps its children and its fallback, the boundary is `<Errored>` alone, and
  it can hand Solid the thunk.  Re-measure on every RC bump.
- **Pinned at**:  `drawInBoundary()` / `drawOrStandIn()` / `madeOnce()` in `packages/core/src/drawing.ts`;  caveats C13,
  C14 of `epics/output-targets/`.

---

### Typed JSON keeps no identity, and finds classes only once they're known

- **Cost**:  `spellCore.fromJSON()` makes a separate copy for each place a thing is held:  a board holding its piles
  in `all_piles` AND in `stock` reads back with two stock piles.  A thing that holds itself can't be written at all
  (`JSON.stringify()` throws on the cycle).  And under `spell run` and the core contract, or in a program's own
  top-level code, a class is found only once one of its things has been made.
- **Cause**:  each object's JSON is written wherever it's held (`typedJSON()`), with no ids.  `fromJSON()` looks a
  `"@type"` up in `spellCore.things.classNamed()`, which learns a class when one of its things is made, or when a
  runner hands it the program's modules (`setTopLevel()`, `runCompiled()`):  the CLI's runner never does, and a module
  still loading hasn't exported yet.
- **Fix**:  ids and references (JSON-LD's `"@id"`) for saving a whole game;  the CLI's runner hands its modules over
  as the app's runners do.  Fine as it is for a debug view, or saving one list.
- **Pinned at**:  `packages/core/src/json.ts`;  caveat C26 and judgement J51 of `epics/output-targets/`.

---

### A list's own methods keep spell's odd rules

- **Cost**:  `pile.startingWith(card)`, when the card isn't in the pile, answers EVERY card in it;  `all()` on an empty
  list is no, where TypeScript's own `every()` says yes.  And a list type with a property or action named like a list
  method (`max`, `isEmpty`, `reverse` ...) hides that method:  silently in javascript, an error in TypeScript
  (TS2425 / TS2426);  the Thing Explorer hides such a property too.
- **Cause**:  each list method calls its `spellCore` twin, so it does exactly what spell does today (epic
  `output-targets` P14).  Changing what `starting with` means is a change to spell itself.
- **Fix**:  decide spell's rule first (an empty list would be safer), then change the twin, and both targets follow.
  Reserve the list methods' names, or warn on a member named like one.
- **Pinned at**:  `packages/core/src/classes/List.ts`;  caveat C24 of `epics/output-targets/`.

---

## ui

### Two reactive engines:  Spell UI's members and spell cells

- **Cost**:  a derived value sees only its own side's members.  A Spell UI `@derived` getter reading a spell thing's
  prop never recomputes when the prop changes, nor a spell `@derived` reading a Spell UI `@state`.  Nobody hits it
  yet;  mixed hand-written code (a Spell UI component reading a spell Thing) would.  Plain getters are fine.
- **Cause**:  spell's engine (`$/util/reactive`, epic `output-targets` P10) and Spell UI's reactive members
  (`Reactive.ts`) are separate:  Spell UI's cache checks only its own record members, and its writes set only a
  Solid signal, which spell cells never hear.
- **Fix**:  move Spell UI's members onto spell cells, as the SAME decorators (Owen, Q20 of `output-targets`), after
  four checks:  the bridge to Solid on every Spell UI page (re-run the 1,000-button check and `yarn measure`), test
  helpers that flush the cells, the static server render, and spell-element's rewrite of `Reactive.ts` (merged
  2026-10-10).  Its own piece of work.
- **Pinned at**:  `packages/ui/src/elements/Reactive.ts`'s header;  caveats C11, C12 of `epics/output-targets/`.

---

### `ui-popup.anchored.css` skips the CSS pipeline

- **Cost** -- one popup sheet ships unminified and unchecked by Lightning CSS (no `@custom-media`, no `@import`, no
  lowering);  the popup has TWO registered sheets (`popup`, `popup-anchored`), and anything that lists a family's
  sheets (`tools/demo/index.ts`) must name both.
- **Cause** -- Lightning CSS 1.30 fails the whole file on `@container anchored(fallback: flip-block)` (anchored
  container queries, which move the arrow when `position-try-fallbacks` flips a popup), so those rules live in a
  separate file imported `?raw`.
- **Fix** -- fold the rules back into `UIPopup.css` once Lightning CSS parses anchored queries (or passes unknown
  `@container` preludes through).
- **Pinned at** -- `src/components/ui-popup/UIPopup.anchored.css` (header), `UIPopup.styles`, `UIPopup.css.test.ts` ("the
  anchored sheet parses in the browser"), `agents/PAPERCUTS.md` 2026-09-29.

### `<ui-flyout>` builds on the modal family, not on the element core

- **Cost** -- the flyout family imports `$/ui/components/ui-modal` (a cross-family barrel import:  loading a flyout defines
  `<ui-modal>`, the content parts and `<ui-button>`, and the `flyout` lib entry depends on the `modal` one);
  `DialogComponent` is generic over its vocabulary but reads its attributes, events, parts and texts through casts
  (`dialogAttrs`, `fire()`), so a subclass vocabulary missing one of them fails at run time, not in `tsc`.
- **Cause** -- the brief (2026-09-30) put the shared modal logic IN the modal family ("a shared base or helper in the
  modal family, NOT a copy");  the plan's home for it is `src/elements/OverlayElement.ts` (via `$/ui/core`).  Typing
  "this vocabulary has at least these names" isn't expressible with the vocabulary types as they are.
- **Fix** -- move `DialogComponent` to `src/elements/` as the plan's
  `OverlayElement`, exported through `$/ui/core`, once a third dialog element (a page `<ui-dimmer>` could be one) wants
  it;  give it a `DialogVocabulary` constraint type checked with a conditional type.
- **Pinned at** -- `src/components/ui-modal/DialogComponent.tsx` (class docs), `src/components/ui-flyout/UIFlyout.tsx`,
  `docs/grammar.md` "Flyouts".

## docs

### The page runtime and plan-doc.js drive two section markups

- **Cost** -- every page but the goals pages is `<ui-section>` markup (2026-10-02), yet the runtime, the CSS and the
  scripts still carry the OLD `section.s2|s3` > `ui-sticky.spell-h2|h3` > `h2|h3` markup alongside:  a second
  outline reader, chevron folding (`section.spell-folded`, `data-fold`), `ui-label.spell-count` counts, per-h2 / h3
  sticky offsets and `--spell-h2-h` / `--spell-h3-h` anchors in `spell-doc-runtime.js`;  the `section.s2` rules in
  `spell-doc.css` / `plan-doc.css`;  the either-markup helpers in `plan-doc.js` (`sectionOf()`, `PHASE_SECTIONS`
  ...) and `index.js`;  both branches of `check-spell.js`.  Each runtime change must be checked against both.
- **Cause** -- the goals pages (`templates/goals/`, the repo root's `goals/`) are generated and edited by the goals
  tooling (`yarn goals`, the `/goals*` skills, `goals-live.js`), which reads and writes the old markup;  migrating
  them is its own task.  `epics/cli-additions` is another session's live plan, deliberately left old until that
  session runs `yarn plan-doc migrate cli-additions`.
- **Fix** -- move the goals templates and tooling to `<ui-section>` (`scripts/to-ui-section.js` `convertSections()`
  does the markup), migrate `cli-additions`, then delete the HEADINGS branch of `spell-doc-runtime.js`
  (`readHeadings()`, `wireHeadingFolds()`, `headingSection()` ...), the old-markup CSS, and the old-markup paths in
  `plan-doc.js` / `index.js` / `check-spell.js` (and the old-layout fixture's tests, or migrate them).
- **Pinned at** -- `packages/epics/tools/_assets/spell-doc-runtime.js` (header:  SECTIONS / HEADINGS), `_assets/spell-doc.css`
  ("The goals pages' markup"), `scripts/plan-doc.js` ("Sections, either markup"), `scripts/fixtures/plan-2026-09-30.html`,
  `AGENTS.md` "Writing a page" / "Templates".

---

### `commands.json` is shared, but `commands:check` reads each branch's CLI

- **Cost** -- a branch that adds a `spell` command and its row in `commands.json` makes `yarn commands:check` on
  `main` (and every other branch) fail until that branch merges:  the row names a command their CLI doesn't have.
- **Cause** -- `guides/dev/commands/commands.json` and `commands.md` live in the shared content repo
  (`../spell-app-dev`, epic `shared-content`):  ONE copy, the same in every checkout.  `spell dev commands check`
  (`yarn commands:check`) checks that one JSON against the CLI source of the checkout it runs in, which is
  versioned per branch.
- **Fix** -- open:  Owen accepted it for now, "revisit later" (epic `shared-content`).  E.g. rows marked with the
  branch that adds them, skipped by other checkouts' checks;  or the JSON tracked per branch, beside the CLI.
- **Pinned at** -- `spell dev commands check` (`yarn commands:check`);  the root's `AGENTS.md`, "Commands";  the
  `shared-content` plan doc.

---

## app

### The runners can't run TypeScript output

- **Cost**:  a `ts/solid` program (`<Project>.compiled.tsx`) runs only in the core contract test, under node.  The
  editor, VS Code's "Run Project" and `<spell-app>` run the javascript alone, so the TypeScript is checked by `tsc` and
  compared by the contract, but nobody plays it in a browser.
- **Cause**:  a `.tsx` must be built before it runs (`buildTsx()`:  esbuild lowers its decorators, then Solid's
  compiler builds its JSX), and that's node-only.  And `spell-runtime.js` re-exports only `spellCore`, `Thing`,
  `List` and `App`:  not the decorators (`prop`, `derived`, `drawn` ...) or `on()` / `trigger()` the TypeScript
  imports from `@spell/core`.  Built Solid TypeScript also hears clicks only once its module has loaded (C20).
- **Fix**:  build the `.tsx` where the runner gets its code (the page server, or esbuild-wasm plus Solid's compiler in
  the browser), and have `spellRuntime.ts` re-export what `@spell/core` exports.
- **Pinned at**:  `TARGETS` in `packages/spell/src/targets.ts` ("never run as is");
  `packages/app/src/runner/spellRuntime.ts`;  `packages/cli/src/contract.test.ts`;  epic `output-targets`, P14's Done
  list.

---

### App CSS off `ui`'s tokens and naming

- **Cost**:  WWOD §18:  intent tokens, no literal colours, no `rem`, sub-parts nested and unprefixed, a component's
  own custom properties `--Root-x`.  Today:  literal colours (`white`, `grey`, `darkblue`, `#4183c4`) in
  `TypeExplorer.css`, `SplitPanel.css`, `ThingExplorer.css`;  a `.dark` class instead of the colour scheme;  a `rem`
  in `SplitPanel.css`;  prefixed parts (`.SplitPanelPane`);  indents computed in TS instead of a custom property.
  Dark mode and embedding in other pages (root font size) both suffer.
- **Cause**:  the app's CSS predates `@spell-app/ui`'s tokens.
- **Fix**:  one pass per sheet, against WWOD §18.
- **Pinned at**:  WWOD §18.

---

### `UIT` names two different things

- **Cost**:  `packages/app/src/editor.ts` imports `import type * as UIT from "$/app/ui/ui.types"`, while `UIT` is also
  `@spell-app/ui`'s own namespace (`packages/ui/src/index.ts`).  WWOD §4 wants one name per type;  a reader of
  `UIT.X` can't tell which package's types it is.
- **Cause**:  the app's types-only import predates WWOD's `<NS>T` rule (`<NS>` = the package's namespace:  `app`'s
  is `UI`).
- **Fix**:  rename `app`'s import (e.g. `UIAppT`, or `import type { UI }` if the barrel can load there).
- **Pinned at**:  WWOD §4 "Types-only leaf import as `PT`";  epic `wwod` P5 audit.

---

### The local person is hard-coded, and a new checkout has no space for them

- **Cost**:  every machine's own projects group is `owen@spell`, so a newcomer's projects get the maintainer's
  address, and `spell new <name>` fails in a fresh checkout with `No such folder:  .../spell.spaces/@spell/owen@`
  until they `mkdir -p ~/www/spell/spell.spaces/@spell/owen@` (spell-app's README-spaces says so, as a step).
- **Cause**:  `LOCAL_PERSON = "owen"` in spell-app's `spaces/src/models/projectGroups.ts`;  `newCommand()` refuses a
  missing parent folder (`environment.userFilesRoot`), and nothing makes the person's folder.  The people store
  already reads git's name and email for a starter `__me.json5`, but only once the folder is there.
- **Fix**:  derive the local person from git's name (as the people store does), or a setting;  make their space's
  folder on first use (`spell new`, the editor's "Projects").
- **Pinned at**:  epic `readme` I1;  `tests/spaces/src/models/projectGroups.test.ts` pins the five groups,
  `owen@spell` first.

---

## util

### `src/spell/constants.ts`:  a bare constants file of ALL-CAPS sentinels

- **Cost**:  WWOD §8 allows ONE `constants.ts`, at a package's root, for its string sentinels;  §9 wants sentinels as
  English, presentable values (`"last task"`) in a const-array union or const object.  `util`'s
  `src/spell/constants.ts` holds `CONFIRM`, `NONE`, `TaskStatus` (`"UNSTARTED"` ...), `TaskResolveWith`
  (`"LAST_TASK"`), `KnownFormat`:  new code copies the ALL-CAPS shape.
- **Cause**:  written before WWOD (epic `wwod`, 2026-10-04);  every `Task` / `$fetch` caller compares against these.
- **Fix**:  move to the package root's `constants.ts` (or the folder's `.types.ts`), values in English, callers
  updated in one pass (WWOD §1:  grep first).
- **Pinned at**:  WWOD §8 "`<folder>.types.ts`", §9 "String sentinels over booleans for modes";  epic `wwod` I1.

---

### Stateless object-literal singletons (`assert`)

- **Cost**:  WWOD §8 (D15):  singleton services are classes, stateless ones too.  `assert = { string, number,
  boolean }` (`src/spell/assert.ts`) is an object literal;  so is `app`'s `Actions`.
- **Cause**:  older code;  harmless today, but a literal can't gain state, `@proto static` defaults or a subclass
  without its callers changing.
- **Fix**:  a small all-`static` class each (`class Assert { static string() ... }`), callers unchanged in shape.
- **Pinned at**:  WWOD §8 "Singleton services are classes, stateless ones too".

---

### `Loadable.getSaver()` is required;  WWOD §14 makes saving optional

- **Cost**:  every `Loadable` subclass must implement `getSaver()`, even read-only ones;  callers can't ask
  `canBeSaved`.
- **Cause**:  `getSaver()` is `abstract` (`src/spell/Loadable.ts`).
- **Fix**:  a concrete `getSaver()` that throws "can't save", plus `get canBeSaved()` comparing it against
  `Loadable.prototype.getSaver` (WWOD §14);  drop the stub savers.
- **Pinned at**:  WWOD §14 "Required subclass surface is `abstract`;  an optional capability is a concrete method that
  throws".

---

## every package (WWOD)

Where code knowingly doesn't follow a WWOD rule yet (`agents/wwod/`, epic `wwod`, 2026-10-04).

### Error classes without `prototype.name`, across packages

- **Cost**:  WWOD §5 sets an error's name ONE way:  `X.prototype.name = "X"` after the class, details in a typed
  `cause`.  Today it's three ways, so `error.name` and logs differ by package:
  - `$/util`'s `CustomError`:  `get name()` from `this.constructor.name` (mangled by a minifier), details in
    `props.error`;  `getDier()` throws `UIError` with `props.error`
  - `ui`'s `ApiError`, `SourceError`:  `this.name =` in the constructor (fixed on branch `wwod-spell-ui`, P3:  drop
    this line when it merges)
  - `server`'s `HttpError`, `FileLockError`, `cli`'s `CliError`, `vscode`'s `BridgeError`:  no name at all
- **Cause**:  written per package, before WWOD.
- **Fix**:  the system errors move to `$/util/errors` (epic `wwod` todo T6), renamed (`NotFoundError`,
  `CanceledRequestError`, `CanceledError`:  T7), each with `prototype.name` and a typed cause;  package errors follow.
- **Pinned at**:  WWOD §5 "Error classes:  body usually empty, named AFTER the class";  epic `wwod` T6-T8.

---

### `it()` in most test files;  WWOD wants `test()`

- **Cost**:  two styles across the repo:  319 test files use `it()` (all of `ui`'s and `server`'s), 83 `test()`.  No
  file mixes them.
- **Cause**:  packages written apart.  WWOD §20 (D6):  NEW files use `test()`, an existing file keeps its style.
- **Fix**:  a mechanical rename, `it(` -> `test(` plus the import, one package at a time, when nothing else is
  editing its tests.
- **Pinned at**:  WWOD §20 "`test()` for new test files;  one style per file".

---

### Bare `console.*` instead of a `Logger`

- **Cost**:  ~430 bare `console.*` calls can't be turned up or down per subsystem;  `$/util`'s `Logger` is used ONCE
  (`parser`'s `Tokenizer`).  `SPELL_DEBUG` / `SPELL_<PKG>_DEBUG` (WWOD §19) aren't read anywhere yet.
- **Cause**:  `Logger` existed but was never adopted.
- **Fix**:  epic `logger-everywhere` (epic `wwod` T28).
- **Pinned at**:  WWOD §19.

---

### `process.env` read all over;  unprefixed variable names

- **Cost**:  WWOD §11:  ONE `environment.server.ts` per package reads `process.env`, parsing through helpers,
  throwing at startup.  Today env is read in ~20 files (`app`'s `EditorServer.ts`, `server`'s `open.ts` /
  `PageServer.ts` / `page/cli.ts`, `cli`'s runner and `goalsCommand.ts`, `vscode`'s `WindowBridge.ts`, `docs`
  tools), parsed inline (`Number(...) ||`), and `spell`'s `environment.ts` logs on import.  Names without
  `SPELL_`:  `VITE_PORT`, `API_SERVER`, `GOALS_DIR`, `BENCH`, `INCREMENTAL_FULL`.
  - `ui` is done (epic `wwod-spell-ui`, P9):  ONE `packages/ui/tools/environment.ts` with its parse helpers, the
    variables renamed `SPELL_UI_*` with no fallback to the old names;  its helpers are `ui`'s own, not promoted.
- **Cause**:  no rule before WWOD.
- **Fix**:  the parse helpers (epic `wwod` T13), then one `environment.server.ts` per package;  renamed variables
  keep reading the old name for a while, with a warning.
- **Pinned at**:  WWOD §11.

---

### Helpers WWOD's rules assume, not built yet

- **Cost**:  rules written as if they exist;  code does it by hand meanwhile:
  - `setDebugGlobal()` (WWOD §1):  `window.project =` (`app`'s `editor.ts`), `Object.assign(globalThis, ...)` in
    `LazyMonaco.tsx`, `VSCodeRunner.tsx`
  - `debounce()` (§12):  hand-rolled timers, `EditorStore.compileAppSoon()` + `compileAppSoonTimer`
  - `safelyCall()` / `safelyCallAll()`, `makeErrorWrapper()` (§5):  hand-written `try` / `catch`
- **Cause**:  WWOD came from `construct-app`, which had them;  Owen deferred building them (epic `wwod` D24).
- **Fix**:  build them in `$/util` (epic `wwod` T4, T5, T15), then replace the hand-written forms.
- **Pinned at**:  WWOD §1, §5, §12;  epic `wwod` todos.

---

### `{ ok: false }` results instead of throwing

- **Cost**:  WWOD §5 / §7:  throw typed errors, never return error unions.  8 places return `{ ok: false }`, e.g.
  `lsp`'s `SpellLanguageServer.ts`, `vscode`, `ui`'s tools:  each caller checks a flag a `catch` would handle.
- **Cause**:  protocol-shaped replies, written before the rule.
- **Fix**:  throw;  map to a reply at the protocol edge only.
- **Pinned at**:  WWOD §5 "Throw typed errors;  NEVER return error unions".

---

### Packages without a `README.md`

- **Cost**:  WWOD §6:  a `README.md` per package is REQUIRED (files table, "Adding a new X").  Missing:  `app`,
  `core`, `lsp`, `parser`, `server`, `spell` (has a lowercase `readme.md`, the language), `vscode`.
- **Cause**:  docs went to `packages/docs` pages and `AGENTS.md` instead.
- **Fix**:  one per package, short, pointing at its docs pages (epic `wwod` T2).
- **Pinned at**:  WWOD §6 "A `README.md` per package".
