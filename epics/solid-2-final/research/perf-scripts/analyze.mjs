// Size a built bundle:  every file raw / gzip / brotli, what an entry loads eagerly vs lazily, and which source
// modules and packages the bytes come from (epic `solid-2-final`, perf-bundle).
// - Usage:  node analyze.mjs <out dir> [--stats <stats json>] [--entry <file in out dir> ...] [--html <index.html>]
//            [--json <summary json>] [--top N]
// - Module bytes:  from `build-stats.mjs`'s stats (Rolldown's `renderedLength`), else from each file's `.map`
//   (generated characters per source).  A chunk's gzip / brotli is shared out by those proportions:  an ESTIMATE
//   per module, exact per chunk.
// - Eager:  the entries (from `--entry`, or the html's module scripts) and every chunk they import statically.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"
import { brotliCompressSync, constants, gzipSync } from "node:zlib"

const args = process.argv.slice(2)
const outDir = path.resolve(args[0])
const option = (name) => {
  const values = []
  for (let i = 1; i < args.length; i++) if (args[i] === name) values.push(args[i + 1])
  return values
}
const statsFile = option("--stats")[0]
const htmlFile = option("--html")[0]
const jsonFile = option("--json")[0]
const top = Number(option("--top")[0] ?? 30)

////////////////
// ## Files and their sizes
////////////////

const files = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    const info = statSync(full)
    if (info.isDirectory()) walk(full)
    else if (!name.endsWith(".map")) files.push(full)
  }
}
walk(outDir)

const sizeOf = (buffer) => ({
  raw: buffer.length,
  gzip: gzipSync(buffer, { level: 9 }).length,
  brotli: brotliCompressSync(buffer, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length
})
const sizes = new Map()
for (const file of files) {
  const ext = path.extname(file)
  if ([".js", ".mjs", ".css", ".html", ".json", ".svg", ".wasm"].includes(ext) || ext === "") {
    sizes.set(file, sizeOf(readFileSync(file)))
  } else {
    const raw = statSync(file).size
    sizes.set(file, { raw, gzip: raw, brotli: raw })
  }
}

////////////////
// ## Chunks and their imports
////////////////

const chunks = new Map()
if (statsFile) {
  const stats = JSON.parse(readFileSync(statsFile, "utf8"))
  for (const chunk of stats.chunks) chunks.set(path.join(outDir, chunk.fileName), chunk)
} else {
  // From the code:  static and dynamic relative imports, and each `.map`'s sources
  for (const file of files.filter((f) => /\.m?js$/.test(f))) {
    const code = readFileSync(file, "utf8")
    const imports = new Set()
    const dynamicImports = new Set()
    for (const match of code.matchAll(/(?:^|[;\s}])(?:import|export)\s*(?:[\w*{}\s,$]*?\s*from\s*)?["'](\.{1,2}\/[^"']+)["']/g)) {
      imports.add(path.relative(outDir, path.resolve(path.dirname(file), match[1])))
    }
    for (const match of code.matchAll(/import\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g)) {
      dynamicImports.add(path.relative(outDir, path.resolve(path.dirname(file), match[1])))
    }
    chunks.set(file, {
      fileName: path.relative(outDir, file),
      imports: [...imports],
      dynamicImports: [...dynamicImports],
      modules: modulesFromMap(file, code)
    })
  }
}

/** Generated characters per source, from `<file>.map` (or `{}`). */
function modulesFromMap(file, code) {
  const mapFile = `${file}.map`
  if (!existsSync(mapFile)) return {}
  const map = JSON.parse(readFileSync(mapFile, "utf8"))
  const lines = code.split("\n")
  const counts = {}
  const VLQ = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  let source = 0
  map.mappings.split(";").forEach((line, lineIndex) => {
    if (!line) return
    let column = 0
    const segments = []
    for (const segment of line.split(",")) {
      const values = []
      let value = 0
      let shift = 0
      for (const char of segment) {
        const digit = VLQ.indexOf(char)
        value += (digit & 31) << shift
        if (digit & 32) shift += 5
        else {
          values.push(value & 1 ? -(value >> 1) : value >> 1)
          value = 0
          shift = 0
        }
      }
      column += values[0]
      if (values.length > 1) source += values[1]
      segments.push({ column, source: values.length > 1 ? source : -1 })
    }
    const lineLength = lines[lineIndex]?.length ?? 0
    segments.forEach((segment, i) => {
      const end = segments[i + 1]?.column ?? lineLength
      if (segment.source < 0) return
      const name = map.sources[segment.source]
      counts[name] = (counts[name] ?? 0) + Math.max(0, end - segment.column)
    })
  })
  // relative to the map's folder => absolute-ish id
  const modules = {}
  for (const [name, count] of Object.entries(counts)) modules[path.resolve(path.dirname(file), map.sourceRoot ?? "", name)] = count
  return modules
}

////////////////
// ## Eager vs lazy
////////////////

const entries = option("--entry").map((entry) => path.join(outDir, entry))
const cssEager = []
if (htmlFile) {
  const html = readFileSync(htmlFile, "utf8")
  for (const match of html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"/g)) entries.push(path.join(outDir, match[1].replace(/^\//, "")))
  for (const match of html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)) cssEager.push(match[1])
}
const eager = new Set()
const visit = (file) => {
  if (eager.has(file)) return
  eager.add(file)
  const chunk = chunks.get(file)
  for (const imported of chunk?.imports ?? []) visit(path.join(outDir, imported))
}
for (const entry of entries) visit(entry)
const lazyReachable = new Set()
const visitLazy = (file) => {
  if (lazyReachable.has(file) || eager.has(file)) return
  lazyReachable.add(file)
  const chunk = chunks.get(file)
  for (const imported of [...(chunk?.imports ?? []), ...(chunk?.dynamicImports ?? [])]) visitLazy(path.join(outDir, imported))
}
for (const file of eager) for (const dynamic of chunks.get(file)?.dynamicImports ?? []) visitLazy(path.join(outDir, dynamic))

////////////////
// ## Attribution
////////////////

const KIT = /\/(?:www\/spell(?:\.worktrees\/[^/]+)?)\//
/** A module's group:  its npm package, or its kit folder and sub-folder. */
function groupOf(id) {
  const clean = id.replace(/^\0/, "").split("?")[0]
  const nm = clean.lastIndexOf("/node_modules/")
  if (nm >= 0) {
    const rest = clean.slice(nm + 14).split("/")
    return `npm:${rest[0].startsWith("@") ? `${rest[0]}/${rest[1]}` : rest[0]}`
  }
  const kit = KIT.exec(clean)
  const relative = kit ? clean.slice(kit.index + kit[0].length) : clean
  const parts = relative.split("/")
  if (parts[1] === "src" && ["ui", "parser", "app", "epic"].includes(parts[0])) {
    const depth = parts[2] === "components" || parts[2] === "docs-components" || parts[2] === "app" ? 4 : 3
    return `${parts[0]}:${parts.slice(2, depth).join("/")}`
  }
  if (parts[0] === "src") return `kit:${parts[1]}`
  return parts.slice(0, 3).join("/")
}

const groups = new Map()
const moduleTotals = new Map()
const addTo = (map, key, file, share, size) => {
  const entry = map.get(key) ?? { raw: 0, gzip: 0, brotli: 0, eagerBrotli: 0, files: new Set() }
  entry.raw += size.raw * share
  entry.gzip += size.gzip * share
  entry.brotli += size.brotli * share
  if (eager.has(file)) entry.eagerBrotli += size.brotli * share
  entry.files.add(path.relative(outDir, file))
  map.set(key, entry)
}
for (const [file, chunk] of chunks) {
  const size = sizes.get(file)
  if (!size) continue
  const modules = Object.entries(chunk.modules ?? {})
  const total = modules.reduce((sum, [, length]) => sum + length, 0)
  if (!total) {
    addTo(groups, "(unattributed)", file, 1, size)
    continue
  }
  for (const [id, length] of modules) {
    addTo(groups, groupOf(id), file, length / total, size)
    addTo(moduleTotals, id.replace(/^.*?(node_modules\/|www\/spell(?:\.worktrees\/[^/]+)?\/)/, ""), file, length / total, size)
  }
}

////////////////
// ## Report
////////////////

const kb = (bytes) => `${(bytes / 1024).toFixed(1)}`
const sum = (list) =>
  list.reduce((total, file) => {
    const size = sizes.get(file) ?? { raw: 0, gzip: 0, brotli: 0 }
    return { raw: total.raw + size.raw, gzip: total.gzip + size.gzip, brotli: total.brotli + size.brotli }
  }, { raw: 0, gzip: 0, brotli: 0 })
const js = files.filter((f) => /\.m?js$/.test(f))
const css = files.filter((f) => f.endsWith(".css"))
const other = files.filter((f) => !/\.m?js$/.test(f) && !f.endsWith(".css"))
const line = (label, size, count) => `| ${label} | ${count ?? ""} | ${kb(size.raw)} | ${kb(size.gzip)} | ${kb(size.brotli)} |`
const out = []
out.push(`## ${path.basename(outDir)}`, "", "| Part | Files | Raw KB | Gzip KB | Brotli KB |", "| --- | --- | --- | --- | --- |")
out.push(line("all JS", sum(js), js.length), line("all CSS", sum(css), css.length), line("other files", sum(other), other.length))
if (entries.length) {
  const eagerFiles = [...eager].filter((f) => sizes.has(f))
  out.push(line("EAGER JS (entries + static imports)", sum(eagerFiles), eagerFiles.length))
  const lazyFiles = [...lazyReachable].filter((f) => sizes.has(f))
  out.push(line("lazy JS reachable by import()", sum(lazyFiles), lazyFiles.length))
}
if (cssEager.length) out.push("", `Stylesheets in the html:  ${cssEager.join(", ")}`)
out.push("", `### Biggest files`, "", "| File | Eager | Raw KB | Gzip KB | Brotli KB |", "| --- | --- | --- | --- | --- |")
for (const file of [...sizes.keys()].sort((a, b) => sizes.get(b).brotli - sizes.get(a).brotli).slice(0, 15)) {
  const size = sizes.get(file)
  out.push(`| ${path.relative(outDir, file)} | ${eager.has(file) ? "yes" : ""} | ${kb(size.raw)} | ${kb(size.gzip)} | ${kb(size.brotli)} |`)
}
out.push("", `### Biggest groups (package or kit folder), brotli shared out by module size`, "", "| Group | Raw KB | Brotli KB | of it eager | Files |", "| --- | --- | --- | --- | --- |")
for (const [name, entry] of [...groups].sort((a, b) => b[1].brotli - a[1].brotli).slice(0, top)) {
  out.push(`| ${name} | ${kb(entry.raw)} | ${kb(entry.brotli)} | ${kb(entry.eagerBrotli)} | ${entry.files.size} |`)
}
out.push("", `### Biggest modules`, "", "| Module | Raw KB | Brotli KB | of it eager |", "| --- | --- | --- | --- |")
for (const [name, entry] of [...moduleTotals].sort((a, b) => b[1].brotli - a[1].brotli).slice(0, top)) {
  out.push(`| ${name} | ${kb(entry.raw)} | ${kb(entry.brotli)} | ${kb(entry.eagerBrotli)} |`)
}
console.log(out.join("\n"))
if (jsonFile) {
  const serial = (map) => Object.fromEntries([...map].map(([k, v]) => [k, { ...v, files: [...v.files] }]))
  writeFileSync(
    jsonFile,
    JSON.stringify(
      {
        outDir,
        files: Object.fromEntries([...sizes].map(([f, s]) => [path.relative(outDir, f), { ...s, eager: eager.has(f), lazy: lazyReachable.has(f) }])),
        groups: serial(groups),
        modules: serial(moduleTotals)
      },
      null,
      1
    )
  )
}
