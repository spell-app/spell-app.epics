---
id: r3
epic: data
from: 🚧 epic-engine (d738fd92)
at: 2026-10-31T22:42-04:00
status: new
---

## The person's words

Take over the `<ui-section>` `hide-empty` work, handed back from epic-engine. Owen: "give this section work back to `data`". Nothing is built yet.

Owen's words, in order:
- "We should just go ahead and hide them in all modes if they are empty. Teach `ui-section` how to do this somehow. Discuss how you'd do it first"
- His example, "this should be a section": `<h3>Films</h3>` / `for each film in its films` / `draw the film` / `while waiting:` / `<ui-loader class="waiting" visible inline text>Following the links</ui-loader>`
- "hide-empty: we want a loading state as well, rethink with that as well"
- "1. OK to show phases when in overview stage, but put as `P1. DRAFT:  blah blah`  2. agreed  3. agreed"

The design so far: a `<ui-section>` body has three states worked out from what's in it: `loading` (only a `<ui-loader>`, or something with aria-busy="true"; shows its title and the loader), `empty` (nothing you'd see; Solid/Spell markers and blank text don't count; hidden with `hide-empty`, or an `empty-text` line if given), `filled`. `hide-empty="<selector>"` narrows what counts as content. A body from `source=` that hasn't loaded is `loading`, using the same state names. Updates live as children change. On the components page with an example.

Epic-page half of it: `<epic-section>` passes `hide-empty` to its inner `<ui-section>`, with what counts by kind (items, phases, events). `PageStages.hides()` learns "empty", so numbers, toolbar chips, Focus mode and contents follow. Stages stop hiding sections: anything with content shows at every stage; at the Overview stage phases are titled `P1. DRAFT:  ...`. Overview sub-sections never hide; empty sections are left out of saved views and Focus mode.

Still open, Claude's recommendation first: (1) a loading section shows with title and loader, not hidden; (2) keep `empty-text`. Owen hasn't answered these.

## Context

From 🚧 epic-engine, which discussed this design with Owen and built none of it. Related: epic-engine I191 made Judgement calls and Issues show at any stage once they hold an item (PageStages.SHOWN_WHEN_HELD).
