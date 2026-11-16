// Epic `editor` T93:  the top bar's hat and "Spell" -- the drawn gap between the hat's glyph and the word's first letter,
// and the word's weight, beside the loading screen's;  light and dark shots.
// - Usage:  node t93-wordmark.mjs <before | after> [editorUrl]
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const STAGE = process.argv[2] ?? "after"
const EDITOR =
  process.argv.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 860 }, deviceScaleFactor: 2 })
  await context.route(/\/api\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
  await page.waitForSelector(".AppMarkLabel", { timeout: 90000 })
  await page.waitForTimeout(3000)
  if (scheme === "dark")
    await page.evaluate(() => {
      document.documentElement.classList.replace("ui-light", "ui-dark")
      document.documentElement.style.colorScheme = "dark"
    })
  await page.waitForTimeout(500)
  const box = await page.locator(".AppMarkLabel").first().boundingBox()
  const shot = await page.screenshot({ clip: { x: box.x, y: box.y, width: box.width, height: box.height }, scale: "css" })
  // the drawn gap:  columns with no ink between the hat's and the word's
  const gap = await page.evaluate(async (data) => {
    const image = new Image()
    image.src = `data:image/png;base64,${data}`
    await image.decode()
    const canvas = new OffscreenCanvas(image.width, image.height)
    const context = canvas.getContext("2d")
    context.drawImage(image, 0, 0)
    const pixels = context.getImageData(0, 0, image.width, image.height).data
    const at = (x, y) => [...pixels.slice((y * image.width + x) * 4, (y * image.width + x) * 4 + 3)]
    const ground = at(0, 0)
    const inked = (x) => {
      for (let y = 0; y < image.height; y++) {
        const p = at(x, y)
        if (Math.abs(p[0] - ground[0]) + Math.abs(p[1] - ground[1]) + Math.abs(p[2] - ground[2]) > 90) return true
      }
      return false
    }
    const columns = Array.from({ length: image.width }, (_, x) => inked(x))
    const hatEnd = columns.indexOf(false, columns.indexOf(true))
    const wordStart = columns.indexOf(true, hatEnd)
    // each piece's drawn top and bottom:  the hat's columns, and the word's first letter's ("S", no descender)
    const rowsOf = (from, to) => {
      let top = image.height
      let bottom = -1
      for (let x = from; x < to; x++)
        for (let y = 0; y < image.height; y++) {
          const p = at(x, y)
          if (Math.abs(p[0] - ground[0]) + Math.abs(p[1] - ground[1]) + Math.abs(p[2] - ground[2]) > 90) {
            top = Math.min(top, y)
            bottom = Math.max(bottom, y)
          }
        }
      return { top, bottom, centre: (top + bottom + 1) / 2 }
    }
    const hatStart = columns.indexOf(true)
    const letterEnd = columns.indexOf(false, wordStart) > 0 ? Math.min(columns.indexOf(false, wordStart), wordStart + 9) : wordStart + 9
    const hat = rowsOf(hatStart, hatEnd)
    const letter = rowsOf(wordStart, letterEnd)
    return { hatEnd, wordStart, gap: wordStart - hatEnd, hat, letter, centreOff: hat.centre - letter.centre }
  }, shot.toString("base64"))
  const word = await page.evaluate(() => {
    const style = getComputedStyle(document.querySelector(".AppMarkLabel"))
    return { weight: style.fontWeight, family: style.fontFamily.slice(0, 40), tracking: style.letterSpacing }
  })
  console.log(scheme, "drawn gap", JSON.stringify(gap), "word", JSON.stringify(word))
  await page.screenshot({ path: `${OUT}/t93-${STAGE}-${scheme}.png`, clip: { x: 0, y: 0, width: 360, height: 38 } })
  await context.close()
}
await browser.close()
