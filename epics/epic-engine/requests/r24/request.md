---
id: r24
epic: epic-engine
from: 🚧 debut (ad62dff0)
at: 2026-10-25T09:01-04:00
status: filed
filed: done:  the stuck table header's rule, corners and 1px gap (spell-doc.css)
images: image-1.png
---

## Owen's words

Owen (2026-10-25):  "ui-table rendering bug when header is stuck"  (screenshot:  guides/loc/loc.html, "2. By folder")

What the debut session found reproducing it (headless, guides/loc/loc.html, section 2 > "spell" opened, scrolled so the header sticks):
- The stuck header is the docs runtime's COPY (`.spell-table-pin`, `wireTableHeads()`, spell-doc.css "TABLES").
- The copy's row has no line under it ("no bottom edge of its own (the header row's rule is enough)"), so the rows slide under it with nothing between:  a row cut in half shows right under FOLDER ("docs/", "src/toolchain").
- Its top left and right corners are rounded (the table's own radius), so a sliver of the rows / ground shows at the corners above the copy.
- Measured:  the stuck section title ends at 165.0px, the copy's cells start at 166.0px:  a 1px gap where rows peek through.

## Context

From epic debut's session (Inspector / Spell UI work):  Owen's screenshot of guides/loc/loc.html § 2. By folder, its table's stuck header (the docs runtime's .spell-table-pin copy)
