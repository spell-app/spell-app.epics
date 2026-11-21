# Option B, looked into:  one engine on Spell UI's signals, and the guard it needs

Research notes for epic `solid-2-final`'s "Solid 2 analysis" page, question Q4 (agent `solid-2-final-engine-b`,
2026-11-20).
- Owen ticked Q4's A (keep cells, a cheaper bridge) AND B (one engine now), with:
  "Check out B, if the guard is not onerous this might be worth it."
- Words:  the TRACKER is today's cell (Owen picked the name, 2026-11-20;  not renamed in code yet).
  Option B is the analysis page's D1:  each tracker holds a value-less Solid signal, as Spell UI's members do,
  and the bridge (`bridgeSolid()`, `enableExternalSource`) goes.
- Read with [cells-and-stores.md](cells-and-stores.md):  its D1 prototype (`cells-scripts/slim.mjs`) is where this
  starts.
- Every number here was run:  Solid `@solidjs/signals` 2.0.3 and 2.0.0-rc.21 (plus rc.22, rc.23, 2.0.0-2.0.2 for the
  bisect), each unpacked with `npm pack` into a folder of its own, never installed.
  - The machine was quiet this time (load 2.5 to 6.7 on 14 cores):  timings are steadier than cells-and-stores.md's.
- The scripts live in the session's scratch folder, `scratchpad/engine-b/scripts/` (section 7 lists them);
  the guard's code is pasted in section 3.
- `(inferred)` marks a guess;  everything else was read in code or measured.

## 0. The answer in one screen

- **Why it loops:**  Solid 2.0.0-rc.23 (2026-11-16) made a computation's write to a signal it already read this run
  wake that computation again ("the pass's own owned write to what it just read is a missed wake too (F-10)").
  - rc.21 only skipped it by luck:  it exempted the LAST signal read, nothing else.
    A drawing that reads `a`, then `b`, then writes `a` loops on rc.21 too (check 3).
  - Solid's own answer is "equality gates keep it convergent":  a drawing that writes an EQUAL value runs twice and
    stops.  One that writes a NEW value each run (`count + 1`, a new list) runs forever.
  - Today's trackers never loop:  each bridged reader (`Reaction`) ignores changes made while it runs.
- **How often Spell does it:**  almost never, as far as can be counted.
  - 0 of 301 `to draw` blocks in the 598 `.spell` files write a property they read (3 write statements:
    two set a local, one is text).
  - 0 self-wakes across parser's `core` and `spell` tests (239 files, 6,461 tests), with a probe on `Reaction.mark()`;
    the app's browser tests couldn't be probed (section 2).
- **The best guard:**  "a drawing re-run only by its own writes returns what it drew last time" (selfskip, lean form),
  plus a backstop that refuses a computation's second write to the same tracker before things settle (refuse).
  - Behaves like today on every check:  each self-writing drawing runs its code ONCE;  an outside write re-runs it once.
  - Also stops a loop today's trackers DON'T:  two drawings feeding each other (check 10) stop after 4 runs, with a dev
    warning naming the property.
  - About 60 lines.  No measurable cost per write;  about 112 bytes per drawn reader.
- **B with the guard, against today's bridged trackers** (2.0.3, production build, medians of 5 rounds):
  - 2.2 times quicker to set up drawings, 1.6 times with everything drawn, 1.5 times to update the screen,
    the same for a program's own writes and reads
  - 1,106 bytes per drawn reader against 2,041;  a Solid computation that reads no tracker pays nothing
    (today 1,339 bytes, about 786 after A)
- **Verdict:  the guard is not onerous.  B is worth it, and it makes A unneeded** (A cheapens the bridge B removes).
  - B also drops Spell's one reliance on Solid's integration tier (`enableExternalSource`):  it uses only
    `createSignal`, `getObserver` and `ownedWrite`.
  - Effort:  M for trackers on signals with the guard;  M to L with Spell UI's engine merged in.

## 1. Why a drawing that writes what it read loops on 2.0.3

### The change

`@solidjs/signals`' `insertSubs()` (`dist/dev-shared.js`, 2.0.3 line 3068;  rc.21 line 2869) walks a written signal's
readers.  A reader that is mid-run and already validated that link is latched for a re-run (`REACTIVE_MISSED_WAKE`),
and `recompute()` re-schedules it at its end (2.0.3 line 6240:  "Missed wake:  values read before the nested commit are
stale, so run again.  Equality gates keep it convergent.").

```js
// rc.21:  the LAST link read is exempt ("it is the read IN FLIGHT")
if (sub._flags & REACTIVE_RECOMPUTING_DEPS && s._gen === sub._depGen && s !== sub._depsTail)
  sub._flags |= REACTIVE_MISSED_WAKE

// 2.0.3:  ... unless the written node is a plain signal (no _fn):
// "A signal's read returned before any write to it -- the pass's own owned write to what it just read
//  is a missed wake too (F-10)."
if (sub._flags & REACTIVE_RECOMPUTING_DEPS && s._gen === sub._depGen && (s !== sub._depsTail || !node._fn))
  sub._flags |= REACTIVE_MISSED_WAKE
```

- Bisected with `npm pack` of each release:  rc.22 has the old line, rc.23 (2026-11-16) the new one, kept in 2.0.0
  through 2.0.3.  The release has no changelog in the package;  the source comment cites F-10 and #3337
  (`markLateLinker()`, the same rule for a reader that linked after the write).
- So on rc.21, the loop needed a tracker read BEFORE the last one:  read `a`, read `b`, write `a` loops there too
  (check 3 below:  LOOPED on rc.21).  cells-and-stores.md's check 9 ran once on rc.21 only because its write was to
  the last signal read.
- Solid's flush guard (`Potential Infinite Loop Detected`, at 100,000 rounds) didn't catch it in cells-and-stores.md's
  check 9:  each round queued more staged nodes until `pendingNodes.push()` threw `RangeError:  Invalid array length`.

### What loops and what doesn't, unguarded (guardCheck.mjs, 2.0.3 dev;  prod the same)

| Check | What the drawing does | 2.0.3 | rc.21 | today's trackers (bridged), 2.0.3 |
| --- | --- | --- | --- | --- |
| 1 | reads `count`, writes `count + 1`, reads it again | loops | 1 run | 1 run |
| 2 | writes the same value it found (`set picked to the first card`) | 2 runs | 1 | 1 |
| 3 | reads `a`, reads `b`, writes `a + 1` | loops | **loops** | 1 |
| 4 | reads a derived value, writes its source | 43 runs in 20 microtasks:  a slow loop | 43 | 1 |
| 5 | as 1, beside another reader of `count` | loops | 1 | 1 |
| 7 | appends to a list each run (a new array every time) | loops | 1 | 1 |
| 8, 9 | reads `count`, writes `count + 1`, no read after | loops | 1 | 1 |
| 10 | two drawings feeding each other (A reads x writes y, B reads y writes x + 1) | loops | loops | **loops** |

- Check 10 loops today too:  each `Reaction` ignores only its OWN writes.

## 2. How often Spell's code writes what it read while drawing

| Where | How counted | Found |
| --- | --- | --- |
| Spell programs | `scanDraws.mjs`:  every `to draw` / `para dibujar` block in the 598 `.spell` files, each statement starting `set`, `add`, `remove`, `put` ... (and the Spanish verbs) | 301 blocks, 3 write statements, **0 writes to a property**:  `RecipeEditor.spell` lines 117 and 123 set a local (`set this editor to it`);  `RecipeCard.spell` line 48 is button text |
| parser's `core` and `spell` tests | `probeSetup.ts`:  `Reaction.prototype.mark` patched to count a mark while the reader runs (exactly the write that would loop under B), run through parser's own vitest config | 239 files, 6,461 tests passed:  **0** self-wakes, 167 other marks |
| the app's tests (`app:browser`, `app:node`) | the same probe | **not measured:**  the probe's setup file broke the app's test setup (71 files failed to load);  not pursued |
| the editor's own Solid code | -- | not counted;  the backstop covers it (inferred) |
| Spell UI | its members already run on value-less signals;  a write in a render is deferred a microtask and lint-guarded | lives with it today |

- Indirect writes (a getter or an action called from a drawing) can't be found statically.
- The node tests mostly draw without the bridge (167 marks in all), so the probe is weak evidence;
  the static scan is the stronger one.
- What a drawing DOES write today, inside Spell:  a new thing's props while it's made (`a new ingredient row with
  editor = ...`), never read before;  a lazily stored `init` default (`getProp()` stores it, telling `keysOf()`
  readers):  an equal-value pattern, which converges.

## 3. The guards

All five were built into one prototype, `guarded.mjs` (slim.mjs, with trackers, and a `GUARD` switch), and run on
the same checks (`guardCheck.mjs`, each check in its own process:  a loop halts Solid for the rest).

### Results (2.0.3 dev;  `checks-*.txt`)

| Check | none | `equals` on a version | defer | refuse | selfskip | **lean + refuse** | today |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 `count + 1`:  runs;  count, shown | loops | loops | 21 runs in 20 microtasks, count 22 | 2;  1, "count 1" | 1;  1, "count 1" | **1;  1, "count 1"** | 1;  1 |
| 1b then an outside write of 10:  re-runs;  count | -- | -- | 42;  54 | 2;  11 | 1;  11 | **1;  11** | 1;  11 |
| 2 equal value | 2 | 2 | 2 | 2 | 1 | **1** | 1 |
| 3 read a, read b, write a + 1 | loops | loops | 21 | 2 | 1 | **1** | 1 |
| 4 writes a derived value's source | 43 | 43 | 43 | 2 | 1 | **1** | 1 |
| 5 another reader sees the write | loops | loops | yes, writer 21 | yes, writer 2 | yes, writer 1 | **yes, writer 1** | yes, 1 |
| 6 set x;  read x, in a drawing | "new" | "new" | "new" | "new" | "new" | **"new"** | "new" |
| 7 appends a line each run | loops | loops | 21, 22 lines | 2, 1 line | 1, 1 line | **1, 1 line** | 1, 1 line |
| 10 two drawings feeding each other | loops | loops | -- | 4, warned | loops | **4, warned** | loops |

- On rc.21, lean + refuse gives the same column;  on 2.0.3's production build too (checks 1, 3, 4, 7, 10 run).
- cells-and-stores.md's 13 checks (`slimCheckB.mjs`) all pass with lean + refuse on 2.0.3 and rc.21:
  read-after-write, derived values and their equality cutoff, `sourcesReadBy()`, `observe()`, a write in an effect's
  apply, a write inside a Solid action before and after a `yield`.  Unguarded, 2.0.3 stops at check 9.

### (a) A write during a drawing told to Solid later (defer), or an equal write skipped

```ts
changed() {
  this.version++
  const signal = this.signal
  if (signal && getObserver()) queueMicrotask(() => signal[1]()) // Spell UI's notify() does this
  else signal?.[1]()
}
```

- Doesn't stop the loop:  it turns it into one run per microtask, forever (21 runs in 20 microtask rounds).
  The page never goes idle.
- Skipping an equal write is already in `setProp()` (`===`):  it's what makes check 2 stop at 2 runs.
  It does nothing for a new value.

### (b) A per-computation "written this pass" list that refuses a second write (refuse)

```ts
/** Which trackers each Solid computation wrote since things last settled. */
let written: Map<object, Set<Tracker>> | null = null

/** May the running computation write `tracker`?  A second write before things settle is refused. */
function mayWrite(tracker: Tracker, name: string): boolean {
  const observer = getObserver()
  if (!observer) return true // event handlers, actions, places:  as today
  if (!written) {
    written = new Map()
    queueMicrotask(() => (written = null))
  }
  let mine = written.get(observer)
  if (!mine) written.set(observer, (mine = new Set()))
  if (!mine.has(tracker)) {
    mine.add(tracker)
    return true
  }
  if (DEV) console.warn(`${spellLine(observer)}:  this drawing changes its "${name}" every time it draws;  skipped the second time`)
  return false
}
```

- Works for ANY computation, wrapped or not:  the editor's, Spell UI's, a JSX expression the TypeScript target's
  compiler made.
- The writer runs twice (its code too:  a `print` in it prints twice).
- The refused run reads the OLD value after its write:  read-after-write breaks in that one run.
- MUST sit before `noteSetting()` (`Thing.setProp()`, `List.writeItems()`):  else undo, places and `when it changes`
  hear a write that never happened.
- The dev warning can name the spell line:  the compiler's `loc` on the drawing (Solid keeps `name` / `loc` in dev)
  (inferred:  not wired in the prototype).

### (c) A drawing re-run only by its own writes returns what it drew (selfskip;  lean form)

```ts
/** What every drawing running now has read, in one list they share;  `start` marks where the current one began. */
const readList: Tracker[] = []
let drawing: { start: number; wrote: boolean } | null = null

/** Wrap a drawing's compute:  re-run only by its own writes, it keeps its last result, as today's trackers do. */
export function drawn<T>(draw: (previous?: T) => T) {
  let kept: (Tracker | number)[] | null = null // [tracker, version ...], only after a run that wrote
  let last: T
  return (previous?: T) => {
    if (kept && keptUnchanged(kept)) {
      for (let i = 0; i < kept.length; i += 2) (kept[i] as Tracker).track() // Solid keeps what it read
      return last
    }
    const outer = drawing
    const me = (drawing = { start: readList.length, wrote: false })
    try {
      last = draw(previous)
    } finally {
      drawing = outer
    }
    kept = null
    if (me.wrote) {
      // what it read, as it stands AFTER its own writes:  only someone else's change runs it again
      kept = []
      for (let i = me.start; i < readList.length; i++) kept.push(readList[i], readList[i].refresh().version)
    }
    readList.length = me.start
    return last
  }
}
// and:  tracker.track() pushes onto readList while a drawing runs;  tracker.changed() sets drawing.wrote
```

- Today's rule exactly ("never wake a reader for its own write"):  every check matches today's trackers.
- Solid still re-runs the wrapper once (the missed wake);  the wrapper reads the same signals again and hands back the
  last drawing, without running Spell's code.
- A drawing that wrote nothing keeps nothing:  the shared list is only copied out after a write.
  (The first form, a `Map` per drawing, cost 336 bytes per drawn reader and 1.4 times `loopDrawn`;  the lean form 112.)
- A derived value's version is refreshed after the run, so a write to a derived value's source doesn't re-run it
  either (check 4).  The derived value keeps a `told` version, so its other readers still hear of the change.
- Only where it's wrapped:  core's `h()` wraps each function child and prop, and `drawThing()` its drawing
  (one place each, `parser/src/core/drawing.ts`) (inferred).  The TypeScript target's JSX is compiled by Solid's own
  compiler:  only its `@drawn` `draw()` is wrapped, so its expressions rely on the backstop.
- Doesn't stop two drawings feeding each other (check 10):  neither does today.  The backstop does.

### (d) Solid 2's own tools

| Tool | Does it help? |
| --- | --- |
| `ownedWrite: true` | Only permits the write (no `REACTIVE_WRITE_IN_OWNED_SCOPE`);  B needs it, it guards nothing. |
| `equals` (the signal holding the version, default `===`) | No:  every write is a new version;  measured the same as none.  It can't tell who wrote. |
| `untrack()` | Not on the write:  Solid wakes by the READ's link.  Untracking the read would also miss everyone else's writes. |
| `latest()`, `isPending()`, `flush()` | Nothing to do with who's woken;  `flush()` in a computation is refused or ignored (cells-and-stores.md 4b, 4c). |
| the flush guard (100,000 rounds) | Too late, and here it didn't fire before the `RangeError`. |

- 2.0.3's `SignalOptions` is `name`, `loc`, `equals`, `ownedWrite`, `unobserved`:  nothing says "don't wake the writer".

### (e) The compiler refusing such writes

```text
In a drawing:  set the count to the count + 1
-> "A drawing can't change what it shows:  move `set the count ...` into an action, or into `when ... changes`."
```

- Today's programs would never see it:  0 of 301 draw blocks write a property.
- It only catches a write written IN the draw block;  a getter or action the drawing calls slips through.
- So a nice early message, not a guard.  Worth adding with B as a check (a warning first) (inferred).

### Cost, measured (benchB.mts, 2.0.3 production, medians of 5 rounds, load 4.4 to 6.7)

20,000 things of 3 fields;  every drawn reader goes through the guard's wrapper (its worst case).

| Variant | construct ms | loop ms | mount ms | loopDrawn ms | update ms | stale reads |
| --- | --- | --- | --- | --- | --- | --- |
| today's trackers, bridged | 9.2 | 5.6 | 42.6 | 83.3 | 20.3 | 0 / 0 |
| Spell UI's notifier | 1.1 | 3.9 | 11.3 | 32.1 | 8.1 | 0 / 0 |
| B, no guard | 0.9 | 4.9 | 21.6 | 42.9 | 8.3 | 0 / 0 |
| B, refuse | 1.0 | 5.0 | 21.6 | 38.8 | 7.8 | 0 / 0 |
| B, selfskip (a `Map` per drawing) | 0.8 | 4.8 | 24.6 | 61.7 | 11.7 | 0 / 0 |
| B, selfskip + refuse | 0.9 | 5.1 | 24.6 | 61.7 | 11.9 | 0 / 0 |
| B, lean | 0.9 | 5.0 | 20.0 | 51.4 | 11.9 | 0 / 0 |
| **B, lean + refuse** | 1.2 | 4.0 | 19.8 | 53.5 | 13.3 | 0 / 0 |

Memory (`memoryB.mjs`, 50,000 things, a drawn reader per field;  the tracker and its signal are made on the first
drawn read, so they count as the reader's):

| Variant | Per value | Per drawn reader |
| --- | --- | --- |
| today's trackers, bridged | 88 | 2,041 |
| Spell UI's notifier | 51 | 866 |
| B, no guard / refuse | 75 | 994 |
| B, selfskip / selfskip + refuse | 75 | 1,330 |
| **B, lean / lean + refuse** | 75 | **1,106** |

- refuse costs nothing measurable:  one `getObserver()` per write outside a computation (`loop`:  4.0 to 5.0 ms in
  every B row).
- lean costs about 20 to 25% of B's drawing and updating time, and 112 bytes per drawn reader;  B with it is still
  2.2 times quicker to mount than today, 1.6 times with everything drawn, 1.5 times to update.

## 4. What B changes everywhere else

| What | Under B | Measured? |
| --- | --- | --- |
| Read-after-write | Unchanged:  the value stays in the record, written before Solid is told;  a program reads its own write at once, in a drawing, an effect's apply, a Solid action before and after a `yield` | yes:  checks 6;  slimCheckB 1-3, 12, 13 |
| Derived values | Kept:  push-pull with the equality cutoff;  each derived value tells Solid through its own signal, after a microtask check, only if its value moved | slimCheckB 2, 3, 5, 6 |
| The Inspector | "Worked out from" (`sourcesReadBy()`) uses the trackers' own collector, not Solid:  unchanged.  Its lone tracker for a swapped-in sample:  a tracker with a signal, unchanged in use | slimCheckB 10 |
| `observe()` (FileStates, CodeMirror) | Unchanged:  plain readers keep the collector, and still never re-run for their own writes | slimCheckB 11 |
| Undo, cancel's put-back, places, `when it changes` | Unchanged:  `noteSetting()` runs before the record is written, as today.  The refuse backstop must sit before it (section 3b) | (inferred) |
| Places | Their writes come from loads and saves, outside computations:  no guard involved.  `whenUnset` asks the place again when read in a drawing, and the answer lands later | (inferred) |
| Nested JSON as a proxy (Q6, A) | Each nested object gets its own trackers, made as it's first read through the proxy:  the same trackers, the same guard | (inferred) |
| Spell actions inside Solid's `action()` (Q5, B) | The same as today:  the tracker's signal write is held with the action's transaction.  Program read 1, 1, 1;  screen `000` straight to `111`.  The midway tear is the same too:  `dark 110` | yes:  heldActionB, heldTearB, on 2.0.3 and rc.21 |
| Spell UI's members | One engine:  Spell UI's `Notifier` and the tracker become one class, its `DerivedCache` and `Derived` one.  Spell UI's render writes, deferred a microtask today, would go through the same guard | (inferred) |
| Solid computations that read no tracker | Pay nothing:  no `enableExternalSource` | memory:  449 bytes, Solid's own render effect (cells-and-stores.md) |
| Reliance on Solid's internals | Drops `enableExternalSource` (integration tier);  keeps `createSignal`, `getObserver`, `ownedWrite`.  The guard works whether Solid re-runs a writer or not:  passes on rc.21 and 2.0.3 | yes |

## 5. Verdict

### Is the guard onerous?

No.
- **Code:**  about 60 lines (lean selfskip about 40, refuse about 20), plus one wrap each in core's `h()` and
  `drawThing()`, and the refuse check moved before `noteSetting()`.
- **Runtime:**  nothing measurable per write;  about 20 to 25% of B's drawing time and 112 bytes per drawn reader,
  leaving B still 1.5 to 2.2 times quicker than today, at about half the memory.
- **What authors see:**  nothing, for a drawing writing what it read:  it runs once, as today.
  A dev warning, naming the property (and the spell line, once wired), for two drawings feeding each other, which
  today loop forever.
- **What could still loop:**
  - an effect's apply writing what its compute read:  as today, and as in plain Solid (Solid's flush guard)
  - two computations feeding each other through derived values across microtasks:  refuse's list clears each
    microtask (inferred:  not tested)
  - a computation that isn't wrapped (the editor's, Spell UI's, the TypeScript target's JSX) and writes a NEW value
    each run:  refuse stops it at 2 runs, its code running twice

### A against B

| | A:  keep the bridge, make it cheaper (D3) | B:  one engine on signals, with lean + refuse |
| --- | --- | --- |
| Drawing speed | today's:  mount 42.6 ms, all drawn 83.3, update 20.3 | 19.8, 53.5, 13.3:  2.2x, 1.6x, 1.5x quicker |
| A program's own work | 5.6 ms | 4.0 to 5.0:  the same |
| Memory per drawn reader | 2,041 bytes | 1,106 |
| Solid computations reading no tracker | about 786 bytes each (from 1,339) (inferred) | 0 |
| Programs see | no change | no change (every check matches today) |
| Risk | low:  the bridge's tests pin it;  but keeps `enableExternalSource`, an integration-tier API, and Solid's internals in the path | medium:  a new guard of ours, and a new loop it catches (check 10);  drops the integration tier |
| Effort | S | M (trackers on signals and the guard);  M to L with Spell UI's engine merged in |

- B makes A unneeded:  A cheapens the bridge B removes.
- Recommended:  B in this epic, in place of A, with the guard;  the compiler's warning (3e) as a small extra.

## 6. Questions for Owen

- Q7 on the analysis page:  build B in this epic in place of A, or A now and B later?

## 7. The scripts and what they printed

In `scratchpad/engine-b/scripts/` (the session's scratch folder;  outputs one folder up).  Each takes a
`node_modules` folder holding `@solidjs/signals`.

| Script | What it checks |
| --- | --- |
| `guarded.mjs` | option B with a `GUARD` switch:  none, version, defer, refuse, selfskip, both, lean, leanboth |
| `guardCheck.mjs` | the ten checks above;  `ONLY=<n>` runs one, `TRACKERS_MODULE=./todayCells.mts` runs today's trackers (with `tsx`) |
| `runChecks.sh` | each check in its own process, per guard |
| `todayCells.mts` | today's trackers (the kit's `spell/util/reactive`, bridged), shaped for guardCheck.mjs |
| `slimCheckB.mjs` | cells-and-stores.md's slimCheck.mjs on guarded.mjs |
| `heldActionB.mjs`, `heldTearB.mjs` | the held screen and its tear, on guarded.mjs |
| `benchB.mts`, `runBench.sh`, `medians.mjs` | cells-and-stores.md's bench.mts, with a `guarded` variant |
| `memoryB.mjs` | bytes per value and per drawn reader |
| `scanDraws.mjs` | writes in `to draw` blocks |
| `../probe/probeSetup.ts`, `probe.config.ts` | the self-wake probe, run through parser's vitest config |

### guardCheck.mjs:  today's trackers, 2.0.3 dev

```text
GUARD=(today's cells, bridged)  @solidjs/signals 2.0.3, dev
1 drawing writes count + 1:  its code ran (times)                  => 1
1' ... count, and what it shows                                    => [1,"count 1"]
1b an outside write of 10:  re-ran (times);  count                 => [1,11]
2 drawing writes the same value each time:  ran (times)            => 1
3 reads a, reads b, writes a + 1:  ran (times)                     => 1
4 reads a derived value, writes its source:  ran (times)           => 1
5 another reader of count shows;  the writer ran (times)           => [1,1]
6 set x;  read x, inside a drawing                                 => "new"
7 drawing appends a line each run:  ran (times);  lines            => [1,1]
8 reads count, writes count + 1, no read after:  ran (times)       => 1
9 as 8, its tracker already made:  ran (times)                     => 1
9b ... then an outside write:  re-ran (times)                      => 1
10 two drawings feeding each other:  runs of both                  => "LOOPED (more than 200 runs)"
```

### guardCheck.mjs:  no guard, rc.21 dev

```text
GUARD=none  @solidjs/signals 2.0.0-rc.21, dev
1 drawing writes count + 1:  its code ran (times)                  => 1
1' ... count, and what it shows                                    => [1,"count 1"]
1b an outside write of 10:  re-ran (times);  count                 => [1,11]
2 drawing writes the same value each time:  ran (times)            => 1
3 reads a, reads b, writes a + 1:  ran (times)                     => "LOOPED (more than 200 runs)"
4 reads a derived value, writes its source:  ran (times)           => 43
5 another reader of count shows;  the writer ran (times)           => [1,1]
6 set x;  read x, inside a drawing                                 => "new"
7 drawing appends a line each run:  ran (times);  lines            => [1,1]
8 reads count, writes count + 1, no read after:  ran (times)       => 1
9 as 8, its tracker already made:  ran (times)                     => 1
9b ... then an outside write:  re-ran (times)                      => 1
```

### guardCheck.mjs:  no guard, 2.0.3 dev

```text
GUARD=none  @solidjs/signals 2.0.3, dev
1 drawing writes count + 1:  its code ran (times)                  => "LOOPED (more than 200 runs)"
1' ... count, and what it shows                                    => [200,"count 1"]
2 drawing writes the same value each time:  ran (times)            => 2
3 reads a, reads b, writes a + 1:  ran (times)                     => "LOOPED (more than 200 runs)"
4 reads a derived value, writes its source:  ran (times)           => 43
5 another reader of count shows;  the writer ran (times)           => [null,"LOOPED (more than 200 runs)"]
6 set x;  read x, inside a drawing                                 => "new"
7 drawing appends a line each run:  ran (times);  lines            => ["LOOPED (more than 200 runs)",200]
8 reads count, writes count + 1, no read after:  ran (times)       => "LOOPED (more than 200 runs)"
9 as 8, its tracker already made:  ran (times)                     => "LOOPED (more than 200 runs)"
10 two drawings feeding each other:  runs of both                  => "LOOPED (more than 200 runs)"
```

(`version`, Solid's own `equals`, printed the same.)

### guardCheck.mjs:  defer, 2.0.3 dev (20 microtask rounds)

```text
1 drawing writes count + 1:  its code ran (times)                  => 21
1' ... count, and what it shows                                    => [22,"count 22"]
1b an outside write of 10:  re-ran (times);  count                 => [42,54]
2 drawing writes the same value each time:  ran (times)            => 2
3 reads a, reads b, writes a + 1:  ran (times)                     => 21
4 reads a derived value, writes its source:  ran (times)           => 43
5 another reader of count shows;  the writer ran (times)           => [21,21]
7 drawing appends a line each run:  ran (times);  lines            => [21,22]
```

### guardCheck.mjs:  refuse, 2.0.3 dev

```text
1 drawing writes count + 1:  its code ran (times)                  => 2
1' ... count, and what it shows                                    => [1,"count 1"]
1b an outside write of 10:  re-ran (times);  count                 => [2,11]
2 drawing writes the same value each time:  ran (times)            => 2
3 reads a, reads b, writes a + 1:  ran (times)                     => 2
4 reads a derived value, writes its source:  ran (times)           => 2
5 another reader of count shows;  the writer ran (times)           => [1,2]
6 set x;  read x, inside a drawing                                 => "new"
7 drawing appends a line each run:  ran (times);  lines            => [2,1]
8 reads count, writes count + 1, no read after:  ran (times)       => 2
9 as 8, its tracker already made:  ran (times)                     => 2
9b ... then an outside write:  re-ran (times)                      => 2
guard warnings: [ `a drawing writes "count", which it read, again:  the write is skipped so it can't loop`, ... ]
```

### guardCheck.mjs:  lean + refuse (leanboth), 2.0.3 dev (rc.21, and 2.0.3 prod, the same)

```text
GUARD=leanboth  @solidjs/signals 2.0.3, dev
1 drawing writes count + 1:  its code ran (times)                  => 1
1' ... count, and what it shows                                    => [1,"count 1"]
1b an outside write of 10:  re-ran (times);  count                 => [1,11]
2 drawing writes the same value each time:  ran (times)            => 1
3 reads a, reads b, writes a + 1:  ran (times)                     => 1
4 reads a derived value, writes its source:  ran (times)           => 1
5 another reader of count shows;  the writer ran (times)           => [1,1]
6 set x;  read x, inside a drawing                                 => "new"
7 drawing appends a line each run:  ran (times);  lines            => [1,1]
8 reads count, writes count + 1, no read after:  ran (times)       => 1
9 as 8, its tracker already made:  ran (times)                     => 1
9b ... then an outside write:  re-ran (times)                      => 1
10 two drawings feeding each other:  runs of both                  => 4
guard warnings: [ `a drawing writes "x", which it read, again:  the write is skipped so it can't loop` ]
Solid warnings: []
```

### slimCheckB.mjs, lean + refuse, 2.0.3 dev (rc.21 the same;  unguarded 2.0.3 throws `RangeError` after check 8)

```text
1 read after write, no flush:  card.rank                               => "king"
2 derived right after a write:  card.isRed                             => false
3 a nested derived right after a write:  card.label                    => "king (red)"
4 Solid reader of a cell re-runs (runs incl. the first)                => 2
5 equality cutoff:  isRed's reader didn't re-run (runs)                => 1
6 label's reader saw                                                   => ["king (red)","queen (red)"]
7 three writes, one re-run (rank runs)                                 => 3
8 a drawing writing what it read:  its value                           => "count 1"
9 ... it ran (times;  1-2 means no loop)                               => 1
10 sourcesReadBy(label):  cells and derived values found               => 4
11 observe() re-ran synchronously                                      => ["nine","eight"]
12 write + read in an effect apply                                     => ["seven"]
13 write + read inside a Solid action, before and after a yield        => ["six","five"]
warnings: []
```

### heldActionB.mjs and heldTearB.mjs (2.0.3, then rc.21)

```text
plain async action:   program read [ 1, 1, 1 ]   screen showed [ '000', '100', '110', '111' ]
as a Solid action:    program read [ 1, 1, 1 ]   screen midway [ '000' ]   screen at the end [ '000', '111' ]
plain async action:   program read [ 1, 1, 1 ]   screen showed [ '000', '100', '110', '111' ]
as a Solid action:    program read [ 1, 1, 1 ]   screen midway [ '000' ]   screen at the end [ '000', '111' ]
screen: [ 'light 000', 'dark 110', 'dark 111' ]
```

### The bisect

```text
2.0.0-rc.22: 0   (lines with "owned write to what it just read")
2.0.0-rc.23: 1   published 2026-11-16
2.0.0: 1
2.0.1: 1
2.0.2: 1
```

### scanDraws.mjs

```text
spell files: 598;  draw blocks: 301;  blocks with a write statement: 3
app/spaces/@spell/examples/RecipeCards/RecipeCard.spell:48: Add {its picked count} ticked items to the shopping list
app/spaces/@spell/examples/RecipeCards/RecipeEditor.spell:117: set this editor to it
app/spaces/@spell/examples/RecipeCards/RecipeEditor.spell:123: set this editor to it
```

### The probe, parser's core and spell tests

```text
Test Files  239 passed (239)
     Tests  6461 passed (6461)
{ testFiles: 239, filesWithOwnWrites: 0, ownWrites: 0, otherMarks: 167 }
```

## See also

- [cells-and-stores.md](cells-and-stores.md):  section 3 (D1), the first measurements and the loop
- `agents/solid/solid-2.md` (the kit):  "Rules when writing Solid code", writes
- the code-debt log's "Two reactive engines" (`spell.epics/agents/CODE-DEBT.md`)
- `@solidjs/signals` 2.0.3, `dist/dev-shared.js`:  `insertSubs()`, `recompute()`'s missed wake, `markLateLinker()`
