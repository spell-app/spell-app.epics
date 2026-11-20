---
id: r32
epic: language
from: 🚧 from-jarvis (0c62d6c9)
at: 2026-11-19T20:24-05:00
status: filed
filed: P67 · Drag Events
phase: p-drag-events
---

## The person's words

send to language

---

Owen's answer to from-jarvis Q14 ("OK the new Spell words the file uploader would add?"):  picked A, "All of them", with the note above.  The words, each OK'd by him (from Q14, verbatim):
- `the file as text`, `as json`, `as binary`:  read a picked or dropped file, waiting for it (his own words, from-jarvis C13)
- `when uploading:`, with `cancel uploading`:  before the upload;  cancelled, nothing is posted
- `while uploading:`:  what it sets is put back when the upload ends, as `while a card is dragged over it:` already does
- `when a file is uploaded:` and `when a file fails to upload:`:  after each file
- Already decided, not asked again:  `when a file is dropped on it:` (from-jarvis Q12), `can take a file if:` (the drop rule a pile already has).
- Q14 noted two readings to watch:  `as json` beside `as text` (`as` might read as "pretend it is");  `while uploading` has no subject:  it means this uploader's upload.
- "file" is the word (from-jarvis Q7, C:  the same word as the place kind).
- English and Spanish.

They hang on `<ui-uploader>`, which from-jarvis P9 is building now (its events:  `ui-file-dropping` / `-dropped`, `ui-uploading` (cancellable) / `ui-upload-progress` / `ui-uploaded` / `ui-upload-failed`, `ui-folder-*`), and on a bridge carrying an element's events into Spell's event chain (`send()`):  a view's `when a file is dropped on it:` first, then the lists holding it, then the app.  P9's plan says how;  this request is the Spell half.  It fits beside r29 (drag and drop page events).

## Context

From epic from-jarvis (🚧 from-jarvis): Q14 (epics/from-jarvis/from-jarvis.plan.html#q14) and P9 · File Upload In Spell (#p-file-upload-in-spell), its 'Spell words' and 'bridge' steps.
