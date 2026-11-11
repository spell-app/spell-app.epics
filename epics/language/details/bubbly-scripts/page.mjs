// Writes card-bubbly.html from the two drawings gen.mjs made.
import { readFileSync, writeFileSync } from "node:fs"
const here = new URL(".", import.meta.url).pathname
const plain = readFileSync(here + "card.plain.html", "utf8")
const tags = readFileSync(here + "card.tags.html", "utf8")
// the rest of Solitaire, plain (Owen:  "let's add plain spell Solitaire to the page")
const others = [
  { id: "solitaire", label: "Solitaire, the game" },
  { id: "pile", label: "Pile" },
  { id: "deck", label: "Deck" }
].map(({ id, label }) => ({ id, label, html: readFileSync(here + `${id}.plain.html`, "utf8") }))
// Owen's forms for plain Spell the drawing uses (twin.mts):  listed at the foot, to make a phase of later
const assumes = JSON.parse(readFileSync(here + "card.assumes.json", "utf8"))
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const code = (s) => `<code>${esc(s).replace(/\n/g, "<br />")}</code>`
const assumed = assumes
  .map(
    ({ comment, what, today, page, tags, note }) => `
              <li>
                <b>${esc(what)}</b> (${esc(comment)})
                <ul>
                  <li>Today: ${code(today)}</li>
                  <li>This page: ${code(page)}</li>
                  <li>Tags: ${esc(tags.replace(/:  .*/, ""))}, ${code(tags.replace(/^[^:]*:  /, ""))}</li>
                  <li>${esc(note).replace(/\`([^\`]+)\`/g, "<code>$1</code>")}</li>
                </ul>
              </li>`
  )
  .join("")
const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Card, Drawn Bubbly</title>
    <meta
      name="description"
      content="Solitaire drawn in the bubbly look:  its card in plain Spell and in tags, then the game, its piles and its deck in plain Spell, for Owen's comments"
    />
    <link rel="stylesheet" href="/_epic/assets/spell-doc.css" />
    <!-- the look, shared with the analysis page's mock-ups:  tune it there -->
    <link rel="stylesheet" href="bubbly.css" />
  </head>
  <body class="spell-doc-page spell-details-page">
    <ui-root>
      <ui-components source="/_epic/pack/epics.pack.js"></ui-components>
      <spell-site-header></spell-site-header>
      <div class="spell-doc">
        <main class="spell-doc-main">
          <!--
            A DETAILS PAGE that takes COMMENTS:  no questions and no Send of its own, so the page server
            says it takes them (commentsRoutes.ts, \`commentsPage()\`), and the docs runtime draws a bullhorn on each block.
            - each declaration of the card is a block:  a \`<ui-section class="bubbly-section">\` with an id, no look of its own
            - each line is a \`<p>\`:  a comment on selected text (Cmd I) sits under its line
            - drawn by a scratch script from \`Card.spell\` and its plain twin (\`SX.CodeSpellWriter\`), its colouring the
              parser's (\`SP.SpellHighlighter.spans()\`);  regenerate it, rather than editing the drawing by hand
          -->
          <ui-breadcrumbs class="spell-crumbs" size="small" aria-label="Breadcrumb">
            <ui-breadcrumb link="/pages/index.html" target="src-packages-docs-index-html">Docs</ui-breadcrumb>
            <ui-breadcrumb link="/epics/language/language.plan.html" target="language">language</ui-breadcrumb>
            <ui-breadcrumb link="/epics/language/details/spellml-or-plain.html">Tags or Plain Spell</ui-breadcrumb>
            <ui-breadcrumb selected>Card, Drawn Bubbly</ui-breadcrumb>
          </ui-breadcrumbs>
          <ui-sticky class="spell-h1"
            ><header class="spell-page-head">
              <h1>Card, Drawn Bubbly</h1>
            </header></ui-sticky
          >
          <p class="lede">
            Solitaire in the bubbly look, every line: its card in plain Spell, then the game, its piles and its deck, then
            the card again in tags. Comment on any block with its bullhorn, or select some text and press ⌘ I.
          </p>

          <ui-section id="plain" label="1. The card, plain Spell" sticky collapsible dividing open="false">
            ${plain}
          </ui-section>

          ${others
            .map(
              ({ id, label, html }, index) => `<ui-section id="${id}" label="${index + 2}. ${label}" sticky collapsible dividing open="false">
            ${html}
          </ui-section>

          `
            )
            .join("")}<ui-section id="tags" label="${others.length + 2}. The card, in tags" sticky collapsible dividing open="false">
            ${tags}
          </ui-section>

          <ui-section id="assumes" label="${others.length + 3}. Changes to plain Spell this page assumes" sticky collapsible dividing open="false">
            <p>
              The plain drawings above are written the way you'd write them, not the way Spell reads them today.
              Each change is listed here, to make into a phase later.
            </p>
            <ul>${assumed}
            </ul>
          </ui-section>
        </main>
      </div>
    </ui-root>
    <script src="/_epic/assets/highlight.min.js"></script>
    <script src="/_epic/assets/spell-ui.js"></script>
  </body>
</html>
`
writeFileSync("/Users/owen/www/spell/spell.epics/epics/language/details/card-bubbly.html", page)
console.log("written", page.length)
