// Epic `editor` I163:  the "Published" notice on one line, drawn above the selection's marching ants.
// - Usage:  node i163-notice.mjs [editorUrl] [after | before | long]   (before:  restyled as it was, to compare;  long:  past the window's width)
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
    // the running app's own box at the notice's right end:  its ants cross the notice
    const under = [...document.querySelectorAll(".AppRoot *")].find((el) => {
      const r = el.getBoundingClientRect()
      return r.left > 700 && r.left < 1000 && r.top > 55 && r.top < 90 && r.height < 80 && r.width > 200
    })
    if (under) window.Inspector.select(under)
    const r = under?.getBoundingClientRect()
    return under ? `${under.tagName} ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` : "none"
  })
  await page.waitForTimeout(600)
  const english = scheme === "light"
  const long = SUFFIX === "long"
  await page.evaluate(async ({ english, long }) => {
    const { appTexts } = await import("/src/app/ui/AppTexts.ts")
    const params = { count: english ? 1 : 3, version: "Solitaire.2026-11-15-182322.zip" }
    let text
    try {
      text = appTexts.text(english ? "publishedFile" : "publishedFiles", params)
    } catch {
      text = appTexts.text("published", params) // before I163:  one text, "file(s)"
    }
    window.editor.showNotice(long ? `${text} ${text} ${text}\nA second line, its own line:  ${text} ${text} ${text}` : text)
  }, { english, long })
  await page.waitForTimeout(700)
  // "before":  the notice as it was before I163, to compare:  under the ants (z-index 100), 500px wide, wrapping
  if (SUFFIX === "before")
    await page.evaluate(() => {
      const notice = document.querySelector(".Notice")
      Object.assign(notice.style, { zIndex: "100", width: "500px", minWidth: "0", whiteSpace: "normal", left: "calc(50% - 250px)", translate: "none" })
      const message = notice.querySelector("ui-message")
      message.setAttribute("heading", message.getAttribute("heading").replace(/ files?:/, " file(s):"))
    })
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
      stacking: (() => { const out = []; for (let e = notice; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.zIndex !== "auto" || s.isolation !== "auto" || s.transform !== "none" || s.contain !== "none") out.push(`${e.tagName}.${e.className} z=${s.zIndex} iso=${s.isolation} tf=${s.transform} contain=${s.contain}`) } return out })(),
      antsBox: ants && (() => { const r = ants.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` })(),
      topAtAnts: ants && box && (() => { const r = ants.getBoundingClientRect(); const x = r.left + 3, y = Math.max(r.top + 3, box.top + 10); const e = document.elementFromPoint(x, y); return e?.closest(".Notice") ? "notice" : e?.className || e?.tagName })(),
      topAtMiddle: mid && (mid.closest(".Notice") ? "notice" : mid.className || mid.tagName)
    }
  })
  console.log(scheme, "picked", picked, JSON.stringify(report), errors.length ? errors : "")
  const box = await page.locator(".Notice").boundingBox()
  await page.screenshot({ path: `${OUT}/I163-notice-${SUFFIX}-${scheme}.png`, clip: long ? { x: 0, y: 0, width: 1500, height: 300 } : { x: 300, y: 0, width: 1200, height: 300 } })
  await context.close()
}
await browser.close()
