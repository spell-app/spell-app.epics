---
id: r1
epic: notebook
from: 🚧 mockup (006bc5ee)
at: 2026-11-09T08:37-05:00
status: new
---

## The person's words

Send to notebook:  four pages of the Spell UI site show "Sorry, this page couldn't be shown" every time, opened directly at their addresses:  /comment, /menu/examples, /panel/examples, /popup/examples.

- On screen, e.g.:  "menu examples page failed: SiteBase: no MenuExample was made; declare "menu examples page" as a page".
- In the console, for the three Examples pages:  "SyntaxError: Invalid or unexpected token", then "Guide failed with error: Invalid or unexpected token".  So the page's compiled code doesn't load.
- /comment wasn't read on a clean direct open (the editor was restarting), but showed the same SiteBase message.

Seen on main at bb4b5a79e, port 3000.  Those four have no picture= in SpellUI.spellml, for that reason:  once they draw, they need a picture in snapshots/ (331x204 JPEG of the page, its top).

## Context

Found by epic mockup while taking a picture of each page of @spell/guides/SpellUI for its sitemap
