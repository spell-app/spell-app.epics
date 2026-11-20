/**
 * Accessibility, quickly:
 * - axe-core over the whole page (it reads open shadow roots):  violations by rule, impact, count, one sample node
 * - Tab-through:  `--tabs` presses (30);  where focus lands (through shadow roots), and whether it's visibly marked
 *   (heuristic:  an outline or box-shadow on the focused element or a host above it, or `:focus-visible` styles)
 * - `prefers-reduced-motion`:  the page loaded with it set to `reduce`, then the same interaction as with
 *   `no-preference`;  counts the animations running (`document.getAnimations()`, sampled every 16ms)
 * Usage (from the kit's root):
 *   node <this folder>/perf-a11y.mjs <editor|docs|epic|run> [desktop|phone] [--tabs 30] [--out a11y.json]
 */
import { writeFileSync } from "node:fs"

import { AXE, PAGES, args, openFresh, waitReadyAndQuiet } from "./perf-lib.mjs"

const { positional, flags } = args()
const [pageKey = "docs", profileKey = "desktop"] = positional
const tabs = Number(flags.tabs ?? 30)

/** An interaction that should animate, per page (for the reduced-motion check). */
const MOTION = {
  editor: async (page) => {
    await page.locator(".EditorBar").getByText("View", { exact: true }).first().click()
    await page.waitForTimeout(600)
    await page.keyboard.press("Escape")
  },
  run: async (page) => {
    await page.locator("solitaire-stock-pile").first().click()
  },
  docs: async (page) => {
    await page.evaluate(() => document.querySelector("ui-modal").setAttribute("open", ""))
    await page.waitForTimeout(600)
    await page.evaluate(() => document.querySelector("ui-modal").removeAttribute("open"))
  },
  epic: async (page) => {
    await page.evaluate(() => document.querySelectorAll("epic-item")[3].setAttribute("open", ""))
    await page.waitForTimeout(600)
    await page.evaluate(() => document.querySelectorAll("epic-item")[3].removeAttribute("open"))
  }
}

/** Animations seen while `action` runs, and for 1.5s after:  count, and the longest running time (ms). */
async function animationsDuring(page, action) {
  await page.evaluate(() => {
    window.__animations = new Map()
    window.__animationTimer = setInterval(() => {
      for (const animation of document.getAnimations()) {
        const timing = animation.effect?.getComputedTiming?.()
        const name = animation.animationName ?? animation.transitionProperty ?? animation.constructor.name
        const target = animation.effect?.target
        const key = animation
        if (!window.__animations.has(key))
          window.__animations.set(key, { name, duration: timing?.duration ?? 0, tag: target?.localName ?? "?" })
      }
    }, 16)
  })
  await action(page)
  await page.waitForTimeout(1500)
  return page.evaluate(() => {
    clearInterval(window.__animationTimer)
    const list = [...window.__animations.values()]
    const moving = list.filter((entry) => typeof entry.duration === "number" && entry.duration > 1)
    return {
      count: list.length,
      withDuration: moving.length,
      longest: Math.max(0, ...moving.map((entry) => (Number.isFinite(entry.duration) ? entry.duration : 0))),
      infinite: list.filter((entry) => entry.duration === Infinity).length,
      samples: moving.slice(0, 5)
    }
  })
}

const result = { page: pageKey, profile: profileKey }

////////////////
// axe, tab-through, motion with no preference
////////////////
{
  const { browser, page } = await openFresh(pageKey, profileKey)
  await page.goto(PAGES[pageKey].url(), { timeout: 180_000, waitUntil: "commit" })
  await waitReadyAndQuiet(page, { quietMs: 2000 })
  await page.addScriptTag({ path: AXE })
  const started = Date.now()
  const axe = await page.evaluate(async () => {
    const run = await window.axe.run(document, { resultTypes: ["violations"] })
    return run.violations.map((violation) => ({
      rule: violation.id,
      impact: violation.impact,
      count: violation.nodes.length,
      help: violation.help,
      sample: violation.nodes[0]?.target?.join(" >> "),
      sampleHtml: violation.nodes[0]?.html?.slice(0, 160)
    }))
  })
  result.axeMs = Date.now() - started
  result.axe = axe.sort((one, other) => other.count - one.count)

  // Tab-through
  await page.evaluate(() => document.activeElement?.blur?.())
  await page.mouse.click(2, 2)
  const stops = []
  for (let index = 0; index < tabs; index++) {
    await page.keyboard.press("Tab")
    await page.waitForTimeout(60)
    stops.push(
      await page.evaluate(() => {
        let element = document.activeElement
        const path = []
        while (element?.shadowRoot?.activeElement) {
          path.push(element.localName)
          element = element.shadowRoot.activeElement
        }
        if (!element || element === document.body) return { where: "body", inShadow: false, visible: false }
        path.push(element.localName + (element.className && typeof element.className === "string" ? "." + element.className.split(" ")[0] : ""))
        const marked = (node) => {
          const style = getComputedStyle(node)
          const outline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0
          const shadow = style.boxShadow && style.boxShadow !== "none"
          return outline || shadow
        }
        // the focused element, or a host above it (`:host(:focus-within)`)
        let visible = marked(element)
        let host = element.getRootNode().host
        while (!visible && host) {
          visible = marked(host)
          host = host.getRootNode().host
        }
        let focusVisible = false
        try {
          focusVisible = element.matches(":focus-visible")
        } catch {
          // not supported
        }
        const box = element.getBoundingClientRect()
        return {
          where: path.join(" > "),
          inShadow: path.length > 1,
          visible,
          focusVisible,
          onScreen: box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight
        }
      })
    )
  }
  result.tabs = {
    presses: tabs,
    distinct: new Set(stops.map((stop) => stop.where)).size,
    inShadow: stops.filter((stop) => stop.inShadow).length,
    visiblyMarked: stops.filter((stop) => stop.visible).length,
    offScreen: stops.filter((stop) => stop.onScreen === false).length,
    onBody: stops.filter((stop) => stop.where === "body").length,
    stops
  }
  result.motionNoPreference = await animationsDuring(page, MOTION[pageKey])
  await browser.close()
}

////////////////
// motion with `reduce`
////////////////
{
  const { browser, page } = await openFresh(pageKey, profileKey, { contextOptions: { reducedMotion: "reduce" } })
  await page.goto(PAGES[pageKey].url(), { timeout: 180_000, waitUntil: "commit" })
  await waitReadyAndQuiet(page, { quietMs: 2000 })
  result.motionReduce = await animationsDuring(page, MOTION[pageKey])
  result.reducedMotionRules = await page.evaluate(() => {
    // `@media (prefers-reduced-motion ...)` rules in every sheet the page has, shadow roots' adopted ones too
    const sheets = new Set([...document.styleSheets, ...(document.adoptedStyleSheets ?? [])])
    const walk = (root) => {
      for (const element of root.querySelectorAll("*")) {
        if (!element.shadowRoot) continue
        for (const sheet of element.shadowRoot.adoptedStyleSheets ?? []) sheets.add(sheet)
        for (const sheet of element.shadowRoot.styleSheets ?? []) sheets.add(sheet)
        walk(element.shadowRoot)
      }
    }
    walk(document)
    let reduced = 0
    let animated = 0
    for (const sheet of sheets) {
      let rules
      try {
        rules = sheet.cssRules
      } catch {
        continue
      }
      const visit = (list) => {
        for (const rule of list) {
          if (rule.media && /prefers-reduced-motion/.test(rule.media.mediaText)) reduced++
          const text = rule.cssText ?? ""
          if (/transition|animation/.test(text) && !rule.media) animated++
          if (rule.cssRules && !rule.media) visit(rule.cssRules)
        }
      }
      visit(rules)
    }
    return { sheets: sheets.size, reducedMotionMediaRules: reduced, rulesWithTransitionOrAnimation: animated }
  })
  await browser.close()
}

writeFileSync(flags.out ?? `perf-a11y-${pageKey}-${profileKey}.json`, JSON.stringify(result, null, 2))
console.log(
  JSON.stringify({
    page: pageKey,
    axe: result.axe.map((violation) => `${violation.rule}/${violation.impact}:${violation.count}`),
    tabs: { ...result.tabs, stops: undefined },
    motionNoPreference: { ...result.motionNoPreference, samples: undefined },
    motionReduce: { ...result.motionReduce, samples: undefined },
    reducedMotionRules: result.reducedMotionRules
  })
)
