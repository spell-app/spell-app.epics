// Epic `editor` T90, T91:  the top bar's icon buttons and the Inspector card's Inspect app, one look:
// Spell UI's circular item, pressed while inspecting;  each one's box, radius and fill, and shots light and dark.
// - Usage:  node t91-inspect-look.mjs [editorUrl]
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 860 }, deviceScaleFactor: 2 })
  await context.route(/\/api\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
  await page.waitForFunction(() => window.Inspector && document.querySelector("solitaire-card"), undefined, { timeout: 90000 })
  await page.waitForTimeout(2500)
  await page.evaluate(() => {
    if (!window.Inspector.isOpen) window.Inspector.toggle()
    window.Inspector.startInspecting()
  })
  if (scheme === "dark")
    await page.evaluate(() => {
      document.documentElement.classList.replace("ui-light", "ui-dark")
      document.documentElement.style.colorScheme = "dark"
    })
  await page.mouse.move(700, 700)
  await page.waitForTimeout(1200)
  const looks = await page.evaluate(() =>
    [...document.querySelectorAll("ui-item[appearance~=circular], ui-item.AddPartButton")].map((item) => {
      const box = item.shadowRoot.querySelector("[part~=item]")
      const b = box.getBoundingClientRect()
      const style = getComputedStyle(box)
      return {
        where: item.closest(".InspectorCard") ? "card" : "bar",
        cls: item.className.split(" ")[0],
        size: `${Math.round(b.width * 10) / 10}x${Math.round(b.height * 10) / 10}`,
        radius: style.borderRadius,
        fill: style.backgroundColor,
        shadow: style.boxShadow.slice(0, 50)
      }
    })
  )
  for (const look of looks) console.log(scheme, JSON.stringify(look))
  await page.screenshot({ path: `${OUT}/t90-bar-${scheme}.png`, clip: { x: 560, y: 0, width: 360, height: 38 } })
  const card = await page.locator(".InspectorCard").first().boundingBox()
  await page.screenshot({ path: `${OUT}/t91-card-${scheme}.png`, clip: { x: card.x, y: card.y, width: card.width, height: 44 } })
  await context.close()
}
await browser.close()
