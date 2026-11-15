// Epic `editor` I162:  a drawing's `{…}` code pills on the page (`BubblyHtml`, `BubblyMarkup`), braces at their ends.
// - Usage:  node i162-page.mjs [tag] [editorUrl]
import { readFileSync } from "node:fs"
import { chromium } from "/Users/owen/www/spell/node_modules/playwright/index.mjs"

const OUT = "/Users/owen/www/spell/spell.epics/epics/editor/tests"
const TAG = process.argv[2] ?? "after"
const EDITOR =
  process.argv[3] ?? JSON.parse(readFileSync("/Users/owen/www/spell.worktrees/editor/.spell-server.editor.json", "utf8")).url
const SPELL = `a "probe" is an app
\tits "size" is "small"
\tto draw it
\t\t<container columns="7" padding={small" spacing="xs">
\t\t\t<text color="blue">{its size}</text>
\t\t\t<button "OK" onClick={say "hi"} padding={its size} />
\t\t</container>
`
const HTML = `<container columns="7" padding={its size}>
  <button label="OK" onClick={count up}></button>
</container>
`
const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 900, height: 420 }, colorScheme: scheme, deviceScaleFactor: 2 })
  const page = await context.newPage()
  await page.goto(`${EDITOR}src/app/components/spell-code/BubblyHtml.ts`)
  await page.evaluate(
    async ({ SPELL, HTML, scheme }) => {
      const { SP } = await import("/@id/spell/parser/spell")
      const { BubblyHtml } = await import("/src/app/components/spell-code/BubblyHtml.ts")
      const { BubblyMarkup } = await import("/src/app/components/spell-code/BubblyMarkup.ts")
      const { default: styles } = await import("/src/app/components/spell-code/bubbly.css?inline")
      document.documentElement.innerHTML = `<body style="margin:20px;background:${scheme === "dark" ? "#1c1b22" : "#fff"};color-scheme:${scheme}"></body>`
      const { parser } = SP.Language.for("en")
      for (const html of [BubblyHtml.write(SP.BubblyLayout.of(SPELL, parser)), BubblyMarkup.write(HTML)]) {
        const host = document.createElement("div")
        host.style.cssText = "margin-bottom:16px"
        host.attachShadow({ mode: "open" }).innerHTML = `<style>${styles}</style>${html}`
        document.body.append(host)
      }
    },
    { SPELL, HTML, scheme }
  )
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/I162-page-${TAG}-${scheme}.png` })
  await context.close()
}
await browser.close()
