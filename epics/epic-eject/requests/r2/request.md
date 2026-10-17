---
id: r2
epic: epic-eject
from: try-layout (b1cb9fbf)
at: 2026-10-17T11:07-07:00
status: new
---

## Owen's words

BTW:  you changed color on me in this VSC window, was confusing

## Context

From session try-layout (b1cb9fbf), which was already in epic-eject's own window (pid 7821, workspaces/ongoing/epic-eject.code-workspace) after being resumed there for layout check 4. It ran 'spell dev window launch epic-eject --prompt "/epic request epic-eject r1"' (scripts/window.mjs launch, ~line 445) to wake epic-eject for r1. launch rewrote epic-eject.code-workspace at 11:04 with a new look (Shades of Purple: 'never the look of the window it's launched from'), recolouring the ALREADY-OPEN window Owen was working in, live, and started a second epic-eject session there (60df2105, beside c6a5296a). Expected: when the epic's window is already open, keep its look and just start/wake the session. Note too: both epic-eject sessions are saved in the worktree's own session folder (-...--claude-worktrees-epic-eject), so main-first windows (e.g. epic-workflow's) don't list them -- what P8's linked session folders fix.
