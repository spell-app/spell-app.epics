# Spell today:  how Spell does each thing Solid 2 and its ecosystem do

Research notes for epic `solid-2-final`'s "Solid 2 analysis" page (agent `solid-2-final-spell-map`, 2026-11-20).
- Read from the worktree `~/www/spell.worktrees/solid-2-final` (branch `solid-2-final`, on Solid `2.0.0-rc.21`).
- Facts with repo-relative paths.  Line counts are `wc -l` of the files named (comments included).
- Counts are occurrences in CODE (each big folder's `src/`, `scripts/`, `site/`, `vscode/`, `hooks/`, `bin/`;
  the kit's `src/`), with TESTS in brackets where shown.
  Generated bundles left out (`_assets/`, `__pack/`, snapshots, icon packs, `app/app/static/`).
- `(inferred)` marks a guess;  everything else was read in the code or its docstrings.
- The scripts that made the tables:  `count.sh`, `count2.sh` in this agent's scratchpad (not kept).

## 0. The picture in one screen

- Spell draws with Solid 2 everywhere:  JSX, `<Show>` / `<For>`, `render()`, `@solidjs/h` for compiled Spell,
  `<Errored>` boundaries, a few `<Loading>`s.  ONE Solid per page, shared by the editor, Spell UI and every running
  program (`agents/solid/solid-2.md`, "One Solid per page").
- But Spell keeps its STATE out of Solid, on two home-grown engines:
  - spell cells (`src/util/reactive/`, 1,786 lines):  spell Things, the editor store, compiled programs;
    bridged into Solid by `enableExternalSource` (`bridgeSolid()`)
  - Spell UI's reactive members (`src/element/Reactive.ts`, 1,377 lines):  `@state`, `@derived`, `@onChange` ...
    over a record per instance, with a Solid notifier signal per member
  - Why both:  Solid 2 STAGES writes, and Spell needs read-after-write (`set x to 1` then `print x`).
  - They don't see each other's derived values (code debt "Two reactive engines", `spell.epics/agents/CODE-DEBT.md`).
- Solid 2's NEW data layer is entirely unused:
  - no `createStore`, `createProjection`, `createOptimistic`, `action()`, `refresh()`, `isPending()`, `latest()`,
    `<Reveal>`, `dynamic()` (0 imports anywhere)
  - Spell's own instead:  `Loadable` / `PlaceResult` (async data), `PendingChanges` (optimistic writes, offline,
    3-way merge), `ActionQueue` (actions), `PageStore` (epic pages' stores), `Places` (the whole data layer, 17,155
    lines in `src/places/`, 7,403 more in `src/server/places/`)
- Async in Solid's own terms IS used in two places:
  - compiled Spell's "waited values" are `createDeferred()` + `<Loading>` (`parser/src/core/waiting.ts`,
    `parser/src/core/saved.ts`)
  - the app's lazy CodeMirror, markdown and reference panes (`lazy()`, async `createMemo`, `<Loading>`)
- The ecosystem:  ONE library, `@solidjs/router@next`, in ONE place (the editor app's routes, 88 lines).
  - No `@solidjs/meta`, no SolidStart, no Solid Primitives, no Kobalte / Ark / Corvu, no TanStack, no Motion,
    no `@solidjs/testing-library`, no Solid devtools in code.
  - `@solidjs/start-devtools` is only an optional PEER in the kit's `package.json` (inferred:  the Vite plugin asks for it).
- Spell instead built:  its own custom-element layer (`spell/element`, from `@solidjs/element`), a 96-family UI kit
  (Spell UI), a static SEO render (no hydration), three routers (server, Spell sites, docs site), forms, i18n in two
  languages, motion, undo, preferences, realtime rooms, an offline write queue, sign-in, and a whole language.

## 1. Solid API counts per folder

Code (tests).  `src/` is the kit's own;  the others are the big folders.

| API | src/ | parser/ | ui/ | epic/ | app/ |
| --- | --- | --- | --- | --- | --- |
| `createSignal` | 6 (16) | 0 (2) | 11 (2) | 2 (0) | 189 (21) |
| `createMemo` | 11 (0) | 9 (7) | 0 (1) | 64 (0) | 110 (6) |
| `createEffect` | 12 (7) | 2 (0) | 4 (4) | 0 (0) | 75 (7) |
| `createRenderEffect` | 3 (0) | 0 (0) | 6 (1) | 0 (0) | 0 (9) |
| `createStore` | 0 | 0 | 0 | 0 | 0 |
| `createProjection` | 0 | 0 | 0 | 0 | 0 |
| `createOptimistic(Store)` | 0 | 0 | 0 | 0 | 0 |
| `action(` (*) | 36 | 22 | 23 | 24 | 54 |
| `refresh(` (*) | 19 (0) | 7 (8) | 22 (0) | 7 (60) | 7 (0) |
| `isPending` (*) | 5 (7) | 0 | 2 | 11 (5) | 0 |
| `latest(` (*) | 0 | 0 | 1 | 0 | 0 |
| `createDeferred` | 0 | 5 | 0 | 0 | 0 |
| `<Loading` | 0 | 5 | 0 | 0 | 11 |
| `<Errored` | 2 | 2 | 0 | 0 | 2 |
| `<Reveal` | 0 | 0 | 0 | 0 | 0 |
| `<For` | 4 | 2 (1) | 113 | 38 | 122 (1) |
| `<Show` | 5 (6) | 7 (1) | 386 | 284 | 282 (5) |
| `<Switch` | 0 | 3 | 3 | 0 | 6 |
| `<Match` | 0 | 1 (1) | 11 | 0 | 19 |
| `<Repeat` | 0 | 0 | 3 | 0 | 0 |
| `<Dynamic` (`@solidjs/web`) | 0 (7) | 0 | 16 (2) | 0 | 0 |
| `dynamic(` | 0 | 0 | 0 | 0 | 0 |
| `<Portal` | 0 (4) | 0 | 1 | 0 | 0 |
| `lazy(` (Solid's) | 0 | 0 | 0 | 0 (6 are spell-epic's own `lazy()`) | 1 import |
| `createContext` | 0 (3) | 0 | 2 (a framework demo) | 0 | 2 |
| `useContext` | 0 (3) | 0 | 2 | 0 | 3 |
| `untrack(` | 32 | 2 | 8 (1) | 0 | 45 |
| `onCleanup` | 3 (2) | 6 (4) | 2 (1) | 0 | 23 |
| `onSettled` | 12 | 0 | 6 (1) | 0 | 48 |
| `createRoot` | 4 (9) | 6 (8) | 2 | 0 | 2 (11) |
| `getOwner` | 5 | 10 | 0 | 0 | 9 |
| `runWithOwner` | 5 | 5 | 0 | 0 | 8 |
| `ref={` | 0 (3) | 2 | 153 (1) | 61 | 112 |
| bare `flush(` | 12 (42) | 2 (19) | 8 (15) | 15 | 4 (269) |
| `core.flush(` / `flushCells(` | 8 (7) | 4 (23) | 0 | 0 | 6 (51) |
| `enableExternalSource` | 8 | 0 (28) | 0 | 0 | 4 (2) |
| `merge(` / `omit(` (*) | 6 (2) | 12 | 10 | 19 (10) | 14 |
| `snapshot(` (*) | 4 (3) | 0 (1) | 22 (2) | 16 (14) | 0 |
| `from "solid-js"` (statements) | 9 (7) | 6 (16) | 106 (14) | 53 | 81 (28) |
| `from "@solidjs/web"` | 4 (9) | 4 (6) | 161 (9) | 67 | 52 (27) |
| `from "@solidjs/h"` | 0 | 8 | 1 | 0 | 0 (5) |
| `from "@solidjs/router"` | 0 | 0 | 0 | 0 | 4 (2) |
| `@solidjs/meta` | 0 | 0 | 0 | 0 | 0 |
| `solid-element` (mentions:  the fork's MIT notes) | 4 (11) | 0 | 1 (1) | 0 | 0 |
| `@solidjs/signals`, `solid-js/store` | 0 | 0 | 0 | 0 | 0 |

(*) Spell's OWN names, not Solid's:  the named-import tally below shows none of these is imported from Solid
(`action(` is commander's `.action()` and Spell's actions;  `refresh(` is `PlaceHeal` / `ServerLink`;
`isPending` is `AnswerForm.isPending` and the like;  `snapshot(` is mostly Vitest).

Every named import from a Solid package, across the repo (code and tests, generated bundles left out):

```text
275 @solidjs/web JSX            100 @solidjs/web isServer     56 @solidjs/web render
191 solid-js Show               106 solid-js For               60 solid-js flush
 56 solid-js createSignal        36 solid-js createMemo        35 solid-js createEffect
 28 solid-js untrack             22 solid-js onSettled         17 solid-js onCleanup
 16 @solidjs/web Dynamic         15 solid-js enableExternalSource
 13 solid-js Accessor            10 solid-js Loading            9 solid-js Switch / Match
  7 solid-js getOwner / createRoot                              6 solid-js runWithOwner
  5 @solidjs/web renderToString   4 solid-js omit / createRenderEffect / Errored
  4 @solidjs/web insert / createComponent
  3 solid-js useContext / createContext / resetErrorHalt / Repeat
  2 solid-js createDeferred       2 @solidjs/web Portal
  1 each:  lazy, onMount, getObserver, SignalOptions, Owner, OBSERVE, Component;
           @solidjs/web spread, ssr, NoHydration, DelegatedEvents, getDelegatedRoot,
           registerDelegatedContainer, unregisterDelegatedRoot
@solidjs/router:  createRouter, defineRoutes, useNavigate, useBeforeLeave, memoryHistory, RouteSectionProps,
                  RouterInstance, RouterHistory, MemoryHistoryAdapter, BeforeLeaveEventArgs
```

- `isServer`:  100 imports, one per component that draws differently in the static render.
- Never imported:  `createStore`, `createProjection`, `createOptimistic`, `createOptimisticStore`, `action`,
  `refresh`, `isPending`, `latest`, `resolve`, `Reveal`, `dynamic`, `dynamicComponent`, `lazyModule`, `merge`,
  `snapshot`, `onHydrationEnd`, `hydrate`, `renderToStream`, `createUniqueId` (inferred:  ids are Spell UI's `UI.ids`).

Home-grown mechanisms, the same way (code only, no tests):

| pattern | src/ | parser/ | ui/ | epic/ | app/ |
| --- | --- | --- | --- | --- | --- |
| `@state` / `@E.state` | 39 | 13 | 288 | 99 | 17 |
| `@derived` / `@E.derived` | 35 | 4 | 160 | 4 | 2 |
| `@E.controlled` | 0 | 0 | 28 | 4 | 0 |
| `@onChange` / `@E.onChange` | 29 | 0 | 165 | 33 | 8 |
| `@E.watches` | 4 | 0 | 39 | 11 | 5 |
| `@E.cssState` | 1 | 0 | 219 | 88 | 8 |
| `@E.aria` | 1 | 0 | 21 | 1 | 0 |
| `@E.on(` | 2 | 0 | 78 | 32 | 18 |
| `@untracked` / `@E.untracked` | 16 | 0 | 307 | 118 | 2 |
| `@prop(` (spell cells) | 7 | 93 | 0 | 0 | 161 |
| `@thing` | 17 | 25 | 0 | 0 | 4 |
| `new Cell(` (Solid signal object) | 4 | 15 | 0 | 4 | 1 |
| `extends UIComponent` | 2 | 0 | 115 | 57 | 3 |
| `extends FormComponent` | 0 | 0 | 12 | 0 | 0 |
| `tracked(` (memo over spell state) | 0 | 0 | 0 | 0 | 71 |
| `ownRoot(` | 5 | 0 | 1 | 0 | 3 |
| `LoadableFile` | 15 | 0 | 0 | 0 | 48 |
| `PlaceResult` | 25 | 11 | 0 | 0 | 0 |
| `PendingChanges` | 32 | 10 | 0 | 0 | 0 |
| `PrefStore` | 83 | 13 | 110 | 48 | 23 |
| `UndoStack` | 11 | 13 | 0 | 1 | 4 |
| `TaskList` | 34 | 14 | 0 | 0 | 43 |
| `PageStore` | 0 | 0 | 0 | 38 | 0 |
| `LoadOnce` | 23 | 0 | 15 | 0 | 0 |
| `UI.sources` | 1 | 0 | 26 | 3 | 0 |
| `drawnInWindow(` | 1 | 6 | 3 | 0 | 0 |
| `new Disclosure(` | 1 | 0 | 11 | 3 | 0 |
| `core.waitedValue` / `waitedValue(` | 0 | 13 | 0 | 0 | 6 |
| `appContext` | 13 | 1 | 20 | 0 | 0 |
| `HotDefinitions` | 54 | 0 | 17 | 0 | 0 |
| `setDebugGlobal(` | 2 | 0 | 0 | 0 | 10 |

Reading the two tables together:
- Spell UI and the epic pages (172 `UIComponent` subclasses) almost never call Solid's state primitives:
  ui/ has 11 `createSignal`, 0 `createMemo`, 4 `createEffect`, against 288 `@E.state`, 160 `@E.derived`,
  165 `@E.onChange`.
  - A lint rule enforces it:  `src/toolchain/lint.patterns.ts` (`spell-ui/*` rules) flags a hand-written
    `createEffect`, `createRenderEffect`, `onSettled`, `onMount`, `untrack` in a component file, naming the decorator.
- The editor app (`app/src/app/solid/`, 53 `.tsx`) is plain Solid function components:  189 `createSignal`,
  110 `createMemo`, 75 `createEffect`, plus `tracked()` (71) over spell state.
- Compiled Spell and the core (`parser/`) touch Solid only to DRAW:  `@solidjs/h`, `<For>`, `<Errored>`, `<Loading>`,
  `createDeferred`;  its state is `@prop` / spell cells.

## 2. The categories

### 2.1 Signals, memos, effects

What Spell uses:  Solid for drawing and for the app's own UI state;  TWO home-grown engines for everything else.

- spell cells, `spell/util/reactive` (`src/util/reactive/`, 1,786 lines:  `cells.ts` 282, `extend.ts` 564,
  `Schema.ts` 338, `PropRules.ts` 170, `decorators.ts` 166, `Derived.ts` 78, `Reaction.ts` 58, `bridges.ts` 75)
  - a synchronous push-pull core with an equality cutoff:  each object's record is a `Map`, read and written at once
  - `Observable` (`src/util/spell/Observable.ts`, 231) and `@thing` on top;  `Thing` / `List` / `App` in the core
  - decorators for hand-written classes and compiled TypeScript:  `@prop({ type, default })`, `@state`, `@derived`,
    `@drawn` (core's);  compiled JavaScript writes the lowered `getProp` / `setProp` pairs
  - ONE context per page on `globalThis` (`Symbol.for("spell:cells")`), shared by every `spell-runtime.js` copy
  - bridged into Solid ONCE per Solid:  `bridgeSolid({ enableExternalSource, flush })`, installed by the host
    (`app/src/app/solid/cellsBridge.ts`, 17 lines);  `util` and `core` never import Solid
  - `core.flush()` / `flushCells()` = derived checks, then Solid's `flush()`
  - `observe(fn)` for plain code;  `tracked(read)` (`app/src/app/solid/tracked.ts`, 47) = a Solid memo over a read
  - `sourcesReadBy()`:  what a value was worked out from (the editor's Data side bar uses it)
  - no proxies:  values aren't made reactive;  `List` copies on write
- Spell UI's reactive members, `src/element/Reactive.ts` (1,377 lines)
  - `@state`, `@controlled`, `@derived` (a self-tracking cache, NOT a Solid memo), `@cssState`, `@aria`,
    `@onChange`, `@whileConnected`, `@watches` (a `MutationObserver` member), `@on`, `@untracked`
  - a record per instance + a notifier signal per member, made on the first tracked read
  - `this.x = v;  this.x` is fresh with no flush;  Solid readers re-run on Solid's schedule
  - writes never throw:  a notifier set inside an owned scope is deferred to a microtask
  - `Reactive.ownRoot(fn)`:  a detached root safe inside an effect's apply (rc.17's `PRIMITIVE_IN_EFFECT_CALLBACK`)
  - measured (ui/AGENTS.md):  1,000 `<ui-button>`s build in 100 ms (130 before), 1,000 `<ui-divider>`s in 33 ms
- `Cell` (`src/element/Cell.ts`, 28):  a Solid signal as one object;  24 uses left (mostly parser's core, brand)
- Plain Solid:  the editor app's function components;  the core's drawing;  `drawnWindow.ts`
- Verdict:  OURS DOES DIFFERENTLY, KEEP.
  - Solid 2 has no synchronous-read signal, and Spell is an imperative language:  read-after-write is the language's
    semantics, not a preference (measured in `spell.epics/guides/solid/solid-2.html` §2).
  - But TWO engines is debt:  CODE-DEBT "Two reactive engines" (fix:  Spell UI's members onto spell cells, Owen's Q20
    of `output-targets`, four checks first).
  - Re-check on 2.0 final:  whether `enableExternalSource`, `ownedWrite`, `flush()` and the dev diagnostics changed
    (inferred risk:  the bridge is the one place Solid internals are load-bearing).
- Ideas:
  - one engine (spell cells under Spell UI's decorators too), then offer it to the Solid world as "class signals":
    standard-decorator reactive classes with read-after-write, a gap Solid itself leaves
  - a cells/owners graph in the editor's Inspector (`sourcesReadBy()` already answers "why did this redraw?")

### 2.2 Stores, projections, nested state, preferences, value objects

What Spell uses:  no Solid store anywhere.
- Class instances with decorated members instead (Things, components, `EditorStore` in `app/src/app/editor.ts`).
  - solid-2.md:  "Solid 2 has NO mutable store";  "NEVER put Things in a Solid store:  stores wrap them in proxies, `===` breaks."
- Class-less nested data (JSON a program holds):  NOT reactive today.
  - A `Proxy` for it was planned, "never started" (solid-2.md, "Accessors for Things, a `Proxy` only for class-less data").
  - A list or object changed IN PLACE notifies nobody:  set the prop to a new one.
- `PageStore` (`epic/src/review/PageStore.ts`, 70):  the epic pages' stores (`ReviewClient`, `AgentsClient`,
  `SendCountdown`, `AnswerForm`, `ChoicesForm`, `RunForm`):  a `version` and `subscribe()`;
  an element follows it with `@E.state accessor version`.  38 uses.
- `PlaceCache` (`src/places/PlaceCache.ts`, 59):  ONE row per type and id, its fields reactive (a normalized store).
- Preferences, `spell/util/persist/` (1,702 lines):  `PrefStore` (353;  277 uses), `PrefPlace`s (browser storage,
  IndexedDB `DatabasePlace`, the page server `ServerPlace`), `ColorScheme` (166), `UndoStack` (258, transactions,
  folding, live titles), `values.ts` (text people can read).
- Value objects / records:  `Schema` per class (declared types win, observed types widen), `typedJSON()` /
  `toJSON()` with `"$type"`, `StateWriter` / `StateMirror` (`parser/src/core/state.ts`, 243):  a program's state by id,
  read INTO the same things.
- Selection:  `ListSelection` (`src/util/ListSelection.ts`, 69), the anchor and Shift / Command rules.
- Verdict:
  - Things and components:  OURS, KEEP (identity, `===`, read-after-write).
  - Class-less nested data:  GAP.  Solid's `createStore` (draft setters, derived `createStore(fn)`, async iterables
    as the source) could be the planned Proxy's answer for plain JSON a program holds (inferred:  read-after-write
    would still be missing).
  - `PageStore`:  Solid's store COULD replace it (70 lines;  version + subscribe is a hand-made signal).
  - Selection in long lists:  `createProjection` (Solid 1's `createSelector` successor) would make "is this row
    selected" O(1) per change;  Spell recomputes per row (inferred).
- Ideas:
  - a reactive JSON value for Spell (`a recipe's notes are some data`), on a Solid store or on spell cells
  - `UndoStack` + `StateWriter` = time travel for any running program, scrubbable in the editor

### 2.3 Async data

What Spell uses:  mostly its own;  Solid's async model in two spots.

- `Loadable` (`src/util/spell/Loadable.ts`, 393) and `LoadableFile` (249;  63 uses):
  `contents`, `load()`, `isLoaded`, `isLoading`, `loadError`, abort;  on `Observable` (spell cells).
- `PlaceResult` (`src/places/PlaceResult.ts`, 294):  one reader's read of a place, a `Loadable` with `status`:
  `"still waiting"`, `"complete"`, `"from an earlier visit"`, `"couldn't update"` (stale-while-revalidate, said in words).
  - Readers of one list share one request (`PlaceReads`, on `LoadOnce`);  `leave()` aborts when the last goes.
  - Inside a Solid memo:  `onCleanup(() => result.leave())`.
- `LoadOnce` (`src/util/LoadOnce.ts`, 117;  38 uses):  one promise per key;  a failure kept, forgotten, or forgotten offline.
- Spell UI:  `UI.sources` (`ui/src/runtime/Sources.ts`, 194;  same-origin text files, cached per URL, savers);
  `LoadableComponent` (508) with `@state loadStatus` (`E.SourceStatus`);  `LoadableBody` (208, a section's body on first open);
  the shared `loading` state on every element (`:state(loading)`, a spinner, inert content).
- Fetching:  `$fetch()` (`src/util/spell/$fetch.ts`, 168) throws a `ResponseError` subclass;
  `fetchOk()` / `fetchText()` and `Api` (`src/util/Api.ts`, 191:  URL templates, combined aborts, newer replaces older)
  for Spell UI and the places.
- Places (`src/places/`, 17,155 lines;  `spell/places`):  `RestPlace`, `GraphPlace`, `SheetPlace`, `ChunkedPlace`,
  `AtProtoPlace`, `LiveRoomPlace`, `DevicePlace`, `MemoryPlace`, `RemotePlace` ...;  `DeviceCopy` (a copy of each
  answer in IndexedDB, `- keep a copy on this device`), `PlaceQuery` (filter / sort / page what the place can't),
  `PlaceBatch` (lists asked together in one request), `PlaceHeal` (fetch, replay pending), `TooSoonError`.
- Solid's async model, where used:
  - compiled Spell's WAITED VALUES (`parser/src/core/waiting.ts`, 194):  `its "total" is:` with a pause or a slow call
    compiles to `core.waitedValue()`, which is `createDeferred()` (lazy), with `<Loading>` around the drawing.
    - NOT an async `createMemo()`:  it held the drawing back and "froze a deal" (epic `language` P8:
      "the counter froze at 28, then jumped to 56").
    - NOT Solid's `resolve()`:  "gives the OLD answer just after a write";  `core.answerOf()` is Spell's own.
  - a read of a place in a drawing (`drawRead()`, `parser/src/core/saved.ts`, 2,099):  `createDeferred` for an async
    read, `<Loading>` with the program's own "while loading" riders, `drawnInWindow()` for its pages.
  - the app:  `lazy()` CodeMirror (`app/src/app/solid/LazyCodeMirror.tsx`), async `createMemo` in `Markdown.tsx` and
    `SpellReference.tsx`, 11 `<Loading>`s.
- `Task` / `TaskList` (`src/util/spell/Task.ts` 330, `TaskList.ts` 289;  91 uses):  an async process as an object
  (inspect, cancel, restart, a named sequence).
- Verdict:  OURS DOES MORE, KEEP the places;  BUT their surface to drawing could be Solid's.
  - Places do what no Solid library does:  many back-ends behind one interface, device copies, offline, sign-in,
    keys hidden behind the page server, rate limits, sheets and workbooks.
  - `isPending()` / `latest()` / `refresh()` / `<Loading>` are the natural reading of a `PlaceResult`'s status;
    today each program and component reads `status` / `isLoading` by hand (inferred from the counts:  0 `isPending`).
  - `Loadable` predates Solid 2 (it was written for React, inferred from its lodash `isEqual` and `batch()`), and is a
    candidate to sit on Solid's async memos, or on places, instead of its own load-state props.
- Ideas:
  - `createPlace()` / `usePlace()`:  a Solid async memo over a `PlaceResult`, so `<Loading>`, `isPending`, `refresh()`
    and Solid's held writes work over any back-end, in any Solid app
  - `<Reveal>` for a page's places loading in order (a site's sections showing top-down)

### 2.4 Actions, optimistic updates, mutations, conflicts

What Spell uses:  its own, much richer than Solid's.

- `PendingChanges` (`src/places/PendingChanges.ts`, 1,082):  every change made and not yet confirmed.
  - One field of one thing each, with its own id, in order, SHOWN AT ONCE (read your own writes, `replayOn()`),
    KEPT ON THIS DEVICE (`TabCopies`, a browser lock per tab), resent with the same id when no answer comes.
  - Refused:  dropped, put back, healed, one failure raised (`Places.onWriteFailed()`).
  - Out of date:  a THREE-WAY MERGE per field against its `was`, then sent again;  mine wins;
    `Places.onConflict()` hears what was lost.
  - A write back to what it `was`, unsent, drops the change (undo before sending).
  - Groups:  an action's changes held until `end()`, dropped by `cancel()`;  `callShownAtOnce()`:  a named server
    action shown at once, settled by the referee's answer.
- `SaveQueue` (`src/places/SaveQueue.ts`, 355):  saves in order, one at a time, retries every 3 s, sends as the
  page goes away, a browser copy;  `DraftSaver` (epic pages' forms) is on it.
- `ActionQueue` (`parser/src/core/ActionQueue.ts`, 215):  what a PERSON starts runs one at a time, ONE per program:
  the same again is ignored, a third takes the waiting one's place, `cancel()` at the next wait (`CanceledError`),
  a canceled action's place writes go back.  Plus `acting.ts` (655):  pressed keys, shortcuts.
- Live rooms:  `LiveRoomPlace` (822) + `RoomCopy` (296) + the server's `Referee` (734):  everyone's changes in one
  order;  `addToField()` / `changeList()` edits so two at once both count;  `onLost()`, `onThingDeleted()`;
  heal by "ask what I missed, replay".
- Server actions:  `RestPlace` named operations (`call()`, each a `POST`), `limitOperations()`;  `GraphPlace` mutations;
  versions by `If-Match` or a version field.
- Verdict:  OURS DOES MORE, KEEP.  Solid's `action()` + `createOptimistic` are an in-memory, one-tab, online
  model;  Spell's survives reloads, tabs, offline and other people's edits.
  - What Solid has that Spell's lacks:  writes HELD with their async (one consistent screen while an action's reads
    land), and `refresh()` of exactly what an action touched (inferred).
- Ideas:
  - publish PendingChanges + SaveQueue + PlaceHeal as a "local-first sync" layer for Solid apps
    (a gap in Solid's ecosystem;  Replicache / Zero / ElectricSQL are its neighbours elsewhere, inferred)
  - map Spell's actions onto Solid's `action()` so a program's action and its writes are one held transition:
    no half-updated board mid-deal

### 2.5 Control flow and lists

What Spell uses:  Solid's, plus its own long-list drawing and a Spell UI repeat.

- `<Show>` 964 uses, `<For>` 279, `<Switch>` / `<Match>` 43, `<Repeat>` 3 (progress bars, rating icons, slider
  labels), `<Dynamic>` 16 (ui:  a family drawing `<a>` or its own tag by its link, `UICard.rootTag`), `<Portal>` 1 (`UITable`, `mount`
  given);  `dynamic()` 0.
- Compiled Spell:  `drawItems()` is `<For>` by identity;  every loop in a drawing (`core.drawEach()`) goes through
  `drawnInWindow()`.
- `drawnInWindow()` (`src/element/drawnWindow.ts`, 385):  a long list drawn as you scroll.
  - first 24 items, then 24 more as a sentinel nears the view, reading a place's next page
  - WHAT'S DRAWN STAYS DRAWN (no recycling);  `through` draws an item the caller needs at once
  - Spell UI's `<ui-tree>` columns:  "5,000 rows open in 33 ms, as 300 do" (catalog)
  - Spell's `<for>` tag adds the loader, Try again, the empty message, pages and a title (epic `data` P22)
- `<ui-repeat>` (`ui/src/components/ui-form/UIRepeat.tsx`, 197):  children once per item, light DOM, kept by
  identity, `moveBefore()` where the browser has it so a moved row keeps focus.
- Verdict:  Solid's covers the control flow;  Spell's list drawing does MORE (paging a place) but LESS (no
  virtualization).
- Ideas:
  - true windowing (draw only what's visible, recycle) on `<Repeat>`, for 100k-row lists and tables
  - `moveBefore()` inside `<For>` everywhere (focus, video, iframes kept across reorders), if Solid 2 final doesn't

### 2.6 Components:  the custom-element base

What Spell uses:  Solid wrapped in its own element layer, `spell/element` (`src/element/`), forked from
`@solidjs/element` + `component-register` and fixed (epic `spell-element`, 2026-10-09;  MIT notices kept).

- `UIComponent` (`src/element/UIComponent.tsx`, 1,616):  the component, one instance per element, `render()`
  returns JSX into the shadow root, inside its OWN Solid root and an `<Errored>` boundary (`mount()`).
  177 subclasses (ui 115, epic 57, app 3, kit 2).
- `DOMElement` (1,073):  the browser's side;  attributes, properties, the upgrade, shown / hidden, form callbacks,
  `ready`, custom states (`:state(...)`), `ElementInternals`, disposal (`keepAlive` until `dispose()`).
- `ElementDefinition` (302) + vocabularies (`vocabulary.types.ts`, 752):  every name a tag uses (attributes, values,
  events, slots, parts, states, texts) from `UI<Name>.en.ts`;  a translated tag runs the same code.
- Props vs attributes:  `RichAttributes` (197):  Solid 2 sets an unknown prop on a dashed tag with `setAttribute()`;
  our elements turn a function into a listener (`on-ui-changed={f}`) and an object into a property (`options={[...]}`);
  a page-wide `setAttribute()` patch holds them for tags not defined yet;  `<ui-root pure>` turns it off.
  - "Defined early":  `<ui-root>` defines every catalog tag before its family loads (PENDING until it attaches).
- Events:  `ui-*` `CustomEvent`s, `bubbles` + `composed`, `detail` with computed state;  `on-ui-*` in JSX (63);
  the editor listens with a ref (`ref={on("ui-changed", f)}`, 15) to keep the console free of
  `LOWERCASE_EVENT_ATTRIBUTE`.
- `ShadowEvents` (249):  stops Solid's delegated events leaking out of (and being dropped by) shadow roots:
  it patches the event object Solid's walk leaves behind.
- Slots:  native `<slot>`;  `SlotContent` (60);  `@E.watches` for light-DOM members;  parts by `part=` and
  `PartContext` / `OwnerContext` (owner context across the FLAT tree, `:state(in-card)`).
- Refs:  callbacks (153 in ui);  `this.$.x` accessors for Solid APIs.
- Directives:  ref factories (`app/src/app/solid/on.ts`);  1.x `use:` is a compile error since rc.17.
- Context across shadow roots:  Solid context does NOT cross (each element is its own root;  two tests in
  `tests/element/UIComponent.test.tsx` pin it as "deliberate").  Spell's answer is `appContext`:  ONE value from the
  nearest `<ui-root>`, read once when the component is built.
- Lifecycle:  `onConnect()`, `onDisconnect()`, `onFormReset()` ...;  `@E.whileConnected`.
- Hot reload:  `HotDefinitions` (395) + the `HotElements` Vite plugin + Spell UI's `PackHotSwap`:  swap an element
  class in place (Solid's refresh plugin handles only exported FUNCTION components).
- Lazy components:  component PACKS (`ui/src/components/ui-components/ComponentPacks.ts`, 336) and `UI.load()`:
  a family's code loads the first time its tag is used.
- Verdict:  OURS, KEEP, and it's a candidate to GIVE BACK.  Solid 2 ships no custom-element layer
  (`@solidjs/element` was folded in here and fixed);  Spell's is the most complete one on Solid 2 we know of (inferred).
- Ideas:
  - publish `spell/element` as THE Solid 2 custom-element base ("solid-element 2")
  - reactive `appContext` keys (a store, not one frozen value), so a theme or a selection flows into every element
  - a JSX-components-as-elements bridge:  any Solid function component becomes `<my-thing>` with one call

### 2.7 Rendering, SSR, hydration, streaming

What Spell uses:  client rendering;  a STATIC server render for SEO, with no hydration.

- `spell/ui/static` (`ui/src/static/`, 13 files, 1,861 lines;  `*.ssr.ts`):  `StaticRender.page()` / `fragment()`
  turn `ui-*` markup into plain LIGHT-DOM HTML in node:  linkedom stand-in elements (`ServerDOMElement`), Solid's
  `renderToString` inside `NoHydration`, `StaticFlattener` (each element replaced by its root, slots by children),
  `StaticInteractions` (dialogs, popovers, ids that work without JS), `StaticStylesheet` (`::part()`, `:state()`
  rewritten).  The command:  `spell ssr` (`ui/src/cli/ssrCommand.ts`, 263).  Epic `seo` (71 done, 18 open items).
  - 100 components import `isServer` to draw for it;  62 `*.ssr.test` files.
  - "First paint MUST NOT need a rich property:  SSR drops them" (ui/AGENTS.md, UI rules).
- Declarative Shadow DOM:  tolerated, not produced.  `DOMElement.renderRoot` takes a server-rendered
  `<template shadowrootmode>` root, then EMPTIES it before the first render ("no hydration, its content is replaced").
- `formatHTML()` (`spell/server`, oxfmt):  formats generated files, not page rendering.
- The page server (`src/server/`):  static files, live reload (`LiveReload` 199, `liveClient.ts` 1,731, served
  as one function's text), `PagePatch` (1,024):  an edit to a page's file patched into the open page, keyed diff,
  reader state kept, cross-faded with a view transition.  Bundles built on demand (`Bundle`, 474).
- Packs:  component packs built by `spell-pack` (`ComponentPack`, 602), sharing `spell/element`, Solid and
  `spell/ui/core` with the page (`PACK_MODULES`).
- `spell run` and the core contract run Solid's BROWSER build under node on a linkedom page (`cli`'s `hooks.mjs`).
- The editor's static build (`spell app preview build`):  the editor in Vite's static mode, examples compiled ahead.
- Verdict:  GAP for real SSR.  Spell has no hydration, no streaming (`renderToStream`, `<Loading>` streaming), no
  resumable islands;  a Spell SITE (`SiteBase`) is client-drawn.
- Ideas:
  - Spell sites server-rendered and STREAMED with Solid's SSR, hydrating only `<spell-viewer>` islands
  - emit Declarative Shadow DOM (instead of flattening) so crawlers AND the upgrade see one tree, then hydrate
    Solid into it instead of emptying it
  - `spell static` as a full static-site generator for Spell sites (every address of `SiteBase.pages`)

### 2.8 Routing

What Spell uses:  FOUR routers, one of them Solid's.

- `@solidjs/router@next` (2.0.0-next.44):  the editor app only (`app/src/app/pages/routes.tsx`, 88 lines;
  `navigation.ts`, 39).  `createRouter({ routes })`, `explicitLinks` (only `<a link>`), `useNavigate()` handed to
  `editor` through `navigate()`, `useBeforeLeave`, `memoryHistory` in tests.  Five routes (`/:page/*address`, the
  theme page, `/site/*`, `/place/*`, `*`).  Not used:  preloading, `query` / `createAsync`, `formAction`.
- Spell SITES:  `SiteBase` (`parser/src/core/classes/SiteBase.ts`, 950):  a program's pages, dialogs, sidebars,
  not-found and error pages, layouts, from its lines (`- it has a film page at "/films/:film"`);  draws with
  `@solidjs/h` + `<For>` + `createMemo`;  the host owns the address (`core.siteHost`:  the editor's Run keeps it in
  `/run/<project>/films/4`).
- ONE address grammar:  `spell/util/addressPattern` (92:  `compilePattern()`, `filledPattern()`), shared by the
  server's `Router` and `SiteBase`.
- The server:  `Router` (`src/server/Router.ts`, 197), Express-shaped on purpose (`get / post / use`, `:name`,
  `:name*`, `HttpError`).
- Spell UI's docs site:  `SiteRouter` (`ui/site/_src/SiteRouter.ts`, 442):  swaps `main` through `<ui-include>`,
  `pushState`, View Transitions, plain DOM.
- Element state in the address:  `AddressParameter` (`ui/src/elements/AddressParameter.ts`, 156):
  `<ui-tabs parameter="server">`, Back and Forward step through a control's values.
- Controller families in the editor:  `<view>Url` → `show<View>()` → `isShowing<View>` (WWOD §3).
- Verdict:  Solid's covers the editor;  OURS for Spell sites, KEEP (it's the language's routing, in every language).
  Three client routers is one too many (inferred:  `SiteRouter` and `SiteBase` could share a core).
- Ideas:
  - Spell sites on Solid Router's engine (preload a page's places on hover, `query` caching), keeping Spell's words
  - view transitions between a Spell site's pages, per thing (`view-transition-name` from a thing's reference)

### 2.9 Forms and validation

What Spell uses:  its own, on the platform's form-associated custom elements.

- `FormComponent` (`ui/src/elements/FormComponent.ts`, 387;  12 controls) + `DOMFormControl` (72):
  `static formAssociated`, `ElementInternals` (`form`, `validity`, `checkValidity()`), form reset / disabled callbacks.
- `Validator` (460):  Fomantic's rule vocabulary (`minLength[6]`, `match[password]`, `creditCard[visa,amex]`) as pure
  functions, mapped onto Constraint Validation flags, so `:invalid` / `:user-invalid` work.
- `<ui-form>` (`UIForm.tsx`, 772), `<ui-field>` (445), `<ui-fields>`, `<ui-repeat>`;  `FormFields` (374:  plain DOM,
  reads light-DOM natives and `ui-*` hosts alike);  `FormBinding` (568):  a form's controls bound both ways to an
  object or MANY objects (mixed values shown blank), dotted names, `apply`:  immediately / delayed / on leave / on save.
- Native fallbacks:  `NativeFallback.syncForm()`, each control's plain-DOM stand-in keeps the form value and validity.
- The property editor (`<ui-property-editor>`):  forms made from a vocabulary.
- Verdict:  OURS DOES MORE (works in any framework, real form association, many-object editing);  Solid 2's
  `formAction` (the router's) isn't used.
- Ideas:
  - validation rules made from a Thing's `Schema` (declared prop types and `oneOf` become rules), no rules written twice
  - a `<ui-form>` that submits through a place's operation as one held action (pending, optimistic, refused)

### 2.10 Styling, theming, CSS

What Spell uses:  its own, in CSS.  Solid has no styling layer of its own (ecosystem:  solid-styled, Panda,
vanilla-extract, inferred).

- Spell UI's sheets:  183 CSS files, 50,746 lines in `ui/src/`;  `@layer ui.reset, ui.tokens, ui.base,
  ui.components, ui.utilities, ui.theme, ui.app`;  OKLCH tokens;  one rule set per hue / size, switched by tokens.
- Shadow DOM everywhere, Fomantic's class grammar inside;  `::part()` and tokens to reach in;
  public `--ui-<tag>-*` tokens read through private aliases (`componentTokens.test.ts` enforces).
- Themes:  `<name>.theme.json5` (10), `ThemeFile` (477), `Themes` (236), `ThemePreference`, the theme editor;
  `ColorScheme` (light / dark, one key for every Spell site).
- `hostLayout` (an element's own `:host` rule in one adopted sheet), constructable sheets per family
  (`styles.adoptInto()`), `ClassBuilder`.
- Verdict:  OURS, KEEP.  No overlap with Solid.
- Ideas:  publish the token and theme format for other Solid UI kits to read;  `@scope` / style queries per theme.

### 2.11 Animation and transitions

What Spell uses:  its own.

- `UI.transitions` (`ui/src/runtime/Transitions.ts`, 221):  Fomantic's keyframe catalogue in `animations.css`,
  driven by `data-ui-animation`;  never hangs (fail-safe timeout).
- Shown / hidden on EVERY element:  `UIComponent.onVisibleChange()` animates the shadow root's top boxes;
  `:state(hiding)`;  `animation="none"` stills an element and its insides (`--ui-motion: none`).
- CSS-only where it can:  `@starting-style` + `allow-discrete` on popovers and dialogs.
- View Transitions:  `PagePatch.crossFade()`, `SiteRouter`, `UITabs` (13 uses in all).
- `<ui-transition>`, `<ui-reveal>`, `<ui-shape>`, `<ui-dimmer>`;  `Visibility` (374) fades lazy images.
- Settings:  `SpellSolid.settings.motion` (default animation, reduced motion).
- Verdict:  OURS, KEEP;  GAP for list motion (FLIP on reorder, enter / exit of `<For>` items) and springs.
  Solid's ecosystem:  `solid-transition-group`, Motion's Solid package (inferred names).
- Ideas:  FLIP / view-transition animation when a `<For>` reorders (cards moving between piles in Solitaire);
  a Spell line for it (`- cards slide when they move`).

### 2.12 i18n

What Spell uses:  its own, in TWO languages, down to tag names.

- Spell UI:  158 vocabularies (`*.en.ts`) and 152 dictionaries (`*.es.ts`) in `ui/src/`;  a translated tag
  (`<es-boton>`) runs the same code;  `I18n` (`ui/src/runtime/I18n.ts`, 266:  packs per locale, scoped per component,
  English defaults, `Intl` cached, Temporal or its polyfill lazily).
- The editor:  `AppTexts.en.ts` (1,120) and `AppTexts.es.ts` (1,081), read with `appTexts.text(key, params)`.
- The language server:  `LspTexts`, read in the language of the FILE.
- The language itself:  Spanish Spell ("Encanto", `<encanto-...>` tags), retired words, `spell translate`.
- Dates and units:  `CalendarSettings`, `MeasureSystem`, `Dimension` (`src/util/measures/`), the core's `dates.ts`.
- Verdict:  OURS DOES MORE, KEEP.  Solid's ecosystem has `@solid-primitives/i18n` (dictionaries and templates only, inferred).
- Ideas:  ICU plurals and genders in vocabularies;  right-to-left;  a third language to prove the machinery.

### 2.13 Meta, head, SEO

What Spell uses:  little at run time.

- No `@solidjs/meta`.  `document.title` set in 7 places (app 4).
- SEO:  the static render (2.7);  `StandardSite` (`src/places/StandardSite.ts`):  a page published as a
  Standard.site record, `linkTagFor()` for its `<link rel="site.standard.document">`.
- `<ui-page>`:  the HTML landmarks, skip link, one per page;  no head management.
- Docs pages and templates carry their own `<meta>` by hand (`og:` / `<meta ` 152 mentions, mostly epic pages).
- Verdict:  GAP.
- Ideas:  a Spell site's head from its lines (`its title is ...`, `its picture is ...`) through a `@solidjs/meta`-like
  layer, server-rendered with 2.7;  `sitemap.xml` and Open Graph images made from the site's pages.

### 2.14 Dev tools, debug, logging, error overlays

What Spell uses:  its own;  Solid's dev diagnostics.

- `setDebugGlobal()` (`src/util/spell/safely.ts`, 87;  12 uses), `Logger` (80), `safelyCall()` / `safelyCallAll()`,
  `makeErrorWrapper()`.
- Solid's dev diagnostics read by people and agents:  `node_modules/solid-js/skills/reactivity-diagnostics/`;
  the editor's console must stay clean (epic `editor` I98);  integration tests fail a page whose updates halt
  (`REACTIVITY_HALTED`, `app/tests/app/pages/runningEditor.ts`).
- Error boundaries:  every element (`UIComponent.mount()` → `<Errored>`, then its children or a form control's
  native fallback);  every drawn Spell thing (`drawInBoundary()`:  a stand-in, a `ui-error` event, the rest keeps
  drawing);  the app's `<ErrorBoundary>` (`app/src/app/solid/ErrorBoundary.tsx`) and `ErrorNotice`.
- The editor IS the dev tool for Spell programs:  Inspector, Data side bar (`Places.originOf()`, `sourcesReadBy()`),
  step debugger (`parser/src/core/stepping.ts`), Spell Console line, Explain This, Change This (Claude).
- No Solid devtools in code;  `@solidjs/start-devtools` only an optional peer.
- Verdict:  OURS for Spell programs;  GAP for a Solid-level owner / signal graph view.
- Ideas:  Solid 2's devtools hooks shown inside the editor's Inspector, joined with spell cells:
  one "why did this redraw" for both engines.

### 2.15 Testing

What Spell uses:  Vitest (through Vite+), mostly in a REAL browser, with its own helpers.

- Test files:  kit 195, parser 274, ui 414 (62 `ssr`), epic 263, app 294 (67 `*.browser.test`).
- Browser projects:  Vitest browser mode + Playwright, chromium (`vitest.config.ts`, `src/toolchain/browserMode.ts`);
  node projects run Solid's SERVER build (writes not staged there:  `app/tests/app/solid.test.tsx` pins it).
- Helpers (`src/test-helpers/`, 421 lines):  `Fixture`, `ElementFixture` (render, wait for `ready`, `flush()`,
  `breakRender()`), `A11y` (axe, WCAG contrast), `Viewport`, `TestSettings`;  Spell UI's own (`ui/src/test-helpers/`):
  `Sheets`, `ThemeHarness`, `MemberClashes`, `PerfRun`, visual baselines (`yarn test:visual`).
- Reactive semantics pinned as tests:  `tests/util/reactive/cells.test.ts`, `decorators.test.ts`,
  `app`'s `cellsBridge.browser.test.tsx`, core's `drawing.test.ts`;  `solid/experiments/*` re-measured on RC bumps.
- Integration:  `app:integration` opens the running editor;  `BrowserPage` (`src/element-tools/BrowserPage.ts`)
  for every headless check.
- Spell programs:  `spell test`, `core.runTests()`, snapshot tests of every example and guide.
- `@solidjs/testing-library@next` exists but isn't installed (solid-2.md).
- Verdict:  OURS, KEEP.  Nothing to replace.
- Ideas:  publish `ElementFixture` + `A11y` as a custom-element testing kit for Solid.

### 2.16 Build tooling

What Spell uses:  Vite+ (`vp`:  Vite, Vitest, oxlint, oxfmt, tsgolint) with Solid's plugin, plus its own steps.

- `@solidjs/vite-plugin@3.0.0-next.57` (`src/element-tools/elementConfig.ts`, `app/app/vite.shared.ts`,
  `vitest.config.ts`);  `@solidjs/compiler` directly in `buildTsx()` (`parser/src/spell/node/buildTsx.ts`) and
  `spell publish`'s package build.
- The decorator pre-pass (`src/toolchain/decorators.ts`, 140):  esbuild lowers STANDARD decorators before Vite's oxc
  (which lowers only legacy ones), shares one helpers module;  "delete this file when oxc lowers standard decorators".
- `sourceNames()` (`src/toolchain/sourceNames.ts`):  esbuild finds `spell/...` names as source.
- One Solid per page:  `vite.solid.config.ts` builds `spell-solid.js` first;  `sharedSolid()` makes every other
  Solid / Spell UI specifier a build ERROR unless listed.
- Component packs:  `spell-pack build | check`;  Spell UI's library build (`vite-plugin-dts`, TypeScript 6).
- JSX types:  `spell/ui/jsx` (`ui/src/jsx.ts`, 61,720 lines, generated from vocabularies), exact per tag;
  the elements help (`src/element-tools/jsx-help/`) completes slot / part / dashed-attribute names in VS Code.
- `@solidjs/h`:  compiled JavaScript Spell draws with it (imported from `@spell/core`;  never Solid directly).
- Verdict:  Solid's plugin covers JSX;  OURS for decorators, packs, one-Solid-per-page, JSX types.
- Ideas:  upstream the decorators lowering need (or wait for oxc);  a Vite plugin that makes any Solid component
  library into a custom-element pack (2.6).

### 2.17 Server functions, RPC, realtime

What Spell uses:  its own;  no `"use server"`, no SolidStart.

- Route modules on the page server (`Router`, `PlaceServer`, `placeRoutes.ts`);  `$fetch()` / `HttpError` for
  errors across the wire.
- Named server actions:  `RestPlace` operations, `PlaceServer`'s `call`, `GraphPlace` mutations.
- Realtime:
  - `ReconnectingSocket` (`src/util/ReconnectingSocket.ts`, 107):  1 s doubling to 10 s
  - `LiveRoomPlace` + `Referee`:  "everyone's changes, in one order", who's here (`peopleHere()`), out-of-date pages
  - `AtProtoPlace`:  Jetstream live, from a cursor
  - `PlaceEvents` (`watch()`, `changesSince()`) on disk places
  - live reload and `PagePatch` for pages
- A program running ELSEWHERE:  the Python target runs the program on the server (`spell_quart`), and the page
  mirrors its state over a socket (`parser/src/core/page.ts`, 433:  `startPage()`, `receive()`, `sendCall()`,
  `StateMirror`):  a LiveView-like mode (inferred comparison).
- Verdict:  OURS DOES MORE (rooms, referee, offline, AT Protocol).  GAP:  a JavaScript program can't say
  "this runs on the server" for one function.
- Ideas:
  - "server actions" for Spell:  `- it runs on the server` on an action, compiled to a place operation, with
    PendingChanges' optimism on the page
  - rooms as Solid async iterables (Solid 2 stores accept an async iterable as their source):
    `createStore(() => room.changes())`

### 2.18 The Spell language and Solid

- Compiled JavaScript imports ONLY `@spell/core`;  draws with Solid's `h()` (a function for every value that can
  change, `ASTJSXLiveValue`);  `draw()` in a memo, redrawing that thing alone;  `drawThing()` / `@drawn` in one
  error boundary;  `mountApp()` = `render()` in its own root (`parser/src/core/drawing.ts`, 982).
- Compiled TypeScript (`ts/solid`) is real JSX with `<Show>` / `<For>` and `@drawn`;  built by `buildTsx()`;
  the runners can't run it yet (CODE-DEBT "The runners can't run TypeScript output").
- State:  spell cells (`@prop`, `@thing`, `getProp` / `setProp`), bridged to Solid.
- Async:  waited values (`createDeferred` + `<Loading>`), places read in drawings (`drawRead()`, `drawnInWindow()`).
- Built-in templates written in Spell (`parser/src/core/templates/`):  `Site`, `TwoSidedView`, `PageLayout` ...,
  compiled into classes that draw with `@solidjs/h`.
- The runner:  `<spell-viewer>` / `<spell-editor>` (Spell UI components), VS Code's Run Project webview, `spell run`
  under node on linkedom;  one shared `spell-solid.js` per page.
- The LSP (`app/src/lsp/`):  language-level, no Solid;  but the elements help reads JSX for `<ui-*>` names.
- Code debt to re-measure on 2.0 final:  "Drawing works around Solid rc.13's `<Errored>`" (three parts per boundary,
  `madeOnce()`);  solid-2.md says rc.15 builds the fallback once and the drawing's own `try/catch` is gone
  (epic `solid-17`), so the entry may be partly stale.
- Ideas:
  - Spell as a Solid DSL:  `.spell` files importable from any Solid app as components (a Vite plugin)
  - Python, and other targets, drawing through Solid on the page (`page.ts`) = "Solid as the view for any backend language"

### 2.19 Ecosystem libraries vs Spell's own

| Ecosystem library (Solid) | Spell's own | Lines | Verdict |
| --- | --- | --- | --- |
| Kobalte / Ark UI / Corvu (headless UI) | Spell UI:  96 `ui-*` families, shadow DOM, any framework | ~93.8k TS + 37.9k CSS in `ui/src/components/` | ours, wider;  candidate to offer the ecosystem |
| `@solidjs/meta` | none | -- | gap |
| `@solidjs/router` | used in the editor;  `SiteBase`, `SiteRouter`, server `Router` | 88 / 950 / 442 / 197 | keep both;  share a core |
| SolidStart (SSR, server functions) | static render, page server, places | 1,861 + `src/server/` | gap for SSR + server functions |
| TanStack Query | places, `PlaceReads`, `LoadOnce`, `DeviceCopy` | 17k+ | ours does more |
| TanStack Table | `<ui-table>` (sortable, client sort, column defs, editable) | 2,477 | ours;  no grouping / pivot (inferred) |
| TanStack Virtual, `@solid-primitives/virtual` | `drawnInWindow()` (no recycling) | 385 | gap for true windowing |
| TanStack Form, Modular Forms, Felte | `<ui-form>`, `FormBinding`, `Validator` | ~3.1k + 460 | ours |
| Motion, `solid-transition-group` | `UI.transitions`, `onVisibleChange()` | 221 + | ours;  gap for list motion |
| `@solid-primitives/i18n` | vocabularies, dictionaries, `I18n`, `AppTexts` | 266 + | ours does more |
| `@solid-primitives/storage` | `PrefStore`, `PrefPlace`s, `ColorScheme` | 1,702 (persist/) | ours |
| `@solid-primitives/history` | `UndoStack`, `EditorHistory` | 258 + | ours |
| `@solid-primitives/websocket` | `ReconnectingSocket` | 107 | ours |
| `@solid-primitives/keyboard` | `UI.keyboard`, `Chord`, `RovingTabindex`, `acting.ts` | 204 + 170 + 221 + 655 | ours |
| `@solid-primitives/event-listener` | `@E.on`, `@E.whileConnected` | in `Reactive.ts` | ours |
| `@solid-primitives/mutation-observer`, `resize-observer`, `intersection-observer` | `@E.watches`;  raw `ResizeObserver` (37 sites);  `Visibility` (374) | -- | partly ours;  ResizeObserver unwrapped (inferred gap) |
| `@solid-primitives/media` | `platform.ts` (`PLATFORM_QUERIES`), `DARK_QUERY` | 94 | ours |
| `@solid-primitives/scheduled`, `timer` | `spell/util/timing` (`after`, `every`, `soon`, `Queued`, `waitUntil`) | 252 | ours;  debounces still hand-written (catalog "Timing", P32) |
| `@solid-primitives/clipboard` | `copyText()`, `E.ClipboardCopy` | -- | ours |
| `@thisbeyond/solid-dnd` | `Dragging` (459), `MoveAndResize` (245), `PhaseDrag` | 704+ | ours |
| `@solid-primitives/pagination` (infinite scroll) | `drawnInWindow()` + places' pages | 385 | ours |
| solid-icons | `UI.icons`, icon packs (Fomantic, FA7 free) | 289 + packs | ours |
| `@solidjs/testing-library` | `ElementFixture`, `Fixture`, `A11y` | 421 | ours |
| Solid devtools | the editor's Inspector, `setDebugGlobal()` | -- | gap at the Solid level |
| `solid-markdown` (inferred) | `<ui-markdown>` (marked), the parser's markdown | -- | ours |
| CodeMirror bindings | `LazyCodeMirror`, `ui/codemirror` | -- | ours, on CodeMirror 6 |

Spell-only mechanisms with no Solid counterpart:
- a programming language with its compiler, LSP, step debugger, Python target, Spanish twin
- places:  many back-ends behind one interface (REST, GraphQL, sheets, Excel, AT Protocol, Airtable, live rooms),
  device copies, keys hidden by the page server, rate limits (`RateQueue`), sign-in (`SpellSignIn`, `AtProtoSignIn`)
- `Disclosure` (open / close for everything, with cancelable `ui-opening`, find-in-page)
- `PagePatch`:  live edits patched into an open page, reader state kept
- `ActionQueue`:  a person's actions one at a time, latest-wins waiting
- the epic engine (epic pages, `PageStore`, `ServerLink`, review inbox), the page server, runbooks
- vocabularies:  every name a tag uses, translated tags, generated exact JSX types
- `<ui-root>` defining every tag early, packs loaded on first use, hot-swapped packs

## 3. New features Spell might want

Each:  what it gives people, and the Solid 2 feature, ecosystem library or gap it comes from.

1. **One reactive engine** -- Spell UI's members on spell cells:  a component reading a Thing's prop just works.
   (Gap:  CODE-DEBT "Two reactive engines";  Solid's `enableExternalSource`.)
2. **"Class signals" for every Solid app** -- publish spell cells + standard decorators:  reactive classes with
   read-after-write.  (Gap in Solid 2:  staged writes, no class story.)
3. **`createPlace()`** -- any back-end as a Solid async memo:  `<Loading>`, `isPending()`, `refresh()` and held writes
   for free over REST, sheets, AT Protocol.  (Solid 2 async memos;  TanStack Query's niche.)
4. **Local-first sync for Solid** -- PendingChanges + SaveQueue + PlaceHeal + DeviceCopy as a library:  offline
   edits, multi-tab, three-way merge.  (`createOptimistic` / `action()` go only so far;  no Solid library does this.)
5. **Spell actions as Solid actions** -- a program's action and its writes held as one transition:  no half-dealt
   board on screen.  (Solid 2 `action()`, held writes.)
6. **Server-rendered, streamed Spell sites** -- `SiteBase` pages SSR'd with `renderToStream`, `<Loading>` streaming
   places in, `<spell-viewer>` islands hydrated.  (SolidStart / `@solidjs/web` SSR;  gap.)
7. **Declarative Shadow DOM output** -- the static render keeps shadow roots, and elements hydrate into them instead
   of emptying them:  one tree for crawlers and people.  (Gap;  web-component SSR.)
8. **`spell static`, a site generator** -- every address of a Spell site written out, with sitemap and Open Graph
   images.  (SolidStart's prerender;  gap.)
9. **Head from Spell lines** -- `its title is`, `its picture is` become `<title>` / `og:` tags, server-rendered.
   (`@solidjs/meta`;  gap.)
10. **Server actions in Spell** -- `- it runs on the server` on an action, compiled to a place operation, optimistic
    on the page.  (SolidStart's `"use server"`.)
11. **Rooms as streams** -- a live room feeds a Solid store through an async iterable:  multiplayer state in one line.
    (Solid 2 `createStore(fn)` with an async iterable.)
12. **Reactive JSON in Spell** -- class-less nested data a program holds becomes reactive (a store, or cells):
    no more "set it to a new list".  (Solid `createStore`;  the never-started Proxy.)
13. **O(1) selection in long lists** -- `createProjection` for "is this row selected" in `<ui-tree>`, `<ui-table>`,
    the Inspector.  (Solid 2 `createProjection`.)
14. **True virtualization** -- `<Repeat>`-based windowing with recycling:  100k-row tables and trees.
    (TanStack Virtual;  `<Repeat>`.)
15. **A headless table engine under `<ui-table>`** -- grouping, pivots, column filters fed by `PlaceQuery`.
    (TanStack Table.)
16. **Forms from types** -- a Thing's `Schema` becomes its form's validation rules.  (Modular Forms / Valibot.)
17. **Motion for lists** -- FLIP or per-thing view transitions when `<For>` reorders:  cards slide between piles.
    (Motion, `solid-transition-group`;  `moveBefore()`.)
18. **Ordered reveal** -- a page's sections appear top-down as their places answer.  (Solid 2 `<Reveal>`.)
19. **Solid devtools inside the editor** -- owners, signals and spell cells in one graph:  "why did this redraw?"
    (Solid devtools;  `sourcesReadBy()`.)
20. **Time travel for programs** -- `UndoStack` + `StateWriter` scrub a running program back and forth.
    (`@solid-primitives/history`;  Redux devtools' idea.)
21. **`spell/element` published as Solid 2's custom-element base** -- any Solid component becomes a real element:
    props, events, slots, forms, SSR.  (The abandoned `@solidjs/element`, folded in here.)
22. **Spell UI for the Solid ecosystem** -- 96 accessible, themeable families that work in Solid AND everywhere
    else.  (Kobalte / Ark / Corvu.)
23. **Reactive `appContext`** -- a store of named keys flowing into every element across shadow roots.
    (Solid context stops at each element's root.)
24. **`.spell` files as Solid components** -- a Vite plugin importing Spell into any Solid app.
    (Gap:  no language-level DSL on Solid.)
25. **Run the TypeScript target in the browser** -- esbuild-wasm + Solid's compiler in the runner.
    (CODE-DEBT "The runners can't run TypeScript output".)
26. **A third language** -- the vocabulary and dictionary machinery proven past English and Spanish, with ICU plurals
    and right-to-left.  (`@solid-primitives/i18n` is far behind.)
27. **One client router** -- `SiteBase` and the docs `SiteRouter` on one core, with Solid Router's preload of a page's
    places on hover.  (`@solidjs/router` preloading, `query`.)
28. **AI in the loop as a library** -- Change This / Explain This for any Solid app's elements.  (No Solid
    counterpart.)

## 4. Surprises

- Solid 2's headline features (stores, projections, optimistic, actions, `isPending`) have ZERO uses;
  the one Solid 2 async feature Spell leans on is `createDeferred()`, chosen because an async memo froze drawings.
- Spell UI's lint FORBIDS raw Solid effects in component files:  the decorators are the house API, Solid is under it.
- 100 components import `isServer`:  the static render is real and wide, but has no hydration;
  a server-rendered declarative shadow root is thrown away on upgrade.
- Four routers (Solid Router, `SiteBase`, `SiteRouter`, the server's `Router`), one address grammar.
- Solid context deliberately never crosses an element:  `appContext` is one frozen value per root.
- `@solidjs/start-devtools` sits in `peerDependencies` though nothing imports it (inferred:  for the Vite plugin).
- `Loadable` and `Task` / `TaskList` still carry React-era shapes (lodash `isEqual`, `batch()`) on top of spell cells
  (inferred from the code's age and comments).

## See also

- `agents/solid/solid-2.md`:  Spell's Solid 2 rules and decisions
- `agents/coherence/catalog.md`:  every mechanism Spell has
- `spell.epics/agents/CODE-DEBT.md`:  "Two reactive engines", "Drawing works around Solid rc.13's `<Errored>`",
  "The runners can't run TypeScript output"
- `spell.epics/guides/solid/solid-2.html` (why spell cells), `spell.epics/epics/seo/seo.plan.html` (the static render)
