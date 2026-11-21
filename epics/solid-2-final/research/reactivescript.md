# ReactiveScript:  what it is, and what Spell can take from it

Research notes for epic `solid-2-final`'s "Solid 2 analysis" page (agent `solid-2-final-reactivescript`, 2026-11-20).
- Owen's ask:  "Check this out -- anything we can steal? https://reactivescript.dev/"
- Read:  reactivescript.dev, the repo `solidjs/reactivescript` cloned at `6a15093` (2026-11-20), its guide, spec,
  compiler, runtime, eval results and its GitHub issues;  Solid's Vite plugin options page;
  Spell's side in the worktree `~/www/spell.worktrees/solid-2-final`.
- `(inferred)` marks a guess;  everything else was read.
- Paths `rx:<path>` are in the ReactiveScript repo (https://github.com/solidjs/reactivescript/blob/main/<path>).

## 0. The answer in one screen

- **What it is:**  a small language, files `.rx`, that compiles to plain Solid 2.
  TypeScript's expressions and JSX, plus a few reactive words (`source`, equations, `action`, `effect`, `guess`,
  `loading`, `errored`).  Its point is a CHECKER:  it refuses, at compile time, the shape mistakes Solid's dev build
  only warns about at run time.
- **Who:**  Ryan Carniato (Solid's author), with Claude writing most commits (GitHub's contributors list, 2026-11-20:
  `claude` 293, `ryansolid` 108, three others 5).  In the `solidjs` GitHub org, MIT, copyright Ryan Carniato 2026.  Repo created 2026-10-21;
  `@reactivescript/compiler` 0.3.1 on npm since 2026-11-09.  129 stars.  "Experimental";  breaking changes until Solid 2 is final.
- **Its Vite story is the one Spell would copy:**  Solid's Vite plugin has a `frontends` option, a compile function
  per file extension;  `.rx` is built in, and anyone else's extension (`.spell`) goes in by one line of config.
- **Steal, ranked:**
  1. A `.spell` front end for Solid's Vite plugin:  a Spell project imported into any Solid app, with HMR and Solid's
     own build passes.  Effort M.  The best thing for the ecosystem goal.
  2. A diagnostics page:  every error has a code, the rule it enforces, and a "why, and the fix" section that the
     error links to.  Effort S to M.
  3. The lesson for Q5 (Spell actions inside Solid's `action()`, this epic):  when every write in an action waits
     for its end, the "clear the box now" writes break, and people (and AIs) fall back to hand-written request
     counters.  Decide which writes show at once BEFORE building it.  Effort S (a decision), M (built).
  4. A lint for a drawing that reads something that can fail with no `if that fails` (Spell already has the words).
  5. Timing scenarios:  program, clicks and answers, expected screens, run against Solid itself;
     the right test bed for Option B and actions-in-`action()`.
  6. An AI-writability eval, preregistered, against React.
- **Plugging in `.spell`:**  doable;  Spell already has the core of it (the editor's `compiledSpell()` Vite plugin).
  The work is the runtime (`@spell/core` on the host app's Solid), the entry and project model, and source maps.
  It helps the listing:  "Spell components in any Solid app, one line in `vite.config`" is a listing Solid's
  people can try.  Not before December 1 (inferred:  the M effort plus Spell UI's own Solid 2 install blocker, Q2).
- **Avoid:**
  - its read-after-write rule (after `x := v`, `x` still reads the old value):  the opposite of Spell's
  - holding the whole screen while anything downstream loads:  its held-out eval task went badly because of it
  - refusing to compile instead of drawing a sensible default:  Spell's `<for>` already draws a loader, Try again
    and the empty message by itself
  - a 35,000-word spec as the way in:  agents took 2.4 times the tokens of React

## 1. What ReactiveScript is

### 1.1 The words

From rx:`guide/language.md` and rx:`guide/reference.md`:

| Form | Meaning | Lowers to (rx:`spec/11-compiler.md` CP-4b) |
| --- | --- | --- |
| `source count := 0` | state;  only a source is written, with `:=` | `createSignal`;  a structured value `createStore` behind a signal |
| `double = count * 2` | an EQUATION:  always true, recomputed when its inputs change;  never written | `createMemo` |
| `source user = await fetchUser(id)` | a source with a QUESTION:  re-asked when `id` changes, writable locally | `createSignal(fn)` / `createOptimistic` / `createStore(fn)` |
| `user = await fetchUser(id)` | an async equation:  a stale answer is dropped | `createMemo` over the flight |
| `rows key id = items` | a keyed collection (rows keep identity) | `createMemo` + `createProjection` |
| `action save(x) { ... }` | writes and awaits;  ONE change across its awaits | Solid's `action()` over a generator |
| `guess likes := likes + 1` | optimistic:  shown now, reverted if the action fails | `createOptimistic(Store)` |
| `refresh x`, `affects x` | re-ask quietly;  mark `x` pending until the action ends | `refresh`, `affects` |
| `pending? x`, `latest x`, `peek(x)` | the probes:  in flight?  the value it's moving to;  read untracked | `isPending`, `latest`, `untrack` |
| `effect (a, b) { log($0) }` | runs after an instant where `a` or `b` changed;  its writes are a new instant | `createEffect(compute, apply)` |
| `onFlush(() => { ... })`, `onSettled(...)` | land a write NOW, inside a held action;  run when the change commits | -- |
| `{loading fallback {...} {...}}`, `{errored fallback(e) {...} {...}}` | boundaries | `<Loading>`, `<Errored>` |
| `{if c {...} else {...}}`, `{for x in xs {...}}` | control flow in markup | `<Show>`, `<For>` |
| `use name` / `provide name = e` | context, read-only | `createContext` / `setContext` |
| `error NotFound(id) => ...` | a named error class | a subclass of `Error` |
| `server fn` | runs on the server | Solid's `"use server"` |
| `<style>` | scoped CSS | Solid's TSRX style engine |

- No `let` at the top level or in a component:  a changing value is a `source`;  a computed one an equation.
- No `for` / `while` loops, no `this`, no `function`, no `new` on reactive values;  `console` and `window` are out of
  scope (`log(...)` prints;  anything else comes in through an import).
- Imports say whether a JS function is safe to call from an equation:  `import pure { fetchUser } from "./api"`.

### 1.2 Reads and writes, in the order they happen

- A write happens only in imperative code:  a handler, an `action`, an effect's apply block (W-1, W-2).
  Only the block that declares a source writes it;  importers and props get an action instead (W-5, O-4).
- **All the writes of one run are one INSTANT, and nothing sees them until the run ends, the run itself included:**
  "after `x := v`, `x` still reads the old value. Keep the new value in a local (`let n = count + 1; count := n`)."
  (rx:`guide/language.md`, "Imperative code";  W-3, W-4, H-10.)  This is Solid 2's staged write, made a language rule.
- **An instant is HELD while anything downstream of it is loading** (H-2):
  in `open := false; page := 2`, the menu closes only when page 2 lands.
  `onFlush(() => { open := false })` lands a write on its own.
- **An action is one change across its awaits** (AC-1):  every plain write in it is held until its body returns;
  `guess` shows at once and reverts on failure;  a failure must be caught inside it (`UNCAUGHT_ACTION_FAILURE`).
- **Async is an `await` in an equation.**  Re-asked when inputs change;  an older answer is thrown away (R-4).
  The checker tracks that the value can be pending and can fail, and REFUSES a reader with no `loading` /
  `errored` boundary above it (`UNHANDLED_FAILURE`, R-f-5).
- Props stay live, destructured too;  `source draft := peek(props.x)` is a one-time seed.

### 1.3 The checker

- Diagnostics keep Solid's codes where Solid has one (`UNHANDLED_FAILURE`), plus its own (`WRITE_TO_NON_SOURCE`,
  `GUESS_WHILE_LOADING`, `HELD_WRITE`, `STALE_CAPTURE`, `STALE_WRITE_BACK`, `ARGUMENT_COUNT` ...).
- Each message names the rule (`[W-1]`) and usually the fix:
  `counter.rx:5: error WRITE_TO_NON_SOURCE [W-1] double is an equation: only sources are written`.
- rx:`guide/diagnostics.md` (1,264 lines) has a section per code:  why, and the fix.
  The Vite front end prints, after the errors, one link per code to that section (rx:`compiler/vite.mjs`, `report`).
- rx:`spec/99-diagnostics.md` bins every Solid 2 dev diagnostic:  unwritable (the language can't express it), static
  (the checker refuses it), or runtime.

### 1.4 How it compiles

- `ref/` is the reference implementation in TypeScript (parser, checker, interpreter, compiler, five runners);
  `compiler/` is the production compiler, a Rust crate `rxc` ported from it, on Solid's own Rust compiler
  (`solidjs-compiler`'s `compile_program`, as an `oxc_ast::Program`).  Shipped as a Node-API binary per platform,
  plus a WebAssembly build.
- A whole PROGRAM is checked and compiled from its entry (CP-2), not one file at a time:
  "`transform()` is Solid's public contract: one source module in, one module out, no state between calls.
  ReactiveScript's checks are whole-program".
- Compiled code calls a small runtime, `@reactivescript/runtime` (`__rt.source`, `__rt.memo`, `__rt.action` ...),
  each helper a Solid primitive or a composition of them;  "nothing in it adds run-time behaviour beyond Solid".
- A module's default export is a function of the app:  `createApp({ root }).mount(main(app))`.
- What compiled code looks like (rx:`ref/compile/README.md`, the view then goes through Solid's JSX compiler):

  ```js
  const [v$count, w$count] = __rt.source("count", __rt.untrack(() => 0));
  const v$double = __rt.memo("double", (__prev) => (v$count() * 2), undefined);
  __rt.effect(1, () => [v$double()], ($p) => __rt.untrack(() => __B.log(__rt.snapshot(v$double))));
  return <><p>{__rt.show(v$double())}</p></>;
  ```

### 1.5 Tooling

- VS Code extension (Marketplace and Open VSX), a language server (`npx @reactivescript/language-server --stdio`):
  TypeScript's hover, go to definition, rename, completion and type errors on `.rx`, plus the checker's diagnostics.
- Types:  the program is projected to TSX and TypeScript checks it (rx:`spec/13-types.md`);  `rx-tsc` is `tsc` with
  `.rx` in the program, for CI.  Vite compiles without type-checking, as it does `.ts`.
- Source maps onto `.rx`, by line (CP-1c).
- A tree-sitter grammar (`tooling/tree-sitter-rx`, merged 2026-11-20).
- Solid libraries:  declared once in a `.d.rx` file (`export pure fn createMediaQuery(query: string): ref boolean`);
  `ref T` is an accessor the compiler reads for you (rx:`guide/libraries.md`).
- No playground (reactivescript.dev links none);  the checker runs from the repo with
  `node --experimental-strip-types ref/check.ts examples/todo.rx`.

### 1.6 Vite:  the `frontends` option

From https://docs.solidjs.com/reference/vite-plugin-solid/options:

```ts
frontends: Record<string, Frontend>   // default {}, plus the built-in .rx
compile(source: string, context: {
  id: string          // the module's file path
  moduleId: string    // its full id, query included
  ssr: boolean
  root: string        // Vite's resolved root
  solid: SolidOptions // what the plugin would pass @solidjs/compiler for a JSX module here
  addWatchFile(file: string): void
}): { code: string; map?: string | object | null; css?: string } | null
```

- "A front end usually ends in `@solidjs/compiler` with `context.solid`, so its output matches the environment's
  `generate`, `hydratable`, and `moduleName`.  From there the module goes through the lazy and refresh passes and
  server-function compilation, and `css` is imported as a CSS module."
- `.jsx`, `.tsx`, `.tsrx` can't be claimed;  return `null` to leave a module to the rest of the pipeline.
- `.rx` loads `@reactivescript/compiler/vite` by itself when the package is installed;  anyone else names theirs:
  `solid({ frontends: { ".spell": spell() } })`.
- rx's front end (rx:`compiler/vite.mjs`, ~120 lines):
  - an `.rx` module JavaScript imports is an ENTRY;  the program is compiled whole from it, cached by file times
  - dependencies are re-imported as `./x.rx?rx-dep` and served from the entry's build
  - a failed check throws, and Vite shows the diagnostics
  - "Not yet: hot updates of `.rx` modules are untested" (rx:`compiler/README.md`)

### 1.7 Is it worth it?  Their own eval

rx:`eval/` runs fresh agents building the same apps in `.rx` and in React (and later XState, Foldkit, "Exact",
vanilla), judged by hidden browser tests that land server answers in adversarial orders.
- Pilot (2026-10-27, rx:`eval/results/pilot-2026-10-27/README.md`):  no difference in defects (0 of 9 each);
  `.rx` 73 lines against 168, but 2.4 times the tokens and 2.5 times the check cycles;  3 of 9 `.rx` runs avoided
  actions and wrote React-style sequence numbers, because "a plain write in an action that awaits is held until the
  action ends, so 'clear the old error at once' doesn't happen".
- Round 15 (2026-11-16, 144 apps, rx:`eval/results/round15-2026-11-16/README.md`):  on the task the guide was written
  around, `.rx` had the fewest defects (Opus 0.00, Haiku 1.50, against React 3.17 / 9.00).  On the held-out task
  (a board), `.rx` was among the worst (Opus 6.33, Haiku 25.17, against React 0.67 / 3.00).  None of the three
  preregistered hypotheses held.  Traced cause:  agents kept "guess ledgers" laid over the server's answers, then got
  the hand-written writes on accept wrong;  plus holds by design, and Solid bugs filed upstream
  (solidjs/solid#4969, #5077, #5090, #5095, #5104).

### 1.8 Open issues worth knowing (2026-11-20)

- #76, #77, #75:  a write waits for an UNRELATED action when some equation reads both sources.
- #79:  `ref={...}` reading an equation trips `STRICT_READ_UNTRACKED`.
- #84:  the Vite front end keeps serving a failed build after the broken import is fixed.
- #83:  bare `.rx` specifiers through `node_modules` (libraries shipping `.rx` source) not yet.
- #73:  compiler 0.3.1 turns `"\n"` into `"n"` in string literals.

## 2. Side by side with Spell

The same counter, three ways.  The Spell is real:  compiled with `spell compile --stdout` on 2026-11-20.

```rx
// ReactiveScript
export default component Counter() {
  source count := 0
  double = count * 2
  <button onClick={() => { count := count + 1; log(count) }}>{count} × 2 = {double}</button>
}
// log(count) prints the OLD value:  "after x := v, x still reads the old value"
```

```spell
a "counter" is a view
	its "count" is a number
	its "doubled" is its count * 2
	to increment it
		set its count to its count + 1
		print its count
	to "draw it"
		<button onClick={increment it}>{its count} x 2 = {its doubled}</button>
```

```js
// Spell's compiled JavaScript (trimmed):  a class, a custom element, a getter for the worked-out value
export class Counter extends View {
  static elementTag = core.defineElement(this, "tally")
  static { this.declareProp("count", { type: "number" }) }
  get count() { return this.getProp("count") }
  set count(value) { this.setProp("count", value) }
  get doubled() { return this.count * 2 }
  increment() {
    this.count = this.count + 1
    core.console.log(this.count)     // prints the NEW value
  }
  draw() {
    return h("ui-button", { onClick: core.pressed(this, () => this.increment()) },
      () => this.count, " x 2 = ", () => this.doubled)
  }
}
```

```js
// The Solid both stand on
const [count, setCount] = createSignal(0)
const double = createMemo(() => count() * 2)
<button onClick={() => setCount(c => c + 1)}>{count()} × 2 = {double()}</button>
```

| Feature | ReactiveScript | Spell today |
| --- | --- | --- |
| Reactive variables | `source x := 0`;  written only with `:=`, only in handlers / actions / effects | `its "x" is a number`;  `set its x to 1` anywhere;  spell cells, bridged to Solid (Option B:  trackers on Solid signals) |
| Read after write | the OLD value until the run ends | the NEW value, always (`set x to 1;  print x` prints 1) |
| Derived values | equations, `x = e`;  writing one is an error | worked-out properties, `its "doubled" is ...`;  a getter |
| Effects | `effect (a, b) { ... }`, its writes a new instant;  may not write what it reads | `when its score changes`;  `when a recipe changes`;  `when someone else changes it` |
| Async / loading | `await` in an equation;  `{loading fallback {...}}`;  REFUSES a reader with no boundary | a getter that waits, with no word;  the drawing shows `…` then fills in;  `while waiting`, `if that fails`, `if there are none` riders;  `<for ... empty="...">` draws all three by itself |
| Probes | `pending? x`, `latest x` | none in the language (inferred:  `Loadable` status exists underneath) |
| Lists | `{for x in xs {...}}`;  `rows key id = ...` keyed | `for recipe in the matches`, `draw each card in the deck`;  things have identity, so lists are keyed by the thing |
| Components | `component Name(props) {...}`, JSX inside | a VIEW is a template;  every view is its own custom element (`<tally-counter>`) |
| Events | JSX `onClick={() => {...}}` | `<on click>`, `on mouse down`, `send flipped to the card`, `trigger card-click`, a chain (thing, its list, the app) |
| Refs | `ref` accessor;  `ref={...}` | not in the language;  Spell UI's `ref=` in its own code |
| Stores | a structured `source`, per-path writes `xs[i].done := v` | things and lists of things in cells;  nested JSON via a proxy (Q6 A) |
| Actions | `action f() {...}` one change across awaits;  `guess`, `refresh`, `affects`, `onFlush` | `to f it`;  waits inferred project-wide, no `await` word;  `at the same time`, `meanwhile`;  to run inside Solid's `action()` (Q5 B) |
| Optimistic | `guess x := v` per action | a place shows a write at once, keeps it on the device until the place says yes, heals after a refusal (`PendingChanges`) |
| Server | `server fn`, streamed SSR + hydration | places (web servers, sheets, rooms ...);  a Python target on Quart;  static SEO render, no hydration |
| Types | TypeScript types, checked through a TSX projection | its own type words (`as a number`, `one of ...`);  a `ts/solid` target checked by `tsc` |
| Tooling | VS Code extension, LSP, `rx-tsc`, tree-sitter, Vite built in | VS Code extension, LSP, the editor app with live compile, `spell lint --fix`, Spanish |
| Errors | coded diagnostics with rule ids, a fix page per code | `spell lint` by file, line, column;  `/* PARSE ERROR: Don't understand "..." */` |
| Who writes it | programmers who know TypeScript and Solid;  AIs | people new to programming, in English or Spanish;  AIs |

## 3. What to steal, ranked

1. **A `.spell` front end for Solid's Vite plugin.**
   - Gives:  a Spell project's views usable as components and elements in any Solid app, with Vite's HMR and Solid's
     build passes;  "try Spell inside your Solid app" for the ecosystem listing.
   - Lands:  a `spell/vite` export (inferred name), grown from the editor's `compiledSpell()` (`app/app/vite.shared.ts`,
     which today spawns `spell compile --stdout` and returns the JS as TEXT) into one returning a MODULE.
   - Effort:  M (section 4).  Conflicts:  none with decisions made;  it needs "one Solid per page" to mean the HOST's Solid.
2. **A diagnostics page with a code per error, linked from the error.**
   - Gives:  a person (or an AI) stuck on an error gets why and the fix, in the editor and in `spell lint`.
   - Lands:  `SpellWarnings` (`parser/src/spell/SpellWarnings.ts`) gets codes;  a guide page, a section per code;
     the LSP's hover and `spell lint` print the link.  English and Spanish.
   - Effort:  S to M.  Conflicts:  none.
3. **Decide which writes inside a held action show at once (for Q5's build).**
   - Gives:  "clear the box, close the menu, now" keeps working when a Spell action runs inside Solid's `action()`.
   - Their evidence:  holding every write until the action ends sent 3 of 9 agents back to hand-written request
     counters (pilot finding 1), and their fix (`onFlush`, written twice) is the hardest page of their guide.
   - Lands:  the actions-in-`action()` work (Q5 B, this epic):  the compiler marks where the action first waits.
   - Effort:  S to decide;  part of Q5's M.  Conflicts:  none;  it sharpens Q5.  NEW Spell phrase only if option B of
     the question below is picked.
4. **A lint for a drawing that reads something that can fail, with nothing saying what to show.**
   - Gives:  a program never shows a blank where a place's answer failed.
   - Lands:  the compiler already knows which reads reach a place (`drawRead()`);  a WARNING (not a refusal) when a
     drawing's loop over a place's list has no `if that fails` and isn't a `<for>` tag.
   - Effort:  M.  Conflicts:  none;  no new phrase (the riders exist).
5. **Timing scenarios run against Solid itself.**
   - Gives:  proof that Option B's guard and actions-in-`action()` show the right screen in every order of clicks and
     answers.
   - Lands:  a test format in `parser`'s core tests:  a program, a list of clicks and answers, the screen after each.
     Spell's English tests (`to test ...`) could be the program half.
   - Effort:  M.  Conflicts:  none.
6. **An AI-writability eval.**
   - Gives:  a number for "AIs write Spell well", preregistered, against React.
   - Lands:  its own epic (inferred).  Effort:  M to L.
7. Smaller:
   - a probe for "updating":  `latest` / `pending?` show work going on without hiding what's there.
     Spell has no word;  a NEW phrase would need Owen's OK (e.g. `if the matches are updating`:  misread risk,
     "updating" vs a first load, and vs a property named `updating`).
   - declaring a Solid library once (`.d.rx`) so programs can use Solid Primitives:  Spell's JS imports could take the
     same idea.  Effort M.
   - a tree-sitter grammar, so GitHub and Zed colour `.spell`.  Effort S to M.

## 4. Spell as a `frontends` entry

What it would take, in the order a `.spell` file would travel:
1. **The front end.**  `compile(source, ctx)` finds the project the file belongs to (its `__project.json5`), compiles
   the WHOLE project (a class takes members from every file, `hoistClassMembers()`, so one file alone can't compile),
   and returns that file's module.  rx's front end does exactly this with entries;  ~120 lines.
   - Where:  the parser is TypeScript, so it can run in Vite's own process (no binary), or spawned as today.
   - Its output:  Spell writes JS that draws with `h()` from `@spell/core`, not JSX;  the front end returns it as is
     (no `@solidjs/compiler` step needed), or the `ts/solid` target's JSX through `@solidjs/compiler` with `ctx.solid`
     (then SSR's `generate` comes free;  inferred).
2. **The runtime on the host's Solid.**  `@spell/core` must import the host app's `solid-js`, not a copy:
   Spell's one-Solid-per-page build (`spell-solid.js`) is the editor's;  in a host app, Vite's own resolution gives one.
3. **The module shape.**  One module per project today (everything compiled into `<Project>.spell.js`);  a front end
   wants one per file, or every `.spell` import resolved to the project's module (`?spell-project`, as rx's `?rx-dep`).
4. **Source maps** onto `.spell` lines:  none today (inferred).  Errors as Vite errors, with the lint's file/line.
5. **HMR:**  Solid's refresh pass works on components;  Spell's views are classes and custom elements, so the safe
   first step is a full reload of the project (rx's own HMR is "untested").
6. **Config:**  `solid({ frontends: { ".spell": spell() } })`.  Only `.rx` is built in;  asking Solid to build `.spell`
   in too is a later, social step.

What it gives:  `import { Counter } from "./counter/Counter.spell"` in a Solid app, `<tally-counter>` usable in its
JSX;  dev reload;  Solid's lazy, server-function and CSS passes.

The ecosystem goal:  a real "Plugins" or "Build Utilities" entry Solid's people can try in a minute, and the same
door Solid's own author opened for his language.  Order:  after Spell UI installs in a Solid 2 app (Q2's blocker),
so the listing is "Spell UI, and Spell itself as a front end".

## 5. What to avoid

- **Stale reads as a rule.**  ReactiveScript bakes in Solid's staged write:  after `x := v`, `x` reads old.
  Spell's promise is the opposite (cells-and-stores.md);  never adopt it.
- **Holding the screen for anything downstream.**  Their H-2 holds a plain `page := 2` until page 2 loads, and with it
  every other write of that click.  Open issues #75-#77 show writes waiting for unrelated actions;  the held-out
  board task went worst for `.rx`.
- **Refusing where a default would do.**  `UNHANDLED_FAILURE` won't compile a read with no boundary.  For Spell's
  people a warning plus a built-in loader / Try again (as `<for>` draws) is kinder.
- **Hand-made optimistic ledgers.**  Their guide spends pages telling authors not to keep their own lists of pending
  writes;  Spell's places already do optimism underneath, so authors never write it.
- **A spec as the front door.**  35k words of numbered rules;  agents needed 2.4 times React's tokens.
- **Solid's newest optimistic and projection paths.**  Their evals found five Solid bugs there in November
  (#4969, #5077, #5090, #5095, #5104);  Spell should lean on them only with tests of its own.

## See also

- rx repo:  https://github.com/solidjs/reactivescript (README, `guide/`, `spec/`, `eval/`)
- Site:  https://reactivescript.dev/
- Solid's Vite plugin options:  https://docs.solidjs.com/reference/vite-plugin-solid/options
- solid-features.md (the `frontends` row), spell-today.md (2.16, 2.18), cells-and-stores.md, engine-b.md,
  data-paradigm.md (generators)
