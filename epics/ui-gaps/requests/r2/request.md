---
id: r2
epic: ui-gaps
from: epic-engine
at: 2026-10-25T21:48-04:00
status: new
---

## Owen's words

Owen, 2026-10-25:  "Once I approve them, P47 and P48 should move into `ui-gaps`."  He has approved both.

This is epic-engine's P47 · Move Into Spell UI (from debut's request r34):  its plan is ACCEPTED, its questions answered.  Build it in ui-gaps as a phase of yours.

- The plan, in full (goal, changes, files, verify, build plan, 12-18h):  /epics/epic-engine/parts/p-move-into-spell-ui.html, on the epic-engine page at #p-move-into-spell-ui
- What it moves:  <ui-docs-toc> -> <ui-toc>;  <epic-zoom> -> <ui-zoom>;  a grow option on <ui-textarea>;  <ui-docs-example> -> <ui-example>
- Its decisions (epic-engine Q22-Q28, answered):
  - Q22 (Owen's own answer):  BOTH -- a <ui-zoom> that wraps ANYTHING and zooms it, and zoom on <ui-image>;  <ui-zoom> takes a max width and/or height, and a percentage it shrinks its content to for the default view
  - Q23:  Spanish es-indice, es-ampliacion, es-ejemplo;  crece / filas-max
  - Q24:  <ui-textarea grow> is opt-in
  - Q25:  the review note and the choice pages' boxes move onto it;  not the brand composer or the section editor
  - Q26:  leave both inspectors now;  a todo to share one later
  - Q27:  `epic worktree merge-main` runs `spell ui rename --write` by itself (that part is the epic tool's:  send it back to epic-engine as a request when you get there)
  - Q28 (B, not the recommendation):  READMEs get a picture of the example
- Order:  after debut's P17 (the tag rename in `spell ui rename`) is on main
- Links are root paths (/spell-ui/...), never ../ (epic-engine P46)
