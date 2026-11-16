// Epic `editor` T99:  the pinned Add bar's search -- each open topic's results headed by its icon and name;
// alignment measured, light and dark, for "text", "e", "but".
// - Usage:  node t99-search-heads.mjs [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

function measure() {
  const r = (el) => el && el.getBoundingClientRect()
  return [...document.querySelectorAll(".PaletteMatches .PaletteMatchPanel")].map((panel) => {
    const head = panel.querySelector(".PaletteMatchHeader")
    const headIcon = head.querySelector("ui-icon")
    const headGlyph = r(headIcon.shadowRoot?.querySelector("svg, i, [part~=icon]") ?? headIcon)
    const row = panel.querySelector("ui-tree-item")
    const rowIcon = row?.shadowRoot?.querySelector("ui-icon")
    const rowGlyph = r(rowIcon?.shadowRoot?.querySelector("svg, i, [part~=icon]") ?? rowIcon)
    const text = r(head.querySelector("span"))
    const rowText = r(row?.shadowRoot?.querySelector("[part~=label]"))
    const name = document.getElementById(panel.dataset.for)
    const nameBox = r(name?.shadowRoot?.querySelector("[part~=item]") ?? name)
    return {
      head: head.textContent,
      tabIndex: head.tabIndex,
      color: getComputedStyle(head).color,
      headIconX: headGlyph && +headGlyph.x.toFixed(1), headIconW: headGlyph && +headGlyph.width.toFixed(1),
      rowIconX: rowGlyph && +rowGlyph.x.toFixed(1), rowIconW: rowGlyph && +rowGlyph.width.toFixed(1),
      headTextX: text && +text.x.toFixed(1), rowTextX: rowText && +rowText.x.toFixed(1),
      headIconMid: headGlyph && +(headGlyph.y + headGlyph.height / 2).toFixed(1), headTextMid: text && +(text.y + text.height / 2).toFixed(1),
      panelX: +r(panel).x.toFixed(1), nameX: nameBox && +nameBox.x.toFixed(1),
      rows: [...panel.querySelectorAll("ui-tree-item")].map((each) => each.getAttribute("label"))
    }
  })
}

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 860 }, colorScheme: scheme, deviceScaleFactor: 2 })
  await context.route(/\/(api|spaces)\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
  await page.waitForFunction(() => document.querySelector("solitaire-card"), undefined, { timeout: 90000 })
  await page.waitForTimeout(2000)
  if (!(await page.locator(".PaletteStrip").count())) {
    await page.locator(".AddPartButton [part~=item]").first().click()
    await page.waitForTimeout(1500)
    await page.locator(".PalettePin").first().click()
    await page.waitForTimeout(800)
  }
  if (scheme === "dark")
    await page.evaluate(() => {
      document.documentElement.classList.add("ui-dark")
      document.documentElement.classList.remove("ui-light")
      document.documentElement.style.colorScheme = "dark"
    })
  const search = page.locator(".PaletteStrip .PaletteStripSearch input")
  for (const words of ["text", "e", "but"]) {
    await search.fill("")
    await search.click()
    await page.keyboard.type(words, { delay: 30 })
    await page.waitForTimeout(900)
    console.log(scheme, JSON.stringify(words), JSON.stringify(await page.evaluate(measure), null, 0))
    await page.screenshot({ path: `${OUT}/t99-${words}-${scheme}.png`, clip: { x: 0, y: 0, width: 1440, height: 560 } })
    if (words === "text") {
      await page.keyboard.press("ArrowDown")
      await page.waitForTimeout(200)
      console.log("focus after ↓:", await page.evaluate(() => `${document.activeElement?.localName} ${document.activeElement?.getAttribute("label")}`))
      await page.keyboard.press("Escape")
      await page.waitForTimeout(300)
    }
  }
  console.log(scheme, "errors:", errors)
  await context.close()
}
await browser.close()
