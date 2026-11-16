// Epic `editor` I189:  the file bar at extreme zoom, and across the width where it used to change its look --
// its look recorded every animation frame for 2s at each step:  it must never toggle.
// - Usage:  node i189-zoom.mjs [editorUrl] [--css "<extra css>"]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url
const CSS = process.argv.includes("--css") ? process.argv[process.argv.indexOf("--css") + 1] : ""
const FIND = `(() => { const walk = (root) => { for (const el of root.querySelectorAll("*")) { if (el.localName === "ui-toolbar" && el.getAttribute("label") === "Files") return el; if (el.shadowRoot) { const f = walk(el.shadowRoot); if (f) return f } } }; return walk(document) })()`

/** Every animation frame for `ms`:  the bar's look (dropdown or row, how many tabs drawn);  how many times it changed. */
const RECORD = `(ms) => new Promise((done) => {
  const bar = ${FIND}
  const looks = []
  const look = () => (bar.matches(":state(dropdown)") ? "dropdown" : "row") + ":" + bar.component.fitAnswer
  const end = performance.now() + ms
  const frame = () => {
    const now = look()
    if (looks.at(-1) !== now) looks.push(now)
    if (performance.now() < end) requestAnimationFrame(frame)
    else done({ changes: looks.length - 1, looks: looks.slice(0, 8) })
  }
  requestAnimationFrame(frame)
})`

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 860 } })
await context.route(/\/api\//, (route) =>
  route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
)
const page = await context.newPage()
await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
await page.waitForFunction(`!!${FIND}?.querySelector(":scope > ui-item")`, undefined, { timeout: 90000 })
await page.waitForTimeout(3000)
if (CSS) await page.addStyleTag({ content: CSS })
/** `script` in the page, again after a reload (another session's edit reloads the editor):  the bar found, zoom put back. */
async function inPage(script, zoom) {
  for (let tries = 0; ; tries++) {
    try {
      return await page.evaluate(script)
    } catch (error) {
      if (tries > 3 || !/context was destroyed|navigation/.test(String(error))) throw error
      await page.waitForFunction(`!!${FIND}?.querySelector(":scope > ui-item")`, undefined, { timeout: 90000 })
      await page.waitForTimeout(3000)
      await page.evaluate((z) => (document.documentElement.style.zoom = String(z)), zoom)
    }
  }
}
let toggled = 0
for (const zoom of [2, 3]) {
  await inPage(`document.documentElement.style.zoom = "${zoom}"`, zoom)
  for (let width = 1440; width >= 700; width -= 30) {
    await page.setViewportSize({ width, height: 860 })
    const seen = await inPage(`(${RECORD})(400)`, zoom)
    if (seen.changes > 1) {
      toggled++
      console.log("zoom", zoom, "width", width, "TOGGLES", JSON.stringify(seen))
    }
  }
}
await page.evaluate(() => (document.documentElement.style.zoom = "3"))
await page.setViewportSize({ width: 1200, height: 860 })
const settled = await inPage(`(${RECORD})(2000)`, 3)
console.log("zoom 3, 1200 wide, 2s:", JSON.stringify(settled))
await page.screenshot({ path: `${OUT}/i189-zoom3.png` })
console.log("steps that toggled:", toggled)
await browser.close()
