// Epic `editor` I194:  the panels' bodies 50% lighter (the code's paper over their glass), their headers the top bar's look.
// - The whole window (Solitaire, Edit, the palette pinned, the Inspector open, a card selected), light and dark,
//   and each header's colour beside the top bar's, each panel body's.
// - Usage:  node i194-panels.mjs <before | after> [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const STAGE = process.argv[2] ?? "after"
const EDITOR =
  process.argv.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

/** Where each band is. */
function layout() {
  const box = (el) => {
    if (!el) return null
    const b = el.getBoundingClientRect()
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }
  }
  const cards = [...document.querySelectorAll(".InspectorColumn ui-panel.InspectorCard")].map((card) => ({
    title: card.getAttribute("title") ?? card.querySelector("[slot=title]")?.textContent?.trim(),
    card: box(card),
    bar: box(card.shadowRoot?.querySelector("[part~=title]"))
  }))
  return {
    bar: box(document.querySelector("ui-app-menu.EditorBar")),
    fileTabs: box(document.querySelector(".FileTabs")),
    code: box(document.querySelector(".InputEditor")),
    codePane: box(document.querySelector(".FileTabs")?.closest(".SplitPane")),
    cards
  }
}

const browser = await chromium.launch()
const results = {}
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 860 }, colorScheme: scheme, deviceScaleFactor: 1 })
  await context.route(/\/(api|spaces)\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
  await page.waitForFunction(() => window.Inspector && document.querySelector("solitaire-card"), undefined, { timeout: 90000 })
  await page.waitForTimeout(2500)
  if (!(await page.evaluate(() => window.Inspector.isOpen))) await page.evaluate(() => window.Inspector.showOrHide())
  if (!(await page.locator(".PaletteStrip").count())) {
    await page.locator(".AddPartButton [part~=item]").first().click()
    await page.waitForTimeout(1500)
    await page.locator(".PalettePin").first().click()
    await page.waitForTimeout(800)
  }
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
  const shot = await page.screenshot({ path: `${OUT}/i194-${STAGE}-${scheme}.png` })
  const at = await page.evaluate(layout)
  // read pixels from the full screenshot
  const sample = await page.evaluate(async ({ data, points }) => {
    const image = new Image()
    image.src = `data:image/png;base64,${data}`
    await image.decode()
    const canvas = new OffscreenCanvas(image.width, image.height)
    const context = canvas.getContext("2d")
    context.drawImage(image, 0, 0)
    const out = {}
    for (const [name, [x, y]] of Object.entries(points)) out[name] = [...context.getImageData(x, y, 1, 1).data.slice(0, 3)].join(",")
    return out
  }, {
    data: shot.toString("base64"),
    points: Object.fromEntries(
      [
        ["bar", [at.bar.x + Math.round(at.bar.w * 0.4), at.bar.y + 4]],
        ["bar(right)", [at.bar.x + at.bar.w - 200, at.bar.y + 4]],
        at.fileTabs && ["fileTabs", [at.fileTabs.x + at.fileTabs.w - 60, at.fileTabs.y + 3]],
        at.codePane && ["codePanelBody", [at.codePane.x + 3, at.codePane.y + at.codePane.h - 5]],
        at.code && ["code", [at.code.x + at.code.w - 30, at.code.y + at.code.h - 30]],
        ...at.cards.flatMap((card, i) => [
          card.bar && [`card${i}Bar`, [card.bar.x + card.bar.w - 70, card.bar.y + 3]],
          card.card && [`card${i}Body`, [card.card.x + 4, card.card.y + card.card.h - 5]]
        ])
      ].filter(Boolean)
    )
  })
  results[scheme] = sample
  console.log(scheme, "layout", JSON.stringify(at))
  console.log(scheme, "colours", JSON.stringify(sample))
  console.log(scheme, "page errors", errors.length, errors.slice(0, 3))
  await context.close()
}
await browser.close()
