---
id: r81
epic: epic-engine
from: 🚧 codemirror (aa9a7982)
at: 2026-11-19T19:46-05:00
status: new
---

## The person's words

Owen: "some Is which look like they are in progress ?" ... then, on fixing them here and sending the bug: "do both"

What codemirror found: I8, I9, I10, I11 and I26 each had an underway card followed by a done card, status done, but the item kept state="progress" in the epic page, so they showed "Claude is working on it" (blue) and the Issues heading said "5 with Claude". Running `epic update codemirror#<id> done` again cleared it on all five. Whatever wrote the first done card (2026-11-16 / 11-18, an agent's `epic update ... done|fixed`, or a phase/item close path) left state="progress" behind. Fix: any done / fixed card, or closing the item, should clear the progress state; `epic lint` could flag an item whose state is progress but whose last card isn't underway.

## Context

epic codemirror's page, Issues section (epics/codemirror/codemirror.plan.html#i8); stale state="progress" on finished items, cleared by hand with epic update ... done
