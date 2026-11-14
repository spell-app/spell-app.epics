// Epic `editor` T71:  Format Document re-indents a drawing by structure.
// - Solitaire.spell open, its drawing's lines all at its first line's indent:  Format Document lays it out as a tree
//   again, as Solitaire writes it, and the caret stays in the word it was in.
// - Usage:  node t71-format-document.mjs [editorUrl]
// - Saves nothing:  every non-GET to /api/projects/file/ and /api/prefs/ is answered `{}`.
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
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire/Solitaire.spell`, { timeout: 90000 })
  await editorShown()

  /** Run `step` in the page on Solitaire's editor, again if the dev server reloads the page meanwhile. */
  const inEditor = async (step, arg) => {
    for (let tries = 0; ; tries++) {
      try {
        return await page.evaluate(
          async ({ step, arg }) => {
            const editor = window.monaco.editor
              .getEditors()
              .filter((it) => /Solitaire\.spell$/.test(it.getModel()?.uri.path ?? ""))
              .sort((a, b) => b.getModel().getLineCount() - a.getModel().getLineCount())[0]
            return await new Function("editor", "arg", `return (async () => { ${step} })()`)(editor, arg)
          },
          { step, arg }
        )
      } catch (error) {
        if (tries > 3 || !/context was destroyed/.test(error.message)) throw error
        await page.waitForLoadState("load")
        await editorShown()
      }
    }
  }
  const shot = async (name) => {
    const box = await page.locator(".monaco-editor").first().boundingBox()
    await page.screenshot({
      path: `${OUT}/t71-${name}-${scheme}.png`,
      clip: { x: box.x, y: box.y, width: Math.min(box.width, 1000), height: Math.min(box.height, 560) }
    })
  }
  const check = (what, ok, detail) => {
    if (!ok) failed++
    console.log(scheme, ok ? "OK  " : "FAIL", what, JSON.stringify(detail ?? ""))
  }

  // flatten the drawing:  every line of it at its first line's indent, the caret inside `stock-pile`
  const laidOut = await inEditor(`
    const model = editor.getModel()
    const text = model.getValue()
    const lines = model.getLinesContent()
    const from = lines.findIndex((it) => it.includes('<deck "deck"'))
    const to = lines.findIndex((it) => it.includes("</context-menu>"))
    const edits = []
    for (let at = from + 1; at <= to; at++) {
      const indent = /^\\s*/.exec(lines[at])[0].length
      edits.push({ range: new monaco.Range(at + 1, 1, at + 1, indent + 1), text: "\\t\\t" })
    }
    editor.executeEdits("probe", edits)
    const stock = model.getLinesContent().findIndex((it) => it.includes("<stock-pile"))
    editor.focus()
    editor.setPosition({ lineNumber: stock + 1, column: model.getLineContent(stock + 1).indexOf("pile") + 1 })
    editor.revealLineNearTop(from)
    return text
  `)
  await page.waitForTimeout(1500)
  await shot("before")
  await inEditor(`await editor.getAction("editor.action.formatDocument").run()`)
  await page.waitForTimeout(1500)
  const after = await inEditor(`
    const { lineNumber, column } = editor.getPosition()
    const line = editor.getModel().getLineContent(lineNumber)
    return { text: editor.getModel().getValue(), word: line.slice(column - 1, column + 3), line: line.trim() }
  `)
  const changed = laidOut
    .split("\n")
    .map((line, index) => [index + 1, line, after.text.split("\n")[index]])
    .filter(([, was, now]) => was !== now)
  // its drawing laid out as written;  the rest only what the formatter does to Solitaire anyway (a trailing space ...)
  const drawingLines = changed.filter(([, was]) => /^\s*</.test(was))
  check("the drawing is laid out as a tree again", drawingLines.length === 0, drawingLines.slice(0, 4))
  check("the caret stays in its word", after.word === "pile" && after.line.startsWith("<stock-pile"), after.word)
  await shot("after")
  await context.close()
}
await browser.close()
process.exit(failed ? 1 : 0)
