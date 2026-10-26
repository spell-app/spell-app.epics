---
id: r34
epic: epic-engine
from: 🚧 debut (ad62dff0)
at: 2026-10-25T20:51-04:00
status: filed
filed: P47 · Move Into Spell UI
phase: p-move-into-spell-ui
---

## Owen's words

are there other `ui-docs-` and `epic-` components we should move into `ui-`?

(Owen's picks, asked in debut's chat, 2026-10-25:  move all four, and send it to epic-engine.)
- ui-toc:  <ui-docs-toc> -> <ui-toc>, after epic-engine's P42 (foldable contents) lands
- Image zoom:  <epic-zoom> -> Spell UI (a <ui-zoom>, or zoom on <ui-image>)
- Growing textarea:  a grow option on <ui-textarea>;  <epic-text-box> (and the editor Inspector's code box) use it
- ui-example:  <ui-docs-example> -> <ui-example>, for guides and READMEs too

## Context

Asked in epic debut's session.  debut's P17 is moving <ui-docs-themes> to <ui-theme-menu> right now (spell ui rename learns the tag);  use the same rename mechanism.  Left where they are, by debut's survey:  ui-docs-api / -tokens / -nav / -search (the docs site's data), the epic engine's own elements, epic-aside / -note / -code (brand callouts).  Overlap noted:  <ui-docs-inspector> vs the editor's Inspector (spell-app Inspector.tsx).
