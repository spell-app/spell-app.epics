---
id: r1
epic: ui-gaps
from: 🚧 debut (ad62dff0)
at: 2026-10-25T03:17-04:00
status: new
---

## Owen's words

Owen (2026-10-25, in debut):  "yes, good.  Go with this.  Apply the groupings now, send the rename instructions to `ui-gaps`"

The rename instructions, as Owen decided them in debut's spreadsheet (spell.epics/epics/debut/spell-ui-attributes.xlsx:  tabs Concepts and Check, and column F of By tag).  Rename Spell UI's attributes as below, keep the old names working as aliases for a while (ask Owen how long), and update docs pages, examples and the vocabularies as needed.

AGREED CONCEPTS (old name -> new attribute = value):
1. Colour:  primary, secondary, positive, negative -> color="primary|secondary|positive|negative" (every tag that has them also has color).
2. Style:  basic, tertiary, circular, raised, tinted, rounded, bordered, borderless, dashed, piled, stacked, striped, transparent, outline, simple, minimal, styled -> style="<that word>" (each tag offers only the values it supports);  the old `link` switch (looks clickable) -> style="link".
3. Padding:  compact -> padding="compact", unpadded -> padding="none", padded -> padding="md", fitted -> padding="none";  scale none|xs|sm|md|lg|compact.
4. Spacing (room BETWEEN items):  spaced -> spacing="md", relaxed -> spacing="lg".
5. Direction:  vertical, horizontal, upward (-> up), reversed -> direction="...".
6. Placement:  centered -> align="center", right-aligned -> align="right", aligned and text-align -> align="<value>";  attached -> attach="<value>";  floated -> REMOVE (slots place things instead).
7. Length:  short, very-short, long, very-long -> length="...".
8. Chosen:  active -> selected.
9. Open:  ditch collapsed (collapsed -> open, inverted).
10. Words:  text (when it's text) and content (button, popup) -> label.  BUT the button's current `label` is a joined badge -> rename it badge.  modal / flyout `content` is a body block:  keep it.
11. Title:  header -> title.  Owen:  "HTML title => tooltip, global-ish attribute".
12. Link:  href -> link;  `target` goes with link (Owen:  "GLOBAL: link").
13. Plain names (Owen's "Becomes" column;  most kept as they are):  wrapped -> wrap;  unclipped -> clip="none";  unlimited -> limit="none";  animated -> PROPOSED reveal="slide|fade|vertical" (the button's hover icon reveal;  `animation`, on every tag, is show / hide motion, so animated can't become animation).  labeled and structured:  no name yet, ask Owen.
14. Advanced:  page-styles -> DITCH, branded-ui -> DITCH, persist -> persistent;  the rest (debug, sanitized, client-sort, error-focus, prevent-leaving, lazy, pure, internal, history, interrupt, allow-repeats, select-first-result, ignore-diacritics, highlight-matches, show-no-results) stay, in the "advanced" group.

OWEN'S OTHER RENAMES (everywhere):
- select -> part
- aria-label -> label
- <ui-breadcrumb> -> <ui-breadcrumbs>;  <ui-breadcrumb-section> -> <ui-breadcrumb>
- ui-avatar alt:  remove, use tooltip
- ui-button type:  DITCH
- ui-buttons primary / secondary:  same as color

NAME vs ID (decided:  debut Q19, its todo C26):  name = what a value is called (form field, property, a thing's name);  id = finds one element, never a data key;  layout tags take name="T1" (id an alias);  forms flag a field with no name instead of falling back to id.

STILL OPEN (ask Owen):  `source` means different things (where content loads from, vs a component pack's link);  `type` (a field's kind vs an item's kind);  `speed` (the loader's spin vs progress's fill);  fold <ui-panel> into <ui-section style="panel">?

Already done on debut (merged into main):  every vocabulary attribute has `group` (name, content, appearance, layout, states, form, link, behaviour, advanced:  AttributeSpec.group, E.ATTRIBUTE_GROUPS), and the editor's Inspector shows a folding section per group.  A renamed attribute keeps its group.

## Context

From epic debut (the editor's Inspector, P13):  Owen's spreadsheet of Spell UI attribute names, spell.epics/epics/debut/spell-ui-attributes.xlsx;  groups already applied on debut
