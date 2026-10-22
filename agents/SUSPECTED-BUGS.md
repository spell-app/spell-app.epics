# Suspected bugs

Things that look like bugs but haven't been confirmed.  Add to the right section, under its package;  when one is confirmed and
fixed, or disproven, delete it (note a disproof in a line at the top if the reasoning is worth keeping).
- Fixed 2026-10-06 (outline-spell P2, value kinds;  branch `outline-spell`, not yet merged):  `its suit is diamonds or
  hearts` compiled to `(this.suit == 'diamonds') || 'hearts'`, always true (now `spellCore.includes(...)`, rule
  `value_choices`);  `the color of a suit is ...` / `a rank "is ..." if ...` on a type nobody declared compiled against
  a class that doesn't exist (now a parse error, `SpellStatement.refuseUnknownType()`).
- Fixed 2026-10-06 (outline-spell J8 / J11 / I7;  branch `outline-spell`, not yet merged):  a quoted phrase's rule
  never checked whose phrase it was, so `if the game is black` took a card's `is (color)`, `game.is_$color('black')`,
  and threw when run.  A user's phrase now refuses an operand known to be another type's, right after it and after
  `and` / `or` (`SuffixLeft`, `expressions.ts`).
- Fixed 2026-10-02 (unified-server P6, the app's API off Express):  `:filePath*` kept only the first segment (nested
  project files 404 / EISDIR);  an unknown `DELETE /api/...` missed the API's own 404.
- Fixed 2026-10-04 (precedence-and-types P3, binding power):  `draw the cards of the deck` as an expression gave
  `drawThing(deck.cards)` (`draw_items` now outranks `draw_thing`, priority 2 vs 1, and its test runs);
  `draw_thing`'s odd `precedence: 100` (now priority 1, with its why);  `print the card is a new card` gave
  `isOfType(card, 'New')` plus a parse error (now `card == new Card()`:  the longer `is` + `a new card` suffix wins).
- Fixed 2026-10-04 (precedence-and-types P4, types plumbed):  `a todo has a done as choice` emitted
  `declareProp('done', { type: 'boolean' })`, which the runtime's `isOfType()` (`typesOf(true)` is `["choice"]`)
  warned about on every set -- now `{ type: 'choice' }`, as are `as a boolean` and `is a boolean`;  `as a string`
  is `text`.  One normaliser, `P.typeName()`, replaced `types.ts`' `TYPE_VALUE_MAP`.  Probe `T2` pins it.
- Fixed 2026-10-04 (precedence-and-types P6, multi-word members):  an ad-hoc property wasn't reactive --
  `set the pile of the card to the pile` compiled to a plain `this.pile = pile`, never through `setProp()`.  Now the
  first `set the X of Y to V`, `Y` a type the project declares, declares `X` there (`auto: true`), and the setting
  file compiles `Card.declareProp('pile', { type: 'Pile' })` + the accessor at its top.  Probe `M5` pins it.  NOT
  for a built-in or IMPORTED type, e.g. Solitaire-import's `set the name of cards-to-move ...`:  still a plain field
  (plan doc caveat).
- Fixed 2026-10-06 (worktree `docs-sidebar`):  the side bar's docs stuck on their placeholders ("Loads from
  parts/p1.htm ..."), in one window and not another.  Chrome allows 6 HTTP/1.1 connections per host, and EVERY VS
  Code window shares them (one network process:  `lsof` showed exactly 6 to `127.0.0.1:4747`);  each live page held
  one for good (its live-reload `EventSource`, plus one more for a plan doc's review inbox).  Live reload is now a
  websocket (`src/server/webSocket.ts`), which doesn't count toward the 6;  the inbox listens through the
  live client.
`[V]` = checked against the code by hand.  Everything else is unverified.

Entry format:  `` - `path/to/file.ts` `symbol()`: what looks wrong, why, and how to prove it. ``

## spell

- A Spanish project's lint warnings suggest an ENGLISH line (2026-10-22, found by epic `readme` P9 on `cartas`):
  `A pila never says it has a nombre:  declare it, e.g. "a pila has a nombre as text"`.  The suggestion won't parse in
  Spanish:  the warning's wording (and its example) should come from the project's language pack (epic `spanish`).

- With Owen's outline card (`it "is the (rank) of (suit)"`), `the card is the queen of spades` compiles to
  `card == "spades".queen`, not `card.isTheRankOfSuit("queen", "spades")`:  silently false at run time.
  drawable-solitaire's `"is the (rank) of (suits)" for its ranks and its suits` works.  Seen 2026-10-21 (epic `readme`
  P11).  Prove:  the card in the kit's `docs/drafts/card-example/Card.spell`, plus a line using it;  read the output.

- A copied or renamed project (drawable-solitaire copied to a folder `argued`):  its generated `<old name>.en.js` is
  read as Spell, `spell lint` reports 59 errors from `Don't understand "/*! SPELL: WORDS ..."`, and `spell test` then
  crashes with a raw tsx `Parse error ... argued.spell.mjs:712:80`.  Seen 2026-10-21 (epic `readme` P11).

- `spell test @spell/library/cards`:  "test deck with jokers" fails with `threw:  Invalid left-hand side in
  assignment` (2 passed, 1 failed).  Seen 2026-10-21 (epic `readme` P11).

- `expect 1 to be 1` as a line of a `to test ...` method throws while compiling:
  `Error creating ASTStringLiteral:  expected property 'value' to be string ... Actual value: 1`,
  then `text.replace is not a function` in `jsText.inQuotes()`.
  Seen 2026-10-12 (epic `drawable-thing` P17), writing `Block.test.ts`:  `print "testing"` in its place compiles.
  Likely the test's echo of each line (`MethodDefinition.getAST()`, `echoTestAction`) or `expect`'s string of what
  it tested, handed a number literal's value where it wants its text.  Prove:  compile a file
  `to test it\n\texpect 1 to be 1`.

- A `+` whose left side is an `or` gets the `or`'s datatype, a choice:  `(the name of the pile or "pile") + ":"`
  (Solitaire's `the state of a pile`) has datatype `choice`, though it's text.  Seen in epic `output-targets` P13,
  2026-10-09:  with every tree node falling back to its match's datatype, the TypeScript writer wrote
  `let state: boolean = ...` (the fallback was dropped, judgement J25).  Prove:  `match.datatype` of that expression
  in a parsed Solitaire;  likely the infix rules' `getDatatype()` taking the left operand's.

- `packages/spell/src/rules/classes.ts` (around line 1450, the rule matching an enumeration's values as arguments):
  a string argument that ISN'T one of the enumeration's values compiles as the literal text `'arg.value'` --
  `` output: valueIndex !== -1 ? String(values[valueIndex]) : `'arg.value'` `` is missing its `${}`.  Prove:  a
  method taking an enumeration value, called with a word not in it;  read the compiled output.  Found reading the
  code in epic `output-targets` P3, 2026-10-05;  not run.

- [V] `packages/spell/src/rules/methods.ts` `MethodDefinition.getRule()`:  a signature that STARTS with its receiver --
  `to (a card) flips: ...`, or paren-free `to a card flips: ...` -- THROWS while parsing ("Rule 'flips' starts with an
  expression, so it would recurse forever"):  its call rule `{thisArg:expression} flips` is aliased `expression`, so
  `SpellParser.getNamesForRule()` registers it as an `operand` and refuses.  The project's whole parse fails
  (`project.parseError`).  Since P3 of precedence-and-types (the operand check);  found in P5.  Prove:  parse
  `a card is a thing\nto (a card) flips: print 1` with `parseSpellProject()`.  Fix:  register such a call as a statement
  only, or as an `expression_suffix`.
- [V] `packages/spell/src/rules/classes.ts` `QuotedPropertyRule.compileASTExpression()`:  a quoted formula naming a
  property that isn't there -- the Solitaire fixture's Card.spell with `a card "is a (rank)" for its ranksx` --
  THROWS while compiling a line using it (`Cannot read properties of undefined (reading 'value')`, `rhs` is
  `undefined`), rather than a parse error.  Not touched by precedence-and-types P5;  it's the one "threw" in
  `IncrementalProject.test.ts`'s Card.spell edits (a full parse throws the same, so the test passes).

Collected as `parser`'s "Suspected bugs found during documentation pass".

Collected 2026-09-19 while documenting `src/` per `AGENTS.md`.  Everything you annotated `>>` has been
fixed and removed from this file; what's left is unannotated and untouched in the code.
`[V]` = checked against the code by hand.  Everything else is a subagent's reading and unverified.

- `[V]` `packages/spell/package.json` `test:coverage` (`vitest run --coverage`):  no `@vitest/coverage-*` provider
  is installed (only `istanbul-lib-coverage`), so it likely fails asking for one.  Nothing references it.  Prove:
  `yarn workspace @spell-app/spell test:coverage`.  (found by epic `commands`, P2)
Delete this file when done -- it is untracked scratch, not project documentation.

Disproven while fixing: `Tokenizer.matchJSXChildren` same-name nesting was NOT a bug -- `matchJSXChild()`
tries `matchJSXEndTag(endTagName)` (literal `</endTagName>` only) before recursing into `matchJSXElement`,
which consumes any nested element whole, so the outer loop never sees an inner open/close tag.  `nesting`
only ever steps 1 -> 0 on the correct tag; its `!== 0` branch catches genuinely unbalanced markup, which is
what the adjacent `TODO: how to surface this error???` is really about.  Code left unchanged.

### 1. Behavior bugs

- Calculator example [V]:  its operator buttons say `onClick={set its operator to "+"}`, which compiles to the
  PROPERTY write `this.operator = "+"`, NOT the action `to set the operator of (a calculator) to (op)` (which also
  clears `input`).  So `7 x 6 + 1 2` shows `7 + 7612 = 7619`.  Same on HEAD before P11:  the language picks the
  property over the action -- or the example means the action.  Found 2026-10-02 (P11 live check).
- Solitaire-import example [V]:  draws only a `K` on the stock and an empty tableau -- no dealt piles -- in the
  editor and in `<spell-app>`.  Same on the commit before P11 (checked side by side), so not cells.  It imports
  `Card` / `Deck` / `Pile` from `@system:examples:Solitaire`, whose compiled module runs its OWN top level (a game,
  a deal) when imported:  probably the two programs' decks / piles collide.  Found 2026-10-02.

- `test/unitTestModuleRules.ts` `compileMatch()`: a rule unit test NEVER checks that the rule consumed the
  whole input.  `compileMatch()` is `scope.parse(input, ruleName)` then `match.compile()` -- it compiles
  whatever matched and silently drops any tokens left over, so trailing garbage passes.  Two tests prove it:
  `` `pause for 2 seconds"` `` (async.ts `pause`) and `` `end print group"` `` (UI.ts `end_print_group`) each
  carry a stray `"`, and both are green.  (Those quotes are pre-existing -- they are in the file at HEAD --
  but the reason nobody ever noticed is this harness.)
  Real parsing does NOT behave this way:  `BlockLine.parse()` feeds leftover tokens to the `parse_error` rule
  and collects them into `match.data.errors`.  So every rule's unit tests are weaker than the parser they
  cover -- a `syntax` that under-matches its own test input looks correct.
  Likely fix: in `compileMatch()`, after a successful parse, fail unless `match.length` equals the tokenized
  input length.  MEASURED 2026-09-20 by adding exactly that check and running the suite:  only **10 of 1423**
  tests leave input unconsumed, in two clearly different groups --
  - 5 are the stray-`"` typos of §3 plus one more:  `pause` x3 (async.ts), `end_print_group` (UI.ts),
    `do_nothing` (`` `do nothing"` ``, statements.ts).  Fixing the typo fixes the test.
  - 5 are real "rule under-matches its own test input" cases worth a look:  rulex `list` on `` `[]` `` and
    `` `[{sub}]` ``, rulex `subrule` on `` `{}` ``, rulex `symbol` on `` `::` ``, and spell `number` on `` `1.` ``
    (does `1.` legitimately match just `1` and leave the `.`?).
  So the fix is small and tractable, not a 100-test cleanup;  left undone only because the 5 real cases each
  need a judgement call about the grammar.  Found 2026-09-20 during the `addRule()` definition rollout.

- `parser/rules/Choice.ts` `getBestMatch()`: two comments claimed it prefers LATER-defined rules on a tie ("takes
  LATEST one", "we run this BACKWARDS to put later-defined rules first").  It has always done the OPPOSITE -- the
  priority (was precedence) loop runs forwards, and the length loop scans backwards with `>=`, so an equally-long EARLIER match
  replaces a later one.  Verified 2026-09-20 with a two-rule `Group`: the first-registered rule wins.  Comments now
  describe the real behaviour and `Rule.test.ts` pins it, but if the author's stated INTENT was right then the code
  is wrong and rule-ordering across every module would flip -- someone who knows the grammar should decide.

- `src/rules/UI.ts` `css`: reads `match.data.file` (was ad hoc `match.file`, documented as "set externally by `SpellCSSFile`") but NOTHING sets it -- `SpellCSSFile.parse()` doesn't.  So compiled output is always `spellCore.installStyles(undefined, ...)`.  Likely fix: `match.data.file = this.file` after parsing, but untested so left alone.

- [V] `src/rules/assignment.ts` `Get.getAST`: `variables.replace("it")` unconditionally;
  sibling `assignment.getAST()` guards with `if (originalVar?.isAlias)`.  A real `it` variable loses `kind` / `datatype`.

- [V] `src/rules/lists.ts` `list_range_iteration`: only iteration rule that doesn't pass `mapItTo` --
  `it` not aliased inside `for each number from 1 to 10:` bodies.

- [V] `spell-lang/src/core/ui.ts`: `notify` / `alert` / `confirm` / `prompt` statements (`rules/UI.ts`) compile to `spellCore.notify()` etc,
  but no such methods exist anywhere in `spellCore`.

- [V] `spell-lang/src/core/SpellEvent.ts` instance `trigger`: calls `SpellEvent.trigger(this, event, props)` without `return`; typed `unknown[]`, results dropped.

- [V] `core/src/classes/List.tsx` `_getZeroIndex`: `if (oneIndex === 0) return 1 // ???` -- returns second item.

- `app/ui/ConsoleViewer.tsx` `getDerivedStateFromProps`: says "Clear `state.error` if ...???" but `return oldState || {}` never clears it,
  unlike `MatchViewer` / `ASTViewer`.

- `app/ui/modals/modals.types.ts` `ModalComponentProps.id`: `<ModalRoot>` passes `key` (not forwarded), never `id`.

- `parser/ast/renderAST.ts` `InCurlies` / `InSquareBrackets`: no empty-children case, unlike `stringifyAST.ts` twins.
  Latent: `DestructuredAssignment.renderChildren()` calls `render.InCurlies` directly.

- `[V]` `parser/ast/AST.ts` `ASTPreservedComment.renderChildren()` / `ASTDocComment.renderChildren()`:  draw
  `/* ...` (`render.OPEN_COMMENT`) where `compile()` writes `/*! ...` / `/** ...`, so the editor's "Javascript Output"
  pane shows NOT what runs, e.g. `/* SPELL: DECLARES {` for `/*! SPELL: DECLARES {`.  Prove:  for `a card is a
  thing`, `P.render.toText(ast.markup)` starts `/* SPELL`, `ast.compile()` `/*! SPELL` (`ASTViewer.browser.test.tsx`).

- `[V]` `src/rules/classes.ts` `quoted_property_formula`:  a quoted alias of an UNKNOWN property, e.g.
  `a card "is a (rank)" for its ranksx`, still registers `_quoted_property_rule`, with no enumeration part in its
  syntax -- then compiling any use of it (`the card is a queen`) crashes in `compileASTExpression()`:
  `Cannot read properties of undefined (reading 'value')`, as `rhs` is `undefined`.  Crashes a full parse too.
  Probably wants a parse error instead of registering the rule -- see the `FIXME` in `computeBits()`.

- `core/src/classes/App.tsx` `App.show()`:  calls `createRoot(element)` on the SAME `#REACT_APP_ROOT_ID` element every
  time a compiled app runs, e.g. each compile in the editor -- React warns "You are calling ReactDOMClient.createRoot()
  on a container that has already been passed to createRoot() before".  Probably wants to reuse (or unmount) the
  `REACT_ROOT` it already stashed on the element.

- `rules/classes.ts` `QuotedPropertyRule.compileASTExpression()` (was `_quoted_property_rule`):  a placeholder
  word that isn't in its enumeration outputs `` `'arg.value'` `` -- the literal text `'arg.value'`, not the
  word.  Probably meant `` `'${arg.value}'` ``.  Found 2026-09-28 while extracting the class.

- `projects/system/examples/Solitaire-import` imports the WHOLE `@system:examples:Solitaire` project compiled,
  so importing it runs Solitaire's top-level code -- its tests, `reset_the_game()`, `game.start()` -- which an
  import probably shouldn't.  Likely fix:  import `@library/cards`, which holds just the cards.
  DECIDED 2026-09-29:  fix the cause -- importing an app project must never run its app.  Planned as the
  `<spell-app>` plan's last phase.
  - FIXED 2026-09-29:  it used to fail outright, `TypeError: Cannot redefine property: play`, as Solitaire's
    `spellCore.define(Card.prototype, 'play', ...)` was non-configurable.  Methods are class methods now --
    writable -- and Solitaire-import's `Card.prototype.play = function ...` replaces Solitaire's.
  - 2026-10-01 (cli-additions):  it now loads with no errors, but deals NOTHING -- one king on the stock -- in the
    app's own runner (`/run/examples/Solitaire-import`) and in `<spell-app>` (`spell run`), while
    `@examples/Solitaire`, same `Solitaire.spell`, deals a full game.  NOT just `game.start()`:  serving the
    imported `Solitaire.compiled.js` with that line removed deals nothing either -- so its other top-level code
    (`reset_the_game()`, piles, process flags in the shared `spellCore`) is the next suspect.

- A full `vitest run` writes into the FROZEN fixture `projects/test/Solitaire/`:  it rewrites
  `Solitaire.compiled.js` and leaves an untracked `Solitaire.scopes.js`, both stamped mid-run.  Some test compiles
  `@test:fixtures:Solitaire` as a real `SpellProject`, which saves its output -- and the language server writes a
  scope pack after a clean compile.  Harmless while the output matches, but a test shouldn't touch fixtures.
  Found 2026-09-29.

- `for each card in the deck` compiles to `spellCore.map(deck, (card) => {...})`, and `map()` builds a NEW
  collection of the same class for its results (`newThingLike()`, `core.ts`) -- `new Deck()`, which runs the
  user's `create()` again, e.g. dealing cards, on every loop.  The result is thrown away.  Likely fix:  loops
  compile to `forEach` (or `forEachSequential` when async).  From reading the code, not run.  Found 2026-09-29.

- PROBABLY GONE (P11, 2026-10-02):  `view()` is on spell cells now, and a `Reaction` never re-runs for a change
  made while it runs.  Not tried with a real `to draw`.  Was:
  A `to draw` which calls `spellCore.map()` / `filter()` on a List -- or anything else reading then changing
  an observable it just made -- does it INSIDE `Thing.Component`'s `view()` render.  `map()` makes a new list,
  reads its `items`, then writes them:  the render's own reaction is set off mid-render.  That's what took the
  Thing Explorer down with React error #301 [V] (reading Solitaire's `pile.state`), so a program drawing that way
  probably re-renders every time, or warns.  NOT tried with a real `to draw`.  Related, fixed 2026-09-30:  making
  a List or Thing mid-render built its store with `react-easy-state`'s `store()`, which is a `useMemo()` hook
  in a `view()` function component and THROWS in a `view()` class component -- now `newStore()` in `extend.ts`.
  Found 2026-09-30.

- Negative positions only work on a `List`:  on a plain array `getItemOf(arr, -1)` reads `arr[-2]`, so
  `undefined`, and `removeItemOf(arr, -1)` does `splice(-2, 1)`, removing the SECOND-to-last
  (`collection-core.ts`).  So `the last word in words`, `remove last item of my-list` are wrong for arrays.
  Found 2026-09-29.

- `map()` / `filter()` on a string, e.g. `words in "a word list" where ...` (a `list_filter` test), start from
  `newThingLike("...")` -- `new String("")` -- and appending to it throws `TypeError: Cannot assign to read only
  property 'length'`.  The test only checks the compiled code.  Found 2026-09-29.

- `spellCore.equals()` is lodash `isEqual`, and a `List`'s items live in a `WeakMap` (`extend.ts`), not on the
  instance -- so two Lists of the same class probably compare EQUAL whatever they hold.  Inferred from the code,
  NOT confirmed with real Lists.  Found 2026-09-29.

- `lsp/SpellDiskWorkspace.ts` `diskChanged(uri, "created")` for a `.spell` file the project ALREADY has:  it goes
  through `refresh()` -- `project.reload()` + a fresh parse -- which re-reads the file LIST but apparently keeps the
  text each already-loaded `SpellFile` holds.  Seen 2026-09-29 from `spell watch`, which (wrongly, now fixed) reported
  a macOS save -- an `fs.watch` `rename` -- as `created`:  the rebuild compiled the OLD text.  Matters to the
  language server if an editor ever reports a replaced file (e.g. delete + create, as some `git` operations do) as
  `created`.  Likely fix:  `refresh()` also reloads each file's contents from disk.

- `packages/spell/src/rules/expressions.ts` `is_a`:  its operand is `{expression:type}`, and `type` accepts ANY word --
  so `print the card is a foo` compiles to `spellCore.isOfType(card, 'Foo')`, no error.  Probably wants
  `known_type`.  (Its worst case, `the card is a new card`, was fixed in P3:  see the top.)  Run:
  `spell parse --in @test/Solitaire "print the card is a foo"` (`spell-app/src/cli`).  Found 2026-09-30;  still so
  2026-10-04.  Epic `precedence-and-types` P4 (one type vocabulary) should fix it.
  FIXED 2026-10-04 (epic `precedence-and-types` P4, probe T1):  `is_a` takes `{expression:known_type}`, so
  `print the card is a crad` is a parse error;  types declared later in the project count (P5's pre-scan, probe T3).

- `packages/spell/src/rules/lists.ts` `list_length` (priority 3) vs `list_filter` (2):  `the number of cards in the
  deck where ...` matches `list_length` with `the deck` and leaves `where ...` unparsed, as priority is
  compared before length.  CONFIRMED by running 2026-10-03:  `itemCountOf(deck)`, then Don't understand
  "where the card is red";  `the cards in the deck where its color is red` alone works.  Found 2026-09-30.
  FIXED 2026-10-04 (epic `precedence-and-types` P3, probe P1f):  `list_length` has a second syntax ending
  `where {inline_expression}?`, compiling to `itemCountOf(filter(deck, ...))`.

- `spell-lang/src/parser/scope/TypeScope.ts` `declareProperty()` (and `define_property_has` / getters in `classes.ts`):
  a property declared on a BUILT-IN type (`the size of a thing is: ...`, `things have a tag as text`) or an IMPORTED
  one is recorded on that type's shared `TypeScope` -- the root scope's, or the import layer's -- which every project
  in the process shares and no project's journal records.  So it outlives the edit that made it, and another project
  (e.g. in the language server) sees it.  Since P4 of `precedence-and-types` the root also has `Text`, `Number` ...,
  so `the length of a text is:` does it too.  Method records avoid it (judgement J11:  they go in the project's
  `methods`).  From reading the code, NOT run.  Found 2026-10-04.
  FIXED for BUILT-IN types 2026-10-04 (epic `precedence-and-types` P7, probe B3):  `define_property_has`,
  `property_value_either` and `property_value_getter` refuse one, with a parse error saying why
  (`refuseBuiltInType()` in `classes.ts`).  Still open for an IMPORTED type.

- [V] `packages/spell/src/rules/math.ts` `absolute_value` / `round_number`:  compile to `spellCore.absoluteValue()`,
  `spellCore.round()`, `spellCore.roundUp()`, `spellCore.roundDown()` -- none of which `spell-lang/src/core` defines (each
  marked `TODO: implement in spellCore`).  So `the absolute value of x` or `round x` throws a TypeError when it RUNS,
  though it compiles.  Prove:  run `print round 1.5`.  Found 2026-10-04 (P7 of `precedence-and-types`, which left
  them out of `BUILT_IN_TYPE_TABLE`:  its test reads every member off a real helper).

### 2. Server robustness / security

- [V] `server/lock-utils.ts`: whole module has zero callers, while `saveFile()` / `saveProjectFile()` / `getIndex()`
  do unguarded read-modify-write on `project.json`.  Wiring dropped, or dead code.

- `server/project-utils.ts` `request_createFile`: silently overwrites existing file; exists-check is client-side only.

- `server/project-utils.ts` `request_deleteFile`: "can't delete last file" guard is client-side only.

- `server/project-utils.ts` `request_renameApp` / `request_duplicateApp`: `fse.move()` / `fse.copy()` without `overwrite` --  existing target => raw 500 instead of "already exists".

- `server/response-utils.ts` `sendError`: always sends `error.stack` to client.

- Path handling (no bypass found): only client-path => disk-path conversion is monkey-patched `SpellLocation.prototype.serverPath`,
  relying wholly on `SpellLocation` constructor's `isValidPathSegment`.  Worth a dedicated review.

### 3. Wrong strings / types (cheap fixes)

- `util/LoadableFile.ts`: generic param `JSONFileType` on `JSONFile` / `JSON5File` shadows exported `JSONFileType` type.

- `parser/tokenizer/Tokens.ts`: `JSXExpressionTokenProps.contents` is `string | Token`; `JSXAttribute` value still `any`.

- `src/rules/methods.ts` `type_method_arg`: `method` fragment from `type.raw`, sibling `arg.name` uses `instanceCase(type.value)`.

- `src/rules/async.ts` `pause` tests: 3 of 4 input strings have a stray trailing `"` (`` `pause for 2 seconds"` ``, `` `pause for 500 msec"` ``, `` `pause for 10 ticks"` ``) that the 4th (`pause for (10 + 10) sec`) doesn't -- looks like a copy-paste typo, not intentional. Left byte-for-byte while converting to `addRule()` per the rollout guide.

- `src/rules/UI.ts` `end_print_group` test: input `` `end print group"` `` has the same stray trailing `"`. Same as above.

- `spell-lang/tests/core/collection-other.test.ts` `includes` test "returns false if one thing present, one not" expects
  `true` -- both values are in `{ a: 1, b: 3 }`.  Probably meant to check `1, 2`.

- `lsp/ScopeExplorer.ts` property names:  a type's property members come out as their JS names -- `short_suit`,
  `short_direction` -- while `ScopeMember.name`'s docstring (`lsp.types.ts`) says "name as written, e.g.
  `short-suit`".  Seen 2026-09-29 through `spell describe` on the Solitaire fixture (`Card.spell`), and still so
  2026-09-30.  Either `propertiesOf()` records hold the output name and the node should use the written one, or
  the docstring is stale.  Unverified which.

### 4. Dead / redundant code

- `parser/rules/Choice.ts` constructor: used to assign copied `rules` onto caller's `props` -- with `clone()` passing the rule itself, that re-wrote the ORIGINAL group's `rules` on every clone.  Harmless (equal copy) but fixed in passing.

- `rules/methods.ts` `typed_method_arg`: post-construction `arg.datatype = type.value` workaround; `VariableExpressionProps` declares `datatype`.

- `rules/math.ts` `GtLt.getAST` / `IsGtLt.getAST`: unreachable (output comes via `compileASTExpression()`).

- `parser/rules/Pattern.ts` constructor: `instanceof RegExp` branch unreachable per types; only caller passes object.

- `parser/parser.types.ts` `RuleTestBlock.showAll`: set at several call sites, never read.

- `src/rules/assignment.ts` `Get.mutateScope`: sets `match.data.itVar` (the original local
  `it` `ScopeVariable`, if any), but `Get.getAST` never reads it -- only `match.data.isNewVariable`.
  Looks like dead state, found while converting the file to a rule class (2026-09-20).

- `src/rules/core.ts` `eat_whitespace`: never referenced anywhere in `src` (grepped) -- dead.
  Its old bag form (`constructor: class eat_whitespace extends P.Subrule {}`, `syntax: "{whitespace}*"`)
  was actually broken: `{whitespace}*` compiles to a `Repeat`, not a `Subrule`, so the deprecated
  `Parser.defineRule()` bag path's `props = { ...rule, ...props }` merge silently copied the compiled
  `Repeat`'s own `.rule` (a `Subrule` instance) onto our instance's `.rule`, which `Subrule.parse()` expects
  to be a rule-name STRING, not a nested `Rule` object -- would have thrown at parse time if ever exercised.
  Converting to a class (`Rule.instantiate()` / `initFromSyntax()`) correctly rejects this mismatch instead
  of silently mis-assembling it, so the class now extends `P.Repeat` (what the syntax actually compiles to)
  to match its likely original intent.  No behavior change since nothing calls the rule either way
  (found 2026-09-20 converting `core.ts` to rule classes).

- `spell-lang/src/core/core.ts`: `repeat()` has no compiling rule; `get()` / `set()` are stubs with no callers.

- `spell-lang/src/core/string.ts` `doubleQuote()`: no callers.

- `server/response-utils.ts`: `sendText`, `sendJavascript`, `sendTextFile`, `sendJSFile`, `sendJSONFile`, `convertNumericId`, `getIdParams` -- no callers.

- `util/ResponseErrors.ts`: `SaveError` never thrown.  `util/AppPrefStore.ts`: no callers (`prefs.ts` is what's used).

- `app/pages/ProjectChooser.tsx` `ProjectRootDisplay`: no call sites.

- `app/pages/ProjectSettings.tsx`: unrouted, hardcoded demo data; `editor.showProjectSettings()` is a stub.

### 5. Structure / AGENTS.md conformance (your call)

- `spell-lang/src/core/index.ts` header claims `assert` is global for compiled spell; only `global.spellCore` assignment found.

- `util/DOM.ts` uses ambient `global`; `abortableFetch.ts` imports `global` polyfill.

### 6. Open questions left as `TODO` in code

- `parser/rules/Subrule.ts` `getGroupSpecContribution()`: assumes anonymous `{foo}` lands in `groups.foo`.  Not true if `foo` resolves to a single rule registered only under ALIAS `foo` -- match keeps that rule's own name.  Does real parsing have the same surprise?

- `rules/if.ts` `else_if`: is `priority` (was `precedence`) load-bearing, or does rule order suffice?

- `rules/Sequence.ts` `parse()`: author's `TODOC: WHY?? FOR USE AS A LITERAL STRING??` still unanswered.

### 7. Found by epic `outline-spell` (2026-10-06, probing J8;  also on `main`)

- `AssignmentStatement` over a constant:  after a list of values holding `red`, `set red to 5` compiles to
  `'red' = 5`, broken javascript.  Prove:  `cards have a color as either red or black`, then `set red to 5`.
- the other way round:  `set red to 5` ABOVE `cards have a color as either red or black` gives
  `Card.Colors = [red, 'black']`, i.e. `[5, 'black']`:  `identifier_list` takes the variable.  Prove:  those two
  lines, in that order.
- 2026-10-20 · a card's quoted phrase used ABOVE the file that defines it is misread with no error or warning:
  in the outline Solitaire's Deck.spell (loaded before Card.spell), `the first card of the deck is the ace of clubs`
  compiled to `deck.firstItem == "clubs".ace`, a property `ace` of the text "clubs", always false.  P22 (methods
  before their definitions) makes `to ...` methods callable early, but not quoted phrases (`a card "is the (rank) of
  (suits)" for ...`).  Prove:  that line in a test in Deck.spell, `spell test @spell/examples/outline-solitaire`.
  Found in epic `outline-spell` P22. · spell
- 2026-10-20 · `it is black`, where `black` is one of a property's values (`- its color is red or black`), compiles
  to `this == "black"`:  the thing itself against the text, always false, no warning.  The writer meant
  `its color is black`.  Spell could say so:  a thing compared with a value one of its properties takes.
  Prove:  `a joker is a card` / `- its color is red or black` / `- its value is 53 if it is black otherwise 54`.
  Found in the outline Solitaire, epic `outline-spell`. · spell

## parser

### 1. Behavior bugs

- [V] `spell-lang/src/parser/rules/Literals.ts` `matchAtStart()`: a multi-symbol literal like `**` also matches `* *`
  (whitespace between), though `Symbols`' docs say "no space in-between" -- it never checks
  `token.whitespace` / `end` vs `next`.  Prove:  parse `* *` against a `Symbols("**")` rule.  Found planning the
  `markdown` epic (P4 there fixes it if confirmed).

## py

- The Python writer doubles the braces of an f-string's placeholder in two rules' outputs:
  `1 as a string` compiles to `f"{{1}}"`, which prints the literal `{1}`, not `1`;
  and `CSSStyles` writes `f"{""}"`.
  Seen 2026-10-12 (epic `people-and-orgs`), generating the spell-syntax guide, which compiles each rule's first test
  with `PY.PyWriter`.  Likely the text escaping (`pyText`) running over a placeholder it built itself.
  Prove:  compile `print 1 as a string` to Python and run it.
- `[V]` A method with named arguments compiles to Python that reads them as attributes of a `dict`:
  `to create a new task (with title as text, completed as a choice)`, called
  `create a new task with title = "Create todos app", completed = yes`, writes
  `create_a_new_task({"title": ..., "completed": True})` but `title = props.title` inside, which throws
  `AttributeError: 'dict' object has no attribute 'title'`.
  Seen 2026-10-13 (epic `people-and-orgs` P11), running the new `TodosFormBased` fixture (a copy of the
  `Todos - Form Based` example) under Python in the core contract;  so it's left out of `PYTHON_FIXTURES`.
  Prove:  add `TodosFormBased` to `PYTHON_FIXTURES`, then `yarn vp test run contract` in `spell-app/src/cli`.

## ui

- `$fetch()` (the kit's `src/util/spell/`):  (1) `error.status` is `undefined` on every error it throws:  the
  `status` getter reads `props.response`, which `$fetch()` never passes (it passes `props.status`);  (2) a request that
  never connects leaves an unhandled rejection even when the caller catches the `OfflineError` (`void promise.finally(...)`
  in `abortableFetch.ts`;  under node it ended the process).  Both run against a local server, 2026-10-21 (epic
  `readme` P11).

- `yarn measure` exits 0 even when it prints a CHECK line (today it flags two `src/property/` files outside core).

2026-10-11 (python-target):  `<ui-steps>` on a docs page doesn't wrap its steps' descriptions once its folded section
is opened:  they run off the right edge (the targets guide's "What happens, in order", `guides/targets/targets.html`).
`check-spell.js` can't see it inside a folded section.  Spell UI's steps, or `spell-doc.css`?  Unchecked.
Disproven:  `Icons.get("zoom")` isn't missing -- it is Font Awesome's `zoom` BRAND logo;  with icon packs `zoom` is in
`fa7-brands`, and the `fomantic` pack gives the magnifier.
Disproven (2026-10-01):  the "empty strip" under an open multiple-selection dropdown is the NEXT example's field, which
the open menu floats over.  The "mini images at full width" were the static `ui avatar images` group, hit by a bare
`.avatar img { width: 100% }` in `ui-parts.css` (fixed).  `--ui-form-equal-width` / `-unstackable` were already private.
Parts inside a lone `<ui-event>` / `<ui-comment>` read the owner switches only in style queries, so unset is fine.
Fixed 2026-10-02 (seo, agent E):  the shadow-root-only-child margins (segments, menu, steps, statistics, ad), the
size-container hosts that kept a margin from collapsing (table, celled grid, fluid / circular steps, statistics), and the
item `icon` shorthand's glyph (list 20px wide, menu 0 x 0:  `.icon > svg` never reached the slot's fallback).
Disproven (2026-10-02):  card/content and card/types match class grammar (parity <= 0.14%);  grid/variations' remaining
gap is consecutive grids (`.ui.grid + .grid`), left out on purpose in `ui-grid.css`.
Swept 2026-10-01 (branch `worktree-ui-component-creation`, plan doc `epics/ui-component-creation/`):
every entry below that date was fixed or disproven;  what's left:

### 1. Behavior bugs

- `yarn measure` (2026-10-04, markdown epic P8) prints three `CHECK` lines its docs say should be empty:
  `entriesMissingCore: [ 'ui-flyout' ]`, `runtimeChunks: [ 'rolldown-runtime-B72Djju_.js' ]` and a long
  `coreOutsideCore` list (`spell-kit/util`'s `decorators.ts` / `dom.ts` / `string.ts`, `vocabulary/`, `icons/`,
  `docs-components/SiteData.ts`, `runtime/load.ts` ...).  None of them names a markdown file, and the `dist/` built
  before P8 already holds that same `rolldown-runtime-B72Djju_.js`, so they look older than the markdown branch.
  Not checked on `main`.  (2026-10-20, epic `repo-split` P2:  `md.bundle.js` left Spell UI, so `own ui-markdown` reads
  6.33 kB;  and that branch's `yarn measure` printed no `CHECK` line.)
- `src/components/ui-parts/ui-parts.css` `:state(in-item) > .avatar` [V]:  sets only `display` / `overflow` / round corners,
  no size and no `vertical-align`, so an item's `<ui-avatar>` draws at the image's own size (~3em for Fomantic's
  `avatar/small/*.jpg`) with the name on its baseline, while a card's is 2em, `vertical-align: middle`
  (`--ui-card-avatar-size`).  Fomantic's `ui avatar image` is 2em everywhere.  Seen on `site/components/ui-avatar.html`,
  Owners / Item.  Prove:  compare the two avatars' boxes;  fix with an `--ui-item-avatar-size` alias like the card's.
  (2026-10-04)
- `src/components/ui-step/` horizontal `<ui-steps circular>`:  a description that wraps to a third line spills out of
  the group's box (the next example's header crowds it;  inside an `<ui-segment inverted>` the last line is clipped
  at the segment's bottom edge).  Seen on the site page `site/components/ui-step.html`, Ordered (second block) and
  Inverted (ordered circular), ~150px per step at a 1440px viewport.  Likely the circular step's content is
  positioned out of flow (or the group has a fixed block size), so its height doesn't count.  Prove:  a circular
  step with a long `description` in a narrow group, measure the group's height vs the content's.  (2026-10-03)
- `src/components/ui-toast/ui-toast.test.tsx` "life" tests:  still set `pause-on-hover="false"` for Linux CI.  The toast now
  pauses only after a real pointer MOVE (a toast appearing under a resting pointer closes), which should be the CI
  cause, but nobody ran the Linux image.  Prove:  drop the attribute and push;  CI green => remove it.  (2026-10-01)
- `src/components/ui-tab/` `<ui-tabs basic color="blue">`:  the BASIC panes draw a dark rule along their top edge
  (seen at 1000px, chromium, scratch page in epic `spell-ui-pages` P3);  `basic` should drop the segment box, and a
  segment's `color` only paints the top edge of a NON-basic segment.  Likely `ui-segment.css`'s coloured-edge rule
  isn't scoped out by `.basic`, or the pane forwards `color`.  Prove:  `<ui-tabs basic color="blue">` vs `<ui-tabs
  basic>` in a pane screenshot.  (2026-10-03)
- `disabled="false"` / `disabled="no"` on a FORM-ASSOCIATED tag (`<ui-button>`, `<ui-checkbox>` ...) still disables it
  (shadow `<button disabled>`, `ui disabled` class, host `:disabled`), though `docs/grammar.md` "Booleans" says those
  words mean false (other keyOnly words, e.g. `basic="no"`, do follow it).  Likely the platform:  a form-associated
  element is disabled by the attribute's PRESENCE (`formDisabledCallback` -> `formDisabled`, `isDisabled()` in
  `UIButton`).  Either document the exception in `grammar.md` (the site's grammar page now does) or have the element
  drop a false-word `disabled` attribute.  Prove:  `<ui-button disabled="false">` in a test.  (2026-10-03)
- `src/components/ui-accordion/UIAccordion.tsx` ~line 82:  `this.loaded() && UI.browser.supports.interpolateSize` in a
  memo.  `loaded()` is TRUE on the server, and `UI.browser` throws before the runtime loads, so an SSR render of an
  accordion probably throws (`<ui-button>` hit exactly this, fixed with an `isServer` guard).  Prove:  add an
  accordion case to `test/ssr.ssr.test.tsx`.  (2026-10-01)
- `src/runtime/Styles.ts` shared adopted sheets, WebKit:  a viewport resize while NO element using a sheet is on the
  page leaves that sheet's `@media` results stale, so a transient component added later (toast, modal) renders at the
  old breakpoint.  Reproduced only through Playwright's viewport resize;  the toast / popup tests now render before
  resizing.  Possible fix:  one hidden persistent adopter per sheet.  Prove on a real device rotation.  (2026-10-01)
  - Same family, seen again (2026-10-03, `stack-with="page"`):  a `<ui-grid>` inserted and the viewport resized
    BEFORE its style was ever resolved kept `--_grid-range: mobile` at 1200px in WebKit, even with other grids alive;
    a `getComputedStyle()` or one frame before the resize fixed it (`test/viewport.ts` waits a frame).  A real page
    paints before any resize, so probably test-only.  Prove:  insert + `page.viewport()` with no frame between.
- `src/elements/MenuOptions.test.ts` "filters 5000 cold options in under 50 ms":  failed once in a full
  `yarn test:all` in webkit, passes 3 / 3 alone.  A wall-clock budget under 3-browser load;  maybe skip budgets under
  `SPELL_UI_TEST_ALL`, as CI skips the dropdown's 16 ms one.  (2026-10-01)
- `src/components/ui-popup/ui-popup.test.tsx` "flips to the other side":  failed once in a full firefox run (arrow
  `::before` top 44px, expected < 0), then passed every time.  Maybe the arrow's `getAnimations` wait.  (2026-10-01)
- `src/components/ui-section/UISection.tsx` the toggle:  the `header` slot sits INSIDE the fold `<button>`, so a link
  in a rich title (`<span slot="header">4. Ideas for <a href=...>`, `guides/solid/solid-2.html` `#ui`) is
  interactive content in a button.  The click half is FIXED (2026-10-02:  `fromControl()` leaves a click on a link /
  control in the title alone, as ui-accordion does;  test "leaves a click on a link inside a rich title").  Left:
  screen readers may not reach a link nested in a button.  Prove with VoiceOver on `#ui`;  a fix would render a
  rich title's controls outside the button.  (2026-10-02)
- `src/components/ui-root/UIRoot.tsx`:  every `<ui-root>` -- bare, `icons`, `display`, from JSX or plain HTML -- logs
  Solid's dev warning `[STRICT_READ_UNTRACKED] Reactive value read directly in an effect callback will not update`
  once as it connects (seen in `app`'s `src/runner/runner.browser.test.tsx`, P7 of `solid-migration`).  Something in
  its setup reads a signal in an effect's APPLY (or `onSettled`):  that read won't re-run it.  Harmless if the value
  never changes after;  a missed update if it does.  Prove:  dev build, break on the warning, read the stack.
  (2026-10-02)
- `src/docs-components/ui-docs-example/UIDocsExample.tsx` ~line 81:  the code button is a `<ui-button>` given
  `aria-expanded` / `aria-controls` on its HOST, but `<ui-button>` forwards only `aria-label` to its inner `<button>`,
  so assistive tech probably never hears the pane open / closed (and `aria-controls` can't cross the shadow root
  anyway).  `<ui-item>` got the same forwarding for `aria-expanded` on 2026-10-03 (`<ui-docs-nav>`).  Prove:  read the
  inner button's attributes in the docs example test;  fix by forwarding `aria-expanded` in `UIButton`.  (2026-10-03)

### 3. Styling / CSS

- `src/styles/sizes.css` `ui-gap-<space>` vs `utilities.css`'s layout primitives:  `.ui-stack`, `.ui-cluster`,
  `.ui-split`, `.ui-flank`, `.ui-grid` each set `gap: var(--ui-space-m)` at the SAME specificity, and `ui.css` imports
  `sizes.css` BEFORE `utilities.css`, so `class="ui-cluster ui-gap-2xl"` keeps the `m` gap:  the utilities page's
  Gap example (old Astro page and `site/utilities.html` alike) showed three identical rows.  Fix:  `:where()` the
  primitives' selectors, or emit the gap utilities after them.  `site/utilities.html` demos the gaps on `ui-flex` until
  then.  (2026-10-03, epic `spell-ui-pages` P5)
- `src/styles/utilities.css` `ui-w-*` on PAGE markup:  `reset.css` is `:host`-scoped, so page elements stay
  `box-sizing: content-box`, and `ui-w-1/2` plus `ui-p-*` overflows half (`site/utilities.html`, Widths:  a `ui-w-1/4
  ui-p-s` box measured 213px of a 755px row, 1/4 + 2 x 0.75em).  Maybe intended (the foundation never touches page
  boxes), but then the width utilities want `box-sizing: border-box` themselves.  (2026-10-03, epic `spell-ui-pages`
  P5)
- `src/components/ui-grid/ui-grid.css`, `ui-card.css`:  as `items` was (fixed 2026-10-01), a size-container group host keeps
  its root's top margin from collapsing with the heading above:  element markup shows a bigger gap than class grammar
  (grid/types +16px under the celled grid, grid/variations several sections, card/content and card/types one each).
  Fix per owner, as `ui-items.css` did (`:host(:state(items))` carries the outer margin).  (2026-10-01)
- `src/server/` static render of `ui-step/examples/elements/variations.html`:  the static page is 1713px tall where class
  grammar is 1810 and the elements 1809;  the whole gap is the last example, `<ui-steps circular vertical>`, whose
  steps are cut short / overlap in the static output.  Prove:  `yarn test:visual --static --browsers chrome --grep
  step`, `ui-step/variations` diff.  (2026-10-02)
- `src/components/ui-list/ui-list.css` class grammar:  an item of an `.icon` box plus BARE text (`<div class="item">
  <span class="icon">svg</span> Inline Text</div>`) drops the text BELOW the icon (the table-cell icon gets an anonymous
  table, the text an anonymous block);  Fomantic keeps it beside (`i.icon:only-child`), and so do the elements (the
  slot is the next cell).  So the static render does it too.  `ui-list/content` parity (7.5%) is only that.  (2026-10-02)
- `src/components/ui-table/ui-table.css` outer margin:  the host (and a static render's scroller) use a fixed `1em`,
  not `--ui-table-margin` (which only the light-DOM table reads, where `:first-child` / `:last-child` zero it).  So the
  public token never moves an element table.  Prove:  set `--ui-table-margin: 3em` on a `<ui-table>`, measure.
  (2026-10-02)

- `src/components/ui-tab/UITabs.tsx` / `src/styles/colors.css`:  `<ui-tabs inverted pointing secondary>` fills its
  inverted panes grey:  `secondary` (a MENU look word on the tabs root) also matches colors.css's `.ui.secondary` colour
  remap, so the root sets `--ui-color: var(--ui-secondary)`, which inherits through the panes' `<slot>` into each
  `.ui.inverted.tab.segment` (`--_segment-bg: var(--ui-color, ...)`).  Class grammar and the static render
  (`yarn test:visual --static --grep ui-tab`, `ui-tab/variations` "Inverted") keep the plain inverted background.
  Prove:  computed `--ui-color` on the tabs root's `<slot>` there.  (2026-10-02)
- `src/components/ui-tab/ui-tab.css` vertical tabs:  `examples/elements/variations.html` "Vertical" says the pane
  "will always match the tab height", but the element pane's segment is content-high:  the HOST is the stretched flex
  item, its `.ui.tab` box isn't.  The static render (root = flex item) does stretch.  (2026-10-02)
- `src/components/ui-items/ui-items.css`:  the outer margin now sits on the host, in the host's UNSCALED font size, so a
  sized group's `1.5em` margin uses 16px.  Unmeasured.  (2026-10-01)
- `src/components/ui-list/ui-list.css`:  a raw slotted `<img>` followed by `<ui-content>` still puts the content below:  a
  replaced element can't be a table cell.  `<ui-image>` and the `image` shorthand work;  document, or wrap.  (2026-10-01)
- `src/components/ui-label/ui-label.css`:  a plain CLASS-GRAMMAR `.ui.label` inside a coloured ancestor still takes the
  ancestor's colour (Fomantic doesn't);  `<ui-label>` elements are fixed (host reset).  (2026-10-01)

- `src/components/ui-menu/ui-menu.css`:  `<ui-menu inverted color="violet">` items draw DARK text on the violet fill;
  Fomantic's inverted coloured menu has white text.  Plain `<ui-menu inverted>` is right (light on dark).  Prove:  that
  markup, `getComputedStyle()` of `::part(item)`'s `color`.  (2026-10-02, solid-migration P6)
- `src/components/ui-menu/` `<ui-menu vertical>` of `<ui-item link>`:  each item's `::part(item)` is a `<button>` at
  `display: block`, which still shrinks to its text, so items are as wide as their labels and their dividers stop
  short (seen in the app's chooser, `ProjectMenu`:  137 / 128 / 191px items in a 193px `fluid` menu).  Probably wants
  `width: 100%` (and `text-align: start`) on a vertical menu's button items.  The app's `ProjectDropdown.css` does it
  (HACK).  Prove:  the "Link items demo" in `examples/elements/content.html`.  (2026-10-02, solid-migration P8)
- `src/components/ui-menu/ui-menu.css` `secondary`:  `secondary` is ALSO a colour alias, so the generic remap
  (`colors.css`, `.ui.secondary { --ui-color: var(--ui-secondary) ... }`) runs on every `.ui.secondary.menu` root and
  its items inherit it:  an uncoloured secondary menu's active item reads `--ui-color-text` (black's text) and a
  secondary pointing underline `--ui-color` (black), whatever `--ui-menu-active-color` / `-border-color` say.  Hidden
  in our default look (black ~== the selected text colour);  shows when a theme recolours them (`themes/chubby.css`
  undoes the remap, HACK).  Same suspicion for `secondary` segments / buttons groups etc.  Prove:
  `<ui-menu secondary pointing><ui-item active>A</ui-item></ui-menu>` with `--ui-menu-active-color: red` on `:root`:
  the item stays black.  (2026-10-02, spell-ui-pages P6, T2)
- `src/components/ui-dropdown/UIDropdown.tsx` `label()`:  a host `aria-label` never reaches the combobox (only
  `placeholder` / `text` / `name` do), so an icon-only dropdown (no text, an `icon` slot) has no accessible name.  The app's
  `<MoreMenu>` ("...") is one.  (2026-10-02, solid-migration P6)
- `src/styles/utilities.css` ~line 439:  `.ui-prose :where(ul, ol)` comes after `.ui-list-plain` with the same
  specificity, so a plain list inside prose keeps its 1.5em indent.  The docs' `/components/` index works around it
  with `ui-not-prose`.  (2026-10-01)
- docs site `/components/ui-popup/` scrolls sideways at 375px:  a popup example and a code block are wider than the
  screen (menu closed too).  (2026-10-01)
- `src/components/ui-calendar/ui-calendar.css` field:  every popup calendar's field shows a 1-2px tick just BELOW
  its bottom-left corner (a stray border / outline piece outside the rounded box), at desktop width, light theme
  (`site/components/ui-calendar.html`, any field:  `tools/results/site-check/ui-calendar-desk-full.png` crop of the
  Size example).  Maybe the `input` part's box and the root disagree on radius or the trigger button's border.
  Prove:  zoom a 2x screenshot of `<ui-calendar fluid>`.  (2026-10-03, epic `spell-ui-pages` P4)
- `src/components/ui-checkbox` inline rows:  checkboxes / radios / toggles written side by side
  (`<ui-checkbox>Red</ui-checkbox> <ui-checkbox ...>`) sit with only a word space between them, so a toggle's lane
  touches the previous label (`site/components/ui-checkbox.html`, Colored and Size).  Fomantic's docs add the gap in
  docs CSS, so maybe intended;  a `--ui-checkbox-*` margin or a `<ui-fields inline>` wrapper would fix the look.
  (2026-10-03, epic `spell-ui-pages` P4)
- `src/components/ui-modal/ui-modal.css` header NOTE:  suggests `--ui-modal-dimmer-filter: var(--ui-dimmer-blur)` for
  Fomantic's blurring dimmer, but `--ui-dimmer-blur` looks declared nowhere global (`ui-dimmer.css` only reads it,
  with its own fallback), so that value is invalid and the backdrop gets no filter.  The modal page's Theming tab
  writes `blur(5px) grayscale(0.7)` instead.  Prove:  set the suggested value on a `<ui-modal>`, open it, read
  `getComputedStyle(dialog, "::backdrop").backdropFilter`.  (2026-10-03, epic `spell-ui-pages` P4)
- `site/` masthead `<ui-docs-themes for>`:  a family with no Fomantic theme (embed, nag, flyout) shows a
  `0 themes` picker, and one with a single theme `1 themes` (I71);  maybe hide the picker at 0.
  (2026-10-03, epic `spell-ui-pages` P4)
- `src/docs-components/ui-docs-api/` tables:  on a component page loaded on the Examples tab, switching to API (a
  click, or `tabs.value = "api"`) shows every table STACKED (each row's cells one under another, header cells in a
  column) at 1400px;  loaded straight on `#api` they're normal columns.  Looks like the tables decide to stack while
  their pane is hidden (width 0) and don't re-decide when it shows.  Prove:  load `components/ui-button.html`, set
  `document.querySelector("#site-tabs").value = "api"`, screenshot;  compare with `ui-button.html#api`.  (2026-10-04,
  epic `ui-docs-rework` P6)

### 4. Types / API surface

- `src/components/ui-dropdown/UIDropdown.en.ts` `parts`:  the root `div.ui.dropdown` has no part name, so tokens
  read at its root can't be themed via `::part()` (search got `::part(search)` on 2026-10-01).  (2026-10-01)

- `package.json` `smoke`:  needs `vendor/importmap.json` from `yarn vendor`, but doesn't run it, and throws when it's
  missing.  `test:all` skips the fork tests plain `test` runs (`yarn test:fork`).  Prove:  fresh checkout,
  `yarn smoke`.  (found by epic `commands`, P2;  unverified)

## app

- A project copied to a folder of another name breaks on its words file (2026-10-22, found by epic `readme`
  P9 while checking README-examples):  `calculator.en.js` in a folder named `calc2` is read as Spell source by
  `spell compile` and `spell test`, which print 19 "Don't understand" errors;  moving the file out fixes it.
  Likely the project's file list knows its words file only by the folder's name (`<folder>.en.js`).  Not looked for.

### 1. Behavior bugs

- The dev editor draws nothing (2026-10-22, seen in the `spanish` worktree, epic `spanish` P13):  `app/index.html`'s
  `<script src="../src/app/index.tsx">` is served as written, and from `/` the browser asks for `/src/app/index.tsx`,
  which vite resolves inside its root, `app/`, and answers 404 ("Failed to load url /src/app/index.tsx", in
  `.spell-server.editor.log` too).  Likely since repo-split P14 moved the source to `src/app/`.
  `/@fs/<checkout>/spell-app/src/app/index.tsx` loads it (P13's screenshots routed the request there).
  Not checked on `main`.

- `src/solid/Markdown.browser.test.tsx` "draws markdown as HTML once $/markdown has loaded" (2026-10-10, epic
  `spell-element`):  fails when run with the other `src/solid` browser tests, passes alone (`yarn vitest run --project
  browser src/solid/Markdown.browser.test.tsx`).  Seen since P4 of `spell-element` (2026-10-09), every full
  `yarn test` in `spell-app/app`.  Likely test isolation:  `spell-lang/markdown`'s lazy load already done by an earlier test, so
  "the plain text until then" never shows.  Not checked on a tip before P4.
- `src/runner/element.build.test.ts` "one Solid per page" fails on `main` (2026-10-07, found merging outline-spell;
  the same in the main checkout):  the built runner's `ui/customElement.js` imports Solid itself, where only
  `spell-solid.js` should (`expected [ 'spell-solid.js', 'ui/customElement.js' ] to deeply equal [ 'spell-solid.js' ]`).
  So a page may load two copies of Solid.  Prove:  `yarn vp test run src/runner/element.build.test.ts` in `spell-app/app`.
- `/demo/spell-app.html` on the editor's dev server (`spell server start all`, e.g. `localhost:61858`) draws
  nothing:  `<spell-app>` is never defined, because `/element/spell-app.js` comes back as the HTML page (vite's
  fallback).  Only the app's own server (`packages/app/src/server/index.ts`, `{ prefix: "/element", dir:
  "dist-element" }`) serves `dist-element/`, and the editor started by the page server doesn't go through it.
  `packages/app/AGENTS.md` says the demo runs "on the dev server".  Seen 2026-10-06 in worktree `output-targets`
  (epic `output-targets`, hand check V5);  not checked on `main`.  Prove:  open the demo page, or
  `curl -s localhost:<editor port>/element/spell-app.js | head -c 100`.
  - FIXED on branch `output-targets` (`d3eae46a`, 2026-10-06):  `appRoutes.ts` serves `dist-element/` at
    `/element`, and `vite.config.ts` proxies `/element` to the page server.  Drop this entry once it's on `main`.
- `spell-app/src/app/runner/RunnerConsole.tsx` `RunnerConsole()`:  `const console = props.console` reads a prop in the
  component BODY, an untracked scope:  Solid 2's `STRICT_READ_UNTRACKED` should warn in dev, and a later
  `console` prop change is never seen.  Prove:  dev build, open a runner, look for the diagnostic;  fix with
  `untrack(() => props.console)` if it's deliberately read once (`solid-2.md` "Reads").  Found by `/epic wwod` P2.
- [V] `src/runner/element.build.test.ts` "one Solid per page":  Solid is found in `ui/customElement.js` as well as
  `spell-solid.js`, so the test fails -- with or without the `markdown` epic's changes (checked 2026-10-04 by
  reverting `Markdown.tsx`;  likely from `main`'s merge that day).  Prove:  `yarn vitest run --project node
  src/runner/element.build.test.ts` in `spell-app/app`.
- `src/runner/element.build.test.ts` "one Solid per page" fails on `main` (2026-10-04, plain vite) and on
  `vite-plus` alike:  the element build puts Solid code in `ui/customElement.js` as well as `spell-solid.js`, so a
  page may load a second Solid.  Prove:  `yarn vitest run src/runner/element.build.test.ts` in `spell-app/app`.
  Likely from `ui`'s newer `customElement` chunk, not the toolchain.  (found merging epic `vite-plus`;  unverified)

- `package.json` `clean`:  removes `.cache` and `build`, but the builds write `dist/`, `dist-runner/`,
  `dist-element/`, which it leaves.  Prove:  `yarn build:element && yarn clean && ls`.  (found by epic `commands`,
  P2;  unverified)

- `packages/spell/src/node/response-utils.ts` `sendJSFile` / `request_getCompiled` / `request_getScopes` [V]: the content-type is set
  to `text/javascript` BEFORE the existence check, so a not-found 404 carries a JSON `{errors}` body labelled `text/javascript`.
- `spell-app/tests/app/runner/element.build.test.ts` "one Solid per page":  fails on branch `precedence-and-types`
  (2026-10-04), whose changes are parser-only -- the element build's `ui/customElement.js` also holds Solid, beside
  `spell-solid.js`.  Prove:  run it on `main`.  (The same root run's `*.browser.test.tsx` failures all passed alone.)
- `spell-app/src/app/solid/ConsoleLines.tsx` (and its Solid twin `src/solid/ConsoleLines.tsx`) `<ConsoleObject>`:  a logged `true`,
  `false` or `undefined` shows as an EMPTY value -- it's handed to JSX as is, which draws no text for them (React and
  Solid alike).  Probably wants `String(thing)`;  kept as is in the Solid port (P6b) to keep behaviour.
- `spell-app/src/app/editor.ts` `showingMatchRuleNames` [V]:  named backwards.  `<MatchRoot>` passes it as `compact`, and
  `MatchViewer.css`'s `.compact .name { display: none }` HIDES the names, so `true` (the default) means names hidden;
  `Actions.toggleMatchRuleNames` agrees with the CSS ("Show Rule Names" while it's `true`), not with the docstring.
  Kept as is in the Solid port (P6c, `src/solid/MatchViewer.tsx`;  pinned by its browser test).  Fix:  rename to
  `compactMatchView` / invert, together with the action's labels.
- `packages/app/src/ui/modals/Prompt.tsx` `promptForNumber()`:  resolved a NUMBER once the user had typed (the forms'
  `getEventValue()` does `parseFloat` for `type="number"`), though `editor.promptForNumber()` says
  `Promise<string | undefined>`.  The Solid port (P6f, `src/solid/modals/dialogs.ts`) resolves the string, as typed.
  Callers (only `ConsoleViewer`'s demo) don't care;  decide whether it should be `number | undefined`.
- `spell-app/tests/app/solid/modals/modals.browser.test.tsx`:  ONE cold run (fresh vite optimize) printed
  `STRICT_READ_UNTRACKED` for `constructor.isLoaded` / `createProps.get` while the first `<Chooser>` rendered
  `<ui-radio>`s inside Solid's `render()`;  three warm runs printed nothing.  Probably `solid-element` reading signals
  while an element upgrades inside an owner.  Prove:  clear `node_modules/.vite` / vitest's cache, rerun once.
  - P8 (2026-10-02):  the dev server prints them on EVERY page load, with stacks:  `constructor.isLoaded` /
    `createProps.get` from `spell-ui/src/components/ui-button/UIButton.tsx` `hasNativeInvokers()` (`invokers()` until
    epic `wwod-spell-ui` P5) / `resolveInvoker()` (~lines 379-396, read in an effect's APPLY), and an unnamed one from `spell-ui/src/elements/RootSettings.ts`
    `set()` via `UIRoot.applySettings()` (`UIRoot.tsx` ~242-275).  So `ui`'s, not the app's:  those reads belong in
    the effects' compute (or `untrack()`).
  - 2026-10-09:  `createProps` and `constructor.isLoaded` are gone:  epic `spell-element` folded solid-element into
    `ui`'s `DOMElement` (one attribute store, P3).  Recheck on the dev server before chasing it.
- `spell-app/src/app/solid/ProjectDropdown.tsx` `<ProjectDropdown>`:  the dev server warns `[WIDE_SCOPE_DEPS] memo
  "computed" is subscribed to 30 sources` -- `createProps.get` x ~29 -- at `<ProjectDropdown> › children › computed ›
  computed`, i.e. the `<For>` drawing its `<ui-item>`s.  Our code reads no props there;  probably each `<ui-item>`
  upgrading synchronously as the `<For>` makes it, and the fork's `createProps` reads landing in OUR computation
  (`packages/solid-element`).  `<FileDropdown>` does the same with fewer items, under the warning's threshold.  Prove:
  a `<For>` of 30 `<ui-item>`s in a browser test, then Solid's `attribution` / the memo's sources.
  - 2026-10-09:  `packages/solid-element` and its `createProps` are gone (epic `spell-element`:  folded into `ui`'s
    `DOMElement`, one attribute store).  Recheck whether the warning still shows.
- `packages/util/src/spell/DOM.ts` `getPadding()` (`CSS_TLBR_VALUES`):  reads `NaN` for every side in `app`'s BROWSER
  test project (vitest + chromium), while `getComputedStyle(el)["padding-left"]` there is `"0px"`;  on the dev server
  it reads `0`.  Probably the `#top` ... private fields as the vitest transform lowers them (declared, no
  initializer).  `src/solid/SplitPanel.tsx` reads padding itself now.  Prove:  `getPadding(document.body).left` in any
  `*.browser.test.ts`.  MOOT once epic `output-targets` merges:  its P4 deletes `DOM.ts`, nothing reading it any more.
- `SP.SpellProjectRoot.guides.load()` (the chooser's "Open Guide" list):  the API answers 500, `ENOENT ... scandir
  .../projects/system/guides`:  the folder isn't in git (no guides yet), so EVERY load of the chooser logs a failed
  request.  React's `ProjectMenu` left the rejection unhandled;  the Solid one (P8) says "Couldn't load Guides".
  Fix:  the API answers an empty list for a root whose folder doesn't exist (or commit `projects/system/guides/`).
- GONE (P11, 2026-10-02:  `tracked()` is a Solid memo on spell cells, whose `Reaction` ignores its own writes;
  pinned by `tracked.browser.test.ts`).  Was:  `spell-app/src/app/solid/tracked.ts` `tracked()` [V]:  THROWS `Cannot access 'observer' before initialization` when
  `read()`, on its FIRST run, changes an `easy-state` value it has just read.  easy-state's `autoEffect()` is
  `const observer = observe(fn, { scheduler: () => scheduler.add(observer) })`, and `observe()` runs `fn` at once:  the
  self-trigger calls the scheduler while `observer` is still in its TDZ.  Hit by spell programs' computed properties,
  e.g. Solitaire's `state` (`spellCore.map()` makes a new `Pile` and fills it).  Seen (P6d) as the Thing Explorer's
  `state` cell showing that error;  `src/solid/ThingExplorer.tsx` works around it with its own `trackedProgram()`
  (observer-util `observe()` + a scheduler that takes the reaction as its ARGUMENT).  Fix:  the same in `tracked()`.
  Prove:  `tracked(() => { const list = store.list;  list.push(1);  return list.length })`.
- `spell-app/src/app/solid/loadUI.ts` `uiReady`:  its docstring says under node (the `node` test project) it "defines
  the tags only", but importing it there throws `customElements is not defined` (from `spell-ui`'s families'
  `define()`).  So a Solid component a `node` test renders can't import `./loadUI` or the `spell-app/app/solid` barrel
  (P6d's explorers don't, and say so).  Prove:  import `./loadUI` in any `src/**/*.test.tsx`.

## cli

- `spell compile <file>.spell --stdout --target py` on a LOOSE file ignores `--target` (2026-10-22, found by epic
  `readme` P9):  it prints the JavaScript, without its import line.  On a project folder `--target` works as
  documented.

- `spell design <verb> --help` RUNS the verb:  `pushed --help` recorded a push (it rewrote the content folder's
  `brand/design-system.json` with `files: {}`;  restored by hand from c0ffcdbd on 2026-10-21);  `build --help` and
  `bundle --help` crash with `ERR_PARSE_ARGS_UNKNOWN_OPTION`;  `check --help` reads `--help` as a bundle path.
  spell-ui's `designCommand.ts` passes every argument to the tools.  Seen in epic `readme` P11.

- `spell app create --help` (and its code's comment) say "your space in spell-spaces";  the folder is `spell.spaces`.

### 1. Behavior bugs

- (the CLI's spell-side suspicions -- `SpellDiskWorkspace.diskChanged(uri, "created")`, `ScopeExplorer`
  property names -- are under `spell`.)
- `src/cli.test.ts` "summarizes a plan doc":  fails on branch `precedence-and-types` (2026-10-04), unrelated to its
  changes -- `yarn plan-doc summary unified-server` exits 1 with `no .plan-items[data-kind="judgement"] in the doc`.
  Either `unified-server.html` lost its judgement list or `plan-doc` now requires one.  Prove:  run it on `main`.
- `[V]` `src/main.ts` `.version(globalThis.__PACKAGE_VERSION__)`:  `spell --version` prints `@spell-app/spell`'s
  version, not the CLI's (`0.8.0`):  `spell-lang/spell/node/packageVersion.node` reads the `package.json` three folders up
  from ITSELF.  Prove:  `spell --version` vs `packages/cli/package.json`.  (found by epic `commands`, P2)
  NOTE: `main.ts`'s comment calls this deliberate ("the PARSER's, which `spell --version` prints"), so maybe not a
  bug -- but then the CLI's own `0.8.0` is shown nowhere.
- `CLI.runCode()` seems to HANG when a program calls a `spellCore` method that doesn't exist (a `TypeError` at run
  time), until the caller's timeout, instead of exiting with the error.  Seen once (epic `output-targets` P16,
  2026-10-10):  `contract.test.ts`'s old-names test, with the deprecated aliases removed, timed out at 60s.
  Prove:  `spell run` a project whose code calls `spellCore.nope()`.
- `package.json` `spell` script (`node bin/spell.mjs`):  yarn runs it with the cwd at `spell-app/src/cli`, so a relative
  target or `@workspace` resolves there, not where you typed it.  Prove:  `yarn workspace @spell-app/cli spell lint .`
  from `packages/spell/projects/...`.  Nothing references the script;  drop it or document `INIT_CWD`.

## docs

### 1. Behavior bugs

- `spell dev plan-doc phase-body` / `updated` (main's JavaScript tool, 2026-10-07, epic `epic-components`):  links in
  the HTML passed to `phase-body --goal` came out one `../` too deep in the phase's part file, and `updated` wrote a
  wrong `data-phase` on the Updated lines of P6 and P8 (a reopened done phase).  Fixed by hand in the doc;  the cause
  not looked for.  Same family as the papercut "links pointing one folder too high" (`agents/PAPERCUTS.md`, docs):
  the part-file rebase seems to run on text that's already relative to `parts/`.  Check the TypeScript port
  (`spell-epic/src/tool`) for the same once it's on `main`.
- A running epic's plan doc shown at its WORKTREE address never updates live:  `spell dev plan-doc open <name>`, run
  in worktree `<name>`, shows `/worktrees/<name>/epics/<name>/<name>.plan.html` (main server, port 4747) in the side
  bar, and no edit to the doc ever reaches that page;  the same doc at `/epics/<name>/<name>.plan.html` (either
  server) updates in place.  Owen saw no J1 (epic `output-targets`, 2026-10-05) while every fresh load showed it.
  Proven:  two headless pages, one at each address, then `plan-doc estimate <name> 9 "1h"`:  P9's badge changed on
  the `/epics/` page only.  Likely mechanism (not read):  the page server names a change by the shared file's
  `/epics/...` path, and the worktree-address page waits for its own.  Also:  `plan-doc open` (`DocView.show()`)
  never reloads a page already in view, so re-running it doesn't help.  Workaround:  `epic pages link
  <main checkout>/epics/<name>/<name>.plan.html --show`.  Fix:  show plan docs (shared content) at their `/epics/`
  address from any checkout, or have the server announce a shared file's change under every address that serves it.

- `epic pages update` (check-spell over every page) skips any page whose TEXT mentions
  `ui/site/_assets/site.js` -- meant to skip Spell UI site pages, it also drops `server.html`, `design-system.plan.html`,
  `review-review.plan.html` and others that merely name the file, so they're never checked.  Prove:  list the pages
  it checks;  `server.html` is missing, yet `node tools/check-spell.js content/server.html` runs and passes.  Fix:
  skip by the page's own `<script src>`, or by path (`spell-ui/site/`), not by text.  (Found in epic
  `design-system` P9, 2026-10-05.)

- `scripts/plan-rename.js`, re-run in a worktree after merging `main` (as its header says to):  it rewrites EVERY
  `epics/<n>/<n>.html` it finds, including ones written on purpose as the old name.  `review-review.plan.html`'s
  test "open `/packages/docs/epics/seo/seo.html` (the old name)" became `seo.plan.html (the old name)`.  Prove:  on a
  branch with an old-name plan doc, `node scripts/plan-rename.js --dry-run` lists `review-review.plan.html` under
  "links".  Fix:  skip a link followed by "(the old name)", or only rewrite links to the plan docs it just renamed.
  (Found in epic `design-system`, 2026-10-04;  reverted there by hand.)

- [V] `scripts/plan-doc.js` `summary`:  throws "no .plan-items[data-kind="judgement"] in the doc" on a plan doc from
  before the Judgement calls section (`epics/unified-server`), so `spell-app/tests/cli/cli.test.ts` "summarizes a plan
  doc" fails -- on `main` too (checked 2026-10-04, `markdown` epic).  Fix:  `summary` treats a missing list as
  empty, or `migrate` the doc.

- `scripts/plan-doc.js` `add-phase`:  `--goal` / `--files` / `--verify` go into the page as raw HTML, so
  `<Project>.scopes.js` or `--against <ref>` become bogus `<project>` / `<ref>` elements (oxfmt then indents them as
  tags).  Escape them as text -- or document that they're HTML, as `--details` is.  Prove:
  `yarn plan-doc add-phase x "A" --goal "write <Project>.js"`, then look at the `#p1` body.
- `scripts/doc-links.js` `resolve()`:  the alias form is still `#name/...` (from before the `$/` aliases), and `$`
  isn't in the path character class, so `<code>spell-kit/util/index.ts</code>` never links;  `cli.html`, `server.html`,
  `solid-migration.html` list dozens of `$/...` spans as unresolved.  Kept as-is in the python port (P10, epic
  `commands`) to stay byte-identical.  Prove:  `node scripts/doc-links.js server.html`, see `'spell-kit/server'` in the
  unresolved list.
- `scripts/plan-doc.js` `summary` (and likely other commands) fails on a plan doc made before judgement calls became
  their own item kind (`195ab6a4`):  "no .plan-items[data-kind="judgement"] in the doc:  is it a plan doc?".  Breaks
  `spell-app/src/cli`'s `spell plan-doc > summarizes a plan doc` test (`unified-server`).  Prove:
  `yarn plan-doc summary unified-server`.  Fix:  treat a missing list as empty, or have `migrate` add it.
- Every plan doc's phase "Estimate" line has a blank icon:  `PHASE_FIELDS` in `scripts/plan-doc.js` gives it
  `clock`, which isn't in `ICONS` in `scripts/bundle-spell-ui.js` (only `clock rotate left` is).  Prove:
  `node scripts/check-spell.js epics/isolate-changes/isolate-changes.plan.html` notes "5 icon(s) with no <svg> drawn",
  all `ui-item[clock]`.  Fix:  add `solid/clock` to `ICONS`, then `yarn docs:update`.
- `../spell-app-dev/.gitignore` (written by `epic shared init`):  ignores `details/`, `*.lock`, `*.tmp`, but
  NOT plan docs' review inboxes, `epics/*/*.inbox.json` -- which `spell-epic/AGENTS.md` ("Review inbox") calls
  git-ignored, per-machine state.  spell-app's `.gitignore` still ignores them, but they now live in the shared
  repo, so the `Stop` hook's auto commit would commit Owen's pending marks.  Prove:  mark an item on a plan doc,
  end a turn, `git -C ../spell-app-dev log --stat -1`.  Fix:  add the pattern to `epic shared init`'s ignore
  list and to the shared repo's `.gitignore`.
- spell-app's `.gitignore` comments still say an epic's details pages and plan docs are "committed" (with the
  branch);  harmless, but stale since `shared-content`.
- `packages/epics/src/convert/ConvertRun.test.ts` "the real windows-and-review doc":  fails since P12 of
  `epic-components` (`8a9ede10`) converted every shared plan doc:  the converter now skips the already-converted real
  doc, so `result.conversion` is `undefined` ("Cannot read properties of undefined (reading 'problems')").  Prove:
  `yarn vp test run --project node src/convert/ConvertRun.test.ts` in `spell-epic`.  Fix:  run it on a copy of
  the doc from before the switch (git history of `spell-app-dev`), or drop it now the switch is done.  (Found
  2026-10-08 merging `skillz`.)

## server

- `spell server url <file>` names a worktree by its folder alone (`checkoutOf()` uses `basename(root)`):  a file at
  `~/www/spell.worktrees/<epic>/spell-app/README.md` gets `/worktrees/spell-app/README.md`, which the catch-all content
  mount answers with the content folder's README.md;  the right address `/worktrees/<epic>/spell-app/...` answers 200.
  From spell-app's checkout, a kit worktree's file gets a `/../..` address (403).  Seen 2026-10-21 (epic `readme` P11).

### 1. Behavior bugs

- The page editor's save (`PUT /_server/page`) writes ANY text file in the checkout it's handed:  `.spell`, `.ts`,
  the built-in examples, not just docs pages.  Behind the write check (token and origin), so only this machine's pages
  can call it, but nothing limits it to the folders a page should edit.
  Seen 2026-10-13 (epic `people-and-orgs`), planning the page server's file operations for the spaces page.
  Prove:  `PUT /_server/page` with a `path` to a `.ts` file under `packages/`.
- `StaticHandler.etagOf()`'s `ETag` is size + mtime in whole ms:  two saves of the same SIZE within one ms
  get the same `ETag`, so an `If-Match` from before the second still matches, and a stale save wins.
  Seen 2026-10-13 (epic `people-and-orgs` P15):  `FileOperations.test.ts` saving "1", "2", "3" over HTTP flaked.
  Unlikely by hand (a person's edits are ms apart), likelier for tools.  A content hash would close it.
  Prove:  save "a", then "b" with the first `ETag` within the same ms:  both answer 200.


- `[V]` `src/page/cli.ts` `url`:  a RELATIVE `<file>` resolves against `src/server`, not the folder `yarn
  server` ran in -- the root's `yarn server` runs `yarn workspace ... server`, whose nested yarn resets `INIT_CWD`.
  Prove:  `yarn server url pages/index.html` at the repo root prints
  `.../packages/server/packages/docs/index.html`.  An absolute path works.

## vscode

- spell-app's `vscode/src/spellAppRoot.ts` `findSpellApp()` searches a window's folders first folder LAST;  epic
  windows now list the worktree first, so in an epic's window the extension runs the MAIN checkout's server and runner
  (confirmed by running it on a window's folder list, 2026-10-21, epic `readme` P11).  `spell.parserRoot` set to the
  worktree's absolute path works around it.

- `spell.showLineTree` is declared in spell-app's `vscode/package.json` (command and right-click menu) but nothing
  registers it since commit b38aff683:  "Show Tree for This Line" answers command-not-found.

- `spell.compileOnSave`'s description says "to its .output.js";  the server writes `<Project>.spell.js` into `build/`.

- `epic open` and `epic window show` help still say "Spell Docs";  the view is "Epic Docs".

### 1. Behavior bugs

- `src/WindowBridge.ts` `close-window`:  didn't close the worktree's window in Owen's test (2026-10-02), though
  `scripts/window.mjs close doc-template` reported "closed" and the window's registry entry disappeared.  Maybe
  `workbench.action.closeWindow` from a `setTimeout` after the reply runs too late or is refused;  or the window
  that opened wasn't the one registered.  Prove:  `node scripts/window.mjs open <name> --pkg docs`, wait for its
  `~/.spell/windows/*.json`, then `close <name>`, and watch the window.
- `package.json` still contributes "Spell: Show Tree for This Line" (`spell.showLineTree`, 2026-10-10, branch
  `output-targets`), but `src/` has no `TreeView.ts` and nothing registers that command:  epic `epic-components` J8
  took the Spell Tree view out of the side bar.  Picking it from the palette likely does nothing, or errors "command
  not found".  Prove:  rebuild the extension, run the command on a `.spell` file.  Fix:  drop the contribution (and its
  menu entry), or bring the view back.
- `src/DocView.ts` `restartServer()`:  when the page server is already DOWN, "Restart Page Server" can't bring it
  back.  It finds the checkout by asking the server itself (`serverRoot()`, `/_server/ping`), so a dead server gets
  "isn't a page server, so there's nothing to restart" (read from the code, epic `airplane`, 2026-10-10:  Owen found
  the server down after a merge).  Prove:  `spell server stop` in the main checkout, then press the button.
  Fix:  fall back to the window's checkout (its first folder) when the ping fails;  needs a window reload once.
  Why it went down:  `PidFile.stop()` waited only until the old server stopped ANSWERING, so the restart after a merge
  started the new one while the old still held port 4747;  the new one took another port (the log shows 54516).
  Fixed in `spell-kit/server` the same day;  this button's gap remains.

## claude-code

Skills, hooks and their scripts (`.claude/`, `packages/epics/tools/goals/skills/`).

- `scripts/window.test.mjs` fails 1 of 19 on `main` (2026-10-04, after shared-content's cutover):  "a worktree's
  window:  the main root first, then the worktree's package and root;  theme, tinted".  The written folder list now
  has a `spell-app-dev` folder its expected array lacks.  Likely the cutover added the folder on purpose and the test
  wasn't updated;  confirm which side is right.
- `[V]` `.claude/skills/isolate/SKILL.md` step 0 and `.claude/skills/park/SKILL.md` step 2:  carry edits over with a
  BARE `git stash pop`.  The stash stack is shared by every worktree and session, so it can pop another session's
  stash.  Fix:  `push -u -m <tag>`, find its sha, `stash apply <sha>`, then drop it by sha.  (found by epic `commands`, P2)
- `[V]` `.claude/skills/whassup/scripts/whassup.py` `merge()`:  `git merge --no-edit` (a merge commit), while its
  docstring says "as `/isolate done` would", which is `git merge --ff-only`.  One policy, one command:  roadmap
  `epic worktree merge` (epic `commands`).

## epics

- A kit worktree made without its `spell.epics` link (2026-10-22, epic `readme`'s worktree, made 2026-10-21):  the
  kit tracks `agents/PAPERCUTS.md`, `SUSPECTED-BUGS.md` and `CODE-DEBT.md` as links to `../spell.epics/agents/`,
  which dangle in a worktree with no `spell.epics` at its root (the kit's AGENTS.md says an epic's worktree has one).
  Linked by hand there (`ln -s ../../spell/spell.epics spell.epics`).  Likely the worktree hook stopped making it when
  epic-eject P12 stopped linking content at checkout roots;  check `hooks/worktree.mjs` and `Shared.link()`.

- Guides that still fetch their data at pre-split paths (2026-10-22, found by epic `readme` P14's voice pass;  already
  failing before it):
  - the core reference page (`guides/targets/core-reference.html`):  its data at `../../packages/core/...`, so its
    tables don't draw;  `check-spell.js` reports 12 not-found errors
  - the spell syntax guide (`guides/spell-syntax/spell-syntax.html`):  `data-choices-rows="../../packages/spell/
    spellSyntax.json"` (likely the cause of its two 404s;  not verified)
  - and `doc-links.js --check` reports old-layout links (`packages/...`, `../spell-lang/...`) on about 40 guides
- `doc-links.js` gives one target name to two different files when the kit's `spell-ui/` and a second copy under
  `spell-app/spell-ui/` both match (solid-migration's `src-spell-ui-readme-md`, spell-ui-pages' `ThemeFamilies.ts` and
  `SiteCheck.ts`), so `--check` fails on those pages.  Why spell-app has a `spell-ui` inside it isn't known.

- `epic worktree merge-main` with a checkout patch's file in place (2026-10-22, epic `readme`):  the kit's `.ignore`,
  which main's epic-engine P17 tracks AND copies untracked (git-excluded) into each checkout behind main.  The merge of
  main into `readme` (ced7b43, which also stopped on a `.epic/config.json5` conflict and was finished with
  `--continue`) came out WITHOUT `.ignore`:  fast-forwarding main to it deleted the file.  Put back on main (73c65b9).
  Likely the untracked copy blocking git's checkout of the file mid-merge, and the resolution step then staging its
  absence.  Not reproduced.
  - It happened AGAIN, the same day, epic `spanish`:  the merge of main into `spanish` (baa3263, a clean merge, no
    conflict, no `--continue`) said "untracked 1 file(s) now git-ignored (kept on disk)" and came out without
    `.ignore`;  fast-forwarding main deleted it.  Put back on main (334bd2a).  So it's the merge itself, not the
    conflict path:  likely the "untrack what's now git-ignored" step taking `.ignore` (excluded in the checkout's
    `.git/info/exclude` by the patch) for a git-ignored file.

- `node spell-epic/src/demo/check-review-epics.mjs` (the review sample, 2026-10-13, epic `people-and-orgs` P16):  every
  flow passes but one, "j1's chip, skipped, unsent:  dashed grey":  the chip has `data-fill="dashed"` and no
  `data-color`, where the check wants `grey`.  `<epic-item>`'s `chipMark()` gives a skip no colour, or the check is
  older than the "own mark in flight keeps the state colour" rule (`EpicItem.css`, about line 377).  Not looked for;
  nothing P16 touched draws it.
