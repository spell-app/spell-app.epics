/**
 * The `<ui-graph>` demo page's script (`ui-graph.html`):  Spell UI and `<ui-root>` from the kit, `<ui-graph>` from
 * this folder, then the examples' data:  a nested graph (one level given, one lazy), and a big generated one.
 */
import "spell/ui"
import "spell/ui/components/ui-root"
import "./index"

type Graph = { nodes: Record<string, unknown>[]; edges: Record<string, unknown>[] }

const cpu = {
  nodes: [
    { id: "fetch", label: "Fetch", ports: [{ id: "pc", label: "pc", kind: "in" }, { id: "op", label: "op", kind: "out" }] },
    {
      id: "alu",
      label: "ALU",
      ports: [{ id: "op", label: "op", kind: "in" }, { id: "r", label: "r", kind: "out" }],
      children: () =>
        new Promise<Graph>((resolve) =>
          setTimeout(
            () =>
              resolve({
                nodes: [
                  { id: "add", label: "Adder", ports: [{ id: "a", kind: "in" }, { id: "s", kind: "out" }] },
                  { id: "shift", label: "Shifter", ports: [{ id: "a", kind: "in" }, { id: "s", kind: "out" }] },
                  { id: "mux", label: "Mux", ports: [{ id: "x", kind: "in" }, { id: "y", kind: "in" }, { id: "o", kind: "out" }] }
                ],
                edges: [
                  { from: { port: "op" }, to: { node: "add", port: "a" } },
                  { from: { port: "op" }, to: { node: "shift", port: "a" } },
                  { from: { node: "add", port: "s" }, to: { node: "mux", port: "x" } },
                  { from: { node: "shift", port: "s" }, to: { node: "mux", port: "y" } },
                  { from: { node: "mux", port: "o" }, to: { port: "r" } }
                ]
              }),
            400
          )
        )
    },
    { id: "regs", label: "Registers", ports: [{ id: "w", label: "w", kind: "in" }, { id: "pc", label: "pc", kind: "out" }] }
  ],
  edges: [
    { from: { port: "clk" }, to: { node: "fetch", port: "pc" } },
    { from: { node: "fetch", port: "op" }, to: { node: "alu", port: "op" }, label: "op" },
    { from: { node: "alu", port: "r" }, to: { node: "regs", port: "w" } },
    { from: { node: "regs", port: "pc" }, to: { node: "fetch", port: "pc" } },
    { from: { node: "regs", port: "pc" }, to: { port: "bus" } }
  ]
}
const nested = (open: boolean) => ({
  nodes: [
    { id: "mem", label: "Memory", ports: [{ id: "d", label: "data", kind: "out" }, { id: "a", label: "addr", kind: "in" }] },
    {
      id: "cpu",
      label: "CPU",
      open,
      ports: [{ id: "clk", label: "clk", kind: "in" }, { id: "bus", label: "bus", kind: "out" }],
      children: cpu
    },
    { id: "clock", label: "Clock", ports: [{ id: "t", kind: "out" }] },
    { id: "io", label: "I/O" }
  ],
  edges: [
    { from: { node: "clock", port: "t" }, to: { node: "cpu", port: "clk" } },
    { from: { node: "cpu", port: "bus" }, to: { node: "mem", port: "a" } },
    { from: { node: "cpu", port: "bus" }, to: { node: "io" } },
    { from: { node: "mem", port: "d" }, to: { node: "io" }, label: "dma" }
  ]
})

// A layered graph:  150 nodes in about 12 layers, 2 edges in each, mostly to the next layer.
function generated(count: number, prefix = "n", seed = 7): Graph {
  let state = seed
  const random = () => ((state = (state * 16807) % 2147483647) / 2147483647)
  const layers = 12
  const nodes: Record<string, any>[] = []
  const edges: Record<string, unknown>[] = []
  for (let i = 0; i < count; i++) {
    const node = { id: `${prefix}${i}`, label: `${prefix}${i}`, kind: i % 9 === 0 ? "hub" : undefined }
    if (count > 40 && i % 25 === 3) node.children = () => generated(12, `${prefix}${i}c`, i + 1)
    nodes.push(node)
  }
  const layerOf = (i: number) => Math.floor((i * layers) / count)
  for (let i = 0; i < count; i++) {
    for (let k = 0; k < 2; k++) {
      const span = random() < 0.85 ? 1 : 2
      const target = Math.min(layers - 1, layerOf(i) + span)
      if (layerOf(i) === layers - 1) break
      const first = Math.ceil((target * count) / layers)
      const last = Math.ceil(((target + 1) * count) / layers) - 1
      const j = first + Math.floor(random() * (last - first + 1))
      if (j < count) edges.push({ from: { node: nodes[i].id }, to: { node: nodes[j].id } })
    }
  }
  return { nodes, edges }
}

const graphAt = (id: string) => document.getElementById(id) as unknown as { graph: unknown }

customElements.whenDefined("ui-graph").then(() => {
  graphAt("graph-inline").graph = nested(true)
  graphAt("graph-modal").graph = nested(false)
  graphAt("graph-drill").graph = nested(false)
  const started = performance.now()
  graphAt("graph-big").graph = generated(150)
  requestAnimationFrame(() => console.info(`ui-graph:  150 nodes laid out and drawn in ${Math.round(performance.now() - started)} ms`))
})
