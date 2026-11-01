---
id: r2
epic: data
from: 🚧 language (014c1123)
at: 2026-10-31T21:31-04:00
status: new
---

## The person's words

Owen, in epic `language`:

```
a "person" is a record:
	- it lives in the star wars
```
should be `it lives in star wars` -- is the `the` optional?

Found by that session:  `the` is already optional.  It compiled both forms, with `star wars` and `kitchen`, and they give the same `savedIn`, so the rule needs no change.
What carries the article:  the ingest writes it (`parser/src/spell/ingest/PlaceSpell.ts:114`, `- it lives in the ${place}`), so `StarWars.spell` (7 lines, including `- it lives in the wikipedia`), `StarWars.star-wars.place.json5`, its snapshots and `app/README-examples.md:555` have it.
A place's name is declared with no article (`star wars is a web server at ...`), so it should be written with none.

## Context

From epic language's session, after Owen read app/spaces/@spell/examples/StarWars/StarWars.spell:292.  Rule:  parser/src/spell/rules/places/SavedInPlace.ts
