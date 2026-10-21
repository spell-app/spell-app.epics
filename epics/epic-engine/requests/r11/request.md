---
id: r11
epic: epic-engine
from: 🚧 repo-split (a286416d)
at: 2026-10-21T08:27-04:00
status: new
images: image-1.png
---

## Owen's words

Owen, in `🚧 repo-split` (2026-10-21), during `/epic resume repo-split`:

> You keep asking for permission to EnterWorktree, it has to stop.

> It's there.  Google says this doesn't work for worktrees outside of `.claude/worktrees/`

(His screenshot:  `~/.claude/settings.json` already has `"EnterWorktree"` in `permissions.allow`, `defaultMode: "auto"`.)

> what is the downside of putting it in .claude/worktrees?

His pick, from the modal:  **"Skip it when already there"** --
"never call EnterWorktree when the session already starts in the worktree;  keep ~/www/spell.worktrees/".
Not "Back to .claude/worktrees", not "Live with it".

## What Claude Code does (from the repo-split session's research)

- Claude Code always asks before `EnterWorktree` enters a path outside the repo's `.claude/worktrees/`.
  - https://code.claude.com/docs/en/worktrees:  "An `EnterWorktree` permission rule or choosing 'don't ask again'
    doesn't suppress this prompt;  only `bypassPermissions` mode skips it."  Since v2.1.206.
  - No setting, `EnterWorktree(<path>)` rule, `additionalDirectories` or PreToolUse "allow" skips it
    (https://code.claude.com/docs/en/permissions;  user report anthropics/claude-code#94265).
  - Open feature request for a path rule / trusted roots:  anthropics/claude-code#77069.
- Our worktrees are at `~/www/spell.worktrees/<epic>`, so every enter prompts.

## Where the skills call it today

- `/epic resume`, step 0 / step 3:  `EnterWorktree` with `path`, even when the session already runs in the worktree.
- `/epic`'s "Launched" (from `epic window launch`):  the same, "also in a worktree-only window ... Entering records
  the worktree, so a reopen from any window comes back to it (epic `epic-eject` I3)".
- `/unpark` step 3, `/park` "Resume", `/wait-for`:  the same pattern.
- That record (I3) needs another way when the enter is skipped:  e.g. the SessionStart hook noting the session's cwd.

## Also

- The `⎇ repo-split` window holds three folders (`~/www/spell`, the worktree, `spell.epics`), so a new session there
  starts in `~/www/spell` and still has to enter once.
  Opening epic windows on the worktree first (or alone) would let new sessions start in it.

## Why not back to `.claude/worktrees/` (what Owen weighed)

- nested under the main checkout, a worktree's missing packages resolve silently to main's `node_modules`
- the main window's file watcher carries every worktree
- the page editor refuses dot paths (epic `isolate-changes` C4)
- cleaning or moving main takes the worktrees with it
- undoes repo-split's `~/www/spell.worktrees/` layout (AGENTS.md, J113, P12's tooling)

## Context

From 🚧 repo-split (worktree ~/www/spell.worktrees/repo-split), during /epic resume repo-split:  every EnterWorktree into ~/www/spell.worktrees/<epic> prompts Owen, though his allow rule has it
