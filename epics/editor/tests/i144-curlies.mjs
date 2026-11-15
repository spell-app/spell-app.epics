// Epic `editor` I144 (+ C1):  a drawing's markup with `{…}` code in it, and a `{` typed with no `}`, in the code editor.
// - Usage:  node i144-curlies.mjs [tag] [editorUrl]
// - Saves nothing:  every non-GET to files and prefs is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const TAG = process.argv[2] ?? "after"
const EDITOR =
  process.argv[3] ?? JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url
const TEXT = `a "probe" is an app
\tits "size" is "small"
\tto draw it
\t\t<container columns="7" padding={small" spacing="xs">
\t\t\t<text color="blue">{its size}</text>
\t\t\t<button "OK" onClick={say "hi"} padding={its size} />
\t\t</container>
`
const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1800, height: 900 }, colorScheme: scheme })
  await context.route(/\/api\/(projects\/file|prefs)\//, (route) => {
    if (route.request().method() === "GET") return route.continue()
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  })
  const page = await context.newPage()
  const errors = []
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)))
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
  await page.waitForSelector(".InputEditor .monaco-editor .view-line", { timeout: 90000 })
  await page.waitForTimeout(3000)
  await page.evaluate(() => {
    const { editor } = window
    editor.showEditor(editor.project.spellFiles.find((each) => each.path.endsWith("/Card.spell")).path)
  })
  await page.waitForSelector(".bubbly-monaco .bubbly-layer .bubbly-block", { timeout: 60000 })
  await page.waitForTimeout(2000)
  // edited, then shot before the editor's save (answered `{}`) can read the file back
  await page.evaluate((text) => {
    const code = window.editor.shownCodeEditor
    code.executeEdits("probe", [{ range: code.getModel().getFullModelRange(), text }])
  }, TEXT)
  await page.waitForTimeout(1200)
  const info = await page.evaluate(() => ({
    value: window.editor.shownCodeEditor?.getModel().getValue().slice(0, 30),
    editors: [...document.querySelectorAll(".monaco-editor")].map((each) => each.textContent.slice(0, 30))
  }))
  console.log(JSON.stringify(info))
  const box = await page.locator(".monaco-editor", { hasText: "probe" }).first().boundingBox()
  await page.screenshot({
    path: `${OUT}/I144-editor-${TAG}-${scheme}.png`,
    clip: { x: box.x, y: box.y, width: Math.min(box.width, 900), height: 260 }
  })
  console.log(scheme, "errors:", errors.slice(0, 5))
  await context.close()
}
await browser.close()
