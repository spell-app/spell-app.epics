// Epic `editor` I98:  every Solid dev warning the editor prints, while a run goes through it widely.
// - Standing rule (Owen, 2026-11-14):  after each merge into main, run it, and fix what it finds.
// - Usage:  NODE_PATH=/Users/owen/www/spell/node_modules node solid-warnings.mjs [editorUrl] [--verbose] [--stacks]
//   (default:  this worktree's editor, `.spell-server.editor.json`;  main's:  http://localhost:3001/)
// - Saves nothing:  every non-GET to `/api` and every `.spell` write is answered here (a file's save kept in memory,
//   so the editor reads back what it saved).
// - Drives today's editor (CodeMirror 6, epic `codemirror`;  the top bar of T76 / T83), as the page tests do:
//   the code through `window.editor.shownCodeEditor.view` (app/tests/app/pages/runningEditor.ts, `CodeEditor`).
// - A step that can't find what it needs FAILS LOUDLY:  `STEP FAILED` lines, a list at the end, and exit code 1,
//   so the check can never pass by checking nothing again.
import { createRequire } from "node:module"
import { existsSync, readFileSync } from "node:fs"

const WORKTREE = "/Users/owen/www/spell.worktrees/editor"
const require = createRequire(
  existsSync(`${WORKTREE}/node_modules/playwright`) ? `${WORKTREE}/package.json` : "/Users/owen/www/spell/package.json"
)
const { chromium } = require("playwright")
const args = process.argv.slice(2)
const verbose = args.includes("--verbose")
const EDITOR =
  args.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync(`${WORKTREE}/.spell-server.editor.json`, "utf8")).url

/** The projects it goes through:  its id in the address, and the file to open, if not its first. */
const PROJECTS = [["Solitaire", "Card.spell"], ["TaskList"], ["calculator"]]

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } })
const blocked = []
/**
 * Each file "saved" this run, by its address under `/spaces/`:  read back from here, as the server would have kept it.
 * - Why:  after a save the editor may read the file again (`GET /spaces/<project>/<file>`);  the old text on disk
 *   would put back what was typed, as if the edit were undone.
 */
const saved = new Map()
const SAVE = /\/api\/projects\/file(\/[^?]*)/
await context.route(/\/api\/|\/spaces\/|\.spell(\?.*)?$/, (route) => {
  const request = route.request()
  const { pathname } = new URL(request.url())
  if (request.method() === "GET") {
    const kept = saved.get(pathname.replace(/^\/api\/projects\/file\//, "/spaces/"))
    return kept === undefined ? route.continue() : route.fulfill({ status: 200, contentType: "text/plain", body: kept })
  }
  blocked.push(`${request.method()} ${pathname}`)
  const file = pathname.match(SAVE)?.[1]
  if (file) saved.set(`/spaces${file}`, request.postData() ?? "")
  return route.fulfill({ status: 200, contentType: "application/json", body: file ? "true" : "{}" })
})
// no hot reloads from other sessions' edits mid-run
await context.routeWebSocket(/.*/, () => {})
const page = await context.newPage()
// --stacks:  a stack under each warning without an `at` line, to find where it came from
if (args.includes("--stacks"))
  await page.addInitScript(() => {
    const warn = console.warn
    console.warn = (...parts) => {
      const text = String(parts[0])
      if (/^\[[A-Z_]+\]/.test(text) && !/\n\s*at /.test(text))
        parts[0] = text + "\n" + (new Error().stack ?? "").split("\n").slice(2, 14).join("\n")
      warn(...parts)
    }
  })

/** each warning by its first line, with where the run was when it came */
const found = new Map()
let step = "load"
page.on("console", (message) => {
  if (!["warning", "error"].includes(message.type())) return
  const text = message.text()
  const code = text.match(/^\[([A-Z_]+)\]/)?.[1] ?? (message.type() === "error" ? "console.error" : "console.warn")
  const key = text.split("\n").slice(0, 1).join(" ").slice(0, 220)
  const entry = found.get(key) ?? { code, count: 0, steps: new Set(), text, location: message.location() }
  entry.count++
  entry.steps.add(step)
  found.set(key, entry)
})
page.on("pageerror", (error) => {
  const key = `pageerror: ${error.message}`.slice(0, 220)
  const entry = found.get(key) ?? { code: "pageerror", count: 0, steps: new Set(), text: error.stack ?? error.message }
  entry.count++
  entry.steps.add(step)
  found.set(key, entry)
})

const pause = (ms = 800) => page.waitForTimeout(ms)

/** each step that failed, and why */
const failed = []
/** each step that ran through */
const passed = []
const runStep = async (name, run) => {
  step = name
  try {
    await run()
    passed.push(name)
    console.log(`  ok    ${name}`)
  } catch (error) {
    const why = String(error.message).split("\n")[0]
    failed.push(`${name}:  ${why}`)
    console.log(`  STEP FAILED  ${name}:  ${why}`)
  }
}
/** throw `message` unless `ok` */
const check = (ok, message) => {
  if (!ok) throw new Error(message)
}

////////////////
// ## The code editor, as runningEditor.ts's `CodeEditor` reads it
////////////////

const CODE_LINE = ".InputEditor .cm-editor .cm-line"

/** the code pane's whole text */
const codeText = () =>
  page.evaluate(() => {
    const view = window.editor?.shownCodeEditor?.view
    if (!view) throw new Error("no window.editor.shownCodeEditor.view")
    return view.state.doc.toString()
  })

/** a real click on line `lineNumber`, one character into its first word, scrolled to the middle first */
async function clickLine(lineNumber) {
  const at = await page.evaluate(async (number) => {
    const view = window.editor?.shownCodeEditor?.view
    if (!view) throw new Error("no window.editor.shownCodeEditor.view")
    const line = view.state.doc.line(Math.min(number, view.state.doc.lines))
    const pos = Math.min(line.from + Math.max(0, line.text.search(/\S/)) + 1, line.to)
    view.dispatch({ effects: view.constructor.scrollIntoView(pos, { y: "center" }) })
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    const box = view.coordsAtPos(pos)
    if (!box) throw new Error(`line ${number} isn't drawn`)
    return { x: box.left + 2, y: (box.top + box.bottom) / 2 }
  }, lineNumber)
  await pause(200)
  await page.mouse.click(at.x, at.y)
}

/** the caret's line, from 1 */
const caretLine = () =>
  page.evaluate(() => {
    const { state } = window.editor.shownCodeEditor.view
    return state.doc.lineAt(state.selection.main.head).number
  })

/** a click on line `lineNumber`, then the caret down `steps` lines, one at a time;  checks the caret moved */
async function walkCode(lineNumber, steps) {
  await clickLine(lineNumber)
  const from = await caretLine()
  for (let i = 0; i < steps; i++) {
    await page.keyboard.press("ArrowDown")
    await pause(250)
  }
  const to = await caretLine()
  check(steps === 0 || to > from, `the caret didn't move down (line ${from} => ${to})`)
}

////////////////
// ## The top bar
////////////////

/** a `ui-item` of the bar, clicked where it's drawn (its `[part~=item]`) */
const clickItem = (selector) => page.locator(`${selector} [part~=item]`).first().click({ timeout: 5000 })

/** open the bar menu `menu` (a `ui-item.BarMenu`), check it shows items, then close it */
async function openMenu(menu, label) {
  const item = page.locator(menu).first()
  check(await item.count(), `no menu ${label} (${menu})`)
  await page.locator(`${menu} [part~=item]`).first().click({ timeout: 5000 })
  await pause(700)
  // its popup is the `.BarMenuPopup` for it, its items `ui-action`s (and `ui-submenu`s)
  const shown = await item.evaluate((element) => {
    const popup = document.querySelector(`.BarMenuPopup[for="${element.id}"]`)
    if (!popup?.getBoundingClientRect().height) return 0
    return popup.querySelectorAll("ui-action, ui-submenu, ui-item").length
  })
  check(shown, `menu ${label} opened no items`)
  await page.keyboard.press("Escape")
  await pause(300)
}

/** the menus the bar shows, by their selector and label */
async function barMenus() {
  return page.evaluate(() => {
    const bar = document.querySelector(".AppMenu")
    if (!bar) throw new Error("no .AppMenu bar")
    // a `ui-item` host draws nothing itself:  its `[part~=item]` is what shows
    const drawn = (item) => item.shadowRoot?.querySelector("[part~=item]")?.getBoundingClientRect().width
    const menus = [...bar.querySelectorAll("ui-item.BarMenu")].filter(
      (item) => drawn(item) && !item.closest(".AppBarMenusFolded")
    )
    return menus.map((item, index) => {
      item.dataset.probeMenu = String(index)
      const label = item.querySelector(".ProjectBarLabel")?.textContent ?? item.firstChild?.textContent ?? ""
      return { selector: `[data-probe-menu="${index}"]`, label: label.trim() || `#${index}` }
    })
  })
}

////////////////
// ## The steps
////////////////

/** open a project's file in the editor, and wait for its code */
async function open(project, file) {
  await page.goto(`${EDITOR}edit/@spell/examples/${project}${file ? `/${file}` : ""}`, { timeout: 90000 })
  await page.waitForSelector(CODE_LINE, { timeout: 90000 })
  await pause(3000)
  check((await codeText()).length, "the code pane is empty")
}

/** has the Inspector something picked?  (a part's or a thing's fields, not its "pick something" tip) */
const picked = async () =>
  !(await page.locator(".InspectorCard").first().locator(".InspectorTip").count()) &&
  !!(await page.locator(".InspectorCard").first().locator("ui-input, ui-select, ui-dropdown, ui-checkbox").count())

for (const [project, file] of PROJECTS) {
  await runStep(`${project}:open`, () => open(project, file))
  // its other steps need it open:  one failure, not eight
  if (failed.at(-1)?.startsWith(`${project}:open:`)) {
    failed.push(`${project}:  every other step skipped, as it didn't open`)
    continue
  }
  await runStep(`${project}:walk code`, () => walkCode(1, 40))
  await runStep(`${project}:inspect`, async () => {
    // the crosshairs, then a click on something the app drew:  the Inspector shows what was picked
    if ((await page.locator(".InspectAppButton").first().getAttribute("aria-pressed")) !== "true")
      await clickItem(".ModeTabs .InspectAppButton")
    await pause(1000)
    check(await page.locator(".InspectorPane").count(), "no Inspector after the crosshairs")
    const box = await page.locator(".AppPaneProgram").first().boundingBox()
    check(box, "no app drawn (.AppPaneProgram)")
    // a few places, till one picks something:  an app's background may pick nothing
    for (const [x, y] of [[1 / 3, 1 / 3], [0.1, 0.2], [0.15, 0.4], [0.5, 0.1]]) {
      await page.mouse.click(box.x + box.width * x, box.y + box.height * y)
      await pause(1500)
      if (await picked()) break
    }
    check(await picked(), "picking in the app selected nothing (the Inspector still shows its tip)")
  })
  await runStep(`${project}:property editor`, async () => {
    // a field of what's picked:  focused, then left alone
    const field = page
      .locator(".InspectorCard")
      .first()
      .locator("ui-input, ui-select, ui-dropdown")
      .filter({ visible: true })
      .first()
    check(await field.count(), "no property field in the Inspector")
    await field.click({ timeout: 3000 })
    await pause(400)
    await page.keyboard.press("Escape")
    await pause(300)
  })
  await runStep(`${project}:palette`, async () => {
    await clickItem(".ModeTabs .AddPartButton")
    await pause(1000)
    check(await page.locator(".PalettePopup:not([hidden]) .PaletteGroup").count(), "the + palette showed nothing")
    await page.keyboard.press("Escape")
    await pause(400)
  })
  await runStep(`${project}:menus`, async () => {
    const menus = await barMenus()
    const labels = menus.map((menu) => menu.label)
    for (const wanted of ["Spell", "File", "Edit", "View", "Run", "Help"])
      check(labels.includes(wanted), `no ${wanted} menu in the bar (has:  ${labels.join(", ")})`)
    check(
      await page.locator(".AppMenu .ProjectBarMenu .ProjectBarLabel").filter({ hasText: /\S/ }).count(),
      "no project menu, titled, in the bar"
    )
    const empty = []
    for (const { selector, label } of menus) await openMenu(selector, label).catch((error) => empty.push(error.message))
    check(!empty.length, empty.join(";  "))
  })
  await runStep(`${project}:compiled code`, async () => {
    // the top bar's compiled-code button (T76), its languages' tabs, a walk through the code beside it, then off
    const button = page.locator(".ModeTabs .CompiledCodeToggle").first()
    check(await button.count(), "no compiled-code button in the bar")
    if ((await button.getAttribute("aria-pressed")) !== "true") await clickItem(".ModeTabs .CompiledCodeToggle")
    await page.waitForSelector(".CodeOutputPane", { timeout: 10000 })
    await pause(1500)
    for (const language of ["TypeScript", "Python", "JavaScript"]) {
      await page.locator(".CodeOutputPane ui-item").filter({ hasText: language }).first().click({ timeout: 3000 })
      await pause(1500)
      check(await page.locator(".CodeOutputCode .cm-line").count(), `no compiled ${language} drawn`)
    }
    await walkCode(3, 5)
    await clickItem(".ModeTabs .CompiledCodeToggle")
    await pause(1500)
    check((await button.getAttribute("aria-pressed")) === "false", "the compiled code didn't hide")
  })
  await runStep(`${project}:type`, async () => {
    // at the end of the first line of code after the first (not a comment or heading, not blank)
    const before = await codeText()
    const lineNumber = before.split("\n").findIndex((line, index) => index && /\S/.test(line) && !/^\s*(--|\/\/|#)/.test(line)) + 1
    check(lineNumber > 0, "no line of code to type in")
    await clickLine(lineNumber)
    await page.evaluate((at) => {
      const { view } = window.editor.shownCodeEditor
      view.dispatch({ selection: { anchor: view.state.doc.line(at).to } })
      view.focus()
    }, lineNumber)
    await page.keyboard.type(" x", { delay: 60 })
    await pause(3000)
    check((await codeText()) !== before, "typing changed nothing")
    await page.keyboard.press("Backspace")
    await page.keyboard.press("Backspace")
    await pause(3000)
    check((await codeText()) === before, "the code didn't come back after two backspaces")
  })
  await runStep(`${project}:run mode`, async () => {
    const selected = () => page.locator(".ModeTabs > ui-item[selected]").first().getAttribute("title")
    await page.locator(".ModeTabs > ui-item[title=Run]").first().click({ timeout: 3000 })
    await pause(2500)
    check((await selected()) === "Run", `Run mode didn't take (selected:  ${await selected()})`)
    await page.locator(".ModeTabs > ui-item[title=Edit]").first().click({ timeout: 3000 })
    await pause(2000)
    check((await selected()) === "Edit", `Edit mode didn't come back (selected:  ${await selected()})`)
  })
}

await browser.close()

const entries = [...found.values()]
const byCode = {}
for (const entry of entries) byCode[entry.code] = (byCode[entry.code] ?? 0) + entry.count
console.log(`\n${entries.length} distinct, ${entries.reduce((sum, e) => sum + e.count, 0)} in all:`, byCode)
for (const entry of entries.sort((a, b) => a.code.localeCompare(b.code))) {
  const lines = entry.text.split("\n")
  const at = lines.find((line) => /^\s*at /.test(line))?.trim() ?? ""
  console.log(`\n[${entry.code}] x${entry.count}  (${[...entry.steps].join(", ")})`)
  console.log(verbose ? entry.text : `  ${lines[0].slice(0, 200)}\n  ${(lines[1] ?? "").trim().slice(0, 200)}\n  ${at}`)
}
if (blocked.length) console.log(`\nblocked ${blocked.length} writes`)
console.log(`\n${passed.length} steps ran, ${failed.length} failed`)
if (failed.length) {
  console.log("STEPS FAILED -- the check didn't run them, so it can't say they're clean:")
  for (const line of failed) console.log(`  - ${line}`)
  process.exitCode = 1
}
