// Epic `editor` T88, T85:  the file tab bar's room round its tabs (left and right the same as above the first tab),
// and the draft bar's Discard as a link;  light and dark shots.
// - Usage:  node t88-file-bar-room.mjs <before | after> [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const STAGE = process.argv[2] ?? "after"
const EDITOR =
  process.argv.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url
const FIND = `(() => { const walk = (root) => { for (const el of root.querySelectorAll("*")) { if (el.localName === "ui-toolbar" && el.getAttribute("label") === "Files") return el; if (el.shadowRoot) { const f = walk(el.shadowRoot); if (f) return f } } }; return walk(document) })()`

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 860 }, deviceScaleFactor: 2 })
  await context.route(/\/api\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  await page.goto(`${EDITOR}edit/owen@spell/jarvis-new/home.spell`, { timeout: 90000 })
  await page.waitForFunction(`!!${FIND}?.querySelector(":scope > ui-item")`, undefined, { timeout: 90000 })
  await page.waitForTimeout(4000)
  if (scheme === "dark")
    await page.evaluate(() => {
      document.documentElement.classList.replace("ui-light", "ui-dark")
      document.documentElement.style.colorScheme = "dark"
    })
  await page.waitForTimeout(500)
  const room = await page.evaluate(`(() => {
    const bar = ${FIND}
    const band = document.querySelector(".FileTabs").getBoundingClientRect()
    const tab = bar.querySelector(":scope > ui-item:not([hidden])").shadowRoot.querySelector("[part~=item]").getBoundingClientRect()
    const hide = bar.closest("ui-panel")?.querySelector(".HideCode") ?? bar.parentElement.querySelector(".HideCode")
    const x = (hide.shadowRoot?.querySelector("[part~=icon]") ?? hide).getBoundingClientRect()
    const r = (n) => Math.round(n * 10) / 10
    return { top: r(tab.top - band.top), bottom: r(band.bottom - tab.bottom), left: r(tab.left - band.left), right: r(band.right - x.right) }
  })()`)
  console.log(scheme, "file bar room", JSON.stringify(room))
  const band = await page.locator(".FileTabs").first().boundingBox()
  await page.screenshot({ path: `${OUT}/t88-${STAGE}-${scheme}.png`, clip: { x: 0, y: 0, width: band.x + band.width + 12, height: band.y + band.height + 10 } })
  const pill = await page.locator(".PublishDraft").first().boundingBox()
  if (pill) await page.screenshot({ path: `${OUT}/t85-${STAGE}-${scheme}.png`, clip: { x: pill.x - 8, y: 0, width: pill.width + 16, height: 38 } })
  await context.close()
}
await browser.close()
