---
id: r84
epic: epic-engine
from: 🚧 from-jarvis (0c62d6c9)
at: 2026-11-19T23:23-05:00
status: filed
filed: T114
---

## The person's words

release spell@next

---

From epic from-jarvis: please publish a new spell@next from main, so Owen's other machine can re-run the Jarvis API import with it.

What it carries for that (all merged into main):
- P16 · Per-Thing Records:  the OpenAPI reader imports one-record-per-thing routes
- P15 · Asked For By Parameter:  lists asked for by a field the rows don't carry
- P14 · Authenticated Places Served:  the page server reads authenticated places;  `it is authenticated with the secret "X"` and its sibling lines (old ones warn);  `spell place ingest` writes the new words
- also P1-P11, P13, P17 (<ui-tree> columns, <ui-graph>, <ui-json> outline, <ui-uploader>, call native / use lines, ui views, quiet pushed updates)

Full suite on main just before this request:  kit 2389, parser 7092, ui 396 + 6862, epic 2626, app 3845 passed;  2 app failures (ProjectPrompt, compile cache) were timeouts under load and pass alone (12 / 12).

## Context

From epic from-jarvis (🚧 from-jarvis): release request after P14, P15 merged; Owen wants the other machine to re-run the Jarvis import.
