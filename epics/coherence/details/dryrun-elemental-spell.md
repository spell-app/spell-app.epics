# Coherence dry run:  elemental-spell, before it built anything

The coherence agent (epic `coherence` P3), run on epic `elemental-spell`'s page as it stood on 2026-10-24 about 19:40
(content repo `3e0913f2`), with a catalog that didn't name the answer, and told not to read anything spellx built after.
Question:  would it have flagged the hand-written `.spellx` reader?  **Yes:  finding 2.**

1. **One registry for keyboard shortcuts:  `UI.keyboard` and `Chord`** (rebuilt).  Q31, Q35, Q38 and o1's `shortcut="meta+N"`
   plan new parsing and dispatch;  six hand-written copies skip the registry today (`spell-app/src/app/pages/editorHotkeys.ts:53`,
   `spell-ui/src/docs-components/ui-docs-search/UIDocsSearch.tsx:658`, `spell-epic/src/tools/_assets/spell-doc-toolbar.js:390`,
   `spell-doc-comments.js:901`, `src/server/liveClient.ts:581`, `spell-app/src/app/solid/ScopeDetailsPane.tsx:448`).  The plan's
   `meta` is `Chord`'s `Mod`.  Saves ~150 lines and 6 copies.
2. **Read `.spellx` with a `P.Tokenizer` subclass** (rebuilt).  Q10 A's "small .spellx reader";  `rawTextTags` already exists
   (`SpellParser.ts:49`);  a subclass as `MarkdownTokenizer` (42 lines) or `RulexTokenizer` (37 lines);  rules then give
   completion, hover and errors.  Evidence:  `spell map uses Tokenizer`.
3. **One rule-by-rule writer** (rebuilt).  Q10's ".spell to .spellx converter, rule by rule" is the translator's walk
   (`spell-parser/src/spell/translate/Translator.ts`), given what to write.  Saves a second walker of several hundred lines.
4. **The equality check already exists:  `ShapeCheck`** (rebuilt).  Q11's "both forms compiled, compared":
   `spell-parser/src/spell/translate/ShapeCheck.ts`.
5. **One word list per language for tags and attributes:  Spell UI's `Vocabulary`** (rebuilt).  Q25, Q37, Q46, Q50;  moved
   into the kit (`spell/element`) so spell-parser can use it.  ~300 lines.
6. **The editor's fixes already exist for `.spell`** (rebuilt).  Q49, Q7:  `SpellLanguageService`'s `onTypeFormatting()`,
   `accentEdits()`, `formatting()`.
7. **One position map for Q11 and Q18** (rebuilt).  One source-map type for both;  `@jridgewell/*` is installed with Vite
   (ask before depending on it, WWOD §2).
8. **One `withoutAccents()`** (twice).  `spell-ui/src/vocabulary/Vocabulary.ts:402` and `spell-app/src/lsp/SpellKeywords.ts:232`,
   which differ on ñ and ü.
9. **One "blank it out, keep its positions" helper** (twice).  `maskCode()` (`packs.ts:385`), `commentsBlanked()`
   (`spellSyntax.ts:283`), `SpellCSS.documentFor()` (`SpellCSS.ts:113`).

Considered, left out:  `<children name>` slots (Q15 weighed them);  `<ui-property>` editors (o2 reuses them);
`trigger` / `fire` / `send` and `on` / `when clicked` (not in the word list yet:  questions for it);  "folding block"
(renamed by Q65, Q68);  `documentSymbols()` (option C, rejected);  `action={...}` beside `<ui-action>` (Q34, Q41 open).
