// The benchmark's table:  each variant's median across rounds (each round already the median of 7 runs).
// Run:  node medians.mjs bench.all.txt
import { readFileSync } from "node:fs"
const rows = readFileSync(process.argv[2], "utf8")
  .split("\n")
  .filter((line) => line.startsWith("{"))
  .map((line) => JSON.parse(line))
const median = (list) => {
  const sorted = [...list].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}
const WORK = ["construct", "loop", "mount", "loopDrawn", "update"]
const groups = new Map()
for (const row of rows) {
  const key = `${row.variant} @ ${row.version}`
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(row)
}
console.log(["| variant | Solid | rounds |", ...WORK.map((w) => ` ${w} ms |`), " stale reads (loop, drawn) |"].join(""))
console.log("| --- ".repeat(WORK.length + 4) + "|")
for (const [key, list] of groups) {
  const [variant, version] = key.split(" @ ")
  const cells = WORK.map((w) => median(list.map((r) => r[w])).toFixed(1))
  const stale = `${list[0].staleReads.loop} / ${list[0].staleReads.loopDrawn}`
  console.log(`| ${variant} | ${version} | ${list.length} | ${cells.join(" | ")} | ${stale} |`)
}
