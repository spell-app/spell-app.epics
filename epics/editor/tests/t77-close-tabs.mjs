// Epic `editor` T77:  in More mode, a file tab's ✕ closes it;  the file stays in the list, and picking it opens it again.
// - Usage:  node t77-close-tabs.mjs [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv[2] ?? JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

/** Find the Files toolbar, through every shadow root;  put on `window.__bar` for the page's own calls. */
const FIND = `window.__bar = (() => { const walk = (root) => { for (const el of root.querySelectorAll("*")) { if (el.localName === "ui-toolbar" && el.getAttribute("label") === "Files") return el; if (el.shadowRoot) { const f = walk(el.shadowRoot); if (f) return f } } }; return walk(document) })()`

/** The tabs showing, the chosen one starred;  and which ✕ are seen. */
function state() {
  const tabs = [...window.__bar.querySelectorAll(":scope > ui-item")].filter((each) => !each.hidden)
  return tabs.map((tab) => {
    const close = tab.querySelector(".CloseTab")
    const style = close && getComputedStyle(close)
    const seen = style && style.display !== "none" && style.visibility === "visible" ? " ✕" : ""
    return (tab.hasAttribute("selected") ? "*" : "") + tab.getAttribute("label") + seen
  })
}

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1300, height: 700 }, colorScheme: scheme, deviceScaleFactor: 2 })
  await context.route(/\/api\//, (route) => {
    if (route.request().method() === "GET") return route.continue()
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  })
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  await page.goto(`${EDITOR}`, { timeout: 90000 })
  await page.evaluate(() => localStorage.removeItem("ui-toolbar-open-items"))
  const open = async () => {
    await page.goto(`${EDITOR}edit/@spell/examples/PublicServers`, { timeout: 90000 })
    await page.waitForFunction(`(${FIND}, window.__bar?.shadowRoot?.querySelector("[part~=all-items]"))`, undefined, { timeout: 90000 })
    await page.waitForTimeout(2500)
  }
  await open()
  const pick = async (index) => {
    await page.evaluate(() => window.__bar.shadowRoot.querySelector("[part~=all-items]").click())
    await page.waitForTimeout(400)
    await page.evaluate((at) => window.__bar.shadowRoot.querySelectorAll("[part~=overflow-menu] .row")[at]?.click(), index)
    await page.waitForTimeout(1200)
  }
  for (const index of [3, 6, 9]) await pick(index)
  await page.keyboard.press("Escape")
  await page.waitForTimeout(600)
  const shot = async (name) => {
    const box = await page.locator(".FileTabs").first().boundingBox()
    await page.screenshot({
      path: `${OUT}/t77-${name}-${scheme}.png`,
      clip: { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: box.width + 16, height: box.height + 16 }
    })
  }
  console.log(scheme, "opened", JSON.stringify(await page.evaluate(state)))
  // hover the first tab in view that isn't chosen:  its ✕ shows too
  const other = await page.evaluate(() => {
    const menu = window.__bar.shadowRoot.querySelector("[part~=menu]").getBoundingClientRect()
    const boxOf = (each) => each.shadowRoot.querySelector("[part~=item]").getBoundingClientRect()
    // in view:  not scrolled under the ‹ at the row's start
    const tab = [...window.__bar.querySelectorAll(":scope > ui-item")].find(
      (each) => !each.hidden && !each.hasAttribute("selected") && boxOf(each).left > menu.left + 30
    )
    const box = boxOf(tab)
    return { x: box.x + box.width / 2, y: box.y + box.height / 2, label: tab.getAttribute("label") }
  })
  await page.mouse.move(other.x, other.y)
  await page.waitForTimeout(400)
  console.log(scheme, "hovered", JSON.stringify(await page.evaluate(state)))
  await shot("hover")
  // click its ✕
  const close = await page.evaluate((label) => {
    const tab = [...window.__bar.querySelectorAll(":scope > ui-item")].find((each) => each.getAttribute("label") === label)
    const box = tab.querySelector(".CloseTab").getBoundingClientRect()
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  }, other.label)
  await page.mouse.click(close.x, close.y)
  await page.mouse.move(5, 650)
  await page.waitForTimeout(1000)
  console.log(scheme, "closed", other.label, JSON.stringify(await page.evaluate(state)))
  await shot("closed")
  // the chosen one's ✕:  its neighbour shows
  const chosen = await page.evaluate(() => {
    const tab = window.__bar.querySelector(":scope > ui-item[selected]")
    const box = tab.querySelector(".CloseTab").getBoundingClientRect()
    return { x: box.x + box.width / 2, y: box.y + box.height / 2, label: tab.getAttribute("label") }
  })
  await page.mouse.click(chosen.x, chosen.y)
  await page.mouse.move(5, 650)
  await page.waitForTimeout(1500)
  console.log(scheme, "closed chosen", chosen.label, JSON.stringify(await page.evaluate(state)))
  await shot("closed-chosen")
  // the list still has both
  await page.evaluate(() => window.__bar.shadowRoot.querySelector("[part~=all-items]").click())
  await page.waitForTimeout(500)
  const rows = await page.evaluate(() => [...window.__bar.shadowRoot.querySelectorAll("[part~=overflow-menu] .row")].map((row) => row.textContent.trim()))
  console.log(scheme, "list", rows.length, rows.includes(other.label), rows.includes(chosen.label))
  const box = await page.locator(".FileTabs").first().boundingBox()
  await page.screenshot({ path: `${OUT}/t77-list-${scheme}.png`, clip: { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: box.width + 16, height: 480 } })
  await page.keyboard.press("Escape")
  // a reload keeps them closed
  await open()
  console.log(scheme, "reloaded", JSON.stringify(await page.evaluate(state)))
  console.log(scheme, "page errors", errors.length, errors.slice(0, 3))
  await context.close()
}
await browser.close()
