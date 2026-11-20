/**
 * The style sheets every shadow root adopts:  for each distinct sheet, its size, its rules, how many roots adopt it,
 * and how many custom properties its `:host` rules declare (each one is computed on every element of that root).
 * Usage (from the kit's root):
 *   node <this folder>/perf-sheets.mjs <editor|docs|epic|run> [desktop|phone] [--out sheets.json]
 */
import { writeFileSync } from "node:fs"

import { PAGES, args, openFresh, waitReadyAndQuiet } from "./perf-lib.mjs"

const { positional, flags } = args()
const [pageKey = "editor", profileKey = "desktop"] = positional
const { browser, page } = await openFresh(pageKey, profileKey)
await page.goto(PAGES[pageKey].url(), { timeout: 180_000, waitUntil: "commit" })
await waitReadyAndQuiet(page, { quietMs: 2000 })
const result = await page.evaluate(() => {
  const sheets = new Map()
  let roots = 0
  const walk = (root) => {
    for (const element of root.querySelectorAll("*")) {
      if (!element.shadowRoot) continue
      roots++
      for (const sheet of element.shadowRoot.adoptedStyleSheets ?? []) {
        let entry = sheets.get(sheet)
        if (!entry) sheets.set(sheet, (entry = { roots: 0, tags: new Set() }))
        entry.roots++
        entry.tags.add(element.localName)
      }
      walk(element.shadowRoot)
    }
  }
  walk(document)
  const rows = []
  for (const [sheet, entry] of sheets) {
    let chars = 0
    let rules = 0
    let customProperties = 0
    let first = ""
    const visit = (list) => {
      for (const rule of list) {
        rules++
        chars += rule.cssText.length
        if (!first && rule.selectorText) first = rule.selectorText.slice(0, 60)
        if (rule.style) for (const name of rule.style) if (name.startsWith("--")) customProperties++
        if (rule.cssRules) visit(rule.cssRules)
      }
    }
    try {
      visit(sheet.cssRules)
    } catch {
      // unreadable
    }
    rows.push({ roots: entry.roots, chars, rules, customProperties, first, tags: [...entry.tags].slice(0, 4).join(" "), tagCount: entry.tags.size })
  }
  rows.sort((one, other) => other.roots * other.chars - one.roots * one.chars)
  const adoptedCharsPerRoot = rows.reduce((sum, row) => sum + row.roots * row.chars, 0) / roots
  return { roots, distinctSheets: rows.length, adoptedCharsPerRoot: Math.round(adoptedCharsPerRoot), sheets: rows.slice(0, 15) }
})
await browser.close()
writeFileSync(flags.out ?? `perf-sheets-${pageKey}.json`, JSON.stringify(result, null, 2))
console.log(`${result.roots} shadow roots, ${result.distinctSheets} distinct sheets, ~${result.adoptedCharsPerRoot} chars of CSS adopted per root`)
for (const sheet of result.sheets)
  console.log(`${String(sheet.roots).padStart(5)} roots  ${String(sheet.chars).padStart(7)} chars  ${String(sheet.rules).padStart(4)} rules  ${String(sheet.customProperties).padStart(4)} --props   ${sheet.first}   (${sheet.tagCount} tags:  ${sheet.tags})`)
