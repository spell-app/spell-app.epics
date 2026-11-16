// Epic `editor` T82:  the Files button (file icon + ▾) always shows at the bar's right end;
// a tab's ✕ shows in its file icon's place while hovered, taking no room of its own.
// - Usage:  node t82-file-tabs.mjs [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv[2] ?? JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

const FIND = `window.__bar = (() => { const walk = (root) => { for (const el of root.querySelectorAll("*")) { if (el.localName === "ui-toolbar" && el.getAttribute("label") === "Files") return el; if (el.shadowRoot) { const f = walk(el.shadowRoot); if (f) return f } } }; return walk(document) })()`

/** Each tab in the row:  label, width, which of its icons shows, and where;  and the Files button's place. */
function measure() {
  const bar = window.__bar
  const tabs = [...bar.querySelectorAll(":scope > ui-item")].filter((each) => !each.hidden)
  // a `<ui-icon>` draws no box of its own:  its glyph's box, in its shadow
  const centre = (el) => { const b = (el.shadowRoot?.querySelector("[part~=icon]") ?? el).getBoundingClientRect(); return Math.round((b.left + b.width / 2) * 10) / 10 }
  const button = bar.shadowRoot.querySelector("[part~=all-items]")
  const barBox = bar.shadowRoot.querySelector("[part~=toolbar]").getBoundingClientRect()
  return {
    limited: bar.matches(":state(limited)"),
    button: button ? { right: Math.round(button.getBoundingClientRect().right), barRight: Math.round(barBox.right) } : null,
    tabs: tabs.map((tab) => {
      const box = tab.shadowRoot.querySelector("[part~=item]").getBoundingClientRect()
      const file = tab.querySelector(".TabIcon > ui-icon:not(.CloseTab)")
      const close = tab.querySelector(".CloseTab")
      return {
        label: tab.getAttribute("label"),
        width: Math.round(box.width * 100) / 100,
        shows: getComputedStyle(close).visibility === "visible" ? "✕" : getComputedStyle(file).visibility === "visible" ? "file" : "none",
        fileAt: centre(file),
        closeAt: centre(close),
        box: { x: box.x + box.width / 2, y: box.y + box.height / 2 }
      }
    })
  }
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
  const shot = async (name) => {
    const box = await page.locator(".FileTabs").first().boundingBox()
    await page.screenshot({
      path: `${OUT}/t82-${name}-${scheme}.png`,
      clip: { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: box.width + 16, height: box.height + 16 }
    })
  }
  for (const [name, project] of [["one-tab", "Counter"], ["three-tabs", "fizzbuzz"], ["overflow", "PublicServers"]]) {
    await page.goto(`${EDITOR}edit/@spell/examples/${project}`, { timeout: 90000 })
    await page.waitForFunction(`(${FIND}, window.__bar?.querySelector(":scope > ui-item"))`, undefined, { timeout: 90000 })
    // the editor keeps its own scheme:  dark asked for on the page itself
    if (scheme === "dark") await page.evaluate(() => { document.documentElement.classList.add("ui-dark"); document.documentElement.style.colorScheme = "dark" })
    await page.waitForTimeout(2500)
    if (name === "overflow") {
      for (const index of [3, 6, 9]) {
        await page.evaluate(() => window.__bar.shadowRoot.querySelector("[part~=all-items]").click())
        await page.waitForTimeout(400)
        await page.evaluate((at) => window.__bar.shadowRoot.querySelectorAll("[part~=overflow-menu] .row")[at]?.click(), index)
        await page.waitForTimeout(1200)
      }
      await page.keyboard.press("Escape")
    }
    await page.mouse.move(5, 650)
    await page.waitForTimeout(500)
    const before = await page.evaluate(measure)
    console.log(scheme, name, "at rest", JSON.stringify({ limited: before.limited, button: before.button, tabs: before.tabs.map(({ label, width, shows }) => ({ label, width, shows })) }))
    await shot(name)
    // hover each tab:  its width, and which icon shows, where
    for (const tab of before.tabs) {
      await page.mouse.move(tab.box.x, tab.box.y)
      await page.waitForTimeout(250)
      const now = (await page.evaluate(measure)).tabs.find((each) => each.label === tab.label)
      console.log(scheme, name, "hover", tab.label, `width ${tab.width} -> ${now.width}`, `shows ${now.shows}`, `centres file ${now.fileAt} / ✕ ${now.closeAt}`)
    }
    const last = before.tabs.at(-1)
    await page.mouse.move(last.box.x, last.box.y)
    await page.waitForTimeout(300)
    await shot(`${name}-hover`)
    if (name === "overflow") {
      // click a hovered tab's ✕:  it closes
      const target = before.tabs.find((each) => each.label !== before.tabs[0].label) ?? last
      await page.mouse.move(target.box.x, target.box.y)
      await page.waitForTimeout(250)
      const at = (await page.evaluate(measure)).tabs.find((each) => each.label === target.label)
      const y = target.box.y
      await page.mouse.click(at.closeAt, y)
      await page.mouse.move(5, 650)
      await page.waitForTimeout(1000)
      console.log(scheme, name, "closed", target.label, JSON.stringify((await page.evaluate(measure)).tabs.map((each) => each.label)))
    }
  }
  console.log(scheme, "page errors", errors.length, errors.slice(0, 3))
  await context.close()
}
await browser.close()
