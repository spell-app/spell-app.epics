// Draws Solitaire's files in the bubbly look:  each file's plain twin, and the card in tags, as HTML fragments.
// - Each plain twin's colouring comes from the parser (`SP.SpellHighlighter.spans()`, <name>.plain.spans.json):
//   each span's kind says pill, bold, italic or plain.
// - Owen's rules, from his comments on card-bubbly.html:
//   - references bold (`its rank`, `the deck`, `a new card`);  `it`/`its`/`them` never (C5)
//   - VALUES in steps italic:  texts, numbers, yes and no, a list's values (`queen`, `spades`), and the phrases a
//     project declares, as called (`is a face card`, `is a queen`, `is face up`) (C17-C19)
//   - a list of values is one pill (C21);  no colon ends a line (C8)
//   - a one-line comment right above a declaration is its description:  the first line INSIDE its block, a comment
//     ("ditch the description thing and put it as a comment INSIDE the block";  was C7's `with description "..."`)
//   - an ability is a word before the template, in italics (C6, C10)
import { readFileSync, writeFileSync } from "node:fs"

const here = new URL(".", import.meta.url).pathname
const FILES = [
  { name: "card", prefix: "plain" },
  { name: "solitaire", prefix: "solitaire" },
  { name: "deck", prefix: "deck" },
  { name: "pile", prefix: "pile" }
]
const tagged = readFileSync(here + "card.source.spell", "utf8")

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

// a QUOTED pill:  the file's own `"` either side, as text INSIDE its white, so a copied line copies them
// (Owen, 2026-11-11:  "the quotes need to be outside of the white bubbles, and the quotes must copy when you copy the line")
const quoted = (words) =>
  `<span class="bubbly-quoted"><span class="bubbly-input"><span class="bubbly-quote-mark bubbly-quote-open">"</span>${words}<span class="bubbly-quote-mark bubbly-quote-close">"</span></span></span>`
// `item`:  Spell's word in `item 3 of the list`, though the highlighter marks it a variable (a gap, reported)
const NOT_BOLD = new Set(["it", "its", "them", "they", "him", "her", "item", "new"])

////////////////
// ## The file being drawn:  its twin, its spans, where its lines start
////////////////

let plain = ""
let spans = []
let lineStarts = []
let prefix = "plain"
function useFile(name, filePrefix) {
  plain = readFileSync(here + `${name}.plain.spell`, "utf8")
  spans = JSON.parse(readFileSync(here + `${name}.plain.spans.json`, "utf8"))
  prefix = filePrefix
  lineStarts = []
  let at = 0
  for (const line of plain.split("\n")) {
    lineStarts.push(at)
    at += line.length + 1
  }
}

////////////////
// ## Values and phrases:  what reads in italics in a step (C17-C19)
////////////////

/** Every file's twin, for what the project declares:  its lists' values, its phrases. */
const ALL = FILES.map(({ name }) => readFileSync(here + `${name}.plain.spell`, "utf8")).join("\n")
/** A list's values, by the property's name:  `rank` => `ace`, `2`, ... `king`;  a range spelled out. */
const LISTS = new Map([["direction", ["up", "down"]]])
for (const [, property, list] of ALL.matchAll(/- its "([^"]+)" is one of ([^:\n]+)/g)) {
  const values = []
  for (const each of list.split(/, | or /)) {
    const range = /^(\d+) \.\.\. (\d+)$/.exec(each.trim())
    if (range) for (let n = Number(range[1]); n <= Number(range[2]); n++) values.push(String(n))
    else values.push(each.trim())
  }
  LISTS.set(property, values)
}
/** A value as a step may say it:  as listed, or one of it (`clubs`, `a club`). */
const formsOf = (value) => [...new Set([value, value.replace(/s$/, ""), value + "s"])]
/** The phrases the project declares (`it "is a face card"`), and the two sided view's own (`is face (direction)`). */
const PHRASES = [...new Set([...ALL.matchAll(/- it "([^"]+)"/g)].map((m) => m[1]).concat(["is face (direction)"]))]
const phrasePattern = (phrase) =>
  phrase
    .replace(/[.*+?^${}|[\]\\]/g, "\\$&")
    .replace(/^is /, "(?:is not|isn't|is) ")
    .replace(/\\?\((\w+)\\?\)/g, (_, list) => `(?:${(LISTS.get(list) ?? ["\\w+"]).flatMap(formsOf).join("|")})`)
// a phrase with a list's slot (`is a (rank)`, `is face (direction)`) reads a CONSTANT, as `it is a queen` does since P39:
// its value is semibold and upright, as a use (Owen, 2026-11-11:  "same for e.g. `ace` and `clubs` -- semibold");
// a phrase with no slot (`is a face card`) is a value called, in italics (C18)
const SLOT_PHRASES = PHRASES.filter((phrase) => /\(\w+\)/.test(phrase))
const PLAIN_PHRASES = PHRASES.filter((phrase) => !/\(\w+\)/.test(phrase))
const PHRASE = new RegExp(`\\b(?:${PLAIN_PHRASES.map(phrasePattern).join("|")})\\b`, "g")
const SLOT_PHRASE = new RegExp(`\\b(?:${SLOT_PHRASES.map(phrasePattern).join("|")})\\b`, "g")
const YES_NO = /\b(?:yes|no)\b/g
/** Every list's values, each as a step may say it:  on a declaration's line, a bare one is a pill (C28:  `suit = diamonds`). */
const LIST_VALUES = [...new Set([...LISTS.values()].flat().flatMap(formsOf))].filter((value) => /^[a-z]/i.test(value))
// not where it names a property or a thing (`the clubs`, `its suit`):  only where it's a value given or compared
const LIST_VALUE = new RegExp(`(?<!\\b(?:the|its|their|a|an) )\\b(?:${LIST_VALUES.join("|")})\\b`, "g")
// in a step, `a queen` is the value too (`it is a queen`);  only `the clubs`, `its suit` name something else
const STEP_LIST_VALUE = new RegExp(`(?<!\\b(?:the|its|their) )\\b(?:${LIST_VALUES.join("|")})\\b`, "g")

/** The stretches of `text` (a step) that are a list's values, read as constants:  semibold and upright, as a use. */
function constantRanges(text) {
  const ranges = [...text.matchAll(STEP_LIST_VALUE)].map((m) => [m.index, m.index + m[0].length])
  // the two sided view's direction as said:  `turn it face up` (not `face up cards`, a name)
  for (const m of text.matchAll(/\bface (?:up|down)\b(?! cards)/g)) ranges.push([m.index, m.index + m[0].length])
  // a slot phrase's value:  what follows its `is` (`is a queen`:  `queen`;  `is face up`:  `face up`)
  for (const m of text.matchAll(SLOT_PHRASE)) {
    const lead = /^(?:is not|isn't|is) (?:an? )?/.exec(m[0])[0]
    ranges.push([m.index + lead.length, m.index + m[0].length])
  }
  return ranges
}

/** The stretches of `text` (a step) that are values:  `[from, to]` within it. */
function valueRanges(text) {
  const ranges = []
  // `yes or no` is a TYPE (`its "lifted" is yes or no`), not two values
  const types = [...text.matchAll(/\byes or no\b/g)].map((m) => [m.index, m.index + m[0].length])
  const isType = (at) => types.some(([a, b]) => at >= a && at < b)
  for (const pattern of [PHRASE, YES_NO])
    for (const m of text.matchAll(pattern)) if (!isType(m.index)) ranges.push([m.index, m.index + m[0].length])
  return ranges
}

////////////////
// ## Parts of speech
////////////////

const THING_TAGS = new Set(
  "view thing app page site notebook stories page-template app-template extend web-server graphql-server data-folder json-file room sheet csv-file excel-file google-sheet airtable atmosphere device-storage window-storage memory-storage".split(
    " "
  )
)
const ACTION_TAGS = new Set("action event draw on when while if otherwise for".split(" "))
// `group`:  grey, a setting like `- it is draggable` (Owen's C2 on card-bubbly.html)
const PROPERTY_TAGS = new Set("property alias".split(" "))
const kindOfTag = (word) =>
  THING_TAGS.has(word) ? "thing" : ACTION_TAGS.has(word) ? "action" : PROPERTY_TAGS.has(word) ? "property" : "plain"
function kindOfLine(text) {
  const t = text.trim()
  if (/^- to test\b/.test(t)) return "plain"
  // a group is grey (Owen's C2)
  if (/^- group\b/.test(t)) return "plain"
  if (/^-? ?(to|when|on|while)\b/.test(t)) return "action"
  // a member named by its quotes alone, `- "stock" is a new stock pile`
  if (/^- "/.test(t)) return "property"
  if (/^- (its|it|group)\b/.test(t) && /"/.test(t)) return "property"
  if (/^- /.test(t)) return "plain"
  return "thing"
}

////////////////
// ## A line's pieces, from the parser's spans
////////////////

/** Pieces of `plain.slice(start, end)`:  `{ text, as }`, `as` one of plain, bold, italic, pill, qpill, faint, comment. */
function piecesOf(start, end, { head, given = false }) {
  const mine = spans.filter((span) => span.start >= start && span.end <= end)
  const pieces = []
  let at = start
  const push = (from, text, as, kind) => text && pieces.push({ from, text, as, kind })
  for (const span of mine) {
    if (span.start > at) push(at, plain.slice(at, span.start), "plain")
    const text = plain.slice(span.start, span.end)
    push(span.start, text, asOf(span.kind, text, { head, given, lineStart: span.start === start }), span.kind)
    at = span.end
  }
  if (end > at) push(at, plain.slice(at, end), "plain")
  const shift = (ranges) => ranges.map(([a, b]) => [start + a, start + b])
  let valued = head ? pieces : italicize(pieces, shift(valueRanges(plain.slice(start, end))))
  // on a declaration's line, a bare list value is a pill, as a quoted text is (C26-C28)
  if (head || given)
    valued = italicize(valued, shift([...plain.slice(start, end).matchAll(LIST_VALUE)].map((m) => [m.index, m.index + m[0].length])), "pill")
  // in a step, a list's value is a constant:  semibold, upright, as a use (Owen, 2026-11-11)
  else {
    valued = italicize(valued, shift(constantRanges(plain.slice(start, end))), "const")
    // a phrase called, whole (`is a diamond`, `is face up`, `is a face card`):  one unit, dotted, not bold (Owen, 2026-11-11)
    valued = italicize(valued, shift([...plain.slice(start, end).matchAll(SLOT_PHRASE), ...plain.slice(start, end).matchAll(PHRASE)].map((m) => [m.index, m.index + m[0].length])), "phrase")
  }
  return mergeRuns(valued, { head }).map((piece) => ({ ...piece, head }))
}

/** `pieces` with each stretch in `ranges` (offsets into `plain`) in italics:  a piece split where a stretch starts or ends. */
function italicize(pieces, ranges, as = "italic") {
  if (!ranges.length) return pieces
  const inside = (at) => ranges.some(([a, b]) => at >= a && at < b)
  const out = []
  for (const piece of pieces) {
    // a comment, and what's a pill already (a quoted name or text), stay whole;  a text stays a text, never a constant
    if (
      piece.as === "comment" ||
      piece.as === "qpill" ||
      (as === "pill" && piece.as === "pill") ||
      (as === "const" && ["string", "variable", "params"].includes(piece.kind))
    ) {
      out.push(piece)
      continue
    }
    let run = ""
    let runItalic
    let runFrom = piece.from
    for (let i = 0; i < piece.text.length; i++) {
      const italic = inside(piece.from + i)
      if (runItalic !== undefined && italic !== runItalic) {
        out.push({ from: runFrom, text: run, as: runItalic ? as : piece.as, kind: piece.kind })
        run = ""
        runFrom = piece.from + i
      }
      runItalic = italic
      run += piece.text[i]
    }
    if (run) out.push({ from: runFrom, text: run, as: runItalic ? as : piece.as, kind: piece.kind })
  }
  return out
}

/**
 * How a span of `kind` draws:  in a head, what was typed is a pill;  in a step, a value is italic, a reference bold.
 * - `given`:  the worked-out part of a declaration's line (`is a new foundation with name = "clubs"`):  a step, but
 *   what was typed is still a pill (C26-C28)
 */
function asOf(kind, text, { head, given, lineStart }) {
  const quoted = text.startsWith('"')
  if (given && (kind === "string" || kind === "literal" || kind === "number")) return quoted ? "qpill" : "pill"
  switch (kind) {
    case "comment":
    case "section":
      return "comment"
    case "operator":
      if (text === "-" && lineStart) return "plain"
      return text === ":" || text === "," ? "faint" : "plain"
    case "string":
      return head && quoted ? "qpill" : "italic"
    case "property":
    case "type":
    case "title.function":
      if (quoted) return head ? "qpill" : "italic"
      if (kind === "title.function" && head) return "pill"
      return NOT_BOLD.has(text) ? "plain" : "bold"
    case "variable":
    case "params":
      return NOT_BOLD.has(text) ? "plain" : "bold"
    // a list's value (`ace`, `clubs`, `up`):  in a step a constant, semibold and upright (Owen, 2026-11-11)
    case "literal":
      return head ? "pill" : "const"
    case "number":
      return head ? "pill" : "italic"
    default:
      return "plain"
  }
}

/**
 * Join neighbours that are one thing to a reader:  words of one bold name (`two sided view`), of one unquoted pill
 * (`card setup`), a range (`2 ... 10`), and a run of italics (`queen of spades`).
 */
function mergeRuns(pieces, { head }) {
  const out = []
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i]
    const prev = out.at(-1)
    const gap = out.at(-1)?.as === "plain" ? out.at(-1) : undefined
    // a range in a head:  `2`, ` `, `...`, ` `, `10`
    if (head && piece.as === "pill" && out.length >= 2) {
      const between = out.at(-1)
      const before = out.at(-2)
      if (before.as === "pill" && between.as === "plain" && /^\s*\.\.\.\s*$/.test(between.text)) {
        out.pop()
        before.text += between.text + piece.text
        continue
      }
    }
    // a reference takes its article:  `a new card`, `the deck` all bold (Owen's C5, and his first picture)
    if (!head && piece.as === "bold" && prev?.as === "plain") {
      const article = /(?:^|\s)((?:the|a new|an new) )$/i.exec(prev.text)
      if (article) {
        prev.text = prev.text.slice(0, prev.text.length - article[1].length)
        if (!prev.text) out.pop()
        out.push({ text: article[1] + piece.text, as: "bold", kind: piece.kind })
        continue
      }
    }
    // words of one name:  a space between two of the same
    if (gap && /^ $/.test(gap.text) && out.at(-2)?.as === piece.as && (piece.as === "bold" || piece.as === "pill")) {
      out.pop()
      out.at(-1).text += gap.text + piece.text
      continue
    }
    if (prev && prev.as === piece.as && ["plain", "faint", "italic", "const", "phrase"].includes(piece.as)) {
      prev.text += piece.text
      continue
    }
    out.push({ ...piece })
  }
  return out
}

////////////////
// ## A name's first mention, or a use (Owen, 2026-11-11)
////////////////

/**
 * The names each declaration introduces, innermost last:  a loop's variable, a local set the first time, an action's
 * parameter.  Its first mention is bold (`--bubbly-bold`);  every later one, and what's declared elsewhere, semibold.
 */
const scopes = [new Set()]
/** Is the declaration whose head is being drawn an action (its parameters are first mentions)? */
let headIsAction = false
const nameOf = (text) =>
  text
    .toLowerCase()
    .replace(/^(?:the|a new|an new|a|an) /, "")
    .replace(/'s?$/, "")
const inScope = (name) => scopes.some((scope) => scope.has(name))
/** Draw `body` inside a new scope:  the names a declaration's head and body introduce stay in it. */
function scoped(isAction, body) {
  scopes.push(new Set())
  const before = headIsAction
  headIsAction = isAction
  try {
    return body()
  } finally {
    scopes.pop()
    headIsAction = before
  }
}

/**
 * Is this bold piece a name's first mention?  Else a use.
 * - in a step:  a variable named bare (`set column to`, `for card in`, `letter is ...`) the first time in its scope
 * - in an action's head:  its parameter, the type after `a`/`an` (`- to play a card`)
 * - everything else (a property, a type, `the deck`, a name already introduced):  a use
 */
function isFirstMention(piece, before, after) {
  const name = nameOf(piece.text)
  // an owner, `solitaire's hint`:  what's declared elsewhere, a use (its `the` dropped, Owen, 2026-11-11)
  if (/^'s\b/.test(after?.text ?? "")) return false
  if (piece.head) {
    if (headIsAction && piece.kind === "type" && /\b(?:a|an) $/.test(before?.text ?? "") && !inScope(name)) {
      scopes.at(-1).add(name)
      return true
    }
    return false
  }
  if (piece.kind !== "variable" && piece.kind !== "params") return false
  if (/^(?:the|a|an) /i.test(piece.text) || inScope(name)) return false
  scopes.at(-1).add(name)
  return true
}

const htmlOf = (pieces) =>
  pieces
    .map((piece, index) => {
      const { text, as } = piece
      switch (as) {
        case "bold":
          return isFirstMention(piece, pieces[index - 1], pieces[index + 1]) ? `<span class="bubbly-reference bubbly-first-mention">${esc(text)}</span>` : `<span class="bubbly-reference bubbly-use">${esc(text)}</span>`
        case "const":
          return `<span class="bubbly-reference bubbly-use bubbly-constant">${esc(text)}</span>`
        case "italic":
          return `<span class="bubbly-value">${esc(text)}</span>`
        case "pill":
          return `<span class="bubbly-input">${esc(text)}</span>`
        case "qpill":
          return `${quoted(esc(text.replace(/^"|"$/g, "")))}`
        case "phrase":
          return `<span class="bubbly-phrase">${esc(text)}</span>`
        case "faint":
          return `<span class="bubbly-mark">${esc(text)}</span>`
        case "comment":
          return `<span class="bubbly-comment">${esc(text)}</span>`
        default:
          return esc(text)
      }
    })
    .join("")
    // a number and its unit, one quantity (`300 msec`, `30 ticks`):  a very light dotted underline under both
    .replace(/(<span class="bubbly-value">\d+(?:\.\d+)?<\/span>) (msec|milliseconds?|sec|seconds?|ticks?|minutes?)\b/g, '<span class="bubbly-quantity">$1 $2</span>')

////////////////
// ## A drawing's line:  its tags, drawn as the analysis page draws them
////////////////

/** `<text color={its color}>{its picture}</text>`:  marks faint, tag names a shade, values pills, braces' refs bold. */
function drawingHtml(line, from = 0) {
  let out = ""
  let i = 0
  while (i < line.length) {
    const tag = /^<(\/?)([a-z][\w-]*)?/i.exec(line.slice(i))
    if (tag && line[i] === "<") {
      out += `<span class="bubbly-mark">&lt;${tag[1]}</span>`
      if (tag[2]) out += `<span class="bubbly-tag">${esc(tag[2])}</span>`
      i += tag[0].length
      // attributes, up to `>` or `/>`
      while (i < line.length && line[i] !== ">" && !line.startsWith("/>", i)) {
        const attr = /^(\s+)([\w-]+)(?:=("[^"]*"|\{[^}]*\}))?/.exec(line.slice(i))
        if (!attr) {
          out += esc(line[i])
          i++
          continue
        }
        out += attr[1] + esc(attr[2])
        const value = attr[3]
        if (value?.startsWith('"'))
          out += `<span class="bubbly-mark">=</span>${quoted(esc(value.slice(1, -1)))}`
        else if (value) out += `<span class="bubbly-mark">={</span>${refsOf(value.slice(1, -1), from)}<span class="bubbly-mark">}</span>`
        i += attr[0].length
      }
      if (line.startsWith("/>", i)) {
        out += `<span class="bubbly-mark">/&gt;</span>`
        i += 2
      } else if (line[i] === ">") {
        out += `<span class="bubbly-mark">&gt;</span>`
        i++
      }
      continue
    }
    if (line[i] === "{") {
      const close = line.indexOf("}", i)
      out += `<span class="bubbly-mark">{</span>${refsOf(line.slice(i + 1, close), from)}<span class="bubbly-mark">}</span>`
      i = close + 1
      continue
    }
    const next = line.slice(i).search(/[<{]/)
    const text = next < 0 ? line.slice(i) : line.slice(i, i + next)
    out += esc(text)
    i += text.length
  }
  return out
}

/** Spell inside braces:  `its color` => `its <span class="bubbly-reference">color</span>`, from the plain twin's spans where it says the same. */
function refsOf(snippet, from = 0) {
  const found = findInPlain(snippet, from)
  if (found !== undefined) return htmlOf(piecesOf(found, found + snippet.length, { head: false }))
  return esc(snippet)
}

/** Where the plain twin says `snippet`, as an offset:  the first place. */
function findInPlain(snippet, from = 0) {
  const at = plain.indexOf(snippet, from)
  return at < 0 ? undefined : at
}

////////////////
// ## Lines into blocks, by indent
////////////////

/** Each line:  its indent (tabs), its text without them, and where it starts in `source`. */
function linesOf(source) {
  const lines = []
  let at = 0
  for (const raw of source.split("\n")) {
    const indent = /^\t*/.exec(raw)[0].length
    lines.push({ raw, indent, text: raw.slice(indent), start: at + indent, end: at + raw.length, children: [] })
    at += raw.length + 1
  }
  while (lines.length && !lines.at(-1).text.trim()) lines.pop()
  // a blank line belongs where the next line is
  for (let i = lines.length - 1; i >= 0; i--)
    if (!lines[i].text.trim()) lines[i].indent = lines[i + 1]?.indent ?? 0
  return lines
}

/** Nest `lines` by indent:  each line's children are the deeper lines right after it. */
function treeOf(lines) {
  const root = { indent: -1, children: [] }
  const stack = [root]
  for (const line of lines) {
    while (stack.at(-1).indent >= line.indent) stack.pop()
    stack.at(-1).children.push(line)
    stack.push(line)
  }
  return root.children
}

const ids = new Set()
/**
 * Blocks whose line changed to Owen's form keep the id his comment was left on, so its thread stays beside the change:
 * C3, C11 and C21 were left on `plain-is-a-rank`, the rank's line since C3;  C6 on `- it is draggable`.
 */
const KEPT_IDS = [
  [/^- its "rank" is one of /, "plain-is-a-rank"],
  [/^- its "suit" is one of /, "plain-is-a-suit"]
]
/**
 * Solitaire's handlers kept their ids from when each was one line (`- on click play it`), before its step moved into its
 * body (Owen, 2026-11-11):  matched by the head and its first step;  the pile's own `- on click:` keeps `solitaire-on-click`
 */
const KEPT_HANDLER_IDS = [
  [/^- to restart the game: /, "solitaire-to-start-a-new-game"],
  [/^- when its moves change: clear the hint$/, "solitaire-when-its-moves-change-clear-the-hint"],
  [/^- on click: play it$/, "solitaire-on-click-play-it"],
  [/^- when dragged: clear solitaire's hint$/, "solitaire-when-dragged-clear-the-solitaire-s-hint"],
  [/^- on drag cancelled: set solitaire's hint to /, "solitaire-not-there"]
]
const keptIdOf = (text, step = "") =>
  prefix === "plain"
    ? KEPT_IDS.find(([pattern]) => pattern.test(text))?.[1]
    : prefix === "solitaire"
      ? KEPT_HANDLER_IDS.find(([pattern]) => pattern.test(`${text} ${step}`))?.[1]
      : undefined
function idFor(idPrefix, words) {
  const slug = words
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
  let id = `${idPrefix}-${slug || "block"}`
  for (let n = 2; ids.has(id); n++) id = `${idPrefix}-${slug}-${n}`
  ids.add(id)
  return id
}


/**
 * A band's ends:  where its first or last thing is a white pill, it sits as evenly inset at that end as above and below
 * it, a pill in a pill (Owen, 2026-11-11);  an end with Spell's own words (`solitaire is an app`) keeps its padding.
 */
function pillEnds(html) {
  const trimmed = html.trim()
  const starts = /^(?:<span class="bubbly-quoted">|<span class="bubbly-input">)/.test(trimmed)
  const ends = /(?:"<\/span><\/span><\/span>|<span class="bubbly-input">[^<]*<\/span>)$/.test(trimmed)
  return (starts ? " bubbly-starts-input" : "") + (ends ? " bubbly-ends-input" : "")
}

/** A block the comments anchor to:  a `<ui-section>` with an id, no look of its own. */
const section = (id, inner) => `<ui-section class="bubbly-section" id="${id}">${inner}</ui-section>`

////////////////
// ## The plain twin
////////////////

/**
 * A declaration's head line:  its own words as a head (its name a pill), what it's worked out from as a step
 * (references bold, values italic);  a list of values (`is one of red, black`) is the head's, ONE pill (C21).
 * - `- to draw its front`:  `front` is the name a person gave that side, so a pill;  `- to draw it` is all Spell's
 * - `node.text` has no colon at its end (C8):  `node.end` is where its words end
 */
function headHtml(node) {
  const text = node.text
  const drawing = /^- to draw (it|its (\w+))$/.exec(text)
  if (drawing) return drawing[2] ? `- to draw its <span class="bubbly-input">${esc(drawing[2])}</span>` : `- to draw it`
  const ability = /^(a|an) "([^"]+)" is (a|an) (draggable|clickable|selectable|droppable) (.+)$/.exec(text)
  if (ability) {
    const [, a, named, an, word, template] = ability
    // the ability in italics (C10, after C9's bold)
    return `${a} ${quoted(esc(named))} is ${an} <span class="bubbly-value">${word}</span> <span class="bubbly-reference bubbly-use">${esc(template)}</span>`
  }
  const list = /^(.*? is one of )(.+)$/.exec(text)
  // each of its values an input of its own, bold (Owen, 2026-11-11:  "changed my mind, these should each be inputs w/bold
  // font";  was C21's one pill for the whole list);  `2 ... 10` stays one, a range
  if (list) {
    const values = list[2]
      .split(/(, | or )/)
      .map((part, index) => (index % 2 ? (part === ", " ? `<span class="bubbly-mark">,</span> ` : esc(part)) : `<span class="bubbly-input bubbly-choice">${esc(part)}</span>`))
      .join("")
    return htmlOf(piecesOf(node.start, node.start + list[1].length, { head: true })) + values
  }
  const name = /"[^"]*"/.exec(text)
  const after = name ? text.slice(name.index + name[0].length) : ""
  const value = /^ (is|if) (?=\S)/.exec(after)
  if (!name || !value || /^ is$/.test(after)) return htmlOf(piecesOf(node.start, node.end, { head: true }))
  const split = node.start + name.index + name[0].length + value[0].length
  // after `if`, a condition:  a step, its list values constants, bold as a use, not inputs
  // (`it "is a face card" if its rank is jack, queen or king`;  Owen, 2026-11-11)
  const given = value[1] === "is"
  return htmlOf(piecesOf(node.start, split, { head: true })) + htmlOf(piecesOf(split, node.end, { head: false, given }))
}

////////////////
// ## Owen's forms (card.assumes.json):  drawn as he'd write them, from the twin as Spell reads it today
////////////////

/** C7's comment, in Owen's own shorter words. */
const DESCRIBED = new Map([["// What a person, a test or the console calls it", "What a person, test or console calls it"]])
/** An alias of a property's values, its own line today:  `- it "is a (rank)"`. */
const VALUES_ALIAS = /^- it "(is an? \(\w+\))"$/
/** An ability, its own line today:  `- it is draggable` (C6). */
const ABILITY = /^- it is (draggable|clickable|selectable|droppable)$/
/** A line Spell reads as declaring something, at a file's top:  a type, an action, a handler, a relation. */
const declaresAtTop = (node) =>
  node.children.some((child) => child.text.trim()) ||
  /:$/.test(node.text) ||
  /^(a|an|to|on|when|while) /.test(node.text) ||
  / is (a|an) /.test(node.text)

/**
 * `node` as Owen would write it:  `{ shown, children, extra }`.
 * - `shown`:  its line's words, no colon at the end (C8);  C6 puts its ability before its template
 * - `children`:  what's left of its body (C6's ability line leaves it;  a values alias the language reads for free, C11)
 * - `extra`:  HTML after its head (none now:  a description is a comment inside the block, `plainBlock()`)
 */
function proposed(node) {
  let shown = node.text.replace(/:$/, "")
  let children = node.children
  let extra = ""
  // `it is a club` reads a suit by itself now (P39, `is_listed_value`):  the alias line goes;  a list with numbers
  // keeps its own, as `it is a 2` doesn't read without it (C11)
  const list = /^- its "[^"]+" is one of (.+)$/.exec(shown)
  if (list && !/\d/.test(list[1])) children = children.filter((child) => !VALUES_ALIAS.test(child.text))
  const ability = children.find((child) => ABILITY.test(child.text))
  if (ability && node.indent === 0) {
    children = children.filter((child) => child !== ability)
    shown = shown.replace(/ is (a|an) /, ` is $1 ${ABILITY.exec(ability.text)[1]} `)
  }
  return { shown, children, extra }
}

/**
 * Where C6's line was, `- it is draggable`, now in its head:  an empty block keeping that line's id, first in the body,
 * so Owen's comment on it still draws beside the change (a comment on a block that's gone draws at the page's top).
 */
const movedAbility = (shown) =>
  / is an? (draggable|clickable|selectable|droppable) /.test(shown.shown)
    ? section(prefix === "plain" ? (ids.add("plain-it-is-draggable"), "plain-it-is-draggable") : idFor(prefix, "it is draggable"), "")
    : ""

const isComment = (node) => node && /^\/\//.test(node.text)
const isDeclaration = (node, top) => !!node && node.text.trim() && !isComment(node) && !/^#/.test(node.text) && (top ? declaresAtTop(node) : /^- /.test(node.text))

/** A group's line:  `- group "rank"` in plain Spell, `<group "rank" .../>` in tags. */
/**
 * A group's name in Initial Caps, as a title (Owen, 2026-11-11:  `group "Game Play"`, "Change other group names to
 * Initial Caps as well");  drawn only:  each section's id keeps the file's own name, so comments stay put
 */
const GROUP_TITLES = new Map([["game", "Game Play"]])
const groupTitled = (html, isGroup) =>
  isGroup
    ? html.replace(/(bubbly-quote-open">"<\/span>)([^<]+)/, (_, open, name) => open + (GROUP_TITLES.get(name) ?? name.replace(/\b\w/g, (c) => c.toUpperCase())))
    : html

const isPlainGroup = (node) => !process.env.BUB_NO_GROUPS && !!node && /^- group\b/.test(node.text)
const isTagGroup = (node) => !process.env.BUB_NO_GROUPS && !!node && /^<group\b/.test(node.text)

/**
 * A group's MEMBERS, drawn inside the group's own body (Owen, 2026-11-11:  "can we reasonably nest e.g. the things
 * between `group rank` and `group suit` inside the group?").
 * - Spell's own meaning of a group (`DefineGroup`):  the members after it, up to the next group, are its members;
 *   so the plain twin's text doesn't change, only how it's drawn.
 * - Up to the next group, or the end of its template;  a member before any group stays where it is.
 * - The next group's description (a one-line comment right above it) and the blank lines before it stay outside.
 * - `n`:  the group's index in `nodes`;  returns its members, and the index of its last one.
 */
function groupMembers(nodes, n, isGroup) {
  let end = n + 1
  while (end < nodes.length && !isGroup(nodes[end])) end++
  if (end < nodes.length && end - 1 > n && isComment(nodes[end - 1]) && !isComment(nodes[end - 2])) end--
  while (end > n + 1 && !nodes[end - 1].text.trim()) end--
  return { members: nodes.slice(n + 1, end), last: end - 1 }
}

/**
 * `nodes` drawn in plain Spell.
 * - `base`:  the indent its lines count from;  each line says its own, `bubbly-indent-<n>` (0 at the body's edge)
 * - `level`:  how deep its declarations sit, `bubbly-level-<n>`:  0 at the top of the file, 1 inside its body ...;
 *   a group counts as a level, as its members sit in its body
 */
function plainBlock(nodes, base, inDrawing = false, level = 0) {
  let out = ""
  let description
  for (let n = 0; n < nodes.length; n++) {
    const node = nodes[n]
    const text = node.text
    const top = node.indent === 0
    const depth = Math.max(0, node.indent - base)
    const indentClass = ` bubbly-indent-${Math.min(depth, 4)}`
    if (!text.trim()) {
      out += `<div class="bubbly-gap"></div>`
      continue
    }
    if (/^#/.test(text)) {
      out += `<p class="bubbly-line bubbly-heading${indentClass}"><span class="bubbly-mark">${/^#+/.exec(text)[0]}</span>${esc(text.replace(/^#+/, ""))}</p>`
      continue
    }
    if (isComment(node)) {
      // a one-line comment right above a declaration is its description:  drawn as the first line inside its block
      if (!inDrawing && !isComment(nodes[n - 1]) && isDeclaration(nodes[n + 1], top)) {
        description = DESCRIBED.get(text) ?? text.replace(/^\/\/\s*/, "")
        continue
      }
      out += `<p class="bubbly-line bubbly-comment${indentClass}">${esc(text)}</p>`
      continue
    }
    const declares = !inDrawing && isDeclaration(node, top)
    if (declares) {
      const shown = proposed(node)
      // its description, the first line inside its block (Owen:  "put it as a comment INSIDE the block")
      const described = description ? `<p class="bubbly-line bubbly-comment bubbly-indent-0">// ${esc(description)}</p>` : ""
      description = undefined
      // a group holds the members after it (`groupMembers()`)
      const group = !inDrawing && isPlainGroup(node) ? groupMembers(nodes, n, isPlainGroup) : undefined
      if (group) n = group.last
      const kind = kindOfLine(text)
      const end = node.end - (node.text.length - shown.shown.length)
      // a description goes after the head's own words:  before an `is` its body finishes (`- its "state" with
      // description "..." is`), and before a step on the same line (`- when its moves change with description "...": clear the hint`)
      const sameWords = shown.shown === node.text.replace(/:$/, "")
      const inlineStep = shown.extra && sameWords ? /^(.*?)(: .+)$/.exec(shown.shown) : null
      const finishing = !shown.extra ? "" : inlineStep ? inlineStep[2] : / is$/.test(shown.shown) ? " is" : ""
      const words = finishing ? shown.shown.slice(0, -finishing.length) : shown.shown
      const name = /"([^"]+)"/.exec(text)?.[1] ?? text.replace(/^- /, "").replace(/:$/, "")
      const kept = keptIdOf(text, shown.children.find((child) => child.text.trim() && !/^\s*\/\//.test(child.text))?.text.trim())
      const id = kept ?? idFor(prefix, name)
      if (kept) ids.add(kept)
      const drawing = /^- to draw\b/.test(text)
      // its head and body in a scope of their own:  the names they introduce are first mentions there only
      out += scoped(kind === "action" || /^- to test\b/.test(text), () => {
        const finishingHtml = inlineStep
          ? `<span class="bubbly-mark">:</span>${htmlOf(piecesOf(node.start + words.length + 1, node.start + shown.shown.length, { head: false }))}`
          : esc(finishing)
        const drawn =
          headHtml({ ...node, text: words, end: sameWords ? node.start + words.length : end }) + shown.extra + finishingHtml
        // no line starts `- `:  Spell drops it anyway (Owen, 2026-11-11:  "`group` shouldn't need `-` in front of it",
        // then "Remove the `-` at the beginning of lines in the example")
        const head = groupTitled(drawn.replace(/^-\s+/, ""), isPlainGroup(node))
        // a group, by name:  its line has no `- `, so its words start further in (`--bubbly-group-pad-left`)
        const grouping = isPlainGroup(node) ? " bubbly-group" : ""
        // a block when it has a body, or a description to hold:  a declaration with no body gets one, just its comment;
        // a group, its members
        if (described || shown.children.some((child) => child.text.trim()) || group?.members.length)
          return section(
            id,
            `<div class="bubbly-block bubbly-${kind}${grouping} bubbly-level-${level}"><p class="bubbly-head${pillEnds(head)}">${head}</p><div class="bubbly-gutter"></div>` +
              `<div class="bubbly-body">${described}${movedAbility(shown)}${plainBlock(shown.children, node.indent + 1, drawing, level + 1)}` +
              `${group ? plainBlock(group.members, node.indent, false, level + 1) : ""}</div><div class="bubbly-foot"></div></div>`
          )
        return section(id, `<p class="bubbly-pill bubbly-${kind}${grouping} bubbly-level-${level}${pillEnds(head)}">${head}</p>`)
      })
      continue
    }
    // a step:  plain, its references bold, its values italic;  a drawing's tags and braces drawn as tags;  no colon at its end
    const words = text.replace(/:$/, "")
    const line =
      inDrawing && /^[<{]/.test(words) ? drawingHtml(words, node.start) : htmlOf(piecesOf(node.start, node.start + words.length, { head: false }))
    out += `<p class="bubbly-line${indentClass}">${line}</p>`
    out += plainBlock(node.children, base, inDrawing, level)
  }
  return out
}

////////////////
// ## The tag form
////////////////

/** A tag's head:  `<`, its word, its name in a pill, each attribute's name bold, its value a pill, `>`. */
function tagHeadHtml(head) {
  const m = /^<([\w-]+)/.exec(head)
  let out = `<span class="bubbly-mark">&lt;</span>${esc(m[1])}`
  let i = m[0].length
  while (i < head.length) {
    const rest = head.slice(i)
    if (/^\s*\/>/.test(rest)) {
      out += `${/^\s*/.exec(rest)[0]}<span class="bubbly-mark">/&gt;</span>`
      break
    }
    if (/^\s*>/.test(rest)) {
      out += `<span class="bubbly-mark">&gt;</span>`
      break
    }
    const name = /^(\s+)"([^"]*)"/.exec(rest)
    if (name) {
      out += `${name[1]}${quoted(esc(name[2]))}`
      i += name[0].length
      continue
    }
    const attr = /^(\s+)([\w-]+)(?:=("[^"]*"|\{[^}]*\}))?/.exec(rest)
    if (!attr) {
      out += esc(head[i])
      i++
      continue
    }
    out += `${attr[1]}<span class="bubbly-reference">${esc(attr[2])}</span>`
    const value = attr[3]
    // every quoted value one pill, a list's values too (C21)
    if (value?.startsWith('"')) out += `<span class="bubbly-mark">=</span>${quoted(esc(value.slice(1, -1)))}`
    else if (value) out += `<span class="bubbly-mark">={</span>${refsOf(value.slice(1, -1))}<span class="bubbly-mark">}</span>`
    i += attr[0].length
  }
  return out
}

/** Split a tag line into its head (up to its `>` or `/>`) and what follows on the same line. */
function splitTag(text) {
  let quote = false
  let brace = 0
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"' && !brace) quote = !quote
    else if (!quote && c === "{") brace++
    else if (!quote && c === "}") brace--
    else if (!quote && !brace && c === ">") return { head: text.slice(0, i + 1), rest: text.slice(i + 1) }
  }
  return { head: text, rest: "" }
}

/** `nodes` drawn in tags:  `base` and `level` as `plainBlock()`'s. */
function taggedBlock(nodes, base, inDrawing = false, level = 0) {
  let out = ""
  for (let n = 0; n < nodes.length; n++) {
    const node = nodes[n]
    const text = node.text
    const depth = Math.max(0, node.indent - base)
    const indentClass = ` bubbly-indent-${Math.min(depth, 4)}`
    if (!text.trim()) {
      out += `<div class="bubbly-gap"></div>`
      continue
    }
    if (node.indent === 0 && /^#/.test(text)) {
      out += `<p class="bubbly-line bubbly-heading${indentClass}"><span class="bubbly-mark">#</span>${esc(text.slice(1))}</p>`
      continue
    }
    if (node.indent === 0 && !/^</.test(text)) {
      out += `<p class="bubbly-line bubbly-prose${indentClass}">${esc(text)}</p>`
      continue
    }
    const tag = /^<([\w-]+)/.exec(text)
    if (tag && (!inDrawing || kindOfTag(tag[1]) !== "plain")) {
      const kind = kindOfTag(tag[1])
      const { head, rest } = splitTag(text)
      const name = /"([^"]+)"/.exec(head)?.[1] ?? tag[1]
      const id = idFor("tags", `${tag[1]} ${name}`)
      // a group holds the members after it, `<group "rank">...</group>` (`groupMembers()`)
      const group = !inDrawing && isTagGroup(node) ? groupMembers(nodes, n, isTagGroup) : undefined
      if (group?.members.length) {
        n = group.last
        const opened = head.replace(/\s*\/>$/, ">")
        out += section(
          id,
          `<div class="bubbly-block bubbly-${kind} bubbly-level-${level}"><p class="bubbly-head${pillEnds(tagHeadHtml(opened))}">${tagHeadHtml(opened)}</p><div class="bubbly-gutter"></div>` +
            `<div class="bubbly-body">${taggedBlock(group.members, node.indent, false, level + 1)}</div>` +
            `<p class="bubbly-foot bubbly-closer"><span class="bubbly-mark">${esc(`</${tag[1]}>`)}</span></p></div>`
        )
        continue
      }
      // `<property "value">the position of its rank</>`:  head, step and closer, all on its band
      const inline = rest.trim()
      if (head.endsWith("/>") || inline) {
        let body = ""
        if (inline) {
          const closer = /<\/[\w-]*>\s*$/.exec(inline)
          const step = closer ? inline.slice(0, closer.index) : inline
          body = refsOf(step) + (closer ? `<span class="bubbly-mark">${esc(closer[0])}</span>` : "")
        }
        out += section(id, `<p class="bubbly-pill bubbly-${kind} bubbly-level-${level}${pillEnds(tagHeadHtml(head) + body)}">${tagHeadHtml(head)}${body}</p>`)
        continue
      }
      // its body is its children;  its closer the next line at its own indent
      const closer = nodes[n + 1]?.text.startsWith("</") ? nodes[++n] : undefined
      const drawing = tag[1] === "draw"
      out += scoped(kind === "action", () =>
        section(
          id,
          `<div class="bubbly-block bubbly-${kind} bubbly-level-${level}"><p class="bubbly-head">${tagHeadHtml(head)}</p><div class="bubbly-gutter"></div>` +
            `<div class="bubbly-body">${taggedBlock(node.children, node.indent + 1, drawing, level + 1)}</div>` +
            (closer
              ? `<p class="bubbly-foot bubbly-closer"><span class="bubbly-mark">${esc(closer.text)}</span></p>`
              : `<div class="bubbly-foot"></div>`) +
            `</div>`
        )
      )
      continue
    }
    if (inDrawing && /^</.test(text)) {
      out += `<p class="bubbly-line${indentClass}">${drawingHtml(text, findStep(text) ?? 0)}</p>`
      continue
    }
    // a step:  the same words as the plain twin's step, so its colouring
    const at = findStep(text)
    const line = at !== undefined ? htmlOf(piecesOf(at, at + text.length, { head: false })) : esc(text)
    out += `<p class="bubbly-line${indentClass}">${line}</p>`
    out += taggedBlock(node.children, base, inDrawing, level)
  }
  return out
}

/** Where the plain twin has a step reading `text`, as an offset into it. */
function findStep(text) {
  for (const [i, line] of plain.split("\n").entries()) {
    const indent = /^\t*/.exec(line)[0].length
    if (line.slice(indent) === text) return lineStarts[i] + indent
  }
  return findInPlain(text)
}

////////////////
// ## Out
////////////////

for (const { name, prefix: filePrefix } of FILES) {
  useFile(name, filePrefix)
  const html = plainBlock(treeOf(linesOf(plain)), 0)
  writeFileSync(here + `${name}.plain.html`, `<div class="bubbly">${html}</div>`)
  console.log(name, "plain", html.length)
}
// the card in tags, its steps coloured as its plain twin's
useFile("card", "plain")
const taggedHtml = taggedBlock(treeOf(linesOf(tagged)), 0)
writeFileSync(here + "card.tags.html", `<div class="bubbly">${taggedHtml}</div>`)
console.log("tags", taggedHtml.length, "blocks", ids.size, "phrases", PHRASES.join(" | "))
