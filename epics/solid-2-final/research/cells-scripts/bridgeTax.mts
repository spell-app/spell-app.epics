// The cells bridge's tax on Solid computations that read NO cell (Spell UI's, the editor's own):
// mount 60k render effects over plain signals, then update them all, with and without `bridgeSolid()`.
// Run:  tsx bridgeTax.mts <bridged|noop-source|bare> <node_modules dir>
const which = process.argv[2]
const nodeModules = process.argv[3]
const KIT = "/Users/owen/www/spell.worktrees/solid-2-final"
const S: any = await import(`${nodeModules}/@solidjs/signals/dist/prod/index.js`)
const { createSignal, createRoot, createRenderEffect, flush } = S
if (which === "noop-source") {
  // the floor:  Solid's own wiring for an external source, with a factory that does nothing
  S.enableExternalSource({ factory: (compute: any) => ({ track: (previous: any) => compute(previous), dispose() {} }) })
}
if (which === "bridged") {
  const R: any = await import(`${KIT}/src/util/reactive/index.ts`)
  R.bridgeSolid({ enableExternalSource: S.enableExternalSource, flush })
}
const N = 60_000
const REPS = 7
const mount: number[] = []
const update: number[] = []
for (let rep = 0; rep < REPS; rep++) {
  const signals = Array.from({ length: N }, (_, i) => createSignal(i))
  let t0 = performance.now()
  let dispose!: () => void
  createRoot((d: () => void) => {
    dispose = d
    for (const [read] of signals) createRenderEffect(read, () => {})
  })
  flush()
  mount.push(performance.now() - t0)
  t0 = performance.now()
  for (const [, write] of signals) write((v: number) => v + 1)
  flush()
  update.push(performance.now() - t0)
  dispose()
}
const median = (list: number[]) => +[...list].sort((a, b) => a - b)[Math.floor(list.length / 2)].toFixed(1)
console.log(JSON.stringify({ which, mount: median(mount), update: median(update) }))
