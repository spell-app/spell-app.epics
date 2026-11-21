# `<ui-chart>`:  Plotly and d3, drawn on the server or in the page

Moved here from epic `solid-2-final` on 2026-11-20 (it was its T4).  **Assumed done:**  the shared server drawing
(`SRV.Drawings`, with Mermaid and coloured code on it, and Declarative Shadow DOM kept on upgrade, section 4):  this epic
USES it, and doesn't build it.

Owen's ask:
"I'm going to want a `<ui-chart>` very soon, which should work both with Plotly (possibly drawn on the server) and d3
(same).  Scope out how that might work as part of this wherever it is appropriate."

Agent `solid-2-final-chart`, 2026-11-20.  Read-only research:  no repo file changed, no dependency added.
- Sizes below were MEASURED:  each package's published bundle (`npm pack` into a scratch folder, nothing installed in
  the kit), gzip -9 and brotli 11 with node's `zlib`, in KB.
- The d3, Observable Plot and ECharts subsets were bundled with the kit's own esbuild, minified, from the d3 the kit
  already has (d3 7.9.2, under Mermaid).
- The server trials ran in node 24 against the kit's linkedom 0.18.
- Inferences and estimates are marked (inferred) / (estimated).

## 0. In short

1. **Recommended design:**  ONE element, `<ui-chart>`, that takes a chart as DATA (a spec and rows), in one of a few
   "chart languages" (`engine`):  Observable Plot by default (built on d3), Plotly for Plotly's figures, and a d3
   module of your own.
   - It is drawn by the shared "drawn on the server" mechanism Mermaid and coloured code already use (section 4, assumed done):
     a drawing is SVG text, kept by a hash of what made it, put in the page in the element's Declarative Shadow DOM.
   - The library loads in the page only when the chart must be live:  the editor, live data, zoom.
2. **Bytes:**  a page with one Plotly chart saves **325-1,092 KB brotli** when it's drawn on the server
   (the chart is ~3-15 KB of SVG instead, estimated).
   A d3 or Plot chart saves only **21-80 KB brotli**:  for those, drawing on the server buys first paint and no-JS
   pages, not bytes.
3. **Plotly can't draw in node:**  it needs a real browser (it failed at load under linkedom, section 1.2).
   d3, Plot, ECharts and Vega all drew SVG in node with no browser.
4. **Hover needs no library:**  the server's SVG carries each mark's row number, and Spell UI's own small layer shows
   the tooltip, moves by keyboard and fires events (section 3, mode b).
   Only zoom, pan and redrawing need the library.

## 1. The libraries

### 1.1 Sizes and fit

| Library | Licence | Bundle | Raw | Gzip | Brotli | Draws on the server | Interactive | Accessibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Plotly.js 4.3.0, full (`plotly.js-dist-min`) | MIT | `plotly.min.js` | 4,729 | 1,457 | **1,092** | **only in a browser** (headless Chromium, or Python's Kaleido, which drives Chrome) | hover, zoom, pan, legend toggles, built in | weak:  no table fallback, little keyboard (inferred from its docs) |
| Plotly.js, `basic` partial bundle (scatter, bar, pie) | MIT | `plotly-basic.min.js` | 1,176 | 393 | **325** | as above | as above | as above |
| Plotly.js, `cartesian` partial bundle (+ box, heatmap, histograms, contour ...) | MIT | `plotly-cartesian.min.js` | 1,481 | 495 | **405** | as above | as above | as above |
| d3 7.9.2, whole | ISC | `d3.min.js` | 274 | 91 | 76 | **yes**, any DOM:  linkedom | what you write | what you write |
| d3, a line or bar chart's modules (selection, scale, shape, axis, array) | ISC | esbuild subset | 68 | 24 | **21** | yes, linkedom | -- | -- |
| d3, scales and shapes only (no DOM:  path strings) | ISC | esbuild subset | 48 | 18 | 15 | yes, no DOM at all | -- | -- |
| d3, plus zoom, brush, transition | ISC | esbuild subset | 103 | 35 | 30 | yes | zoom, brush | -- |
| Observable Plot 0.6.19 (with the d3 it needs) | ISC | esbuild, `plot` + 4 marks | 275 | 94 | **80** | **yes**:  `Plot.plot({ document })` on linkedom | tooltips (`tip`), pointer;  no zoom | `ariaLabel` / `ariaDescription` per chart and mark;  SVG text, so readable |
| Vega 6.4 + Vega-Lite 6.5 + vega-embed 7.4 | BSD-3 | three `.min.js` | 821 | 277 | **237** | **yes**:  `view.toSVG()` in node;  `vl-convert` in Python / Rust / a CLI, with no browser and no node | selections, tooltips, zoom | ARIA on marks, `description` |
| ECharts 6.1, full | Apache-2.0 | `echarts.min.js` | 1,096 | 360 | 292 | **yes**:  `ssr: true` + `renderToSVGString()`, no DOM | rich | `aria` option, generated descriptions |
| ECharts, line + bar + grid + tooltip + SVG renderer | Apache-2.0 | esbuild subset | 534 | 184 | 156 | yes | rich | as above |
| ECharts' SSR client (hover / click on a server SVG) | Apache-2.0 | `echarts/ssr/client` | 4 | 1 | **1** | -- | click, hover events;  no tooltips | -- |
| uPlot 1.6.32 | MIT | `uPlot.iife.min.js` | 50 | 22 | 19 | **no**:  canvas only | fast zoom, cursor, 100k+ points | canvas:  none of its own |
| Chart.js 4.6.1 | MIT | `chart.umd.min.js` | 205 | 69 | 60 | **no**:  canvas only | hover, legend | canvas:  none of its own |

For scale (epic research `perf-bundle.md`):  Mermaid's lazy chunk is 1,186 KB brotli, Solid itself 35.

### 1.2 What drew on the server, in node (trials)

| Library | How | Result |
| --- | --- | --- |
| d3 (the kit's 7.9.2) | `d3.select(document.body)` on a linkedom document, a line and two axes | **drew**:  2,998 bytes of SVG |
| Observable Plot | `Plot.plot({ document, marks: [Plot.lineY(...), Plot.ruleY([0])] })`, linkedom's `document` | **drew**:  2,210 bytes |
| ECharts | `echarts.init(null, null, { renderer: "svg", ssr: true, width, height })`, `renderToSVGString()` | **drew**:  4,241 bytes, no DOM at all;  needs `animation: false` and `dispose()`, or its timer keeps node running |
| Plotly.js (basic bundle) | loaded beside a linkedom `window` / `document` | **failed at load**:  "DOMParser is not defined";  it measures text in a real layout engine (inferred, as Mermaid does), so filling in globals one at a time is a dead end |

- Plotly's own server route is Kaleido 1.x (Python), which since 1.0 "doesn't bundle Chrome":  it needs Chrome or
  Chromium installed, and writes PNG, JPEG, WebP, SVG and PDF;  `write_images()` does many at once
  ([plotly.com/python/static-image-export](https://plotly.com/python/static-image-export/)).
- So Plotly on the server means a headless browser either way:  the kit already has one, `BrowserPage`
  (`spell/element-tools/BrowserPage`, Playwright 1.63;  [the catalog](../../../../../spell.worktrees/solid-2-final/agents/coherence/catalog.md),
  "A headless page check"), used by the README pictures tool (`tools/readme-pictures.ts`).
- ECharts' server drawing ([its handbook](https://echarts.apache.org/handbook/en/how-to/cross-platform/server/)):
  animations become CSS;  the size is fixed;  "the client must request a new SVG from the server" for legend toggles
  and data changes;  its 1 KB client gives click / hover events but no tooltips on mouse move.
- Vega-Lite's `vl-convert` "embeds the official Vega and Vega-Lite JavaScript libraries, so conversions do not
  require a browser or Node.js" ([github.com/vega/vl-convert](https://github.com/vega/vl-convert)):  the one engine
  a Python server can draw with no Chrome.

### 1.3 Which to build on

- **Observable Plot as the default chart language** (recommended):
  - made for static SVG, draws on linkedom, 80 KB brotli in the page, ISC like d3, and it IS d3 underneath:
    so "d3" is covered twice, as Plot's specs and as a d3 module of your own (section 2.1).
  - its specs are small objects (`{ marks: [{ type: "lineY", data, x, y }] }`) that serialize to JSON with one rule:
    marks named, not called (section 2.2).
- **Plotly for Plotly's figures:**  the same JSON in Python (`fig.to_json()`) and in Plotly.js, so a Quart app and a
  page share one spec;  but 325-1,092 KB brotli in the page, and a browser to draw on the server.
- **Named, not built in:**
  - Vega-Lite:  the strongest Python story (Altair writes it;  `vl-convert` draws it with no browser);
    worth a third `engine` later.
  - ECharts:  the best "server SVG + tiny client" story, but 156-292 KB brotli to go fully live, and a third spec
    language.
  - uPlot:  for 100k-point live time series in the editor;  canvas, so never on the server.
  - Chart.js:  canvas only;  no.

## 2. The element

### 2.1 Markup

```html
<!-- Plot, the default:  the spec as JSON, the rows from a source -->
<ui-chart source="sales.csv" label="Sales by month" description="Sales rose every month but March.">
  <script type="application/json">
    { "marks": [{ "type": "barY", "x": "month", "y": "sales" }], "y": { "grid": true } }
  </script>
</ui-chart>

<!-- Plotly:  a figure as Python's fig.to_json() writes it -->
<ui-chart engine="plotly" label="Temperature">
  <script type="application/json">{ "data": [{ "type": "scatter", "y": [3, 7, 4] }], "layout": {} }</script>
</ui-chart>

<!-- d3:  your own module, which gets the rows and the size and returns an <svg> -->
<ui-chart engine="d3" draw="./charts/sunburst.ts" source="tree.json" label="Disk use"></ui-chart>
```

- Like `<ui-mermaid-diagram>`'s `<script type="text/mermaid">`, the spec sits in a script, so `<` and `&` stay exact.
- A d3 module exports ONE function, `draw({ data, width, height, document, theme }) => SVGSVGElement`:
  given `document` (linkedom's on the server, the page's in the browser), it runs in both places unchanged.

### 2.2 Attributes and properties

| Attribute | Property | What | Default |
| --- | --- | --- | --- |
| `engine` | `engine` | `plot`, `plotly`, `d3` (open list:  `vega-lite` later) | `plot` |
| -- | `spec` | the spec as an object;  else the script's JSON, else `source`'s | -- |
| `source` | `source` | rows from a file or URL, as `LoadableComponent` loads them (CSV, JSON) | -- |
| -- | `data` | rows as an array, from script or a Spell program;  a place's list (reactive) | -- |
| `draw` | `draw` | `engine="d3"`:  the module that draws | -- |
| `width`, `height` | same | the size it's drawn at;  the SVG scales by its `viewBox` | `640` × `400` (Plot's) |
| `label` | `label` | the chart's title for screen readers (and shown, with `titled`) | required:  a warning without it |
| `description` | `description` | one or two sentences of what it shows | -- |
| `scheme` | `scheme` | `light`, `dark`, `auto` | `auto` (the page's) |
| `live` | `live` | `hover` (default:  Spell UI's layer), `full` (load the library at once), `none` | `hover` |
| `table` | `table` | show the data as a `<ui-table>` under a "Show the data" fold | on |

- Plot's marks are functions (`Plot.barY(data, options)`), so the JSON names them:  `{ "type": "barY", ...options }`,
  turned into calls by the element's Plot engine (estimated ~1 KB).
  - A function option (a `channel` as `d => d.x * 2`) can't be JSON:  a spec that needs one is a d3 / Plot module
    (`draw`) instead.
- Read-only script API, as Mermaid's:  `svg` (the drawing as text), `error`.

### 2.3 Data in, and live updates

- Rows come from ONE of:  the spec itself, `source` (the element's own loading, `LoadableComponent`, as Mermaid's),
  `data` (a property, set by script or a Spell program).
- From a place (`spell/places`):  `data` is a place's list, so a change to a row redraws
  (one redraw per update, `Queued` with `afterSolidUpdate`;  the catalog's "Once, however often asked").
- Streaming rows:  a list as a stream of pages (`ListAnswer.nextPage`, delivered as NDJSON:  research
  `data-paradigm.md`) appends;  Plotly has `extendTraces()`, Plot redraws whole (fine under ~10k points, estimated).
- A chart with live data is mode (c), drawn in the page (section 3).

### 2.4 Events

- `ui-chart-hover`:  `detail: { row, series, index }`, or no `row` when the pointer leaves.
- `ui-chart-select`:  a click, Enter or Space on a mark;  same `detail`.
- Names to settle against Spell UI's event words (`ui-changed`, `ui-file-dragged-over`):  a proposal.

### 2.5 Light and dark, through Spell UI's tokens

- The server can't read the page's tokens, so a drawing must not bake colours in.
- The ONE pass (recommended, inferred to work for every engine):
  1. draw with a fixed "sentinel" palette:  series 1-10, ink, grid, background, each a colour no chart would use
  2. rewrite each sentinel, in `fill` / `stroke` attributes and `style`, as `style="fill: var(--ui-chart-series-1)"`
     - a `style` attribute takes `var()`;  SVG's presentation attributes (`fill="..."`) don't (inferred from the CSS
       spec:  check in a browser before relying on it)
- Then the drawing follows the page:  light / dark and an edited theme change it with no redraw, and the cache key
  drops the scheme (section 3.4).
- Its tokens:  `--ui-chart-series-1` ... `-10` (from Spell UI's palette), `--ui-chart-ink`, `--ui-chart-grid`,
  `--ui-chart-background`, set in its own sheet, restyled through parts (`part="drawing"`, `part="table"`), as the
  lint guard asks.
- Mermaid could take the same pass, so its server SVG follows the page too.

### 2.6 Vocabulary

- English `UIChart.en.ts`;  Spanish `UIChart.es.ts`:  `<es-grafico>` ("gráfico", ASCII as tags must be),
  attributes `motor`, `fuente`, `datos`, `ancho`, `alto`, `etiqueta`, `descripcion`, `esquema`, `vivo`, `tabla`.
- **A clash to settle:**  `<ui-mermaid-diagram>`'s Spanish `aka` list has "gráfico" ([its es file](../../../../../spell.worktrees/solid-2-final/ui/src/components/ui-mermaid-diagram/UIMermaidDiagram.es.ts)):
  it would move to the chart.

### 2.7 Accessibility

- `role="img"` on the drawing, named by `label`, described by `description` (`aria-labelledby` / `aria-describedby`
  over the SVG's own `<title>` / `<desc>`).
- The data as a `<ui-table>` under a fold, "Show the data" (`table`, on by default):  the real fallback, for screen
  readers and for copying.
- Keyboard (Spell UI's layer, mode b):  Tab into the chart, arrow keys from mark to mark in row order (Spell UI's
  "Arrow keys through a list", in the catalog), each announced through a live region:  "March:  1,240".
- Plotly and ECharts' own keyboard support is thin (inferred):  the layer is the same for every engine.

### 2.8 States

- Loading:  `:state(pending)` while rows or the engine load, the element's size held so nothing jumps;
  a server-drawn chart is never pending.
- Empty:  rows loaded, none there:  "No data to show yet." (novice voice;  `spell voice check` before it ships).
- Bad spec:  as Mermaid does:  the message says what's wrong, over the last good drawing, dimmed
  (a `SourceError` with kind `render`).
- An engine that can't load (offline, first visit):  the server's SVG stays, the table stays, only "live" is lost.

## 3. The three ways it draws

### 3.1 When each applies

| Mode | What | Where | Library in the page |
| --- | --- | --- | --- |
| (a) server SVG only | the page server, the static build or the Quart app draws it;  the SVG arrives in the element's Declarative Shadow DOM | docs, epic pages, READMEs, a static export, a shared link | none |
| (b) server SVG, then live on first touch | (a), plus Spell UI's hover layer (tooltips, keyboard, events) at once;  the library only on zoom, pan, or a data change | the default for every page with charts | none, until zoom / pan / redraw |
| (c) in the page | the library draws from the start | the editor, live data from a place, charts that change as you type | the engine's chunk, lazy, as Mermaid's is |

- Mode (b)'s hover layer works because the server writes each mark's row on it (`data-row="3"`, from Plot's
  `channels` / Plotly's point numbers;  inferred), and the element has the rows:  no library needed to say what's
  under the pointer.  Estimated 3-5 KB brotli, in Spell UI's chart chunk.
- Mode (c) can still start from a server SVG for its first paint, then hand over.

### 3.2 What a page downloads (one chart)

| | (a) server | (b) server, then live | (c) in the page |
| --- | --- | --- | --- |
| One Plotly chart | the SVG, ~3-15 KB brotli (estimated) | + the layer, ~3-5 KB;  on zoom:  325 (basic) to 1,092 (full) | 325-1,092 KB + the element |
| One Plot chart | the SVG, ~1-5 KB (estimated) | + the layer;  on redraw:  80 | 80 KB + the element |
| One d3 chart (your module) | the SVG | + the layer;  on redraw:  21-30 + your module | 21-30 KB + your module |
| `<ui-chart>` itself | its definition, a few KB (estimated) | the same | the same |

- The measured SVGs:  d3's line chart 3.0 KB raw, Plot's 2.2 KB, ECharts' 4.2 KB, before compression.
  Plotly's SVG is larger, every point a `<path>` with inline styles (estimated 10-50 KB raw for a few hundred
  points, a few KB brotli).
- On a 2-year-old Android phone over 5G, the Plotly row is the one that matters:  the full bundle is about the size of
  Mermaid's chunk, and parsing it costs more than fetching it (inferred, as `perf-bundle.md` found for Mermaid).

### 3.3 Who draws on the server

- d3, Plot (and later Vega, ECharts):  IN the page server's own process, on linkedom:  milliseconds each (estimated).
- Plotly, Mermaid:  a headless Chromium, ONE kept running and reused (`BrowserPage`), each drawing a page with the
  engine's chunk loaded once:  ~50-300 ms each when warm (estimated), cached after.
- The Quart app (Python):
  - Plotly figures:  Kaleido (Chrome on the server), or ship the spec and let the page draw (mode c), or ask a page
    server to draw it (the route below), if one runs beside it.
  - Vega-Lite:  `vl-convert`, no browser:  a reason to add that engine later.

### 3.4 Caching and offline

- Key:  a hash of the engine and its version, the spec, the rows (a hash of their content:  `contentVersion()`,
  `spell/server/places`), the size and the language (numbers and dates are written in it).
  - NOT the scheme or theme:  the drawing uses the tokens (section 2.5).
- Kept in `DiskCache` (`spell/server`), as the compile cache is:  a version per engine version, capped, least used
  dropped first.
- Offline:  the page server is on the machine, so a cached drawing is there;  a page saved whole keeps its SVG in it;
  a static build writes the SVGs into the HTML.
- A chart in the editor (mode c) draws in the page, so it works offline once its chunk was loaded.

## 4. What it uses:  the shared server drawing (assumed done)

Mermaid, coloured code and charts are the same job:  text in, SVG or HTML out, kept by hash, put in the page before JS.
Epic `solid-2-final` builds that mechanism (proposed name `SRV.Drawings`, `spell/server`);  this epic assumes it exists:
- **Drawers**, one per kind, each a small adapter, each saying where it runs and its version (for the cache):
  `inProcess` (linkedom) or `headless` (one shared `BrowserPage`).
  - This epic ADDS three:  `chart:plot` (in process), `chart:plotly` (headless), `chart:d3` (in process).
- **One route**, `POST /api/draw/<kind>`, answering the drawing.
- **One cache**, a `DiskCache` with a folder per drawer.
- **One way into the page:**  the static render and the page server ask `Drawings` while rendering and write the result
  into each element's `<template shadowrootmode="open">`.
  - Declarative Shadow DOM is KEPT on upgrade:  the element, upgrading, sees a drawing already there for its key and
    keeps it.
- **One colour pass** (section 2.5), if the shared mechanism doesn't have it yet, is part of the chart's work.
- Still to check at the start of this epic:  that the colour pass and the hover layer's `data-row` marks fit what
  `Drawings` writes.

## 5. How a Spell program would ask for a chart

ALL of this is a PROPOSAL:  no phrase is built without Owen's OK on each, with its ambiguity shown.

```text
show sales as a bar chart of total by month
show temperatures as a line chart of degrees over time
show votes as a pie chart of count by party
```

- Reads:  `show <list> as a <kind> chart of <value> by <group>`, or `over <field>` for a line's x axis.
- It would compile to `<ui-chart>` with a Plot spec, the list as its `data`:  a place's list stays live.

Ambiguities:
1. **"by" means two things:**  "total by month" groups (a bar per month);  "sales by Owen" reads as who made them.
   - Fix:  `by` only after `of <value>`, and the group must be a field of the list's things;  else a "Did you mean"
     error.
2. **"of" is overloaded:**  "a chart of sales" (the list) vs "a bar chart of total" (the value).
   - Fix:  the list is always after `show`, never after `of`.
3. **"total" — a field, or a sum?**  `total by month` could mean the field `total`, or "add up per month".
   - Fix:  a field's name wins;  summing is spelled out, `the sum of price by month`, and that is a second phrase to
     agree on.
4. **"over time":**  `over` reads as "more than" elsewhere (`if price is over 10`).
   - Fix:  `over <field>` only inside `as a ... chart of ...`;  or use `across <field>`.
- A Plotly figure from Python is not a Spell phrase:  it arrives as data (`engine="plotly"`).

## 6. Effort, risks, dependencies, questions

### 6.1 Effort (estimated)

| Part | Size |
| --- | --- |
| The chart drawers on the shared server drawing (Plot, d3, Plotly) | S-M |
| `<ui-chart>` with Plot (modes a-c), vocabulary en / es, tokens, table fallback, docs page | M |
| The hover / keyboard layer (mode b) | S-M |
| The Plotly engine, and its headless drawer | S-M |
| The d3 module engine (`draw`) | S |
| The Spell phrase (after Owen's OK) | M:  grammar en + es, compile to the element |

### 6.2 Risks

1. **A headless browser in the page server** (the shared mechanism's, for Mermaid too):  memory (~100-200 MB per Chromium, estimated) and a start-up of a
   second or two;  Playwright is a dev dependency today.  Start it on the first drawing, close it when idle.
2. **Server text vs page text:**  Plot measures text with a fixed estimate, so a label drawn on the server can sit a
   little differently from one in the page's font (inferred).
3. **Fixed size:**  a server SVG scales by `viewBox`, text and all;  a narrow phone shrinks the labels.
   Drawing at two widths and picking with CSS doubles the bytes;  redrawing in the page loads the library.
4. **Plotly's weight:**  any page that goes fully live with Plotly pays 325-1,092 KB brotli;  the hover layer exists
   so most never do.
5. **The colour pass** relies on `var()` in `style` attributes and on every engine passing a sentinel colour through
   untouched:  check per engine (inferred).

### 6.3 Dependencies for Owen to OK (WWOD §2, "Ask before adding a dependency")

1. `@observablehq/plot` (ISC):  a lazy chunk in the page, and the server's in-process drawer.
2. `d3` and its modules as DIRECT dependencies (ISC):  in the install today only under Mermaid.
3. `plotly.js` (MIT):  a partial bundle (`basic` or `cartesian`) or the full one, lazy;  or built from `plotly.js`
   with only the traces wanted.
4. Playwright at run time for the page server's headless drawers:  an `optionalPeers` entry
   (`"spellPublish": { "optionalPeers" }`), so `npx spell` stays lean.
- Later, not now:  `vega-lite` / `vl-convert`, `echarts`.

### 6.4 Open questions for Owen

1. **The default chart language** (what a spec is written in when `engine` is left out):
   - a. Observable Plot:  d3 underneath, draws in node, 80 KB brotli **(recommended)**
   - b. Plotly:  the same JSON as Python, but needs a browser to draw and 325+ KB in the page
   - c. Vega-Lite:  the best Python story (Altair, `vl-convert`), 237 KB in the page
   - d. no default:  `engine` required
2. **Plotly on the server:**
   - a. the page server's one headless Chromium (`BrowserPage`), cached by hash **(recommended)**
   - b. never on the server:  Plotly charts always draw in the page, lazily
   - c. Python's Kaleido, for the Quart app only
3. **Hover on a server-drawn chart:**
   - a. Spell UI's own layer over the SVG, the library only for zoom / pan / redraw **(recommended)**
   - b. load the library on the first hover or focus
   - c. no hover until the chart is live
## See also

- Epic `solid-2-final`'s `research/perf-bundle.md`:  Mermaid's 1.19-1.56 MB brotli, and every bundle's measurements
- Epic `solid-2-final`'s `research/perf-code.md`, section 5:  "Server instead of browser"
- Epic `solid-2-final`'s `research/web-components-first.md`:  Declarative Shadow DOM, and what keeping it needs
- Epic `solid-2-final`'s `research/data-paradigm.md`:  places, streaming pages of rows, the Python target on Quart
- `<ui-mermaid-diagram>`:  `ui/src/components/ui-mermaid-diagram/` (`MermaidEngine`, the lazy chunk;  `MermaidDrawer`)
- `MermaidThemes` (`src/util/diagram/MermaidThemes.ts`):  Spell UI tokens to a drawing's colours
- `DiskCache` (`src/server/DiskCache.ts`), `BrowserPage` (`src/element-tools/BrowserPage.ts`),
  `StaticRenderer` (`ui/src/tools/StaticRenderer.ts`)
