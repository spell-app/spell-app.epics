// Read-after-write in Solid 2:  signals and stores, every place a Spell statement could run.
// Run:  node raw.mjs <node_modules dir> [dev|prod]
// - imports @solidjs/signals by path (what solid-js re-exports), so no install is needed
const nodeModules = process.argv[2]
const mode = process.argv[3] ?? "dev"
const S = await import(`${nodeModules}/@solidjs/signals/dist/${mode === "dev" ? "dev.js" : "prod/index.js"}`)
const pkg = (await import(`${nodeModules}/@solidjs/signals/package.json`, { with: { type: "json" } })).default
const {
  createSignal,
  createMemo,
  createRoot,
  createEffect,
  createStore,
  createOptimistic,
  createOptimisticStore,
  action,
  flush,
  latest,
  isPending,
  snapshot,
  untrack,
  storePath,
  onSettled
} = S
const log = (...a) => console.log(...a)
const show = (label, fn) => {
  try {
    log(label.padEnd(62), "=>", JSON.stringify(fn()))
  } catch (e) {
    log(label.padEnd(62), "THREW", e?.constructor?.name, String(e?.message).split("\n")[0].slice(0, 120))
  }
}
const origWarn = console.warn
const warnings = []
console.warn = (...a) => warnings.push(String(a[0]).split("\n")[0].slice(0, 100))
log(`@solidjs/signals ${pkg.version}, ${mode}`)

////////////////
log("\n## 1. a signal")
{
  const [x, setX] = createSignal(1)
  setX(5)
  show("1a top level:  setX(5);  x()", () => x())
  show("1b latest(x)", () => latest(x))
  show("1c untrack(x)", () => untrack(x))
  show("1d isPending(x)", () => isPending(x))
  let peek
  setX((previous) => ((peek = previous), previous))
  show("1e setX(p => p) peeks", () => peek)
  flush()
  show("1f after flush():  x()", () => x())
  flush(() => {
    setX(6)
    show("1g inside flush(fn):  setX(6);  x()", () => x())
  })
  show("1h after flush(fn)", () => x())
}

{
  // an event-handler-like callback:  no owner, no observer
  const [x, setX] = createSignal(1)
  const handler = () => {
    setX(2)
    return x()
  }
  show("1i 'event handler':  setX(2);  return x()", handler)
  flush()
}

{
  // inside an effect's apply
  const [x, setX] = createSignal(1)
  const [go, setGo] = createSignal(0)
  const seen = []
  createRoot(() =>
    createEffect(
      () => go(),
      (value) => {
        if (!value) return
        setX(10)
        seen.push(x())
      }
    )
  )
  flush()
  setGo(1)
  flush()
  show("1j effect apply:  setX(10);  x()", () => seen)
  show("1j' after the flush", () => x())
}

{
  // inside a memo's compute, with ownedWrite
  const [x, setX] = createSignal(1, { ownedWrite: true })
  const m = createRoot(() =>
    createMemo(() => {
      setX(20)
      return x()
    })
  )
  show("1k memo compute (ownedWrite):  setX(20);  x()", () => m())
  flush()
}

{
  // an action
  const [x, setX] = createSignal(1)
  const seen = []
  const act = action(function* () {
    setX(30)
    seen.push(["sync", x()])
    yield Promise.resolve()
    seen.push(["after yield", x()])
    setX(31)
    seen.push(["after yield + write", x()])
  })
  const done = act()
  show("1l action, synchronous part:  setX(30);  x()", () => seen[0])
  await done
  flush()
  show("1m action after yield:  x(), setX(31), x()", () => seen.slice(1))
  show("1n after the action settles", () => x())
}

////////////////
log("\n## 2. a store")
{
  const source = { a: { b: 0 }, list: [1, 2] }
  const [store, setStore] = createStore(source)
  setStore((draft) => {
    draft.a.b = 1
  })
  show("2a draft write;  store.a.b", () => store.a.b)
  show("2b latest(() => store.a.b)", () => latest(() => store.a.b))
  show("2c snapshot(store).a.b", () => snapshot(store).a.b)
  let peek
  setStore((draft) => {
    peek = draft.a.b
  })
  show("2d a second setter reads draft.a.b", () => peek)
  show("2e the source object:  source.a.b", () => source.a.b)
  flush()
  show("2f after flush:  store.a.b", () => store.a.b)
  show("2g after flush:  source.a.b (CoW?)", () => source.a.b)
  show("2h store.a === source.a (unwrapped)", () => snapshot(store).a === source.a)
  setStore(storePath("a", "b", 2))
  show("2i storePath write;  store.a.b", () => store.a.b)
  flush()
  show("2j after flush", () => store.a.b)
  setStore((draft) => {
    draft.list.push(3)
    draft.a.b = 3
    draft.a.c = "new"
  })
  show("2k push + two writes;  store.list.length, a.c", () => [store.list.length, store.a.c])
  flush()
  show("2l after flush", () => [store.list.length, store.a.c])
  store.a.b = 99
  flush()
  show("2m direct store.a.b = 99, flushed", () => store.a.b)
}

{
  // a store written in an action
  const [store, setStore] = createStore({ score: 0 })
  const seen = []
  const act = action(function* () {
    setStore((d) => {
      d.score = 5
    })
    seen.push(store.score)
    yield Promise.resolve()
    seen.push(store.score)
  })
  await act()
  flush()
  show("2n action:  write;  read;  yield;  read", () => seen)
  show("2o settled", () => store.score)
}

{
  // a derived store
  const [base, setBase] = createStore({ n: 1 })
  const doubled = createRoot(() => createStore(() => ({ n: base.n * 2 }))[0])
  show("2p createStore(fn):  doubled.n", () => doubled.n)
  setBase((d) => {
    d.n = 4
  })
  show("2q write base;  doubled.n before flush", () => doubled.n)
  flush()
  show("2r after flush", () => doubled.n)
}

////////////////
log("\n## 3. optimistic")
{
  const [score, setScore] = createOptimistic(0)
  const seen = []
  let release
  const act = action(function* () {
    setScore(1)
    seen.push(["sync", score()])
    yield new Promise((resolve) => (release = resolve))
    seen.push(["after yield", score()])
  })
  const done = act()
  flush()
  show("3a optimistic, after flush, action open:  score()", () => score())
  show("3b isPending(score)", () => isPending(score))
  release()
  await done
  flush()
  show("3c settled (reverts to its source)", () => score())
  show("3d inside", () => seen)
}

{
  const [todos, setTodos] = createOptimisticStore([{ id: 1, done: false }])
  let release
  const act = action(function* () {
    setTodos((d) => {
      d[0].done = true
    })
    yield new Promise((resolve) => (release = resolve))
  })
  const done = act()
  flush()
  show("3e optimistic store, action open:  todos[0].done", () => todos[0].done)
  release()
  await done
  flush()
  show("3f settled:  todos[0].done (reverts)", () => todos[0].done)
}

console.warn = origWarn
log("\nwarnings:", [...new Set(warnings)])
