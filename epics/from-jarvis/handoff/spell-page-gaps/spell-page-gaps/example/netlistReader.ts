// netlistReader:  reads an Apollo netlist's JSON into the Netlists templates (`Netlists.spell`, compiled to
// `netlists.lib.ts`).  Spell has no words yet for parsing JSON or walking an object's keys, so this does the
// reading, and the templates stay the public face:  `readNetlist(text)` returns a `Netlist`.
//
// The format:  ONE component, `{ type, attrs, ports?, connections?, subcomponents? }`, each subcomponent the same.
// - `ports`:  name -> `{ type, direction }`.
// - `connections`:  "from to", each end "<child>.<port>", or a bare "<port>" for the declaring node's own port.
// - A node whose insides live in another file (a guess, until a real one turns up:  `attrs.interface.interface_only`)
//   keeps its name in `subnetlist`;  `options.resolveSubnetlist` may hand back that file's component to splice in.
import { NetlistConnection, NetlistEndpoint, Netlist, NetlistNode, NetlistProblem, NetlistPort } from "./netlists.lib"

const libraryClasses = { Netlist, NetlistNode, NetlistPort, NetlistConnection, NetlistEndpoint, NetlistProblem }

/** One component of the JSON, as the file has it. */
export interface NetlistJSON {
  type?: string
  attrs?: Record<string, unknown>
  ports?: Record<string, { type?: string; direction?: string }>
  connections?: string[]
  subcomponents?: Record<string, NetlistJSON>
}

export interface ReadOptions {
  /** The netlist's name, e.g. the file's name;  default the root's `source_netlist.filename`, else its type. */
  name?: string
  /**
   * The insides of a node held in another file:  given the node (its `subnetlist` set) and its JSON, return that
   * file's component (or its text), or nothing to leave the node as ports only.
   * Synchronous:  fetch the files first (`subnetlistOf()` names each one), then hand them in from a map.
   */
  resolveSubnetlist?: (node: NetlistNode, json: NetlistJSON) => NetlistJSON | string | undefined
  /**
   * The templates to make, when a page runs the project compiled for it (`netlists.spell.js`) rather than the
   * library (`netlists.lib.ts`):  `{ Netlist, NetlistNode, NetlistPort, NetlistConnection, NetlistEndpoint, NetlistProblem }`.
   */
  classes?: typeof libraryClasses
}

/**
 * Each node's own JSON object, as the file has it (before any subnetlist is spliced in), for a JSON view.
 * - A `WeakMap`, not a field:  the templates (`Netlists.spell`) are the public face, and hold what was read.
 */
const rawJSON = new WeakMap<NetlistNode, NetlistJSON>()

/** `node`'s own JSON object, as the file has it;  `undefined` for a node not made by `readNetlist()`. */
export function jsonOf(node: NetlistNode): NetlistJSON | undefined {
  return rawJSON.get(node)
}

/** Which nodes keep their insides in another file:  the name of that netlist, or "" for none. */
export function subnetlistOf(json: NetlistJSON): string {
  const face = json.attrs?.interface as { name?: string; version?: string; interface_only?: boolean } | undefined
  if (!face?.interface_only) return ""
  return [face.name, face.version].filter(Boolean).join("@") || json.type || "?"
}

/** Read `source`, a netlist file's text or its parsed JSON, into a `Netlist`. */
export function readNetlist(source: string | NetlistJSON, options: ReadOptions = {}): Netlist {
  const C = options.classes ?? libraryClasses
  const json: NetlistJSON = typeof source === "string" ? JSON.parse(source) : source
  const attrs = json.attrs ?? {}
  const from = (attrs.source_netlist ?? {}) as { url?: string; filename?: string }
  const netlist = new C.Netlist({
    name: options.name ?? from.filename ?? json.type ?? "",
    revision: String(attrs.revision ?? ""),
    sourceUrl: from.url ?? "",
    sourceFile: from.filename ?? ""
  })
  const nodes: NetlistNode[] = []
  const connections: NetlistConnection[] = []
  const problems: NetlistProblem[] = []
  const problem = (kind: string, message: string, path: string, text = "") =>
    problems.push(new C.NetlistProblem({ kind, message, path, text }))

  function readNode(name: string, raw: NetlistJSON, parent: NetlistNode | undefined, depth: number): NetlistNode {
    const path = parent ? (parent.depth === 0 ? name : `${parent.path}.${name}`) : ""
    const node = new C.NetlistNode({
      name,
      kind: raw.type ?? "",
      path,
      depth,
      attrs: raw.attrs ?? {},
      subnetlist: subnetlistOf(raw)
    })
    if (parent) node.parent = parent
    nodes.push(node)
    rawJSON.set(node, raw)

    if (node.subnetlist && options.resolveSubnetlist) {
      const inner = options.resolveSubnetlist(node, raw)
      if (inner) raw = mergeInsides(raw, typeof inner === "string" ? JSON.parse(inner) : inner)
      else problem("unresolved subnetlist", `${path}'s insides, ${node.subnetlist}, weren't found`, path)
    }

    const ports: NetlistPort[] = []
    for (const [portName, info] of Object.entries(raw.ports ?? {})) {
      ports.push(new C.NetlistPort({ name: portName, kind: info?.type ?? "", direction: info?.direction ?? "", attrs: (info as { attrs?: object })?.attrs ?? {}, node }))
    }
    node.ports.items = ports

    const children: NetlistNode[] = []
    for (const [childName, child] of Object.entries(raw.subcomponents ?? {})) {
      children.push(readNode(childName, child, node, depth + 1))
    }
    node.children.items = children

    const declared: NetlistConnection[] = []
    for (const text of raw.connections ?? []) {
      const ends = text.trim().split(/\s+/)
      if (ends.length !== 2) {
        problem("bad connection", `"${text}" in ${path || "the root"} isn't two ends`, path, text)
        continue
      }
      const connection = new C.NetlistConnection({ text, owner: node })
      connection.fromEnd = endpointFor(ends[0], node, children, path, text)
      connection.toEnd = endpointFor(ends[1], node, children, path, text)
      declared.push(connection)
    }
    node.connections.items = declared
    connections.push(...declared)
    return node
  }

  function endpointFor(text: string, owner: NetlistNode, children: NetlistNode[], path: string, connection: string) {
    const dot = text.indexOf(".")
    const childName = dot < 0 ? undefined : text.slice(0, dot)
    const portName = dot < 0 ? text : text.slice(dot + 1)
    const node = childName === undefined ? owner : children.find((child) => child.name === childName)
    const endpoint = new C.NetlistEndpoint({ text })
    if (!node) {
      problem("no such node", `"${childName}" in "${connection}" isn't a part of ${path || "the root"}`, path, connection)
      return endpoint
    }
    endpoint.node = node
    const port = portOf(node, portName)
    if (!port) {
      problem("no such port", `${node.path || "the root"} has no port "${portName}" ("${connection}")`, path, connection)
      return endpoint
    }
    endpoint.port = port
    return endpoint
  }

  const root = readNode(netlist.name, json, undefined, 0)
  netlist.root = root
  netlist.nodes.items = nodes
  netlist.connections.items = connections
  netlist.problems.items = problems
  // each port's connections:  the one outside it and the one inside it, at most
  const byPort = new Map<NetlistPort, NetlistConnection[]>()
  for (const connection of connections) {
    for (const end of [connection.fromEnd, connection.toEnd]) {
      if (!end?.port) continue
      const list = byPort.get(end.port) ?? []
      list.push(connection)
      byPort.set(end.port, list)
    }
  }
  for (const [port, list] of byPort) port.connections.items = list
  return netlist
}

/** A node's port by name:  its ports, indexed the first time. */
const portIndex = new WeakMap<NetlistNode, Map<string, NetlistPort>>()
export function portOf(node: NetlistNode, name: string): NetlistPort | undefined {
  let index = portIndex.get(node)
  if (!index) {
    index = new Map(node.ports.items.map((port) => [port.name, port]))
    portIndex.set(node, index)
  }
  return index.get(name)
}

/** A node by its path, "ssx001.sandfish_fe_adapter";  "" is the root. */
export function nodeAt(netlist: Netlist, path: string): NetlistNode | undefined {
  let node: NetlistNode | undefined = netlist.root
  if (!path) return node
  for (const name of path.split(".")) {
    node = node?.children.items.find((child) => child.name === name)
    if (!node) return undefined
  }
  return node
}

/** What a netlist holds, counted. */
export function summaryOf(netlist: Netlist) {
  const kinds = new Map<string, number>()
  let ports = 0
  let depth = 0
  for (const node of netlist.nodes.items) {
    kinds.set(node.kind, (kinds.get(node.kind) ?? 0) + 1)
    ports += node.ports.items.length
    depth = Math.max(depth, node.depth)
  }
  return {
    name: netlist.name,
    revision: netlist.revision,
    nodes: netlist.nodeCount,
    connections: netlist.connectionCount,
    ports,
    depth,
    kinds: kinds.size,
    external: netlist.nodes.items.filter((node) => node.isExternal).length,
    problems: netlist.problemCount
  }
}

/** The port at a connection's other end from `port` (undefined:  unresolved, or `port` isn't on it). */
export function otherEndOf(connection: NetlistConnection, port: NetlistPort): NetlistPort | undefined {
  if (connection.fromEnd?.port === port) return connection.toEnd?.port
  if (connection.toEnd?.port === port) return connection.fromEnd?.port
  return undefined
}

/**
 * A ribbon:  a node of type `ribbon`, its children the strands (fibers `1` .. `n`, each with an `in` and an `out` port),
 * each ribbon port wired inside to one strand's end (`in_o0 1.in`, `1.out out_o0`;  not always in order:  `in_o0 12.in`).
 */
export const isRibbon = (node: NetlistNode | undefined): boolean => node?.kind === "ribbon"

/** One way through a ribbon, entering at `entry` (a ribbon port):  its strand, the port it leaves by, and what that reaches. */
export interface RibbonPassage {
  ribbon: NetlistNode
  /** The strand's number, 1-based:  its place among the ribbon's children (they're named `1` .. `n`). */
  strand: number
  entry: NetlistPort
  /** The ribbon port at the strand's other end (none:  the strand is open there). */
  exit?: NetlistPort
  /** What the exit port connects to outside the ribbon:  each with its connection (none:  open). */
  far: { port: NetlistPort; connection: NetlistConnection }[]
}

/**
 * Follow a ribbon port through its strand to the other side:  `entry` -> its strand's end (an inner connection) ->
 * the strand's other end -> the ribbon port there -> that port's outer connections.
 * - Undefined when `entry` isn't a ribbon's port or isn't wired to a strand.
 */
export function throughRibbon(entry: NetlistPort): RibbonPassage | undefined {
  const ribbon = entry.node
  if (!isRibbon(ribbon)) return undefined
  const inside = (port: NetlistPort) =>
    port.connections.items.filter((connection) => connection.owner === ribbon).map((connection) => otherEndOf(connection, port))
  const strandEnd = inside(entry).find((port) => port?.node.parent === ribbon)
  if (!strandEnd) return undefined
  const strand = strandEnd.node
  const otherStrandEnd = strand.ports.items.find((port) => port !== strandEnd)
  const exit = otherStrandEnd && inside(otherStrandEnd).find((port) => port?.node === ribbon)
  const far = exit
    ? exit.connections.items
        .filter((connection) => connection.owner !== ribbon)
        .flatMap((connection) => {
          const port = otherEndOf(connection, exit)
          return port ? [{ port, connection }] : []
        })
    : []
  return { ribbon, strand: ribbon.children.items.indexOf(strand) + 1, entry, exit, far }
}

/** A node's own JSON with a nested file's insides spliced in:  its ports win where both have one. */
function mergeInsides(outer: NetlistJSON, inner: NetlistJSON): NetlistJSON {
  return {
    ...outer,
    ports: { ...inner.ports, ...outer.ports },
    connections: [...(outer.connections ?? []), ...(inner.connections ?? [])],
    subcomponents: { ...outer.subcomponents, ...inner.subcomponents }
  }
}

/**
 * A netlist's short name, for headings and the first crumb:  its file name without `.json`, `.netlist`, or a revision
 * suffix (`.r005`, `.rev5`), which the revision label says already.  `av1p0.r005.netlist.json` => `av1p0`.
 */
export function shortNameOf(name: string): string {
  return name.replace(/\.json$/i, "").replace(/\.netlist$/i, "").replace(/\.r(ev)?\d+$/i, "") || name
}
