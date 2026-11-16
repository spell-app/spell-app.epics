// Epic `editor` I164:  the Inspector's code boxes -- room inside for their bubbles (the end of an `if`), less margin, less round.
// - Usage:  node i164-slice-pad.mjs [tag] [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const TAG = process.argv[2] ?? "after"
const EDITOR =
  process.argv[3] ?? JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1500, height: 1300 }, colorScheme: scheme, deviceScaleFactor: 2 })
  await context.route(/\/api\//, (route) => {
    if (route.request().method() === "GET") return route.continue()
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  })
  const page = await context.newPage()
  const errors = []
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)))
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
  await page.waitForSelector(".InputEditor .monaco-editor .view-line", { timeout: 90000 })
  await page.waitForTimeout(3000)
  await page.evaluate((scheme) => {
    document.documentElement.style.colorScheme = scheme
    document.documentElement.style.setProperty("--ui-scheme", scheme)
  }, scheme)
  if (!(await page.evaluate(() => !!document.querySelector(".InspectAppButton.inspecting")))) {
    await page.locator(".InspectAppButton [part~=item]").first().click({ force: true })
  }
  await page.waitForTimeout(1500)
  await page.locator(".InspectorViews").getByText("Solitaire", { exact: true }).first().click({ force: true })
  await page.waitForTimeout(3000)
  for (const [name, text] of [["score", "when the score changes"], ["restart", "restart the game"]]) {
    const card = (name === "restart" ? page.locator("ui-section.InspectorEvent.action") : page.locator("ui-section.InspectorEvent")).filter({ hasText: text }).first()
    await card.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1200)
    const info = await card.evaluate((card) => {
      const r = (el) => { const b = el.getBoundingClientRect(); return { l: +b.left.toFixed(1), t: +b.top.toFixed(1), r: +b.right.toFixed(1), b: +b.bottom.toFixed(1) } }
      const slice = card.querySelector(".CodeSlice")
      const box = r(slice)
      const cardBox = r(card)
      const header = card.querySelector("[slot=header], .InspectorEventHeader, header")
      const shapes = [...slice.querySelectorAll(".bubbly-shapes *")].filter((e) => e.getBoundingClientRect().height > 0)
      const top = Math.min(...shapes.map((e) => e.getBoundingClientRect().top))
      const bottom = Math.max(...shapes.map((e) => e.getBoundingClientRect().bottom))
      const left = Math.min(...shapes.map((e) => e.getBoundingClientRect().left))
      const lines = [...slice.querySelectorAll(".view-line")].map((l) => l.innerText.trim()).filter(Boolean)
      const feet = slice.querySelectorAll(".bubbly-foot").length
      const blocks = slice.querySelectorAll(".bubbly-block").length
      return {
        lines, blocks, feet,
        radius: getComputedStyle(slice).borderTopLeftRadius,
        box, card: cardBox,
        sideMargin: { left: +(box.l - cardBox.l).toFixed(1), right: +(cardBox.r - box.r).toFixed(1) },
        bottomMargin: +(cardBox.b - box.b).toFixed(1),
        aboveBox: header ? +(box.t - header.getBoundingClientRect().bottom).toFixed(1) : null,
        shapesInside: { top: +(top - box.t).toFixed(1), bottom: +(box.b - bottom).toFixed(1), left: +(left - box.l).toFixed(1) }
      }
    })
    console.log(scheme, name, JSON.stringify(info))
    const box = await card.boundingBox()
    await page.screenshot({
      path: `${OUT}/i164-${TAG}-${name}-${scheme}.png`,
      clip: { x: box.x - 14, y: box.y - 4, width: box.width + 28, height: Math.min(box.height + 8, 420) }
    })
  }
  console.log("errors:", errors.slice(0, 5))
  await context.close()
}
await browser.close()
