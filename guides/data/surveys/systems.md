# Survey:  reading and changing data through one interface

Epic `data`, agent `data-survey-sync`, 2026-10-31.

The question:  how can Spell read and change data from many back-ends through one interface, with local data feeling
like server data, back-ends swappable, async invisible, navigation cancelling work, and the COMPILER gathering what
each part of the page needs?

**How far to trust this:**
- Every page was read through a fetch tool that summarises with a small model.
  So the "quotes" below are second-hand:  open the source before quoting one in public.
- "Not checked" means the page I read didn't say.  It doesn't mean the thing is absent.
- Section 6 lists what I couldn't verify.
- Sections 3, 4 and 5 are MY judgement, built on the sources, and aren't claims from them.

---

## 1. The systems, each from its own docs

### Meteor

- **The model:**  the client holds a partial copy of the database in memory, and every query runs on that copy.
  - Minimongo is "essentially an in-memory, non-persistent implementation of Mongo in pure JavaScript";
    no indexes, no aggregation, lost on reload.
    [Collections](https://docs.meteor.com/api/collections)
  - Client collections start empty until published data arrives (same page).
- **Reads:**  the server publishes a cursor, the client subscribes, and the records land in Minimongo.
  - `Meteor.publish` returns a cursor, or uses `added` / `changed` / `removed` by hand and calls `ready`.
  - `Meteor.subscribe` gives a handle with `stop()` and `ready()`.
  - A client sees a document if ANY of its active subscriptions publishes it.
    [Meteor API](https://docs.meteor.com/api/meteor)
- **Cancelling:**  a `subscribe` inside `Tracker.autorun` is tied to that computation, and cancelled when it's
  invalidated (same page).  This is the closest prior art to "the part went away, so its data request stopped".
- **Writes:**  method stubs.
  - A client-side definition with the same name runs at once while the server call is in flight.
  - The stub's return value is ignored.  Its writes are replaced when the server's writes arrive.
- **The wire:**  DDP, a stateful WebSocket protocol.
  - `sub` / `unsub` / `nosub`, `added` / `changed` / `removed` / `ready`, `method` / `result` / `updated`.
  - `updated` is the clever one:  it says all data messages caused by a method have been delivered, so the client
    knows when to drop its guess.  Its order against `result` isn't fixed.
    [DDP spec](https://github.com/meteor/meteor/blob/devel/packages/ddp/DDP.md)
- **Live on the server:**  oplog tailing, with Change Streams replacing it.
  - "The oplog records everything":  every write in the database has to be processed to find the ones that matter.
  - Vendor benchmark:  oplog saturated at 1,200 virtual users, then ran out of memory;  Change Streams reached 1,680.
    Treat these as a vendor's numbers.
    [Galaxy blog](https://blog.galaxycloud.app/why-meteor-3-5-is-the-most-important-release-in-years/)
  - The server can keep an image of each client's data (mergebox):  a third-party package exists to switch it off
    "to reduce CPU and memory".
    [control-mergebox](https://www.github.com/peerlibrary/meteor-control-mergebox)
- **Why it declined:**  NO official postmortem found.  Only opinion:
  - Tight integrations turned into lock-in as JS moved, and community leaders moved to Apollo and Next.js.
    [Forum thread](https://forums.meteor.com/t/meteor-is-great-why-is-not-more-popular/36580)
  - A search snippet of Sacha Greif's letter says the data layer was simple but lacked GraphQL's flexibility, and server
    rendering trailed Next.js.
    [Open letter](https://medium.com/@sachagreif/an-open-letter-to-the-new-owners-of-meteor-353d64780b20)
    (the page itself returned 403)
  - No source I found blames MongoDB lock-in directly.  That reading is mine:  the query language WAS Mongo's, and
    only the Mongo driver got the deep integration.

### fate ([fate.technology](https://fate.technology/);  1.0 published 2026-05-14, by Christoph Nakazawa)

"A modern data client for the web inspired by Relay and GraphQL." [Why fate](https://fate.technology/guide/why-fate)

- **The argument:**  components fetch on their own, so consistency needs manual invalidation and defensive refetching.
  It caches normalised objects, not requests.  The authors add that reducing imperative cache handling matters MORE as
  agents write more of the code. [1.0 post](https://fate.technology/posts/fate-1.0)
- **How views declare data:**  a view is a plain object, one per entity type, with every field explicit.
  [Views](https://fate.technology/guide/views)

  ```tsx
  export const PostView = view<Post>()({
    author: UserView,      // a relation, read through another view
    content: true,
    id: true,
    title: true,
    comments: defer(CommentConnectionView)  // loads when read, under its own Suspense
  })
  const post = useView(PostView, postRef)   // postRef: a pointer to one entity
  ```

  - "Views in fate are what fragments are in GraphQL." [Core concepts](https://fate.technology/guide/core-concepts)
  - A selection can also be a spread, `alias(View)`, `when(condition, selection)`, or `name: { args }`.
  - A view can be a function of parameters, bound at the call site.  Arguments travel with the ref.
- **How requests are gathered:**  by composing view objects up to `useRequest`, at RUN time.
  [Requests](https://fate.technology/guide/requests)

  ```tsx
  const { posts } = useRequest({ posts: { list: PostView } })
  ```

  - Shapes:  `{ id, view }`, `{ ids, view }`, `{ list: View, args }`, or a root such as `{ viewer: { view } }`.
  - "Requests made together" are batched, through tRPC's HTTP Batch Link or one GraphQL operation.
  - Views over the same objects share cached data, and "fate fetches only missing fields".
  - Duplicates are removed at run time, so overlapping spreads are fine.
  - **There's no compiler.**  The Vite plugin only keeps server API types in sync.
    The docs I read use the words "single request at the root" and "batch";  none names a "coordinator".
- **Masking, enforced twice:**
  - Compile time:  reading an unselected field is a TypeScript error.
  - Run time:  the unselected field is `undefined`.
  - A view resolved against a ref that doesn't include it THROWS, even when both select the same field.
  - A component re-renders only when a field it selected changes.
- **Optimistic updates:**  actions, not hooks.  [Actions](https://fate.technology/guide/actions)

  ```tsx
  like({ input: { id: post.id }, optimistic: { likes: post.likes + 1 } })   // fails => restored by itself
  addComment({ input, insert: { into: post.comments, position: "after" },
               optimistic: { id: `temp-${crypto.randomUUID()}`, content, ... } })  // temp id => the server's
  deleteAction({ input: { id }, delete: true })    // leaves every list;  restored if it fails
  ```

  - Automatic insertion into lists was REMOVED as the default:  `insert` must be said out loud.
  - Expected errors (validation, 404) appear as `result.error`;  unexpected ones (network, auth) are thrown.
- **Cancellation:**  pass an `AbortSignal`.
  "If requests are shared, cancelling one does not cancel the others."  It covers the request and its background
  refresh, not later pagination or mutations.
- **Freshness modes:**  `cache-first` (default), `stale-while-revalidate`, `network-only`, `cache-only`.
  They can switch at run time, e.g. on going offline.
- **Keeping data after a part leaves:**  the last 10 released requests stay (`gcReleaseBufferSize`), so going back is fast.
- **Lists:**  each logical view keeps its own window, keyed by view, connection and original arguments.
  A filter gets its own list;  loading a page widens the same one. [List views](https://fate.technology/guide/list-views)
- **Live:**  `useLiveView` replaces `useView` with no other change;  one connection per client, over SSE.
  - The server emits `live.update("Post", id, { changed: ["likes"] })`, and subscribers not selecting `likes` are skipped.
  - Lists:  `live.connection(...).prependNode` / `deleteEdge` / `invalidate` (refetch when the change can't be described).
  - The default bus doesn't replay missed events after a disconnect.
  - Live errors leave the last data on screen, and don't reach error boundaries. [Live views](https://fate.technology/guide/live-views)
- **Offline:**  saved mutations, delivered in order, one at a time per key.
  - Each mutation has an identity reused on retry, so the server must dedupe in the same transaction.
  - fate does NOT rewrite temp ids in dependent offline mutations:  use client-generated ids.
  - Storage is an interface:  `read`, `scan`, `writeBatch` (atomic), `exclusive`, optional `subscribe`.
    [Persistence](https://fate.technology/guide/persistence)
- **The back-end interface:**  the most directly useful thing in this whole survey.
  [Transport](https://fate.technology/api/fate/src/interfaces/Transport)

  ```ts
  interface Transport {
    supportsAliases?: boolean
    fetchById(type, ids, select, args?, { refetch?, signal? }): Promise<unknown[]>     // the ONLY required method
    fetchList?(proc, select, args?, { signal? }): Promise<{ items, pagination } | null>
    fetchQuery?(proc, select, args?, { signal? }): Promise<unknown>
    mutate?(proc, input, select, selectionArgs?)
    mutateDurably?(proc, input, select, identity, selectionArgs?)   // never falls back to mutate
    subscribeById?(type, id, select, args, handlers): () => void
    subscribeConnection?(procedure, type, args, select, selectionArgs, handlers): () => void
  }
  ```

  - It ships HTTP, GraphQL and tRPC transports.
  - It demands `id` and `__typename` on every object;  GraphQL back-ends must follow Relay's conventions for identity
    and pagination. [GraphQL](https://fate.technology/integrations/graphql)
  - The server's data views list what may leave:  a field not listed is never sent. [Server](https://fate.technology/integrations/server)
- **Against Relay:**  same ideas (composition, masking, normalised cache), minus the query language and the compiler,
  and it needs a server shaped its way.

### Relay, GraphQL fragments, Apollo

- **Relay:**  each component declares a fragment, read with `useFragment`;  a parent spreads it and passes the reference
  along without reading it. [Fragments](https://relay.dev/docs/guided-tour/rendering/fragments/)
  - Aim:  "coalesce those requirements into a single query that fetches the data for an entire subtree of components."
  - Masking:  "only allows components to access data they specifically ask for". [Thinking in Relay](https://relay.dev/docs/principles-and-architecture/thinking-in-relay/)
  - "Depends upon ahead-of-time compilation" to generate artifacts and types. [Compiler](https://relay.dev/docs/guides/compiler/)
- **Apollo's normalised cache:**  cache ID = `__typename` + `id`.  Nested objects are flattened out into one lookup table
  and replaced by references;  a repeat merges, new values overwriting.  Without an id, an object stays inside its parent.
  [Apollo caching](https://www.apollographql.com/docs/react/caching/overview)

### TanStack Query, SWR

- **Query keys:**  any JSON-serialisable array, unique to its data;  object key order doesn't matter, array order does.
  Every variable the fetch uses belongs in the key. [Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- **Defaults:**  stale immediately;  refetch on mount, window focus, reconnect;  inactive kept 5 minutes;  3 retries;
  structural sharing keeps unchanged references. [Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- **Cancelling:**  NOT by default:  "queries that unmount or become unused before their promises are resolved are not
  cancelled", and the data still reaches the cache.  It cancels only when the fetch function uses the `AbortSignal`.
  [Cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation)
- **Optimistic, two ways:**  [Optimistic updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
  - Draw the pending `variables`:  no cache work, one place on screen.
  - Through the cache:  cancel outgoing queries, snapshot, `setQueryData`, restore on error, invalidate on settle.
    A beginner must get all four steps right.  fate's whole pitch is removing them.
- **SWR:**  same key shares one request;  refresh on focus and reconnect. [Getting started](https://swr.vercel.app/docs/getting-started)
  - `optimisticData` plus `rollbackOnError` (default true). [Mutation](https://swr.vercel.app/docs/mutation)
  - Abort:  a PR proposed an opt-in `abortDiscardedRequests`;  I couldn't confirm it shipped. [PR 2275](https://www.github.com/vercel/swr/pull/2275)

### Sync engines

- **TanStack DB:**  typed collections plus incremental live queries, built on differential dataflow.  [Overview](https://tanstack.com/db/latest/docs/overview)
  - It separates "loading data into your app from binding data to your components".
  - Sources:  REST through TanStack Query, Electric, PowerSync, local (IndexedDB, localStorage, memory).
  - Docs cite about 0.7ms to update one row in a sorted 100,000-row collection, on an M1 Pro.
  - Three sync modes:  eager (under ~10k rows), on-demand (over ~50k), progressive.  **The size of the data changes
    the strategy.**
  - A custom source:  `sync({ begin, write, commit, markReady })` returning a cleanup, `getKey`, optional
    `onInsert` / `onUpdate` / `onDelete`, optional `loadSubset` / `unloadSubset`.
    [Collection creators](https://tanstack.com/db/latest/docs/guides/collection-options-creator)
- **Zero:**  queries run on the client at once, then the same query runs on the server, and changes flow as row updates.
  [Queries](https://zero.rocicorp.dev/docs/queries)
  - Each result says what it knows:  `unknown` (may be incomplete), `complete`, `cached` (confirmed in an earlier session).
  - "Show 'not found' only when complete":  otherwise it flickers.
  - Queries live on for a TTL, default 5 minutes, max 10.
  - Mutators run first locally, then in a transaction on your server;  the local guess is rolled back as the real rows
    arrive. [Mutators](https://zero.rocicorp.dev/docs/mutators)
  - Postgres only, per [a 2025 review](https://marmelab.com/blog/2025/02/28/zero-sync-engine);  1.0 per
    [InfoQ](https://infoq.com/news/2026/06/zero-version-1) (search snippets only).
- **Convex:**  query functions on the server;  dependencies tracked automatically;  every client subscription updates "to
  the same snapshot of the database". [Realtime](https://docs.convex.dev/realtime)
  - Optimistic:  `.withOptimisticUpdate` with `getQuery` / `setQuery`;  re-runs if local results change, and is dropped
    when the real results arrive. [Optimistic](https://docs.convex.dev/client/react/optimistic-updates)
- **Firestore:**  `onSnapshot` fires on local writes "before the data is sent to the backend".
  - `metadata.hasPendingWrites` says local or server. [Listen](https://firebase.google.com/docs/firestore/query-data/listen)
  - `fromCache`:  "might be stale or incomplete".  Offline persistence is off by default on the web;  last write wins.
    [Offline](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- **Supabase Realtime:**  subscribe to table changes, filtered by `column=op.value` on the server.  No `OR`.
  - "Authorizes every event against each subscriber";  a single thread;  past about 3,000 subscribers it recommends
    Broadcast. [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- **ElectricSQL:**  read path only:  "syncs data out-of Postgres".  [Writes](https://electric.ax/docs/guides/writes)
  - A shape is one table, a where, and columns.  Immutable;  a 409 / must-refetch makes the client start over.
    [Shapes](https://electric.ax/docs/guides/shapes)
  - Four write patterns of rising power:  online, component-scoped optimistic, shared persistent optimistic, through a
    local database.  **A useful ladder.**
- **PowerSync:**  SQLite on the client, synced from Postgres, MongoDB, MySQL and others. [Overview](https://docs.powersync.com/intro/powersync-overview)
  - Writes apply to SQLite at once, queue as PUT / PATCH / DELETE, and go through an `uploadData()` YOU write to your API,
    which keeps validation and auth. [Writing](https://docs.powersync.com/client-sdks/writing-data)
  - A write checkpoint makes sure the client gets its own writes back before other new data. [Protocol](https://docs.powersync.com/architecture/powersync-protocol)

### Adapter-style uniformity

- **WarpDrive (Ember Data's successor):**  a request manager, with a chain of handlers that each handle, modify or pass
  on a request;  a replaceable cache behind one interface.  Marketed as "Connect With Any API".
  [Site](https://warp-drive.io/), [RequestManager](https://emberjs.github.io/data/api/@warp-drive/core/classes/RequestManager) (snippets only).
  JSON:API is its recommended cache format, since most responses convert to it losslessly.
  [JSONAPICache](https://emberjs.github.io/data/api/@warp-drive/json-api/classes/JSONAPICache)
- **Prisma:**  one client, an adapter per driver.  [Drivers](https://www.prisma.io/docs/orm/overview/databases/database-drivers)
  Differences are documented in tables rather than a run-time flag;  e.g. arrays are Postgres only, and MongoDB lacks
  auto-increment and compound ids. [Features](https://www.prisma.io/docs/orm/reference/database-features)
- **Rails Active Record:**  `where` returns a lazy relation;  "the query is sent only when the data is actually needed".
  Scopes name query logic.  N+1 is the known cost:  10 books and their authors, 11 queries;  `includes` makes it 2.
  [Querying](https://guides.rubyonrails.org/active_record_querying.html)
- **Django:**  "You can stack filters together all day long, and Django won't actually run the query until the QuerySet is
  evaluated." [Queries](https://docs.djangoproject.com/en/stable/topics/db/queries/)
  Capability flags exist, but for whole models:  `required_db_features`. [Options](https://docs.djangoproject.com/en/stable/ref/models/options/)
- **Hasura:**  change `query` to `subscription`.  Interval polling, 1 second by default. [Live queries](https://hasura.io/docs/2.0/subscriptions/postgres/livequery/index/)
  - One SQL statement re-fetches for many clients, by joining a relation of their inputs.
  - Chose polling over Listen/Notify (lossy) and WAL (slots are costly), since mapping events to complex live queries
    is intractable, and high write rates need debouncing anyway.
    [Architecture](https://raw.githubusercontent.com/hasura/graphql-engine/master/architecture/live-queries.md)
  - Benchmark:  1 million live queries with Postgres at about 28%. [Blog](https://hasura.io/blog/1-million-active-graphql-subscriptions)
- **PostGraphile:**  GraphQL from a Postgres schema, "no N+1 query issues", authorisation left to the database's
  row-level security. [Docs](https://postgraphile.org/postgraphile/4)
- **Rclone:**  **the best model for capabilities.**
  - Required, five methods:  `List`, `NewObject`, `Put`, `Mkdir`, `Rmdir`;  on an object `Open`, `Update`, `Remove`, `SetModTime`.
    Optional ones are small separate interfaces. [fs/types.go](https://raw.githubusercontent.com/rclone/rclone/master/fs/types.go)
  - A published table of what each back-end lacks, with the fallback spelled out:  no `Copy`, "the file is downloaded
    then re-uploaded";  no `Move`, copy then delete;  no `CleanUp`, an error. [Overview](https://rclone.org/overview/)
- **FUSE:**  on interrupt the kernel queues an INTERRUPT, which "does not by itself cancel the indicated operation";  a reply
  is still expected, e.g. EINTR. [fuse(4)](https://man.archlinux.org/man/fuse.4.en.txt)
- **Plan 9 (9P):**  every service is a file tree.  Twelve-odd messages:  `attach`, `walk`, `open`, `create`, `read`, `write`,
  `clunk`, `remove`, `stat`, `wstat`, and `flush`, which cancels a pending request;  the client must wait for `Rflush`, even if
  the first reply got there first. [intro(5)](https://9p.io/magic/man2html/5/0intro)
- **OData:**  a uniform query language over URLs, with capabilities DECLARED in metadata.
  - A service "may support some or all of the system query options", and must refuse those it doesn't.
    [URL conventions](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html)
  - Terms:  `FilterRestrictions` (even per property), `SortRestrictions`, `ExpandRestrictions`, `TopSupported`, `SkipSupported`,
    `Insert` / `Update` / `DeleteRestrictions`, `ChangeTracking`.
    [Capabilities vocabulary](https://raw.githubusercontent.com/oasis-tcs/odata-vocabularies/main/vocabularies/Org.OData.Capabilities.V1.md)
  - Delta links:  the last page hands back a link for "what changed since". [Protocol](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html)
- **Datomic:**  the database is a value, "a set of immutable atomic facts";  a query runs against a point in time, so
  repeating it gives the same answer.  Processes hold their own query engine and cache. [Overview](https://docs.datomic.com/datomic-overview.html), [Query](https://docs.datomic.com/peer-tutorial/query-the-data.html)

### Route loaders and server components

- **React Router:**  a `loader` (server) or `clientLoader` per route, run in parallel.  A parent can't protect a child, since
  each loader is requested on its own. [Data loading](https://reactrouter.com/start/framework/data-loading)
  - Newer navigations cancel older ones.  On revalidation, a stale request is one that "started earlier than one that has
    returned".
  - "Your server still processes these cancelled requests". [Race conditions](https://reactrouter.com/explanation/race-conditions)
  - Optimistic:  read `fetcher.formData`, fall back to the loader's data. [Fetchers](https://reactrouter.com/how-to/fetchers)
- **SvelteKit:**  `load` functions run concurrently;  dependency tracking is automatic, down to a single search parameter.
  [Load](https://svelte.dev/docs/kit/load)
  - `depends` / `invalidate(url)` / `refreshAll` re-run;  server loads stream promises.
- **React Server Components:**  `await db.notes.get(id)` in render;  the browser only gets the output.  A promise can be passed
  down and read with `use`. [Server Components](https://react.dev/reference/rsc/server-components)
  The simplest authoring here, but it's for server data alone, and needs a server.
- **Solid Router:**  `query(fetcher, name)` dedupes;  `createAsync(() => q())` gives a signal;  preload on hover;  an action
  revalidates the page's queries by itself. [Queries](https://docs.solidjs.com/solid-router/data-fetching/queries), [Actions](https://docs.solidjs.com/solid-router/concepts/actions)
- **Solid 2:**  async built into the graph:  a `createMemo` returning a promise, `<Loading>`, `isPending`, `latest`, `action`,
  `refresh`, `createOptimistic` (an overlay discarded when the transition settles).
  [Beta notes](https://github.com/solidjs/solid/releases/tag/v2.0.0-beta.0), [Design discussion](https://github.com/solidjs/solid/discussions/2791)
  (search snippets;  the repo's own Solid 2 guide is the authority here.)

### Other collection mechanisms:  candidates for the fifth back-end

- **RSS:**  read only.  `guid` is an opaque identity, `ttl` says how long to cache, `skipHours` when not to poll, and optional
  `cloud` pushes. [Spec](https://www.rssboard.org/rss-specification)
- **Google Sheets:**  60 reads and 60 writes per user per minute, backoff required. [Limits](https://developers.google.com/workspace/sheets/api/limits)
  - It has a real filter:  a SQL-like `tq` on `/gviz/tq`, columns addressed by letter;  and "data sources don't have to support
    every feature". [Query language](https://developers.google.com/chart/interactive/docs/querylanguage)
- **Airtable:**  `filterByFormula`, `sort`, `fields`, `pageSize` (max 100), an `offset` cursor. [List records](https://airtable.com/developers/web/api/list-records)
- **SQLite in the browser:**  OPFS in workers only;  the basic VFS needs COOP / COEP headers;  `opfs-sahpool` doesn't, but takes
  one connection at a time.  Browsers can clear it. [Persistence](https://sqlite.org/wasm/doc/trunk/persistence.md)
- **WebSockets:**  no backpressure.  "It will either fill up the device's memory ... become unresponsive ... or both."
  WebTransport is recommended instead. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- **MCP:**  resources by URI:  `resources/list` (cursor), `resources/read`, URI templates, optional `subscribe` and `listChanged`,
  **declared as capability flags**;  an update notice says only WHICH resource changed, then the client reads it.
  [Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)
  - Cancelling:  `notifications/cancelled`, which a receiver may ignore, and the sender must tolerate a late reply.
    [Cancellation](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/cancellation)
- **Chunked files as prior art:**  DuckDB uses Parquet metadata plus HTTP range requests "to only download the parts of the file
  that are actually required". [httpfs](https://duckdb.org/docs/2.0/core_extensions/httpfs/https.html)
  CORS applies in the browser. [DuckDB-Wasm](https://duckdb.org/docs/2.0/clients/wasm/data_ingestion.html)
- **File System Access:**  directory and file handles, storable in IndexedDB;  `FileSystemObserver` for changes;  needs permission and
  HTTPS.  OPFS needs no permission. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)

---

## 2. Table of paradigms

"Not checked" = the page I read didn't say.  The beginner column is my own judgement.

| Paradigm | What the author writes | Where data lives | How reads are gathered | How writes apply | Cancellation | Live updates | Back-end swappable? | Cost to a beginner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Meteor** | publish + subscribe + Mongo query, twice | in-memory partial DB;  server may keep each client's image | by hand, per subscription | stub runs at once;  server's writes replace it | subscription stops with its computation | DDP push | No:  Mongo's language | Low to start, high at scale |
| **fate** | a view per component, `useRequest` at the root | normalised objects | run-time composition, batched | `optimistic:`, auto rollback | `AbortSignal`;  shared requests survive | SSE, field-level | Yes, by Transport;  requires ids and its conventions | Medium:  views, refs, masking errors |
| **Relay** | a GraphQL fragment per component | normalised store | COMPILER, ahead of time | not checked here | not checked | not checked | GraphQL only | High |
| **Apollo** | GraphQL queries | normalised cache | per query | not checked here | not checked | not checked | GraphQL only | Medium:  merge rules |
| **TanStack Query / SWR** | key + fetch function | cache per KEY | by hand;  same key dedupes | by hand, 4 steps, or draw pending | Query:  only if the fetch uses the signal;  SWR unconfirmed | refetch on focus / reconnect | Yes:  any promise;  nothing shared but the cache | Low, until invalidation |
| **TanStack DB** | collections + live queries | client collections | local queries;  optional `loadSubset` | local, handler persists, rollback | not checked | from the source | Yes:  source adapters | Medium-high |
| **Zero** | ZQL + mutators | local store, query-driven | the query IS the subscription | runs locally, then authoritatively | query TTL | yes | No:  Postgres | Medium, plus zero-cache to run |
| **Convex** | server query functions | server, client cache | subscription per function | `withOptimisticUpdate` by hand | not checked | all one snapshot | No:  its own | Low, but a platform |
| **Firestore** | a query + `onSnapshot` | local cache | per listener | local first | not checked | yes | No | Low, cost / limits later |
| **Supabase** | channel + filter | Postgres | per channel | not checked | not checked | per-row events | Postgres | Low-medium |
| **Electric** | shape definitions | your client store | one table per shape | yours (4 patterns) | not checked | yes | Postgres, read only | Medium |
| **PowerSync** | SQL + `uploadData()` | SQLite on client | sync rules | local, queue, your API | not checked | yes | Several source DBs;  SQLite in front | High:  sync rules |
| **WarpDrive** | requests + schemas | one cache | not checked | not checked | not checked | not checked | Yes:  handler chain + cache interface | High:  concept count |
| **ORMs** (Prisma, Rails, Django) | lazy chained queries | database (server) | lazy;  N+1 unless told | model `save` | not checked | No | Yes, within SQL;  differences documented | Low:  closest to English |
| **Hasura / PostGraphile** | a database schema, GraphQL | Postgres | one SQL per request | generated | not checked | Hasura:  polling, 1s, multiplexed | Generated from the DB | Medium |
| **Rclone / FUSE / 9P** | path and verbs | wherever it lives | none:  each call | `Put`, `write` | 9P `flush`;  FUSE interrupt, advisory | none in the base | **Best:**  optional features + fallback table | Low:  a file is a file |
| **OData** | URL query options | the service | `$expand`, `$select` | HTTP verbs + restrictions | not checked | delta links | Yes, if a service speaks it | High:  spec weight |
| **Datomic** | Datalog on a value | peer cache + storage | a query on a point in time | transactions add facts | not checked | not checked | No | High:  new thinking |
| **Route loaders** | a load function per route | server / route | per route, parallel | form action + revalidate | newest navigation wins | No | Yes:  your code | Low, but tied to routes |
| **Server Components** | `await` in the component | server | no gathering:  waterfall risk | not checked | not checked | No | Yes:  your code | Low, needs a server |
| **Solid query / async** | `query` + `createAsync`, async memo | router cache / graph | same name dedupes | `action` + revalidate;  `createOptimistic` | not confirmed | No | Yes:  your code | Low-medium |

---

## 3. What Spell should steal

1. **The compiler infers the view, so no one writes one.**
   - Relay's compile-time gathering, and fate's composition, both make the AUTHOR state each field.
   - Spell already compiles every field read, so it can derive each part's selection and merge them at the page.
   - Conditional reads become fate's `when`;  a part behind a disclosure becomes `defer`;  a dynamic or unprovable read widens
     to the whole record, plus a compiler note.
   - Masking comes free:  a part can't depend on a field it never named, since naming it is what adds it.
2. **Cache objects, not requests:  `type + id`** (Apollo, fate).  It gives one edit shown everywhere, without invalidation.
3. **Required core, optional features, written fallbacks** (fate's Transport, rclone's table, MCP's and OData's flags).
4. **The back-end says what it did;  the engine does the rest.**
   - A filter the server can't do runs locally, against pages it loads.  rclone does this for `Copy`;  OData only refuses.
   - Each fallback is reported at compile time or in dev, never silent.
5. **Results say what they know** (Zero's `unknown` / `complete` / `cached`;  Firestore's `fromCache`, `hasPendingWrites`).
   - In Spell these become plain words:  "loading", "saved", "saving".
   - Never draw "none found" until it's complete.
6. **One action, run on both sides** (Meteor's stubs, Zero's mutators).
   - Spell can compile the action written once to a local overlay plus the back-end call.
   - Solid 2's `createOptimistic` overlay fits;  drop the guess when the back-end's data arrives (DDP's `updated`).
   - Say list insertion out loud or infer it from a declared sort:  fate removed its automatic default.
7. **Lifetime follows the part, and sharing is counted** (Meteor's autorun, fate's shared requests).
   - The part's Solid owner holds the `AbortSignal`;  the last reader leaving aborts it.
   - Keep the last ~10 released requests, so going back is instant (fate).
   - Newest navigation wins (React Router).
8. **Polling is the universal live fallback** (Hasura, RSS's `ttl`).
   - A resource can ask to be live on ANY back-end;  a capability only upgrades how:  push, "something changed, re-read" (MCP), or poll.

---

## 4. Traps

1. **A silent fallback that downloads everything.**
   - Filtering a 2 GB file locally looks identical to a server filter.  Uniform syntax has to come with visible cost:  rclone's table and
     TanStack DB's row bands say so.
   - Needs a row or byte ceiling, then a compile note, then an error.
2. **Meteor's bet:  the language shaped like ONE database, and the server holding per-client state.**  The oplog cost and the mergebox package
   are the evidence;  its fall isn't documented, so read this as a warning and not as a proven cause.  So:  Spell's own small query language,
   stateless back-ends.
3. **Identity isn't free.**  Normalising needs `id` (fate, Apollo), and spreadsheets, CSV, RSS without `guid` and files don't reliably have one.
   Inserting a row into a sheet shifts every row number.  The interface must make a back-end state its key, or mark the data as not-normalised.
4. **Cancelling isn't undoing.**
   - The server keeps going (React Router);  9P, FUSE and MCP all treat cancel as advisory and race-prone.
   - So abort READS only.  A write already sent is never aborted by navigating away, only reconciled, and needs an identity for retries (fate).
5. **Optimistic writes past "one click".**  Temp ids in dependent offline writes (fate won't rewrite them), last-write-wins (Firestore), rollback when other
   changes have landed since.  Start with online and an overlay, as low as possible on Electric's four-rung ladder, and make offline a later rung.

---

## 5. The minimum common interface

**The principle:**  two methods required, everything else optional, with a named fallback.  Plain shapes:

```ts
interface Backend {
  /** What it can do:  read once, before planning any query.  Static when it can be. */
  describe(): Capabilities

  /** Rows of a collection.  It does what it can, and SAYS what it did;  the engine does the rest. */
  list(collection, query: { filter?, sort?, select?, page? }, ctx: { signal }):
    Promise<{ rows, nextPage?, total?, version?, handled: { filter?, sort?, select? } }>

  // Everything below is optional.

  /** Many rows by key, in one call. */
  getMany?(collection, keys, select, ctx): Promise<Row[]>

  /** Changes.  `identity` makes a retry safe. */
  apply?(changes: Array<{ op: "insert" | "update" | "delete", collection, key, values }>,
         ctx: { identity }): Promise<{ rows, version? }>

  /** A named server operation that isn't plain create / update / delete (like, checkout ...). */
  call?(name, input, select, ctx): Promise<unknown>

  /** Tell me when something changes;  returns stop.  Event may hold the rows, or only "this changed". */
  watch?(target: { collection, key? , filter? }, onEvent): () => void

  /** What changed since this token (OData's delta link, a file's ETag). */
  changesSince?(token): Promise<{ rows, removed, token }>
}

interface Capabilities {
  collections, keyOf         // required:  a key field, or { key: "none" }, meaning "don't normalise"
  filter:  "none" | Ops[]    // the operators it does natively, per field if need be (OData)
  sort:    "none" | Field[]
  select:  boolean
  page:    "none" | "offset" | "cursor" | "range"
  write:   "none" | ("insert" | "update" | "delete")[]
  atomic:  boolean           // many changes at once, all or nothing
  live:    "none" | "poll" | "notify" | "push"
  pollEvery?, rateLimit?     // RSS `ttl`, Sheets' 60 a minute
  abort:   "hard" | "soft"   // soft:  we ignore the answer, as 9P's and MCP's may
}
```

**The five back-ends against it:**

| Capability | REST | GraphQL | Chunked files | File system | Sheet / CSV (fifth) |
| --- | --- | --- | --- | --- | --- |
| `list` | `GET /x?..` | root field | manifest, then chunks | a folder's entries | fetch the rows |
| `getMany` | if `?ids=`;  else N requests | `nodes(ids:)` | by chunk | read each file | **fallback:**  from the list |
| filter | varies, declared per API | per the schema | **none, or by chunk metadata** | **none** (names only) | Sheets:  `tq`;  CSV:  **none** |
| sort | varies | per the schema | **none, or chunk order** | **names, dates only** | Sheets:  `tq`;  CSV:  **none** |
| select | often none | **always** | by column, if columnar | **none** | Sheets, Airtable:  yes |
| page | cursor or offset | cursor | range | none:  whole folder | Sheets:  `limit`, `offset`;  Airtable:  cursor |
| write | POST, PATCH, DELETE | mutations via `call` | **none** usually | yes, with permission | Sheets:  rate-limited;  CSV:  **none** |
| atomic | rarely | one mutation | no | no | **no** |
| live | **none or poll** | subscription, if offered | poll the manifest | `FileSystemObserver` where available | **poll** |
| key | `id` | `id` | stated in manifest | path | **stated by author, else not normalised** |
| abort | hard | hard | hard (range fetch) | soft | hard |

**The fallbacks the engine owns,** one line each, the same for every back-end:

| Missing | Engine does | Reports it? |
| --- | --- | --- |
| `getMany` | calls `list` filtered, or pages until found | dev note |
| filter, sort | loads pages, filters locally, up to a ceiling | compile note;  error over the ceiling |
| select | fetches all, then masks | no |
| paging | loads everything once, then slices locally | note over the ceiling |
| `live` | polls `list` at `pollEvery`, and diffs by key | no:  "live" just means slower |
| `write` | the compiler refuses:  "this data is read only" | **error at compile time** |
| `atomic` | sends one at a time;  a failure rolls back the overlay of those unsent | note |
| key | keeps rows inside their list;  no shared identity | note |

- The compile-time error on `write` needs `describe()` to be static, or a declared back-end type.  A run-time-only back-end gets it at run time.
- GraphQL needs `select` to be sent as a selection set, and REST `list` is mapped per endpoint;  that mapping is the adapter's only real work.
  The adapter author writes a mapping and a capability list, never a cache or a retry.

**The fifth:  Sheet / CSV, recommended first.**
- It exercises the hard absences together:  no stable keys, no filter (CSV), read-only (CSV), rate limited, poll only.
- It suits Spell's readers, who already have a spreadsheet.
- RSS is the cheap sixth:  read only, a real key (`guid`), a stated poll time (`ttl`).
- MCP has the closest shape (URIs, list, read, flagged subscribe), but its docs aim at hosts for language models, and browser reach wasn't checked.
- SQLite proves "local feels like server", but its headers (COOP / COEP) and worker-only rule make it a heavier first test.
- A raw WebSocket is a transport for `watch`, not a back-end:  no reads, no keys, no backpressure.

---

## 6. What I couldn't verify

1. **Why Meteor declined:**  no official postmortem;  opinion only, and Greif's letter returned 403 (search snippet only).
2. **Mergebox:**  known from a third-party package, not Meteor's own docs.
3. **SWR's abort:**  a proposed PR;  whether it shipped wasn't confirmed.
4. **Solid 2's async API:**  from search snippets of release notes and discussions;  the docs preview and the signals README returned 404.
   Whether a superseded async memo gets an `AbortSignal` is NOT confirmed:  check the repo's Solid 2 guide.  This matters for idea 7.
5. **Zero:**  1.0 and Postgres-only come from snippets of InfoQ and a 2025 review;  pricing wasn't found.
6. **TanStack DB:**  "1.0 RC" is inferred from a linked migration guide.
7. **WarpDrive:**  API snippets only, and the guides weren't read.  Ember Data's succession rests on a search snippet.
8. **FUSE:**  the kernel docs page returned 404;  from the fuse(4) man page and mirrors.
9. **Firestore:**  how to detach, and query limits, were past the truncation point.
10. **OData:**  `501 Not Implemented` wasn't reached;  the refusal rule is from the URL conventions and protocol section 6.1.
11. **React Router's `request.signal`, SvelteKit's abort on navigation, RSC's cancellation:**  not found on the pages I read.
12. **Sheets' `gviz` limits and auth for private sheets:**  from one page.  `limit` / `offset` in the table above is the query language's, from memory of its clause list, so check it.
13. **The fate summary of "against Relay"** is mine:  its docs name Relay as an influence, without a detailed comparison.
14. **`FileSystemObserver` support by browser:**  MDN's tables didn't load.
15. **The interface in section 5 is untested:**  a design from these sources, not something anyone has built.
