---
id: r16
epic: language
from: 🚧 editor (5de24f81)
at: 2026-11-14T01:53-05:00
status: new
images: image-1.png
---

## The person's words

errors typing outdented comment

(Owen, in 🚧 editor, typing in Solitaire's Deck.spell.  Reproduced with parseSpellProject on Card.spell + Deck.spell:)
- a comment line ONE tab in, between `its "short name" is` and its body (which is two tabs in), ends the body:  the lines after it error, `13:2 Don't understand "for card in the deck"`, `14:3 Don't understand "add the short name of the card to card names"`.
- the same with `-- its card names, top to bottom` and with `// its card names, top to bottom`.
- `-- ...` two tabs in (in the body) is fine;  a trailing `-- ...` on the head line is fine.
- while typing it, a lone `-` one tab in errors too (`11:1 Don't understand "-"`) and breaks the body the same way.
Wanted:  a comment line never ends or cuts a block, whatever its indent (it belongs to what's around it), so typing one doesn't error the lines below.

## Context

From 🚧 editor:  Deck.spell's 'short name' property (app/spaces/@spell/examples/Solitaire/Deck.spell lines 10-15);  the parser's block reading (Block / BlockLine).
