---
id: r12
epic: epic-engine
from: 🚧 repo-split (a286416d)
at: 2026-10-21T08:32-04:00
status: filed
filed: P13 · Blank Choice Boxes
phase: p-blank-choice-boxes
---

## Owen's words

Owen, in `🚧 repo-split` (2026-10-21):

> For CLI P13, make a page where I can review and provide what I want for each command in all of various projects, grouped by project.  Put the input where I can type the new version to the left, leave them blank (no change).  Clicking on the current cli string should populate the field.  In the description, 1-2 sentences written as if to a newby to the project.

> re-use the existing page rather than creating a new one

He picked "A choice page" from a modal, whose option said:  "The choice-page kind (epic choices new, as for P13's boolean names):  one row per command, grouped by repo.  Changed to fit your ask:  the input on the left, blank by default, and a click on the current name fills it".

## What the choice page needs (a new mode, e.g. rows-file `"blank": true` -> `<epic-choice-rows blank>`)

repo-split is making the page now with today's elements:  every row's `recommended` is `""`, `fileColumn: false`.
What today's `<epic-choice-row>` / `<epic-choice-rows>` can't do yet:

1. **The box LEFT of Current.**  Columns:  New (the box) | Current | Purpose (the 1-2 sentence description).
   Header "New" (or "Yours"), not "Recommended".
2. **Blank means no change.**  The box starts empty;  changed = its text is non-empty AND differs from `current`.
   - no `stays` label;  the reset button clears the box
   - the section badge counts commands and changed ("42 commands · 3 changed"), not "N to change · M stay"
3. **Clicking the Current text fills the box** with it (cursor in the box, at the end), so Owen edits from it.
   - a `title` tooltip on it:  "Copy into the box"
4. `epic choices wait | answer`:  print a blank row's change as `current  =>  typed`, not `current -> "" => typed`;
   "Unchanged" counts as "N left as they are", not "accepted as recommended".

The page reads as a list to type over, not a list of recommendations.

## Context

From 🚧 repo-split (worktree ~/www/spell.worktrees/repo-split):  P13 · CLI to the Kit's command-naming page, a choice page in epics/repo-split/details/, needs a blank-box mode for <epic-choice-row>
