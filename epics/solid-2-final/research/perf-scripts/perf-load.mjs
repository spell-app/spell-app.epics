/**
 * Load a page cold, `--runs` times (default 3), and measure:
 * - load:  FCP, LCP, ready (usable), TTI-like (end of last long task before 3s quiet), long tasks, TBT-like
 * - JS:  requests, bytes transferred (CDP) and decoded (Resource Timing), top 10 resources, gzip estimate of JS
 * - memory:  CDP `Performance.getMetrics` after load, and after a forced GC
 * - DOM:  elements through shadow roots, custom elements, shadow roots, adopted sheets and whether they're shared
 * Usage (from the kit's root):
 *   node <this folder>/perf-load.mjs <editor|docs|epic|run> <desktop|phone> [--runs 3] [--out results.json]
 */
import { writeFileSync } from "node:fs"
import { gzipSync } from "node:zlib"

import {
  PAGES,
  args,
  bytes,
  domCensus,
  loadAverage,
  median,
  metrics,
  metricsAfterGC,
  openFresh,
  resourceSizes,
  trackResponses,
  waitReadyAndQuiet
} from "./perf-lib.mjs"

const { positional, flags } = args()
const [pageKey = "editor", profileKey = "desktop"] = positional
const runs = Number(flags.runs ?? 3)
const results = []

for (let run = 1; run <= runs; run++) {
  const uptime = await loadAverage()
  const { browser, page, cdp, writesBlocked } = await openFresh(pageKey, profileKey)
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error).slice(0, 300)))
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text().slice(0, 300))
  })
  const responses = trackResponses(cdp)
  // JS bodies, for a gzip estimate:  served uncompressed here, a real host would compress them
  const jsBodies = new Map()
  page.on("response", async (response) => {
    const type = response.request().resourceType()
    if (type !== "script") return
    try {
      const body = await response.body()
      jsBodies.set(response.url(), { raw: body.length, gzip: gzipSync(body, { level: 6 }).length })
    } catch {
      // redirected or gone
    }
  })
  const started = Date.now()
  await page.goto(PAGES[pageKey].url(), { timeout: 180_000, waitUntil: "commit" })
  let perf
  try {
    perf = await waitReadyAndQuiet(page)
  } catch (error) {
    perf = { error: String(error).slice(0, 200) }
  }
  const wall = Date.now() - started
  const afterLoad = await metrics(cdp)
  const afterGC = await metricsAfterGC(cdp)
  const census = await page.evaluate(domCensus)
  const resources = await resourceSizes(page)
  const network = [...responses.values()].filter((entry) => entry.encoded !== undefined)
  const decodedByUrl = new Map(resources.map((entry) => [entry.url, entry.decoded]))
  const all = network.map((entry) => ({
    url: entry.url,
    type: entry.type,
    transferred: entry.encoded,
    decoded: decodedByUrl.get(entry.url) || jsBodies.get(entry.url)?.raw,
    gzip: jsBodies.get(entry.url)?.gzip,
    encoding: entry.encoding
  }))
  const scripts = all.filter((entry) => entry.type === "Script")
  const sum = (list, key) => list.reduce((total, entry) => total + (entry[key] ?? 0), 0)
  const result = {
    run,
    uptime,
    wall,
    perf,
    requests: all.length,
    transferred: sum(all, "transferred"),
    decoded: sum(all, "decoded"),
    js: {
      requests: scripts.length,
      transferred: sum(scripts, "transferred"),
      decoded: sum(scripts, "decoded"),
      gzipEstimate: sum(scripts, "gzip"),
      compressedByServer: scripts.some((entry) => entry.encoding)
    },
    byType: Object.entries(
      all.reduce((types, entry) => {
        const type = (types[entry.type] ??= { count: 0, transferred: 0, decoded: 0 })
        type.count++
        type.transferred += entry.transferred ?? 0
        type.decoded += entry.decoded ?? 0
        return types
      }, {})
    ),
    top: [...all]
      .sort((one, other) => (other.decoded ?? other.transferred) - (one.decoded ?? one.transferred))
      .slice(0, 10)
      .map((entry) => ({ ...entry, url: entry.url.replace(/^https?:\/\/[^/]+/, "") })),
    afterLoad,
    afterGC,
    census,
    errors: errors.slice(0, 10),
    writesBlocked: writesBlocked.length
  }
  results.push(result)
  console.error(
    `${pageKey}/${profileKey} run ${run}:  ready ${perf.readyAt?.toFixed(0)}ms  tti ${perf.tti?.toFixed(0)}  tbt ${perf.tbt?.toFixed(0)}  ` +
      `js ${scripts.length} req ${bytes(result.js.transferred)} (decoded ${bytes(result.js.decoded)})  ` +
      `heap ${bytes(afterGC.JSHeapUsedSize)} after GC  nodes ${afterGC.Nodes}  elements ${census.elements}  ` +
      `(${uptime.replace(/.*load averages?:/, "load")})`
  )
  await browser.close()
}

const keys = ["fcp", "lcp", "readyAt", "tti", "tbt", "longTaskTotal", "longTaskCount", "longestTask"]
const summary = {
  page: pageKey,
  profile: profileKey,
  runs,
  median: {
    ...Object.fromEntries(keys.map((key) => [key, median(results.map((result) => result.perf[key]))])),
    heapAfterLoad: median(results.map((result) => result.afterLoad.JSHeapUsedSize)),
    heapAfterGC: median(results.map((result) => result.afterGC.JSHeapUsedSize)),
    heapTotalAfterGC: median(results.map((result) => result.afterGC.JSHeapTotalSize)),
    nodesAfterGC: median(results.map((result) => result.afterGC.Nodes)),
    listenersAfterGC: median(results.map((result) => result.afterGC.JSEventListeners)),
    documentsAfterGC: median(results.map((result) => result.afterGC.Documents)),
    scriptDuration: median(results.map((result) => result.afterLoad.ScriptDuration)),
    layoutDuration: median(results.map((result) => result.afterLoad.LayoutDuration)),
    styleDuration: median(results.map((result) => result.afterLoad.RecalcStyleDuration))
  },
  results
}
const out = flags.out ?? `perf-load-${pageKey}-${profileKey}.json`
writeFileSync(out, JSON.stringify(summary, null, 2))
console.log(JSON.stringify(summary.median))
