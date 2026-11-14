// Epic `editor` T67:  the draft capsule's grey Discard Draft, between "Editing a Draft" and Publish Draft.
// - Usage:  node t67-discard-draft.mjs [editorUrl]
// - Saves nothing:  every non-GET to files, prefs and drafts is answered `{}`;  the draft is faked in memory.
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const EDITOR =
  process.argv[2] ?? JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url

const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1400, height: 800 }, colorScheme: scheme })
  await context.route(/\/api\/(projects\/file|prefs|projects\/drafts)\//, (route) => {
    if (route.request().method() === "GET") return route.continue()
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  })
  await context.routeWebSocket(/.*/, () => {})
  const page = await context.newPage()
  await page.goto(`${EDITOR}edit/@spell/examples/Solitaire`, { timeout: 90000 })
  await page.waitForSelector(".ModeButtons", { timeout: 90000 })
  await page.waitForFunction(() => window.editor?.file, null, { timeout: 60000 })
  await page.waitForTimeout(2000)
  await page.evaluate((scheme) => {
    // the editor's own scheme setting wins over the OS's:  force it on the page
    document.documentElement.style.colorScheme = scheme
    document.documentElement.style.setProperty("--ui-scheme", scheme)
    const editor = window.editor
    editor.mayPublish = true
    editor.draftedFiles = [editor.file.path]
  }, scheme)
  await page.waitForSelector(".PublishDraft ui-button.DiscardDraft", { timeout: 5000 })
  await page.waitForTimeout(600)
  const box = await page.evaluate(() => {
    const rect = (el) => {
      const r = el.getBoundingClientRect()
      return { left: +r.left.toFixed(1), right: +r.right.toFixed(1), top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), height: +r.height.toFixed(1) }
    }
    const pill = document.querySelector(".PublishDraft")
    const part = (sel) => document.querySelector(sel).shadowRoot?.querySelector("[part~=button]") ?? document.querySelector(sel)
    const discard = part(".PublishDraft ui-button.DiscardDraft")
    const publish = part(".PublishDraft ui-button.Publish")
    const style = getComputedStyle(discard)
    return {
      pill: { ...rect(pill), radius: getComputedStyle(pill).borderRadius },
      state: rect(pill.querySelector(".DraftState")),
      discard: { ...rect(discard), radius: style.borderTopLeftRadius, background: style.backgroundColor, color: style.color },
      publish: { ...rect(publish), radius: getComputedStyle(publish).borderTopLeftRadius }
    }
  })
  console.log(scheme, JSON.stringify(box, null, 1))
  const clip = { x: box.pill.left - 260, y: box.pill.top - 10, width: box.pill.right - box.pill.left + 280, height: box.pill.height + 20 }
  await page.screenshot({ path: `${OUT}/t67-capsule-${scheme}.png`, clip })
  await page.screenshot({ path: `${OUT}/t67-bar-${scheme}.png`, clip: { x: 0, y: 0, width: 1400, height: 60 } })
  if (scheme === "light") {
    await page.locator(".PublishDraft ui-button.DiscardDraft").click()
    await page.waitForSelector("ui-modal[open]", { timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(600)
    const modal = await page.evaluate(() => [...document.querySelectorAll("ui-modal")].find((modal) => /Throw/.test(modal.textContent ?? ""))?.textContent?.replace(/\s+/g, " ").trim())
    console.log("confirm:", modal)
    await page.screenshot({ path: `${OUT}/t67-confirm-light.png` })
  }
  await context.close()
}
await browser.close()
