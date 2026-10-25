// Each catalog entry's Flag pattern, counted over every repo's src/ before epic coherence's first fix (P6) and now.
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
const repos = [".", "spell-parser", "spell-ui", "spell-brand", "spell-epic", "spell-app"]
const git = (r, ...a) => { try { return execFileSync("git", ["-C", r, ...a], { encoding: "utf8", maxBuffer: 1 << 28 }) } catch (e) { return e.stdout ?? "" } }
const before = Object.fromEntries(repos.map((r) => {
  const first = git(r, "log", "--reverse", "--format=%H", "--grep=^coherence P6", "main").split("\n")[0]
  return [r, first ? first + "^" : git(r, "log", "-1", "--format=%H", "--before=2026-10-25T10:00", "main").trim()]
}))
const cat = readFileSync("agents/coherence/catalog.md", "utf8")
let entry = "", rows = []
for (const line of cat.split("\n")) {
  const h = line.match(/^### (.*)/); if (h) entry = h[1]
  const f = line.match(/\*\*Flag:\*\*\s+`([^`]+)`/); if (!f || !entry) continue
  const count = (rev) => repos.reduce((n, r) => n + git(r, "grep", "-c", "-P", f[1], rev(r), "--", "src", ":!**/__pack/**", ":!**/_assets/*.js", ":!**/_assets/lazy/**", ":!**/__data/**").split("\n").filter(Boolean).reduce((s, l) => s + Number(l.split(":").pop()), 0), 0)
  rows.push([entry, count((r) => before[r]), count(() => "main")])
}
let b = 0, a = 0
for (const [e, x, y] of rows) { b += x; a += y; console.log(String(x).padStart(5), String(y).padStart(5), (y - x >= 0 ? "+" : "") + (y - x), " ", e) }
console.log("total", b, "->", a)
