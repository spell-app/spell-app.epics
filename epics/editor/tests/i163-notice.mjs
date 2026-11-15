// Epic `editor` I163:  the "Published" notice on one line, drawn above the selection's marching ants.
// - Usage:  node i163-notice.mjs [editorUrl] [suffix]
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
  // select a part under where the notice shows:  the element of the running app at the notice's middle
  const picked = await page.evaluate(() => {
    const under = [...document.querySelectorAll(".AppRoot *, [class*=AppRoot] *")].find((el) => {
      const r = el.getBoundingClientRect()
      return r.top < 90 && r.bottom > 70 && r.width > 60 && r.width < 600 && r.height < 200
    })
    if (under) window.Inspector.select(under)
    const r = under?.getBoundingClientRect()
    return under ? `${under.tagName} ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` : "none"
  })
  await page.waitForTimeout(600)
  const english = scheme === "light"
  await page.evaluate(async (english) => {
    const { appTexts } = await import("/src/app/ui/AppTexts.ts")
    const params = { count: english ? 1 : 3, version: "Solitaire.2026-11-15-182322.zip" }
    let text
    try {
      text = appTexts.text(english ? "publishedFile" : "publishedFiles", params)
    } catch {
      text = appTexts.text("published", params) // before I163:  one text, "file(s)"
    }
    window.editor.showNotice(text)
  }, english)
  await page.waitForTimeout(700)
  const report = await page.evaluate(() => {
    const notice = document.querySelector(".Notice")
    const message = notice?.querySelector("ui-message")
    const ants = document.querySelector(".InspectorSelected:not([hidden])")
    const box = notice?.getBoundingClientRect()
    const mid = box && document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
    return {
      text: message?.getAttribute("heading"),
      box: box && `${Math.round(box.left)},${Math.round(box.top)} ${Math.round(box.width)}x${Math.round(box.height)}`,
      popoverOpen: notice?.matches(":popover-open"),
      ants: ants && getComputedStyle(ants).zIndex,
      topAtMiddle: mid && (mid.closest(".Notice") ? "notice" : mid.className || mid.tagName)
    }
  })
  console.log(scheme, "picked", picked, JSON.stringify(report), errors.length ? errors : "")
  const box = await page.locator(".Notice").boundingBox()
  await page.screenshot({ path: `${OUT}/I163-notice-${SUFFIX}-${scheme}.png`, clip: { x: 300, y: 0, width: 1200, height: 300 } })
  await context.close()
}
await browser.close()
