---
id: r28
epic: epic-engine
from: elemental-spell-97 (6c7231b5)
at: 2026-10-25T10:18-04:00
status: new
---

## Owen's words

ok on P16/P17 -- make sure you tell epic-engine that fractional numbers don't work

(Earlier, the original ask, r21:  "When you add a phase like this on the fly, OK to call it P4.1 rather than renumbering.  Is that significantly easier?"  Then today:  "nevermind, 11.1 is fine".)

What happened in elemental-spell, 2026-10-25:
- `epic add-phase` can't make decimal ids:  Owen's P11.1 / P11.2 became P16 / P17.
- It also refused to add after a started final Doc Review (P15):  the agent renamed P15 to "Doc Review hold" for a moment to get the phases added at the end, then renamed it back.
- r21 was built as epic-engine P34, which moves and renumbers phases, not decimal numbers.

Asks:
1. Decimal phase ids (P11.1) through add-phase, placed right after their base phase, never renumbering the others.
2. Adding a phase after a Doc Review that has already started, without the rename trick.

## Context

epic elemental-spell's page, phases p-notebook-page (P16) and p-reassess-the-spellx-notebook (P17), added 2026-10-25 by an agent;  follows up r21 (built as epic-engine P34)
