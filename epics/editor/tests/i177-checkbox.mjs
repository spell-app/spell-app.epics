// Epic `editor` I177:  the Inspector's yes/no fields -- a round circle like a radio before;  a toggle after.
// - Usage:  node i177-checkbox.mjs [editorUrl] [before|after] [project]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url
const STAGE = process.argv.includes("after") ? "after" : "before"

/** Each yes/no field in the properties card:  its label, its control's look, and how it lines up with its label and ⓘ. */
function checks() {
  const all = []
  const walk = (root) => {
    for (const el of root.querySelectorAll("*")) {
      if (el.localName === "ui-checkbox") all.push(el)
      if (el.shadowRoot) walk(el.shadowRoot)
    }
  }
  walk(document.querySelector(".InspectorColumn"))
  return all.slice(0, 8).map((box) => {
    const property = box.closest("ui-property")
    const field = property?.shadowRoot?.querySelector(".field")
    const label = field?.querySelector(".label")
    const info = field?.querySelector(".info")
    const drawn = [...(box.shadowRoot?.querySelectorAll("*") ?? [])]
      .map((each) => ({ each, style: getComputedStyle(each), rect: each.getBoundingClientRect() }))
      .filter(({ style, rect }) => rect.width > 6 && rect.width < 60 && rect.height > 6 && style.borderTopWidth !== "0px")
      .map(({ each, style, rect }) => ({ part: each.className || each.localName, w: Math.round(rect.width), h: Math.round(rect.height), radius: style.borderTopLeftRadius, cy: Math.round(rect.top + rect.height / 2) }))
    const centre = (el) => (el ? Math.round(el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2) : null)
    return { name: property?.getAttribute("name"), type: box.getAttribute("type"), toggle: box.hasAttribute("toggle"), drawn, labelCy: centre(label), infoCy: centre(info) }
  })
}

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 }, colorScheme: scheme, deviceScaleFactor: 2 })
  await context.route(/\/api\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
  await page.waitForFunction(() => window.Inspector && document.querySelector("solitaire-card"), undefined, { timeout: 90000 })
  await page.waitForTimeout(2000)
  await page.evaluate(() => {
    if (!window.Inspector.isOpen) window.Inspector.showOrHide()
  })
  await page.waitForTimeout(800)
  await page.evaluate(() => {
    window.Inspector.stopInspecting()
    window.Inspector.select([...document.querySelectorAll("solitaire-card")].at(-1))
  })
  await page.waitForTimeout(3000)
  const found = await page.evaluate(checks)
  console.log(scheme, JSON.stringify(found, null, 1))
  await page.locator('ui-panel.InspectorCard[data-panel="properties"]').first().screenshot({ path: `${OUT}/i177-${STAGE}-${scheme}.png` })
  console.log(scheme, "errors", JSON.stringify(errors))
  await context.close()
}
await browser.close()
