/**
 * The graph family:  defines `<ui-graph>`, and exports its component.
 * - SIDE EFFECT:  importing it defines the tag, and `<ui-modal>` and `<ui-breadcrumbs>` (what it shows children in).
 * - Lives in the Netlists project for now (epic `netlists`), out of the Spell kit until it moves back;  `ui-graph.html` is its demo page.
 * - `GraphLayout` (the pure layout) is exported too, for a page that wants the numbers alone.
 */

import { GraphLayout } from "./GraphLayout"
import { DOMGraphElement, UIGraph } from "./UIGraph"

import "spell/ui/components/ui-modal"
import "spell/ui/components/ui-breadcrumbs"

UIGraph.define()

export { DOMGraphElement, GraphLayout, UIGraph }
export { GRAPH_METRICS, GraphChildViews, GraphPortSides } from "./UIGraph.types"
export type {
  GraphChildren,
  GraphChildView,
  GraphData,
  GraphEdge,
  GraphEnd,
  GraphLayoutOptions,
  GraphLayoutResult,
  GraphMetrics,
  GraphNode,
  GraphPlacedEdge,
  GraphPlacedNode,
  GraphPlacedPin,
  GraphPlacedPort,
  GraphPoint,
  GraphPort,
  GraphPortSide,
  GraphSelection
} from "./UIGraph.types"
