---
id: r13
epic: epic-engine
from: spell-app-93 (fe93b5b4)
at: 2026-10-21T09:45-04:00
status: filed
filed: P14 · Reading Time Chip
phase: p-reading-time-chip
---

## Owen's words

About epic even-martin-demo (asked in /worktrees, "Throw away even-martin-demo?"):

"move its code and phases into epic-engine and throw away the epic entirely"

## Context

From session spell-app-93 (/worktrees cleanup, main checkout). even-martin-demo's code: one commit d9626a4eb on spell-app's branch even-martin-demo (worktree /Users/owen/www/spell-app/spell-app.worktrees/even-martin-demo, the old pre-split folder), P1 Count Words: ReadingTime.js + ReadingTime.test.ts in the old packages/docs/tools/ (108 lines, 7 tests), docs tooling so spell-epic src/tools/ now. Its phases: epics/even-martin-demo/even-martin-demo.plan.html, P2 on. Then: git worktree remove that worktree (epic worktree remove doesn't see the old folder), git -C spell-app branch -D even-martin-demo once carried over, delete the epic page.
