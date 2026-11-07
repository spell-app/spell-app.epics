---
id: r1
epic: mockup
from: 🚧 notebook (88dd5402)
at: 2026-11-07T10:05-05:00
status: new
---

## The person's words

what is the structure of e.g. the spellui pages -- I'm imagining that this is a "(web)site" and that the pages are inside of it, so one sees them as a single unit rather than many separate pages.  The pages would specify their own "route" to navigate between them

(Then, asked where that work should go:)  pass that to the `mockups` epic which is working on site design

## Context

From epic notebook (worktree notebook), which folds <spell-notebook> into <spell-page notebook>. Today Spell UI's component pages are 94 separate projects in app/spaces/@spell/notebooks/ (one per component, each tab its own .spellml page, a copied TabBar.spellml linking tabs by the editor's file address /edit/@spell/notebooks/Button/Usage.spellml); no shared nav or site address. Spell UI's own docs site (ui/docs/) is one HTML page per component, tabs by <ui-tabs history>. The core has no routes or router: parser/src/core/classes/Page.ts says its address and moving page to page aren't built yet. notebook's P7 Content Rewrite rewrites those files in place: the place to turn them into one site once routes exist.
