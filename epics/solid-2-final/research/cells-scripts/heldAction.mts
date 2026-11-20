// Cells as the truth, a Solid action around a Spell action:  does the SCREEN hold until the action ends,
// while the program still reads its own writes at once?  (Today's cells, bridged.)
// Run:  tsx heldAction.mts <node_modules dir> [dev|prod]
const nodeModules = process.argv[2]
const mode = process.argv[3] ?? "dev"
const KIT = "/Users/owen/www/spell.worktrees/solid-2-final"
const S: any = await import(`${nodeModules}/@solidjs/signals/dist/${mode === "dev" ? "dev.js" : "prod/index.js"}`)
const C: any = await import(`${KIT}/src/util/reactive/index.ts`)
const { createRoot, createRenderEffect, flush, action } = S
C.bridgeSolid({ enableExternalSource: S.enableExternalSource, flush })
const warnings: string[] = []
console.warn = (...a: unknown[]) => warnings.push(String(a[0]).split("\n")[0].slice(0, 100))
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

/** A board of 3 cells, and what the screen shows of it. */
function board() {
  const thing: any = {}
  for (const f of ["a", "b", "c"]) C.setProp(thing, f, 0)
  const screen: string[] = []
  createRoot(() =>
    createRenderEffect(
      () => ["a", "b", "c"].map((f) => C.getProp(thing, f)).join(""),
      (shown: string) => {
        screen.push(shown)
      }
    )
  )
  flush()
  return { thing, screen }
}

////////////////
{
  // a plain async Spell action:  deal a, wait, deal b, wait, deal c
  const { thing, screen } = board()
  const reads: number[] = []
  const deal = async () => {
    C.setProp(thing, "a", 1)
    reads.push(C.getProp(thing, "a"))
    await tick()
    C.setProp(thing, "b", 1)
    reads.push(C.getProp(thing, "b"))
    await tick()
    C.setProp(thing, "c", 1)
    reads.push(C.getProp(thing, "c"))
  }
  await deal()
  await tick()
  console.log("plain async action:   program read", reads, "  screen showed", screen)
}

{
  // the same steps as a Solid action (a generator):  each wait is a `yield`
  const { thing, screen } = board()
  const reads: number[] = []
  const deal = action(function* () {
    C.setProp(thing, "a", 1)
    reads.push(C.getProp(thing, "a"))
    yield tick()
    C.setProp(thing, "b", 1)
    reads.push(C.getProp(thing, "b"))
    yield tick()
    C.setProp(thing, "c", 1)
    reads.push(C.getProp(thing, "c"))
  })
  const done = deal()
  await tick()
  const midway = [...screen]
  await done
  await tick()
  flush()
  console.log("as a Solid action:    program read", reads, "  screen midway", midway, "  screen at the end", screen)
}
console.log("warnings:", [...new Set(warnings)])
