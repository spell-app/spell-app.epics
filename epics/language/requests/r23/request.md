---
id: r23
epic: language
from: 🚧 repo-split (dc94c6bd)
at: 2026-11-17T11:36-05:00
status: filed
filed: T157
---

## The person's words

Owen's words (repo-split r2, from 🚧 mockup), the Solitaire part, which Owen said to send to language:

Do these in regular spell in mobile
- 4px padding inside the game, 4px between the columns
- Reduce the black top bar text and bar height by half so the game icons show

Regular spell always
- Make sure the game is always tall enough for the longest possible pile
- I can't drag cards because the page is scrolling while I drag

Owen, answering repo-split's modal: "send solitare fixes to language"

## Context

From repo-split P30 · spell.app on a Phone (request r2, its screenshots in epics/repo-split/requests/r2/). Seen in Chrome's phone simulation of spell.app, Solitaire in its <spell-viewer>. Solitaire / Solitario styles.css, and touch dragging (src/util/Dragging.ts?). The longest pile: 6 face-down + 13 face-up. repo-split refreshes spell.app after your 'Solitaire ready on main', so include these before sending it.
