/**
 * Who holds the page's event listeners:  CDP `DOMDebugger.getEventListeners` on every element (through shadow roots),
 * every shadow root, the document and the window;  totals by event type and by element tag.
 * Usage (from the kit's root):
 *   node <this folder>/perf-listeners.mjs <editor|docs|epic|run> [desktop|phone] [--out listeners.json]
 */
import { writeFileSync } from "node:fs"

import { PAGES, args, metricsAfterGC, openFresh, waitReadyAndQuiet } from "./perf-lib.mjs"

const { positional, flags } = args()
const [pageKey = "editor", profileKey = "desktop"] = positional
const { browser, page, cdp } = await openFresh(pageKey, profileKey)
await page.goto(PAGES[pageKey].url(), { timeout: 180_000, waitUntil: "commit" })
await waitReadyAndQuiet(page, { quietMs: 2000 })
const metrics = await metricsAfterGC(cdp)
await page.evaluate(() => {
  const all = [window, document]
  const walk = (root) => {
    for (const element of root.querySelectorAll("*")) {
      all.push(element)
      if (element.shadowRoot) {
        all.push(element.shadowRoot)
        walk(element.shadowRoot)
      }
    }
  }
  walk(document)
  window.__targets = all
})
const { result: count } = await cdp.send("Runtime.evaluate", { expression: "window.__targets.length", returnByValue: true })
const byType = {}
const byTag = {}
let total = 0
for (let index = 0; index < count.value; index++) {
  const { result } = await cdp.send("Runtime.evaluate", { expression: `window.__targets[${index}]` })
  const { listeners } = await cdp.send("DOMDebugger.getEventListeners", { objectId: result.objectId })
  if (!listeners.length) continue
  const label = result.className === "ShadowRoot" ? "#shadow-root" : result.description?.split(/[.#[]/)[0] ?? "?"
  total += listeners.length
  byTag[label] = (byTag[label] ?? 0) + listeners.length
  for (const listener of listeners) byType[listener.type] = (byType[listener.type] ?? 0) + 1
  await cdp.send("Runtime.releaseObject", { objectId: result.objectId })
}
await browser.close()
const sorted = (map) => Object.fromEntries(Object.entries(map).sort((one, other) => other[1] - one[1]).slice(0, 20))
const result = { page: pageKey, metricsListeners: metrics.JSEventListeners, targets: count.value, total, byType: sorted(byType), byTag: sorted(byTag) }
writeFileSync(flags.out ?? `perf-listeners-${pageKey}.json`, JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 1))
