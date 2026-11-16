// Epic `editor` I187:  12px round the code -- the code pane's first band 12px under the file tabs and every band 12px
// from the pane's left edge;  the Inspector's code boxes 12px inside on every side.
// - Usage:  node i187-pad.mjs [tag] [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const TAG = process.argv[2] ?? "after"
const EDITOR =
  process.argv[3] || JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

/** The code pane's numbers:  first band vs the tabs, bands' left vs the pane's, each line vs the band on it. */
function measurePane() {
  const pane = [...document.querySelectorAll(".monaco-editor")].find((each) => !each.closest(".CodeSlice") && each.getBoundingClientRect().width > 400)
  const holder = pane.closest(".MonacoEditor")
  const tabs = document.querySelector(".FileTabs")?.getBoundingClientRect()
  const holderBox = holder.getBoundingClientRect()
  const shapes = [...holder.querySelectorAll(".bubbly-shapes *")].map((each) => each.getBoundingClientRect()).filter((box) => box.height > 0 && box.bottom > holderBox.top)
  const bandTop = Math.min(...shapes.map((b) => b.top))
  const bandLeft = Math.min(...shapes.map((b) => b.left))
  const lines = [...pane.querySelectorAll(".view-line")].map((l) => ({ top: l.getBoundingClientRect().top, left: l.getBoundingClientRect().left, text: l.textContent.trim() })).filter((l) => l.text).sort((a, b) => a.top - b.top)
  const arrows = [...pane.querySelectorAll(".margin .cldr[class*='codicon-folding']")].map((a) => a.getBoundingClientRect()).filter((b) => b.width > 0)
  // each line vs the nearest band top above it:  bubbles on their text
  const drift = lines.slice(0, 8).map((line) => {
    const above = shapes.filter((s) => s.top <= line.top + 1 && s.bottom >= line.top + 4)
    return above.length ? +(line.top - Math.max(...above.map((s) => s.top))).toFixed(1) : null
  })
  return {
    tabsBottom: tabs?.bottom,
    paneLeft: +holderBox.left.toFixed(1),
    bandTopBelowTabs: +(bandTop - tabs.bottom).toFixed(1),
    bandLeftFromPane: +(bandLeft - holderBox.left).toFixed(1),
    firstLineLeftFromPane: +(lines[0].left - holderBox.left).toFixed(1),
    firstLine: lines[0].text.slice(0, 40),
    arrowLeftFromPane: arrows.length ? +(Math.min(...arrows.map((a) => a.left)) - holderBox.left).toFixed(1) : null,
    arrowRightFromPane: arrows.length ? +(Math.max(...arrows.map((a) => a.right)) - holderBox.left).toFixed(1) : null,
    lineMinusBandTop: drift
  }
}

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme, deviceScaleFactor: 2 })
  await context.route(/\/api\//, (route) => {
    if (route.request().method() === "GET") return route.continue()
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  })
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire?scheme=${scheme}`, { timeout: 90000 })
  await page.waitForFunction(() => document.querySelectorAll(".monaco-editor .view-line").length > 3 && document.querySelectorAll(".bubbly-shapes > *").length > 0, undefined, { timeout: 90000 })
  await page.waitForTimeout(2500)

  // 1. the code pane, at the top and scrolled
  const top = await page.evaluate(measurePane)
  console.log(scheme, TAG, "pane top", JSON.stringify(top))
  const clip = { x: Math.max(0, top.paneLeft - 20), y: Math.max(0, top.tabsBottom - 40), width: 700, height: 180 }
  await page.screenshot({ path: `${OUT}/i187-${TAG}-pane-${scheme}.png`, clip })
  await page.mouse.move(top.paneLeft + 300, top.tabsBottom + 300)
  for (let step = 0; step < 4; step++) { await page.mouse.wheel(0, 60); await page.waitForTimeout(150) }
  await page.waitForTimeout(900)
  console.log(scheme, TAG, "scrolled by", await page.evaluate(() => [...document.querySelectorAll(".monaco-editor")].find((each) => !each.closest(".CodeSlice") && each.getBoundingClientRect().width > 400).querySelector(".lines-content").style.top))
  await page.screenshot({ path: `${OUT}/i187-${TAG}-scrolled-${scheme}.png`, clip })
  console.log(scheme, TAG, "pane scrolled", JSON.stringify((({ lineMinusBandTop, bandLeftFromPane }) => ({ lineMinusBandTop, bandLeftFromPane }))(await page.evaluate(measurePane))))
  // a fold arrow still folds:  press the first visible one
  const folded = await page.evaluate(() => {
    const pane = [...document.querySelectorAll(".monaco-editor")].find((each) => !each.closest(".CodeSlice") && each.getBoundingClientRect().width > 400)
    const arrow = [...pane.querySelectorAll(".margin .cldr[class*='codicon-folding-expanded']")].find((a) => a.getBoundingClientRect().top > pane.getBoundingClientRect().top + 20)
    if (!arrow) return null
    const b = arrow.getBoundingClientRect()
    return { x: b.left + b.width / 2, y: b.top + b.height / 2, lines: pane.querySelectorAll(".view-line").length }
  })
  if (folded) {
    await page.mouse.move(folded.x, folded.y)
    await page.waitForTimeout(400)
    await page.mouse.click(folded.x, folded.y)
    await page.waitForTimeout(600)
    const after = await page.evaluate(() => document.querySelectorAll(".monaco-editor .margin .cldr.codicon-folding-collapsed").length)
    console.log(scheme, TAG, "fold arrow press -> folded blocks:", after)
    await page.screenshot({ path: `${OUT}/i187-${TAG}-folded-${scheme}.png`, clip: { ...clip, y: clip.y, height: 360 } })
  }

  // 2. the Inspector's code boxes
  if (!(await page.evaluate(() => !!document.querySelector(".InspectAppButton.inspecting")))) {
    await page.locator(".InspectAppButton [part~=item]").first().click({ force: true })
  }
  await page.waitForTimeout(1500)
  await page.locator(".InspectorViews").getByText("Solitaire", { exact: true }).first().click({ force: true })
  await page.waitForTimeout(3000)
  for (const [name, text] of [["restart", "restart the game"], ["score", "when the score changes"]]) {
    const card = (name === "restart" ? page.locator("ui-section.InspectorEvent.action") : page.locator("ui-section.InspectorEvent")).filter({ hasText: text }).first()
    if (!(await card.count())) { console.log(scheme, name, "no card"); continue }
    await card.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1200)
    const info = await card.evaluate((card) => {
      const slice = card.querySelector(".CodeSlice")
      const style = getComputedStyle(slice)
      const box = slice.getBoundingClientRect()
      // inside the border
      const inner = { l: box.left + parseFloat(style.borderLeftWidth), t: box.top + parseFloat(style.borderTopWidth), r: box.right - parseFloat(style.borderRightWidth), b: box.bottom - parseFloat(style.borderBottomWidth) }
      const shapes = [...slice.querySelectorAll(".bubbly-shapes *")].map((e) => e.getBoundingClientRect()).filter((b) => b.height > 0 && b.width > 0)
      const right = Math.max(...shapes.map((e) => Math.min(e.right, inner.r)))
      return {
        rawRight: +(Math.max(...shapes.map((e) => e.right)) - inner.r).toFixed(1), layerW: slice.querySelector(".bubbly-layer")?.getBoundingClientRect().width, edW: slice.querySelector(".monaco-editor").getBoundingClientRect().width, holderW: slice.querySelector(".MonacoEditor").getBoundingClientRect().width, scrollW: slice.querySelector(".monaco-editor .lines-content")?.getBoundingClientRect().width,
        editorRightGap: +(inner.r - slice.querySelector(".monaco-editor").getBoundingClientRect().right).toFixed(1),
        lines: [...slice.querySelectorAll(".view-line")].map((l) => l.innerText.trim()).filter(Boolean).slice(0, 3),
        bandsInside: {
          top: +(Math.min(...shapes.map((e) => e.top)) - inner.t).toFixed(1),
          bottom: +(inner.b - Math.max(...shapes.map((e) => e.bottom))).toFixed(1),
          left: +(Math.min(...shapes.map((e) => e.left)) - inner.l).toFixed(1),
          right: +(inner.r - right).toFixed(1)
        }
      }
    })
    console.log(scheme, TAG, "slice", name, JSON.stringify(info))
    const box = await card.boundingBox()
    await page.screenshot({ path: `${OUT}/i187-${TAG}-${name}-${scheme}.png`, clip: { x: box.x - 14, y: box.y - 4, width: box.width + 28, height: Math.min(box.height + 8, 420) } })
  }
  if (errors.length) console.log("errors", errors.slice(0, 5))
  await context.close()
}
await browser.close()
