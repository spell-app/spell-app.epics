/**
 * `<netlist-columns>`:  `<ui-tree>` always in columns (`mode="columns"` by default;  `mode="outline"` still works),
 * with a sheet of its own for the netlist's look.
 * - Built as the kit builds a subclass element:  a `UITree` subclass, its vocabulary the tree's with its own tag and
 *   `mode`'s default `columns`, its `elementSetup.styleSheets` the tree's plus `netlist-columns`, then `define()`.
 * - Its look:  `NetlistColumns.css`, through the `--netlist-columns-*` tokens (set them on the element or the page).
 *   - `show`:  which parts a row shows (`icon name kind count chevron`;  default `icon name chevron`).
 *   - The open-a-column mark is a chevron (`>`), not a filled triangle.
 *   - A row's kind (`which`) shows as a badge;  a port's coloured by its kind (`--netlist-columns-optical` ...).
 * - `rowClass(item)` (ui-tree's hook) classes each row from its `data`, for the sheet:
 *   - a node:  `node`, `leaf` or `block`, `kind-<its kind>`;
 *   - a port:  `port`, `dir-in` / `dir-out`, `port-optical` / `-electrical` / `-comm` / `-unknown`.
 */
import { E } from "spell/ui/core"
import { UITree } from "spell/ui/components/ui-tree"
import { treeVocabulary } from "spell/ui/components/ui-tree/UITree.en"
import type { TreeItemData } from "spell/ui/components/ui-tree/UITree.types"

import netlistColumnsCSS from "./NetlistColumns.css?inline"

/** The tree's names, under `<netlist-columns>`, `mode` defaulting to `columns`. */
export const netlistColumnsVocabulary = {
  ...treeVocabulary,
  tag: "netlist-columns",
  noun: "netlist columns",
  description: "A netlist's nodes and ports as a file browser's columns:  `<ui-tree>` in columns mode.",
  attributes: [
    ...treeVocabulary.attributes.map((attribute) => (attribute.name === "mode" ? { ...attribute, default: "columns" } : attribute)),
    {
      name: "show",
      group: "appearance",
      kind: "string",
      default: "icon name chevron",
      description:
        "Which parts each row shows, as words:  `icon name kind count chevron`.  Default `icon name chevron`:  the " +
        "kind badge and the children count hidden (the panel has them).  Hidden by the sheet (`NetlistColumns.css`)."
    }
  ]
} as unknown as typeof treeVocabulary

export class NetlistColumns extends UITree {
  @E.proto static vocabulary = netlistColumnsVocabulary
  @E.protoMerged static elementSetup: Partial<E.ElementSetup> = {
    styleSheets: { ...UITree.prototype.elementSetup.styleSheets, "netlist-columns": netlistColumnsCSS }
  }

  /** A row's classes, from its node or port (`item.data`). */
  override rowClass(item: TreeItemData): string | undefined {
    const data = item.data as { kind?: string; direction?: string; children?: { items: unknown[] } } | undefined
    if (!data) return undefined
    if ("direction" in data) return `port dir-${cssWord(data.direction)} port-${portKind(data.kind)}`
    return `node ${data.children?.items.length ? "block" : "leaf"} kind-${cssWord(data.kind)}`
  }
}

/** A port kind as one word:  the ones with a colour, else `unknown`. */
export function portKind(kind: string | undefined): string {
  const word = (kind ?? "").toLowerCase()
  return ["optical", "electrical", "comm"].includes(word) ? word : "unknown"
}

/** Text as a class name's word. */
function cssWord(text: string | undefined): string {
  return (text ?? "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-") || "none"
}

NetlistColumns.define()
