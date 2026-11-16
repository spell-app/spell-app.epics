// Epic `editor` I181:  the "takes effect on restart" message, compact, with a real Restart button and a close.
// - Usage:  node i181-restart.mjs [editorUrl] [after | before]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv[2] || JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url
const SUFFIX = process.argv[3] ?? "after"
const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1500, height: 900 }, colorScheme: scheme, deviceScaleFactor: 2 })
  await context.route(/\/api\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  const errors = []
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)))
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire?scheme=${scheme}`, { timeout: 90000 })
  await page.waitForSelector(".InputEditor .monaco-editor .view-line", { timeout: 90000 })
  await page.waitForTimeout(4000)
  await page.evaluate(() => (window.editor.restartNeededBecause = "the type `extra part` is gone"))
  await page.waitForTimeout(800)
  const report = await page.evaluate(() => {
    const box = (el) => { if (!el) return undefined; const r = el.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), cy: Math.round((r.top + r.height / 2) * 10) / 10 } }
    const root = document.querySelector(".RestartNeeded")
    const find = (sel) => root?.querySelector(sel)
    const textEl = find(".RestartNeededText")
    const buttons = [...(root?.querySelectorAll("ui-button") ?? [])]
    const inner = (b) => b?.shadowRoot?.querySelector("button, [part~=button], .button") ?? b
    return {
      root: box(root?.firstElementChild ?? root),
      icon: box(find("ui-icon")),
      text: box(textEl),
      buttons: buttons.map((b) => box(inner(b))),
      topBar: box(document.querySelector(".EditorTopBar, .TopBar, header"))
    }
  })
  console.log(scheme, JSON.stringify(report), errors.length ? errors : "")
  await page.screenshot({ path: `${OUT}/i181-restart-${SUFFIX}-${scheme}.png` })
  await page.screenshot({ path: `${OUT}/i181-restart-${SUFFIX}-${scheme}-close.png`, clip: SUFFIX === "before" ? { x: 200, y: 0, width: 1100, height: 220 } : { x: Math.max(0, report.root.l - 60), y: Math.max(0, report.root.t - 40), width: report.root.w + 120, height: report.root.h + 80 } })
  if (SUFFIX === "after") {
    // close it:  gone;  the next edit that needs a restart shows it again
    await page.locator(".RestartNeeded .RestartNeededClose").click()
    await page.waitForTimeout(300)
    const afterClose = await page.locator(".RestartNeeded").count()
    await page.evaluate(() => window.editor.noteRestartNeeded("again"))
    await page.waitForTimeout(300)
    console.log(scheme, "after close:", afterClose, "after next edit:", await page.locator(".RestartNeeded").count())
  }
  await context.close()
}
await browser.close()
