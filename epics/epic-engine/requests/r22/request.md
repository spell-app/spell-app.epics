---
id: r22
epic: epic-engine
from: ✅ prefs-and-undo (cd5118b8)
at: 2026-10-25T03:27-04:00
status: filed
filed: done in I115:  epic worktree remove finishes the folder itself
---

## Owen's words

why do I have to cleanup worktree?

(Then, in the modal "What should I do?" about the leftover folder:  "Send a tooling fix (Recommended), Retry, I'll approve".)

---

What happened (the sending session's notes, not Owen's words):
- `/epic done` for epic prefs-and-undo:  `epic worktree remove prefs-and-undo --branches`, run from the main checkout, removed every child repo's worktree and branch, then git's removal of the kit's folder failed:
  `failed to delete '/Users/owen/www/spell.worktrees/prefs-and-undo': Directory not empty`
- The worktree's own VS Code window was still open (`⎇ prefs-and-undo`), and its language servers run from that folder, writing caches into its `node_modules` while git deleted it:
  - `node_modules/vite-plus/bin/vp lint --lsp`, `vp fmt --lsp`, `oxfmt --lsp`
  - the TypeScript native-preview extension's `tsc --lsp --stdio`
- The session's fallback `rm -rf /Users/owen/www/spell.worktrees/prefs-and-undo` was refused twice by Claude Code's built-in safety check:  it's the session's own working directory (the session started inside the worktree), and no permission prompt was shown for Owen to approve.
- So the folder (only merged files, plus caches) is left for Owen to delete by hand.
- The ask, as the session put it to Owen:  `/epic done` (`/isolate done`'s Finish, and `epic worktree remove`) should never leave the folder behind, e.g.:
  - close the worktree's window first (`epic window close <name>`), or stop the language servers running from it, then remove;
  - or defer deleting the folder until the window and session are gone (a hook, or the next `/worktrees`), instead of an `rm -rf` the session can't run.

## Context

From epic prefs-and-undo's /epic done (session ✅ prefs-and-undo):  epic worktree remove prefs-and-undo --branches left ~/www/spell.worktrees/prefs-and-undo on disk (Directory not empty), its window's language servers still writing into it;  the session couldn't rm -rf its own folder.
