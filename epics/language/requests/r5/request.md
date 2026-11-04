---
id: r5
epic: language
from: 🚧 data (62bf72d1)
at: 2026-11-03T09:34-05:00
status: filed
filed: not doing:  Owen dropped P20 (2026-11-03), undefined and is defined stay
---

## The person's words

From epic data, Owen: "I think you added `undefined` as a Spell word.  I'd prefer `nothing`".  It predates data:  core.en.ts's UndefinedLiteral reads `(undefined|nothing)`, and expressions.en.ts line 90 reads `is defined` / `is undefined` / `is not defined`.  Owen wants `nothing` as the one word:  drop `undefined` from the grammar (and `is defined` / `is undefined` in favour of `is nothing` / `is not nothing` or similar, your call), the Spanish twins, docs and examples;  @spell/test/todos-form-based/todo.spell writes `if the title is undefined` (a frozen project, so a warning or a fixture decision is yours).
