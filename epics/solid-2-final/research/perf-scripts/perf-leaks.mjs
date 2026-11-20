/**
 * Leak loops:  repeat an interaction, and compare the heap (after a forced GC), DOM nodes and listeners before and after.
 * - A warm-up round first (first opens fill caches), then the baseline, then the loop.
 * - Growth per cycle = (after - before) / cycles.
 * Usage (from the kit's root):
 *   node <this folder>/perf-leaks.mjs <editor|docs|epic> [desktop|phone] [--out leaks.json]
 * - editor:  switch files 20x, fold / unfold an Inspector card 30x, open / close a bar menu 30x, type 200 characters
 * - docs (kitchen sink):  open / close a dropdown 50x, open / close a modal 50x
 * - epic (epic-engine's page):  open / fold items 30x
 */
import { writeFileSync } from "node:fs"

import { PAGES, args, bytes, loadAverage, metricsAfterGC, openFresh, waitReadyAndQuiet } from "./perf-lib.mjs"

const { positional, flags } = args()
const [pageKey = "editor", profileKey = "desktop"] = positional

/** Each page's loops:  `{ name, cycles, setup?, cycle(page, index) }`. */
const LOOPS = {
  editor: [
    {
      name: "switch files",
      cycles: 20,
      async cycle(page, index) {
        const names = ["Pile.spell", "Deck.spell", "Solitaire.spell", "Card.spell"]
        await page.getByText(names[index % names.length], { exact: true }).first().click()
        await page.waitForTimeout(400)
      }
    },
    {
      name: "fold / unfold the Inspector's Code card",
      cycles: 30,
      async cycle(page) {
        const header = page.locator(".InspectorCard").getByText("Code", { exact: true }).first()
        await header.click()
        await page.waitForTimeout(150)
        await header.click()
        await page.waitForTimeout(150)
      }
    },
    {
      name: "open / close the View menu",
      cycles: 30,
      async cycle(page) {
        await page.locator(".EditorBar").getByText("View", { exact: true }).first().click()
        await page.waitForTimeout(150)
        await page.keyboard.press("Escape")
        await page.waitForTimeout(150)
      }
    },
    {
      name: "type 200 characters into a comment",
      cycles: 200,
      async setup(page) {
        await page.getByText("Card.spell", { exact: true }).first().click()
        await page.waitForTimeout(800)
        await page.evaluate(() => {
          const { view } = window.editor.shownCodeEditor
          const line = view.state.doc.line(2)
          view.dispatch({ selection: { anchor: line.to }, scrollIntoView: true })
          view.focus()
        })
      },
      async cycle(page, index) {
        const text = " the quick brown fox jumps over the lazy dog"
        await page.keyboard.type(text[index % text.length])
        await page.waitForTimeout(60)
      }
    }
  ],
  docs: [
    {
      name: "open / close a dropdown (open attribute)",
      cycles: 50,
      async cycle(page) {
        await page.evaluate(async () => {
          const dropdown = document.querySelectorAll("ui-dropdown")[1]
          dropdown.setAttribute("open", "")
          await new Promise((resolve) => setTimeout(resolve, 80))
          dropdown.removeAttribute("open")
          await new Promise((resolve) => setTimeout(resolve, 80))
        })
      }
    },
    {
      name: "open / close a modal (open attribute)",
      cycles: 50,
      async cycle(page) {
        await page.evaluate(async () => {
          const modal = document.querySelector("ui-modal")
          modal.setAttribute("open", "")
          await new Promise((resolve) => setTimeout(resolve, 120))
          modal.removeAttribute("open")
          await new Promise((resolve) => setTimeout(resolve, 120))
        })
      }
    }
  ],
  epic: [
    {
      name: "open / fold items (open attribute), 10 items in turn",
      cycles: 30,
      async cycle(page, index) {
        await page.evaluate(async (at) => {
          const items = document.querySelectorAll("epic-item")
          const item = items[(at * 7) % 70]
          item.setAttribute("open", "")
          await new Promise((resolve) => setTimeout(resolve, 200))
          item.removeAttribute("open")
          await new Promise((resolve) => setTimeout(resolve, 100))
        }, index)
      }
    }
  ]
}

const uptime = await loadAverage()
const { browser, page, cdp, writesBlocked } = await openFresh(pageKey, profileKey)
const errors = []
page.on("pageerror", (error) => errors.push(String(error).slice(0, 300)))
await page.goto(PAGES[pageKey].url(), { timeout: 180_000, waitUntil: "commit" })
await waitReadyAndQuiet(page, { quietMs: 2000 })
const results = []
for (const loop of LOOPS[pageKey]) {
  try {
    if (loop.setup) await loop.setup(page)
    // warm-up:  a few cycles, so first-use caches aren't counted as leaks
    for (let index = 0; index < Math.min(3, loop.cycles); index++) await loop.cycle(page, index)
    await page.waitForTimeout(500)
    const before = await metricsAfterGC(cdp)
    const started = Date.now()
    for (let index = 0; index < loop.cycles; index++) await loop.cycle(page, index)
    const elapsed = Date.now() - started
    await page.waitForTimeout(1000)
    const after = await metricsAfterGC(cdp)
    const delta = (key) => after[key] - before[key]
    const result = {
      name: loop.name,
      cycles: loop.cycles,
      elapsed,
      heapBefore: before.JSHeapUsedSize,
      heapAfter: after.JSHeapUsedSize,
      heapPerCycle: Math.round(delta("JSHeapUsedSize") / loop.cycles),
      nodesBefore: before.Nodes,
      nodesAfter: after.Nodes,
      nodesPerCycle: +(delta("Nodes") / loop.cycles).toFixed(1),
      listenersBefore: before.JSEventListeners,
      listenersAfter: after.JSEventListeners,
      listenersPerCycle: +(delta("JSEventListeners") / loop.cycles).toFixed(1),
      documentsDelta: delta("Documents")
    }
    results.push(result)
    console.error(
      `${loop.name}:  heap ${bytes(before.JSHeapUsedSize)} -> ${bytes(after.JSHeapUsedSize)} (${bytes(result.heapPerCycle)}/cycle)  ` +
        `nodes ${before.Nodes} -> ${after.Nodes}  listeners ${before.JSEventListeners} -> ${after.JSEventListeners}`
    )
  } catch (error) {
    results.push({ name: loop.name, error: String(error).slice(0, 300) })
    console.error(`${loop.name}:  FAILED ${String(error).slice(0, 200)}`)
  }
}
await browser.close()
const out = flags.out ?? `perf-leaks-${pageKey}-${profileKey}.json`
writeFileSync(out, JSON.stringify({ page: pageKey, profile: profileKey, uptime, results, errors, writesBlocked: writesBlocked.length }, null, 2))
