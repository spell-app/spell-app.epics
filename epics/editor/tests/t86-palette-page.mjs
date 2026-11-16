// Epic `editor` T86:  the palette groups page shows and edits each group's icon.  Saves nothing (non-GETs answered `{}`).
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const URL = "http://127.0.0.1:4747/worktrees/editor/components/ui/palette.html"
const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1290, height: 900 }, colorScheme: scheme })
  // the API is the main checkout's server:  answer with this worktree's table
  await context.route(/palette-groups/, (route) =>
    route.request().method() === "GET"
      ? route.fulfill({ status: 200, contentType: "application/json", body: readFileSync("/Users/owen/www/spell.worktrees/editor/ui/src/components/paletteGroups.json", "utf8") })
      : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  await context.route(/\/api\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()))
  await page.goto(URL, { timeout: 120000 })
  await page.waitForFunction(() => document.querySelector("ui-docs-palette")?.shadowRoot?.querySelectorAll("ui-icon-picker.icon").length > 3, undefined, { timeout: 120000 })
  await page.waitForTimeout(1500)
  const icons = await page.evaluate(() =>
    [...document.querySelector("ui-docs-palette").shadowRoot.querySelectorAll("section.group:not(.not-offered)")].map((group) => [
      group.querySelector("ui-input.name")?.value,
      group.querySelector("ui-icon-picker.icon")?.value,
      Math.round(group.querySelector("ui-icon-picker.icon")?.getBoundingClientRect().width)
    ])
  )
  console.log(scheme, JSON.stringify(icons))
  const el = page.locator("ui-docs-palette")
  await el.scrollIntoViewIfNeeded()
  await el.screenshot({ path: `${OUT}/t86-palette-page-${scheme}.png` })
  console.log(scheme, "errors", errors.length, errors.slice(0, 3))
  await context.close()
}
await browser.close()
