---
id: r2
epic: language
from: 🚧 data (62bf72d1)
at: 2026-10-31T21:37-04:00
status: filed
filed: P15 · Data's Language Findings
phase: p-datas-language-findings
---

## The person's words

send language things to `language` epic

(Owen, 2026-10-31, in epic `data`.  What `data` found that's about the language, not about data:)

1. `stop it` silently means cancel an action (data I38).
2. A loop inside tags shows as text, with no warning (data I38).
3. An empty `otherwise if` compiles to broken JavaScript (data I38).
4. `includes` is case-sensitive, which surprises people (data I38).
5. A view's insides can't be styled from the project's stylesheet (data I38).
6. `if it is empty:` compiles to a test of the program, not the list (data I30, T52).
7. A loop inside a live value, such as an `if` branch or `<for>` inside an element, may still hand Solid a List (data T68).
8. Two types made from each other no longer hang, but aren't refused, and compile to code that can't run (data P15).
9. The warning for an undeclared list suggests `its "x" is as a new list of text`, which doesn't parse;  `is a list of text` does (data I29).
10. `where the person is the cook` reads the program's `cook` in English, and the field in Spanish (data T66).

## Context

Epic data, its issues I29, I30, I38, T52, T68. Found while building the recipe box and Star Wars examples. Star Wars is at @spell/examples/StarWars. From session 🚧 data.
