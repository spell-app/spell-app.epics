// Memory per value:  N things of 3 fields, then one drawn reader per field.
// Run:  NODE_OPTIONS=--expose-gc tsx memory.mts <variant> <node_modules dir>
// - "per value":  heap after making the things, minus before, over 3N
// - "per reader": heap after mounting 3N render effects, minus after the things, over 3N
//   (the reader's own cost:  Solid's node, plus the cells bridge's Reaction where there is one)
const variant = process.argv[2]
const nodeModules = process.argv[3]
const KIT = "/Users/owen/www/spell.worktrees/solid-2-final"
const S: any = await import(`${nodeModules}/@solidjs/signals/dist/prod/index.js`)
const R: any = variant.startsWith("cells") ? await import(`${KIT}/src/util/reactive/index.ts`) : undefined
const { createSignal, createStore, createRoot, createRenderEffect, flush, getObserver } = S
if (R) R.bridgeSolid({ enableExternalSource: S.enableExternalSource, flush })
// the floor:  Solid's own wiring for an external source, with a factory that does nothing
if (variant === "noop-source-plain")
  S.enableExternalSource({ factory: (compute: any) => ({ track: (previous: any) => compute(previous), dispose() {} }) })
const gc = (globalThis as any).gc as () => void
const N = 50_000
const heap = () => {
  gc()
  gc()
  return process.memoryUsage().heapUsed
}

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
class PlainThing {
  a = 0
  b = 0
  c = 0
}
class NotifierThing {
  values: Record<string, number> = { a: 0, b: 0, c: 0 }
  notifiers: Record<string, any> = {}
  get(name: string) {
    if (getObserver()) (this.notifiers[name] ??= createSignal(undefined, { equals: false }))[0]()
    return this.values[name]
  }
}

const make: Record<string, (i: number) => any> = {
  plain: (i) => Object.assign(new PlainThing(), { a: i, b: i, c: i }),
  cells: (i) => Object.assign(new CellThing(), { a: i, b: i, c: i }),
  notifier: (i) => {
    const t = new NotifierThing()
    t.values = { a: i, b: i, c: i }
    return t
  },
  signals: (i) => ({ a: createSignal(i), b: createSignal(i), c: createSignal(i) }),
  store: (i) => createStore({ a: i, b: i, c: i }),
  // plain fields, but the cells bridge installed:  what every Solid computation on a Spell page pays
  "cells-bridge-plain": (i) => Object.assign(new PlainThing(), { a: i, b: i, c: i }),
  "noop-source-plain": (i) => Object.assign(new PlainThing(), { a: i, b: i, c: i })
}
const reader: Record<string, (t: any, f: string) => () => unknown> = {
  plain: (t, f) => () => t[f],
  cells: (t, f) => () => t[f],
  notifier: (t, f) => () => t.get(f),
  signals: (t, f) => () => t[f][0](),
  store: (t, f) => () => t[0][f],
  "cells-bridge-plain": (t, f) => () => t[f],
  "noop-source-plain": (t, f) => () => t[f]
}

const base = heap()
const things: any[] = []
for (let i = 0; i < N; i++) things.push(make[variant](i))
const afterThings = heap()
let dispose: () => void = () => {}
createRoot((d: () => void) => {
  dispose = d
  for (const t of things) for (const f of ["a", "b", "c"]) createRenderEffect(reader[variant](t, f), () => {})
})
R ? R.flushCells() : flush()
const afterReaders = heap()
console.log(
  JSON.stringify({
    variant,
    version: (await import(`${nodeModules}/@solidjs/signals/package.json`, { with: { type: "json" } })).default.version,
    bytesPerValue: Math.round((afterThings - base) / (3 * N)),
    bytesPerReader: Math.round((afterReaders - afterThings) / (3 * N))
  })
)
dispose()
