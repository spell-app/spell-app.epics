// Epic `editor` I165:  the Inspector column's last card stretches to the column's bottom.
// - Usage:  node i165-views-fill.mjs [tag] [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const TAG = process.argv[2] ?? "after"
const EDITOR =
  process.argv[3] ?? JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

/** The column's split and each pane:  top, bottom and what's in it. */
function measure() {
  const split = document.querySelector(".InspectorColumn > .InspectorSplit")
  if (!split) return { split: null }
  const box = (el) => {
    const b = el.getBoundingClientRect()
    return [Math.round(b.top), Math.round(b.bottom)]
  }
  const panes = [...split.querySelectorAll(":scope > .SplitPane")].map((pane) => {
    const card = pane.querySelector(".InspectorCard")
    const section = pane.querySelector(".InspectorSection")
    return {
      panel: card?.dataset.panel,
      folded: card?.classList.contains("folded"),
      pane: box(pane),
      scroll: section ? [section.scrollHeight, section.clientHeight] : null
    }
  })
  const last = panes.at(-1)
  return { split: box(split), gapUnderLast: last ? box(split)[1] - last.pane[1] : null, panes }
}

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  for (const [width, height, kind] of [
    [1500, 1100, "desk"],
    [390, 844, "phone"]
  ]) {
    const context = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, deviceScaleFactor: 2 })
    await context.route(/\/api\//, (route) => {
      if (route.request().method() === "GET") return route.continue()
      return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
    })
    const page = await context.newPage()
    const errors = []
    page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)))
    await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
    await page.waitForSelector(".InputEditor .monaco-editor .view-line", { timeout: 90000, state: "attached" })
    await page.waitForTimeout(3000)
    if (!(await page.evaluate(() => !!document.querySelector(".InspectAppButton.inspecting")))) {
      await page.locator(".InspectAppButton [part~=item]").first().click({ force: true })
    }
    await page.waitForTimeout(1500)
    const shot = async (name) => {
      const column = page.locator(".InspectorColumn").first()
      const b = await column.boundingBox()
      const clip = kind === "phone" || !b ? undefined : { x: b.x - 8, y: 0, width: b.width + 16, height }
      await page.screenshot({ path: `${OUT}/i165-${TAG}-${kind}-${name}-${scheme}.png`, clip })
    }
    if (kind === "phone") {
      // a part selected brings the sheet up
      await page.locator("solitaire-card").first().click({ force: true }).catch(() => {})
      await page.waitForTimeout(2000)
      console.log(scheme, kind, "selected", JSON.stringify(await page.evaluate(measure)))
      await shot("sheet")
    } else {
      console.log(scheme, kind, "short", JSON.stringify(await page.evaluate(measure)))
      await shot("short")
      const expand = page.locator('.InspectorViews ui-icon[name="angle double down"], .InspectorCard[data-panel=views] ui-icon[name="angle double down"]')
      if (await expand.count()) {
        await expand.first().click({ force: true })
        await page.waitForTimeout(1200)
      }
      console.log(scheme, kind, "expanded", JSON.stringify(await page.evaluate(measure)))
      await shot("expanded")
      // fold Views:  its bar's chevron
      await page.evaluate(() => {
        const card = document.querySelector(".InspectorCard[data-panel=views]")
        card?.setAttribute("open", "false")
        card?.dispatchEvent(new CustomEvent("ui-closing", { bubbles: true, composed: true }))
      })
      await page.waitForTimeout(1200)
      console.log(scheme, kind, "viewsFolded", JSON.stringify(await page.evaluate(measure)))
      await shot("folded")
      // unfold again, so the next run starts the same
      await page.evaluate(() => {
        const card = document.querySelector(".InspectorCard[data-panel=views]")
        card?.dispatchEvent(new CustomEvent("ui-opening", { bubbles: true, composed: true }))
      })
      await page.waitForTimeout(800)
    }
    console.log("errors:", errors.slice(0, 5))
    await context.close()
  }
}
await browser.close()
