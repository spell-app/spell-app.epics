# Explore 5:  spell-app, VS Code, the development workflow, agents, and the old deep wiki

Research for epic `readme`, for the writer of:
- `spell-app/README.md`
- `README-development.md`, `README-vscode.md`, `README-agents.md`

Read-only research, 2026-10-21, on the worktree `~/www/spell.worktrees/readme` (the kit, with its child repos inside)
and the content repo `~/www/spell/spell.epics`.

Reminders from the epic page (`epics/readme/readme.plan.html`) that shape everything below:
- The target reader is a developer who knows other frameworks;  agents come second.
- Setup commands must be complete and clear to a Node novice.
- Use expandable sections (`<details>`) for full detail.
- **Don't mention "Owen"** in the READMEs.
  - Many sources quote him by name:  rephrase as "the project" or "the maintainer".
  - `owen@spell` is a real project-group address in code.
    It is hard-coded (`SPACES.LOCAL_PERSON = "owen"`), so it may have to appear as a literal.
    See open question I.3.
- A feature that has been asked for repeatedly gets a stub, even though it isn't built.

---

## A. spell-app today

### A.1 What it is (facts)

- One npm package, `spell-app`, version `0.8.0`, private, MIT.
  - Repo:  `https://github.com/spell-app/spell-app`.
  - `"engines": { "node": ">=24.11" }`, `"packageManager": "yarn@4.18.0"`.
  - Its `package.json` description:  "Spell's editor and its servers:  the app, spaces, the language server, the spell
    CLI, the page server's Spell layer, and the spell language's VS Code extension".
- It is the HIGHEST code repo.
  - It needs spell-lang, spell-brand, spell-ui and the kit (`spell-kit`).
  - It RUNS spell-epic only through its page server's settings (route modules loaded by path), and never imports it.
  - No repo imports spell-app.
- Where it lives:  a child repo of the kit, at `~/www/spell/spell-app/`.
  - It has no `yarn.lock`:  `yarn install` runs at the kit's root only.
- It has five folders, each one TypeScript program, with no `package.json` of its own:
  `app/`, `spaces/`, `lsp/`, `cli/`, `page-server/`.
  - `vscode/` sits beside them:  its own yarn project (own `package.json` and `yarn.lock`), not part of the package.
- `exports` (root `package.json`):

  ```json
  "./app": "./app/src/index.tsx",
  "./spaces/models/projectGroups": "./spaces/src/models/projectGroups.ts",
  "./spaces/server/node/environment": "...",
  "./spaces/server/node/projects/disk-fetch": "...",
  "./lsp": "./lsp/src/index.ts",
  "./cli": "./cli/src/index.ts",
  "./page-server": "./page-server/src/index.ts"
  ```

- `bin`:  `"spell": "cli/bin/spell.mjs"`.
- `"spellFolders"` (what `spell-folders` checks, in this order):  spaces (node, plus Python at `src/server/py`), lsp,
  app (lints `src components tools scripts`), cli, page-server.
- The dependency flow inside the repo (from its README):

  ```text
  cli -> app -> lsp -> spaces -> spell-lang -> spell-kit
  app -> spell-ui -> spell-kit
  page-server -> spell-kit/server       (a route module, loaded by path)
  ```

- Tests live in `tests/<folder>/` at the repo root (`tests/app`, `tests/cli`, `tests/lsp`, `tests/page-server`,
  `tests/spaces`), mirroring the code paths.
- The UI stack is Solid 2 (`2.0.0-rc.13`), on spell-ui, with Monaco as the code editor.
  - React is left ONLY in the CLI's terminal screens (Ink 5, which needs React 18).
- The repo was `oakjs/parser` until 2026-09-30;  the old GitHub URL redirects to `spell-app/spell-app`.
- The existing `spell-app/README.md` (about 120 lines) leads with FizzBuzz, then folders, Getting started, Working in
  the repo, History and License.
  - It's accurate, but pitched as "Spell is a programming language" rather than as the app.
  - The new README should lead with the app's PURPOSE (the brief's wording):
    an AI-assisted live programming environment for non-programmers, out of the black box.

### A.2 The purpose, in the project's own words (for the lede)

From the parked "goals" pages (`spell.epics/goals/spell/*/…md`, drafts) and `spell-lang/spell/thoughts/WhatIsSpell.md`:
- "Spell picks up HyperCard's promise for the web:
  people who don't call themselves programmers can **read**, change and make real software, in plain English."
- The 2017 talk:  a "non-programmer programming environment" where a layperson can write an app, or customize and
  mash up apps.
- AI, decided (motivation D1):  "AI: partner, then teacher".
  - AI writes spell, and reading what it wrote is how people learn to write their own.
  - Spell is how you check and change what the AI made.
  - This is the "out of the black box" angle:  the program the AI wrote is English you can read.
- `WhatIsSpell.md`:
  - "an environment that allows non-programmers to create apps"
  - "a unique combination of drag-and-drop layout and an 'English' programming language"
  - "translated into Javascript ... can run on any device"
  - "open source and will always be free for personal use"
- Lineage worth one line:  HyperCard, SuperCard, Oracle Media Objects, Inform, literate programming, Bret Victor.
- Risks the goals pages name, useful for an honest "what this is not" section:
  - English-like languages have a long graveyard (COBOL, AppleScript).
  - "Just ask the AI" is the competitor.
- The AI page (goals `ai.md`) says:  "No AI features yet" in the app itself.
  - The language server gives parser-driven completion and a "Define `to <phrase>`" quick fix.
  - **So the README must not claim AI features in the editor.**
    AI today = agents build spell, and spell is readable so you can check what an AI wrote.

### A.3 The folders

**`app/`:  the editor web app, the runners, the web components** (alias `$/app`, namespace `UI`)
- `src/editor.ts`:  `EditorStore extends Observable`, ONE instance `editor`.
  - Its banner:  "The editor:  what the app shows -- project root, project, file, selection, notices -- and everything
    it does."
  - Its state is spell cells (`@prop accessor`), so Solid code reading `editor.x` re-runs.
  - Methods:  `showEditor`, `showRunner`, `selectPath`, `createApp`, `duplicateApp`, `renameApp`, `deleteApp`,
    `compileApp`, `restartApp`, `executeCompiledApp`, `compileAppSoon(delay)`, `loadRuntime`, file CRUD, modals
    (`alert`, `confirm`, `prompt`, `choose`), `showNotice`, `showError`.
- `src/pages/`:  the router (`@solidjs/router` 2.0.0-next.35), with routes from `routes.tsx`:
  - `/edit/*address` → `SpellEditorRoute`
  - `/run/*address` → `SpellRunnerRoute`
  - `*` → `ProjectChooser`
  - Also `ProjectSettings.tsx`, `editorHotkeys.ts`, `navigation.ts`.
- `src/solid/`:  the UI.
  - `SpellPage`, `SplitPanel`, `AppRoot`, `InputEditor`, `OutputEditor`, `ConsoleViewer`, `ThingExplorer`,
    `TypeExplorer`, `ProjectDropdown`, `FileDropdown`, modals, `LazyMonaco`
  - `cellsBridge.ts`:  makes Solid follow spell cells
- `src/ui/monaco/`:  Monaco plumbing.
  - The editor's language features call `LSP.SpellLanguageService` IN-PROCESS, in the browser.
  - Loaded lazily (Monaco is about 4.4 MB).
- `src/runner/`:  runs compiled spell, shared by three runners:
  1. the web app
  2. VS Code's "Run Project" webview (`VSCodeRunner`)
  3. the `<spell-app>` element
  - The key files:  `runCompiled.ts`, `spellRuntime.ts` (built to `spell-runtime.js`), `SpellElement.tsx` (drawable
    things as custom elements), `words.ts`.
- `src/spellEditor/`:  `<spell-editor>`'s pane.
- `components/`:  four Spell UI-style web components.
  - `<spell-app>`:  runs a project, a root itself
  - `<spell-editor>`:  Monaco with tabs, feeding `<spell-app>`s what it compiles
  - `<spell-code>`:  subclass of `<ui-code>`, spell syntax colouring
  - `<spell-markdown>`:  subclass of `<ui-markdown>`, drawn by spell-lang's markdown engine
- `docs/`:  "App UI", a component set of docs pages, served at `/components/app/`.
  - One page per component:  `SpellPage.html`, `spell-app.html` …
- `demo/`:  `spell-app.html`, `spell-editor.html`, `drawable-elements.html`, `klondike-layout.html`, served on the dev
  server at `/demo/...`.
- Scripts (all at the repo ROOT, each one `cd app && …`):
  - `yarn start`
  - `yarn build`
  - `yarn build:runner` → `dist-runner/`, for VS Code's Run Project
  - `yarn build:element` → `dist-element/`:  `spell-app.js`, `spell-editor.js`, `spell-code.js`, `spell-markdown.js`,
    `spell-language.js`, and the pack `spell.pack.js`
  - `yarn build:page` → `dist-page/`, the page side of a Python spell app
  - `yarn site:data`, `yarn site:pictures`
- One Solid per page:  `vite.solid.config.ts` builds `spell-solid.js` and `spell-ui.js` first, and the other builds
  share them.
- Embedding on any page:

  ```html
  <script type="module" src="/element/spell-app.js"></script>
  <!-- or, under a <ui-root> -->
  <ui-components source="/element/spell.pack.js"></ui-components>
  ```

**`spaces/`:  where projects and people live, and the servers that serve them** (alias `$/spaces`, namespace
`SPACES`)
- `@spell/`:  the built-in projects, committed.
  - `examples/` is the `@spell/examples` group;  `library/` is `@spell/library`.
- `src/models/` (browser-safe):
  - `projectGroups.ts` (`PROJECT_GROUPS`, `LOCAL_PERSON`)
  - `SpellProjectRoot.ts`:  "A project GROUP's list of projects, e.g. `@spell/examples` … it creates, copies,
    renames and deletes the group's projects"
  - `ProjectFiles.ts` (a project's file CRUD), `spaceNames.ts`, `people.ts`, `SpaceStorage.ts`
- `src/server/node/` (node only, imported by path):
  - `environment.ts`:  where everything is on disk
  - `projects/`:  `project-utils.ts`, and `disk-fetch.ts` (`installDiskFetch()`, the DISK READER the LSP and CLI use)
  - `storage/DiskStorage.ts`, `people/PeopleStore.ts`, `people/peopleRoutes.ts` (`GET/POST /api/people/me`)
  - `routes/`:
    - `api.ts`:  the `/api/...` and `/spaces/...` route tables
    - `appRoutes.ts`:  the page server's route module for the app;  it serves `/api`, `/spaces`, `/element/...` and
      `/editor`, and starts the editor
    - `EditorServer.ts`:  vite as the page server's child
    - `ProjectBuild.ts`:  compiles on demand into `build/`
    - `cli.ts`:  the API alone, on port 3001
- `src/server/py/`:  `spell_quart`, a uv project (Python 3.12+, Quart), which serves a Python-compiled spell program as
  a web app (`spell run <project> --target py`).
- Project groups and their folders:

  | Group | Folder |
  | --- | --- |
  | `@spell/examples`, `@spell/library`, `@spell/guides` | `spell-app/spaces/@spell/<group>/`, committed (`guides` has no folder:  empty) |
  | `@spell/test` | `spell-lang/tests/spaces/@spell/test/`, frozen |
  | `owen@spell` | `~/www/spell/spell.spaces/@spell/owen@/`, outside git |

- Addresses:  `@spell/examples/solitaire`, a file `@spell/examples/solitaire/Card.spell`.
- URLs:
  - read a file:  `/spaces/<address>`
  - save one:  `POST /api/projects/file/<address>`
  - a project's index:  `/api/projects/index/<project>`
  - a group's projects:  `/api/projects/list/<group>`
- Compiled output goes in `build/` at the repo root and is never committed.
  - e.g. `build/spaces/@spell/examples/solitaire/`
  - `<Project>.declarations.json5` and `<Project>.en.js` (words) ARE committed beside the source.
- Env vars:  `SPELL_SPACES_DIR`, `SPELL_BUILTINS_DIR`, `SPELL_TESTS_DIR`, `SPELL_BUILD_DIR`.

**`lsp/`:  the language server** (alias `$/lsp`, namespace `LSP`;  MUST stay browser-safe)
- `SpellLanguageService`:  diagnostics, hover, completion, definition, references, rename, outline, folding,
  formatting.
- `SpellLanguageServer`:  "wires a `SpellDiskWorkspace` + `SpellLanguageService` to an LSP `connection`".
  - One ordered change queue.
  - Diagnostics for every re-parsed file, after a 50 ms delay.
- `SpellDiskWorkspace` (node only):  loads projects from disk through spaces' disk reader.
- `ScopeExplorer`;  `ScopesSource` / `ScopePack`, the scope packs `<Project>.scopes.js` that the Type Explorer reads in
  pages with no parser.
- Scripts:  `yarn lsp:start` (stdio), `yarn lsp:scopes [--compile] <projectId...>`.
- The same service runs in three places:  the browser editor (Monaco), the VS Code extension (over stdio), and the CLI.
  - Wiki-worthy line:  "the command line and the editor can't disagree".

**`cli/`:  the `spell` command** (alias `$/cli`, namespace `CLI`)
- `bin/spell.mjs` registers `tsx`, then runs `src/main.ts`.
  - `spell dev …` and `spell epic …` go to the lean `src/devMain.ts`, which loads no spell, so it starts fast.
- It runs SOURCE (no build step):  "Edit the source, and the next `spell` runs the new code."
- Each command is `src/commands/<name>Command.ts`, with the shape `(session, args, options) => Promise<exitCode>`.
  - `CliSession` owns the workspace, the language service and the explorer.
- Commands:

  | Kind | Commands |
  | --- | --- |
  | language | `compile`, `check`, `describe`, `explore`, `watch`, `run`, `test`, `format`, `parse`, `repl`, `explain`, `speed` |
  | app | `serve`, `new`, `projects` |
  | Spell UI | `icons`, `static` |
  | other | `pony`, `help` |

- `spell dev <noun> <verb>`:  `docs`, `server`, `bundles`, `pack`, `design`, `vscode`, `commands`, `wwod`, plus
  pass-throughs to `epic`.
- Exit codes:  0 fine, 1 errors or failed tests, 2 bad command line.
- Install:  `yarn cli:install`, which links `spell` into the first writable folder on your PATH (`~/.local/bin`, npm's
  global bin, `/usr/local/bin`, `/opt/homebrew/bin`), or `SPELL_BIN_DIR=…`.
- `cli/README.md` (about 250+ lines) has the full command table.
  - Its target syntax:  `@here`, `@spell/library/cards`, `--all`.
- **Planned move (repo-split P13, "CLI to the Kit", todo;  decided 2026-10-21):**
  - the program's base and `spell dev` move to the KIT's `cli/` (`~/www/spell/cli/bin/spell.mjs`, imported as
    `spell-kit/cli`)
  - the language commands go to a new `spell-lang/cli/`
  - spell-app's `cli/` keeps `serve`, `new`, `projects` and `spell dev vscode`
  - spell-ui gets `icons`, `static`, `spell dev pack` and `spell dev design`
  - spell-epic gets `spell dev docs`, and the `epic` command moves to `spell-epic/cli/`
  - Each repo's `package.json` names its list:  `"spell": { "commands": "./cli/commands.ts" }`.
  - The brief also says the tool commands themselves will be renamed soon.
  - **So the README should describe the commands by what they do, and flag their home as moving.**

**`page-server/`:  spell-app's own layer on the kit's generic page server** (alias `$/page-server`, namespace `PS`)
- `pageServerRoutes.ts`:  the route module, listed FIRST in the root `package.json`'s `"pageServer".routes`.
  - It builds the bundles the server serves (`BundleBuild`), which are not committed.
  - It swaps highlight.js for a local copy (`localHighlight()`), so pages load offline.
  - It keeps old-URL bridges.
- Everything else about the page server is SETTINGS in spell-app's root `package.json`, `"pageServer"`:
  - `routes`, which include spell-epic's route modules by path (`../spell-epic/src/tools/detailsRoutes.ts` …) and
    spaces' `appRoutes.ts`
  - `watch`, `writable`, `bundles`, `pageScripts`
  - `componentSets` (ui, epics, app, brand), `siteTabs`, `engineRoutes`
- The generic server is the kit's `spell-kit/server`:
  - one per checkout
  - port 4747 if free (`SPELL_SERVER_PORT` overrides)
  - its state in `.spell-server.json`, its log in `.spell-server.log`
  - live reload on every page

**`vscode/`:  the spell language extension** (see section C)

**Other things at the repo root**
- `scripts/serve.mjs`:  `spell dev server start --all`, i.e. `yarn serve` and the `/spell-serve` skill.
  - It starts the page server, waits for the editor, and checks Spell UI's docs bundle.
  - **It still has `const SPELL = join(ROOT, "packages", "cli", "bin", "spell.mjs")`:  a stale path (see H).**
- `goals.zip`:  the parked saga ("goals") tooling.
- `.epic/config.json5`, `.epic/generators.json5`:  epic settings, and the generated files `epic worktree merge-main`
  rebuilds.
- `.claude/`:  `settings.json` (permissions only, no hooks) and `skills/` (5 skills;  section E).
- `.vscode/`:
  - `extensions.json` recommends `oxc.oxc-vscode` and marks Prettier and ESLint UNWANTED
  - `launch.json`:  "Run Spell Extension" (F5), which opens a new window with `vscode/` loaded on the Solitaire example
  - `tasks.json`:  "Build Spell Extension"
  - `settings.json`
- `agents` → `../agents` (a link made by the kit's `postinstall`).

### A.4 How the editor runs a spell program live (numbered steps for a diagram)

The web app, from a keystroke to a running app:
1. **Open.**
   - The URL `/edit/@spell/examples/solitaire/Card.spell` matches the route `/edit/*address`.
   - `followRoute()` hands the address to `editor.selectPath()`, which loads the project group
     (`SPACES.SpellProjectRoot`), the project (`SP.SpellProject`) and the file.
   - Files are fetched from `/spaces/<address>`.
   - Then `showEditor()` calls `editor.compileApp()`.
2. **Edit.**
   - You type in Monaco.
   - `SpellModels` updates the file, and `editor.onFileEdited()` calls `editor.compileAppSoon(2)`:
     a compile 2 seconds after typing settles.
   - Meanwhile Monaco's diagnostics, hover and completion come from `LSP.SpellLanguageService`, in the same page.
3. **Compile, in the browser.**
   - `editor.compileApp()` calls `project.compile()`, which runs spell-lang's parser and writers in the browser.
   - The parser cuts the text into tokens, matches the rules (Rulex) into `Match` trees, and builds the spell tree.
   - Each target's writer writes its code.
     - `js/solid` is always written, because it's what runs.
     - The others are `ts/solid`, `py` and `ts/lib`, as the project file asks.
   - The output is SAVED through the app's API:  `POST /api/projects/file/<address>` on the page server, which writes
     `<Project>.spell.js` into `build/`.
   - The runtime console shows "Compiling" and the compiled javascript, with line numbers.
4. **Load the runtime.**
   - `editor.loadRuntime()` dynamically imports `spell-runtime.js` once.
     - It's the program's own copy of spell-lang's `core`, never the page's.
   - Parse errors go to its console (`SP.SpellFile.errorConsole`).
5. **Run.**
   - `editor.executeCompiledApp()` calls `runtime.runApp(compiled, { appRoot, keepThings, loadImport })`, which calls
     `runCompiled()`.
   - `runCompiled()` rewrites the program's imports onto URLs:
     - `@spell/core` → the runtime's URL
     - `@spell/project/<id>` → a `blob:` URL per imported project
   - No import map is used.
6. **Keep the game going.**
   - A recompile of the same project carries over its things (`keepThings`, `core.carryOver()`).
     The game in progress survives the edit.
   - It starts afresh when you press Restart (`editor.restartApp()`), when the edit changed the program's start, or
     when a thing can't come over.
7. **Draw.**
   - The program mounts its app with Solid into `appRoot` (`core.mountApp()`).
   - A `drawable thing` draws as its own custom element:  `a card is a drawable thing` becomes `<solitaire-card>`,
     through `SpellElement`, styled by its `<css>` block.
   - Each drawn thing has its own error boundary.
8. **Inspect.**
   - The console shows `print` output.
   - The Thing Explorer reads `core.things` and labels actions in spell's words, from `<Project>.en.js`.
   - The Type Explorer reads the scope pack `<Project>.scopes.js`.

The same pipeline elsewhere:
- **VS Code "Run Project"** (`vscode/src/RunnerPanel.ts`):
  - The language SERVER compiles (`spell/compileProject` → `spell/projectCompiled`).
  - The webview (app's `dist-runner/`) runs it, again on save, and when `<Project>.spell.js` changes on disk.
- **`<spell-app src=…>`:**  loads its OWN runtime copy per element, so apps on one page don't share a core.
- **`spell run`:**  runs under node.
  - A UI project opens in the browser in a `<spell-app>` page that `spell serve`'s little server serves.
  - `--target py` serves a Python web app through `spell_quart`.

Who serves what, at run time (for a diagram):

```text
browser :3000 (vite, the editor)  --proxy /api /spaces /element-->  page server :4747 (spell-kit/server)
                                                                     ├─ spell-app page-server route module (bundles)
                                                                     ├─ spaces appRoutes (API, /spaces, ProjectBuild, starts vite)
                                                                     ├─ spell-epic route modules (review, details, comments …)
                                                                     └─ static:  guides/epics/sagas (content repo), /components/<set>/
```

- `yarn start` = `yarn && yarn workspace spell-kit server stop && cd app && node ../cli/bin/spell.mjs serve --headless`.
- `spell serve [project]` starts it all and opens the editor on the project.
- The editor's URL is in `.spell-server.editor.json`, its log in `.spell-server.editor.log`.
  `SPELL_NO_EDITOR=1` skips it.

### A.5 The example projects that exist

Built-in, `spell-app/spaces/@spell/` (the app's chooser lists them):

| Address | Files | What it shows |
| --- | --- | --- |
| `@spell/examples/fizzbuzz` | `FizzBuzz.spell` | loops, conditionals, `print`;  the README's lede example |
| `@spell/examples/calculator` | `Calculator.spell` | `a calculator is an app`, text properties, methods `to clear (a calculator)`;  its header lists "IDEAS FOR EXTENDING THIS" (NaN check, delete button, keyboard input, a tape of past results) |
| `@spell/examples/todos` | `Todo.spell` | types, yes/no properties, quoted phrases (`a task "is complete" if …`), lists, JSX drawing with event handlers in spell (`onClick={remove it from the tasks of the app}`), `where` filters |
| `@spell/examples/todos-form-based` | `todo.spell` | the same, with a form, a derived `shownTasks`, and `newTaskName` |
| `@spell/examples/solitaire` | `Card`, `Deck`, `Pile`, `Solitaire.spell`, `styles.css`;  also `Card.spell-es` | Klondike solitaire:  enums (`one of clubs, diamonds …`), derived properties, phrases;  `Card.spell-es` is a full Spanish translation that nothing reads yet |
| `@spell/examples/outline-solitaire` | the same four files | the same game in OUTLINE style:  `a "card" is a thing where:` then bullets |
| `@spell/examples/drawable-solitaire` | the same four files | each card its own web component (`a card is a drawable thing:` with a `<css>` block → `<solitaire-card>`);  `pause for 50 msec`, `shuffle the stock`, `a random pile in …`, `<children/>` layout |
| `@spell/examples/solitaire-import` | `Solitaire.spell`, `styles.css` | imports `Card`, `Deck`, `Pile` from another project;  **the CLI guide notes it "deals nothing, in the browser and in the app alike: a known spell runtime problem"** |
| `@spell/library/cards` | `Card`, `Deck`, `Pile.spell` (`version: "1.0.0"`) | a library other projects import |
| `@spell/library/people` | `People.spell` | people, orgs, notes, relationships, saved in readable JSON5 files;  compiled to `people.lib.ts` (`ts/lib` target), which the app's "You" panel and the people store use |

Frozen test projects in `spell-lang/tests/spaces/@spell/test/`, each with snapshots for every target (`.snapshot.js`,
`.tsx`, `.py`, `.declarations.json5`, `tsc` and `pyright` output):
- `card-table`, `cards`, `cards-from-zero`
- `drawable-solitaire`, `fizzbuzz`, `klondike`, `outline-solitaire`, `solitaire`
- `people`, `thing-references`, `todos-form-based`

Personal projects:
- `~/www/spell/spell.spaces/` exists on this machine.
  It holds `@spell/owen@/errors/` (`1.spell`, a project file and generated files), the `owen@spell/errors` project.
- It is NOT in git, and `yarn clone` never makes it:  "Someone new starts without them."

There is no `examples/` folder elsewhere;  `app/demo/*.html` are demo PAGES, not projects.

### A.6 Ideas for new example projects

Each is grounded in what the language does today:
- types, enums, derived properties, phrases
- lists with `where`, `random`, `shuffle`
- `repeat N times`, `pause for`, `prompt`, `choose … from`
- JSX drawing with spell event handlers;  `drawable thing` with `<css>`
- `to test …` tests;  imports from libraries;  the `py` and `ts` targets

The ideas:
1. **Flashcards / quiz**:  a deck of question cards, `a random card in the deck`, `prompt` for the answer, a score.
   - It reuses the card-and-deck idea for learning.
2. **Habit or chore tracker**:  tasks with yes/no done flags, `where` filters ("today's chores"), drawn as a table.
   - It's the `todos` pattern with dates, if dates land (dates are a library gap the goals pages name).
3. **Recipe scaler**:  ingredients with amounts, `to scale (a recipe) to (servings)`, plain math, `print`.
   - Shows numbers and derived properties.
4. **Dice games (Yahtzee, Pig)**:  `a die is a drawable thing` with `<css>`, `pause for` to animate a roll,
   `a random …`, scoring phrases (`a roll "is a full house" if …`).
5. **Memory / concentration**:  cards face up and face down, built on `@spell/library/cards`, a drawable grid.
   - Shows importing a library.
6. **Collection catalog** (from `WhatIsSpell.md`'s list:  movies, baseball cards):  a list of items with enum
   categories, filter buttons, saved per person like the people library.
7. **Classroom or community sign-up sheet**:  people (`@spell/library/people`), a list of slots, a form.
   - A natural first demo for the planned multi-player (shared running program) work.
8. **Text adventure**:  rooms as things, `choose one of … with prompt`, `print`;  runs in the terminal under
   `spell run` and as Python (`--target py`).
   - Shows that one program targets several languages.

---

## B. Planned but NOT built (for stubs)

**B.1 Drag-and-drop development environment**
- From the parked goal "app" (`spell.epics/goals/spell/app/app.md`, a draft):
  - "The editor where people write and run spells, and, soon, build them by dragging things around."
  - Goals for 2027:
    - **G5:  drag-and-drop editing**:  place `ui-*` components, set their properties, attach scripts
    - **G6:  browse, author and script modes**:  HyperCard's levels, as modes
    - **G7:  undo you can trust**:  named snapshots and branches
  - Someday, **G8:  "The editor is a spell"**:  people can change the editor itself.
  - Open question Q3:  "How does dragging map to text?  Does dropping a button write spell, JSX, or a layout file?"
- The drawable-spell saga names it as the endgame:
  "The spell app:  building a program by dragging things around, once things draw themselves."
- Building blocks that exist or are under way:
  - drawable things (merged 2026-10-12):  spell types are real web components
  - `<spell-app>` laid out in HTML
  - the **Property Editor** (epic `property-editor`):  `<ui-property-editor>`, `<ui-property-group>`, `<ui-property>`,
    drawn from a type's description, saved as `.editor.html`
    - **Built P1-P10 on its branch, NOT merged** (guide checked 2026-10-20).
  - future epics `spell-ui-in-spell` (Spell UI's simple components written in spell) and `spellify-components`
    (every Spell UI attribute gets a spell phrase in each language)
- Also in `WhatIsSpell.md`:  "drag-and-drop layout plus an English language" was the pitch from the start.

**B.2 Multi-player editing (CRDT)**
- Saga `shared-spell`:  "Spell edited by several people at once, each copy kept in step."
  - "Nothing is built here yet:  the saga holds one future epic."
- Future epic `crdt`, "Shared Editing (CRDT)" (`spell.epics/epics/crdt/crdt.plan.html`, future, started 2026-10-11).
  - Its summary:  "Several people edit one spell project at once:  each one's typing shows in the others' editors as they
    type, and maybe they share one running program too.
    It would build on the Python target's state-by-id patches for running programs, and on a text CRDT for the
    source, which today's patches can't merge."
  - Its prompt:  "The python-created 'send update bits to elements' could be used as the base of multi-edit spell
    editor."
- **Its four decided questions narrow the scope.  The writer must reconcile this with the brief's "assume CRDT-like
  multi-player development":**
  - Q1:  "People share a RUNNING program, not the source text".
    Several people in one running program (one game, one app), each page mirroring it.
    "The source stays one person's to edit, as today."
    Net:  "shared source editing is out of scope."
  - Q2:  "Explore both:  a CRDT library (Yjs, Loro, Automerge), and growing our own patches."
    The condition:  "As long as CRDT does not imply anything as per how a .spell file or a component is saved."
  - Q3:  "The editor server keeps the shared copy":  no tab-to-tab links, no outside service.
  - Q4:  "One machine or a local network, no accounts":  over the internet would be an epic of its own.
- What it stands on:
  - the Python target's web apps (`spell_quart`) already send a game's state by id when the page opens, then a patch
    after each message
  - future epic `spell-server-state`:  the same for JavaScript programs on a node server
  - People and Orgs left sign-in and sharing for later
- Suggested stub wording:
  - "Multi-player (planned):  everyone on a local network in one running program, kept in step by patches from the
    editor's server.
    Shared editing of the source itself is a later step."
  - Or ask the maintainer (I.1).

**B.3 Drawable spell (mostly BUILT;  the rest planned)**
- Built (drawable-thing, merged 2026-10-12):
  - `a card is a drawable thing` makes a real tag, on the same Solid engine as Spell UI, styled by its `<css>` block
  - attributes kept in step with the thing
  - plain pages can use the tags
  - things named by name or place (`Tableau#T1`)
  - an edit keeps the game in progress
- Planned:  `spell-ui-in-spell` and `spellify-components` (both future epics).

**B.4 Other planned items worth a stub or a line**
- **Mixins** (future epic):  "a card can be drawable, sortable and saved without a new base type for every mix".
- **WebAssembly target** (future epic `output-wasm`):  `spell compile --target wasm`, computation only.
- **Spell Server State** (future):  a JS spell program on a server, mirrored in the page.
- **Translation** (goal page):
  - `Card.spell-es` exists, but no Spanish rules read it
  - "the hard part is grammar, not words"
  - spell-ui has a translation contract designed (localized tags like `<ie-tarjeta color="rojo">`), not built
- **Native app** (goal page):  nothing yet.  The target was a signed Mac app (Tauri or Electron), since "the compiler
  runs in the browser and the server only does file I/O".
- **AI in the app** (goal page):  explain, write, fix, translate.  "No AI features yet."
- **Concept libraries / "thingverse"** (goal page):  libraries like *Bank Account* that extend the vocabulary when you
  import them.
  - Today there's one real library, cards, plus people.
  - Foundations wanted first:  dates and times, money, maps, saving data.
- **CLI items listed under the CLI guide's "Limits"** (not built):
  - `spell lsp`, with the VS Code extension spawning it
  - a single-file bundle that installs without a checkout
  - publishing to npm
- **Standalone repos without the kit:**  "aren't supported yet:  that's once the packages are on npm" (kit README).

---

## C. VS Code

### C.1 The two extensions

| | Spell (language) | Spell Epic |
| --- | --- | --- |
| Name / id | `spell-language` (publisher `spell-app`), display "Spell", v0.8.0 | `spell-epic` (publisher `spell-app`, so `spell-app.spell-epic`), display "Spell Epic", v0.1.0 |
| Source | `spell-app/vscode/` (`src/extension.ts`, `RunnerPanel.ts`, `spellAppRoot.ts`) | `spell-epic/vscode/` (`src/extension.ts`, `DocView.ts`, `DocPreview.ts`, `WindowBridge.ts`, `docUrls.ts`) |
| Activates | `onLanguage:spell` (a window's first `.spell` file) | `onStartupFinished`, `onUri` |
| Build / install | `spell dev vscode` (= root `yarn vscode`):  `yarn build` (esbuild, ALSO runs app's `yarn build:runner`), `yarn package` (`vsce` → `spell-language.vsix`), `yarn install-extension` (`code --install-extension … --force`).  Two steps:  `spell dev vscode build`, then `install`.  Refuses on a branch behind `main` unless `--force`.  Build fails unless its version equals spell-lang's. | Per its README:  `cd spell-epic/vscode && yarn install && yarn package && code --install-extension spell-epic.vsix`.  Also `yarn vscode:package` at spell-epic's root. |
| Its own yarn project | yes, own `yarn.lock`;  the kit's `extraInstalls` installs it in a new epic worktree | yes, the same |

**Spell (language)** contributes:
- the `spell` language for `.spell` files
  - a TextMate grammar (`syntaxes/spell.tmLanguage.json`), with CSS and markdown embedded
  - a CSS-in-template grammar injected into JS and TS files
  - `language-configuration.json`
- semantic token modifiers for markdown in comments (`heading1`-`heading4`, `bold`, `italic`, `link`,
  `strikethrough`)
  - spell comments are markdown:  `#` headings render bold
- commands (category "Spell"), with title-bar icons on `.spell` files:
  - "Show Compiled TypeScript"
  - "Show Compiled JavaScript"
  - "Show Compiled Python"
  - "Run Project" (`$(play)`)
  - "Show Tree for This Line" (context menu)
- settings:
  - `spell.parserRoot`:  which spell-app checkout's language server to run (empty:  the window's own)
  - `spell.compileOnSave`
- `[spell]` defaults to tabs (`editor.insertSpaces: false`).
- The language server is the checkout's own `lsp/src/server.ts`, run by `tsx` with the alias hook.
  - Which checkout (`findSpellApp()`):
    1. `spell.parserRoot`
    2. else the window's folders, the worktree's first
    3. else the checkout it was built in
  - So one install works from main and from every worktree.
    Restart the server to pick up a change.
- Hacking on it:  open spell-app and press F5.
  - "Run Spell Extension" builds `vscode/` and opens a window on `spaces/@spell/examples/solitaire`.
  - Type check:  `yarn check` in `vscode/`.

**Spell Epic** contributes:
- two views in the RIGHT (secondary) side bar:
  - **"Epic Docs"** (`spellEpic.docView`):  docs pages, opened by `epic open` and `/spell-docs`
  - **"Review"** (`spellEpic.reviewView`):  the epic page being reviewed (`/epic review <name>`), plus
    "Review:  Open Epic..." to pick any registered repo's epic
- title-bar buttons on both:  Back, Forward, Reload, Home Page, Restart Page Server, Open in Browser, Inspect, Show
  Console
- setting `spellEpic.docPreview.location`:  `sidebar` (default) or `beside` (Simple Browser);
  review pages always open in Review
- pages are served live by the first of these that answers:
  1. spell-epic's one page server per machine (`epic hub`)
  2. the file's checkout's page server
  3. a small server of the extension's own
- the **window bridge**:  a Claude Code session reaches its own VS Code window, to show a doc, add a folder, or hand
  the session over to a worktree's window.
  - Its registry:  `~/.spell-epic/windows/`.
- Note on names:
  - Older docs call the docs view "Spell Docs" (airplane guide, `docs open --vs`).
    Today it is **"Epic Docs"**.
  - The spell-app `AGENTS.md` says:
    "The Review tab, the Epic Docs view and the window bridge are spell-epic's own extension, not this one."

### C.2 Windows, workspaces and worktrees

- Windows are opened from WINDOW FILES, `<name>.code-workspace`.
  - They live in the content repo's `windows/` folder (`~/www/spell/spell.epics/windows/`), each machine's own and
    git-ignored there.
  - Worktree windows are in `windows/ongoing/`.
  - Where:  `windowsFolder` in `.epic/config.json5` (the kit's:  `"spell.epics/windows"`).
  - On this machine:  `spell.code-workspace`, `spell-app.code-workspace`, per-folder ones (`app`, `cli`, `lsp`,
    `parser`, `ui` …, many from the old layout), and `ongoing/repo-split.code-workspace`,
    `ongoing/epic-engine.code-workspace`.
- Folder order in a window:
  1. the repo root first (with the kit:  `~/www/spell`, folder name `spell`), because the Claude panel lists only the
     sessions saved under a window's FIRST folder
  2. a worktree's window adds `⎇ <name>`
  3. then the content repo, `spell.epics`
  - Example, `ongoing/repo-split.code-workspace`:  folders `spell`, `⎇ repo-split`, `spell.epics`.
    - Its settings set `files.exclude` (hide the main root's files beside `.spell-main`), title-bar colours, and
      `window.title`.
- Commands (`epic window …`;  the old spelling `spell dev window …` still runs):
  - `init`
  - `which`
  - `open <name> [--color <look>]` and `close`
  - `launch <name>`:  a NEW session in a worktree's window
  - `handoff` / `resume`:  move this session at turn end, done by the `Stop` hook
  - `stay <name>` / `stay --end` and `stay-check`
  - `color [<look>]`
  - `show`
  - `reload-view`
  - `add` / `remove` (NEVER for a worktree's folders)
- Looks:  12 hues of Tomorrow Night Blue (red, orange, amber, green, teal, cyan, blue, indigo, purple, pink, brown,
  grey).
  - `/epic color teal`
  - `/epic <name> -teal` or `/isolate <name> -teal` opens a new window in that look
- Rules a README should keep:
  - never `code --add/--remove` (they restart a one-folder window's extensions, the Claude panel included)
  - never `code -r`
  - open window files only through `epic window open`
- Worktrees:
  - An epic's worktree is a worktree of the KIT at `~/www/spell.worktrees/<epic>/`, with a worktree of each child repo
    inside, on the epic's branch, and one `yarn install` (`installOnCreate: true`).
  - Then `extraInstalls`:  `spell-epic/vscode`, `spell-app/vscode`.
  - Made by `/isolate <name>` or `/epic <name>`, through spell-epic's `WorktreeCreate` hook.
  - `git.detectWorktrees` is on, so a worktree shows in Source Control.
  - Leaving:  `/isolate done` (offers a merge and a PR), or `ExitWorktree keep`.
  - Merging main in:  `epic worktree merge-main` (never a bare `git merge main`):  it rebuilds generated files
    (`.epic/generators.json5`) instead of line-merging them.
  - Shelving:  `/park`, `/unpark`, `/wait-for <other>`.
  - Each worktree has its own page server (port 4747 is the main checkout's;  a worktree gets another), and is also
    shown under the main server at `/worktrees/<w>/`.
- Session niceties:
  - a staying session's window is titled `⎇ <name>` and tinted
  - finished sessions get `✅` (`spell dev session done`), one prompt late

### C.3 The side bar tabs, and the review loop (one paragraph's worth for README-vscode)

- **Review tab:**  an epic page with per-item buttons.
  - The buttons:  Approve, Make Todo, Revisit, Add Details Now.
  - A note box on each item:  Make Todo, Later, Do Now.
  - Send (paper plane) and Review Now (wand) in the header.
  - Notes save to the epic's inbox (`<epic>.inbox.json5`) as you type.
  - A listening Claude session acts on the marks.
  - Guides:  `guides/windows-and-review.html`, `guides/plan-docs/plan-docs.html` ("Epic Pages"),
    `guides/epic-components/review.html`.
- **Epic Docs tab:**  any guide or page, live-reloading.
- **Airplane mode:**  everything above works offline against the laptop's page server.
  - `/airplane` before a flight, `/airplane land` after.
  - Guide:  `guides/airplane.html`.
  - It needs the main checkout's page server, and the extension installed from main.

---

## D. Development workflow

### D.1 Day to day (verified from the kit and spell-app `package.json` files and READMEs)

At the kit root, `~/www/spell`:

```sh
yarn install          # once;  the ONE install for every repo (postinstall links each repo's agents/)
yarn clone [repo]     # clone child repos (and what they need), then install;  --branch --https --shallow --no-install
yarn pull             # git pull --ff-only in every child repo
yarn status           # each child repo's branch and changes
yarn repos            # which are cloned, and what each needs
yarn ts | test | lint | review    # the kit's, then every repo's, lowest first
yarn kit:ts | kit:test | kit:lint | kit:lint:fix | kit:format | kit:format:check | kit:review
yarn server           # the kit's page server CLI
node toolchain/bin/spell-folders.ts test server element    # a few kit folders
```

In spell-app, `~/www/spell/spell-app`:

```sh
yarn start            # restart the page server, run `spell serve --headless`:  the editor URL
yarn stop             # stop vite
yarn start:dev        # vite alone (cd app && vp dev)
yarn start:server     # the API alone on :3001 (tsx watch)
yarn build | build:runner | build:element | build:page
yarn ts | test | lint | format | review      # spell-folders over app, spaces, lsp, cli, page-server
yarn spell-folders test spaces               # one folder
yarn vitest --project spaces                 # one vitest project:  spaces, lsp, app:node, app:browser, cli, page-server
yarn test:watch
yarn lsp:start | lsp:scopes
yarn cli:install      # put `spell` on PATH
yarn vscode           # = spell dev vscode:  build + install the extension
yarn serve            # = spell dev server start --all
yarn dev | dev:ts | dev:py    # spell run in the project folder you're in (INIT_CWD)
yarn commands:check   # the commands page vs every command
```

The `spell` CLI, from anywhere:

```sh
spell serve @spell/examples/solitaire
spell compile|check|run|test|watch|explore|describe|format <project>
spell parse "print 1 + 2"
spell repl
spell explain print
spell new my-app
spell projects
spell speed
spell dev server serve|ensure|start --all|stop|status|url
spell dev docs update|index|new|open|link|fuss|offline
spell dev bundles build [--stale] | check
spell dev pack new|element|build|check
spell dev vscode [build|install]
spell dev commands [list|check]
spell dev wwod check
epic --help           # the epic tools (spell-epic's bin)
```

Notes:
- `yarn review` FIXES lint and formatting, so it can change files.
- Toolchain:  Vite+ 1.0 (`vite-plus`, command `vp`).
  - It pins vite, vitest 5.0.1, oxlint, oxfmt and tsgolint together, through the yarn `catalog:` in the kit's
    `.yarnrc.yml`.
  - The lint and format settings come from `spell-kit/toolchain/lint`.
  - No ESLint or Prettier.
- `yarn tsc`, never `npx tsc` (TypeScript 7).
- A change across two repos is two commits and two PRs, the lower repo's first.
  There's no publish and no version bump.
- CI:  every repo's `.github/workflows/checks.yml`.
  - The steps:  `corepack enable`, setup-node 24, `yarn install`, `yarn playwright install --with-deps chromium`,
    then the checks.
  - Child repos clone what they need, at the same-named branch;  uv for Python.
- Logs:  check `agents/PAPERCUTS.md` first when tooling fails mysteriously.

### D.2 Where to hack on what

| To change … | Look in |
| --- | --- |
| how a spell sentence parses or compiles | `spell-lang/spell/src/rules/<area>/` (rules), `spell-lang/parser/` (engine, Rulex);  guides `rulex/`, `spell-syntax/`, `precedence/` |
| what compiled code runs on | `spell-lang/core/` (JS runtime), `spell-lang/py/` (Python twin) |
| output for a language | the writers (`P.JSWriter`, `P.TSWriter`, `PY.PyWriter`, `P.LibraryWriter`);  the target list in `spell-lang/spell/src/targets.ts` |
| the editor's screens | `spell-app/app/src/solid/`, `app/src/pages/` |
| the editor's behaviour | `spell-app/app/src/editor.ts` |
| how programs run in a page | `spell-app/app/src/runner/` (`runCompiled.ts`, `spellRuntime.ts`, `SpellElement.tsx`) |
| `<spell-app>` / `<spell-editor>` / `<spell-code>` / `<spell-markdown>` | `spell-app/app/components/<tag>/`;  build with `yarn build:element`;  demos in `app/demo/` |
| errors, hover, completion | `spell-app/lsp/src/SpellLanguageService.ts` |
| VS Code language features | `spell-app/vscode/src/extension.ts`;  F5 "Run Spell Extension" |
| Run Project in VS Code | `spell-app/vscode/src/RunnerPanel.ts` + `app/src/runner/VSCodeRunner.tsx` |
| projects on disk, addresses, the API | `spell-app/spaces/src/server/node/` (`projects/`, `routes/api.ts`);  `spell-lang/spell/src/SpellUrls.ts`, `SpellLocation.ts` |
| the example projects | `spell-app/spaces/@spell/examples/`, `library/` |
| people and orgs | `spell-app/spaces/@spell/library/people/People.spell`, `spaces/src/server/node/people/` |
| Python web apps | `spell-app/spaces/src/server/py/` (`spell_quart`) |
| a `spell` command | `spell-app/cli/src/commands/<name>Command.ts`, wired in `main.ts`;  `spell dev` in `devProgram.ts` (moving to the kit in P13);  FIRST read `spell.epics/guides/dev/commands/commands.md` and update `commands.json5` |
| the page server itself | `spell-kit` `server/` (generic);  spell-app's layer in `spell-app/page-server/`;  settings in spell-app's root `package.json` `"pageServer"` |
| site tabs, component sets | spell-app `package.json` `"pageServer".siteTabs` / `componentSets` |
| App UI docs pages | `spell-app/app/docs/`, then `yarn site:data` |
| a Spell UI element | `spell-ui/` (its own README) |
| epic pages, review, windows, hooks, skills | `spell-epic/` (its own checks;  `/reload-plugins` for skill text) |
| the docs extension or the Review tab | `spell-epic/vscode/` |
| house style | the kit's `agents/wwod/`, then `spell dev wwod check` |

---

## E. Agents (Claude Code), in the order an agent reads them

1. **`CLAUDE.md`** at the repo root.
   - The kit's:  "Claude Code loads the cross-model `AGENTS.md` … and WWOD here", then `@AGENTS.md`,
     `@agents/wwod/WWOD.md`.
   - spell-app's `CLAUDE.md` does the same, plus Claude-only rules:
     - narrate the steps and bold any drift
     - `/details` for questions that need a picture
     - docs links as `spell dev docs link <page> --hash <id> --show`
     - "Delegated work":  every agent named and listed (`epic agents add/done`)
     - "Tooling requests":  `/send` them to the tooling epic rather than doing them
     - the `*You can close this tab*` closing line
   - Every folder has a two-line `CLAUDE.md` pointing at its `AGENTS.md`.
2. **`AGENTS.md`**, cross-model (Codex reads every one from the root down;  Claude loads the root's plus the folder's).
   - The kit's covers the kit and what's across repos.
   - Each child repo's covers that repo (spell-app's is 719 lines:  folders, imports, worktrees, shared content,
     changelog, commands, spell-epic, Solid 2, toolchain, long-term debt).
   - Each folder's covers what's local to it.
   - A section named like a WWOD rule EXTENDS it ("As WWOD §N, plus:").
   - **A rule lives in exactly ONE place.**
3. **WWOD, "What Would Owen Do?"**:  the house style, the kit's `agents/wwod/`, TRACKED in the kit since repo-split P9.
   - The hub, `WWOD.md`, §1-7:
     1. Working process
     2. General style
     3. Naming
     4. Imports
     5. Errors
     6. Comments & docs
     7. Anti-patterns (Claude habits to drop)
   - Its "Touching → Also read" table sends you to the spoke you need.
   - The spokes:
     - `writing.md` (§6's before / afters)
     - `architecture.md` §8
     - `types.md` §9
     - `server-env.md` §10-11
     - `classes-state.md` §12-16
     - `solid.md` §17
     - `css.md` §18
     - `logging.md` §19
     - `tests.md` §20
   - Plus `README.md` (how the rules fit together, and "Adding a rule").
   - Cite as `WWOD §5 › "Sentinel errors as control flow"`.
   - `spell dev wwod check` resolves every citation and repo path.
   - History:  2026-10-04, epic `wwod`, from rules for another project (`construct-app`, Svelte), translated to Solid 2;
     353 rules sorted.
     The guide says "225 rules … 20 numbered sections".
   - The guide `guides/wwod.html` explains the layout.
     **Parts of it are stale:  it says `agents/` is a link into `../spell-app-dev`.**
4. **Solid 2 rules**, `spell.epics/guides/solid/solid-2.md`:  read IN FULL before any Solid work.
   It's NOT @-imported, so it loads only when needed.
   The `solid-2` skill triggers on Solid work.
5. **The commands guide**, `spell.epics/guides/dev/commands/commands.md`:  read before adding a skill, a `spell`
   command or a yarn script.
   - Layers:  skills keep judgement and dialog, the CLI does every repo action, yarn holds tool-native scripts plus
     aliases.
6. **The three logs**, the kit's `agents/PAPERCUTS.md`, `SUSPECTED-BUGS.md` and `CODE-DEBT.md`.
   - They are LINKS into `spell.epics/agents/`.
     Edit them at the real path (Claude's Edit refuses to write through a file link).
   - Header rules:
     - PAPERCUTS:  "things that slowed down development.  Date · symptom · fix · project";  one section per package;
       "Check here first when tooling fails mysteriously."
     - SUSPECTED-BUGS:  unconfirmed bugs, under their package;  delete when confirmed and fixed or disproven;
       `[V]` = checked by hand;  the entry format is `` - `path/to/file.ts` `symbol()`: what looks wrong, why, and
       how to prove it. ``
     - CODE-DEBT:  "Long-term structural debt -- things we know are wrong, have decided NOT to fix right now".
       It goes there when the problem is structural, too big to fix in passing, AND known and tolerated.
       Not for local cleanups (`REFACTOR:` markers), suspected bugs or papercuts.
       Entry:  `###` heading with **Cost / Cause / Fix / Pinned at**.
7. **Skills.**
   - spell-app's own `.claude/skills/` (5):
     - `design`:  design with Spell's `<ui-*>` elements in Claude Design or VS Code;  `/design push | pull | new | page`
     - `fussbudget`:  rewrite docstrings, comments, READMEs and docs to WWOD §6's writing rules, uncommitted
     - `solid-2`:  Solid 2 rules (its description still names `packages/app/src`, `packages/ui`)
     - `spell-docs`:  open the docs in VS Code's "Epic Docs" view
     - `spell-serve`:  start this checkout's servers and report the ports
   - spell-epic's plugin skills (17):
     - `epic`, `epics`, `details`, `comment`, `docs-check`, `send`
     - `isolate`, `park`, `unpark`, `wait-for`, `worktrees`
     - `session`, `title`, `wtf`, `bg`, `bedtime`, `airplane`
     - On this machine they're also symlinked into `~/.claude/skills/` so `/epic` works bare.
       The links go through the old path `/Users/owen/www/spell-app/spell-epic`, which is now a link to
       `../spell/spell-epic`.
8. **Hooks:**  NONE in spell-app's `.claude/settings.json` (permissions only).
   - All come from the spell-epic plugin's `hooks/hooks.json`:
     - `WorktreeCreate` / `WorktreeRemove` → `worktree.mjs`:  makes the worktree and its branch, installs, links
       session folders
     - `SessionStart` → `behind-main.mjs` (notice), `worktree-guard.mjs`, `server-prune.mjs`
     - `PostToolUse` on `EnterWorktree` → `behind-main.mjs`;  on `ExitWorktree` → `left-worktree.mjs` (closing-line
       reminder)
     - `UserPromptSubmit` → `prompt-gate.mjs`:  renames the session on `/isolate`, `/epic`, `/unpark`;  blocks them in
       plan mode or inside another worktree
     - `Stop` → `handoff.mjs` (moves the session to its new window) and `shared-commit.mjs` (runs `epic shared commit`:
       the content repo is committed after every turn, `auto: …`)
9. **The epic plugin:**  `spell-epic`, a Claude Code plugin.
   - `.claude-plugin/plugin.json`:  `"agents": []`.
   - `.claude-plugin/marketplace.json`:  a marketplace of one, `"source": "."`, loaded in place.
   - Install (from its README):

     ```sh
     claude plugin marketplace add /Users/owen/www/spell/spell-epic --scope user
     claude plugin install spell-epic@spell-epic --scope user
     ln -s "$PWD/bin/epic" ~/.local/bin/epic
     # try without installing:  claude --plugin-dir ~/www/spell/spell-epic
     ```

   - Its `bin/epic` is put on every session's PATH while the plugin is on.
   - The repo's `.epic/config.json5` says where the content folder, worktrees and windows are.
   - **The spell-epic README still says "Not run yet:  these are the steps".**
     The spell-app `AGENTS.md` says it's LIVE since 2026-10-18.
     `~/.claude/settings.json` has `enabledPlugins: { "spell-epic@spell-epic": true }`, with the marketplace at
     `/Users/owen/www/spell-app/spell-epic` (the old path, a link today).

**Claude-specific (vs. any agent):**
- `CLAUDE.md` @-imports
- the skills and the `/slash` workflows
- the plugin and its hooks:  worktrees, window handoff, the turn-end commit
- `EnterWorktree` / `ExitWorktree`, the `AskUserQuestion` modal, `/details` side-bar pages, `/bg` agents
- the VS Code Claude panel's session list, which is why folder 1 of every window is the kit

**Cross-model:**  `AGENTS.md` files, WWOD, the logs, the `spell` / `epic` commands (plain CLIs).
- The epic brief:  "currently claude only, but will be generalized to other agents soon".

Related guides:
- `guides/wwod.html`
- `guides/background-agents.html` (`/bg`:  named, budgeted helpers;  `epic agents`;  redirects from the epic page)
- `guides/airplane.html`
- `guides/details.html`
- `guides/spell-epic/spell-epic.html`

---

## F. The deep wiki (https://deepwiki.com/oakjs/parser)

How it was read:
- The deepwiki.com pages returned HTTP 429, a Vercel bot check.
- So the helper agent read all 33 pages through DeepWiki's public MCP endpoint (`https://mcp.deepwiki.com/mcp`).
- The raw dump was in the old scratchpad, which has since been wiped.
- **The page URLs below follow DeepWiki's pattern and were NOT opened.**
- DeepWiki has no index for `spell-app/spell-app`.

When it was indexed:
- No date is shown.
- It describes the ONE-package `src/` layout from about June to August 2025:
  plain JS/JSX, React, Semantic UI, CodeMirror, Docker.
- That was before the monorepo (2026-09-30) and the TS conversion (2026-09-17).
- It never mentions `packages/` or `@spell/…`.

Pages (titles exact):
1. "Overview":  three layers (a React IDE, a rule-driven parser, generated JS run by `spellCore`).
   - Diagrams:
     - "High-Level System Architecture"
     - **"Spell Language Processing Pipeline"** (Spell source → Tokenizer → `SpellParser.parse()` → rules → Match → AST →
       compile → JS → `spellCore` → browser)
     - "Development Environment Architecture" (Docker :3000/:3001)
     - "Typical Development Process" (Edit → Parse → Compile → Execute → Debug)
2. "Core Parser Framework":  `Parser` and `SpellParser`, the tokenizer, rule caching, the scope hierarchy, the
   `testRules` / `speedTest` helpers.
   - 2.1 "Parser and SpellParser System"
   - 2.2 "Rule System Architecture":  the Rule class tree, the **Rulex DSL** (`{subrule}`, `(a|b)`,
     `[rule,delim]`, `? * +`, `name:`, `…`/`^`), literal consolidation
   - 2.3 "Match Objects and AST Generation":  Match → groups → AST → compile;  `mutateScope()`;  parse errors become
     comments in the output
3. "Spell Language Reference", with the "Natural Language to Code Mapping" diagram
   (`a Card is a Thing` → `class Card extends Thing {}` …).
   - 3.1 "Core Language Constructs"
   - 3.2 "Classes and Type System"
   - 3.3 "Expressions and Assignments" (shunting-yard)
   - 3.4 "Properties, Variables, and Constants"
   - 3.5 "Math and Logic Operations"
   - 3.6 "Lists and Collections"
   - 3.7 "Methods and Dynamic Behavior":  **dynamic method rules**, where `to notify (message)` adds a new rule
   - 3.8 "Control Flow and Conditionals"
   - 3.9 "UI and JSX Integration"
   - 3.10 "Testing and Async Operations"
4. "Project Management System":  roots `@user:projects`, `@system:examples`, `@system:guides`;  manifests;
   `/api/projects/...`.
   - 4.1 "Project Structure and File Types" (a path grammar diagram)
   - 4.2 "File Management and Compilation"
   - 4.3 "Server API Integration" (generic, partly made up, e.g. "Source Maps")
5. "Application Architecture":  the `store` (`createStore`) with `showEditor`, `compileAppSoon` …;  `@reach/router`.
   - 5.1 "Store and State Management"
   - 5.2 "Editor and UI Components"
   - 5.3 "User Actions and Interactions"
   - 5.4 "Compilation and Execution Pipeline"
6. "Utilities and Infrastructure":  `Derivative`, `Observable`, `Loadable`, `Task`, `TaskList`.
   - 6.1 "Observable State and Task Management"
   - 6.2 "File Loading and Network Utilities" (`$fetch`, an error class tree)
   - 6.3 "Development Tools and Configuration" (ESLint and Prettier:  generic)
7. "Developer Guide"
   - 7.1 "Development Environment Setup" (Docker)
   - 7.2 "Extending the Spell Language" (the rule definition and test format)
   - 7.3 "Example Applications and Patterns" (Todo List, Calculator, Solitaire;  partly invented)

**Worth re-creating, with today's names:**
1. the language pipeline diagram (source → tokens → rules/Rulex → Match → spell tree → writers → targets → runtime):
   the one picture of the whole language
2. "Natural language → code" as a real table:  spell line → rule → output for JS, TS and Python, from real compiled
   output (snapshots in `spell-lang/tests/spaces/@spell/test/`)
3. the Rulex cheat sheet as a grammar block;  today's guide is `guides/rulex/rulex.html`
4. scopes:  a root scope with built-in types → project → file → block/method, and how `mutateScope()` lets earlier
   lines teach later ones
5. dynamic phrases:  `to …` and quoted phrases become new rules
6. the address grammar, redone for today's `@spell/examples/solitaire/Card.spell` (the `SpellLocation` docstring has
   the exact breakdown)
7. the rule tests format and `speedTest` (warm-up, then 20 runs), for an "Adding a rule" recipe
8. the app's compile → execute flow, redrawn as in A.4, with `editor` replacing `store`

Mostly spell-lang's README material;  for spell-app, only 7 and 8.

**Stale.  Do not copy:**
- Paths:  `src/parser/…`, `src/languages/spell/…`, `src/languages/rulex/rulex.js`, `src/app/store.js`,
  `src/app/actions.jsx`, `src/util/*.js`, `src/spellCore/…`, `src/examples/Todo List/.output.js`.
  Every file was `.js`/`.jsx`.
- Stack:  React, `@reach/router`, Semantic UI React, CodeMirror, enzyme, ESLint, Prettier.
  Docker:  `Dockerfile.dev`, `docker-compose.yml`, `app-server-dev`, `api-server`, `spell-network`.
  Ports 3000/3001 as Docker services.
- App names:  `store` / `createStore`, `SpellEditor` / `SpellRunner` as React components, `MatchViewer`,
  `UI.Alert` …, `Action`, `PROJECT_DROPDOWN_ACTIONS`.
- Runtime:  `spellCore`, `spellCore.element()`, `REACT_APP_ROOT_ID`, `installStyles()`.
- Utilities:  `Derivative`, `memoized()`, `clearDerived()`, `LoadableFile`, `MissingResourceError` (now
  `NotFoundError`), `AbortedRequestError` (now `CanceledRequestError`).
- Projects:  `@user:projects`, `@system:examples`, `@system:guides`, `.output.js`, `POST /api/projects/create/file`.
- Repo name `"spell-parser"`.
- Made-up content:  "Source Maps", "Auto Completion" (5.2), `tests.spell`, `config.js`, `ProjectCompiler`.

---

## G. Setup for a Node novice

Verified from files:
- Node:  `"engines": { "node": ">=24.11" }` in the kit's and spell-app's `package.json`.
  - There is NO `.nvmrc` or `.node-version`.
  - CI uses `actions/setup-node@v4` with `node-version: 24`.
  - The kit runs `.ts` files with plain `node` (`node tools/repos.ts`, `node toolchain/bin/spell-folders.ts`), so
    it needs a Node with built-in type stripping:  24 has it.
- Yarn:  `"packageManager": "yarn@4.18.0"`.
  - The release is committed at `.yarn/releases/yarn-4.18.0.cjs`, and `yarnPath` in the kit's `.yarnrc.yml` points at
    it.
  - CI runs `corepack enable` first.
  - So for a novice:  install Node 24.11+, run `corepack enable`, and `yarn` then uses the repo's 4.18.0.
- Clone and install (kit README):

  ```sh
  git clone git@github.com:spell-app/spell-kit.git ~/www/spell
  cd ~/www/spell
  yarn install          # the kit's own packages:  no child repos yet
  yarn clone            # every child repo in repos.json5, then ONE install for all of them
  # or only spell-app and what it needs:  yarn clone spell-app   (also clones spell-lang, spell-brand, spell-ui;  runs spell-epic)
  ```

  - `yarn clone` uses SSH, and falls back to HTTPS (`gh auth setup-git`).
  - Flags:  `--branch`, `--https`, `--shallow`, `--no-install`.
  - The repos are public.
- Then:

  ```sh
  cd ~/www/spell/spell-app
  yarn start            # page server (:4747) + editor (vite :3000, or any free port);  prints the editor URL
  yarn cli:install      # `spell` on PATH (~/.local/bin, …;  or SPELL_BIN_DIR=…)
  spell dev vscode      # build + install the VS Code extension
  ```

- Browser tests need Chromium:  `yarn playwright install --with-deps chromium` (CI's step;  playwright 1.63.0).
- Python parts need **uv**.
  - They are `spell_quart` (spaces) and spell-lang's `py`.
  - spell-app's `yarn test` and `yarn lint` run `uv run … pytest` and `ruff` for spaces.
  - I found no skip when uv is missing.
  - `uv` fetches the Python each project pins (3.12+).
- The VS Code extensions' builds use `vsce` (in `vscode/`'s own devDependencies, installed by `yarn install` there)
  and the `code` command on PATH (`code --install-extension`).

Could NOT verify:
1. That `yarn clone` and a full install work on a fresh machine with no `~/www/spell` layout.
   - Paths like `~/www/spell` are a convention.
   - Does anything hard-code `/Users/owen`?  Only settings and docs I saw (spell-app `.claude/settings.json`
     `additionalDirectories`, the plugin marketplace path).
2. Whether `corepack enable` is needed locally:  `yarnPath` should make any yarn 1.x/4.x run 4.18.0.
3. What a newcomer sees for the `owen@spell` group:  its folder (`spell.spaces/@spell/owen@/`) won't exist, and
   `LOCAL_PERSON` is hard-coded `"owen"`.
   - Probably an empty "Projects" group in the chooser, and `me()` writes a starter `__me.json5` from git's name and
     email (PeopleStore).
4. Whether `yarn start` needs spell-epic cloned:  the page server's settings list spell-epic route modules.
   - The AGENTS.md says "A checkout without spell-epic beside it (CI) loads no epic routes".
5. Whether `spell dev vscode` works before `yarn install` in `vscode/`:  the `.vscode/tasks.json` task runs
   `yarn install && yarn build`;  `spell dev vscode` runs `vscodeSteps()` (not read in full).
6. A Windows or Linux story:  nothing seen.  The window tooling is macOS-flavoured (`~/.local/bin`, `/opt/homebrew/bin`).

---

## H. Stale or contradictory things the writer must not copy

- `packages/…` paths (the monorepo layout, before repo-split P8 and P11) are still in:
  - `spell-app/scripts/serve.mjs`:  `join(ROOT, "packages", "cli", "bin", "spell.mjs")`, **likely a live bug**;
    worth a SUSPECTED-BUGS entry
  - its docstring (`packages/ui/docs/`)
  - `.claude/skills/spell-serve/SKILL.md` (`packages/spaces/…`, `packages/ui/…`)
  - `.claude/skills/solid-2/SKILL.md` (`packages/app/src`, `packages/core/src`, `packages/ui`)
  - WWOD.md's own examples (`packages/app/src/editor.ts`, `packages/spell/src/SpellProjectRoot.ts`) and its table row
    "anything inside a package → `packages/<pkg>/AGENTS.md`"
  - `guides/dev/commands/commands.md` (`packages/cli/src/epicProgram.ts`, `packages/epics/tools`, `"node
    packages/cli/bin/spell.mjs dev commands check"`)
  - the spell-epic README (app `start`:  `node packages/cli/bin/spell.mjs dev server ensure`)
  - cli/README "under `packages/`:  `build/spaces/@spell/examples/solitaire`"
  - `projectGroups.ts` docstring (`packages/spaces/@spell/<group>/`)
  - `app/AGENTS.md` links `../epics/AGENTS.md` (gone:  spell-epic's `src/AGENTS.md`)
- `@spell-app/…` scoped names (`@spell-app/ui`, `@spell-app/server`, `@spell-app/markdown`) in guides:
  - `guides/index.html`, `spell-docs.html`, `server.html`
  - Today the names are UNSCOPED:  `spell-ui`, `spell-kit/server`, `spell-lang/markdown`.
- `@spell/…` in code is NOT stale:
  - `@spell/examples/...` addresses
  - `@spell/core` and `@spell/project/<id>` as compiled-code import names
  - `@spell/elements`
  - Don't "fix" these.
- The content repo's old names:
  - `../spell-app-dev`, `spell-app.epics` (now `~/www/spell/spell.epics`)
  - `~/www/spell-app/…` (now `~/www/spell/…`;  the old paths still resolve through links on this machine)
  - Stale in:
    - `guides/shared-content.html` ("eight folder links", `../spell-app-dev`)
    - `guides/wwod.html` (agents/ as a link into `spell-app-dev`)
    - spell-app's `.claude/settings.json` (`/Users/owen/www/spell-app/spell-app.epics`)
    - the spell-epic README's `.epic/config.json5` defaults table (`"../spell-app-dev"`)
- Old CLI spellings in `guides/cli.html` (last updated 2026-10-14) vs the newer `cli/README.md`:
  - targets `@workspace`, `@library/cards`, `@examples` → today `@here`, `@spell/library/cards`, `@spell/examples`
  - output `<Project>.compiled.js` → today `<Project>.spell.js` in `build/`
  - `projects/test/` → `spell-lang/tests/spaces/@spell/test/`
  - `yarn scopes` → `yarn lsp:scopes`
  - `.recent-projects.json` is still current
- The `spell-docs.html` guide is very old:
  - "Every doc lives in `packages/docs`"
  - "show it in Chrome"
  - `../../packages/epics/tools/_assets/spell-ui.js`
  - today's pages load `/_epic/assets/…`
- The `goals/spell/*` pages (2026-10-01) describe the app as React 18 + semantic-ui-react with routes
  `/edit` and `/run` and Express :3001.
  - Now Solid 2 + spell-ui, and the page server's route module.
  - Their Context bullets are stale;  their purpose and Goals are still the best vision text.
- "Spell Docs" (VS Code tab) → "Epic Docs".
  - `spell dev plan-doc`, `spell dev details`, `spell dev window …` are kept old spellings of `epic …`.
- "plan doc" → write "epic page";  "goals" → "sagas" (parked).
- The `AGENTS.md` itself is mid-transition.
  - "Windows" says "With the kit (epic `repo-split` P9), folder 1 becomes the kit":  now true.
  - "Folders beside the checkout" says a worktree's beside-folder is the MAIN checkout's "until … P9":  now each epic
    has a worktree of every repo.
- `$/` aliases are documented at length today, but **repo-split P14 "One Import Name" (todo) removes every `$/`**.
  - Package names everywhere, `#/` subpath imports for deep files.
  - The alias tables, the run-time alias hook and the alias lint rule go.
  - Also `spell-kit/assembler` merges into `spell-kit/server` (`SRV.Linker` …).
  - **Keep `$/` out of the READMEs, or say it's going.**
- CLI homes move in P13 (A.3).
- Card counts in guides ("19 language commands", "14 groups", "50 verbs") will drift;  avoid numbers.

---

## I. Open questions for the maintainer

1. **Multi-player scope.**
   - The brief says "assume CRDT-like functionality for multi-player development".
   - But the `crdt` epic's decided Q1 is "share a RUNNING program, not the source text", with shared source editing out
     of scope.
   - Should the stub promise shared source editing (the ambition), the shared running program (the plan), or both,
     in stages?
2. **Drag-and-drop stub.**
   - Pitch it as "build by dragging Spell UI components onto a page, setting their properties (the property editor),
     and attaching spell scripts", with HyperCard's browse/author/script modes?
   - Or keep it to one line?
3. **`owen@spell` / `LOCAL_PERSON = "owen"`.**
   - The README can't avoid this address if it explains project groups.
   - Show it as-is, call it "your own projects group", or wait for a configurable person?
4. **`spell.spaces` for newcomers.**
   - Should setup tell people to `mkdir ~/www/spell/spell.spaces`, or does the app make what it needs?
5. **Is uv (Python) a required setup step** for everyone working on spell-app, or optional, with the Python tests
   skippable?
6. **CLI placement.**
   - Write spell-app's README for today (`spell-app/cli`), or for after P13 (the kit's `cli/`, language commands in
     spell-lang)?
   - And what are the "renamed tool commands" going to be?
7. **`scripts/serve.mjs`'s `packages/cli/...` path** looks broken.
   - Fix it as a drive-by, or log it in SUSPECTED-BUGS?
   - It also affects how `/spell-serve` is documented.
8. **The spell-epic plugin install:**  its README says "Not run yet", but it's live on this machine.
   - Can README-agents give the `claude plugin marketplace add ~/www/spell/spell-epic` steps as THE way to set it up,
     and drop the `~/.claude/skills` symlink step?
