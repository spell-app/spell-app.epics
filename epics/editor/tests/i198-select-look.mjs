// Epic `editor` I198:  the Inspector's selects -- the field and its menu upright, no lines between items, the menu
// tall enough for every choice.
// - Opens the Appearance select of Solitaire's first segment, light and dark;
//   reports the field's and each item's font style, the items' top borders, the menu's height against its items'.
// - Usage:  node i198-select-look.mjs <before | after> [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const STAGE = process.argv[2] ?? "after"
const EDITOR =
  process.argv.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme })
  await context.route(/\/(api|spaces)\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
  await page.waitForFunction(() => window.Inspector && document.querySelector("solitaire-card"), undefined, { timeout: 90000 })
  await page.waitForTimeout(2500)
  if (!(await page.evaluate(() => window.Inspector.isOpen))) await page.evaluate(() => window.Inspector.showOrHide())
  await page.evaluate(() => {
    window.Inspector.stopInspecting?.()
    window.Inspector.select(document.querySelector("ui-segment"))
  })
  if (scheme === "dark")
    await page.evaluate(() => {
      document.documentElement.classList.add("ui-dark")
      document.documentElement.classList.remove("ui-light")
      document.documentElement.style.colorScheme = "dark"
    })
  await page.waitForTimeout(2000)
  const pick = await page.evaluate(() => {
    const selects = [...document.querySelectorAll(".InspectorColumn ui-select")]
    const select = selects.find((s) => s.getAttribute("name") === "appearance")
    if (!select) return { count: selects.length }
    select.id = "i198-select"
    select.scrollIntoView({ block: "center" })
    return { count: selects.length, name: select.getAttribute("name"), items: select.querySelectorAll("ui-item").length }
  })
  console.log(scheme, "select", JSON.stringify(pick))
  const native = page.locator("#i198-select").locator("select")
  await native.click()
  await page.waitForTimeout(600)
  const look = await page.evaluate(() => {
    const select = document.getElementById("i198-select").shadowRoot.querySelector("select")
    const options = [...select.querySelectorAll("option")].filter((o) => getComputedStyle(o).display !== "none")
    const b = select.getBoundingClientRect()
    return {
      open: select.matches(":open"),
      field: { fontStyle: getComputedStyle(select).fontStyle, color: getComputedStyle(select).color, text: select.querySelector("selectedcontent")?.textContent },
      box: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) },
      items: options.map((o) => {
        const s = getComputedStyle(o)
        const r = o.getBoundingClientRect()
        return { text: o.textContent.trim(), fontStyle: s.fontStyle, borderTop: s.borderTopWidth + " " + s.borderTopStyle, y: Math.round(r.y), h: Math.round(r.height) }
      })
    }
  })
  console.log(scheme, "look", JSON.stringify(look))
  const last = look.items.at(-1), first = look.items[0]
  console.log(scheme, "menu items span", first && last ? last.y + last.h - first.y : "?")
  await page.screenshot({ path: `${OUT}/i198-${STAGE}-${scheme}.png`, clip: { x: Math.max(0, look.box.x - 60), y: Math.max(0, look.box.y - 140), width: Math.min(560, 1440 - look.box.x + 60), height: 520 } })
  console.log(scheme, "page errors", errors.length, errors.slice(0, 3))
  await context.close()
}
await browser.close()
