// Epic `editor` T86, T87:  the pinned Add bar -- does it scroll at each width, and where its pieces sit;
// its search typed in, light and dark.
// - Usage:  node t86-pinbar.mjs <stage> [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const STAGE = process.argv[2] ?? "after"
const EDITOR =
  process.argv.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

/** Where the bar's pieces are, and whether its names scroll. */
function layout() {
  const box = (el) => {
    if (!el) return null
    const b = el.getBoundingClientRect()
    return { x: +b.x.toFixed(1), w: +b.width.toFixed(1), y: +b.y.toFixed(1), h: +b.height.toFixed(1), mid: +(b.y + b.height / 2).toFixed(1) }
  }
  const strip = document.querySelector(".PaletteStrip")
  const toolbar = strip?.querySelector("ui-toolbar.PaletteStripGroups")
  const menu = toolbar?.shadowRoot?.querySelector("[part~=menu]")
  const names = [...(strip?.querySelectorAll("ui-item.PaletteGroupName") ?? [])]
  const item = (each) => each.shadowRoot?.querySelector("[part~=item]") ?? each
  const icon = (each) => each.shadowRoot?.querySelector("ui-icon, [part~=icon]")
  const glyph = (each) => {
    const el = icon(each)
    return box(el?.shadowRoot?.querySelector("svg") ?? el)
  }
  const label = strip?.querySelector(".PaletteStripLabel")
  const search = strip?.querySelector(".PaletteStripSearch")
  const input = search?.shadowRoot?.querySelector("input")
  const bar = document.querySelector("ui-app-menu.EditorBar")
  const barBox = bar?.shadowRoot?.querySelector("[part~=bar], [part~=menu]") ?? bar
  return {
    window: innerWidth,
    strip: box(strip),
    overflowing: toolbar?.matches(":state(overflowing)"),
    menuScroll: menu ? [menu.scrollWidth, menu.clientWidth] : null,
    pin: box(strip?.querySelector(".PalettePin")?.shadowRoot?.querySelector("svg") ?? strip?.querySelector(".PalettePin")),
    label: label && { ...box(label), text: label.textContent, weight: getComputedStyle(label).fontWeight },
    first: names[0] && { ...box(item(names[0])), text: names[0].textContent, icon: glyph(names[0]) },
    last: names.at(-1) && { ...box(item(names.at(-1))), text: names.at(-1).textContent, icon: glyph(names.at(-1)) },
    namesMid: names.length && +((box(item(names[0])).x + box(item(names.at(-1))).x + box(item(names.at(-1))).w) / 2).toFixed(1),
    search: box(search),
    searchIcon: box(search?.shadowRoot?.querySelector("[part~=icon], ui-icon, .icon")),
    clear: box(strip?.querySelector(".PaletteStripClear")),
    inputText: input && box(input),
    barBorder: bar && getComputedStyle(barBox).borderBottom
  }
}

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1290, height: 800 }, colorScheme: scheme, deviceScaleFactor: 2 })
  await context.route(/\/(api|spaces)\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()))
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
  await page.waitForFunction(() => document.querySelector("solitaire-card"), undefined, { timeout: 90000 })
  await page.waitForTimeout(2000)
  if (!(await page.locator(".PaletteStrip").count())) {
    await page.locator(".AddPartButton [part~=item]").first().click()
    await page.waitForTimeout(1500)
    await page.locator(".PalettePin").first().click()
    await page.waitForTimeout(800)
  }
  if (scheme === "dark")
    await page.evaluate(() => {
      document.documentElement.classList.add("ui-dark")
      document.documentElement.classList.remove("ui-light")
      document.documentElement.style.colorScheme = "dark"
    })
  for (const width of [1280, 1290, 1440, 1920]) {
    await page.setViewportSize({ width, height: 800 })
    await page.waitForTimeout(700)
    console.log(scheme, width, JSON.stringify(await page.evaluate(layout)))
  }
  await page.setViewportSize({ width: 1290, height: 800 })
  await page.mouse.move(640, 600)
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/t86-${STAGE}-${scheme}.png`, clip: { x: 0, y: 0, width: 1290, height: 120 } })
  await page.screenshot({ path: `${OUT}/t86-${STAGE}-1920-${scheme}.png`, clip: { x: 0, y: 0, width: 1290, height: 120 } })
  // T87:  typed in
  const field = page.locator(".PaletteStripSearch input").first()
  await field.click()
  await page.waitForTimeout(400)
  const focusedWidth = await page.evaluate(() => document.querySelector(".PaletteStripSearch").getBoundingClientRect().width)
  await page.keyboard.type("text")
  await page.waitForTimeout(900)
  console.log(scheme, "typed", focusedWidth, JSON.stringify(await page.evaluate(layout)))
  await page.screenshot({ path: `${OUT}/t87-${STAGE}-typed-${scheme}.png`, clip: { x: 640, y: 0, width: 650, height: 400 } })
  // the clear ✕:  empties the field, closes the results, focus stays
  const clear = page.locator(".PaletteStripClear")
  if (await clear.count()) {
    await clear.click()
    await page.waitForTimeout(600)
    console.log(
      scheme,
      "cleared",
      JSON.stringify(
        await page.evaluate(() => ({
          value: document.querySelector(".PaletteStripSearch").value,
          resultsOpen: document.querySelector(".PaletteMatches")?.matches(":popover-open"),
          focusInField: !!document.querySelector(".PaletteStripSearch").matches(":focus-within"),
          clearShown: !!document.querySelector(".PaletteStripClear")
        }))
      )
    )
    await page.screenshot({ path: `${OUT}/t87-${STAGE}-cleared-${scheme}.png`, clip: { x: 640, y: 0, width: 650, height: 120 } })
  }
  console.log(scheme, "page errors", errors.length, errors.slice(0, 3))
  await context.close()
}
await browser.close()
