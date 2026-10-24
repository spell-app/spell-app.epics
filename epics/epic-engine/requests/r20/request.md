---
id: r20
epic: epic-engine
from: solid-17-41 (948c5133)
at: 2026-10-24T13:28-04:00
status: filed
filed: P26 · Reliable Session Moves
phase: p-reliable-session-moves
---

## Owen's words

tell epic-engine that we had these problems

---

The problems (written by the sending session):

`/epic elemental-spell` was typed in the solid-17 window.  solid-17 is a broken worktree:  its `.git` points at
`/Users/owen/www/spell/.git/worktrees/solid-17`, which is gone, so it isn't in `git worktree list`.

1. `epic window launch elemental-spell --move` made the worktree, the branch and the window file, and printed
   "this session moves to elemental-spell's window when this turn ends ...".  No window opened, and the session never moved.
2. `epic window open elemental-spell` then opened the window.  `epic window handoff elemental-spell --prompt "/epic elemental-spell"`
   printed that the session would move at turn end, but no session appeared in the new window ("no session created in the new window").
3. What worked:  `epic window launch elemental-spell` WITHOUT `--move`, run from inside the new worktree:  a new session in the open window.

Logged in PAPERCUTS.md under "## epics", 2026-10-24.

## Context

From a session in the broken solid-17 worktree's window, launching epic elemental-spell (epic window launch --move / handoff)
