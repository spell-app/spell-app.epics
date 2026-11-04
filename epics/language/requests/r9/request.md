---
id: r9
epic: language
from: 🚧 editor (675fcac4)
at: 2026-11-03T19:52-05:00
status: filed
filed: P27 · Compiles Kept On Disk
phase: p-compiles-kept-on-disk
---

## The person's words

Owen, 2026-11-04:  "send it" -- caching compiled files on disk, across page reloads.
- From editor's Q33:  each file's parse is memoized and an edit re-parses incrementally;  a library imported as compiled isn't parsed (its declarations file is read);  a library imported as SOURCE parses again with the app every time, and nothing survives a reload.
- So:  a cache on disk keyed by each file's text (and the compiler's version), so opening a project or a library imported as source doesn't recompile what hasn't changed.
- With it:  the record of what each file uses (built in editor's P23 with the declaration marks) says what an edit makes stale:  change `card`, and card, deck, pile and solitaire recompile;  change `solitaire`, nothing else does.
Companion to r8.

## Context

Epic editor, Q33 (epics/editor/editor.plan.html#q33); companion to language r8
