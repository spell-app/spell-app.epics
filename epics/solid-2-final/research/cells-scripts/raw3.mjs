// Read-after-write, part 3:  could a store be read fresh by a Spell statement and tracked by a drawing?
// Run:  node raw3.mjs <node_modules dir> [dev|prod]
const S = await import(`${process.argv[2]}/@solidjs/signals/dist/${(process.argv[3] ?? "dev") === "dev" ? "dev.js" : "prod/index.js"}`)
const { createStore, createMemo, createRoot, createRenderEffect, flush, snapshot, untrack, getObserver } = S
const show = (label, fn) => console.log(label.padEnd(72), "=>", JSON.stringify(fn()))
const warnings = []
console.warn = (...a) => warnings.push(String(a[0]).split("\n")[0].slice(0, 90))

const [store, setStore] = createStore({ notes: { title: "old" } })
setStore((d) => {
  d.notes.title = "new"
})
// a memo made right after the write, outside any flush:  does its first compute see the staging?
const m = createRoot(() => createMemo(() => store.notes.title))
show("9a a memo made right after the write, first compute", () => m())
show("9b snapshot(store.notes).title, outside any computation", () => snapshot(store.notes).title)
// "fresh if no observer, tracked if one":  the two-path read a compiled getter would do
const read = () => (getObserver() ? store.notes.title : snapshot(store.notes).title)
show("9c the two-path read, outside", read)
const inMemo = createRoot(() => createMemo(read))
show("9d the two-path read, inside a memo made now", () => inMemo())
flush()
show("9e after flush:  the memo", () => inMemo())
setStore((d) => {
  d.notes.title = "newer"
})
let seenInPass
createRoot(() =>
  createRenderEffect(
    () => {
      return read()
    },
    (v) => {
      seenInPass = v
    }
  )
)
show("9f a render effect made after a second write, before flush", () => seenInPass)
flush()
show("9g ... after flush", () => seenInPass)
console.log("warnings:", [...new Set(warnings)])
