// Epic `editor` T74:  "Make it code" from the light bulb on a tag's quoted value, then `"` typed after `{` back to text.
// - Usage:  node t74-code-or-text.mjs [editorUrl]
// - Saves nothing:  every non-GET to files and prefs is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv[2] ?? JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url
const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1500, height: 900 }, colorScheme: scheme, deviceScaleFactor: 2 })
  await context.route(/\/api\/(projects\/file|prefs)\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  const errors = []
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)))
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire?scheme=${scheme}`, { timeout: 90000 })
  await page.waitForSelector(".InputEditor .monaco-editor .view-line", { timeout: 90000 })
  await page.waitForTimeout(3000)
  await page.evaluate(() => window.editor.showEditor(window.editor.project.spellFiles.find((f) => f.path.endsWith("/Card.spell")).path))
  await page.waitForTimeout(3000)
  // the caret in a quoted attribute value:  the first `="` in a tag
  const where = await page.evaluate(() => {
    const code = window.monaco?.editor.getEditors?.().find((e) => /Card\.spell/.test(e.getModel()?.uri.path ?? ""))
    return code ? null : "no window.monaco"
  })
  const found = await page.evaluate(async () => {
    const { monaco } = await import("/src/app/ui/monaco/monaco.ts")
    const code = monaco.editor.getEditors().find((e) => /Card\.spell/.test(e.getModel()?.uri.path ?? ""))
    const model = code.getModel()
    const line = model.getLinesContent().findIndex((l) => /<[\w-]+[^>]*="/.test(l) && !/<action/.test(l))
    const text = model.getLineContent(line + 1)
    const column = text.indexOf('="') + 4
    code.focus()
    code.setPosition({ lineNumber: line + 1, column })
    code.revealLineInCenter(line + 1)
    window.__code = code
    return { line: line + 1, text }
  })
  console.log(scheme, where, found)
  await page.waitForTimeout(1500)
  const bulb = page.locator(".lightBulbWidget, .lightBulbWidget .codicon").first()
  const hasBulb = await bulb.isVisible().catch(() => false)
  await page.evaluate(() => window.__code.trigger("probe", "editor.action.codeAction", {}))
  await page.waitForTimeout(1200)
  const menu = await page.evaluate(() =>
    [...document.querySelectorAll(".action-widget .action-label, .action-widget .title")].map((e) => e.textContent).join(" | ")
  )
  console.log(scheme, "bulb:", hasBulb, "menu:", menu)
  const box = await page.locator(".InputEditor .monaco-editor").first().boundingBox()
  await page.screenshot({ path: `${OUT}/T74-menu-${scheme}.png`, clip: { x: box.x, y: box.y, width: Math.min(box.width, 1000), height: Math.min(box.height, 700) } })
  // choose it
  await page.keyboard.press("Enter")
  await page.waitForTimeout(800)
  const after = await page.evaluate((line) => window.__code.getModel().getLineContent(line), found.line)
  console.log(scheme, "after Make it code:", after)
  // and back by typing `"` right after its `{`
  await page.evaluate((line) => {
    const text = window.__code.getModel().getLineContent(line)
    window.__code.setPosition({ lineNumber: line, column: text.indexOf("={") + 3 })
    window.__code.focus()
  }, found.line)
  await page.keyboard.type('"')
  await page.waitForTimeout(600)
  console.log(scheme, 'after typing ":', await page.evaluate((line) => window.__code.getModel().getLineContent(line), found.line))
  await page.screenshot({ path: `${OUT}/T74-typed-${scheme}.png`, clip: { x: box.x, y: box.y, width: Math.min(box.width, 1000), height: Math.min(box.height, 700) } })
  console.log(scheme, "errors:", errors.slice(0, 4))
  await context.close()
}
await browser.close()
