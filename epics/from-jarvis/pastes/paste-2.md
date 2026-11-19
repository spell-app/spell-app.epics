Phase: runtime copies share core, so an app's elements never get defined
In one line
In the production build, the editor's "isolated" runtime copies (layout Spell, Tests card) share one core object with the main runtime, but each has its own View. Whichever copy loads last replaces core.defineElement, which then rejects every view class the app's program declares. No custom element gets defined, the app draws as plain unknown tags, and nothing is logged.
What the person sees
http://localhost:3000/edit/@spell/examples/Solitaire/Solitaire.spell (any app can hit this, Solitaire just shows it clearly):
* The app pane draws the toolbar, then empty space where the piles should be.
* The Views tree has Segment and Container at the root, with children named by raw tag (Solitaire-stock-pile, Solitaire-column …). Solitaire sits beside them, marked hidden, holding Deck, Stock Pile, Foundation … all hidden.
* Expected: Solitaire is the root, and Stock Pile "stock", Column "C1" … are drawn inside Container.
* Console: clean. "Example executed without errors."
It's a race, so it shows up on some loads and not others. It reproduced reliably this way:
1. Load /edit/@spell/examples/Solitaire/Solitaire.spell. It worked.
2. Navigate to /edit/@spell/examples/Solitario/Solitario.spell.
3. Navigate back to /edit/@spell/examples/Solitaire/Solitaire.spell with a full page load. It broke.
Setup: jarvis-spell running spell server local from the packaged spell-0.8.9.tgz, so the editor is the prod build (app/app/dist/spell-runtime.js + assets/*.js chunks), not Vite dev.
The mechanism
1. Each view class registers its tag as it's declared: static elementTag = core.defineElement(this, "Solitaire")
2. defineElement returns undefined unless isViewClass(Class), which checks prototype instanceof View || prototype instanceof ViewableList. Here View is the binding inside the module that defined defineElement (parser src/core/elements.ts).
3. loadRuntime(url) (app src/app/runner/loadRuntime.ts) makes a "copy" of the runtime: it fetches spell-runtime.js, rewrites its relative imports to absolute URLs of the same /assets/*.js chunks, and imports it as a blob.
    * In the prod bundle, View (var U, exported U as View) and isViewClass are inside spell-runtime.js, so each copy gets a new View.
    * core (l) is imported from a shared chunk, assets/checking-*.js, so every copy gets the same core object.
    * Each copy re-runs Object.assign(l, elementsMethods) and its other Object.assign(l, …) lines, so the last copy loaded wins core.defineElement, core.elementFor and the rest.
4. Who loads a copy in prod:
    * layoutRuntime() → loadRuntime(runtimeUrl()) (src/app/layout/layoutSpell.ts), through loadEditorSpell(), called on startup by pages/SpellEditor and solid/MenuBar.
    * editor.runTests() → testsCopy → loadRuntime(runtimeUrl()) (src/app/editor.ts), from the Inspector's Tests card.
5. If the layout copy finishes after the main runtime, every defineElement call from the app program returns undefined. The microtask never tells elementDefiner, draw() emits h("solitaire-column", …) for a tag that was never defined, and drawThing/elementFor find no tag on the class. Nothing throws, so nothing is logged.
Evidence (taken in the broken page)
* customElements.get("solitaire-app" | "solitaire-card" | "solitaire-column" …): all undefined.
* The app's Solitaire class has its own elementTag property, and its value is undefined.
* class Zed extends runtime.View {}; runtime.core.defineElement(Zed, "Probe") → undefined, while Zed.prototype instanceof runtime.View → true.
* Loaded one extra copy by hand, the same way loadRuntime does:
    * copy.core === main.core → true
    * copy.View === main.View → false
    * core.defineElement(class extends main.View {}, "Probe") → undefined
    * core.defineElement(class extends copy.View {}, "Probe") → "probe-b"
* function isViewClass( and the element-tag symbol occur only in spell-runtime.js, not in any assets/*.js chunk, so the copy is the only second source of these definitions. A duplicate inside the bundle is ruled out.
Fix: options, best first
1. Build spell-runtime.js self-contained. Make it its own build entry, with no chunks shared with the editor bundle (inline its dynamic imports, no manualChunks crossing over), so a blob copy of it really is a separate runtime. This fixes the bug and the isolation both layout and tests assume they have.
2. Copy the whole graph in loadRuntime. Rewrite each relative import into its own blob, recursively, with a per-copy cache, instead of pointing at the shared chunks. This fixes the same things as option 1 without touching the build, but loading each copy costs more.
3. Weaker, a stopgap only: make isViewClass not depend on which module's View it holds, for example by checking a brand like Symbol.for("spell-parser:view") set on View and ViewableList. That un-breaks element definitions, but the copies still share and overwrite all of core's state and methods: things registry, console, elementDefiner, isCarryingOver and so on.
Recommendation: option 1, and option 3 as well if a quick unblock is needed first.
Also check Vite dev: there, spellRuntime.ts?layout-copy only puts a query on the top module, so its imports, core among them, are probably shared too. View would be shared as well, so this symptom likely doesn't show, but the isolation is probably just as false. Not verified.
Done when
* A runtime copy loaded by loadRuntime (prod) has its own core: copy.core !== main.core.
* Loading the layout copy and the tests copy in any order relative to the main run leaves the app's elements defined.
* A regression test: load the main runtime, load a copy, then run a program that declares a view class. Its tag gets defined, and core.defineElement on a main-View subclass returns a tag.
* The reproduction steps above draw Solitaire with Solitaire as the root of the Views tree, on every load.
* If defineElement gets a class that extends a View it doesn't recognise, it logs a warning instead of silently returning undefined, so the next mismatch isn't invisible.
Where things are (paths as the dist's source comments name them)
* parser src/core/elements.ts: defineElement, isViewClass, tellDefiner, elementFor
* app src/app/runner/loadRuntime.ts: loadRuntime, absoluteImports, RELATIVE_IMPORT
* app src/app/layout/layoutSpell.ts: layoutRuntime, loadEditorSpell
* app src/app/editor.ts: runtimeUrl, TESTS_COPY, runTests, the app run (runtime.runApp(compiled, { coreUrl: runtimeUrl(), … }))
* app src/app/runner/runCompiled.ts: how the program is linked to coreUrl
* Prod output: app/app/dist/spell-runtime.js plus app/app/dist/assets/checking-*.js (holds core)
