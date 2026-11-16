// Epic `editor` I187, on CodeMirror:  12px of room round the code -- the code pane's top-left, and the Inspector's code boxes.
// - Usage:  node i187cm-pad.mjs [tag] [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const TAG = process.argv[2] ?? "after"
const EDITOR =
  process.argv[3] ?? JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

/** Every band, pill and foot in `root`:  elements in the lines with a painted background, and the feet. */
const MEASURE = (root, box) => {
  const r = (b) => ({ l: +b.left.toFixed(1), t: +b.top.toFixed(1), r: +b.right.toFixed(1), b: +b.bottom.toFixed(1) })
  const painted = [...root.querySelectorAll(".cm-content *")].filter((e) => {
    const s = getComputedStyle(e)
    const b = e.getBoundingClientRect()
    if (!b.width || !b.height) return false
    return (s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "transparent") || e.matches(".cmb-foot")
  })
  const rects = painted.map((e) => e.getBoundingClientRect())
  // a line's rails:  its own left plus the first stop of `--cmb-rails`
  const content = root.querySelector(".cm-content").getBoundingClientRect()
  const firstLine = root.querySelector(".cm-line").getBoundingClientRect()
  const visibleRects = rects.filter((b) => b.bottom > box.top && b.top < box.bottom)
  // a band off its line:  outside the line it's in, up or down
  const offLine = painted.filter((e) => {
    const line = e.closest(".cm-line")
    if (!line) return false
    const b = e.getBoundingClientRect()
    const l = line.getBoundingClientRect()
    return b.top < l.top - 0.5 || b.bottom > l.bottom + 0.5
  }).length
  const chevron = root.querySelector(".cmb-fold path")?.getBoundingClientRect()
  const described = [...root.querySelectorAll(".cmb-band-described")].map((e) => +(box.right - e.getBoundingClientRect().right).toFixed(1))
  return {
    box: r(box),
    bands: painted.length,
    offLine,
    chevron: chevron && chevron.width ? { l: +(chevron.left - box.left).toFixed(1), r: +(chevron.right - box.left).toFixed(1) } : null,
    describedRight: described.slice(0, 3),
    contentTop: +(content.top - box.top).toFixed(1),
    firstLineTop: +(firstLine.top - box.top).toFixed(1),
    firstLineLeft: +(firstLine.left - box.left).toFixed(1),
    bandTop: +(Math.min(...visibleRects.map((b) => b.top)) - box.top).toFixed(1),
    bandLeft: +(Math.min(...visibleRects.map((b) => b.left)) - box.left).toFixed(1),
    bandBottom: +(box.bottom - Math.max(...visibleRects.map((b) => b.bottom))).toFixed(1),
    bandRight: +(box.right - Math.max(...visibleRects.map((b) => b.right))).toFixed(1),
    gutter: (() => {
      const g = root.querySelector(".cm-gutters")
      if (!g || getComputedStyle(g).display === "none") return null
      const b = g.getBoundingClientRect()
      return { l: +(b.left - box.left).toFixed(1), w: +b.width.toFixed(1) }
    })()
  }
}

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1500, height: 1100 }, colorScheme: scheme, deviceScaleFactor: 2 })
  await context.route(/\/api\//, (route) => {
    if (route.request().method() === "GET") return route.continue()
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  })
  const page = await context.newPage()
  const errors = []
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)))
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
  await page.waitForSelector(".InputEditor .cm-editor .cm-line", { timeout: 90000 })
  await page.waitForTimeout(3000)

  ////// the code pane, at the top and scrolled
  const pane = async (name) => {
    const info = await page.evaluate((src) => {
      const MEASURE = eval(src)
      const root = document.querySelector(".InputEditor")
      const box = root.getBoundingClientRect()
      const tabs = document.querySelector(".FileTabs")
      const m = MEASURE(root, box)
      m.tabsBottomToPane = tabs ? +(box.top - tabs.getBoundingClientRect().bottom).toFixed(1) : null
      m.scrollTop = root.querySelector(".cm-scroller").scrollTop
      return m
    }, MEASURE.toString())
    console.log(scheme, name, JSON.stringify(info))
    const box = await page.locator(".InputEditor").boundingBox()
    await page.screenshot({
      path: `${OUT}/i187cm-${TAG}-${name}-${scheme}.png`,
      clip: { x: box.x - 10, y: box.y - 44, width: 520, height: 260 }
    })
  }
  await pane("pane")
  await page.evaluate(() => (document.querySelector(".InputEditor .cm-scroller").scrollTop = 400))
  await page.waitForTimeout(800)
  await pane("pane-scrolled")
  await page.evaluate(() => (document.querySelector(".InputEditor .cm-scroller").scrollTop = 0))

  ////// the Inspector's code boxes
  await page.evaluate(() => globalThis.spellEditor?.showInspector?.())
  if (!(await page.locator(".CodeSlice").count())) {
    const inspect = page.locator(".InspectAppButton [part~=item]").first()
    if (await inspect.count()) await inspect.click({ force: true })
    await page.waitForTimeout(1500)
    await page.locator(".InspectorViews").getByText("Solitaire", { exact: true }).first().click({ force: true }).catch(() => {})
  }
  await page.waitForSelector(".CodeSlice .cm-line", { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(2500)
  const count = await page.locator(".CodeSlice").count()
  for (let i = 0; i < Math.min(count, 3); i++) {
    const slice = page.locator(".CodeSlice").nth(i)
    await slice.scrollIntoViewIfNeeded()
    await page.waitForTimeout(600)
    const info = await slice.evaluate((root, src) => {
      const MEASURE = eval(src)
      const box = root.getBoundingClientRect()
      const s = getComputedStyle(root)
      // inside the border
      const inner = new DOMRect(
        box.left + parseFloat(s.borderLeftWidth), box.top + parseFloat(s.borderTopWidth),
        box.width - parseFloat(s.borderLeftWidth) - parseFloat(s.borderRightWidth),
        box.height - parseFloat(s.borderTopWidth) - parseFloat(s.borderBottomWidth)
      )
      const m = MEASURE(root, inner)
      m.text = root.querySelector(".cm-content").innerText.slice(0, 40)
      // scrolled to its right end:  the last word's room to the box's right border
      const scroller = root.querySelector(".cm-scroller")
      if (scroller.scrollWidth > scroller.clientWidth) {
        scroller.scrollLeft = 99999
        const rights = [...root.querySelectorAll(".cm-line")].map((line) => {
          const range = document.createRange()
          range.selectNodeContents(line)
          return range.getBoundingClientRect().right
        })
        m.scrolledEndRight = +(inner.right - Math.max(...rights)).toFixed(1)
        scroller.scrollLeft = 0
      }
      m.padding = s.padding
      return m
    }, MEASURE.toString())
    console.log(scheme, `slice${i}`, JSON.stringify(info))
    const b = await slice.boundingBox()
    await page.screenshot({
      path: `${OUT}/i187cm-${TAG}-slice${i}-${scheme}.png`,
      clip: { x: b.x - 14, y: b.y - 14, width: b.width + 28, height: Math.min(b.height + 28, 360) }
    })
  }
  console.log(scheme, "slices:", count, "errors:", errors.slice(0, 5))
  await context.close()
}
await browser.close()
