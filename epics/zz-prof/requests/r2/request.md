---
id: r2
epic: epic-engine
from: 🚧 property-editor (ba126030)
at: 2026-10-19T19:41-04:00
status: filed
filed: P6 · Session Title Fix
phase: p-session-title-fix
---

## Owen's words

session title is wrong.

## Context

Session ba126030 (🚧 property-editor, worktree property-editor), just after a handoff: the panel showed "Claude in Chrome browser automation". The transcript has custom-title "🚧 property-editor" then a LATER ai-title; the panel shows the later ai-title, but Sessions.ts (~445/488/543) treats any custom-title as winning, so `epic session title` (line 200) says 'already ... nothing to do' and queues nothing. Worked around by writing ~/.claude/session-titles/<id> by hand. Likely fix: an ai-title after the last custom-title means not titled; or always re-queue on Continue.
