# `<ui-tree>` enhancements:  the requests from epic `netlists`

Written for:  the agent of the epic that takes these up, coming to it cold.

## Background

Epic `netlists` (its page:  `~/psi/qos/epics/epics/netlists/netlists.plan.html`) needed a fast way to browse an Apollo
netlist:  a recursive tree of components, 4-8 levels deep, up to a few hundred children and ports per level
(the sample, `~/Downloads/av1p0.r005.netlist.json`:  7,715 nodes, 41,183 ports).  It added a column mode to Spell UI's
`<ui-tree>` and a subclass of it in the Netlists project.  What's below is what's built, and what Owen asked for that
isn't yet.

## Where things are

- Spell kit worktree `~/psi/spell.worktrees/netlists`, branch `netlists`, not pushed:
  - f651171e8 `netlists P4:  Tree Columns`:  `<ui-tree mode="columns">`
  - 63f36b885 `netlists P6:  Viewer Polish`:  the `rowClass(item)` hook
  - 816086995:  `TreeItemData` named for the JSX types (`UIT.TreeItemData`), so `yarn site:data` runs
  - code:  `ui/src/components/ui-tree/` (`UITree.tsx`, `UITree.types.ts`, `UITree.en.ts`, `UITree.es.ts`, `UITree.css`);
    docs:  `ui/docs/ui-tree.html` ("Columns", "Columns from data")
- The subclass, `<netlist-columns>`:  `~/psi/qos/epics/spaces/@psiquantum/jarvis/netlists/viewer/NetlistColumns.ts`, `.css`
  - always `mode="columns"`;  overrides `rowClass` (node kind, port direction, port kind);  its look in
    `--netlist-columns-*` tokens
- The page using it:  the Netlist Viewer, `.../netlists/viewer/index.html`.  Run it:

  ```sh
  cd ~/psi/spell.worktrees/netlists
  NODE_PATH=$PWD/node_modules npx tsx ~/psi/qos/epics/spaces/@psiquantum/jarvis/netlists/viewer/serve.mts
  ```

  It opens the sample netlist at once, at the URL it prints (port 5391, or the next free one).

## Built already (on branch `netlists`)

- `mode="columns"` (Spanish `modo="columnas"`):  Miller columns, like Finder's column view.
  - A column per level;  the picked path grey, the last pick in the selection colour;  the box scrolls sideways to keep
    the newest column in view.
- `items` property:  `[{ id, label, icon?, which?, count?, children?: Item[] | () => Item[], data? }]` (`TreeItemData`).
  - A `children` function runs once, on first open, its list kept;  only the open path's columns are drawn.
  - Without `items`, columns come from the `<ui-tree-item>` children.
- `path` property:  the ids from the top to the selected item;  set it, or read it as the person picks.
- `counts`:  a count badge on rows with children.
- Keys:  up / down in a column, Home / End, right enters the child column, left goes back, Enter / Space select;
  one tab stop.
- Events:  `ui-selecting` (cancelable) and `ui-changed`, their detail now with `item` and `path`.
- `filter`:  filters ONE column, the last one on screen when the filter starts, until cleared (filtering whichever
  column is last made rows jump).
- `rowClass(item)`:  a method a subclass overrides;  its class names go on that row (`.column-row`, in the shadow
  root) for the subclass's own sheet.  Not extra `part` names:  parts are named in the vocabulary, and translated.
- Tokens:  `--ui-tree-column-width` (15em), `--ui-tree-columns-height` (18em), `--ui-tree-path-background`;
  parts `columns`, `column`, `column-row`.

## Asked for, not built yet

1. **A breadcrumb above the columns** (epic `netlists` I7, Owen 2026-11-18:  "Breadcrumbs is good, as is the style that
   Spell Editor uses as its sticky header").
   - The path, from the top, each part a link back to that column.
   - Styled like the Spell Editor's sticky header.
   - Why:  when the open path is deeper than the tree is wide, the columns scroll the root column out of view, and
     nothing says where you are.
2. **Early columns collapsing** as the path goes deep (I7, Owen:  "Collapsing behavior is good").
   - The columns left of the last few shrink to a narrow strip (the picked row's name, or an icon), and widen again
     on hover or focus, or when picked from the breadcrumb.
3. **A way to tweak the look from a subclass** (Owen:  "make `<ui-tree mode="columns">` subclass as
   `<netlist-columns>` so we can tweak the look").
   - Works today through `rowClass`, the tokens and a subclass sheet added in `elementSetup`
     (see `NetlistColumns.ts`).  Worth a documented, supported way:  the docs page should show a subclass.
4. **Row windowing** (epic `netlists` T1, a limit).
   - Every row of a column is drawn:  fine at about 400 (a 300-row column opens in about 35ms), not at several thousand.
5. **Resizable columns**, as in Finder's column view (asked 2026-11-18).
   - Today every column has one width, `--ui-tree-column-width` (the viewer measures the longest row and sets it).
   - Drag a column's right edge to resize that column;  Option-drag resizes them all;  double-click fits the column
     to its longest row;  widths remembered.
6. **Outline-mode helpers the existing Jarvis netlist viewer has** (from Owen's screenshot of its side bar):
   - Expand 2 levels, Expand 3 levels, Collapse all
   - a search box over the whole tree, not just one column (today's `filter` is one column)

## Smaller rough edges found while building

- A `children` function always counts as having children:  its row shows a chevron even if it returns nothing.
- Markup rows can exist before their tag is defined;  the tree rebuilds its items once they're ready, at most 5 times:
  works, but a heuristic.
- In column mode, each `<ui-tree-item>` still builds its own hidden shadow DOM:  wasteful for big markup trees
  (data mode is the way for those).
- Arrow keys fire `ui-changed` on every press:  a page doing heavy work per selection should debounce;  maybe the tree
  should offer a settled event.
- No unit tests for column mode beyond `rowClass`'s;  checked with headless Playwright.  Visual baselines not updated.

## Rules

- Spell kit:  read `AGENTS.md`, `ui/AGENTS.md` and `agents/wwod/WWOD.md` first;  Solid 2's rules before any component work.
- Build on branch `netlists` (or a branch off it):  the column mode isn't on `main` yet.
- Keep `<netlist-columns>` working:  it's the first subclass.
