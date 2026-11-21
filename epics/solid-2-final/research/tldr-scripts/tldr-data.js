// The Solid TLDR's items, ranked:  most valuable to Owen first.
// Each:  title, text (HTML), links [[href, text]], risk [level, why], loe [size, why], cx [score, why], rec (Y N M R)
const W = "web-performance.html"
const A = "solid-2-analysis.html"
const S = "streams.html"
const R = "../research/"

module.exports = [
  {
    group: ["now", "This epic"],
    items: [
      {
        title: "Changes before an action's first wait show at once",
        text: "Spell's actions are moving inside Solid's actions in this epic, so the screen holds until an action ends; changes made before the action first waits (clear the box, close the menu) would still show at once. ReactiveScript held everything, and its testers couldn't clear a box.",
        links: [[`${A}#q9`, "the question, open on the analysis page"], [`${A}#rx-steal`, "what ReactiveScript's testers hit"], [`${R}reactivescript.md`, "the notes"]],
        risk: ["low", "the compiler already knows where an action first waits"],
        loe: ["S", "a decision, then a rule in the build already planned"],
        cx: [1, "one rule to explain about when changes appear"],
        rec: "Y"
      },
      {
        title: "Make Spell UI installable in any Solid 2 app",
        text: "Add a root LICENSE file (MIT, plus the Fomantic notice) and give spell-ui's Solid peer a range (^2.0.3) instead of one exact version. Without both, the solidjs.com listing you chose for after December 1 can't happen.",
        links: [[`${A}#eco-plan`, "the listing's blocking list"], [`${A}#eco-ready`, "what's missing today"], [`${R}solid-ecosystem.md`, "the notes"]],
        risk: ["low", "the kit's own pin stays exact; only the published peer widens"],
        loe: ["S", "two files"],
        cx: [0, "no new moving parts"],
        rec: "Y"
      },
      {
        title: "Spell UI's reactive members join the one engine, as their own epic",
        text: "Once trackers hold Solid signals (decided), move Spell UI's @state / @derived members onto the same engine, so a component and a program finally see each other's worked-out values. Own epic rather than a late phase here.",
        links: [[`${A}#n-reactivity`, "what it gives"], [`${A}#h-state`, "the two engines today"], [`${A}#cells-engine-b-verdict`, "A or B, with the numbers"]],
        risk: ["medium", "456 @state and 205 @derived uses move"],
        loe: ["L", "a phase or more"],
        cx: [-6, "two reactive engines become one"],
        rec: "Y"
      }
    ]
  },
  {
    group: ["quick", "Quick wins"],
    items: [
      {
        title: "Compress everything the servers send",
        text: "Write brotli copies beside each built file and gzip the rest on the fly, the house network's site too. The editor's first screen drops from about 5.7 MB to 1.2 MB on the wire, a docs page by 4.1 MB.",
        links: [[`${W}#e-bundle`, "the plan and the numbers"], [`${W}#expensive`, "the cost table"], [`${R}perf-bundle.md`, "the measurements"]],
        risk: ["low", "standard server setting"],
        loe: ["S", "a day or two"],
        cx: [1, "a build step and a header"],
        rec: "Y"
      },
      {
        title: "Cache what doesn't change",
        text: "Files with a hash in their name cached for a year, pages checked each time, worktrees left at \"never store\". A warm editor visit goes from 5.7 MB to about 6 KB.",
        links: [[`${W}#e-bundle`, "the plan"], [`${W}#today-rerun`, "the re-run that measured it"]],
        risk: ["low", "a stale page if a name has no hash: pages are revalidated"],
        loe: ["S", "headers"],
        cx: [1, "one more rule about what's cached"],
        rec: "Y"
      },
      {
        title: "Stop the live-reload client scanning every script",
        text: "It scans about 400 scripts for each message, and hears every file change in the kit: 62% of the editor's phone load. Filter to the page's own files first and keep the script list.",
        links: [[`${W}#e-live-reload`, "what it does today"], [`${W}#today-editor`, "the phone load"]],
        risk: ["low", "dev-only code"],
        loe: ["S", "hours"],
        cx: [-1, "less work per message"],
        rec: "Y"
      },
      {
        title: "Don't upload while typing",
        text: "The compile that runs 2 seconds after typing stops skips saving (the option exists); built files are written on Save. About 5 round trips less per edit, 150-300 ms over 5G.",
        links: [[`${W}#e-editing`, "the editing pipeline, step by step"]],
        risk: ["low", "offline is unchanged"],
        loe: ["S", "an option already there"],
        cx: [-1, "less happens per pause"],
        rec: "Y"
      },
      {
        title: "Python writes off the event loop",
        text: "Under Quart a program's writes block the one event loop every visitor shares; hand them to a queue drained with asyncio.to_thread(), as reads already are. One visitor's save never stalls another's game.",
        links: [[`${A}#data-python`, "why it stalls"], [`${A}#data-ideas`, "ranked first of the data ideas"], [`${R}data-paradigm.md`, "the notes"]],
        risk: ["low", "the same pattern reads use"],
        loe: ["S", "places.py's send()"],
        cx: [0, "same shape as reads"],
        rec: "Y"
      },
      {
        title: "Fix the editor's accessibility errors, and check the editor with axe",
        text: "Fix the 3 critical ARIA errors, the code pane's missing name and focus ring, 24 contrast failures and duplicate landmarks; then run axe over the editor, not only Spell UI's examples.",
        links: [[`${W}#e-a11y`, "what axe found"], [`${W}#today-loops`, "the run"]],
        risk: ["low", "markup fixes"],
        loe: ["S", "a day or two"],
        cx: [0, "one more test"],
        rec: "Y"
      },
      {
        title: "Load the CSS language service on the first CSS edit",
        text: "It loads at start today: 180 KB brotli, 1.25 MB to parse, mostly property descriptions. Load it when CSS is first edited, or in a worker.",
        links: [[`${W}#e-bundle`, "the plan"], [`${W}#expensive`, "the cost table"]],
        risk: ["low", "a short wait on the first CSS hover"],
        loe: ["S", "a lazy import"],
        cx: [0, "a lazy import"],
        rec: "Y"
      },
      {
        title: "Send last visit's waiting writes at idle",
        text: "A write made offline waits until a later visit uses that place again; send every place's waiting writes when the page is idle. A fix on its own, and needed before code loads lazily.",
        links: [[`${W}#e-large`, "large projects"], [`${R}lazy-scope.md`, "the notes"]],
        risk: ["low", "inferred:  a test should confirm it first"],
        loe: ["S", "hours"],
        cx: [0, "no new concept"],
        rec: "Y"
      },
      {
        title: "Leave editor-only text out of built programs",
        text: "Comments and source positions are a third of a built program; the editor keeps its full file. Public Servers: 30.5 to 18.9 KB gzip, measured.",
        links: [[`${W}#e-large`, "the measurement"]],
        risk: ["low", "built sites only"],
        loe: ["S", "a compile option"],
        cx: [0, "a build flag"],
        rec: "Y"
      },
      {
        title: "Let the browser handle keys between compile steps",
        text: "The compile is already a task per file; yield between them (scheduler.yield()) so typing never waits on a compile. Nothing moves to a worker.",
        links: [[`${W}#e-editing`, "the pipeline"], [`${A}#data-ideas`, "ranked as a generator idea too"]],
        risk: ["low", "no data moved"],
        loe: ["S", "hours"],
        cx: [0, "a yield per step"],
        rec: "Y"
      },
      {
        title: "Stop the forced style reads in the panel's scroll shading",
        text: "It reads every child's computed style on each refresh: 3.5 s of the editor's phone load. Read once, or watch with an observer.",
        links: [[`${W}#e-style`, "style and CSS"], [`${W}#expensive`, "the cost table"]],
        risk: ["low", "one component"],
        loe: ["S", "hours"],
        cx: [0, "same feature, cheaper"],
        rec: "Y"
      },
      {
        title: "Find the small leaks:  the dropdown, and what typing keeps",
        text: "Each dropdown open and close keeps 30 kB, 5 nodes and 7 listeners; each key keeps 26-42 kB. A heap snapshot says what holds them.",
        links: [[`${W}#e-memory`, "memory and leaks"], [`${R}perf-browser.md`, "the measurements"]],
        risk: ["low", "bug fixes"],
        loe: ["S", "a day"],
        cx: [0, "none"],
        rec: "Y"
      },
      {
        title: "One copy of the grammar in the element builds, no rule tests shipped",
        text: "The editor, code and layout elements each carry the grammar (791 KB brotli in all), with its rule tests inside. One shared piece; tests in their own files.",
        links: [[`${W}#e-bundle`, "the plan"], [`${R}perf-bundle.md`, "the measurements"]],
        risk: ["low", "build change"],
        loe: ["S-M", "build plus moving tests"],
        cx: [-1, "one copy instead of three"],
        rec: "Y"
      }
    ]
  },
  {
    group: ["speed", "Speed and memory"],
    items: [
      {
        title: "Stop every shadow root matching 400 KB of shared CSS",
        text: "Take the :root rules out of shadow roots, put tokens on the page once (they inherit), and trim the 874 custom properties. The biggest cost found: the kitchen sink spends 22.7 s on style, 62 s on a phone.",
        links: [[`${W}#e-style`, "the plan, sheet by sheet"], [`${W}#today-docs`, "the kitchen sink's numbers"], [`${R}perf-browser.md`, "the measurements"]],
        risk: ["medium", "the visual tests show any style that moved"],
        loe: ["M", "a week"],
        cx: [-2, "fewer sheets per root"],
        rec: "Y"
      },
      {
        title: "Split the docs bundle and the epics pack",
        text: "Docs and epic pages load every Spell UI family in one 873 KB script; load each family on first use, as the Spell UI site already does. About 700 KB and 150 KB less a page.",
        links: [[`${W}#e-bundle`, "the plan"], [`${W}#today-epic`, "the biggest epic page"]],
        risk: ["low", "pages are always served now"],
        loe: ["M", "a week"],
        cx: [-1, "one way of loading families, not two"],
        rec: "Y"
      },
      {
        title: "Let old program runs go",
        text: "Each compile imports the program from a new blob: address, which the browser never frees: tens to hundreds of MB an hour of editing (to confirm with a heap snapshot). Run in an iframe re-made now and then, or evaluate as a function the browser can free.",
        links: [[`${W}#e-memory`, "the leak and the fixes"], [`${R}perf-code.md`, "the notes"]],
        risk: ["medium", "live edit and carry-over must behave the same"],
        loe: ["M", "a week"],
        cx: [2, "an iframe to manage"],
        rec: "Y"
      },
      {
        title: "Load Spanish only when something speaks it",
        text: "The Spanish dictionaries (71 KB brotli) and the grammar's Spanish half (about 120 KB) load for every English project; load them on first use, as VS Code loads a language's support.",
        links: [[`${W}#e-bundle`, "the plan"]],
        risk: ["low", "a language switch waits on one fetch"],
        loe: ["M", "a week"],
        cx: [1, "a lazy path per language"],
        rec: "Y"
      },
      {
        title: "Keep server-drawn shadow roots when an element starts",
        text: "A shadow root drawn on the server is used, then emptied and drawn again; keep it, and link the shared sheet instead of inlining 147 KB of CSS per element. Pages paint before any script, and it's the best answer to every web-components critic.",
        links: [[`${W}#e-server`, "server instead of browser"], [`${A}#n-rendering`, "Declarative Shadow DOM output"], [`${A}#wc-answers`, "the critics' first objection"]],
        risk: ["high", "touches every element's first render"],
        loe: ["M-L", "a phase"],
        cx: [3, "a second way an element starts"],
        rec: "Y"
      },
      {
        title: "Smaller pieces:  dialogs, routes, lodash, icons, help tables",
        text: "A piece per dialog (about 400 KB less on the first one), the editor's routes lazy and preloaded on hover, tree-shakable lodash, an icon sprite per app, the help tables on first hover. Small each.",
        links: [[`${W}#e-bundle`, "the list"], [`${W}#expensive`, "the cost table"]],
        risk: ["low", "loading order only"],
        loe: ["S each", ""],
        cx: [1, "more pieces to name"],
        rec: "Y"
      },
      {
        title: "HTTP/2 for the page server and the cloud",
        text: "Plain HTTP/1.1 today, so 85 first-load files share 6 connections.",
        links: [[`${W}#e-bundle`, "the plan"]],
        risk: ["low", "server setting"],
        loe: ["S-M", "needs TLS locally"],
        cx: [1, "certificates in development"],
        rec: "Y"
      },
      {
        title: "Restore only the first sign-in place at start",
        text: "Every sign-in place is restored at start, with its OAuth library and a round trip, for accounts a page may never use. Others on first use.",
        links: [[`${W}#e-large`, "large projects"]],
        risk: ["low", "first use waits a moment"],
        loe: ["S", "hours"],
        cx: [0, "none"],
        rec: "Y"
      },
      {
        title: "Forget the parse of projects you've left",
        text: "Keep the text, drop the parse and editor state of projects not shown for a while (the last 2-3 kept). Memory stops growing with every example visited.",
        links: [[`${W}#e-memory`, "memory"]],
        risk: ["low", "a return parses again; the compile cache makes the run instant"],
        loe: ["S-M", ""],
        cx: [1, "an eviction rule"],
        rec: "Y"
      },
      {
        title: "Bound what a running app keeps",
        text: "Rows a place read held only while something reads them, and the console as a capped ring appended in place (today it copies itself on every line). Apps can run all day on a phone.",
        links: [[`${W}#e-memory`, "memory"], [`${W}#expensive`, "unbounded growth"]],
        risk: ["low", "opt-in for lists"],
        loe: ["S each", ""],
        cx: [1, "a cap to explain"],
        rec: "Y"
      },
      {
        title: "Less work per pause",
        text: "Write only the files that changed, drop the program's dump to two consoles, reuse unchanged imports, don't lay out the whole file's look again.",
        links: [[`${W}#e-editing`, "the pipeline"]],
        risk: ["low", "to medium, for the import reuse"],
        loe: ["S-M each", ""],
        cx: [-1, "less happens"],
        rec: "Y"
      },
      {
        title: "Time the editing pipeline",
        text: "The parser's speed test times its rule tests only; add a whole project's parse, an edit, a compile, a run and startup, from the incremental tests that already make the right edits. Feeds the perf command you chose.",
        links: [[`${W}#e-editing`, "the pipeline"], [`${W}#e-measure`, "measuring for good"]],
        risk: ["low", "tests only"],
        loe: ["S", ""],
        cx: [0, "tests"],
        rec: "Y"
      },
      {
        title: "Fewer shadow roots and listeners for small elements",
        text: "The editor has 179 icons, 149 actions and 112 texts, each its own shadow root with 14 kinds of listeners (28,700 listeners for 5,594 elements). Leaf elements without a root, and only the event kinds a root uses.",
        links: [[`${W}#e-style`, "style"], [`${W}#e-memory`, "listeners"]],
        risk: ["medium", "changes how those elements are styled"],
        loe: ["M-L", ""],
        cx: [2, "two kinds of element"],
        rec: "M"
      },
      {
        title: "Share layout sheets by value, keep CSS text only in development; measure unused CSS",
        text: "Each <ui-stack> gets its own sheet and every sheet's text is kept for hot reload; share them, and run the browser's CSS coverage to see how much of each family a page uses (70-85% unused, estimated).",
        links: [[`${W}#e-style`, "style and CSS"]],
        risk: ["low", ""],
        loe: ["S", ""],
        cx: [0, ""],
        rec: "Y"
      },
      {
        title: "Hand the parser the edit, not the whole text",
        text: "The editor flattens the file 2-3 times a key and the parser diffs it again; CodeMirror already knows what changed. VS Code's lesson: don't make strings you throw away.",
        links: [[`${W}#e-editing`, "the pipeline"]],
        risk: ["medium", "covered by the incremental tests"],
        loe: ["M", ""],
        cx: [0, "a different input, same parser"],
        rec: "Y"
      },
      {
        title: "Compile on the server for cloud apps, and a runner of its own for run mode",
        text: "A cloud app ships the compiler (391 KB brotli); run mode ships the whole editor (306 scripts, 99 MB heap for Solitaire). Ship compiled code and the runtime only; the editor keeps compiling in the browser.",
        links: [[`${W}#e-server`, "server instead of browser"], [`${W}#expensive`, "the cost table"]],
        risk: ["low", "running only"],
        loe: ["M", ""],
        cx: [2, "a second way programs reach a page"],
        rec: "Y"
      },
      {
        title: "Spell UI screen-reader passes, and forced colours",
        text: "No VoiceOver, NVDA or TalkBack runs yet, and the bubbly code pane draws its own selection; Windows High Contrast has one rule in all of Spell UI's CSS.",
        links: [[`${W}#e-a11y`, "accessibility"]],
        risk: ["low", ""],
        loe: ["M", "with your two VoiceOver checks"],
        cx: [0, ""],
        rec: "Y"
      },
      {
        title: "Parse, compile and the language service in a worker",
        text: "The main thread becomes a thin client, as vscode.dev does; typing never waits. The hard part: the Inspector, side bar and notebook read the parse directly today.",
        links: [[`${W}#e-editing`, "the pipeline"], [`${R}perf-code.md`, "the notes"]],
        risk: ["high", "much of the UI reads the parse"],
        loe: ["L", "a phase or more"],
        cx: [5, "a second thread and its messages"],
        rec: "R"
      },
      {
        title: "One runtime module for several program viewers",
        text: "Each program viewer imports its own copy of the core from its own blob: address; make several runtimes from one module.",
        links: [[`${W}#e-memory`, "memory"]],
        risk: ["medium", ""],
        loe: ["M", ""],
        cx: [-1, "one copy"],
        rec: "Y"
      },
      {
        title: "Faster tooling for you:  a prebuilt spell, checks across threads",
        text: "Run spell from a prebuilt bundle instead of transpiling at every start (a hook went 2.5 s to 0.9 s once its cache was cleared), and run the content check, example compiles and integration tests in parallel.",
        links: [[`${W}#e-wasm`, "the end of 4.5"]],
        risk: ["low", ""],
        loe: ["S-M", ""],
        cx: [1, "a build step for the command"],
        rec: "Y"
      },
      {
        title: "Skip WebAssembly and Rust rewrites for now",
        text: "WebAssembly would speed the parser 2.2x at best, mostly from flat data plain JavaScript gets too; a Rust rewrite is capped near 2x. Look again if matching passes about 35% of a large project's parse. Yes here means \"agree to skip\".",
        links: [[`${W}#e-wasm`, "the measurements"], [`${R}perf-code.md`, "the trial"]],
        risk: ["low", "nothing changes"],
        loe: ["none", ""],
        cx: [0, "nothing added"],
        rec: "Y"
      }
    ]
  },
  {
    group: ["large", "Large projects"],
    items: [
      {
        title: "Each page of a built site loads when first shown",
        text: "A project compiles to one module today; give each page its own piece, fetched early on hover or when idle, with views pending until it lands (as Spell UI's elements are). Authors write nothing new.",
        links: [[`${W}#e-large`, "large projects"], [`${R}lazy-scope.md`, "the notes"]],
        risk: ["medium", "names across pieces become lookups"],
        loe: ["M", ""],
        cx: [3, "pieces and a pending state"],
        rec: "Y"
      },
      {
        title: "A back-end's code loads with the pages that use it",
        text: "Your second api.spell loads only on its pages, found by what each part reaches; and imported projects cut to the types used (84% of Public Servers' code is back-end types).",
        links: [[`${W}#e-large`, "large projects"], [`${R}lazy-scope.md`, "the notes"]],
        risk: ["medium", "remembered things need classes by name"],
        loe: ["L", ""],
        cx: [4, "the compiler decides what goes where"],
        rec: "Y"
      },
      {
        title: "Keep the last 2-3 pages drawn",
        text: "Hidden, not thrown away: Back is instant, older drawings and rows nothing reads are dropped, so memory stays flat.",
        links: [[`${W}#e-large`, "large projects"]],
        risk: ["low", ""],
        loe: ["M", ""],
        cx: [1, "a cache of pages"],
        rec: "Y"
      }
    ]
  },
  {
    group: ["data", "Data and streams"],
    items: [
      {
        title: "Streams in places:  five phases for epic data",
        text: "Any place's list read as one sequence of steps (pages, then changes), streamed as one JSON line per page by our server and Quart, watched once for everyone, then services that push. A 10,000-row sheet shows its first rows in one round trip.",
        links: [[`${S}#s0`, "the answer in one screen"], [`${S}#s10`, "the five phases, 16-23 hours"], [`${S}#q1`, "who builds it"], [`${A}#data-streaming`, "streaming today"]],
        risk: ["medium", "every reader of a list moves onto it"],
        loe: ["L", "16-23 hours"],
        cx: [-2, "three paths (page, poll, push) become one"],
        rec: "Y"
      },
      {
        title: "Streams:  GraphQL subscriptions as the first real service",
        text: "After the generic readers, GraphQL subscriptions first: Spell already has GraphPlace, no new dependency. Supabase, Firestore and Postgres later.",
        links: [[`${S}#q2`, "the choices"]],
        risk: ["low", ""],
        loe: ["S-M", "part of phase 4"],
        cx: [1, ""],
        rec: "Y"
      },
      {
        title: "Streams:  a phone may take down rows far off screen, past 2,000",
        text: "Far-off rows' elements go and come back on scrolling; focus and a form's text far away are lost.",
        links: [[`${S}#q3`, "the choices"], [`${S}#s5-3`, "memory on a phone"]],
        risk: ["medium", "lost focus far away"],
        loe: ["S", "part of phase 5"],
        cx: [1, "a threshold"],
        rec: "Y"
      },
      {
        title: "Streams:  a hidden page's stream closes after a minute",
        text: "And carries on when the page is back: good for a phone's battery and the browser's 6 connections.",
        links: [[`${S}#q5`, "the choices"]],
        risk: ["low", ""],
        loe: ["S", ""],
        cx: [0, ""],
        rec: "Y"
      },
      {
        title: "Streams:  the words \"its changes come from\"",
        text: "A NEW Spell phrase for a web server that tells of changes: its changes come from \"...\". Needs your OK; the alternative is no words, TypeScript only.",
        links: [[`${S}#q4`, "the choices"], [`${S}#s8`, "how an author sets one up"]],
        risk: ["medium", "a new phrase to keep unambiguous"],
        loe: ["S", ""],
        cx: [2, "a new phrase"],
        rec: "M"
      },
      {
        title: "Python gets the whole engine:  a Quart app as a place, pending changes",
        text: "A browser program reads and writes a Python server with pending changes, retry, heal and merge; a refused write in Python is tried again, never lost. Python goes about a third of the way today.",
        links: [[`${A}#data-ideas`, "ideas 4 and 5"], [`${A}#data-python`, "Python on Quart"]],
        risk: ["medium", ""],
        loe: ["M", "each"],
        cx: [3, "a second copy of the engine's rules, in Python"],
        rec: "Y"
      },
      {
        title: "The Quart page's socket comes back after dropped wifi",
        text: "Reuse ReconnectingSocket and resend the page's state on reopen, so dropped wifi doesn't end the page.",
        links: [[`${A}#data-ideas`, "idea 6"]],
        risk: ["low", ""],
        loe: ["S", ""],
        cx: [0, "reuses what exists"],
        rec: "Y"
      },
      {
        title: "Rooms as async iterables",
        text: "Offer a live room as createStore(() => room.changes()): multiplayer state in one line, for any Solid app.",
        links: [[`${A}#n-data`, "data ideas"], [`${A}#data-ideas`, "idea 7"]],
        risk: ["low", "an extra door, nothing removed"],
        loe: ["M", ""],
        cx: [1, ""],
        rec: "Y"
      },
      {
        title: "CSV parsed as it arrives",
        text: "A big sheet shows its first rows at once.",
        links: [[`${A}#data-ideas`, "idea 13"]],
        risk: ["low", ""],
        loe: ["M", ""],
        cx: [1, ""],
        rec: "Y"
      },
      {
        title: "A Python program as a shared room",
        text: "Many visitors in one game, through the referee's numbered steps and heal.",
        links: [[`${A}#data-ideas`, "idea 8"]],
        risk: ["medium", ""],
        loe: ["L", ""],
        cx: [4, ""],
        rec: "R"
      },
      {
        title: "A web server kind in Python",
        text: "GitHub, the weather, any API from a Python program, with the browser's mapping and rate-limit waiting.",
        links: [[`${A}#data-ideas`, "idea 11"]],
        risk: ["low", ""],
        loe: ["L", ""],
        cx: [3, "a second implementation"],
        rec: "R"
      }
    ]
  },
  {
    group: ["solid", "Solid features"],
    items: [
      {
        title: "Places as Solid async values:  createPlace()",
        text: "Any back-end read as a Solid async memo, so <Loading>, isPending() and refresh() work over REST, sheets and AT Protocol in any Solid app; Loadable could sit on the same thing.",
        links: [[`${A}#n-data`, "what it gives"], [`${A}#h-data`, "places and Loadable today"], [`${A}#core-1-2`, "Solid's async features"]],
        risk: ["medium", "Solid's newest async code, lightly tested upstream"],
        loe: ["M-L", ""],
        cx: [-2, "Loadable's own shape folds into Solid's"],
        rec: "Y"
      },
      {
        title: "Solid stores where nothing reads back at once",
        text: "Replace the epic pages' PageStore (a version and a subscribe, a hand-made signal) with Solid stores, and the editor's panels where a phase is in that code anyway.",
        links: [[`${A}#h-state`, "PageStore"], [`${A}#cells-plan`, "what we'd do, in order"]],
        risk: ["low", ""],
        loe: ["S each", ""],
        cx: [-2, "one home-grown mechanism gone"],
        rec: "Y"
      },
      {
        title: "Selection in long lists in one check:  createProjection",
        text: "\"Is this row selected\" costs one check per change, not one per row, in <ui-tree>, <ui-table> and the Inspector.",
        links: [[`${A}#n-reactivity`, "the idea"], [`${A}#core-1-3`, "stores and projections"]],
        risk: ["low", ""],
        loe: ["S-M", ""],
        cx: [0, "Solid's own tool"],
        rec: "Y"
      },
      {
        title: "Reactive appContext",
        text: "A store of named keys on <ui-root>, so a theme or a selection flows into every element across shadow roots; compare with Solid 2.0's own host markers first.",
        links: [[`${A}#h-state`, "appContext today"], [`${A}#n-reactivity`, "the idea"]],
        risk: ["low", ""],
        loe: ["M", ""],
        cx: [1, ""],
        rec: "Y"
      },
      {
        title: "One client router core",
        text: "SiteBase (a program's pages) and the docs site's router share one core, perhaps on Solid Router's engine, preloading a page's places on hover. Three client routers is one too many.",
        links: [[`${A}#h-drawing`, "the four routers"], [`${A}#n-rendering`, "the idea"]],
        risk: ["medium", "the docs site's view transitions"],
        loe: ["M-L", ""],
        cx: [-4, "one router fewer"],
        rec: "Y"
      },
      {
        title: "Drop Task's React-era shapes",
        text: "Task and TaskList still use lodash's isEqual and a batch() Solid 2 removed.",
        links: [[`${A}#h-data`, "Task and TaskList"]],
        risk: ["low", ""],
        loe: ["S", ""],
        cx: [-1, ""],
        rec: "Y"
      },
      {
        title: "Lead with prop: and refs for Solid apps",
        text: "Spell's rich attributes stay as a convenience, but the Solid section of Spell UI's docs shows Solid's own prop: and refs first: the friction a Solid reviewer would name.",
        links: [[`${A}#h-elements`, "RichAttributes"], [`${A}#eco-objections`, "what they'd object to"]],
        risk: ["low", "docs"],
        loe: ["S", ""],
        cx: [0, ""],
        rec: "Y"
      },
      {
        title: "True virtualization for 100,000-row lists",
        text: "drawnInWindow() pages a place but never recycles what scrolls away; add real windowing for tables and trees that big.",
        links: [[`${A}#h-drawing`, "drawnInWindow today"], [`${A}#n-rendering`, "the idea"]],
        risk: ["medium", "focus and forms in recycled rows"],
        loe: ["M", ""],
        cx: [3, "a second way to draw a list"],
        rec: "R"
      },
      {
        title: "Motion for lists",
        text: "Cards slide between piles when a list reorders (FLIP or view transitions, moveBefore()).",
        links: [[`${A}#n-rendering`, "the idea"], [`${A}#h-drawing`, "transitions today"]],
        risk: ["low", ""],
        loe: ["M", ""],
        cx: [2, ""],
        rec: "R"
      },
      {
        title: "Ordered reveal",
        text: "A page's sections appear top-down as their places answer, with Solid's <Reveal>.",
        links: [[`${A}#n-data`, "the idea"]],
        risk: ["low", ""],
        loe: ["S", ""],
        cx: [1, ""],
        rec: "R"
      },
      {
        title: "Delete the decorator pre-pass once Vite lowers standard decorators",
        text: "140 lines that lower standard decorators before Vite's compiler, which lowers only the old kind; delete when it catches up.",
        links: [[`${A}#h-drawing`, "the last row"]],
        risk: ["low", ""],
        loe: ["S", "when upstream ships"],
        cx: [-1, ""],
        rec: "R"
      }
    ]
  },
  {
    group: ["wc", "Web components"],
    items: [
      {
        title: "A Custom Elements Manifest for every compiled project, and types for every framework",
        text: "Spell UI already writes one; write one per compiled project too, so <solitaire-card> gets React, Vue, Preact and Svelte types.",
        links: [[`${A}#n-platform`, "the platform"], [`${A}#wc-answers`, "the types objection"], [`${R}web-components-first.md`, "the notes"]],
        risk: ["low", ""],
        loe: ["S-M", ""],
        cx: [1, "a generated file"],
        rec: "Y"
      },
      {
        title: "connectedMoveCallback() on the element base",
        text: "Elements moved in the page keep their state instead of being torn down and rebuilt.",
        links: [[`${A}#n-platform`, "the platform"], [`${A}#wc-platform`, "what the platform offers"]],
        risk: ["low", ""],
        loe: ["S", ""],
        cx: [0, ""],
        rec: "Y"
      },
      {
        title: "Smoke pages for Svelte, Angular and Preact, in Firefox and Safari",
        text: "Proof that Spell's elements work outside Solid, with docs for frameworks that render before tags are defined.",
        links: [[`${A}#wc-answers`, "interop, and props"]],
        risk: ["low", ""],
        loe: ["S-M", ""],
        cx: [1, ""],
        rec: "Y"
      },
      {
        title: "Publish a benchmark before claiming speed",
        text: "The same list as Spell views, plain Solid components and Lit. Until then, claim nothing about speed.",
        links: [[`${A}#wc-answers`, "performance"]],
        risk: ["low", ""],
        loe: ["M", ""],
        cx: [0, ""],
        rec: "Y"
      },
      {
        title: "Docs for writing custom elements on Solid",
        text: "Solid 2's docs cover using custom elements, nothing on writing them, one Solid per page, or shadow-root events; ask the docs team on Discord first.",
        links: [[`${A}#eco-give`, "what to give back"]],
        risk: ["low", ""],
        loe: ["S", ""],
        cx: [0, ""],
        rec: "Y"
      },
      {
        title: "A typed custom-element event helper for Solid Primitives",
        text: "The on() ref Ryan left to userland, with typed events from a manifest, proposed at Stage 0 after checking the event-listener primitive.",
        links: [[`${A}#eco-give`, "what to give back"], [`${A}#n-giving-back`, "Spell's parts for Solid"]],
        risk: ["low", ""],
        loe: ["M", ""],
        cx: [1, ""],
        rec: "Y"
      },
      {
        title: "Send Spell's Solid rules to Solid's own agent skills",
        text: "Solid now ships its own skills; send what they lack (classes, custom elements) as small pull requests. Lowest priority of the give-backs.",
        links: [[`${A}#eco-give`, "what to give back"]],
        risk: ["low", ""],
        loe: ["S", ""],
        cx: [0, ""],
        rec: "R"
      },
      {
        title: "A .spell compiler for Solid's Vite plugin",
        text: "Any Solid app imports Spell views (import { Counter } from \"./Counter.spell\"), through the door Solid's author opened for his own language. After Spell UI installs in a Solid 2 app, so not before December 1.",
        links: [[`${A}#q8`, "the question, open"], [`${A}#rx-vite`, "what it would take"]],
        risk: ["medium", "Spell's runtime must share the app's Solid"],
        loe: ["M", ""],
        cx: [3, "a second build path for .spell"],
        rec: "Y"
      },
      {
        title: "Spell's parts as libraries for the Solid world",
        text: "spell/element as Solid 2's custom-element base, any function component as an element, a custom-element testing kit, an open theme format. Bigger than filing fixes: spell/element isn't usable without Spell UI's runtime yet.",
        links: [[`${A}#n-giving-back`, "the list"], [`${A}#q3`, "you picked filing fixes over publishing it whole"]],
        risk: ["medium", "a public API to keep"],
        loe: ["L", ""],
        cx: [4, "packages to support"],
        rec: "R"
      },
      {
        title: "Reference Target, scoped registries, the Navigation API, as browsers ship them",
        text: "A page's <label for> reaching a Spell control's input; two Spell programs or versions on one page; a Spell app's pages on the Navigation API.",
        links: [[`${A}#n-platform`, "the platform, ranked"], [`${A}#wc-platform`, "what each one is"]],
        risk: ["low", ""],
        loe: ["S-M each", "when browsers ship"],
        cx: [1, ""],
        rec: "R"
      }
    ]
  },
  {
    group: ["language", "Language and tools"],
    items: [
      {
        title: "A code on every error, and a page with the fix",
        text: "Someone stuck on an error is told why and what to write instead, in English and Spanish, through the warnings, the language server's hover and spell lint.",
        links: [[`${A}#rx-steal`, "taken from ReactiveScript, ranked 2"]],
        risk: ["low", ""],
        loe: ["S-M", ""],
        cx: [1, "codes to keep"],
        rec: "Y"
      },
      {
        title: "Warn when a drawing shows something that can fail, with nothing for when it does",
        text: "No blank where a server's answer failed; the compiler already knows which reads reach a place. It warns, never refuses; no new words (if that fails exists).",
        links: [[`${A}#rx-steal`, "ranked 4"], [`${A}#rx-avoid`, "warn, don't refuse"]],
        risk: ["low", ""],
        loe: ["M", ""],
        cx: [1, ""],
        rec: "Y"
      },
      {
        title: "Timing tests:  clicks and answers in a set order",
        text: "The screen checked after each step, proving trackers on Solid signals and held actions show the right thing whatever arrives first.",
        links: [[`${A}#rx-steal`, "ranked 5"]],
        risk: ["low", "tests"],
        loe: ["M", ""],
        cx: [0, ""],
        rec: "Y"
      },
      {
        title: "Places and actions in Chrome's Performance panel, and Solid devtools in the editor",
        text: "A slow load or action shows as its own track (enablePerformanceTracks()); later, \"why did this redraw?\" across Solid and trackers in one graph.",
        links: [[`${A}#n-language`, "the ideas"], [`${A}#core-1-13`, "Solid's diagnostics"]],
        risk: ["low", ""],
        loe: ["S, then L", ""],
        cx: [2, ""],
        rec: "M"
      },
      {
        title: "A tree-sitter grammar, so GitHub and Zed colour .spell",
        text: "Spell files shown coloured wherever people read code.",
        links: [[`${A}#rx-steal`, "after the ranked list"]],
        risk: ["low", ""],
        loe: ["S-M", ""],
        cx: [2, "a second grammar to keep in step"],
        rec: "R"
      },
      {
        title: "Declare a Solid library once, so programs can use Solid Primitives",
        text: "One declaration and a program reaches a whole Solid library.",
        links: [[`${A}#rx-steal`, "after the ranked list"]],
        risk: ["medium", ""],
        loe: ["M", ""],
        cx: [3, ""],
        rec: "R"
      },
      {
        title: "A word for \"updating\"",
        text: "Show that a new answer is coming without hiding the old one, e.g. if the matches are updating. A NEW phrase, a proposal: it could be misread against a first load, or a property named updating.",
        links: [[`${A}#rx-steal`, "the proposal"]],
        risk: ["medium", "ambiguity"],
        loe: ["S", ""],
        cx: [2, "a new phrase"],
        rec: "R"
      },
      {
        title: "AI text that grows on screen",
        text: "A model's answer drawn word by word, through Solid's from() and a new Spell line (needs your OK).",
        links: [[`${A}#data-ideas`, "idea 10"], [`${S}#s10-6`, "later in streams"]],
        risk: ["medium", "a new phrase"],
        loe: ["M", ""],
        cx: [2, ""],
        rec: "R"
      },
      {
        title: "A test of how well AIs write Spell, against React",
        text: "A number for \"AIs write Spell well\"; its own epic.",
        links: [[`${A}#rx-steal`, "ranked 6"]],
        risk: ["low", ""],
        loe: ["M-L", ""],
        cx: [0, "outside the product"],
        rec: "R"
      }
    ]
  },
  {
    group: ["later", "Later"],
    items: [
      {
        title: "Server-rendered, streamed Spell sites",
        text: "A page arrives drawn, its places filling in as they answer, with only the program viewers hydrating. Builds on keeping server-drawn shadow roots.",
        links: [[`${A}#n-rendering`, "the idea"], [`${A}#core-1-12`, "Solid's rendering"], [`${A}#data-ideas`, "idea 9"]],
        risk: ["high", ""],
        loe: ["L", ""],
        cx: [7, "a server half to every page"],
        rec: "R"
      },
      {
        title: "A site generator, and head tags from Spell lines",
        text: "Every address of a Spell site written out with a sitemap and Open Graph pictures; its title is and its picture is become head tags (new phrases, need your OK).",
        links: [[`${A}#n-rendering`, "the ideas"]],
        risk: ["medium", ""],
        loe: ["M", ""],
        cx: [3, ""],
        rec: "R"
      },
      {
        title: "Server actions in Spell",
        text: "An action that runs on the server, compiled to a place operation, optimistic on the page (a new phrase, needs your OK).",
        links: [[`${A}#n-data`, "the idea"]],
        risk: ["medium", ""],
        loe: ["L", ""],
        cx: [5, ""],
        rec: "R"
      },
      {
        title: "Local-first sync as a library for Solid",
        text: "Spell's pending changes, save queue and healing as a library: offline edits, many tabs and three-way merges for any Solid app. No Solid library does this.",
        links: [[`${A}#n-data`, "the idea"], [`${A}#h-data`, "what places do"]],
        risk: ["medium", "a public API to keep"],
        loe: ["L", ""],
        cx: [3, ""],
        rec: "R"
      },
      {
        title: "A table engine under <ui-table>",
        text: "Grouping, pivots and column filters fed by place queries, on TanStack Table (a new dependency for you to OK).",
        links: [[`${A}#n-rendering`, "the idea"]],
        risk: ["medium", "a dependency"],
        loe: ["L", ""],
        cx: [5, ""],
        rec: "R"
      },
      {
        title: "Time travel for programs",
        text: "Scrub a running program back and forth, on the undo stack.",
        links: [[`${A}#n-language`, "the idea"]],
        risk: ["medium", ""],
        loe: ["L", ""],
        cx: [5, ""],
        rec: "R"
      },
      {
        title: "Run the TypeScript target in the browser",
        text: "Compiled TypeScript Spell runs in the runner, through esbuild-wasm and Solid's compiler.",
        links: [[`${A}#n-language`, "the idea"]],
        risk: ["medium", ""],
        loe: ["M", ""],
        cx: [3, ""],
        rec: "R"
      },
      {
        title: "A third language, a non-DOM target, AI in the loop as a library",
        text: "The vocabularies proven past English and Spanish (plurals, genders, right-to-left); programs drawn on a canvas or in a terminal; Change This and Explain This for any Solid app.",
        links: [[`${A}#n-language`, "the ideas"]],
        risk: ["medium", ""],
        loe: ["L each", ""],
        cx: [6, ""],
        rec: "R"
      }
    ]
  }
]
