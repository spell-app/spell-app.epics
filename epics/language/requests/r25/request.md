---
id: r25
epic: language
from: 🚧 mockup (2964811f)
at: 2026-11-17T12:57-05:00
status: filed
filed: same as T158
---

## The person's words

Five app tests fail on main from the language epic's changes (found by mockup's I54 while clearing main's failures for repo-split's 0.8.10 publish; mockup's own are fixed and merged):
1. ScopeExplorer's pack test still looks for the card's `short name`, which language T150 (7c51cb9ef) renamed `shorthand`.
2. The language server's tag completion now offers `separator` too (language T156, b6ae67354, a second word for `divider`): the test expects 4 tags, gets 5.
3. IncrementalEdits: adding a type to Card.spell re-parses Solitaire.spell too -- since language P60 (58e743379), `pause for` asks for every unit of time, which looks at every type (`dimensionsIn()`).
4. runner.browser: Solitaire's columns come out C2, C3, C1 -- Solitaire.spell draws them in that order since language 01202266c ("with his edits to both from main"), possibly a slip in Owen's edit.
5. quartApp: the first click reads "Undo Turn Card", not "Undo Play Card", since Solitaire's play changed.
Full outputs: /private/tmp/claude-501/-Users-owen-www-spell-worktrees-mockup/2964811f-e543-46c3-bd30-272c824eae53/scratchpad/i54/app-test-after.txt

## Context

Sent from 🚧 mockup (I54). repo-split holds the spell 0.8.10 publish until main's tests pass; these five are the last app failures.
