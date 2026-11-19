import { For, Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "spell/ui/core"
import { DOMJsonElement, UIJson } from "spell/ui/components/ui-json"
import { jsonViewerVocabulary } from "./UIJsonViewer.en"

import jsonViewerCSS from "./UIJsonViewer.css?inline"

/** How many characters a closed object or array shows before `...` and the count, at least;  and before it's measured. */
const PREVIEW_MIN = 24
const PREVIEW_CHARS = 90
/** How long a string runs in a closed object or array before it's cut. */
const PREVIEW_STRING = 32
/** Joins a path's keys:  no JSON key holds it in practice, and a collision only shares an open state. */
const SEP = "\u0001"
/** How long Copy shows its check. */
const COPIED_MS = 1500
/** The event a click on a key or value sends. */
export const JSON_NAVIGATE = "ui-json-navigate"

/** `ui-json-navigate`'s detail:  the member clicked, by its path from the top (`[]`:  the top value itself). */
export type JsonNavigateDetail = {
  path: (string | number)[]
  /** its key (an array member's:  its index);  the top value's:  `undefined` */
  key: string | number | undefined
  /** its value, as it is (an object or array too, when its key was clicked) */
  value: unknown
  /** what was clicked */
  part: "key" | "value"
}

/** A piece of a closed preview:  its class (`key`, `string` ...) and text. */
type Token = readonly [string, string]
type Key = string | number | undefined
type Path = (string | number)[]

/****************
 * ### `DOMJsonViewerElement`
 * `<ui-json-viewer>` itself:  `<ui-json>`'s script API, but `value` holds the very value it's given (no JSON round
 * trip), so a big object costs nothing to hand over.
 ****************/
export class DOMJsonViewerElement extends DOMJsonElement {
  /** A `value` set before the component exists:  the component takes it as it's made. */
  private pendingValue: { value: unknown } | undefined

  /** The data shown:  the `value` set, else its text (or `source`), parsed. */
  override get value(): unknown {
    const viewer = this.component as unknown as UIJsonViewer | undefined
    if (viewer) return viewer.value
    return this.pendingValue ? this.pendingValue.value : super.value
  }

  /** Show `value`, any JSON value, as it is;  its text (or a new `content`) is shown again once that changes. */
  override set value(value: unknown) {
    const viewer = this.component as unknown as UIJsonViewer | undefined
    if (viewer) viewer.given = { value }
    else this.pendingValue = { value }
  }

  /** The `value` set before the component existed, once. */
  takePendingValue(): { value: unknown } | undefined {
    const pending = this.pendingValue
    this.pendingValue = undefined
    return pending
  }
}

/****************
 * ### `UIJsonViewer`
 * The component behind `<ui-json-viewer>`:  a `<ui-json>` that DRAWS its data, as an indented, collapsible outline.
 *
 * - Where the data comes from is `<ui-json>`'s:  its text, `source`, `content`;  or `value`, set as it is.
 * - Two spaces per level, monospace, coloured by the theme's code tokens (`--ui-code-attr`, `--ui-code-string` ...).
 * - A header (part `header`;  `no-header` hides it):  Copy (the JSON, 2-space indents, to the clipboard) and a
 *   toggle for the quotes round keys (`quotes`, on:  `"type": ...`;  off:  `type: ...`, JSON5-style).
 * - Each object and array has a toggle in the left gutter, one column for every row whatever its indent:  a real
 *   `<button aria-expanded>` (part `toggle`) holding a chevron `<ui-icon>`;  Alt-click opens or closes its branch.
 *   - Closed, it's one line:  `[ 1, 2, 3, ... ]`, `{ "attr": value, "attr2": value, ... }`, nested values closed
 *     too, cut to the characters that fit its line (measured:  `columns`).
 *   - `depth` levels start open (`1`:  the top alone).
 * - Keys and values are links:  a click sends `ui-json-navigate` (`{ path, key, value, part }`;  bubbles, composed,
 *   cancelable), so a page can jump to what a value names.
 * - `editable`:  double-click a key or a scalar value to edit it in place (Enter keeps, Escape drops);  the text is
 *   read as JSON, else as a string.  `value` changes and `ui-changed` is sent.
 * - A closed object's children aren't drawn:  a node with 387 ports costs one line until it's opened.
 * - Lives in the Netlists project for now (epic `netlists` P9);  to be folded into `<ui-json>` itself.
 ****************/
export class UIJsonViewer extends UIJson {
  @E.proto static vocabulary = jsonViewerVocabulary as unknown as typeof UIJson.vocabulary
  @E.protoMerged static elementSetup = {
    // `json` replaces `<ui-json>`'s sheet, which hides it
    styleSheets: { json: jsonViewerCSS },
    DOMElement: DOMJsonViewerElement as unknown as typeof DOMJsonElement,
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** `value` as it was set, wrapped (so `undefined` is a value);  none:  the text's. */
  @E.state accessor given: { value: unknown } | undefined = (this.domElement as DOMJsonViewerElement).takePendingValue()

  /** The open state of the objects and arrays a person toggled, by path;  the rest follow `depth`. */
  @E.state accessor toggled: ReadonlyMap<string, boolean> = new Map()

  /** The key or value being edited:  its path's string, `\u0002`, `key` or `value`. */
  @E.state accessor editing: string | undefined = undefined

  /** Copy just copied:  its icon is a check for a moment. */
  @E.state accessor copied = false

  /** The next new data is an edit:  what's open stays open. */
  private keepToggles = false

  /** What's shown:  the value set, else the text's;  `undefined`:  nothing. */
  @E.derived
  get shown(): { value: unknown } | undefined {
    if (this.given) return this.given
    const value = this.parsed.value
    return value === undefined ? undefined : { value }
  }

  override get value(): unknown {
    return this.shown?.value
  }

  /** The text changed (`content`, the element's own, a load):  it's shown instead of a `value` set before. */
  @E.onChange("textToShow", { defer: true })
  protected onTextChanged() {
    this.given = undefined
  }

  /** New data:  it opens by `depth` again. */
  @E.onChange("shown", { defer: true })
  protected onShownChanged() {
    if (this.keepToggles) this.keepToggles = false
    else this.toggled = new Map()
  }

  /** How many levels start open. */
  get openDepth(): number {
    const depth = Number((this as unknown as { depth?: number }).depth ?? 1)
    return Number.isFinite(depth) ? depth : 1
  }

  /** Is the object or array at `path`, `level` deep, open? */
  isOpen(path: string, level: number): boolean {
    return this.toggled.get(path) ?? level < this.openDepth
  }

  /** Open or close the object or array at `path`;  `branch`:  everything inside it too. */
  @E.untracked
  toggle(path: string, value: unknown, level: number, branch = false) {
    const open = !this.isOpen(path, level)
    const toggled = new Map(this.toggled)
    toggled.set(path, open)
    if (branch) {
      const walk = (item: unknown, at: string) => {
        for (const [key, child] of entriesOf(item)) {
          if (!isContainer(child)) continue
          const childPath = at + SEP + key
          toggled.set(childPath, open)
          walk(child, childPath)
        }
      }
      walk(value, path)
    }
    this.toggled = toggled
  }

  ////////////////
  // ## Drawing
  ////////////////

  override render(): JSX.Element {
    // the source element's look (loader, error), round `renderContent()`;  `<ui-json>`'s own draws nothing
    return E.LoadableComponent.prototype.render.call(this)
  }

  protected override renderContent(): JSX.Element {
    return (
      <div class="ui json-viewer" part={this.partForName("viewer" as never)} ref={(div: HTMLElement) => (this.box = div)}>
        <Show when={!this.noHeader}>{this.header()}</Show>
        <span class="probe" aria-hidden="true">
          0000000000
        </span>
        <div class="body">{this.tree()}</div>
      </div>
    )
  }

  /** The outline's box, measured for `columns`. */
  private box: HTMLElement | undefined

  /** How many characters fit on a line;  `undefined` until measured. */
  @E.state accessor columns: number | undefined = undefined

  /** Keep `columns` in step with the element's width (a closed line's preview is cut to it). */
  @E.whileConnected
  protected watchWidth() {
    if (typeof ResizeObserver === "undefined") return
    const measure = () => {
      const box = this.box
      const probe = box?.querySelector<HTMLElement>(".probe")
      if (!box || !probe) return
      const ch = probe.getBoundingClientRect().width / 10
      const width = box.getBoundingClientRect().width
      if (!ch || !width) return
      const columns = Math.floor(width / ch)
      if (columns !== this.columns) this.columns = columns
    }
    const observer = new ResizeObserver(measure)
    queueMicrotask(() => {
      if (this.box) observer.observe(this.box)
      measure()
    })
    return () => observer.disconnect()
  }

  /** Copy and the quotes toggle. */
  private header(): JSX.Element {
    const copyLabel = () => this.text(this.copied ? "jsonViewerCopied" : "jsonViewerCopy")
    return (
      <div class="header" part={this.partForName("header" as never)}>
        <ui-button
          class="copy"
          appearance="basic"
          size="tiny"
          icon={this.copied ? "check" : "clipboard"}
          aria-label={copyLabel()}
          data-tooltip={copyLabel()}
          data-position="bottom right"
          onClick={() => void this.copy()}
        />
        <ui-button
          class="quotes"
          appearance="basic"
          size="tiny"
          icon="quote-left"
          selected={!!this.quotes}
          aria-pressed={this.quotes ? "true" : "false"}
          aria-label={this.text("jsonViewerQuotes")}
          data-tooltip={this.text(this.quotes ? "jsonViewerQuotesOff" : "jsonViewerQuotesOn")}
          data-position="bottom right"
          onClick={() => this.setQuotes(!this.quotes)}
        />
      </div>
    )
  }

  /** Copy the data, as JSON with 2-space indents, to the clipboard;  Copy's icon is a check for a moment. */
  @E.untracked
  async copy(): Promise<void> {
    const text = JSON.stringify(this.value, null, 2) ?? ""
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      E.Warnings.warn(`<${this.domElement.localName}>`, `can't copy to the clipboard`, error)
      return
    }
    this.copied = true
    clearTimeout(this.copiedTimer)
    this.copiedTimer = setTimeout(() => (this.copied = false), COPIED_MS)
  }
  private copiedTimer: ReturnType<typeof setTimeout> | undefined

  /** Quotes round keys or not:  the `quotes` attribute (`quotes="no"` when off). */
  @E.untracked
  setQuotes(on: boolean) {
    if (on) this.domElement.removeAttribute("quotes")
    else this.domElement.setAttribute("quotes", "no")
  }

  /** The whole outline, rebuilt only when the data changes. */
  private tree(): JSX.Element {
    const shown = this.shown
    if (!shown) return <div class="empty">{this.text("jsonViewerEmpty")}</div>
    return this.entry(undefined, shown.value, "", [], 0, true)
  }

  /** One value:  a line;  an object or array, its line, then (open) its children and its closing line. */
  private entry(key: Key, value: unknown, path: string, at: Path, level: number, isLast: boolean): JSX.Element {
    const comma = isLast ? undefined : <span class="punct">,</span>
    if (!isContainer(value)) {
      return (
        <div class="row" part={this.partForName("row" as never)} style={`--level: ${level}`}>
          {this.keyOf(key, value, path, at)}
          {this.scalar(value, key, path, at)}
          {comma}
        </div>
      )
    }
    const isArray = Array.isArray(value)
    const entries = entriesOf(value)
    const open = () => this.isOpen(path, level)
    if (!entries.length) {
      return (
        <div class="row" part={this.partForName("row" as never)} style={`--level: ${level}`}>
          {this.keyOf(key, value, path, at)}
          {this.link(<span class="punct">{isArray ? "[]" : "{}"}</span>, "value", key, value, at)}
          {comma}
        </div>
      )
    }
    const name = key === undefined ? this.text("jsonViewerTop") : String(key)
    const lastKey = entries[entries.length - 1][0]
    return (
      <>
        <div class="row container" part={this.partForName("row" as never)} style={`--level: ${level}`}>
          <button
            type="button"
            class={{ toggle: true, open: open() }}
            part={this.partForName("toggle" as never)}
            aria-expanded={open() ? "true" : "false"}
            aria-label={this.text(open() ? "jsonViewerClose" : "jsonViewerOpen", { key: name })}
            title={this.text(open() ? "jsonViewerClose" : "jsonViewerOpen", { key: name }) + "  (Alt:  all inside)"}
            onClick={(event: MouseEvent) => this.toggle(path, value, level, event.altKey)}
          >
            <ui-icon name={open() ? "chevron-down" : "chevron-right"} />
          </button>
          {this.keyOf(key, value, path, at)}
          <Show when={open()} fallback={this.closed(value, comma, level, key)}>
            <span class="punct">{isArray ? "[" : "{"}</span>
          </Show>
        </div>
        <Show when={open()}>
          <For each={entries}>
            {([childKey, child]) =>
              this.entry(
                isArray ? Number(childKey) : childKey,
                child,
                path + SEP + childKey,
                [...at, isArray ? Number(childKey) : childKey],
                level + 1,
                childKey === lastKey
              )
            }
          </For>
          <div class="row" part={this.partForName("row" as never)} style={`--level: ${level}`}>
            <span class="punct">{isArray ? "]" : "}"}</span>
            {comma}
          </div>
        </Show>
      </>
    )
  }

  /** A closed object or array, on one line:  `{ "a": 1, ... }`. */
  private closed(value: object, comma: JSX.Element, level: number, key: Key): JSX.Element {
    // what's left of the line:  the gutter (3), the indent, `"key": `, the comma
    const used = 3 + level * 2 + (typeof key === "string" ? JSON.stringify(key).length + 2 : 0) + 1
    const budget = this.columns === undefined ? PREVIEW_CHARS : Math.max(PREVIEW_MIN, this.columns - used)
    const { tokens } = preview(value, budget, !!this.quotes)
    return (
      <>
        <span class="preview" part={this.partForName("preview" as never)}>
          {tokens.map(([kind, text]) => (
            <span class={kind}>{text}</span>
          ))}
        </span>
        {comma}
      </>
    )
  }

  /** `"key": `, for an object's member;  nothing for an array's or the top's. */
  private keyOf(key: Key, value: unknown, path: string, at: Path): JSX.Element {
    if (typeof key !== "string") return undefined
    const shown = this.link(<span class="key">{keyText(key, !!this.quotes)}</span>, "key", key, value, at)
    return (
      <>
        {this.editableAs(shown, "key", path, at, () => key)}
        <span class="punct">: </span>
      </>
    )
  }

  /** A scalar:  `"text"`, `12`, `true`, `null`. */
  private scalar(value: unknown, key: Key, path: string, at: Path): JSX.Element {
    const shown = this.link(<span class={scalarKind(value)}>{scalarText(value)}</span>, "value", key, value, at)
    return this.editableAs(shown, "value", path, at, () => scalarText(value))
  }

  /** `shown` as a link:  a click sends `ui-json-navigate`. */
  private link(shown: JSX.Element, part: "key" | "value", key: Key, value: unknown, at: Path): HTMLElement {
    const span = shown as HTMLElement
    span.classList.add("link")
    span.addEventListener("click", (event) => this.navigate(event, { path: at, key, value, part }))
    return span
  }

  /** `span`, which an `editable` viewer swaps for an input on a double-click. */
  private editableAs(span: HTMLElement, part: "key" | "value", path: string, at: Path, initial: () => string): JSX.Element {
    const id = path + "\u0002" + part
    span.addEventListener("dblclick", (event) => {
      if (!this.editable) return
      event.preventDefault()
      window.getSelection()?.removeAllRanges()
      this.editing = id
    })
    return (
      <Show when={this.editing === id} fallback={span}>
        <input
          class={`edit ${part}`}
          part={this.partForName("editor" as never)}
          value={initial()}
          size={Math.max(4, initial().length + 1)}
          aria-label={this.text(part === "key" ? "jsonViewerEditKey" : "jsonViewerEditValue")}
          spellcheck={false}
          ref={(input: HTMLInputElement) =>
            queueMicrotask(() => {
              input.focus()
              input.select()
            })
          }
          onKeyDown={(event: KeyboardEvent) => {
            if (event.key === "Enter") this.commitEdit(id, part, at, (event.currentTarget as HTMLInputElement).value)
            else if (event.key === "Escape") this.editing = undefined
            else return
            event.preventDefault()
            event.stopPropagation()
          }}
          onBlur={(event: FocusEvent) => this.commitEdit(id, part, at, (event.currentTarget as HTMLInputElement).value)}
        />
      </Show>
    )
  }

  /** Keep an edit:  a key renamed, or a value replaced (its text read as JSON, else as a string). */
  @E.untracked
  private commitEdit(id: string, part: "key" | "value", at: Path, text: string) {
    if (this.editing !== id) return
    this.editing = undefined
    const current = this.value
    let next: unknown
    if (part === "value") {
      const value = readLoose(text)
      if (Object.is(value, valueAt(current, at))) return
      next = setAt(current, at, value)
    } else {
      const oldKey = at[at.length - 1] as string
      const parsed = readLoose(text.trim())
      const newKey = typeof parsed === "string" ? parsed : text.trim()
      const parent = valueAt(current, at.slice(0, -1)) as Record<string, unknown>
      if (!newKey || newKey === oldKey || Object.hasOwn(parent, newKey)) return
      next = renameAt(current, at, newKey)
      // what was open under the old key stays open under the new one
      const from = pathOf(at)
      const to = pathOf([...at.slice(0, -1), newKey])
      const toggled = new Map<string, boolean>()
      for (const [path, open] of this.toggled)
        toggled.set(path === from || path.startsWith(from + SEP) ? to + path.slice(from.length) : path, open)
      this.toggled = toggled
    }
    this.keepToggles = true
    this.given = { value: next }
    this.send("ui-changed", { value: next, content: JSON.stringify(next) ?? "" })
  }

  /** A key or value was clicked:  `ui-json-navigate`, unless it's part of a double-click, an edit or a selection. */
  @E.untracked
  private navigate(event: MouseEvent, detail: JsonNavigateDetail) {
    if (event.detail > 1 || this.editing) return
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed && selection.toString()) return
    this.domElement.dispatchEvent(
      new CustomEvent<JsonNavigateDetail>(JSON_NAVIGATE, { detail, bubbles: true, composed: true, cancelable: true })
    )
  }

  private text(key: string, params?: Record<string, string | number>): string {
    return this.translationForKey(key as never, params)
  }
}

/** The vocabulary's attribute getters:  `<ui-json>`'s, and `depth`. */
export interface UIJsonViewer {
  depth: number | undefined
  quotes: boolean
  noHeader: boolean
  editable: boolean
}

////////////////
// ## Helpers
////////////////

function isContainer(value: unknown): value is object {
  return typeof value === "object" && value !== null
}

/** An object's or array's members, as `[key, value]`;  anything else has none. */
function entriesOf(value: unknown): [string, unknown][] {
  if (!isContainer(value)) return []
  if (Array.isArray(value)) return value.map((item, index) => [String(index), item])
  return Object.entries(value)
}

/** A scalar's class:  `string`, `number`, `boolean`, `null`. */
function scalarKind(value: unknown): string {
  if (value === null || value === undefined) return "null"
  return typeof value === "string" ? "string" : typeof value === "number" || typeof value === "bigint" ? "number" : typeof value === "boolean" ? "boolean" : "null"
}

function scalarText(value: unknown): string {
  return value === undefined ? "null" : (JSON.stringify(value) ?? String(value))
}

/** A key as shown:  `"type"`;  without quotes, `type` (JSON5:  a key that isn't a name keeps them). */
function keyText(key: string, quotes: boolean): string {
  return quotes || !/^[A-Za-z_$][\w$]*$/.test(key) ? JSON.stringify(key) : key
}

/** A path's string, as `toggled` keys it. */
function pathOf(at: Path): string {
  return at.map((key) => SEP + key).join("")
}

/** Text typed into an edit:  JSON if it reads as JSON, else the text itself. */
function readLoose(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function valueAt(value: unknown, at: Path): unknown {
  let item = value
  for (const key of at) item = isContainer(item) ? (item as Record<string | number, unknown>)[key] : undefined
  return item
}

/** `value` with the member at `at` replaced:  copies along the path, the rest shared. */
function setAt(value: unknown, at: Path, next: unknown): unknown {
  if (!at.length) return next
  const [key, ...rest] = at
  const child = setAt((value as Record<string | number, unknown>)[key], rest, next)
  if (Array.isArray(value)) return value.map((item, index) => (index === key ? child : item))
  return { ...(value as object), [key]: child }
}

/** `value` with the key at `at` renamed, in its place. */
function renameAt(value: unknown, at: Path, newKey: string): unknown {
  const parentPath = at.slice(0, -1)
  const oldKey = at[at.length - 1]
  const parent = valueAt(value, parentPath) as Record<string, unknown>
  const renamed = Object.fromEntries(Object.entries(parent).map(([key, item]) => [key === oldKey ? newKey : key, item]))
  return setAt(value, parentPath, renamed)
}

/**
 * A closed object or array as tokens:  `[ 1, 2, 3, ... ]`, `{ "a": 1, "b": { "c": 2 }, ... }`.
 * - Nested values closed too, two levels down;  past that `{ ... }` / `[ ... ]`.
 * - Cut once it's about `budget` long;  `more`:  how many of the TOP value's members weren't shown.
 */
function preview(value: object, budget: number, quotes = true): { tokens: Token[]; more: number } {
  const tokens: Token[] = []
  // `...` and the closing bracket must fit too
  let left = budget - 4
  const push = (kind: string, text: string) => {
    tokens.push([kind, text])
    left -= text.length
  }
  const walk = (item: object, nest: number): number => {
    const isArray = Array.isArray(item)
    const entries = entriesOf(item)
    const [open, close] = isArray ? ["[", "]"] : ["{", "}"]
    if (!entries.length) return push("punct", open + close), 0
    if (nest >= 2) return push("punct", `${open} ... ${close}`), 0
    push("punct", open + " ")
    for (let index = 0; index < entries.length; index++) {
      // a member that runs past the line is taken back, `...` in its place
      const mark = tokens.length
      const leftAtMark = left
      if (index) push("punct", ", ")
      const [key, child] = entries[index]
      if (!isArray) {
        push("key", keyText(key, quotes))
        push("punct", ": ")
      }
      if (isContainer(child)) walk(child, nest + 1)
      else {
        let text = scalarText(child)
        if (typeof child === "string" && text.length > PREVIEW_STRING) text = text.slice(0, PREVIEW_STRING - 2) + '…"'
        push(scalarKind(child), text)
      }
      // the first member stays, however long:  one cut short by the line's end beats `{ ... }`
      if (left < 0 && index) {
        tokens.length = mark
        left = leftAtMark
        push("punct", `${index ? ", " : ""}... ${close}`)
        return entries.length - index
      }
    }
    push("punct", " " + close)
    return 0
  }
  const more = walk(value, 0)
  return { tokens, more }
}
