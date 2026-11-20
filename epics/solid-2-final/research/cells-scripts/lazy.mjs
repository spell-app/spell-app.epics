// Option D2, a prototype:  spell cells with NO enableExternalSource -- a "lazy bridge".
// - The value stays in the object's record (the only copy), read and written synchronously.
// - A Solid computation gets a cells reader (today's `Reaction`, as `SolidReader`) only when it first reads a cell:
//   Spell UI's and the editor's own computations, which read none, pay nothing.
//   - The reader holds one value-less Solid signal, read inside the computation, so Solid re-runs it.
//   - It forgets what it read when Solid cleans the computation up (`onCleanup`), before each re-run.
//   - A change made WHILE its computation runs never wakes it (a drawing writing what it read):  as today's `Reaction`.
// - Derived values keep today's push-pull and equality cutoff:  a reader of one is checked on a microtask.
// - Solid is handed in (`useSolid()`), so this file imports none, as `spell/util` mustn't.

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
  const observer = solid?.getObserver()
  if (!observer) return
  let reader = solidReaders.get(observer)
  if (!reader) solidReaders.set(observer, (reader = new SolidReader(observer)))
  reader.link(source)
}

/** Each Solid computation's cells reader, made on its first read of a cell. */
const solidReaders = new WeakMap()

/** A Solid computation, as a reader of cells:  today's `Reaction`, made only where a cell is read. */
class SolidReader {
  srcs = new Map()
  isLinked = false
  signal = solid.createSignal(undefined, { equals: false, ownedWrite: true })
  constructor(observer) {
    this.observer = observer
  }
  link(source) {
    if (!this.isLinked) {
      this.isLinked = true
      this.signal[0]()
      solid.onCleanup(() => {
        unlink(this)
        pendingChecks.delete(this)
        this.isLinked = false
      })
    }
    ;(source.subs ??= new Set()).add(this)
    this.srcs.set(source, source.version)
  }
  mark(state) {
    if (solid.getObserver() === this.observer) return
    if (state === DIRTY) this.signal[1]()
    else scheduleCheck(this)
  }
  check() {
    if (sourcesChanged(this)) this.signal[1]()
  }
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

  read() {
    link(this)
  }
  changed() {
    this.version++
    if (this.subs) for (const reader of [...this.subs]) reader.mark(DIRTY)
  }
}

export class Derived {
  version = 0
  srcs = new Map()
  subs = null

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
  }
  refresh() {
    if (this.state === CHECK) this.state = sourcesChanged(this) ? DIRTY : CLEAN
    if (this.state !== DIRTY) return
    unlink(this)
    const outer = collector
    collector = this
    let next
    try {
      // its reads are its own:  a Solid reader links to the derived value, not to its sources
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
