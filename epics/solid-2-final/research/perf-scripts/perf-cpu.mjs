/**
 * CPU profiles (CDP `Profiler`) of the editor:  its load, then typing 60 keys into a comment.
 * - Top 15 functions by SELF time, and self time by file.
 * - Use an UNMINIFIED build for readable names:  build with `--minify false` into its own folder, serve it with
 *   `vp preview` on another port, and point `PERF_EDITOR` at it, e.g.
 *   `PERF_EDITOR=http://localhost:53991/ node <this folder>/perf-cpu.mjs phonewide`
 * Usage (from the kit's root):
 *   node <this folder>/perf-cpu.mjs [desktop|phone|phonewide] [--out cpu.json]
 */
import { writeFileSync } from "node:fs"

import { PAGES, args, loadAverage, openFresh, waitReadyAndQuiet } from "./perf-lib.mjs"

const { positional, flags } = args()
const [profileKey = "phonewide"] = positional

/** Self time per function and per file, from a CDP profile. */
function selfTimes(profile) {
  const byId = new Map(profile.nodes.map((node) => [node.id, node]))
  const self = new Map()
  for (let index = 0; index < profile.samples.length; index++) {
    const delta = (profile.timeDeltas[index] ?? 0) / 1000
    self.set(profile.samples[index], (self.get(profile.samples[index]) ?? 0) + delta)
  }
  const functions = new Map()
  const files = new Map()
  let total = 0
  for (const [id, time] of self) {
    const { callFrame } = byId.get(id)
    total += time
    const file = callFrame.url.replace(/^https?:\/\/[^/]+/, "").replace(/\?.*$/, "") || "(native)"
    const key = `${callFrame.functionName || "(anonymous)"}  ${file.split("/").pop()}:${callFrame.lineNumber + 1}`
    functions.set(key, (functions.get(key) ?? 0) + time)
    files.set(file, (files.get(file) ?? 0) + time)
  }
  const top = (map, count) =>
    [...map.entries()]
      .sort((one, other) => other[1] - one[1])
      .slice(0, count)
      .map(([name, time]) => ({ name, ms: Math.round(time), share: +((time / total) * 100).toFixed(1) }))
  return { totalMs: Math.round(total), functions: top(functions, 15), files: top(files, 10) }
}

const uptime = await loadAverage()
const { browser, page, cdp } = await openFresh("editor", profileKey)
await cdp.send("Profiler.enable")
await cdp.send("Profiler.setSamplingInterval", { interval: 200 })
await cdp.send("Profiler.start")
await page.goto(PAGES.editor.url(), { timeout: 180_000, waitUntil: "commit" })
const perf = await waitReadyAndQuiet(page, { quietMs: 3000 })
const { profile: loadProfile } = await cdp.send("Profiler.stop")
const result = { profile: profileKey, uptime, tti: perf.tti, load: selfTimes(loadProfile) }

const hasCode = await page.evaluate(() => !!window.editor?.shownCodeEditor)
if (hasCode) {
  await page.evaluate(() => {
    const { view } = window.editor.shownCodeEditor
    view.dispatch({ selection: { anchor: view.state.doc.line(2).to } })
    view.focus()
  })
  await cdp.send("Profiler.start")
  const text = " the quick brown fox jumps over the lazy dog and on"
  for (let index = 0; index < 60; index++) {
    await page.keyboard.type(text[index % text.length])
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(1500)
  const { profile: typingProfile } = await cdp.send("Profiler.stop")
  result.typing = selfTimes(typingProfile)
}
await browser.close()
writeFileSync(flags.out ?? `perf-cpu-${profileKey}.json`, JSON.stringify(result, null, 2))
for (const phase of ["load", "typing"]) {
  if (!result[phase]) continue
  console.log(`\n## ${phase}:  ${result[phase].totalMs}ms sampled`)
  for (const entry of result[phase].functions) console.log(`${String(entry.ms).padStart(6)}ms ${String(entry.share).padStart(5)}%  ${entry.name}`)
  console.log("-- by file")
  for (const entry of result[phase].files) console.log(`${String(entry.ms).padStart(6)}ms ${String(entry.share).padStart(5)}%  ${entry.name}`)
}
