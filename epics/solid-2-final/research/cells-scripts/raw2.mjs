// Read-after-write, part 2:  the edges a Spell program hits.
// Run:  node raw2.mjs <node_modules dir> [dev|prod]
const nodeModules = process.argv[2]
const mode = process.argv[3] ?? "dev"
const S = await import(`${nodeModules}/@solidjs/signals/dist/${mode === "dev" ? "dev.js" : "prod/index.js"}`)
const pkg = (await import(`${nodeModules}/@solidjs/signals/package.json`, { with: { type: "json" } })).default
const {
  createSignal,
  createMemo,
  createRoot,
  createEffect,
  createRenderEffect,
  createStore,
  createProjection,
  action,
  flush,
  latest,
  isPending,
  snapshot,
  markRaw
} = S
const log = (...a) => console.log(...a)
const show = (label, fn) => {
  try {
    log(label.padEnd(66), "=>", JSON.stringify(fn()))
  } catch (e) {
    log(label.padEnd(66), "THREW", e?.constructor?.name, String(e?.message).split("\n")[0].slice(0, 110))
  }
}
const warnings = []
console.warn = (...a) => warnings.push(String(a[0]).split("\n")[0].slice(0, 100))
console.error = (...a) => warnings.push("error: " + String(a[0]).split("\n")[0].slice(0, 100))
log(`@solidjs/signals ${pkg.version}, ${mode}`)

////////////////
log("\n## 4. where a Spell write can happen")
{
  // a store write inside a memo (Spell's draw() may write spell state)
  const [store, setStore] = createStore({ n: 0 })
  const m = createRoot(() =>
    createMemo(() => {
      try {
        setStore((d) => {
          d.n = 1
        })
        return "wrote, read " + store.n
      } catch (e) {
        return "THREW " + String(e.message).split("\n")[0].slice(0, 80)
      }
    })
  )
  show("4a store write in a memo compute", () => m())
  flush()
  show("4a' after flush", () => store.n)
}

{
  // flush() inside an effect's apply
  const [x, setX] = createSignal(1)
  const [go, setGo] = createSignal(0)
  const seen = []
  createRoot(() =>
    createEffect(
      () => go(),
      (value) => {
        if (!value) return
        setX(2)
        try {
          flush()
          seen.push("flushed, x = " + x())
        } catch (e) {
          seen.push("THREW " + String(e.message).split("\n")[0].slice(0, 60))
        }
      }
    )
  )
  flush()
  setGo(1)
  flush()
  show("4b flush() in an effect apply, then x()", () => seen)
}

{
  // flush() inside an action
  const [x, setX] = createSignal(1)
  const seen = []
  const act = action(function* () {
    setX(2)
    try {
      flush()
      seen.push("flushed, x = " + x())
    } catch (e) {
      seen.push("THREW " + String(e.message).split("\n")[0].slice(0, 60))
    }
    yield Promise.resolve()
  })
  await act()
  flush()
  show("4c flush() in an action, then x()", () => seen)
}

////////////////
log("\n## 5. entangled with async:  flush() is not enough")
{
  const [store, setStore] = createStore({ query: "a", score: 0 })
  let resolveFetch
  const results = createRoot(() => {
    const r = createMemo(async () => {
      const q = store.query
      await new Promise((resolve) => (resolveFetch = resolve))
      return "results for " + q
    })
    createRenderEffect(
      () => r(),
      () => {}
    )
    return r
  })
  flush()
  resolveFetch()
  await new Promise((resolve) => setTimeout(resolve, 0))
  flush()
  show("5a settled:  results()", () => results())
  setStore((d) => {
    d.query = "b"
    d.score = 5
  })
  flush()
  show("5b query and score in one setter;  flush;  score", () => store.score)
  show("5c snapshot(store).score", () => snapshot(store).score)
  show("5d isPending(() => store.score)", () => isPending(() => store.score))
  show("5e latest(() => store.score)", () => latest(() => store.score))
  resolveFetch()
  await new Promise((resolve) => setTimeout(resolve, 0))
  flush()
  show("5f after the fetch:  score", () => store.score)

  setStore((d) => {
    d.query = "c"
  })
  setStore((d) => {
    d.score = 6
  })
  flush()
  show("5g query, then score in another setter, same batch;  score", () => store.score)
  resolveFetch()
  await new Promise((resolve) => setTimeout(resolve, 0))
  flush()
  setStore((d) => {
    d.query = "d"
  })
  flush()
  setStore((d) => {
    d.score = 7
  })
  flush()
  show("5h score in a LATER flush;  score", () => store.score)
  resolveFetch()
  await new Promise((resolve) => setTimeout(resolve, 0))
  flush()
}

////////////////
log("\n## 6. stores and class instances")
{
  class Card {
    rank = "ace"
    get label() {
      return this.rank + "!"
    }
  }
  const card = new Card()
  const [store, setStore] = createStore({ card })
  show("6a store.card === card (wrapped?)", () => store.card === card)
  show("6b store.card instanceof Card", () => store.card instanceof Card)
  setStore((d) => {
    d.card.rank = "king"
  })
  flush()
  show("6c after a draft write:  card.rank (the instance itself)", () => card.rank)
  show("6d store.card.label", () => store.card.label)
  if (markRaw) {
    class Raw {
      rank = "ace"
    }
    markRaw(Raw)
    const raw = new Raw()
    const [s2] = createStore({ raw })
    show("6e markRaw(Class):  store.raw === raw", () => s2.raw === raw)
  } else log("6e markRaw:  not exported")
}

////////////////
log("\n## 7. projections")
{
  const [store, setStore] = createStore({ selected: 1, rows: [{ id: 1 }, { id: 2 }, { id: 3 }] })
  let runs = 0
  const isSelected = createRoot(() =>
    createProjection((draft) => {
      runs++
      const id = store.selected
      for (const key of Object.keys(draft)) if (Number(key) !== id) delete draft[key]
      draft[id] = true
    }, {})
  )
  const rowRuns = [0, 0, 0, 0]
  createRoot(() => {
    for (const id of [1, 2, 3])
      createRenderEffect(
        () => !!isSelected[id],
        () => {
          rowRuns[id]++
        }
      )
  })
  flush()
  setStore((d) => {
    d.selected = 3
  })
  show("7a projection before flush:  isSelected[3]", () => !!isSelected[3])
  flush()
  show("7b after flush:  isSelected[1], [3]", () => [!!isSelected[1], !!isSelected[3]])
  show("7c row effects re-run (1, 2, 3)", () => rowRuns.slice(1))
}

////////////////
log("\n## 8. many nested writes, one notification")
{
  const [store, setStore] = createStore({ a: { b: { c: 0 } }, list: [] })
  let runs = 0
  createRoot(() =>
    createRenderEffect(
      () => [store.a.b.c, store.list.length],
      () => {
        runs++
      }
    )
  )
  flush()
  runs = 0
  setStore((d) => {
    for (let i = 0; i < 100; i++) {
      d.a.b.c = i
      d.list.push(i)
    }
  })
  for (let i = 0; i < 100; i++)
    setStore((d) => {
      d.a.b.c += 1
    })
  flush()
  show("8a 200 nested writes in 101 setters, one flush:  effect runs", () => runs)
  show("8b values", () => [store.a.b.c, store.list.length])
  const before = snapshot(store)
  setStore((d) => {
    d.a.b.c = -1
  })
  flush()
  const after = snapshot(store)
  show("8c structural sharing:  after.list === before.list", () => after.list === before.list)
  show("8d after.a === before.a", () => after.a === before.a)
  show("8e snapshot twice, no write:  same object?", () => snapshot(store) === snapshot(store))
}

log("\nwarnings:", [...new Set(warnings)])
