/**
 * The English vocabulary of `<ui-json-viewer>`:  every name the tag uses.
 * - `<ui-json>`'s (`source`, `load`, its events and states:  it IS a `<ui-json>` that draws), plus `depth`, its parts
 *   and texts.  The shape is `ComponentVocabulary` (`spell/ui/vocabulary`).
 * - Ours, not Fomantic's.  Lives in the Netlists project for now (epic `netlists` P9);  to be folded into `<ui-json>`.
 * - `value` is the DOM element's property (any JSON value), as `<ui-json>`'s is:  not an attribute.
 */

import type { ComponentVocabulary } from "spell/ui/vocabulary"
import { jsonVocabulary } from "spell/ui/components/ui-json/UIJson.en"

/****************
 * ### `jsonViewerVocabulary`
 * The names of `<ui-json-viewer>`, JSON drawn as a collapsible, indented outline:
 * `<div class="ui json-viewer" part="viewer">` holding its header (`part="header"`) and a `<div class="row">` per line.
 ****************/
export const jsonViewerVocabulary = {
  ...jsonVocabulary,
  tag: "ui-json-viewer",
  icon: "code",
  topics: ["data display"],
  aka: ["json viewer", "json tree", "object inspector", "data viewer", "pretty print", "visor json"],
  noun: "JSON viewer",
  description:
    "A JSON viewer draws JSON data as an indented outline whose objects and arrays open and close:  its text, a " +
    "file with `source`, or any value set through `value`.",
  attributes: [
    ...jsonVocabulary.attributes,
    {
      name: "depth",
      group: "behaviour",
      kind: "number",
      default: 1,
      description:
        "How many levels start open:  `1`, the top object or array alone;  `0`, everything closed.  A new value " +
        "opens this way again."
    },
    {
      name: "quotes",
      group: "appearance",
      kind: "boolean",
      default: true,
      description:
        'Keys in quotes, as JSON writes them:  `"type": "ssx_v2"`.  `quotes="no"`:  `type: "ssx_v2"`, as JSON5 ' +
        "allows (a key that isn't a name keeps its quotes).  The header's quotes button sets it.  Copy always copies JSON."
    },
    {
      name: "no-header",
      group: "appearance",
      kind: "boolean",
      default: false,
      description: "Hides the header:  the Copy and quotes buttons."
    },
    {
      name: "editable",
      group: "behaviour",
      kind: "boolean",
      default: false,
      description:
        "Double-click a key or a scalar value to edit it in place:  Enter (or leaving it) keeps the edit, Escape " +
        "drops it.  A value's text is read as JSON (`12`, `true`, `\"a\"`, `[1]`), else taken as a string.  " +
        "`value` changes and `ui-changed` is sent;  what's open stays open."
    }
  ],
  events: [
    ...jsonVocabulary.events,
    {
      name: "ui-json-navigate",
      detail: '{ path: (string | number)[], key: string | number | undefined, value: unknown, part: "key" | "value" }',
      description:
        "A key or a value was clicked (not a double-click, nor the end of a text selection).  `path`:  the keys " +
        "from the top value down to that member (`[]`:  the top value);  `key`:  its key, an array member's index;  " +
        "`value`:  its value (an object or array too, when its key was clicked);  `part`:  which was clicked.  " +
        "Bubbles out of the shadow root (composed) and is cancelable:  a page that acts on it (jumping to the node " +
        "a value names) calls `preventDefault()`.  The viewer itself does nothing more."
    }
  ],
  parts: [
    { name: "viewer", description: "The box round it all." },
    { name: "header", description: "The bar above the data:  Copy, then the quotes button." },
    { name: "row", description: "Each line." },
    {
      name: "toggle",
      description:
        "Each object's or array's open / close button, a chevron in the left gutter;  Alt-click:  its whole branch."
    },
    { name: "preview", description: "A closed object or array, on one line." },
    { name: "editor", description: "The input a key or value is edited in (`editable`)." }
  ],
  texts: [
    { key: "jsonViewerCopy", text: "Copy JSON", description: "The header's Copy button." },
    { key: "jsonViewerCopied", text: "Copied", description: "The Copy button, for a moment after it copied." },
    { key: "jsonViewerQuotes", text: "Quotes round keys", description: "The quotes button's name (a toggle)." },
    { key: "jsonViewerQuotesOff", text: "Hide the quotes round keys", description: "The quotes button's tooltip, on." },
    { key: "jsonViewerQuotesOn", text: "Show the quotes round keys", description: "The quotes button's tooltip, off." },
    { key: "jsonViewerEditKey", text: "Key", description: "The input a key is edited in." },
    { key: "jsonViewerEditValue", text: "Value", description: "The input a value is edited in." },
    { key: "jsonViewerOpen", text: "Open {key}", description: "A closed object's or array's toggle." },
    { key: "jsonViewerClose", text: "Close {key}", description: "An open object's or array's toggle." },
    { key: "jsonViewerTop", text: "the data", description: "The top value's name, in its toggle's label." },
    { key: "jsonViewerEmpty", text: "No data", description: "Nothing to show:  no value, or text that isn't JSON." }
  ]
} as const satisfies ComponentVocabulary
