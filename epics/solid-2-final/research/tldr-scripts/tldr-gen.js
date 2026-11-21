const fs = require("fs")
const path = require("path")
const groups = require("./merge.js")
const { byIndex, decided, folded } = require("./tldr-overlay.js")
const PAGE = "/Users/owen/www/spell/spell.epics/epics/solid-2-final/details/solid-tldr.html"
const PRI_LETTERS = process.env.PRI_LETTERS === "abc" ? ["A", "B", "C"] : ["1", "2", "3"]

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

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
for (const g of out) for (const it of g.items) { it.rank = ++rank; byKey[it.key] = it }
for (const g of out) for (const it of g.items) for (const [k] of it.deps) if (!byKey[k]) throw new Error(`unknown dep ${k} in ${it.key}`)

const sign = (n) => (n > 0 ? `+${n}` : `${n}`)
const why = (w) => (w ? `, ${esc(w)}` : "")

function itemHtml(it) {
  const id = `q${it.rank}`
  const links = it.links.map(([href, text]) => `<a href="${esc(href)}">${esc(text)}</a>`).join(" · ")
  const deps = it.deps.length
    ? it.deps.map(([k, how]) => `${esc(how)} <a href="#q${byKey[k].rank}">${byKey[k].rank} · ${esc(byKey[k].title)}</a>`).join(";  ")
    : "none"
  let decidedLine = ""
  if (it.isDecided) {
    const d = it.decision
    const parts = []
    for (let i = 0; i < d.length; i += 2) parts.push(`<a href="${esc(d[i])}">${esc(d[i + 1])}</a>`)
    decidedLine = `<p><ui-label size="mini" color="green">Already decided</ui-label> You picked Yes:  ${parts.join(";  ")}.</p>`
  }
  const opt = (letter, title, body, rec) =>
    `<epic-option letter="${letter}" title="${title}"${rec ? " recommended" : ""}><p>${body}</p></epic-option>`
  const r = it.isDecided ? "Y" : it.rec
  const sel = it.isDecided ? " selected" : ""
  const pr = it.pri[0]
  return `
<ui-section id="${id}" label="${it.rank} · ${esc(it.title)}" collapsible dividing>
  <ui-icon slot="icon" name="${it.isDecided ? "check" : "circle question"}"></ui-icon>
  <epic-ask name="${id}">
    <epic-question>
      ${decidedLine}
      <p>${esc(it.text)}</p>
      <p><b>Read:</b> ${links}</p>
      <p><b>Risk</b> ${esc(it.risk[0])}${why(it.risk[1])} · <b>LOE</b> ${esc(it.loe[0])}${why(it.loe[1])} · <b>Complexity</b> ${sign(it.cx[0])}${why(it.cx[1])}</p>
      <p><b>Depends:</b> ${deps}</p>
    </epic-question>
    <epic-choices fixed${it.isDecided ? '' : ""}>
      ${opt("Y", "Yes", "Do it as described.", r === "Y").replace("<epic-option ", `<epic-option${sel} `)}
      ${opt("N", "No", "Don't do it.", r === "N")}
      ${opt("M", "Modify", "Do it differently:  say how in its comment box.", r === "M")}
      ${opt("R", "Revisit", "Not now:  ask again later.", r === "R")}
    </epic-choices>
  </epic-ask>
  <epic-ask name="${id}-priority">
    <epic-question><p><b>Priority</b> ${pr}, ${esc(it.pri[1])}.  Pick another to change when it's tackled.</p></epic-question>
    <epic-choices fixed>
      ${opt(PRI_LETTERS[0], "Priority 1", "First.", pr === 1)}
      ${opt(PRI_LETTERS[1], "Priority 2", "Next.", pr === 2)}
      ${opt(PRI_LETTERS[2], "Priority 3", "Later.", pr === 3)}
    </epic-choices>
  </epic-ask>
</ui-section>`
}

const total = rank
const decidedCount = decided.length
const top5 = out.flatMap((g) => g.items).filter((i) => !i.isDecided).slice(0, 5)

const body = out
  .map(
    (g) => `
<ui-section id="g-${g.id}" label="${esc(g.label)}" sticky collapsible dividing>
  <ui-icon slot="icon" name="list ol"></ui-icon>
  ${g.items.map(itemHtml).join("\n")}
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

let html = fs.readFileSync(PAGE, "utf8")
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
  <epic-field label="Just now">You said the pages hold too much to decide piecemeal, and asked for one ranked list.</epic-field>
  <epic-field label="This page">${total} items in ${out.length} groups.  ${decidedCount} are already decided (marked so, kept at their rank); the rest wait for your pick.</epic-field>
  <epic-field label="How to read it">
    <b>Risk</b>:  low, medium or high, to what Spell does today.
    <b>LOE</b>:  S is a day or two, M a week, L a phase or more.
    <b>Complexity</b>:  0 adds nothing to understand, -10 simplifies more than it adds, +10 adds as much as a feature we already have.
    <b>Priority</b>:  1 first, 3 last.
    <b>Depends</b>:  what must come first, what it unblocks, what it overlaps.
  </epic-field>
</ui-message>
`
html = html.slice(0, start) + head + body + "\n" + foldedHtml + "\n" + html.slice(end)
fs.writeFileSync(PAGE, html)
console.log(`${total} items (${decidedCount} decided); top five open:`, top5.map((i) => `${i.rank} ${i.title}`).join(" | "))
