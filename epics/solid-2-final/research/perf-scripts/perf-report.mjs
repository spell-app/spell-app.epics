/**
 * Print a `perf-run.mjs` result as Markdown tables:  the ones in `../perf-browser.md`.
 * Usage:  node <this folder>/perf-report.mjs [<result.json>]   (default:  the newest dated file in `../perf-results/`)
 */
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"

const RESULTS = path.join(import.meta.dirname, "..", "perf-results")
const file =
  process.argv[2] ??
  path.join(
    RESULTS,
    readdirSync(RESULTS)
      .filter((name) => /^\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(name))
      .sort()
      .at(-1)
  )
const record = JSON.parse(readFileSync(file, "utf8"))
const { data } = record
const ms = (value) => (value === undefined ? "--" : value >= 1000 ? `${(value / 1000).toFixed(1)} s` : `${Math.round(value)} ms`)
const mb = (value) => (value === undefined ? "--" : `${(value / 1e6).toFixed(value >= 1e7 ? 0 : 1)} MB`)
const kb = (value) => (value === undefined ? "--" : value >= 1e6 ? mb(value) : `${Math.round(value / 1e3)} kB`)
const count = (value) => (value === undefined ? "--" : Math.round(value).toLocaleString("en-US"))
const row = (cells) => `| ${cells.join(" | ")} |`

console.log(`Result:  ${path.basename(file)}, ${record.when}, git ${record.gitSha.slice(0, 9)} (${record.gitBranch}), ${record.chromeVersion}`)
console.log(`Machine:  load ${record.machine.before.load.join(" / ")} before, ${record.machine.after.load.join(" / ")} after;  ${record.busyMachine ? "BUSY MACHINE" : "quiet"}`)
console.log(`Runs per page and profile:  ${record.flags.runs} (medians)\n`)

const pages = [...new Set(Object.keys(data.load).map((key) => key.split("/")[0]))]
for (const page of pages) {
  const targets = Object.keys(data.load).filter((key) => key.startsWith(`${page}/`))
  console.log(`### ${page}\n`)
  console.log(row(["", ...targets.map((key) => key.split("/")[1])]))
  console.log(row(["---", ...targets.map(() => "---:")]))
  const line = (label, pick) => console.log(row([label, ...targets.map((key) => pick(data.load[key]))]))
  line("first paint (FCP)", (load) => ms(load.fcp))
  line("largest paint (LCP)", (load) => ms(load.lcp))
  line("usable (ready)", (load) => ms(load.readyAt))
  line("settled (last long task)", (load) => ms(load.tti))
  line("long tasks, total", (load) => `${ms(load.longTaskTotal)} in ${count(load.longTaskCount)}`)
  line("blocking time (TBT-like)", (load) => ms(load.tbt))
  line("longest task", (load) => ms(load.longestTask))
  line("script / style / layout time", (load) => `${load.scriptDuration?.toFixed(1)} / ${load.styleDuration?.toFixed(1)} / ${load.layoutDuration?.toFixed(2)} s`)
  line("requests (JS)", (load) => `${count(load.requests)} (${count(load.jsRequests)})`)
  line("JS transferred / decoded", (load) => `${kb(load.jsTransferred)} / ${kb(load.jsDecoded)}`)
  line("JS gzip estimate", (load) => kb(load.jsGzipEstimate))
  line("all transferred", (load) => kb(load.transferred))
  line("JS heap after load / after GC", (load) => `${mb(load.heapAfterLoad)} / ${mb(load.heapAfterGC)}`)
  line("DOM nodes (after GC)", (load) => count(load.nodesAfterGC))
  line("event listeners", (load) => count(load.listenersAfterGC))
  line("documents", (load) => count(load.documentsAfterGC))
  line("elements (through shadow roots)", (load) => count(load.elements))
  line("custom elements / shadow roots", (load) => `${count(load.customElements)} / ${count(load.shadowRoots)}`)
  line("adopted sheets:  per root / distinct", (load) => `${(load.adoptedSheetRefs / load.shadowRoots).toFixed(1)} / ${count(load.uniqueAdoptedSheets)}`)
  line("console errors", (load) => count(load.errors))
  console.log("")
}

if (Object.keys(data.leaks).length) {
  console.log("### Leaks (heap after a forced GC)\n")
  console.log(row(["page", "loop", "cycles", "heap per cycle", "nodes per cycle", "listeners per cycle"]))
  console.log(row(["---", "---", "---:", "---:", "---:", "---:"]))
  for (const [target, leaks] of Object.entries(data.leaks))
    for (const loop of leaks.results)
      console.log(row([target, loop.name, loop.cycles ?? "--", loop.error ? `FAILED` : kb(loop.heapPerCycle), loop.nodesPerCycle ?? "--", loop.listenersPerCycle ?? "--"]))
  console.log("")
}

if (Object.keys(data.typing).length) {
  console.log("### Typing (key to next paint)\n")
  console.log(row(["profile", "keys", "median", "p90", "worst", "over 50 ms", "over 100 ms", "frame median / worst", "heap per key"]))
  console.log(row(["---", "---:", "---:", "---:", "---:", "---:", "---:", "---:", "---:"]))
  for (const [profile, typing] of Object.entries(data.typing)) {
    const timing = typing.eventTiming
    console.log(row([profile, typing.keys, ms(timing.median), ms(timing.p90), ms(timing.worst), timing.over50, timing.over100, `${ms(typing.frame.median)} / ${ms(typing.frame.worst)}`, kb(typing.heapPerKey)]))
  }
  console.log("")
}

if (Object.keys(data.a11y).length) {
  console.log("### Accessibility\n")
  for (const [page, a11y] of Object.entries(data.a11y)) {
    console.log(`${page}:  ${a11y.axe.map((rule) => `${rule.rule} (${rule.impact}, ${rule.count})`).join(", ") || "no violations"}`)
    console.log(`  Tab x${a11y.tabs.presses}:  ${a11y.tabs.distinct} distinct stops, ${a11y.tabs.inShadow} in shadow roots, ${a11y.tabs.visiblyMarked} visibly marked, ${a11y.tabs.onBody} on the body`)
    console.log(`  motion:  ${a11y.motionNoPreference.withDuration} animations without a preference, ${a11y.motionReduce.withDuration} with reduce;  ${a11y.reducedMotionRules.reducedMotionMediaRules} reduced-motion rules`)
  }
  console.log("")
}

for (const [page, listeners] of Object.entries(data.listeners ?? {})) {
  console.log(`### Listeners, ${page}:  ${count(listeners.total)} on ${count(listeners.targets)} targets\n`)
  console.log(`by type:  ${Object.entries(listeners.byType).slice(0, 10).map(([type, number]) => `${type} ${number}`).join(", ")}`)
  console.log(`by tag:  ${Object.entries(listeners.byTag).slice(0, 10).map(([tag, number]) => `${tag} ${number}`).join(", ")}\n`)
}

for (const [page, sheets] of Object.entries(data.sheets ?? {})) {
  console.log(`### Adopted sheets, ${page}:  ${sheets.roots} roots, ${sheets.distinctSheets} distinct, ~${count(sheets.adoptedCharsPerRoot)} chars per root\n`)
  for (const sheet of sheets.sheets.slice(0, 8)) console.log(`- ${sheet.roots} roots, ${count(sheet.chars)} chars, ${sheet.rules} rules, ${sheet.customProperties} custom properties:  \`${sheet.first}\``)
  console.log("")
}

for (const [profile, cpu] of Object.entries(data.cpu ?? {})) {
  for (const phase of ["load", "typing"]) {
    if (!cpu[phase]) continue
    console.log(`### CPU, ${profile}, ${phase}:  ${ms(cpu[phase].totalMs)} sampled\n`)
    console.log(row(["self", "share", "function"]))
    console.log(row(["---:", "---:", "---"]))
    for (const entry of cpu[phase].functions) console.log(row([ms(entry.ms), `${entry.share}%`, `\`${entry.name}\``]))
    console.log(`\nby file:  ${cpu[phase].files.slice(0, 6).map((entry) => `${entry.name.split("/").pop()} ${entry.share}%`).join(", ")}\n`)
  }
}
