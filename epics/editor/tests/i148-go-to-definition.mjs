// Epic `editor` I148:  Go to Definition in a drawing.
// - 1. F12 on `<stock-pile "stock"/>`:  the caret lands on `a "stock pile" is a pile`, in the same file.
// - 2. F12 on `suit` in `<foundation "clubs" suit=clubs/>`:  on the foundation's `its "suit" is a card suit`.
// - 3. F12 on `spacing` in `spacing="xs"`, Spell UI's:  its help, in a hover at the caret, not "No definition found".
// - Usage:  node i148-go-to-definition.mjs [editorUrl]
// - Saves nothing:  every non-GET to the API is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv[2] ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

const browser = await chromium.launch()
let failed = 0
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1400, height: 820 }, colorScheme: scheme })
  await context.route(/\/api\/(projects\/file|prefs)\//, (route) => {
    if (route.request().method() === "GET") return route.continue()
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  })
  const page = await context.newPage()
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire/Solitaire.spell`, { timeout: 90000 })
  const editorShown = async () => {
    await page.waitForFunction(
      () => window.monaco?.editor.getEditors().some((it) => /Solitaire\.spell$/.test(it.getModel()?.uri.path ?? "")),
      null,
      { timeout: 90000 }
    )
    await page.evaluate((scheme) => {
      document.documentElement.style.colorScheme = scheme
      document.documentElement.style.setProperty("--ui-scheme", scheme)
    }, scheme)
    await page.waitForTimeout(2500)
  }
  await editorShown()

  /** Put the caret inside `word` on the first line saying `line`, run Go to Definition;  where the caret lands. */
  const goToDefinition = async (line, word) => {
    for (let tries = 0; ; tries++) {
      try {
        return await goToDefinitionOnce(line, word)
      } catch (error) {
        // the dev server reloads the page as other sessions edit the worktree:  wait for it, try again
        if (tries > 3 || !/context was destroyed/.test(error.message)) throw error
        await page.waitForLoadState("load")
        await editorShown()
      }
    }
  }
  const goToDefinitionOnce = (line, word) =>
    page.evaluate(
      async ({ line, word }) => {
        const editor = window.monaco.editor
          .getEditors()
          .filter((it) => /Solitaire\.spell$/.test(it.getModel()?.uri.path ?? ""))
          .sort((a, b) => b.getModel().getLineCount() - a.getModel().getLineCount())[0]
        const model = editor.getModel()
        const lines = model.getLinesContent()
        const at = lines.findIndex((it) => it.includes(line))
        const column = lines[at].indexOf(word, lines[at].indexOf(line)) + 2
        editor.focus()
        editor.setPosition({ lineNumber: at + 1, column })
        editor.revealLineInCenter(at + 1)
        editor.trigger("probe", "editor.action.revealDefinition", null)
        await new Promise((resolve) => setTimeout(resolve, 900))
        const { lineNumber } = editor.getPosition()
        return { from: at + 1, to: lineNumber, text: model.getLineContent(lineNumber).trim() }
      },
      { line, word }
    )
  const shot = async (name) => {
    const box = await page.locator(".monaco-editor").first().boundingBox()
    await page.screenshot({
      path: `${OUT}/i148-${name}-${scheme}.png`,
      clip: { x: box.x, y: box.y, width: Math.min(box.width, 900), height: Math.min(box.height, 520) }
    })
  }
  const check = (what, ok, detail) => {
    if (!ok) failed++
    console.log(scheme, ok ? "OK  " : "FAIL", what, JSON.stringify(detail))
  }

  const tag = await goToDefinition('<stock-pile "stock"', "stock-pile")
  check("<stock-pile> goes to its type", /^a "stock pile" is a pile/.test(tag.text), tag)
  await shot("tag")
  const attribute = await goToDefinition('<foundation "clubs" suit=clubs', "suit")
  check("suit= goes to its property", /^its "suit" is a card suit/.test(attribute.text), attribute)
  const help = await goToDefinition('spacing="xs"', "spacing")
  await page.waitForTimeout(1200)
  const hover = await page.evaluate(() =>
    [...document.querySelectorAll(".monaco-hover:not(.hidden)")].map((it) => it.textContent).join(" | ")
  )
  const message = await page.evaluate(() => document.querySelector(".monaco-editor-overlaymessage")?.textContent ?? "")
  check("spacing shows its help, in place", help.to === help.from && /spacing/.test(hover) && !/No definition/.test(message), {
    ...help,
    hover: hover.slice(0, 160),
    message
  })
  await shot("spacing")
  await context.close()
}
await browser.close()
process.exit(failed ? 1 : 0)
