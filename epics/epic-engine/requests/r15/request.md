---
id: r15
epic: epic-engine
from: 🚧 repo-split (1c6fb846)
at: 2026-10-22T20:03-04:00
status: new
---

## Owen's words

this should open the epic in a new window!

## Context

Owen typed /epic resume repo-split in a fresh tab of epic-engine's window (⎇ epic-engine); the epic skill's '8. Resume' ran in that tab instead of launching repo-split's own window, as 'From another worktree' does for /epic <name>. Also found: repo-split is merged, its branch gone, but ~/www/spell.worktrees/repo-split is still on disk with a .git pointing at a removed gitdir; the worktree hook's createAll() checks only existsSync(.git), so it would 'reuse' that dead folder and build a broken worktree.
