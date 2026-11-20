/**
 * The whole browser performance measurement, in one command (epic `solid-2-final`):
 * every page, both profiles, load, leaks, typing, accessibility, listeners and a CPU profile.
 * - Run from the kit's root, with the page server up (`spell server start`):
 *     node spell.epics/epics/solid-2-final/research/perf-scripts/perf-run.mjs [flags]
 *   (a worktree reaches the epic repo by its real path:  `node /Users/owen/www/spell/spell.epics/...`)
 * - Waits for a quiet machine first, then builds the editor (production, and unminified for the CPU profile's names)
 *   into a temp folder, serves both with `vp preview`, measures, and stops them.
 * - Writes ONE dated file, `research/perf-results/<YYYY-MM-DD-HHMM>.json`:  the numbers, the load before and after,
 *   the git sha, Chrome's version and the flags;  then prints a table against the previous dated file.
 * Flags:
 * - `--page editor,docs,epic,run`:  which pages (default all)
 * - `--profile desktop|phone`:  one profile (default both;  `phone` also runs the editor at `phonewide`)
 * - `--runs N`:  cold loads per page and profile (default 5;  medians reported)
 * - `--steps load,leaks,typing,a11y,listeners,sheets,cpu`:  which measurements (default all)
 * - `--wait <minutes>`:  how long to wait for a quiet machine (default 10)
 * - `--force`:  don't wait
 * - `--editor <url>` and `--editor-nomin <url>`:  editor builds already served;  skips the build
 * - `--out <file>`:  write there instead of the dated file
 */
import { execSync, spawn, spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { createServer } from "node:net"
import os from "node:os"
import path from "node:path"

import { args, chromium } from "./perf-lib.mjs"

const HERE = import.meta.dirname
const RESULTS = path.join(HERE, "..", "perf-results")
const KIT = process.cwd()
const { flags } = args()
const list = (value, all) => (typeof value === "string" ? value.split(",").map((each) => each.trim()).filter(Boolean) : all)
const pages = list(flags.page, ["editor", "docs", "epic", "run"])
const profiles = list(flags.profile, ["desktop", "phone"])
const steps = list(flags.steps, ["load", "leaks", "typing", "a11y", "listeners", "sheets", "cpu"])
const runs = Number(flags.runs ?? 5)
const waitMinutes = Number(flags.wait ?? 10)
const cpus = os.cpus().length
/** Busy:  a 1-minute load over half the CPUs. */
const BUSY_LOAD = cpus / 2
/** Worse by more than this share is flagged in the comparison. */
const WORSE = 0.1

if (!existsSync(path.join(KIT, ".spell-server.json")))
  throw new Error("perf-run:  run it from the kit's root, with the page server up (`spell server start`)")

////////////////
// ## A quiet machine
////////////////

const machine = () => ({
  load: os.loadavg().map((value) => +value.toFixed(2)),
  freeMemoryGB: +(os.freemem() / 1e9).toFixed(1),
  totalMemoryGB: +(os.totalmem() / 1e9).toFixed(1),
  cpus
})
const isBusy = () => os.loadavg()[0] > BUSY_LOAD
let waited = 0
if (!flags.force) {
  while (isBusy() && waited < waitMinutes * 60) {
    if (waited === 0)
      console.log(`perf-run:  the machine is busy (1-minute load ${os.loadavg()[0].toFixed(1)}, over ${BUSY_LOAD} = half of ${cpus} CPUs);  waiting up to ${waitMinutes} minutes ...`)
    await new Promise((resolve) => setTimeout(resolve, 30_000))
    waited += 30
  }
}
const before = machine()
const busyAtStart = isBusy()
if (busyAtStart) console.log(`\n*** BUSY MACHINE:  1-minute load ${before.load[0]} (over ${BUSY_LOAD});  timings will be noisy ***\n`)

////////////////
// ## The editor's builds, served
////////////////

const servers = []
const stamp = new Date()
const pad = (number) => String(number).padStart(2, "0")
const name = `${stamp.getFullYear()}-${pad(stamp.getMonth() + 1)}-${pad(stamp.getDate())}-${pad(stamp.getHours())}${pad(stamp.getMinutes())}`
const work = path.join(os.tmpdir(), "spell-perf", name)
mkdirSync(work, { recursive: true })
const APP_BUILD_FOLDER = path.join(KIT, "app", "app")
const VP = path.join(KIT, "node_modules", ".bin", "vp")

/** A free TCP port. */
function freePort() {
  return new Promise((resolve) => {
    const server = createServer().listen(0, () => {
      const { port } = server.address()
      server.close(() => resolve(port))
    })
  })
}

/** Build the editor into `outDir`;  `minify: false` keeps function names for the CPU profile. */
function buildEditor(outDir, { minify = true } = {}) {
  console.log(`perf-run:  building the editor${minify ? "" : " (unminified)"} into ${outDir}`)
  const result = spawnSync(VP, ["build", ...(minify ? [] : ["--minify", "false"]), "--outDir", outDir, "--emptyOutDir"], {
    cwd: APP_BUILD_FOLDER,
    stdio: ["ignore", "ignore", "inherit"]
  })
  if (result.status !== 0) throw new Error(`perf-run:  the editor's build failed (${result.status})`)
}

/** Serve `outDir` with `vp preview` (its proxy reaches the page server);  resolves to its URL once it answers. */
async function serve(outDir) {
  const port = await freePort()
  const child = spawn(VP, ["preview", "--outDir", outDir, "--port", String(port), "--strictPort"], {
    cwd: APP_BUILD_FOLDER,
    stdio: "ignore"
  })
  servers.push(child)
  const url = `http://localhost:${port}/`
  for (let tries = 0; tries < 60; tries++) {
    try {
      if ((await fetch(url)).ok) return url
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`perf-run:  vp preview of ${outDir} didn't answer at ${url}`)
}

const stopServers = () => {
  for (const child of servers) child.kill()
}
process.on("exit", stopServers)
process.on("SIGINT", () => process.exit(130))

const needsEditor = pages.includes("editor") || pages.includes("run")
let editor = typeof flags.editor === "string" ? flags.editor : undefined
let editorNomin = typeof flags["editor-nomin"] === "string" ? flags["editor-nomin"] : undefined
if (needsEditor && !editor) {
  buildEditor(path.join(work, "editor-dist"))
  editor = await serve(path.join(work, "editor-dist"))
}
if (needsEditor && steps.includes("cpu") && !editorNomin) {
  buildEditor(path.join(work, "editor-dist-nomin"), { minify: false })
  editorNomin = await serve(path.join(work, "editor-dist-nomin"))
}

////////////////
// ## Measure
////////////////

const browser = await chromium.launch()
const chromeVersion = browser.version()
await browser.close()
const gitSha = execSync("git rev-parse HEAD", { cwd: KIT }).toString().trim()
const gitBranch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: KIT }).toString().trim()
const loadsSeen = [before.load[0]]
const failures = []

/** Run one of the scripts beside this one, its JSON into the work folder;  returns the JSON, or `undefined`. */
function step(script, scriptArgs, outName, { nomin = false } = {}) {
  const out = path.join(work, outName)
  const env = { ...process.env, ...(editor && { PERF_EDITOR: nomin ? editorNomin : editor }) }
  console.log(`\n== ${script} ${scriptArgs.join(" ")}   (load ${os.loadavg()[0].toFixed(1)})`)
  loadsSeen.push(+os.loadavg()[0].toFixed(2))
  const result = spawnSync(process.execPath, [path.join(HERE, script), ...scriptArgs, "--out", out], {
    cwd: KIT,
    env,
    stdio: ["ignore", "inherit", "inherit"]
  })
  if (result.status !== 0 || !existsSync(out)) {
    failures.push(`${script} ${scriptArgs.join(" ")}`)
    return undefined
  }
  return JSON.parse(readFileSync(out, "utf8"))
}

const data = { load: {}, leaks: {}, typing: {}, a11y: {}, listeners: {}, sheets: {}, cpu: {} }
const firstProfile = profiles.includes("desktop") ? "desktop" : "phone"
const editorPhoneProfile = (profile) => (profile === "phone" ? "phonewide" : profile)

if (steps.includes("load")) {
  for (const page of pages) {
    for (const profile of profiles) {
      const targets = page === "editor" && profile === "phone" ? ["phone", "phonewide"] : [profile]
      for (const target of targets) {
        const result = step("perf-load.mjs", [page, target, "--runs", String(runs)], `load-${page}-${target}.json`)
        if (result) data.load[`${page}/${target}`] = loadSummary(result)
      }
    }
  }
}
if (steps.includes("leaks")) {
  for (const page of pages.filter((each) => each !== "run")) {
    const profile = page === "editor" ? editorPhoneProfile(firstProfile) : firstProfile
    const result = step("perf-leaks.mjs", [page, profile], `leaks-${page}.json`)
    if (result) data.leaks[`${page}/${profile}`] = result
  }
}
if (steps.includes("typing") && pages.includes("editor")) {
  for (const profile of profiles.map(editorPhoneProfile)) {
    const result = step("perf-typing.mjs", [profile], `typing-${profile}.json`)
    if (result) data.typing[profile] = result
  }
}
if (steps.includes("a11y")) {
  for (const page of pages) {
    const result = step("perf-a11y.mjs", [page, firstProfile], `a11y-${page}.json`)
    if (result) data.a11y[page] = result
  }
}
if (steps.includes("listeners") && pages.includes("editor")) {
  const result = step("perf-listeners.mjs", ["editor", firstProfile], "listeners-editor.json")
  if (result) data.listeners.editor = result
}
if (steps.includes("sheets")) {
  for (const page of pages.filter((each) => each === "editor" || each === "docs")) {
    const result = step("perf-sheets.mjs", [page, firstProfile], `sheets-${page}.json`)
    if (result) data.sheets[page] = result
  }
}
if (steps.includes("cpu") && pages.includes("editor")) {
  const profile = profiles.includes("phone") ? "phonewide" : "desktop"
  const result = step("perf-cpu.mjs", [profile], `cpu-${profile}.json`, { nomin: true })
  if (result) data.cpu[profile] = result
}
stopServers()

////////////////
// ## Write, and compare with the last run
////////////////

const after = machine()
loadsSeen.push(after.load[0])
const busy = busyAtStart || Math.max(...loadsSeen) > BUSY_LOAD
const numbers = flatten(data)
const record = {
  when: stamp.toISOString(),
  busyMachine: busy,
  ...(busy && { warning: `BUSY MACHINE:  1-minute load reached ${Math.max(...loadsSeen)} (over ${BUSY_LOAD});  timings are noisy, bytes / heap / counts are not` }),
  machine: { before, after, loadsSeen, waitedSeconds: waited, model: os.cpus()[0]?.model, platform: `${os.platform()} ${os.release()}` },
  gitSha,
  gitBranch,
  chromeVersion,
  flags: { pages, profiles, steps, runs, wait: waitMinutes, force: !!flags.force, editor: flags.editor ?? "built", editorNomin: flags["editor-nomin"] ?? "built" },
  failures,
  numbers,
  data
}
mkdirSync(RESULTS, { recursive: true })
const previous = readdirSync(RESULTS)
  .filter((file) => /^\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(file))
  .sort()
  .at(-1)
const outFile = typeof flags.out === "string" ? flags.out : path.join(RESULTS, `${name}.json`)
writeFileSync(outFile, JSON.stringify(record, null, 2))
rmSync(work, { recursive: true, force: true })
console.log(`\nperf-run:  wrote ${outFile}${busy ? "   *** BUSY MACHINE ***" : ""}`)
if (failures.length) console.log(`perf-run:  FAILED steps:  ${failures.join(";  ")}`)
if (previous && path.join(RESULTS, previous) !== outFile) compare(JSON.parse(readFileSync(path.join(RESULTS, previous), "utf8")), record, previous)
else console.log("perf-run:  no earlier result to compare with")

/** The numbers kept from one page / profile's loads:  medians, and the bytes (the same every run). */
function loadSummary(result) {
  const first = result.results[0]
  return {
    ...result.median,
    jsRequests: first.js.requests,
    jsTransferred: first.js.transferred,
    jsDecoded: first.js.decoded,
    jsGzipEstimate: first.js.gzipEstimate,
    requests: first.requests,
    transferred: first.transferred,
    elements: first.census.elements,
    customElements: first.census.customElements,
    shadowRoots: first.census.shadowRoots,
    adoptedSheetRefs: first.census.adoptedRefs,
    uniqueAdoptedSheets: first.census.uniqueAdopted,
    uniqueAdoptedCssChars: first.census.uniqueCssChars,
    errors: first.errors.length,
    runs: result.results.map((run) => ({ readyAt: run.perf.readyAt, tti: run.perf.tti, tbt: run.perf.tbt, load: run.uptime }))
  }
}

/** Every number worth comparing, as `area page/profile metric` => value. */
function flatten(all) {
  const out = {}
  const keep = (key, value) => {
    if (typeof value === "number" && Number.isFinite(value)) out[key] = +value.toFixed(1)
  }
  for (const [target, load] of Object.entries(all.load))
    for (const [metric, value] of Object.entries(load)) keep(`load ${target} ${metric}`, value)
  for (const [target, leaks] of Object.entries(all.leaks))
    for (const loop of leaks.results ?? []) {
      keep(`leaks ${target} ${loop.name} heapPerCycle`, loop.heapPerCycle)
      keep(`leaks ${target} ${loop.name} nodesPerCycle`, loop.nodesPerCycle)
      keep(`leaks ${target} ${loop.name} listenersPerCycle`, loop.listenersPerCycle)
    }
  for (const [profile, typing] of Object.entries(all.typing)) {
    for (const [metric, value] of Object.entries(typing.eventTiming ?? {})) keep(`typing ${profile} eventTiming.${metric}`, value)
    for (const [metric, value] of Object.entries(typing.frame ?? {})) keep(`typing ${profile} frame.${metric}`, value)
    keep(`typing ${profile} heapPerKey`, typing.heapPerKey)
  }
  for (const [page, a11y] of Object.entries(all.a11y)) {
    keep(`a11y ${page} violationRules`, a11y.axe?.length)
    keep(`a11y ${page} violationNodes`, a11y.axe?.reduce((sum, rule) => sum + rule.count, 0))
    keep(`a11y ${page} seriousOrCriticalNodes`, a11y.axe?.filter((rule) => /serious|critical/.test(rule.impact)).reduce((sum, rule) => sum + rule.count, 0))
    keep(`a11y ${page} tabsVisiblyMarked`, a11y.tabs?.visiblyMarked)
    keep(`a11y ${page} animationsWithReduce`, a11y.motionReduce?.withDuration)
  }
  for (const [page, listeners] of Object.entries(all.listeners)) keep(`listeners ${page} total`, listeners.total)
  for (const [page, sheets] of Object.entries(all.sheets)) keep(`sheets ${page} adoptedCharsPerRoot`, sheets.adoptedCharsPerRoot)
  for (const [profile, cpu] of Object.entries(all.cpu)) {
    keep(`cpu ${profile} loadSampledMs`, cpu.load?.totalMs)
    keep(`cpu ${profile} typingSampledMs`, cpu.typing?.totalMs)
  }
  return out
}

/** Print each number against the previous file's:  the change, flagged when worse by more than 10%. */
function compare(old, now, oldName) {
  /** Numbers where higher is better;  everything else, lower is. */
  const higherIsBetter = /tabsVisiblyMarked/
  /** Counts and settings, not costs:  shown, never flagged. */
  const neutral = /runs|customElements|interactions|samples/
  console.log(`\nCompared with ${oldName}${old.busyMachine ? " (BUSY MACHINE)" : ""}${now.busyMachine ? ";  this run:  BUSY MACHINE" : ""}`)
  console.log("number".padEnd(78) + "before".padStart(14) + "now".padStart(14) + "change".padStart(10))
  let worse = 0
  for (const [key, value] of Object.entries(now.numbers)) {
    const was = old.numbers?.[key]
    if (was === undefined) continue
    const change = was === 0 ? (value === 0 ? 0 : Infinity) : (value - was) / Math.abs(was)
    const isWorse = !neutral.test(key) && (higherIsBetter.test(key) ? change < -WORSE : change > WORSE)
    if (isWorse) worse++
    const shown = Number.isFinite(change) ? `${change >= 0 ? "+" : ""}${(change * 100).toFixed(0)}%` : "new"
    console.log(`${key.slice(0, 77).padEnd(78)}${String(was).padStart(14)}${String(value).padStart(14)}${shown.padStart(10)}${isWorse ? "  WORSE" : ""}`)
  }
  const added = Object.keys(now.numbers).filter((key) => !(key in (old.numbers ?? {}))).length
  console.log(`\n${worse} number(s) worse by more than ${WORSE * 100}%;  ${added} not in the previous file`)
}
