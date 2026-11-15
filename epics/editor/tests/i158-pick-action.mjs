// Epic `editor` I158:  inspect, click Solitaire's Cheat button:  `<action "cheat" />` is selected, the caret on its line.
// - Usage:  node i158-pick-action.mjs [tag] [editorUrl]
// - Saves nothing:  every non-GET to files and prefs is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const TAG = process.argv[2] ?? "after"
const EDITOR =
  process.argv[3] ?? JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1500, height: 1000 }, colorScheme: "dark" })
await context.route(/\/api\/(projects\/file|prefs)\//, (route) => {
  if (route.request().method() === "GET") return route.continue()
  return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
})
const page = await context.newPage()
const errors = []
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)))
await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
await page.waitForSelector(".InputEditor .monaco-editor .view-line", { timeout: 90000 })
await page.waitForTimeout(4000)
await page.evaluate(() => {
  const { editor } = window
  editor.showEditor(editor.project.spellFiles.find((each) => each.path.endsWith("/Solitaire.spell")).path)
})
await page.waitForTimeout(1500)
if (!(await page.evaluate(() => !!document.querySelector(".InspectAppButton.inspecting")))) {
  await page.locator(".InspectAppButton [part~=item]").first().click({ force: true })
}
await page.waitForTimeout(1500)
const path = await page.evaluate(() => {
  const find = (root) => {
    for (const el of root.querySelectorAll("*")) {
      if (/^\s*cheat\s*$/i.test(el.textContent ?? "") && /button|action/.test(el.localName)) return el
      if (el.shadowRoot) {
        const inner = find(el.shadowRoot)
        if (inner) return inner
      }
    }
  }
  const el = find(document.querySelector(".AppPaneBody"))
  window.__cheat = el
  const chain = []
  for (let at = el; at; at = at.parentElement ?? at.getRootNode().host) {
    chain.push(`${at.localName}${at.getAttribute("data-spell-at") ? "@" + at.getAttribute("data-spell-at") : ""}`)
    if (at.classList?.contains("AppPaneBody")) break
  }
  const box = el.getBoundingClientRect()
  return { chain, x: box.x + box.width / 2, y: box.y + box.height / 2 }
})
console.log("cheat:", path.chain.join(" < "))
await page.mouse.click(path.x, path.y)
await page.waitForTimeout(2000)
const state = await page.evaluate(() => {
  const { editor, Inspector } = window
  const code = editor.shownCodeEditor
  const position = code?.getPosition()
  return {
    selected: Inspector.allSelected.map(({ element, label }) => `${element.localName} ${label ?? ""}`),
    followed: editor.followed,
    file: editor.file?.file,
    caret: position && { line: position.lineNumber, text: code.getModel().getLineContent(position.lineNumber).trim() },
    marks: document.querySelectorAll(".InputEditor .FollowedLine").length,
    focus: code?.hasTextFocus()
  }
})
console.log(JSON.stringify(state, null, 1))
await page.screenshot({ path: `${OUT}/i158-${TAG}.png` })
console.log("errors:", errors.slice(0, 5))
await browser.close()
