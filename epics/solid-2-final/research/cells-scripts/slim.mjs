// Option D, a prototype:  spell cells with NO bridge.
// - The value stays in the object's record (the only copy), read and written synchronously.
// - Each cell keeps a value-less Solid signal, made on its first read inside a Solid computation:
//   Solid tracks it natively, so no `enableExternalSource`, no `Reaction` per Solid computation.
// - Solid is handed in (`useSolid()`), so this file imports none, as `spell/util` mustn't.
// - Plain readers (`observe()`, `sourcesReadBy()`) and derived values still use the cells' own collector,
//   with the same push-pull as today's `Derived` (clean / check / dirty).
// - A derived value keeps the equality cutoff for Solid readers too:  when a source changes it's checked
//   on a microtask (or `flushCells()`), and tells its Solid readers only if its value really changed.

let solid // { createSignal, getObserver, untrack, flush }
export function useSolid(s) {
  solid = s
}

const CLEAN = 0
const CHECK = 1
const DIRTY = 2
let collector = null // a plain reader or derived value collecting
const pendingChecks = new Set()
let checkScheduled = false

/** Is anyone reading now:  a plain reader, a derived value, or a Solid computation? */
const isTracking = () => collector !== null || (solid !== undefined && solid.getObserver() !== null)

function link(source) {
  if (collector) {
    ;(source.subs ??= new Set()).add(collector)
    collector.srcs.set(source, source.version)
  }
  if (solid && solid.getObserver()) (source.signal ??= solid.createSignal(undefined, { equals: false, ownedWrite: true }))[0]()
}

function unlink(reader) {
  for (const source of reader.srcs.keys()) source.subs?.delete(reader)
  reader.srcs.clear()
}

function sourcesChanged(reader) {
  for (const [source, seen] of reader.srcs) {
    source.refresh?.()
    if (source.version !== seen) return true
  }
  return false
}

export class Cell {
  version = 0
  subs = null
  signal = null
  read() {
    link(this)
  }
  changed() {
    this.version++
    this.signal?.[1]()
    if (this.subs) for (const reader of [...this.subs]) reader.mark(DIRTY)
  }
}

export class Derived {
  version = 0
  srcs = new Map()
  subs = null
  signal = null
  state = DIRTY
  value
  constructor(fn, self, equals = (a, b) => a === b) {
    this.fn = fn
    this.self = self
    this.equals = equals
  }
  mark(state) {
    if (this.state >= state) return
    const wasClean = this.state === CLEAN
    this.state = state
    if (!wasClean) return
    if (this.subs) for (const reader of [...this.subs]) reader.mark(CHECK)
    if (this.signal) scheduleCheck(this)
  }
  refresh() {
    if (this.state === CHECK) this.state = sourcesChanged(this) ? DIRTY : CLEAN
    if (this.state !== DIRTY) return
    unlink(this)
    const outer = collector
    collector = this
    let next
    try {
      // its reads are its own:  a Solid reader follows the derived value's signal, not its sources'
      next = solid ? solid.untrack(() => this.fn.call(this.self)) : this.fn.call(this.self)
    } finally {
      collector = outer
    }
    this.state = CLEAN
    if (this.version === 0 || !this.equals(this.value, next)) {
      this.value = next
      this.version++
    }
  }
  /** A microtask after a source changed:  tell Solid's readers only if the value really moved. */
  check() {
    const before = this.version
    this.refresh()
    if (this.version !== before) this.signal?.[1]()
  }
  get() {
    this.refresh()
    link(this)
    return this.value
  }
}

function scheduleCheck(item) {
  pendingChecks.add(item)
  if (checkScheduled) return
  checkScheduled = true
  queueMicrotask(runChecks)
}
export function runChecks() {
  checkScheduled = false
  const list = [...pendingChecks]
  pendingChecks.clear()
  for (const item of list) item.check()
}

/** `core.flush()`:  derived checks first, then Solid's. */
export function flushCells() {
  runChecks()
  solid?.flush()
}

/** What `read()` read, all the way down (the Inspector's "worked out from", `Places.originOf()`). */
export function sourcesReadBy(read) {
  const reader = { srcs: new Map(), mark() {} }
  const outer = collector
  collector = reader
  try {
    read()
  } finally {
    collector = outer
  }
  const sources = new Set()
  const toVisit = [...reader.srcs.keys()]
  unlink(reader)
  for (let s = toVisit.pop(); s; s = toVisit.pop()) {
    if (sources.has(s)) continue
    sources.add(s)
    if (s.srcs) toVisit.push(...s.srcs.keys())
  }
  return sources
}

/** `observe(fn)`:  plain code re-run as what it read changes (synchronously;  a derived source on a microtask). */
export function observe(fn) {
  const reader = {
    srcs: new Map(),
    running: false,
    mark(state) {
      if (this.running) return
      if (state === DIRTY) run()
      else scheduleCheck(this)
    },
    check() {
      if (!this.running && sourcesChanged(this)) run()
    }
  }
  const run = () => {
    unlink(reader)
    const outer = collector
    collector = reader
    reader.running = true
    try {
      fn()
    } finally {
      reader.running = false
      collector = outer
    }
  }
  run()
  return () => unlink(reader)
}

////////////////
// ## The records, as `extend.ts` keeps them
////////////////

const PROPS = Symbol("props")
const CELLS = Symbol("cells")
const DERIVED = Symbol("derived")

export function getProp(target, name) {
  if (isTracking()) {
    const cells = (target[CELLS] ??= new Map())
    let cell = cells.get(name)
    if (!cell) cells.set(name, (cell = new Cell()))
    cell.read()
  }
  return target[PROPS]?.get(name)
}

export function setProp(target, name, value) {
  const record = (target[PROPS] ??= new Map())
  if (record.has(name) && record.get(name) === value) return value
  record.set(name, value)
  target[CELLS]?.get(name)?.changed()
  return value
}

export function derive(target, name, fn, equals) {
  const all = (target[DERIVED] ??= new Map())
  let derived = all.get(name)
  if (!derived) all.set(name, (derived = new Derived(fn, target, equals)))
  return derived.get()
}
