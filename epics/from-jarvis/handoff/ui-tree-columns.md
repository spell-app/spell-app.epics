# `<ui-tree mode="columns">`:  a column mode for Spell UI's tree

Written for:  the agent of the Spell epic that takes this in, coming to it cold.

## What it is

Epic `netlists` (PsiQuantum's Jarvis work) needed to browse an Apollo netlist:  a tree of components 4-8 levels deep, a
few hundred children per level.  It gave Spell UI's `<ui-tree>` a column mode, like Finder's column view, and a hook
for subclasses to style rows.  Built on the Spell kit's branch `netlists` (worktree `~/psi/spell.worktrees/netlists`,
not pushed);  the patches here are those commits, so this bundle stands alone.

## What's in this bundle

| Path | What |
| --- | --- |
| `patches/1-tree-columns.patch` | `<ui-tree mode="columns">`:  the mode, `items`, `path`, `counts`, keys, column filter, docs examples |
| `patches/2-site-data-TreeItemData.patch` | names `TreeItemData` for the JSX types (`UIT.TreeItemData`) so `yarn site:data` runs.  It ALSO carries generated data for `<ui-graph>` (since taken out of the kit):  keep only its `components.types.ts` and `ElementManifests.ts` hunks, then rerun `yarn site:data` |
| `patches/3-rowClass-hook.patch` | `rowClass(item)`:  a method a subclass overrides;  its classes go on the row |
| `example/NetlistColumns.ts`, `.css` | the first subclass, `<netlist-columns>`:  always columns, rows classed by kind, a `show` attribute picking row parts, chevrons for the triangles |
| `requests.md` | what's built, and what was asked for and isn't yet (breadcrumb, collapsing columns, resizable columns, windowing ...) |

Apply in the kit:  `git am patches/1-tree-columns.patch patches/3-rowClass-hook.patch`, then the two hunks of patch 2 by
hand (or `git apply --include='ui/src/components/components.types.ts' --include='ui/src/tools/ElementManifests.ts'`),
then `cd ui && yarn site:data`.

## The API (built)

- `mode="columns"` (Spanish `modo="columnas"`):  a column per level, the picked path grey, the last pick in the
  selection colour;  scrolls sideways to keep the newest column in view.
- `items` (property):  `[{ id, label, icon?, which?, count?, children?: Item[] | () => Item[], data? }]`
  (`TreeItemData`).  A `children` function runs once, on first open, its list kept;  only the open path is drawn.
  Without `items`, columns come from `<ui-tree-item>` children.
- `path` (property):  the ids from the top to the selected item;  settable.
- `counts`:  a count badge on rows with children.
- Keys:  up / down, Home / End, right enters the child column, left goes back, Enter / Space select.
- Events:  `ui-selecting` (cancelable) and `ui-changed`, their detail with `item` and `path`.
- `filter`:  filters one column, the last one on screen when the filter starts.
- `rowClass(item)`:  a subclass's classes on `.column-row`, for its own sheet (`elementSetup.styleSheets`).
- Tokens `--ui-tree-column-width`, `--ui-tree-columns-height`, `--ui-tree-path-background`;  parts `columns`,
  `column`, `column-row`.

## What the subclass shows the kit could take

`example/NetlistColumns.css` does, from outside, what may belong in `<ui-tree>` itself:
- each column sized to its own rows (`flex: 0 0 auto` with a min and max) instead of one width for all
- the row as a grid, so icon, name, badge, count and chevron line up down a column (subgrid rows)
- a `show` attribute (`icon name kind count chevron`) to pick which parts a row draws
- a chevron (`›`) instead of the filled triangle

## Checks

- The kit's ui-tree tests pass (89 at the last run);  `tsc` on `ui` clean;  docs page examples looked at headless.
- No unit tests for column mode beyond `rowClass`'s;  visual baselines not updated.

## See also

- `requests.md`, beside this file:  the full list of asks still open.
- The epic page:  `~/psi/qos/epics/epics/netlists/netlists.plan.html` (P4, P6;  J7, J8, J15;  I7, T1).
