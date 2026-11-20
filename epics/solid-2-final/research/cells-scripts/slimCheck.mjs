// Does option D (slim.mjs) keep what Spell needs?  Each line says what it checks and what happened.
// Run:  node slimCheck.mjs <node_modules dir> [dev|prod]
const nodeModules = process.argv[2]
const mode = process.argv[3] ?? "dev"
const S = await import(`${nodeModules}/@solidjs/signals/dist/${mode === "dev" ? "dev.js" : "prod/index.js"}`)
const C = await import(process.env.CELLS_MODULE ?? "./slim.mjs")
const { createSignal, createMemo, createRoot, createRenderEffect, flush, getObserver, untrack } = S
C.useSolid({ createSignal, getObserver, untrack, flush, onCleanup: S.onCleanup })
const warnings = []
console.warn = (...a) => warnings.push(String(a[0]).split("\n")[0].slice(0, 100))
const log = (label, value) => console.log(label.padEnd(70), "=>", JSON.stringify(value))

class Card {
  get rank() {
    return C.getProp(this, "rank")
  }
  set rank(v) {
    C.setProp(this, "rank", v)
  }
  get suit() {
    return C.getProp(this, "suit")
  }
  set suit(v) {
    C.setProp(this, "suit", v)
  }
  get isRed() {
    return C.derive(this, "isRed", function () {
      return this.suit === "hearts" || this.suit === "diamonds"
    })
  }
  get label() {
    return C.derive(this, "label", function () {
      return this.rank + (this.isRed ? " (red)" : " (black)")
    })
  }
}

const card = new Card()
card.rank = "ace"
card.suit = "spades"
card.rank = "king"
log("1 read after write, no flush:  card.rank", card.rank)
log("2 derived right after a write:  card.isRed", card.isRed)
card.suit = "hearts"
log("3 a nested derived right after a write:  card.label", card.label)

let rankRuns = 0
let redRuns = 0
let labelSeen = []
createRoot(() => {
  createRenderEffect(
    () => card.rank,
    () => {
      rankRuns++
    }
  )
  createRenderEffect(
    () => card.isRed,
    () => {
      redRuns++
    }
  )
  createRenderEffect(
    () => card.label,
    (v) => {
      labelSeen.push(v)
    }
  )
})
flush()
card.rank = "queen"
C.flushCells()
log("4 Solid reader of a cell re-runs (runs incl. the first)", rankRuns)
card.suit = "diamonds" // still red:  isRed doesn't change
C.flushCells()
log("5 equality cutoff:  isRed's reader didn't re-run (runs)", redRuns)
log("6 label's reader saw", labelSeen)
card.rank = "jack"
card.rank = "ten"
card.rank = "nine"
C.flushCells()
log("7 three writes, one re-run (rank runs)", rankRuns)

// a drawing (a memo) that writes spell state:  no throw, no loop
const pile = {}
let drawRuns = 0
const drawing = createRoot(() =>
  createMemo(() => {
    drawRuns++
    const n = (C.getProp(pile, "count") ?? 0) + 1
    C.setProp(pile, "count", n) // the draw writes what it read
    return "count " + C.getProp(pile, "count")
  })
)
log("8 a drawing writing what it read:  its value", (() => drawing())())
C.flushCells()
C.flushCells()
log("9 ... it ran (times;  1-2 means no loop)", drawRuns)

// the Inspector's question
const sources = C.sourcesReadBy(() => card.label)
log("10 sourcesReadBy(label):  cells and derived values found", sources.size)

// observe() for plain code
const seen = []
const stop = C.observe(() => seen.push(card.rank))
card.rank = "eight"
log("11 observe() re-ran synchronously", seen)
stop()

// a write inside an effect apply, read back at once
const [go, setGo] = createSignal(0)
const applySeen = []
createRoot(() =>
  createRenderEffect(
    () => go(),
    (v) => {
      if (!v) return
      card.rank = "seven"
      applySeen.push(card.rank)
    }
  )
)
flush()
setGo(1)
flush()
log("12 write + read in an effect apply", applySeen)

// inside a Solid action
const seenInAction = []
const deal = S.action(function* () {
  card.rank = "six"
  seenInAction.push(card.rank)
  yield Promise.resolve()
  card.rank = "five"
  seenInAction.push(card.rank)
})
await deal()
log("13 write + read inside a Solid action, before and after a yield", seenInAction)

console.log("warnings:", [...new Set(warnings)])
