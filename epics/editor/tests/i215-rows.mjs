// Epic `editor` I215:  the Code card's rows (T98) against the code pane's same blocks -- Solitaire's app selected,
// the Code card's rows `when creating solitaire` and `when the score changes` (its `if`), light and dark.
// - Usage:  node i215-rows.mjs [tag] [editorUrl];  `PROBE=1` prints the measured joins
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const TAG = process.argv[2] ?? "after"
const EDITOR =
  process.argv[3] ?? JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

/** The `if` and its body, in the code pane and in the second row's slice:  where its band, rail, words and foot are. */
function ifBlock() {
  const r = (n) => Math.round(n * 10) / 10
  const textX = (line, word) => {
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT)
    for (let n; (n = walker.nextNode()); ) {
      const at = n.data.indexOf(word)
      if (at >= 0) { const range = document.createRange(); range.setStart(n, at); range.setEnd(n, at + 1); return range.getBoundingClientRect().left }
    }
  }
  const of = (root) => {
    const lines = [...root.querySelectorAll(".cm-line")]
    const head = lines.find((l) => /foundations is 52/.test(l.textContent))
    const body = lines.find((l) => /You won/.test(l.textContent))
    if (!head || !body) return "not drawn"
    const band = head.querySelector(".cmb-band")?.getBoundingClientRect()
    const foot = head.parentElement.querySelectorAll(".cmb-foot")
    if (!band) return { noBand: head.outerHTML.slice(0, 300) }
    const left = band.left
    return { bandLeft: 0, bodyWords: r(textX(body, "alert") - left), rails: getComputedStyle(body).backgroundImage.match(/[\d.]+px/g)?.join(" "),
      linePad: r(body.getBoundingClientRect().left + parseFloat(getComputedStyle(body).paddingLeft) - left), feet: [...foot].map((f) => r(f.getBoundingClientRect().left - left)) }
  }
  const pane = [...document.querySelectorAll(".cm-editor")].find((e) => !e.closest(".CodeSlice") && e.getBoundingClientRect().width > 300)
  const slice = document.querySelectorAll("ui-section.InspectorEvent.bubbly .CodeSlice .cm-editor")[1]
  return { pane: pane && of(pane), slice: slice && of(slice) }
}

/** The joins that matter, per row, rounded to 0.1px. */
function measure() {
  const r = (n) => Math.round(n * 10) / 10
  const rows = [...document.querySelectorAll("ui-section.InspectorEvent.bubbly")].filter((row) => row.getBoundingClientRect().height)
  return rows.slice(0, 4).map((row) => {
    const box = row.getBoundingClientRect()
    const band = row.querySelector(".InspectorEventWords").getBoundingClientRect()
    const header = row.shadowRoot?.querySelector("[part~=header]")?.getBoundingClientRect()
    const content = row.shadowRoot?.querySelector("[part~=content]")
    const contentBox = content?.getBoundingClientRect()
    const slice = row.querySelector(".CodeSlice")
    const sliceBox = slice?.getBoundingClientRect()
    const scroller = slice?.querySelector(".cm-scroller")
    const x = row.querySelector(".InspectorRemoveEvent, .InspectorActionButton")?.getBoundingClientRect()
    const lines = slice ? [...slice.querySelectorAll(".cm-line")].filter((l) => l.getBoundingClientRect().height).map((l) => ({ text: l.textContent.slice(0, 30), left: r(l.getBoundingClientRect().left - sliceBox.left) })) : []
    const shapes = slice ? [...slice.querySelectorAll("[class*=cmb-]")].filter((e) => getComputedStyle(e).backgroundColor !== "rgba(0, 0, 0, 0)" && e.getBoundingClientRect().width).length : 0
    return {
      words: row.querySelector(".InspectorEventWords").textContent.trim(),
      rowRight: r(box.right), bandLeft: r(band.left - box.left), bandRight: r(band.right), bandBottom: r(band.bottom),
      headerRight: header && r(header.right), xRight: x && r(x.right), xLeft: x && r(x.left),
      contentTop: contentBox && r(contentBox.top), contentLeft: contentBox && r(contentBox.left), contentBottom: contentBox && r(contentBox.bottom),
      sliceTop: sliceBox && r(sliceBox.top), sliceBottom: sliceBox && r(sliceBox.bottom), sliceLeft: sliceBox && r(sliceBox.left), sliceRight: sliceBox && r(sliceBox.right),
      scroll: scroller && { client: scroller.clientWidth, scroll: scroller.scrollWidth, height: scroller.offsetHeight - scroller.clientHeight },
      lines, shapes
    }
  })
}

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme, deviceScaleFactor: 2 })
  await context.route(/\/api\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire?scheme=${scheme}`, { timeout: 90000 })
  await page.waitForFunction(() => window.Inspector && document.querySelector("solitaire-card"), undefined, { timeout: 90000 })
  await page.waitForTimeout(3000)
  if (!(await page.evaluate(() => window.Inspector.isOpen))) await page.evaluate(() => window.Inspector.showOrHide())
  await page.waitForTimeout(1000)
  await page.evaluate(() => {
    window.Inspector.stopInspecting?.()
    window.Inspector.select(document.querySelector("solitaire-app"))
  })
  await page.waitForTimeout(3000)
  await page.mouse.move(2, 890)
  const card = page.locator(".InspectorCard", { has: page.locator("ui-section.InspectorEvent.bubbly") }).first()
  await card.scrollIntoViewIfNeeded().catch(() => {})
  const rows = page.locator("ui-section.InspectorEvent.bubbly")
  const first = await rows.first().boundingBox()
  const second = await rows.nth(1).boundingBox()
  if (first && second) {
    const top = first.y - 8, bottom = second.y + second.height + 8
    await page.screenshot({ path: `${OUT}/i215-${TAG}-card-${scheme}.png`, clip: { x: first.x - 24, y: top, width: first.width + 40, height: bottom - top } })
  }
  if (process.env.PROBE) console.log(scheme, JSON.stringify(await page.evaluate(measure)), JSON.stringify(await page.evaluate(ifBlock)))
  // the same blocks in the code pane:  line 142, `when the score changes`, its `if` under it
  await page.evaluate(() => window.editor.showFileAt("@spell/examples/Solitaire/Solitaire.spell", { anchor: { line: 141, ch: 1 }, head: { line: 141, ch: 1 }, quiet: true }))
  await page.waitForTimeout(5000)
  const paneLine = await page.evaluate(() => {
    const line = [...document.querySelectorAll(".cm-line")].find((each) => !each.closest(".CodeSlice") && /when the score changes/.test(each.textContent))
    const box = line?.getBoundingClientRect()
    return box && { x: box.left, y: box.top }
  })
  if (paneLine) await page.screenshot({ path: `${OUT}/i215-${TAG}-pane-${scheme}.png`, clip: { x: paneLine.x - 16, y: paneLine.y - 300, width: 620, height: 440 } })
  await context.close()
}
await browser.close()
