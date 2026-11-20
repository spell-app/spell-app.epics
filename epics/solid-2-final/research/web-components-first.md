# Web Components First:  is it true, and how should Spell say it?

Research for epic `solid-2-final`, by agent `solid-2-final-wc-first`, 2026-11-20.

Owen's claim, to test:
"Spell is the first real framework which is 'W3C Web Component First' -- not just widgets,
but the entire app being web components is really revolutionary."

How this was checked:
- Spell's side from the code, read in the `solid-2-final` worktree.
  Links open the main checkout's files (paths from the kit's root).
- Everyone else's side from primary sources, each linked where it's used.
  Quotes are short exact excerpts.
- **(inferred)** marks my own reasoning, not something a source or the code says.

One correction before anything else:
- Spanish programs don't get `<encanto-...>` tags.
  - Spell UI's components become `es-*` tags on a Spanish page:  `<es-boton>`, `<es-menu>`.
  - A Spanish program's views are named from its Spanish words:  `<solitario-carta>`.
  - Source:  [README-spanish.md](../../../../parser/README-spanish.md), its feature table and "Spell UI" section.
  - Only the stories block is `encanto-historias`
    ([PageStories.ts](../../../../app/src/app/pages/PageStories.ts)).

---

## 1. Does the claim make sense?

### Verdict

**As worded, no.**
"The first framework where the entire app is web components" is false, and easy for anyone to disprove.

Whole apps built as web components, years before Spell:
1. YouTube's desktop site, rebuilt on Polymer in 2017
   ([TechCrunch, 2017-05-02](https://techcrunch.com/2017/05/02/youtube-revamps-its-desktop-site-with-an-updated-design-optional-dark-theme-and-faster-framework/)).
2. Firefox's own browser UI:
   "we've completed the process of migrating the Firefox UI to Web Components"
   ([Brian Grinstead, Mozilla, Nov 2019](https://briangrinstead.com/blog/firefox-webcomponents/)).
3. Salesforce:  LWC is "the same framework that powers millions of Salesforce apps"
   ([Salesforce press release, 2019-05-29](https://www.salesforce.com/company/news-press/press-releases/2019/05/192915-e/)).
4. Photoshop on the web:  "the entire Photoshop app is built using Lit-based Web Components"
   ([web.dev, "Photoshop's journey to the web"](https://web.dev/articles/ps-on-the-web)).
5. Reddit:  "mostly ported over entirely to Lit now"
   ([Jim Simon of Reddit, quoted by Simon Willison, 2024-10-01](https://simonwillison.net/2024/Oct/1/jim-simon/)).
6. Microsoft Edge's browser UI, moved from React to web components by its WebUI 2.0 project
   ([Edge blog, 2024-05-28](https://blogs.windows.com/msedgedev/2024/05/28/an-even-faster-microsoft-edge/);
   [The New Stack](https://thenewstack.io/how-microsoft-edge-is-replacing-react-with-web-components/)).
7. Frameworks that say "whole app" on their front page:
   - Lit can "build an entire app" ([lit.dev](https://lit.dev/))
   - Enhance:  "Build your entire app with accessible HTML" ([enhance.dev](https://enhance.dev/))
   - Polymer's PWA Starter Kit:  "full-featured Progressive Web Apps from web components"
     ([github.com/Polymer/pwa-starter-kit](https://github.com/Polymer/pwa-starter-kit), archived)

And the "it's a language" angle has prior art too:
- Imba is a compiled language whose components ARE custom elements:
  "If a component's name begins with a lowercase letter, it will be compiled directly to a native Web Component"
  ([imba.io, Components](https://imba.io/docs/components.md)).

**Even inside Spell, "the entire app" overreaches:**
- The editor's own shell (its pages, menus, panes and dialogs) is Solid function components, not custom elements:
  `spell/app/app/solid` is "the app's UI, all Solid"
  ([app/src/app/AGENTS.md](../../../../app/src/app/AGENTS.md), "Overview").
  - Its top bar, panes and file tabs are moving into Spell itself (`SpellEditor.spell`, same file), so this shrinks.
- Inside every element, the UI is ordinary Solid components:
  "each element draws in a Solid root of its own, so your providers don't reach inside"
  ([ui/README-frameworks.md](../../../../ui/README-frameworks.md), "Solid 2").
- That's the critics' central point, "Elements !== Components" (§4), and Spell's architecture agrees with it.

### What IS true, and rarer

Spell's combination, with the evidence:
1. **A language whose compiler makes every view a custom element named after the program's own types.**
   - `a card is a view` in a solitaire project becomes `<solitaire-card>`, its app `<solitaire-app>`.
   - The compiled class calls `core.defineElement(this, "Solitaire")`;  the page defines the tag
     ([parser/src/core/elements.ts](../../../../parser/src/core/elements.ts), its header and `defineElement()`).
   - A drawn view mirrors its properties as attributes, and refers to other things by reference:
     `pile="Tableau#T1"` ([parser/src/core/AGENTS.md](../../../../parser/src/core/AGENTS.md), "A thing's REFERENCE").
   - Imba also compiles to custom elements, but you name each tag yourself (inferred, from its docs above).
2. **One element layer under everything Spell draws.**
   - Spell UI's 104 tags, Epic UI (`<epic-page>`, `<epic-item>` ...), App UI (`<spell-viewer>`, `<spell-editor>`),
     the brand's set, and every compiled program's views are all written on `spell/element`
     ([src/element/AGENTS.md](../../../../src/element/AGENTS.md), "Overview").
3. **Tags in the program's language.**
   - A Spanish page draws `<es-boton>` and `<es-cuadricula columnas="7">`;  a Spanish view, `<solitario-carta>`
     ([parser/README-spanish.md](../../../../parser/README-spanish.md)).
   - We found no other framework that translates tag names (inferred, after a search:
     the W3C's [non-English tags note](https://www.w3.org/International/questions/qa-non-eng-tags) covers only the rules).
4. **Words, not props, as the element API:**
   Fomantic's vocabulary as attributes (`<ui-button size="small" primary>`), translated per language,
   every tag described by a Custom Elements Manifest ([ui/README-frameworks.md](../../../../ui/README-frameworks.md), "Types").
5. **The newest platform parts, used rather than re-built:**
   ElementInternals, custom states, form association, popover, `<dialog closedby>`, invoker commands,
   anchor positioning (the table in §3).

### Three framings Spell can defend

1. "Spell compiles your program to real HTML elements, named after your own types:
   a solitaire game's card is a `<solitaire-card>` you can inspect, style and script like a `<video>`."
2. "One web-component layer draws all of Spell -- its UI kit, its docs, and every program you write --
   so any piece drops into a page built with React, Vue or no framework at all."
3. "Spell's elements speak your language:  the same game in Spanish draws `<solitario-carta>` and `<es-boton>`."

Each avoids "first" and "entire".
The honest one-liner behind all three:  **Solid inside, web components at every boundary** (inferred).

---

## 2. The prior art

### Who builds what with web components

| Name | What it is | Whole apps as elements? | Notable users | How Spell differs |
| --- | --- | --- | --- | --- |
| Polymer (Google, 2013) | the first big web-components library | yes:  YouTube (2017);  PWA Starter Kit, "full-featured PWAs out of web components" (archived) | YouTube ([TechCrunch](https://techcrunch.com/2017/05/02/youtube-revamps-its-desktop-site-with-an-updated-design-optional-dark-theme-and-faster-framework/));  Chrome's settings pages, now moving to Lit ([Chromium docs](https://chromium.googlesource.com/chromium/src.git/+/HEAD/docs/webui/webui_using_lit.md)) | you write element classes by hand;  no language, no translated tags |
| Lit (Google) | "Simple. Fast. Web Components.", "around 5 KB" | yes, "build an entire app" ([lit.dev](https://lit.dev/)) | Photoshop ([web.dev](https://web.dev/articles/ps-on-the-web)), Reddit ([Simon Willison](https://simonwillison.net/2024/Oct/1/jim-simon/)), Firefox's `moz-*` widgets ([Firefox docs](https://firefox-source-docs.mozilla.org/browser/components/storybook/docs/README.lit-guide.stories.html)), Spectrum, Shoelace, UI5, Carbon, Lion (lit.dev's list) | Lit is a library for element authors;  Spell is a language whose compiler writes the elements;  Spell's base costs ~23x more (§4, 16) (inferred ratio) |
| Stencil + Ionic | "The magical, reusable web component compiler" ([stenciljs.com](https://stenciljs.com/));  Ionic's `ion-*` are built on it | possible:  `ion-router` is "only be used with vanilla and Stencil JavaScript projects" ([Ionic docs](https://ionicframework.com/docs/api/router));  most Ionic apps wrap the elements in Angular / React / Vue | logos on stenciljs.com:  Apple, Amazon, Mastercard, Visa ... | a compiler too, but of TSX components;  you name tags;  no app-level language |
| Microsoft FAST / Fluent UI Web Components | element library;  Fluent's elements compose FAST's ([Microsoft Learn](https://learn.microsoft.com/en-us/fluent-ui/web-components/)) | yes:  Edge's own UI, "around two-thirds" React before WebUI 2.0 ([The New Stack](https://thenewstack.io/how-microsoft-edge-is-replacing-react-with-web-components/)) | Microsoft Edge | library, hand-written elements |
| Salesforce LWC / LWR | "A Blazing Fast, Enterprise-Grade Web Components Foundation" ([lwc.dev](https://lwc.dev/)) | yes:  apps on the Lightning Platform;  LWR sites are "fully custom solutions" ([Salesforce docs](https://developer.salesforce.com/docs/platform/exp-cloud-lwr/guide/intro-overview.html)) | Salesforce and its customers | tied to a platform;  as a CONSUMER of other elements it scores 89% on custom-elements-everywhere ([site](https://custom-elements-everywhere.com/)) |
| Vaadin Flow (Hilla merged in) | Java server-side UI over Vaadin's web components ([Vaadin](https://vaadin.com/hilla)) | yes, every Vaadin app | enterprise Java shops | the app's logic runs on the server, in Java |
| Enhance (Begin) | "The HTML first Full Stack Web Framework" ([enhance.dev](https://enhance.dev/)) | yes:  "server rendered custom elements that seamlessly upgrade" | -- | server-first, the reverse of Spell (Spell draws in the browser, no hydration) |
| 11ty WebC | single-file components for a static-site builder ([11ty docs](https://www.11ty.dev/docs/languages/webc/)) | pages, at build time;  "compatible with server-side rendering (without duplicating author-written markup)" | Eleventy sites | build-time HTML, Declarative Shadow DOM supported |
| GitHub Catalyst | decorators for elements over server-rendered Rails pages ([GitHub blog, 2021](https://github.blog/engineering/architecture-optimization/how-we-use-web-components-at-github/)) | no:  "over a dozen open-source Web Components" enhancing pages | github.com (`<include-fragment>`, `<relative-time>` ...) | GitHub now builds "new experiences in React, especially when they are app like" ([DevClass, 2025-01-29](https://www.devclass.com/development/2025/01/29/more-react-more-app-like-github-engineer-outlines-future-ui-for-its-devops-platform/1618789)) |
| Shoelace → Web Awesome | widget library by Cory LaViska;  Web Awesome is Shoelace 3.0 ([Font Awesome blog](https://blog.fontawesome.com/how-does-web-awesome-stack-up-against-shoelace/)) | no, components | many;  Shoelace's last release March 2025 | widgets only;  Spell UI is the nearest Spell part |
| Adobe Spectrum Web Components | Adobe's design system as elements | via Photoshop:  "Photoshop's UI elements come from Adobe's Spectrum Web Components library" ([web.dev](https://web.dev/articles/ps-on-the-web)) | Photoshop, Adobe apps | design system only |
| Material Web (Google) | Material 3 as elements | no;  **in maintenance mode since June 2024** ([GitHub discussion #5642](https://github.com/material-components/material-web/discussions/5642)) | -- | a warning:  Google itself stopped staffing it |
| ING Lion | white-label accessible elements, on Lit (lit.dev's list) | no, components | ING | design-system base |
| Open WC | recommendations and scaffolds;  the PWA Starter Kit points new projects at it ([pwa-starter-kit](https://github.com/Polymer/pwa-starter-kit)) | -- | -- | tooling advice, not a framework |
| Hybrids | "a framework for the web with unique declarative and functional architecture" ([hybrids.js.org](https://hybrids.js.org/)) | -- | -- | small authoring library |
| Atomico, Haunted, SkateJS, Elix | hooks-style ([atomicojs.dev](https://atomicojs.dev/), [Haunted](https://github.com/matthewp/haunted)), an early functional library ([SkateJS](https://github.com/skatejs/skatejs)), quality widgets ([Elix](https://component.kitchen/elix)) | not as far as found (not re-checked this round) | -- | authoring libraries or widget sets |
| Angular Elements, Vue `defineCustomElement`, Svelte `customElement`, solid-element | a framework's component exported as a custom element ([Vue docs](https://vuejs.org/guide/extras/web-components), [Svelte docs](https://svelte.dev/docs/custom-elements-api)) | no:  for widgets;  the app stays the framework's | -- | Spell's element layer BEGAN as solid-element's `@solidjs/element` and `component-register`, folded in and fixed ([src/element/AGENTS.md](../../../../src/element/AGENTS.md)) |
| Imba | a compiled language;  lowercase tags compile to native, globally registered custom elements ([imba.io](https://imba.io/docs/components.md)) | yes | Scrimba (Imba's home) | the closest match to "a language compiling to elements";  Spell names tags from your types and translates them |
| X-Tag and Brick (Mozilla, 2013) | early custom-element library and widgets ([Mozilla Hacks, 2013](https://hacks.mozilla.org/2013/05/speed-up-app-development-with-x-tag-and-web-components/)) | -- | history | history |
| AMP (Google) | pages from runtime-managed custom elements, `<amp-img>` ([amp.dev](https://amp.dev/documentation/components/amp-img/)) | whole PAGES, at search scale | publishers in Google search | a restricted page format, not an app framework |
| Firefox's own UI | ~300 XBL bindings moved to custom elements, shadow DOM and modules ([Grinstead, 2019](https://briangrinstead.com/blog/firefox-webcomponents/)) | yes, a browser's chrome | Firefox | an in-house migration, not a framework |

### Who already says "the whole app"

- Lit:  can "progressively enhance a static site, or build an entire app" ([lit.dev](https://lit.dev/)).
- Enhance:  "Build your entire app with accessible HTML" ([enhance.dev](https://enhance.dev/)).
- Adobe, via web.dev:  "the entire Photoshop app is built using Lit-based Web Components"
  ([web.dev](https://web.dev/articles/ps-on-the-web)).
- Mozilla:  "migrating the Firefox UI to Web Components" ([Grinstead](https://briangrinstead.com/blog/firefox-webcomponents/)).
- Polymer:  "full-featured Progressive Web Apps from web components" ([pwa-starter-kit](https://github.com/Polymer/pwa-starter-kit)).
- Dave Rupert lists "When you want to build big applications" among where web components shine, citing Photoshop
  ([daverupert.com, 2024-10-21](https://daverupert.com/2024/10/super-web-components-sunshine/)).

### Counter-currents worth knowing

- Material Web went into maintenance mode in June 2024 ([#5642](https://github.com/material-components/material-web/discussions/5642)).
- The Polymer PWA Starter Kit is archived ([repo](https://github.com/Polymer/pwa-starter-kit)).
- GitHub, the best-known server-rendered-plus-elements site, builds new app-like screens in React
  ([DevClass](https://www.devclass.com/development/2025/01/29/more-react-more-app-like-github-engineer-outlines-future-ui-for-its-devops-platform/1618789)).
- Lit's server rendering is still `@lit-labs/ssr`, "pre-release software"
  ([its README](https://cdn.jsdelivr.net/npm/@lit-labs/ssr@4.1.0/README.md)).

### The strongest counterexamples

- To "first whole app as web components":  **YouTube** (Polymer, since 2017, billions of people),
  with **Photoshop** for the exact words ("the entire Photoshop app ...").
- To "first language compiling to web components":  **Imba**.

---

## 3. What web components can do that Spell isn't using yet

"Baseline" is the web-features project's label:  newly available = in every major engine's current release.

| Feature | What it gives | Support | Spell uses it? | Worth adopting? |
| --- | --- | --- | --- | --- |
| Form-associated custom elements, `ElementInternals` | an element that IS a form control:  value, validity, reset, restore | all engines since Safari 16.4, March 2023 ([WebKit](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/)) | **yes**:  `attachInternals()` in every element, `static formAssociated`, all four form callbacks ([DOMElement.ts](../../../../src/element/DOMElement.ts));  `setFormValue()` ([UIRating.tsx](../../../../ui/src/components/ui-rating/UIRating.tsx));  `setValidity()` ([TextControl.ts](../../../../ui/src/components/ui-input/TextControl.ts)) | done |
| Custom states, `:state()` | styleable states from outside, no attributes | Baseline 2024, May ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet)) | **yes**, everywhere:  `setState()` ([DOMElement.ts](../../../../src/element/DOMElement.ts)), `@cssState` ([Reactive.ts](../../../../src/element/Reactive.ts)) | done |
| `::part` / `exportparts` | style named inner boxes from outside | Baseline (long since) | **yes**:  `::part()` across ui, epic and app;  `exportparts` once ([UISiteTabs.tsx](../../../../ui/src/components/ui-site-tabs/UISiteTabs.tsx)) | more `exportparts`, so nested elements' parts reach the page |
| Constructable stylesheets, `adoptedStyleSheets` | one parsed sheet shared by every shadow root | all engines since Safari 16.4 ([WebKit](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/)) | **yes**:  [Styles.ts](../../../../ui/src/runtime/Styles.ts), [Themes.ts](../../../../ui/src/runtime/Themes.ts) | done |
| CSS module scripts, `import s from "./x.css" with { type: "css" }` | a sheet as a module, no bundler | limited:  Chromium only;  Firefox planned for 147;  Safari no commitment ([web-features](https://web-platform-dx.github.io/web-features-explorer/features/css-modules)) | no:  Vite's `?inline` text | not yet |
| Declarative Shadow DOM, `<template shadowrootmode>` | shadow roots in server HTML, drawn before any script | Baseline 2024 ([web.dev](https://web.dev/articles/declarative-shadow-dom)) | **half**:  a server-rendered root is used, then emptied, "no hydration, its content is replaced" (`renderRoot`, [DOMElement.ts](../../../../src/element/DOMElement.ts));  `spell ssr` flattens to light DOM instead ([StaticDocument.ts](../../../../ui/src/tools/StaticDocument.ts)) | **yes, the biggest win** (§5, 1) |
| Declarative CSS modules, `shadowrootadoptedstylesheets` | shared sheets for Declarative Shadow DOM | Chromium "Intent to Experiment", March 2026 ([blink-dev](https://groups.google.com/a/chromium.org/g/blink-dev/c/I2GOQp3voVg)) | no | watch:  pairs with the row above |
| Scoped custom element registries | two definitions of one tag name on a page, per shadow root | Safari 26 (Sept 2025), Chrome 146 (March 2026), not Firefox ([Chrome blog](https://developer.chrome.com/blog/scoped-registries)) | no:  one global registry, and "two copies ... fails silently" ([src/element/AGENTS.md](../../../../src/element/AGENTS.md), "One copy per page") | yes, once Firefox ships:  two programs or two Spell versions on one page |
| `delegatesFocus` | focusing the host focuses its first control | Baseline | **yes**, on by default ([UIComponent.tsx](../../../../src/element/UIComponent.tsx), `elementSetup`) | done |
| ARIA through `ElementInternals` (`internals.ariaBusy` ...) | default role and ARIA without sprouting attributes | Safari 16.4+ (inferred, with ElementInternals) | **yes**:  `ariaLabel`, `ariaDisabled`, `ariaBusy` ([UIComponent.tsx](../../../../src/element/UIComponent.tsx));  `@aria` ([Reactive.ts](../../../../src/element/Reactive.ts));  `ariaValueNow` ([UIProgress.tsx](../../../../ui/src/components/ui-progress/UIProgress.tsx)) | done |
| ARIA element references (`ariaLabelledByElements` ...) | ARIA links by element, not id, so they can cross shadow roots outward | Baseline 2025, April ([MDN](https://developer.mozilla.org/docs/Web/API/Element/ariaLabelledByElements)) | **yes**:  `ariaDescribedByElements` "since an idref can't cross a shadow boundary" ([UIPopup.tsx](../../../../ui/src/components/ui-popup/UIPopup.tsx));  [UITabs.tsx](../../../../ui/src/components/ui-tab/UITabs.tsx);  [DialogComponent.tsx](../../../../ui/src/components/ui-modal/DialogComponent.tsx) | done |
| Reference Target (cross-root ARIA, inward) | `<label for="x">`, `aria-labelledby`, `commandfor` on the page reach a control INSIDE an element | Chrome 151 "Intent to Ship" (June 2026);  Safari behind a flag ([blink-dev](https://groups.google.com/a/chromium.org/g/blink-dev/c/eBx3sXIfJnw)) | no | **yes**, as it ships:  answers the accessibility objection's last gap |
| `slotchange`, slot assignment modes | react to slotted children;  assign them by hand | Baseline | **yes**:  `slotchange` ([SlottedItems.ts](../../../../ui/src/components/ui-dropdown/SlottedItems.ts));  `slotAssignment` per tag, `"named"` by default ([UIComponent.tsx](../../../../src/element/UIComponent.tsx)) | done |
| `customElements.whenDefined()`, `:defined` | wait for, or style, an undefined tag | Baseline | **its own instead**:  a root defines every tag early, so "NEVER `:defined` ... for a catalog tag";  `whenAttached()`, `:state(pending)` ([src/element/AGENTS.md](../../../../src/element/AGENTS.md), "Defined early") | done, deliberately |
| Customized built-ins, `is="..."` | extend `<button>` itself | never in Safari:  "RESOLVED WONT FIX" ([WebKit bug 182671](https://bugs.webkit.org/show_bug.cgi?id=182671)) | no | no |
| `Element.moveBefore()`, `connectedMoveCallback()` | move a node keeping focus, animations, iframes;  a callback instead of disconnect + connect | Chrome 133;  Firefox reported shipping (sources conflict);  not Safari ([caniuse](https://caniuse.com/mdn-api_element_movebefore), [web.dev](https://web.dev/blog/web-platform-10-2025)) | **partly**:  `moveBefore()` where present ([UIRepeat.tsx](../../../../ui/src/components/ui-form/UIRepeat.tsx));  `connectedMoveCallback` only named in [HotDefinitions.ts](../../../../src/element/HotDefinitions.ts), not implemented | yes:  cheap, and Spell moves elements constantly (cards between piles) (inferred) |
| Popover API | top-layer popups, light dismiss, no z-index wars | Baseline 2024 | **yes**:  [TopLayerTip.ts](../../../../ui/src/util/TopLayerTip.ts), [Overlays.ts](../../../../ui/src/runtime/Overlays.ts) | done |
| `<dialog>`, `closedby` | native modal, top layer, close rules | dialog Baseline;  `closedby` newer | **yes**:  semantic `<dialog>` in shadow DOM ([ui/AGENTS.md](../../../../ui/AGENTS.md), "UI rules");  `closedby` typed in [jsx.ts](../../../../ui/src/jsx.ts) | done |
| Invoker commands, `command` / `commandfor` | buttons open dialogs and popovers with no script | Baseline Dec 2025, Safari 26.2 ([MDN](https://developer.mozilla.org/docs/Web/API/Invoker_Commands_API)) | **yes**:  [Overlays.ts](../../../../ui/src/runtime/Overlays.ts) | done |
| CSS anchor positioning | tooltips and menus placed by CSS | Baseline Jan 2026, Firefox 147 ([web.dev](https://web.dev/blog/web-platform-01-2026)) | **yes**, "assumed ... no JS fallback" ([ui/AGENTS.md](../../../../ui/AGENTS.md), "UI rules") | done |
| Customizable select, `appearance: base-select` | a styleable native `<select>` | Chromium | **yes**, flagged ([UISelect.css](../../../../ui/src/components/ui-select/UISelect.css), [Browser.ts](../../../../ui/src/runtime/Browser.ts)) | done |
| View Transitions (same document) | animated state changes by the browser | Baseline Oct 2025, Firefox 144 ([web.dev](https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available)) | **a little**:  tab swaps ([UITabs.tsx](../../../../ui/src/components/ui-tab/UITabs.tsx)), page patches ([PagePatch.ts](../../../../src/server/site/PagePatch.ts)) | maybe:  a program's moves already glide by their own code (`Glides`, [SpellElement.tsx](../../../../app/src/app/runner/SpellElement.tsx)) |
| Navigation API | one event for every navigation, for routers | Baseline Jan 2026 ([web.dev](https://web.dev/blog/baseline-navigation-api)) | no (no `navigation.` use found) | yes, for a Spell app's pages and the editor's routing (inferred) |
| `@scope` | CSS limited to a subtree, for light DOM | Baseline Dec 2025, Firefox 146 ([web.dev](https://web.dev/blog/web-platform-12-2025)) | **yes**:  [UITable.tsx](../../../../ui/src/components/ui-table/UITable.tsx), the static render | done |
| `focusgroup` | arrow-key navigation in toolbars, tabs, menus, declaratively | Chrome 150 only;  not in the HTML standard ([web.dev](https://web.dev/blog/web-platform-06-2026)) | no | later, when a second engine ships |
| Custom Elements Manifest (`custom-elements.json`) | one JSON of every tag's API, for editors, Storybook, docs, wrappers, AI tools | community standard;  "the killer feature of web components" ([Dave Rupert, 2025-10-13](https://daverupert.com/2025/10/custom-elements-manifest-killer-feature/)) | **Spell UI only**:  [ElementManifests.ts](../../../../ui/src/tools/ElementManifests.ts), named by [ui/package.json](../../../../ui/package.json) `"customElements"`;  read by the elements help ([ElementCatalog.ts](../../../../src/element-tools/jsx-help/ElementCatalog.ts));  NOT Epic UI, App UI or compiled programs | **yes, cheap**:  one per compiled project and per pack |
| DOM Parts / template instantiation | the browser's own fast template updates | proposal;  Chromium "Intent to Prototype" (Jan 2025), no milestone ([blink-dev](https://groups.google.com/a/chromium.org/g/blink-dev/c/wIADRnljZDA)) | no (Solid does it) | watch |
| TC39 Signals | a standard reactive primitive | Stage 1 ([proposal](https://github.com/tc39/proposal-signals)) | no (Solid 2's signals) | watch |
| Open-stylable shadow roots | page CSS reaching into shadow roots | proposal, no progress found after 2024 ([WICG #909](https://github.com/WICG/webcomponents/issues/909)) | n/a:  tokens, `::part`, `:state` instead | watch |

### Most valuable to adopt, in order (inferred)

1. **Declarative Shadow DOM from the server, kept on upgrade.**
   Spell already accepts one, then throws it away;  this is the answer to the top objection (§4, 1).
2. **A Custom Elements Manifest for every compiled Spell project and every pack.**
   Spell UI's tooling already writes one;  it unlocks types for every framework (§4, 6).
3. **Reference Target**, as browsers ship it:  labels and ARIA from the page into Spell's controls.
4. **`connectedMoveCallback()`** on `DOMElement`:  moves without the disconnect / connect dance.
5. **Scoped registries**, once Firefox ships:  two Spell programs, or two versions, on one page.
6. **The Navigation API** for Spell apps' pages.

---

## 4. What a React, Vue or Svelte developer would object to

Each objection, its strongest source, then where Spell stands today.

1. **Server rendering and hydration.**
   - Harris:  "I think that websites should work without JavaScript wherever possible."
     ([Why I don't use web components, 2019](https://dev.to/richharris/why-i-don-t-use-web-components-2cia))
   - Carniato:  "But they are a DOM interface in a place with no DOM."
     And:  "Improvements to hydration, things like Resumability, Partial or Selective Hydration depend on event delegation
     to work."  ([Web Components Are Not the Future, 2024-09-26](https://dev.to/ryansolid/web-components-are-not-the-future-48bh))
   - Lawson:  "web components are bad at a lot of things – Server-Side Rendering, accessibility, even interop in some
     cases."  ([web components are okay, 2024-09-28](https://nolanlawson.com/2024/09/28/web-components-are-okay/))
   - **Spell today:  the weakest answer.**
     - `spell ssr` renders Spell UI pages as plain light-DOM HTML, for search engines and readers without
       JavaScript;  that page MUST NOT load the elements
       ([StaticDocument.ts](../../../../ui/src/tools/StaticDocument.ts), `ELEMENT_SCRIPT`).
     - A server-rendered shadow root is accepted, then emptied:  "no hydration"
       ([DOMElement.ts](../../../../src/element/DOMElement.ts), `renderRoot`).
     - Compiled programs:  no server render found in the runner or the core (inferred, from a search).
2. **Styling through shadow DOM.**
   - Harris, on styles shipped in JavaScript:  "This runs counter to the performance advice we've been given, which can
     be summarised as 'less JavaScript, please'."
   - The open-stylable shadow roots proposal exists because page CSS can't reach in ([WICG #909](https://github.com/WICG/webcomponents/issues/909)).
   - **Spell today:  a full answer.**
     Public `--ui-*` tokens, `::part()`, `:state()`, an `ui.app` cascade layer for the page's own overrides,
     and every part, state and token listed for VS Code's CSS help
     ([ui/AGENTS.md](../../../../ui/AGENTS.md), "CSS";  [ui/README-frameworks.md](../../../../ui/README-frameworks.md), "Types").
     The CSS ships as text, 17.3 kB gzipped ([ui/README.md](../../../../ui/README.md), "What it costs").
3. **One global registry:  name clashes.**
   - Harris:  "the dangers of having a single shared namespace have been well understood for some time."
   - **Spell today:  prefixes, and one copy per page.**
     Every set has its prefix (`ui-`, `es-`, `epic-`, `spell-`), and a program's views carry its project's name
     (`<solitaire-card>`).
     Two copies of the element layer "fails silently" ([src/element/AGENTS.md](../../../../src/element/AGENTS.md)).
     Each runner loads its own runtime copy ([parser/src/core/AGENTS.md](../../../../parser/src/core/AGENTS.md),
     "Who may value-import it"), yet the tag registry is shared:  two versions of one project on a page would clash
     (inferred).
4. **Attributes are strings;  props versus attributes.**
   - Carniato:  "Attributes accept only strings while properties being a JS interface can handle any value."
   - Harris's heading, sarcastically:  "Props and attributes are basically the same thing, right?"
   - **Spell today:  answered, and checked.**
     Primitives are reflected attributes;  rich data is a real property, so a framework finds it with `key in el`
     ([ui/README-frameworks.md](../../../../ui/README-frameworks.md), "The contract").
     A property set before the tag is defined is kept.
     React 19 now passes props as properties:  it scores 100% on [custom-elements-everywhere](https://custom-elements-everywhere.com/),
     and Spell's smoke page checks React 19.3.1.
     The catch:  React writes an attribute if the tag isn't defined yet, so import the families first (same page).
5. **Events, and their types.**
   - Carniato:  "Some events don't "compose" ie don't bubble beyond Shadow DOM boundaries."
   - **Spell today:  answered, with a fragile patch.**
     Every event is a `ui-*` `CustomEvent`, `bubbles` and `composed` ([ui/AGENTS.md](../../../../ui/AGENTS.md), "UI rules"),
     its `detail` typed in Solid's JSX and in plain `addEventListener()` ([ui/README-frameworks.md](../../../../ui/README-frameworks.md), "Events").
     Solid's own event delegation leaked across shadow roots;  [ShadowEvents.ts](../../../../src/element/ShadowEvents.ts)
     fixes it by reading Solid's internals, marked HACK, pinned by a test.
6. **TypeScript and JSX types for tags.**
   - Lea Verou:  "Especially without a library like Lit, authoring WCs is still painful, tedious, and riddled with
     footguns."  ([wcs vs frameworks, 2024-10-01](https://lea.verou.me/blog/2024/wcs-vs-frameworks/))
   - **Spell today:  Solid only.**
     `spell/ui/jsx` types every tag, attribute value and event for Solid;
     "Other frameworks' JSX (React's, Preact's):  no types yet" ([ui/README-frameworks.md](../../../../ui/README-frameworks.md), "Types").
7. **Forms.**
   - The classic complaint:  a custom input doesn't submit with its `<form>` (inferred;  it's what form association was made for).
   - **Spell today:  answered.**
     Every form control is form-associated:  value, validity, reset, back-forward restore, a disabled fieldset
     ([DOMElement.ts](../../../../src/element/DOMElement.ts), "Forms";  `FormComponent`, [ui/AGENTS.md](../../../../ui/AGENTS.md)).
     A control that fails falls back to a working native one (the `fallback.html` smoke page, [ui/README-frameworks.md](../../../../ui/README-frameworks.md)).
8. **Accessibility across shadow roots.**
   - Lawson:  shadow DOM "invalidates many tried-and-true techniques";  ARIA id references break at the boundary
     ([Shadow DOM and accessibility, 2022-11-28](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/);
     [Alice Boxhall, Igalia](https://blogs.igalia.com/alice/how-shadow-dom-and-accessibility-are-in-conflict)).
   - **Spell today:  outward yes, inward not yet.**
     Element references carry ARIA out of a shadow root ([UIPopup.tsx](../../../../ui/src/components/ui-popup/UIPopup.tsx));
     `ElementInternals` carries the element's own ARIA;  axe runs on live elements in tests
     ([A11y.ts](../../../../src/test-helpers/A11y.ts)).
     A page's `<label for>` can't yet reach the `<input>` inside a `<ui-input>`:  that's Reference Target (§3).
9. **Composition:  slots versus render props.**
   - Harris:  "slotted content renders eagerly in custom elements."
   - LaViska concedes:  "every custom element results in an actual DOM element", so no renderless components
     ([Web Components Are Not the Future — They're the Present, 2024-09-27](https://abeautifulsite.net/posts/web-components-are-not-the-future-they-re-the-present)).
   - **Spell today:  partly.**
     Named slots and rich data properties between elements;  inside one, ordinary Solid components, renderless or not.
     A Spell list draws its items through the core (`drawItems()`), not slots
     ([parser/src/core/AGENTS.md](../../../../parser/src/core/AGENTS.md)).
     No scoped slots between elements (inferred).
10. **Lifecycle when an element moves.**
    - Carniato (2020):  "Component's asynchronous timing with upgrading and connected callbacks are also awkward"
      ([Maybe Web Components are not the Future?](https://dev.to/ryansolid/maybe-web-components-are-not-the-future-hfh)).
    - **Spell today:  answered.**
      The component is built on the first connect and "lives across moves, until `dispose()`d"
      ([DOMElement.ts](../../../../src/element/DOMElement.ts), class header).
      `moveBefore()` keeps focus where the browser has it ([UIRepeat.tsx](../../../../ui/src/components/ui-form/UIRepeat.tsx)).
11. **Performance of many elements.**
    - Carniato (2021):  "They serve a different purpose and performance is not a place that they can win."
      ([The Real Cost of UI Components Revisited](https://dev.to/this-is-learning/the-real-cost-of-ui-components-revisited-4d23))
    - Rupert (2023), as a reason people don't use them:  slow, "like brisket"
      ([If Web Components are so great ...](https://daverupert.com/2023/07/why-not-webcomponents/));
      Rupert (2024):  the performance floor is much lower ([Where web components shine](https://daverupert.com/2024/10/super-web-components-sunshine/)).
    - **Spell today:  unmeasured in public.**
      Every view is an element with a shadow root and its own Solid root ([ui/README-frameworks.md](../../../../ui/README-frameworks.md)).
      Long lists draw 24 items at a time as you scroll (`drawnInWindow()`, [src/element/AGENTS.md](../../../../src/element/AGENTS.md)).
      A perf smoke page exists ([perf.html](../../../../ui/src/tools/frameworks/perf.html));  what it measures wasn't checked here.
12. **A flash of unstyled content before upgrade.**
    - The general complaint:  an undefined tag shows raw children, then jumps (inferred;  why `:defined` exists).
    - **Spell today:  answered.**
      A root defines every catalog tag before its code loads;  the element is `:state(pending)` meanwhile
      ([src/element/AGENTS.md](../../../../src/element/AGENTS.md), "Defined early").
      Skeleton placeholders by default (`display="skeleton"`, [ui/README.md](../../../../ui/README.md));
      a `.ui-cloak` utility for the rest ([utilities.css](../../../../ui/src/styles/utilities.css)).
13. **Context and dependency injection.**
    - Carniato (2020):  "It can make things like passing a Context API through difficult."
    - **Spell today:  its own.**
      Solid's context stops at each element;  `<ui-root appContext>` hands app data to every element inside,
      and parts style themselves by their owner (`:state(in-card)`, `OwnerContext`)
      ([ui/README-frameworks.md](../../../../ui/README-frameworks.md);  [ui/AGENTS.md](../../../../ui/AGENTS.md), "UI rules").
14. **Testing.**
    - The usual complaint:  jsdom-style test setups handle shadow DOM poorly (inferred).
    - **Spell today:  answered.**
      Element tests run in a real Chromium (Vitest browser mode with Playwright), with fixtures that wait for `ready`
      ([src/element/AGENTS.md](../../../../src/element/AGENTS.md), "Overview").
15. **Tooling and developer experience.**
    - Rupert:  "Web Components were designed as a low-level primitive for framework authors"
      ([2023](https://daverupert.com/2023/07/why-not-webcomponents/)).
    - **Spell today:  the strongest answer.**
      A Spell author writes `a card is a view`;  the compiler writes the element.
      Hot reload swaps a component into every live element ([HotDefinitions.ts](../../../../src/element/HotDefinitions.ts)).
      VS Code completes tags, slots, parts and states ([ElementCatalog.ts](../../../../src/element-tools/jsx-help/ElementCatalog.ts)).
16. **Bundle size.**
    - Carniato (2020):  "All but the simplest Web Components are an investment in JS bundle size, performance loss, and
      new complexity."
    - **Spell today:  a real cost.**
      115.7 kB gzipped before the first family:  Solid 24.9, the element core 40.6, the root 16.0, the runtime 16.9,
      the CSS 17.3;  then 5.7 kB a family on average;  421 kB for every family
      ([ui/README.md](../../../../ui/README.md), "What it costs").
      Lit's base is "around 5 KB" ([lit.dev](https://lit.dev/)), though that's the library alone, with no components.
17. **Framework interop, both ways.**
    - Lawson:  bad at "even interop in some cases".
    - **Spell today:  checked, but narrowly.**
      Plain JavaScript, React 19, Vue 3 and Solid 2 pass one round trip each, in Chromium only;
      "Not run at all:  Svelte, Angular, Preact, React 18" ([ui/README-frameworks.md](../../../../ui/README-frameworks.md)).
      A Solid app must run Spell's exact Solid:  "Two copies of Solid on one page break silently" (same page).
18. **The platform argument:  web components shape the web for everyone.**
    - Carniato:  "Web Components possibly pose the biggest risk to the future of the web that I can see."
      And:  "It is insufficient to say not everyone has to use it when its existence influences how we look at the
      platform in general."
    - Harris:  "Every time we add a new feature to the platform, we increase that complexity".
    - **Spell today:  nothing to fix;  a position to take** (§5, 18).
19. **Spell's own:  "you're built on Solid, and Solid's author says web components are not the future."**
    - Carniato:  "Web Components are a compromise through and through."
    - **Spell today:**  its element layer is his `@solidjs/element` code, folded in and fixed
      ([src/element/AGENTS.md](../../../../src/element/AGENTS.md)).

---

## 5. How to address each

Same numbers as §4.
**Answer** = say it now, with proof;  **Build** = work to do;  **Concede** = say it plainly.

1. Server rendering.
   - **Build:**  render compiled programs and Spell UI to Declarative Shadow DOM, and KEEP that content on upgrade
     instead of emptying it.
     - Start with "show what the server drew, then take over" (replace once ready), already half there in `renderRoot`.
     - Then real hydration, through the element's Solid root (inferred:  Solid has hydration of its own).
   - **Concede** until then:  Spell is client-rendered;  `spell ssr` is a static snapshot for search engines.
2. Styling.
   - **Answer:**  a page restyles any Spell element with plain CSS:  tokens, `::part()`, `:state()`, an `ui.app` layer.
     Show it (demo 4, §6).
3. Global registry.
   - **Answer:**  prefixes by set and by project;  tags are generated, so clashes are rare by design.
   - **Build:**  scoped registries when Firefox ships, so two runners or two versions can share a page.
4. Props versus attributes.
   - **Answer:**  primitives as attributes, rich data as properties;  React 19 and Vue 3 pass with no wrapper.
   - **Build:**  a `<ui-root>` mode, or docs, for frameworks that render before tags are defined (React's catch).
5. Events.
   - **Answer:**  composed `ui-*` events with typed `detail`.
   - **Build:**  upstream the `ShadowEvents` fix to Solid, so it stops reading Solid's internals.
6. Types.
   - **Build:**  generate React, Preact, Vue and Svelte types from the Custom Elements Manifest Spell UI already writes;
     Rupert notes community tooling turns a manifest into framework wrappers and types
     ([2025](https://daverupert.com/2025/10/custom-elements-manifest-killer-feature/)).
   - **Build:**  a manifest per compiled project, so a Spell program's own `<solitaire-card>` gets types too.
7. Forms.
   - **Answer:**  every control is a real form control;  demo 5, §6.
8. Accessibility.
   - **Answer:**  ARIA out of shadow roots by element reference;  axe in the tests.
   - **Build:**  Reference Target as it ships;  meanwhile, document `<ui-input label="...">` over a page `<label for>`
     (inferred:  check what `ControlLabels` already covers).
9. Composition.
   - **Answer:**  "Elements !== Components", and Spell agrees:  elements at the boundaries, Solid components inside.
   - **Concede:**  no scoped slots between elements.
10. Moves.
    - **Answer:**  components survive moves.
    - **Build:**  `connectedMoveCallback()` on `DOMElement`.
11. Performance.
    - **Build:**  publish a benchmark:  the same list as Spell views versus plain Solid components versus Lit,
      in the js-framework-benchmark's style (inferred method).
    - Until then, claim nothing about speed.
12. Unstyled flash.
    - **Answer:**  tags defined early, skeletons, `:state(pending)`.
13. Context.
    - **Answer:**  `appContext` and owner context.
    - **Concede:**  a framework's own context doesn't reach inside an element.
14. Testing.
    - **Answer:**  real-browser tests and fixtures, shipped as `spell/test-helpers`.
15. Tooling.
    - **Answer:**  nobody hand-writes an element class;  the compiler does.  Lead with this.
16. Bundle size.
    - **Concede:**  115.7 kB gzipped base.
    - **Answer:**  paid once per page, then ~5.7 kB a family;  load-on-demand through `<ui-root>`.
    - **Build:**  a "Spell UI lite" entry without the runtime chunk, if measurement shows it's worth it (inferred).
17. Interop.
    - **Build:**  smoke pages for Svelte, Angular, Preact;  run them in Firefox and Safari too.
    - **Concede:**  a Solid app must match Spell's Solid exactly.
18. The platform argument.
    - **Answer:**  Spell uses web components as an OUTPUT and an interop boundary, which is the use the critics concede:
      - Carniato:  "The most compelling uses for Web Components are as a sort of Microfrontend container."
      - Verou:  web components suit "generalizable elements";  frameworks suit reactive templating
        ("Fundamentally, it's about the ratio of potential consumers to authors").
      - LaViska:  "I want a framework that aligns with the platform, not one that replaces it."
    - Each Spell view is a small island with its own Solid root:  Carniato's microfrontend container, generated
      (inferred mapping).
19. "Your own framework's author disagrees."
    - **Answer:**  Spell takes his side on authoring (Solid components, signals, no element-per-component) and his
      concession on boundaries (elements).
      Lawson's line fits:  "people are talking past each other because they're building different things with different
      constraints."
    - Verou expected framework-to-web-component compilation to be "quite far off";  Spell does it today, minus server
      rendering ([wcs vs frameworks](https://lea.verou.me/blog/2024/wcs-vs-frameworks/)).

---

## 6. Using it in marketing

### Positioning

**"Write Spell.  Ship HTML elements."**
Your program's nouns become real tags any page can use;  inside each one, Solid draws it fast.

Timing:  Spell's first release is planned for December 1, 2026 ([ui/README-frameworks.md](../../../../ui/README-frameworks.md)).

### Taglines

1. "Your types are tags."
2. "View source shows your program."  (`<solitaire-app>`, `<solitaire-card rank="queen">`)
3. "Write Spell.  Ship HTML elements."
4. "Elements that speak your language."  (`<solitario-carta>`, `<es-boton>`)
5. "Drop it into any page:  React, Vue, or plain HTML."  (only once more frameworks are checked, §5, 17)

### Demos that prove it

1. **View source on a Spell app.**
   - Open Solitaire, Inspect:  `<solitaire-app>`, then `<solitaire-card>`s with their properties as attributes,
     `pile="Tableau#T1"`.
   - Proves:  the program's nouns ARE the DOM.  Nearest prior art (YouTube's `ytd-*`) is hand-named.
2. **Drop a Spell element into someone else's app.**
   - The smoke pages already do it in plain JavaScript, React 19, Vue 3 and Solid 2
     ([ui/src/tools/frameworks/](../../../../ui/src/tools/frameworks/)).
   - Make them a public page;  add Svelte, Angular, Preact;  run Firefox and Safari.
   - And a compiled Spell program, not only Spell UI:  `<spell-viewer>` in a plain HTML page (inferred:  check it embeds cleanly).
3. **The same app in Spanish tags.**
   - Solitaire and Solitario side by side, devtools open:  `<solitaire-card>` beside `<solitario-carta>`.
   - [Solitario.es.spell](../../../../app/spaces/@spell/examples/Solitario/Solitario.es.spell) already exists.
4. **Restyle it from outside, no build.**
   - One plain stylesheet:  `--ui-*` tokens, `ui-dropdown::part(menu)`, `ui-dropdown:state(open)`.
5. **A Spell control in a plain `<form>`.**
   - Submit, reset, `:invalid`, Back restoring the value:  no JavaScript glue.
6. **The element is the API.**
   - In devtools:  `$0.open = true`, `$0.addEventListener("ui-change", ...)`.
7. **Accessibility, shown.**
   - The browser's accessibility tree for a `<ui-dropdown>`, and axe passing in CI.
8. **No-JavaScript snapshot** (careful wording:  a static render for search engines, not server rendering with hydration).

### A comparison table for the docs

Only facts sourced above;  keep it this narrow.

| | Spell | Lit | Imba | a React app |
| --- | --- | --- | --- | --- |
| What you write | Spell, a language | element classes, TypeScript or JavaScript | Imba, a language | React components |
| Your views become custom elements | yes, every one | yes, the ones you write | yes, lowercase tags | no |
| Tag names come from your types | yes (`<solitaire-card>`) | no, you name them | no, you name them | -- |
| Tags in the program's language | yes (`<solitario-carta>`) | no | no | -- |
| A full UI kit on the same layer | Spell UI, 104 tags | separate libraries (Shoelace, Spectrum ...) | no | separate libraries |
| Server rendering with hydration | **no** (static snapshot only) | `@lit-labs/ssr`, pre-release | not checked | yes |
| Base cost, gzipped | 115.7 kB with UI runtime and CSS | ~5 KB, library alone | not checked | not checked |

### Claims to avoid

Each would be shot down, and by whom:
1. **"The first framework where the whole app is web components."**
   YouTube 2017, Firefox 2019, Salesforce, Photoshop, Reddit, Edge, Enhance, Lit, Polymer (§1).
2. **"The first language that compiles to web components."**  Imba (§2).
3. **"Revolutionary", "the W3C framework", "standards-based, so future-proof."**
   The W3C writes standards, not frameworks;  Material Web's maintenance mode shows a standard library can still
   stall (inferred, from §2).
4. **"Server-rendered", "SEO-ready".**  It's a static snapshot with no hydration (§4, 1).
5. **"Works with every framework."**  Checked:  plain JS, React 19, Vue 3, Solid 2, Chromium only (§4, 17).
6. **"Tiny", "zero dependencies", "no framework".**  115.7 kB base, Solid inside (§4, 16).
7. **"Faster than React / Solid."**  No benchmark;  Carniato's says elements cost more (§4, 11).
8. **"Fully accessible across shadow roots."**  Inward references wait on Reference Target (§4, 8).
9. **"Everything is an element."**  The editor's shell is Solid components;  "Elements !== Components" is the
   critics' main point, and Spell agrees with it (§1).
10. **"No lock-in."**  The elements are portable;  a Solid app must match Spell's exact Solid, and compiled Spell runs
    on Spell's runtime (§4, 17).

### A draft "honest section" for the docs

> **Is Spell a web-components framework?**
> Every view you write in Spell becomes a real HTML element, named after your own types,
> and Spell's UI kit, docs and editor pieces are elements too.
> Inside each element, Solid draws it.
> You're not the first to build whole apps from web components:  YouTube, Firefox, Salesforce and Photoshop do.
> What Spell adds is that you never write an element class:  your program's nouns become tags,
> in the language you wrote it in.
> What it doesn't do yet:  server rendering with hydration, and typed tags in React's JSX.

---

## See also

- Primary critiques:
  [Carniato 2024](https://dev.to/ryansolid/web-components-are-not-the-future-48bh) ·
  [Carniato 2020](https://dev.to/ryansolid/maybe-web-components-are-not-the-future-hfh) ·
  [Carniato 2021](https://dev.to/this-is-learning/the-real-cost-of-ui-components-revisited-4d23) ·
  [Harris 2019](https://dev.to/richharris/why-i-don-t-use-web-components-2cia)
- Replies:
  [Lawson](https://nolanlawson.com/2024/09/28/web-components-are-okay/) ·
  [LaViska](https://abeautifulsite.net/posts/web-components-are-not-the-future-they-re-the-present) ·
  [Verou](https://lea.verou.me/blog/2024/wcs-vs-frameworks/) ·
  [Rupert 2024](https://daverupert.com/2024/10/super-web-components-sunshine/) ·
  [Rupert 2025, the manifest](https://daverupert.com/2025/10/custom-elements-manifest-killer-feature/)
- Scores:  [custom-elements-everywhere.com](https://custom-elements-everywhere.com/)
- Spell's side:
  [src/element/AGENTS.md](../../../../src/element/AGENTS.md) ·
  [ui/README-frameworks.md](../../../../ui/README-frameworks.md) ·
  [parser/src/core/elements.ts](../../../../parser/src/core/elements.ts) ·
  [parser/README-spanish.md](../../../../parser/README-spanish.md)
