# `<ui-graph>`:  a generic node / edge graph for Spell UI

Written for:  the agent of the Spell epic that takes this in, coming to it cold.

## What it is

A generic graph element:  nodes with ports, edges between ports, and nodes holding child graphs that open in place, in
a modal, or by drilling in.  Its own layered left-to-right layout (no dependency), pan, zoom, fit, selection.

Epic `netlists` built it in the Spell kit (commit `0deef0643` on branch `netlists`), then, at the person's request,
moved it into the Jarvis Netlists project (`spaces/@psiquantum/jarvis/netlists/ui-graph/`) "for now", where it grew a
`path` and more hooks.  `<jarvis-netlist>` (netlist-specific, stays in Jarvis) subclasses it.  This bundle is the
CURRENT version, to bring back into Spell UI.

## What's in this bundle

| Path | What |
| --- | --- |
| `files/UIGraph.tsx` | the element (~950 lines) |
| `files/GraphLayout.ts` | the layout:  cycle breaking, longest-path layers, dummy points on long edges, barycentre ordering;  recursive for nodes opened in place |
| `files/UIGraph.types.ts` | `GraphData`, `GraphNode`, `GraphPort`, `GraphEdge`, `GraphSelection` ... |
| `files/UIGraph.en.ts`, `.es.ts` | the vocabulary (English, Spanish) |
| `files/UIGraph.css` | its sheet;  `--ui-graph-*` tokens |
| `files/index.ts` | defines the tag (from a project today:  imports are `spell/ui/...`) |
| `files/ui-graph.html`, `ui-graph.demo.ts` | the demo:  a flat graph, one nested graph shown three ways, 150 nodes |
| `kit-registration/0001-...patch` | the original kit commit:  shows every place a component is registered (root `package.json` exports, `ui/src/index.ts`, `ui/vite.config.ts`, `components.es.ts`, `UIRoot.catalog.ts`, `docs/__data/pages.json5`) and the old docs page |

## Bringing it into the kit

1. Copy `files/*` (but the demo) to `ui/src/components/ui-graph/`.
2. Register it as the patch shows (or `git revert 0f3b2341d` on branch `netlists`, which restores the first version,
   then copy the newer files over it).
3. Turn the demo into `ui/docs/ui-graph.html` in the docs site's shape (the patch has the old one).
4. `cd ui && yarn site:data`, `yarn tsc -p tsconfig.json --noEmit`, `yarn site:check ui-graph.html`.
5. Then delete `jarvis/netlists/ui-graph/` and point `jarvis-netlist` at `spell/ui/components/ui-graph`.

## The API

- `graph` (property, or JSON in the attribute):
  `{ nodes: [{ id, label?, kind?, ports?: [{ id, label?, side?, kind? }], children?: GraphData | () => GraphData | Promise<GraphData>, childView?, open?, title?, data? }], edges: [{ id?, from: { node?, port? }, to: { node?, port? }, kind?, label?, data? }] }`
  - An edge end with no `node` is the enclosing node's port (drawn as a pin on the child graph's side).
  - Port side by default:  kind `in`/`input` left, `out`/`output` right, else where most of its edges go.
  - Paths:  nodes `a/b`, ports `a/b:p`, edges `a#e3`:  ids mustn't hold `/`, `:` or `#`.
- `child-view="inline|modal|drill"` (default inline);  a node's own `childView` wins.
- `path` (attribute and property, `a/b`):  the node whose graph is shown, drilled to;  set from outside, and set back
  (with `ui-changed` `{kind: 'path', path}`) by a drill, a breadcrumb or a double-click.
- `selected` (property) `{ kind, id, path }`;  `boundary` (the enclosing node's ports, as pins).
- Methods:  `open(path, view?)`, `close(path)`, `drillTo(path?)`, `fit()`;  read-only `layout`.
- Events:  `ui-selecting` (cancelable), `ui-changed`, `ui-node-toggled`.
- Hooks for subclasses:  `nodeLabel`, `nodeClass`, `renderNode`, `edgeLabel`, `edgeClass`, `portLabel`, `portClass`,
  `metrics`, `trail()` (breadcrumbs), `nodeDoubleClicked()`, `changedDetail()`, `toolButtons()`, `overlay()`,
  `minFitZoom` (default 0).  The modal opens a graph of the same tag, so a subclass keeps its look there.
- Parts `graph`, `canvas`, `node`, `container`, `edge`, `edge-label`, `port`, `pin`, `toggle`, `toolbar`,
  `breadcrumbs` (+ `kind-<kind>`);  states `:state(drilled)`, `:state(panning)`.
- Tokens `--ui-graph-height` (28em), `-background`, `-border-color`, `-radius`, `-node-background`,
  `-node-border-color`, `-container-background`, `-label-color`, `-port-color`, `-edge-color`, `-highlight-color`,
  `-selected-color`, `-font-family`:  from the theme, light and dark.

## Known rough edges

- Fit:  a graph bigger than the view at `minFitZoom` is centred (a change made in Jarvis:  it used to show its top-left).
- `--ui-graph-height` doesn't follow a percentage through the shadow root;  Jarvis sizes it with a size container and
  `100cqh`.  Worth a `fill` mode.
- Keyboard:  only the open / close toggles take focus;  no moving between nodes.
- Back edges loop wide;  edge labels can collide on dense graphs;  text is measured once (not again after a web font).
- No unit tests.  Not type-checked in its Jarvis home (the project can't resolve `spell/ui` for tsc);  it was in the kit.

## See also

- The epic page:  `~/psi/qos/epics/epics/netlists/netlists.plan.html` (P3, P7;  J9-J11, J18, J38, J42, J43;  T2).
