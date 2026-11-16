// Epic `editor` I216:  a panel bar's bottom line drawn as a shadow, taking no room:  the file tabs 8px from the bar's top and bottom.
// - Solitaire in Edit, the Inspector open, a card selected;  light and dark.
// - Usage:  node i216-barline.mjs <before | after> [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const STAGE = process.argv[2] ?? "after"
const EDITOR =
  process.argv.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

function layout() {
  const box = (el) => {
    if (!el) return null
    const b = el.getBoundingClientRect()
    return { y: +b.y.toFixed(2), bottom: +b.bottom.toFixed(2), h: +b.height.toFixed(2) }
  }
  const fileBar = document.querySelector(".FileTabs ui-panel")?.shadowRoot?.querySelector("[part~=title]")
  const toolbar = document.querySelector(".FileTabs ui-toolbar")
  const tab = toolbar?.querySelector("ui-item, ui-button") ?? toolbar
  const tabInner = tab?.shadowRoot?.querySelector("[part~=item], [part~=button]") ?? tab
  const style = fileBar && getComputedStyle(fileBar)
  const line = document.querySelector(".InputEditor .cm-line")
  const cards = [...document.querySelectorAll(".InspectorColumn ui-panel.InspectorCard")].map((card) => {
    const bar = card.shadowRoot?.querySelector("[part~=title]")
    const body = card.querySelector(".InspectorSection")
    const first = body?.firstElementChild
    return { bar: box(bar), borderBottom: bar && getComputedStyle(bar).borderBottomWidth, shadow: bar && getComputedStyle(bar).boxShadow, firstContentGap: first && bar ? +(first.getBoundingClientRect().y - bar.getBoundingClientRect().bottom).toFixed(2) : null }
  })
  return {
    fileBar: box(fileBar),
    fileBarBorder: style?.borderBottomWidth,
    fileBarShadow: style?.boxShadow,
    tab: box(tabInner),
    tabTop: fileBar && tabInner ? +(tabInner.getBoundingClientRect().y - fileBar.getBoundingClientRect().y).toFixed(2) : null,
    tabBottom: fileBar && tabInner ? +(fileBar.getBoundingClientRect().bottom - tabInner.getBoundingClientRect().bottom).toFixed(2) : null,
    codeTopGap: fileBar && line ? +(line.getBoundingClientRect().y - fileBar.getBoundingClientRect().bottom).toFixed(2) : null,
    scroller: box(document.querySelector(".InputEditor .cm-scroller")),
    cards
  }
}

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 860 }, colorScheme: scheme, deviceScaleFactor: 2 })
  await context.route(/\/(api|spaces)\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
  await page.waitForFunction(() => window.Inspector && document.querySelector("solitaire-card"), undefined, { timeout: 90000 })
  await page.waitForTimeout(2500)
  if (!(await page.evaluate(() => window.Inspector.isOpen))) await page.evaluate(() => window.Inspector.showOrHide())
  await page.evaluate(() => {
    window.Inspector.stopInspecting?.()
    window.Inspector.select([...document.querySelectorAll("solitaire-card")].at(-1))
  })
  if (scheme === "dark")
    await page.evaluate(() => {
      document.documentElement.classList.add("ui-dark")
      document.documentElement.classList.remove("ui-light")
      document.documentElement.style.colorScheme = "dark"
    })
  await page.mouse.move(720, 840)
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${OUT}/i216-${STAGE}-${scheme}.png` })
  const at = await page.evaluate(layout)
  const fb = at.fileBar
  if (fb) await page.screenshot({ path: `${OUT}/i216-${STAGE}-${scheme}-bar.png`, clip: { x: 0, y: Math.max(0, fb.y - 8), width: 1440, height: fb.h + 40 } })
  console.log(scheme, JSON.stringify(at, null, 1))
  await context.close()
}
await browser.close()
