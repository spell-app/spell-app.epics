// Cost of read-after-write models:  Spell cells vs Solid 2 signals and stores.
// Run (one variant per process, so the cells bridge never taxes the Solid-only variants):
//   tsx bench.mts <variant> <node_modules dir> [prod|dev]
// Variants:  cells, slim (option D1, slim.mjs), signal-flush, store-draft, store-flush, store-flush100, store-snapshot, bigstore-draft, notifier
// Workloads, each the median of REPS runs, on fresh things every run:
//   construct  -- N things, 3 fields each
//   loop       -- W "set x to v;  read x" pairs, nobody drawing
//   mount      -- one render effect per field (3N readers)
//   loopDrawn  -- W pairs while every field is drawn, then one flush
//   update     -- write every thing's field a once, then flush (the screen catching up)
const variant = process.argv[2]
const nodeModules = process.argv[3]
const mode = process.argv[4] ?? "prod"
const KIT = "/Users/owen/www/spell.worktrees/solid-2-final"
const S: any = await import(`${nodeModules}/@solidjs/signals/dist/${mode === "dev" ? "dev.js" : "prod/index.js"}`)
const R: any =
  variant === "cells"
    ? await import(`${KIT}/src/util/reactive/index.ts`)
    : variant === "slim"
      ? await import("./slim.mjs")
      : undefined
const { createSignal, createStore, createRoot, createRenderEffect, flush, snapshot, getObserver } = S

const N = 20_000
const W = 200_000
const REPS = 7

if (variant === "cells") R.bridgeSolid({ enableExternalSource: S.enableExternalSource, flush })
// option D1:  the same accessors over a record, each cell with a value-less Solid signal, no bridge
if (variant === "slim") R.useSolid({ createSignal, getObserver, untrack: S.untrack, flush })
const settle = () => (R ? R.flushCells() : flush())

////////////////
// ## The models:  a "thing" with fields a, b, c;  write(thing, v) then read(thing)
////////////////

type Model = {
  make(i: number): any
  write(thing: any, value: number): void
  read(thing: any): number
  readers(thing: any): void
}

const FIELDS = ["a", "b", "c"] as const

/** Compiled Spell's shape:  accessors over the record (`getProp` / `setProp`). */
class CellThing {
  get a() {
    return R.getProp(this, "a")
  }
  set a(v) {
    R.setProp(this, "a", v)
  }
  get b() {
    return R.getProp(this, "b")
  }
  set b(v) {
    R.setProp(this, "b", v)
  }
  get c() {
    return R.getProp(this, "c")
  }
  set c(v) {
    R.setProp(this, "c", v)
  }
}

/** Spell UI's shape (`Reactive.ts`):  a record, and a value-less Solid signal per field made on its first tracked read. */
class NotifierThing {
  values: Record<string, number> = { a: 0, b: 0, c: 0 }
  notifiers: Record<string, any> = {}
  get(name: string) {
    if (getObserver()) (this.notifiers[name] ??= createSignal(undefined, { equals: false }))[0]()
    return this.values[name]
  }
  set(name: string, v: number) {
    if (this.values[name] === v) return
    this.values[name] = v
    this.notifiers[name]?.[1]()
  }
}

const drawn = (read: () => unknown) =>
  createRenderEffect(read, () => {
    /* the DOM write */
  })

const models: Record<string, Model> = {
  cells: {
    make(i) {
      const t = new CellThing()
      t.a = i
      t.b = i
      t.c = i
      return t
    },
    write: (t, v) => void (t.a = v),
    read: (t) => t.a,
    readers: (t) => FIELDS.forEach((f) => drawn(() => t[f]))
  },
  slim: {
    make(i) {
      const t = new CellThing()
      t.a = i
      t.b = i
      t.c = i
      return t
    },
    write: (t, v) => void (t.a = v),
    read: (t) => t.a,
    readers: (t) => FIELDS.forEach((f) => drawn(() => t[f]))
  },
  notifier: {
    make(i) {
      const t = new NotifierThing()
      t.set("a", i)
      t.set("b", i)
      t.set("c", i)
      return t
    },
    write: (t, v) => t.set("a", v),
    read: (t) => t.get("a"),
    readers: (t) => FIELDS.forEach((f) => drawn(() => t.get(f)))
  },
  "signal-flush": {
    make(i) {
      const t: any = {}
      for (const f of FIELDS) t[f] = createSignal(i)
      return t
    },
    write(t, v) {
      t.a[1](v)
      flush()
    },
    read: (t) => t.a[0](),
    readers: (t) => FIELDS.forEach((f) => drawn(() => t[f][0]()))
  },
  "store-draft": storeModel("none"),
  "store-flush": storeModel("each"),
  "store-flush100": storeModel(100),
  "store-snapshot": storeModel("none", true),
  "bigstore-draft": bigStoreModel()
}

/** One store per thing, written through its draft. */
function storeModel(flushEvery: "none" | "each" | number, readSnapshot = false): Model {
  let writes = 0
  return {
    make(i) {
      const [store, set] = createStore({ a: i, b: i, c: i })
      return { store, set }
    },
    write(t, v) {
      t.set((d: any) => {
        d.a = v
      })
      if (flushEvery === "each" || (typeof flushEvery === "number" && ++writes % flushEvery === 0)) flush()
    },
    read: readSnapshot ? (t) => snapshot(t.store).a : (t) => t.store.a,
    readers: (t) => FIELDS.forEach((f) => drawn(() => t.store[f]))
  }
}

/** One store holding every thing, written through its draft by index. */
function bigStoreModel(): Model {
  let big: any
  return {
    make(i) {
      if (i === 0) big = createStore({ things: [] as any[] })
      big[1]((d: any) => {
        d.things.push({ a: i, b: i, c: i })
      })
      return { i, big }
    },
    write(t, v) {
      t.big[1]((d: any) => {
        d.things[t.i].a = v
      })
    },
    read: (t) => t.big[0].things[t.i].a,
    readers: (t) => FIELDS.forEach((f) => drawn(() => t.big[0].things[t.i][f]))
  }
}

////////////////
// ## Running
////////////////

const model = models[variant]
if (!model) throw new Error(`no variant ${variant}`)

const times: Record<string, number[]> = { construct: [], loop: [], mount: [], loopDrawn: [], update: [] }
let stale = { loop: 0, loopDrawn: 0 }

for (let rep = 0; rep < REPS; rep++) {
  let things: any[] = []
  let t0 = performance.now()
  for (let i = 0; i < N; i++) things.push(model.make(i))
  settle()
  times.construct.push(performance.now() - t0)

  let wrong = 0
  t0 = performance.now()
  for (let w = 0; w < W; w++) {
    const thing = things[w % N]
    const v = rep * 1e7 + w + 1
    model.write(thing, v)
    if (model.read(thing) !== v) wrong++
  }
  settle()
  times.loop.push(performance.now() - t0)
  stale.loop = wrong

  let dispose!: () => void
  t0 = performance.now()
  createRoot((d: () => void) => {
    dispose = d
    for (const thing of things) model.readers(thing)
  })
  settle()
  times.mount.push(performance.now() - t0)

  wrong = 0
  t0 = performance.now()
  for (let w = 0; w < W; w++) {
    const thing = things[w % N]
    const v = rep * 1e7 + 5e6 + w + 1
    model.write(thing, v)
    if (model.read(thing) !== v) wrong++
  }
  settle()
  times.loopDrawn.push(performance.now() - t0)
  stale.loopDrawn = wrong

  t0 = performance.now()
  for (let i = 0; i < N; i++) model.write(things[i], -i - rep)
  settle()
  times.update.push(performance.now() - t0)

  dispose()
  things = []
}

const median = (list: number[]) => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)]
const row = Object.fromEntries(Object.entries(times).map(([k, v]) => [k, +median(v).toFixed(1)]))
console.log(
  JSON.stringify({
    variant,
    mode,
    version: (await import(`${nodeModules}/@solidjs/signals/package.json`, { with: { type: "json" } })).default.version,
    ...row,
    staleReads: stale
  })
)
