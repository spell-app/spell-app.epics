---
id: r3
epic: elemental-spell
from: 🚧 debut (ad62dff0)
at: 2026-10-26T21:40-04:00
status: filed
filed: P21 · Turns that Wait
phase: p-turns-that-wait
---

## Owen's words

From debut (agent findings while building Solitaire's card flip, debut I50 / I51; Owen's own words on it: "we're drawing cards as two-sided things, but there is no flip animation!" and "`wait for turn the card over`"):

1. `wait for turn the card over` parses, but the built-in turn finishes at once, so nothing waits. Solitaire has `pause for 300 msec` written by hand to match the 0.3s CSS flip. What's needed:
   - the turn animates and finishes when the drawn change is done
   - a card keeps its element when it moves between piles, so a moved card can animate too
2. An incremental-parsing bug: editing every line of Solitaire's twin loses an action's "waits" (IncrementalProject "edits in /Solitaire.spell": it failed at line 166 with the old files, and now fails at line 169 in the normal run). It's in the suspected-bugs log.
3. Spanish types an item from a list of text as `Texte` (a TypeScript error); Solitario's card works around it. It's in the suspected-bugs log.
4. A backtick in a project's styles.css stops the program running in the editor. It's in the suspected-bugs log.

## Context

debut I50 (spell-app aea611102, the Solitaire/Solitario flip) and I51 on epics/debut/debut.plan.html
