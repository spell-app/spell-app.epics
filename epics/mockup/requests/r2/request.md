---
id: r2
epic: mockup
from: 🚧 notebook (88dd5402)
at: 2026-11-08T23:39-05:00
status: new
---

## The person's words

re automatic site index for spell-ui -- we could add "tags" to the site JSON, which would allow us to group pages and/or do a search for pages which match a given term

Send this making the toc automatically and suggestion above over to `mockup` to implement

## Context

From epic notebook (epics/notebook/notebook.plan.html#t10, which this replaces). The Spell UI site is @spell/guides/SpellUI (site file SpellUI.spellml); it reaches main with notebook's merge, under way now. Its Components index page, /components (ComponentIndex.spellml), is 627 lines of frozen cards converted from ui/docs/components.html, so yarn site:index no longer updates it and a new component needs a card by hand. Notebook's plan was a small docs element drawing the index from the component data <ui-docs-nav> reads (ui/src/docs-components/SiteData.ts); Owen's suggestion is tags in the site's data, to group pages and search pages by term, and he wants mockup to build the automatic index.
