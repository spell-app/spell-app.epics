---
id: r18
epic: epic-engine
from: 🚧 spanish (140edfa8)
at: 2026-10-23T15:20-04:00
status: new
---

## Owen's words

Owen, 2026-10-23 (epic spanish):  "Distill how we can make this an interactive process and send it to epic-engine when we get things working."

What "this" is:  `spell lang translate <project> --to es` (spell-lang's cli, epic spanish P24-P28).  It runs in three passes:  names (one batch to Claude, genders, checked against a shared glossary), lines (mechanical, rule by rule), fix-ups (failing / risky lines back to Claude in context, shape-checked against the English).  Cold:  todos 14 s, Solitaire ~35 s;  `--update` ~1 s.  Today it's all batch:  a person only sees the result and a "review them" note.

Distilled (by the spanish session):  where a person belongs in the loop, and what the epic engine could give it.
1. Names review (the main one).  After the names pass, before the lines:  a details page listing every drafted name -- English, Spanish, gender, where it came from (glossary / reviewed / drafted), the lines it appears in.  Approve, edit, or pick from alternatives;  "use for every project" adds it to the shared glossary (`--learn`).  Answers go back as the names dictionary, and the run continues.
2. Fix-up review.  Each line Claude fixed, English / mechanical / fixed side by side, with why it failed (lint, test, shape).  Accept, edit, or "always say it this way" (a glossary phrase).
3. Drift.  Names a project chose differently from the glossary:  keep the project's, or adopt the glossary's.
4. Leftovers.  Lines still needing a person, as items filled in on the page;  the run re-checks them.
5. Steering.  The run as a background job with live progress (pass, calls, timings), answering marks as they come;  `--effort fast|balanced|best` picked on the page.

What the engine needs, roughly:
- a details page fed by a running COMMAND (not just Claude), whose answers the command reads back and continues on
- rows with accept / edit / pick-one, and a "for every project" checkbox
- a way for a CLI tool to block for answers and resume (like `epic ask` + inbox, but driven by `spell`)

## Context

From epic spanish (worktree spanish), todo T10.  The translator:  spell-lang/src/spell/translate/ and src/cli/translateProject.ts;  README-cli.md 'Translating a project'.
