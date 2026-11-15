// Size scan:  per repo and per top folder of src/, code vs docs.
// Tracked files only (git ls-files), minus files marked linguist-generated and vendored folders.
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join, extname } from "node:path"

const KIT = process.argv[2]
const REPOS = [".", "spell-parser", "spell-ui", "spell-brand", "spell-epic", "spell-app"]
const CODE = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".css", ".py", ".spell"])
const DOCS = new Set([".md", ".html"])
const SKIP = [/(^|\/)__pack\//, /^vendor\//, /^\.yarn\//, /(^|\/)node_modules\//, /\.min\.(js|css)$/, /^app\/static\//, /\.snap$/, /(^|\/)__snapshots__\//]

const git = (repo, ...args) => execFileSync("git", ["-C", join(KIT, repo), ...args], { encoding: "utf8", maxBuffer: 1 << 28 })

/** Code lines:  non-blank lines left after stripping comments (naive:  ignores comment markers inside strings). */
function codeOnly(text, ext) {
  let t = text
  if (ext === ".py") t = t.replace(/^\s*#.*$/gm, "")
  else {
    t = t.replace(/\/\*[\s\S]*?\*\//g, "")
    if (ext !== ".css") t = t.replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1")
  }
  return t.split("\n").filter((line) => line.trim())
}

const rows = new Map()
const skipped = []
const row = (key) => {
  if (!rows.has(key)) rows.set(key, { files: 0, codeLines: 0, codeChars: 0, allLines: 0, allChars: 0, docFiles: 0, docLines: 0, docChars: 0 })
  return rows.get(key)
}

for (const repo of REPOS) {
  const files = git(repo, "ls-files").split("\n").filter(Boolean)
  const generated = new Set(
    git(repo, "check-attr", "linguist-generated", "--", ...files)
      .split("\n")
      .filter((l) => l.endsWith(": set"))
      .map((l) => l.split(": linguist-generated")[0])
  )
  const repoName = repo === "." ? "spell (kit)" : repo
  for (const file of files) {
    if (generated.has(file) || SKIP.some((re) => re.test(file))) continue
    const ext = extname(file)
    if (!CODE.has(ext) && !DOCS.has(ext)) continue
    const parts = file.split("/")
    const area = parts[0] === "src" && parts.length > 2 ? `src/${parts[1]}` : ["tests", "docs"].includes(parts[0]) ? parts[0] + "/" : parts[0] === "src" ? "src/ (top files)" : "other"
    let text
    try {
      text = readFileSync(join(KIT, repo, file), "utf8")
    } catch {
      continue
    }
    if (/GENERATED/.test(text.slice(0, 800)) || text.length / text.split("\n").length > 400) { skipped.push(repo + "/" + file); continue }
    const side = parts[0] === "tests" ? " tests" : ""
    for (const key of [`${repoName}\t${area}`, `${repoName}${side}\t* total`, `ALL${side}\t* total`]) {
      const r = row(key)
      const lines = text.split("\n")
      if (CODE.has(ext)) {
        const code = codeOnly(text, ext)
        r.files++
        r.codeLines += code.length
        r.codeChars += code.reduce((n, l) => n + l.trim().length, 0)
        r.allLines += lines.length
        r.allChars += text.length
      } else {
        r.docFiles++
        r.docLines += lines.length
        r.docChars += text.length
      }
    }
  }
}

const k = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : String(n))
console.log("repo\tarea\tcode files\tcode lines\tcode chars\tall lines\tall chars\tdoc files\tdoc lines\tdoc chars")
for (const [key, r] of [...rows].sort()) {
  if (r.files + r.docFiles === 0) continue
  console.log([key, r.files, k(r.codeLines), k(r.codeChars), k(r.allLines), k(r.allChars), r.docFiles, k(r.docLines), k(r.docChars)].join("\t"))
}

console.log("\nleft out, generated or bundled:  " + skipped.length + "\n" + skipped.join("\n"))
