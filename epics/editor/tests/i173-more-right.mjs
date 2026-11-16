// Epic `editor` I173:  the file tabs' More (file icon + caret) sits at the bar's far right, however many tabs show.
// - Usage:  node i173-more-right.mjs [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv[2] ?? JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

/** The file tab bar's toolbar, its More button, the pane's bar around it:  their right edges, and the tabs showing. */
function measure() {
  const bar = (() => { const walk = (root) => { for (const el of root.querySelectorAll("*")) { if (el.localName === "ui-toolbar" && el.getAttribute("label") === "Files") return el; if (el.shadowRoot) { const f = walk(el.shadowRoot); if (f) return f } } }; return walk(document) })()
  if (!bar) return null
  const more = bar.shadowRoot.querySelector("[part~=all-items]")
  const row = bar.shadowRoot.querySelector("[part~=toolbar]")
  const pane = document.querySelector(".FileTabs")
  const right = (el) => (el ? Math.round(el.getBoundingClientRect().right * 10) / 10 : null)
  const tabs = [...bar.querySelectorAll("ui-item")].filter((each) => !each.hidden).length
  const lastTab = [...bar.querySelectorAll("ui-item")].filter((each) => !each.hidden).at(-1)
  return {
    tabs,
    overflowing: bar.matches(":state(overflowing)"),
    more: right(more),
    row: right(row),
    pane: right(pane),
    lastTab: right(lastTab),
    moreLeft: more ? Math.round(more.getBoundingClientRect().left) : null
  }
}

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  for (const [width, picks, kind] of [
    [1500, [], "1-tab"],
    [1500, [3, 6], "3-tabs"],
    [1100, [3, 6, 9, 12, 15, 1, 4], "many-tabs"]
  ]) {
    const context = await browser.newContext({ viewport: { width, height: 700 }, colorScheme: scheme, deviceScaleFactor: 2 })
    await context.route(/\/api\//, (route) => {
      if (route.request().method() === "GET") return route.continue()
      return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
    })
    const page = await context.newPage()
    await page.goto(`${EDITOR}`, { timeout: 90000 })
    await page.evaluate(() => localStorage.removeItem("ui-toolbar-open-items"))
    await page.goto(`${EDITOR}edit/@spell/examples/PublicServers`, { timeout: 90000 })
    await page.waitForFunction(
      () => (() => { const walk = (root) => { for (const el of root.querySelectorAll("*")) { if (el.localName === "ui-toolbar" && el.getAttribute("label") === "Files") return el; if (el.shadowRoot) { const f = walk(el.shadowRoot); if (f) return f } } }; return walk(document) })()?.shadowRoot?.querySelector("[part~=all-items]"),
      undefined,
      { timeout: 90000 }
    )
    await page.waitForTimeout(3000)
    for (const index of picks) {
      await page.evaluate(() =>
        (() => { const walk = (root) => { for (const el of root.querySelectorAll("*")) { if (el.localName === "ui-toolbar" && el.getAttribute("label") === "Files") return el; if (el.shadowRoot) { const f = walk(el.shadowRoot); if (f) return f } } }; return walk(document) })().shadowRoot.querySelector("[part~=all-items]").click()
      )
      await page.waitForTimeout(400)
      await page.evaluate((at) => {
        const rows = (() => { const walk = (root) => { for (const el of root.querySelectorAll("*")) { if (el.localName === "ui-toolbar" && el.getAttribute("label") === "Files") return el; if (el.shadowRoot) { const f = walk(el.shadowRoot); if (f) return f } } }; return walk(document) })().shadowRoot.querySelectorAll("[part~=overflow-menu] .row")
        rows[at]?.click()
      }, index)
      await page.waitForTimeout(1200)
    }
    await page.keyboard.press("Escape")
    await page.waitForTimeout(800)
    console.log(scheme, kind, JSON.stringify(await page.evaluate(measure)))
    const box = await page.locator(".FileTabs").first().boundingBox()
    await page.screenshot({
      path: `${OUT}/i173-${kind}-${scheme}.png`,
      clip: { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: box.width + 16, height: box.height + 40 }
    })
    await context.close()
  }
}
await browser.close()
