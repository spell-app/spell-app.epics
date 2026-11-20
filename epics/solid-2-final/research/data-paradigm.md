# Loading and saving data:  the paradigm, Python on Quart, streaming, generators

Research for epic `solid-2-final`, 2026-11-20 (agent `solid-2-final-data-paradigm`, read only).
Owen's question:  "Loading / saving data -- how can our paradigm apply to e.g. a Python program running in Quart?
What about streaming?  Where can we use generators under the hood to make things better?"

- Paths are from the kit's root (the worktree `solid-2-final`);  line numbers as of today.
- Guesses are marked (inferred).
- Any new Spell phrase below is a PROPOSAL:  it needs Owen's OK, and each one shows where it could be misread.

## 0. The answer in one screen

- **The paradigm** is "a place":  one small interface for every back-end, and an engine above it that
  - shows what you wrote at once
  - keeps it on the device until the place says yes
  - heals after a refusal or a reconnect
  - shares one request between every reader
- **Python goes about a third of the way** (inferred, from what's listed below).
  - It has places:  6 kinds, the same rows and the same wire format as the browser.
  - It has none of the engine:  no pending changes, no retry, no healing, no live updates, no pages of a list.
  - Under Quart, its writes block the one event loop every visitor shares.
- **Streaming today** is websockets only:  rooms, live reload, AT Protocol's Jetstream, and the Quart page's patches.
  No HTTP response is streamed anywhere:  no SSE, no NDJSON, no streamed server rendering.
- **The best streaming move:**
  make a list a stream of PAGES (`ListAnswer.nextPage` already exists), delivered as an NDJSON response by `PlaceServer`,
  by Quart (an async generator), and by `RemotePlace`.
  The drawing shows rows as they arrive, with the `<Loading>` riders it already has.
- **The best generator move:**
  compile a Spell action to a GENERATOR, `function*`, run by `core`.
  - Each pause, each wait and each debug step is a `yield`.
  - One build then gives exact cancelling (`return()`), skipping pauses, stepping in the debugger, and Solid 2's
    `action()`, whose writes land as one transaction.
  - Python gets the same from `async def` plus asyncio, mostly already.

## 1. Today:  the loading and saving paradigm, in plain words

### What an author writes

One line says where a type is kept.  Changing that line moves the data;  nothing else in the program changes.

```spell
family cookbook is stored on this device
// or:  family cookbook is a data folder at personal "recipes"
// or:  family cookbook is a room at "http://127.0.0.1:4791/api/rooms/recipes"
// or:  family cookbook is saved in the cloud

a "recipe" is a thing
	it lives in family cookbook
	its "title" is text
```

From [RecipeBox.api.spell](../../../../../spell.worktrees/solid-2-final/app/spaces/@spell/examples/RecipeBox/RecipeBox.api.spell).
A server other people run says more about itself, each a line
([GitHub.api.spell](../../../../../spell.worktrees/solid-2-final/app/spaces/@spell/examples/PublicServers/GitHub.api.spell)):

```spell
github is a web server at "https://api.github.com"
	it is optionally authenticated with the secret "GITHUB_TOKEN"
	its next page is in its "Link" header
	it gives up to 100 at a time, asked for with "per_page"
	check it every 40 minutes
```

Other lines in use:  `- keep a copy on this device`, `check it every 30 seconds`, `in one go:`, `enabled operations are ...`.

### The moving parts, in the order a read and a write happen

1. **Compile.**  The compiler gathers what the program reads from each place before it runs
   (`P.ReadGathering`, `parser/src/parser/writers/ReadGathering.ts`):
   - `firstReads`:  everything a first drawing reads, asked for together
   - `select`:  only the fields something reads, for a place that can leave the rest out
2. **First read.**  The program's first mention of a place loads `spell/places` by a dynamic `import()`
   (`parser/src/core/saved.ts`, its header).  No place named, nothing loads.
3. **One request per list.**  Every reader of the same list and query shares one request
   (`PlaceReads`, on `LoadOnce`).  The last reader leaving aborts it.
   - Lists asked in the same moment go in one request, where the place allows it (`PlaceBatch`, `Place.listMany()`).
   - `newestWins`:  a newer search aborts the older.
4. **The place answers.**  `Place.list()` (`src/places/places.types.ts:855`) returns a `ListAnswer`:
   rows, and a `nextPage` token when there's more (`places.types.ts:549-553`).
   - What the place can't do (filter, sort, slice) is done in the browser, under a ceiling (`PlaceQuery`).
   - A rate limit is waited out, or `TooSoonError` says when (`WebPlace`).
   - `- keep a copy on this device`:  every answer is kept in IndexedDB (`DeviceCopy`);  fresh, it answers without asking.
5. **One row per thing.**  `PlaceCache` keeps ONE row per type and id, its fields reactive;
   `PlaceThings` turns rows into Things.
6. **What the reader sees.**  `PlaceResult` (on `Loadable`) says, in words, where its read is:
   `"still waiting"`, `"complete"`, `"from an earlier visit"`, `"couldn't update"`.
7. **Drawing.**  `core.drawRead()` (`saved.ts:1754`) draws a list:
   - an async read becomes Solid's `createDeferred()`, so what it showed stays until a new answer lands
   - `<Loading>` with the program's own "while loading" riders, else the "…" every waiting value shows
   - a failure shows a message and Try again, never a blank page
   - a long list is drawn in a window (`drawnInWindow()`), each next page read as it nears the view (`readNextPage()`, `saved.ts:1042`)
8. **A write.**  Setting a saved field is the whole write:  no save step.
   - `PendingChanges` (`src/places/PendingChanges.ts`, 1,082 lines) records one field of one thing, with its own id, in order.
   - It's shown at once:  pending changes sit on top of what's read (`replayOn()`), so you read your own writes.
   - It's kept on this device, per tab (`TabCopies`), so it outlives a reload.
   - `SaveQueue` sends it in the background, in order, until it goes through;  `keepalive` as the page leaves.
9. **The place answers the write.**
   - No answer:  sent again with the same id (`PlaceServer` makes a `changeId` once).
   - Refused:  dropped, put back, healed, one failure raised (`Places.onWriteFailed()`).
   - Out of date:  a three-way merge per field against what it `was`, sent again;  `Places.onConflict()` hears what was lost.
10. **Healing.**  `PlaceHeal`:  fetch the latest, replay what's pending:  on opening, on a refusal, on demand.
11. **Hearing other people.**  Each place says how it tells of changes, `live: "poll" | "push" | "none"`
    (`places.types.ts:218`):
    - poll:  `pollWhileVisible()`, at the line's `check it every`;  `changesSince()` asks only what changed
    - push:  `LiveRoomPlace` + the server's `Referee` (everyone's changes in one order);  `AtProtoPlace`'s Jetstream
12. **The server half.**  `PlaceServer` (`src/server/places/PlaceServer.ts`) serves ANY place over HTTP, every request a
    `POST` of JSON under `/api/places/<name>/`:  `list`, `getMany`, `apply`, `call`, `changes`, and `GET` for what it
    can do.  It holds keys and scrubs them from every answer.  `RemotePlace` is its browser half.

### How the pieces read, in one sentence each

- A **place** says what it can do and lists a collection;  everything else is optional, and the engine does without.
- The **engine** above it (`Places`, `PlaceCache`, `PlaceReads`, `PendingChanges`, `SaveQueue`, `PlaceHeal`) is the same
  for every place:  that's what makes changing the one line safe.

## 2. A Python program on Quart

### What exists today

The `py` target (epic `python-target`) runs a program on asyncio;  `spell_quart` serves it as a web app, a game per
visitor, its page drawn in JavaScript from state sent down a websocket.

- **Places in Python** (epic `data` P40):  [places.py](../../../../../spell.worktrees/solid-2-final/parser/src/py/core/spell_core/places.py)
  (783 lines), the twin of the JavaScript core's `saved.ts`, on
  [place_kinds.py](../../../../../spell.worktrees/solid-2-final/parser/src/py/core/spell_core/place_kinds.py) (410).
- **Six kinds** (`PY.PLACE_KINDS`, `parser/src/py/places.ts`):
  - `database on this device`:  one JSON file beside the program, `<Program>.device.json` (`DeviceFile`)
  - `data folder`, `sheet`, `excel file`:  the page server's place routes, `ServerPlace` (`place_kinds.py:189`),
    the SAME requests a browser's `RemotePlace` sends (`POST <address>/list | apply | call`), with the write token
  - `atmosphere account`, `personal atmosphere account`:  an app password from the environment (`atmosphere.py`)
  - every other kind is refused while compiling:  a web server is "not in Python yet"
- **The same rows:**  plain JSON by JavaScript's field names, so a page and a Python program share them.
- **What's the same as the browser:**
  - ONE thing per type and id, however often read
  - a saved thing writes itself as it changes, only the fields that changed (`note_change()`, `places.py:317`)
  - `in one go:` holds the changes and sends them together (`places.py:367`)
  - `check it every`:  a read is asked again once it's that old (`is_due()`, `places.py:225`) -- on the next read, not by a timer
  - a rate limit is waited out (`open_minding_limits()`), as `WebPlace` does
- **What's missing** (the module says so itself, `places.py:28`:  "no undo of a write, no notices, no samples, no live rooms, no pages of a list"):
  - no `PendingChanges`:  a write that fails is a console line, and it's lost (`note_change()`'s `except PlaceError`)
  - no retry, no `changeId`, so no "sent twice, made once"
  - no healing, no three-way merge, no `onConflict()`
  - no live updates:  no room, no watch, no Jetstream
  - no paging:  `ServerPlace.rows_now()` asks `{"query": {}}` and takes every row
  - no web server kind (`RestPlace`), GraphQL, Airtable, Google sheet, the cloud

### A problem under Quart:  writes block every visitor

- `ProgramPlaces.send()` calls `behind.apply([change])` straight on the event loop (`places.py:360-365`).
- `ServerPlace.apply()` is plain `urllib`, waiting for the answer (`place_kinds.py:227`, `post_json()` at `:248`).
- Reads are off the loop (`asyncio.to_thread()`, `place_kinds.py:216`), except in a drawing (`rows_now()`, `places.py:200`).
- Quart was picked BECAUSE one thread serves every page (the python-target guide:  "on asyncio a pause awaits, so one
  thread serves every page").
- So one visitor's card move, saved to a data folder, stalls every other visitor's game for the round trip (inferred
  from the code;  not measured).
- Also:  `database on this device` under Quart is ONE file on the server, shared by every visitor (inferred):
  "this device" means the server, which reads wrong for a web app.

### What a Python program's places would look like server-side

The wire is already shared, so the shape writes itself (inferred):

- **Same wire, both directions.**  `PlaceServer`'s routes are five `POST`s of JSON.
  A Python `PlaceServer` twin is ~150 lines of Quart:

  ```python
  @app.post("/api/places/<name>/list")
  async def list_rows(name: str):
      body = await request.get_json()
      answer = await places[name].list(body["collection"], body.get("query", {}), context_of(request))
      return answer  # {"rows": [...], "nextPage": "..."}
  ```

- **Then the browser's places talk to a Quart server as just another place.**
  A page's `family cookbook is a data folder at "https://my-quart-app/api/places/recipes"` would be a `RemotePlace`
  (`isPlaceServerAddress()` decides that today by address), with all of the browser's engine:  pending, retry,
  heal, merge.  Nothing new in the browser.
- **And the Python program itself can be the place.**  Two readings:
  1. **Its saved things, served:**  a Python program's own places, re-served through its Quart app, so a browser
     program (not the drawing half) reads and writes them.  Cheap:  the twin above, over `DeviceFile` or `ServerPlace`.
  2. **Its live state, as a room:**  the program's Things ARE a room's rows, and `spell_quart`'s per-visitor game
     becomes a `Referee` for a shared game.
     - Today each visitor has their own game in memory (`SpellSessions.visits`, `sessions.py`);
       "their tabs share it" is the only sharing.
     - The patch stream (`StateWriter.patch()`) already says what changed, by id:  close to `RoomCopy`'s steps
       (inferred).  What it lacks:  numbered steps, a heal ("ask what I missed"), people here.
     - The catalog already names the split:  `StateMirror` is "counted ids and whole things, one way, for a program that
       runs elsewhere" (`agents/coherence/catalog.md`, "Everyone's changes, in one order");  a two-way one is `RoomCopy`.
- **Python server actions.**  `RestPlace` named operations (`call()`) are what a browser program would call;
  a Python function marked as one becomes a route (`POST /api/places/<name>/call`).
  This is the "server actions" idea in `spell-today.md` §2.17, with Python as the server.

### The gaps, smallest first

| Gap | What it gives people | Where | Effort (inferred) |
| --- | --- | --- | --- |
| Writes off the loop:  `await asyncio.to_thread(apply)` in `send()`, or a per-place write queue task | one visitor's save never stalls another | `places.py` `send()`, `in_one_go()` | S |
| A pending list with retry and `changeId`s | a save that fails is tried again, not lost | `places.py`, a small `pending.py` twin of `PendingChanges` (no device copy:  a server outlives a tab) | M |
| Pages of a list | a big folder is read a page at a time | `ServerPlace.rows_now()` takes `nextPage`;  an async generator of pages (section 4) | S |
| `database on this device` per visitor under Quart | each visitor's notes are their own | `place_kinds.py`'s `device_file_for()`, keyed by the visitor | S |
| A web server kind (`RestPlace`'s twin) | GitHub, weather, any API from Python | `place_kinds.py`;  standard library only (Q33) means `urllib`, so off the loop | L |
| A Python `PlaceServer` twin in `spell_quart` | browsers reach a Quart app as a place, with the whole browser engine | `app/src/spaces/server/py/spell_quart/places.py` (new) | M |
| The Quart page's socket coming back | a dropped connection doesn't end the page | `connectPage()` opens once (`parser/src/core/page.ts:302`):  on `ReconnectingSocket`, resent state on open | S |
| A shared game:  the program as a room | many visitors in one game, multiplayer Solitaire | `sessions.py`, `state.py`;  `Referee`'s semantics in Python | L |

## 3. Streaming

### What Spell streams today

- **Websockets, always.**  `LiveReload` and `liveClient.ts` say why not SSE
  (`src/server/LiveReload.ts:25`):  "an `EventSource` holds one of Chrome's 6 connections per host for good,
  and every VS Code window shares them".
  - HTTP/2 lifts that limit (100+ streams per connection);  the page server is HTTP/1.1 today (inferred).
- What runs over them:
  - rooms:  `LiveRoomPlace` + `Referee`, numbered steps, heal on a gap
  - live reload, page patches
  - AT Protocol's Jetstream (`AtProtoPlace`, a cursor to pick up from)
  - the Quart page:  whole state, then a patch after each message and at each pause, so a deal animates
    (`sessions.py`, `core.before_pause`)
- **Reading a body as it comes, but only to count it:**  `SheetPlace.bytesUnderCeiling()` (`src/places/SheetPlace.ts:140`)
  reads a CSV chunk by chunk, stopping at the ceiling, then parses the whole.  The ingest's `PoliteReader` does the same.
- **Nothing streams to a drawing:**  no SSE, no NDJSON, no `renderToStream`, no token stream.
  The editor's AI ("Explain This") asks Claude Code on the machine and waits for the whole answer
  (`app/src/app/solid/ExplainThis.tsx`).
- `ListAnswer.nextPage` exists, and `drawnInWindow()` reads the next page as it nears the view:
  paging is the closest thing to streaming a list.

### What it could stream

1. **A long list as a stream of pages** (the best move).
   - The place answers with NDJSON:  one JSON line per page, `{"rows": [...], "nextPage": "..."}`, or per row.
   - `PlaceServer`:  `list` gains `stream: true`, writing each page as the place yields it.
   - Quart:  the route returns an async generator, which Quart streams
     ([Quart's streaming guide](https://quart.palletsprojects.com/en/latest/how_to_guides/streaming_response.html)).
   - `RemotePlace`:  reads `response.body` line by line, and each page lands in `PlaceCache` as it arrives.
   - The drawing:  the rows it has show, the rest wait under the riders it already has.
     No new `<Loading>` per item:  the list grows.
   - What it gives:  a 10,000-row sheet shows its first rows in one round trip, not after all of them.
2. **Server-Sent Events for a place's changes**, where a websocket is too much.
   - Quart:  an async generator of `data: ...\n\n`, with `response.timeout = None`
     ([Quart's SSE guide](https://quart.palletsprojects.com/en/latest/how_to_guides/server_sent_events.html)).
   - Fits `live: "push"` for a read-only feed:  `changesSince()` held open instead of polled.
   - Against it:  the 6-connection limit above, on HTTP/1.1.  So:  SSE for a public read feed on an HTTP/2 host;
     websockets for everything two-way.
3. **AI token streams.**  A Spell line that asks a model for text would draw it as it comes.
   - The value is a growing text:  each chunk a write to one cell, drawn at once.
   - Under the hood, an async iterable of chunks;  Solid 2's `createMemo(() => from(stream))` reads it
     (`solid-features.md` §1.2, `from()`).
   - Nothing in Spell asks a model at run time yet (inferred):  this would be new.
4. **Solid 2's streamed server rendering.**  `renderToStream()` sends the shell, then each `<Loading>` as it settles
   (`solid-features.md` §1.12).  A Spell site's page could arrive drawn, its places filling in as they answer.
   - Spell renders nothing on a server today;  `spell-today.md` idea 6 is this.
   - For Python:  a Quart route could stream the page Python draws (`--page` prints it whole today, `PageSession`)
     a section at a time (inferred).
5. **The Quart page's patches as a stream** already work this way over the socket.
   An HTTP fallback (SSE down, `POST` up) would let a page work through proxies that drop websockets (inferred).
6. **Uploads and big files.**  `FolderFiles` takes a file's bytes whole;  a `ReadableStream` body would let a big file go
   up with progress, and be hashed as it goes (inferred).

### What a stream would look like to a Spell author

The rule from `spell-today.md` and Owen's standing notes:  plain English, no parentheses, and every new phrase his call.

- **Pages of a list need no new words.**  `its next page is in its "Link" header` and `it gives up to 100 at a time`
  already say a list comes in pages;  streaming them is under the hood.  Recommended:  no phrase.
- **PROPOSAL A, a growing answer:**

  ```spell
  its "summary" is written by the model as it comes
  ```

  - Ambiguity:  "as it comes" could read as "when it arrives" (wait for the whole), the opposite of what it means.
  - Ambiguity:  is the summary saved, or only shown?  It would be a worked-out value, so only shown.
  - A plainer alternative:  `its "summary" shows each word as the model writes it`.
- **PROPOSAL B, a feed:**

  ```spell
  news is a feed at "https://example.com/events"
  ```

  - Ambiguity:  "feed" is also RSS, and the org's own `@rs/__feed` (`PERSON_FEED_ADDRESS`), which is a data folder.
  - Ambiguity:  read only?  It would be;  a feed's things can't be written back.
  - Alternative with no new kind:  `- it tells us as things change` on any place's line, which picks push over poll.
- **PROPOSAL C, showing rows as they arrive:**  none.  The list already draws what it has;  a rider could say the rest:
  `while the rest arrive, show "Loading more ..."`.
  - Ambiguity:  "the rest" vs the existing "while loading" rider, which shows only before the first rows.

## 4. Generators under the hood

How much Spell uses generators today:  nearly none.

- JavaScript:  5 `function*` in all of `src/`, `parser/src/`, `ui/src/`, `app/src/`, `epic/src/`
  (`collection-core.ts`'s three iterators, `sending.ts:151` `chainOf()`, `PageFile.ts:58`, `PlanDocFiles.ts:582`);
  no `async function*`;  `for await` only over node streams.
- Solid's `action()` and `createOptimistic`:  0 uses.
- Python:  a few `yield`s, as iterators and `__await__`s (`sending.py`, `events.py:80`, `ui_methods.py:479`).

### Where they'd help, each with what it gives, where, effort

1. **A Spell action compiled to a generator** (the best move).
   - Today an action is an `async` function;  `ActionQueue.cancel()` stops it "at the next wait" by `CanceledError`
     (`parser/src/core/ActionQueue.ts`);  a debugging build is a SECOND build, every line `await frame$.held()`
     (`parser/src/core/stepping.ts`, its header).
   - As `function*`, each pause, wait and line step is a `yield`, and `core` drives it:
     - cancel is `generator.return()`:  exact, and its `finally`s run
     - "skip the pauses" (the Quart start, `--no-pauses`, tests) is the driver not waiting
     - stepping is the driver stopping at a `yield`:  one build for running and debugging (inferred)
     - Solid 2's `action(function* ...)` takes it as it is:  the action's writes held as one transaction,
       so no half-dealt board on screen (`spell-today.md` idea 5;  `solid-features.md` §1.5)
     - a place write inside it joins `PendingChanges`' group, `end()` at the generator's end, `cancel()` on `return()`
   - Files:  the JS writer (`P.JSWriter`, `async` => `function*`, `await x` => `yield x`), `ActionQueue.ts`,
     `stepping.ts`, `waiting.ts` (`core.answerOf()`).
   - Effort:  L.  Risk:  every core method an action awaits has to be yieldable;  a getter that waits
     (`core.waitedValue()`) stays as it is.
   - Python:  asyncio already gives most of it:  `task.cancel()` is exact (`action_queue.py`, "stops an action at its
     next wait").  Its gap is the debugger, which `yield` points would also give.
2. **A place's list as an async iterable of pages.**
   - `async *pages(collection, query)`:  yields each `ListAnswer` page, following `nextPage`.
   - Gives:  one way to page every place (`RestPlace`'s Link header, AT Protocol's cursor, a sheet's rows), and
     `PlaceReads` aborts by `return()` when the last reader leaves.
   - Backpressure for free:  the next page is asked only when the drawing pulls (`readNextPage()`).
   - Feeds the NDJSON stream of section 3 on both ends.
   - Files:  `places.types.ts` (an optional `Place.pages?()`, the engine wrapping `list()` for places without it),
     `saved.ts`'s `readPage()` / `readNextPage()`.
   - Python:  `async def pages(...)` yielding lists, in `place_kinds.py`;  `ServerPlace` first.  Effort:  S each.
3. **A room's changes as an async iterable.**
   - Solid 2's `createStore(fn)` and memos accept one (`solid-features.md` §1.2-1.3):  `createStore(() => room.changes())`.
   - Gives:  any Solid app (not only Spell) multiplayer state in one line;  `spell-today.md` idea 11.
   - Files:  `LiveRoomPlace.ts` (a `changes()` beside `watch()`).  Effort:  M.
   - Python:  `async for step in room.changes()` in `spell_quart`, the same shape for a shared game.
4. **The compile yielding between files.**
   - `perf-code.md` §2, cut 1:  the compile is a `TaskList`, one task per file;  `await scheduler.yield()` between them
     lets a key land mid-compile.
   - A generator compile (`yield` per file, per rule) makes it resumable:  a newer edit `return()`s the old compile
     instead of waiting it out (inferred).
   - Files:  `SpellProject`'s compile, the `TaskList`.  Effort:  S for the yield, M for cancelling.
5. **Parsing a big file as it arrives.**
   - `SheetPlace` and `Workbook` read bytes whole, then parse.  `parseCsv()` as a generator of rows over a stream
     would show the first rows of a big CSV at once, and stop at the ceiling by rows, not bytes.
   - Files:  `src/places/csv.ts`, `SheetPlace.ts`.  Effort:  M.  (A workbook is a zip:  no gain.)
6. **Undo as a generator?**  Weak.
   - The history is a list of steps either way (`undoing.ts`, `undoing.py`);  a generator adds nothing a list doesn't.
   - What does fit:  replaying a game's moves for a test or time travel is an iterator over steps (inferred).
7. **Python generators in the Python target itself.**
   - Spell's `repeat with each` over a place's list:  `async for thing in core.saved_things_paged(Recipe)` instead of
     one list of every row (inferred).
   - Python already writes `range()` for counted loops, as a person would (`parser/src/py/AGENTS.md`).
   - A Spell list that's worked out lazily (`the first 10 of ...`) could be a generator expression (inferred).

## 5. Ideas, ranked

Each:  what it gives people · what it builds on · effort.

1. **Python writes off the event loop** -- one visitor's save never stalls another's game ·
   `places.py` `send()`, `asyncio.to_thread()` already used for reads · S
2. **Lists as a stream of pages** -- big lists show their first rows at once, everywhere ·
   `ListAnswer.nextPage`, `drawnInWindow()`, an async iterable of pages, NDJSON in `PlaceServer` and Quart · M
3. **Actions as generators** -- exact cancel, one build for running and debugging, Solid's held writes:
   no half-updated board · `ActionQueue`, `stepping.ts`, Solid 2's `action(function*)` · L
4. **A Quart app is a place** -- a browser program reads and writes a Python server with the whole engine:
   pending, retry, heal, merge · `PlaceServer`'s five routes, `RemotePlace`, the shared row format · M
5. **Pending changes in Python** -- a refused or unanswered write is tried again, never lost ·
   `PendingChanges`' semantics without the device copy;  `changeId` already in the wire · M
6. **The Quart page's socket comes back** -- a dropped wifi doesn't end the page ·
   `ReconnectingSocket`, `PageSession.state()` on reopen · S
7. **Rooms as async iterables** -- multiplayer state in one line, for any Solid app ·
   `LiveRoomPlace`, Solid 2's `createStore(fn)` · M
8. **A Python program as a shared room** -- many visitors in one game ·
   `StateWriter.patch()`, `Referee`'s numbered steps and heal, `spell_quart` · L
9. **Streamed server rendering of Spell sites** -- a page arrives drawn, places filling in ·
   Solid 2's `renderToStream()`, `<Loading>` already around every read · L
10. **AI text that grows on screen** -- a model's answer drawn word by word · Solid's `from()`, a new Spell line
    (PROPOSAL A, needs Owen's OK) · M
11. **A web server kind in Python** -- GitHub, weather, any API from a Python program ·
    `RestPlace`'s mapping, `open_minding_limits()` · L
12. **The compile yields between files** -- typing never waits on a compile ·
    `TaskList`, `scheduler.yield()` (`perf-code.md`) · S
13. **CSV parsed as it arrives** -- a big sheet shows its first rows at once · `parseCsv()`, `bytesUnderCeiling()` · M
14. **SSE for read-only push feeds** -- a public feed live without a socket, on an HTTP/2 host ·
    Quart's SSE, `changesSince()` · S, held back by the 6-connection limit on HTTP/1.1

## See also

- `spell-today.md` (beside this file):  §2.3 async data, §2.4 actions, §2.17 server functions and realtime, §3 ideas
- `solid-features.md`:  §1.2 async, §1.5 actions, §1.12 streaming
- `perf-code.md`:  §2, yielding the compile
- the places' rules:  `src/places/AGENTS.md`;  the server half:  `src/server/AGENTS.md`, `spell/server/places`
- the Python target:  `parser/src/py/AGENTS.md`;  the python-target guide, `guides/python-target.html`
- the catalog:  `agents/coherence/catalog.md`, "Data that lives somewhere else", "Everyone's changes, in one order",
  "A websocket that comes back"
