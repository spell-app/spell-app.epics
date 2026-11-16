// Epic `editor` I213:  spacing on a 4px grid -- every computed padding / margin / gap in the editor's chrome
// (Spell UI's elements inside it too) that isn't a multiple of 4, and the drawn gaps that matter, plus
// whole-window shots, light and dark, of Solitaire with the Inspector open.
// - Usage:  node i213-grid.mjs [tag] [editorUrl]
//   - `GRID_LIST=1` prints every off-grid computed value, grouped
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const TAG = process.argv[2] ?? "after"
const EDITOR =
  process.argv[3] ?? JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

/** Every off-grid computed spacing value, grouped by a short name for the box. */
function offGrid() {
  const PROPS = ["padding-top", "padding-right", "padding-bottom", "padding-left", "margin-top", "margin-right", "margin-bottom", "margin-left", "row-gap", "column-gap"]
  const found = new Map()
  const nameOf = (el) => {
    const host = el.getRootNode().host
    const part = el.getAttribute?.("part")
    const own = `${el.localName}${el.classList.length ? "." + [...el.classList].slice(0, 2).join(".") : ""}${part ? `[part=${part.split(" ")[0]}]` : ""}`
    return host ? `${host.localName}${host.classList.length ? "." + [...host.classList][0] : ""} >> ${own}` : own
  }
  const skip = (el) => el.closest?.(".cm-content, .bubbly-shapes, solitaire-card, .SpellAppRunner .app, spell-app")
  const visit = (root) => {
    for (const el of root.querySelectorAll("*")) {
      if (el.shadowRoot) visit(el.shadowRoot)
      if (skip(el)) continue
      const box = el.getBoundingClientRect()
      if (!box.width || !box.height) continue
      const style = getComputedStyle(el)
      if (style.display === "contents" || style.visibility === "hidden") continue
      for (const prop of PROPS) {
        const raw = style.getPropertyValue(prop)
        if (raw === "normal" || raw === "auto") continue
        const px = parseFloat(raw)
        if (!px) continue
        if ((prop.endsWith("gap")) && el.children.length < 2 && !el.shadowRoot) continue
        const rest = Math.abs(px) % 4
        if (rest < 0.05 || rest > 3.95) continue
        const key = `${nameOf(el)}  ${prop}: ${+px.toFixed(2)}px`
        found.set(key, (found.get(key) ?? 0) + 1)
      }
    }
  }
  visit(document)
  return [...found].sort()
}

/** The drawn gaps that matter, rounded to 0.1px. */
function drawn() {
  const r = (n) => Math.round(n * 10) / 10
  const deep = (root, test) => {
    for (const el of root.querySelectorAll("*")) {
      if (test(el)) return el
      if (el.shadowRoot) { const f = deep(el.shadowRoot, test); if (f) return f }
    }
  }
  const out = {}
  const tabs = document.querySelector(".FileTabs")
  const bar = deep(document, (el) => el.localName === "ui-toolbar" && el.getAttribute("label") === "Files")
  if (tabs && bar) {
    const band = tabs.getBoundingClientRect()
    const tab = bar.querySelector(":scope > ui-item:not([hidden])")?.shadowRoot?.querySelector("[part~=item]")?.getBoundingClientRect()
    if (tab) out.fileTabs = { top: r(tab.top - band.top), bottom: r(band.bottom - tab.bottom), left: r(tab.left - band.left), height: r(band.height) }
  }
  const editor = [...document.querySelectorAll(".cm-editor")].find((each) => !each.closest(".CodeSlice, .InspectorColumn") && each.getBoundingClientRect().width > 300)
  if (editor) {
    const pane = editor.getBoundingClientRect()
    const shapes = [...editor.querySelectorAll(".bubbly-shapes *, .cmb-band, [class*=cmb-row]")].map((e) => e.getBoundingClientRect()).filter((b) => b.height > 2 && b.width > 2)
    const gutter = editor.querySelector(".cm-gutters")?.getBoundingClientRect()
    const line = [...editor.querySelectorAll(".cm-line")].find((l) => l.textContent.trim())?.getBoundingClientRect()
    out.codePane = {
      bandLeftFromPane: shapes.length ? r(Math.min(...shapes.map((b) => b.left)) - pane.left) : null,
      bandTopBelowTabs: shapes.length && tabs ? r(Math.min(...shapes.map((b) => b.top)) - tabs.getBoundingClientRect().bottom) : null,
      gutterWidth: gutter ? r(gutter.width) : null,
      firstLineLeftFromPane: line ? r(line.left - pane.left) : null,
      firstLineTopFromPane: line ? r(line.top - pane.top) : null
    }
  }
  const draft = document.querySelector(".PublishDraft")
  if (draft) {
    const items = [...draft.querySelectorAll("ui-button, ui-icon, a, span")].map((e) => (e.shadowRoot?.querySelector("[part~=icon], [part~=button]") ?? e).getBoundingClientRect()).filter((b) => b.width)
    out.draftBar = { height: r(draft.getBoundingClientRect().height) }
  }
  const cards = [...document.querySelectorAll(".InspectorCard")].filter((c) => c.getBoundingClientRect().height > 0)
  out.inspector = cards.map((card) => {
    const header = card.shadowRoot?.querySelector("[part~=header]")?.getBoundingClientRect()
    const box = card.getBoundingClientRect()
    const first = [...card.querySelectorAll("ui-property-editor, ui-tree, .CodeCard, .InspectorBody, *")].map((e) => e.getBoundingClientRect()).find((b) => header && b.height > 4 && b.top >= header.bottom - 0.5)
    const title = card.shadowRoot?.querySelector("[part~=title], [part~=label]")?.getBoundingClientRect()
    return { panel: card.dataset.panel, headerH: header ? r(header.height) : null, titleLeft: title ? r(title.left - box.left) : null, headerToFirst: first && header ? r(first.top - header.bottom) : null }
  })
  return out
}

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme, deviceScaleFactor: 2 })
  await context.route(/\/api\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire?scheme=${scheme}`, { timeout: 90000 })
  await page.waitForFunction(() => window.Inspector && document.querySelector("solitaire-card"), undefined, { timeout: 90000 })
  await page.waitForTimeout(3000)
  if (!(await page.evaluate(() => window.Inspector.isOpen))) await page.evaluate(() => window.Inspector.showOrHide())
  await page.waitForTimeout(1000)
  await page.evaluate(() => {
    window.Inspector.stopInspecting?.()
    window.Inspector.select([...document.querySelectorAll("solitaire-card")].at(-1))
  })
  await page.waitForTimeout(2500)
  await page.mouse.move(2, 890)
  await page.screenshot({ path: `${OUT}/i213-${TAG}-${scheme}.png` })
  console.log(scheme, TAG, JSON.stringify(await page.evaluate(drawn)))
  if (scheme === "light" && process.env.GRID_LIST) for (const [key, count] of await page.evaluate(offGrid)) console.log(`  ${key}${count > 1 ? `  x${count}` : ""}`)
  await context.close()
}
await browser.close()
