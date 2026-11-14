// Epic `editor` I98:  every Solid dev warning the editor prints, while a run goes through it widely.
// - Standing rule (Owen, 2026-11-14):  after each merge into main, run it, and fix what it finds.
// - Usage:  node solid-warnings.mjs [editorUrl] [--verbose]
//   (default:  this worktree's editor, `.spell-server.editor.json`;  main's:  http://localhost:3001/)
// - Saves nothing:  every non-GET to files, prefs, drafts and `.spell` is answered `{}` here.
import { createRequire } from "node:module"
import { readFileSync } from "node:fs"

const require = createRequire("/Users/owen/www/spell.worktrees/editor/package.json")
const { chromium } = require("playwright")
const args = process.argv.slice(2)
const verbose = args.includes("--verbose")
const EDITOR =
  args.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } })
const blocked = []
await context.route(/\/api\/(projects\/file|prefs|projects\/drafts)\/|\.spell(\?.*)?$/, (route) => {
  if (route.request().method() === "GET") return route.continue()
  blocked.push(`${route.request().method()} ${new URL(route.request().url()).pathname}`)
  return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
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
const tryStep = async (name, run) => {
  step = name
  try {
    await run()
  } catch (error) {
    console.log(`  (step ${name} failed:  ${String(error.message).split("\n")[0]})`)
  }
}

/** open a project's file in the editor, and wait for its code */
async function open(project, file) {
  await page.goto(`${EDITOR}edit/@spell/examples/${project}${file ? `/${file}` : ""}`, { timeout: 90000 })
  await page.waitForSelector(".InputEditor .monaco-editor .view-line", { timeout: 90000 })
  await pause(3000)
}

/** click the bar menu titled `title`, then close it */
async function openMenu(title) {
  await page.locator("ui-menu.AppMenu").getByText(title, { exact: true }).first().click({ timeout: 3000 })
  await pause(600)
  await page.keyboard.press("Escape")
  await pause(300)
}

/** a click in the code at `lineNumber`, then the cursor down `steps` lines, one at a time */
async function walkCode(lineNumber, steps) {
  const at = await page.evaluate((line) => {
    const code = window.editor.shownCodeEditor
    code.revealLineInCenter(line)
    const place = code.getScrolledVisiblePosition({ lineNumber: line, column: 1 })
    const box = code.getDomNode().getBoundingClientRect()
    return { x: box.x + place.left + 60, y: box.y + place.top + 8 }
  }, lineNumber)
  await page.mouse.click(at.x, at.y)
  for (let i = 0; i < steps; i++) {
    await page.keyboard.press("ArrowDown")
    await pause(250)
  }
}

for (const [project, file] of [
  ["Solitaire", "Card.spell"],
  ["TaskList"],
  ["calculator"]
]) {
  await tryStep(`${project}:open`, () => open(project, file))
  await tryStep(`${project}:walk code`, () => walkCode(1, 40))
  await tryStep(`${project}:inspect`, async () => {
    if (!(await page.evaluate(() => !!document.querySelector(".InspectAppButton.inspecting"))))
      await page.locator(".InspectAppButton [part~=item]").first().click({ force: true, timeout: 3000 })
    await pause(1000)
    // a click on something the app drew, then each Inspector card's header
    const frame = page.locator(".RunnerFrame, iframe, .AppPane").first()
    const box = await frame.boundingBox()
    if (box) await page.mouse.click(box.x + box.width / 3, box.y + box.height / 3)
    await pause(1500)
  })
  await tryStep(`${project}:property editor`, async () => {
    // a field's reset and code buttons, if any show
    const field = page.locator("ui-property-editor input, ui-property-editor ui-input").first()
    if (await field.count()) {
      await field.click({ timeout: 2000 })
      await pause(400)
      await page.keyboard.press("Escape")
    }
  })
  await tryStep(`${project}:menus`, async () => {
    for (const title of [project, "File", "Edit", "View", "Run", "Help"]) await openMenu(title).catch(() => console.log(`  (no menu ${title})`))
  })
  await tryStep(`${project}:compiled code`, async () => {
    // View › Compiled Code, its languages' tabs, a walk through the code beside it, then View › Compiled Code again
    const toggle = async () => {
      await page.locator("ui-menu.AppMenu").getByText("View", { exact: true }).first().click({ timeout: 3000 })
      await pause(800)
      await page.getByText("Compiled Code", { exact: true }).filter({ visible: true }).first().click({ timeout: 3000 })
      await pause(2500)
    }
    await toggle()
    for (const language of ["TypeScript", "Python", "JavaScript"]) {
      await page.locator(".CodeOutputPane ui-item").filter({ hasText: language }).first().click({ timeout: 3000 })
      await pause(1500)
    }
    await walkCode(3, 5)
    await toggle()
  })
  await tryStep(`${project}:type`, async () => {
    await walkCode(2, 0)
    await page.keyboard.press("End")
    await page.keyboard.type(" x", { delay: 60 })
    await pause(3000)
    await page.keyboard.press("Backspace")
    await page.keyboard.press("Backspace")
    await pause(3000)
  })
  await tryStep(`${project}:run mode`, async () => {
    await page.locator("ui-menu.ModeTabs ui-item").first().click({ timeout: 3000 })
    await pause(2500)
    await page.locator("ui-menu.ModeTabs ui-item").nth(1).click({ timeout: 3000 })
    await pause(2000)
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
