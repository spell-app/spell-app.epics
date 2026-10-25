// Code lines (not blank, not comment) each coherence commit added and removed, per phase and kind.
import { execFileSync } from "node:child_process"
const repos = [".", "spell-parser", "spell-ui", "spell-brand", "spell-epic", "spell-app"]
const GEN = /__pack|_assets\/(spell-ui|spell-comments|commands|core-reference|spell-syntax)\.js|_assets\/lazy|emoji|__data|\.json5?$|custom-elements|css-custom-data|\.svg$|snap|\.md$|\.html$/
const git = (r, ...a) => { try { return execFileSync("git", ["-C", r, ...a], { encoding: "utf8", maxBuffer: 1 << 28 }) } catch { return "" } }
function codeLines(text, file) {
  if (!/\.(m?[jt]sx?|css)$/.test(file)) return 0
  text = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ""))
  return text.split("\n").filter((l) => { const t = l.trim(); return t && !t.startsWith("//") }).length
}
const out = {}
for (const r of repos) {
  const log = git(r, "log", "--no-merges", "--format=%H %s", "main", "--grep=^coherence P")
  for (const line of log.trim().split("\n").filter(Boolean)) {
    const [, sha, ph] = line.match(/^(\S+) coherence (P\d+)/) ?? []
    if (!ph) continue
    const phase = line.match(/^(\S+) coherence (P\d+)/)[2]
    if (/rebuild/.test(line)) continue
    const files = git(r, "diff-tree", "--no-commit-id", "-r", "--name-only", sha).trim().split("\n").filter(Boolean)
    for (const f of files) {
      if (GEN.test(f)) continue
      const kind = /^tests\/|\.test\./.test(f) ? "tests" : "code"
      const before = codeLines(git(r, "show", `${sha}^:${f}`), f), after = codeLines(git(r, "show", `${sha}:${f}`), f)
      const k = `${phase} ${kind}`; out[k] ??= [0, 0]; out[k][0] += after; out[k][1] += before
    }
  }
}
const tot = {}
for (const k of Object.keys(out).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)) || a.localeCompare(b))) {
  const [a, b] = out[k]; console.log(k.padEnd(10), String(a - b).padStart(6), ` (${b} -> ${a})`)
  const [p, kind] = k.split(" "); const n = parseInt(p.slice(1)); const g = (n >= 6 ? "P6-14" : "P1-5") + " " + kind
  tot[g] ??= 0; tot[g] += a - b
}
console.log(tot)
