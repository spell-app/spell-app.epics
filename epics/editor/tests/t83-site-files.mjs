// Epic `editor` I188, T84:  a site project's file bar -- its `.site.spell` file always a tab, beside the file showing,
// never the one-tab dropdown;  the Files list in columns when it's long.
// - Usage:  node t83-site-files.mjs [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url
const FIND = `(() => { const walk = (root) => { for (const el of root.querySelectorAll("*")) { if (el.localName === "ui-toolbar" && el.getAttribute("label") === "Files") return el; if (el.shadowRoot) { const f = walk(el.shadowRoot); if (f) return f } } }; return walk(document) })()`

const browser = await chromium.launch()
for (const [width, height] of [[1440, 860], [900, 700]]) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 })
  await context.route(/\/api\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  page.on("pageerror", (error) => console.log("page error", String(error)))
  await page.goto(`${EDITOR}edit/owen@spell/jarvis-new/home.spell`, { timeout: 90000 })
  await page.waitForFunction(`!!${FIND}?.querySelector(":scope > ui-item")`, undefined, { timeout: 90000 })
  await page.waitForTimeout(4000)
  const state = await page.evaluate(`(() => { const bar = ${FIND}; return { dropdown: bar.matches(":state(dropdown)"), limited: bar.matches(":state(limited)"), button: !!bar.shadowRoot.querySelector("[part~=all-items]"), tabs: [...bar.querySelectorAll(":scope > ui-item")].filter((e) => !e.hidden).map((e) => e.getAttribute("label")) } })()`)
  console.log(width, "file bar", JSON.stringify(state))
  await page.evaluate(`${FIND}.shadowRoot.querySelector("[part~=all-items]").click()`)
  await page.waitForTimeout(800)
  const menu = await page.evaluate(`(() => { const m = ${FIND}.shadowRoot.querySelector("[part~=overflow-menu]"); const b = m.getBoundingClientRect(); const rows = [...m.querySelectorAll(".row")]; return { columns: m.dataset.columns, rows: rows.length, box: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)], window: [innerWidth, innerHeight], ticked: rows.filter((r) => r.classList.contains("selected")).map((r) => r.textContent.trim()) } })()`)
  console.log(width, "files list", JSON.stringify(menu))
  await page.screenshot({ path: `${OUT}/t84-files-columns-${width}.png` })
  await page.keyboard.press("Escape")
  const box = await page.locator(".FileTabs").first().boundingBox()
  await page.screenshot({ path: `${OUT}/i188-site-tabs-${width}.png`, clip: { x: 0, y: 0, width, height: box.y + box.height + 12 } })
  await context.close()
}
await browser.close()
