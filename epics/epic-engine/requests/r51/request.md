---
id: r51
epic: epic-engine
from: 🚧 data (62bf72d1)
at: 2026-10-31T11:22-04:00
status: new
images: image-1.png
---

## The person's words

This isn't working, I asked for at least two fields -- my syntax, and choice / notes field.  (Two would be OK).  Do we need epic-engine to make a change for this?

If so, tell epic engine.  Also, the light explanation in the left column should be a third column, to the right of the "your text / my text" column

Also, add line breaks in the light text in the left column to make thing easier to read.

## Context

Choice pages, epics/data/details/data-words.html, <epic-choice-row>. Adds to r49. Three asks: (1) two boxes per row, his syntax and a choice / notes box; (2) the row's note as a third column, to the right of the syntax column; (3) the note draws its line breaks: .note in EpicChoiceRows.css has no white-space: pre-wrap, so newlines collapse. The rows already carry them. For now data's boxes hold his syntax, then ----, then his comments. From session 🚧 data.
