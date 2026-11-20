---
id: r29
epic: language
from: 🚧 from-jarvis (0c62d6c9)
at: 2026-11-19T19:02-05:00
status: filed
filed: P67 · Drag Events
phase: p-drag-events
---

## The person's words

`dragged-over` could have a limit, e.g. only once every 100ms or something

add a phase (in `language` ?  some active epic?) to do this.
Spell should be a good citizen as far as the rest of the browser ecosystem is concerned.

For the file events, we can just support `when a? file is? dragged over it?` form for now, but put the file events in the request to the other epic.

---

Earlier, same conversation (Owen):  "On the names in general, prefer the spell names to the browser ones."  And:  "names:  should be `ui-file-dragged-over` for file.  Should we add `ui-dragged-over` for the normal drag?  What would be gained?"

What "this" is (Claude's summary, from epic from-jarvis):
- Today an ordinary Spell drag (a card over a pile) sends NO page (DOM) event:  the page calls the list's compiled handlers (`whenCardDraggedOver(card)` ...);  the only event is the program's `<thing>-drop` (`card-drop`), and only when the list has no `dropped on it` line.  Code outside the program can't `addEventListener` for any of it.
- Wanted:  ordinary drags send `ui-dragged-over` (rate-limited, e.g. at most once every 100ms), `ui-dragged-out`, `ui-dropped`, named after Spell's drag words, the thing and the list in the detail.
- And files from the desktop:  `ui-file-dragged-over`, `ui-file-dragged-out`, `ui-file-dropped` (detail:  file or folder);  Spanish `archivo-arrastrado-sobre`, `archivo-arrastrado-fuera`, `archivo-soltado` (settled in from-jarvis Q12, for its `<ui-uploader>`, P9).  P9 itself only supports the Spell form `when a file is dragged over it:` for now.

## Context

From epic from-jarvis (🚧 from-jarvis), P9 · File Upload In Spell and Q12 (epics/from-jarvis/from-jarvis.plan.html#q12): the <ui-uploader>'s event names. Spell's drag rule: parser/src/spell/rules/classes/DragHandler.ts; the program's drop event: parser/src/core/core.types.ts 'drop-event'.
