// Option A's last hope:  does snapshot() see a store write made inside a Solid action, before and after a yield?
// Run:  node raw4.mjs <node_modules dir>
const S = await import(`${process.argv[2]}/@solidjs/signals/dist/dev.js`)
const { createStore, action, flush, snapshot } = S
const [store, setStore] = createStore({ score: 0 })
const seen = []
const act = action(function* () {
  setStore((d) => {
    d.score = 5
  })
  seen.push(["proxy", store.score], ["snapshot", snapshot(store).score])
  yield Promise.resolve()
  setStore((d) => {
    d.score = 6
  })
  seen.push(["after yield: proxy", store.score], ["after yield: snapshot", snapshot(store).score])
})
await act()
flush()
console.log("10 inside an action:", JSON.stringify(seen), " settled:", store.score)
