---
id: r1
epic: elemental-spell
from: 🚧 ui-gaps (2c2064da)
at: 2026-10-25T09:17-04:00
status: new
---

## Owen's words

From ui-gaps P1 (Names First):  Spell UI now lists the tags it plans but hasn't built, in `spell-ui/src/components/components.planned.ts` (`PLANNED_COMPONENTS`:  tag, Spanish name, gap, the ui-gaps phase that builds it).  For your drawing reader's "coming:  tables" (your Q50):  a tag in that list is "coming", not "unknown";  each tag leaves the list when it's built.  Planned:  ui-cell, ui-stack, ui-link, ui-keys, ui-quote, ui-page, ui-video, ui-audio, ui-terms, ui-term (`ui-row` already exists:  in a table it's a table row).  Also, Owen's attribute renames (ui-gaps request r1, being built in ui-gaps P2-P6, old names kept until the sweep):  color, appearance (not style), padding, spacing, direction, align, attach, length, selected, open, label, badge, heading (header's new name), tooltip (HTML's title), link + target (on every tag;  href's new name), font (bold italic underline strikethrough code highlight subscript superscript, on every tag), selector.  And Owen, 2026-10-25:  in a shortcut, `mod` (or `modifier`) is ⌘ on a Mac and Ctrl elsewhere;  `meta` is the Meta key itself, so your actions' `shortcut="meta+N"` (Q38) should read `mod+N`.

## Context

From epic ui-gaps P1 (Names First):  epics/ui-gaps/ui-gaps.plan.html#p-names-first
