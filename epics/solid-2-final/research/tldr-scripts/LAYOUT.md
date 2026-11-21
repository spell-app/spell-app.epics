# Solid TLDR rebuild:  the layout Owen asked for (2026-11-20)

Waits for epic-engine's compact `<epic-ask>` dropdown (its T121, from request r88).

- Items ranked by recommendation;  sections in the order of their best-ranked item, items in rank order inside, each
  keeping its rank number.
- Each section:  a "Section" line, then ONE three-column table for everything in it, taking the WHOLE browser width
  (not inside the page's container).
  1. Description (the rest of the width):  first line a short title for the feature, at most 5 words;  then the
     1-2 sentences.
  2. Middle, 20% wide:  the Yes / No / Modify / Revisit select, the Priority 1-3 select, the comment box.
  3. Last, at most 25% wide (less is better), one line each:  Read (links), Risk, LOE, Complexity, Depends.
     - Depends as item numbers (`#7 #12`), each with a hover tooltip of that item's full title
       (Spell UI's tooltip, `data-tooltip`:  Owen's standing rule).
- Already-decided whether / when items stay inline at their rank;  only naming / wording decisions go in the folded
  "Decided elsewhere" list.
