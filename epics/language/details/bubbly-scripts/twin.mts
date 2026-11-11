import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { SP } from "spell/parser/spell"
import { SX } from "spell/parser/spellx"

/**
 * The plain twin of each Solitaire file, and the parser's colouring of it (`SP.SpellHighlighter.spans()`).
 * - Read from a FIXED commit, so later edits in the worktree don't move the page under Owen's comments mid-review.
 * - `943d3e020`:  main with the two sided view drawing both sides (C4, 1ff87dc2a + 50f270021), so the card has no
 *   `- to draw it` of its own;  was `b6e5d443f`.
 */
const KIT = "/Users/owen/www/spell.worktrees/language"
const COMMIT = "943d3e020"
const FOLDER = "app/spaces/@spell/examples/Solitaire"
export const FILES = [
  { name: "card", file: "Card.spell", prefix: "plain" },
  { name: "solitaire", file: "Solitaire.spell", prefix: "solitaire" },
  { name: "deck", file: "Deck.spell", prefix: "deck" },
  { name: "pile", file: "Pile.spell", prefix: "pile" }
]
const at = (file: string) => execFileSync("git", ["-C", KIT, "show", `${COMMIT}:${FOLDER}/${file}`], { encoding: "utf8" })

/**
 * Owen's forms for plain Spell (his comments on card-bubbly.html):  the page draws the files as he'd write them.
 * - Not legal Spell yet:  "don't worry about what is legal spell as we go here, we'll figure that out later".
 * - Each one is listed at the page's foot, "Changes to plain Spell this page assumes" (card.assumes.json).
 * - The twin stays as Spell reads it today, so the highlighter's colouring holds:  gen.mjs draws each change.
 */
const ASSUMES = [
  {
    comment: "C6",
    what: "An ability is a word before the template, not a line of its own",
    today: 'a "card" is a two sided view:  ...  - it is draggable',
    page: 'a "card" is a draggable two sided view',
    tags: 'already an attribute:  <view "card" template="two sided view" draggable>',
    note: "The same for the other abilities:  clickable, selectable, droppable.  The word is in italics (C10)."
  },
  {
    comment: "C7, then \"ditch the description thing and put it as a comment INSIDE the block\"",
    what: "A declaration's description is a comment, the first line inside its block",
    today: '// What a person, a test or the console calls it\n- group "names"',
    page: '- group "names"\n\t// What a person, test or console calls it',
    tags: 'an attribute today:  <group "names" description="..."/>',
    note: "Every one-line comment right above a declaration, in every file on the page, moves inside:  the first line of its body;  a declaration with no body gets one holding just the comment.  A block of comments, or one with a blank line after it, stays where it is.  Today Spell reads the comment right ABOVE a declaration as its docstring (the writers' `ASTDocComment`, kept with the next definition;  a tag's `description=` is written as that comment by `SpellxTwin`), and a comment inside the body as just a comment in the body:  so the change is to read a body's first comment as the docstring instead.  The card in tags (section 5) still shows `description=` as its source has it."
  },
  {
    comment: "C8",
    what: "No colon at the end of a line",
    today: '- its "color" is one of red, black:',
    page: '- its "color" is one of red, black',
    tags: "never had one:  a tag's body is between its tags",
    note: "The band and its bracket already say a body follows, so the colon says nothing more."
  },
  {
    comment: "the analysis page's Q6, your first picture",
    what: "An action's name is quoted, and its title is on its line",
    today: '- to deal the cards:  ...  - titled "Deal"',
    page: '- to "deal the cards" with title "Deal"',
    tags: 'already one tag:  <action "deal the cards" title="Deal">',
    note: "Not drawn on this page yet:  listed so the list is whole."
  },
  {
    comment: "\"the default title should be the action name in Initial Caps\"",
    what: "An action's title is its name in Initial Caps, unless it says otherwise",
    today: '- to auto play:  ...  - titled "Auto play"',
    page: "- to auto play",
    tags: 'the same:  <action "auto play"> shows as Auto Play',
    note: "Today an action with no title shows its name as written, all lowercase:  `auto play`.  So Auto Play and Cheat drop their titled lines on this page;  Restart keeps its own, `start a new game` being other words.  The core's `wordsOf()` makes the default;  the translated words files look titles up by their text, so their keys change with it."
  }
]
writeFileSync(new URL("./card.assumes.json", import.meta.url), JSON.stringify(ASSUMES, null, 2))

/**
 * Each file's colouring from the WHOLE project's text, the files one after another:  alone, Solitaire's steps can't
 * know the card's, the pile's or the deck's types and phrases, and half its lines came back uncoloured.
 * - Card first, then the pile and the deck it names, then the game.
 */
const ORDER = ["card", "pile", "deck", "solitaire"]
const plains = new Map<string, string>()
for (const { name, file } of FILES) {
  const text = at(file)
  // `solitaire's hint`, not `the solitaire's hint` (Owen, 2026-11-11):  the same program, checked by compiling all four
  // twins both ways;  code lines only, a comment's words stay as written
  const plain = SX.CodeSpellWriter.write(text, { path: `/${file}` })
    .replace(/^(?!\s*\/\/).*$/gm, (line) => line.replace(/\bthe (\w+)'s /g, "$1's "))
    // `with name "stock"`, not `with name = "stock"` (Owen, 2026-11-11):  the same program
    .replace(/ with name = "/g, ' with name "')
    // `- "stock" is a new stock pile ...`, no `its` (Owen, 2026-11-11):  the same program, checked
    .replace(/^(\t*- )its ("[^"]+" is a new .* with name ")/gm, "$1$2")
    // `restart the game`, not `start a new game` (Owen, 2026-11-11):  just an action's name, not a word Spell knows
    .replaceAll("start a new game", "restart the game")
    // ... titled "Restart The Game" (Owen):  its name in Initial Caps, so the title line goes too (below)
    .replace('- titled "Restart"', '- titled "Restart The Game"')
    // `&&` joins with a space, as HyperTalk's does (Owen, 2026-11-11):  the same name, "queen of spades"
    .replace('its "name" is its rank + " of " + its suit', 'its "name" is its rank && "of" && its suit')
    // no title line where it's just the name in Initial Caps (section 6):  `auto play` is Auto Play by itself
    .replace(/^\t*- to ([a-z ]+):?\n(?:\t*\/\/.*\n)*(?:\t*- (?!titled).*\n)*?\t*- titled "([^"]+)"\n/gm, (block, name, title) =>
      title.toLowerCase() === name.toLowerCase() ? block.replace(/^\t*- titled ".*"\n/m, "") : block
    )
    // a handler's event by itself, its step in its body (Owen, 2026-11-11:  "change these so the event name is by
    // itself and the action is inside"):  `- on click play it` => `- on click:` + `play it`, a tab further in
    .replace(
      /^(\t*)(- (?:on|when) (?:click|dragged|drag cancelled|its \w+ changes?)):? (?!.*:$)(.+)$/gm,
      (_, tabs, event, step) => `${tabs}${event}:\n${tabs}\t${step}`
    )
  writeFileSync(new URL(`./${name}.source.spell`, import.meta.url), text)
  writeFileSync(new URL(`./${name}.plain.spell`, import.meta.url), plain)
  plains.set(name, plain)
}
const whole = ORDER.map((name) => plains.get(name)!).join("\n")
const all = SP.SpellHighlighter.spans(whole)
let from = 0
for (const name of ORDER) {
  const plain = plains.get(name)!
  const to = from + plain.length
  const spans = all.filter((s) => s.start >= from && s.end <= to).map((s) => ({ ...s, start: s.start - from, end: s.end - from }))
  writeFileSync(new URL(`./${name}.plain.spans.json`, import.meta.url), JSON.stringify(spans))
  console.log(name, plain.split("\n").length, "lines", spans.length, "spans", [...new Set(spans.map((s) => s.kind))].join(" "))
  from = to + 1
}
