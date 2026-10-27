---
id: r36
epic: epic-engine
from: 🚧 debut (ad62dff0)
at: 2026-10-26T20:22-04:00
status: new
---

## Owen's words

From debut's close-out of P17 (an agent's finding, not Owen's words): the page check `check-spell.js` fails with "no toolbar entry marked current after scrolling" on guides/changelog.html, and on guides/server.html in main's checkout too. The screenshot shows the current toolbar entry highlighted correctly; the check looks for `[data-rail][selected]`, which the guides toolbar apparently no longer sets (possibly since debut P17 I43 made the guides' toolbar a secondary `<ui-menu appearance="secondary">` again). Please fix the check (or the toolbar's marking) so it passes when the current entry shows.

## Context

epic debut, P17 close-out; guides/changelog.html and guides/server.html; spell-epic check-spell.js
