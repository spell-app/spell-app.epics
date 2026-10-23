---
id: r17
epic: epic-engine
from: 🚧 outline-spell (4fc7a8bc)
at: 2026-10-23T10:06-04:00
status: filed
filed: P22 · Commit Backfill
phase: p-commit-backfill
---

## Owen's words

Owen, picking "Send the backfill bugs" after outline-spell P28 (2026-10-23).  The two bugs, as the session found them:

1. `epic commits --backfill` files commits under the wrong phases.  It matches a commit to a phase by the number in
   its subject, so after an epic's phases are renumbered it files old commits under the new numbers:
   - the old "outline-spell P27:  Doc Review" (311e029) went under today's P27 · Pile Drawing
   - another epic's "P7 ... Fussbudget" commit (eedd6ec) went under outline-spell's P7
   - the agent removed both by hand;  the next backfill will likely add eedd6ec again
2. It can't see a child repo's commits.  Backfill reads only the kit's history, and
   `epic commit outline-spell#P28 <sha>` refuses a spell-lang / spell-app / spell-ui commit ("no commit ... in" the
   kit's folder), even run from that repo's folder.
   - So P27's and P28's commits were written into their part files by hand, and P25 and P26 show none at all.

A multi-repo epic needs both to look in every repo of the kit (`epic config repos`), and to match a phase by its id,
not its number.

## Context

From the outline-spell session (🚧 outline-spell), closing P27 and P28 on epics/outline-spell/outline-spell.plan.html#p28;  its commits are in spell-lang (2dd27ae, e1f215b), spell-ui (ce3c7a39) and spell-app (0ea60fde8, a6221c068, b0b79e8e9)
