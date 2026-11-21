// What each TLDR item changes for someone working on Spell, or writing Spell programs, by its key:
// 2-5 bullets under "Changes to Spell development", after the row's description.
// - A bullet starting "Removes a limit:" or "Adds a limit:" calls out a limit the item takes away or brings.
// - `backticks` become code.
// - The facts come from the research notes (../*.md) and the pages each item links.
module.exports = {
  ////////////////
  // ## Decided, this epic
  ////////////////

  upgrade: [
    "Every Solid pin in the kit's `package.json` and the folder manifests moves from `2.0.0-rc.21` / `-next` to 2.0.x final, still exact;  the lockfile and the epics pack and docs bundle are rebuilt.",
    "`ShadowEvents` (the shadow-root click fix) is redone:  it reads Solid's insides, which moved, and breaks on 2.0.3.",
    "The Solid 2 rules, guide and cheatsheet are rewritten for 2.0.3;  their \"re-measure on every RC bump\" chore goes.",
    "Adds a limit:  the new ref rule throws only in development builds, so a ref mistake shows only on a page opened in dev mode.",
    "Removes a limit:  no more test-release pins, so a Solid 2.0 app can share Spell's Solid once Spell UI's peer is a range."
  ],
  allway: [
    "Tests and agents can assert a page has no Solid warnings, or stays within a re-run budget (`@solidjs/diagnostics`:  `toHaveNoDiagnostics`, `toStayWithinRerunBudget`).",
    "An agent can ask the running editor why a drawing re-ran, through the dev server's `/__solid/diagnostics` endpoint.",
    "A written comparison of `spell/element` against `@solidjs/element` 2.0.1 says which of our 11 fixes still matter.",
    "Adds a limit:  a Solid warning on a page becomes a failing test, not a console line."
  ],
  engineb: [
    "Each tracker (today's cell, in `spell/util/reactive`) holds a Solid signal of its own;  `bridgeSolid()` and its `enableExternalSource` hook go.",
    "The compiler warns when a drawing changes something it just read:  the guard, about 60 lines, against a drawing that re-runs forever.",
    "Drawing is 1.5-2.2x quicker at about half the memory per drawn value;  programs see no difference (`set x to 1` then `print x` still prints 1).",
    "Removes a limit:  Spell no longer rests on Solid's internals, so a Solid update stops being the one risky step for the bridge.",
    "Adds a limit:  two loops the guard can't fully stop -- an effect that changes what it watches, and two worked-out values feeding each other."
  ],
  actions: [
    "A Spell action compiles to a generator instead of an async function, run inside Solid 2's `action(function* ...)`:  the compiler, the `ActionQueue` and the debugger all change.",
    "One build for running and debugging:  stepping stops at a `yield`, so the second, every-line-awaits debug build goes.",
    "Cancel becomes the generator's `return()`:  exact, and its `finally`s run, instead of a throw at the next wait.",
    "Removes a limit:  no half-dealt board on screen;  an action's writes land as one transition.",
    "Adds a limit:  every core method an action awaits must be yieldable;  a getter that waits stays as it is."
  ],
  waitshow: [
    "The compiler marks where an action first waits:  writes before it show at once, what follows lands together at the action's end.",
    "No new Spell words;  a program still reads its own changes at once either way.",
    "The Solid 2 rules and the language docs get one sentence on when a change appears.",
    "Removes a limit:  \"clear the box, close the menu\" keeps working once actions hold the screen, the case that broke ReactiveScript's testers."
  ],
  nestedjson: [
    "A list or object a program changes in place tells its readers, through a proxy on trackers:  no more setting a new list to change one row.",
    "Compiled code and the core read nested values through that proxy:  about 2.5x a plain read.",
    "Removes a limit:  a program no longer copies a whole list to change one row.",
    "Adds a limit:  every nested value is behind a proxy, so `===` against an unwrapped copy, and debugging, see the proxy."
  ],
  installable: [
    "A `LICENSE` file at the kit's root (MIT, with the Fomantic notice), so GitHub and npm show a licence.",
    "Spell UI's published Solid peers become `^2.0.3`;  the kit's own pins stay exact.",
    "Removes a limit:  a Solid 2.0 app can install `spell-ui` without a version conflict or a second Solid."
  ],
  uiengine: [
    "Spell UI's `@state` / `@derived` members (456 and 205 uses, in `Reactive`) move onto trackers, in an epic of its own.",
    "`@derived` stops being a separate self-tracking cache;  the \"Two reactive engines\" code-debt entry closes.",
    "`Cell` (a Solid signal as one object, 24 uses) folds away with it.",
    "Removes a limit:  a component and a program see each other's worked-out values;  today the two engines can't."
  ],
  perfrun: [
    "A new kit command, `spell perf run` (report:  `spell perf report`), replaces the research folder's 45-55 minute browser script, on an emulated phone.",
    "The commands page (`commands.json5`) gains its rows in the same change, and `spell commands check` stays clean.",
    "Its results are kept with the code, as the speed test's baselines are, so a slowdown shows as a diff."
  ],
  budgets: [
    "Each bundle gets a brotli budget (the editor's first screen 400 KB, a docs page 250 KB, a cloud app 150 KB, a warm visit 10 KB ...).",
    "The check fails the moment a bundle passes its budget, from now on.",
    "Adds a limit:  most bundles are over budget today, so the check fails until the speed items below land, and a new dependency has to fit."
  ],

  ////////////////
  // ## Quick wins
  ////////////////

  compress: [
    "The build writes a brotli copy beside each built file;  the page server, the cloud and the house network's Caddy site serve it, and gzip the rest on the fly.",
    "Bundle sizes are read as brotli on the wire from now on, the budgets' unit.",
    "Nothing changes in code you write;  the editor's first screen drops from about 5.7 MB to 1.2 MB over the wire."
  ],
  cache: [
    "The servers send a year-long cache header for files with a hash in their name, and a \"not modified\" check for pages and fixed names.",
    "Worktrees keep \"never store\", so development never serves a stale file.",
    "Adds a limit:  a built file without a hash in its name is never cached for long;  a new built file needs one to benefit."
  ],
  livereload: [
    "The live-reload client (`LiveReload`, in `spell/server`) drops messages for files the page doesn't use before it looks at the page, and keeps its script list instead of scanning about 400 scripts a message.",
    "Optionally the page server sends each page only the files it shows.",
    "Editor phone numbers measured after it are honest:  today 62% of the editor's phone load is this client."
  ],
  noupload: [
    "The compile 2 seconds after typing stops skips saving (the option already exists);  built files are written on Save, or by the server.",
    "About 5 round trips less per edit;  offline editing is unchanged.",
    "Adds a limit:  between saves, what's on disk is the last saved build, not the last typed one."
  ],
  pywrites: [
    "`send()` in `places.py` puts a change on a queue per place;  a task sends it with `asyncio.to_thread()`, as reads already do.",
    "Python's core stays standard library only:  `urllib` in a thread, no `httpx` or `aiohttp`.",
    "Removes a limit:  under Quart one visitor's save no longer stalls every other visitor's game."
  ],
  a11y: [
    "Markup fixes in the app:  the Code toggle's and Notices button's ARIA, the mode tabs' tab list, the code pane's name and focus ring, 24 contrast failures, duplicate landmarks.",
    "A new app test runs axe over the editor;  today none of the app's tests do.",
    "Adds a limit:  an editor change that breaks accessibility fails a test, as it already does in Spell UI's examples."
  ],
  cssls: [
    "The CSS language service becomes a lazy import, loaded on the first CSS edit or in a worker.",
    "The editor's start loses 180 KB brotli and 1.25 MB of script to parse.",
    "Adds a limit:  the first CSS hover or suggestion waits a moment."
  ],
  idlewrites: [
    "At idle, places send every place's waiting writes from the last visit, not only when that place is next used.",
    "A test confirms the bug first:  today an offline write waits until a later visit reads that place.",
    "Removes a limit:  pages that load lazily can't strand a write in a place whose code never loads."
  ],
  builtstrip: [
    "A compile option leaves comments and source positions out of built programs;  the editor keeps its full file.",
    "Public Servers' build drops from 30.5 to 18.9 KB gzip, measured.",
    "Adds a limit:  a built site's errors point at compiled lines, not `.spell` lines."
  ],
  yield: [
    "The compile, already a task per file, calls `scheduler.yield()` between files.",
    "Nothing moves to a worker, and no data is copied.",
    "Removes a limit:  typing never waits on a whole compile;  later a newer edit can end the old compile."
  ],
  stylereads: [
    "The panel's scroll shading reads computed styles once, or watches with an observer, instead of reading every child's on each refresh.",
    "One component changes;  3.5 s of the editor's phone load goes."
  ],
  leaks: [
    "A heap snapshot finds what holds the dropdown's 30 kB, 5 nodes and 7 listeners per open and close, and the 26-42 kB each key keeps.",
    "Bug fixes in the dropdown and, probably, undo history and compiles;  a test can pin each fix."
  ],
  grammar1: [
    "The editor, code and layout element builds share one grammar piece instead of three copies (791 KB brotli in all).",
    "Rule tests move out of the grammar's shipped files into their own.",
    "Adds a limit:  a rule's tests can't sit in the file that ships it any more."
  ],

  ////////////////
  // ## Speed and memory
  ////////////////

  css400: [
    "Spell UI's base sheets lose the `:root` rules every shadow root adopts and can't use (the 163 KB sheet with 874 custom properties, and three more).",
    "Tokens move onto the page once:  custom properties inherit into shadow roots.",
    "The visual tests show any style that moved;  expect snapshot updates.",
    "Adds a limit:  a token set only inside a shadow root no longer reaches the page, and whether page animations reach inside is checked per browser."
  ],
  splitdocs: [
    "The docs bundle and the epics pack load each Spell UI family on first use, as the Spell UI site does, instead of one 873 KB classic script.",
    "One way of loading families everywhere, not two.",
    "Adds a limit:  docs and epic pages must be served;  opening one from disk stops working (pages are always served now)."
  ],
  runleak: [
    "A heap snapshot after 100 edits confirms the leak first.",
    "The runner runs a program in an iframe re-made every few runs, or evaluates it as a function the browser can free, instead of importing it from a new `blob:` address each compile.",
    "Live edit and carry-over must behave exactly as now across the new iframe;  their tests cover it.",
    "Removes a limit:  an hour of editing no longer costs tens to hundreds of MB that never come back."
  ],
  spanish: [
    "The Spanish dictionaries (71 KB) and the grammar's Spanish half (about 120 KB) load on first use.",
    "A lazy path per language, the way a third language would load too.",
    "Adds a limit:  switching a project to Spanish waits on one fetch."
  ],
  dsd: [
    "The element base (`DOMElement.renderRoot`) keeps a shadow root the server drew instead of emptying it and drawing again.",
    "Each server-drawn root links the shared sheet instead of inlining about 147 KB of CSS.",
    "Every element's first render changes:  high risk, so expect a phase of tests.",
    "Removes a limit:  pages paint before any script, and `spell ssr` output keeps its shadow roots."
  ],
  pieces: [
    "Each dialog gets a piece of its own (about 400 KB less on the first), the editor's routes go lazy and preload on hover.",
    "`lodash-es` imports become tree-shakable (about 45 KB less in a cloud app);  an icon sprite per app;  the help and defaults tables load on first hover.",
    "More pieces to name in the build, each small."
  ],
  http2: [
    "The page server and the cloud speak HTTP/2, so 85 first-load files stop sharing 6 connections.",
    "Adds a limit:  HTTP/2 needs TLS, so local development needs certificates.",
    "Removes a limit:  server-sent events stop being held back by the 6-connection limit."
  ],
  signin: [
    "At start, places restore only the first sign-in place;  the others restore, with their OAuth library, on first use.",
    "Adds a limit:  a second account's first use waits a moment."
  ],
  forget: [
    "The editor keeps a project's text but drops its parse, scope and editor state once it's not shown for a while (the last 2-3 kept).",
    "Coming back parses again;  the compile cache makes the run instant.",
    "Removes a limit:  memory no longer grows with every example visited."
  ],
  bound: [
    "Rows a place read are held only while something reads them (today:  forever).",
    "The console becomes a capped ring appended in place, instead of copying itself on every line.",
    "Adds a limit:  old console lines fall off the end, and a row nothing reads is fetched again."
  ],
  perpause: [
    "Each compile writes only the files that changed and fetches only changed imports.",
    "The program's dump to two consoles goes, and the bubbly look is laid out only where the file changed.",
    "Removes a limit:  a pause costs less as a project grows."
  ],
  timepipe: [
    "The parser's speed test (`SP.spellParser.speedTest()`, `spell speedtest`) grows from rule tests alone to a whole project's parse, an edit, a compile, a run and startup.",
    "Built from the incremental tests, which already make the right edits;  its numbers feed `spell perf run`."
  ],
  leafroots: [
    "Leaf elements (`<ui-icon>`, `<ui-action>`, `<ui-text>`:  179, 149 and 112 in the editor) draw without a shadow root.",
    "Each root installs only the event kinds it uses, instead of 14.",
    "Adds a limit:  two kinds of element to style, so `::part()` and shadow-only styles don't apply to the light ones."
  ],
  sharesheets: [
    "`<ui-stack>` and the other layout elements share their sheets by value, not one per instance.",
    "CSS text is kept only in development, for hot reload.",
    "A CSS coverage run says how much of each family a page uses (70-85% unused, estimated)."
  ],
  editdelta: [
    "The editor hands the parser CodeMirror's changed ranges instead of flattening the file to a string 2-3 times a key.",
    "The parser's own text diff goes;  the incremental tests cover the new input.",
    "Removes a limit:  key cost stops growing with file size."
  ],
  servercompile: [
    "Cloud apps get compiled code and the runtime only;  the compiler (391 KB brotli) leaves the cloud bundle.",
    "Run mode gets a runner of its own instead of the whole editor (306 scripts, 99 MB heap for Solitaire).",
    "The editor keeps compiling in the browser, for offline and the static build.",
    "Adds a limit:  a cloud app can't compile `.spell` itself any more."
  ],
  sr: [
    "Screen-reader runs (VoiceOver, NVDA, TalkBack) join the checks, starting with your two VoiceOver checks.",
    "Spell UI's CSS gets forced-colours rules for Windows High Contrast (one rule today), so a drawn selection and the bubbly bands stay visible."
  ],
  worker: [
    "Parse, compile and the language service move to a worker, the main thread a thin client speaking the language-server protocol, as vscode.dev does.",
    "The Inspector, side bar, bubbly look and notebook stop reading the parse directly;  they ask the worker.",
    "Adds a limit:  every parse read becomes a message, and a second thread to debug.",
    "Removes a limit:  typing never waits on parsing or compiling."
  ],
  oneruntime: [
    "Several program viewers share one runtime module that makes a runtime each, instead of importing their own copy of the core from their own `blob:` address.",
    "Removes a limit:  each viewer on a page no longer holds a whole core of its own."
  ],
  tooling: [
    "`spell` runs from a prebuilt bundle instead of transpiling at every start (a hook run went from 2.5 s to 0.9 s once its cache was cleared).",
    "The content check, example compiles and integration tests (about 15 minutes, one file at a time today) run across threads.",
    "Adds a limit:  the prebuilt `spell` must be rebuilt after a change to the CLI's code."
  ],
  nowasm: [
    "Nothing to build:  the parser and compiler stay TypeScript.",
    "Flat data (words as numbers, arrays), most of WebAssembly's 2.2x gain, stays open in plain JavaScript;  look again if matching passes about 35% of a large project's parse."
  ],

  ////////////////
  // ## Large projects
  ////////////////

  lazypages: [
    "The compiler writes each page of a built site as its own piece, fetched on hover, press, in view or when idle (not on data saver).",
    "Views are pending until their piece lands, as Spell UI's elements already are;  the site table already names pages by class, so the router doesn't change.",
    "Authors write nothing new;  the editor's live run keeps one module.",
    "Adds a limit:  names across pieces become lookups, and a module once loaded is never unloaded."
  ],
  lazybackend: [
    "The compiler decides which pieces a back-end's code goes in, by what each part reaches, not by file:  a second `api.spell` loads only on its pages.",
    "Imported projects are cut to the types used (84% of Public Servers' code is back-end types).",
    "Adds a limit:  remembered things and carry-over must find classes by name, waiting for their piece."
  ],
  keeppages: [
    "The site keeps the last 2-3 pages drawn but hidden, and drops older drawings and rows nothing reads.",
    "Removes a limit:  Back is instant, and memory stays flat as people move around a site."
  ],

  ////////////////
  // ## Data and streams
  ////////////////

  streams: [
    "Places gain one step type, `ListStep`, an optional `Place.steps()` and `stepsOf()` / `pagesOf()`;  `SavedRead` and `PlaceHeal.follow()` read through them.",
    "`PlaceServer` streams lists as NDJSON lines, `RemotePlace` reads them, and Python gets `pages()` and a Quart steps route.",
    "A `WatchedPlace` on our server watches once for everyone;  readers for SSE, websockets and long polling;  at most `MOST_ROWS_KEPT` rows on a phone.",
    "A Spell program writes nothing new:  the same list fills in, then stays current.",
    "Removes a limit:  a page, a poll and a pushed change stop being three code paths, and a 10,000-row sheet shows its first rows in one round trip."
  ],
  graphql: [
    "`GraphPlace` gains subscriptions, as the first service that pushes:  no new dependency.",
    "Supabase, Firestore and Postgres wait for later kinds."
  ],
  farrows: [
    "On a phone, a list past 2,000 rows takes down far-off rows' elements, and draws them again on scrolling.",
    "Adds a limit:  focus and a form's typed text far off screen are lost."
  ],
  hiddenstream: [
    "A stream closes after a minute in the background and carries on from where it stopped when the page is back.",
    "Adds a limit:  a hidden page isn't current until it's shown again, as polling already behaves."
  ],
  changeswords: [
    "A new Spell phrase, `its changes come from \"...\"`, for a web server that tells of changes:  grammar, both vocabularies and docs.",
    "How it's heard (SSE, NDJSON, websocket) comes from the answer itself:  no words for it.",
    "Adds a limit:  one more phrase to keep unambiguous;  \"its changes\" could read as the program's own, sent there."
  ],
  pyengine: [
    "A Quart app becomes a place, so a browser program reads and writes it with pending changes, retry, heal and merge.",
    "`places.py` gains pending changes with change ids:  a refused or unanswered write is tried again, never lost.",
    "Adds a limit:  a second copy of the engine's rules, in Python, to keep in step with the JavaScript."
  ],
  pysocket: [
    "The Quart page uses `ReconnectingSocket` and resends its state on reopen.",
    "Removes a limit:  dropped wifi no longer ends the page."
  ],
  rooms: [
    "A live room offers `changes()` as an async iterable, so `createStore(() => room.changes())` gives any Solid app its state.",
    "Nothing removed:  an extra door beside today's rooms."
  ],
  csv: [
    "The CSV parser reads rows as a generator over the stream, so a big sheet shows its first rows at once.",
    "The sheet's ceiling counts rows, not bytes.",
    "A workbook is a zip, so Excel files stay whole."
  ],
  pyroom: [
    "`spell_quart` runs one program as a shared room, many visitors in one game, through the referee's numbered steps and heal.",
    "Adds a limit:  today each visitor gets a game of their own;  a shared one needs heal for conflicts."
  ],
  pyweb: [
    "Python gets a web server place kind, with the browser's mapping and rate-limit waiting;  today the compile refuses it (\"not in Python yet\").",
    "Removes a limit:  a Python program can read GitHub, the weather or any API.",
    "Adds a limit:  a second implementation of the web server place to keep in step."
  ],

  ////////////////
  // ## Solid features
  ////////////////

  createplace: [
    "A new `createPlace()` makes any place's read a Solid async memo:  `<Loading>`, `isPending()` and `refresh()` work over REST, sheets and AT Protocol.",
    "`Loadable` (and `LoadableFile`, `PlaceResult`, `LoadOnce`) could sit on it, folding their React-era shape into Solid's.",
    "Adds a limit:  it rests on Solid's newest async code, lightly tested upstream."
  ],
  stores: [
    "The epic pages' `PageStore` (a version and a subscribe, 38 uses) becomes Solid stores.",
    "The editor's panels (189 signals, 110 memos) move to stores only where a phase is in that code anyway.",
    "The Solid 2 rules say where stores fit:  state nothing reads back at once."
  ],
  projection: [
    "`<ui-tree>`, `<ui-table>` and the Inspector track selection with `createProjection`:  one check per change, not one per row.",
    "Only where a phase is in that code anyway, as with stores."
  ],
  appctx: [
    "`<ui-root>`'s `appContext` becomes a store of named keys, so a theme or selection flows into every element across shadow roots.",
    "Compared first with Solid 2.0's own host markers.",
    "Removes a limit:  today a component reads `appContext` once;  it would follow changes."
  ],
  router: [
    "`SiteBase` (a program's pages) and Spell UI's docs `SiteRouter` share one client router core, perhaps on Solid Router's engine.",
    "Pages can preload their places on hover.",
    "Adds a limit:  the docs site's view transitions must carry over."
  ],
  task: [
    "`Task` and `TaskList` drop lodash's `isEqual` and the `batch()` Solid 2 removed.",
    "Nothing changes for programs;  one fewer Solid 1 shape left in `spell/util`."
  ],
  propdocs: [
    "Spell UI's frameworks page leads its Solid section with `prop:` and refs, then the 2.0.3 version and the same-Solid caveat.",
    "`on-ui-change={fn}` stays as the convenience, with `<ui-root pure>` turning the page-wide `setAttribute()` patch off."
  ],
  virtual: [
    "Tables and trees get real windowing that recycles rows, beside `drawnInWindow()`, which pages a place but keeps what's drawn.",
    "Adds a limit:  a second way to draw a list, and focus and forms in recycled rows need care."
  ],
  motion: [
    "Lists animate reorders with FLIP or view transitions, on `moveBefore()`;  `<ui-repeat>` already moves rows with it.",
    "Adds a limit:  each animation must honour the reduced-motion setting, as Spell UI's do today."
  ],
  reveal: [
    "A page's sections appear top-down as their places answer, through Solid's `<Reveal>`;  after `createPlace()`.",
    "Programs write nothing new:  every place read is already inside `<Loading>`."
  ],
  prepass: [
    "The toolchain's decorator pre-pass (`spell/toolchain/decorators`, 140 lines) is deleted once Vite's compiler lowers standard decorators.",
    "Removes a limit:  one build step fewer before every Vite and Vitest run."
  ],

  ////////////////
  // ## Web components
  ////////////////

  upstream: [
    "Each of `spell/element`'s 11 fixes is checked against `@solidjs/element` 2.0.1, then filed as one issue each, shadow-root events first.",
    "The patch is queued and never pushed before your review.",
    "Removes a limit:  each fix Solid takes is code `spell/element` can delete, so the fork shrinks."
  ],
  listing: [
    "During this epic:  file the shadow-root bug and fix Solid's stale `@solidjs/element` entry on solidjs.com.",
    "After December 1:  one pull request adding Spell UI's entry, linking the GitHub README until a public docs site exists."
  ],
  cem: [
    "The compiler writes a Custom Elements Manifest per compiled project, as Spell UI already does for itself.",
    "React, Preact, Vue and Svelte types are generated from it, so `<solitaire-card>` is typed in those frameworks.",
    "Adds a limit:  a generated file to keep current, and to mark in `.gitattributes` and the generators list if committed."
  ],
  move: [
    "The element base (`spell/element`) implements `connectedMoveCallback()`, so an element moved in the page keeps its state instead of being torn down.",
    "Removes a limit:  moving an element (a card to another pile) no longer rebuilds it."
  ],
  smoke: [
    "Smoke pages for Svelte, Angular and Preact join the tests, run in Firefox and Safari too.",
    "Docs for frameworks that render before tags are defined."
  ],
  bench: [
    "A published benchmark:  the same list as Spell views, plain Solid components and Lit.",
    "Adds a limit:  no speed claims in docs or the listing until it exists."
  ],
  wcdocs: [
    "Solid's docs gain a section on writing custom elements on Solid, one Solid per page and shadow-root events, after asking the docs team on Discord.",
    "No Spell code changes;  `spell/element` is the worked example."
  ],
  eventhelper: [
    "Spell UI exports a typed `on(type, handler, options)` ref factory, its events typed from the manifest.",
    "Proposed to Solid Primitives at Stage 0, after checking `@solid-primitives/event-listener` for overlap."
  ],
  skills: [
    "Spell's Solid 2 rules are compared with the skills Solid now ships;  what they lack (classes, custom elements) goes upstream as small pull requests.",
    "Spell's own rules (`agents/solid/solid-2.md`) keep what's Spell's alone."
  ],
  vite: [
    "A `spell/vite` plugin (name inferred) plugs into Solid's Vite plugin as the `.spell` frontend, grown from the editor's `compiledSpell()`.",
    "It compiles a file's whole project, hands back a module instead of text, and needs errors and source maps that point at `.spell` lines.",
    "Adds a limit:  Spell's runtime must run on the host app's one copy of Solid.",
    "Removes a limit:  any Solid app can `import { Counter } from \"./Counter.spell\"`."
  ],
  libs: [
    "`spell/element`, function components as elements, a custom-element testing kit and the theme format become published packages.",
    "Adds a limit:  a public API to keep stable, and `spell/element` must work without Spell UI's runtime first."
  ],
  platform: [
    "As browsers ship them:  Reference Target in the element base, scoped registries, the Navigation API for a Spell app's pages.",
    "Removes a limit:  a page's `<label for>` reaches a Spell control's input, and two Spell programs or versions can share a page."
  ],

  ////////////////
  // ## Language and tools
  ////////////////

  errcodes: [
    "Every warning in `SpellWarnings` gets a stable code and a page with the fix, in English and Spanish.",
    "The language server's hover and `spell lint` show the code and link its page.",
    "Adds a limit:  codes to keep stable, and a page to write for each new warning."
  ],
  failwarn: [
    "The compiler warns when a drawing shows something read from a place with nothing for when it fails (`if that fails`).",
    "It warns, never refuses;  no new words."
  ],
  timing: [
    "Core's tests gain timing tests:  clicks and answers in a set order, the screen checked after each step, with Spell's English tests as the program.",
    "They prove trackers on Solid signals and held actions as each is built."
  ],
  devtools: [
    "Places and actions call `enablePerformanceTracks()`, so a slow load or action is its own track in Chrome's Performance panel.",
    "Later:  Solid's devtools inside the editor, Solid's owners and trackers in one graph."
  ],
  treesitter: [
    "A tree-sitter grammar for `.spell`, so GitHub and Zed colour Spell files.",
    "Adds a limit:  a second grammar to keep in step with the parser's."
  ],
  solidlib: [
    "A new way to declare a Solid library once, so programs can use it (Solid Primitives first):  new language, needs your OK.",
    "Removes a limit:  a program reaches a Solid library without a hand-written binding."
  ],
  updating: [
    "A new phrase, a proposal only (`if the matches are updating`):  grammar, vocabularies, compiler and docs.",
    "Adds a limit:  it can be misread against a first load, or a property named `updating`."
  ],
  aitext: [
    "A model's answer is drawn word by word through Solid's `from()`, with a new Spell line that needs your OK.",
    "After streams in places, which it reads through."
  ],
  aibench: [
    "A test of how well AIs write Spell against React, as its own epic, outside the product.",
    "Gives a number to check the AI-facing docs and rules against."
  ],

  ////////////////
  // ## Later
  ////////////////

  ssr: [
    "Spell sites render on the server with Solid 2's `renderToStream()`, places filling in as they answer;  only `<spell-viewer>` islands hydrate.",
    "Builds on keeping server-drawn shadow roots.",
    "Adds a limit:  a server half to every page, and code that must run in node as well as the browser."
  ],
  ssg: [
    "A site generator writes every address of a Spell site, with a sitemap and Open Graph pictures.",
    "New phrases, `its title is` and `its picture is`, become head tags:  they need your OK."
  ],
  serveractions: [
    "A new phrase for an action that runs on the server, compiled to a place operation and optimistic on the page:  needs your OK.",
    "Builds on SolidStart's `\"use server\"` and `RestPlace`'s operations."
  ],
  localfirst: [
    "`PendingChanges`, `SaveQueue`, `PlaceHeal` and `DeviceCopy` published as a Solid library.",
    "Adds a limit:  a public API to keep stable."
  ],
  table: [
    "`<ui-table>` gets grouping, pivots and column filters on TanStack Table, fed by place queries.",
    "Adds a limit:  a new runtime dependency for you to OK."
  ],
  timetravel: [
    "Scrubbing a running program back and forth, built on `UndoStack` and `StateWriter`.",
    "Removes a limit:  stepping through a program in the debugger no longer only goes forward."
  ],
  tsbrowser: [
    "The runner runs compiled TypeScript Spell through `esbuild-wasm` and Solid's compiler.",
    "Removes a limit:  closes the \"runners can't run TypeScript output\" code-debt entry."
  ],
  bigideas: [
    "A third language would prove the vocabularies past English and Spanish:  plurals, genders, right-to-left.",
    "A non-DOM target (`@solidjs/universal`):  programs drawn on a canvas or in a terminal.",
    "Change This and Explain This as a library for any Solid app."
  ]
}
