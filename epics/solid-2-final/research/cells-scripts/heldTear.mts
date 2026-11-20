// The held screen's edge:  a reader re-run MID-action for another reason (a Solid signal outside the action) reads the
// cells as they are, half-dealt.  Run:  tsx heldTear.mts <node_modules dir>
const KIT = "/Users/owen/www/spell.worktrees/solid-2-final"
const S: any = await import(`${process.argv[2]}/@solidjs/signals/dist/dev.js`)
const C: any = await import(`${KIT}/src/util/reactive/index.ts`)
const { createRoot, createRenderEffect, createSignal, flush, action } = S
C.bridgeSolid({ enableExternalSource: S.enableExternalSource, flush })
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))
const thing: any = {}
for (const f of ["a", "b", "c"]) C.setProp(thing, f, 0)
const [theme, setTheme] = createSignal("light")
const screen: string[] = []
createRoot(() =>
  createRenderEffect(
    () => theme() + " " + ["a", "b", "c"].map((f) => C.getProp(thing, f)).join(""),
    (shown: string) => {
      screen.push(shown)
    }
  )
)
flush()
const deal = action(function* () {
  C.setProp(thing, "a", 1)
  yield tick()
  C.setProp(thing, "b", 1)
  yield tick()
  C.setProp(thing, "c", 1)
})
const done = deal()
await tick()
setTheme("dark") // outside the action, mid-way
flush()
await done
await tick()
flush()
console.log("screen:", screen)
