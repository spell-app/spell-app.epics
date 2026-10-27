# Sweep 2:  parser-app

Area:  `spell-parser/src/`, `spell-app/src/`, `spell-brand/src/`, `spell-brand/scripts/`.
By the coherence agent, 2026-10-26 (epic `coherence`, sweep 2).  No code changed.  14 findings.

- The score before:  80 / 100, 238 copies.  In this area:  66 hits over 12 mechanisms
  (Timing 18, Numbers 9, A new syntax 8, Loading once per key 6, Running git 6, A form control's attributes 4,
  Walking a rule's syntax 4, Fetching 3, A text position 3 ...).
- New since sweep 1, in this area:
  - elemental-spell's spellx and notebook code (10-24 to 10-26) wrote the copies in #3, #10, #11, #12, and one each in
    #2, #7 and #13
  - the Spanish work (10-22) wrote four of #4's six identical copies in one day
- Landing (`epic owns`, by branch):  only `NotebookController.ts` (elemental-spell, building) and
  `spell-ui/src/docs-components/docs-components.types.ts` (ui-gaps, building) have a branch owner.
  Everything else has none:  the coherence epic's issues, each naming the epic whose code it is.

## 1.  Our own TypeScript, read by oxc:  not by hand beside it

- **Kind:**  rebuilt
- **Where:**
  - `spell-parser/src/spell/languages/packs.ts`, the reader behind `spell translate check | fix` (epic `spanish` P7):
    - `:296-330` `scanRegistrations()`:  each `addRule(...)` call, found by regex in masked text
    - `:359-379` `scanImports()`
    - `:385-421` `maskCode()`:  blanks `//` and `/* */` comments, strings, template literals and regexes
    - `:427-453` `stringEnd()`, `regexEnd()`;  `:456-507` `matchingClose()`, `topLevelComma()`, `statementAround()`,
      `commentsAbove()`;  `:510-516` `hasTests()`
    - `:537-555` its regexes:  `ADD_RULE`, `SPECIALIZE`, `EXPORTED_CLASS`, `PARSER_DECLARATION`, `IMPORT`
  - `spell-parser/src/core/coreDeclarations.ts`, the core's method list (node only, epic `python-target` P29):
    - `:181-222` `paramNamesOf()`, `paramName()`:  a function's parameters, by a hand scanner of its source
      (quotes, escapes, bracket depth, top-level commas)
    - `:244-298` `docsIn()`, `leadOf()`, `DOCUMENTED_NAME` (one 300-character regex), `SECTION_HEADING`:
      each name's docstring and `// ##` section, by regex
  - Beside them, already on oxc (`parseSync()`, through `vite-plus`), each declaring its own copy of the tree's type:
    - `spell-parser/src/parser/test/RuleTestSource.ts:48` (the rule files' `tests: [...]`), `:179` `SourceNode`,
      `:278` `walk()`
    - `spell-parser/src/spell/node/spellSyntax.ts:303` (comments), `:344` `classSources()` (the rule files' classes
      and docstrings), `:394` `docstringText()`, `:559-562` `Comment`, `SourceNode`
  - Beside, a third TypeScript parser:  `spell-app/src/app/tools/ComponentSource.ts:1`, `:36` (TypeScript 6's, for
    App UI's props), its own `commentLines()` `:200-209`
- **Shared:**  each reads a TypeScript file of our own for what it declares:  calls, classes, imports, parameters,
  docstrings.
  - `packs.ts` reads the SAME rule files (`<module>.en.ts`, `<module>.<lang>.ts`) that `RuleTestSource` and
    `classSources()` read with oxc.
- **Differs:**  what each picks out:
  - `addRule()` calls, with the statement around each (a loop's whole) and the comments above it
  - a function's parameter names
  - a name's docstring lead, and the `// ##` section it's under
- **The one:**  oxc's `parseSync()`, as `spellSyntax.ts` and `RuleTestSource.ts` already use it, behind ONE small
  node-only reader all three share:  the tree's node type, a `walk()`, a node's docstring.
  - Home:  spell-parser first (`spell-parser/src/spell/node/`, beside `spellSyntax.ts`);  the kit's
    `spell/util/node/` once a second repo takes it (WWOD §8, "Promotion path").
- **Net effect:**
  - `packs.ts`'s registrations, imports and classes come from the syntax tree;
    `maskCode()` and the seven scanners around it go
  - `packs.ts` becomes node only:  its one importer is the command line (`spell-parser/src/cli/packsCommand.ts:27`)
  - `coreDeclarations.ts` reads parameters and docstrings from its module's tree, not by regex
  - one node type and one `walk()` for the three readers
  - the catalog's "Comments in code" ("only Python keeps a small scanner") becomes true
- **Saves:**  about 150 lines;  4 hand readers of TypeScript → 1 shared reader;  "A new syntax" loses 4 hits.
- **Evidence:**
  - Left out in P13 as "the code-pack scanner's helpers for Python (`maskCode()` and the rest) ... no Python parser
    in the repos";  still 3 hits.  But:
    - `maskCode()` blanks JavaScript's comments, template literals and regexes (`packs.ts:385-421`)
    - `packsCommand.ts:91-108` hands it `${module}.en.ts` and `${module}.${lang}.ts`:  TypeScript
    - P13's commit `3d2fb5c0` never touched `packs.ts`
  - `git -C spell-parser grep -n 'parseSync'` → `RuleTestSource.ts:48`, `spellSyntax.ts:303`, `:344`
  - `grep -n 'type SourceNode'` → the same line in both files:
    `{ type: string; start: number; end: number; [key: string]: unknown }`
- **Lands with:**  no branch owner;  the coherence epic.

## 2.  Timing:  a home every runtime can reach

- **Kind:**  twice
  - Re-reported:  sweep 1's parser-app #7 went into the catalog's copies, and never became an issue.
  - New here:  WHY they stay.  Most of the code that needs it may not import its home, `spell/element`
    (the core, the kit's server, spaces, the docs bundles), or would rather not:  in a node process its barrel
    brings Solid's element base along.
- **Where (this area, 17 raw timers):**
  - the parser's core, which may import only `spell/util` (`spell-parser/src/core/AGENTS.md:52`):
    `spell-parser/src/core/ui.ts:44` (a sleep), `spell-parser/src/core/input.ts:172` (the "still down" press timer,
    new:  elemental-spell P9, 10-25)
  - spell-parser's command line:  `spell-parser/src/cli/claudeRunners.ts:108` (its default `sleep`)
  - spaces, whose imports are spell, the kit's server, the core and `spell/util` (`spell-app/src/spaces/AGENTS.md`):
    - `spell-app/src/spaces/models/SpellProjectRoot.ts:315`, `:356` and `spell-app/src/spaces/models/ProjectFiles.ts:130`,
      `:169`:  `setTimeout(() => x.onRemove(), 10)`, four times
    - `spell-app/src/spaces/server/node/routes/ProjectBuild.ts:201`:  a timeout raced against a compile
  - the app's command line and language server, node processes:
    - `spell-app/src/cli/commands/serveCommand.ts:111`, `spell-app/src/cli/runTarget.ts:200`:  sleeps in
      "wait until it answers" loops
    - `spell-app/src/cli/commands/watchCommand.tsx:76`, `spell-app/src/lsp/SpellLanguageServer.ts:359`:  debounces
  - the app, which could import it today:  `spell-app/src/app/editor.ts:437`,
    `spell-app/src/app/ui/monaco/SpellModels.ts:89`, `spell-app/src/app/solid/Notice.tsx:21`,
    `spell-app/src/app/solid/ErrorNotice.tsx:23`, `spell-app/src/app/runner/spellRuntime.ts:133` (a yield:  `soon()`)
  - Beyond the area, the same reason:
    - the kit's server, which may import util only (16:  `src/server/PidFile.ts:95`, `:154`, `:157`,
      `src/server/FileLock.ts:92`, `src/server/page/BundleBuild.ts:199` (the same timeout race as `ProjectBuild.ts:201`) ...)
    - spell-epic's node tools and docs scripts:  its `DraftSaver` says why, "plain timers, not the kit's `after()`:
      `spell/element`'s leaves are ... not allowed in the docs bundles"
- **Shared:**  run something later, again, or after a wait;  maybe cancel it.
- **Differs:**  the wait;  once or repeated;  a promise to await, or a callback.
- **The one:**  the kit's `after()`, `every()`, `soon()` (`src/element/timing.ts`), moved down to `spell/util/timing`:
  - it imports nothing ("safe to import anywhere, on a server too", its header), as `number.ts` and `time.ts` don't
  - `spell/element` re-exports it, so its users don't change
  - with the catalog's Wanted `waitUntil(read, { timeout, every })` beside it, for the polling loops:
    `serveCommand.ts:102-115`, `runTarget.ts:192-202`;  beyond, the kit's `serverCommand.ts:69-82`, `PidFile.ts:93-97`
- **Net effect:**
  - `timing.ts` moves one layer down;  `spell/element`'s barrel re-exports it
  - the core, spaces, the language server and every command line can write `await after(0.25)`
  - the "wait until it answers" loops become `waitUntil()`
- **Saves:**  about 25 lines here (the loops);  17 copies → 0 in this area.  The reason about 60 of Timing's 76 copies
  across the repos can't move goes with it.
- **Evidence:**
  - `git grep -n -P '\b(setInterval|setTimeout)\('` over the area, each line blamed:  only `core/input.ts:172` is new
    since sweep 1 (`073c8373`, 10-25)
  - the score's Timing copies by folder:  the kit's `src/server` 16, spell-epic's `src/tools` 19, spell-app 15,
    spell-parser 3
  - `src/element/timing.ts:12-13`:  "Plain JS, importing nothing:  safe to import anywhere, on a server too."
- **Lands with:**  no branch owner;  the coherence epic (`core/input.ts` is elemental-spell's P9).

## 3.  One scan of a tag's phrase, and of a brace, in the tokenizer

- **Kind:**  twice (new since sweep 1:  elemental-spell P6, P12 and its showcase)
- **Where:**
  - `spell-parser/src/spell/SpellxTokenizer.ts:475-501` `phraseFrom()` (P6, 10-25 02:27):
    "a `>` inside a string, parens or braces is the phrase's"
  - `spell-parser/src/parser/tokenizer/Tokenizer.ts:610-622`, in `matchJSXChainTag()` (the showcase, 10-25 18:28):
    the same scan, written again in the class `SpellxTokenizer` extends
  - `spell-parser/src/spell/SpellxTokenizer.ts:829-843` `matchingBrace()`:
    "just past the `}` matching the `{` at start, strings and nested braces skipped"
  - `spell-parser/src/spellx/SpellxView.ts:461-478` `closingOf()`, called by `hole()` `:444-448`:
    the same job again, WITHOUT skipping strings
  - `spell-parser/src/spellx/SpellxWriter.ts:651-664` `colonAt()`:  the first `:` outside quotes, parens and braces
- **Shared:**  walk spell text with a string flag (only `"`:  an apostrophe is spell's possessive) and a bracket depth;
  stop at a character at depth 0, or at the bracket that closes.
- **Differs:**  the stop (`>`, `}`, `:`);  a line break ends a spellx phrase;  a `/` before `>` closes the tag.
- **The one:**  ONE pair of scans on `P.Tokenizer`, beside its matchers, which the subclass, the spellx view and the
  writer call:  "where this phrase ends" (its stop, and whether a line break ends it) and "where this bracket
  closes" (spell's quote rule).
  - The view needn't scan at all:  the token the tokenizer made already ends just past the hole's `}`.
- **Net effect:**
  - `phraseFrom()` and `matchJSXChainTag()` call one scan;  `matchingBrace()`, `closingOf()` and `colonAt()` the other
  - BUG fixed:  a hole holding a quoted `}` reads whole in the chunk tree.  Today `{its name + "}"}` reads
    `its name + "`, and its last two characters fall out of every node (probe below).
- **Saves:**  about 50 lines;  5 scans → 2.
- **Evidence:**
  - `git blame` on `Tokenizer.ts:601-623` → `ab97b5183 2026-10-25`;  on `SpellxTokenizer.ts:478-501` →
    `e988490cb 2026-10-25`
  - a probe:  `SX.SpellxView.read()` on `<text>{its name + "}"} after</text>` (run with the kit's `tsx`;  no repo file
    touched) gives (an excerpt)
    `{"kind":"hole","code":"its name + \"","span":{"start":44,"end":58}},{"kind":"text","text":" after","span":{"start":60,"end":66}}`:
    the tokenizer read the hole to 60, the view cuts it at 58
- **Lands with:**  no branch owner (elemental-spell's branch has merged these files);  the coherence epic, naming
  elemental-spell.

## 4.  One way to fill a text's `{params}`

- **Kind:**  twice (a mechanism the catalog doesn't have yet)
- **Where:**
  - `spell-parser/src/core/messages.ts:33`, `:39`:  `core.message()` (epic `spanish` P12)
  - `spell-parser/src/spell/languages/Language.ts:172`, `:339`:  `parserMessage()` (P17)
  - `spell-app/src/app/ui/AppTexts.ts:168-172`, `:175`:  `fillText()` (P13)
  - `spell-app/src/lsp/LspTexts.ts:37-41`, `:72`:  `text()` (P13)
  - beyond the area:  `spell-ui/src/runtime/I18n.ts:107` (`UI.i18n.t()`, since 09-28),
    `spell-ui/src/docs-components/docs-components.types.ts:525`, `:530` (`VocabularyTexts`)
  - variants:  `spell-ui/src/components/ui-progress/ProgressValues.ts:92` (formats each value);
    `spell-parser/src/spellx/SpellxWriter.ts:642-644` `fill()` (any key, `[^}]+`;  trims a colon after)
- **Shared:**  `/\{(\w+)\}/g`, each name filled from `params`, and one rule, stated in four docstrings:
  "a placeholder with no value stays as written, so the gap shows".
- **Differs:**  how a value is written:  `String()`, or a formatter.
- **The one:**  `fillText(text, params, { format })` in the kit's `spell/util/string`, beside `slug()` and
  `escapeHTML()`:  generic, so the core (util only), the language server (no Spell UI), Spell UI's `I18n` and the app
  all reach it.
- **Net effect:**
  - five regex constants and eight fills go;  the missing-value rule is stated once
  - the next text table (each language's, each package's) calls it:  the Spanish work wrote four in one day
- **Saves:**  about 20 lines;  8 copies → 1.
- **Evidence:**
  - `git grep -n -E 'PLACEHOLDER = |replace\(/\\{\(\\w\+\)\\}/g'` over every repo:  the lines above
  - `git blame`:  `messages.ts`, `Language.ts`, `AppTexts.ts`, `LspTexts.ts` all 2026-10-22 (epic `spanish` P12, P13,
    P17)
- **Lands with:**  `docs-components.types.ts` is on ui-gaps' branch (a note there);  the rest, the coherence epic.

## 5.  The running editor's record, read one way

- **Kind:**  twice
- **Where:**
  - written:  `spell-app/src/spaces/server/node/routes/EditorServer.ts:38` (`recordFile`), `:91` (`record()`:
    `{ url, pid }`), `:97` (`EDITOR_FILE`)
  - read, and waited on for 90 s:  `spell-app/src/cli/commands/serveCommand.ts:14` (its own copy of the file's name),
    `:103-115` `editorUrl()`
  - read once, 1 s:  `spell-app/src/spaces/server/node/routes/appRoutes.ts:66-77` `editorUrl(root)`
  - beyond the area:
    - the kit's `src/cli/commands/serverCommand.ts:69-82` `editorRow()` (the same 90 s loop, line for line), `:114`
      (the file's name again:  the kit naming a child repo's file), `:146-155` `editorPidOf()`
    - `spell-epic/src/server/RepoApp.ts:61-71` `urlOf()` (through `app.urlFile`, `spell-app/.epic/config.json5:81`),
      `:207-216` `answers()`
    - `spell-app/scripts/examples-readme.ts:211-214`
- **Shared:**  read `{ url, pid }` from `.spell-server.editor.json` at the page server's root;  check the URL answers;
  maybe wait for it.
- **Differs:**  wait (90 s) or one look;  what it returns (the URL, a status row, the pid).
- **The one:**  a server record in the kit, beside `SRV.PidFile`, which does this for the page server's own record
  (asking `/api/server`):  `read()`, `answering({ wait })`, `remove()`, for a server that answers anything at its URL.
  - Its file named once:  in spell-app's part of the page server's settings, as each repo declares its part, so the
    kit's `start all` stops naming it.
- **Net effect:**
  - `EditorServer` writes through it
  - `spell app serve`, `/editor`, `spell server start all | stop`, the epic server's App tab and the examples script
    read through it
  - the kit's `serverCommand.ts` names no child repo's file
- **Saves:**  about 40 lines;  5 readers and 4 copies of the file's name → 1.
- **Evidence:**
  - `diff <(sed -n 103,115p spell-app/src/cli/commands/serveCommand.ts) <(sed -n 69,82p src/cli/commands/serverCommand.ts)`:
    only names differ (`START_TIMEOUT_MS` / `EDITOR_TIMEOUT_MS`, both `90_000`;  the same `AbortSignal.timeout(2000)`
    and 250 ms between looks)
  - `git grep -n 'spell-server.editor'` over every repo:  the places above
- **Lands with:**  no branch owner;  the coherence epic.

## 6.  The brand's controls, on Spell UI's keys and form attributes

- **Kind:**  twice
  - The catalog lists both as known and not swept;  P10 left out "the brand's vocabularies", with no why given.
- **Where:**
  - `spell-brand/src/components/brand-color-set/BrandColorSet.tsx:187-218` (`onKeyDown()`, `indexOf()`,
    `keyTarget()`:  arrows flipped right to left, Home / End, wrapping), `:110-112` (the roving `tabindex`, in
    `syncChips()`), `BrandColorSet.types.ts:18`, `:21` (`ARROWS`, `CHOOSE_KEYS`)
  - `spell-brand/src/components/brand-color-picker/BrandColorPicker.en.ts:41-60`, `:105` and
    `spell-brand/src/components/brand-composer/BrandComposer.en.ts:38-50`, `:86`, `:134`:  `name`, `required`,
    `readonly`, `placeholder` and the `readonly` state, each spelled out
- **Shared:**  a radio-like group's keys and its one tab stop;  a form control's standard attributes.
- **Differs:**  Enter and Space choose (the group keeps that);  each control's own description, where it says more.
- **The one:**
  - `UI.focus.arrowKey()` (`RovingTabindex`, `spell-ui/src/runtime/RovingTabindex.ts`, which flips for right to left
    too), as Spell UI's radio group, rating and swatches use since P10
  - `UIT.FormControlAttributes`, `UIT.FormControlStates` (`spell-ui/src/components/components.types.ts:1571`, `:1591`)
- **Net effect:**
  - `BrandColorSet`'s arrows, Home / End and tab stop come from Spell UI's runtime
  - the two vocabularies take the shared attributes by name
- **Saves:**  about 60 lines;  6 copies (2 arrow hits, 4 attribute hits) → 0.
- **Evidence:**  the score's "Arrow keys through a list" (`BrandColorSet.tsx` ×2) and "A form control's attributes"
  (`BrandColorPicker.en.ts` ×2, `BrandComposer.en.ts` ×2);  `RovingTabindex.ts:120-130` takes the same keys.
- **Lands with:**  no branch owner;  the coherence epic.

## 7.  One way to shorten a text with "…"

- **Kind:**  twice (a mechanism the catalog doesn't have yet)
- **Where:**
  - `spell-parser/src/spellx/SpellxFile.ts:222` (new:  elemental-spell)
  - `spell-app/src/app/solid/Inspector.tsx:505`
  - `spell-app/src/lsp/SpellLanguageService.ts:2564-2567` `truncate()`
  - beyond the area:  `spell-ui/src/docs-components/ui-docs-inspector/ElementSnapshot.ts:75`;
    `spell-epic/src/command/Requests.ts:676`, `spell-epic/src/comments/ThreadFacts.ts:97`,
    `spell-epic/src/tool/InboxCommands.ts:805`, `spell-epic/src/tool/PlanDoc.ts:2405`, `:2652`
- **Shared:**  a text over a length, cut, and ended with `…`.
- **Differs (drift):**  `SpellxFile` and `ThreadFacts` keep `n` characters and add `…` (`n + 1` long);  the others
  keep `n - 1`;  four trim a space before the `…`, five don't.
- **The one:**  `shortened(text, length)` in `spell/util/string`:  at most `length` characters, `…` included, a
  trailing space trimmed.
- **Net effect:**  one rule for every label and headline;  `SpellLanguageService.truncate()` goes.
- **Saves:**  about 10 lines;  9 copies → 1.
- **Evidence:**  `git grep -n -E 'slice\(0, [^)]+\)\}?…'` over every repo:  the nine lines above.
- **Lands with:**  no branch owner;  the coherence epic.

## 8.  Loading once per key:  its last six copies

- **Kind:**  twice
- **Where:**
  - the runner, which imports Spell UI already (`spell-app/src/app/runner/ActionMenus.ts:1`):
    `spell-app/src/app/runner/loadRuntime.ts:18-19`, `:53`;  `runCompiled.ts:59`, `:115-116`;
    `shadowStyles.ts:18-19`, `:41`
  - the Type Explorer's data, in the language server's folder, which may not import Spell UI ("depends on
    `spell-parser/spell` (and below)"):  `spell-app/src/lsp/ScopesSource.ts:83-84`, `:99-102`, `:111-119`, and
    `:137-145` `loadScopePack()` (a `<script>` injected once per URL, as Spell UI's `ComponentPacks.inject()` is)
- **Shared:**  `let p = map.get(key);  if (!p) map.set(key, (p = load()));  return p`.
- **Differs:**  what a failure does:  every copy keeps a failure for good (a scope pack that failed once is
  `undefined` until a reload).
- **The one:**  `LoadOnce` (`spell-ui/src/util/LoadOnce.ts`):  plain promises, no Solid.
  - The runner can take it today.
  - For the language server it moves to the kit (`spell/util/LoadOnce`, a generic file), Spell UI's util re-exporting it.
- **Net effect:**  "Loading once per key" has no copies left;  a scope pack can be `forgotten offline`.
- **Saves:**  about 12 lines;  6 copies → 0:  the mechanism's last.
- **Evidence:**  `git grep -n 'Map<string, Promise'` in spell-app:  the six, plus `SpacePrefs` and `ProjectBuild`
  (left out by the catalog's Score).
- **Lands with:**  no branch owner;  the coherence epic.

## 9.  spell-app runs git through the kit's `Git`

- **Kind:**  twice
  - P7 moved spell-epic's and the kit's runners;  its plan's spell-app line was only the examples script.
- **Where:**
  - `spell-app/src/cli/commands/speedtestCommand.ts:236-238` `spellParserRepo()` (`rev-parse --show-toplevel`),
    `:256`, `:258` (raw `git worktree remove`, `prune`), `:262-266` its own `git()` (throws `CliError`)
  - `spell-app/src/cli/commands/vscodeCommand.ts:85-88`:  its own `git()` (`""` on failure)
  - `spell-app/src/spaces/server/node/people/PeopleStore.ts:278-289` `gitConfig()` (`undefined` on failure)
- **Shared:**  run git in a folder, take its output.
- **Differs:**  on failure:  throw, `""`, or `undefined`.
- **The one:**  `Git` (`spell/server/Git`):  `mustRun()` throws, `out()` answers `undefined`, `run()` never throws;
  `checkoutOf()` (`spell/server/checkout`) for a checkout's root, with no git run.
- **Net effect:**
  - three git runners go;  "Running git" has no copies in this area
  - and a name:  `speedtestCommand.ts:210` has its own `checkoutOf(ref)`, which MAKES a worktree at a ref, while the
    kit's `checkoutOf()` (which `spell-app/src/spaces/server/node/environment.ts:7` imports) FINDS one;
    it wants a name of its own (`worktreeAt(ref)`), as WWOD §3 asks of names
- **Saves:**  about 20 lines;  6 hits → 0.
- **Evidence:**  the score's "Running git" (`speedtestCommand.ts` ×4, `vscodeCommand.ts`, `PeopleStore.ts`);
  `git grep -n 'spell/server/Git\|SRV.Git' -- src` in spell-app:  nothing.
- **Lands with:**  no branch owner;  the coherence epic.

## 10.  "Did you mean" in spellx, through `suggest()`

- **Kind:**  rebuilt (new since sweep 1:  elemental-spell P6)
- **Where:**  `spell-parser/src/spell/SpellxTokenizer.ts:849-862` `closestWord()`, used for an unknown tag word
  (`:326-336`) and an unknown attribute (`:388-394`)
- **Shared:**  the known word closest to an unknown one, for "did you mean ...?"
- **Differs:**  `closestWord()` takes the longest shared START, and always answers (`<xyz>` gets the first word);
  `suggest()` counts edits, and gives no wild guess ("a wild guess is worse than no guess", its docstring).
- **The one:**  `suggest(word, candidates)` (`spell/util/string`), which the kit's JSX help and Spell UI's `ValueSets`
  use;  no guess, the message's other form ("use one of {words}", `spellx-unknown-word-here`).
- **Net effect:**  spellx's errors suggest a word within two edits, or list the words.
- **Saves:**  about 10 lines;  1 copy.
- **Evidence:**  `spell map uses spell::src_util_string_suggest` → `JsxElementHelp.ts`, and Spell UI's
  `ValueSets.ts:232` through its util;  the catalog's Score for it (`function (levenshtein|editDistance|distance)\(`)
  can't see `closestWord()`.
- **Lands with:**  no branch owner;  the coherence epic, naming elemental-spell.

## 11.  The spellx writer's line index, from the parser's

- **Kind:**  rebuilt (new since sweep 1:  elemental-spell, 10-25)
- **Where:**
  - `spell-parser/src/spellx/SpellxWriter.ts:63`, `:78` (`lineStarts`, by its own loop), `:584-593` `lineOf()`:
    `P.positionForOffset()`'s binary search, line for line
  - beside:  `spell-parser/src/spell/languages/packs.ts:318` and `spell-parser/src/spell/node/spellSyntax.ts:357`:
    a line number by `text.slice(0, at).split("\n").length`, once per match, in a loop
- **Shared:**  the line an offset is on.
- **Differs:**  nothing.
- **The one:**  `P.getLineStarts()` and `P.positionForOffset()`
  (`spell-parser/src/parser/tokenizer/tokenizer.types.ts:56`, `:65`).
- **Net effect:**  the writer's index and `lineOf()` go;  the two loops build one index per file.
- **Saves:**  about 12 lines;  3 copies → 0.
- **Evidence:**  the score's "A text position" (`SpellxWriter.ts`, `packs.ts`, `spellSyntax.ts`);
  `git blame -L 584,593 SpellxWriter.ts` → `b9267533f 2026-10-25`.
- **Lands with:**  no branch owner;  the coherence epic, naming elemental-spell.

## 12.  The notebook reads its file through the one door, and polls the kit's way

- **Kind:**  twice (new since sweep 1:  elemental-spell P16, Step 4)
- **Where:**
  - `spell-app/src/app/solid/notebook/NotebookController.ts:441-446` `watchFile()` (`every()`, skipped while the page
    is hidden), `:449-460` `readFile()` (a raw `fetch(url, { cache: "no-store" })`, then `response.ok`)
  - beside:  `spell-epic/src/review/ServerLink.ts:239-243` (`ServerLink.watch()`:  the same poll while visible, which
    spell-app can't import)
- **Shared:**  read a file every few seconds while the page shows.  The app's other fetches went onto `$fetch()` in P14.
- **Differs:**  the wait (2 s);  what a change does.
- **The one:**
  - `LoadableFile.fetch({ url, cache: "no-store" })` (`src/util/spell/LoadableFile.ts:13-18`):  "how EVERY
    `LoadableFile` reaches its `url`", answered by the disk reader under node and by `StaticFiles` in the static
    preview;  the editor reads this file through it
  - the catalog's Wanted `pollWhileVisible(fn, seconds)`, in the kit, on `every()`:  for this and
    `ServerLink.watch()`
- **Net effect:**
  - the poll reads what the editor reads, in every host;  a raw `fetch()` goes past the static preview's
    `StaticFiles` (what it sees there:  not checked)
  - the Wanted poll gets its second user, in a second repo:  its home is the kit
- **Saves:**  about 6 lines;  2 copies (Fetching 1, the Wanted poll 1).
- **Evidence:**  the score's Fetching hit `NotebookController.ts:452`;  `git grep -n 'visibilityState'` over every
  repo → `NotebookController.ts:443`, `ServerLink.ts:239`, `:243`.
- **Lands with:**  elemental-spell:  its branch changes this file (building), so a question on its page.

## 13.  The app's clamps, on `clamp()`

- **Kind:**  twice
  - P6's spell-app commit (`cbe871d8`) names clamp in its subject, but changed none:  spell-app imports `clamp()`
    nowhere.
- **Where:**  `spell-app/src/app/runner/RunnerSplit.tsx:66`, `spell-app/src/app/solid/NotebookCells.ts:289` (new:
  elemental-spell, 10-25), `spell-app/src/app/solid/SplitPanel.tsx:169`, `:175`, `spell-app/src/cli/ui/ReplScreen.tsx:34`
- **Shared:**  `Math.min(high, Math.max(low, value))`.
- **Differs:**  nothing.
- **The one:**  `clamp()` (`spell/util/number`).
- **Net effect:**  five lines read `clamp(value, low, high)`.
- **Saves:**  no lines;  5 copies → 0.
- **Evidence:**  `git -C spell-app grep -n -E 'clamp\b' -- src`:  nothing;  `git -C spell-app show --stat cbe871d8`:
  no clamp in its seven files.
- **Lands with:**  no branch owner;  the coherence epic.

## 14.  The app's notices close, not "dismiss"

- **Kind:**  two words
- **Where:**  `spell-app/src/app/solid/ErrorNotice.tsx:13-14`, `:20-23`, `:38`, `:61-64`, `:73-74`, `:132` (`onDismiss`,
  `dismiss()`);  `spell-app/src/app/solid/Notice.tsx:32`, `:50` (`dismiss()`):  each answers the message's `ui-closing`
- **Shared:**  the message closes.
- **Differs:**  nothing.
- **The one:**  the word list's "open / close":  "a message dismissed for good closes too";  `onClose`, `close()`.
  - Left as they are:  Spell UI's own `dismissible` attribute;  `autoHide` and `editor.hideError()`, under the list's
    open "show / hide" question.
- **Net effect:**  the app's notices say close, as the event they answer does.
- **Saves:**  no lines;  about 15 lines say the old word.
- **Evidence:**  `git -C spell-app grep -n -i dismiss -- src`;  the word list's Score counts event names only, so the
  score doesn't see these.
- **Lands with:**  no branch owner;  the coherence epic.

Small, unranked:  two debug globals set by hand, `spell-app/src/app/editor.ts:179` (`window.project = project`,
"DEBUG:") and `spell-app/src/app/runner/VSCodeRunner.tsx:100` (`Object.assign(globalThis, { core })`, "for
devtools"):  `setDebugGlobal()`, as `spell-app/src/app/solid/notebook/NotebookPage.tsx:48` already does.

## Score lines that overcount

In this area, 9 of the 66 hits aren't copies.

- **Numbers** (`Math\.min\(.*Math\.max\(|Math\.max\(.*Math\.min\(|/ 1024\b`):  4 of 9 aren't clamps.
  - `spell-parser/src/core/collection-other.ts:212`:  two one-sided bounds, one in each branch of a ternary
  - `spell-parser/src/spell/translate/ShapeCheck.ts:124`:  a window's end;  the `max` sits inside a sum
  - `spell-app/src/cli/ui/ProjectPrompt.tsx:105`:  the LOW bound wins when there are fewer choices than rows;
    `clamp()` lets the high one win, so it's not the same job
  - `spell-app/src/lsp/SpellLanguageService.ts:1781`:  one bound, `Math.min(x, Math.max(n - 1, 0))`
  - Tighter (tested over every repo:  keeps the five real clamps here, drops the first two;  the last two need a
    `not`;  it also finds the kit's `src/util/color.ts:180`, which imports nothing on purpose):

    ```text
    Math\.min\(\s*[^,()]+(?:\([^()]*\))?[^,()]*,\s*Math\.max\(\s*[^,()]+(?:\([^()]*\))?[^,()]*,\s*(?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)\s*\)|Math\.max\(\s*[^,()]+(?:\([^()]*\))?[^,()]*,\s*Math\.min\(\s*[^,()]+(?:\([^()]*\))?[^,()]*,\s*(?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)\s*\)|/ 1024\b
    ```

- **Walking a rule's syntax** (`\b\w+\.rules\.(forEach|flatMap)\([a-z]\w*\)|\b(visit|walk)\(\w+\.rules\)`):
  2 of 4 aren't walks.
  - `spell-parser/src/spell/translate/Translator.ts:1318` `literalAlternatives()`:  a choice's words, worked out
  - `spell-parser/src/spell/translate/Translator.ts:1495` `membersOf()`:  a group's members, flattened
  - Tighter (tested:  keeps `Translator.ts:1284` and `spell-app/src/cli/commands/explainCommand.ts:67`, two filtered
    walks):  `\b(visit|walk)\(\w+\.rules\)|\.rules\.forEach\((visit|walk)\)`
- **Fetching** (`...|\(await fetch\([^)]*\)\)\.ok`):  2 of 3 aren't copies.
  - `spell-app/src/cli/runTarget.ts:196`:  a probe, "does it answer yet":  the Wanted `waitUntil()`'s copy, not a read
  - `spell-parser/src/cli/claudeRunners.ts:135`:  the Messages API, retried by status and `retry-after`, which
    `$fetch()`'s errors don't carry
  - Tighter:  drop `|\(await fetch\([^)]*\)\)\.ok`;  `not spell-parser/src/cli/claudeRunners.ts`, saying why.
- **Timing** (`\b(setInterval|setTimeout)\(`):  1 of 18.
  - `spell-app/src/cli/commands/serveCommand.ts:92`, `setInterval(() => {}, 1 << 30)`:  keeps node alive while it
    waits for Ctrl-C;  no timed work
  - Tighter (tested:  drops only that line here):  `\b(setInterval|setTimeout)\((?!\(\) => \{\}, )`

And two that undercount:
- **A word that's close to a known one:**  its Score can't see `SpellxTokenizer.ts:850` `closestWord()` (#10).
  Add `|function closest\w*\(`.
- **A new syntax:**  `not spell-parser/src/spell/SpellxTokenizer.ts` also hides its copies of the tokenizer's own
  scans, `phraseFrom()` and `matchingBrace()` (#3).

## Considered, left out

- `NotebookKeys` (cells matched across an edit from both ends, then moves, then edits in order) beside `PagePatch`'s
  `alignByPlace()` (the longest common run, then by place):  close, but the notebook's move rule (equal code anywhere)
  is its own.
- The two notebook cell models, `NotebookCells` (P11) and `NotebookPageCells` (P16):  elemental-spell's own
  "Reassess the spellx notebook" phase decides keep, fold in or drop.
- `ComponentSource.ts` on TypeScript 6's parser:  it reads props types (`Pick<>`, `Omit<>`, intersections), and the
  kit's JSX help needs TypeScript 6 anyway;  named beside #1, not counted.
- The kit's code map's import regex (`src/cli/map/importLinks.ts:57`) beside `packs.ts`'s `IMPORT`:  another area,
  reading 8,000 files for speed;  #1 removes this area's.
- Waiting for Ctrl-C (`serveCommand.ts:93`, `watchCommand.tsx:61`, `runTarget.ts:209`, `NamesReview.ts:150`, the
  kit's `untilInterrupted()`):  each stops something different (nothing, an Ink screen, a child, a run, a server).
- "The start of the line holding an offset" (`text.lastIndexOf("\n", offset - 1) + 1`, about 20 times):  a one-line
  idiom;  a helper saves nothing.
- `jsShapes.topLevelOf()`:  counts brackets inside quotes on purpose ("only for a quick look").
- The core's console groups and `ConsoleLines`' `collapsed`:  the platform's own word (`console.groupCollapsed()`).
- `AppTexts`' page language beside `UI.i18n.locale`:  not the same rule (the document's `lang` first).
- The brand's `Object.assign(globalThis, { UI, Palette })` (`brand-ui.ts:41`):  its pages' scripts read them;  not a
  debug global.
- One-flag script readers (`--check` in `vscode-grammar.ts`, `site-data.ts`;  positionals in `design-check.ts`):  too
  small for a command;  `compare.ts`'s `parseArgs()` is the catalog's already.
- Watching files (`watchCommand.tsx`, `DiskStorage.ts`):  the catalog's Wanted watcher half, unchanged since sweep 1.
- `SpellLanguageService.isSubsequence()`, `truncateLines()`;  `SourceMarks`' VLQ encoder;  `claudeRunners.ts`' retry
  loop:  one of each in the repos.
- Tests, `__pack/`, the generated `spellSyntax*.json`, the `.py` page's inline script, `spell-app/src/spaces/test/`
  (test helpers).
