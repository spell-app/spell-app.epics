# `<ui-json-viewer>`:  to fold into Spell UI's `<ui-json>`

Written for:  the agent of the Spell epic that takes this in, coming to it cold.

## What it is

Spell UI's `<ui-json>` holds JSON as data but draws nothing.  Epic `netlists` needed to SHOW JSON (a netlist node's own
JSON in a side panel), so it made `<ui-json-viewer>`, a subclass of `<ui-json>`, in the Jarvis Netlists project
(`spaces/@psiquantum/jarvis/netlists/ui-json-viewer/`).  The person:  "we'll eventually fold this into `<ui-json>`
itself."

## What's in this bundle

| Path | What |
| --- | --- |
| `files/UIJsonViewer.tsx` | the element (~600 lines):  `class UIJsonViewer extends UIJson` |
| `files/UIJsonViewer.en.ts` | its vocabulary:  `<ui-json>`'s, plus its own attributes, parts, texts |
| `files/UIJsonViewer.css` | its sheet |
| `files/index.ts` | defines the tag;  exports `JSON_NAVIGATE`, `JsonNavigateDetail` |
| `files/ui-json-viewer.html`, `.demo.ts` | the demo:  depths 1, 3 (editable) and 0, a 387-member object;  `?theme=matrix&scheme=dark` |

## The API (on top of `<ui-json>`'s:  `source`, `load`, its text as JSON, `content`, `ui-changed`)

- `value` (DOM property):  any JSON value, held as given.
- `depth` (default 1:  the top level open;  0:  all closed).
- A collapsible outline, 2 spaces a level;  toggles in ONE left gutter, chevrons (`chevron-right` / `chevron-down`),
  real buttons with `aria-expanded`;  Alt-click opens or closes a whole branch.
- Closed lines:  `[ 1, 2, 3, ... ]`, `{ "a": 1, ... }`, cut to the width the element has (measured);  no count.
- Big objects draw their members only when opened (387 members open in about 200ms).
- Header (part `header`;  `no-header` hides it):  Copy (`clipboard`:  copies `JSON.stringify(value, null, 2)`, shows
  `check`), and a quotes toggle (`quote-left`;  `quotes`, on by default;  off shows keys JSON5-style, `type: "x"`).
  Copy is always real JSON.
- `ui-json-navigate` (bubbles, composed, cancelable):  `{ path, key, value, part: 'key' | 'value' }` on a click on a
  key or value;  the page decides what it means (Jarvis jumps its tree to a node the value names).
- `editable`:  double-click a key or a simple value to edit it in place;  Enter / blur keeps, Escape drops;  read as
  JSON, else a string;  `value` updates immutably, `ui-changed` fires.
- Methods `copy()`, `setQuotes(on)`.  Parts `viewer`, `row`, `toggle`, `preview`, `header`, `editor`.
- Colours from the theme's `--ui-code-*` tokens (key, string, number, keyword);  `--ui-json-viewer-*` overrides.

## Folding it in

- Simplest:  move the drawing into `<ui-json>` behind an attribute (`view` / `display`), the subclass's members
  becoming `<ui-json>`'s;  or bring the subclass into the kit as `ui/src/components/ui-json/UIJsonViewer.tsx`.
- Then a docs page (from the demo), Spanish names (`.es.ts`:  none yet), tests (none yet), `yarn site:data`.

## Known rough edges

- With `editable`, a double-click's first click also sends one `ui-json-navigate`.
- When even a closed line's first member doesn't fit, it ends in a CSS ellipsis.
- No arrow-key moves between rows;  each toggle is a Tab stop.
- Not type-checked in its Jarvis home (tsc can't resolve `spell/ui` from the project).

## See also

- The epic page:  `~/psi/qos/epics/epics/netlists/netlists.plan.html` (P9, P10;  J28-J31, J34, J35).
