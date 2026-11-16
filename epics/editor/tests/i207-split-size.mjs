// Epic `editor` I207:  the Inspector's cards resized with Code folded;  no card smaller than its header.
// - Usage:  node i207-split-size.mjs [tag] [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const TAG = process.argv[2] ?? "after"
const EDITOR =
  process.argv[3] ?? JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

/** Each pane:  its card, folded or not, its height and its header's. */
function measure() {
  const split = document.querySelector(".InspectorColumn > .InspectorSplit")
  return [...split.querySelectorAll(":scope > .SplitPane")].map((pane) => {
    const card = pane.querySelector(".InspectorCard")
    const head = card?.shadowRoot?.querySelector("[part~=header]") ?? card?.querySelector("[slot=header]")
    return `${card?.dataset.panel}${card?.classList.contains("folded") ? "(f)" : ""}:${Math.round(pane.getBoundingClientRect().height)}`
  }).join(" ") + "  rows=" + split.rows + " flex=" + [...split.querySelectorAll(":scope > .SplitPane")].map((p) => p.style.flex).join("|")
}
/** The bars' middles, top to bottom. */
function bars() {
  const split = document.querySelector(".InspectorColumn > .InspectorSplit")
  return [...split.shadowRoot.querySelectorAll(".bar")]
    .map((bar) => bar.getBoundingClientRect())
    .sort((a, b) => a.top - b.top)
    .map((b) => ({ x: b.left + b.width / 2, y: b.top + b.height / 2 }))
}
const setFolded = (panel, folded) => (page) =>
  page.evaluate(
    ({ panel, folded }) => {
      const card = document.querySelector(`.InspectorCard[data-panel=${panel}]`)
      if (card.classList.contains("folded") === folded) return
      card.dispatchEvent(new CustomEvent(folded ? "ui-closing" : "ui-opening", { bubbles: true, composed: true }))
    },
    { panel, folded }
  )

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 })
await context.route(/\/api\//, (route) =>
  route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
)
const page = await context.newPage()
const errors = []
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)))
await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
await page.waitForFunction(() => window.Inspector && document.querySelector("solitaire-card"), undefined, { timeout: 90000 })
await page.waitForTimeout(2500)
if (!(await page.evaluate(() => window.Inspector.isOpen))) await page.evaluate(() => window.Inspector.showOrHide())
// a card selected, so the Code card has something to show
await page.evaluate(() => {
  window.Inspector.stopInspecting?.()
  window.Inspector.select([...document.querySelectorAll("solitaire-card")].at(-1))
})
await page.waitForTimeout(2500)
const hasCode = () => page.evaluate(() => !!document.querySelector(".InspectorCard[data-panel=code]:not(.locked)"))
console.log("code card selectable:", await hasCode())
if (process.env.INJECT)
  await page.addStyleTag({
    content: `.SpellPage .InspectorColumn > .InspectorSplit > .SplitPane { min-height: 40px }
      .SpellPage .InspectorColumn > .InspectorSplit > .SplitPane:has(> .InspectorCard.folded) { max-height: 40px }`
  })
const shot = async (name) => {
  const b = await page.locator(".InspectorColumn").first().boundingBox()
  await page.screenshot({ path: `${OUT}/i207-${TAG}-${name}.png`, clip: { x: b.x - 8, y: 0, width: b.width + 16, height: 1000 } })
}

/** Drag bar `index` by `by` px in steps, logging every step;  then let go and log twice more. */
async function drag(label, index, by) {
  const bar = (await page.evaluate(bars))[index]
  if (!bar) return console.log(label, "no bar", index)
  console.log(`\n${label}  bar ${index} by ${by}`)
  console.log("  start  ", await page.evaluate(measure))
  await page.mouse.move(bar.x, bar.y)
  await page.mouse.down()
  const steps = 6
  for (let step = 1; step <= steps; step++) {
    await page.mouse.move(bar.x, bar.y + (by * step) / steps)
    await page.waitForTimeout(40)
    console.log(`  ${String(Math.round((by * step) / steps)).padStart(5)}  `, await page.evaluate(measure))
  }
  await page.mouse.up()
  await page.waitForTimeout(100)
  console.log("  up     ", await page.evaluate(measure))
  await page.waitForTimeout(800)
  console.log("  later  ", await page.evaluate(measure))
}

console.log("cards", await page.evaluate(measure))
await setFolded("code", true)(page)
await page.waitForTimeout(1200)
console.log("code folded", await page.evaluate(measure))
await shot("code-folded")
await drag("A above folded code, down", 0, 200)
await drag("A above folded code, up", 0, -150)
await drag("B below folded code, up", 1, -200)
await drag("B below folded code, down", 1, 200)
await shot("code-folded-dragged")
await setFolded("code", false)(page)
await page.waitForTimeout(1200)
console.log("\ncode open", await page.evaluate(measure))
await drag("C above open code, down far", 0, 900)
await drag("D below open code, up far", 1, -900)
await drag("E below open code, down far", 1, 900)
await drag("F above open code, up far", 0, -900)
await shot("code-open-dragged")
console.log("errors:", errors.slice(0, 5))
await browser.close()
