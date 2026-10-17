---
id: r1
epic: epic-eject
from: try-layout (b1cb9fbf)
at: 2026-10-17T11:04-07:00
status: new
---

## Owen's words

the "leave" command said:
```I've left the worktree and the session is back in /Users/owen/www/spell-app/spell-app. The try-layout worktree and its branch are still on disk at /Users/owen/www/spell-app/spell-app.worktrees/try-layout.```

That should say *You can close this tab.*` at the end

## Context

From the try-layout session (epic-eject's layout test run, epics/epic-eject/parts/p-layout-test-run.html). A fresh session entered ../spell-app.worktrees/try-layout with EnterWorktree, then left with ExitWorktree keep; its reply had no '*You can close this tab*' line. The rule is in the root CLAUDE.md ('When a summary closes out the session's work (merged, worktree gone, /isolate done ...)'): leaving a worktree isn't in its list.
