// Epic `editor` P30:  load-to-first-draw and typing latency, Monaco and CodeMirror each alone, on the dev server.
// - Usage:  node p30-measure.mjs [runs]
// - First draw:  the page's start to the editor showing Solitaire.spell drawn bubbly
//   (CodeMirror:  a band in its lines;  Monaco:  a block in its bubbly layer).
// - Typing:  60 letters typed into a step of Solitaire.spell, each from keydown to the frame after (the page's `latencies`).
// - Saves nothing:  every non-GET to /api is answered `{}`, and the page answers its own writes.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const EDITOR = JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url
const RUNS = +(process.argv[2] ?? 3)
const DRAWN = { cm: ".cmb-band", monaco: ".bubbly-layer .bubbly-block" }
const browser = await chromium.launch()
const median = (list) => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)]
const pct = (list, p) => [...list].sort((a, b) => a - b)[Math.min(list.length - 1, Math.floor(list.length * p))]
const results = {}
for (const only of ["cm", "monaco", "cm", "monaco"].slice(0, 2)) {
  const draws = [], ready = [], typing = []
  for (let run = 0; run < RUNS; run++) {
    const context = await browser.newContext({ viewport: { width: 1400, height: 900 } })
    await context.route(/\/api\//, (route) =>
      route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
    )
    const page = await context.newPage()
    await page.goto(`${EDITOR}demo/codemirror.html?only=${only}`, { timeout: 120000 })
    await page.waitForSelector(DRAWN[only], { timeout: 120000, state: "attached" })
    const at = await page.evaluate(() => performance.now())
    draws.push(at)
    ready.push(await page.evaluate(() => window.codemirrorTest.timings.projectReadyAtMsec))
    await page.waitForTimeout(2500)
    // the caret at the end of `restart the game`, in the first handler
    const target = only === "cm" ? ".cm-content" : ".monaco-editor .view-lines"
    const line = page.locator(`${target} >> text=restart the game`).first()
    const box = await line.boundingBox()
    await page.mouse.click(box.x + box.width + 40, box.y + box.height / 2)
    await page.keyboard.press("End")
    await page.evaluate(() => (window.codemirrorTest.latencies.length = 0))
    await page.keyboard.type(" and then shuffle the deck again for luck now", { delay: 60 })
    await page.waitForTimeout(800)
    typing.push(...(await page.evaluate(() => window.codemirrorTest.latencies.slice())))
    await context.close()
  }
  results[only] = {
    firstDrawMsec: Math.round(median(draws)),
    projectReadyMsec: Math.round(median(ready)),
    editorAfterProjectMsec: Math.round(median(draws.map((d, i) => d - ready[i]))),
    typingMedianMsec: +median(typing).toFixed(1),
    typingP95Msec: +pct(typing, 0.95).toFixed(1),
    keys: typing.length
  }
}
console.log(JSON.stringify(results, null, 1))
await browser.close()
