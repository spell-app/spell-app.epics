// Epic `editor` P30:  the CodeMirror test page, headless.
// - Usage:  node p30-probe.mjs <query> <shot-name> [width] [height]
//   e.g. node p30-probe.mjs "view=edit&scheme=dark" edit-dark
// - Saves nothing:  the page answers its own writes, and every non-GET to /api here is answered `{}` too.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR = JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url
const [query = "", shot, width = "1700", height = "1000"] = process.argv.slice(2)
const scheme = /scheme=dark/.test(query) ? "dark" : "light"
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: +width, height: +height }, colorScheme: scheme, deviceScaleFactor: 2 })
await context.route(/\/api\//, (route) =>
  route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
)
const page = await context.newPage()
const errors = []
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(`${m.type()}: ${m.text().slice(0, 400)}`))
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
await page.goto(`${EDITOR}demo/codemirror.html?${query}`, { timeout: 120000 })
await page.waitForSelector(".cm-editor, .monaco-editor", { timeout: +(process.env.TIMEOUT ?? 120000) }).catch((e) => errors.push("timeout: " + e.message.split("\n")[0]))
await page.waitForTimeout(+(process.env.WAIT ?? 4000))
if (process.env.EVAL) console.log(await page.evaluate(process.env.EVAL))
if (shot) await page.screenshot({ path: `${OUT}/p30-${shot}.png` })
console.log("errors:", errors.slice(0, 12).join("\n"))
await browser.close()
