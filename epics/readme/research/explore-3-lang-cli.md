# Explore 3:  spell-lang and the `spell` command line

Research for epic `readme`, read-only, 2026-10-21.
- Worktree:  `/Users/owen/www/spell.worktrees/readme` (the kit), child repos inside it.
- All paths below are from that worktree's root unless they start with `/`.
- Content folder:  `/Users/owen/www/spell/spell.epics/` (guides, sagas, goals, epics).
- "VERIFIED" means I ran it in this worktree today.

---

## A. The pitch, in facts

### What spell is

- An English-like programming language:  "Programs are written in syntactically correct English, then translated into
  equivalent code" (`spell-lang/spell/readme.md`, its "Purpose").
- It's built on a GENERIC rule-based parser that knows no language;  spell's grammar is one set of rules on it,
  markdown is a second (`spell-lang/markdown/AGENTS.md`:  "the proof that the parser knows no language").
- Rules are written in Rulex, "regular expressions on steroids":  `if {condition:expression} (then|:)? {statement_body}?`.
- Size today (from the generated table `spell-lang/spell/spellSyntax.json`):
  20 rule modules, 241 rule classes (224 usable, 17 internal bases), 274 registered syntaxes.

### Who it's for (from goals pages, all DRAFT, "not yet talked through")

- `spell.epics/goals/spell/motivation/motivation.md`:  "Spell picks up HyperCard's promise for the web:  people who
  don't call themselves programmers can **read**, change and make real software, in plain English."
- The one DECIDED line about AI, motivation D1:  "**AI: partner, then teacher** -- AI writes spell;  reading what it
  wrote is how people learn to write their own ... spell is how you check and change what the AI made."
- `goals/spell/ai/ai.md` (draft):
  - "Spell suits AI unusually well:  the source is English, so the person who asked can read and check what an AI wrote."
  - "The big question:  is spell 'the language AI writes for you, so you can read it'?"
  - "**No AI features yet.**"  Proposed:  G2 "Teach Claude to write spell" (a skill, checked by the real parser),
    G3 "Explain this line".
  - Risk R2:  "English that looks right but isn't spell -- models will invent phrases;  the parser must check every one."
- `goals/spell/audience/audience.md`:  the 2017 answer is "laypeople:  people who can read a program before they can
  write one";  "No path in:  no onboarding, tutorial, or docs written for people writing spells";
  "The app assumes a developer."
- The writer should frame the AI angle as the project's DIRECTION, not a shipped feature.

### What exists TODAY vs planned

| Thing | Status | Source |
| --- | --- | --- |
| English spell -> JavaScript (`js/solid`) | built, always compiled | `spell-lang/spell/src/targets.ts` |
| -> TypeScript on Solid (`ts/solid`) | built, `tsc`-clean on every test project | `targets.ts`, saga output-targets |
| -> Python on `spell_core` (`py`), asyncio | built (epic python-target, 31 phases);  `spell run --target py` VERIFIED | `targets.ts`, `py/AGENTS.md` |
| -> TypeScript LIBRARY (`ts/lib`):  classes only | built (epic people-and-orgs P3) | `targets.ts` |
| -> WebAssembly | PLANNED only:  future epic `output-wasm`, "starting with a subset ... no HTML or UI" | `spell.epics/epics/output-wasm/` |
| Java, Swift | named in the 2017 talk only | saga output-targets |
| Outline style (`a card is a thing:` + bullets) | built;  fixture `outline-solitaire` is in spell-lang's tests | guide `outline-spell.html` |
| Markdown on the parser | built, 670/670 GFM spec examples | guide `markdown/markdown.html` |
| Spell in Spanish / any non-English human language | NOT BUILT.  See below. | `goals/spell/translation/translation.md` |

### "Various human languages => output targets":  say it plainly

- The design idea is real and written down:  "Spell's middle is ONE tree:  syntaxes (English today) on the way in,
  targets on the way out.  N syntaxes plus M targets, never N x M." (guides `targets/targets.html`,
  `compile-targets/compile-targets.html`).
- The output half is built (four targets above).  The input half has ONE language:  English.
- What exists for Spanish:  one hand-translated file nothing reads,
  `spell-app/spaces/@spell/examples/solitaire/Card.spell-es` (118 lines).  translation.md:  "no Spanish rules, and it
  isn't in the project."  Sample:

  ```spell
  una carta es una cosa
  las cartas tienen un palo como uno de tréboles, diamantes, corazones o espadas
  el color de una carta es rojo si su palo es diamantes o corazones de lo contrario es negro
  ```

- Hooks that point that way (small, real):
  - A rule CLASS is reusable by another language's parser with its own `syntax` (why `addRule()` takes only
    `{ syntax, tests }`:  `spell-lang/spell/AGENTS.md`, "Parser rules").
  - Negatable words register per language:  `addRule(Negatable.specialize({ ruleName: "es" }), { syntax: "(es|(negated:no es))" })`.
  - Type words are spell's vocabulary handed to the parser (`SP.TYPE_WORDS`):  "a translation brings its own words" (PARSING.md).
  - Each project gets a WORDS file, `<Project>.en.js` (and `<Project>.py.en.json5`):  spell's English wording of each member.
- Goals (draft):  "G2 · Card.spell-es parses -- a prototype" by Dec 2026;  Spanish all the way, Norwegian, Portuguese in 2027.
- Risk R1/R3 in translation.md:  "keywords live inside TypeScript rule classes" -- English is baked into syntax strings.

---

## B. The pipeline (numbered, for a diagram)

Map:  `spell-lang/spell/PARSING.md` (1637 lines, the authoritative map;  "trust the code if they drift").

1. **Source text** -- a `.spell` file in a project (`__project.json5` lists its files).
   - `SP.SpellProject` (`spell/src/SpellProject.ts`) / `SP.SpellFile` load them.
2. **Tokens** -- `P.Tokenizer` (`parser/src/tokenizer/Tokenizer.ts`), configured by `SP.SpellParser.tokenizer`
   (`spell/src/SpellParser.ts`):  double-quote strings only, `LEADING_ONLY` whitespace (indentation matters),
   raw `css` / `markdown` blocks.
   - Token classes (`parser/src/tokenizer/Tokens.ts`):  `WordToken`, `NumberToken`, `SymbolToken`, `TextToken`,
     `CommentToken`, `JSX*Token`s, `LineToken`, `BlockToken`.
   - For the `block` rule it then groups lines into nested `BlockToken`s by indent (`breakIntoIndentedBlocks()`).
3. **Rules, written in Rulex** -- each rule a class + `syntax` string, compiled ONCE at registration into a tree of
   plain rule objects (`Sequence`, `Choice`, `Repeat`, `Keyword`, `Subrule` ...).
   - `parser/src/rules/Rule.ts` (top docstring, "Ways to make a rule"), Rulex in `parser/src/rulex/rulex.ts`.
4. **Matching** -- `P.Parser.parse(input, ruleName, scope)` (`parser/src/Parser.ts`) runs `scope.getRuleOrDie(rule).parse()`.
   - File => block => line => statement:  `Block`, `BlockLine`, `SpellStatement` (`spell/src/rules/`).
   - `Choice` parses every alternative, keeps highest `priority`, then longest, then earliest.
   - Expressions:  one rule, `CompoundExpression`, with a `Precedence` table (`*` before `+` before `is` ...).
5. **Matches + Scope** -- a `P.Match` tree (`parser/src/Match.ts`:  `rule`, `tokens`, `groups`, `data`, `datatype`).
   - Scope (`parser/src/scope/`:  `Scope`, `ProjectScope`, `FileScope`, `TypeScope`, `MethodScope` ...) records
     what each line declares, so later lines know new words (`a card is a thing` makes "card" a type).
   - Only `mutateScope()` changes scope.  Errors never throw:  a line nobody understands is a `parse_error` match.
6. **AST, "the spell tree"** -- `match.AST` from each rule's pure `getAST()`;  83 `AST*` classes in
   `parser/src/ast/AST.ts`.  "They hold what was parsed ... NEVER write output here."
   - Language-neutral:  operators as meanings (`equals`, not `==`), spell's own values (`up`, not `'up'`).
7. **Writer** -- one class per target, one method per AST class, found by class NAME (`parser/src/writers/Writer.ts`).
   - `P.ProgramWriter` (shared:  `forProject()` reads the whole project first, `kindOf()`, `naming`, `listsStartAt`)
   - `P.JSWriter` -> `P.TSWriter` -> (`P.LibraryWriter`);  `PY.PyWriter`, `PY.ElementsWriter` in `py/ts/`.
   - `P.TreeWriter`:  boxes for a diagram (`spell parse --tree --html`).
8. **Output files** -- in `build/` at the checkout root, never committed (`<Project>.spell.js`, `.spell.tsx`,
   `.spell.py`, `.elements.spell.js`, `.scopes.js`);  declarations, words, `.lib.ts`, `.app.py` beside the source.
9. **Runtime** -- compiled JS imports `@spell/core` (spell-lang's `core/`, bundled as `spell-runtime.js` for runners);
   Python imports `spell_core` (`py/core/`).

- Incremental:  `P.IncrementalParse` / `P.IncrementalProject` re-parse only what an edit changed (editor keystrokes).
- Editor completion:  `parser.expectedAfter()` parses in "expecting mode" (`P.Expectations`).
- Speed (PARSING.md):  whole Solitaire project ~60 ms warm;  "Compiling is <1ms per file ... parsing is the whole cost."

---

## C. Per piece

### C1. parser (`spell-lang/parser/`, entry `spell-lang/parser`, alias `$/parser`, namespace `P`)

- What it is:  "The generic rule-based parser ... It knows NO language" (`parser/AGENTS.md`).
  Depends only on the kit's util.  No UI framework, no DOM.
- Main files (in `parser/src/`):
  - `Parser.ts` -- `Parser`:  "named `rules` plus a `tokenizer`, used to `parse()` input into a `Match` tree and
    `compile()` that into output";  `import()` other parsers' rules;  `testRules()`, `speedTest()`
  - `rules/Rule.ts` -- base `Rule` (`test()` cheap guess, `parse()` builds a `Match`);  leaf and structural rules:
    `Keyword(s)`, `Symbol(s)`, `Word`, `Pattern`, `TokenType`, `Subrule`, `Sequence`, `Choice`, `Repeat`, `Group`, `BlankLine`
  - `Match.ts` -- a match:  `rule`, `tokens`, `matched`, `groups` (only what the syntax matched), `data` (what the rule worked out)
  - `tokenizer/` -- `Tokenizer`, `Tokens`, `TokenFormatter`
  - `scope/` -- `Scope` and its kinds;  records `ScopeVariable`, `ScopeConstant`, `ScopeMethod`, `ScopeList`
  - `ast/AST.ts` -- the spell tree's 83 node classes
  - `writers/` -- `Writer`, `ProgramWriter`, `JSWriter`, `TSWriter`, `LibraryWriter`, `TreeWriter`, `Naming`, `jsText`, `jsShapes`
  - `IncrementalParse.ts`, `IncrementalProject.ts`, `ParseJournal.ts` -- re-parse after edits
  - `Expectations.ts` -- "what can come next", for completion
  - `rulex/` -- opt-in (C2);  `test/` -- `unitTestModuleRules()`, `RuleTestSource` (blessing)
- How to use (VERIFIED, run through `node --import tsx --import spell-kit/toolchain/aliases`):

  ```ts
  import { P } from "spell-lang/parser"
  import "spell-lang/parser/rulex"            // opt in:  rules with `syntax` need it

  const parser = new P.Parser({ module: "pets" })
  class pet extends P.Sequence {}
  parser.addRule(pet, { syntax: "(dog|cat)" })
  class pet_pair extends P.Sequence {}
  parser.addRule(pet_pair, { syntax: "{first:pet} and {second:pet}" })

  const match = parser.parse("dog and cat", "pet_pair")
  Object.keys(match.groups)                    // => [ "first", "second" ]
  ```

  - The test file `tests/parser/src/Parser.test.ts` has the same shape with `@proto static syntax` / `alias`.
- Rule names:  snake_case from the PascalCase class (`ListAddRelative` => `list_add_relative`), so every prod build
  must keep class names (`keepNames`).
- Tests:  `spell-lang/tests/parser/src/` (12 test files);  spell-grammar parser tests are in `tests/spell/src/parserTests/`.
- Guides:  `guides/precedence/precedence.html` and `parser-model.html` (binding, datatypes);  `guides/targets/targets.html`
  (writers);  PARSING.md (lives in `spell/`, not `parser/`).

### C2. rulex (`spell-lang/parser/src/rulex/`, side-effect import `spell-lang/parser/rulex`, alias `$/parser/rulex`)

- What it is:  "the regex-like syntax that writes `$/parser` rules" (guide `guides/rulex/rulex.html`, the reference).
- Its own grammar is built in code from plain parser rules (`rulex.ts`:  "rulex can't define itself");
  `RulexParser.ts` helpers;  `RulexTokenizer.ts`:  words, numbers, symbols, whitespace only.
- Opt-in:  importing it sets `P.Parser.rulexParser`;  without it a rule with `syntax` throws
  "Rulex parser is not installed".  The `P` barrel never pulls it in.
- When:  eager, at registration (import time for spell's modules):  a bad syntax fails at load, not at parse.
- Constructs (from the guide, all checked against the code):

  | Construct | Syntax | Compiles to |
  | --- | --- | --- |
  | keyword(s) | `give`, `aa bb cc` | `Keyword`, merged `Keywords` |
  | symbol(s) | `:`, `>=` | `Symbol`, `Symbols` |
  | escape | `\? \( \|` | a literal symbol |
  | subrule | `{expression}` | `Subrule`, looked up by name at parse time (recursion OK) |
  | named subrule | `{thing:expression}` | lands in `match.groups.thing` |
  | choice | `(a\|b)`, `(op:+\|-)` | `Choice`, or one merged literal rule |
  | list | `[{item},]` | `Repeat` with a delimiter |
  | optional / + / * | `the?`, `word+`, `{sub}*` | `optional`, `Repeat` |
  | counts | `#{1,6}`, `-{3,}` | `Repeat` min/max |
  | case-insensitive | `(note\|tip)/i` | |
  | spacing as written | `!\[{alt}\]\({url}\)` | touching parts must touch |
  | `{space}` / `{spaces}` | `-{spaces}{text}` | exactly one / some spaces |

- A real rule (`spell-lang/spell/src/rules/math/Plus.ts`, current code):

  ```ts
  export class Plus extends InfixOperatorSuffix {
    @proto static precedence = Precedence.sum
    @proto static parenthesize = true
    getOperator(): P.ASTOperator { return "plus" }
  }
  math.addRule(Plus, {
    syntax: "(operator:plus|+) {expression:operand}",
    tests: [{ compileAs: "expression",
      beforeEach(scope) { scope.variables?.add("price"); scope.variables?.add("tax") },
      tests: [["price + tax", "(price + tax)"], ["price plus tax", "(price + tax)"]] }]
  })
  ```

- Spell's most involved syntaxes (guide section 5), good for a README:
  - `for each? {item:singular_identifier} ((and|,) {position:singular_identifier})? (in|of) {list:expression} :? {statement_body}?`
  - `add {thing:expression} to (the (method:start|front|top|end|back|bottom) of)? {list:expression}`
  - `print (operator:info|warning|error|collapsed? group)? [expressions: {expression} ,]`
- What rulex can't say (hand-written instead):  "as long as the opening fence", "any token but X", block nesting,
  emphasis pairing.
- `rule.toRulexSyntax()` prints a rule back as syntax;  all 472 of spell's registered syntaxes round-trip (guide).
  NOTE: the guide says 472 registrations and also "133 registrations" in places;  `spellSyntax.json` counts 274
  syntaxes over rule classes.  Different counting bases:  don't quote a number without saying what it counts.
- Tests:  `spell-lang/tests/parser/src/rulex/rulex.test.ts` (+ `__snapshots__`);  rulex's own rules carry inline tests.
- Guide:  `guides/rulex/rulex.html` (+ `rulex/experiments/*.mts`).

### C3. markdown (`spell-lang/markdown/`, entry `spell-lang/markdown`, alias `$/markdown`, namespace `MD`)

- What it is:  GitHub-flavoured markdown on the generic parser -- "the second language on the parser, after spell:
  the proof that the parser knows no language" (`markdown/AGENTS.md`).
- Depends only on `$/parser` and util;  NEVER imports spell.
- Main files (`markdown/src/`):
  - `MarkdownTokenizer.ts` -- words, one symbol per other character, whitespace riding on the token before it
  - `blocks/lineRules.ts` -- each kind of line is a rulex rule (thematic break, ATX heading, fence, list markers ...)
  - `blocks/BlockScanner.ts` -- the open-container stack, lazy continuation, tables (port of commonmark.js 0.29)
  - `inlines/InlineParser.ts` -- emphasis, links, entities, raw HTML (port of commonmark.js 0.29)
  - `render/` -- blocks and inlines to `P.Markup`, plain HTML or `ui-*` tags;  `toHTML.ts`:  `toHTML()`, `toMarkup()`, `render()`
  - `spec/gfm-spec.json` -- the GFM spec examples
- The rulex part (from the guide, matching `lineRules.ts`):

  ```ts
  /** A run of 1-6 `#`, then nothing, or a space and anything. */
  class atx_heading extends P.Sequence {}
  lineRules.addRule(atx_heading, { syntax: "#{1,6}" })
  lineRules.addRule(atx_heading, { syntax: "#{1,6}{spaces}{any}*" })
  ```

- How to use (VERIFIED):

  ```ts
  import { MD } from "spell-lang/markdown"
  MD.toHTML("# Hello\n\n- one **bold**\n- [x] done")
  // <h1>Hello</h1><ul><li>one <strong>bold</strong></li><li class="task-list-item"><input type="checkbox" disabled="" checked="" /> done</li></ul>
  MD.render("> [!NOTE]\n> Hi", { ui: true }).html
  // <ui-message state="info" icon="info circle" header="Note"><p>Hi</p></ui-message>
  ```

  - `render()` returns `{ markup, html, headings }`;  options `ui`, `headingIds`, `headingOffset`, `breaks`,
    `autolinks`, `tagfilter`.  Raw HTML passes through:  the caller sanitizes.
- Numbers (guide, measured 2026-10-04):  670/670 GFM examples;  1.8x marked's time (101 ms vs 56 ms over 172 files);
  59 kB gzipped vs marked's 14 kB, so Spell UI's `<ui-markdown>` keeps marked;  spell-app's `<spell-markdown>`, app
  docstrings and the language server's comment colouring use MD.
- Tests:  `spell-lang/tests/markdown/` (7 files);  `spec.test.ts` pins pass counts per section;
  `yarn markdown:spec:update`.
- Guide:  `guides/markdown/markdown.html`;  epic page `epics/markdown/`.

### C4. core (`spell-lang/core/`, entry `spell-lang/core`, alias `$/core`, namespace `SC`)

- What it is:  "The runtime compiled spell runs on" (`core/AGENTS.md`).
  Compiled JS imports it as `@spell/core`:  `import { core, Thing, List, App, Drawable, DrawableList } from "@spell/core"`.
- ONE `core` object, assembled by accretion:  each module does `Object.assign(core, ...)` on load (`core/src/index.ts`).
- Main files (`core/src/`):
  - `classes/` -- `Thing`, `List`, `App`, `Drawable`, `DrawableList`, `ids`
  - `collection-core.ts`, `collection-other.ts`, `positions.ts` -- list helpers;  positions from 1 (spell's) or 0
  - `drawing.ts`, `elements.ts` -- drawing with Solid's `h()`, `@drawn`, `mountApp()`;  each thing in its own error boundary
  - `runtime.ts` / `SpellEvent.ts` -- events (`trigger("card-click", ...)`)
  - `json.ts`, `carry.ts`, `state.ts`, `saving.ts`, `checking.ts`, `references.ts` -- JSON with `"$type"`, keeping
    things across a recompile, saving things by id, `Tableau#T1` references
  - `ParkMiller.ts` -- seeded random (`core.seedRandom(n)`), never `Math.random()`
  - `console.ts`, `assert.ts`, `tests.ts`
  - `model.ts` -- `spell-lang/core/model`:  the core WITHOUT drawing, what `ts/lib` libraries import
  - GENERATED:  `core.scopes.js` (built-in types' docs), `core.declarations.json5` (the method list another target's
    core must match;  `yarn core:gen:declarations`)
- Who may value-import it:  ONLY the app's runner entry (`spell-app/app/src/runner/spellRuntime.ts`);  spell itself
  imports core's TYPES only (one copy at run time).
- Tests:  `spell-lang/tests/core/` (27 files).  Guide:  `guides/targets/core-reference.html` (draws `core.declarations.json5`).
- Merits its own README?  Yes, short:  it's what a person reading compiled output meets first.

### C5. py (`spell-lang/py/`, entry `spell-lang/py`, alias `$/py`, namespace `PY`)

- What it is:  "Everything spell has for Python, in one place" (`py/AGENTS.md`).
  - `py/ts/` -- the TypeScript that WRITES Python:  `PyWriter.ts` (`py` target, on asyncio), `PyBaseWriter.ts`,
    `ElementsWriter.ts` (a Python program's drawing half, in javascript), `pyText.ts`, `quartApp.ts` (`<Project>.app.py`)
  - `py/core/` -- `spell_core`, a uv project:  what compiled Python imports
    (`from spell_core import core, Thing, List, App, prop, h`);  modules `things.py`, `lists.py`, `drawing.py`,
    `run.py` (`python -m spell_core.run`) ...;  `not_ported_yet.json5` lists core names not ported
  - NOT here:  `spell_quart`, the Quart web server (spell-app's spaces, `spaces/src/server/py/`)
- Python 3.12+, standard library only (guide).  Checked by pyright;  ruff + pytest run in `yarn test` / `yarn lint`.
- Output reads as a person would write it:  PEP 8 names, `for number in range(1, 101):`, `async def` only for
  functions that wait.
- Tests:  `spell-lang/tests/py/ts/` (vitest) and `tests/py/core/tests/` (pytest).
- Guide:  `guides/python-target.html`.
- Merits its own README?  Probably yes (or a section of README-spell's targets):  it has two halves and uv.

### C6. spell (`spell-lang/spell/`, entry `spell-lang/spell`, alias `$/spell`, namespace `SP`)

- What it is:  "the spell LANGUAGE, on the generic parser" (`spell/AGENTS.md`).
- Main files (`spell/src/`):
  - `SpellParser.ts` -- `SpellParser extends P.Parser`:  spell's tokenizer settings, shared `rootScope`
  - `rules/` -- 20 modules, a FOLDER each, one rule class per file:  `core`, `variables`, `constants`, `expressions`,
    `math`, `properties`, `lists`, `UI`, `classes`, `async`, `draw`, `JSX`, `types`, `assignment`, `statements`,
    `events`, `if`, `methods`, `tests` (+ base `Block`, `BlockLine`, `Statement`, `ParseError`)
    - each module:  `<module>.parser.ts`, `<RuleClass>.ts` files, `index.ts` (registration = tie-break order)
    - `SP.spellParser`, the shared instance, from `rules/index.ts`
  - `SpellProject.ts`, `SpellFile.ts`, `SpellJSFile.ts`, `SpellCSSFile.ts` -- a project, its files, compile
  - `SpellLocation.ts`, `SpellUrls.ts`, `SpellSetup.ts` -- addresses (`@spell/examples/solitaire/Card.spell`), URLs,
    the (empty-at-start) registry of project groups
  - `targets.ts` -- `SP.TARGETS`:  `js/solid`, `ts/solid`, `py`, `ts/lib`
  - `builtinTypes.ts` -- `SP.BUILT_IN_TYPE_TABLE`:  members of text, list, thing, app, date (`the length of the name`)
  - `SpellDeclarations.ts`, `SpellWords.ts`, `SpellWarnings.ts`, `hoistClassMembers.ts`
  - `highlight/SpellHighlighter.ts` -- colours a snippet with no project (`<ui-code language="spell">`)
  - `node/` (node-only, never in the barrel) -- `typecheck` (tsc), `buildTsx`, `pyright`, `spellSyntax` /
    `writeSpellSyntax`, `projectFile`, `packageVersion.node`
  - `test/` (`spell-lang/spell/test`) -- `loadFixtureProject()`, `fixturePath()`, `parseSpellProject()`, `runSpell()`
- Spell NEVER imports spaces:  project groups (`@spell/examples` ...) are registered by spell-app's spaces.
- How to use (VERIFIED):

  ```ts
  import { SP } from "spell-lang/spell"
  SP.spellParser.compile("print 1 + 2", "statement")   // => "core.console.log(1 + 2)"
  ```

  - Or from the shell, `spell parse "print 1 + 2 * 3"` (VERIFIED) prints the match tree, then `core.console.log(1 + 2 * 3)`.
  - Multi-line, VERIFIED:  `spell parse $'set the count to 5\nif the count is greater than 3 then print "big"'`
    => `export const count = 5` / `if (count > 3) core.console.log("big")`.
- Real programs (the frozen test projects, `spell-lang/tests/spaces/@spell/test/<project>/`, each with snapshots of
  every target's output:  `.snapshot.js`, `.snapshot.tsx`, `.snapshot.py`, `.snapshot.tsc.txt`, `.snapshot.pyright.txt`):

  1. `fizzbuzz/FizzBuzz.spell`, whole:

     ```spell
     ## File FizzBuzz.spell
     to play fizzbuzz
     	for each number from 1 to 100
     		if the number divided by 15 is an integer: print the number, "fizzbuzz"
     		otherwise if the number divided by 3 is an integer: print the number, "fizz"
     		otherwise if the number divided by 5 is an integer: print the number, "buzz"
     		otherwise print the number

     play fizzbuzz
     ```

     JavaScript (`fizzbuzz.snapshot.js`;  the `.tsx` is identical):

     ```js
     export function playFizzbuzz() {
       core.getRange(1, 100).forEach((number) => {
         if (core.isOfType(number / 15, "integer")) core.console.log(number, "fizzbuzz")
         else if (core.isOfType(number / 3, "integer")) core.console.log(number, "fizz")
         else if (core.isOfType(number / 5, "integer")) core.console.log(number, "buzz")
         else core.console.log(number)
       })
     }
     playFizzbuzz()
     ```

     Python (`fizzbuzz.snapshot.py`):

     ```py
     def play_fizzbuzz() -> None:
         """File FizzBuzz.spell"""
         for number in range(1, 101):
             if (number / 15).is_integer():
                 print(number, "fizzbuzz")
             elif (number / 3).is_integer():
                 print(number, "fizz")
             ...
     play_fizzbuzz()
     ```

  2. `cards/Card.spell` (sentence style), a few lines:

     ```spell
     a card is a thing
     cards have a suit as one of clubs, diamonds, hearts or spades
     the color of a card is red if its suit is either diamonds or hearts otherwise it is black
     a card "is face up" if its direction is up
     a card "is a (suit)" for its suits
     ```

     => JavaScript (`cards.snapshot.js`):

     ```js
     export class Card extends Thing {
       static Suits = ["clubs", "diamonds", "hearts", "spades"]
       static { this.declareProp("suit", { oneOf: Card.Suits }) }
       get color() {
         if (core.includes(["diamonds", "hearts"], this.suit)) return "red"
         return "black"
       }
       get isFaceUp() { return this.direction == "up" }
       isASuit(suit) { return this.suit === suit }
     ```

     => Python (`cards.snapshot.py`):  `class Card(Thing):` ... `def color(self) -> str:` /
     `if self.suit in ["diamonds", "hearts"]: return "red"` / `return "black"`.
     `cards.snapshot.tsc.txt` and `.pyright.txt` are EMPTY:  both checkers find no errors.

  3. `people/People.spell` (outline style), compiled by the `ts/lib` target to `people.lib.snapshot.ts`:

     ```spell
     a person is a thing where:
     	- it has a name as text
     	- it has a nickname as text
     	- its "emails" is a list of text
     ```

     ```ts
     import { Thing, List, prop } from "spell-lang/core/model"
     export class Person extends Thing {
       // - it has a name as text
       @prop({ type: "text" })
       accessor name!: string
       // - its "emails" is a list of text
       @prop({ itemType: "text", init: () => new List<string>({ instanceType: "text" }) })
       accessor emails!: List<string>
     ```

  - Also good:  `outline-solitaire/Card.spell` (`a "card" is a thing:` then `- its "color" is the color of its suit` ...),
    `todos-form-based/todo.spell` (`a todos-app is an app`, `return tasks in its tasks where it is active`).
  - The 11 fixtures:  card-table, cards, cards-from-zero, drawable-solitaire, fizzbuzz, klondike, outline-solitaire,
    people, solitaire, thing-references, todos-form-based.  NEVER edited to follow the live examples.
  - Live examples (editable):  `spell-app/spaces/@spell/examples/` (calculator, drawable-solitaire, fizzbuzz,
    outline-solitaire, solitaire, solitaire-import, todos, todos-form-based);  library:  `@spell/library/cards`, `people`.
- One rule as data, from `spellSyntax.json` (each rule's first test, written by all three writers):

  | Spell | JS / TS | Python |
  | --- | --- | --- |
  | `add thing to my-list before other-thing` | `core.addBefore(myList, otherThing, thing)` | `core.add_before(my_list, other_thing, thing)` |
  | `fire event card click with card = 1` | `trigger("card-click", { card: 1 })` | `core.trigger("card-click", card=1)` |

- Tests:  `spell-lang/tests/spell/` (52 test files);  rule tests per module in `tests/spell/src/rules/<module>/`;
  fixtures checked by `tests/spell/src/test/fixtures.test.ts`, `typescript.test.ts`, `python.test.ts`.
  Scripts:  `yarn spell:test:rules[:bless]`, `yarn spell:test:fixtures[:bless]`, `yarn spell:gen:syntax`.
- Guides:  `guides/spell-syntax/spell-syntax.html` (every rule, drawn from `spellSyntax.json`), `outline-spell.html`,
  `precedence/precedence.html`, `targets/targets.html`, `python-target.html`, `people-and-orgs.html` (addresses, ids, saving).
- The existing front page is `spell/readme.md` (lowercase), much of it about spell-app (see F).

### Where spell-lang stops (for the README's "what's NOT here")

- Language server:  `spell-app/lsp/` (`SpellLanguageService`, `ScopeExplorer`, `SpellDiskWorkspace`).
- VS Code extension:  `spell-app/vscode/` (its own yarn project;  version pinned to spell-lang's).
- The editor, runner, `<spell-app>` / `<spell-editor>` elements:  `spell-app/app/`.
- Projects on disk, groups, addresses' folders, the editor's server, spell_quart:  `spell-app/spaces/`.
- The `spell` command line:  `spell-app/cli/` (D).

---

## D. The `spell` command line

- Implemented in `spell-app/cli/` (package `spell-app`, its `bin` `spell` = `cli/bin/spell.mjs`).
  - `bin/spell.mjs` registers `tsx` and the kit's alias hook, then runs `src/main.ts` (or the lean `src/devMain.ts`
    for `spell dev ...` and `spell epic ...`).  No build step:  it runs every repo's working copy.
  - Command tree:  `cli/src/main.ts` (language + app), `cli/src/devProgram.ts` (`spell dev`);  one file per command
    in `cli/src/commands/<name>Command.ts`.
- `spell --version` prints the parser package's version (VERIFIED:  `0.8.0`, spell-lang's `package.json`).
- `spell --help` takes about 4 s cold here (VERIFIED, `time`);  the README says about half a second warm.

### D1. Writing and building programs

| Command | What it does | Code today | repo-split plan (P13) |
| --- | --- | --- | --- |
| `spell new <name>` | Makes a new project:  `<name>/__project.json5` and a starter `<name>.spell` that prints a hello, in your own space (`--in <folder>` elsewhere). | `newCommand.ts` | stays spell-app |
| `spell compile [projects...]` | Compiles each project to JavaScript in `build/` (plus its other targets, its declarations and words);  `--target ts/solid\|py\|ts/lib`, `--stdout`, `--stale`, `--force`. | `compileCommand.ts` | to spell-lang (app hooks add editor pages, addresses, build folder) |
| `spell check [projects...]` | Lists every error as `path:line:col  message`, exiting 1 if any;  `--json`;  `--fix` repairs property editor pages. | `checkCommand.ts` | to spell-lang (+ app hook) |
| `spell watch [projects...]` | Recompiles on every save and shows a live list of errors;  `--check-only`, `--test`. | `watchCommand.tsx` | to spell-lang |
| `spell format [projects...]` | Tidies the whitespace of `.spell` files, as VS Code's Format Document does;  `--check`. | `formatCommand.ts` | to spell-lang |

### D2. Running and testing programs

| Command | What it does | Code today | Plan |
| --- | --- | --- | --- |
| `spell run [project]` | Compiles a project and runs it under node, showing what it prints;  one with a UI opens in your browser;  `--target ts\|py` runs that target's code (a drawing Python app is served on Quart);  `--seed <n>`. | `runCommand.ts`, `runTarget.ts`, `runner/runProject.ts` | to spell-lang;  the browser part a spell-app hook |
| `spell test [projects...]` | Runs each `to test ...` in a project and reports ✓ or ✗, exiting 1 on a failure;  `--name`, `--watch`, `--seed`. | `runCommand.ts` (test mode) | to spell-lang |

- VERIFIED today:  `spell run <copy of fizzbuzz> --no-browser` printed 1, 2, `3 fizz` ... `15 fizzbuzz`;
  `--target py` printed the same through Python;  `spell compile <copy> --stdout --target py` printed the Python above.

### D3. Understanding a program (how spell reads it)

| Command | What it does | Code today | Plan |
| --- | --- | --- | --- |
| `spell parse "<text>"` | Shows how spell reads a line:  its match tree, then the JavaScript it compiles to;  `--rule`, `--in <project>`, `--tree` (the spell tree), `--html`, `--json`. | `parseCommand.ts`, `parseText.ts` | to spell-lang |
| `spell repl [project]` | `spell parse` one line at a time, where what a line declares is known to the lines after it;  reads stdin when piped. | `replCommand.tsx` | to spell-lang |
| `spell explain <word>` | Lists the rules a word names or starts, with their syntax and an example (`spell explain print`);  `--in <project>` adds what that project declares by that name. | `explainCommand.ts` | to spell-lang |
| `spell describe [project] [name] [member]` | Prints what a file or project declares, as the editor's Type Explorer shows it, or everything about one type or member (`spell describe Card.spell Card color`). | `describeCommand.ts` | to spell-lang (needs the language service moved out of spell-app's lsp) |
| `spell explore [project]` | A full-screen Type Explorer in the terminal;  `o` opens a declaration in your editor. | `exploreCommand.tsx` | to spell-lang |

- VERIFIED:  `spell explain print` => `print  print (operator:info|warning|error|collapsed? group)? [expressions:{expression} ,]` / `e.g. print "Yo!"`.

### D4. Projects and the editor (the app)

| Command | What it does | Code today | Plan |
| --- | --- | --- | --- |
| `spell projects [group]` | Lists the project groups, or one group's projects, by address;  `--json`. | `projectsCommand.ts` | stays spell-app |
| `spell serve [project]` | Starts the spell editor (Vite, port 3000) and this checkout's page server (port 4747), and opens the editor on a project, until Ctrl-C;  `--port`, `--headless`. | `serveCommand.ts` | stays spell-app |

- VERIFIED `spell projects`:  `owen@spell` (1), `@spell/examples` (8), `@spell/guides` (0), `@spell/library` (2), `@spell/test` (11).

### D5. Spell's own developers (parser speed)

| Command | What it does | Code today | Plan |
| --- | --- | --- | --- |
| `spell speed [module]` | Times the parser's rule tests in fresh processes, as a markdown table;  `--against HEAD` compares with a commit;  `--runs`, `--json`. | `speedCommand.ts`, `runner/speedTest.mts` | to spell-lang |

### D6. Spell UI pages and icons

| Command | What it does | Code today | Plan |
| --- | --- | --- | --- |
| `spell icons [query...]` | Finds Spell UI icons by name, alias or keyword;  `--open` shows them as pictures in a browser. | `iconsCommand.ts` | to spell-ui |
| `spell static <pages...>` | Renders `ui-*` pages as plain HTML for search engines and no-JavaScript readers:  `page.static.html` plus one `ui.static.css` per folder. | `staticCommand.ts`, `runner/renderStatic.ts` | to spell-ui |

### D7. Help and the odd one

| Command | What it does | Plan |
| --- | --- | --- |
| `spell help [command]` | Lists the commands, or one command's options. | the kit |
| `spell pony [words...]` | A pony in Spell's wizard hat says your words, or one of its own;  `--gallop`. | the kit |

### D8. Repo tools:  `spell dev <noun> <verb>` (for people working ON spell)

All in `cli/src/devProgram.ts`, started lean (no spell loaded).  `spell dev --help` lists 8 (VERIFIED):

| Command | What it does | Plan (P13, pick M2:  drop `dev`) |
| --- | --- | --- |
| `spell dev docs <verb>` | The docs-page tools (`update`, `index`, `new`, `open`, `link`, `fuss`, `offline`), handed to `epic pages`. | `spell docs`, spell-epic's |
| `spell dev design <verb>` | Spell's claude.ai design system:  `build`, `bundle`, `check`, `pull`, `changed`, `pushed`, `state`. | `spell design`, spell-ui (sync verbs to spell-epic) |
| `spell dev server <verb>` | This checkout's page server:  `serve`, `start [--all]`, `ensure`, `stop`, `status`, `url <file>`, `prune`. | `spell server`, the kit |
| `spell dev pack <verb>` | Component packs (a package's custom elements loaded on demand by `<ui-root>`):  `new`, `element`, `build`, `check`. | `spell pack`, spell-ui |
| `spell dev bundles <verb>` | The page bundles the page server builds on demand (Spell UI's docs site, the brand pages):  `build [--stale]`, `check`. | `spell bundles`, the kit |
| `spell dev vscode [build\|install]` | Builds the VS Code extension's `.vsix` and installs it (no verb:  both);  `--force` from a branch behind main. | `spell vscode`, spell-app |
| `spell dev commands [list\|check]` | Checks every yarn script, `spell` command and skill against the commands page (`guides/dev/commands/commands.json5`). | `spell commands`, the kit |
| `spell dev wwod [check]` | Checks WWOD citations and repo paths in WWOD, every `AGENTS.md` / `CLAUDE.md` and the skills. | `spell wwod`, the kit |

- Hidden old spellings, each handed verbatim to `epic` (`runEpic()` in `cli/src/dev/passThrough.ts`):
  `spell dev plan-doc | details | choices | comments | notes | agents | airplane | window | session | worktree | park | stock | shared`,
  `spell dev goals` (PARKED stub), and `spell epic <verb>`.  P13 keeps them hidden under `dev`.
- Planned under `dev` (commands page Roadmap, kept `dev` because the words clash):  `spell dev check | ts | lint | format | test | review`.

### D9. Not built yet (cli README "TODO")

- `spell lsp` (start the language server).
- A bundled, npm-installable `spell` that runs without a checkout (needs `keepNames`, `__PACKAGE_VERSION__` ...).

### D10. The other bins (not `spell`)

| Bin | Repo / file | What it does |
| --- | --- | --- |
| `epic` | spell-epic, `bin/epic` (tree `spell-epic/src/command/EpicProgram.ts`) | The epic tools:  epic pages (`epic summary seo`, `epic close seo#J3`), requests between sessions, worktrees/sessions/parking, windows and the page server, shared content, and the pages Owen answers on (`ask`, `choices`, `comments`, `notes`, `agents`, `airplane`).  ~50 verbs under 11 headings;  `epic --help`. |
| `spell-folders <check> [folder...]` | the kit, `toolchain/bin/spell-folders.ts` | Runs a several-folder package's checks folder by folder (`ts`, `test`, `lint`, `format` ...):  what `yarn test` in the kit, spell-lang and spell-app run. |
| `spell-types [--below] [--clean]` | the kit, `toolchain/bin/spell-types.ts` | Builds a package's TypeScript declarations (`dist-types/`) for the repos above it;  `--below` rebuilds the lower repos' stale ones first. |
| `spell-pack build \| check [<folder>]` | the kit, `element/bin/spell-pack.mjs` | Builds a component pack, or checks it's current;  spell-epic's and spell-brand's `yarn pack:build` use it. |

### D11. What repo-split plans (names WILL change soon)

- Phase P13 "CLI to the Kit", status `todo` (`/Users/owen/www/spell/spell.epics/epics/repo-split/parts/p-cli-to-the-kit.html`):
  - the `spell` program's base (arguments, help, finding commands) moves to a new `cli/` at the KIT root (decision Q42):
    `~/www/spell/cli/bin/spell.mjs`, importable as `spell-kit/cli`;  `~/.local/bin/spell` then links there.
  - each repo contributes commands from its own `<repo>/cli/`, named in its `package.json`:
    `"spell": { "commands": "./cli/commands.ts" }` (Q33, Q42).
  - names stay top-level;  a command goes under its repo's name ONLY when two repos claim the same word (Q33).
  - the split, if Owen's open picks M1 = A and M2 land:  spell-lang 12 (parse, repl, explain, format, describe,
    explore, watch, test, speed, compile, check, run);  spell-app serve, projects, new, vscode + hooks;
    spell-ui icons, static, pack, design;  spell-epic docs (and the `epic` command itself moves to spell-epic's `cli/`, J114);
    the kit help, pony, server, bundles, commands, wwod.
  - `dev` dropped from 8 commands (`spell pack build`, `spell server start` ...);  the old `spell dev <noun>` keeps
    working silently.
  - M1 and M2 were still "written into P9 once Owen picks;  nothing changed yet" in the part file.
- The README writer should say:  "command names and where they live are about to change (epic repo-split P13);
  the language commands keep their names."

---

## E. Setup for a Node novice

From the kit README (`README.md`), the kit and spell-app `package.json`s, and `spell-app/cli/README.md`:

1. Install Node 24.11 or later (`"engines": { "node": ">=24.11" }`;  VERIFIED here:  Node 24.21.0).
2. Yarn:  the kit pins `yarn@4.18.0` (`packageManager`) and ships its release in `.yarn/releases/`.
   `spell-lang/spell/readme.md` says "enable Corepack (`corepack enable`), which supplies the repo's yarn."
3. Clone the kit and every child repo:

   ```sh
   git clone git@github.com:spell-app/spell-kit.git ~/www/spell
   cd ~/www/spell
   yarn install          # the kit's own packages
   yarn clone            # every child repo (spell-lang, spell-ui, spell-brand, spell-epic, spell-app), then ONE install
   # or just what you need:  yarn clone spell-app   (clones spell-lang, spell-brand, spell-ui too)
   ```

   - `yarn clone` tries SSH, then HTTPS (`gh auth setup-git`);  `--https` skips SSH.
4. Put `spell` on your PATH:

   ```sh
   cd ~/www/spell/spell-app
   yarn cli:install      # links cli/bin/spell.mjs into ~/.local/bin (or npm's global bin, /usr/local/bin, /opt/homebrew/bin)
   spell --help
   ```

   - No install at all:  `node ~/www/spell/spell-app/cli/bin/spell.mjs --help` (VERIFIED from this worktree), or
     `yarn spell ...` in spell-app.
5. Try it (all VERIFIED here, on a copy of the fizzbuzz fixture in a scratch folder):

   ```sh
   spell parse "print 1 + 2 * 3"
   spell new Hello --in /tmp/hello-spells    # (new itself NOT run:  it writes files)
   spell run path/to/project --no-browser
   spell compile path/to/project --stdout --target py
   spell projects
   ```

6. For the Python target:  Python 3.12+ and `uv` (`py/core` is a uv project;  VERIFIED both on this machine,
   `/opt/homebrew/bin/python3`, `/opt/homebrew/bin/uv`).  `yarn test` in spell-lang runs pytest via `spell-folders`.

Could NOT verify:
1. A fresh clone end to end (`git clone` + `yarn clone` on a clean machine):  not run.
2. Whether `corepack enable` is still needed, or the checked-in `.yarn/releases/` yarn suffices with any global yarn.
3. Whether the repos are public or private:  kit `AGENTS.md` "CI" says "The repos are public:  no token";
   `spell-lang/AGENTS.md` says "`github.com/spell-app/spell-lang`, private".
4. `spell new` (writes files), `spell serve` (starts servers, opens a browser), `spell explore` (needs a terminal):  not run.
5. `yarn cli:install` (writes a link):  not run;  Owen's existing link points at the MAIN checkout
   (`~/.local/bin/spell -> /Users/owen/www/spell/spell-app/cli/bin/spell.mjs`).
6. Standalone child repos are "not supported yet" (kit README):  you can't `git clone spell-lang && yarn install`.
7. How long a cold first run takes on a new machine (tsx compiles every repo's source;  ~4 s here for `--help`).

---

## F. Stale or contradictory things (don't copy)

### Old `packages/` paths and monorepo names

- `spell-lang/spell/readme.md`:  `packages/lsp`, `packages/vscode`, `packages/app`, `packages/parser`, `packages/spell`;
  "Clone the `spell` monorepo";  `yarn start` on ports 3000 + 3001 and `http://localhost:3000/run/@spell/examples/solitaire/Card.spell`
  (unverified today);  `yarn coverage` (the script is `yarn spell:test:coverage`);  "Copyright 2017-2025";
  Deepwiki link to `spell-app/spell-app`.  Its RuleSyntax table is older than Rulex:  `Alternatives`, `List`, "`...*`
  optional and may repeat one or more times", `(?:...)` in an example (not rulex);  use the rulex guide instead.
- `spell-lang/spell/AGENTS.md`:  test projects at `../../spell-app/tests/spaces/@spell/test/` -- they MOVED to
  `spell-lang/tests/spaces/@spell/test/` (commit 4456301, "repo-split C11").  Also "the repo's `packages/`" in `CODE_FOLDERS`.
- `spell-lang/spell/PARSING.md` "Projects":  `packages/spaces/@spell/<group>/` (now `spell-app/spaces/@spell/`),
  `packages/vscode/`, and owen's space at `../spell-spaces/@spell/owen@/`.
- `spell-lang/parser/src/writers/Writer.ts` docstring:  `packages/parser/AGENTS.md`.
- `targets.ts` comment:  `spell_core` (`packages/py/core`) -- it's `spell-lang/py/core`.
- WWOD's examples:  `packages/spell/src/SpellProjectRoot.ts` -- `SpellProjectRoot` is now spell-app's
  (`spell-app/spaces/src/models/SpellProjectRoot.ts`, `SPACES.SpellProjectRoot`).
- `goals/spell/translation/translation.md`:  `packages/spell/projects/system/examples/Solitaire/Card.spell-es` --
  it's `spell-app/spaces/@spell/examples/solitaire/Card.spell-es`.  Goals pages also cite `packages/cli`, `packages/lsp`.
- Guides cite `@spell-app/markdown`, `packages/markdown`, `yarn spec:update`, `yarn gen:syntax` "run in packages/spell",
  `packages/spell/src/rules/math.ts` (now `spell/src/rules/math/Plus.ts`, and `precedence = 13` /
  `{expression:simple_expression}` are old:  now `Precedence.sum` / `{expression:operand}`).

### Old file names and address forms

- Compiled output is `<Project>.spell.js` / `.spell.tsx` / `.spell.py` now.  Old:  `<Project>.compiled.js`,
  `.compiled.tsx`, `.compiled.py` (guides `cli.html`, `targets/targets.html`, `python-target.html`).
- Declarations are `<Project>.declarations.json5` (guide `targets.html` says `.declarations.json`).
- Project file is `__project.json5` (`project.json` read as old;  `spell/AGENTS.md` still says `project.json`'s `"targets"`).
- Addresses:  `@spell/examples/solitaire`, `owen@spell`, `@here`.  Old, "read nowhere":  `@system:examples:Solitaire`,
  `@examples/...`, and the CLI guide's `@workspace`, `@library/cards`, `@examples`, `projects/test/`.
- Owen's projects folder:  the code says `spell.spaces` beside the main checkout (`~/www/spell/spell.spaces`,
  `spell-app/spaces/src/server/node/environment.ts`, "`../spell-spaces` before");  the CLI README, `newCommand.ts`'s
  docstring, PARSING.md and `spell/AGENTS.md` still say `spell-spaces`.

### Status lines that drifted

- `guides/cli.html`:  "19 language commands", `spell dev` "14 groups" (now 8 listed + hidden ones), old file names.
- `guides/python-target.html`:  "Python is compile-only for now:  spell run and spell test still run JavaScript" --
  `spell run --target py` works (VERIFIED;  `cli/src/runTarget.ts`, "closing T4").
- `guides/outline-spell.html` and saga spell-language:  "P8-P26 on branch outline-spell, not merged" -- spell-lang's
  history has the outline-spell commits and its `outline-solitaire` fixture, so it looks merged;  confirm before saying either.
- `guides/people-and-orgs.html`:  "built on branch people-and-orgs, not merged" -- its outputs (`ts/lib`, addresses) are in the code.
- `guides/targets/targets.html`:  "Python ... P17-P30 on branch python-target, not merged yet" -- saga says all 31 phases done.
- The CLI README's command table omits `spell dev design` and `spell dev bundles` (both in `devProgram.ts`), lists
  `spell dev goals` (hidden now), and mixes `epic ...` rows into "Commands" (they're spell-epic's).
- spell-lang `package.json` description:  "Python's writers and spell itself" is fine;  the root README calls `spell/`
  "the spell LANGUAGE ..., `PARSING.md` and `readme.md`".
- Counts disagree by basis:  rulex guide "133 registrations" (2026-10-03) vs "472 ... syntaxes print back";
  `spellSyntax.json` today:  274 syntaxes on 241 classes.  Quote the generated file, with its date.

### Things in the tree a README must not point people at

- `spell-lang/spell/graphify-out/`, `spell/src/graphify-out/`, `spell/CODEBASE_INDEX.md`, `spell/tsconfig.node.tsbuildinfo`:
  tool artefacts.
- `spell-lang/spell/thoughts/`:  2017-era notes (`WhatIsSpell.md` talks of "SpellCo", pricing plans, "Free/$20/$50/$250").
  Good for history;  not current product claims.

---

## G. Open questions for Owen (max 8)

1. **The pitch:**  may the README lead with "the language AI writes for you, so you can read it" as the aim, given
   ai.md says "No AI features yet" and only motivation D1 is decided?  Or keep AI to one honest line?
2. **Human languages:**  how much to say about Spanish when nothing parses it yet -- a "planned" line with the
   `Card.spell-es` sample, or leave it out until G2 ("Card.spell-es parses") lands?
3. **Wasm:**  list it as a planned target (future epic `output-wasm`), or only the built four?
4. **The CLI listing:**  document today's names (spell-app's `cli/`, `spell dev ...`) with a "changing soon" banner,
   or write it to P13's planned layout (each repo's own commands, `dev` dropped)?  And which repo's README carries it
   until P13 -- spell-lang's (12 of the commands are language commands) or spell-app's?
5. **Public or private:**  kit `AGENTS.md` says the repos are public;  `spell-lang/AGENTS.md` says spell-lang is private.
   Which is true, and should the README invite outside readers?
6. **`spell/readme.md`:**  replace it with `README-spell.md` (and move its spell-app parts -- VS Code extension,
   `<spell-app>`, `<spell-editor>` -- to spell-app's README), or keep the lowercase file?
7. **Separate READMEs for core and py:**  worth their own `README-core.md` / `README-py.md`, or a "Targets and
   runtimes" section in `README-spell.md`?
8. **Outline Spell:**  is it merged into main (the fixture suggests yes;  the guide says P8-P26 not merged)?
   It's a strong example for non-programmers, so the README would show it if so.
