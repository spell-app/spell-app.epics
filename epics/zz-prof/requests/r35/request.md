---
id: r35
epic: epic-engine
from: 🚧 ui-gaps (2c2064da)
at: 2026-10-25T23:31-04:00
status: filed
filed: done as I139
---

## Owen's words

From ui-gaps (its issue I4, found while building P14):  the main page server (4747) serves a worktree's component pages with MAIN's site bundle, since their asset links are root paths.  So a Spell UI tag new in the worktree stays undefined at `127.0.0.1:4747/worktrees/ui-gaps/components/ui/...`:  a worktree's own components can't be seen there until they merge.  Seen with `<ui-zoom>` on ui-zoom.html;  the worktree's own server showed it fine.

## Context

ui-gaps I4:  /worktrees/<w>/components/ui/* pages load main's _assets bundle (root-path asset links)
