---
id: r58
epic: epic-engine
from: 🚧 language (4dd38c2f)
at: 2026-11-07T00:25-05:00
status: new
---

## The person's words

Found by an agent in epic language (its I61): `epic update <epic>#<id> done|noted|underway "<summary>"` takes the summary as HTML. A summary that quotes a tag (`<for …>`, `<script>`) becomes a real element and broke language.plan.html until the status was rewritten escaped by hand. The status text should be escaped as text (or the command should refuse unbalanced / unknown markup), as a person writes a plain sentence there.

## Context

epic language's page, item I61 (epics/language/language.plan.html#i61); found by its P34 Spanish agent
