---
id: r14
epic: language
from: 🚧 notebook (88dd5402)
at: 2026-11-09T10:18-05:00
status: new
---

## The person's words

send to language epic as a new phase

(About this limit, from epic notebook's I1, on which Owen wrote that:  a lock's value without quotes doesn't parse.
`su candado es bloqueado` says No entiendo "bloqueado";  `its lock is locked` says Don't understand "locked".)

## Context

From epic notebook's I1 (epics/notebook/notebook.plan.html#i1), checked on main 2026-11-09. A line giving a page's lock a value parses only with quotes: su candado es "bloqueado" compiles to get lock() { return "locked" }. Without quotes it's a parse error in both languages, though su dirección es abajo works unquoted on a two sided view (direction's values are bare words there). Tests of the quoted form: parser/tests/spell/SpellxPage.test.ts, 'a default on an inherited member, in Spanish'.
