// Epic `editor` I207:  what the split's sizes are as Code folds and unfolds, no drags.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"
const EDITOR = JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1500, height: 1000 } })
await context.route(/\/api\//, (route) =>
  route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
)
const page = await context.newPage()
await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
await page.waitForSelector("solitaire-app", { timeout: 90000, state: "attached" })
await page.waitForTimeout(5000)
for (let tries = 0; tries < 5 && !(await page.locator(".InspectorColumn .InspectorSplit").count()); tries++) {
  await page.locator(".InspectAppButton [part~=item]").first().click({ force: true })
  await page.waitForTimeout(2000)
}
await page.locator("solitaire-card").first().click({ force: true }).catch(() => {})
await page.waitForTimeout(2500)
const state = () =>
  page.evaluate(() => {
    const split = document.querySelector(".InspectorColumn > .InspectorSplit")
    const panes = [...split.querySelectorAll(":scope > .SplitPane")]
    return {
      rows: split.rows + " attr=" + split.getAttribute("rows") + " flex=" + panes.map((p) => p.style.flex).join("|"),
      panes: panes.map((p) => `${p.querySelector(".InspectorCard")?.dataset.panel}${p.querySelector(".InspectorCard.folded") ? "(f)" : ""}:${Math.round(p.getBoundingClientRect().height)}`).join(" "),
      prefs: Object.keys(localStorage).filter((k) => /inspectorCards/i.test(k)).map((k) => `${k}=${localStorage.getItem(k)}`)
    }
  })
const toggle = (folded) =>
  page.evaluate((folded) => {
    const card = document.querySelector(".InspectorCard[data-panel=code]")
    card.dispatchEvent(new CustomEvent(folded ? "ui-closing" : "ui-opening", { bubbles: true, composed: true }))
  }, folded)
console.log("start", JSON.stringify(await state()))
await toggle(true)
await page.waitForTimeout(1200)
console.log("folded", JSON.stringify(await state()))
const bar = await page.evaluate(() => { const b = [...document.querySelector(".InspectorColumn > .InspectorSplit").shadowRoot.querySelectorAll(".bar")].map((b) => b.getBoundingClientRect()).sort((a, c) => a.top - c.top)[0]; return { x: b.left + b.width / 2, y: b.top + b.height / 2 } })
await page.mouse.move(bar.x, bar.y); await page.mouse.down(); await page.mouse.move(bar.x, bar.y - 80, { steps: 4 }); await page.mouse.up()
await page.waitForTimeout(800)
console.log("dragged", JSON.stringify(await state()))
await toggle(false)
await page.waitForTimeout(1200)
console.log("unfolded", JSON.stringify(await state()))
await browser.close()
