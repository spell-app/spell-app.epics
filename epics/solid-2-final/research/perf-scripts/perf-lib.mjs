/**
 * Shared helpers for the browser performance scripts (epic `solid-2-final`, perf-browser research).
 * - Run every script from the kit's root:  `node <this folder>/perf-load.mjs editor phone`.
 *   Playwright and axe-core are resolved from there (the kit's install), not from this folder.
 * - Headless Chromium only, one browser at a time.
 * - Pages:  the editor's PRODUCTION build (served by `vp preview`, see `EDITOR`), and the page server's pages.
 */
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"

const require = createRequire(path.join(process.cwd(), "package.json"))
export const { chromium, devices } = require("playwright")
/** axe-core's browser build, injected into each page. */
export const AXE = require.resolve("axe-core/axe.min.js")

/** The page server of the checkout we're run from (its `.spell-server.json`). */
export const PAGE_SERVER =
  process.env.PERF_PAGE_SERVER ?? JSON.parse(readFileSync(path.join(process.cwd(), ".spell-server.json"), "utf8")).base
/**
 * The editor:  a production build served by `vp preview` (its proxy reaches the page server).
 * - Build:  `cd app/app && ../../node_modules/.bin/vp build --outDir <scratch>/editor-dist`
 * - Serve:  `cd app/app && ../../node_modules/.bin/vp preview --outDir <scratch>/editor-dist --port 53990 --strictPort`
 * - `PERF_EDITOR=http://localhost:<dev port>/` measures the dev server instead.
 */
export const EDITOR = process.env.PERF_EDITOR ?? "http://localhost:53990/"

/** Editor settings for Owen's standard heavy case:  Solitaire, the Program panel (Debug) and the Inspector open. */
const EDITOR_STORAGE = {
  "spellEditor:programPanel": "true",
  "spellEditor:inspector": "true",
  "spellEditor:autoSave": "false"
}

/**
 * The pages measured.
 * - `ready`:  a page function's source, true once the page is usable (polled from an init script).
 * - `storage`:  localStorage set before the page's own scripts run.
 */
export const PAGES = {
  editor: {
    url: () => `${EDITOR}edit/@spell/examples/Solitaire`,
    storage: EDITOR_STORAGE,
    blockWrites: true,
    // at phone width the editor shows the app alone (no code pane):  ready once its cards are drawn
    ready: `() => !!document.querySelector("solitaire-card") && (innerWidth < 800 || !!document.querySelector(".InputEditor .cm-editor .cm-line"))`
  },
  docs: {
    url: () => `${PAGE_SERVER}/components/ui/kitchen-sink.html`,
    ready: `() => document.readyState === "complete" && document.querySelectorAll("[data-perf-undefined]").length === 0 && !document.querySelector(":not(:defined)")`
  },
  epic: {
    url: () => `${PAGE_SERVER}/epics/epic-engine/epic-engine.plan.html`,
    ready: `() => document.readyState === "complete" && !!document.querySelector("epic-page, .spell-toolbar") && !document.querySelector(":not(:defined)")`
  },
  run: {
    url: () => `${EDITOR}run/@spell/examples/Solitaire`,
    storage: EDITOR_STORAGE,
    blockWrites: true,
    ready: `() => !!document.querySelector("solitaire-card")`
  }
}

/** ~5G:  20ms, 50 Mbps down, 20 Mbps up. */
const PHONE_NETWORK = { offline: false, latency: 20, downloadThroughput: (50e6 / 8) | 0, uploadThroughput: (20e6 / 8) | 0 }

/**
 * The profiles.
 * - phone:  Playwright's Pixel 7, CPU slowed 4x, ~5G (20ms, 50 Mbps down, 20 Mbps up).
 */
export const PROFILES = {
  desktop: { context: { viewport: { width: 1600, height: 1000 } }, cpu: 1, network: undefined },
  phone: {
    context: withoutBrowserType(devices["Pixel 7"]),
    cpu: 4,
    network: PHONE_NETWORK
  },
  // the phone's CPU and network at a tablet / landscape width, where the editor shows its code pane and Inspector
  phonewide: {
    context: { ...withoutBrowserType(devices["Pixel 7"]), viewport: { width: 1280, height: 800 }, screen: { width: 1280, height: 800 }, isMobile: false, deviceScaleFactor: 2 },
    cpu: 4,
    network: PHONE_NETWORK
  }
}

function withoutBrowserType({ defaultBrowserType: _ignored, ...rest }) {
  return rest
}

/** Parse `--name value` and `--flag` arguments after the positional ones. */
export function args(argv = process.argv.slice(2)) {
  const positional = []
  const flags = {}
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg.startsWith("--")) {
      const next = argv[index + 1]
      if (next !== undefined && !next.startsWith("--")) {
        flags[arg.slice(2)] = next
        index++
      } else flags[arg.slice(2)] = true
    } else positional.push(arg)
  }
  return { positional, flags }
}

/** `uptime`'s load averages, as a string. */
export async function loadAverage() {
  const { execSync } = await import("node:child_process")
  return execSync("uptime").toString().trim()
}

/**
 * Open `pageKey` in a fresh browser and context under `profileKey`, with CDP throttling.
 * - Cold cache:  a new browser and context every time.
 * - Writes from the editor (`PUT` / `POST` / `DELETE` to the server) are refused, so nothing on disk changes.
 * - Returns `{ browser, context, page, cdp, profile, spec, writesBlocked }`;  the page isn't loaded yet.
 */
export async function openFresh(pageKey, profileKey, { contextOptions = {}, initScripts = [] } = {}) {
  const spec = PAGES[pageKey]
  const profile = PROFILES[profileKey]
  if (!spec || !profile) throw new TypeError(`openFresh():  no page ${pageKey} or profile ${profileKey}`)
  const browser = await chromium.launch({ args: ["--js-flags=--expose-gc", "--enable-precise-memory-info"] })
  const context = await browser.newContext({ ...profile.context, ...contextOptions })
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  await cdp.send("Performance.enable", { timeDomain: "timeTicks" })
  await cdp.send("Network.enable")
  if (profile.cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpu })
  if (profile.network) await cdp.send("Network.emulateNetworkConditions", profile.network)
  const writesBlocked = []
  if (spec.blockWrites) {
    await page.route("**/*", (route) => {
      const request = route.request()
      if (/^(PUT|POST|DELETE|PATCH)$/.test(request.method()) && !/\/api\/(compile|parse|check)/.test(request.url())) {
        writesBlocked.push(`${request.method()} ${request.url()}`)
        return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
      }
      return route.fallback()
    })
  }
  if (spec.storage) {
    await page.addInitScript((storage) => {
      try {
        for (const [key, value] of Object.entries(storage)) localStorage.setItem(key, value)
      } catch {
        // no storage:  defaults
      }
    }, spec.storage)
  }
  await page.addInitScript(PERF_INIT, spec.ready)
  for (const script of initScripts) await page.addInitScript(script)
  return { browser, context, page, cdp, profile, spec, writesBlocked }
}

/**
 * Runs in the page before its own scripts:  records paints, LCP, long tasks, and when `ready` first holds.
 * - `window.__perf`:  `{ fcp, lcp, longTasks: [{start, duration}], readyAt }`
 */
function PERF_INIT(readySource) {
  const perf = (window.__perf = { fcp: undefined, lcp: undefined, longTasks: [], readyAt: undefined, events: [] })
  const observe = (type, callback, options = {}) => {
    try {
      new PerformanceObserver((list) => list.getEntries().forEach(callback)).observe({ type, buffered: true, ...options })
    } catch {
      // type not supported
    }
  }
  observe("paint", (entry) => {
    if (entry.name === "first-contentful-paint") perf.fcp = entry.startTime
  })
  observe("largest-contentful-paint", (entry) => {
    perf.lcp = entry.startTime
  })
  observe("longtask", (entry) => perf.longTasks.push({ start: entry.startTime, duration: entry.duration }))
  observe(
    "event",
    (entry) => {
      perf.events.push({
        name: entry.name,
        start: entry.startTime,
        duration: entry.duration,
        processing: entry.processingEnd - entry.processingStart,
        delay: entry.processingStart - entry.startTime,
        interactionId: entry.interactionId
      })
    },
    { durationThreshold: 0 }
  )
  // eslint-disable-next-line no-new-func
  const ready = new Function(`return (${readySource})()`)
  const timer = setInterval(() => {
    try {
      if (perf.readyAt === undefined && ready()) {
        perf.readyAt = performance.now()
        clearInterval(timer)
      }
    } catch {
      // not yet
    }
  }, 25)
}

/** CDP `Performance.getMetrics`, as an object of the ones we report. */
export async function metrics(cdp) {
  const { metrics: list } = await cdp.send("Performance.getMetrics")
  const all = Object.fromEntries(list.map(({ name, value }) => [name, value]))
  const pick = [
    "JSHeapUsedSize",
    "JSHeapTotalSize",
    "Nodes",
    "Documents",
    "JSEventListeners",
    "LayoutCount",
    "RecalcStyleCount",
    "LayoutDuration",
    "RecalcStyleDuration",
    "ScriptDuration",
    "TaskDuration"
  ]
  return Object.fromEntries(pick.map((name) => [name, all[name]]))
}

/** Force a full GC (twice, as objects freed by the first can free more), then the metrics. */
export async function metricsAfterGC(cdp) {
  await cdp.send("HeapProfiler.collectGarbage")
  await cdp.send("HeapProfiler.collectGarbage")
  return metrics(cdp)
}

/**
 * Wait for the page to be ready, then for a quiet spell:  `quietMs` with no new long task (capped at `capMs`).
 * - Returns the page's `__perf` with `tti` (end of last long task, or ready) and `tbt` (sum of each long task over 50ms).
 */
export async function waitReadyAndQuiet(page, { timeout = 180_000, quietMs = 3000, capMs = 60_000 } = {}) {
  await page.waitForFunction(() => window.__perf?.readyAt !== undefined, undefined, { timeout, polling: 250 })
  const started = Date.now()
  let lastCount = -1
  let quietSince = Date.now()
  while (Date.now() - started < capMs) {
    const count = await page.evaluate(() => window.__perf.longTasks.length)
    if (count !== lastCount) {
      lastCount = count
      quietSince = Date.now()
    } else if (Date.now() - quietSince >= quietMs) break
    await page.waitForTimeout(250)
  }
  const perf = await page.evaluate(() => ({ ...window.__perf, events: undefined }))
  const lastEnd = Math.max(0, ...perf.longTasks.map((task) => task.start + task.duration))
  perf.tti = Math.max(perf.readyAt, lastEnd)
  perf.tbt = perf.longTasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0)
  perf.longTaskTotal = perf.longTasks.reduce((sum, task) => sum + task.duration, 0)
  perf.longTaskCount = perf.longTasks.length
  perf.longestTask = Math.max(0, ...perf.longTasks.map((task) => task.duration))
  delete perf.longTasks
  return perf
}

/** The median of `values` (numbers;  `undefined`s dropped). */
export function median(values) {
  const sorted = values.filter((value) => typeof value === "number" && !Number.isNaN(value)).sort((a, b) => a - b)
  if (!sorted.length) return undefined
  const middle = sorted.length >> 1
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

/** Bytes as `1.2 MB` / `340 kB`. */
export function bytes(count) {
  if (count === undefined) return "?"
  if (count >= 1e6) return `${(count / 1e6).toFixed(2)} MB`
  if (count >= 1e3) return `${(count / 1e3).toFixed(0)} kB`
  return `${count} B`
}

/**
 * Walk the page through every open shadow root:  elements, custom elements, shadow roots, and their style sheets.
 * - `adoptedRefs`:  sheets adopted, counted per root;  `uniqueAdopted`:  distinct sheet objects.
 *   A low unique / refs ratio means instances SHARE their sheets.
 * - `perTag`:  for each custom element tag with a shadow root, instances, sheets per instance,
 *   distinct sheets across its instances, and `<style>` elements inside its roots.
 * - Closed shadow roots can't be seen.
 */
export function domCensus() {
  let elements = 0
  let customElements = 0
  let shadowRoots = 0
  let adoptedRefs = 0
  let styleElementsInShadow = 0
  const uniqueAdopted = new Set()
  const perTag = new Map()
  const walk = (root) => {
    for (const element of root.querySelectorAll("*")) {
      elements++
      const isCustom = element.localName.includes("-")
      if (isCustom) customElements++
      const shadow = element.shadowRoot
      if (!shadow) continue
      shadowRoots++
      const sheets = shadow.adoptedStyleSheets ?? []
      adoptedRefs += sheets.length
      const styles = shadow.querySelectorAll("style").length
      styleElementsInShadow += styles
      let entry = perTag.get(element.localName)
      if (!entry) perTag.set(element.localName, (entry = { instances: 0, sheetRefs: 0, sheets: new Set(), styles: 0 }))
      entry.instances++
      entry.sheetRefs += sheets.length
      entry.styles += styles
      for (const sheet of sheets) {
        uniqueAdopted.add(sheet)
        entry.sheets.add(sheet)
      }
      walk(shadow)
    }
  }
  walk(document)
  for (const sheet of document.adoptedStyleSheets ?? []) uniqueAdopted.add(sheet)
  let uniqueRules = 0
  let uniqueCssChars = 0
  for (const sheet of uniqueAdopted) {
    try {
      uniqueRules += sheet.cssRules.length
      for (const rule of sheet.cssRules) uniqueCssChars += rule.cssText.length
    } catch {
      // unreadable
    }
  }
  const tags = [...perTag.entries()]
    .map(([tag, entry]) => ({
      tag,
      instances: entry.instances,
      sheetsPerInstance: +(entry.sheetRefs / entry.instances).toFixed(1),
      distinctSheets: entry.sheets.size,
      stylesInRoots: entry.styles
    }))
    .sort((one, other) => other.instances - one.instances)
  return {
    elements,
    customElements,
    shadowRoots,
    adoptedRefs,
    uniqueAdopted: uniqueAdopted.size,
    uniqueRules,
    uniqueCssChars,
    styleElementsInShadow,
    documentStyleSheets: document.styleSheets.length,
    topTags: tags.slice(0, 12)
  }
}

/** Collect every response's size from CDP:  `{ url, type, encoded, status }` by request id. */
export function trackResponses(cdp) {
  const byId = new Map()
  cdp.on("Network.responseReceived", ({ requestId, response, type }) => {
    byId.set(requestId, { url: response.url, type, status: response.status, encoding: response.headers["content-encoding"] ?? response.headers["Content-Encoding"] })
  })
  cdp.on("Network.loadingFinished", ({ requestId, encodedDataLength }) => {
    const entry = byId.get(requestId)
    if (entry) entry.encoded = encodedDataLength
  })
  return byId
}

/** The page's resource timings:  `decodedBodySize` per URL (same-origin ones;  others read 0). */
export function resourceSizes(page) {
  return page.evaluate(() =>
    performance.getEntriesByType("resource").map((entry) => ({
      url: entry.name,
      initiator: entry.initiatorType,
      transfer: entry.transferSize,
      encoded: entry.encodedBodySize,
      decoded: entry.decodedBodySize,
      duration: entry.duration
    }))
  )
}
