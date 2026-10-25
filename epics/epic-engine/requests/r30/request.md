---
id: r30
epic: epic-engine
from: elemental-spell-97 (6c7231b5)
at: 2026-10-25T13:59-04:00
status: new
---

## Owen's words

Owen picked A on elemental-spell Q74 (2026-10-25), "P9 covers the words people see too":

> P9 renames the tooltips and docs text with the events: "Open this X" / "Close this X" -- one rename, and the page never says fold beside an event called open.  Recommended: Owen's own reason for the words was that people show and hide, they don't fold.

The epic pages' part is spell-epic's, so it's yours:  "Fold this X" / "Unfold this X" in 28 files under spell-epic/src/components/ (`rg -ln "Fold this|Unfold this" spell-epic/src`) become "Open this X" / "Close this X".
Spell UI's docs part (SiteSections.ts, NavPreferences.ts) is being done in elemental-spell.

## Context

epic elemental-spell Q74 (answered A), found by the coherence sweep's epic-pages report #5;  the word list (open / close for anything that shows and hides) is elemental-spell's Q65 / Q68
