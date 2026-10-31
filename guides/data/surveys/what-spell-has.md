# Epic `data`:  what the repo says today

Read 2026-10-31, in the `data` worktree.  Nothing was run:  all of this is from reading code and epic pages.
Paths are from the worktree's root unless they start `spell.epics/` (`/Users/owen/www/spell/spell.epics/`).

Correction to the brief:  the built-in projects are at `app/spaces/@spell/`, not `app/src/spaces/@spell/`.

## 0. The headline

1. Spell has NO way for a program to read from or write to a back-end, in the language.
   - No `fetch`, URL, load or save statement exists:  grep of `parser/src/spell/rules` and `parser/src/core` finds no
     `fetch` / `$fetch`.
   - The only network in the core is `page.ts`'s WebSocket, for a page mirroring a Python program.
2. But most of the plumbing below such a statement already exists, written for other reasons:
   - saving by id, with references, versions and checks (`saving.ts`, `checking.ts`);  both JS and Python
   - state-by-id and patches, and a mirror reading them into the same objects (`state.ts`, `page.ts`)
   - a storage interface with five verbs (`SpaceStorage`), one disk implementation
   - a "where it's kept" abstraction for prefs (`PrefPlace`:  storage, IndexedDB, server)
   - a lazily-loaded parts mechanism (`EpicParts` + `LoadableBody`)
   - cancel-aware fetching in `spell/util`, unreachable from spell (`abortableFetch`, `Loadable`)
3. The word `saved` is already in the language, and already means "a file":  `a person is saved in its own file`.
   - Today that word only shapes the JSON.  Nothing in spell triggers a save or load:  `PeopleStore` (TypeScript) does.

## 1. How a Spell program looks

Three surface forms:  code spell (`.spell`), spellx (`.spellml`), each language's twin (`.es.spell`).

Types and properties, code spell ([HabitTracker.spell](app/spaces/@spell/examples/habit-tracker/HabitTracker.spell)):

```text
a "habit" is a view where:
	- its "name" is text
	- its "monday" is yes or no
	// how many days this week it was done
	- its "count" is the number of days in its days where it is yes
```

Lists and belonging, same file:

```text
a "week" is a viewable list of habits where:
	- its items can be reordered immediately
a habit belongs to one week

habit tracker is an app where:
	- its "habits" is a new week
	- to add the draft:
		if its draft is "" return
		add (a new habit with name = its draft) to its habits
		clear its draft
```

Spellx ([TaskList.spellml](app/spaces/@spell/examples/TaskList/TaskList.spellml)), filtering and binding:

```text
<spell-view "task" selectable draggable>
	<property "priority" one-of="low, normal or high" />
<property "active count">the length of (tasks in its checklist where it is active)</>
<ui-form value={it}> ... <ui-checkbox name="done" aria-label="Done"/>
```

The closest thing to a data declaration ([People.spell](app/spaces/@spell/library/people/People.spell)), which compiles
only to `ts/lib` for the TypeScript `PeopleStore`:

```text
a person is a thing:
	- it is saved in its own file
	- it has names as text
	- its "emails" is a list of text
	- its "friend-lists" is a list of friend-lists
```

Observations for the language design:
- `its X where Y`, `the number of days in its days where it is yes`, `tasks in its checklist where it is active`:
  a query-like phrase is ALREADY how people say a filter, today over in-memory lists.
  A query over a remote collection could read the same.
- `a <x> belongs to one <y>` is a relationship declaration with ownership tracked at run time (`List.ownerOf()`).
- `a new X with name = ...` is creation;  `add ... to`, `remove ... where`, `clear`, `set the X of Y to` are the mutations.
  All are compiled to a small set of calls (`List.writeItems()`, property setters).
- `<ui-form value={it}>` with `name="done"` is two-way binding by name:  typing writes the property.
  Every write already goes through one function (`noteSetting()`, below).
- `Every thing has an id, built in:  nobody declares it`, made up on first read unless set
  ([PARSING.md](parser/src/spell/PARSING.md), "Ids and saving").

Existing words near "data":
- `a person is saved in its own file`, `a dated-event is saved inline`:  shapes the save
- `a person version 2 renames name to names`, `a person version 3 drops nickname`,
  `to upgrade (a person) to version 4: ...`:  schema migration, in the language (`rules/classes/VersionStep.ts`,
  `UpgradeMethod.ts`)
- `remembered`:  a core prop option (`declareProp("theme", { remembered: true })`), keeping text / numbers / choices
  between runs;  "The compiler writes no `remembered` yet" (`parser/src/core/AGENTS.md`).  So it has no spell words.
- `animation`, `animated`, `wait for:`, `pause for`, `notify ... and wait`:  today's waiting;  going (epic `language`)
- `start process X`, `stop process X`, `process X is running`, `start exclusive process`
- `when <property> changes`:  a change handler (`onPropertyChange()`)
- `an action` undoable through `declareAction()` (compiler doesn't write it yet)
- NOT words:  load, fetch, sync, query, server, cloud, offline.

Corpus today:  examples are all in-memory, started by top-level `add` lines or `create it` actions.
`load` and `save` appear in no example program as a statement.

## 2. What the compiler knows, and could gather

The compile:  `SP.SpellProject` parses every file into matches, then ASTs;  `combineCompiled()` hoists members across
files;  a WRITER writes each target ([PARSING.md](parser/src/spell/PARSING.md), "Compile").

- Whole-program facts already exist:  [WriterProject.ts](parser/src/parser/writers/WriterProject.ts), `WriterProject.of(files, scope)`,
  "What a javascript writer must know about a whole project BEFORE it writes any of it".
  - "Made once per compile, from every file's statements."  "Plain facts, worked out from the tree alone".
  - Holds `members`, `properties`, `getterMethods`, `superTypes`, `itemTypes`, `givenValues` (every value given to a
    member), `moduleValues`, `importedMembers`.
  - The tree walker:  `forEachNode(node, callback)`.
  - THE hook:  epic `language`'s P9 moves Python's `findWaiting()` into exactly this class
    (`parser/src/py/PyWriter.ts:77`), "the home of what a whole project says".
    A "what each draw reads" pass is its sibling, and could run beside it.
- Imported projects carry their facts by declarations (`<Project>.declarations.json5`, `ScopeMethod.waits`), so a
  fragment summary could cross project boundaries the same way (`noteTypes()`, I3 in `language`).
- A draw compiles to a plain method, so it's visible as an AST:

  ```js
  // app/tests/spell/__examples__/TaskList/TaskList.elements.snapshot.js
  draw() {
    return h("ui-form", { value: this },
      h("div", { part: "row" },
        h("ui-icon", { part: "grip", name: "grip vertical", "aria-label": "Drag" }),
        h("ui-checkbox", { name: "done", "aria-label": "Done" }),
  ```

  - `ASTMethodDefinition` (the draw), `ASTPropertyExpression` (a read), `ASTReactiveProperty` (a property):
    `parser/src/parser/ast/AST.ts:1154`, `:512`, `:1641`.
  - A pass would walk each type's draw and follow getters (`getterOf()`), `draw its habits` to the item type
    (`itemTypeOf()`), and binding by form-field name (`name="done"`, a string, on a `value={it}`).

A GraphQL-fragment-shaped gather looks feasible (inference, nothing prototyped).  Its gaps:
- `the X`, `its X` give the owner by name;  a read through a local or argument needs the writer's `kindOf()`.
- `draw it`, `draw each item` are polymorphic:  a sub-class's draw decides.  The waiting pass joins BY NAME for this,
  over-approximating;  fetching too much is safe in the same way.
- Conditional reads (`if its priority is not normal`) are gathered regardless, as with GraphQL.
- Form fields' `name=` are strings, read by Spell UI at run time.
- Custom elements and hand-written library code are opaque.

There's a SECOND, run-time way to know, already built:  reactive cells record who read what.
- [cells.ts](src/util/reactive/cells.ts):  "Cells only say WHO read WHAT, and tell them when it changes."
  `linkCell(source)` on every `getProp()`.
- So a first draw could discover what's needed, one "not ready" at a time, then be batched (`Observable` / Meteor shape),
  with the compiler's gather as the optimisation that sends it all in one trip.
  Worth comparing with `fate` in the survey.

How classes become reactive:
- A property compiles to a getter / setter pair over cells, with its schema declared once:

  ```js
  static { this.declareProp("title", { type: "text" }) }
  get title() { return this.getProp("title") }
  set title(value) { this.setProp("title", value) }
  ```

- Spell cells are SYNCHRONOUS on purpose, not Solid signals ("`set x to 1` then `print x` must print 1"),
  bridged to Solid by `bridgeSolid()`.  Record truth:  a `Map` per object (`reactive/extend.ts`).
- ONE choke point for writes:  `noteSetting(target, property, value)` ([core.ts:89](parser/src/core/core.ts)), which feeds
  the undo history, `core.remote?.set()` (a page's write going to a program elsewhere) and `when changes` handlers.
  And for lists:  `List.writeItems()` => `noteItems()`.
  - An optimistic write-through to a back-end hooks in the same place `core.remote` does.
    `RemoteProgram` (`parser/src/core/elements.ts:352`) is a five-method seam already:  `run`, `startWhile`, `endWhile`,
    `set`, `trigger`.

## 3. Epic `language`:  transparent async

`spell.epics/epics/language/`.  Stage "building".  P1 Test Model, P2 The Read done;  P3 Set the X active.
The async phases are all TODO:  P8 Waiting Prototype, P9 Shared Waiting Pass, P10 One Queue Per App, P11 Saying Not To
Wait, P12 Waiting Getters and Draws, P13 Old Words Removed.  **Nothing of it is built:  plans accepted 2026-10-31.**

What it will give, and in what words:
- **No word at all to wait.**  (`o5`)  `to deal the cards: ... play from the stock`.  Compile time (Q5, A), output is ordinary
  `async` / `await`;  JS and Python agree.  Seeds:  "`pause`, dialogs, sending, and anything calling those".
  - The seed list is core's declarations, a `waits` entry (P9 step 6).
    **So a data core call gets transparent async by being marked `waits`.**
- **`at the same time:`** runs a block together (`Promise.all` / `asyncio.gather`);
  **`meanwhile deal the cards`** starts something and carries on, via `core.meanwhile()`;  failures shown;  not queued.
  Q7's own example is `meanwhile load the scores`.
- **A getter may wait, with no new words.**  A draw shows "…", then fills in;  later changes keep the old value
  (Q8, C;  P12).  `core.waitedValue()` (one `createDeferred` per thing and getter), `core.whileWaiting()`, one `<Loading>`
  in `drawInBoundary()`;  a failure shows `cant-draw` and heals.  Python's server waits before sending the page.
  This is exactly "show data from the cloud":  `its score` can just be a slow getter.
- **One queue per app** (Q6, A;  P10), in `core.runAction()`:  a repeat of the running action is ignored, a different one
  waits, only the latest kept.  Only what a PERSON starts;  nested calls stay direct.

**Cancellation is NOT covered.**
- P10:  "Left out:  stopping a running action by name.  It can be added once someone asks for it."
- Q5's chosen option:  "Cancelling happens only at a wait, and it works by name."  (a property of the option;  no plan builds it)
- Nothing in P8-P13 mentions `AbortSignal`.
- Word search:  "cancel" / "abort" appear only in Q5 in all of `language`'s parts.

What's left for `data`:
1. Cancelling, and what navigating away does.
   Q6 says outright:  "A long fetch holds clicks, unless written with the opt-out in Q7."
   So a person's navigate click is queued behind a slow load action, keeping only the latest.  That's the WRONG default
   for data unless loads aren't queued actions.
   A load through a waiting GETTER isn't in the queue, which is an argument for reads being getters and only writes actions.
2. All the back-end words, sources, identity, caching, batching, write-through, errors offline.
3. Reading your own write.  **Q8 left it unsolved:**  in an action just after a change, Solid's `resolve()` gave the old
   value (30, not 50);  `refresh()` was right but re-runs the slow work.  P8 is to try it.
4. Traps Q8 names, which bite data directly:
   - reads AFTER a getter's first wait aren't tracked:  a query's parameters must be read before it waits
   - `@derived` over a waiting getter stays wrong for good
   - a raw promise in a live value draws "can't draw"
   - a plain `createMemo` freezes the drawing, so only `createDeferred`
   - not measured:  how long each per-thing value lives, and the cost with thousands (each could re-run its slow work
     whenever what it read changes).  Lists of 10,000 rows are the data epic's question.
5. `where` and sort over slow values:  P9 says `where` goes one by one, a slow sort comparison is an error.
   So a remote `where` must be pushed DOWN to the source by the compiler, or it means N calls.
6. Order:  `data`'s async-dependent phases should come after `language` P8-P12, or prototype against P8's results.

## 4. Epic `crdt`

`spell.epics/epics/crdt/`.  **A future epic:  no phases, stage "overview", nothing built;**  started 2026-10-11.  Saga
`shared-spell`.  Kickoff:  "The python-created 'send updat bits to elements' could be used as the base of multi-edit spell
editor."

What Owen answered ([analysis.answer.json5](spell.epics/epics/crdt/details/analysis.answer.json5)):
- Q1, C:  people share a RUNNING program, not the source text.  Shared source editing is out of scope.
- Q2, A with a condition:  "As long as CRDT does not imply anything as per how a .spell file or a component is saved.
  Explore both options."  No pick until a comparison (library vs our patches grown).
- Q3, A:  the editor server keeps the shared copy, no WebRTC, no outside service.
- Q4, A:  one machine or a local network, no accounts.

What it concluded, usefully for `data`:
- "With a shared running program, one program referees every change, so today's patches may already be enough;
  the comparison says whether a CRDT earns its keep."
- Today's patches work because there's one referee.  Without one, four things break:
  - ids:  the server counts up, so two editors would both make a "27"
  - whole things:  "a patch sends a changed thing whole, and the last one to arrive wins.  You change a card's suit while
    I turn it face up:  one of the two changes is lost."
  - one way:  only the program sends patches
  - text:  a whole-file patch wipes what the other typed
- Text needs a real CRDT (Yjs + y-monaco suggested), but Owen scoped text out.

Conflict with "no full CRDT"?  **No conflict in substance.**
- Its picks point the same way:  a referee, and maybe no CRDT.  Its Q2 pick of "a library" is still only "compare first".
- Two things to reconcile:
  - its title and Q2 say "CRDT library";  Owen's kickoff for `data` now says he doesn't want that complexity
  - it assumes a referee PROGRAM on the server;  `data` may have no running program, only stores (REST etc).
- Cheap "self-healing" gaps the analysis exposes:  patches should be per property rather than per thing, and ids should
  be unique per person, not counted by the server.
- Related future epic, also unbuilt:  `spell-server-state` (JS / TS programs on a node server, mirrored, JS change
  tracking;  "today only Python's core tracks changes", python-target J53).

## 5. Back-end today

Can a compiled Spell app talk to a server today?
- **As spell code:  no.**  There's no statement for it.
- **As a whole program running on a server:  yes, Python only.**  A browser page mirrors it over a WebSocket:
  - [parser/src/core/page.ts](parser/src/core/page.ts):  `startPage()`, `receive()`, `sendCall()`, `sendTrigger()`, `connectPage()`.
    "ONE page at a time."
  - Messages:  `{ "call": "turn_over", "on": "Card#queen-of-spades", "args": [] }`,
    `{ "trigger": "card-click", "target": "Card#..." }`, `set_prop`.
  - [spell_quart/sessions.py](app/src/spaces/server/py/spell_quart/sessions.py):  "A game per visitor, a page per WebSocket".
    "Their game lives in this process's memory:  a restart ends it."  State down at open, then a patch per message and per pause.
  - So state is per visitor;  nothing is shared between people yet, and nothing persists.
- **Compiled JS in the editor:** runs in the browser, with prefs through `core.remember()`.

Persistence pieces (not reachable from spell):
- [saving.ts](parser/src/core/saving.ts):  `new Saver().save(thing)` => `{ root, entries }`, by key `"Person#owen"`;
  `new Loader({ entryFor }).load(key)`.  References `{ "$ref": "Person#matt" }`, `"$in"`, places `Person#matt@three-degrees`.
  "Where entries live is the caller's."  **`entryFor` is synchronous**, so it must become async, or entries be prefetched.
  Python twin `spell_core.saving`, pinned to one expected file.
- [checking.ts](parser/src/core/checking.ts):  `checkEntry()`, `jsonSchemaFor()`.
- [state.ts](parser/src/core/state.ts):  `StateWriter`, `StateMirror`:  reads each state INTO the things it read before, by id.
  This is an identity map:  what a normalised client store needs.
- [SpaceStorage](app/src/spaces/models/SpaceStorage.ts) / [DiskStorage.ts](app/src/spaces/server/node/storage/DiskStorage.ts):
  read, write, list, remove, watch, by path.  "File system semantics" is nearly this interface.
- [PeopleStore.ts](app/src/spaces/server/node/people/PeopleStore.ts) + `peopleRoutes.ts`:  the ONE worked example, a spell
  type library (`ts/lib`) over files, one file per thing, with comments kept.  Hand-written TypeScript;  "Nobody's refused
  a save yet":  no permissions.
- [src/util/persist/](src/util/persist/):  `PrefPlace` (abstract), `StoragePlace`, `DatabasePlace`, `ServerPlace`;
  `WaitedOnPlace` reads whole at start, "so one that must be waited on answers every read at once after that".
  A precedent for "swap the back-end, keep the front", though for key / value prefs only, values as text.
- Live push:  prefs saves are told to every open page over the page server's channel (`pref-saved`).
- Cancel-aware fetch:  `$fetch()`, `abortableFetch.ts`, `CanceledRequestError`, `isAbortError`;
  `Loadable` (`loadStatus`-style state, `stopInflightLoadOrSave()`).  These are kit level, and spell programs don't see them.

Python target:  could a data source be server-side spell?  Yes, it looks very plausible.
- `spell compile --target py` already writes a server program on Quart, `<Project>.app.py`, with `spell_core.saving`.
- `ts/lib` shows the other half:  "the classes alone" for other code to import, with no drawing, and `people.lib.ts` is
  imported by node.  So one spell project can already be a shared model both sides use.
- `ProjectBuild` builds on demand, and `targets` in `__project.json5` choose outputs.
- Missing:  a source / server-action concept, routes generated from it, auth.  `spell run --target py` is the whole-program
  mode;  a data source would be a different one, with a server spell holding the data and a browser spell drawing it.

Chunked files model:  the epic page.
- [EpicParts.ts](epic/src/tool/EpicParts.ts) splits a page into a skeleton and `parts/<id>.html`.
  Host in the skeleton:  `source="parts/p3.html"`, plus `part-ids` (the ids inside, so a link loads the body first) and
  `commits`.  "the title stays in the skeleton, so the line shows without the body".
- The read:  [EpicFold.tsx](epic/src/components/epic-section/EpicFold.tsx), `E.DOMLoadableBodyElement`, `LoadableBody`:
  fetched the first time it opens.  A changed body file re-fetches while open (`spell-server:changed`).
- The write:  whole doc read, then written back split, "each file once, atomically, only when changed".
- As a data pattern:  a list of summaries in one file, each item's details in its own file, an index of ids so deep links
  load first, live change notices.  Conflict policy:  sync renumbers colliding ids and re-sorts logs, `ContentMerge`
  settles two adds at one place (`SharedSync`, epic `epic-friend` P5):  that's real working "oops, self-heal" prior art.

## 6. What I could not determine

- How well a static "what a draw reads" gather works on the corpus:  no pass was written or run.
- Whether Solid's `createDeferred` can abort its in-flight promise or discards a stale answer, and whether it hands an
  `AbortSignal`.  `language`'s P8 hasn't run.  Not read in Solid's source.
- `language`'s Q8 action-read answer, and the per-thing cost at thousands of things:  open until P8.
- Whether the JS core's `recording` list in `noteSetting()` is a usable change tracker for patches;  python-target J53
  says only Python's core tracks changes.
- Whether `Thing.id`s are globally unique enough for sync, beyond `person-k3x9q2mf`'s made-up shape:  the generator wasn't read.
- Auth:  nothing beyond a visitor cookie and "this machine's person";  no plan seen.
- `spell.epics/epics/data/parts/` contents weren't read, beyond the plan's kickoff.
