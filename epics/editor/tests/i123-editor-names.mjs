// Epic `editor` I123:  a name the editor fills, renamed in its own Spell, is never silent.
// - 1. SpellEditor.spell open in the code editor, `code is showing` renamed in what's served to the page only:
//      the squiggle and its message, on hover (and the load's notice above it).
// - 2. The editor loading a Spell with the name renamed (its compiled module rewritten as it's served):  ONE notice.
// - Usage:  node i123-editor-names.mjs [editorUrl]
// - Saves nothing:  every non-GET to the API is answered `{}`, so SpellEditor.spell (Owen's, edited live) is never written.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv[2] ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

const browser = await chromium.launch()
let saves = 0
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1400, height: 820 }, colorScheme: scheme })
  await context.route(/\/api\//, (route) => {
    if (route.request().method() === "GET") return route.continue()
    saves++
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  })
  await context.routeWebSocket(/.*/, () => {})

  //////
  // 1. The squiggle
  //////
  const page = await context.newPage()
  // the Spell as if `code is showing` were renamed and saved:  its text and its compiled module, as they're served
  await page.route(/SpellEditor\.spell/, async (route) => {
    const response = await route.fetch()
    const body = (await response.text()).replace(/(?<!compiled )code is showing/g, "code showing").replaceAll("codeIsShowing", "codeShowing")
    return route.fulfill({ response, body })
  })
  const scheme_ = async () =>
    page.evaluate((scheme) => {
      document.documentElement.style.colorScheme = scheme
      document.documentElement.style.setProperty("--ui-scheme", scheme)
    }, scheme)
  await page.goto(`${EDITOR}edit/@spell/editor/spell-editor`, { timeout: 90000 })
  await page.waitForSelector(".ModeButtons", { timeout: 90000 })
  await page.waitForFunction(() => window.monaco?.editor.getModels().some((m) => /SpellEditor\.spell/.test(m.uri.path)), null, {
    timeout: 60000
  })
  await scheme_()
  await page.waitForTimeout(1500)
  await page.waitForFunction(
    () => window.monaco.editor.getModelMarkers({}).some((marker) => marker.source === "host names"),
    null,
    { timeout: 20000 }
  )
  const markers = await page.evaluate(() =>
    window.monaco.editor
      .getModelMarkers({})
      .filter((marker) => marker.source === "host names")
      .map(({ startLineNumber, startColumn, endColumn, message }) => ({ startLineNumber, startColumn, endColumn, message }))
  )
  console.log(scheme, "markers", JSON.stringify(markers, null, 1))
  // show the app's line, the squiggle under its name, and hover it for the message
  const code = page.locator(".monaco-editor").first()
  await page.evaluate(() => {
    const editor = window.monaco.editor.getEditors().find((it) => /SpellEditor\.spell/.test(it.getModel()?.uri.path ?? ""))
    editor.revealLineNearTop(1)
    editor.setPosition({ lineNumber: 7, column: 3 })
  })
  await page.waitForTimeout(800)
  // hover the squiggle, under the app's name on line 7
  const at = await page.evaluate(() => {
    const editor = window.monaco.editor.getEditors().find((it) => /SpellEditor\.spell/.test(it.getModel()?.uri.path ?? ""))
    const rect = editor.getDomNode().getBoundingClientRect()
    const spot = editor.getScrolledVisiblePosition({ lineNumber: 7, column: 4 })
    return { x: rect.left + spot.left, y: rect.top + spot.top + spot.height / 2 }
  })
  await page.mouse.move(at.x, at.y)
  await page.mouse.move(at.x + 2, at.y)
  await page.waitForTimeout(1500)
  const box = await code.boundingBox()
  await page.screenshot({ path: `${OUT}/i123-squiggle-${scheme}.png`, clip: { x: box.x, y: box.y, width: Math.min(box.width, 820), height: 360 } })
  await page.close()

  //////
  // 2. The load's notice:  the editor's Spell served with `code is showing` renamed, as if published so
  //////
  const loading = await context.newPage()
  await loading.route(/SpellEditor\.spell/, async (route) => {
    const response = await route.fetch()
    const body = (await response.text()).replaceAll("codeIsShowing", "codeShowing")
    return route.fulfill({ response, body })
  })
  await loading.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
  await loading.waitForSelector(".ModeButtons", { timeout: 90000 })
  await loading.evaluate((scheme) => {
    document.documentElement.style.colorScheme = scheme
    document.documentElement.style.setProperty("--ui-scheme", scheme)
  }, scheme)
  await loading.waitForFunction(() => window.editor?.error, null, { timeout: 30000 })
  await loading.waitForTimeout(1200)
  console.log(scheme, "notice:", JSON.stringify(await loading.evaluate(() => window.editor.error.message)))
  await loading.screenshot({ path: `${OUT}/i123-notice-${scheme}.png`, clip: { x: 0, y: 0, width: 1400, height: 320 } })
  await loading.close()
  await context.close()
}
console.log("writes faked:", saves)
await browser.close()
