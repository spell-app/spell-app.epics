// Epic `editor` I177:  the Inspector's yes/no fields -- a round circle like a radio before;  a toggle after.
// - Usage:  node i177-checkbox.mjs [editorUrl] [before|after]  (before:  main's editor, http://localhost:3001/)
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url
const STAGE = process.argv.includes("after") ? "after" : "before"
// the part to select:  Owen's case, a tree's Sticky path, in the Tree guide
const PROJECT = "@spell/guides/SpellUI/Tree"
const PART = "ui-tree"

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
    const fieldLabel = field?.querySelector(".label")
    const info = field?.querySelector(".info")
    const label = box.shadowRoot?.querySelector("label")
    const before = label ? getComputedStyle(label, "::before") : undefined
    const top = label?.getBoundingClientRect().top ?? 0
    const drawn = before && { w: before.width, h: before.height, radius: before.borderTopLeftRadius, cy: Math.round(top + parseFloat(before.top) + parseFloat(before.height) / 2) }
    const centre = (el) => (el ? Math.round(el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2) : null)
    return { name: property?.getAttribute("name"), appearance: box.getAttribute("appearance") ?? box.getAttribute("type"), toggle: box.hasAttribute("toggle"), drawn, labelCy: centre(fieldLabel), infoCy: centre(info) }
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
  await page.goto(`${EDITOR}edit/${PROJECT}?scheme=${scheme}`, { timeout: 90000 })
  await page.waitForFunction((part) => window.Inspector && document.querySelector(part), PART, { timeout: 90000 })
  await page.waitForTimeout(2000)
  await page.evaluate(() => {
    if (!window.Inspector.isOpen) window.Inspector.showOrHide()
  })
  await page.waitForTimeout(800)
  await page.evaluate((part) => {
    window.Inspector.stopInspecting()
    window.Inspector.select(document.querySelector(part))
  }, PART)
  await page.waitForTimeout(3000)
  const found = await page.evaluate(checks)
  console.log(scheme, JSON.stringify(found, null, 1))
  await page.locator('ui-panel.InspectorCard[data-panel="properties"]').first().screenshot({ path: `${OUT}/i177-${STAGE}-${scheme}.png` })
  // turned on:  a click on it, as a person's
  await page.evaluate(() => {
    const property = [...document.querySelectorAll("ui-property")].find((each) => each.getAttribute("name") === "sticky-path")
    property?.querySelector("ui-checkbox")?.click()
  })
  await page.waitForTimeout(800)
  console.log(scheme, "on", JSON.stringify(await page.evaluate(checks)))
  const card = await page.locator('ui-panel.InspectorCard[data-panel="properties"]').first().boundingBox()
  await page.screenshot({ path: `${OUT}/i177-${STAGE}-on-${scheme}.png`, clip: { x: card.x, y: card.y + card.height - 90, width: card.width, height: 90 } })
  console.log(scheme, "errors", JSON.stringify(errors))
  await context.close()
}
await browser.close()
