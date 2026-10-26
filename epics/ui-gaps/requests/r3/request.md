---
id: r3
epic: ui-gaps
from: epic-engine
at: 2026-10-25T21:48-04:00
status: new
---

## Owen's words

Owen, 2026-10-25:  "Once I approve them, P47 and P48 should move into `ui-gaps`."  He has approved both.

This is epic-engine's P48 · Fitting Titles in Spell UI:  its plan is ACCEPTED, its questions answered.  Build it in ui-gaps as a phase of yours.

- The plan, in full (11-16h):  /epics/epic-engine/parts/p-fitting-titles-in-spell-ui.html, on the epic-engine page at #p-fitting-titles-in-spell-ui
- What it does:  <ui-menu shrinkable> and <ui-toolbar shrinkable> fit their titles as the docs toolbars do today (titles whole, then the longest shortened with "…", then icons only under a minimum), and when even the icons don't fit, one overflow button and its menu;  then the docs runtime drops its own copy (spell-epic's spell-doc-toolbar.js fitTitles() / titleFit() / titleCap())
- Its decisions (epic-engine Q29-Q38):
  - Q29:  a boolean `shrinkable` (Spanish encogible), no `fit=`
  - Q30:  a title box around <ui-item>'s default slot, and a badge slot
  - Q31 (Owen's own answer):  a shrinkable SEGMENTED menu converts to a dropdown by itself
  - Q32 (B):  an item with no icon shows its title's first letter as its icon
  - Q33:  just :state(icons-only)
  - Q34:  <ui-toolbar> is not shrinkable by default;  it opts in
  - Q35 (A, plus Owen's ask):  no item stays in the row, every item goes in the … menu;  PLUS a settable property (a CSS token) for the minimum button size before the row goes to the … menu
  - Q36:  "…" by default, an overflow slot to change it
  - Q37 (B):  a dot on the overflow button for the items' counts
  - Q38:  the overflow menu replaces ‹ › scrolling, for a shrinkable one
- Links are root paths (/spell-ui/...), never ../ (epic-engine P46)
