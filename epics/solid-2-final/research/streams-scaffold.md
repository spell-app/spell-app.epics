# Lists that keep coming:  a scaffold for streamed places

A scaffold for epic `data`, from epic `solid-2-final`, 2026-11-20 (agent `solid-2-final-streams`, read only).
Owen's ask, on `data-paradigm.md`'s finding "send long lists as a stream of pages":
"So this could e.g. adapt an existing REST list to a stream that Spell reads?
We also want to support existing services that stream updates.
Scaffold out what this would look like and we'll probably send it to another session."

- Paths are from the kit's root (the worktree `solid-2-final`), today's code.
- Guesses are marked (inferred).
- Every new Spell phrase here is a PROPOSAL:  it needs Owen's OK, and each one shows where it could be misread.
- It builds on [data-paradigm.md](data-paradigm.md) §3-4 and [spell-today.md](spell-today.md) §2.3, 2.4, 2.17, beside this file.
- It uses epic `data`'s words (`agents/coherence/words.md`, "Places"):  place, kind, list, page, `check it every`,
  heal, pending.
  - NOT "feed" for a place:  it's the org's `PersonFeed`, and words.md says "Not:  stream" for it.
  - NOT "sync", "source", "store", "backend" in what people read (words.md, "place").

## 0. The answer in one screen

- **One idea:**  any place's list can be read as ONE sequence of STEPS.
  - A step is a page of rows, or one thing added, changed or removed, or "start over", an error, or the end.
  - Underneath it's an async iterable:  `for await (const step of steps)`.
- **Both cases become it:**
  - an ordinary paged REST list is a sequence of pages that ends
  - a service that pushes updates is a sequence of changes that doesn't end
  - most real lists are both:  pages first, then changes
- **What a Spell program sees:**  nothing new.
  The same list, filling in as pages arrive, then staying current.
  Changing which service is behind the place changes one line, as it does today.
- **Most of it already exists** (§1):
  - `ListAnswer.nextPage` and the page styles in `RestPlace` (offset, page number, cursor, `Link` header, last id)
  - `Place.watch()` and `PlaceEvent`, which `PlaceHeal.follow()` already turns into rows on screen, pending changes on top
  - `changesSince()` and its token, `pollWhileVisible()`, `ReconnectingSocket`, `PlaceEvents` on the server
  - AT Protocol's Jetstream in `AtProtoPlace`:  a pushed public stream with a cursor, already a working example of the pattern
- **What's new** is small and in the middle:
  - one step type (`ListStep`), and an engine helper that makes steps from ANY place (`stepsOf()`)
  - one wire format for steps (NDJSON lines, or the same JSON in Server-Sent Events)
  - adapters for services that tell:  SSE, NDJSON, websockets, long polling, webhooks
  - our server watching a place that can't tell, once for everyone, and sending only what changed
- **Build first:**  the engine's steps;  streamed pages through `PlaceServer` and `RemotePlace`;  our server
  watching for everyone;  then services that tell (SSE / NDJSON / websocket, GraphQL subscriptions).
- **5 phases, about 16-23 hours** (§10);  five questions for Owen (§11).

## 1. What it builds on

Each piece below is built and tested today.  The scaffold adds as little beside them as it can.

| Piece | Where | What it already does for streams |
| --- | --- | --- |
| `Place`, `ListAnswer.nextPage`, `PageAsk.at` | `src/places/places.types.ts` | a list in pages, the next asked with the last answer's token |
| `PlaceCapabilities.page`, `.live` | same file:  `PageKinds`, `LiveKinds` (`"none" \| "poll" \| "notify" \| "push"`) | a place says how it pages and how it tells of changes |
| `Place.watch()`, `PlaceEvent`, `WatchTarget` | same file | a change to one thing, pushed:  `row`, or `was` when removed, `isMine`, `lost`, `overwrote` |
| `Place.changesSince()`, `ChangesAnswer` | same file | what changed since a token:  rows, removed ids, the next token |
| `RestPlace` paging | `src/places/RestPlace.ts` (`nextPageOf()`, `pageOf()`) | offset, page number, cursor in the body, `Link` header, by the last id;  the program's lines pick one (`parser/src/spell/rules/places/NextPage*.ts`) |
| `SavedRead` | `parser/src/core/saved.ts` (`readNextPage()`, `pagesAfter()`, `startPolling()`) | a program's read:  the first page, then each next page only as the drawing nears it;  polling at `check it every` |
| `drawnInWindow()` | `src/element/drawnWindow.ts` | draws 24 at a time, asks `more()` for the next page as the end nears the view |
| `PlaceReads` | `src/places/PlaceReads.ts` | readers of one list share one request;  the last one leaving aborts it |
| `PlaceHeal.follow()` | `src/places/PlaceHeal.ts` | what `watch()` hears goes on screen, pending changes on top;  a delete of what I'm editing says so |
| `PendingChanges` | `src/places/PendingChanges.ts` | my changes, shown at once, sent until they go through;  `replayOn()` keeps them on top of anything heard |
| `PlaceCache` | `src/places/PlaceCache.ts` | one row per type and id:  a change heard updates every reader |
| `DeviceCopy`, `RemotePlace.deviceCopy` | `src/places/DeviceCopy.ts`, `RemotePlace.ts` | a list kept on this device with its version;  the next read asks only what changed |
| `pollWhileVisible()` | `src/util/polling.ts` | asks again on a timer, skipped while the page is hidden, once on coming back |
| `ReconnectingSocket` | `src/util/ReconnectingSocket.ts` | a websocket that comes back:  1 s, doubling to 10 s;  its address can be a function, "where to carry on from" |
| `backoffFor()`, `retryAfter()` | `src/util/retrying.ts` | how long to wait before asking again |
| `AtProtoPlace` live | `src/places/AtProtoPlace.ts` (`STREAM_PATH`, `watch()`) | Jetstream:  one socket however many watch, picks up from its cursor, an event may come twice |
| `LiveRoomPlace` + `Referee` + `RoomCopy` | `src/places/`, `src/server/places/Referee.ts` | everyone's changes in one order:  numbered steps, a gap heals |
| `PlaceServer` | `src/server/places/PlaceServer.ts` | any place over HTTP:  `list`, `getMany`, `apply`, `call`, `changes`;  holds keys, scrubs them |
| `PlaceEvents` | `src/server/places/PlaceEvents.ts` | a server place's history of changes, for `watch()` and `changesSince()` |
| `contentVersion()` | `src/server/places/contentVersion.ts` | a version made from a thing's content:  what tells "changed" from "same" when a service has no versions |
| `RateQueue` | `src/server/places/RateQueue.ts` | keeps to a service's request limit, one queue per named limit |
| Python places | `parser/src/py/core/spell_core/places.py`, `place_kinds.py` | 6 kinds;  no pages of a list, no live updates (its own header says so) |
| `spell_quart` | `app/src/spaces/server/py/spell_quart/sessions.py` | a game per visitor over a websocket;  patches as state changes |

What does NOT exist yet:

- no HTTP response is streamed anywhere:  no SSE, no NDJSON (`data-paradigm.md` §3)
- `LiveKind`'s `"notify"` has no place using it (inferred from a grep:  only `places.types.ts` and the core's declarations name it)
- `RemotePlace` is `live: "poll"`:  a page hears a server place's changes only by asking
- a list read in pages is pulled one page at a time by `SavedRead`, a loop of its own, not shared with anything else

## 2. The model, in plain words

### What a program sees

Nothing changes for a Spell author.  The ONE line that says where data lives still decides everything.

```spell
toots is a web server at "https://mastodon.social/api/v1"
	its next page is in its "Link" header

a "status" is a thing
	it lives in toots
	its "content" is text
```

- Today:  the first page shows, the next pages come as the person scrolls, and `check it every` asks again.
- With steps:  the same, plus, where the service can tell (§4), a new status appears at once, and a removed one goes.
- Where it can't tell, our server can ask for everyone and tell each page only what changed (§4.3).

### What the engine sees

One sequence per list, made of steps.  A step is one of seven:

| Step | Means | Today's nearest thing |
| --- | --- | --- |
| `page` | some rows, and maybe where the next page is | `ListAnswer` |
| `changed` | one thing added or changed:  its whole row | `PlaceEvent` with `row` |
| `removed` | one thing gone, by id, with what it was if known | `PlaceEvent` with no `row`, its `was` |
| `reset` | "what you have may be wrong:  read it again" | a heal (`PlaceHeal`) |
| `error` | the source failed;  maybe it'll come back | a `PlaceError` |
| `still here` | nothing changed;  the connection is alive | (none) |
| `end` | no more steps:  a finished paged list | `nextPage` left out |

- "Added" and "changed" are one step:  the engine already keeps one row per id, so it doesn't matter which.
  A service that says them apart says `isNew` (inferred:  no reader needs it today).
- Every step can carry `at`:  where the source stood, to carry on from after a break.
  It's the same idea as `ChangesAnswer.token`, Jetstream's cursor, an SSE event's id, a Postgres position.

### Pulled pages, pushed changes

The two halves move differently, and the design keeps them apart under the one sequence.

- **Pages are PULLED.**  The next page is asked only when the drawing nears it (`drawnInWindow()`'s `more()`).
  - That IS the backpressure:  an async iterator asks for its next value only when someone calls `next()`.
  - A phone that scrolls nowhere reads one page.
- **Changes are PUSHED.**  A service tells when it likes.
  - They're applied as they come, through `PlaceHeal`'s path, never waiting for a scroll.
  - Waiting ones are kept by id, the newest winning, so a flood of changes to 10 things is 10 changes held,
    never a growing queue.  Too many different things waiting:  drop them all and `reset` (§5).
- So `stepsOf()` (§3) yields pages when asked, and hands changes on as they come.

## 3. The engine:  steps from any place

### The step type

```ts
// src/places/places.types.ts, beside ListAnswer and PlaceEvent

/** One step of a list that keeps coming:  a page, a change, or what the source says of itself. */
export type ListStep =
  | { kind: "page"; answer: ListAnswer; at?: string }
  | { kind: "changed"; collection: string; id: string; row: PlaceRow; isMine?: boolean; at?: string }
  | { kind: "removed"; collection: string; id: string; was?: PlaceRow; isMine?: boolean; at?: string }
  | { kind: "reset"; why: ResetReason; at?: string }
  | { kind: "error"; error: PlaceErrorCause & { message: string }; willRetry: boolean }
  | { kind: "still here"; at?: string }
  | { kind: "end" }

/** Why a source says start over. */
export type ResetReason = "too far behind" | "too many changes" | "source restarted" | "can't carry on"
```

- `changed` and `removed` are `PlaceEvent`s with a `kind`:  `stepFor(event)` and `eventFor(step)` turn one into
  the other, so `watch()` and every place that has it today need no change.

### An optional method on `Place`

```ts
export type Place = {
  // ...today's methods, unchanged...

  /**
   * The list as steps:  its pages as they're asked for, then each change as it's told, until `return()`.
   * - Left out:  the engine makes them from `list()`, `watch()` and `changesSince()` (`stepsOf()`).
   * - `since`:  carry on from a step's `at`, instead of the first page.
   * - Returning (a `for await` that breaks, or `return()`) stops it:  its requests abort.
   */
  steps?(collection: string, query: ListQuery, context: StepsContext): AsyncIterable<ListStep>
}

export type StepsContext = PlaceContext & {
  /** Carry on from here:  an earlier step's `at`. */
  since?: string
  /** Pages only, then `end`:  a read that doesn't stay current (no `check it every`, a node run). */
  pagesOnly?: boolean
}
```

### `stepsOf()`:  every place gets steps, whatever it can do

The engine's ONE way of reading a list that keeps coming.  A place that has `steps()` is used as it is;
any other is wrapped, from what it says it can do.

```ts
// src/places/ListSteps.ts (new)

/**
 * A place's list as steps, whatever the place can do.
 * - `place.steps()`, if it has one.
 * - Else pages from `list()`, following `nextPage`, one each time the reader asks.
 * - Then changes:  from `watch()` (`live: "push"`), else `changesSince()` on `pollWhileVisible()`
 *   (`live: "poll"` and a `check it every`), else none:  `end` after the last page.
 * - NEVER reads ahead of the reader:  the next page is asked when `next()` is.
 */
export function stepsOf(place: Place, collection: string, query: ListQuery, context: StepsContext): AsyncIterable<ListStep>

/** Pages only, as `list()` gives them:  the paged REST list, read as steps. */
async function* pagesOf(place: Place, collection: string, query: ListQuery, context: PlaceContext): AsyncGenerator<ListStep> {
  let at = query.page?.at
  do {
    const answer = await place.list(collection, { ...query, page: { ...query.page, at } }, context)
    yield { kind: "page", answer, at: answer.version }
    at = answer.nextPage
  } while (at !== undefined && !context.signal?.aborted)
  yield { kind: "end" }
}
```

- `pagesOf()` is the REST adapter Owen asked about:  `RestPlace` already speaks every page style, so ANY paged REST
  list becomes steps with no new code per service.
- Changes after the pages:  a small `ChangesWaiting` holds pushed ones by id until the reader takes them
  (pushed changes don't wait for a scroll in practice:  §3, "Who reads the steps").
- Polling stays `pollWhileVisible()`;  `SavedRead.startPolling()` moves into `stepsOf()` (inferred:  one poller
  for every reader of a list, which `PlaceReads` would share).

### Who reads the steps

- **`SavedRead`** (`parser/src/core/saved.ts`) drops its own page loop (`pagesAfter()`, `readTheRest()`) for an
  iterator from `stepsOf()`:
  - `readNextPage()` is `iterator.next()` until a `page` comes
  - `answer()` (an action needing every row) reads until `end`
  - `leave()` is `iterator.return()`
- **`PlaceHeal.follow()`** takes `changed` / `removed` steps exactly as it takes `PlaceEvent`s today:
  `replayOn()` puts pending changes on top, `tellRows()` tells every reader, notices for lost text and deletes.
- **`reset`** runs `PlaceHeal`'s one heal:  fetch the latest, replay.
- **`PlaceReads`** shares ONE iterator among readers of the same list and query (a tee:  each reader its own
  position in the pages, one request per page) (inferred:  the shape `LoadOnce` gives one promise today).

## 4. Adapters

Each adapter is a `Place` (or a helper a place uses) whose `steps()` or `watch()` speaks one kind of source.
None is a new engine:  they end in `ListStep`s, and the engine does the rest.

### 4.1 A paged REST list, read as a stream of pages

Built already, except the iterator around it (§3, `pagesOf()`).

| Page style | Spell's line today | Where |
| --- | --- | --- |
| a page number | `its next page is asked for with "page"` | `NextPageByNumber.ts`, `RestPlace` `firstPageNumber` |
| an offset and a size | `its next page is asked for with "limit" and "offset"` | `NextPageByOffset.ts` |
| a cursor in the answer | `its next page is its "next"` | `NextPageIn.ts`, `nextAt` |
| a `Link` header | `its next page is in its "Link" header` | `NextPageInLink.ts`, `NEXT_LINK` |
| after the last id | `NextPageByLastId.ts` | `pagesByLastId` |

- The next page is asked only when the drawing nears it:  `drawnInWindow()` calls `more().readNextPage()`, which is
  `iterator.next()`.
- An action that needs every row (`the number of recipes`) reads to `end`, as `readTheRest()` does now.
- Sorted in the browser (the place can't sort):  every page first, as today (`readsPagesWhenDrawn` is false).

### 4.2 Services that tell:  the transports

Five transports.  Each is a small reader that turns bytes into `ListStep`s, given a MAPPING (§4.4) for
services whose messages aren't already steps.

```ts
// src/places/stepReaders.ts (new):  one function per transport, each an async generator

/** What every reader is handed. */
type StepReaderAsk = {
  /** Where:  an address, or a function asked on each try with where to carry on from. */
  address: string | ((since?: string) => string)
  /** A message as the service says it, made into steps:  the service's own mapping, or "already steps". */
  mapping: StepMapping
  /** Stops it. */
  signal: AbortSignal
  /** Where to carry on from:  `Last-Event-ID`, a cursor parameter ... */
  since?: string
  /** Headers, never a key written here:  a key goes through the page server (`throughPageServer`). */
  headers?: Record<string, string>
}

export async function* serverSentSteps(ask: StepReaderAsk): AsyncGenerator<ListStep>
export async function* lineSteps(ask: StepReaderAsk): AsyncGenerator<ListStep>   // NDJSON, or any chunked body of JSON lines
export async function* socketSteps(ask: StepReaderAsk): AsyncGenerator<ListStep> // on ReconnectingSocket
export async function* longPollSteps(ask: StepReaderAsk & { waitSeconds: number }): AsyncGenerator<ListStep>
```

- **Server-Sent Events** (`text/event-stream`):
  - read with `fetch()` and the body's stream, NOT `EventSource`:  `fetch` can send headers and a `POST`, and
    aborts with a signal.  The reader parses `event:`, `data:`, `id:` lines itself (about 40 lines, inferred).
  - `id:` is the step's `at`;  carrying on sends it as `Last-Event-ID`.
  - The cost:  on HTTP/1.1 each open one holds one of Chrome's 6 connections per host for good
    (`src/server/LiveReload.ts`'s note).  So a page opens at most ONE to each host (§4.3, "one connection a page").
- **NDJSON / chunked HTTP** (`application/x-ndjson`, `application/jsonl`):
  - `response.body.pipeThrough(new TextDecoderStream())`, split at line ends, `JSON.parse` each.
  - The format our own server speaks (§6), and what many AI and log services send (inferred).
- **Websockets:**
  - on `ReconnectingSocket`, its address a function so it reconnects from `since`, as Jetstream's does.
  - Two-way:  the subscribe message a service wants (GraphQL's `subscribe`, Supabase's `phx_join`) is the mapping's `hello`.
- **Long polling:**
  - `changesSince()` held open by the server until something changes or `waitSeconds` passes, then asked again.
  - For a service that offers it (CouchDB's `_changes?feed=longpoll`, inferred), and the fallback through proxies
    that drop sockets and streams.
- **Webhooks** (a service POSTs to US):
  - Only our server can be called, so a webhook is a `PlaceServer` route:  `POST /api/places/<name>/told`.
  - It checks the service's signature with a secret named in the program's lines (never written:  `PlaceKeys`).
  - Each call becomes a `PlaceEvents.tell()`, and every page watching hears it (§4.3).

Reconnecting, the same for all five (§5):  a sixth helper beside them, NOT a third copy of the backoff.

```ts
// beside ReconnectingSocket, or ReconnectingSocket grown to take any opener (inferred:  the coherence call)

/** A sequence of steps that comes back:  opens, and when it breaks, carries on from the last `at`. */
export async function* reconnecting(
  open: (since: string | undefined) => AsyncIterable<ListStep>,
  { signal, since }: { signal: AbortSignal; since?: string }
): AsyncGenerator<ListStep>
```

### 4.3 Our server, watching a place that can't tell

Most services can't tell (any REST list, a CSV at an address, Airtable, a Google sheet).
Our server can watch for them:  ask ONCE for every page that's looking, and send each page only what changed.

```ts
// src/server/places/WatchedPlace.ts (new):  a place that can't tell, made one that does

/**
 * Asks `behind` again every `checkedEvery` seconds while anyone watches, and tells what changed.
 * - Changed is a row whose `contentVersion()` differs, or a row new or gone, by id.
 * - Its history is a `PlaceEvents`:  so `changesSince()` and `watch()` come free, and a page carrying on gets
 *   only what it missed.
 * - Only while watched:  the last watcher leaving stops the asking (`PlaceEvents.onFirstWatcher`).
 * - Keeps to the service's limit:  `RateQueue`.
 * - Keys stay here:  pages never see them (`PlaceKeys`).
 */
export class WatchedPlace implements Place {
  constructor(props: { behind: Place; checkedEvery: number; collections: string[] })
  describe(): PlaceCapabilities // as `behind`'s, with `live: "push"`
  list(...): Promise<ListAnswer>
  watch(target: WatchTarget, onEvent: (event: PlaceEvent) => void): () => void
  changesSince(collection: string, token: string, context: PlaceContext): Promise<ChangesAnswer>
  // apply(), call() ... go straight to `behind`, then tell at once
}
```

- What it gives:
  - 100 people looking at one list is ONE request a minute to the service, not 100
  - the service's key never leaves the server
  - a page hears a change within its `check it every`, without asking
- Only lists of things with ids:  a list with no `idOf` can only be read again whole (`reset`).
- A big list:  only the first pages anyone has read are compared (inferred:  a 50,000-row list compared whole every
  minute is the cost to watch for).
- **One connection a page:**  a page watching 5 lists on our server opens ONE stream, not 5.
  - A websocket on `ReconnectingSocket`, its messages `{ watch, stop }` up and `ListStep`s down, each with its list's id.
  - Not SSE:  one socket is two-way, and the 6-connection limit makes one each untenable (inferred:  the page server
    is HTTP/1.1, as `LiveReload`'s note implies).
  - The same socket rooms use could carry it (inferred:  `Referee`'s socket handler would learn `watch`).

### 4.4 Real services:  a mapping each

A service's messages become steps through a MAPPING, the way `RestPlace` reads a server through its program's lines.
The mapping is code, in a library place kind (epic `data` J68:  "a supabase project is a place, with its own
`makePlace()`"), not words in every program.

```ts
/** How one service's messages become steps. */
export type StepMapping = {
  /** What to send on opening, for a two-way service:  a subscribe. */
  hello?(ask: { collection: string; since?: string }): unknown
  /** One message, as steps:  none, for one the list doesn't care about. */
  stepsFor(message: unknown, event?: string): ListStep[]
  /** Where a message says it stands, to carry on from. */
  atOf?(message: unknown): string | undefined
}

/** For a service that already speaks steps:  our own server, a Quart app. */
export const STEPS_AS_THEY_ARE: StepMapping
/** For a service whose every message is a row:  each one `changed`, by its id;  nothing is ever removed. */
export const EACH_MESSAGE_A_ROW: StepMapping
```

The candidates, each with how it tells, what it maps from, and what it costs:

| Service | Transport | Its messages | Carries on with | Cost |
| --- | --- | --- | --- | --- |
| Bluesky's Jetstream | websocket | `commit` create / update / delete | `cursor`, microseconds | built:  `AtProtoPlace`, the model for the rest |
| GraphQL subscriptions (Hasura, Apollo, PostGraphile ...) | websocket, the `graphql-transport-ws` protocol | `next` with a result | the service's own (often none:  `reset`) | small:  `GraphPlace` has the mapping;  the protocol is a few messages, no dependency (inferred) |
| Wikimedia's recent changes | SSE, public, no key | one JSON per edit | `Last-Event-ID` | tiny:  `EACH_MESSAGE_A_ROW`;  the best manual check (§7) |
| Mastodon's streaming API | SSE or websocket | `update` (a status), `delete` (an id), `status.update` | none:  read the timeline again | small;  public timelines may need a token now (inferred) |
| Supabase Realtime | websocket, Phoenix channels | Postgres `INSERT` / `UPDATE` / `DELETE`, with `old` and `new` | none:  `reset`, then read | medium:  the protocol by hand, or `@supabase/supabase-js` (a dependency:  ask Owen) |
| Firebase / Firestore listeners | the SDK's `onSnapshot` (its wire is gRPC-ish, inferred) | `docChanges()`:  added / modified / removed, 1:1 with steps | a resume token, inside the SDK | medium:  needs the `firebase` package, big (a dependency:  ask Owen) |
| Postgres `LISTEN` / `NOTIFY`, or logical replication | through OUR server only (a database is never reached from a page) | a `NOTIFY` payload;  replication's row changes | replication's log position (LSN) | medium-large:  the `pg` package on the server (ask Owen);  replication needs a server setting |
| PocketBase, CouchDB (inferred) | SSE;  `_changes` long poll or continuous | record actions;  `seq` | `since=<seq>` | small each |
| AI token streams (Anthropic, OpenAI) | SSE, through our server for the key | a text delta | none | NOT a list:  one growing value (§5.4);  its own phase, if wanted |

**The first four to build, and why:**

1. **Our own server's steps** (`STEPS_AS_THEY_ARE`, §6):  every data folder, sheet and Quart app at once;
   no outside service to break.
2. **Our server watching for everyone** (§4.3):  turns EVERY existing kind (REST, sheets, Airtable, Google sheets)
   into one that tells, with no help from the service.
   - This is the biggest win for the least code:  it's most of what people will see.
3. **SSE and NDJSON from any web server** (`serverSentSteps()`, `lineSteps()`), with `EACH_MESSAGE_A_ROW`:
   the plain way a service streams today;  Wikimedia proves it with no key.
4. **GraphQL subscriptions** on `GraphPlace`:  a place kind Spell already has, an open protocol, no dependency.

Later, each as a library place kind once Owen OKs its dependency:  Supabase, Firestore, Postgres through our server.

### 4.5 Python and Quart:  the same steps from an async generator

Two halves:  a Quart app SERVING steps, and the Python core READING pages.

**Serving** (`app/src/spaces/server/py/spell_quart/places.py`, new;  the `PlaceServer` twin `data-paradigm.md` §2 sketches):

```python
@app.post("/api/places/<name>/steps")
async def steps(name: str):
    ask = await request.get_json()

    async def lines():
        async for step in places[name].steps(ask["collection"], ask.get("query", {}), since=ask.get("since")):
            yield json.dumps(step) + "\n"

    response = await make_response(lines(), {"Content-Type": "application/x-ndjson"})
    response.timeout = None  # a list that keeps coming has no end time
    return response
```

- Quart streams an async generator as it yields
  ([Quart's streaming guide](https://quart.palletsprojects.com/en/latest/how_to_guides/streaming_response.html)).
- A visitor leaving cancels the generator:  its `finally` stops what it was asking (inferred from asyncio's cancel).
- So a browser program's `family cookbook is a data folder at "https://my-quart-app/api/places/recipes"` reads a
  Quart app with the whole browser engine, and hears its changes.

**Reading** (`parser/src/py/core/spell_core/place_kinds.py`):

```python
class PlaceBehind:
    async def pages(self, collection: str, query: Row | None = None) -> AsyncIterator[list[Row]]:
        """Each page of a list, the next asked only when the loop wants it."""
        answer = await self.list(collection, query or {})
        yield answer["rows"]
        while (at := answer.get("nextPage")) is not None:
            answer = await self.list(collection, {**(query or {}), "page": {"at": at}})
            yield answer["rows"]
```

- `ServerPlace.rows_now()` asks every row today:  `pages()` is its fix (`data-paradigm.md` §2, "Pages of a list", S).
- A Spell `repeat with each` over a place compiles to `async for page in ...` (inferred).
- Standard library only (epic `data` Q33):  each request goes off the loop with `asyncio.to_thread()`, as reads do.
- Changes in Python (`watch`) wait for Python's pending changes (`data-paradigm.md` §2's gaps):  not in this scaffold.

## 5. Lifecycle

### 5.1 The order things happen in

1. **Start.**  The first thing to draw a list holds its read (`SavedRead.hold()`).
   `stepsOf()` asks the first page, and nothing else yet.
2. **Pages.**  Each time the drawing nears the end, one more page (`iterator.next()`).
3. **Changes.**  With the first page in, the engine starts hearing changes:  `watch()`, the place's `steps()`,
   or polling.  Each is applied as it comes.
4. **Hidden.**  The page goes to the background:
   - polling stops at once (`pollWhileVisible()`, as today)
   - a pushed stream stays open a while, then closes, remembering its last `at` (open question 5)
5. **Back.**  Visible again:  it carries on from `at` (`since`).
   - The source can carry on:  only what was missed comes.
   - It can't, or it's too far behind:  `reset`, and the one heal reads again, pending changes on top.
6. **Broken.**  The connection drops:  `reconnecting()` tries again, 1 s doubling to 10 s, from `at`
   (`backoffFor()`;  a `retry-after` wins).
   - While it's down, the list stays as it was, and `PlaceResult.status` says `"couldn't update"` (today's words).
7. **Stop.**  The last reader leaves (`SavedRead.leave()`):  `iterator.return()`.
   - A generator's `finally` aborts its request or closes its socket:  nothing runs on.
   - `PlaceReads` keeps the rows a while, as it does now, so coming back shows them at once.

### 5.2 Backpressure

- Pages:  pulled, so the service is asked only as fast as people scroll.
- Changes:  held by id, newest wins (`ChangesWaiting`).
  - More than `MOST_CHANGES_WAITING` different things (say 1,000, inferred) before they're applied:  drop them,
    `reset`.  Reading again is cheaper than a queue that never drains.
  - Applied in one go per frame (`Queued`, `beforeNextPaint`), so 500 changes in a second is one redraw, not 500
    (inferred:  `PlaceHeal.heardEvent()` tells rows one change at a time today).

### 5.3 Memory on a phone

Today what's drawn stays drawn (`drawnWindow.ts`'s NOTE:  "a list scrolled through to the end of 50,000 is 50,000
elements after all", epic `data` T43's limit).  A list that keeps coming makes that worse:  it only grows.

- **Keep a window of rows.**  A read keeps at most `MOST_ROWS_KEPT` rows (say 2,000, inferred), as pages.
  - Each page remembers the token it was read with, so a page dropped far off screen is read again on scrolling back.
  - Its things leave `PlaceCache` when no read holds them (inferred:  the cache keeps rows by type and id;  how it
    lets go isn't in this scaffold).
- **Drawing.**  `drawnInWindow()` would take down elements far off screen, which breaks "what's drawn stays drawn":
  focus, a half-filled form and keys far away would go.  Owen's call (open question 3).
- **Changes to rows not kept** are dropped:  that row isn't on screen, and reading its page again gets it fresh.
- **Polling a long list** asks only the pages kept, never the whole (inferred:  `changesSince()` where the place has it).

### 5.4 A growing value is not a list

An AI answer word by word, a log, a progress line:  one value that grows, not rows by id.

- Its steps would be `{ kind: "more text", text }`, applied to one field (inferred).
- In Solid it's `createMemo(() => from(stream))`, each chunk added on (`solid-features.md`, `from()`).
- Kept OUT of this scaffold:  `data-paradigm.md` §3 PROPOSAL A has its words, and it needs Owen's OK.

## 6. The wire:  steps over HTTP

ONE format, so our server, a Quart app and any service that wants to can speak it.

### The lines

NDJSON:  one JSON object a line, `application/x-ndjson`.  The same JSON can go as SSE `data:` lines, with `id:` set
to its `at`.

```text
{"step":"page","rows":[{"id":"r-1","title":"Soup"}],"nextPage":"2","version":"v41","at":"v41"}
{"step":"page","rows":[{"id":"r-2","title":"Stew"}],"version":"v41","at":"v41"}
{"step":"changed","collection":"recipes","id":"r-2","row":{"id":"r-2","title":"Stew, hot"},"version":"v42","at":"v42","changeId":"c-77"}
{"step":"removed","collection":"recipes","id":"r-1","at":"v43"}
{"step":"still here","at":"v43"}
{"step":"reset","why":"too far behind"}
{"step":"error","kind":"no answer","message":"The sheet's server didn't answer","willRetry":true}
{"step":"end"}
```

- **Ids:**  every change names its thing by id, as text (`idOfRow()`:  everything above a place speaks text).
- **Versions:**
  - `version` on a change:  the THING's version, for `PendingChanges`' "made from" and its out-of-date merge.
  - `at` on any step:  where the SOURCE stood, to carry on from.  Opaque:  only handed back.
- **`changeId`:**  the id of the change that made it, when the source knows (`PlaceServer` remembers 1,000 a place).
  It's how a page knows a change is its own coming back (`isMine`).
- **Errors:**  a `PlaceError`'s cause, scrubbed of keys as every `PlaceServer` answer is (`PlaceKeys.scrubbed()`).
- **`still here`:**  every 25 seconds or so with nothing else, so proxies don't drop a quiet stream (inferred).

### The routes

On `PlaceServer`, beside `list`, `getMany`, `apply`, `call`, `changes`:

| Route | Body | Answers |
| --- | --- | --- |
| `POST /api/places/<name>/list` with `"stream": true` | as `list`'s | NDJSON:  `page` steps as the place gives them, then `end` |
| `POST /api/places/<name>/steps` | `{ collection, query, since? }` | NDJSON:  pages, then changes, until the page hangs up |
| the page's one socket (§4.3) | `{ watch: id, place, collection, query, since? }`, `{ stop: id }` | steps, each with its `watch` id |
| `POST /api/places/<name>/told` | the service's own | 204;  a webhook's call, signature checked |

### How a step meets what's already there

- **The cache:**  `changed` puts the row in `PlaceCache` by type and id:  every reader of that thing sees it.
- **Pending changes:**  every heard row goes through `replayOn()` first, so MY unsent change still wins on my screen.
  - Heard my own change coming back (`isMine`, by `changeId`):  it settles it, nothing flickers.
  - Heard someone else's change to a field I'm changing:  mine stays on top until it's sent;
    if the place then refuses it as out of date, today's three-way merge runs (`Places.onConflict()`).
  - Heard a delete of what I'm editing:  today's notice with Restore (`Places.onThingDeleted()`).
- **The device copy:**  a list kept on this device (`- keep a copy on this device`) keeps its last `at` with it.
  Opening again carries on from there, as `RemotePlace` does with `changesSince()` today.
- **Healing:**  `reset`, a gap, or a failed carry-on all go to `PlaceHeal`'s ONE heal:  read again, replay.
- **Everyone's changes, in one order:**
  - A room (`Referee`) IS the one order:  its numbered steps are this format's `at`, and a gap heals.
  - An outside service's order is its own:  Spell promises no more than the service does.
  - Our server watching (§4.3) puts what IT saw in one order (`PlaceEvents`'s history), so every page hears the
    same changes in the same order, from it.
  - Two pages writing the same field through a service with no versions:  last write wins, as today.

## 7. Solid 2:  how steps reach the drawing

### What Spell does

Spell's drawing doesn't hand an async iterable to Solid for a list, and shouldn't (inferred, from today's code):

- A `SavedRead`'s list is ONE scratch list for its whole life (`saved.ts`:  "so what draws it keeps what it drew").
  Steps change that list in place, and its `Cell` tells whoever draws it.
- An async-iterable memo gives a NEW value each time it yields (inferred from `solid-features.md`'s table:  "reads as
  pending until it lands").  For a list that grows a page at a time that's a whole new list per page, and epic
  `language` P8 found an async memo "froze a deal".
- So the engine iterates;  Solid sees a list that grows, and its usual pieces do the rest:

| Solid 2 piece | What it does here |
| --- | --- |
| `<For>` keyed by the thing | ONE Thing per id (`PlaceCache`), so a changed row redraws in place, and a moved row MOVES its element:  focus and a form's text go with it |
| `<Loading>` | the first page only:  "while loading" riders, as today;  later pages never blank what's shown |
| `<Loading>` per row | a row whose fields come later (a `ChunkedPlace` body, a link followed):  the "…" each waiting value already shows |
| `isPending()` | "more coming" or "updating" on a list's title, without hiding its rows (`spell-today.md` §2.3:  0 uses today) |
| `createDeferred()` | what `drawRead()` uses now:  what it showed stays until the new answer lands |

### What any Solid app could do (not Spell's drawing)

For a Solid app outside Spell, steps fit Solid 2's async stores directly (`solid-features.md`:  `createStore(fn)`
and `createProjection(fn, seed, { key })` take an async iterable):

```ts
// a sketch:  a Solid app's list, kept current from any place
const recipes = createProjection(
  async function* (draft) {
    for await (const step of stepsOf(place, "recipes", {}, { signal })) {
      if (step.kind === "page") draft.push(...step.answer.rows)
      else if (step.kind === "changed") upsert(draft, step.row)
      else if (step.kind === "removed") removeById(draft, step.id)
      yield draft
    }
  },
  [],
  { key: "id" }
)
```

- `spell-today.md` §2.17's idea, "rooms as Solid async iterables", is this, for every place.
- Not needed for Spell itself;  worth it if places are offered to Solid apps (`spell-today.md` §2.3, `usePlace()`).

## 8. How a Spell author sets one up

### Today's words already cover most of it

| What | Words today | With steps |
| --- | --- | --- |
| a list in pages | `its next page is in its "Link" header`, `... is asked for with "page"`, `it gives up to 100 at a time` | the same:  read as steps, one page as the drawing nears it |
| staying current by asking | `check it every 30 seconds` | the same;  through our server, asked once for everyone (open question 4) |
| a room | `family cookbook is a room at "..."` | the same:  its steps are the referee's |
| an atmosphere account | `... is an atmosphere account` | the same:  Jetstream |
| kept on this device | `- keep a copy on this device` | it also carries on from where it stopped |
| a service's own kind | (none yet) | a library place kind, `a supabase project`, with its own mapping (epic `data` J68) |

Recommended:  NO new words for pages, polling through our server, or a service's own kind.
What's left is a web server that tells, at an address of its own.

### PROPOSAL A:  where a web server tells of changes

```spell
wiki is a web server at "https://en.wikipedia.org/w/api.php"
	its changes come from "https://stream.wikimedia.org/v2/stream/recentchange"
```

- Plain English:  "its changes come from" that address.
- How it's heard (SSE, NDJSON, a websocket) is read from the answer itself:
  its content type, or a `ws:` / `wss:` address.  No words for it.
- Each message is a row, by its id (`EACH_MESSAGE_A_ROW`);  a service whose messages need more is a library kind.
- Where it could be misread:
  1. "its changes" could read as the program's OWN changes, sent there:  it's the opposite, changes heard from it.
  2. `from` means the same as `at` on a place's line (words.md:  "`at` and `from` mean the same"), so it's
     consistent, but a reader may expect `from` to mean read only.
  3. A change is a whole row:  a stream that sends only what changed in a row would overwrite the rest (inferred).
- Alternatives:
  - `it tells us what changed at "..."`:  plainer about direction;  "tells" is close to events' `send` (epic
    `data` Q14 kept `send` for events), and to `Places.tellRows()` in code.
  - `it is followed at "..."`:  shorter;  "followed" is `core.follow()`'s word for reading a link.

### PROPOSAL B:  none for "watched for everyone"

- `check it every 30 seconds` on a place read through our server (every authenticated place is,
  `throughPageServer`) is asked once by the server, for every page, and told:  no words.
- Where it could surprise:  a person expecting each page to ask the service itself (a service that counts requests
  per person).  A line to turn it off would be an Open question, not a phrase now.

### Not proposed

- A rider for "the rest are coming" (`data-paradigm.md` §3 PROPOSAL C):  `<for>`'s `paging` already says it.
- Words for a stream's format, its reconnect timing, or its buffer:  the engine's, never the program's.

## 9. Tests

### A fake streaming server

`src/server/test/streamingServers.ts` (new), beside [recipeServers.ts](../../../../../spell.worktrees/solid-2-final/src/server/test/recipeServers.ts)
and `fakeAtmosphere.ts`, so every test reaches a real server in node:

```ts
/** A server that tells, in each of the ways a service does, driven by the test. */
export type StreamingServer = {
  /** Its address. */
  address: string
  /** Each way it tells:  `/sse`, `/ndjson`, `/ws`, `/long-poll`, `/hook`. */
  paths: Record<"serverSent" | "lines" | "socket" | "longPoll" | "webhook", string>
  /** The rows its list holds, paged by every style RestPlace reads. */
  rows: PlaceRow[]
  /** Tell everyone listening:  a row changed or went. */
  tell(step: ListStep): void
  /** Drop every connection, as a phone going into a tunnel. */
  dropConnections(): void
  /** Forget what came before `at`:  carrying on from earlier is a `reset`. */
  forgetBefore(at: string): void
  /** Answer the next N connections with this status. */
  failNext(count: number, status: number): void
  /** Send a body slowly, a line every N ms:  for backpressure. */
  slowBody(msPerLine: number): void
  /** Every request it had, for "asked once for everyone". */
  requests: { path: string; at: number }[]
  stop(): Promise<void>
}
```

### What proves each piece

| Piece | The test | Where |
| --- | --- | --- |
| `stepsOf()` pages | a 10-page list:  the second page is asked only on the second `next()`;  `return()` aborts the third | `tests/places/ListSteps.test.ts`, on `MemoryPlace` |
| `stepsOf()` changes | `watch()` events become steps;  a `changesSince()` place polls;  1,000 changes to 3 things hold 3 | same |
| `pagesOf()` on REST | each page style (number, offset, cursor, `Link`, last id) as steps, against the recipe servers | `tests/places/RestPlace.test.ts` (node) |
| SSE and NDJSON readers | the fake's `/sse` and `/ndjson`:  rows arrive;  a dropped connection carries on with `Last-Event-ID`;  a forgotten `at` gives `reset` | `tests/places/stepReaders.test.ts` (node) |
| websocket reader | `/ws` on `ReconnectingSocket`:  hello sent, steps heard, reconnect from `since` | same |
| `WatchedPlace` | 5 watchers, one request per check;  only changed rows are told;  none asked after the last leaves | `tests/server/places/WatchedPlace.test.ts` |
| `PlaceServer` streams | `list` with `stream: true` sends pages as lines;  `steps` sends changes;  a key never appears | `tests/server/places/PlaceServer.test.ts` |
| `RemotePlace` hears | changes over the page's one socket land in the cache, pending on top, `isMine` by `changeId` | `tests/places/RemotePlace.test.ts` |
| pending vs heard | `TroubledPlace` (`tests/places/fakePlaces.ts`) plus a told change to a field I'm changing:  mine stays, then merges | `tests/places/PlaceHeal.test.ts` |
| drawing | a program's list of 1,000 over the fake:  24 drawn, one page read;  a told change redraws one row;  a removed row goes | `parser/tests/core/` (browser) |
| Python | the Quart route yields NDJSON lines in Quart's test client;  `pages()` asks lazily | `app/src/spaces/server/py` tests, `parser/src/py` tests |

### A manual check

A runbook (`spell runbook start streams`), its steps (inferred):

1. Open a program reading Wikimedia's recent changes with PROPOSAL A's line (or its TypeScript twin, if the words
   aren't OK'd):  `Should:`  edits appear within a second, newest first, nothing else asked.
2. Turn the wifi off for 20 seconds, then on.  `Should:`  the list says it couldn't update, then carries on, no
   duplicates.
3. Open the recipe box on a web server in two windows with `check it every 10 seconds`, through the page server.
   Change a recipe on the server's own file.  `Should:`  both windows show it within 10 seconds;  the server's log
   shows ONE request per check.
4. On a phone (or Chrome's phone view), scroll a 50,000-row sheet to the bottom and back.  `Should:`  memory stays under
   the window's limit (open question 3).

## 10. Suggested phases, for epic `data`

Written as a request epic `data` can take as it stands.  Estimates in its own style;  paths from the kit's root.

### P1 · A List's Steps  (3-4h)

- **Symptom:**  every reader pages a list its own way (`SavedRead`'s loop), and a pushed change, a poll and a page
  are three different paths.
- **Changes:**
  - `ListStep`, `StepsContext`, an optional `Place.steps()`;  `stepFor()` / `eventFor()`
  - `stepsOf()` and `pagesOf()`:  steps from any place, pages pulled, changes held by id
  - `SavedRead` reads through it:  `readNextPage()`, `answer()`, `leave()`;  its polling moves in
  - `PlaceHeal.follow()` takes steps;  `reset` heals
- **Files:**  `src/places/places.types.ts`, `src/places/ListSteps.ts` (new), `src/places/PlaceHeal.ts`,
  `src/places/PlaceReads.ts`, `parser/src/core/saved.ts`;  tests in `tests/places/`
- **Done when:**  every place's tests pass unchanged, and a list reads its pages through steps.

### P2 · Streamed Pages Over The Wire  (3-5h)

- **Symptom:**  a 10,000-row sheet behind our server shows nothing until every row has crossed.
- **Changes:**
  - the NDJSON format (§6);  `PlaceServer`'s `list` with `stream: true`, and `steps`
  - `RemotePlace` reads lines as they come:  each page lands in the cache as it arrives
  - `lineSteps()`, the NDJSON reader, shared with P4
  - Python:  `PlaceBehind.pages()`;  `ServerPlace` pages;  the Quart `steps` route as an async generator
- **Files:**  `src/server/places/PlaceServer.ts`, `src/places/RemotePlace.ts`, `src/places/stepReaders.ts` (new),
  `parser/src/py/core/spell_core/place_kinds.py`, `places.py`, `app/src/spaces/server/py/spell_quart/places.py` (new)
- **Done when:**  the first rows of a big sheet show in one round trip;  a Quart app streams the same lines.

### P3 · Watched For Everyone  (3-4h)

- **Symptom:**  `check it every` on a web server is one request per page per check, each page asking the service
  itself, and a page hears our server's places only by asking.
- **Changes:**
  - `WatchedPlace`:  asks once while watched, tells only what changed (`contentVersion()`, `PlaceEvents`), keeps to
    `RateQueue`
  - the page's ONE socket to our server:  `{ watch, stop }` up, steps down;  `RemotePlace` becomes `live: "push"`
  - webhooks:  `POST .../told`, a signature checked with a named secret
- **Files:**  `src/server/places/WatchedPlace.ts` (new), `PlaceServer.ts`, `PlaceEvents.ts`, `AuthenticatedPlaces.ts`,
  `src/places/RemotePlace.ts`, the socket's handler (inferred:  beside `Referee`'s)
- **Done when:**  5 windows on one list are one request a check, and each hears a change without asking.

### P4 · Services That Tell  (4-6h)

- **Symptom:**  a service that streams its changes (Wikimedia, Mastodon, a GraphQL server) is read by asking again.
- **Changes:**
  - `serverSentSteps()`, `socketSteps()`, `longPollSteps()`;  `reconnecting()` on ONE backoff with `ReconnectingSocket`
  - `StepMapping`, `STEPS_AS_THEY_ARE`, `EACH_MESSAGE_A_ROW`
  - a web server's changes address (PROPOSAL A's words, once Owen OKs them;  else a mapping in TypeScript only)
  - GraphQL subscriptions on `GraphPlace` (`graphql-transport-ws`)
  - an example in `@spell/examples/PublicServers`:  Wikimedia's recent changes
  - the fake streaming server (§9)
- **Files:**  `src/places/stepReaders.ts`, `src/util/ReconnectingSocket.ts`, `src/places/GraphPlace.ts`,
  `parser/src/spell/rules/places/` (one rule, if OK'd), `src/server/test/streamingServers.ts` (new),
  `agents/coherence/catalog.md` (a new entry, "A list that keeps coming")
- **Done when:**  the Wikimedia example shows edits live, and carries on after the wifi drops.

### P5 · Long Lists On A Phone  (3-4h)

- **Symptom:**  a list that keeps coming only grows:  every row and every element drawn stays, for good.
- **Changes:**
  - a read keeps at most `MOST_ROWS_KEPT` rows, by page;  a page far off screen dropped, read again by its token
  - changes held per frame, applied in one go;  a stream closes a while after the page is hidden, and carries on
  - `drawnInWindow()` takes down far-off elements, if Owen says so (open question 3)
  - measured:  50,000 rows, memory and time, before and after
- **Files:**  `src/places/ListSteps.ts`, `parser/src/core/saved.ts`, `src/element/drawnWindow.ts`, `src/places/PlaceCache.ts`
- **Done when:**  scrolling 50,000 rows and back stays under the limit on a phone-sized page.

Later, not in these five:  Supabase, Firestore and Postgres as library place kinds (each a dependency for Owen to OK);
a growing value (AI text, §5.4);  Python hearing changes (after Python's pending changes).

## 11. Open questions for Owen

1. **Who builds it?**
   - A:  epic `data`, as new phases after Gitea Ingest (recommended:  it owns places, and every piece here is its)
   - B:  a new epic, `streams`, on top of `data`
   - C:  epic `solid-2-final`, as part of its Solid work
2. **After the generic ones, which service first?**
   - A:  GraphQL subscriptions:  a kind Spell has, no dependency (recommended)
   - B:  Supabase Realtime:  popular, but its protocol by hand or a dependency
   - C:  Firestore:  the biggest audience, and the biggest dependency
   - D:  Postgres through our server:  for people running their own database
3. **On a phone, may a long list take down rows far off screen?**  Today what's drawn stays drawn.
   - A:  yes, past 2,000 rows:  far-off rows' elements go, and come back on scrolling;  focus and a form's text far
     away are lost (recommended)
   - B:  keep the elements, drop only the data behind them (saves less)
   - C:  keep everything, as today
4. **The words for a web server that tells (§8):**
   - A:  `its changes come from "..."` (recommended)
   - B:  `it tells us what changed at "..."`
   - C:  no words:  only library kinds and TypeScript, for now
5. **A hidden page's stream:**
   - A:  closed after a minute hidden, carrying on when it's back (recommended:  a phone's battery, and the 6 connections)
   - B:  closed at once, as polling stops
   - C:  kept open while the page is open

## See also

- [data-paradigm.md](data-paradigm.md):  §3 streaming, §4 generators, §2 Python on Quart
- [spell-today.md](spell-today.md):  §2.3 async data, §2.4 actions and pending changes, §2.17 realtime
- [solid-features.md](solid-features.md):  async computations, `from()`, `createProjection`, `<Loading>`, `isPending`
- epic `data`'s epic page, `epics/data/data.plan.html`:  its Overview §1.4 (the `Place` interface), §1.7 (healing),
  J68 (a library's place kind)
- the places' rules:  `src/places/AGENTS.md`;  the server half:  `src/server/places/`
- the catalog:  `agents/coherence/catalog.md`, "Data that lives somewhere else", "A websocket that comes back",
  "Everyone's changes, in one order", "Polling while the page is visible", "Lists asked in the same moment",
  "A long list, drawn as you scroll"
- the words:  `agents/coherence/words.md`, "place", "the details under a place", "feed"
