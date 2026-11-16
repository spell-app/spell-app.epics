// Epic `editor` T78, T79:  the Inspector's card headers -- no crosshairs, no ✕;  the Code card's Add Event and Add Action.
// - Usage:  node t78-card-bars.mjs [editorUrl] [--add]
// - Saves nothing:  every non-GET to /api is answered `{}`;  a file written is kept in the run, and read back from there.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url
const ADD = process.argv.includes("--add")

/** Each card's header:  its panel, its buttons' classes, its height, and whether anything wraps. */
function headers() {
  return [...document.querySelectorAll(".InspectorColumn ui-panel.InspectorCard")].map((card) => {
    const bar = card.querySelector('ui-toolbar[slot="actions"]')
    const buttons = [...bar.querySelectorAll("ui-icon, ui-dropdown, ui-button")]
      .filter((each) => !each.closest("ui-item") && each.parentElement.closest("ui-dropdown, ui-button") === null)
      .map((each) => `${each.localName}.${[...each.classList].join(".")}${each.getAttribute("name") ? `[${each.getAttribute("name")}]` : ""}`)
    const words = [...bar.querySelectorAll(".InspectorAddWords")].map((each) => { const box = each.getBoundingClientRect(); return `${getComputedStyle(each).display} ${Math.round(box.top)}-${Math.round(box.bottom)}` })
    const tall = [...bar.querySelectorAll(":scope > *")].map((each) => `${each.localName}:${Math.round(each.getBoundingClientRect().height)}`)
    return { panel: card.dataset.panel, height: Math.round(bar.getBoundingClientRect().height), width: Math.round(card.getBoundingClientRect().width), buttons, words, tall }
  })
}

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1400, height: 820 }, colorScheme: scheme, deviceScaleFactor: 2 })
  // a file "saved" is kept here, and served back when the page reads it again, so an edit stays for the run
  const kept = new Map()
  await context.route(/\/(api|spaces)\//, (route) => {
    const request = route.request()
    const path = decodeURIComponent(new URL(request.url()).pathname).replace(/^\/(api\/projects\/file|spaces)\//, "")
    if (request.method() === "GET") {
      if (kept.has(path)) return route.fulfill({ status: 200, contentType: "text/plain", body: kept.get(path) })
      return route.continue()
    }
    if (/\/api\/projects\/file\//.test(request.url())) kept.set(path, request.postData() ?? "")
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  })
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
  await page.waitForFunction(() => window.Inspector && document.querySelector("solitaire-card"), undefined, { timeout: 90000 })
  await page.waitForTimeout(2000)
  await page.evaluate(() => {
    if (!window.Inspector.isOpen) window.Inspector.showOrHide()
  })
  await page.waitForTimeout(800)
  console.log(scheme, "nothing selected", JSON.stringify(await page.evaluate(headers)))
  await page.evaluate(() => {
    window.Inspector.stopInspecting()
    window.Inspector.select([...document.querySelectorAll("solitaire-card")].at(-1))
  })
  await page.waitForTimeout(2500)
  console.log(scheme, "a card", JSON.stringify(await page.evaluate(headers)))
  const column = page.locator(".InspectorColumn").first()
  await column.screenshot({ path: `${OUT}/t78-cards-${scheme}.png` })
  const code = page.locator('ui-panel.InspectorCard[data-panel="code"]').first()
  const bar = async (name) => {
    const box = await code.boundingBox()
    await page.screenshot({ path: `${OUT}/t79-${name}-${scheme}.png`, clip: { x: box.x - 4, y: box.y - 4, width: box.width + 8, height: 48 } })
  }
  await bar("code-header")
  // Add Event's list
  await page.locator("ui-dropdown.InspectorAddEvent").first().click()
  await page.waitForTimeout(500)
  const box = await code.boundingBox()
  await page.screenshot({ path: `${OUT}/t79-add-event-${scheme}.png`, clip: { x: box.x - 140, y: box.y - 4, width: box.width + 144, height: 260 } })
  // closed by a second click:  Esc would let go of what's selected too
  await page.locator("ui-dropdown.InspectorAddEvent").first().click()
  await page.waitForTimeout(300)
  // narrow:  the column at its narrowest the split lets it
  for (const width of [260, 220]) {
    await page.evaluate((px) => {
      const pane = document.querySelector(".InspectorColumn").closest(".SplitPane")
      pane.style.flex = `0 0 ${px}px`
      pane.style.width = `${px}px`
    }, width)
    await page.waitForTimeout(500)
    console.log(scheme, `narrow ${width}`, JSON.stringify(await page.evaluate(headers)))
    await bar(`code-header-${width}`)
  }
  if (ADD && scheme === "light") {
    await page.evaluate(() => {
      const pane = document.querySelector(".InspectorColumn").closest(".SplitPane")
      pane.style.flex = ""
      pane.style.width = ""
    })
    await page.waitForTimeout(400)
    const before = await page.evaluate(() => [...document.querySelectorAll(".InspectorEvent.action .InspectorEventWords")].map((each) => each.textContent.trim()))
    await page.locator("ui-button.InspectorAddAction").first().click()
    await page.waitForTimeout(5000)
    await page.mouse.move(5, 5)
    const after = await page.evaluate(() => [...document.querySelectorAll(".InspectorEvent.action .InspectorEventWords")].map((each) => each.textContent.trim()))
    const focused = await page.evaluate(() => document.activeElement?.closest?.(".InspectorEvent")?.textContent?.trim().slice(0, 40) ?? document.activeElement?.localName)
    console.log("actions before", JSON.stringify(before))
    console.log("actions after", JSON.stringify(after), "focus in", JSON.stringify(focused))
    await column.screenshot({ path: `${OUT}/t79-added-action-${scheme}.png` })
  }
  console.log(scheme, "errors", JSON.stringify(errors))
  await context.close()
}
await browser.close()
