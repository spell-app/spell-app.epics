// Today's spell cells (the kit's `spell/util/reactive`, bridged), on the same checks as slimCheck.mjs.
// Run:  tsx cellsCheck.mts <node_modules dir> [dev|prod]
const nodeModules = process.argv[2]
const mode = process.argv[3] ?? "dev"
const KIT = "/Users/owen/www/spell.worktrees/solid-2-final"
const S: any = await import(`${nodeModules}/@solidjs/signals/dist/${mode === "dev" ? "dev.js" : "prod/index.js"}`)
const C: any = await import(`${KIT}/src/util/reactive/index.ts`)
const { createSignal, createMemo, createRoot, createRenderEffect, flush } = S
C.bridgeSolid({ enableExternalSource: S.enableExternalSource, flush })
const warnings: string[] = []
console.warn = (...a: unknown[]) => warnings.push(String(a[0]).split("\n")[0].slice(0, 100))
const log = (label: string, value: unknown) => console.log(label.padEnd(70), "=>", JSON.stringify(value))

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
    return C.derive(this, "isRed", function (this: Card) {
      return this.suit === "hearts" || this.suit === "diamonds"
    })
  }
}
const card = new Card()
card.rank = "ace"
card.suit = "spades"
let redRuns = 0
createRoot(() =>
  createRenderEffect(
    () => card.isRed,
    () => {
      redRuns++
    }
  )
)
flush()
card.suit = "clubs"
C.flushCells()
log("5 equality cutoff:  isRed's reader didn't re-run (runs)", redRuns)

const pile: any = {}
let drawRuns = 0
const drawing = createRoot(() =>
  createMemo(() => {
    drawRuns++
    const n = (C.getProp(pile, "count") ?? 0) + 1
    C.setProp(pile, "count", n)
    return "count " + C.getProp(pile, "count")
  })
)
log("8 a drawing writing what it read:  its value", drawing())
C.flushCells()
C.flushCells()
log("9 ... it ran (times;  1-2 means no loop)", drawRuns)

const seenInAction: string[] = []
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
