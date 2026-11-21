// Rebuilds the Solid TLDR page (details/solid-tldr.html) from this folder's data:  `node tldr-gen.js`, then format it
// (`yarn vp fmt <page>` from the kit's epic/ folder).  The layout it draws:  LAYOUT.md.
// - tldr-data.js:  the items, by group;  merge.js folds two groups into others
// - tldr-overlay.js:  each item's key, proposed priority and dependencies;  the decided items, placed inline;
//   the folded "Decided elsewhere" list
// - tldr-titles.js:  each item's short title (at most 5 words)
// - tldr-devchanges.js:  each item's "Changes to Spell development" bullets, after its description
// It replaces the page between its lede and its notes box, and its <style id="tldr-layout"> in the head.
const fs = require("fs")
const groups = require("./merge.js")
const { byIndex, decided, folded } = require("./tldr-overlay.js")
const shortTitles = require("./tldr-titles.js")
const devChanges = require("./tldr-devchanges.js")
const PAGE = "/Users/owen/www/spell/spell.epics/epics/solid-2-final/details/solid-tldr.html"

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const words = (s) => s.trim().split(/\s+/).length

////////////////
// ## The items, ranked
////////////////

// Flatten, insert decided items, number them.
let index = 0
const out = []
for (const g of groups) {
  const items = []
  for (const it of g.items) {
    index++
    for (const d of decided.filter((d) => d.before === index)) items.push({ ...d, isDecided: true })
    const [key, pri, priWhy, deps] = byIndex[index]
    items.push({ ...it, key, pri: [pri, priWhy], deps })
  }
  out.push({ id: g.group[0], label: g.group[1], items })
}
if (decided.some((d) => d.before > index)) throw new Error("decided item placed past the end")
let rank = 0
const byKey = {}
for (const g of out)
  for (const it of g.items) {
    it.rank = ++rank
    byKey[it.key] = it
    it.short = shortTitles[it.key]
    if (!it.short) throw new Error(`no short title for ${it.key}`)
    if (words(it.short) > 5) throw new Error(`short title over 5 words:  ${it.key}`)
    it.dev = devChanges[it.key]
    if (!it.dev || it.dev.length < 2 || it.dev.length > 5) throw new Error(`2-5 development changes needed for ${it.key}`)
  }
for (const g of out)
  for (const it of g.items) for (const [k] of it.deps) if (!byKey[k]) throw new Error(`unknown dep ${k} in ${it.key}`)
// sections in the order of their best-ranked item
out.sort((a, b) => Math.min(...a.items.map((i) => i.rank)) - Math.min(...b.items.map((i) => i.rank)))

////////////////
// ## A row
////////////////

const sign = (n) => (n > 0 ? `+${n}` : `${n}`)
const why = (w) => (w ? ` <span class="tldr-why">${esc(w)}</span>` : "")
/** Escaped, with `backticks` as code and a leading "Removes a limit:" / "Adds a limit:" in bold. */
const devHtml = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^(Removes a limit|Adds a limit):/, "<b>$1:</b>")
const sentence = (s) => (/[.!?]$/.test(s) ? s : `${s}.`)

/** Its "how" words in order, each with the items they name:  `after #1 #3 · unblocks #7`. */
function dependsHtml(it) {
  if (!it.deps.length) return "none"
  const byHow = new Map()
  for (const [k, how] of it.deps) byHow.set(how, [...(byHow.get(how) ?? []), byKey[k]])
  return [...byHow]
    .map(
      ([how, items]) =>
        `${esc(how)} ${items.map((d) => `<a href="#q${d.rank}" title="${d.rank} · ${esc(d.title)}">#${d.rank}</a>`).join(" ")}`
    )
    .join(" · ")
}

function rowHtml(it) {
  const id = `q${it.rank}`
  const links = it.links.map(([href, text]) => `<a href="${esc(href)}">${esc(text)}</a>`).join(" · ")
  let decidedLine = ""
  if (it.isDecided) {
    const d = it.decision
    const parts = []
    for (let i = 0; i < d.length; i += 2) parts.push(`<a href="${esc(d[i])}">${esc(d[i + 1])}</a>`)
    decidedLine = `<p><ui-label size="mini" color="green">Already decided</ui-label> You picked Yes:  ${parts.join(";  ")}.</p>`
  }
  const longTitle = it.title.replace(/:\s+/g, ":  ") !== it.short ? `${esc(sentence(it.title))} ` : ""
  const opt = (letter, title, body, rec, selected) =>
    `<epic-option${selected ? " selected" : ""} letter="${letter}" title="${title}"${rec ? " recommended" : ""}><p>${body}</p></epic-option>`
  const r = it.isDecided ? "Y" : it.rec
  const pr = it.pri[0]
  return `
<tr>
  <td>
    <p class="tldr-title"><b>${it.rank} · ${esc(it.short)}</b></p>
    ${decidedLine}
    <p>${longTitle}${esc(it.text)}</p>
    <p class="tldr-dev-head"><b>Changes to Spell development</b></p>
    <ul class="tldr-dev">
      ${it.dev.map((d) => `<li>${devHtml(d)}</li>`).join("\n      ")}
    </ul>
  </td>
  <td>
    <ui-section id="${id}" class="tldr-holder" label="${it.rank} · ${esc(it.short)}">
      <epic-ask compact name="${id}">
        <epic-choices fixed>
          ${opt("Y", "Yes", "Do it as described.", r === "Y", it.isDecided)}
          ${opt("N", "No", "Don't do it.", r === "N")}
          ${opt("M", "Modify", "Do it differently:  say how in the comment.", r === "M")}
          ${opt("R", "Revisit", "Not now:  ask again later.", r === "R")}
        </epic-choices>
      </epic-ask>
      <epic-ask compact name="${id}-priority">
        <epic-question><p><b>Priority</b> ${pr}:  ${esc(it.pri[1])}.</p></epic-question>
        <epic-choices fixed>
          ${opt("1", "Priority 1", "First.", pr === 1)}
          ${opt("2", "Priority 2", "Next.", pr === 2)}
          ${opt("3", "Priority 3", "Later.", pr === 3)}
        </epic-choices>
      </epic-ask>
    </ui-section>
  </td>
  <td class="tldr-facts">
    <p><b>Read</b> ${links}</p>
    <p><b>Risk</b> ${esc(it.risk[0])}${why(it.risk[1])}</p>
    <p><b>LOE</b> ${esc(it.loe[0])}${why(it.loe[1])}</p>
    <p><b>Complexity</b> ${sign(it.cx[0])}${why(it.cx[1])}</p>
    <p><b>Depends</b> ${dependsHtml(it)}</p>
  </td>
</tr>`
}

////////////////
// ## The page
////////////////

const total = rank
const decidedCount = decided.length
const top5 = out
  .flatMap((g) => g.items)
  .filter((i) => !i.isDecided)
  .sort((a, b) => a.rank - b.rank)
  .slice(0, 5)

const body = out
  .map(
    (g) => `
<ui-section id="g-${g.id}" label="${esc(g.label)}" sticky collapsible dividing>
  <ui-icon slot="icon" name="list ol"></ui-icon>
  <ui-table class="tldr-table spell-full-width" celled compact>
    <table>
      <colgroup><col class="tldr-col-item"><col class="tldr-col-pick"><col class="tldr-col-facts"></colgroup>
      <thead><tr><th>Item</th><th>Your pick</th><th>Facts</th></tr></thead>
      <tbody>
        ${g.items.map(rowHtml).join("\n")}
      </tbody>
    </table>
  </ui-table>
</ui-section>`
  )
  .join("\n")

const foldedHtml = `
<ui-section id="decided" label="Decided elsewhere" sticky collapsible dividing open="false">
  <ui-icon slot="icon" name="check"></ui-icon>
  <p>Decisions that aren't about whether or when to do something.  Not asked again.</p>
  <ul>
    ${folded.map(([href, text]) => `<li><a href="${esc(href)}">${esc(text)}</a></li>`).join("\n    ")}
  </ul>
  <epic-text-box for="decided"></epic-text-box>
</ui-section>`

// This page's own layout:  its tables run the window's width, less the page's 16px gutter (spell-doc.css's
// `.spell-full-width` leaves them out of the reading column;  `> ui-section >` leaves out the copy of the header the
// runtime pins, which takes the table's classes;  on a phone a table scrolls sideways inside itself);  each item's picks sit in a section of their own
// (`.tldr-holder`, so its asks number Q1 · a, Q1 · b and send under the item's title), its title hidden:
// the row's first cell says it
const STYLE = `<style id="tldr-layout">
      body.spell-doc-page .spell-doc-main > ui-section > ui-table.tldr-table {
        margin: 12px 16px 20px;
      }
      ui-section > ui-table.tldr-table > table {
        table-layout: fixed;
        width: 100%;
        min-width: 860px;
      }
      .tldr-table col.tldr-col-pick {
        width: 20%;
      }
      .tldr-table col.tldr-col-facts {
        width: 22%;
      }
      .tldr-table td > p,
      .tldr-table td.tldr-facts > p {
        margin: 0 0 4px;
      }
      .tldr-table td p {
        max-width: none;
      }
      .tldr-table td > p:last-child {
        margin-bottom: 0;
      }
      .tldr-table td > p.tldr-dev-head {
        margin: 8px 0 2px;
      }
      .tldr-table ul.tldr-dev {
        margin: 0;
        padding-inline-start: 20px;
      }
      .tldr-table ul.tldr-dev > li {
        margin: 0 0 2px;
        max-width: none;
      }
      .tldr-table .tldr-why {
        color: var(--spell-muted, var(--ui-text-muted, #767676));
      }
      .tldr-table ui-section.tldr-holder::part(title) {
        display: none;
      }
      body.spell-doc-page .spell-doc-main ui-section.tldr-holder > * {
        margin-inline: 0 !important;
      }
      .tldr-table ui-section.tldr-holder epic-ask + epic-ask {
        margin-top: 8px;
      }
    </style>`

let html = fs.readFileSync(PAGE, "utf8")
html = html.replace(/\s*<style id="tldr-layout">[\s\S]*?<\/style>/, "")
html = html.replace("</head>", `    ${STYLE}\n  </head>`)
const start = html.indexOf('<p class="lede">')
const end = html.indexOf('<epic-text-box type="notes">')
const head = `<p class="lede">
  Every recommendation from this epic's pages in one ranked list, most valuable first, one or two sentences each.<br>
  Pick Yes, No, Modify or Revisit and a priority for each; the details stay on the pages each item links.
</p>
<div class="spell-details-meta">
  <epic-field label="Asked by" data-details-by>session <code>solid-2-final</code> (its writer agent), after the analysis, web performance and streams pages</epic-field>
  <epic-field label="Asked" data-details-asked>2026-11-20</epic-field>
</div>

<ui-message class="spell-where" state="info" heading="Where we are">
  <epic-field label="Epic"><code>solid-2-final</code>:  moving Spell onto the stable Solid 2.0, and making what's built on it faster and simpler.</epic-field>
  <epic-field label="Just now">You said the pages hold too much to decide piecemeal, and asked for one ranked list, in a table per section.</epic-field>
  <epic-field label="This page">${total} items in ${out.length} sections.  ${decidedCount} are already decided (marked so, kept at their rank); the rest wait for your pick.</epic-field>
  <epic-field label="How to read it">
    <b>Risk</b>:  low, medium or high, to what Spell does today.
    <b>LOE</b>:  S is a day or two, M a week, L a phase or more.
    <b>Complexity</b>:  0 adds nothing to understand, -10 simplifies more than it adds, +10 adds as much as a feature we already have.
    <b>Priority</b>:  1 first, 3 last.
    <b>Depends</b>:  what must come first, what it unblocks, what it overlaps;  hover a number for its title.
  </epic-field>
</ui-message>
`
if (start < 0 || end < 0) throw new Error("the page has no lede or no notes box")
html = html.slice(0, start) + head + body + "\n" + foldedHtml + "\n" + html.slice(end)
fs.writeFileSync(PAGE, html)
console.log(
  `${total} items (${decidedCount} decided) in ${out.length} sections;  top five open:`,
  top5.map((i) => `${i.rank} ${i.short}`).join(" | ")
)
