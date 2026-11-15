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
  const context = await browser.newContext({ viewport: { width: 1800, height: 900 }, colorScheme: scheme, deviceScaleFactor: 2 })
  await context.route(/\/api\/(projects\/file|prefs)\//, async (route) => {
    // Card.spell read as the sample, so the editor shows it as the file
    if (route.request().method() === "GET" && /Card\.spell/.test(route.request().url())) {
      const response = await route.fetch()
      const body = await response.text()
      console.log("GET", route.request().url(), body.slice(0, 120))
      return route.fulfill({ response, body: body.startsWith("{") ? body : TEXT })
    }
    if (route.request().method() === "GET") return route.continue()
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  })
  const page = await context.newPage()
  const errors = []
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)))
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire?scheme=${scheme}`, { timeout: 90000 })
  await page.waitForSelector(".InputEditor .monaco-editor .view-line", { timeout: 90000 })
  await page.waitForTimeout(3000)
  await page.evaluate(() => {
    const { editor } = window
    editor.showEditor(editor.project.spellFiles.find((each) => each.path.endsWith("/Card.spell")).path)
  })
  await page.waitForSelector(".bubbly-layer > *", { timeout: 90000, state: "attached" })
  await page.waitForTimeout(2000)
  // edited, then shot before the file is read back (about half a second on):  the layout follows an edit in 300 msec;
  // again till the drawing shows it
  for (let tries = 0; tries < 8; tries++) {
    await page.evaluate((text) => {
      const card = window.editor.project.spellFiles.find((each) => each.path.endsWith("/Card.spell"))
      card.contents = text
    }, TEXT)
    await page.waitForTimeout(380)
    const drawn = await page.evaluate(
      () =>
        !!document.querySelector(".bubbly-monaco .view-line .bubbly-code-brace") &&
        /probe/.test(document.querySelector(".monaco-editor")?.textContent ?? "")
    )
    if (drawn) break
    await page.waitForTimeout(1500)
  }
  if (process.env.DEBUG)
    console.log(
      await page.evaluate(() =>
        [...document.querySelectorAll(".view-line span")]
          .filter((each) => /[{}]/.test(each.textContent) && !each.children.length)
          .map((each) => `${each.textContent} ${each.className} ${getComputedStyle(each).color}`)
          .join("\n")
      )
    )
  const box = await page.locator(".monaco-editor", { hasText: "probe" }).first().boundingBox({ timeout: 2000 })
  await page.screenshot({
    path: `${OUT}/I144-editor-${TAG}-${scheme}.png`,
    clip: { x: box.x, y: box.y, width: Math.min(box.width, 900), height: 210 }
  })
  console.log(scheme, "errors:", errors.slice(0, 5))
  await context.close()
}
await browser.close()
