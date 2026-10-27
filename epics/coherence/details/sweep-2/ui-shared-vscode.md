# Sweep 2:  ui-shared and vscode

Areas:  `ui-shared` (Spell UI's `src/cli/`, `icons/`, `property/`, `util/`, `vocabulary/`, `static/`, and its top-level
entries) and `vscode` (spell-app's and spell-epic's `vscode/src/` and `build.mjs`).
By the coherence agent, 2026-10-26 (epic `coherence`, sweep 2:  the first sweep of either area).  No code changed.
- 12 findings, ranked;  no two-words finding:  none of `words.md`'s replaced words is in either area.
- The score's hits here before:  A new syntax 3 (`StaticSelectors.ssr.ts`), Timing 1 (`iconCommand.ts`, a false hit).
  The score never reads the extensions:  9 copies there go uncounted ("Score lines", below).
- What holds:
  - Spell UI's `util/`, `vocabulary/`, `property/` and `static/` take the kit's helpers:  `suggest()`,
    `withoutAccents()`, `kebabCase()`, `escapeHTML()`, `kb()`;  the static render converts attributes with the element
    layer's own (`definition.convert()`, `spell-ui/src/static/ServerDOMElement.ssr.ts:82-96`)
  - `LoadOnce`, `Warnings`:  one each, no copy in Spell UI
  - spell-epic's extension takes the kit's page-server pieces by file (`spell-epic/vscode/src/DocPreview.ts:35-41`),
    and `RealPath` for folders (`docUrls.ts:13, 35-37`)
- What didn't:  the two extensions restate a dozen pieces they already bundle (#4);  code written since sweep 1 added a
  fourth path walk (`spell ui rename`, ui-gaps P6, 10-25 16:09:  #2).
- jscpd (4 lines, 40 tokens) over both areas' code:  0.68% duplicated, 4 clones:  `serve.ts` twice (#7), three of
  `StaticSelectors`' scans (#8).
- `epic owns`:  no branch changes these files;  review-review's and repo-split's pages only name some (`DocView.ts`,
  `WindowBridge.ts`, the app extension's `extension.ts` and `build.mjs`, `packCreate.ts`), coherence's `ssrCommand.ts`.
- Mid-change on disk at 22:28 (other builders, this worktree):  the kit's `src/util/timing.ts` gains `Queued`
  (uncommitted, ui-components #4);  spell-epic's `answers/` and `review/`, Spell UI's `scripts/` and `src/tools/` are
  being edited.  None of these two areas' files.  Places cited in the edited files are as on disk now.

## 1. One table of the static render's families, one loader

- **Kind:**  twice.  No open epic (epic `seo` P3 made both lists).
- **Where:**
  - `spell-ui/src/static/StaticCatalog.ssr.ts:2-94, 106-202`:  `StaticCatalog.classes`, every server-ready component
    class, by 93 imports and a 95-line list;  `spell ssr` defines them (`spell-ui/src/tools/StaticDocument.ts:146-151`)
  - `spell-ui/src/tools/visual/StaticFamilies.ts:17-97`:  `StaticFamilies.CLASSES`, the same classes by name, family by
    family;  the visual tests' `--static` defines them by name through `import.meta.glob`
    (`spell-ui/src/tools/visual/StaticFixture.ts:22-27, 70-91`)
  - `spell-ui/tests/static/StaticCatalog.ssr.test.ts:9-12`:  a test that the two name the same classes
    ("Keep in step", `StaticCatalog.ssr.ts:100-101`)
- **Shared:**  the families the static render supports, and their classes defined once per process.
- **Differs:**  `StaticFamilies` is pure data (the visual CLI and its Playwright spec read it without Vite);
  `StaticCatalog` holds the classes.
- **The one:**  the table once, `StaticFamilies.CLASSES`, moved into `spell-ui/src/static/` (still pure data);  and ONE
  loader beside it, `StaticCatalog.load()`:  StaticFixture's glob over `src/components/*/UI*.{ts,tsx}`, each class by
  its name.  `spell ssr` and the visual tests both call it;  both run under Vite's SSR loader, so the glob works for both
  (`spell-ui/src/tools/StaticRenderer.ts:26`, `ssrLoadModule()`).
- **Net effect:**
  - a family that becomes server-ready is added in ONE place:  every change to `StaticCatalog` so far changed
    `StaticFamilies` too (`b29be6ff`, `199f5be6`, `da577a47`, `6d05d4f5`)
  - `StaticCatalog.ssr.ts`'s imports and list go, and the keep-in-step test
  - `spell ssr` and the visual tests define the same classes by one rule
- **Saves:**  about 190 lines;  2 lists and 2 loaders => 1 each.
- **Evidence:**  `for c in $(git -C spell-ui log --format=%h -- src/static/StaticCatalog.ssr.ts); do git -C spell-ui
  show --stat --format= $c | grep -c -E 'StaticCatalog|StaticFamilies'; done`:  2 or 3 for every commit;
  `rg -l spell-ui/static spell-ui/src`:  only `StaticDocument.ts` loads the barrel, through `ssrLoadModule()`.

## 2. A command's files:  one walk, one skip list

- **Kind:**  twice, for the catalog's Wanted.  The newest copy is ui-gaps P6's (`spell ui rename`, 10-25 16:09).
- **Where:**  a command's path arguments, each a file as named or a folder walked:
  - `spell-ui/src/cli/renameCommand.ts:54-66, 85-114` (`filesUnder()`:  dot folders, ten built folders, `dist-*`)
  - `spell-ui/src/cli/ssrCommand.ts:140-182` (`staticPages()`, `htmlFiles()`:  dot folders, `node_modules`, `parts/`)
  - `spell-epic/src/tools/fuss.ts:62-97` (`Fuss.filesUnder()`) and `spell-epic/src/tools/offline.ts:57-89`
    (`Offline.filesUnder()`):  near word for word, linked folders followed once each by real path
  - and walks of one folder:  `spell-ui/src/cli/packCreate.ts:255-264` (`templateFiles()`),
    `src/element-tools/ComponentPack.ts:509-519` (`filesUnder()`), `spell-epic/src/tool/SagaCommands.ts:224-235`,
    `spell-epic/src/command/Shared.ts:616-626`, `spell-epic/src/command/SharedMigration.ts:284-297`,
    `spell-app/src/app/tools/AppUIDataBuilder.ts:225-236`;  the content folder's four (`pages.js:360` `findPages()`,
    `notesOnDisk.ts:53`, `RootLinks.ts:168`, `ContentRelink.ts:113`:  epic-tools-kit sweep 2 #9)
- **Shared:**  every file under a folder, in name order, skipping what's built, vendored or hidden, kept by its name.
- **Differs:**
  - the skip list:  `fuss` skips `node_modules dist build coverage`;  `rename` ten names and `dist-*`;  `ssr` and
    `findPages()` `parts/` (an epic page's fragments);  `offline` only `node_modules`
  - links:  `fuss` and `offline` follow a linked folder once, by its real path;  `rename` and `ssr` pass over it
    (a `Dirent` for a link is neither a file nor a folder)
  - what's kept:  an extension (`.html`), a format, any file
- **The one:**  `filesUnder(paths, { cwd, keep, skip })` in the kit, a node helper beside `json5.ts`
  (`spell/util/node/files.ts`, node's modules only, so plain `node` loads it by its `.ts`, as spell-epic's tools need):
  links followed once each;  named skip sets (`BUILT_FOLDERS`, `PAGE_FRAGMENTS`) instead of a list per tool.
- **Net effect:**
  - the walks agree on links:  today `spell ssr <folder>` and `spell ui rename <folder>` pass over a linked folder
    inside it, where `epic fuss` walks it
  - a new built folder (`coverage/`, a `dist-*`) is skipped by every command at once
  - `fuss.ts` and `offline.ts` lose their twin walks;  the next command that takes paths gets one
- **Saves:**  about 90 lines;  14 walks (3 here).
- **Evidence:**  `rg -n -e '\.push\(\.\.\.(\w+\.)?\w+\(' -e 'isDirectory\(\)\) \w+\('` over every repo's code;
  `fuss.ts:83-96` beside `offline.ts:75-88`;  `git -C spell-ui log --diff-filter=A -- src/cli/renameCommand.ts`:
  `a875ce34`, 10-25 16:09.

## 3. A quiet wait:  one debounce, keyed or not

- **Kind:**  twice, for the catalog's Wanted.  epic-pages sweep 2 #1 asked for it (`afterQuiet()`) for the docs
  scripts;  spell-app's extension has three more.
- **Where:**  clear a timer, set it again:  the work runs once the asks stop.
  - keyed, a timer per key in a `Map`, the same lines each:
    - `spell-app/vscode/src/extension.ts:200-201, 228-244` (`CompiledProvider.sourceChanged()`, per spell file, 300 ms)
    - `spell-app/vscode/src/ElementsHelp.ts:97-117, 154-155` (`checkSoon()`, `forget()`, per JSX document, 300 ms)
    - `src/server/LiveReload.ts:131-142` (`changed()`, per path, 250 ms)
  - one timer:  `spell-app/vscode/src/RunnerPanel.ts:61-62, 325-334` (`saveSettings()`, 500 ms);
    `spell-app/src/lsp/SpellLanguageServer.ts:358-359`;  `spell-app/src/cli/commands/watchCommand.tsx:75-76`;
    `src/server/page/BundleBuild.ts:147-148`;  `spell-epic/src/answers/AnswerForm.ts:546-547` (mid-change);
    `spell-epic/src/answers/DraftSaver.ts:65-74`;  the docs scripts' five (epic-pages #1)
  - on the kit's `after()`, cancelled and set again by hand:  `spell-app/src/app/solid/notebook/NotebookController.ts:347-350`,
    `spell-ui/src/runtime/AppStylesheet.ts:107-109`, and nine "restart the copied / flash / type-ahead timer" pairs
    (`spell-ui/src/elements/ClipboardCopy.ts:34-35`, `UIDropdown.tsx:224-226`, `UIPopup.tsx:96-98` ...)
- **Shared:**  ask as often as you like;  the work runs once, so many seconds after the LAST ask;  stopping cancels it.
- **Differs:**  the wait;  one timer, or one per key (a document, a path);  `AppStylesheet` hands out a promise of the
  run to come.
- **The one:**  the kit's `Queued` (`src/util/timing.ts:135-184`, being written now for ui-components #4) runs a burst
  once at a moment, but an ask while one is pending RIDES it;  a debounce needs each ask to push the run back.  So:  a
  quiet moment (`quiet(seconds)`) whose asks restart it, and a keyed form (`ask(key)`, a run per key):
  `new Queued({ when: quiet(0.3), run: (uri) => this.check(uri) })`.  `timing.ts` imports nothing, and the extension
  already bundles the kit's generic files.
- **Net effect:**
  - the extension's two per-document waits and `LiveReload`'s per-path one become a field and a call;  their `Map`s of
    timers, deletes and clears go
  - the next editor feature that re-checks as you type takes the field
  - the catalog's Timing entry names it (a Score line can't see a clear and a set on two lines;
    `\b#?\w*[tT]imers\.set\(` finds the keyed ones)
- **Saves:**  about 50 lines;  9 hand-written debounces in code (3 here), the docs scripts' 5, 11 on `after()`.
- **Evidence:**  `rg -n -A4 'clearTimeout\('` with a `setTimeout(` within four lines;  `rg -n -A3 '\.cancel\(\)'` with
  `= after(` within three;  `git diff src/util/timing.ts`:  `Queued.ask()` returns while a run is pending.

## 4. The two extensions:  the kit's pieces they bundle, not their own

- **Kind:**  rebuilt.  No open epic (review-review's page names `DocView.ts` and `WindowBridge.ts`, as a plan).
- **Where:**
  - spell-epic's (`spell-epic/vscode/src/`), which bundles `spell/server/PidFile`, `WebServer` and spell-epic's
    `server.types` already (`DocPreview.ts:35-41`):
    - `WindowBridge.ts:350-358` `isAlive()`:  the kit's `isProcessAlive()` word for word (`src/server/PidFile.ts:169-176`),
      in the file the extension imports `PidFile` from
    - `DocView.ts:127-131, 484-495` `remembered()`:  ten looks a second apart, on a raw `setTimeout()` promise:
      `waitUntil(read, { timeout: 10, every: 1 })` (`src/util/timing.ts:198-210`)
    - `DocView.ts:654-668` `serverInfo()`:  `${origin}/api/server` written out, a 2s timeout:  `PidFile.status()`'s read
      (`src/server/PidFile.ts:52-64`, on `SERVER_API`, `src/server/WebServer.ts:213`)
    - `docUrls.ts:116-128` `ServerInfo`:  a third shape of what a server says of itself, beside the kit's `ServerInfo`
      (`src/server/server.types.ts:81-107`) and spell-epic's `EpicServerInfo` (`spell-epic/src/server/server.types.ts:204-213`,
      which restates the kit's four fields rather than extending it)
    - `docUrls.ts:161-162` `ENGINE_FOLDERS`:  `ENGINE_ROUTES`' folders (`spell-epic/src/server/server.types.ts:57-61`,
      a file that imports nothing), less `templates`
    - `docUrls.ts:69-72` `escapeAttribute()`:  the kit's `escapeHTML()` (`src/util/string.ts:193-196`, imports nothing)
    - the bridge's HTTP:  `WindowBridge.ts:339-348` `BridgeError(status, message)`, the kit's `HttpError`
      (`src/server/server.types.ts:306-318`);  `:367-392` `readBody()`, the kit's `readBody(raw, limit)` with its 413
      (`src/server/bodies.ts:69-87`, imported by file to keep this very bundle lean, its header says);
      `:177-190, 394-398`, the answers `toListener()` gives (`src/server/listener.ts:25-45`)
  - spell-app's (`spell-app/vscode/src/`):
    - `ElementsHelp.ts:141-149` `safely()`:  `safelyCall()` (`src/util/spell/safely.ts:15-22`)
    - `spellAppRoot.ts:71-74` `isWorktree()`:  `checkoutOf(root)?.worktree` (`src/server/checkout.ts:33`, node's
      modules only)
- **Shared:**  each is a piece the kit (or spell-epic's own `server.types`) has, reachable by file from the bundle.
- **Differs:**
  - `docUrls.ts` must stay loadable by plain `node` (its tests):  `escapeHTML()`, `server.types` and `RealPath` are;
    the types erase
  - `safelyCall()` takes the kit's `Logger` type:  it would take VS Code's output channel (`{ warn() }`)
  - the bridge's client reads `{ ok }` beside the status (`spell-epic/src/window.mjs:1120-1122`):  `HttpError`'s
    `body` keeps it, or the client reads the status alone
- **The one:**  import them:  `isProcessAlive`, `waitUntil`, `escapeHTML`, `HttpError`, `readBody`, `checkoutOf`,
  `safelyCall`;  `ServerInfo` as `import type` of the kit's and `EpicServerInfo` (that one `ServerInfo & { ... }`);
  `ENGINE_ROUTES`;  one `serverAt(base)` beside `PidFile.status()` for both reads.
- **Net effect:**
  - a view re-made after a window reload waits for its page server about 10s, as documented (`DocView.ts:127`), where
    a server that hangs makes it up to 30s today (ten looks, each up to its 2s timeout, and a second between)
  - a file link under the epic server's `/templates/` route maps to the engine's folder, as `/_epic/` links do;
    today it's looked for in the content folder, where templates no longer live (epic `epic-eject` T11;  inferred from
    `fileForPath()`, not run)
  - the bridge answers as every kit server does:  413, 400, `{ error }`
  - spell-app's worktree test agrees with git's layout:  a submodule's `.git` file isn't a worktree
- **Saves:**  about 90 lines;  11 copies.
- **Evidence:**  the catalog's Score lines run over `vscode/src` ("Score lines", below);
  `grep -n -A8 'export function isProcessAlive' src/server/PidFile.ts`;
  `grep -n '^import' spell-epic/src/server/server.types.ts`:  none.

## 5. The nearest folder up holding something:  one walk up

- **Kind:**  twice.  No open epic.
- **Where:**  `for (dir = start; ; dir = dirname(dir)) { if (has(dir)) return dir;  if (dirname(dir) === dir) ... }`,
  22 times:
  - here:  `spell-app/vscode/src/spellAppRoot.ts:50-56` (`spellAppAbove()`:  a spell-app checkout),
    `spell-app/vscode/src/extension.ts:165-171` (`findTsx()`:  `node_modules/.bin/tsx`),
    `spell-ui/src/cli/packCreate.ts:406-414` (`node_modules/oxfmt/bin/oxfmt`)
  - the kit:  `src/cli/findCheckout.ts:15-20` (`findCheckout(marker)`:  the generic one, in the CLI's barrel),
    `src/server/page/settings.ts:149-154, 160-165` (`kitOf()`, `findRoot()`), `src/server/checkout.ts:33-40`,
    `src/server/Bundle.ts:317`, `src/server/Linker.ts:947-952`, `src/element-tools/NodePackage.ts:15-21`,
    `src/element-tools/jsx-help/ElementCatalog.ts:64-69`, `src/toolchain/packageVersion.ts:26-31`,
    `src/toolchain/declarations.ts:195`
  - spell-parser:  `src/spell/node/packageVersion.node.ts:15`, `src/spell/node/typecheck.ts:42, 111`
  - spell-app:  `src/cli/commands/speedtestCommand.ts:244`, `src/cli/resolveProject.ts:159`,
    `src/spaces/server/node/projects/disk-fetch.ts:113-118`
  - spell-epic:  `src/command/MainMerge.ts:372-377`, `src/command/EpicCheckout.ts:39`, `src/window.mjs:257`
- **Shared:**  from a folder up to the root, the first holding a marker (`package.json`, `yarn.lock`, `.git`, a bin,
  `repos.json5`).
- **Differs:**  the marker or test;  the answer when there's none (`undefined`, a fallback, a throw).
- **The one:**  `findUp(from, marker | test)` in `spell/util/node/` (plain `node` loads it);  `findCheckout()`,
  `kitOf()` and `NodePackage.dir()` become one-liners on it.  The two that want an installed package's bin ask
  `NodePackage.dir("tsx" | "oxfmt", from)` (`src/element-tools/NodePackage.ts:15`), as the kit's rule says
  ("NEVER hard-code `<package>/node_modules/<dep>`").
- **Net effect:**
  - one loop and its root check, not 22
  - `findTsx()` and the oxfmt lookup stop hard-coding `node_modules` paths
  - the toolchain's two load before `spell/util`:  check they may import it, as the catalog's JSON5 entry notes
- **Saves:**  about 60 lines;  22 copies (3 here).
- **Evidence:**  `rg -n --pcre2 -e 'dirname\((\w+)\) === \1\b' -e '\b(\w+) === dirname\(\2\)'` over every repo's code.

## 6. One icon search, and one icon browser

- **Kind:**  twice.  No open epic.
- **Where:**
  - `spell-ui/src/cli/iconSearch.ts:63-80` `searchIcons()` (`spell icon`):  EVERY word of the query in a name or alias,
    or starting a word of a search term;  ranked exact, starts, the rest
  - `spell-ui/src/components/ui-icon-picker/IconCatalog.ts:139-171` `matches()`, `rankOf()` (`<ui-icon-picker>`):  the
    WHOLE query in a name (is, starts, holds), else anywhere in a search term
  - `spell-ui/docs/icons.html:234-250` `IconBrowser.filter()` (the docs' icon browser, a page script):  the query,
    lowercased only, in a name or a term, unranked;  with its own `normalize()` (`:324-330`, `IconName.normalize()`'s
    copy) and tile names (`:303-321`, `IconName.claim()`'s rule again)
  - `spell-ui/src/cli/iconCommand.ts:66-134` `galleryPage()` (`spell icon --open`):  a second icon browser, a page built
    from a string, with its own filter (`:109-121`, every word anywhere) and copy on click (`:122-128`)
- **Shared:**  icon names and Font Awesome's search terms (`spell-ui/icons/data/search.json`);  words typed;  the icons
  that match them.
- **Differs:**  the rules above;  what holds an icon (`IconInfo` in node, `IconChoice` in the picker, the page's tiles).
- **The one:**  `IconName.matches(names, terms, query)` with its rank, in `spell-ui/icons` beside `normalize()` and
  `claim()`:  "plain functions of strings, no DOM:  shared by the runtime and the node pack builder"
  (`spell-ui/src/icons/IconName.ts:4-9`).  The picker reaches it as `E.IconName`, the page through the site's globals.
  `spell icon --open` opens the docs' icons page (`/components/ui/icons.html`, the query in its address) on the page
  server, instead of its own.
- **Net effect:**
  - the same words find the same icons in the command, the picker and the page:
    - `bell` finds `brain` (by its term `cerebellum`) in the picker and the page, not in `spell icon`
      (`iconSearch.ts:64`'s own rule)
    - `arrow-up`, as Font Awesome spells it, finds nothing on the icons page:  its query isn't normalized
      (`icons.html:193-197`);  the picker's is
    - two words (`arrow up`) match apart in the command, only together in the picker and the page
  - `galleryPage()`'s 70 lines go, and with them the score's one Timing hit here (`:126`)
- **Saves:**  about 60 lines, 130 with the gallery;  4 searches => 1, 2 browsers => 1.
- **Evidence:**  the three rank functions side by side;  `icons.html:193-197`:  `trim().toLowerCase()` alone.

## 7. `serve()` once, in the kit

- **Kind:**  twice, word for word.  No open epic (repo-split P13 split it in two).
- **Where:**  `spell-ui/src/cli/serve.ts:9-54` and `spell-app/src/cli/serve.ts:10-55`:  the same `serve(routes, { port })`
  and `folderRoute(prefix, folder)` on the kit's `WebServer`, each header naming the other ("Spell UI has its own
  copy";  "spell-app's `spell run` has its own copy")
  - Spell UI's `folderRoute()` has no caller (`spell-app/src/cli/runInBrowser.ts:62` calls spell-app's)
- **Shared:**  a small loopback server for a command's page:  text or a file per path, else 404, on a free port.
- **Differs:**  `"node:http"` against `"http"` in one type import.
- **The one:**  `serveRoutes()` and `folderRoute()` in the kit's `spell/server`, beside `WebServer`, `openBrowser()` and
  `untilInterrupted()`, which both callers use already.
- **Net effect:**  one file, not two;  Spell UI's unused `folderRoute()` goes;  the next command that shows a page
  (`spell <x> --open`) takes it.
- **Saves:**  about 55 lines;  1 copy and a dead export.
- **Evidence:**  jscpd:  `spell-app/src/cli/serve.ts:12-55 <> spell-ui/src/cli/serve.ts:11-54` (43 lines, 565 tokens);
  `rg -n folderRoute spell-ui`:  its definition only.

## 8. CSS text outside parentheses:  one small reader in Spell UI

- **Kind:**  twice.  No open epic.  (ui-docs-tools sweep 2 #10 takes the declarations' reader;  this is the rest.)
- **Where:**  each walks CSS text counting `(` and `[` to find what's at the top level:
  - `spell-ui/src/static/StaticSelectors.ssr.ts`:  `subjectStart()` `:100-110`, `throughListItems()` `:179-196`,
    `firstCompound()` `:235-245`, `pseudoElementIndex()` `:252-261`, `closingParen()` `:267-282`
  - beyond the area:  `spell-ui/src/tools/DesignColor.ts:213-230` (`splitTop()`), `spell-ui/src/tools/DesignTokens.ts:444-451`
    (`light-dark(`'s end), `spell-ui/src/tools/FamilyTokens.ts:109-116` (a `var()` fallback's end),
    `spell-ui/src/styles/ComponentTokens.ts:256-264` (`balanced()`)
  - and `:state(x)` rewritten twice in `static/`:  `StaticSelectors.ssr.ts:43` (through `replaceFunction()`, nested
    calls too) and `StaticPageStyles.ssr.ts:39, 54-55` (a regex, one level)
- **Shared:**  the first (last, every) character at depth 0 that passes a test;  where a group closes.
- **Differs:**  the test (a combinator, a pseudo-element, `>`, a separator);  only `closingParen()` skips quoted text,
  so a `)` or `]` inside `[title="a)"]` unbalances the other four.
- **The one:**  a pure `CssText` (beside `StaticSelectors`, or in `src/styles/` where `ComponentTokens` reads CSS):
  `topLevel(text, test, { from, last })`, `closing(text, open)`, `splitTop(text, separator)`, quotes skipped in all;
  `StaticPageStyles` calls `StaticSelectors`' state rewrite.  Spell UI holds no parser ("nothing of spell"), so the
  catalog's tokenizer can't serve here ("Score lines", below).
- **Net effect:**  quoted brackets read the same in every scan;  `StaticSelectors`' five loops become calls;  the
  score's three "A new syntax" hits here go.
- **Saves:**  about 40 lines;  9 scans (5 here) and a rewrite.
- **Evidence:**  `rg -c 'depth\+\+' spell-ui/src`:  `StaticSelectors.ssr.ts` 5, `DesignTokens.ts` 2 and
  `ComponentTokens.ts` 2 (one each is #10's), `DesignColor.ts` 1, `FamilyTokens.ts` 1;  jscpd:
  `StaticSelectors.ssr.ts:183-188 <> :102-107`, `:238-242 <> :104-107`, `:252-258 <> :235-241`.

## 9. Names from names:  the kit's `camelCase()`, one tag-to-class rule

- **Kind:**  twice.  No open epic.
- **Where:**
  - kebab to camel by hand, beside the kit's `camelCase()` (`src/util/string.ts:30-32`):
    `spell-ui/src/cli/packCreate.ts:421-424`;  beyond:  `spell-ui/src/tools/ElementManifests.ts:626-630` (no digits),
    `spell-ui/src/docs-components/ui-docs-api/ApiModel.ts:122`, `spell-epic/src/definitions/Definitions.ts:164-170`
    (its NOTE:  a private copy, as "that barrel drags spell's utilities into the pack":  `spell/util/string` loads by
    file now, as `spell/util/dom` does for the epic pages' copy), `spell-epic/src/tool/PlanDocCommands.ts:1453`,
    `spell-epic/src/command/command.types.ts:61`
  - an attribute's property, `spec.property ?? camelCase(spec.name)`:  the element layer's rule
    (`src/element/ElementDefinition.ts:66-67`, `src/element/RichAttributes.ts:170`), restated in Spell UI's tools
    (`ElementManifests.ts:217, 221, 375, 391`, `ApiModel.ts:122`)
  - a tag's class name:  `spell-ui/src/tools/FamilyFiles.ts:17-29` (`stem()`:  `ui-` as `UI`),
    `spell-ui/src/cli/packCreate.ts:426-432` (`pascalCase()`:  ANY word `ui` as `UI`),
    `spell-ui/src/tools/demo/FamilySheets.ts:33-44` (a page script's copy, "which a page script can't import")
- **Shared:**  one name made from another, by a rule Spell already has.
- **Differs:**  digits (`ElementManifests.camel()` leaves `x-2` as it is, the kit's makes `x2`);  `spell pack add epics
  epic-ui-thing` writes `EpicUIThing.tsx`, where `FamilyFiles` names that family's files `EpicUiThing`.
- **The one:**  the kit's `camelCase()`;  a `propertyOf(spec)` in a node-safe leaf of `spell/element` (as
  `SkeletonText` is), for the element layer and the tools;  `FamilyFiles.stem()` as the one class rule, moved where a
  page script may import it (it's pure).
- **Net effect:**  one spelling of each name in every tool;  a new pack's class names follow Spell UI's file rule.
  ui-docs-tools sweep 2 #11's `titleCase()` belongs beside them (and #12's sentence case).
- **Saves:**  about 30 lines;  6, 5 and 2 copies (2 here).
- **Evidence:**  `rg -n -F -e '-([a-z])/g' -e '-([a-z0-9])/g' -e '-(\w)/g'` over every repo's code;
  `FamilyFiles.ts:25-29` beside `packCreate.ts:427-432`.

## 10. spell-epic's home folder:  one rule, the windows folder in it

- **Kind:**  twice.  No open epic.
- **Where:**
  - `process.env[HOME_ENV] || join(homedir(), HOME_FOLDER)`, five times, each importing the two constants from
    `spell-epic/src/server/server.types.ts:16, 19` (a file that imports nothing):  `spell-epic/src/server/RepoList.ts:58-60`
    (`homeFolder()`), `spell-epic/src/command/CheckoutServers.ts:121-123`, `spell-epic/src/command/StrayFiles.ts:155-157`,
    `spell-epic/src/command/WorktreeGuard.ts:115-117`, `spell-epic/src/tools/AskListeners.ts:128-131`
    ("`RepoList.homeFolder()`'s rule")
  - the windows registry, `$SPELL_EPIC_WINDOWS_DIR` else `~/.spell-epic/windows`, three times:
    `spell-epic/src/command/SessionMoves.ts:50-53` (`registry()`, which `spell-epic/src/window.mjs:1034-1036` calls),
    `spell-epic/src/tool/ReviewStart.ts:428-433`, `spell-epic/vscode/src/docUrls.ts:21-28` (the extension's
    `windowsFolder()`)
- **Shared:**  where spell-epic keeps its machine-wide files.
- **Differs:**  the subfolder;  the windows folder ignores `SPELL_EPIC_HOME`.
- **The one:**  `homeFolder()` and `windowsFolder()` in `server.types.ts` (node's `os` and `path` only:  plain `node`, the
  hooks and the extension all load it).
- **Net effect:**  one rule for the home and its windows folder, said in one place;  `SPELL_EPIC_HOME` can move the
  registry too.
- **Saves:**  about 20 lines;  6 copies (1 here).
- **Evidence:**  `rg -n -e 'homedir\(\), *(HOME_FOLDER|"\.spell-epic")' -e 'HOME_ENV\]' spell-epic/src spell-epic/vscode/src`.

## 11. A VS Code extension's build:  once, with its load check

- **Kind:**  twice.  repo-split's page names spell-app's `build.mjs`, as a plan.
- **Where:**
  - `spell-app/vscode/build.mjs:49-61` and `spell-epic/vscode/build.mjs:21-37`:  the same esbuild call
    (`src/extension.ts` => `out/extension.js`, node, CommonJS, `node20`, `vscode` external, sourcemaps, `sourceNames()`,
    the checkout's path as a `define`)
  - `spell-epic/vscode/build.mjs:39-58` `loadOnce()`:  the bundle loaded once, `vscode` stubbed, so a crash as it loads
    fails the build (epic `epic-engine` I76:  every window's extension died);  spell-app's build has none
- **Shared:**  bundling an extension from sources by package name.
- **Differs:**  externals (`vite-plus/fmt`), the `define`'s name, spell-epic's tsconfig and log override;  spell-app's
  version pin, runner build and data copies before it.
- **The one:**  `buildExtension({ folder, external, define })` beside `sourceNames()` in `spell/toolchain`, then the
  load check;  each `build.mjs` keeps its own steps around it.
- **Net effect:**  spell-app's extension build fails on a crash at load (a module reading `import.meta` as it loads, as
  I76's did) instead of installing a dead extension in every window;  one place for the target and format.
- **Saves:**  about 25 lines;  2 copies.
- **Evidence:**  the two `build({ ... })` calls side by side;  `rg -n 'import\.meta' src/element-tools/jsx-help`:  none
  today, so the risk is unguarded, not live.

## 12. One more copy each, for findings other areas made

- **Kind:**  twice, each joining a sweep 2 finding:  its Shared, Differs and The one are that finding's.
- **Where, and the finding it joins:**
  - `spell-ui/src/cli/packBuild.ts:56-62` `packFolders()`:  every `spell-*` folder of the kit, one more child-repo walk
    (`src/cli/commands/commandsCommand.ts:90`'s) => epic-tools-kit #10, `kitRepos(kit)`
  - `spell-ui/src/cli/packCreate.ts:405-415` `formatJson()`:  oxfmt's bin run by path with a temp config, to format
    `commands.json5` => ui-docs-tools #6, formatting in memory (`formatHTML()`, `src/server/format.ts:23`, whose
    settings already keep `.json5` keys quoted:  `src/toolchain/lint.ts:316-318`)
  - `spell-epic/vscode/src/DocPreview.ts:52, 140-147` `servers`:  a server started once per root, a failed start kept
    for good => parser-app #8, `LoadOnce` into the kit (`forgotten` retries it)
  - `spell-epic/vscode/src/DocPreview.ts:197-198` `DOC_FOLDERS`:  a 14th list of the content folder's areas (with
    `templates`, gone from it since epic-eject T11;  without `brand`) => epic-tools-kit #9
  - `spell-epic/vscode/src/DocView.ts:430-435`:  Restart Page Server runs `epic hub ensure` and `epic server ensure` =>
    commands #1, which retires `ensure`:  a caller its list misses, inside an installed `.vsix`, so the rename breaks
    the button in every window until the extension is rebuilt
  - `spell-ui/src/property/PropertySchemas.ts:80-85` `labelOf()` and `spell-app/src/spaces/models/TypeSchemas.ts:99-103`
    `sentence()`:  a name as a sentence (`Lists start at`) => ui-docs-tools #11, `titleCase()`'s sibling
- **Saves:**  one copy each, for its finding.
- **Evidence:**  each place, read against its finding's report.

## Score lines that overcount

And one blind spot.
- **Every Score line, over the extensions:**  the score reads each repo's `src/` only (`src/cli/coherence/RepoCode.ts:104-110`,
  `SEARCHED` `:160-167`), so the `vscode` area the catalog lists is never counted:  9 copies today.
  - Timing 5:  `spell-app/vscode/src/extension.ts:239`, `RunnerPanel.ts:333`, `ElementsHelp.ts:104`;
    `spell-epic/vscode/src/WindowBridge.ts:222`, `DocView.ts:492`
  - A process that's running 1 (`WindowBridge.ts:353`), Fetching 1 (`DocView.ts:666`), Loading once per key 1
    (`DocPreview.ts:52`), Text 1 (`docUrls.ts:71`)
  - Fix:  `RepoCode` reads `vscode/src/` too (or each repo names its code folders in its `package.json`, as
    `"spellTypes"` names its programs).  The other folders outside `src/` the areas list (`scripts/`, `hooks/`, the kit's
    `tools/`) hold no Timing hit today.
- **Timing:**  `spell-ui/src/cli/iconCommand.ts:126`, a `setTimeout()` inside the page `spell icon --open` serves as text
  (`galleryPage()`, `:108-130`):  it can't import, as the catalog's "Fine" `liveClient.ts` can't.
  `· not spell-ui/src/cli/iconCommand.ts` with a Fine line, or finding 6 takes the page away.
- **A new syntax:**  `spell-ui/src/static/StaticSelectors.ssr.ts:238, 255, 270`:  CSS selectors, not "a language or format
  of our own", and the home, `P.Tokenizer`, is spell-parser's, which Spell UI may not import.  They're copies of finding
  8's reader:  `· not spell-ui/src/`, and that entry's own Score line (`\blet depth = 0\b` in `spell-ui/src`) counts them.
- **Loading once per key:**  `DocPreview.ts:52` will count once the score reads `vscode/src`:  real (finding 12).

## Considered, left out

- `spell-app/vscode/src/RunnerPanel.ts:444-514`, the runner protocol restated:  deliberate (its NOTE:  the extension
  can't import the app);  checked against `spell-app/src/app/runner/runner.types.ts:27-58`:  no drift.
- `ServerIds` (`spell-ui/src/static/ServerIds.ssr.ts`):  the server's own `Ids`;  its header says why (no global
  `document`).
- `docUrls.planDocsIn()` (`:85-110`) beside `PlanDocFiles.listEpics()` (`spell-epic/src/tool/PlanDocFiles.ts:199`):  a
  quick list by date for a picker, against a full parse with git;  different jobs.  (Its `Epic: ` regex is
  `TITLE_PREFIX`, `planDoc.types.ts:30`:  a one-word copy.)
- The two webview pages (`DocView.html()`, `RunnerPanel.html()`):  different pages, a nonce against `cspSource`.
- `isLoopback()` and the webview's `LOOPBACK` (`docUrls.ts:59-67`, `DocView.ts:547`) beside the kit's `Guard`
  (`src/server/Guard.ts:34`):  a URL against a `Host` header;  both miss `[::1]`, which `Guard` takes:  a drive-by.
- Five async child-output collectors (`DocView.ts:674-683`, `spell-app/src/cli/runInBrowser.ts:111-117`,
  `spell-app/src/cli/commands/speedtestCommand.ts:124-139`, `spell-parser/src/cli/claudeRunners.ts:333-341`,
  `spell-app/src/cli/commands/runCommand.ts:339`):  each wants another shape (input, split streams, reject or not);  most
  tools use `spawnSync`.  A kit helper at the sixth.
- chalk (20 files:  the kit's, spell-app's and spell-epic's commands) beside node's `styleText()` (Spell UI's two:
  `iconCommand.ts:137-139`, `ssrCommand.ts:261-263`):  two ways to colour one program's output, deliberate in Spell UI
  ("no chalk", its cli `AGENTS.md`):  a question for Owen, not a copy.
- The pack templates (`spell-ui/src/cli/templates/pack/repo/`) beside spell-brand's configs:  spell-brand's own
  additions (its page bundle, two programs), not drift.
- `PARSE_ERROR_MARKER` (`RunnerPanel.ts:442`) beside the compiler's `"PARSE ERROR:"` (`spell-parser/src/parser/ast/AST.ts:679`)
  and `spell-parser/src/spell/node/spellSyntax.ts:471`:  one marker, three spellings;  the extension can't import the
  parser, and the language server could say a compile failed instead:  a drive-by.
- `Converters`' true words (`spell-ui/src/vocabulary/Converters.ts:177`) beside `spell-ui/src/tools/OldNames.ts:399`:
  one `Set`:  a drive-by.
- `StaticInteractions`' `REFERENCES`:  ui-docs-tools #15 has it.  `StaticFlattener`'s element sets (`PHRASING_ONLY` ...):
  other questions than other repos' tag sets.
- Drive-bys, not mechanisms:  `spell-ui/src/cli/cli.types.ts:16-21` (`IconsOptions`' docstring sits above
  `RenameOptions`, two docstrings in a row);  `spell-ui/src/core.ts:32-33` (its list of `forms`' files misses
  `HighlightedOption`);  `DocView.ts:103-115` (`OLD_EPIC`, `OLD_SPELL`:  a TODO to drop once every worktree merged
  epic-eject I5).
- Words:  none of `words.md`'s replaced words in either area (its Score lines, and fold / expand / collapse, over both).
