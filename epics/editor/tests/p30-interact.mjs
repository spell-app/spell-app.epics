// Epic `editor` P30:  the CodeMirror test's editing, language service, menu and find, headless.
// - Usage:  node p30-interact.mjs [light|dark] [en|es]
// - Saves nothing:  the page answers its own writes, and every non-GET to /api here is answered `{}` too.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR = JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url
const [scheme = "light", lang = "en"] = process.argv.slice(2)
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1300, height: 900 }, colorScheme: scheme, deviceScaleFactor: 2 })
await context.grantPermissions(["clipboard-read", "clipboard-write"])
await context.route(/\/api\//, (route) =>
  route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
)
const page = await context.newPage()
const errors = []
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && !/Overlapping semantic/.test(m.text()) && errors.push(`${m.type()}: ${m.text().slice(0, 300)}`))
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
await page.goto(`${EDITOR}demo/codemirror.html?only=cm&file=Card&scheme=${scheme}&lang=${lang}`, { timeout: 120000 })
await page.waitForSelector(".cmb-band", { timeout: 120000 })
await page.waitForTimeout(1500)
const tag = `${scheme}${lang === "es" ? "-es" : ""}`
const shot = (name) => page.screenshot({ path: `${OUT}/p30-${name}-${tag}.png` })
const result = {}

/** Offset of `text`'s `nth` match in the doc, plus `plus`. */
const offsetOf = (text, plus = 0) => page.evaluate(([text, plus]) => window.codemirror.view.state.doc.toString().indexOf(text) + plus, [text, plus])
/** The caret at `offset`, the editor focused. */
const caretAt = (offset) => page.evaluate((offset) => { const v = window.codemirror.view; v.focus(); v.dispatch({ selection: { anchor: offset }, scrollIntoView: true }) }, offset)
/** Screen point of `offset`. */
const pointOf = (offset) => page.evaluate((offset) => { const c = window.codemirror.view.coordsAtPos(offset); return { x: (c.left + c.right) / 2 + 2, y: (c.top + c.bottom) / 2 } }, offset)
const lineAt = (offset) => page.evaluate((offset) => window.codemirror.view.state.doc.lineAt(offset).text, offset)

// 1. Enter after a head keeps its body's indent;  after a `:` goes in;  a space after `<action` writes the tag
await caretAt(await offsetOf("to draw its back", "to draw its back".length))
await page.keyboard.press("Enter")
result.enterIndent = JSON.stringify(await lineAt(await page.evaluate(() => window.codemirror.view.state.selection.main.head)))
await page.keyboard.type("<action")
await page.keyboard.type(" ")
await page.waitForTimeout(300)
result.spaceAfterTag = JSON.stringify(await lineAt(await page.evaluate(() => window.codemirror.view.state.selection.main.head)))
await page.waitForTimeout(800)
await shot("typing")
await page.keyboard.press("Escape")
// undo all of it
for (let i = 0; i < 6; i++) await page.keyboard.press("Meta+z")
result.undoneBack = await page.evaluate(() => window.codemirror.view.state.doc.toString() === window.codemirrorTest.project.spellFiles.find((f) => f.path.endsWith("/Card.spell")).contents)
await page.waitForTimeout(600)

// 2. Hover over a name
const rank = await offsetOf("its rank is jack", 5)
const at = await pointOf(rank)
await page.mouse.move(at.x, at.y)
await page.waitForTimeout(1600)
result.hover = await page.evaluate(() => document.querySelector(".cmb-hover")?.textContent.slice(0, 160) ?? "none")
await shot("hover")
await page.mouse.move(5, 5)
await page.waitForTimeout(300)

// 3. Suggestions:  after `its `
await caretAt(await offsetOf("its name should be", 4))
await page.keyboard.press("Control+Space")
await page.waitForTimeout(1200)
result.completions = await page.evaluate(() => [...document.querySelectorAll(".cm-tooltip-autocomplete li")].slice(0, 8).map((li) => li.textContent).join(", "))
await shot("completions")
await page.keyboard.press("Escape")

// 4. A problem:  a line that doesn't parse
await caretAt(await offsetOf("\tits \"symbol\""))
await page.keyboard.type("\tits blorp zork frobnicates\n")
await page.waitForTimeout(2000)
result.problems = await page.evaluate(() => document.querySelectorAll(".cm-lintRange-error, .cm-lintRange-warning").length)
await shot("problem")
for (let i = 0; i < 3; i++) await page.keyboard.press("Meta+z")
await page.waitForTimeout(600)

// 5. Go to definition:  F12 on `face card` in `it is not a face card`
const use = await offsetOf("if it is not a face card", "if it is not a ".length + 2)
await caretAt(use)
await page.keyboard.press("F12")
await page.waitForTimeout(900)
result.definition = await page.evaluate(() => { const v = window.codemirror.view; const { from, to } = v.state.selection.main; return `${v.state.doc.lineAt(from).number}: ${JSON.stringify(v.state.sliceDoc(from, to))}` })

// 6. The right-click menu, on a code value (`card={it}`)
const code = await offsetOf("card={it}", 7)
await caretAt(code)
const point = await pointOf(code)
await page.mouse.click(point.x, point.y, { button: "right" })
await page.waitForTimeout(1200)
result.menu = await page.evaluate(() => [...document.querySelectorAll(".CodeMirrorMenu ui-action:not([kind])")].map((a) => a.textContent.trim()).join(" | "))
await shot("menu")
await page.keyboard.press("Escape")
await page.waitForTimeout(400)

// 7. Find and replace
await page.evaluate(() => window.codemirror.view.focus())
await page.keyboard.press("Meta+f")
await page.keyboard.type("card")
await page.waitForTimeout(600)
result.matches = await page.evaluate(() => document.querySelectorAll(".cm-searchMatch").length)
await shot("find")

console.log(JSON.stringify(result, null, 1))
console.log("errors:", errors.slice(0, 10).join("\n"))
await browser.close()
