# Multiplayer Spell: survey and proposal

Epic `data`, agent `data-survey-multiplayer`, 2026-10-31.

The ask, in Owen's words: CRDT-like behaviour without a full CRDT.
"Things may get wonky for a second or two -- that's ok, as long as things self-heal relatively quickly."
Also: cancelling "transactions", e.g. when someone navigates away.

How to read this:
- Facts carry their source URL.
- "My proposal", "my reasoning" and "my estimate" mark what no source says.
- Section 9 lists what I could not verify.

## 1. The answer in short

1. Every thing gets an id the browser makes.  A change is small:  one field of one thing, not a whole thing.
2. ONE referee per shared space puts all changes in one order.  For a field, the last to arrive wins.
3. Each browser keeps two things:  the referee's copy, and its own list of unconfirmed changes.
   What's on screen is always the referee's copy with that list replayed on top.
4. Healing is a single routine:  get the referee's latest, replay the list.
   It's what happens on opening a page, on reconnecting, on a missed message, and on a failed check.
5. Long text is the exception, and the one place to use a CRDT library:  one field at a time, not the whole model.
6. Things the rules must guard (the last seat, a budget) run on the referee as named actions.
   Spell's compiler can tell which actions those are, because it can see an action read what it writes.

**The caveat that matters most:  "heals" means everyone ends up seeing the same thing, NOT that nothing was lost.**
- Last-writer-wins always heals in a moment, but the loser's value is gone.
- That's fine for a card's colour, and it's real data loss for a paragraph.
- So the "wonky for a second" tolerance fits short values, and doesn't fit long text.

## 2. What Spell's earlier `crdt` epic said

From the [future epic's analysis page](/Users/owen/www/spell/spell.epics/epics/crdt/details/analysis.html) (2026-10-11):

- It covers the EDITOR's source text and the RUNNING program, and not shared data as such.
- Its proposed shape:
  - Source text:  a text CRDT library (Yjs, with `y-monaco`), the editor server relaying changes.
  - A running program:  ONE program on the server as referee, every page mirroring it:  "no CRDT needed there".
- It names four reasons today's patches (Python target) aren't enough without a referee:
  1. Ids:  the server counts them up, so two editors would both make a "27".
  2. Whole things:  a patch sends a changed thing whole, so one of two changes to a card is lost.
  3. One way:  only the program sends patches;  pages send requests.
  4. Text:  a whole-file patch wipes out what the other person typed.
- Its questions Q1-Q4 are unanswered there:  what's shared, library or own, who keeps the copy, how far it reaches.

How this proposal fits:
- It agrees:  a referee for structured data, a library for text.
- It answers its first three reasons directly:  browser-made ids, per-field changes, changes flowing both ways.
- The new layer:  shared DATA, with no running program behind it (a generic referee).

## 3. Survey:  what each system does

| System | Who decides | Same field, two people | Client's own unconfirmed change | Long text | Offline |
| --- | --- | --- | --- | --- | --- |
| Figma | server | last to arrive wins, whole value | applied at once;  conflicting server values ignored until acked | not merged:  "AB or BC, never ABC" | yes:  fresh copy, reapply |
| Linear | server (secondary sources) | last-writer-wins by server sync id (secondary) | optimistic, queue in IndexedDB (secondary) | CRDT for issue descriptions only (secondary) | "failsafe" |
| Replicache / Zero | server re-runs your code | whatever your code does | replay pending on server state | not addressed by what I read | Replicache persists pending;  Zero:  no offline writes |
| Meteor | server re-runs the method | whatever the method does | client stub simulates, server's writes replace it | not addressed | method re-sent on reconnect |
| Convex | server, serializable | re-run on conflict | optimistic update rolled back at completion | not addressed by what I read | not addressed by what I read |
| Liveblocks | server | last to reach server wins, per key | applied at once, others' changes to that value held back | LiveText merges both | queued |
| Firestore | server | "last write wins" per document | listeners fire at once, `hasPendingWrites` | not addressed by what I read | writes queue;  transactions fail |
| Yjs / Automerge | nobody needed | deterministic winner | no pending state:  merge | character merge | yes |

### Figma:  the closest model to what Owen describes

[How Figma's multiplayer technology works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/):

- "Figma isn't using true CRDTs though."  The server is the central authority, so it needn't carry CRDT overhead.
- One server process per document, over WebSockets.  The server's order replaces timestamps.
- The server tracks the latest value for each property of each object;  unrelated properties don't conflict.
- "The eventually consistent value for a given property is always a value sent by one of the clients."
- Text:  one client makes B into AB, another makes it BC:  "the end result will be either AB or BC but never ABC."
  "That's ok with us because Figma is a design tool, not a text editor."
- No flicker:  changes apply locally at once, and the client will
  "discard incoming changes from the server that conflict with unacknowledged property changes".
- Ids are made by clients, with a client id in them, so creating things works offline.
- Delete:  the server keeps nothing about the deleted object.
  "That data is instead stored in the undo buffer of the client that performed the delete."
- Trees:  each child links to its parent.  The server rejects cycles;  a client can briefly see one,
  and the objects involved briefly disappear.  An accepted rare edge case.
- Parent link and position are one property, so they change together.
- Offline and reconnect:  download a fresh copy, reapply offline edits on top, open a new WebSocket.
  So connecting stays simple.  This is the "one healing routine" idea.
- Undo principle:  undo, copy, then redo back to the present should leave the document unchanged.

[Realtime editing of ordered sequences](https://www.figma.com/blog/realtime-editing-of-ordered-sequences/):
- Each child's position is a fraction between 0 and 1;  insert by averaging the neighbours.
- Fractions are arbitrary precision, stored as strings.  They can grow, but not prohibitively in normal use.
- "Averaging between two identical indices doesn't work."
  The server prevents that by assigning a unique position to the second insert.

[Making multiplayer more reliable](https://www.figma.com/blog/making-multiplayer-more-reliable/) (2022):
- Each change gets a sequence number, per file.
- A full checkpoint every 30-60 seconds, plus a write-ahead journal;  95% of changes are persisted within about 600ms.
- Goal:  under 1 second of data loss.  Without the journal, a crash could lose up to 60 seconds.
- Clients send updates about every 33ms.

### Linear:  secondary sources only

- An official talk exists ([Scaling the Linear sync engine](https://linear.app/now/scaling-the-linear-sync-engine)),
  but its page doesn't give the mechanics.
- [Liveblocks' comparison](https://liveblocks.io/blog/understanding-sync-engines-how-figma-linear-and-google-docs-work):
  per-attribute change events, server-assigned increasing sync id, "conflicts resolve to the highest ID";
  CRDTs added later, only for issue descriptions.  It says the change structure comes from a community project.
- [The reverse-engineering repo](https://github.com/wzhudev/reverse-linear-sync-engine):
  last-writer-wins for updates;  transactions cached in IndexedDB and resent.
- [Fujimoto's write-up](https://www.fujimon.com/blog/linear-sync-engine) of Artman's talk:
  Artman, via a podcast:  "conflicts are actually not that common in Linear".
- Linear's own [offline docs](https://linear.app/docs/offline-mode), search snippet only (my direct fetch got a 404):
  offline is a failsafe, not a full feature;  the app doesn't check each change's creation date before updating.

The useful lesson, if those are right:  a real, large product runs on per-field last-writer-wins,
and pays for a CRDT only on long text.

### Replicache and Zero:  run the code twice, replay on top

[How Replicache works](https://doc.replicache.dev/concepts/how-it-works):
- A mutator is a named function.  Calling it changes the local view and records its name and arguments.
- Pending changes are "speculative" until the server applies them.  They're persisted "in case the tab closes".
- The client "rewinds" to the last server state, applies the server's patch, and replays pending changes,
  showing the result only once complete.
- A replayed change may do something different this time, e.g. the room is now booked.
- A "poke" carries no data;  it just says "pull soon".
- "Replicache embraces the application-specific nature of conflict resolution."

[Replicache's push rules](https://doc.replicache.dev/reference/server-push):
- Mutation ids are per client and sequential;  each is exactly one greater than the one before.
- Ids at or below `lastMutationID` are ignored (a safe retry).  Ids above `lastMutationID+1` are ignored too.
- "If a mutation is invalid or cannot be handled, the server must still mark the mutation as processed."
- "Temporary errors block synchronization and thus should be used carefully."

[Replicache's back-end strategies](https://doc.replicache.dev/strategies/overview):
- Reset:  each pull resends the whole view.  Easy, for small data.
- Per-space version:  easy, about 50 pushes per second per space.
- Row version:  "the hardest to implement".

[Zero's mutators](https://zero.rocicorp.dev/docs/mutators):
- A copy on client and server, often the same;  the server can add checks.
- A server throw skips the mutation and "the optimistic mutation on the client will be reverted".
- Separate promises:  `.client` (local write done), `.server` (server acknowledged).
- Up to 5 retries for database errors, and only safe for work inside the database:  emails aren't rolled back.

[Zero:  when to use it](https://zero.rocicorp.dev/docs/when-to-use):  "Zero doesn't support offline writes."
[Replicache's home page](https://replicache.dev/):  maintenance mode, successor Zero.

[Rocicorp on Reflect](https://rocicorp.dev/blog/ready-player-two), its name "Transactional Conflict Resolution":
- "In Reflect, the server is the authority."
- "Most CRDTs are good for one particular problem."
- Its example:  Yjs Map's per-key last-write-wins loses concurrent increments of a counter.

### Meteor:  the original of this idea

[Meteor methods](https://docs.meteor.com/api/meteor.html):
- A stub runs in the browser alongside the server call, "to simulate the result of what the server's method will do".
- "When the server responds, the client updates the local cache with the writes that actually occurred on the server."
- `stubPromise` and `serverPromise` split "shown" from "confirmed".
- A method in flight during a disconnect is re-sent on reconnect, unless `noRetry`.

### Convex:  transactions on the server, optimism by hand

- [Its concurrency control](https://docs.convex.dev/database/advanced/occ):  a transaction commits only
  "if every version in the read set is still the latest version of that record", else it re-runs itself.
  True serializability, no external side effects until commit:  "you never need to worry about temporary data races".
- [Optimistic updates](https://docs.convex.dev/client/react/optimistic-updates):  written by hand per mutation,
  re-run if local results change, "rolled back when a mutation completes".
  "The UI will always eventually render the correct values."

### Liveblocks:  Figma's model as a product

[Conflict resolution guide](https://liveblocks.io/docs/guides/how-conflict-resolution-works-in-liveblocks-sync):
- Last writer "means the last change to reach the server", so a faster connection can decide the result.
- List inserts are both kept;  the server decides the order.
- "`move` rewrites an item's position, and doesn't record an intention":  concurrent moves can produce an order neither chose.
- A trap to avoid:  edits to a replaced object "apply to your own copy, are never synced, and Liveblocks logs a warning".
  Your edit shows on your screen, and others may never see it.
- Conflict rules apply only to Storage, not Presence, Events or Feeds.
- [The blog on list order](https://liveblocks.io/blog/how-crdts-and-sync-engines-keep-realtime-lists-ordered-with-fractional-indexing)
  covers the same fractional-index ground (found by search, not read in depth).

### Firebase

- [Offline](https://firebase.google.com/docs/firestore/manage-data/enable-offline):
  "For multiple changes to the same document, it's last write wins."  Offline persistence is off by default on the web.
- [Listeners](https://firebase.google.com/docs/firestore/query-data/listen):  local writes fire them at once;
  `hasPendingWrites` says "local, not confirmed".
- [Transactions](https://firebase.google.com/docs/firestore/manage-data/transactions) fail offline;  batched writes queue.
- [Realtime Database](https://firebase.google.com/docs/database/android/offline-capabilities):
  transactions don't survive an app restart;  `onDisconnect()` removes presence, and can be cancelled.

### Rooms:  Durable Objects and PartyKit

- [Durable Objects](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/):
  single-threaded, a globally unique name, "strongly consistent" storage beside it, WebSocket hibernation.
  In-memory state resets on hibernation.  The page lists 1 GB SQLite storage today, 10 GB planned.
  So:  one referee per space, already shaped like this proposal.
- [PartyKit](https://docs.partykit.io/how-partykit-works/):  a room is one instance, on a Durable Object;
  every connection with the same id reaches the same room.
  [Cloudflare acquired it](https://blog.cloudflare.com/cloudflare-acquires-partykit) in April 2024.

### Yjs and Automerge:  what a full CRDT costs

- [Yjs's internals](https://github.com/yjs/yjs/blob/main/INTERNALS.md):
  deletes flag items;  with GC, content is dropped but a small `GC` record stays.  Clocks only grow.
  The document doesn't say state grows without bound;  the structure implies it does.
- [Yjs updates](https://docs.yjs.dev/api/document-updates):  commutative, associative, idempotent.
  `Y.mergeUpdates` works on the binary without loading a document, but doesn't garbage-collect.
- [Seph Gentle's benchmark](https://josephg.com/blog/crdts-go-brrr/) (260k edits, about 100k characters at the end):
  Yjs 0.97s and 3.3MB, against a plain JS string's 0.61s and 0.1MB.
  Automerge's preview then took 291s and 880MB, which Automerge has since fixed:
- [Automerge 3](https://automerge.org/blog/automerge-3/):  Moby Dick pasted, 700MB before, 1.3MB after.
  Still:  "we have to store a lot of metadata about changes".
- [Automerge conflicts](https://automerge.org/docs/reference/documents/conflicts/):
  for one key, a deterministic winner from the operation id, not the clock;  losers stay readable via `getConflicts()`.
  Even a full CRDT is last-writer-wins on a plain field.
- The real cost, my reasoning:  not speed any more, but metadata forever, a harder schema story,
  no place for rules ("only one person may take the seat"), and a loss of "the server says no".
  Rocicorp's counter example, above, is one instance.

### Ink & Switch

[Local-first software](https://www.inkandswitch.com/essay/local-first/):
- "Users surprisingly rarely encounter conflicts in their work when collaborating with others."
- Why:  tracking at a fine grain, and people "have an intuitive sense of human collaboration and avoid creating conflicts".
- "Conflicts arise only if users concurrently modify the same property of the same object."
- Servers can be "cloud peers", "in a supporting role, not the source of truth".  Spell's proposal differs here on purpose:
  the referee IS the source of truth, which is what allows simplicity and rules.

This supports the cheapest conflict tool of all:  **presence**.  Seeing "Ana is editing this" prevents the conflict.

### Text:  the hard case

- [ProseMirror's collab](https://marijnhaverbeke.nl/blog/collaborative-editing.html):  a central authority, integer versions.
  A change based on a stale version is rejected;  the client fetches, rebases its own edits, retries.
  It needs edits as steps with position mapping, not a bare string.
- [Fraser's differential sync](https://neil.fraser.name/writing/sync/):  each side diffs against a shadow copy,
  and sends fuzzy patches.  Self-healing:  checksum mismatch makes it start over.
  The costs:  diff is O(n²) in the change, one packet in flight, minimal diffs "can merge conflicting edits into nonsense",
  failed patches are backed out of the client's text.  A cycle of 1-10 seconds.
- [y-monaco](https://github.com/yjs/y-monaco):  a ready Monaco binding, with remote cursors.
- [Yjs awareness](https://docs.yjs.dev/getting-started/adding-awareness):  presence isn't in the document;
  deleted automatically when you go offline.

## 4. The proposal:  the protocol

All of this is my proposal, built from the above.

### What Spell generates

A person says a type is shared.  The rest is generated:

| Generated | From |
| --- | --- |
| browser-made ids | Figma |
| per-field change records | Figma, Linear |
| referee's copy + pending list + replay | Replicache |
| one heal routine | Figma's reconnect |
| fractional positions on lists | Figma |
| presence | Yjs awareness, Liveblocks |
| "saving / saved / couldn't save" status | Zero's two promises, Firestore's `hasPendingWrites` |

### Change records

```json
{ "changeId": "c7f2:41", "kind": "set",    "thing": "t9", "field": "title",    "value": "Buy milk", "baseSeq": 118 }
{ "changeId": "c7f2:42", "kind": "create", "thing": "t10", "type": "Task", "fields": { "...": "..." } }
{ "changeId": "c7f2:43", "kind": "delete", "thing": "t9" }
{ "changeId": "c7f2:44", "kind": "add",    "thing": "t3", "field": "score", "by": 1 }
{ "changeId": "c7f2:45", "kind": "text",   "thing": "t9", "field": "notes", "update": "<yjs bytes>" }
{ "changeId": "c7f2:46", "kind": "action", "name": "takeSeat", "args": { "seat": "s4" } }
```

- `changeId`:  the browser's id, plus a counter that goes up by one.  It's the idempotency key:  retrying is always safe.
- `baseSeq`:  the referee's number this browser had seen.  Not needed to decide;  useful for noticing "you overwrote Ana".
- Several changes from one action go up as one batch, and apply together or not at all.

### The round trip

1. **Browser:**  apply the change to what's on screen, add it to pending, save pending to local storage, send it.
2. **Referee:**  drop it if `changeId` was already seen.  Check permissions.  Apply it.  Give it the next `seq`.
   Append it to the log.
3. **Referee:**  send `{seq, change, from}` to everyone, the sender included.
4. **Browser:**  update its copy of the referee's state.  Drop the change from pending if it was its own.
   Redraw:  the referee's copy, with pending replayed on top.

Step 4 gives Figma's no-flicker behaviour without a special case:
my pending `set` on `title` simply wins on my screen until it's acked.

Then the two people's screens agree, one round trip after the second person's change reaches the referee.

### Healing:  three nets, one routine

The routine:  fetch a snapshot (or the changes since my last `seq`), replace my copy, replay pending.

| Trigger | Why |
| --- | --- |
| Opening a page, reconnecting | The normal way in (Figma) |
| `seq` jumps | I missed a message |
| Every 10-30s, or on tab focus:  compare the referee's `seq` and a checksum | Catches bugs, not only lost messages (Fraser's idea) |
| Change rejected | Replay without it |

Nothing else needs to be right for this to stay right, so bugs heal rather than pile up.

**How fast (my estimate, untested):**  a live room, one network round trip plus batching, usually well under a second.
Polling:  the poll interval.

## 5. Per kind of change

| Change | Sent as | The referee does | Two at once | What people see |
| --- | --- | --- | --- | --- |
| Set a property | `set` | last to arrive wins | One value wins, whole | Loser's value flips, once.  Never a blend. |
| Add to a list | `create` with parent + position | keeps both;  gives a new position if identical | Both kept | Items may shuffle slightly as order settles |
| Remove | `delete` | deleted;  a marker stays in the log | Idempotent | It disappears |
| Reorder | `set` of position, one item at a time | last to arrive wins per item | Each item lands somewhere | An order neither chose, but nothing doubled or lost |
| Number add | `add` | adds | Both count | Number jumps |
| Short text | `set` | whole value | One wins | One person's word is gone |
| Long text | `text` | relays and stores | Both kept, characters merge | Live typing from both |
| Checked action | `action` | re-runs the action | One may fail | Revert, plus a notice |

### Reorder:  parent and position are one field

As Figma does, so moving between lists is one atomic change.
Lists have no array anywhere:  a list is "the things whose parent is X, sorted by position".
So no doubling and no loss, by construction.

Use jittered positions, to reduce same-position collisions ([one jittered library](https://pypi.org/project/fractional-indexing-jittered/):
birthday-problem odds, reduced and not eliminated).
With a referee, collisions are settled anyway, the way Figma's are.
[Interleaving](https://vlcn.io/blog/fractional-indexing) remains:  two people each adding several at one spot can mix.

### Deletes and tombstones

- The referee keeps a marker ("t9 deleted at seq 200") in the log.
- Later changes to t9 get "gone" as their ack.
- Once the log is trimmed past that point, the marker goes too:
  anyone further behind gets a snapshot, not a log.  So no tombstones forever, unlike a CRDT.
- A snapshot is the whole truth, so it needs none.

### Delete something another person is editing

- Delete wins:  a delete beats a later edit, at the referee.
- **Never silently:**  Liveblocks' stale reference is the trap, where an edit shows on your screen and goes nowhere.
- The person editing sees it vanish, with a notice:  "Ana deleted this.  Restore?"
- Their browser still has the thing and their unsent changes, so Restore re-creates it, with the same id.
- The person who deleted gets Undo, the same way (Figma keeps it in the deleter's undo buffer).
- Children go with the parent:  no parent means not drawn.  A restore brings them back only if the referee kept them.
  To decide in design:  how long it keeps them.

### Long text

Three levels, and the type decides which:

| Field | Model | Why |
| --- | --- | --- |
| Short text (names, titles) | whole value, last wins | Same as Figma. |
| Long text, with a room | Yjs document for that field, its bytes in `text` changes | Linear reportedly does just this (issue descriptions) |
| Long text, no room | Version check, then a three-way merge on failure (below) | No live typing |

- The referee needn't understand it:  it stores and relays bytes, and `Y.mergeUpdates` compacts them.
- Load Yjs only on pages that have such a field.
- The editor's source text is the same case, as the earlier analysis recommended.
- Rejected:  our own text merge.  The earlier analysis estimated months of work.
  Fraser's fuzzy patches are simpler, but merge into nonsense sometimes, and silently back out failed edits.

### Rules:  the compiler picks, not the person

This is where Spell can do what a library can't.  It sees what each action reads and writes (my proposal, untested):

| Action body | Compiled to | Example |
| --- | --- | --- |
| Writes values it didn't read | plain `set` | "set the title to ..." |
| Adds to a number it read | `add` | "add 1 to the score" |
| Checks something, then writes | `action`, re-run on the referee | "if the seat is free, take it" |

- The middle row fixes Rocicorp's lost-counter example.
- The last row is Replicache's model, used only where needed.
- It needs a referee that can run the action.
  A generic room can't;  a Spell server (or generated code on one) can.
- Without one:  the check happens only in the browser, so it isn't a guarantee.  Spell should say so at compile time.

## 6. What needs a server, and what a back-end without one gets

| Back-end | Live? | Healed by | Same field | List add | Long text |
| --- | --- | --- | --- | --- | --- |
| **Room** (Spell server, Durable Object, python-target program) | yes | broadcast | last wins | both kept | Yjs |
| **Hosted sync** (Firestore) | yes | its listeners | last wins | both kept | no merge from Firestore alone |
| **REST with versions** (ETag + If-Match) | poll | version check | three-way, then mine wins, with notice | both kept, if POST | three-way merge |
| **Plain REST** (no versions) | poll | poll | last PUT wins, whole record | both kept, if POST | last PUT wins:  **loses text** |
| **Files, via one Spell server** | yes:  it's a room | as room | as room | as room | as room |
| **Files, no server** | no | re-read on focus | last save wins | whole-file | one person at a time |

### REST with versions:  the sketch

The HTTP standard's name for this problem is the same:
[If-Match](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.1) exists "to prevent accidental overwrites when multiple user agents might be acting in parallel"
(i.e., "the 'lost update' problem").

1. **Reads:**  poll with `If-None-Match` every 2-10s, and on tab focus.  A 304 costs almost nothing.
2. **Writes:**  send with `If-Match: <version I saw>`, keep it in pending, show it.
3. **On 412 (someone else changed it):**
   - Fetch the latest.  Keep three copies:  what I started from, theirs, mine.
   - A field only they changed:  take theirs.  A field only I changed:  send mine.
   - A field both changed:  mine wins, and I get a notice;  or, for long text, a three-way text merge.
   - Retry, a few times.
4. **Retries after a lost connection:**  an `Idempotency-Key` where the API has one, or browser-made ids with PUT.
   The key's semantics are in [the IETF draft](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header)
   (409 while the first is running, 422 for reuse on a different payload;  still a draft) and [Stripe's docs](https://docs.stripe.com/api/idempotent_requests).
5. **Deletes:**  a 404 or 410 on a poll means it's gone:  the same notice as above.

The client's code stays the same:  referee's copy, pending, replay.  Only the transport and step 3 differ.

No If-Match?  **Then lost updates are real**, and Spell should warn at compile time for shared types.
PATCH of changed fields narrows it to per-field;  PUT of a whole record loses other people's fields.

Lists on REST:  a position field works only if the API will store one.

### Added 2026-10-31:  Airtable as a shared back-end

Airtable is one of epic `data`'s seven back-ends (Owen, 2026-10-31).
It lands between section 6's two REST rows:  a PATCH per field like the row with versions, but no version check, like plain REST.

| Back-end | Live? | Healed by | Same field | List add | Long text |
| --- | --- | --- | --- | --- | --- |
| **Airtable** (PATCH per field, no versions) | poll, through a server side | poll | last save wins that field, silently | new records both kept;  **a link list can lose one** | last save wins:  **loses text** |

**Two people editing one record**
- A PATCH "will only update the fields included in the request";  a PUT "will perform a destructive update and clear all unincluded cell values".
  [Update multiple records](https://airtable.com/developers/web/api/update-multiple-records)
- That page mentions no version, ETag or conflict check, and neither did a search of Airtable's docs and forum.
  So compare-and-set isn't there, as far as I can find.
- Last save wins per field is my inference:  **no page I read states what happens to two simultaneous writes.**
- Different fields of one record:  both survive, with PATCH.  Spell must never send PUT here.
- Step 3 of the sketch above can't run, because no 412 ever comes.  A client could read just before writing, which narrows the window and doesn't close it.
- A link field is written as a whole array of record ids, [per its field model](https://airtable.com/developers/web/api/field-model).
  So two people adding a link at once can drop one (my inference).
  [One forum report](https://community.airtable.com/automations-8/automation-logic-conflict-data-loss-when-merging-25-linked-record-lists-46793) describes this with automations, unconfirmed by Airtable.
  Creating the child record with its one parent link avoids it.

**How a client hears changes**
- Webhooks:  a ping with no data, then you fetch payloads.  At least once, so repeats happen;  rapid changes may be combined.
  They expire after 7 days unless refreshed, and "Client-side requests are not allowed."
  [Webhooks overview](https://airtable.com/developers/web/api/webhooks-overview)
- Payloads are kept for a week, 50 to a request, numbered by a cursor that never resets, and they name who made the change, so a client can skip its own echo.
  [List webhook payloads](https://airtable.com/developers/web/api/list-webhook-payloads)
- A browser can't receive a webhook, so a browser alone can only poll.
- Polling for changes only:  `filterByFormula` with `LAST_MODIFIED_TIME()`, from [Airtable's support pages](https://support.airtable.com/articles/6644451618-returning-record-data-in-airtable) and forum answers.
  It tracks people's edits to editable fields, not computed fields, and older records can be blank.
  **A deleted record never matches, so finding deletes takes a full list now and then** (my reasoning).

**Rate limits against the 2-10 second poll**

5 requests a second per base, shared by everyone;  over that, a 429 and 30 seconds of failures.
[Rate limits](https://airtable.com/developers/web/api/rate-limits)
A list is at most 100 records a page.  This is arithmetic, not a measurement, with no room left for writes:

| Each browser polls | Whole table of up to 100 records | Whole table of 1,000 records (10 pages) |
| --- | --- | --- |
| every 2 seconds | 10 open tabs | 1 open tab |
| every 10 seconds | 50 open tabs | 5 open tabs |

- The 304 that makes REST polling cheap in the sketch isn't described in anything I read, so assume each poll costs a request.
- Changes-only polling makes the 1,000-record column look like the 100-record one, until the delete sweep.

**Does it need a referee in front?**

It needs a small server side in any case, and a full referee only for the healing model to hold.
This is my judgement, and untested.
1. **The key:**  a browser can technically call the data API (I probed the preflight:  `access-control-allow-origin: *`), but a personal key "should not be shared", and OAuth's token step can't happen in a browser yet.
2. **Reads:**  one shared poll, about every 10 seconds, passed on to every browser, or a webhook ping to trigger it.  The tab count stops mattering.
3. **Writes, the choice:**
   - **Passed straight through:**  last save wins that field, silently.  Warn at compile time, as plain REST does.
   - **Through a referee:**  the server side orders saves and heals as a room does (section 6, "Files, via one Spell server").  Airtable is then only where it's stored.
4. **What a referee can't catch:**  people editing in Airtable's own window.  Those arrive at the next poll, and the last save wins.

**What people would see**
- Two people change one field:  one value flips, up to a poll later, and nobody is told unless the referee is there.
- Long text:  one person's paragraph is gone, with no notice.  That's stable but wrong, row 2 of section 8's table, and only a text merge in front would help.
- Past the limit:  every save and read fails for 30 seconds.  The app must say so, and hold pending changes.
- A retried create with no id column makes a double.  An id column plus upsert (`fieldsToMergeOn`) prevents it.

**What I couldn't verify** (looked again 2026-10-31, for epic `data` P19, with these two still not stated on any page:  [Update multiple records](https://airtable.com/developers/web/api/update-multiple-records) has no version, ETag or conflict field;  the manual test, epic `data` M2, tries the first)
1. What Airtable does with two simultaneous writes to one field.
2. That no version check exists at all:  absence from the pages read and from one search.
3. A 304 or ETag on its list requests.
4. Whether two simultaneous link writes really lose one:  an inference and one forum report.
5. `LAST_MODIFIED_TIME()` in the API reference:  support pages and forum only, and its precision wasn't found.
6. What a webhook payload holds beyond the example's fields:  the payload model page wasn't read.
7. Whether Airtable's own window sees API changes at once, and how fast either sees the other.
8. All the rates above:  nothing was run against Airtable.

Background Sync can't be counted on:
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API) says it isn't Baseline.
So unsent writes wait for the next visit.

## 7. Transactions and cancelling

### What "transaction" should mean here

An action is a transaction:
- Its writes go on screen at once, as one group in pending.
- They're SENT only when the action finishes (my proposal).
- So until then, cancelling is real:  drop the group and replay.  Nothing ever left.

Beyond that, a form with Save and Cancel is a draft:  nothing's sent until Save.
That's most of what people mean by "cancel".

### Read cancel and write cancel are different things

A read cancel is free.  A write cancel depends on where the write is:

| Where it is | Cancel means | Certain? |
| --- | --- | --- |
| **A read, in flight** | [abort](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) it;  nothing changes | yes (a server may keep working:  wasted, harmless) |
| **A write, in an unfinished action or draft** | drop it, replay | yes:  it never left |
| **A write, pending, not sent** | drop it, replay | yes |
| **A write, sent, no answer yet** | can't.  Aborting only stops listening | **no:  outcome unknown** |
| **A write, acknowledged** | a new change that reverses it | it's undo, others may have built on it |

The fourth row is the important one.
- MDN says `abort()` rejects the browser's promise, and says nothing about the server.
  So the point that a POST may already have landed is my reasoning from how HTTP works, not a quote.
- So once a write has been sent, Spell shouldn't offer it as "cancelled".
  The browser resends it with the same `changeId`, or asks, until it knows.
  Only then can it send a reversal.
- [Stale reads have one more trap](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates):
  cancel outgoing refetches before an optimistic write, so an old response can't overwrite it.
  With the replay model this holds by construction, since a late response goes under pending.

### Undo is compensation, and it isn't exact

- Undo is a new change:  set the old value back, re-create what was deleted.
- It should only touch what's still mine:  if Ana changed that field since, undo skips it and says so (my proposal).
- Figma's test:  undo, copy, redo back to the present leaves the document unchanged.
- External side effects can't be undone:  a sent email stays sent ([Zero's warning](https://zero.rocicorp.dev/docs/mutators)).
  So side effects belong after confirmation, on the referee.

### Navigating away

| What's running | In-app navigation | Tab closes |
| --- | --- | --- |
| Reads for the old page | abort | gone anyway |
| Finished action, writes pending or sent | **keep going:  never cancelled** | saved pending resends next visit |
| Unfinished action, waiting on a read | cancel;  nothing was sent | gone, nothing was sent |
| Draft form | kept, restored on return;  Cancel discards | kept locally |
| Failed write, its page gone | app-wide notice:  "Couldn't save X.  Retry / Show me" | notice on next visit |

The rule:  **navigating never cancels what the person asked to happen.**  It cancels what the page was doing FOR them.
- An action cut off mid-way is safe to drop only because its writes hadn't left (above).
- A person who clicks Delete and moves on means Delete.
- Keeping drafts follows Owen's standing rule that UI state stays the same across page moves.
  Whether a draft should survive by default is a design call for the epic.

Getting a write out as the page dies:
- [`keepalive`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit):  the browser won't abort if the page unloads;  64 KiB limit.
- [`sendBeacon`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon):  POST only, no response, same size limit.
- [`visibilitychange` to `hidden`](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event)
  "is the last event that's reliably observable".
- These are best effort, so saved pending plus the `changeId` is what actually guarantees it (Replicache's approach).
  If both land, the second is ignored.

### Offline queues

- Keep pending across reloads;  resend on reconnect, in order.
- A permanently failing change must be marked done and dropped, or it blocks everything behind it (Replicache's rule).
- Old changes win by arriving last, which is the risk (row 8 below).
- Scope is a choice:  Zero has no offline writes, Linear calls it a failsafe, Figma embraces it.
  Recommend the failsafe level:  survive a dropped connection and a reload, not weeks of independent work.

## 8. Where it breaks, and what people would see

| # | Situation | What people see | Heals? | Mitigation |
| --- | --- | --- | --- | --- |
| 1 | Same field, same moment | My value flips to Ana's | yes;  **my value's lost** | Presence.  Optional history from the log. |
| 2 | Long text as a plain field | **A whole paragraph gone** | yes, wrongly | Type must be long text;  a compile warning without a room |
| 3 | A counter written as `set` | One increment lost | yes;  wrong number | Compiler emits `add` |
| 4 | Last seat, no referee rule | Both see "yours" | **no:  both believe it**, on REST | Server rule, or a compile warning |
| 5 | Last seat, with a rule | My booking reverts | yes | Notice |
| 6 | Two valid fields, invalid together (start and end dates) | A nonsense combination | no | Group as one field, or a checked action |
| 7 | Concurrent moves | An order nobody chose | stable, not "right" | Accept |
| 8 | Offline edits land late | My hour-old value overwrites newer work | yes;  **others' work lost** | `baseSeq` makes it detectable:  notice or ask |
| 9 | Editing a thing someone deleted | It vanishes, notice, Restore | yes | Notice |
| 10 | Tree cycle by two moves | Items briefly disappear | yes | Referee rejects it |
| 11 | Multi-item adds at one spot | Items interleave | stable | Accept |
| 12 | Faster connection always wins | Slightly unfair | n/a | Accept |
| 13 | I navigate on a create that's later rejected | The page I'm on goes away | yes | Notice, return |
| 14 | Undo after others' changes | Undo partly skips | yes | Say which |
| 15 | Old app version sends an unknown field | Rejected, or wrongly applied | **needs design** | Version in hello, force a reload |
| 16 | Someone tampers in the browser | Bad data, unless checked | no | The referee checks permissions.  A generic room needs generated rules. |
| 17 | Busy space | Lag, then all changes at once | yes | One referee per space, not per app |
| 18 | Referee crashes | Up to a moment's changes lost, except pending are resent | mostly | Journal (Figma's goal:  under 1s) |
| 19 | Same person, two tabs | Behave as two people | yes | Good enough;  Replicache shares one local store |

Rows 2, 4, 6 and 8 are the ones that DON'T match "wonky, then heals":  they end stable but wrong.
Those need the type system or the compiler, not the sync.

## 9. What I couldn't verify

- **Linear:**  no primary technical source.  Everything's from Liveblocks' comparison, a reverse-engineering repo, an HN comment and a talk write-up.
  Its docs page gave a 404 to my fetch;  I have its text only from a search snippet.
- **Google Docs:**  Liveblocks gives no primary source;  I didn't rely on it.
- **PartyKit's Yjs layer:**  not read.  Durable Object limits may have changed (the page's own "1 GB now, 10 GB planned").
- **Abort and the server:**  neither MDN page says what happens to a POST at the server.  The fetch standard's relevant part wasn't read in full.  It's reasoning from HTTP.
- **Rocicorp:**  the Reflect post is the source for its rebase case.  I didn't check whether Reflect is still offered.
- **Automerge merge rules page:**  404;  used its conflicts page.
- **TanStack:**  nothing I found states that in-flight mutations can't be aborted.
- **Fractional index interleaving:**  from a secondary blog;  I didn't read the Fugue paper.
- **Untested:**  all timing in section 4, and the compiler's sorting of actions in section 5.  No prototype was built.
  The sort is the riskiest idea here:  "checks something, then writes" needs reliable analysis of Spell's action bodies.

## 10. Questions for the epic

1. **Does the first version include a room?**  Recommend yes for live, and the REST path as the same client code with polling.
2. **Long text:**  Yjs for that field, as the earlier analysis picked?  Recommend yes, loaded only where used.
3. **Delete:**  does delete beat a later edit?  Recommend yes, with Restore.
4. **Mid-action sending:**  hold an action's writes until it finishes?  Recommend yes:  it's what makes cancel real.
   The cost:  a long action's writes reach others late.
5. **Offline depth:**  failsafe only?  Recommend yes.
6. **Compile-time warnings** for shared types on a back-end that can't honour them?  Recommend yes.
