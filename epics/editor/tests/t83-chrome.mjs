// Epic `editor` T83:  the editor's chrome in one look -- the whole window, as Owen sees it
// (Solitaire, Edit, the palette pinned, the Inspector open), light and dark, and each band's colour.
// - Usage:  node t83-chrome.mjs <before | after> [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`;  a file written is kept in the run.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const STAGE = process.argv[2] ?? "after"
const EDITOR =
  process.argv.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

/** The colour painted at a point (the screenshot's pixel), as `r,g,b`. */
async function pixel(page, x, y) {
  const shot = await page.screenshot({ clip: { x, y, width: 1, height: 1 }, scale: "css" })
  // a 1x1 PNG:  decode with the browser itself
  return page.evaluate(async (data) => {
    const image = new Image()
    image.src = `data:image/png;base64,${data}`
    await image.decode()
    const canvas = new OffscreenCanvas(1, 1)
    const context = canvas.getContext("2d")
    context.drawImage(image, 0, 0)
    return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)].join(",")
  }, shot.toString("base64"))
}

/** Where things are:  each band's box, the top bar's items. */
function layout() {
  const box = (el) => {
    if (!el) return null
    const b = el.getBoundingClientRect()
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }
  }
  const deep = (root, test) => {
    for (const el of root.querySelectorAll("*")) {
      if (test(el)) return el
      if (el.shadowRoot) {
        const found = deep(el.shadowRoot, test)
        if (found) return found
      }
    }
  }
  const bar = document.querySelector("ui-app-menu.EditorBar")
  const glyph = (el) => box(el?.shadowRoot?.querySelector("[part~=icon]") ?? el)
  const files = deep(document, (el) => el.localName === "ui-toolbar" && el.getAttribute("label") === "Files")
  const strip = document.querySelector(".PaletteStrip")
  const groups = strip?.querySelector(".PaletteStripGroups")
  const names = [...(strip?.querySelectorAll("ui-item.PaletteGroupName") ?? [])].map((each) =>
    box(each.shadowRoot?.querySelector("[part~=item]") ?? each)
  )
  return {
    bar: box(bar),
    strip: box(strip),
    groups: box(groups),
    names: names.length ? { first: names[0], last: names.at(-1), count: names.length } : null,
    files: box(files),
    filesButton: box(files?.shadowRoot?.querySelector("[part~=all-items]")),
    filesButtonShown: files ? getComputedStyle(files.shadowRoot.querySelector("[part~=all-items]") ?? files).display : null,
    closeCode: box(document.querySelector(".CloseCode")),
    code: box(document.querySelector(".InputEditor")),
    inspector: box(document.querySelector(".InspectorColumn")),
    crosshair: glyph(document.querySelector("ui-item.InspectAppButton")?.shadowRoot?.querySelector("[part~=item]") ? document.querySelector("ui-item.InspectAppButton").shadowRoot.querySelector("[part~=icon], ui-icon") : null) ?? box(document.querySelector("ui-item.InspectAppButton")),
    add: box(document.querySelector(".AddPartButton")),
    inspectorToggle: box(document.querySelector(".InspectorToggle")),
    tools: [...document.querySelectorAll("ui-app-menu.EditorBar .BarTools ui-icon.IconAction, ui-app-menu.EditorBar .BarTools ui-item.ThemeMenu, ui-app-menu.EditorBar .YouAvatar")].map((each) => ({ name: each.getAttribute("name") ?? each.className, ...glyph(each) }))
  }
}

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 860 }, colorScheme: scheme, deviceScaleFactor: 2 })
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
  await page.waitForTimeout(2500)
  if (!(await page.evaluate(() => window.Inspector.isOpen))) await page.evaluate(() => window.Inspector.showOrHide())
  // the palette pinned:  its popup's pin
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
  await page.mouse.move(720, 500)
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${OUT}/t83-${STAGE}-${scheme}.png` })
  await page.locator(".InspectorColumn").first().screenshot({ path: `${OUT}/i190-column-${STAGE}-${scheme}.png` })
  const at = await page.evaluate(layout)
  console.log(scheme, JSON.stringify(at, null, 0))
  const colours = {
    bar: await pixel(page, 700, at.bar.y + 4),
    strip: at.strip && (await pixel(page, at.strip.x + 4, at.strip.y + at.strip.h / 2)),
    fileBar: at.files && (await pixel(page, at.files.x + at.files.w - 60, at.files.y + 3)),
    code: at.code && (await pixel(page, at.code.x + at.code.w - 30, at.code.y + at.code.h - 30)),
    codePanel: at.code && (await pixel(page, at.code.x + 2, at.code.y + at.code.h - 4)),
    inspectorTop: at.inspector && (await pixel(page, at.inspector.x + at.inspector.w - 60, at.inspector.y + 4)),
    inspectorGap: at.inspector && (await pixel(page, at.inspector.x + 2, at.inspector.y + at.inspector.h - 3))
  }
  console.log(scheme, "colours", JSON.stringify(colours))
  console.log(scheme, "page errors", errors.length, errors.slice(0, 3))
  await context.close()
}
await browser.close()
