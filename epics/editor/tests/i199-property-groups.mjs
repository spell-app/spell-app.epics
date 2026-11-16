// Epic `editor` I199:  a segment's property groups in the Inspector -- fields in their vocabulary's places, the tips'
// icons only on hover at each field's far right, yes-or-no fields two to a row, Seamless beside Attach to,
// Placeholder one of Appearance's looks, the group headers in capitals;  and a toggle's focus ring once clicked.
// - Usage:  node i199-property-groups.mjs <before | after> [editorUrl]
// - Saves nothing:  every non-GET to /api is answered `{}`.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const STAGE = process.argv[2] ?? "after"
const EDITOR =
  process.argv.find((arg) => arg.startsWith("http")) ??
  JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: scheme })
  await context.route(/\/(api|spaces)\//, (route) =>
    route.request().method() === "GET" ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  )
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
  await page.waitForFunction(() => window.Inspector && document.querySelector("solitaire-card"), undefined, { timeout: 90000 })
  await page.waitForTimeout(2500)
  if (!(await page.evaluate(() => window.Inspector.isOpen))) await page.evaluate(() => window.Inspector.showOrHide())
  await page.evaluate(() => window.Inspector.select(document.querySelector("ui-segment")))
  if (scheme === "dark")
    await page.evaluate(() => {
      document.documentElement.classList.add("ui-dark")
      document.documentElement.classList.remove("ui-light")
      document.documentElement.style.colorScheme = "dark"
    })
  await page.waitForTimeout(2000)
  const layout = () =>
    page.evaluate(() => {
      const box = (el) => {
        const b = el?.getBoundingClientRect()
        return b && { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }
      }
      return [...document.querySelectorAll(".InspectorColumn ui-property-group")].map((group) => {
        const heading = group.shadowRoot?.querySelector(".title .heading")
        return {
          group: group.getAttribute("label"),
          heading: heading && { text: heading.innerText, transform: getComputedStyle(heading).textTransform, spacing: getComputedStyle(heading).letterSpacing },
          fields: [...group.querySelectorAll(":scope > ui-property")].map((property) => {
            const info = property.shadowRoot?.querySelector(".row > .info")
            const field = property.shadowRoot?.querySelector(".field")
            return {
              name: property.getAttribute("name"),
              box: box(field),
              info: info && { right: Math.round(info.getBoundingClientRect().right), opacity: getComputedStyle(info).opacity }
            }
          })
        }
      })
    })
  const before = await layout()
  for (const group of before) console.log(scheme, JSON.stringify(group))
  const column = await page.evaluate(() => {
    const b = document.querySelector(".InspectorColumn ui-property-group").getBoundingClientRect()
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width) }
  })
  // hover a field:  its icon shows
  const first = page.locator(".InspectorColumn ui-property[name=size]")
  await first.hover()
  await page.waitForTimeout(300)
  const hovered = await page.evaluate(() => getComputedStyle(document.querySelector(".InspectorColumn ui-property[name=size]").shadowRoot.querySelector(".row > .info")).opacity)
  console.log(scheme, "size's icon while hovered", hovered)
  await page.screenshot({ path: `${OUT}/i199-${STAGE}-${scheme}.png`, clip: { x: column.x - 10, y: Math.max(0, column.y - 10), width: column.w + 20, height: 760 } })
  // click a toggle:  its focus ring, beside a select's
  const toggle = page.locator(".InspectorColumn ui-property[name=clearing] ui-checkbox")
  await toggle.click()
  await page.waitForTimeout(400)
  const ring = await page.evaluate(() => {
    const out = {}
    const checkbox = document.querySelector(".InspectorColumn ui-property[name=clearing] ui-checkbox")
    const deep = (root) => { let el = root.activeElement; while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement; return el }
    const focused = deep(document)
    out.focused = focused && (focused.localName + "." + focused.className)
    out.focusVisible = focused?.matches(":focus-visible")
    for (const el of [checkbox, focused, focused?.parentElement]) if (el) { const s = getComputedStyle(el); out[el.localName + "." + (el.className || "")] = `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor} | ${s.boxShadow}` }
    return out
  })
  console.log(scheme, "clicked toggle ring", JSON.stringify(ring))
  const t = await toggle.boundingBox()
  await page.screenshot({ path: `${OUT}/i199-${STAGE}-${scheme}-toggle-focus.png`, clip: { x: column.x - 10, y: t.y - 60, width: column.w + 20, height: 140 } })
  await toggle.click()
  console.log(scheme, "page errors", errors.length, errors.slice(0, 3))
  await context.close()
}
await browser.close()
