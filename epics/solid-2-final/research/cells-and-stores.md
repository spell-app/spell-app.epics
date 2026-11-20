# Cells, stores and drafts:  can Spell keep ONE copy of its state?

Research notes for epic `solid-2-final`'s "Solid 2 analysis" page (agent `solid-2-final-cells`, 2026-11-20).
- Owen's question:  "Is there a way we can lean into 'Solid drafts' more?  Can we use stores more efficiently?
  Any way we can get rid of the 'Cell' concept that we use for local 'update model immediately so Spell sees the new
  values right away' while maintaining a separate copy for Solid's reactivity?"
- Read from the worktree `~/www/spell.worktrees/solid-2-final` (Solid `2.0.0-rc.21`), and run against
  `solid-js` / `@solidjs/signals` 2.0.3 too, unpacked from `npm pack` into a folder of their own (never installed).
- Every experiment was run, and its output is pasted in section 6.
  - The scripts:  [cells-scripts/](cells-scripts/), each with its run line at the top.
  - They import `@solidjs/signals` by path (what `solid-js` re-exports), and the kit's cells through `tsx`.
- The machine was busy throughout:  load average 16 to 60 on 14 cores (`uptime`).
  Timings are medians;  read them as ratios, not as absolute numbers.
- `(inferred)` marks a guess;  everything else was read in code or measured.

## 0. The answer in one screen

- **There is no second copy of a value today.**
  - A spell value lives in ONE place:  its object's record, a `Map` (`src/util/reactive/extend.ts`, `PROPS`).
  - A `Cell` holds no value:  only who read it and a version number (`src/util/reactive/Cell.ts`).
  - What IS doubled is the bookkeeping:  Spell keeps its own "who read what" graph, and Solid keeps its own.
    They're joined by the bridge, `bridgeSolid()`:  every Solid computation on the page gets a cells reader
    (`Reaction`), and Solid adds a signal of its own to each one.
  - Spell UI's members are the same shape:  a record holds the value, and a Solid signal with NO value tells Solid
    it changed (`src/element/Reactive.ts`, `Notifier`).
  - Real second copies exist only where they're meant to:  `tracked()`'s memo in the editor (71 uses), a waited value
    (`createDeferred`), a derived value's cache.
- **Solid 2 still can't give read-after-write**, on rc.21 and on 2.0.3 alike (every experiment printed the same):
  - a signal or store read right after a write gives the OLD value:  at top level, in an event handler, in an
    effect's apply, and for a whole Solid action, even after a `yield`
  - only three things see a write before the flush:  a setter peeking at its own draft, a computation running inside
    the flush, and `snapshot()` of a store
  - `snapshot()` is the near miss:  it's untracked, copies what was written, and goes stale after an action's first
    `yield` and whenever a write is held with async work
  - `flush()` can't stand in:  it throws inside an action, does nothing inside an effect, and can't land a write held
    with async work
- **So the record stays the truth.**  None of the five ways to make a Solid store the model keeps
  `set x to 1;  print x` printing 1 everywhere a Spell program runs, and the two that come close cost 20 to 30 times
  more per write and read (section 3).
- **What CAN change, ranked** (section 5):
  1. Make the bridge cheaper:  today every Solid computation on a Spell page pays about 1.3 KB and 3 to 5 times the
     time to create, even one that reads no cell.  Making the `Reaction` only when a cell is first read saves Spell's
     share, about 0.55 KB of it (inferred:  not built).
  2. Lean into Solid's TRANSACTIONS, not its stores:  run a Spell action inside Solid's `action()`, and the screen
     holds until the action ends while the program still reads its own writes at once.  Measured:  the program read
     1, 1, 1;  the screen went `000` straight to `111`.
  3. Use stores where nothing needs read-after-write:  the editor's own UI state, `PageStore`, selection in long lists
     (`createProjection`:  only the two changed rows re-ran).
  4. Nested JSON a program holds:  make it reactive through cells (a proxy), not a Solid store.
  5. One engine for Spell UI and spell cells.

## 1. Everything a cell does today

The value, and what keeps it:

| Job | Where | What it is |
| --- | --- | --- |
| Holds the value | [extend.ts](../../../../src/util/reactive/extend.ts) lines 35, 112, 163 | a `Map` per object (`PROPS`), read and written synchronously;  the ONLY copy |
| Read-after-write | `storeProp()`, extend.ts line 163 | the record is written before anyone is told;  an `===` write is skipped, nobody told |
| Who read what | [cells.ts](../../../../src/util/reactive/cells.ts) lines 47, 64;  `cellOf()`, extend.ts line 508 | a cell per prop, made on its first TRACKED read;  holds `subs` and `version`, no value ([Cell.ts](../../../../src/util/reactive/Cell.ts)) |
| Telling Solid | [bridges.ts](../../../../src/util/reactive/bridges.ts) line 27 | `bridgeSolid()`:  Solid's `enableExternalSource` wraps EVERY computation on the page in a `Reaction` ([Reaction.ts](../../../../src/util/reactive/Reaction.ts) line 22);  Solid adds a trigger signal to each (`@solidjs/signals`' `core/external.js`, `wireExternalSource()`) |
| Never waking a reader for its own write | `Reaction.mark()`, Reaction.ts line 44 | a drawing or getter that writes what it read runs once, not forever;  pinned by `tests/util/reactive/cells.test.ts` line 93 |
| Writes inside Solid computations never throw | (cells aren't Solid signals) | pinned by `app/tests/app/solid/cellsBridge.browser.test.tsx` line 263 |
| Derived values with an equality cutoff | [Derived.ts](../../../../src/util/reactive/Derived.ts) line 21;  cells.ts lines 152, 182 | push-pull (clean, check, dirty);  a reader of a derived value hears on a microtask, and only if its value moved;  `flushCells()` settles it |
| Keys in the order first set | `keysOf()`, extend.ts line 249 | one more cell, for the key SET |
| Types | [Schema.ts](../../../../src/util/reactive/Schema.ts) lines 76, 116;  `PropRules.ts`;  [decorators.ts](../../../../src/util/reactive/decorators.ts) | declared types win, undeclared ones are observed and widened;  `@prop`, `@state`, `@derived` |
| Defaults, and asking for what's missing | `getProp()`, extend.ts line 112;  `PropInfo.whenUnset`, Schema.ts line 276 | a declared default or `init`;  a field a place left out asks the place again when read |
| A read that only SHOWS a value | `whileOnlyShowing()`, cells.ts line 92 | a drawn view mirroring its thing as attributes (`app/src/app/runner/SpellElement.tsx` line 1630) doesn't count as needing the value |
| "Worked out from" | `sourcesReadBy()`, cells.ts line 114;  `cellsOf()`, extend.ts line 85 | `Places.originOf()` (`src/places/Places.ts` lines 372, 435) and the core's places (`parser/src/core/places.ts` line 761) ask what a value came from |
| Plain code following state | `observe()`, bridges.ts line 66 | `FileStates` (`app/src/app/ui/codemirror/FileStates.ts` line 433), `CodeMirrorSetup.ts` line 213 |
| ONE context per page | cells.ts lines 26-32 | every `spell-runtime.js` copy shares the "who's reading" slot and the checks, on `globalThis` |

What is NOT in cells, but rides on the same writes:

| Job | Where | How |
| --- | --- | --- |
| Undo, a cancel's put-back, a program running elsewhere, a place's write, `when it changes` | `noteSetting()`, `noteItems()` in [core.ts](../../../../parser/src/core/core.ts) lines 100, 212 | called by `Thing.setProp()` ([Thing.ts](../../../../parser/src/core/classes/Thing.ts) line 131) and `List.writeItems()`, BEFORE the record is written:  each hears the value it `was` |
| Kept across runs | `rememberSetting()`, Thing.ts line 133 | a prop declared `remembered` |
| Async values | `core.waitedValue()` (`parser/src/core/waiting.ts`) | Solid's `createDeferred()`, not a cell ("No async in cells", the Solid 2 guide) |
| A place's rows | [PlaceCache.ts](../../../../src/places/PlaceCache.ts) | each field a getter / setter over `getProp()` / `setProp()` |
| The Inspector | `app/src/app/solid/InspectorData.ts` line 242 | a lone `Cell` says a sample was swapped in;  the Thing Explorer reads `keys()` |
| Spell UI's members | [Reactive.ts](../../../../src/element/Reactive.ts) lines 745, 860, 976 | its own engine:  `record.values`, a value-less Solid signal per member (`Notifier`), a self-tracking `DerivedCache`;  an owned-scope write's signal is set a microtask later |
| `E.Cell` | [src/element/Cell.ts](../../../../src/element/Cell.ts) | a DIFFERENT thing with the same name:  a Solid signal as an object (24 uses, epic pages' layout, the brand) |

Where a second copy of a value really is kept:
- `tracked(read)` ([app/src/app/solid/tracked.ts](../../../../app/src/app/solid/tracked.ts)):  a Solid memo boxing what
  `read()` returned, so it's staged:  "right after a write, the accessor still has the old value".  71 uses.
- A waited value:  `createDeferred()` lags by design.
- A `@derived` cache, either engine's:  a computed copy, by design.
- No plain prop has one.

## 2. What Solid 2 does on read-after-write

Every row was run on rc.21 and 2.0.3, dev and production builds:  all four printed the same, except one row (6e)
and the dev warnings.  The ids are the experiments' (section 6).

| Where the read happens | A signal | A store |
| --- | --- | --- |
| Right after the write, at top level or in an event handler | old (1a, 1i) | old (2a) |
| `latest(...)` | old (1b) | old (2b) |
| `untrack(...)` | old (1c) | -- |
| The setter peeking:  `setX(p => ...)`, or a second draft setter | new (1e) | new (2d) |
| `snapshot(store)` | -- | **new** (2c):  the only public read that sees it |
| After `flush()` | new (1f) | new (2f) |
| Inside `flush(fn)` | old until `fn` returns (1g) | -- |
| Inside an effect's apply | old (1j);  `flush()` there does nothing, `FLUSH_IN_EFFECT_CALLBACK` (4b) | -- |
| Inside a memo's compute | new, with `ownedWrite: true` (1k) | the write throws `REACTIVE_WRITE_IN_OWNED_SCOPE` (4a):  stores have no `ownedWrite` |
| Inside a Solid action, before its first `yield` | old (1l) | old;  `snapshot()` new (2n, 10) |
| Inside an action, after a `yield` | old (1m) | old, and `snapshot()` old too (10) |
| `flush()` inside an action | throws `FLUSH_IN_ACTION` (4c) | -- |
| In the same setter as a write that feeds pending async, after `flush()` | -- | old;  `snapshot()` old;  `latest()` new;  `isPending()` true (5b-5e) |
| ... in another setter of the same batch | -- | old (5g) |
| ... in a later flush | -- | new (5h) |
| A memo made right after the write | -- | old (9a), while `snapshot()` says new (9b):  two readers disagree |

What else the store experiments showed:
- A store never writes to the object it was given:  the first write copies it, and every object above it (2e, 2g).
  - Its source says so:  "the committed backing is owned raw (CoW:  a user object is shared until the first write
    privatizes it)", `store/store.js`'s header.
  - And `snapshot()` is meant to see the pending writes:  "Sees the pending backing (R27)", `store/store.js` line 2182.
- A class instance in a store is copied on write too:  `card.rank` stays `"ace"`, while the store shows `"king!"`
  through the class's getter (6c, 6d);  `store.card === card` is false (6a).
  - `markRaw(Card)` keeps every instance out of the store, on 2.0.3 only (6e).  Then it isn't reactive either.
- 200 nested writes in 101 setters, one flush:  ONE effect re-run (8a).
- No structural sharing across versions:  each `snapshot()` copies every written record again, even with no write
  between two of them (8c-8e).  An undo built on snapshots would copy, not share.
- A projection over a selection re-ran only the two rows that changed:  1 and 3 re-ran, 2 didn't (7c).
- An optimistic store's guess shows on screen during the action, and goes back when it settles (3a-3f).

Why that forced cells, then and now:
- Spell is imperative:  `set the score to 5` then `print the score` must print 5, in a click handler, in a
  drawing, in the middle of an action that waits.
- Solid 2 has no read that sees a write where Spell code runs, except `snapshot()`, and that fails in two of them
  (after a `yield`, and beside async work).
- `flush()` per statement can't be the fix:  three of the places Spell code runs refuse it or ignore it.
- And Spell's drawings may write (cells allow it);  a store written there throws in dev.
- The Solid 2 guide's §2 found the same on rc.11 and rc.13 (`spell.epics/guides/solid/solid-2.html`, "What Solid 2
  actually does").  Nothing in the releases since changed it.

## 3. The ways to have one copy

The benchmark (`bench.mts`), medians of 3 rounds, each the median of 7 runs, 20,000 things of 3 fields, production
builds:
- `construct`:  make 20,000 things
- `loop`:  200,000 "write, then read it back" pairs, nothing drawn
- `mount`:  one drawn reader per field (60,000 render effects)
- `loopDrawn`:  the same 200,000 pairs with everything drawn, then one flush
- `update`:  write each thing once, then flush:  the screen catching up
- stale reads:  how many of the 200,000 reads didn't see the write just made

BENCH_TABLE

Memory (`memory.mts`), bytes, 50,000 things of 3 fields, then one drawn reader per field:

| Model | Per value | Per drawn reader |
| --- | --- | --- |
| plain fields, nothing reactive | 19 | 449 (Solid's render effect alone) |
| spell cells today | 88 | 2,041 |
| Spell UI's record + a value-less signal per field | 51 | 866 |
| a Solid signal per field | 363 | 522 |
| a Solid store per thing | 177 (2.0.3:  180) | 719 |
| plain fields, the cells bridge installed | 19 | 1,788 |
| plain fields, Solid's external-source wiring alone (a factory that does nothing) | 19 | 1,235 |

- The last two rows are the bridge's tax on a computation that reads NO cell:  Spell UI's, the editor's own.
  - +1,339 bytes each:  +786 is Solid's own wiring, +553 is Spell's `Reaction`.
  - Time (`bridgeTax.mts`, 60,000 render effects):  BRIDGE_TAX
  - perf-code.md listed this as "Every Solid computation wrapped by a spell-cell `Reaction`", cost **M**, inferred;
    now measured.
- 2.0.3 and rc.21 gave the same memory to the byte, but for the store row.

### (A) The store IS the model;  Spell reads the pending value

```ts
// a compiled Thing, on a store:  writes through the draft, reads fresh outside a computation
class Card extends Thing {
  [STORE] = createStore({ rank: "ace", suit: "spades" })
  get rank() {
    const [store] = this[STORE]
    return getObserver() ? store.rank : snapshot(store).rank
  }
  set rank(value) {
    this[STORE][1]((draft) => {
      draft.rank = value
    })
  }
}
```

- What a program sees:  `set rank;  print rank` prints the new rank in a click handler.
  But inside an action, after its first wait, it prints the OLD rank (experiment 10);  and the same beside a read of
  a place that's loading (5c).
- What the editor sees:  a drawing made right after a write shows the old value until the flush (9a).
- Cost:  `store-snapshot`, about 20 times today's cells for write-then-read (`loop`).
- Breaks:
  - read-after-write inside actions, and beside async work
  - `===`:  a Thing inside another's store is copied on its first write (6c), unless its class is `markRaw`'d, and
    then it isn't reactive
  - drawings that write state:  a store write in a memo throws in dev (4a)
  - `keys()` order, the schema, `whenUnset`, `sourcesReadBy()`:  all to rebuild on store paths (inferred)
- Effort:  L, for less than today.  Not recommended.

### (B) A store, flushed at each Spell statement or wait

```ts
set rank(value) {
  this[STORE][1]((draft) => {
    draft.rank = value
  })
  flush() // per statement:  costs a whole flush;  per wait:  stale until then
}
```

- What a program sees:  right after each statement, if it's flushed per statement.
  Flushed per wait instead, 198,000 of 200,000 reads were stale (`store-flush100`).
- Cost:  per statement, about 30 times today's `loop`, and every drawn reader re-runs once per statement, not once
  per tick (`store-flush`, `loopDrawn`).
- Breaks:  `flush()` throws inside a Solid action (4c), does nothing inside an effect (4b), and can't land a write
  held with async (5b).  A program's write in a drawing throws (4a).
- Not recommended.

### (C) Plain objects as the truth, Solid following by projection

```ts
// a projection re-runs when what it READ changes:  a plain object never says so
const shown = createProjection((draft) => {
  draft.rank = card.rank // card is plain:  nothing tells the projection to run again
})
```

- A plain object can't tell Solid it changed.  Something must:  a version signal per object or per field.
  That's (D1) below, with the projection on top.
- A projection re-derives its whole function per change, then reconciles by key:  O(fields) per write (inferred).
- Collapses into (D1).

### (D1) Cells kept, the bridge gone:  each cell holds a value-less Solid signal

```ts
// prototype:  cells-scripts/slim.mjs.  The record keeps the value;  Solid tracks the cell's own signal.
class Cell {
  version = 0
  signal?: Signal<undefined>
  read() {
    linkPlainReader(this) // observe(), sourcesReadBy(), derived values:  the cells' own collector, as today
    if (solid.getObserver()) (this.signal ??= solid.createSignal(undefined, { equals: false, ownedWrite: true }))[0]()
  }
  changed() {
    this.version++
    this.signal?.[1]()
    wakePlainReaders(this)
  }
}
```

- This is Spell UI's design (`Notifier`), with today's push-pull for derived values and plain readers.
  - Solid is handed in, as today (`useSolid()`):  `spell/util` still imports none.
  - A derived value keeps the equality cutoff with a signal of its own, set after a microtask check.
- What a program sees:  the same as today (`slimCheck.mjs`, checks 1-7 and 10-13).
- Cost:  the fastest model with read-after-write (`slim`, `notifier`):  about 2 to 5 times quicker than today, and
  866 bytes per drawn reader against 2,041.  Computations that read no cell pay nothing.
- Breaks, measured:
  - a drawing that writes a value it just read runs FOREVER on 2.0.3:  `RangeError:  Invalid array length` inside
    Solid's flush (check 9).  On rc.21 it ran once.
  - Why:  2.0's fix "a pass's owned write to a signal it just read is a missed wake (S4)" now re-wakes it;
    one signal per cell can't wake the other readers and skip the writer.
  - Today's cells don't have the problem, on either version (`cellsCheck.mts`):  each `Reaction` ignores changes made
    while it runs.
- What it would take:  a guard, e.g. a dev warning and one deferred wake, accepting that a drawing which writes a new
  value every time it runs loops (inferred:  not prototyped).  Spell UI lives with the same today (its writes in a
  render are deferred, and lint-guarded).
- Effort:  M.  Worth it only with the one-engine work.

### (D2) Cells kept, a cells reader made only where a cell is read, no `enableExternalSource`

- Tried (`lazy.mjs`):  it CAN'T see where a computation's run starts.
  - Solid 2 runs a computation's previous `onCleanup` AFTER its next compute (`cleanupOrder.mjs`).
  - So the reader forgot what the new run read:  after its first re-run, it never re-ran again (check 7:  2 runs, not 3).
- Only `enableExternalSource` gives the start of each run.  Dropped.

### (D3) Cells as today, the `Reaction` made on a computation's first cell read

```ts
// bridges.ts:  the factory still wraps every computation (Solid's share stays), but Spell's reader is made lazily
solid.enableExternalSource({
  factory(compute, trigger) {
    let reaction: Reaction | undefined
    return {
      track: (previous) => {
        if (reaction) return reaction.run(() => compute(previous))
        // a stand-in collector:  turns into a Reaction on the first linkCell()
        return collectLazily(() => compute(previous), () => (reaction = new Reaction(trigger)))
      },
      dispose: () => reaction?.dispose()
    }
  },
  untrack: untrackCells
})
```

- What a program sees:  nothing changes.
- Cost:  saves Spell's share of the tax on computations that read no cell, about 553 of 1,339 bytes, and the
  `Reaction`'s part of the time to create one (inferred:  not built;  the "nothing" factory's floor is measured).
  Solid's share stays, as long as any external source is registered.
- Breaks:  nothing, if the stand-in collector is right (inferred).  The bridge's tests pin the rest.
- Effort:  S.

### (E) Spell UI's members on stores

- No:  `this.isOpen = true;  this.isOpen` must be `true` at once (Spell UI's rule), and stores wrap class instances.
- The useful direction is the reverse, ONE engine:
  - Spell UI's members onto spell cells, as the code-debt entry "Two reactive engines" plans
    (`spell.epics/agents/CODE-DEBT.md`), its first check "the bridge to Solid on every Spell UI page":
    measured above, and (D3) shrinks it
  - or spell cells onto Spell UI's notifiers, (D1), with its guard

### Nested JSON a program holds, reactive for free?

- Today it isn't:  a list or object changed in place tells nobody (`extend.ts`'s header);  `List` copies on write.
- On a Solid store:  reactive with no code of ours, every nested field tracked.
  But the program reads it stale after a write, inside actions and beside async (section 2), and a fresh read costs
  a `snapshot()` (`store-snapshot`).
- On cells:  the planned `Proxy` "only for class-less data" (`agents/solid/solid-2.md`, "Accessors for Things, a
  `Proxy` only for class-less data"):  each nested object gets a record and cells, made as it's first read through
  the proxy.
  - Keeps read-after-write, `keys()` order and `sourcesReadBy()`.
  - Costs about 2.5 times a plain read, as the guide measured for proxies (inferred for nested data).
  - `===` holds inside the program;  only a raw object leaking out beside its proxy would differ (inferred).
- Recommended:  on cells.

## 4. Leaning into drafts, beyond cells

- **An action's writes landing together.**  Measured (`heldAction.mts`), today's cells, bridged:
  - as a plain async action, the screen showed every step:  `000`, `100`, `110`, `111`
  - as a Solid action (a generator, each wait a `yield`), the screen went `000` to `111`, nothing between;
    the program read its own writes at once all the way (1, 1, 1)
  - why it works:  the bridge's trigger signal is a Solid write, so Solid holds it with the action's transaction,
    while the value itself is in the record
  - the edge (`heldTear.mts`):  a reader re-run mid-action for an outside reason (a theme change) read the cells as
    they were, and showed `dark 110`:  half-dealt
  - so "compile actions to generators" (`data-paradigm.md` §4, idea 1) gets Solid's held screen for free, with no
    store;  the tear needs a guard of its own:  cells could hold each action's writes back from Solid readers until it
    ends (inferred:  a draft layer in the record, not prototyped)
- **Undo as a diff of drafts.**  No gain:
  - Solid's drafts keep no patches (its write hook is internal), and snapshots don't share structure (8c-8e)
  - undo already records each prop's value before and after, at `noteSetting()` (`parser/src/core/undoing.ts`
    line 254):  the smallest diff there is
- **Places' pending changes as drafts.**  Spell's are stronger than Solid's:
  - `PendingChanges` (`src/places/PendingChanges.ts`):  shown at once, kept on this device, resent with the same id,
    merged three ways when out of date;  `createOptimisticStore` is one tab, in memory, gone on reload
  - Spell even has its own drafts, `PlaceDraft` (`parser/src/core/places.ts` line 1489):  an Edit screen's copy that
    sends nothing until Save, kept on this device
  - where Solid's could help:  SHOWING a pending change as a guess on the screen, held with the action
    (`createOptimistic`, 3a-3f), if places' writes ran in Solid actions (inferred)
- **The Inspector showing changes.**  Stores add nothing it lacks:
  - `noteSetting()` already sees every write, with the value it `was`
  - `sourcesReadBy()` already answers "worked out from"
  - a store's `snapshot()` would give a whole copy per moment, not a change
- **Where stores DO fit:**  state no Spell program reads back at once.
  - the editor app's own UI state:  189 `createSignal` and 110 `createMemo` in plain Solid components
    (`spell-today.md` §1);  grouping a panel's signals into one store means one setter, one draft write per change
    (inferred)
  - `PageStore` (`epic/src/review/PageStore.ts`, 70 lines):  a version and a `subscribe()`, a hand-made store
  - "is this row selected" in long lists:  `createProjection`, measured to re-run only the rows that changed (7c)
  - a place's read for a drawing:  `createStore(fn)` / an async projection over a `PlaceResult` (`spell-today.md`
    §2.3, "createPlace()") (inferred)

## 5. Recommendation

Ranked, with what each costs and risks:

1. **Keep the record as the one copy:  it already is.**  Say so in `agents/solid/solid-2.md`, so "a separate copy for
   Solid" stops being the mental model.  Effort:  none.
2. **Make the bridge cheaper (D3).**  The `Reaction` made on a computation's first cell read.
   - Gains:  about 0.55 KB per Solid computation that reads no cell, and part of the time to create one.
   - Risk:  low;  `cells.test.ts` and `cellsBridge.browser.test.tsx` pin the semantics.
   - Effort:  S.  A phase of this epic:  it's re-checking the bridge on 2.0 anyway.
3. **Run Spell actions inside Solid's `action()`.**  The held screen, no half-dealt board, and fresh program reads.
   - Needs actions compiled to generators (`data-paradigm.md` §4, idea 1), and a guard for the mid-action tear.
   - Effort:  L.  Its own epic, with the generators.
4. **Use stores where nothing reads back at once:**  `PageStore`, selection projections, the editor's own UI state.
   - Effort:  S to M each;  in this epic only if a phase is touching that code anyway.
5. **Nested JSON through cells (the planned proxy), not a store.**  Effort:  M.  Its own todo.
6. **One engine for Spell UI and spell cells:**  onto cells with (D3), or onto notifiers with (D1) and a guard.
   - (D1) is the fastest measured, but loops on 2.0.3 when a drawing writes what it read.
   - Effort:  M to L.  Its own epic (the code-debt entry's).

Not recommended:  (A), (B), (C), (E).

Risks of the whole direction:
- The bridge stays the one place Solid's internals carry Spell (`enableExternalSource`, "integration" tier):  re-run
  `cellsCheck.mts` and the bridge tests on every Solid bump.
- 2.0.3 changed one thing these experiments touch:  a computation's write to a signal it just read now wakes it again
  (D1's loop).  Today's cells don't depend on it.

Questions for Owen:  see the analysis page, Q4 to Q6.

## 6. The scripts and what they printed

Run from `cells-scripts/` (or wherever they're copied), each with a Solid `node_modules` folder as its argument.
`tsx` is the kit's (`~/www/spell.worktrees/solid-2-final/node_modules/.bin/tsx`).

| Script | What it checks |
| --- | --- |
| `raw.mjs` | read-after-write for signals and stores:  top level, a handler, an effect, a memo, an action;  `latest`, `snapshot`, `flush`;  derived and optimistic stores (1-3) |
| `raw2.mjs` | where a write may happen, entanglement with async, class instances, projections, many nested writes (4-8) |
| `raw3.mjs` | a fresh-or-tracked store read, and the tear it gives (9) |
| `raw4.mjs` | `snapshot()` inside an action (10) |
| `bench.mts` | the cost table (section 3) |
| `medians.mjs` | the table from `bench.mts`'s rounds |
| `memory.mts` | bytes per value and per reader |
| `bridgeTax.mts` | the bridge's time on computations that read no cell |
| `slim.mjs`, `slimCheck.mjs` | (D1), and its checks |
| `lazy.mjs` | (D2), run with `CELLS_MODULE=./lazy.mjs node slimCheck.mjs ...` |
| `cleanupOrder.mjs` | when a compute's `onCleanup` runs |
| `cellsCheck.mts` | today's cells on the same checks |
| `heldAction.mts`, `heldTear.mts` | a Spell action in a Solid action:  the held screen, and its edge |

RAW_OUTPUTS

## See also

- [spell-today.md](spell-today.md):  §2.1, §2.2, the two engines and the stores Spell doesn't use
- [perf-code.md](perf-code.md):  §6, the bridge's row
- [solid-features.md](solid-features.md):  §1.3 stores and projections, §1.5 actions and optimistic updates
- [data-paradigm.md](data-paradigm.md):  §4, actions compiled to generators
- `agents/solid/solid-2.md` (the kit):  "Spell's decisions"
- `spell.epics/guides/solid/solid-2.html`:  §2, the first measurements (rc.11, rc.13)
- Solid's docs:
  [createStore](https://docs.solidjs.com/reference/solid-js/stores/create-store),
  [flush](https://docs.solidjs.com/reference/solid-js/reactivity/flush),
  [snapshot](https://docs.solidjs.com/reference/solid-js/advanced/store-advanced/snapshot),
  [createOptimisticStore](https://docs.solidjs.com/reference/solid-js/stores/create-optimistic-store);
  and the primer shipped in `solid-js`, `skills/solid-2.0/SKILL.md` ("Reads lag writes")
