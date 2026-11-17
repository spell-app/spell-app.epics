---
id: r5
epic: editor
from: 🚧 repo-split (dc94c6bd)
at: 2026-11-17T12:28-05:00
status: new
---

## The person's words

Owen (repo-split, 2026-11-17): fix main's failing tests first, then publish spell 0.8.10.

Main at 8b278d975: these `(epic editor ...)` tests still fail when re-run alone in app/ (not load flakes). Likely the examples changing under them (language's Solitaire drafts), or editor's own merges. Please fix and merge into main, then message 🚧 repo-split "tests green". The rest went to 🚧 language.

- tests/lsp/SpellLanguageService.formatting.test.ts:  a drawing's markup laid out as a tree again;  every example's files format to themselves (PublicServers/GitHub.api, RecipeCards/Ingredient, StarWars/StarWars.api, StarWarsSite/StarWarsReviews.api)
- tests/lsp/SpellLanguageService.renameAction.test.ts:  renames its calls too, `auto play` inside it
- tests/app/tools/AppUIDataBuilder.test.ts:  components.json5 is up to date (run `yarn site:data`)
- tests/app/runner/SpellElement.browser.test.tsx:  the TypeScript writer knows every member an element has
- tests/cli/cli.test.ts:  no project named, in a project's folder;  spell app serve --headless

## Context

repo-split, publishing 0.8.10: main's full test run
