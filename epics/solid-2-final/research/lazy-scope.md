# Keeping what runs small:  lazy back-ends, pages and widgets

Research notes for epic `solid-2-final`'s Web performance page (agent `solid-2-final-lazy-scope`, 2026-11-20).
- Owen's ask:  "a site might connect to more than one back-end, only using the second one on certain pages.
  Can we defer loading the second api.spell until it's needed?
  Can we defer loading pages/widgets until they are loaded, e.g. have a stub for the page, load it only when shown?"
- Read from the worktree `~/www/spell.worktrees/solid-2-final`.  Paths are from the kit's root.
- `(inferred)` marks a guess, `(estimate)` a number not measured;  everything else was read in the code or measured.
- Sizes:  raw bytes of the compiled files in `app/build/spaces/...`, gzip `-9` (brotli would be ~10-15% smaller).

## 0. The answer in one screen

1. **Data is already lazy;  code is not.**
   - A place (a back-end) is MADE on its first read or write, not when it's declared:  no request, no socket, until then.
   - But a project's code is ONE module:  every `.spell` file, every `api.spell`, every page, compiled and run at start.
   - And every project it imports is fetched, linked and run before it starts.
2. **In a project with servers, the back-ends' types are most of the code.**
   - Public Servers (six servers, a page each):  220 KB compiled, **84% of it the six `api.spell` files' types**
     (GitHub's alone 90 KB raw, 10 KB gzip).  The pages that draw them are 3-6 KB each.
3. **The editor already compiles a page only when it's shown**, for pages alone in a file
   (`project.pagesInPlay`, `SiteHost.pageNeeded()`).  A built site has nothing like it yet.
4. **The cheapest win:**  a built site's compiled file without its comments and editor-only `declaredAt` marks:
   Public Servers 220 KB -> 146 KB raw, 30.5 -> 18.9 KB gzip (measured), no splitting at all.
5. **The biggest win:**  the compiler writes each page (and what only it uses, the `api.spell` behind it included)
   as its own chunk;  the site's `pageNeeded()` imports it when the page is first shown, prefetched on hover.
   - The site table already names pages by class NAME (`static pages = [{ page: "FilmPage" ...}]`),
     so the router needs no change:  only its host.
6. **What would break:**  a type's members can come from any file (`hoistClassMembers()`), so pieces are chosen by
   what's reachable, never one per file;  restoring remembered things, `core.fromJSON()` and carry-over want every class;
   pending writes left from the last visit go out only when their place is first used (already true today);
   offline needs every chunk cached.
7. **For a Spell author:  nothing to write.**  The compiler decides from where things are used.
   Two optional lines are offered below as PROPOSALS, for Owen's OK.

## 1. Today:  what a large project loads at startup

### 1.1 The steps, in order

1. **The page loads the runner and its runtime.**
   - A cloud app (`app/src/spaces/server/node/routes/cloudApp.html`) loads `<spell-viewer>`:
     391 KB brotli eager, the same for every program (perf-bundle.md, section 2).
   - `<spell-viewer>` fetches the runtime's text once, then imports a fresh copy per viewer from a `blob:` URL
     (`app/src/app/runner/loadRuntime.ts`).
2. **It fetches the program:  ONE file**, `<Project>.spell.js`, and its source map
   (`runProgram()`, `app/src/app/runner/SpellAppRunner.tsx` line ~439).
   - Also the program's words (`ownWords()`), before it runs.
3. **Every project it imports is fetched and linked first**, deepest first, each onto its own `blob:` URL
   (`runCompiled()`'s `link()`, `app/src/app/runner/runCompiled.ts`).
   - Nothing is lazy here:  the program's `import { ... } from "@spell/project/..."` must resolve before it runs.
   - e.g. Star Wars Site (34 KB) imports Star Wars (93 KB), which declares TWO servers, SWAPI and Wikipedia;
     the site's pages never name Wikipedia, and its types still load and run (inferred from both files).
4. **The program's module runs, top to bottom.**
   - Every class of every file:  each property a `static { this.declareProp(...) }` block run as the class is made.
     Public Servers runs 574 of them;  GitHub's types alone 284, in 16 classes.
   - Every one-of-a-kind page is made:  `export const filmPage = new FilmPage()` (Star Wars Site, line 315),
     and an app's pages as its fields (`"github" is a new github page`, `PublicServers.spell`).
     Making one runs its `create()`, but reads nothing (inferred:  reads are in getters and drawings).
   - Every view's custom element is defined, a microtask after its class
     (`core.defineElement()`, `parser/src/core/elements.ts` line 118, through the page's `elementDefiner`).
   - Every place line runs `core.place(...)` (`parser/src/core/saved.ts` line 1363).
5. **The first `core.place()` loads `spell/places`**, by a dynamic `import()` (`ProgramPlaces.loadFolder()`, line 235):
   one chunk for every kind of place, 47-52 KB brotli (perf-bundle.md, section 3).
   - A program with no place never loads it.
6. **Places with a sign-in start at once** (`KINDS_WITH_SIGN_IN`:  atmosphere accounts, the cloud;  line 163):
   - each is made and added as the program starts, and its sign-in followed, so `them` reads the person
   - an atmosphere account someone signed in to last visit loads `@atproto/oauth-client-browser` and asks its host
     for the session (`AtProtoSignIn.restore()`, `src/places/AtProtoSignIn.ts` line 146):  a library
     (288 KB of `dist/` on disk, maybe 40-60 KB brotli as shipped, estimate) and a network round trip, at start,
     whether or not this visit's pages use that account
7. **Every other place is made on its first read or write** (`ProgramPlaces.placeFor()`, line 354):
   - its pending writes from the last visit go out then (`Places.add()`, `src/places/Places.ts` line 78)
   - its first reads go together then (`askFirstReads()`, line 525)
   - a room's socket opens then (`LiveRoomPlace`:  "Connects at its first use", `src/places/LiveRoomPlace.ts` line 130)
   - polling runs only while something reads it and the page is visible (`pollWhileVisible()`)
8. **The first page draws.**
   - A site shows the page its address names (`SiteBase.showAddress()`, `parser/src/core/classes/SiteBase.ts` line 199).
   - Only what it draws is read.  A read is dropped when the last drawing reading it leaves (`leave()`).
   - Each Spell UI tag it uses loads its family on first sight (`<ui-root>`'s `MutationObserver`, `RootLoader`):
     widgets are already lazy, per family.

### 1.2 What's lazy already, and what isn't

| Thing | At start | On first use | Where |
| --- | --- | --- | --- |
| The places engine (`spell/places`) | if any place is declared | | `saved.ts` line 235 |
| A place's connection, first reads, polling, socket | | yes | `ProgramPlaces.placeFor()`, `LiveRoomPlace` |
| A sign-in place (atmosphere, cloud) | made;  session restored if someone was signed in | | `loadFolder()` line 250, `AtProtoSignIn.restore()` |
| Its OAuth library | only if someone was signed in last time | else on Sign in | `AtProtoSignIn.makeClient()` |
| Excel's library, the sample place | | yes | `Workbook`, `spell/places/SamplePlace` |
| A place's TYPES (its `api.spell`) | **yes, all** | | one compiled module |
| Every page's code, its things made | **yes, all** | | one compiled module |
| Every imported project | **yes, all, before the program runs** | | `runCompiled()`'s `link()` |
| Every view's element definition | **yes, all** (a microtask after its class) | | `core.defineElement()` |
| Spell UI families | | yes, as their tags appear | `RootLoader`, `UIRoot.tsx` line 332 |
| Reads of a page's data | | yes, as it draws | `core.drawRead()` |

### 1.3 What a big project costs, measured and estimated

Measured on the compiled files in `app/build/spaces/@spell/` (`awk` by each file's `// ## ` heading):

| Project | Compiled raw | gzip | Back-ends | Back-end types' share |
| --- | --- | --- | --- | --- |
| Public Servers | 220,731 | 30,550 | 6 web servers | 185 KB of 220 KB (84%) |
| Star Wars (imported by Star Wars Site) | 93,012 | 16,044 | SWAPI, Wikipedia | (not split by section) |
| Poke Spell | 98,089 | 15,448 | 1 | |
| Star Wars Site (its own) | 33,940 | 6,347 | + Star Wars's two, and a device place | |
| Solitaire (no back-end) | 36,025 | 9,681 | 0 | |

Public Servers, by section (raw bytes):

| Section | Bytes | | Section | Bytes |
| --- | --- | --- | --- | --- |
| GitHub's types (`GitHub.api.spell`) | 90,096 | | GitHub page | 6,471 |
| Open Library's types | 32,606 | | REST Countries page | 6,072 |
| The Met's types | 26,613 | | The Met page | 4,223 |
| REST Countries' types | 14,732 | | JSONPlaceholder page | 4,006 |
| JSONPlaceholder's types | 13,964 | | Open-Meteo page | 3,579 |
| Open-Meteo's types | 7,078 | | the app | 3,579 |

- GitHub's section alone:  10.4 KB gzip;  76 KB raw without its comments.
- Comments and `declaredAt` (each property's place in its source, for the editor) are a third of the file:
  without them, 146,300 raw / 18,878 gzip (measured with `grep -v` and `sed`).
- **Per extra back-end (estimate):**
  - code:  its types, 7-90 KB raw, 1-10 KB gzip, from ingest's output;  a hand-written one is far smaller
  - start-up work:  one class per type, one `declareProp` per field:  ~1-3 ms on a laptop for GitHub's 284,
    ~5-12 ms on a 2-year-old Android phone (inferred:  4x, as perf-code.md assumes)
  - network:  NONE until it's read, unless it has a sign-in (step 6)
  - memory:  its classes and schemas, small;  its rows, forever, once read (`PlaceCache`, perf-code.md section 7)
- **Per extra page (estimate):**
  - code:  3-6 KB raw, ~1 KB gzip for Public Servers' pages;  the Spell UI guide's pages are bigger:
    407 `.spell` files, 2 MB of source (measured), compiled perhaps 3-5 MB raw (estimate) if it were built whole
  - start-up:  its class, its one instance made, its views' tags defined;  nothing read
- So for a site of 6-10 pages and 2-3 servers the code is 100-250 KB raw, 15-35 KB gzip:
  real, but small beside the runtime's 391 KB brotli.
  It matters for a site the size of the Spell UI guide, for many imported projects, and for parse and run time on a phone.

## 2. Lazy back-ends

### 2.1 What's already there

- **The connection is lazy.**  A place is made, and connects, on its first read or write (section 1, step 7).
  - So "connect only when first used" is true today for every place without a sign-in.
- **What isn't:**
  1. its types' CODE, in the one module
  2. a sign-in place, made and restored at start
  3. the places engine, loaded at start if any place is declared (it's one 50 KB chunk, fine to keep)

### 2.2 Defer a sign-in until the place is used

- The sign-in is made at start so `them` (who's at this page) is right before anything reads it (`followSignIn()`).
- With TWO sign-in places, only the program's FIRST place that has people says who's here (`core.currentPerson()`,
  `saved.ts` header).  So only that one needs restoring at start;  the others can wait for their first use.
  - Effort S.  Risk low.  Gives:  no OAuth library and no round trip at start for a second account nobody touches.
- Even the first one could restore lazily when nothing on the first page reads `them` (inferred:  the compiler's
  `firstReads` gathering could also note "reads the person").  Effort M.

### 2.3 A back-end's code as its own chunk

What it would take:

```js
// the program's main chunk:  what the place line says, and a stub for each type
export const github = core.place(new Github(), { name: "github", ..., load: () => import("./GitHub.chunk.js") })
// pages and code that name `User` before the chunk lands get it through the runtime, by name
core.lazyClass("User", "github")
```

```js
// GitHub.chunk.js:  every type saved in github, and every member any file adds to them
import { core, Thing } from "@spell/core"
export class Issue extends Thing { ... }
export class User extends Thing { ... }
```

- The place's first read (`ProgramPlaces.placeFor()`) is already `async` behind `load()`:  it would await
  the chunk too, then go on.
- But code that names a type is NOT only a read:
  - a page's own properties:  `its "showing" is a user` writes `core.linked(this, "showing", User)`,
    `instanceof`, `static` schemas (`type: "User"`, by name, which is fine)
  - `<extend>`:  GitHub.spell adds members to GitHub.api.spell's types, and the compiler moves them INTO the class
    (`hoistClassMembers()`, `parser/src/spell/hoistClassMembers.ts`)
  - so the types and every page using them travel together:  the right piece is "a back-end AND the pages that alone
    use it", found by reachability (section 4), not "an `api.spell` file"
- Names that need the class at once, by name:
  - `core.fromJSON()` and remembered props (`core.remember()`, read before the program starts)
  - carrying things over a live edit (`core.carryOver()`), the Thing Explorer, `CLASSES_DECLARED`
  - `PlaceThings.classNamed()`, making rows into things:  fine, its rows come only from a read of that class
  - each of these would wait for the chunk (`core.classNamedLater()`, inferred), or the editor keeps one module (below)

### 2.4 What breaks, and what doesn't

1. **Offline copies (`- keep a copy on this device`):**  the copy is in IndexedDB, read through the place;
   it needs the chunk's code, so offline means the chunk must be cached too (a service worker's precache list).
   Nothing changes in `DeviceCopy`.
2. **"Everyone's changes in one order"** (a room's `Referee`):  per room, on the server.  Unchanged:  a room
   connects on first use today.
3. **Pending writes across places:**  `PendingChanges` is one list PER PLACE (`Places.pending`, by name), so there's no
   cross-place order to keep.
   - **Already true today, worth fixing on its own:**  writes left from the last visit go out only when their place is
     added (`Places.add()` line 78), which is its first use.  A write made offline to a place this visit never touches
     waits until a later visit touches it (inferred from the code;  check with a test).
   - Lazy code makes that more likely.  Fix:  at start, ask `TabCopies` which place names have pending writes, and
     make just those places (and load their chunks) in the background, at idle.
4. **Type checks in the editor:**  unchanged.  The parser reads the whole project and its imports' declarations;
   splitting is only in what the writer emits.
5. **The editor's live run:**  keep ONE module there (section 4.3).  Splitting is for a built site and the cloud.
6. **Sign-in bars:**  shown on first use already (`startSignIn()`):  unchanged.

## 3. Lazy pages and widgets

### 3.1 What's already there

- **In the editor, pages alone in a file compile only when shown** (epic `notebook` P10):
  - `project.pagesInPlay` (`parser/src/spell/SpellProject.ts` line 313):  the alone pages compiled now;
    the rest are known by their head alone (`SP.AlonePage`:  its name, read with no parse, "351 pages in about 4 ms")
  - the site asks its host before it shows a page:  `core.siteHost.pageNeeded(className)`
    (`SiteBase.showAddress()` line 211;  the type, `parser/src/core/core.types.ts` line 506)
  - the editor's host adds the page, recompiles, and the live run takes it in (`editor.pageNeeded()`,
    `app/src/app/editor.ts` line 355)
  - while it waits the site shows its "waiting" state (`showNow({ kind: "waiting" })`)
- **The site table names pages by class name**, never by import:
  `static pages = [{ name: "film page", page: "FilmPage", address: "/films/:film" }]` (Star Wars Site, line 644).
  Dialogs too:  `{ name: "review dialog", view: "ReviewDialog" }`.
- **Spell UI widgets load per family on first sight**, and every tag is DEFINED early, from the root's catalog, then
  ATTACHED when its family lands (`src/element/AGENTS.md`, "Defined early"):  pending elements keep their values,
  `:state(pending)`, `whenAttached(tag)`.
- **Solid's async drawing is used** for waited values:  `createDeferred()` + `<Loading>` (`parser/src/core/waiting.ts`).
- **A long list draws in a window** (`drawnInWindow()`), and reads its next page as it nears the view.

### 3.2 A page as a stub, its code loaded when first shown

For a built site, the host's `pageNeeded()` becomes an `import()`:

```js
// main chunk:  the site, its table, a stub per page
export class StarWarsSite extends Site {
  static pages = [{ name: "film page", page: "FilmPage", address: "/films/:film", chunk: "film-page" }]
}
// the host, in the runner (not core):  load the page's chunk, then let the site show it
const host = {
  pageNeeded: (className) => chunks.load(chunkOf(className)).then(() => true)
}
```

- `SiteBase` already waits for `pageNeeded()`, and already finds the page instance by class name
  (`pageInstance()`, line 754, through `core.RUNTIME.pages`).  So the chunk only has to run:
  its `export const filmPage = new FilmPage()` registers it.
- `go to the film page` and links go through `showAddress()`:  the same path.
- `the film page`, read from ANOTHER page's code, needs a binding that exists before the chunk:
  - inferred:  compile a cross-chunk one-of-a-kind as `core.pageNamed("FilmPage")`, which answers the instance once
    loaded, else a waited value (`core.waitedValue`), so the drawing shows "…" for a moment.
- Dialogs and sidebars the same:  `openOverlay()` reads `core.things.classNamed(entry.view)` (line 260);
  it would await the chunk first.

### 3.3 Solid 2's `lazy()` and `<Loading>`

- `lazy(() => import(...), { export })` with `.preload()` and `lazyModule()` (solid-features.md, rows 194-195):
  right for the EDITOR's own big parts (section 4.4), not needed for Spell pages:
  - a Spell page isn't a Solid component:  it's a Thing drawn through `SiteBase`, and the site already has
    its own waiting state;  `pageNeeded()` is the seam
  - a page's own reads already suspend through `createDeferred()` + `<Loading>`, so a page that arrives and then waits
    for data shows one waiting state, not two (inferred:  check the site's "waiting" and a page's "…" don't stack)
- Solid Router's preloading words are a good model for Spell's (`intentPreload`, `viewportPreload`, `tapPreload`):
  section 3.5.

### 3.4 Views (widgets) defined on first use

- Today every view's element is defined at start (`core.defineElement()`):  cheap per tag (estimate:  0.05-0.2 ms each),
  but it needs the class, so it pins the view's code in the main chunk.
- With views in chunks, use Spell UI's own pattern, not `customElements.whenDefined()`:
  - the main chunk names every tag of the program (the compiler knows them:  `elementTagFor(project, Class.name)`)
  - the page defines them all early, pending;  each ATTACHES when its chunk lands, keeping the values handed to it
  - a pending tag on screen asks for its chunk, as `<ui-root>`'s observer asks for a family
- So a view used on one page only, `<starwars-film-card>`, rides in that page's chunk;  a view used on two pages goes in
  a shared chunk, or the main one (section 4).

### 3.5 Prefetching

When to fetch a chunk before it's needed, cheapest first:

| When | How | Cost if wrong |
| --- | --- | --- |
| A link is hovered or pressed | `pointerenter` / `pointerdown` / `focus` on an `<a>` whose address the site has a page for (`SiteBase.pageFor()`):  `host.preload(className)` | one small chunk |
| A link comes into view | one shared `IntersectionObserver` over the site's links (Spell UI's `Visibility` is on one already) | a few chunks |
| The browser is idle, after the first page settled | the site's navigation pages, nearest first;  `requestIdleCallback` where it exists, else a timeout | every page's chunk |
| The first page's own links, on a fast connection | `<link rel="modulepreload">` written by the build for the first page's chunk | |

- Skip prefetch when `navigator.connection.saveData` is on, or the connection says `2g` (Chrome only:  a hint).
- Prefetch the CODE only, never a place's reads:  a read costs the server, and may cost money (a rate limit).
  - Except a page's `firstReads` on press (not hover), which a phone pays anyway a moment later (Owen to choose).
- On a phone over 5G, a 1-10 KB gzip chunk is one round trip, ~50-150 ms (estimate):  hover prefetch on desktop,
  press prefetch on a phone (no hover there), hides most of it.

### 3.6 Keeping what's shown alive vs letting far pages go

- What `SiteBase` keeps today:
  - each LAYOUT is drawn once and kept, hidden, when another shows ("Drawn ONCE per layout, and kept", line 334)
  - each page's INSTANCE is kept (one of a kind);  its drawing goes when another page shows (inferred from
    "going to a page in the same layout redraws only the page")
  - its reads are let go as its drawing leaves:  the last reader aborts the request (`leave()`)
- What can't be let go:  a module's code, once imported.  The browser's module map never drops one
  (perf-code.md section 7).  So unloading a page means its DOM, its reads and its rows, never its code.
- Ideas, for a phone:
  - keep the last 2-3 pages' drawings, hidden (Back is instant), drop older ones  (Effort M)
  - let go of a place's cached rows nothing reads, past a ceiling (`PlaceCache` keeps them forever today)
    (Effort M;  it's the memory that grows, not the code)
  - leave the page `bfcache`-friendly (no `unload` listener, sockets closed on `pagehide`), so the browser's own
    Back is instant on a whole-page move (inferred:  check `LiveRoomPlace` closes on `pagehide`)

## 4. The compiler and bundler

### 4.1 What the compiler does today

- **A project compiles to ONE module.**  `SpellProject.compiler`'s "Combining output" task hands every file's AST to
  `combineCompiled()` (`parser/src/spell/SpellProject.ts` line 1185):
  - `subclassImportedTypes()`:  a class of our own for each imported type we add to
  - `hoistClassMembers()`:  each member, from ANY file, moved into its class's body
  - `hoistClassesMadeAsItLoads()` and `runningCodeLast()`:  every file sets itself up before any file's steps run
  - one header of imports:  `@spell/core`, each imported project, each `call native` code file
- **The editor already limits a compile to the pages in play** (`filesInPlay`, line 322), so the pieces exist:
  a page alone in its file is known before it parses, and compiles on its own when it comes into play.
- **The runner links modules itself**, onto `blob:` URLs (`linkModule()`), with NO import map:
  each runner needs its own `@spell/core`.

### 4.2 What has to change for chunks

1. **A module graph from the project's scope.**
   - Nodes:  types, pages, views, places, top-level things.
   - Edges:  what each one's code names (the scope knows every reference;  `P.ReadGathering` already walks a
     program for what it reads from each place:  `parser/src/parser/writers/ReadGathering.ts`).
   - Roots:  the app or site, its main layout, its not found and error pages, everything run at start
     (`runningCodeLast()`'s `runs`), and anything remembered.
2. **Pieces by reachability, not by file.**
   - Each page (and each dialog and sidebar) is an entry;  what only it reaches goes in its chunk.
   - What two entries reach goes in a shared chunk, or the main one if small (a size floor, ~2 KB gzip, estimate).
   - A type travels with every member `hoistClassMembers()` gives it:  splitting happens AFTER hoisting.
   - A place's types follow the type:  GitHub.api.spell's types and the GitHub page land in one chunk by themselves.
3. **Cross-chunk names become lookups by name:**
   - a class:  `core.classNamed("User")` where a chunk names another's class (inferred:  rare, as types used on two
     pages go in the shared chunk)
   - a one-of-a-kind page:  `core.pageNamed("FilmPage")` (section 3.2)
   - the site table and `savedIn` already use names
4. **The writer emits several modules;  the runner links them.**
   - Each chunk imports `@spell/core` and the main chunk, as `@spell/project/self` (a new specifier `linkModule()` maps).
   - `SourceMarks` gives each chunk its own source map.
   - The declarations, scopes and words files stay whole, or split per chunk later (they're for the editor and the
     Thing Explorer).
5. **A built site writes chunk files beside the program:**  `StarWarsSite.spell.js`, `StarWarsSite.film-page.spell.js`
   ...;  `<spell-viewer>` maps chunk names to URLs as it does `importUrl()` today.
6. **Imported projects, tree-shaken:**  a project importing another loads only the types it names
   (Star Wars Site names no Wikipedia type).  The same graph over the imported project's declarations
   (`SpellDeclarations`) says which;  its built file would need chunks too.  Effort L.
7. **The built file drops what only the editor reads:**  comments, `declaredAt`, `core.heading()` calls
   (inferred:  headings are for the console and the Thing Explorer).  Section 1.3:  a third of the file.

Two shortcuts before the graph:
- **Alone pages first.**  A page alone in its file is ALREADY a unit the parser treats on its own:  emit each one as a
  chunk, everything else as the main chunk.  No graph needed;  works for the Spell UI guide's 400 pages at once.
- **`api.spell` + its one page.**  A project of servers, each with one page using it (Public Servers' shape):
  group by "these files only reach each other".

### 4.3 The editor's live compile vs a built site

- **Live (the editor's Run):  keep one module.**
  - It recompiles on every pause and re-runs from a fresh `blob:` URL;  carry-over, the Thing Explorer and
    `runLine()` all want every class.
  - It already limits itself with `pagesInPlay`, so a huge site stays small there.
  - perf-code.md, section 7:  every run's module stays in memory for the life of the page;  more chunks per run would
    add to that, not take away.
- **Built (`spell compile`, the cloud's `/apps/<project>`, a static site):  chunks.**
  - The compile is not live, so the graph is worth its cost there.
  - The editor could still try the chunked build in Run, behind a setting, to test it.

### 4.4 The editor doing the same for its own big parts

perf-bundle.md has the measured list;  in lazy-scope terms:
- **Routes:**  `app/src/app/pages/routes.tsx` imports every page statically (the Site Editor, the place reference,
  the theme editor, the project chooser).  Solid's `lazy()` per route, with `.preload()` on hover of the links to them.
  Effort S.
- **Activation by language, as VS Code does:**  the Spanish grammar and dictionaries only for a Spanish project;
  the CSS language service only when a CSS file or a `<css>` block opens (perf-bundle.md, items 3 and 5).
- **The first dialog's 543 KB brotli** (`modals-*.js`):  split per dialog, `lazy()` each, preload on the menu's open.
- **The Inspector and palette:**  already lazy in places (`EditorTheme.tsx` imports `./Inspector` on demand);
  perf-bundle.md's budget names them.

## 5. How a Spell author sees it

- **Ideally nothing to write.**  The compiler decides from where things are used:
  - a page, and what only it uses, loads when it's first shown
  - a server's types load with the first page that reads it
  - a server is reached only when something reads or writes it (already)
- **What an author might want to say, as PROPOSALS needing Owen's OK** (none is built, none is needed to start):

1. **Load everything at the start**, for a kiosk, a demo, or a site used offline:

   ```spell
   my site is a site
   	- it loads all its pages at the start
   ```

   - Could be misread:  "loads" sounds like reading DATA (the places), not the pages' code.
     A reader may expect every page's lists to be fetched at start.
   - Alternative wording:  `- all its pages are ready at the start`, which says what a visitor gets.
   - Or none:  make "works offline" the switch instead (a site that's kept for offline caches every piece).

2. **Fetch a page's data before it's shown**, on a link press:

   ```spell
   	- it has a film page at "/films/:film", ready ahead
   ```

   - Could be misread:  "ready ahead" may read as "made at start", or as caching the page for ever.
   - Probably not needed:  prefetching the page's CODE on hover / press is free of meaning for the author,
     and the data's first reads already go together.  Offer only if a real site asks.

- **What the author sees in the editor:**  nothing new in Edit;  in Run a page shows its waiting state for a moment
  the first time (already true for pages alone in a file).
- **What the editor could show:**  in the Site Editor, each page's chunk size beside its address (a budget), and which
  server it pulls in.  No words in the program.

## 6. Ranked ideas

| # | Idea | What it gives people | Builds on | Effort | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | A built program without comments, `declaredAt` and other editor-only marks | 30-40% smaller program file, faster parse on a phone (Public Servers 30.5 -> 18.9 KB gzip, measured) | the JS writer's options (`writerOptions()`) | S | low:  the editor keeps its full file |
| 2 | Restore only the FIRST sign-in place at start;  others on first use | no OAuth library or round trip at start for an account a page doesn't use | `followSignIn()`, `KINDS_WITH_SIGN_IN` | S | low:  `them` comes from the first place only already |
| 3 | Send last visit's pending writes at idle, for every place that has some | writes made offline go out even if this visit never opens that place (a fix today, and needed before lazy code) | `TabCopies`, `Places.add()` | S | low |
| 4 | The editor's routes lazy, preloaded on hover | smaller editor first load | Solid's `lazy()`, `routes.tsx` | S | low |
| 5 | Each page alone in its file as its own chunk in a built site;  `pageNeeded()` imports it | a big site (the Spell UI guide's ~400 pages) starts with one page's code, not all | `AlonePage`, `pagesInPlay`, `SiteHost.pageNeeded()` | M | medium:  cross-page names need lookups by name |
| 6 | Prefetch a page's chunk on hover / press / in view / idle | the first visit to a page shows at once | #5, `SiteBase.pageFor()`, `Visibility` | S after #5 | low;  skip on Save-Data |
| 7 | Views pending until their chunk lands (Spell UI's "defined early" pattern for Spell's own views) | a view used on one page loads with that page | `core.defineElement()`, `DOMElement.whenAttached()` | M | medium:  `useElement()` order |
| 8 | Chunks by reachability (a module graph from the scope):  a server's types with the pages that alone use it | the second back-end's code loads only on its pages:  Owen's ask, in full | #5, `ReadGathering`, `hoistClassMembers()` | L | medium-high:  remembered things, `fromJSON()`, carry-over need classes by name, async |
| 9 | Imported projects tree-shaken to the types used | Star Wars Site stops paying for Wikipedia | #8, `SpellDeclarations` | L | medium |
| 10 | Keep the last 2-3 pages drawn, hidden;  drop older drawings and rows nothing reads | Back is instant;  memory stays flat on a phone | `SiteBase`'s kept layouts, `PlaceCache` | M | low-medium:  a page's state between visits |
| 11 | A service worker precaching every chunk, for a site kept offline | lazy and offline together | #5-#8, the delivery work in perf-bundle.md section 6 | M | medium:  cache versioning |
| 12 | Each chunk's size in the Site Editor, beside its page | authors see what a page costs, with no words to learn | #5 | S after #5 | low |

## See also

- [perf-bundle.md](perf-bundle.md):  every shipped bundle, measured;  the editor's own lazy candidates
- [perf-code.md](perf-code.md):  the editing pipeline, memory on a phone, modules that never unload
- [spell-today.md](spell-today.md):  routers (2.8), places (2.3, 2.4)
- [data-paradigm.md](data-paradigm.md):  how a read and a write happen, step by step
- [solid-features.md](solid-features.md):  `lazy()`, `lazyModule()`, Solid Router's preloading
