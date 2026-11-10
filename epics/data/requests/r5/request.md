---
id: r5
epic: data
from: 🚧 epic-engine (da37dda8)
at: 2026-11-09T19:29-05:00
status: new
---

## The person's words

tell data to fix the recipeBox stuff, ignore it here

## Context

From epic-engine (its I253). app/tests/spell/recipeBox.test.ts fails 18 of 65 on main, run alone, so not load; it failed 4 right after epic-engine P67 (cf020bd2f). One failure read: 'the example RecipeBox, on a folder: only its first lines change' expects a new recipe on top, expected 'Tomato soup' to be 'A shipped stew', line 1431. Likely from data's 'newest first' work on the recipe examples (3ea598072, data P47, T87, T134, T57), not confirmed. The 4 earlier ones: GraphQL 'a recipe has no field "thumbnail"'.
