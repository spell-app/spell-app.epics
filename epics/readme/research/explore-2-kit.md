# Explore 2:  the kit, `spell-kit` -- research for the README writer

Worktree read:  `/Users/owen/www/spell.worktrees/readme` (branch `readme`, at P12 of epic `repo-split`).
Guides read at `/Users/owen/www/spell/spell.epics/guides/` (the worktree has no `spell.epics` link:  see G).
Every path below is from the kit's root unless it starts with `/`.

---

## A. The kit at a glance

`spell-kit` is the bottom repo of Spell, checked out at `~/www/spell`.
It holds the code every other repo stands on, published as ONE npm package `spell-kit` (private, version `0.0.0`),
plus the house style for agents (WWOD, `agents/wwod/`) and the glue for working across repos:
the ONE `yarn install`, the list of child repos (`repos.json5`), and the commands over them (`tools/repos.ts`).
The five child repos (spell-lang, spell-ui, spell-brand, spell-epic, spell-app) are separate git repos,
cloned INSIDE the kit's folder by `yarn clone` and git-ignored there;  they all share the kit's one `node_modules`
(yarn workspaces `"spell-*"`), so every repo uses every other repo's SOURCE, with no publish step.
Every arrow points down:  nothing in the kit imports a child repo.

| Folder | Entry (from another repo) | Alias (inside the kit) | Namespace | One line |
| --- | --- | --- | --- | --- |
| `util/` | `spell-kit/util` (+ `/class`, `/decorators`, `/dom`, `/string`, `/util.types`, `/node/json5`, `/reactive/cells`, `/spell/Derivative`, `/spell/Logger`, `/spell/ResponseErrors`) | `$/util` | none (import by name) | small generic helpers (`@proto` ...), spell's own utilities (`src/spell/`), the reactive engine (`src/reactive/`), node-only JSON5 editing |
| `toolchain/` | `spell-kit/toolchain/lint`, `/lint/imports`, `/lint/patterns`, `/decorators`, `/packageVersion`, `/aliases`, `/declarations`, `/types`, `/tsconfig.base.json` | none (relative imports) | -- | what every repo's configs share:  lint/format settings and custom lint rules, the decorator pre-pass, version stamp, base tsconfig, global types;  bins `spell-types`, `spell-folders`;  the run-time alias hook |
| `server/` | `spell-kit/server`, `/server/page`, `/server/site`, `/server/checkout`, `/server/page/settings`, `/server/page/prune`, `/server/test/serve` ... | `$/server` | `SRV` | serving pages locally:  static folders, Express-shaped router, live reload, guard, pid files, the generic page server, the site header |
| `assembler/` | `spell-kit/assembler`, `/assembler/DataFile`, `/assembler/contentFolder` | `$/assembler` | `AS` | the steps between a page's content and its file:  `Linker`, `formatHTML()`, `Bundle` (bundles built on demand), `DataFile`, `contentFolderOf()` |
| `element/` | `spell-kit/element` (+ `/elements.types`, `/vocabulary.types`, `/timing`, `/SkeletonText`, `/HotDefinitions`), `spell-kit/element/tools/*`, `spell-kit/test-helpers/*` | `$/spell-element` (NOT `$/element`) | `E` | the custom-element framework on Solid 2 that every component set is written on;  the pack build and root catalog tools;  shared test helpers;  bin `spell-pack` |

History (for one line in the README):  the kit is what three repos became in epic `repo-split` P9 --
spell-util (`util/`, `toolchain/`), spell-server (`server/`, `assembler/`), spell-element (`element/`) -- merged in with
their history.  Before that, everything was one monorepo (`spell-app`, `packages/*`), which is why many docs still say
`packages/...` (see G).

Other tracked files at the root (`README.md` already has a good table):
- `package.json`:  the ONE package's `exports`, `bin`, `"spellTypes"`, `"spellFolders"`, `resolutions` (one Solid:
  `solid-js` / `@solidjs/web` `2.0.0-rc.13`), scripts;  `engines.node >=24.11`;  `packageManager: yarn@4.18.0`.
- `tsconfig.base.json`:  the kit's `$/` alias table (header comment explains:  MUST be the only `paths` in the kit;
  `$/spell-element/test-helpers/*` and `$/spell-element/tools/*` are longer than `$/spell-element/*`, so they win).
- `vite.config.ts`:  the root lint/format block (`rootLint()`, `fmtConfig`), ignoring `spell-*` and `spell.*`.
- `.yarnrc.yml`:  `nodeLinker: node-modules`, `nmHoistingLimits: none` (ONE physical copy of each package, above all
  Solid), the yarn release in `.yarn/releases/yarn-4.18.0.cjs`, and the `catalog:` of tool versions
  (`vite` = `npm:@voidzero-dev/vite-plus-core@1.0.0`, `vitest` 5.0.1, `vite-plus` 1.0.0, `@vitest/*` 5.0.1).
- `repos.json5`, `tools/repos.ts`, `.github/workflows/checks.yml`, `.epic/config.json5` (+ `generators.json5`),
  `agents/` (WWOD + 3 links to the logs).
- Git-ignored:  `/spell-*/` (child repos), `/spell.epics`, `/spell.spaces`, `dist-types/`, `node_modules`.

---

## B. Per folder

### B1. `util/` -- `spell-kit/util`, `$/util`

What it is:  the helpers more than one package uses, in THREE layers, all flattened into one barrel
(`util/src/index.ts`) and imported by name (`import { proto, kebabCase } from "$/util"`, no namespace).

1. GENERIC (files beside `index.ts`;  no runtime deps;  browser-safe;  Spell UI bundles what it imports from here):
   - `decorators.ts`:  standard (TC39) decorators `@proto` (class default on the prototype), `@protoMerged` (settings
     object whose keys merge down the class chain, e.g. `elementSetup`), `@lazy` (getter made on first read),
     `@once` (method run once, result kept), `forget(obj, "name")`, `@resets("name")` on an accessor
     (`@E.resets("load") static accessor url`).
   - `class.ts` (`hasOwnProp` ...), `string.ts` (`kebabCase`, `camelCase`, `numberToWord`, `suggest`),
     `dom.ts` (`closestAcrossShadow`, `NodeType`, `byDocumentOrder`, `isBrowser`, `nextFrame`, `whenDefined`),
     `util.types.ts` (`Constructor`, `AbstractClass`, `Prettify`).
2. REACTIVE (`src/reactive/`, `$/util/reactive`):  "the ONE reactive engine every reactive class shares" (epic
   `output-targets` P10).  Generic too (no lodash, no Solid).
   - spell CELLS:  `cells.ts` (page-wide context on `globalThis` under `Symbol.for("@spell-app/cells")`, tracking,
     `flushCells()`), `Cell`, `Derived`, `Reaction`.  Push-pull with an equality cutoff.
   - WHY not Solid signals (cells.ts header):  "Solid 2 stages writes (a read right after a write sees the OLD value
     until a flush), and spell is imperative -- `set x to 1` then `print x` must print 1."
   - records (`extend.ts`):  `getProp`/`setProp`, `getState`/`setState`, `derive()`, `typedJSON()`;  `Schema`,
     `PropRules`;  decorators `@prop`, `@state`, `@derived` (`decorators.ts`);  `bridges.ts`:  `bridgeSolid()` (the HOST
     passes its Solid in;  util never imports Solid), `observe()`.
3. SPELL'S (`src/spell/`, flattened in LAST;  formerly the package `spell-util`):  lodash and string helpers,
   `Observable` (reactive props/state on spell cells), `Derivative`, `Loadable` / `LoadableFile` (abstract loadable /
   saveable resource:  `getLoader()`, `getSaver()`), `Task` / `TaskList`, `$fetch()` (throws a `ResponseError` subclass
   for every failure), `abortableFetch`, `Logger`, prefs / `AppPrefStore`, `assert` / `die`, `CustomError`, DOM helpers
   (`drawable`), `paths`, `json`, `array`, `constants`.
   - Deps:  lodash, `chalk`, `pluralize`, `query-string` (the kit's root `dependencies`).
   - `ResponseErrors.ts` is deliberately NOT in the barrel;  reach it as `spell-kit/util/spell/ResponseErrors`.
4. NODE-ONLY (`src/node/json5.ts`, `$/util/node/json5`, by deep path only):  JSON5 written with its comments kept
   (`json5Edited()`, `keepingComments()`, `readJSON5File()`), on json5-writer.  Moved here from the assembler in
   `repo-split` P1;  users:  ui's tools, app, brand, spaces, spell-epic, the assembler's `DataFile`.

Rules worth one line:  nothing spell-specific in the generic files;  Spell UI's util barrel
(`spell-ui/src/util/index.ts`) imports the generic files ONE BY ONE (`spell-kit/util/class` ...), never the barrel,
so lodash/chalk never land in Spell UI's bundles.

Who uses it (grep of `spell-kit/util"` imports):  spell-lang heavily (`spell/` 215 files, `parser/` 18, `core/` 16),
spell-app (app, lsp, spaces, cli), spell-ui (generic files only), and the kit's own `element/`.

Tests:  `tests/util/src/...` (`decorators`, `dom`, `string` in a real chromium;  `spell/`, `reactive/`, `node/` in
node).  `util/vitest.config.ts` makes two projects:  `browser` and `spell`.

Flow worth a picture -- "a write, then a read, then a redraw" (cells):
1. `thing.x = 1` -> `setProp()` writes the object's record (a `Map`) synchronously.
2. The write marks direct readers DIRTY and further readers CHECK.
3. `thing.x` read right away returns `1` (no flush needed).
4. A Solid computation that read `x` (through the host's `bridgeSolid()`) re-runs, but only if a value REALLY changed
   (`===` writes notify nobody).

### B2. `toolchain/` -- `spell-kit/toolchain/...` (no alias;  relative imports, `.ts` extensions)

What it is:  what every repo's CONFIGS share (was files at spell-app's root until `repo-split` P6).  Its entries are
source files;  node runs its two bins as is (types stripped, node 24), no build.

Main pieces:
- `src/lint.ts` (`spell-kit/toolchain/lint`):  oxlint + oxfmt settings as plain objects, spread into each
  `vite.config.ts`'s `lint` / `fmt` blocks.
  - `lintBase` (plugins `typescript`, `oxc`, `import`;  category `correctness: error`;  `typeAware: true` via
    oxlint-tsgolint;  JS plugins `vite-plus`, `spell-ui`, `spell`), `reactLint`, `testLint`, `rootLint()` (a
    several-folder repo's root), `packageLint({ name, react })` (each folder, or a flat repo's root), `fmtConfig`
    (120 cols, 2 spaces, no semicolons, double quotes, no trailing commas -- WWOD §2).
  - NOTE in its header:  a package's `lint` block does NOT inherit the root's;  `vp check` and the editor read the
    ROOT block only.
- `src/lint.imports.ts` (`spell/*` rules, on everywhere):
  - `spell/no-cross-package-import`:  no `../` from one package (or its tests) into another's folder.
  - `spell/no-cross-repo-alias`:  no `$/` alias into another repo;  use its npm name (`REPO_OF`, `npmNameOf()`).
- `src/lint.patterns.ts` (`spell-ui/*` rules, on in component folders only, `PATTERN_FOLDERS`:  ui `components`,
  `src/docs-components`;  brand `components`;  app `components`;  spell-epic via `patternLintIn()`):  flags what a
  component does BY HAND that a decorator does, and the message names the decorator:
  `no-solid-effect` (createEffect -> `@E.onChange` / `@E.whileConnected`), `no-mutation-observer`,
  `no-dom-element-listener`, `no-untrack`, `no-raw-timer`, `no-function-component`.
  A kept use says why:  `// oxlint-disable-next-line spell-ui/no-untrack -- <why>`.
- `src/decorators.ts` (`standardDecorators()` Vite plugin):  lowers standard decorators with esbuild BEFORE Vite's
  own transform, because Vite 8's oxc only lowers legacy decorators and nothing runs decorators natively.
  `keepNames` stays on (custom element classes keep `UIButton`).  Swaps each file's copy of esbuild's decorator
  helpers for one shared module (Spell UI's core had 12 copies).  MUST be in every `vite.config.ts` AND
  `vitest.config.ts` that compiles decorated code.  `TODO: delete this file when oxc lowers standard decorators.`
- `src/packageVersion.ts`:  Vite plugin defining `__PACKAGE_VERSION__` from the nearest `package.json`.
- `tsconfig.base.json`:  the shared TypeScript settings (`module ESNext`, `moduleResolution bundler`, `strict`,
  `noEmit`, `isolatedModules`, `useDefineForClassFields` ...).  Each repo's alias table extends it.
- `types/index.d.ts` (`spell-kit/toolchain/types`):  ambient globals (`__PACKAGE_VERSION__`, `Class<T>`,
  `AbstractClass<T>`, `Prettify<T>`, `SplitString` ...) + `vite/client`.
- `src/declarations.ts` + `bin/spell-types.ts` -- `spell-types`:  builds a package's `.d.ts` into `dist-types/`
  (git-ignored) and rewrites every `$/` specifier as a relative path, so a HIGHER repo's `tsc` can read it with only
  its own alias table (Owen's pick "(c)" for item I12).  It IS the package's type check.
  `spell-types` / `spell-types --below` (every lower repo's, stale ones rebuilt) / `spell-types --clean`.
  Packages list their folders in `"spellTypes"` in build order (kit:  util, server, assembler, element, element/tools).
  `package.json` `exports` carry `{ "types": "./dist-types/...d.ts", "default": "./.../src/x.ts" }`:  TypeScript reads
  `types`;  Vite, Vitest, tsx and node read `default` (source).  Not built yet -> TypeScript falls back to source.
- `src/folders.ts` + `bin/spell-folders.ts` -- `spell-folders <check> [folder ...]`:  a several-folder package's
  checks (`ts`, `test`, `lint`, `lint:fix`, `format`, `format:check`), one folder at a time, every folder runs even if
  one fails;  driven by `"spellFolders"` (`name`, `lint`, `fmt`, `tests`, `node`, `python`).  Per check it runs:
  `ts` -> `spell-types` for typed folders else `yarn tsc -p <folder>`, plus `tsconfig.node.json` and the tests'
  tsconfig;  `test` -> `yarn vp test run` in the folder (+ `pytest` with Python);  `lint` -> `yarn vp lint` with
  strict flags (unused disable directives reported, warnings fail) over the folder and `tests/<folder>`
  (+ `ruff`);  `format` -> `yarn vp fmt` (+ `ruff format`).
- `src/aliases.ts` + `src/aliasTable.ts` -- the RUN-TIME ALIAS HOOK (`spell-kit/toolchain/aliases`):  a node resolve
  hook (`module.registerHooks()`) that resolves each `$/...` import through the alias table of the repo the IMPORTING
  file lives in (the nearest `tsconfig.base.json` with `paths`).  Needed because `tsx` reads ONE tsconfig for every
  file;  without it:  `Cannot find package '$'`.  Load it AFTER tsx:
  ```sh
  tsx --import spell-kit/toolchain/aliases scripts/site-data.ts
  node --import tsx --import spell-kit/toolchain/aliases src/page/cli.ts serve
  ```
  Loaded by:  spell-app's CLI, the kit's background page server (`PageServer.ensure()`), `spell-pack`, the `tsx`
  scripts of every repo.

Flow worth a picture -- "how a type check reads another repo" (I12):
1. `yarn ts` at the top runs the kit's `kit:ts` first:  `spell-types` builds `dist-types/util/...`, `server/...` ...
2. Then each child repo, lowest first, runs `spell-types --below && spell-folders ts` (or `spell-types && tsc`).
3. spell-ui's `tsc` meets `import { E } from "spell-kit/element"`;  `exports["./element"].types` points at
   `dist-types/element/src/index.d.ts`, whose imports are relative paths, so no `$/spell-element` alias is needed.
4. Vite / Vitest / tsx meanwhile take `default`, the source, and resolve `$/` through each file's own repo
   (`resolve.tsconfigPaths`, or the alias hook under tsx).

Who uses it:  every `vite.config.ts` / `vitest.config.ts` in every repo;  every repo's `tsconfig.base.json`;
the assembler (`formatHTML()` reads `fmtConfig`);  the server (loads the alias hook).

Tests:  `tests/toolchain/src/lint.imports.test.ts` (node, oxlint `RuleTester`).  The `spell-ui/*` rules' tests stay
Spell UI's (`spell-ui/tests/tools/LintPatterns.test.ts`).

### B3. `server/` -- `spell-kit/server`, `$/server`, namespace `SRV`

What it is:  serving pages locally, for every repo.  Before it, six servers each had their own mime table, path check,
port choice and opener.  It's a LEAF (node built-ins only;  json5 / esbuild come in as hooks) and GENERIC:  it names
nothing of spell-app's or spell-epic's folders -- what a page server serves beyond its checkout comes from settings.

The barrel (`server/src/index.ts`), node only:
- `mime.ts` -- ONE content-type table, `typeFor()`
- `safePath.ts` -- `resolveInside()` (URL path -> file under a root, never outside;  the ONE path check:  `..`, NUL,
  encoded `/` refused), `fileInside()`
- `StaticHandler` -- folders under URL prefixes (longest prefix wins;  same-prefix mounts laid over each other;
  dot files 403;  every answer `Cache-Control: no-store` + an `ETag`;  hooks:  `html` rewrites, per-extension
  `transforms`, `overlays`)
- `Request`, `Reply`, `Router`, `bodies.ts` (`parseBodies()`) -- "the part of Express the app's API uses", with
  Express's names;  ONE deliberate difference:  `:name*` holds the WHOLE rest of the path
- `listener.ts` -- `toListener()`:  a handler as node's `(req, res)`, with 404 / error answers
- `ports.ts` -- `isFree`, `freePort`, `listenPreferred`;  `open.ts` -- browser, new window, reused Chrome tab
- `FileLock` -- `<file>.lock` so tools writing one file take turns (waits up to 20s;  a lock older than 60s is taken)
- `FileOperations` -- save / create / rename / duplicate / delete, under the lock, atomic (temp + rename);
  over HTTP as `/api/files`, only inside the settings' `"writable"` folders
- `LiveReload` + `liveClient.ts` + `webSocket.ts` -- live reload over ONE websocket per page (`/api/server/live`,
  client at `/api/server/live.js`);  never `EventSource` (each holds one of Chrome's 6 connections per host, and
  every VS Code window shares them).  Hot reload (`liveAction()`):  the page's own file -> patched or reloaded;
  a stylesheet -> swapped in place;  a script it loaded -> reload keeping scroll;  else `spell-server:file` event.
  Debounce 250ms per path;  heartbeat 30s;  a reload gate waits while you type in a field ("Updated: reload" pill).
- `Guard` -- `Host` check (DNS rebinding), a per-run write token (`x-server-token`, only pages it served know it,
  `window.SPELL_SERVER.token`), same-origin writes
- `PidFile` -- `<root>/.spell-server.json`:  `status()`, `ensure()` (restarts a server older than its code),
  `stop()` (waits for the PROCESS to end)
- `mainServer.ts` (`mainServerUrl()`:  a worktree's file on the MAIN checkout's server), `checkout.ts`
  (`checkoutOf()`:  the git checkout and main checkout of a path, read from disk with no `git` run),
  `proxy.ts` (`proxyTo()`, `proxyUpgrade()`), `untilInterrupted.ts`
- `WebServer` -- all of the above on `node:http`.  Request order:
  host check -> `/api/server/live.js` -> `router` -> static files -> Spell's favicon -> `fallback` -> 404.
  Every `.html` page gets, before `</head>`:  favicon links, `window.SPELL_SERVER`, the live client.  Loopback
  (`127.0.0.1`) only by default.

Opt-in entries (NOT in the barrel):
- `$/server/page` (`spell-kit/server/page`) -- THE PAGE SERVER:  `PageServer`, `PageEditor` (`/api/pages`:  GET a
  page's or one element's source + ETag;  PUT whole file;  PATCH one element by `id`, splicing its exact byte range
  with parse5 so diffs show only the edit;  `If-Match` required, 409 on a stale ETag), settings, prune.
  - `page/cli.ts` is the command line (`spell dev server`), run under tsx;  it's left out of the barrel because it
    runs on import.
- `$/server/site` (browser code) -- `<spell-site-header>` (`SiteHeader`:  the fixed bar on every page, its TABS are
  data, `SiteTab`, from the settings' `"siteTabs"` or `defineSite({ tabs })`'s fallback;  hat logo, worktree/branch
  badge, edit pencil, light/dark toggle), `<spell-section-editor>` (`SectionEditor`:  hover a section, edit its HTML,
  save via `PATCH /api/pages`), `favicon.ts` (generated by `yarn favicon`), `logoMark.ts`.  `defineSite()` defines
  both;  called by Spell UI's site bundle, spell-epic's docs bundle and the brand's.
- `$/server/test/serve` (`serveHandler`, `ask`:  real HTTP through node's client, never `fetch`) and
  `$/server/test/checkouts` (`fakeMainCheckout()`, `fakeWorktree()`).

The PAGE SERVER (`server/src/page/PageServer.ts`) -- one per checkout (main and each worktree), the whole checkout on
one port:
- Port:  `SPELL_SERVER_PORT`, else 4747 if free, else any;  the real port goes in `<root>/.spell-server.json`;
  output in `<root>/.spell-server.log`.
- URLs:  `/` -> home page (`pages/index.html`);  `/<x>` -> the checkout's file, else the shared content folder's
  (once a route module calls `serveContent()`);  `/components/<set>/` -> a component set's docs with its site bundle
  laid over at `_assets/`;  `/worktrees/<w>/...` -> worktree `<w>` (once `serveWorktrees()` is called);
  `/_beside/<folder>/` -> folders outside the checkout its settings name (e.g. `../spell-ui/docs`);
  engine routes (e.g. `/_epic/assets/`, `/_epic/pack/`, `/templates/`, `/_brand/assets/`).
- Every CALL is under `/api/`:  `/api/server` (`ServerInfo`), `/api/server/live(.js)`, `/api/files`, `/api/pages`;
  route modules add the rest (`/api/epics/...`, `/api/docs/...`, `/api/projects/...`, `/api/spaces/...`).
  No redirects for old URLs.
- SETTINGS:  the `"pageServer"` block of the checkout's root `package.json`, read by `pageServerSettings()`
  (`page/settings.ts`).  Keys:  `routes`, `watch`, `writable`, `bundles`, `pageScripts`, `componentSets`,
  `siteTabs`, `engineRoutes`.  The kit itself has NO `pageServer` block;  spell-app's root `package.json` has the real
  one (12 route modules:  `page-server/src/pageServerRoutes.ts`, ten of spell-epic's `../spell-epic/src/...Routes.ts`,
  `spaces/src/server/node/routes/appRoutes.ts`;  4 component sets `ui`, `epics`, `app`, `brand`;  9 site tabs;
  6 engine routes).  Short excerpt for the README:
  ```json
  "pageServer": {
    "routes": ["page-server/src/pageServerRoutes.ts", "../spell-epic/src/list/runningRoutes.ts", "..."],
    "writable": ["epics", "guides", "pages", "brand"],
    "componentSets": { "ui": { "name": "Spell UI", "dir": "../spell-ui/docs", "assets": "../spell-ui/site/_assets" } },
    "engineRoutes": { "/_epic/pack/": "../spell-epic/src/components/__pack" }
  }
  ```
- ROUTE MODULES (`page.types.ts`):  a file whose default export is `{ name, setup(context) }`;  `setup()` runs once
  before the server listens.  `RouteContext`:  `root`, `router` (routes run BEFORE static files), `guard`
  (`guard.writeCheck` on every write route), `live` (`live.watch(dir)`), `web`, `info`, `serveWorktrees(...dirs)`,
  `serveContent?(dir)`, `addPageConfig(fn)` (more fields on every page's `window.SPELL_SERVER`),
  `onListening(fn)`, `onStop(fn)`.  This is how the server stays a leaf:  it imports no route module's package,
  it loads them by path from settings.
- `PageServer.ensure(root)` starts it in the background:
  `node --import tsx --import spell-kit/toolchain/aliases server/src/page/cli.ts serve --root <root> --port <n>`
  with `TSX_TSCONFIG_PATH` = the server's tsconfig.

Flows worth a picture:
1. "Opening a page" -- an opener (`spell dev docs open`, `epic open`, `spell dev server url <file>`) calls
   `PageServer.ensure(root)` -> reads `.spell-server.json`, asks that server's `/api/server` -> none answering for
   THIS checkout:  spawn `cli.ts serve` detached under tsx, wait (~1s to start, ~0.3s if running) -> URL = base + the
   file's path -> the server injects `window.SPELL_SERVER` (port, token, file, ETag, branch ...) + live client.
2. "Live reload" -- `fs.watch` on the watched folders -> a path is quiet for 250ms -> `{ event: "change", data:
   { path } }` to every page's websocket -> the page's live client decides:  patch / swap stylesheet / reload.
   A server restart:  each socket opens with `hello` + the server's `run`;  a page from an older run reloads.
3. "Editing a section" -- the header's pencil turns edit mode on -> hover outlines an element with an `id` ->
   "edit" -> `GET /api/pages?path=&id=` -> `{ html, etag }` -> save -> `PATCH /api/pages?path=` with token +
   `If-Match` -> the server checks token/origin/writable folder, takes the `FileLock`, finds exactly ONE `#id`
   with parse5, splices its byte range, writes temp + rename -> live reload shows the result;  nothing committed.
4. "Request through the WebServer" -- host check -> live client -> router (route modules) -> static mounts
   (checkout, then content folder, then worktrees) -> favicon -> fallback -> 404.
5. "Running epics on one port" -- spell-epic's `runningRoutes.ts` calls `serveWorktrees(<worktreesFolder>)` and
   `serveContent(<contentFolder>)` from `.epic/config.json5` -> the main checkout's server answers
   `/worktrees/<w>/...` -> `spell dev server url` hands out those URLs (`mainServerUrl()`).

What uses it:  spell-app (`cli/` for `spell dev server` / `spell serve`, `page-server/`, `spaces/` saves via
`SRV.FileOperations`), spell-epic (24+ files:  route modules, docs tools, its own `EpicServer`, vscode),
spell-ui's tools (smoke `StaticServer`) and site (`defineSite()`), spell-brand's scripts.

Commands:  the kit's `yarn server <cmd>` (`tsx --tsconfig server/tsconfig.json server/src/page/cli.ts`) --
`serve [--port N]`, `start` / `ensure`, `stop`, `status`, `url <file>`, `prune [--dry-run]`, flags `--root`,
`--spaces`.  Day to day it's reached as spell-app's `spell dev server ...` (spell-app's `yarn server`), which runs the
SAME `cli.ts` (`spell-app/cli/src/dev/passThrough.ts`:  `server: { tool: "../server/src/page/cli.ts" }`) with root =
spell-app's checkout, so spell-app's settings apply.  `yarn favicon [--hat 0.74]` regenerates the favicon (headless
Chromium).

Tests:  `tests/server/src/...` (node):  `Router`, `StaticHandler`, `WebServer`, `LiveReload`, `PidFile`,
`FileOperations`, `checkout`, `mainServer`, `ports`, `proxy`, `safePath`, `webSocket`, `liveClient`,
`page/PageServer`, `page/prune`, `site/SiteHeader`, `site/site.types`.  Helpers stay in `server/test/`.
No `server/README.md` exists (AGENTS.md is the only doc in the folder).

### B4. `assembler/` -- `spell-kit/assembler`, `$/assembler`, namespace `AS`

What it is:  "ASSEMBLING pages:  the steps between a page's content and its file on disk, for every tool that writes
pages."  Node only (fs, child processes, `git`, oxfmt, linkedom).  Imports only util's node json5 and the toolchain's
`fmtConfig`.  Knows the checkout's LAYOUT as folder names, never imports.  Born in epic `epic-components` P7.

Pieces:
- `Linker` (`src/Linker.ts`):  `link()` turns `<code>path</code>` (outside `<pre>`/`<a>`/`<head>`) into a link when
  the path is a real file, gives every link a named `target` (one per destination, so re-clicks reuse a tab);
  `<code title="path">name</code>` links too;  `check()` verifies every local href is inside the repo, has a target,
  one target per destination.  Works on TEXT with regexes, never a parsed DOM, so edits touch only what they link.
  Understands the multi-repo layout:  `packages/<name>/...` (old spelling) is found through `node_modules`
  (`packages/ui/tools` -> spell-ui's `tools/`), and the shared content folder is laid under the checkout.
  Was the docs tools' `doc-links.js` (now its command line, in spell-epic).
- `formatHTML(file, html)` (`src/format.ts`):  formats in memory as `vp fmt` would (oxfmt), no 0.5s subprocess.
- `Bundle` (`src/Bundle.ts`) + `BUNDLES` (`src/assembler.types.ts`):  bundles only the page server serves, BUILT on
  demand, never committed (their hashed chunk names churned every diff).  Which:  the folders in the root
  `package.json`'s `"pageServer": { "bundles": [...] }`.  `check()` -> stale when never built, entry missing/newer,
  or sources' hash changed;  `build()` runs the package's script and records the hash in `.bundle.json`.

  | Bundle | Built by | Into |
  | --- | --- | --- |
  | `ui-site` | `yarn site:bundle` in spell-ui | `spell-ui/site/_assets/` |
  | `brand` | `yarn build` in spell-brand | `spell-brand/_assets/ui/` |

  CLI:  `spell dev bundles build [<name>...] [--stale]` / `check`.  The page server runs `build --stale` as it starts
  (spell-app's `page-server/src/BundleBuild.ts`);  a request for a bundle file waits while it builds.
- `DataFile` (`$/assembler/DataFile`, by path):  the epic tooling's JSON5 data files (review inbox, details answers,
  choice rows, running agents, the commands page's data) -- read `.json5` (else old `.json`), written keeping hand
  comments, laid out like `JSON.stringify(v, null, 2)`, atomic, no lock (callers hold `SRV.FileLock`).
  ```ts
  DataFile.besidePage("epics/seo/details/names.html", "answer") // => "epics/seo/details/names.answer.json5"
  DataFile.read<Answer>(file)
  DataFile.write(file, answer)
  ```
- `contentFolderOf(root)` (`$/assembler/contentFolder`, by path):  the shared content folder = `contentFolder` in the
  MAIN checkout's `.epic/config.json5` (`SPELL_SHARED_DIR` overrides);  NEVER throws.

README example (from `assembler/README.md`, accurate):
```ts
import { AS } from "$/assembler"
const linker = new AS.Linker(root)
const { text } = linker.link(html, dirname(file))
writeFileSync(file, await AS.formatHTML(file, text))
```

Flow worth a picture -- "a tool writes a page":  content (an epic page part) -> `Linker.link()` (code spans become
links with targets) -> `formatHTML()` (oxfmt in-process) -> write -> `Linker.check()` (`doc-links.js --check`,
`epic check`) -> page server live-reloads it.
Flow -- "page server start":  read `pageServer.bundles` -> `Bundle.all(root)` -> each stale one `build()`s
(`yarn site:bundle` in spell-ui) -> hash recorded -> pages load `/components/ui/_assets/site.js`.

Who uses it:  spell-epic (docs tools `doc-links.js`, `epic` tool, `DataFile` everywhere), spell-app's `cli/`
(`spell dev bundles`, commands page data, `contentFolderOf()`) and `page-server/` (`BundleBuild`), spell-ui's tools.

Tests:  `tests/assembler/src/{Bundle,DataFile,Linker,format}.test.ts` (node).  Deferred:  the page server's assembly
code moves in here later.

### B5. `element/` -- `spell-kit/element`, `$/spell-element`, namespace `E`

(The framework itself is section C.)  Folder map:
- `src/` (browser;  imports ONLY Solid and util's generic files one by one, never Spell UI):
  `UIComponent.tsx` (component base), `DOMElement.ts` (DOM element base), `ElementDefinition.ts` (vocabulary ->
  attributes/events/slots for an actual tag), `Reactive.ts` (decorators), `Cell.ts`, `SlotContent.ts`,
  `PartContext.ts` / `OwnerContext.ts` (generic content parts and the element they belong to), `ShadowEvents.ts`
  (Solid's delegated events kept from leaking out of shadow roots), `HotDefinitions.ts` (dev-only HMR, a side
  effect, not in the barrel), `timing.ts` (`afterSolidUpdate()`, `beforeNextPaint()`, `soon()`, `after()`,
  `every()`), `SkeletonText.ts` (skeleton text parser, node too, by path), `SpellSolid.ts` (settings the page's
  runtime installs), `elements.types.ts`, `vocabulary.types.ts`.
  Four files began as `@solidjs/element` and `component-register` (UIComponent, DOMElement, ShadowEvents,
  HotDefinitions), folded in and fixed;  each carries their MIT notice.
- `tools/` (node;  `spell-kit/element/tools/<Name>`):  `ComponentPack` (pack build + check), `packModules`
  (`PACK_MODULES`, `packModuleKey()`), `RootCatalog` + `VocabularyFiles`, `elementConfig` (`elementBaseConfig()`:
  the Vite settings every set's elements compile with -- decorators BEFORE Solid, Solid's JSX, Lightning CSS;
  `CSS_TARGETS`, `SOLID_DEDUPE`), `HotElements` (Vite HMR plugin), `DevServer` (a package's Vite dev server from
  node), `Terminal`, `NodePackage`.  Checked as their own folder, `element/tools` in `"spellFolders"`.
- `test-helpers/` (`spell-kit/test-helpers/<Name>`):  `Fixture` (render HTML into the live document, removed after),
  `ElementFixture` (render, wait for every element's `ready`, `flush()`, `breakRender()`), `A11y` (axe:
  `expectAccessible()`, WCAG contrast), `Viewport` (resize the test iframe), `TestSettings` (stand-in settings:
  English names, no styles, animations instant -- the kit's own tests' setup).
- `bin/spell-pack.mjs` -- `spell-pack build | check [<folder>]`:  runs `ComponentPack` through tsx with the PACK's
  own tsconfig, then the alias hook;  exits 0 built/current, 1 stale/failed, 2 bad args.

Tests:  `tests/element/src/*.test.tsx` in a real chromium with NO Spell UI on the page (`DOMElement`,
`ElementDefinition`, `HotDefinitions`, `OwnerContext`, `Reactive`, `ShadowEvents`, `SkeletonText`, `UIComponent`,
`barrel.test.ts` -- pins every export live and no import but util's and Solid's);  `tests/element/tools/
ComponentPack.test.ts` in node.  What needs Spell UI's runtime is tested in spell-ui.
No build of its own:  it's source, bundled by whoever draws with it.

---

## C. The element framework in depth

### C1. What it is, in a sentence or three

`element/` is what makes a custom element on Solid 2, for EVERY component set:  Spell UI's `ui-*`, spell-epic's
`epic-*`, the brand's `brand-*`, the app's `<spell-app>` / `<spell-editor>`, and (planned) a space's own.
Each tag on a page is TWO objects that point at each other:
- the DOM ELEMENT (`DOMElement`, the browser's side):  attributes, a property per attribute with reflection,
  `internals` (custom states, ARIA defaults, form value), the shadow root, the `ready` promise, the upgrade step.
- the COMPONENT (`UIComponent` subclass, e.g. `UIButton`, Solid's side):  one instance per element, built on first
  connect, kept across moves until `dispose()`;  holds state, `render()`s JSX once into its own Solid root, handles
  events.
- `domElement.component` / `component.domElement`.  "Controller" is a retired word;  "host" only the platform's.

### C2. The vocabulary:  every name lives in data (also the localization system)

- Each tag has a VOCABULARY file named for its language, `<Name>.en.ts` (`UIButton.en.ts`, `EpicNote.en.ts`):
  tag, `topics`, `aka`, `skeleton`, noun, description, attributes (each a `kind` + allowed values + description),
  events, slots, parts, states, texts.  Schema:  `E.ComponentVocabulary` (`element/src/vocabulary.types.ts`).
- Code never writes those names as strings:  `this.partForName("count")`, `this.slotForName("icon")`,
  `this.translationForKey("add", { step })`, `this.send("ui-change", detail)`, `this.rootClass`.
- Attribute `kind`s:  `keyOnly`, `valueAndKey`, `keyOrValueAndKey`, `width`, `multiple`, `textAlign`,
  `verticalAlign`, `size`, `color`, `valueOnly` (all build Fomantic class words through Spell UI's `ClassBuilder`:
  `<ui-button size="small" primary basic>` -> `ui small basic primary button`), and `boolean` / `enum` / `string` /
  `number` / `json` / `icon` (typed property, no class).  Booleans:  presence / `""` / `"true"` / `"yes"` = true.
- `as const satisfies E.ComponentVocabulary` keeps every name a literal type:  `this.partForName("buton")` fails tsc.
- A component declares its attribute getters with one line:
  `export interface UIButton extends E.AttributeValues<typeof buttonVocabulary> {}` -> `this.size`, `this.closeIcon`.
- Vocabularies are PURE DATA (node imports them all for `yarn gen:root`, `yarn site:data`, the pack build).

LOCALIZATION, two halves:
1. NAMES (what authors type) -- a `Dictionary` renames tags, attribute names, attribute values, events, slots, parts:
   ```ts
   export const es = {
     lang: "es",
     tags: { "ui-button": "boton", "ui-dropdown": "desplegable" },
     attributes: { primary: "primario", size: "tamano" },
     values: { hues: { red: "rojo" }, sizes: { small: "pequeno" } },
     events: { "ui-change": "cambio" }
   } as const satisfies Dictionary
   ```
   (`spell-ui/test-helpers/dictionary.es.ts`).  `UIButton.define("ie-boton", es)` registers `<ie-boton primario
   color="rojo">`;  values arrive in English (`rojo` -> `red`), so the component's code is unchanged.
   Shared attributes per language are named once (`spell-ui/src/vocabulary/SharedVocabulary.es.ts`:
   `<ie-boton desactivado>`).  The registry/resolver is Spell UI's `Vocabulary` (`define(prefix, dictionary)`,
   `canonicalize()`, `localize()`).
   What STAYS canonical:  CSS classes, `:state()`s, JS property names, `event.detail` keys, `--ui-*` tokens,
   utility classes, part names (translation only adds).  A pack's events keep their own names (`spell-open`).
2. TEXTS (what people read) -- not in the dictionary:  `UI.i18n` (Spell UI's `src/runtime/I18n.ts`) owns them, keyed
   per component.  `t(key, params, scope)` looks up exact locale (`pt-BR`) -> language (`pt`) -> `en` -> English
   defaults (each vocabulary's `texts`) -> the key itself (visible, not blank).
   `UI.i18n.register("es", { label: "Etiqueta" })` (shared) or `register("es", { label: "Migas" }, "ui-breadcrumb")`
   (one component).  Formatting via `Intl`;  Temporal via polyfill when needed.
- Status:  the translation contract is "designed now, built later" (`guides/ui/notes/translation.md`):  the
  mechanism works (tested with the Spanish dictionary) but no real translations ship.
- The element layer reaches all of this through its settings (`E.SpellSolid.settings.words`), not by import.

### C3. Settings:  how the element layer gets a runtime without importing one

- `element/` never imports Spell UI.  The page's runtime calls `SpellSolid.install(settings)` as it loads;
  the bases read `E.SpellSolid.settings`:  `runtime` (is it loaded, load it), `words` (vocabulary layer:  names,
  value sets, converters, class words, texts), `styles`, `focus`, `motion` (default animation, reduced motion),
  `warn()`.  Type:  `SpellSolidSettings` (`element/src/elements.types.ts`).
- Spell UI installs its own (`spell-ui/src/elements/SpellUISettings.ts`) as `$/ui/core` loads.
  So "every page with elements has Spell UI's runtime" -- packs draw on a page that has it.
- A tag defined before settings are in WAITS (`whenInstalled()`;  a code-split chunk may run first);  a console
  warning after 5s.
- A set adds names the types check against by augmenting interfaces (`declare module "$/spell-element/..."`):
  `ElementAnimations`, `ValueSetNames`, `TopicNames`.

### C4. Reactive members (the decorators) and the lifecycle

- `Reactive.ts`:  decorators over ONE record per instance, so a member reads and writes like a property, fresh at
  once (no flush), and Solid still follows it (a NOTIFIER signal per member, made on first tracked read).
  - `@E.state accessor isOpen = false` -- internal state.
  - `@E.controlled("open") accessor isOpen = false` -- the DOM element's property when the page set it, else the
    component's own;  writes go to the property (and reflect);  a person's change is
    `requestChange("isOpen", next, announce)` (a cancelable event first).
  - `@E.derived get rows()` -- a self-tracking cache (NOT a Solid memo, which would read stale after a write).
  - `@E.cssState("open")` -> `:state(open)`;  `@E.aria("busy")` -> `internals.ariaBusy`.
  - `@E.onChange("member")`, `@E.whileConnected`, `@E.watches` (light DOM), `@E.on("click")`, `@E.untracked`.
  - `@E.proto static vocabulary = ...`, `@E.protoMerged static elementSetup = { styleSheets, Fallback,
    isAFormControl, delegatesFocus, disabled, loading, DOMElement ... }` -- class settings.
- Solid 2's one rule here:  NEVER change state while Solid is drawing (in `render()`, a getter, an effect's first
  half);  change it in handlers, `@onChange` methods, after an `await`.
- Lifecycle (UIComponent banner):  1) the family's `index.ts` calls `UIButton.define()` (builds an
  `ElementDefinition`, makes the tag's own `DOMElement` subclass, `customElements.define`) -> 2) first connect:
  `mount()` builds the component, `onMount()` calls `render()`, then `onConnect()` -> 3) content shows once the
  runtime and the class's sheets are in (`isReady`), so nothing flashes unstyled -> 4) moves keep the component;
  only `dispose()` ends it -> 5) if anything throws:  `:state(errored)`, one `console.error`, a cancelable
  `ui-error`, then a form control shows its plain-DOM fallback, any other element its children.  Each element has
  its own error boundary, because one uncaught error halts Solid page-wide.
- Shared behaviour every element gets:  `disabled`, `loading`, `visible`/`hidden` (+ `ui-open`/`ui-close`
  cancelable, `ui-show`/`ui-hide` after the animation), `animation` (`none` spreads via `--ui-motion: none`;
  `<ui-root animation="none">` stills a page), `readonly`, `inert`.
- Hot reload (`yarn dev`):  `HotElements` (Vite plugin) injects `HotDefinitions` into each family barrel;  an edit
  to a component/vocabulary/fallback/sheet swaps it in place in every live element (state resets);  what the
  platform reads once (observed attributes, `formAssociated`, shadow options) reloads the page instead.
- Static server render (Spell UI's `$/ui/static`, epic `seo`):  `ui-*` pages rendered in node to plain HTML (no
  shadow DOM, no scripts);  only `@E.aria` and `@E.onChange(..., { writesDOMElement: true })` apply there.

### C5. Methodology:  making a web component for a thing (steps)

From `guides/custom-elements/custom-elements.html` §4 ("Build one:  `<ui-counter>`") and spell-ui's AGENTS.md
"A family's files".  A FAMILY is a folder `<prefix>-<name>/` (Spell UI:  `spell-ui/components/ui-<name>/`;
spell-epic:  `spell-epic/src/components/epic-<name>/`;  brand:  `spell-brand/components/brand-<name>/`).
1. Write the vocabulary, `<Name>.en.ts`:  every name the tag uses, `as const satisfies E.ComponentVocabulary`;
   a new tag MUST fill `topics` and `aka`;  add `skeleton` text (`"inline 6 x 2.5"`) or leave it out.
   ```ts
   export const counterVocabulary = {
     tag: "ui-counter", topics: ["controls", "inputs"], aka: ["counter", "stepper"], skeleton: "inline 6 x 2.5",
     attributes: [{ name: "count", kind: "number", description: "..." }, { name: "step", kind: "number", default: 1 }],
     events: [{ name: "ui-change", detail: "{ count: number }", cancelable: true }],
     parts: [{ name: "count" }, { name: "button" }], states: [{ name: "at-max" }],
     texts: [{ key: "add", text: "Add {step}" }]
   } as const satisfies E.ComponentVocabulary
   ```
2. Write the component, `<Name>.tsx`:  `extends E.UIComponent<typeof vocabulary>`, `@E.proto static vocabulary`,
   `@E.protoMerged static elementSetup = { styleSheets: { counter: counterCSS } }` (CSS imported `?inline`),
   reactive members with decorators (no hand-written effects:  the lint guard flags them), a `render()` returning
   JSX that reads every name through the vocabulary.
   ```tsx
   @E.controlled("count") accessor currentCount = 0
   @E.cssState("at-max") get isAtMax() { return this.max !== undefined && this.currentCount >= this.max }
   @E.untracked add(event: Event) {
     const next = Math.min(this.currentCount + this.step!, this.max ?? Infinity)
     this.requestChange("currentCount", next, () => this.send("ui-change", { count: next, originalEvent: event }))
   }
   render() { return <div class={this.rootClass} part={this.partForName("counter")}>...</div> }
   ```
3. Write its sheet, `<Name>.css`, in layers:
   `@layer ui.components.<name>.types, ...content, ...variations, ...states`;  public tokens `--ui-<tag>-*` are READ
   through a private alias (`--_ui-button-radius: var(--ui-button-radius, var(--ui-radius))`), never declared.
4. Optional:  `DOM<Name>Element` (script API) above the component, in the same file;  `<Name>.fallback.ts` (form
   controls only);  `<Name>.types.ts` for shared constants.
5. The family barrel `index.ts`:  `UICounter.define()` (side effect) and re-export.  Every element already in the page
   upgrades at once.
6. Regenerate the catalog:  Spell UI `yarn gen:root` (+ `yarn site:data`);  a pack `yarn pack:build`
   (`spell-pack build`).  Their tests fail while stale.
7. Tests (same path under the repo's `tests/`):  `<Name>.test.tsx` (with `ElementFixture`, `expectAccessible()`),
   plus Spell UI's optional `.css.test.ts`, `.ssr.test.tsx`, `.a11y.test.ts`, `.perf.test.tsx`;  examples in
   `examples/` (class grammar) and `examples/elements/` (element markup).
8. Docs page in the set's `docs/` (served at `/components/<set>/`).

### C6. Component packs, `<ui-root>`, loading on demand, the catalog

- `<ui-root>` (Spell UI's `components/ui-root/UIRoot.tsx`) is the top of a page or app:  a `<slot>` for the page plus
  what shows while it loads.  LOADS ON DEMAND:  every undefined `ui-*` tag inside (now and as content is added)
  imports its family once;  nothing up front.
  - `RootLoader`:  tag -> family -> `import()`, once per family per page, via a literal
    `import.meta.glob(["../*/index.ts", "!../ui-root/index.ts"])`.  Which family defines a tag comes from
    `ROOT_CATALOG` (`components/ui-root/UIRoot.catalog.ts`, GENERATED by `yarn gen:root` from every vocabulary),
    never from guessing at the name (`"ui-actions": { folder: "ui-parts" }`).
  - Ready:  every family settled and every element `ready` (or `timeout`) -> `:state(ready)`, `ui-ready { failed }`,
    content shows.  Each tag that didn't load fires a cancelable `ui-error`.
  - While loading (`display`):  hidden with its space kept (`when-ready`), a `loading` message, or `skeleton`:
    a `<ui-placeholder>` per element whose vocabulary describes a skeleton, drawn from the catalog BEFORE its family
    loads.
  - Settings for the subtree (`E.RootSettings`):  `icons`, `emoji`, theme (`:state(light|dark)`), `--ui-scale`,
    `stack-with`, `animation`.  Nested roots inherit.  A subclass is a root too (`<spell-app>`).
- A COMPONENT PACK = another package's custom elements, any prefix (`epic-`, `brand-`), loaded on demand by
  `<ui-root>` like Spell UI's own:
  ```html
  <script src="/_epic/assets/spell-ui.js"></script>          <!-- the page's Spell UI + window.SpellUI -->
  <ui-root>
    <ui-components source="/_epic/pack/epics.pack.js"></ui-components>
    <epic-page>...</epic-page>
  </ui-root>
  ```
  (real:  every epic page, e.g. `spell.epics/epics/airplane/airplane.plan.html` lines 11-12, 1318.)
- A pack is a package whose `package.json` has `"spellPack"`:  spell-epic `{ "name": "epics", "prefix": "epic-",
  "dir": "src" }`, spell-brand `{ "name": "brand", "prefix": "brand-" }`.  Its build (`ComponentPack`, run by
  `spell-pack build` / `yarn pack:build`, or spell-app's `spell dev pack build <pack>`) writes
  `components/__pack/`:
  1. `<pack>.catalog.ts` -- tag -> `{ folder, skeleton }`, read by `RootCatalog` from every `<Name>.en.ts`
     (the same reader Spell UI's `yarn gen:root` uses);  second line records the sources' hash.
  2. `<pack>.entry.ts` -- `SpellUI.registerPack({ name, prefix, catalog, define })`, `define()` = `Promise.all` of
     `import("../<family>")` for every family.
  3. `<pack>.pack.js` -- that entry built by Vite as ONE classic script (IIFE, minified, works from `file://`), on
     `elementBaseConfig()`, with every `PACK_MODULES` import left EXTERNAL and read from
     `globalThis.SpellUI.packModules[<specifier>]`;  banner records the same hash.
  4. then the set's docs data, `docs/__data/` (`buildSiteData()`).
  `spell-pack check` compares hashes (exit 1 when stale).
- `PACK_MODULES = ["solid-js", "@solidjs/web", "$/spell-element", "$/ui/core", "$/ui/forms"]`
  (`element/tools/packModules.ts`).  Why:  two copies of Solid, of spell-element or of Spell UI's core on a page
  break silently (two registries, two owners).  So a pack's elements extend the page's ONE `UIComponent`.
  `$/spell-element` maps to Spell UI's core module, which re-exports all of the kit's element.
- `packModuleKey(specifier)`:  maps the npm spelling a repo's source uses to the `$/` key every page has always
  offered (repo-split J72):  `spell-ui/core` -> `$/ui/core`;  `spell-ui/ui-code` -> `$/ui/components/ui-code`;
  `spell-kit/element` -> `$/spell-element`;  `spell-kit/util/x` -> `$/util/x`;  `spell-lang/spell` -> `$/spell`;
  `spell-brand` -> `$/brand`;  `spell-epic` -> `$/epics`;  anything else unchanged.  This is why the kit's alias for
  `element/` is still `$/spell-element`.
- Who provides `window.SpellUI` (`registerPack` + `packModules`), and the only two places Solid is `import * as`'d:
  spell-epic's docs bundle entry (`spell-epic/src/tools/_assets/spell-ui.entry.js` -> `/_epic/assets/spell-ui.js`),
  and Spell UI's site bundle (`spell-ui/site/_src/SitePacks.ts`, every component set's pages).
- Runtime side (Spell UI's `components/ui-components/`):  `<ui-components source>` (invisible marker, read by the
  root);  `ComponentPacks` (static, one per page):  `load(source)` adds a `<script>` once per URL;  `register()`
  finds its load by `document.currentScript` (else the file name, `epics.pack.js` -> `epics`), calls `define()`,
  adds the catalog and prefix.  `whileDefining()` lets a root wait for a pack still importing its families.
  A failed / timed-out pack is a `RootFailure` (`{ tag: "ui-components", reason, source }`):  console error, but
  the root still gets ready.
- spell-app's `spell.pack.js` (`<spell-app>`, `<spell-editor>`) is a pack built by Vite, not `spell-pack`.

Flow worth a picture -- "a page loads a pack on demand":
1. Page loads Spell UI's bundle (`spell-ui.js` or `site.js`):  defines `<ui-root>`, installs `SpellUISettings`,
   sets `window.SpellUI = { registerPack, packModules }`.
2. `<ui-root>` connects, scans its subtree:  `ui-*` tags -> `ROOT_CATALOG` -> `import()` each family once;
   `<ui-components source="epics.pack.js">` -> `ComponentPacks.load()` adds a classic `<script>`.
3. While loading:  skeletons from the catalog (or hidden, or a loader).
4. The pack script runs:  `SpellUI.registerPack({ name, prefix: "epic-", catalog, define })` -> its imports of
   Solid / `spell-kit/element` / `spell-ui/core` resolve to `SpellUI.packModules[...]` (the page's copies) ->
   `define()` imports every family barrel -> each calls `EpicX.define()`.
5. Root learns the pack's prefix and catalog (skeletons for `epic-*` found again), waits for `epic-*` tags.
6. Everything settled:  `:state(ready)`, `ui-ready`, content shows.

### C7. Theming and CSS shared across sets

- Spell UI owns the CSS foundation (`spell-ui/src/styles/`;  doc `spell.epics/guides/ui/notes/theming.md`), and every
  set's elements draw with it (they adopt its sheets through the runtime).
  - Layers:  `@layer ui.reset, ui.tokens, ui.base, ui.components, ui.utilities, ui.theme, ui.app;`  each component
    declares `types, content, variations, states` sublayers (states beat variations without `!important`).
  - Tokens:  CSS custom properties (`--ui-*`), OKLCH colours, a px `--ui-font-size` (16px) base, `em` inside
    components, never `rem`;  ONE generic rule set switched by remapping `--ui-color` / `--ui-scale`.
    `tokens.css`, `colors.css`, `sizes.css` are GENERATED from `styles.en.ts` (`yarn gen:styles`).
  - Component tokens `--ui-<tag>-*` can be set on `:root`, any ancestor, the element, `::part()`, or the app
    stylesheet.  Custom properties inherit into shadow roots, which is what makes page-level theming work.
  - Sheets are shared, not copied:  one `CSSStyleSheet` per sheet adopted by every shadow root
    (`adoptedStyleSheets`), made once by `UI.styles`.
  - The app stylesheet:  ONE `<style id="ui-app-stylesheet">` convention, adopted by components (`@layer ui.app`).
  - Themes:  `src/styles/themes/*.css` (classic, dark, Fomantic themes like `github`/`material`, own themes `spell`
    and `spell-brand`), applied with `UI.themes.apply("github")` onto the page AND every shadow root;  `dark` is a
    colour scheme (`<ui-root theme>`, `color-scheme`).
  - Pages without the runtime:  `spell-ui/styles/ui.css` (one plain CSS entry).
- A pack's own sheets follow the same rules (spell-epic's `EpicNote.css` + shared `Fold.css`, `Tooltip.css` in
  `elementSetup.styleSheets`).  The docs pages share `/_epic/assets/spell-doc.css`.

### C8. What it deliberately does NOT do

- No knowledge of any set:  the element layer never imports Spell UI (or anything above util's generic files and
  Solid);  words, styles, focus and animation come in as settings.
- No runtime services of its own:  keyboard, overlays, i18n, themes, icons, sources are Spell UI's `UI` runtime.
- No bundle copy of its own:  ONE copy per page (Spell UI's core carries it;  packs leave it external).
- No build of its own (source, bundled by whoever draws with it).
- No function components or hand-written Solid effects in component files (the `spell-ui/*` lint guard).
- No light-DOM rendering:  shadow DOM everywhere, semantic shadow markup.
- Not a framework binding:  elements are plain custom elements usable from any framework or plain HTML.
- JSON packs were tried and rejected (`wwod-spell-ui` P12) for one classic script per pack (works from `file://`).
- Fallbacks only for form controls;  other elements show their children on error.
- Translations:  the contract is designed and tested, real translations not built.

### C9. spell-ui and spell-epic as example packs/sets

- spell-ui (`spell-ui/components/`, 64 entries:  `ui-accordion` ... `ui-visibility`, plus `ui-root`, `ui-components`,
  `ComponentDefinitions.ts`, `components.types.ts`) is the HOST:  not a pack (no `"spellPack"`).  It re-exports the
  whole kit element layer from `$/ui/core` (so Spell UI's `E` = kit's `E` + Spell UI's own pieces:  `E.IconGlyph`,
  `E.LoadableBody`, `E.NativeFallback`, `E.Converters`, `FormComponent` ...), supplies the runtime (`src/runtime/`),
  vocabulary layer (`src/vocabulary/`), styles, icons, `<ui-root>`, and `registerPack`.  Exports:  `.`, `./core`,
  `./api`, `./forms`, `./runtime`, `./styles`, `./styles/ui.css`, `./icons`, `./ui-*` (each family), tools ...
- spell-epic (`spell-epic/src/components/`, ~40 `epic-*` families:  `epic-page`, `epic-phase`, `epic-item`,
  `epic-note`, `epic-thread`, `epic-comment-pane` ...) is a PACK:  `"spellPack": { "name": "epics", "prefix":
  "epic-", "dir": "src" }`;  `yarn pack:build` -> `src/components/__pack/epics.{catalog.ts,entry.ts,pack.js}`;
  served by spell-app's page server at `/_epic/pack/`;  every epic page loads it.  Its element files say
  `import { E } from "spell-kit/element"` and import shared sheets by its own alias (`$/epics/components/...`).
- spell-brand (`spell-brand/components/brand-*`, 10 families) is a second pack, `brand-` prefix, `brand.pack.js`.
- The app's `<spell-app>` is a ROOT subclass (`elementSetup.root`), loading its own tags via `ownTagLoader()`.

---

## D. The kit's commands (root `package.json`, run at `~/www/spell`)

Setup and repos (`tools/repos.ts`, reads `repos.json5`):
- `yarn install` -- the ONE install for the kit and every cloned child repo;  `postinstall` runs
  `node tools/repos.ts links`:  links `node_modules/spell-kit` -> the kit (yarn links the root workspace nowhere),
  and each child repo's `agents` -> `../agents` (not spell-epic's).
- `yarn clone [repo ...]` -- clone what's missing (named repos plus everything they `needs`/`runs`;  none named:
  all), then one `yarn install`.  SSH first, HTTPS fallback (`gh auth setup-git`).  Flags:  `--branch <name>`
  (that branch where it exists, else default), `--https`, `--shallow`, `--no-install`.
- `yarn pull` -- `git pull --ff-only` in every cloned child repo.
- `yarn status` -- each child repo's branch, ahead/behind, and up to 12 changed files;  "clean" on one line.
- `yarn repos` -- the list:  a check mark when cloned, what each needs (`spell-app:  spell-lang, spell-brand,
  spell-ui, spell-epic (runs)`).
- (no script) `node tools/repos.ts link-kit` -- just the `node_modules/spell-kit` link.

Checks over EVERY repo (kit first, then each cloned child, lowest first;  every repo runs, summary at the end):
- `yarn ts` -- type check (each builds the declarations the ones above read)
- `yarn test` -- every repo's tests
- `yarn lint` -- every repo's oxlint
- `yarn review` -- every repo's finishing pass

The kit's own checks (`node toolchain/bin/spell-folders.ts <check>` over `"spellFolders"`:  toolchain, util, server,
assembler, element, element/tools):
- `yarn kit:ts` -- declarations (`spell-types`) then every folder's tsc
- `yarn kit:test` -- every folder's Vitest
- `yarn kit:lint` / `kit:lint:fix` -- every folder's oxlint (strict:  warnings fail)
- `yarn kit:format` / `kit:format:check` -- every folder's oxfmt
- `yarn kit:review` -- `kit:ts`, `kit:lint:fix`, `kit:format`, `kit:test`, then "REVIEW PASSED"
- One folder or a few:  `node toolchain/bin/spell-folders.ts test server element`

Tools:
- `yarn server <serve|start|ensure|stop|status|url <file>|prune>` -- the page server CLI on the kit's own checkout
  (no `pageServer` settings here, so plain files only).  The real one day to day is spell-app's
  `spell dev server ...`.
- `yarn favicon [--hat 0.74]` -- regenerate Spell's favicon files from the hat mark.

Bins the kit ships (in every repo's `node_modules/.bin`):
- `spell-types [--below] [--clean]` -- build a package's declarations into `dist-types/` (its type check)
- `spell-folders <check> [folder ...]` -- a several-folder package's checks, folder by folder (kit, spell-lang,
  spell-app)
- `spell-pack build | check [<folder>]` -- a component pack's build, or whether it's current (spell-epic, brand)

Inside a folder (no `package.json` there):  `yarn vp test run`, `yarn vp lint src`, `yarn vp fmt`, `yarn tsc -p .`.

---

## E. Tests

- The kit's tests live in `tests/<folder>/`, NOT beside the code, at the same paths as the code they test:
  `tests/server/src/Router.test.ts` tests `server/src/Router.ts`.  Each tests folder has a `tsconfig.json` giving
  the folder's settings and aliases.  Helpers stay in the code folders (`server/test/`, `element/test-helpers/`).
  ```
  tests/
    util/src/        decorators, dom, string (chromium);  spell/, reactive/, node/ (node)
    toolchain/src/   lint.imports.test.ts (node)
    server/src/      Router, StaticHandler, WebServer, LiveReload, ... page/, site/ (node)
    assembler/src/   Bundle, DataFile, Linker, format (node)
    element/src/     UIComponent, DOMElement, Reactive, ... barrel (chromium, no Spell UI)
    element/tools/   ComponentPack (node)
  ```
- Each folder's `vitest.config.ts` points `test.dir` at its tests folder (`resolve(import.meta.dirname,
  "../tests/<folder>")`):
  - util:  two projects, `browser` (Vitest browser mode + Playwright chromium, headless) and `spell` (node)
  - element:  chromium;  plugins `standardDecorators()` then Solid;  `dedupe` Solid;  setup file
    `test-helpers/TestSettings.ts`;  10s timeout
  - server, assembler, toolchain, element/tools:  node
- Browser tests need Playwright's chromium:  CI runs `yarn playwright install --with-deps chromium`.
- Child repos (same idea):
  - several-folder repos (spell-lang, spell-app):  `tests/<folder>/` (`spell-lang/tests/{parser,markdown,core,py,
    spell,spaces}`, `spell-app/tests/{app,cli,lsp,page-server,spaces}`), run by `spell-folders test`
    (+ pytest where a folder has Python, through uv)
  - flat repos (spell-ui, spell-brand, spell-epic):  `tests/` mirroring the code (`spell-ui/tests/{components,src,
    test-helpers,tools}`);  spell-ui runs two Vitest projects, `ssr` and `browser`
- Tests reach only DOWN:  a higher repo may use a lower one's helpers (`spell-ui/test/setup.ts`,
  `spell-kit/test-helpers/ElementFixture`) and data;  never the reverse.
- How to run:
  - everything:  `yarn test` at the kit root;  the kit only:  `yarn kit:test`
  - one kit folder:  `node toolchain/bin/spell-folders.ts test server`, or `cd server && yarn vp test run`
  - one file:  `cd server && yarn vp test run Router` (Vitest filters by file name;  NOT VERIFIED by running)
  - a child repo:  `cd spell-ui && yarn test`;  one folder of spell-lang:  `cd spell-lang && yarn spell-folders test
    core`
- CI:  `.github/workflows/checks.yml` -- on push to `main`, PRs, or by hand:  checkout, `corepack enable`,
  setup-node 24 (yarn cache), `yarn install` (with `YARN_ENABLE_IMMUTABLE_INSTALLS=false`, since the lockfile lists
  child repos not cloned), Playwright chromium, then `kit:ts`, `kit:lint`, `kit:test`.  No child repo cloned.
  Each child repo's own workflow clones the kit at the same-named branch (else `main`) and its needed repos with
  `yarn clone <repo> --branch <b> --https --shallow`, so a cross-repo change is checked together when every repo's
  branch has the same name.

---

## F. Setup for a Node novice

What the code says you need:
- Node `>=24.11` (`engines`;  CI uses Node 24;  `tools/repos.ts` and the bins rely on node 24 stripping TypeScript
  types).  Install from nodejs.org, or a version manager (`nvm install 24`, `fnm`, Volta).
- Yarn 4.18:  the release is COMMITTED (`.yarn/releases/yarn-4.18.0.cjs`, `yarnPath` in `.yarnrc.yml`), and
  `packageManager: yarn@4.18.0` is set.  So `corepack enable` (ships with Node;  what CI does) is enough;  any
  global `yarn` would also hand off to the committed release.
- git, and a GitHub login:  SSH key, or HTTPS via `gh auth setup-git` (the repos are public;  `yarn clone` falls back
  to HTTPS when SSH is refused).
- For browser tests:  `yarn playwright install chromium` (CI adds `--with-deps` on Linux).
- For spell-lang's and spell-app's Python folders:  `uv` (CI installs it;  `"python"` in their `spellFolders`).

From zero:
```sh
corepack enable                                             # once per machine:  turns on yarn
git clone git@github.com:spell-app/spell-kit.git ~/www/spell
cd ~/www/spell
yarn install                                                # the kit alone
yarn clone                                                  # all five child repos + ONE install
#   or only what you need:  yarn clone spell-ui   /   yarn clone spell-app  (brings spell-lang, spell-brand, spell-ui, spell-epic)
yarn playwright install chromium                            # browser tests
yarn kit:test                                               # check the kit works
yarn repos                                                  # what's cloned
```
Where things end up:
```
~/www/spell/                 the kit (git repo spell-kit):  util/ toolchain/ server/ assembler/ element/ tests/ tools/ agents/
~/www/spell/spell-lang/      each child repo:  its own git repo, git-ignored by the kit
~/www/spell/spell-ui/
~/www/spell/spell-brand/
~/www/spell/spell-epic/
~/www/spell/spell-app/
~/www/spell/node_modules/    the ONE install (node_modules/spell-kit -> .. ;  every spell-* a workspace link)
~/www/spell/dist-types/      built declarations (after yarn ts / kit:ts), git-ignored
~/www/spell/spell.epics/     the content repo (guides, epics, logs):  NOT cloned by anything, "yours", local only
~/www/spell/spell.spaces/    your own spell projects:  a plain folder
~/www/spell.worktrees/<epic>/  an epic's worktree of the kit, child-repo worktrees inside (.epic/config.json5)
```
Could NOT verify (say so, or check before publishing):
1. That a fresh clone + `yarn install` with NO child repos works cleanly:  the lockfile lists all workspaces;  CI
   needs `YARN_ENABLE_IMMUTABLE_INSTALLS=false` for this, so a local first install may rewrite `yarn.lock`.
2. That `corepack enable` alone works on a machine with an older global yarn (not run).
3. Where a newcomer gets `spell.epics`:  README says it's local-only and "Someone new starts without them";  then the
   `agents/*.md` log links dangle, many links in AGENTS/READMEs point into it, and the page server's content folder
   is missing.  The README should say this plainly.
4. The exact one-file test command (Vitest name filter) was not run.
5. Whether `yarn server` at the kit root is useful on its own (no `pageServer` settings in the kit).
6. Standalone child repos (`git clone spell-ui && yarn install`) are explicitly NOT supported yet (root README).

---

## G. Stale or contradictory things (don't copy these)

In the kit's own files:
1. `util/README.md`:  "It imports no other package, and has no runtime dependencies" -- true of the GENERIC files
   only;  `src/spell/` uses lodash, chalk, pluralize, query-string, json5 (node).  It also never mentions `src/spell/`.
2. `util/vitest.config.ts`, `assembler/vitest.config.ts`, `element/vitest.config.ts` docstrings say "the repo root's
   `vitest.config.ts` picks this up as project ..." -- there is NO root `vitest.config.ts`;  `spell-folders test`
   runs each folder's config.
3. `element/src/index.ts` header:  "`tests/spell-element/src/barrel.test.ts` checks it" -- real path
   `tests/element/src/barrel.test.ts`.
4. `element/src/SpellSolid.ts` and `vocabulary.types.ts` cite `packages/ui/...` (old monorepo paths);  real:
   `spell-ui/src/elements/SpellUISettings.ts`, `spell-ui/...`.  Element docs also still call it "spell-element"
   (the folder is `element/`, the alias `$/spell-element` on purpose).
5. `assembler/README.md` files table omits `DataFile.ts` and `contentFolder.ts`.
6. `assembler/src/DataFile.ts` says it writes through "the assembler's `json5Edited()`" -- json5 moved to
   `spell-kit/util/node/json5` (P1).
7. `server/AGENTS.md` lists the engine routes as `/_epic/assets/`, `/_epic/pack/`, `/templates/`, `/_brand/assets/`;
   spell-app's settings also have `/packages/brand/components/__pack/` and `/packages/brand/_assets/`.
8. `server/src/index.ts` header lists "openers (browser, Chrome tab, VS Code)";  `server/AGENTS.md` says VS Code's
   doc preview is spell-epic's own opener.
9. `toolchain/src/packageVersion.ts`:  "The spell family shares one version (`0.8.0`)" -- the kit is `0.0.0`.
10. `server/` has no README.md (the task asks for README-server.md;  AGENTS.md is the only source).
11. Root `README.md`:  "In a worktree of the kit, they're links to the main checkout's" (`spell.epics`,
    `spell.spaces`) -- this worktree has neither link;  so `agents/CODE-DEBT.md` etc. dangle here.
12. Root AGENTS.md says `yarn install` makes the child repos' `agents` links "(`tools/repos.ts links`)" -- true;
    `yarn clone` makes them too.  Consistent;  just note spell-epic gets none on purpose.

In WWOD (`agents/wwod/WWOD.md`):
13. Still written for the old monorepo:  "Touching" table row `packages/<pkg>/AGENTS.md`;  §4 "`$` meaning
    `packages/`";  examples cite `packages/app/src/editor.ts`, `packages/spell/src/SpellProjectRoot.ts`,
    `packages/ui/...`.
14. WWOD points at "root `AGENTS.md` 'Toolchain:  Vite+'" and "'Long-term debt'" -- those sections are in
    `spell-app/AGENTS.md` (lines ~633, ~699), not the kit's root AGENTS.md.
15. `agents/wwod/README.md` "How the rules fit together" says the root AGENTS.md holds "packages, dependency
    direction, worktrees, changelog, toolchain, ledgers" -- the kit's holds the kit/across-repo rules;  changelog and
    toolchain sections are spell-app's.

In the guides (`spell.epics/guides/`), all pre-split:
16. `server.html` ("Checked on main, 2026-10-09"):  package `@spell-app/server` in `packages/server`;  endpoints
    `/_server/ping`, `/_server/page`, `/_server/events`, `/_server/live.js`, `/_server/epics` -- now
    `/api/server`, `/api/pages`, `/api/server/live`, `/api/server/live.js`, `/api/epics/running`;
    `RunningEpics.ts` listed in `server/page` -- now spell-epic's `src/list/runningRoutes.ts`;  worktrees under
    `.claude/worktrees` -- now `../spell.worktrees` (from `.epic/config.json5`);  route list paths
    `packages/epics/...`, `packages/app/src/server/appRoutes.ts` -- now `../spell-epic/src/...`,
    `spaces/src/server/node/routes/appRoutes.ts`;  `/ui` redirect -- now `/components/ui/`.  The flows and safety
    model are still right.
17. `vite-plus.html` ("merged 2026-10-04"):  settings in a root `vite.lint.ts` -- now `spell-kit/toolchain/lint`;
    root scripts via `vp run -F '@spell-app/*'` -- now `spell-folders` and `tools/repos.ts`;  node 22.17+ "before".
    The version catalog and `vp` commands are still right.
18. `shared-content.html`:  content repo `../spell-app-dev` with eight folder links at each checkout's root -- now
    `spell.epics` inside the kit, served by the page server's `serveContent()` with no links (epic `epic-eject`
    P12).
19. `custom-elements/custom-elements.html` ("Checked on branch spell-element, 2026-10-10"):  rebuild command
    `cd packages/docs && yarn tsx tools/bundle-experiment.ts` -- now spell-epic's `src/tools/bundle-experiment.ts`;
    otherwise the best source for the methodology (sections 2-16).
20. `guides/ui/notes/theming.md` / `translation.md` / `plan.md` title the package `@spell-app/ui`;  translation.md
    links `../../spell-element/src/vocabulary.types.ts` -- now `element/src/vocabulary.types.ts` in the kit.
21. `spell-ui/README.md` says `yarn  # install, anywhere in the monorepo` -- install runs at the kit root only.

Useful guide titles for a "Further reading" list (all under `spell.epics/guides/`):
- `server.html` -- Page Server (library, flows, route modules, safety, why;  stale paths, see 16)
- `vite-plus.html` -- Vite+ (how build/test/lint/format run on vite-plus 1.0)
- `custom-elements/custom-elements.html` -- Custom Elements in Spell (two objects per tag, build `<ui-counter>`,
  decorators, lifecycle, events, patterns, hot reload, static render)
- `ui-component-creation.html` -- UI Component Creation (Spell UI's build-out summary, invoker commands, `<ui-root>`)
- `ui-wwod/ui-wwod.html` -- ui and WWOD (components vs DOM elements, reactive members, file names, exceptions)
- `solid/solid-2.html` (Spell on Solid 2, measured;  why spell cells) and `solid/cheatsheet.html` (Solid 2 Cheat Sheet);
  `solid/solid-2.md` is the agents' must-read
- `shared-content.html` -- Shared Content (where docs/epics/logs live;  stale, see 18)
- `wwod.html` -- WWOD:  the agents' house style (hub and spokes, citing, changing a rule, `spell dev wwod check`)
- `dev/commands/commands.{html,md,json5}` -- the map of every `spell` command, skill and yarn script, and the rules
  for adding one
- `ui/notes/` -- Spell UI's plan, theming, translation, icons, fallback, grammar, runtime, status, report
