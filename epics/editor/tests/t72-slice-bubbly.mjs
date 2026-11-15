// Epic `editor` T72:  the Inspector's Code card's slices drawn bubbly, as the code editor is;  and I157's name field.
// - Usage:  node t72-slice-bubbly.mjs [tag] [editorUrl]
// - Saves nothing:  every non-GET to files and prefs is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const TAG = process.argv[2] ?? "after"
const EDITOR =
  process.argv[3] ?? JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1500, height: 950 }, colorScheme: scheme })
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
  await page.evaluate((scheme) => {
    document.documentElement.style.colorScheme = scheme
    document.documentElement.style.setProperty("--ui-scheme", scheme)
  }, scheme)
  if (!(await page.evaluate(() => !!document.querySelector(".InspectAppButton.inspecting")))) {
    await page.locator(".InspectAppButton [part~=item]").first().click({ force: true })
  }
  await page.waitForTimeout(1500)
  await page.locator(".InspectorViews").getByText("Solitaire", { exact: true }).first().click({ force: true })
  await page.waitForTimeout(3000)
  const restart = page.locator("ui-section.InspectorEvent.action").filter({ hasText: "restart the game" }).first()
  await restart.scrollIntoViewIfNeeded()
  await page.waitForTimeout(1500)
  const info = await page.evaluate(() => {
    const slices = [...document.querySelectorAll(".CodeSlice")]
    return slices.map((slice) => ({
      bubbly: !!slice.querySelector(".bubbly-monaco"),
      shapes: slice.querySelectorAll(".bubbly-shapes > *").length,
      height: slice.getBoundingClientRect().height,
      text: slice.innerText.slice(0, 80).replace(/\s+/g, " "),
      bg: getComputedStyle(slice.querySelector(".monaco-editor-background") ?? slice).backgroundColor
    }))
  })
  console.log(scheme, JSON.stringify(info, null, 1))
  const card = page.locator(".InspectorColumn").first()
  await card.screenshot({ path: `${OUT}/t72-${TAG}-${scheme}.png` })
  await restart.screenshot({ path: `${OUT}/t72-${TAG}-restart-${scheme}.png` })
  if (scheme === "light" && TAG === "after") {
    // typing in the slice:  the caret lands and the text follows (answered, never saved)
    const slice = restart.locator(".CodeSlice .view-lines").first()
    await slice.click()
    await page.keyboard.press("End")
    await page.keyboard.type(" xyz")
    await page.waitForTimeout(800)
    const typed = await page.evaluate(() => window.editor?.file?.contents?.includes("restart the game xyz") ?? "?")
    console.log("typed reaches the file:", typed)
    await restart.screenshot({ path: `${OUT}/t72-${TAG}-typed-${scheme}.png` })
    for (let i = 0; i < 4; i++) await page.keyboard.press("Backspace")
    await page.waitForTimeout(500)
  }
  if (TAG === "after" || TAG === "i157") {
    // I157:  an action's name, open to rename
    const name = page.locator(".InspectorActionName").filter({ hasText: /^restart the game$/ }).first()
    await name.scrollIntoViewIfNeeded()
    await name.click()
    await page.waitForTimeout(600)
    const field = page.locator(".InspectorActionNameField").first()
    const box = await field.evaluate((el) => {
      const input = el.shadowRoot?.querySelector("input") ?? el.querySelector("input") ?? el
      return { width: el.getBoundingClientRect().width, scroll: input.scrollWidth, client: input.clientWidth, value: input.value }
    })
    console.log("I157 field", JSON.stringify(box))
    await page.locator("ui-section.InspectorEvent.action").filter({ has: field }).screenshot({ path: `${OUT}/i157-name-field-${scheme}.png` })
    await page.keyboard.press("Escape")
  }
  console.log("errors:", errors.slice(0, 5))
  await context.close()
}
await browser.close()
