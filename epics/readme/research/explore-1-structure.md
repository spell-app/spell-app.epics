# Explore 1:  target structure after `repo-split`, and what the unbuilt epics plan

For epic `readme`.  Read-only research, 2026-10-21.
- Worktree:  `/Users/owen/www/spell.worktrees/readme` (the kit, child repos inside).
- Content:  `/Users/owen/www/spell/spell.epics/` (epic pages, guides, sagas, goals).
- `epic list --json` run from the worktree for statuses.
- HTML pages read as stripped text;  item titles pulled from `<epic-item title=...>` attributes.

Key sources (go look):
- `/Users/owen/www/spell.worktrees/readme/README.md`, `AGENTS.md`, `repos.json5`, `package.json`
- `/Users/owen/www/spell/spell.epics/epics/repo-split/repo-split.plan.html` (skeleton)
- `.../repo-split/parts/o1.html` (Structure -- PARTLY STALE, see E), `o2.html` (Where every folder goes, + CLI table)
- `.../repo-split/parts/p-*.html` (phases), `q*.html` (decisions), `t*.html` (todos)
- `.../repo-split/details/imports-cleanup.html` (P14's research page:  `#/` imports, leftovers census)
- `.../repo-split/details/command-names.html` (P13's command naming research), `layout.html` (old, round-3 layout)
- `/Users/owen/www/spell/spell.epics/epics/readme/readme.plan.html` (THIS epic's prompt:  the content brief per repo)

---------------------------------------------------------------------------------------------------------------------

## A. The final repo layout, per repo-split

### A.1 Status of repo-split's phases

Epic `repo-split` is "in progress";  P1-P12 DONE and merged into main (kit + five child repos), P13-P15 TO DO.
(Phase numbers are positional;  ids in `parts/p-<id>.html`.)

| # | Phase | Id | Status | What it did / will do |
| --- | --- | --- | --- | --- |
| P1 | Util Seams | p-util-split | done | util stops reaching into spell;  JSON5 writer moves into util as node-only `util/node/json5` |
| P2 | Spell Code and Markdown | p-ui-plugins | done | Spell UI loses everything spell;  `<ui-code>` stays on highlight.js, `<ui-markdown>` on marked;  `<spell-code>` / `<spell-markdown>` subclasses for spell (built in the app's `components/`, Q19 says spell-lang) |
| P3 | Rename and Seams | p-rename-and-seams | done | `spell-solid` renamed `spell-element`;  its tests stop needing Spell UI;  lint rule `spell/no-cross-package-import` |
| P4 | Server Split | p-server-split | done | generic server stays (with the site header, `defineSite()`);  spell-app-only page layer moves to new `page-server` package;  component sets / engine routes become settings (`"pageServer"` in spell-app's package.json) |
| P5 | Pack Build to UI | p-pack-build-to-ui | done | pack build became a Spell UI tool (later moved to the kit in P10) |
| P6 | Imports and Toolchain | p-imports-and-toolchain | done | cross-repo imports by npm name, `$/` only inside a repo;  exports maps;  the toolchain becomes a package;  lint `spell/no-cross-repo-alias` |
| P7 | The spell Repo | p-meta-root | done | a top repo at `~/www/spell` holding only the glue:  one install, `repos.json5`, `yarn clone / pull / status` |
| P8 | Cut the Repos | p-cut-the-repos | done | `git filter-repo` cut spell-app into repos with history;  content repo -> `~/www/spell/spell.epics`, projects -> `~/www/spell/spell.spaces` |
| P9 | The Kit | p-the-kit | done | top repo becomes `spell-kit`;  spell-util, spell-server, spell-element merged in (histories kept) as `util/ toolchain/ server/ assembler/ element/`;  ONE npm package `spell-kit`;  WWOD tracked in the kit;  spell-ui `notes/` -> `spell.epics/guides/ui/notes/` |
| P10 | Generic Element Tools | p-generic-element-tools | done | generic test helpers -> `element/test-helpers/` (`spell-kit/test-helpers/...`);  generic tools -> `element/tools/` (`spell-kit/element/tools/...`);  `spell-pack build \| check` bin;  Claude Design bundle build -> spell-brand;  brand assets copied to `spell-brand/assets/`, served at `/_brand/assets/` |
| P11 | One Package per Repo | p-one-package-per-repo | done | every repo ONE unscoped package named after it:  `spell-kit`, `spell-lang`, `spell-ui`, `spell-brand`, `spell-epic`, `spell-app`;  new kit bin `spell-folders` |
| P12 | Multi-repo Tooling | p-multi-repo-tooling | done | worktrees at `~/www/spell.worktrees/<epic>/`;  CI per repo (`.github/workflows/checks.yml`);  `yarn clone --branch --https --shallow --no-install`;  extension finds its checkout;  every install links child repos' `agents/` |
| P13 | CLI to the Kit | p-cli-to-the-kit | **TO DO** (3-4h) | `spell` program base + repo tooling move into the kit (`cli/` at kit root);  each repo contributes commands from its own `cli/` |
| P14 | One Import Name | p-one-import-name | **TO DO** (1-2d) | no `$/` anywhere:  package names + `#/` subpath imports;  alias tables, run-time alias hook, `$/` rewrite and alias lint go;  **assembler merges into server's `SRV` namespace** (`spell-kit/assembler`, `AS` go) |
| P15 | Doc Review | p-doc-review | **TO DO** (1h) | text pass;  new guide `guides/repo-split.html`;  every repo's AGENTS.md;  changelog entry |

The epic page's own estimate line:  "34h-43h in all, 4h-5h left (P14 not estimated)".

### A.2 The six repos TODAY (after P12)

Six git repos;  the kit is the root checkout at `~/www/spell`, the five children cloned inside, git-ignored there.
`repos.json5` (lowest first);  every repo `needs` the kit implicitly.

| Repo | npm package | Layout | Folders / entries | Needs (code) | Bins |
| --- | --- | --- | --- | --- | --- |
| spell-kit (`~/www/spell`) | `spell-kit` 0.0.0, private | several folders at root, tests in `tests/<folder>/` | `util/` (`spell-kit/util`, `/util/class`, `/util/node/json5` ...), `toolchain/` (`spell-kit/toolchain/lint`, `/aliases`, `/tsconfig.base.json` ...), `server/` (`spell-kit/server`, `/server/page`, `/server/site` ...), `assembler/` (`spell-kit/assembler`), `element/` (`spell-kit/element`, `/element/tools/*`, `/test-helpers/*`);  plus `tools/repos.ts`, `agents/` (WWOD), `.github/`, `.epic/` | nothing | `spell-folders`, `spell-types` (toolchain/bin), `spell-pack` (element/bin) |
| spell-lang | `spell-lang` 0.8.0 | several folders | `parser/`, `markdown/`, `core/`, `py/` (TS writers + `spell_core` uv project), `spell/`;  entries `spell-lang/parser`, `/markdown`, `/core`, `/py`, `/spell`, `/spell/node/*` | kit | none yet |
| spell-ui | `spell-ui` 0.0.1 (NOT private) | flat | `components/` (`ui-*` families), `src/`, `docs/`, `site/`, `scripts/`, `test-helpers/`, `tests/`, `tools/`;  entries `spell-ui`, `/core`, `/forms`, `/runtime`, `/ui-*`, `/tools/StaticRenderer` ... | kit | none (its `spell-ui-pack` bin went to the kit's `spell-pack`) |
| spell-brand | `spell-brand` 0.0.0 | flat | `components/` (`<brand-*>` pack), `docs/`, `scripts/`, `src/`, `tests/`, `_assets/`, `assets/` (logos, fonts, reference images, copied P10), `vendor/` | spell-ui | none |
| spell-epic | `spell-epic` 0.1.0 | flat | `src/` (engine:  `command/`, `components/`, `server/`, `review/` ...), `skills/`, `hooks/`, `.claude-plugin/`, `templates/`, `vscode/` (its own extension, the Review tab), `bin/epic`, `tests/` | spell-ui (NOT spell-brand since P10) | `epic` |
| spell-app | `spell-app` 0.8.0 | several folders | `app/` (`spell-app/app`), `spaces/`, `lsp/`, `cli/` (`spell-app/cli`), `page-server/`;  `vscode/` is its own yarn project (extension `spell-language`) | spell-lang, spell-brand, spell-ui;  RUNS spell-epic (page server settings, never imports) | `spell` (`cli/bin/spell.mjs`) |

Data folders, not code (dot keeps them out of `"spell-*"` workspaces;  never cloned by `yarn clone`):
- `spell.epics/` -- content repo (local-only git):  epics, guides, sagas, pages, brand pages, goals, window files, the three logs
- `spell.spaces/` -- people's own projects, a plain folder
- `dist-types/` -- kit's built declarations (git-ignored)

Import rules today (kit `AGENTS.md`, "Imports across repos"):
- inside a repo:  `$/` aliases from that repo's `tsconfig.base.json` (`$/parser`, `$/ui/...`, kit's `$/server`)
- across repos:  npm name + exports entry (`spell-kit/util/class`, `spell-ui/core`, `spell-lang/spell`)
- kit folders import each other by entry, not `$/` (J76);  element's alias is still `$/spell-element` (pack key, J72)
- tsc reads other repos' BUILT declarations (`spell-types`, `types` condition -> `dist-types/`);  Vite/Vitest read source;  tsx/node need the run-time alias hook `spell-kit/toolchain/aliases`
- every arrow points DOWN;  `yarn clone <repo>` clones exactly what it needs

Setup today:  `git clone git@github.com:spell-app/spell-kit.git ~/www/spell && cd ~/www/spell && yarn install && yarn clone [repo]`.
- Day to day:  `yarn kit:review`, `yarn pull`, `yarn status`, `yarn repos`, `yarn ts | test | lint | review` (kit first, then every repo lowest first).
- One folder of a several-folder repo:  `node toolchain/bin/spell-folders.ts test server element`, or in spell-lang `yarn spell-folders test core`.
- Standalone child repo (no kit around it) NOT supported until packages are on npm.

### A.3 The FINAL layout (after P13-P14), what changes

- **Same six repos, same six package names.**  No more repos are planned to split or merge.
- **Kit gains `cli/`** (P13, Q42):  sibling of `server/`, `element/`, `util/`.
  - `cli/bin/spell.mjs` starts the program;  `cli/src/` holds it, its help and `spell dev`;  imported as `spell-kit/cli`.
  - `~/.local/bin/spell` will link `~/www/spell/cli/bin/spell.mjs` (today it links `spell-app/cli/bin/spell.mjs`).
- **Each repo gets a `cli/`** with its own commands (Q42:  "CLI tools for the various projects should live in <project>/cli as well"):
  - spell-lang:  new `cli/` -- compile, run, check, parse, repl, format, describe, explore, explain, watch, test, speed
  - spell-app:  `cli/` (as today) -- serve, new, projects, `spell dev vscode`, plus three HOOKS
  - spell-ui:  new `cli/` -- icons, static, pack, design
  - spell-epic:  new `cli/` -- `spell dev docs`;  the `epic` command itself (today `src/command/`) moves there too
  - spell-brand:  no `cli/` until it has a command
  - each repo's `package.json` names its list:  `"spell": { "commands": "./cli/commands.ts" }` (spell-app also `"hooks": "./cli/hooks.ts"`)
- **Kit's `assembler/` folds into `server/`** (P14, Q43):  `SRV.Linker`, `SRV.DataFile`, `SRV.formatHTML`, `Bundle`, `contentFolderOf`;  `spell-kit/assembler` and namespace `AS` disappear (~30 importers).
  - So a README should describe "server" as including the assembler, or say "the assembler (merging into server)".
- **One import name** (P14):  no `$/` anywhere (code, tests, tools, configs, generated files, docs).
  - Every import uses the package name, inside its own repo too (`spell-ui/core` from inside spell-ui).
  - Deep files via package-private `#/` subpath imports, with REAL file extensions:  `#/components/ui-parts/UIParts.css?inline`, `#/util/index.ts`.
  - Each package type-checks its own source via a per-package condition (`"spell-ui-source"` in exports + `customConditions`).
  - Alias tables, run-time alias hook (`spell-kit/toolchain/aliases`), the `$/` rewrite in `spell-types`, and lint rule `spell/no-cross-repo-alias` all go.
  - Pack-module keys (`$/spell-element`, `$/ui/core`) and `@spell-app/...` `Symbol.for` keys become npm names;  every pack rebuilt once.
  - ~4,200 imports change by codemod;  ~6,000 lines of old-layout compat code deleted.
  - The decisions on the details page (`details/imports-cleanup.html`, "six calls") had NO answer file yet:  shape is recommended, not final.
- **Language service moves down** (P13 pick A, recommended, NOT yet picked):  `SpellLanguageService` and the Type Explorer builder (`ScopeExplorer`) from spell-app's `lsp/` into spell-lang;  the language server itself and its disk workspace stay in spell-app.
- **Later, not in repo-split:**  npm publish (T13 reserve the six names;  T18 publishing spell-kit needs a JS build;  T12 a rename pass if Owen gets the bare `spell` name or the `@spell` scope).

Final dependency picture (unchanged by P13/P14):

```
spell-app    -> spell-lang, spell-brand, spell-ui, kit   (runs spell-epic by settings)
spell-epic   -> spell-ui, kit
spell-brand  -> spell-ui, kit
spell-ui     -> kit
spell-lang   -> kit
spell-kit    -> nothing
```

Open caveats a README may want to footnote:
- C12:  spell-lang's TypeScript check of compiled spell checks against spell-app's editor types (looks UP);  the test skips itself when spell-app isn't installed.
- C16:  a partial clone rewrites the kit's `yarn.lock`.
- C5:  a change across N repos is N commits / pushes / CI runs (merge lowest first).
- T28:  CI on GitHub can't go green until the kit's repo-split branch is pushed (spell-kit's GitHub main was the old `spell-hub`).
- T16:  GitHub repo rename `spell-app/spell-hub` -> `spell-kit` is Owen's step.

---------------------------------------------------------------------------------------------------------------------

## B. The CLI(s):  where they live today, where they go

### B.1 Today

| Command | Lives in | Bin path | Linked as |
| --- | --- | --- | --- |
| `spell` | spell-app `cli/` (package entry `spell-app/cli`) | `spell-app/cli/bin/spell.mjs` | `~/.local/bin/spell` -> `/Users/owen/www/spell/spell-app/cli/bin/spell.mjs` |
| `spell dev ...` | same package, `spell-app/cli/src/dev/` (`packBuild.ts`, `packNew.ts`, `wwod.ts`, `passThrough.ts`) + `cli/src/commands/` + lean entry `devMain.ts` | -- | -- |
| `epic` | spell-epic (`src/command/`, `src/tool/`) | `spell-epic/bin/epic` | `~/.local/bin/epic` -> `/Users/owen/www/spell/spell-epic/bin/epic` |
| `spell-folders` | kit `toolchain/bin/spell-folders.ts` | bin of `spell-kit` | runs each folder's check from `"spellFolders"` (kit, spell-lang, spell-app) |
| `spell-types` | kit `toolchain/bin/spell-types.ts` | bin of `spell-kit` | builds declarations into `dist-types/`;  `--below` rebuilds lower repos' when stale |
| `spell-pack` | kit `element/bin/spell-pack.mjs` | bin of `spell-kit` | `spell-pack build \| check` for component packs (brand, epics) |
| `yarn clone / pull / status / repos` | kit `tools/repos.ts` | yarn scripts | -- |

Today's `spell` is two tools in one package (`o2.html`):
- language + app commands:  compile, run, parse, repl, explore, static, watch, format, describe, explain, new, projects, serve, check, speed, icons, pony, test, help (+ hidden old spellings, `epic` hand-off)
- `spell dev` repo tooling:  bundles, commands, design, docs, pack, server, vscode, wwod, + 13 hidden old spellings handed to `epic` (plan-doc, details, window, session, worktree, park ...), parked `goals`
- every command runs inside one `CliSession`;  projects load through spaces' disk reader (`SpellDiskWorkspace`, `resolveProject()`)
- guide:  `/Users/owen/www/spell/spell.epics/guides/cli.html`;  commands map:  `guides/dev/commands/commands.html` (+ `commands.json5`)

### B.2 After P13 (CLI to the Kit) -- planned, picks M1/M2 still OPEN

- Q33 (decided):  the `spell` program's base (arguments, help, finding commands) lives in the kit;  each repo contributes its commands.
  - A command keeps its plain name;  it goes under its repo's name ONLY when two repos want the same word (`spell app check` / `spell lang check`).
- Q42 (decided):  kit `cli/` at the root;  every repo's commands in `<repo>/cli/`.
- M1 (open;  pick A recommended):  where the mixed commands go.

  | Contributor | Commands |
  | --- | --- |
  | spell-lang | parse, repl, explain, format, describe, explore, watch, test, speed, compile, check, run (a disk loader of its own;  works with no app on a file or folder) |
  | spell-app | serve, projects, new, vscode;  hooks:  project lookup (addresses `@spell/library/cards`, `owen@spell`, `@here`, build folder), after-compile / after-check steps (editor pages), "open in a browser" for `run` |
  | spell-ui | icons, static, pack, design |
  | spell-epic | docs (hands to `epic pages`) |
  | the kit | base (args, help, commands + hooks, clash rule), pony, server, bundles, commands, wwod, old spellings handed to epic, the repo-wide checks still to come |

  - Example without spell-app:  `spell compile ./solitaire` works;  `spell compile @spell/examples/solitaire` says "addresses come with spell-app (yarn clone spell-app)".
- M2 (open):  drop `dev` from eight commands:  `spell pack`, `bundles`, `server`, `docs`, `design`, `vscode`, `commands`, `wwod` (e.g. `spell dev pack build` -> `spell pack build`).
  - `spell dev <noun>` keeps working silently (argv splice).
  - `spell dev` keeps only the 13 old epic spellings, parked `goals`, and the planned repo-wide checks (`spell dev check | ts | lint | format | test | review`) -- because `spell check / test / format` are the language's.
  - Pick 1 (recommended):  `spell server start` beside `spell serve` (serve opens the editor;  server manages the page server).
  - Pick 2 (recommended):  `spell docs link <page>` stays, contributed by spell-epic.
- `spell-app/serve.mjs` moves to the kit, fixed (still names old monorepo paths;  I41:  `yarn serve` in spell-app can't start the page server today).
- The readme brief says "we'll be renaming the tool commands themselves soon":  describe commands by function, mark `spell dev ...` spellings as "today's name" and give the planned name beside it.
- `spell-folders`, `spell-types`, `spell-pack`, `epic`:  no move planned in P13 (epic's source moves inside spell-epic to `cli/`, command name unchanged).
- Parked goal (CLI topic, `spell.epics/goals/spell/cli/`):  a bundle and npm release so `spell` runs without a checkout;  `spell lsp`.

---------------------------------------------------------------------------------------------------------------------

## C. Sagas

Ten sagas, `/Users/owen/www/spell/spell.epics/sagas/<id>/<id>.saga.html`, order from `sagas/sagas.json5`.
- There are NO `parts/` folders:  each saga page has two inline sections (done so far;  ideas not done yet).
- Several saga pages are a bit STALE vs `epic list`:  Epic Eject listed "1 phase of 8" (it's done);  Outline Spell "not merged" (P1-P26 merged, P27-P29 todo);  Review Review "7 of 10".
- "Parked goals" = `spell.epics/goals/spell/<topic>/` (ai, app, audience, brand, cli, docs, motivation, native, programmers, spell-ui, syntax, thingverse, translation, web-components);  guide `guides/goals/goals.html`.  Drafts, nothing decided, written before Solid / the split (they say React, `packages/app`).

### C.1 Drawable Spell (`drawable-spell`) -- "A spell type is a web component"
- Done:  drawable-thing (in main 2026-10-12):  "a card is a drawable thing" makes the type a real tag on the same Solid engine as Spell UI, styled by its `<css>` block;  attributes and thing agree;  plain pages use the tags;  `<spell-app>` laid out in HTML with spell inside;  `Tableau#T1` / `tableau T1` naming;  edits keep game state.
- Done:  property-editor (merged 2026-10-20):  `<ui-property-editor>` / `-group` / `<ui-property>`, grown vocabulary, `.editor.html` pages checked by `spell check` and compiled by `spell compile`, rules on spell types.
- Planned:  Spell UI In Spell (future):  Spell UI's simple components written in spell, compiled ahead to TS.
- Planned:  Spellify Components (future):  every Spell UI attribute/value gets a spell phrase per vocabulary language.
- Ideas (parked goals):  web components -- `<spell-app>` / `<spell-editor>` on any page (docs, blogs, teaching);  the spell app -- build a program by dragging things around.

### C.2 Spell Targets (`output-targets`) -- "One compiler, a writer per language, and the spell command line"
- Done:  Output Targets (22 phases):  spell tree as the compiler's middle;  js/solid and ts/solid writers;  TS type-checks clean;  contract tests;  tree diagrammer.
- Done:  Python Target (31 phases):  `spell compile Solitaire --target py` -> idiomatic Python on `spell_core`;  py/asyncio;  lists from 0;  seedable random;  JSON-by-id state + patches;  drawing as web components;  Quart app serving a game per visitor (`spell-quart`).
- Done:  spell CLI Additions (2026-10-01):  scope packs, seven new commands, target prompt, icon search, UI projects in browser, a server.
- Planned:  Output: WebAssembly (future):  `--target wasm`, computation subset, WasmGC, `.wat` -> `.wasm`, FizzBuzz first, grows to Cards.
- Planned:  Spell Server State (future, no saga):  JS/TS program on node mirrored in the page by id.
- Ideas:  CLI shipped as npm bundle + `spell lsp`;  spell as another app's scripting language;  Java / Swift targets (2017 talk).

### C.3 Shared Spell (`shared-spell`) -- "Spell edited by several people at once"
- Done:  nothing yet.
- Planned:  Shared Editing (CRDT) (future):  several people edit one project at once, typing shows live;  decided so far:  share a RUNNING program, not source text (Q1);  explore a CRDT library and growing our own patches (Q2);  editor server keeps the shared copy (Q3);  one machine or LAN, no accounts (Q4).
- Ground it stands on:  Python Target's state-by-id patches;  Spell Server State;  People and Orgs left sign-in / sharing for later.

### C.4 The Spell Language (`spell-language`) -- "How spell reads and what it can say"
- Done:  Precedence and Types (merged 2026-10-05):  precedence table, every match has a datatype, paren-free signatures, typed calls, multi-word members, exclusive lists.
- Done (mostly):  Outline Spell:  types as a heading + bullet list, compiling identically to the sentence style;  OutlineSolitaire;  "Reads as" hover;  P1-P26 merged.  TO DO:  P27 Pile Drawing (placeholders, stacked/fanned CSS layouts, animation), P28 Dragging Cards, P29 Doc Review.
- Done:  Markdown on the parser:  GFM on the generic parser (670/670 spec cases), drawing `ui-*` markup;  serves docstrings and live preview.
- Done:  People and Orgs (18 phases + P19):  every spell thing gets an id and its own readable JSON5 file;  addresses `owen@spell/solitaire//Card.spell`;  Person and Org in spell;  "You" panel.
- Planned:  Mixins (future):  "a card is a drawable, sortable thing".
- Ideas:  Thingverse (standard libraries of everyday ideas);  Translation (Spanish first, then Norwegian, Portuguese;  a Spanish `Card.spell` exists);  AI ("the language AI writes for you, so you can read it").
- Later epics named by People and Orgs (o5):  Spaces (a person's/org's folder of projects, `$settings`);  Sign-in, roles and invites (Better Auth, SQLite);  Sharing (the crdt epic).

### C.5 Spell UI (`spell-ui`)
- Done:  UI Component Creation, UI Import (`<ui-include>`-style elements for HTML/code/markdown + save back), Solid Migration (app off React onto Solid 2 + Spell UI), Spell Element (own custom-element base, attribute store, decorators), WWOD Spell UI (~120k lines restyled), Spell UI Pages (66 docs pages, 1608 live examples, 24 of 25 Fomantic themes), Docs Rework (brand look, search), SEO (`spell static` renders families to plain HTML, works JS-off).
- Left:  ~100 widget gaps (Spell UI Pages gap report);  Linux visual baselines.
- Ideas:  npm release (fresh README, repository field, WebKit fixes, size budget);  Spell UI written in spell (Drawable Spell saga).
- NOTE for the readme epic:  the brief says DROP "Fomantic UI reborn" as the lede;  call it Semantic UI / Fomantic UI in a note.

### C.6 Spell Brand (`spell-brand`)
- Done:  Design System (10 phases):  Claude Design's brand pages rebuilt from Spell UI, `spell-brand` theme, Brand tab with Compare, 11 `<ui-brand-*>` families and `<ui-panel>` (now `<brand-*>` pack in spell-brand).
- Done:  Claude Design (12 phases):  Claude Design / Claude in VS Code build pages from real Spell elements via a design system on claude.ai;  `/design push` / `/design pull`;  the pony.
- Ideas:  logo, illustration, voice guide;  the brand theme everywhere the app draws;  a public website.

### C.7 Docs Site (`docs-site`)
- Done:  Docs workspace (pages on Spell UI, templates, live epic pages);  Unified Server (one page server per checkout, live reload, site header, edit-in-place API);  Shared Content (all content in one shared repo -> now `spell.epics`).
- In progress:  Even & Martin Demo (1 of 3:  "6 min read" chip;  Count Words done, Head Chip + Doc Review todo;  also queued as epic-engine's "Reading Time Chip").
- In progress:  READMEs (this epic).
- Ideas:  docs for people who WRITE spells (nothing yet);  wide layout default;  a public website.

### C.8 Epic Tooling (`epics`)
- Done:  Details Pages, Epic Review, Windows and Review, Epic Pages as Components (`<epic-*>` from a pack), Isolate & Epic Changes, Airplane Mode, Skillz `/bg`, Epic Workflow (standing), Epic Eject (spell-epic its own repo + Claude Code plugin + VS Code extension).
- In progress:  Epic Engine (standing home in spell-epic;  P12 Quiet Worktree Entry active;  Blank Choice Boxes, Reading Time Chip todo);  Review Review (P8 Rewrite The Rest, P9 Planning Review, P10 Doc Review todo);  Feedback (empty).
- Planned:  Epic Goals (future):  goals rebuilt on epic tooling;  parked code in `spell-app/goals.zip`.

### C.9 Dev Tooling (`tooling`)
- Done:  Commands (12 phases):  commands page maps every operation to CLI / skill / yarn under `spell dev <noun> <verb>`;  drift check;  python tools ported to TS.
- Done:  Vite+ (Vite+ 1.0, Node 24;  one `vite-plus` dependency pins vite, vitest, oxlint, oxfmt).
- Ideas:  "the CLI drives everything" roadmap (skills keep judgement, call `spell dev`);  Vite+ cache once inputs are explicit.
- repo-split itself is saga `epics` per `epic list` (odd, but that's the data).

### C.10 Agents (`agents`)
- Done:  WWOD Rules Merge (hub root AGENTS.md + topic spokes;  Svelte -> Solid 2).  WWOD now tracked in the kit at `agents/wwod/`.
- Ideas:  AI topic;  plugin-carried rules (Epic Eject).

---------------------------------------------------------------------------------------------------------------------

## D. Future / unstarted / in-progress epics

| Epic | Status (epic list) | Saga | What it plans (2-4 lines) | Stub-worthy? |
| --- | --- | --- | --- | --- |
| crdt -- Shared Editing | future (4 decided Qs) | shared-spell | Several people edit one spell project at once, typing live in each other's editors;  share the RUNNING program, the editor server keeps the shared copy, LAN/one machine, no accounts at first;  try a CRDT library vs growing the Python-target patches. | **yes** -- the readme brief says "assume CRDT-like functionality for multi-player development" (spell-app README) |
| spellify-components | future (2 open todos) | drawable-spell | Every Spell UI attribute/value gets a spell phrase per vocabulary language ("is disabled", "está deshabilitada");  docs show each member's datatype;  programs read/set components in their own words. | **yes** (spell-ui + spell-lang "how the language system works / vocabularies") |
| spell-ui-in-spell | future (empty) | drawable-spell | Spell UI's simpler components (divider, label, card, then form controls) written in spell, compiled ahead to the TS Spell UI ships;  Spell UI becomes spell's biggest test and readable example source. | yes, one line in spell-ui / spell-lang "coming" |
| output-wasm | future (5 decided Qs) | output-targets | `spell compile --target wasm`:  computation subset (no UI), wasm's own runtime grown per feature, writes `.wat` assembled to `.wasm`, WasmGC values, FizzBuzz first then up to Cards. | **yes** -- the `<human language> => <output targets>` picture in spell-lang |
| mixins | future (empty) | spell-language | "a card is a drawable, sortable thing" -- behaviour from several named sources;  Spell UI elements would compose the same way. | yes (spell-lang language features "coming") |
| spell-server-state | future (empty) | none | JS/TS spell program runs on node;  the page mirrors it by id (whole state then patches), as python-target's Python apps do;  browser tests drive a game by messages. | yes, light (spell-lang targets / spell-app runtime) |
| epic-goals | future (empty) | epics | Rebuild "goals" (a project's master plan as topic pages + agent briefs) on epic tooling;  parked code in `spell-app/goals.zip`, pages read-only in `spell.epics/goals/`. | maybe -- one line in spell-epic ("sagas / goals coming") |
| outline-spell | in progress (P27-P29 todo) | spell-language | Outline syntax is built and merged (P1-P26);  left:  pile drawing (placeholders, stacked/vertical/horizontal/fanned layouts, card animation), dragging cards, doc review.  Guide `guides/outline-spell.html`. | describe as BUILT;  dragging/animation as coming in the Solitaire example |
| even-martin-demo | in progress (1 of 3) | docs-site | "6 min read" chip in every docs page head (230 wpm);  a small demo epic for showing the epic system. | no (tiny);  maybe mention reading-time chip nowhere |
| people-and-orgs | done (18+1 phases) | spell-language | ids for every thing, one readable JSON5 file each, addresses `owen@spell/solitaire//Card.spell`, Person/Org in spell, "You" panel.  Later epics it names (not yet created):  Spaces, Sign-in/roles/invites (Better Auth), Sharing. | describe as built;  Spaces / sign-in / sharing as "coming" in spell-app |
| python-target | done | output-targets | built;  guide `guides/python-target.html`. | describe as built |
| markdown | done | spell-language | built (GFM on parser, 670/670);  guide `guides/markdown/markdown.html`;  `<spell-markdown>` uses it;  marked stays in `<ui-markdown>` (Q21). | describe as built ("markdown as an example" of the parser) |
| drawable-thing | done | drawable-spell | built;  guide `guides/drawable-thing.html`. | describe as built |
| property-editor | done (merged 2026-10-20) | drawable-spell | built;  guide `guides/property-editor.html`. | describe as built |
| unified-server | done | docs-site | built:  the kit's `server/` IS its result;  guide `guides/server.html` (says `$/server`, monorepo -- stale wording). | describe as built |
| docs-workspace | done | docs-site | built:  pages on Spell UI, "plan doc" sessions (now epic pages);  the `packages/docs` workspace it describes is GONE (content lives in `spell.epics`). | describe as built, with the new layout |
| epic-engine | in progress, standing | epics | standing home for engine work in spell-epic. | no |
| review-review | in progress (P8-P10 todo) | epics | marks on the page picked up by Claude;  rewrite the rest, planning review. | no |
| repo-split P13/P14 | in progress | epics | CLI to the kit;  one import name;  assembler into server. | **yes** -- READMEs should be written to the P13/P14 end state or flag it (see F) |

Also from the parked goals, as "aspiration" stubs (readme brief:  "if I've mentioned a feature repeatedly, assume we'll build it and stub it"):
- drag-and-drop building in the spell app (goals `app`, Drawable Spell saga) -- brief explicitly wants it pointed to
- `<spell-app>` / `<spell-editor>` embeddable on any page (goals `web-components`;  the elements exist today in spell-app `app/`)
- translation:  spell in Spanish, Norwegian, Portuguese (goals `translation`)
- Thingverse:  standard libraries of everyday things (goals `thingverse`)
- AI as partner then teacher;  "spell is how you check and change what the AI made" (goals `motivation`, D1) -- the brief's "How this changes the game for a non-programmer using AI"
- HyperCard lineage, "programming for the rest of us", 2017 Future of Programming talk (goals `motivation`;  source text in `spell-lang/spell/thoughts/`)
- npm releases:  spell-ui first (goals `spell-ui`), the CLI as a bundle (goals `cli`)
- public website (Docs Site, Spell Brand sagas)

---------------------------------------------------------------------------------------------------------------------

## E. SUPERSEDED -- a README must NOT say these

Names and layouts:
- `packages/` folder, `packages/<name>/...` paths, "`$` meaning `packages/`" -- no `packages/` anywhere (Q16).
  - NOTE:  WWOD.md itself still says this (§4) and cites `packages/...` paths everywhere (~140 mentions);  don't copy from it.
- "the monorepo", "the spell monorepo", "spell-app monorepo" -- gone since P8.  (Guides index and changelog still say "monorepo".)
- `@spell-app/...` scoped package names (`@spell-app/ui`, `@spell-app/util`, `@spell-app/spell`, `@spell-app/spell-element`, `@spell-app/kit`, `@spell-app/toolchain`, `@spell-app/markdown`) -- all renamed in P9/P11 to unscoped names.
  - Only exception left on purpose:  seven run-time `Symbol.for("@spell-app/...")` keys (J102) -- internal, don't mention.
- `@spell-kit/element`, `@spell-epic`, `$/spell-lang/spell` -- considered and rejected (Q36).
- `spell-solid`, `SpellSolid` -- renamed `spell-element` (P3);  `SpellSolid` class still exists internally (J31), don't feature it.
- `solid-element` -- old fork name;  WWOD says not to call it "the fork".
- Repos `spell-util`, `spell-server`, `spell-element`, `spell-parser` -- spell-util / spell-server / spell-element were merged into the kit (P9) and are archived;  spell-parser was folded into spell-lang (Q20).  "spell-element" survives only as the kit's `element/` folder (`spell-kit/element`) and its pack key `$/spell-element`.
- `spell-hub` -- the old top-repo GitHub name;  it's `spell-kit`.
- "the top repo `spell`, holding ONLY the glue / nothing anyone imports" (Q15) -- replaced by Q31:  the kit holds code.
- "eight code repos", "seven small repos", "ten repos", "nine git repos" -- it's SIX repos.  (o1.html's tables and the epic summary still say eight / seven:  STALE.)
- `~/www/spell-app` as the checkout, `spell-app.worktrees`, `.claude/worktrees` -- worktrees are `~/www/spell.worktrees/<epic>/`;  the kit is `~/www/spell`.
- `spell-app.epics`, `spell-app-dev`, `epics/` link in a checkout -- the content repo is `spell.epics`, inside the kit, git-ignored, local-only.
- `spell-spaces` -- now `spell.spaces`.
- `spell-ui-pack` bin -- now the kit's `spell-pack` (P10).
- Spell UI containing spell's highlighter / `MDEngine` / `md.bundle.js` / `SpellLanguage`, or a "plugin slot" for code languages -- dropped (P2, Q19).
- "marked goes" -- Q21 decided marked STAYS in `<ui-markdown>`.
- Spell UI test helpers as `spell-ui/test/...` for generic helpers -- Fixture, ElementFixture, A11y, Viewport are `spell-kit/test-helpers/...` (Q39).  (spell-ui still exports `spell-ui/test/setup.ts` and `/test/MemberClashes`.)
- `spell-epic` needing spell-brand -- dropped in P10;  it needs only spell-ui.
- The Claude Design bundle built in spell-epic -- moved to spell-brand (`yarn design:bundle | design:check`).
- Brand logos/fonts only in `spell.epics/brand/spell-design-system/assets/` -- spell-brand has its copy in `assets/` (served `/_brand/assets/`).
- `review.yml` CI -- it's `.github/workflows/checks.yml`.
- React / semantic-ui-react / Monaco-on-React for the editor app -- migrated to Solid 2 + Spell UI (Solid Migration).  The parked goals pages still say React.
- `packages/docs` workspace, `yarn plan-doc`, "plan doc" -- say "epic page" (memory rule);  `/plan-doc` is an old spelling.
- "goals" as the name for sagas -- renamed sagas 2026-10-14;  "goals" is the parked master-plan tool (`epic-goals`).
- `spell dev plan-doc ...`, `spell epic ...` -- hidden old spellings;  the tools are `epic ...` verbs.

Things true TODAY but going away soon (P13/P14) -- describe carefully or as "today ... soon":
- `$/` aliases, per-repo `tsconfig.base.json` alias tables, `tsx --import spell-kit/toolchain/aliases`, "Cannot find package '$'" -- all go in P14.
- `spell-kit/assembler`, namespace `AS` -- merge into `spell-kit/server` / `SRV` in P14.
- `spell` living in `spell-app/cli/` -- base moves to kit `cli/` in P13.
- `spell dev pack | bundles | server | docs | design | vscode | commands | wwod` -- planned to lose `dev` (M2, not yet picked).
- `epic` source in `spell-epic/src/command/` -- moves to `spell-epic/cli/` (Q42).
- `<spell-code>` / `<spell-markdown>`:  checked, they live TODAY in `spell-app/app/components/` (beside `spell-app/` and `spell-editor/`), though Q19's text placed them "in spell-lang";  no phase moves them.

Owen-specific wording the readme brief bans:
- Don't mention "Owen" (readme prompt).
- "Fomantic UI reborn" as spell-ui's lede (readme prompt):  demote to a note.

---------------------------------------------------------------------------------------------------------------------

## F. Open questions for the project owner (relevance)

1. Should the READMEs describe the layout as it is TODAY (P12:  `$/` aliases, `assembler/`, `spell` in spell-app) or as it will be after P13/P14 (`#/` imports, assembler in server, kit `cli/`, per-repo `cli/`)?  P14 is estimated 1-2 days and its six calls on `details/imports-cleanup.html` are unanswered.
2. P13's picks M1 (pick A:  twelve language commands to spell-lang, hooks from spell-app) and M2 (drop `dev` from eight commands) are still open:  may the CLI README present pick A + M2 as the plan ("soon:  `spell pack build`") or only today's names?
3. The brief names a "spell-element" README:  confirm that means the kit's `element/` folder (`spell-kit/element`, a `README-element.md` under spell-kit), not a separate repo (the spell-element repo is archived).
4. The brief asks for "server/assembler" docs:  with Q43 merging the assembler into server, one `README-server.md` covering both, or two?
5. Where do `<spell-code>` and `<spell-markdown>` belong in the docs -- spell-lang (per Q19) or spell-app `app/components/` (where P2 built them)?  Is moving them part of any phase?
6. Stub-worthiness:  is Epic Goals worth a "coming" line in spell-epic, and is Spell Server State worth a line in spell-lang (it has no saga)?  Is the "Spaces / sign-in / roles / sharing" trio (People and Orgs o5) planned enough to stub in spell-app?
7. npm:  should READMEs show `npm install spell-ui` style instructions as "coming" (T13 reserves the six names;  only spell-ui is non-private) or say only "use the kit checkout" for now?  And should they hedge for a future rename to `spell` / `@spell/...` (T12)?
8. Saga pages and the guides index / changelog still use stale wording ("monorepo", `@spell-app/ui`, Epic Eject "1 of 8"):  should README links point at those guides as-is, or does a docs-check pass (repo-split T20 / P15) land first?

---------------------------------------------------------------------------------------------------------------------

## G. Extra notes for the writer

- READMEs that exist today (20):  kit `README.md`, `util/README.md`, `assembler/README.md`, `element/README.md`, `agents/wwod/README.md`;  spell-lang `README.md` (30 lines);  spell-ui `README.md`, `docs/`, `site/`, `tools/`;  spell-brand;  spell-epic (420 lines), `src/README.md`, `vscode/README.md`;  spell-app `README.md`, `cli/README.md`, `cli/templates/README.md`.
  - The kit's `server/` and `toolchain/` have NO README (only AGENTS.md).
- The readme epic's brief (`spell.epics/epics/readme/readme.plan.html`) wants:  a project-level `/README.md` per repo linking `/README-<folder>.md` per major sub-folder;  dense cross-links;  pictures;  `expands` for details;  setup commands clear to a node novice;  targets developers (assume React knowledge), then agents;  spell-kit as the root for working on anything.
- It also mentions a "deep wiki" at https://deepwiki.com/oakjs/parser (not read here).
- Guides worth linking (content repo, `spell.epics/guides/`):  `cli.html`, `server.html`, `custom-elements/custom-elements.html`, `spell-ui-site.html`, `spell-ui-pages.html`, `seo/seo.html`, `solid/solid-2.html`, `targets/targets.html`, `python-target.html`, `markdown/markdown.html`, `rulex/rulex.html`, `spell-syntax/spell-syntax.html`, `outline-spell.html`, `precedence/precedence.html`, `people-and-orgs.html`, `drawable-thing.html`, `property-editor.html`, `design-system/design-system.html`, `claude-design/claude-design.html`, `spell-epic/spell-epic.html`, `plan-docs/plan-docs.html` (epic pages), `epic-components/*.html`, `wwod.html`, `vite-plus.html`, `dev/commands/commands.html`, `shared-content.html`, `changelog.html`.
  - The content repo is LOCAL ONLY (not on GitHub):  a public README can't link into it;  someone new starts without it (kit README says so).
- No `guides/repo-split.html` exists yet (P15 writes it);  the changelog has no repo-split entry yet.
- Example projects live in spell-app `spaces/` (e.g. `spaces/@spell/examples/fizzbuzz/FizzBuzz.spell`, Solitaire, OutlineSolitaire);  addresses like `@spell/examples/solitaire`, `owen@spell` (the latter is a person's space -- avoid "owen" in public text).
- Tests:  kit `tests/<folder>/`;  several-folder repos `tests/<folder>/`;  flat repos `tests/` mirroring code;  generic helpers `spell-kit/test-helpers/...`;  higher repos may use lower repos' helpers (spell-app/spell-brand run `spell-ui/test/setup.ts`), never the reverse.  Python tests:  spell-lang `py/core` (uv, pytest, ruff, pyright) and spell-app `spaces/src/server/py`.
- CI:  every repo `.github/workflows/checks.yml`;  kit runs `kit:ts`, `kit:lint`, `kit:test`;  child repos clone the kit at the same branch name (else main), then `yarn clone <needs> --branch --https --shallow`.  Repos are public on GitHub under `spell-app/` (no token needed).
- Latest test counts (P11 Done):  kit 564, spell-lang 2,602 + 375 pytest, spell-ui 5,365, spell-brand 136, spell-epic 1,521, spell-app 887 + 5 pytest.
