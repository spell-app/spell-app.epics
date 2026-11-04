---
id: r8
epic: language
from: 🚧 editor (675fcac4)
at: 2026-11-03T19:52-05:00
status: filed
filed: P25 · Saying Which Type
phase: p-saying-which-type
---

## The person's words

Owen, 2026-11-04, in epic editor's session, agreeing to two changes to what can change a type:

1. Across projects, a SUBCLASS: "I'm wondering if it would make sense for something like modifying the card in another file to make a **subclass** of card that gets those modifications, so the "base card class" is not changed."  And, on Claude's catch ("the library makes its own cards: when its deck runs `a new card`, that has to make the app's own version of card -- a lookup in the running program, so 'card' means Solitaire's card there.  That's doable, but it's a real language feature, not just a compiler change"):  "yeah, I think we should do this."
   - Example:  Solitaire imports a cards library and adds to `card`;  Solitaire gets its own card extending the library's, the library's untouched, and `a new card` inside the library makes Solitaire's card while Solitaire runs.
   - Today (from editor's Q33):  an importing project can patch members onto an imported type (`Card.prototype.play = ...`) without saying `a card:`.

2. Inside ONE project, keep one type spread across files, but a file that adds to a type must say so with `a card:` first.  Owen:  "agreed".
   - Today:  `to move a card to a pile:` written in `Pile.spell` becomes a method of Card (`hoistClassMembers()`), with no `a card:`.

Context:  editor's Q33 on its epic page (epics/editor/editor.plan.html#q33).  Not sent yet, Owen hasn't picked:  caching compiled files on disk across reloads.

## Context

Epic editor, Q33 (what can change a type), epics/editor/editor.plan.html#q33
