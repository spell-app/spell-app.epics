---
id: r33
epic: epic-engine
from: elemental-spell-97 (6c7231b5)
at: 2026-10-25T14:48-04:00
status: new
---

## Owen's words

P17.1 ==> this is a full phase, not an amendment to an existing phase

(Context, from 🚧 elemental-spell, 2026-10-25:)
- In elemental-spell, the Button Page Notebook was added with `--after 16` (P16.1);  then `epic move elemental-spell#P18 P16.1` put the Parent Attribute ahead of it, and the renumbering made it P17.1.  Owen wants it a whole phase, P18 (and Reassess the .spellx Notebook, now P18, becomes P19).
- No verb does that:  `epic move elemental-spell#P17.1 P18` planned "P17.1 -> P18.1" (a decimal again).
- That same `epic move` then crashed:  the page had an epic item (J91) whose title held unescaped quotes, `title="P10: a right click's menu is a <ui-menu direction="vertical"> ..."`, written by the epic tool overnight (2026-10-25 05:05).  I escaped it by hand;  lint passes now.  The writer should escape attribute values.

Asks:
1. A way to make a decimal phase a whole one (renumbering the phases after it), e.g. `epic move <epic>#P17.1 --whole` or `epic renumber`.  Then do it for elemental-spell:  P17.1 -> P18, P18 -> P19.
2. Escape quotes (and <, >) in item titles written into the page's attributes.

## Context

epic elemental-spell's page, phases p-button-page-notebook (P17.1) and the Reassess phase (P18);  item J91
