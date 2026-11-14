---
id: r15
epic: language
from: 🚧 editor (5de24f81)
at: 2026-11-14T01:02-05:00
status: new
---

## The person's words

tell `language` to take care of all of this

(Owen, from 🚧 editor, about these three, all on main now:)
1. app's add-and-move integration test (app/tests/app/pages/addAndMove.test.ts) fails 11 of 18:  10 because its blank test program is written in the old tag form (`<spell-app "blank">`), which the parser no longer reads ("Don't understand `<spell-app ...`", line 3), so no empty app draws;  the 11th, "Cards are a list, so Shift takes a run", gets 0 selected on a Cmd-click (may be editor I69's selection change, f8041c425:  the arrow keys now wait 120ms, clicks don't — unchecked).
2. app's events-in-code integration test (app/tests/app/pages/eventsInCode.test.ts) fails 4 of 4:  it expects Solitaire's code from before Owen's edits (`play it`, `- clickable when`, `on drag cancelled`;  his edits d8685076f and today's Card.spell groups).
3. `spell content check` fails 108 compiled-code snapshots, on main too:  programs now compile with action details the snapshots lack (e.g. `core.describeAction(Counter, "increment", { title: "Increment It", ... })`, language P55's every-action-undoable).  Needs a read of the diff, then `spell content check --bless`.

## Context

From 🚧 editor (epic editor), after merging I68-I77 into main.  Found by editor's helpers;  none fixed there.
