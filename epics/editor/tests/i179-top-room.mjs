// Epic `editor` I179:  room above the code pane's first line -- the first band's top vs the file tabs' bottom,
// and that the bubbly shapes stay on the text at the top and after scrolling.
// - Usage:  node i179-top-room.mjs [editorUrl] [tag]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv[2] || JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url
const TAG = process.argv[3] ?? "after"

/** Deep-find helpers, on `window`. */
const HELPERS = `window.__all = (sel) => { const out = []; const walk = (root) => { for (const el of root.querySelectorAll("*")) { if (el.matches(sel)) out.push(el); if (el.shadowRoot) walk(el.shadowRoot) } }; walk(document); return out }`

function measure() {
  const pane = window.__all(".InputEditor .monaco-editor, .monaco-editor").find((each) => !each.closest(".CodeSlice") && each.getBoundingClientRect().width > 400)
  const tabs = window.__all(".FileTabs")[0]?.getBoundingClientRect()
  const paneBox = pane.getBoundingClientRect()
  const firstLine = [...pane.querySelectorAll(".view-line")].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0]
  const lineBox = firstLine.getBoundingClientRect()
  const container = pane.closest(".MonacoEditor") ?? pane.parentElement
  const shapes = [...(container.querySelectorAll(".bubbly-shapes > *") ?? [])].map((each) => each.getBoundingClientRect()).filter((box) => box.height > 0)
  const topShape = shapes.sort((a, b) => a.top - b.top)[0]
  return {
    tabsBottom: tabs?.bottom,
    paneTop: paneBox.top,
    firstLineTop: lineBox.top,
    firstLineText: firstLine.textContent.slice(0, 50),
    bandTop: topShape?.top,
    shapeCount: shapes.length
  }
}

/** Each visible line's top vs the band drawn nearest it, after a scroll. */
function alignment() {
  const pane = window.__all(".monaco-editor").find((each) => !each.closest(".CodeSlice") && each.getBoundingClientRect().width > 400)
  const editor = window.monaco?.editor?.getEditors?.().find((each) => each.getDomNode() === pane)
  return { scrollTop: editor?.getScrollTop(), layerY: getComputedStyle(pane.closest(".MonacoEditor") ?? pane).getPropertyValue("--bubbly-monaco-y") }
}

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1300, height: 800 }, colorScheme: scheme, deviceScaleFactor: 2 })
  await context.route(/\/api\//, (route) => {
    if (route.request().method() === "GET") return route.continue()
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  })
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire/Pile.spell?scheme=${scheme}`, { timeout: 90000 })
  await page.waitForFunction(`(${HELPERS}, window.__all(".monaco-editor .view-line").length > 3 && window.__all(".bubbly-shapes > *").length > 0)`, undefined, { timeout: 90000 })
  await page.waitForTimeout(2500)
  const top = await page.evaluate(measure)
  console.log(scheme, TAG, "top", JSON.stringify(top), "gap band-tabs", (top.bandTop - top.tabsBottom).toFixed(1), "gap line-tabs", (top.firstLineTop - top.tabsBottom).toFixed(1))
  const clip = { x: top.tabsBottom ? 200 : 0, y: Math.max(0, top.tabsBottom - 40), width: 900, height: 160 }
  const paneX = await page.evaluate(() => window.__all(".monaco-editor").find((each) => each.getBoundingClientRect().width > 400).getBoundingClientRect().x)
  clip.x = Math.max(0, paneX - 20)
  await page.screenshot({ path: `${OUT}/i179-${TAG}-top-${scheme}.png`, clip })
  // scroll, then shot:  bands still on their lines
  const paneBox = await page.evaluate(() => { const b = window.__all(".monaco-editor").find((each) => each.getBoundingClientRect().width > 400).getBoundingClientRect(); return { x: b.x + 200, y: b.y + 200 } })
  await page.mouse.move(paneBox.x, paneBox.y)
  await page.mouse.wheel(0, 137)
  await page.waitForTimeout(900)
  console.log(scheme, TAG, "scrolled", JSON.stringify(await page.evaluate(measure)))
  await page.screenshot({ path: `${OUT}/i179-${TAG}-scrolled-${scheme}.png`, clip: { ...clip, height: 360 } })
  if (errors.length) console.log("errors", errors)
  await context.close()
}
await browser.close()
