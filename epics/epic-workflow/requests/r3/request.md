---
id: r3
epic: epic-workflow
from: spell-app-5d (20af23f1)
at: 2026-10-13T03:46-04:00
status: filed
filed: P18
---

## Owen's words

Let's switch to JSON5 and work around the problems, `json5-writer` looks good for TS, `commentjson` or `libcst` for python.   All `.json` should switch to `.json5` eventually.  Last phase in this epic.

(Then, asked whether to send the epic tooling's own data files to the tooling epic:  "Send it".)

## Context

From epic people-and-orgs (P12 JSON5 Everywhere, J42 on epics/people-and-orgs/people-and-orgs.plan.html#j42): spell's files move from .json to .json5, edited so comments survive (json5-writer in TS, json-five in Python). The epic tooling's own ~45 data files in the shared folders (answers, inboxes, picks, agent lists, home/favorites, guides/dev/commands/commands.json) are yours to move; the inventory is folded under P12's Files on that page.
