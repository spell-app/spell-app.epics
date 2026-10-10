# WWOD spoke -- Writing

The long before / afters for the writing rules in `agents/wwod/WWOD.md` §6.
Read this file whole before you write or rewrite docstrings, comments, READMEs, docs pages or plan docs.

The rules, in short:
- WWOD §6 › "Writing for people":  for a reader figuring things out, not from inside the builder's head
- WWOD §6 › "Name things by what they are to the reader":  "solid-element", never "the fork"
- WWOD §6 › "One or two sentences a paragraph, or bullets":  never run-together sentences
- WWOD §6 › "Plain text, plain paths":  what it means first;  paths in tooltips, exact settings in folded code
- WWOD §6 › "Break lines at phrases, not at the column":  so each line's start says what it's about

The examples below quote `ui` as it was:  solid-element (`@spell-app/solid-element`) was a package then.
Epic `spell-element` folded it into `DOMElement` / `UIComponent` (2026-10-09);  the lessons stand.

## Why

In Owen's words (2026-10-08, epic `skillz` P7):

> Comments are for future-Owen (and others who have less of an idea what's going on than I do) -- not for you,
> who put everything together and has the entire web at your fingertips.

> When I'm scanning quickly, I tend to read just the beginnings of lines,
> ignoring the end if the beginning doesn't look like what I want.

> Humans writing emails and docs-to-be scanned have migrated toward one or two sentences per paragraph or bullets
> -- dense text will just be ignored.

## 6. Comments & docs:  before and after

Each pair:  the BEFORE, the AFTER, and the rule it shows.
The afters are real code today.
The befores are from git history, except the first:  Owen's own, as he pasted it.

### Owen's two bullets

From `ElementSetup.canRenderUnstyled` and `UIComponent.isReady`, in `packages/ui/src/elements/UIComponent.tsx`.

BEFORE

```text
- For an element whose content must never wait:  `<ui-root>`, which holds the whole page.  Its `render()` MUST
  look right unstyled (inline styles only) until `isReady`.

- Not the same as a source element's loading (`SourceElement.loadStatus`):  this is the element itself being
  styled and drawn.
```

AFTER

```text
- For an element whose content must never wait:  `<ui-root>`, which holds the whole page.
  Its `render()` MUST look right unstyled (inline styles only) until `isReady`.

- Not the same as a source element's loading (`SourceElement.loadStatus`):
  this is the element itself being styled and drawn.
```

Shows "Break lines at phrases":
- first bullet:  only 3 words of the new sentence fit on the line, so the sentence starts the next one
- second bullet:  the phrase after the colon would leave a short tail, so the whole phrase moves down

### "The fork's instance API"

From `packages/ui/src/elements/DOMElement.ts` (then `UIHost.ts`), before commit `8c5dfdac`.

BEFORE

```ts
/** The fork's instance API. */
declare addPropertyChangedCallback: SolidElement["addPropertyChangedCallback"]
declare addReleaseCallback: SolidElement["addReleaseCallback"]
declare dispose: SolidElement["dispose"]
```

AFTER

```ts
/** solid-element's:  call back on every write to a prop, equal or not (`@controlled`). */
declare addPropertyChangedCallback: SolidElement["addPropertyChangedCallback"]

/** solid-element's:  call back when the element is released (`dispose()`), newest first. */
declare addReleaseCallback: SolidElement["addReleaseCallback"]

/** solid-element's:  release the component and everything it holds;  idempotent.  `keepAlive` waits for it. */
declare dispose: SolidElement["dispose"]
```

Shows "Name things by what they are":
someone who doesn't know the scheme can't tell what "the fork" is, or what its "instance API" does.
The after names the package, and gives each member its own docstring saying what it does.

### A class docstring:  `UIHost`, now `DOMElement`

From `packages/ui/src/elements/DOMElement.ts`, before commit `8f9d2d3c` (branch `wwod-spell-ui`, P15).
That commit also renamed the classes (`UIHost` to `DOMElement`, controller to component):
the rules don't ask for renames, only for the text around them.

BEFORE

```ts
/****************
 * ### `UIHost`
 * Base class of every element's HOST -- the `BaseElement` option `@spell-app/solid-element` extends.
 * - The fork owns the platform plumbing:  shadow root (`shadowRootInit`, `delegatesFocus`), `ElementInternals`
 *   (`internals: true`), prop accessors, the upgrade step, lifecycle.  This class keeps what is OURS:  the
 *   `ready` promise, custom states, the controller link and the disabled-click guard.
 * - The per-element logic is a `UIElement` controller, created once by the render function;  with `keepAlive`
 *   it lives until `dispose()`, across moves.
 * - NOTE: prototype members here are checked by the fork against prop names;  never add one that a
 *   vocabulary attribute could be called.
 ****************/
```

AFTER

```ts
/****************
 * ### `DOMElement`
 * The base class of every Spell UI DOM element:  the `<ui-button>` in the page, with its attributes,
 * properties and events.  As the platform's `<a>` is an `HTMLAnchorElement`, a `<ui-button>` is a `DOMElement`.
 *
 * - Its COMPONENT (a `UIComponent` subclass, `UIButton`) holds the state and draws the shadow DOM:
 *   `domElement.component` points at it, `component.domElement` back here.
 *   solid-element builds the component the first time the element connects, and with `keepAlive`
 *   it lives until `dispose()`, across moves.
 *
 * - solid-element (`@spell-app/solid-element`) extends this class for every tag (its `BaseElement` option),
 *   and owns the platform's plumbing:  the shadow root (`shadowRootInit`, `delegatesFocus`),
 *   `ElementInternals` (`internals: true`), a property per attribute, upgrading, the lifecycle.
 * - This class adds what is OURS:  the `ready` promise, custom states,
 *   the link to the component, and swallowing clicks while the component is disabled.
 * ...
 * - NOTE: solid-element refuses a prototype member named like a property it makes for an attribute:
 *   never add one a vocabulary attribute could be called.
 ****************/
```

Shows all four rules at once:
- what it IS comes first, with a comparison the reader already knows (`<a>`, `HTMLAnchorElement`)
- "solid-element", never "the fork";  "swallowing clicks while the component is disabled",
  not "the disabled-click guard"
- the run-together "owns ... keeps" bullet is two bullets now
- lines break at phrases:  "and owns the platform's plumbing", "the link to the component"

### A class docstring:  `UIElement`, now `UIComponent`

From `packages/ui/src/elements/UIComponent.tsx` (then `UIElement.tsx`), before commit `ba1b158e`.
The first lines of each.

BEFORE

```ts
/****************
 * ### `UIElement`
 * Base CONTROLLER of every component:  one instance per element, created by the render function the fork
 * (`@spell-app/solid-element`) calls, holding the component's signals, memos and handlers as fields and methods.
 * - Why a class around a render function:  the library's unit is a function `(props, { element }) => JSX`;
 *   a class keeps the repo's conventions (`@proto static` defaults, methods over loose helpers, one exported
 *   class per file) and gives `this.attrs` / `this.emit()` / `this.classes()` to every component.
 * - `attrs`:  the fork's props -- converted, canonical attribute values, one signal each.
```

AFTER

```ts
/****************
 * ### `UIComponent`
 * The base class of every Spell UI component.
 *
 * Each `<ui-button>`, etc on a page gets ONE instance of its UIComponent's subclass (`UIButton`)
 * which decides what the element shows and how it behaves.  This is the base for those subclasses.
 * ...
 * - **Attributes**:  every DOM element attribute has a getter/setter on the component,
 *   under its name in camelCase:  `this.size`, `this.closeIcon`.
 *   The value is already converted (`"true"` => `true`).
```

Shows "Writing for people":
- the before opens with how it's built (a render function, signals, memos), then why it's a class
- the after opens with what a component is, and what one does on a page
- the fork shows up once, where solid-element is introduced, with why it's a fork at the end of that bullet

The after isn't perfect yet:
further down, its "Custom-element wrapper" bullet still puts three sentences on two lines.
The checker below flags it.

### A "Built / Checked" line in a plan doc

A plan doc's phase notes, in the shape Owen pasted (2026-10-10, epic `airplane`;  the settings here are a
reconstruction).  His words:
"In plan docs and elsewhere, text with file paths is hard to parse ...
Text is waaaay to dense to parse quickly ... That is gobbeldygook."

BEFORE

```text
Built: buildTsx(), packages/spell/src/node/buildTsx.ts:40

Checked: tsc --noEmit with jsx: "preserve", jsxImportSource: "solid-js", types: ["@spell-app/app/jsx"],
paths from tsconfig.base.json resolved against the repo root (cwd is a temp dir), experimentalDecorators: false.
```

AFTER

```html
<p>Built:  <code title="packages/spell/src/node/buildTsx.ts">buildTsx()</code></p>

<p>Checked:  the type check now understands Spell UI pages.</p>
<ul>
  <li>It reads JSX the way app and ui do.</li>
  <li>It adds app's types for <code>&lt;ui-*&gt;</code> tags, because <code>@spell-app/ui</code> doesn't ship any.</li>
  <li>It finds <code>solid-js</code> and the other packages in the repo, even though it runs from a temporary folder.</li>
  <li>Decorators are checked as standard decorators, not the old experimental kind.</li>
</ul>
```

Shows "Plain text, plain paths":
- the path is the name's browser tooltip (`title`), not a second code span;
  the doc-links tool still links the name to the file, so a click opens it
- a plain lead line says what the checks add up to;  then one fact per bullet
- the exact settings (`jsx: "preserve"` ...) are gone from the prose:
  when a reader needs them, they go in a folded code block (`<epic-code>`, `ui-accordion.spell-code`)
- no insider shorthand:  "a temporary folder", not "cwd is a temp dir"

In Markdown, which has no tooltips, the name is a link:
`` [`buildTsx()`](packages/spell/src/node/buildTsx.ts) ``.

## How to check your own text

1. Read only the first few words of each line, top to bottom.
   Can you tell what each line is about?  If not, it starts mid-phrase:  break earlier.
2. Look at each line's end.
   Does it end with the first 1-4 words of a new phrase?  Move them down.
3. Look at each line after a break.
   Is it only a few words, the tail of a phrase?  Move the whole phrase down instead.
4. Count the sentences in each paragraph or bullet.
   3 or more:  a short lead, then bullets, one idea each.
5. Look for words only the builder knows:  "the fork", "the hack", "the old X", "the new X".
   Would someone new to the folder know what each one names?
6. Read the first line of each docstring.
   Does it say what the thing IS?  Is any "why" after that, not before?
7. Look for file paths in the prose, and sentences with 3+ code spans.
   Name the thing, its path in its tooltip;  move the exact settings into a folded code block.
8. Compare with the old text:  every fact, number and caveat is still there.

## The tools

- `spell dev docs fuss <paths...>` (or `--branch`):  the checker.
  It lists the misses a tool can find, by file and line:
  lines ending in a new phrase's first words, bullets of 3+ sentences, words like "the fork",
  file paths in a page's prose, sentences of 3+ code spans.
- The plan-doc tool (`spell dev plan-doc`) turns a name and its path, handed to it as HTML,
  into the name with its path as the tooltip (`packages/epics/src/tool/PLAN-DOC.md`, "The way in").
- `/fussbudget`:  the skill.
  It reads this file and WWOD §6 whole, runs the checker, then rewrites the text in place, uncommitted:
  the diff is the proposal.  `/fussbudget` alone asks what to cover.
- Every epic's Doc Review runs both, on the branch and its plan doc.
