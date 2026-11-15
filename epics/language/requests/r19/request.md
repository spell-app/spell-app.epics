---
id: r19
epic: language
from: 🚧 editor (5de24f81)
at: 2026-11-15T14:10-05:00
status: filed
filed: Fixed directly in the session (commit a9185de54):  the shapes layer is clipped at the text's left edge while scrolled sideways
images: image-1.png
---

## The person's words

Also, horizontal scrolling does wierd things to the bubbles

## Context

From epic editor, Owen in the editor (test.spell.app) on @spell/examples/Solitaire's Solitaire.spell, bubbly look on, scrolled sideways: the text is cut at the code's left edge (Monaco contentLeft, 26px), but the bubbly shapes layer (SpellBubbly, epic language P50) keeps drawing into the folding gutter, so the pills stick out past the text's edge.
