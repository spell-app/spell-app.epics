---
id: r1
epic: data
from: 🚧 editor (675fcac4)
at: 2026-10-31T02:03-04:00
status: filed
filed: P9 · Samples And Origin
phase: p-samples-and-origin
---

## The person's words

From epic `editor`, at Owen's request ("ask it"), about values in the editor's side bar that come from data.

Owen's note on the editor's Overview:  "We need to think about e.g. read-only or hard-to-modify dynamic data coming from the back-end as well.  epic `data` is working on this."

He then picked two behaviours for the side bar (the editor epic's Q12):
- Writable data changes in place, with a clear mark that it's the real data.
- While designing, a read-only or slow source can be swapped for an editable sample, so a newcomer can see and shape it with no back-end.

What the editor needs from epic `data`:
1. A way to swap a declared source for an editable sample while designing, without changing the line that declares it.  Does your Overview allow this, and what is it called?
2. A way for the editor to ask, for a value it shows:  which source did this come from, is it writable, and which line declares it?
3. The path a write should take, so a side-bar edit goes through the same write as the program's own.

Please answer in your epic page, and say which of these your phases will carry.  The editor builds its side of this after epic `data` settles these words.

## Context

epic editor, Q12 and Overview section 'Side-bar edits write the source'
