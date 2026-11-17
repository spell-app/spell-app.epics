---
id: r24
epic: language
from: 🚧 repo-split (dc94c6bd)
at: 2026-11-17T12:28-05:00
status: new
---

## The person's words

Owen (repo-split, 2026-11-17): fix main's failing tests first, then publish spell 0.8.10.

Main at 8b278d975, `yarn test`, then each failed file re-run ALONE: these still fail (not load flakes). Most look like Solitaire and the examples changing (your published drafts): snapshots, SpellWords, compile cache, bubbly, fixtures, contract, LSP completion / signature help on Solitaire.spell, Spanish keyword fixes, ScopeExplorer, typescript.test.ts.
Please fix (or re-pin with Owen's OK) and merge into main, then message 🚧 repo-split "tests green". The `(epic editor ...)` ones went to 🚧 editor.

app/ (yarn vp test run <file> in app/):
- tests/app/runner/runner.browser.test.tsx:  the `Solitaire` example, each pile and card its own element
- tests/cli/contract.test.ts:  every target prints the same, ListaDeLaCompra, RecipeCards, ShoppingList
- tests/cli/quartApp.test.ts:  a Python spell app in a real browser
- tests/lsp/ScopeExplorer.test.ts:  4 tests, incl. `core.scopes.js` is what `yarn scopes --builtins` generates
- tests/lsp/SpellKeywords.test.ts:  7 Spanish accent-fix / completion tests
- tests/lsp/SpellLanguageService.actions.test.ts:  action and menu tags, English and Spanish
- tests/lsp/SpellLanguageService.test.ts:  10 completion / signature-help tests on Solitaire.spell, head-line keywords (T105), javascript names on hover
- tests/spaces/examplesReadme.test.ts:  README-examples lists every example with its picture
- tests/spaces/server/node/projects/disk-fetch.test.ts
- tests/spaces/spell/SpellProject.compileCache.test.ts:  3 tests
- tests/spell/SpellDeclarations.test.ts:  2;  SpellProject.test.ts (Solitaire parses the same way every time);  SpellWords.test.ts:  2
- tests/spell/parserTests/Expectations.test.ts (quick enough on every line of Solitaire);  IncrementalEdits.test.ts
- tests/spell/recipeBox.test.ts:  2 (CajaDeRecetas, RecipeBox Edit screens)
- tests/spell/test/bubbly.test.ts:  Solitaire's blocks;  TarjetasDeEstudio snapshot
- tests/spell/test/fixtures.test.ts:  ShoppingList (JS and TS);  library.test.ts (loads no Solid);  naming.test.ts;  pythonNameClashes.test.ts;  typescript.test.ts (whole file)

Kit's 2 (bundleCommand, Bundle.test "installed repos' settings name every bundle"):  repo-split takes those.

## Context

repo-split, publishing 0.8.10: main's full test run
