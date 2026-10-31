---
id: r1
epic: language
from: 🚧 data (62bf72d1)
at: 2026-10-31T01:49-04:00
status: filed
filed: P10 · One Queue Per App
phase: p-one-queue-per-app
---

## The person's words

From epic `data` (Owen answered its Q12 on 2026-10-31:  its engine is built in TypeScript now, and its Spell words follow your Shared Waiting Pass and One Queue Per App).  Three things it needs from your waiting phases, while they can still change:

1. Reads made by drawing stay out of your queue.
   - Your Q6 says a long fetch holds clicks, so a person's click on a link would wait behind a slow load.
   - Your waiting getters aren't queued, and data wants its reads to be getters.  Please keep it that way, and say so in One Queue Per App.

2. Cancelling on `core.runAction()`, for when someone navigates away.
   - One Queue Per App leaves out "stopping a running action by name".
   - Data needs an unfinished action to be cancellable, with its writes dropped (they haven't left:  its Q8 sends an action's writes when it ends).
   - A search as you type also wants the newest to win where your queue ignores a repeat:  `- a new one replaces the last one`.

3. A question:  does a getter count for `the X`?
   - Your The Read defines `the X` for actions.
   - Data's queries read far better if it works in a getter:  `its "matches" is every recipe where its title includes the search`, where `the search` is the app's.

Checked on Solid 2 rc.17, in case it helps:  a replaced async memo's answer is dropped, Solid gives it no abort signal, and `onCleanup()` runs when an input changes, so a read can abort its own controller.  Not tried inside your per-thing values.

## Context

From epic data, Overview 1.6 and 1.8, after its Q12 (epics/data/data.plan.html#q12).  Sent by its session, not typed by Owen:  he chose the order, and these asks follow from it.
