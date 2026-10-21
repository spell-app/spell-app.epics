# Explore 4: spell-ui, spell-brand, spell-epic (for epic `readme`)

Research report for the writer of `spell-ui/README.md` (+ `README-themes.md`, + a frameworks README),
`spell-brand/README.md` and `spell-epic/README.md`.
Read-only;  every fact below was read from the files named, in the worktree `/Users/owen/www/spell.worktrees/readme`
(the kit, with child repos inside) and the content folder `/Users/owen/www/spell/spell.epics/`.

Paths below are relative to the worktree root unless absolute.
"VERIFIED" = seen in code / a test page;  "DOCS SAY" = only a doc says it;  "STANDARD" = general custom-element
knowledge, not checked here.

---

## A. spell-ui

### A.1 What it is (facts)

- npm name `spell-ui`, version `0.0.1`, license MIT, repo `https://github.com/spell-app/spell-ui`
  (`spell-ui/package.json`).
  - `description`: "Fomantic UI's vocabulary as modern-CSS web components, on Solid 2" (stale-ish lede:  see E).
  - NOT on npm yet.  The kit README says standalone child repos (`git clone spell-ui && yarn install`) "aren't
    supported yet:  that's once the packages are on npm" (`README.md` of the kit, line ~105).
  - `engines.node >= 24.11`, `packageManager yarn@4.18.0`.
- A library of `<ui-*>` custom elements:
  - every element draws into a SHADOW ROOT, with semantic markup inside (`<button>`, `<dialog>`, `<input>`,
    `<nav>`, `<table>` ...;  "NEVER a `<div>` where an element exists" -- `spell-ui/AGENTS.md`, "UI rules")
  - styled with cascade layers (`@layer`), OKLCH colour tokens, `light-dark()` pairs, anchor positioning,
    `<dialog>` / popover, form-associated custom elements, `ElementInternals`, `:state()`
  - no polyfills:  getting-started says it ASSUMES anchor positioning, popover, `<dialog>`, container style queries
    and form-associated custom elements (`spell-ui/docs/getting-started.html`)
- Written on Solid 2 (`solid-js` / `@solidjs/web` `2.0.0-rc.13`, pinned exactly, PEER dependencies).
  - The custom-element layer itself (`DOMElement`, `UIComponent`, decorators, `ElementDefinition` ...) is the kit's
    `element/` folder (`spell-kit/element`, run-time module name `$/spell-element`).
  - spell-ui's own half of the element core is `spell-ui/src/elements/` (`ClassBuilder`, `FormComponent`,
    `PartComponent`, `LoadableComponent`, `NativeFallback`, `SpellUISettings` ...).
- Runtime deps (`package.json` `dependencies`): `dompurify`, `highlight.js`, `linkedom`, `lodash-es`, `marked`,
  `postcss`, `temporal-polyfill`, `spell-kit` (`workspace:*`).
- Sizes (CHANGELOG "Known limits"):  average family 7.3 kB gzip own code (budget 8 kB);  lazy runtime 31 kB.
  `<ui-root>` alone "8.1 kB min + gzip of its own" (guide `guides/ui-component-creation.html` section 7).
- Checked:  tests in a REAL browser (Vitest browser mode + Playwright, chromium by default;  `yarn test:all` adds
  firefox + webkit), node SSR tests, screenshot tests (`yarn test:visual`, light + dark), framework smoke pages
  (`yarn smoke`).
- Nothing of the spell language in it (epic `repo-split` P2):
  - `<ui-code>` colours with highlight.js, plus any language a page registers (`UI.code.register()`)
  - `<ui-markdown>` draws with marked (+ DOMPurify)
  - spell's own `<spell-code>` / `<spell-markdown>` are spell-app's subclasses

### A.2 Components by family

- 62 family folders under `spell-ui/components/` (`ui-<name>/`), 112 tags in the root catalog
  (`components/ui-root/UIRoot.catalog.ts`;  8 of them are the doc-only `<ui-docs-*>`, so ~104 library tags).
- `docs/__data/pages.json5`:  82 families/pages `status: "done"`, 2 `"in-progress"` (`ui-property-editor`,
  `ui-section`).
- Grouped the way the CHANGELOG does (Fomantic's four groups + spell-ui's own):
  - Elements:  button (`ui-button`, `ui-buttons`, `ui-or`), container, divider, emoji, flag, icon (+`ui-icons`),
    image (+`ui-images`), input, label (+`ui-labels`), list, loader, placeholder (+ `-header`, `-image`, `-line`,
    `-paragraph`), rail, reveal, segment (+`ui-segments`), step (+`ui-steps`), text;  the generic content PARTS
    (`ui-header`, `ui-content`, `ui-meta`, `ui-description`, `ui-extra`, `ui-actions`, `ui-summary`, `ui-title`,
    `ui-value`, `ui-author`, `ui-avatar`, `ui-date`, `ui-detail` ...) which style themselves by owner context
    (`:state(in-card)`)
  - Collections:  breadcrumb, form (`ui-form`, `ui-field`, `ui-fields`, `ui-repeat`), grid (`ui-row`,
    `ui-column`), menu, message, table
  - Views:  ad, card (+`ui-cards`), comment (+`ui-comments`), feed (`ui-event`), item / items, statistic
  - Modules:  accordion, calendar, checkbox / radio / toggle (`ui-checkbox`, `ui-radio`), dimmer, dropdown, embed,
    flyout, modal, nag, popup, progress, rating, search, select, shape, sidebar (`ui-pushable`, `ui-pusher`), slider,
    sticky, tab (+`ui-tabs`), toast, transition, visibility;  `ui-textarea`
  - spell-ui's own (no Fomantic counterpart):
    - `<ui-root>`:  the page/app root that loads everything on demand (A.3)
    - `<ui-components source>`:  names a component pack to load (A.4)
    - `<ui-section>` / `<ui-sections>`:  "a titled block of content that can fold away and keep its title in view"
    - source elements:  `<ui-include>` ("shows part of another page from this site"), `<ui-code>`, `<ui-markdown>`
      -- inline text or a same-origin `source`, loading / error states, `content` / `save()` (guide
      `guides/ui-import/ui-import.html`)
    - `<ui-panel>`:  "an inspector:  a tinted box of fields under a header band" (moved in from the brand)
    - `<ui-property-editor>` (+`ui-property`, `ui-property-group`):  "draws a form from a schema"
    - `<ui-tree-diagram>`:  "draws a tree top-down"
  - Doc-only (`spell-ui/src/docs-components/`, NOT library entries):  `ui-docs-api`, `-example`, `-inspector`,
    `-nav`, `-search`, `-themes`, `-toc`, `-tokens`.
- The full live list:  the docs site's component index, `spell-ui/docs/components.html`, and the kitchen sink
  `docs/kitchen-sink.html`.
- Each family folder holds:  `UI<Name>.tsx` (component), `index.ts` (barrel:  `define()`s its tags, is the lib
  entry `spell-ui/ui-<name>`), `UI<Name>.css` (port of Fomantic's `.less` + `.variables`), `UI<Name>.en.ts` (the
  VOCABULARY, one per tag), `UI<Name>.types.ts`, `UI<Name>.fallback.ts` (form controls only), `examples/*.html`
  (class grammar) and `examples/elements/*.html` (element markup).  Tests in `spell-ui/tests/components/ui-<name>/`.

### A.3 `<ui-root>` and dynamic loading

Sources:  `spell-ui/components/ui-root/UIRoot.tsx` (banner), `UIRoot.en.ts` (vocabulary), `RootLoader.ts`,
`components/ui-components/ComponentPacks.ts`, guide `guides/ui-component-creation.html` section 7.

- What it is (its vocabulary, verbatim):  "A root loads the components inside it on demand, sets their theme and
  size, and shows them once they're ready."  `aka`: app shell, provider, loader, lazy loading, theme provider.
- Attributes (all real, from `UIRoot.en.ts`):
  - `display`: `skeleton` (default) | `when-ready` | `immediately`
  - `loading`: a message with a `<ui-loader>` while loading (bare: "Loading…")
  - `timeout`: default `5s` (`500ms`, or ms)
  - `theme`: `light` | `dark`;  `size`: `mini` ... `massive`
  - `stack-with`: `container` | `page` (sets `--ui-stack-with`)
  - `width`, `height`: CSS length or `window` -> the root becomes a scrolling box (region named by `aria-label`)
  - `fixed`: fills the viewport, a full-page app shell
  - `icons`: icon packs, comma-separated (`fa7-free`, `fa7-brands`, `fomantic`, or `pack.js` URLs)
  - `emoji`: `cldr` (default) | `fomantic`;  `assets`: folder the built-in icon packs load from
- Events:  `ui-ready { failed: [{ tag, reason: 'unknown'|'failed'|'timeout', error?, source? }] }`;
  `ui-error` (cancelable) per tag that didn't load, or per pack (`tag: "ui-components"`, with `source`).
- States:  `:state(loading)`, `:state(ready)`, `:state(light|dark)`, `:state(box)`, `:state(fixed)`.
- Parts:  `loading`, `skeleton`, `scroller`.
- Promise:  `root.settled` resolves with the failures, once ready (an outer root waits on it).
- Swappable looks:  `UIRoot.Loading = MyLoading`, `UIRoot.Skeleton = MySkeleton`.
- A subclass is a root too (`elementSetup.root`):  spell-app's `<spell-app>` is one.
- A Solid context can't cross the element boundary, so a root carries `appContext`
  (`<ui-root prop:appContext={value}>` or `root.appContext = value`;  read as `UIComponent.appContext`,
  `element/src/UIComponent.tsx` ~line 336).

How a page loads its elements (numbered, for a diagram):
1. The page imports ONLY the root:  `import "spell-ui/ui-root"` (or a bundle that defines it).
2. `<ui-root>` connects.  Unless `display="immediately"`, it hides its slot with an INLINE style (before any sheet
   arrives), keeping its space (`when-ready`), or draws a `<ui-loader>` (`loading`) or skeletons instead.
   - Hiding applies only under `@media (scripting: enabled)`:  crawlers and no-JS readers see everything.
3. It scans its subtree for undefined tags (`querySelectorAll(":not(:defined)")`):  every `ui-*` tag, every tag
   of a registered pack, and any its subclass claims (`RootLoader.undefinedTags()`).
4. Skeleton mode:  for each tag whose vocabulary describes a `skeleton` (skeleton text, e.g. `"inline 6 x 2.5"`
   for a button), it draws a `<ui-placeholder>` in ITS OWN shadow root, in page order;  the page DOM is untouched.
5. For each tag it looks up the FAMILY in `ROOT_CATALOG` (generated by `yarn gen:root` from the vocabularies;
   never guessed from the tag name) and `import()`s that family's barrel ONCE per page
   (`import.meta.glob(["../*/index.ts", ...])` -> the lib build's `ui-card.js` chunks).
6. Each `<ui-components source="x.pack.js">` inside loads that pack's classic script once (A.4);  the pack
   registers its prefix + catalog, so its tags are treated as the root's own.
7. The first component that connects calls `UI.load()`:  the shared `UI` runtime (keyboard, overlays, focus,
   styles, i18n, transitions, toasts, modals, icons, sources, themes ...) loads as ONE lazy chunk
   (`globalThis.UI ??= new UIRuntime()`).
8. Ready = every family settled, then every element inside resolved its `ready` (a nested root: its `settled`),
   or the `timeout` passed.  Then `:state(ready)`, `ui-ready { failed }`, and the content shows -- never hidden
   again.  A tag that failed fires a cancelable `ui-error` and shows its native fallback.
9. Content added later is loaded the same way (observed), but never hidden.

Other ways to load (getting-started page), all real entries:
- everything:  `import "spell-ui"` (registers every family;  `src/index.ts`)
- one family:  `import "spell-ui/ui-button"` (each family is its own entry)
- on demand:  `import "spell-ui/ui-root"` + wrap the page ("This site works that way")
- no JS:  `ui.css` (`src/styles/ui.css`, export `spell-ui/styles/ui.css`):  tokens, utilities, typography, native
  markup as one stylesheet;  `class="ui-typography"` on `<body>` for Fomantic's page typography.
- Static server render (SEO, no JS):  `spell-ui/src/static/` (`StaticRender.page()` / `fragment()`, node only)
  turns `ui-*` markup into plain light-DOM HTML;  spell-app's `spell static <pages...>` runs it
  (`spell-app/cli/README.md` line 88).  Also Declarative Shadow DOM rendering (CHANGELOG).

### A.4 Component packs

Source:  `spell-ui/AGENTS.md` "Component packs" (line 1035+), `spell-epic/src/README.md`, `spell-brand/README.md`.

- A COMPONENT PACK is ANOTHER package's custom elements, with its own tag prefix (`epic-`, `brand-`, `x-`), loaded
  on demand by `<ui-root>` exactly like spell-ui's own:

  ```html
  <ui-root><ui-components source="epics.pack.js"></ui-components><epic-page>...</epic-page></ui-root>
  ```

- The pack is ONE classic script (works from `file://`), built by the kit's `spell-pack build | check`
  (`element/tools/ComponentPack.ts`;  bin `element/bin/spell-pack.mjs`).
  - Settings in the pack repo's `package.json`:  `"spellPack": { "name": "epics", "prefix": "epic-", "dir": "src" }`
    (spell-epic's).
  - Generated, committed:  `components/__pack/<name>.catalog.ts`, `<name>.entry.ts`, `<name>.pack.js`.
- As it runs it calls `SpellUI.registerPack({ name, prefix, catalog, define })`.
  - `prefix` ends in `-`, is never `ui-`;  `catalog` has the root catalog's shape (folder + parsed skeleton).
  - `define()` may return a promise;  the root waits for it (`ComponentPacks.whileDefining()`).
- The pack does NOT bundle Solid or spell-ui:  it takes them from the page's `SpellUI.packModules`
  (`solid-js`, `@solidjs/web`, `$/spell-element`, `$/ui/core`, `$/ui/forms`), so there is ONE Solid per page and
  the pack's elements extend the page's own `UIComponent`.
  - So a page MUST load a bundle that sets `window.SpellUI` first:  spell-epic's docs bundle
    (`/_epic/assets/spell-ui.js`) or spell-ui's site bundle (`site/_src/SitePacks.ts`).
- A pack that fails or times out:  a console error naming its `source`, a `RootFailure` in `ui-ready`'s
  `failed`;  the root still gets ready.
- A pack's events keep their own names (`spell-open`, `brand-cast`);  only `ui-*` events take a translated prefix.
- The packs today:  `epics` (spell-epic, `<epic-*>`), `brand` (spell-brand, `<brand-*>`);  spell-app's
  `spell.pack.js` (`<spell-app>`, `<spell-editor>`) is built by Vite instead.
- Writing a pack family is "written exactly like a Spell UI family" on `spell-kit/element` + `spell-ui/core`.

### A.5 Page-level CSS and theming

Sources:  `src/styles/layers.css`, `src/styles/tokens.css` (generated), `src/styles/colors.css`,
`src/runtime/Themes.ts`, `src/runtime/AppStylesheet.ts`, `docs/theming.html`, `docs/getting-started.html`,
`/Users/owen/www/spell/spell.epics/guides/ui/notes/theming.md`.

- Layer order (MUST be the first sheet in the document AND every shadow root):

  ```css
  @layer ui.reset, ui.tokens, ui.base, ui.components, ui.utilities, ui.theme, ui.app;
  ```

  - Unlayered page CSS beats ALL of them:  "a page's plain stylesheet always wins over the library".
  - Each component's sublayers:  `types, content, variations, states` (states beat variations without
    `!important`).
- Four ways page CSS reaches inside shadow DOM (getting-started "Styling"):
  1. TOKENS (`--ui-*`) inherit into every component
  2. UTILITIES (`ui-stack`, `ui-bold`, `ui-text-truncate`, `ui-gap-m`, `ui-split:column`, `ui-button-ish` ...) work
     on your markup and inside components
  3. `::part()`:  each component names its inner boxes (`ui-button::part(button)`;  button's parts are
     `button`, `icon`, `label`)
  4. THE APP STYLESHEET:  give ONE `<link>` or `<style>` `id="ui-app-stylesheet"` and the runtime mirrors it into a
     constructable sheet adopted LAST into every component's shadow root, so it can restyle internals in Fomantic's
     class grammar (`.ui.button { ... }`).  Watched for changes;  `@import` inlined one level for text sources.
- Real token names (foundation, `src/styles/tokens.css`):  `--ui-font-size` (px, default `16px`;  everything else is
  `em`, NO `rem`), `--ui-font-family`, `--ui-font-family-heading`, `--ui-font-family-mono`, `--ui-line-height`,
  `--ui-space-3xs` ... `--ui-space-3xl`, `--ui-radius`, `--ui-radius-s|m|l|pill|circle`, `--ui-border-color`,
  `--ui-shadow-raised|floating|overlay`, `--ui-duration-fast|normal|slow`, `--ui-ease*`, `--ui-focus-width`,
  `--ui-text-color`, `--ui-ink`.
  - Colours (`colors.css`):  `--ui-primary`, `--ui-secondary`, `--ui-red`, `--ui-green`, `--ui-blue` ..., each with
    roles `-hover`, `-focus`, `-down`, `-active`, `-text`, `-border`, `-background`, `-header`, `-inverted`, `-on`;
    per-scheme bases `--ui-red-on-light` / `--ui-red-on-dark`;  `--ui-link`, `--ui-link-hover`.
  - The generic remaps every hue/size rule reads:  `--ui-color`, `--ui-scale`.
  - Component tokens are public `--ui-<tag>-*` (e.g. `--ui-button-background`, `--ui-button-color-hover`,
    `--ui-checkbox-mark-color`, `--ui-checkbox-radius`);  each family page's Theming tab lists its own.
  - Breakpoints only through `@custom-media` (`src/styles/media.css`:  `--ui-mobile` ...).
- Real example from the theming page ("Sitewide defaults"):

  ```css
  @layer ui.app {
    :root {
      --ui-primary: var(--ui-pink);
      --ui-primary-inverted: var(--ui-pink-inverted);
      --ui-secondary: var(--ui-grey);
      --ui-red-on-light: oklch(0.58 0.22 20);
      --ui-red-on-dark: oklch(0.72 0.17 20);
    }
  }
  ```

  and from getting-started:  `:root { --ui-primary: oklch(55% 0.2 290); }`,
  `ui-button.wide { --ui-button-padding-inline: 3em; }`.
- Dark mode:  follows the OS (`color-scheme: light dark` on `:root`, in `ui.tokens`).  Every colour token is a
  `light-dark()` pair resolved where USED, so:
  - `class="ui-dark"` / `class="ui-light"` force a scheme on a subtree;  `ui-invert` flips relative to its parent
  - `themes/dark.css` forces dark page-wide;  `:root { color-scheme: light }` for a light-only page
  - `<ui-root theme="dark">` for everything in a root
- THEMES:  `src/styles/themes/*.css`, `@layer ui.theme`, applied by the runtime (`UI.themes`, `src/runtime/Themes.ts`):

  ```js
  import { UI } from "spell-ui/core"
  const { themes } = await UI.load()
  themes.names                 // the Fomantic themes, A-Z
  themes.own                   // ["spell", "spell-brand"]
  await themes.apply("github") // classic + github, on the page and in every shadow root
  await themes.apply("classic")
  await themes.apply(undefined) // spell-ui's own look
  ```

  - Theme files today:  amazon, basic, bookish, bootstrap3, chubby, classic, colored, dark, duo, fixed-width, flat,
    fomantic-classic, github, gmail, instagram, material, pulsar, raised, resetcss, round, rtl, spell, spell-brand,
    striped, systemfont, timeline, twitter.
  - Fomantic themes are DELTAS on `classic.css` (Fomantic's default look):  applying one registers `classic` then the
    theme.  `dark` is a scheme, not a theme (`apply("dark")` throws).
  - `spell` and `spell-brand` are spell-ui's OWN themes (the Spell brand;  `spell-brand` adds `--spell-*` "brand
    roles" read by `<brand-*>` and the brand pages, never by plain `<ui-*>`).
  - Without the runtime a page can `<link>` `ui.css` + `themes/classic.css` + `themes/<name>.css`, but only the
    TOKEN half then reaches components (class-grammar overrides need the runtime's shadow adoption).
  - Not ported:  Fomantic's per-component `theme.config`;  one theme per page, mix by component tokens.
  - "24 of Fomantic's 25 themes ported" (saga `sagas/spell-ui/spell-ui.saga.html`).
- README-themes.md stub material:  the theming page `spell-ui/docs/theming.html` sections are Theme gallery /
  Using themes (Sitewide defaults, Component defaults, Applying a theme, Dark mode) / Composing a component (pieces,
  layers, units, remaps) / Cascading inheritance / Porting a Fomantic theme / Build notes.  The notes
  `guides/ui/notes/theming.md` has the sheet table (layers.css, reset, tokens*, colors*, sizes*, animations,
  utilities, typography, native, themes) -- `*` generated by `yarn gen:styles` from `src/styles/styles.en.ts`.
  - `yarn tokens:alias <family> [--write]`:  the codemod in that doc.

### A.6 Localization (vocabularies)

Sources:  `components/ui-button/UIButton.en.ts`, `/Users/owen/www/spell/spell.epics/guides/ui/notes/translation.md`,
`src/vocabulary/`, `tools/smoke/translate.html`.

- Every tag has ONE vocabulary file `UI<Name>.en.ts` declaring EVERY name it uses:  tag, noun, attributes (kind +
  allowed values), values, events, slots, parts, states, text strings;  plus `topics`, `aka`, `skeleton`.
  Templates read names through it, never literals.  Example excerpt:

  ```ts
  export const buttonVocabulary = {
    tag: "ui-button",
    topics: ["buttons", "basic", "controls", "forms", "elements"],
    aka: ["btn", "action", "submit", "link button"],
    skeleton: "inline 6 x 2.5",
    description: "A button indicates a possible action.",
    attributes: [
      { name: "size", kind: "size", description: "Size, `mini` ... `massive`;  `medium` is the default." },
      { name: "primary", kind: "keyOnly", description: "Primary emphasis:  the `primary` brand colour." },
      ...
  ```

  - Live:  `UIButton.describe()`.
  - The same data feeds:  the root catalog, the docs site data, VS Code autocomplete (`custom-elements.json`,
    `html-custom-data.json`), and the claude.ai design system.
- Translation:  a `Dictionary` maps canonical English names to another language;  `Vocabulary.define(prefix, dict)`.
  - VERIFIED to exist in a smoke page:  `UIButton.define("ie-boton", es)`, `UIDropdown.define("ie-desplegable", es)`
    (`tools/smoke/translate.html`, dictionary `test-helpers/dictionary.es.ts`);  `SharedVocabulary.es.ts` exists.
  - The notes say the page-wide runtime call (`UI.vocabulary.defineComponents({ prefix, dictionary })`) is "not
    built yet":  "Designed now, built later".
  - What stays canonical:  CSS classes, `:state()`s, JS property names, `event.detail` keys, tokens, utilities;
    part names only get an ADDED localized name.
  - Text strings go through `UI.i18n` (`UI.i18n.register("es", { label: "Etiqueta" })`, per component optional).
  - Emoji names:  two name sets, `cldr` (default) and `fomantic`;  translated sets planned.

### A.7 Semantic UI / Fomantic UI lineage (two lines, for a note)

- spell-ui keeps Semantic UI's / Fomantic UI's vocabulary -- the descriptive class grammar (`ui small primary basic
  icon button`), the Types / Content / States / Variations taxonomy, ~50 components, the docs-site style -- as
  ATTRIBUTES on `ui-*` tags;  every family's CSS is a port of Fomantic 2.9.4's `.less` / `.variables`, kept inside the
  shadow root.
- Why (plan.md, `guides/ui/notes/plan.md`):  "Fomantic UI has the best vocabulary of any widget set", but it is
  LESS + jQuery with thin accessibility, and predates `@layer`, anchor positioning, `<dialog>`/popover, `:has()`,
  form-associated elements;  Semantic UI React is React-only and unmaintained.
- A read-only clone `reference/Fomantic-UI/` (git-ignored) is used for porting (`gen:icons`, `gen:emoji` need it).

### A.8 What a page needs (real markup)

1. Plain page with the library build (STANDARD shape;  the smoke pages do it with an import map onto `dist/`):

   ```html
   <script type="module">
     import "spell-ui/ui-root"   // the root;  it loads every other family on first use
   </script>
   <ui-root theme="dark" size="small" icons="fa7-brands" loading="Loading reports…">
     <ui-segment>
       <ui-header>Report</ui-header>
       <ui-button primary>Save</ui-button>
     </ui-segment>
   </ui-root>
   ```

   (from `guides/ui-component-creation.html` section 7, its `@spell-app/ui/ui-root` corrected to `spell-ui/ui-root`)
2. A spell-ui docs page (`spell-ui/docs/ui-button.html`), served by the page server at `/components/ui/`:

   ```html
   <head>
     <meta name="color-scheme" content="light dark" />
     <script>/* before first paint: restore the viewer's scheme, adds class ui-dark / ui-light on <html> */</script>
     <link rel="stylesheet" href="_assets/site.css" />
     <script type="module" src="_assets/site.js"></script>
     <script defer src="/_epic/assets/spell-comments.js"></script>   <!-- comments: spell-epic's -->
   </head>
   <body class="ui-typography"> <main id="main" class="site-main"> ... </main> </body>
   ```

   - `site.js` wraps the `main` in `docs/__parts/layout.html`, whose root is
     `<ui-root class="site" stack-with="page" icons="fa7-brands, fomantic" display="when-ready">` and which loads the
     epics pack (`<ui-components source="/_epic/pack/epics.pack.js">`) for the comment threads.
3. A `file://`-safe page (an epic page, `/Users/owen/www/spell/spell.epics/epics/readme/readme.plan.html`):  ONE
   classic script, spell-epic's docs bundle, at the END of `<body>`:

   ```html
   <head><link rel="stylesheet" href="/_epic/assets/spell-doc.css" /></head>
   <body data-spell-needs-server class="spell-doc-page plan-doc">
     <ui-root>
       <ui-components source="/_epic/pack/epics.pack.js"></ui-components>
       <spell-site-header root="../.."></spell-site-header>
       <div class="spell-doc"><main class="spell-doc-main"> <epic-page ...>...</epic-page> </main></div>
     </ui-root>
     <script src="/_epic/assets/highlight.min.js"></script>
     <script src="/_epic/assets/spell-ui.js"></script>
   </body>
   ```

   - The docs bundle (`spell-epic/src/tools/_assets/spell-ui.entry.js`, built by `bundle-spell-ui.js`):  every
     family inlined, icons pre-registered (no pack loading from `file://`), emoji chunks lazy as classic scripts,
     the `spell-brand` theme applied, `window.SpellUI` set (with `registerPack`, `packModules`).
4. Claude Design board (guide `guides/claude-design/claude-design.html`):
   `<script src="ds/spell/components/bundle.js">` then plain `<ui-*>` inside `<ui-root>` (spell-brand's
   design bundle, B).

### A.9 Component API conventions (VERIFIED in AGENTS.md "UI rules" + getting-started "contract")

- Attributes for primitives:  strings, numbers, booleans are REFLECTED attributes.
  - Booleans follow HTML:  true = presence, `""`, `"true"`, `"yes"`;  false = `"false"`, `"no"`.
  - Widths:  `width` (columns `4` of 16, fractions `1/4`, `25%`), never `wide`.
  - Chosen state:  `selected` (canonical);  `checked` as an alias on checkbox/radio.
  - `medium` size is a real no-op.
- Properties for rich data:  `options`, `rows` ... are real accessors on the class, so frameworks find them with
  `key in el`.  First paint never needs one (SSR drops them).
  - The "upgrade step":  a property set BEFORE the tag is defined is kept and re-set through the setter
    (`DOMElement`:  "properties a page set before the tag was defined, kept").
- Events:  `CustomEvent`s, `bubbles: true, composed: true`, lowercase kebab `ui-*` names (`ui-change`, `ui-open`,
  `ui-close`, `ui-toggle`, `ui-ready`, `ui-error`, `ui-success`, `ui-failure`, `ui-valid` ...);  `detail` carries
  computed state (`{ value }`, `{ open }`) plus `originalEvent`.  Plain clicks are the native `click`.
- States:  custom states via `ElementInternals`, styled as `:state(open)`, `:state(ready)`, `:state(errored)`,
  `:state(in-card)` ...
- `ready`:  every DOM element has `readonly ready: Promise<void>` (`element/src/DOMElement.ts` line 70), resolved once
  the component rendered with styles (or errored).
- Two objects per tag:  the DOM ELEMENT (`<ui-button>`, a `DOMElement` subclass:  attributes, properties, events,
  script API) and the COMPONENT (`UIButton`, a `UIComponent`:  state, `render()` into shadow DOM).
  `domElement.component` / `component.domElement`.  Family script APIs live on `DOM<Name>Element` (e.g.
  `<ui-form>`'s `validate()`, `isValid()`, `reset()`, `clear()`, `values`, `nativeForm`).
- Forms:  controls are form-associated (`internals.form`);  `<ui-form>` validates over a LIGHT-DOM `<form>`
  (slotted inside it preferred, or around it) and never creates/moves one ("frameworks own that DOM").
- Fallbacks:  a component whose render throws shows a native (no-Solid) fallback (form controls), gets
  `:state(errored)` and dispatches cancelable `ui-error`;  siblings keep working.
- Invoker commands:  `<ui-button commandfor command>`;  modal/flyout/sidebar/dimmer/popup/dropdown answer `--show`,
  `--close`, `--toggle` (JS fallback where `UI.browser.supports.invokers` is false).
- Editor support:  `docs/__data/custom-elements.json` (Custom Elements Manifest 2.1;  also `package.json`
  `"customElements"`) and `html-custom-data.json` (VS Code `html.customData`).  spell-ui ships NO JSX
  `IntrinsicElements` typings for consumers (only spell-app has its own, `spell-app/app/src/solid/solid.types.ts`).
- Guide for authors (how an element is written):  `/Users/owen/www/spell/spell.epics/guides/custom-elements/custom-elements.html`
  (platform, the two objects, decorators `@E.state`, `@E.controlled`, `@E.cssState`, `@E.onChange` ..., life of an
  element, events) -- belongs mostly to the kit's element README.

### A.10 Using spell-ui from frameworks

What is VERIFIED:  `spell-ui/tools/frameworks/` host pages, run by `yarn smoke` (headless chromium, import map onto
`dist/` + vendored ONE Solid):  `vanilla.html`, `react.html` (React 19 from esm.sh), `vue.html` (Vue 3 from unpkg),
`solid.html` + `solid/app.tsx` (Solid 2 app sharing the components' Solid, with an identity probe), and
`tools/smoke/compat-solid-1.9.html` (a Solid 1.9 app with the components on Solid 2:  "not the recommended setup").
Each does the same round trip on a controlled `<ui-dropdown>` (`check.js`).  CHANGELOG:  "checked with vanilla,
React 19, Vue 3, Solid 2 and Solid 1.9 hosts".

What is DOCS SAY only:  Svelte 5, Angular 20, Preact 10 (getting-started's table:  "The contract holds in React 19,
Vue 3.5, Svelte 5, Solid, Angular 20 and Preact 10").  No Svelte / Angular / Preact host page exists in `tools/`.

- a) Vanilla JS (VERIFIED, `tools/frameworks/vanilla.html`):

  ```js
  const dropdown = document.querySelector("ui-dropdown")
  dropdown.options = OPTIONS                        // a property, even before the tag is defined
  dropdown.addEventListener("ui-change", (event) => (output.textContent = event.detail.value))
  document.querySelector("#open").addEventListener("click", () => (dropdown.open = true))
  await import("spell-ui")                          // defining later is fine:  the upgrade step keeps `options`
  ```

- b) React 19 (VERIFIED, `tools/frameworks/react.html`):  React 19 sets props as PROPERTIES when `key in el`, and
  listens with `on<event-name>`:

  ```js
  h("ui-dropdown", {
    selection: true, placeholder: "Fruit", options: OPTIONS, value, open,
    "onui-change": (event) => setValue(event.detail.value),
    "onui-open": () => setOpen(true),
    "onui-close": () => setOpen(false)
  })
  ```

  JSX form (getting-started):  `<ui-dropdown options={arr} value="x" open onui-change={fn} />`.
  STANDARD:  React 18 and earlier don't pass objects as properties or listen to custom events (ref +
  `addEventListener`);  TypeScript users need their own `JSX.IntrinsicElements` declarations.
- c) Svelte 5 (DOCS SAY;  not smoke-tested):  `<ui-dropdown options={arr} value="x" open onui-change={fn}>`.
  STANDARD:  Svelte 5 sets a prop as a property when the element has it, and `on<name>` attributes add listeners.
- d) Solid (VERIFIED for Solid 2, `tools/frameworks/solid/app.tsx`):

  ```tsx
  <ui-root prop:appContext={APP_CONTEXT_VALUE}>
    <ui-dropdown selection placeholder="Fruit"
      prop:options={options} prop:value={value()} prop:open={open()} ref={listen} />
  </ui-root>
  ```

  - Solid 2 has no `on:` namespace any more, so `ui-*` listeners go on through a `ref` callback
    (`ref={(el) => el.addEventListener("ui-change", fn)}`).
  - The app MUST share spell-ui's ONE Solid (`solid-js` / `@solidjs/web` `2.0.0-rc.13`;  every Vite config dedupes
    them, `SOLID_DEDUPE`);  `identity.js` proves it.
  - A Solid context can't cross the element boundary:  pass app data through `<ui-root prop:appContext>`.
  - Solid 1.9 hosts (VERIFIED as COMPATIBILITY):  `prop:options`, `on:ui-change`;  two runtimes on one page.
- e) Vue 3 (VERIFIED, `tools/frameworks/vue.html`):

  ```js
  app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith("ui-")
  // template:
  // <ui-dropdown selection placeholder="Fruit" :options="options" :value="value" :open="open"
  //   @ui-change="value = $event.detail.value" @ui-open="open = true" @ui-close="open = false">
  ```

  Getting-started uses `.options="arr"` (force property).  "Vue may send `open="false"` when it can't find a
  property;  the boolean converter reads that as false."
- Angular (DOCS SAY):  `[options]="arr" (ui-change)="fn($event)"` plus `CUSTOM_ELEMENTS_SCHEMA`.
- For every framework (getting-started):  "Define the elements before the framework renders them.  As a backstop,
  a property set before definition is upgraded."
- What a framework app needs to INSTALL today (open question F1):  the package isn't published;
  `package.json` `exports` point at TypeScript SOURCE (`./components/ui-*/index.ts`) for in-kit use, and
  `publishConfig.exports` at `./dist/*.js` (+ `.d.ts`) for the published package.  So a framework README should
  show `npm install spell-ui solid-js@2.0.0-rc.13 @solidjs/web@2.0.0-rc.13` as the "once published" path, and the
  in-kit path (`yarn build` -> `dist/`) for now.

### A.11 Commands and folders (for the README's "work on it" section)

- In the kit:  `yarn install` at `~/www/spell` (never in the child repo);  `yarn clone spell-ui` clones it.
- In `spell-ui/`:  `yarn dev` (Vite demo `tools/demo/index.html`:  every example, class grammar beside elements,
  hot reload), `yarn review` (tsc + oxlint + oxfmt + tests), `yarn build` (`dist/`), `yarn test`, `yarn test:all`,
  `yarn test:visual` (needs Docker for linux baselines), `yarn smoke`, `yarn measure`, `yarn report`,
  `yarn site:dev` / `site:build` / `site:new <tag>` / `site:check`, `yarn gen:root` / `gen:styles`,
  `yarn icons:pack <folder> --id <id>`, `yarn design:build`.
- Folder map (from `spell-ui/README.md` "Files"):  `src/index.ts` (everything), `src/core.ts` (`E`), `src/forms.ts`
  (`F`), `src/api.ts` (`E`, `F`, `V`), `src/elements/`, `components/`, `src/docs-components/`, `src/runtime/` (`UI`),
  `src/vocabulary/`, `src/styles/`, `src/icons/` (icon packs:  SVG files + `pack.js`;  Font Awesome 7 Free default,
  FA7 Brands and Fomantic names opt-in), `src/util/`, `src/static/`, `test-helpers/`, `tools/`, `scripts/`, `docs/`
  (the docs site's pages), `site/` (its bundle build).
- The docs site:  plain `.html` pages in Fomantic's docs style built only from `<ui-*>` widgets (66 pages, 1608 live
  examples per the saga);  served at `/components/ui/` by spell-app's page server (`componentSets` in
  `spell-app/package.json` line ~192:  `ui`, `epics`, `app`, `brand`) and by the epic server.
- Sub-README candidates already present:  `spell-ui/docs/README.md` (making a docs page), `spell-ui/site/README.md`
  (the site bundle), `spell-ui/tools/README.md` (tooling).

---

## B. spell-brand

### B.1 What it is

- npm name `spell-brand`;  `description`: "Spell's brand:  Claude Design's pages and tokens, their Spell UI copies,
  and the <brand-*> elements they need (a component pack)" (`spell-brand/package.json`).  One export, `.`.
- Repo needs:  spell-ui and the kit (`repos.json5`:  `"needs": ["spell-ui"]`).
- Saga "Spell Brand":  "Spell's look:  the brand pages, and designing with Spell UI in Claude Design."
- Three things in it:
  1. a COMPONENT PACK of `<brand-*>` elements (prefix `brand-`, `components/__pack/brand.pack.js`), written exactly
     like spell-ui families on `spell-kit/element` + `spell-ui/core`
  2. its docs set, Brand UI (`docs/`), served at `/components/brand/` in spell-ui's page shape
  3. the brand's code and assets:  `Palette` (colour math ported from Claude Design's `palette.mjs`:  sRGB <-> OKLCH,
     contrast, `generateScale()` 17-step ladders), the `accent` hue (`src/hues.ts`), the bundle for the Brand tab's
     copies (`src/brand-ui.ts` -> `_assets/ui/brand-ui.js`, git-ignored, built by the page server), the claude.ai
     design bundle (`src/brand-design.ts`, `yarn design:bundle`), and `assets/` (logo SVG/PNG, the P052 serif font +
     URW licence, reference images), served at `/_brand/assets/...`.

### B.2 The elements (vocabulary descriptions, verbatim)

- `brand-blob`:  "tucks one soft lavender shape into a corner of its parent, never behind body text"
- `brand-checklist` / `brand-check`:  "shows a build's progress step by step, or a list of things to tick off"
- `brand-color`:  "a square colour chip:  a label inside, an AA mark, a selected ring, a details tip;  click to copy"
- `brand-color-picker`:  "chooses a colour on an HSL square and a hue slider, or by typing HSL, hex or OKLCH"
- `brand-color-range`:  "a 17-step ladder of shades made from one base colour"
- `brand-color-set`:  "lays out colour chips in a row or a grid;  `selectable` makes it a radio group"
- `brand-composer`:  "the box where you describe an app in plain words and cast it" (event `brand-cast`)
- `brand-flourish`:  "draws generated page art (swoops, blobs, curls, sparkles) behind its parent's content"
- `brand-logo`:  "The Spell logo:  the hat mark, or the mark with the wordmark (and tagline)" (`variant="lockup"`)
- `brand-phone`:  "frames live app content as a phone"
- Usage (README, path stale -- see E):

  ```html
  <ui-root>
    <ui-components source="/packages/brand/components/__pack/brand.pack.js"></ui-components>
    <brand-logo variant="lockup"></brand-logo>
  </ui-root>
  ```

  The page must load spell-ui's docs bundle or a set's site bundle first (for `SpellUI.registerPack` /
  `packModules`).
- Graduated INTO spell-ui:  `<ui-panel>` (the inspector panel) and `<ui-field>` (the inspector's fields).
  "Generic elements (the field, the colour chips) move into Spell UI later" (README "Deferred").

### B.3 Relation to spell-ui and Claude Design

- The brand look IS a spell-ui theme:  `spell-ui/src/styles/themes/spell-brand.css` ("the Spell brand as Claude Design
  drew it"), a full copy of `spell.css` plus "Brand roles" (`--spell-surface-tint`, `--spell-surface-warm`,
  `--spell-text-strong`, `--spell-accent`, `--spell-shadow-xs` ... `-lg`, `--spell-type-eyebrow`, `-lede`).
  - Primary:  Spell Purple (`violet-600` light, lilac `violet-300` dark);  dark mode is AUBERGINE, never black;
    accent "Polished Ivory";  serif = installed Palatino ('Spell Serif').
  - Every docs page (spell-epic's docs bundle) wears `spell-brand`.
- Claude Design:  an Anthropic claude.ai product that made 13 brand pages (mockups, colour tools, logo and art
  pages), exported as `*.dc.html` templates into the content repo's `brand/spell-design-system/` (NEVER edited).
  - Each has a `.spell.html` COPY beside it built only from spell-ui elements + the theme;  `brand/compare.html`
    shows an original and its copy side by side / overlaid;  `yarn compare` diffs screenshots (3-11% of pixels on
    most pages:  table in `guides/design-system/design-system.html`).
  - These pages are SHARED content (`/Users/owen/www/spell/spell.epics/brand/`:  `index.html`, `compare.html`,
    `spell-design-system/`, `leonardo/`, `pony.html`, `design-system.json`), not in the repo.
- The other direction:  a "Spell" DESIGN SYSTEM on claude.ai, GENERATED from the code
  (guide `guides/claude-design/claude-design.html`):
  - every vocabulary -> a card (README + live preview);  the `spell-brand` theme -> `tokens.json`;  the brand rules ->
    its README;  the `<brand-*>` elements -> a "Brand" group
  - its components are ONE classic script, `components/bundle.js` (`window.SpellUI`, everything inlined, every Font
    Awesome Free icon, <= 6 MB), built by spell-brand's `yarn design:bundle` and proven by `yarn design:check`
    (an `about:srcdoc` frame + Claude Design's own runtime, `vendor/claude-design/dc-runtime.js`)
  - spell-ui's `yarn design:build --brand <folder>` writes the system's files (`tools/DesignExport.ts`)
  - a design writes plain markup (`<ui-button primary icon="check">Save</ui-button>`), no React wrappers
  - `/design push` sends changes;  `/design pull <link>` brings a board back as a page (the "pony" proved it).
  - Counts:  "70 cards (11 of them Brand) and 451 colour tokens, pushed 2026-10-05".
  - NOTE:  the `/design` skill is spell-app's, not spell-epic's (spell-epic guide:  "Staying in spell-app ... the
    fussbudget, design, solid-2, spell-docs and spell-serve skills").
- Commands in `spell-brand/`:  `yarn build`, `yarn pack:build` / `pack:check`, `yarn site:data [--check]`,
  `yarn design:bundle`, `yarn design:check`, `yarn compare [<page>...]`, `yarn test` (node + browser), `yarn review`.
- Saga "ideas not done":  a logo, illustration and voice guide carried into the app and a public website;  the app
  still wears spell-ui's default look in places.

---

## C. spell-epic

### C.1 What it is

- `spell-epic/README.md`:  "The epic tooling, as a Claude Code plugin:  epic pages and their review loop, worktrees
  and VS Code windows, parking and waking sessions, and the `epic` command that drives them."
- npm name `spell-epic` (private, MIT, `bin: { epic: "bin/epic" }`);  `description`: "the epic tooling -- epic pages
  and their <epic-*> component pack, the epic command, worktrees and windows, the review loop, and every docs page's
  tooling -- as a Claude Code plugin, loaded in place".
- ONE copy per machine, which every repo and every window runs;  an edit is live at once for `epic` and the hooks;
  a skill's new text after `/reload-plugins`.
- Lifted out of spell-app by epic `epic-eject` (2026-10-17;  switched over 2026-10-18), fresh git history.
- Claude Code ONLY today:  skills, hooks, `${CLAUDE_PLUGIN_ROOT}`, `EnterWorktree`, plan mode, `AskUserQuestion`,
  the VS Code Claude panel.  (The kickoff prompt says "Note that it is Claude only for now".)
- Repo needs:  spell-ui (drawn with it) and the kit (page server, assembler, element, toolchain) -- `workspace:*`
  dependencies, so it only installs INSIDE the kit today.
- Layout (README "What's in it"):  `.claude-plugin/` (plugin.json + a marketplace of one), `skills/` (17),
  `hooks/` (`hooks.json` + scripts), `bin/epic`, `src/` (`$/epics`:  `<epic-*>` elements in `components/`, the pack
  in `components/__pack/`, the epic tool `tool/`, the command `command/`, the epic server `server/`, docs tools
  `tools/` + `tools/_assets/`, Epic UI's pages `docs/`, `window.mjs`), `tests/`, `scripts/`, `vscode/` (the
  extension), `templates/` (every page kind's starting point + `templates/epics/plan-doc.md`).

### C.2 The methodology

Main sources:  `spell-epic/templates/epics/plan-doc.md` (the rules, 755 lines), `spell-epic/skills/epic/SKILL.md`,
`/Users/owen/www/spell/spell.epics/guides/plan-docs/plan-docs.html` ("Epic Pages", the reader's guide).

- EPIC:  "a planning session and the work it plans;  its live record is the EPIC PAGE" (epic SKILL.md).
  - One epic = one id (`readme`), one branch and worktree of that name, one Claude session titled `🚧 <name>`,
    one VS Code window `⎇ <name>`, one epic page `epics/<name>/<name>.plan.html` in the shared CONTENT FOLDER.
  - The epic page is SHARED content:  every checkout sees one file;  never committed in the repo;  the `Stop` hook
    commits the content repo after every turn ("auto: epic <name>").
- SAGA:  "an epic of epics, the larger aim its epics serve" (`sagas/sagas.json5`, `sagas/<id>/<id>.saga.html`, an
  `<epic-page kind="saga">`):  sections Overview (purpose, "Done so far", "Ideas not done yet"), Epics (cards drawn
  by the server), Questions, Todos, Log.  Sagas today:  spell-ui, spell-brand, docs-site, epics (Epic Tooling),
  agents, drawable-spell, output-targets, shared-spell, spell-language, tooling.
- The epic page's FIXED sections (ids never change):  1 Overview `#overview` (summary, kickoff prompt, estimate,
  sub-sections `o1`...), 2 Phases `#phases`, 3 Questions `#decisions`, 4 Judgement calls `#judgements`, 5 Caveats
  `#caveats`, 6 Todos `#todos`, 7 Issues `#issues`, 8 To test `#tests`, 9 Log `#log`.
- PHASES:  `P1 · Short Name` (2-4 words, stable id like `p-epic-migrate`), each Symptom (one line), Changes (2-3
  lines), Goal, Done (once done), Commits (by the tool), Files, Verify (hidden), an Estimate (Claude's wall-clock),
  `<epic-update>` blocks for plan changes, Requests (from `/send`).  The LAST phase is always "Doc Review".
- ITEMS and their ids (short so they're easy to say in chat):
  - `Q` question (an answered question IS a decision;  old `D` ids live inside it)
  - `J` judgement call:  a choice Claude made without the human;  CALM (yellow) by default, RED only when it would
    surprise ("the principle of least surprise")
  - `C` caveat (limits and risks accepted), `T` todo, `I` issue, `V` test ("verify":  Step / Should / Example / If not)
  - `P` phase, `O` overview sub-section
  - NEVER deleted:  closed (`done`), or `canceled` (struck);  rewritten text moves into a folded Original Discussion.
  - Every question / issue / call ends with a **Net effect** list (`<epic-net-effect>`);  options as
    `<epic-choices>` of `<epic-option letter="A" ... recommended>`.
- COLOURS (one meaning each, every doc page):  red = needs you;  yellow = open, undecided;  blue = do it now /
  Claude is on it;  green = decided or done;  orange = changed since you looked, or Claude's options waiting for
  your pick;  violet = Claude's voice;  ivory = the human's voice;  grey = no longer relevant.  FILL:  grey outline =
  available, DASHED = pressed not sent, OUTLINE = sent / in progress, cleared = handled, SOLID = chips only.
- THE REVIEW LOOP (on the page, in VS Code's Review tab):
  - Item buttons:  Approve (green), Revisit (blue, opens a note box), Make Todo (green), and apart, Do Now (the
    wand, blue:  answered at once by a background agent).  A todo has its own:  "do it in the next phase" (plane),
    Revisit, Drop it (x).  Option cards have a Choose pill.  The note box saves as you type (server-side draft),
    with Revisit Later / Skip This.
  - The page header:  Send (paper plane:  hands the marks to the listening session) and Review Now (wand:  sends
    everything AND turns every waiting revisit into a request for now).  `+` asks for a NEW todo / question.
  - Marks wait in `<name>.inbox.json5` beside the page (git-ignored) until sent;  nobody listening -> they wait,
    dashed, and the review line says "No Claude session is reviewing this doc".
  - "Nevermind":  click a spinning Do Now again to call it off;  a late agent write is refused.
  - Answers land IN the items (reply cards, More Details cards, Claude status cards "Underway" / "Done" / "Noted"),
    never only in the chat.
- DO NOW:  the wand on an item (or the note box):  no Send needed;  a blue Underway card appears and a background
  agent writes the answer into the item.
- COMMENTS and BULLHORNS (epic `airplane` P11;  `spell-epic/src/tools/_assets/spell-doc-comments.js`):
  - on ANY docs page served by the page server (guides, epic pages, components pages):  a BULLHORN beside every
    major block (sections, tables, asides, code, messages, cards, items, phase fields, summary) and in the page
    header;  or select text and press ⌘/Ctrl-I
  - a small floating PANE (`<epic-comment-pane>`) that saves as you type, never scrolls the page
  - saved comments become THREADS (`<epic-thread>`) under the paragraph they quote:  "You:" / "Claude:" messages,
    "Claude: thinking…" while at work, Approve / Revisit / x pills when it's your turn
  - ids `M1`, `M2` ...;  the toolbar's bullhorn (orange count) jumps to the next thread waiting on you;
    Cmd/Ctrl-K takes an id
  - kept in `<page>.inbox.json5` beside the page;  a docs page's Send goes to the epic that OWNS the page (its guide,
    details, See Also), else to the standing epic `feedback`;  an epic page's go in its review inbox
- TEST RUNS (epic `epic-engine` P4):  "Start testing" on To test (or `epic test <name>`, `epic test --all`) steps
  through each open test as one big card (`<epic-test-run>`):  Passed / Failed (note + pasted screenshot) / Skip /
  Not now;  `inbox apply` closes passed ones and turns a failure into a NEW issue "V3 failed: ...".
- REQUESTS:  `/send [<epic>] <text>` (skill `send`) files the human's words + screenshots as a request `rN` to
  another epic and wakes that epic's session;  `epic file <epic>#P3 r3` puts it into a phase's Requests field.
  Tooling requests go to the "tooling home" epic (`epic home`).
- STANDING epic:  `<epic-page standing>` -- each phase goes onto `main` at once (`epic merge <name>`), never
  `/isolate done`;  e.g. `epic-workflow`, `feedback`.
- FUTURE epics:  `/epic future <name> [idea]` -- a stub page, no worktree, plus a review page of its high-level
  questions (`details/analysis.html`);  the Epics page's "New epic" seedling pill makes one too;  planned later by
  `/epic <name>` ("Reuse").
- BEDTIME:  `/bedtime` (user-invoked only) -- pick phases and answer questions up front, then build them overnight,
  a commit per phase, judgement calls recorded in the page, never merge;  `epic bedtime <name> start "P3-P6"`;
  in the morning `/epic review <name>`.
- AIRPLANE:  `/airplane` before a flight (checks the page server, offline pages, the extension;  parks sessions;
  airplane mode on) -> mark pages with no Claude (marks wait on the laptop) -> `/airplane land` gathers everything
  across every epic and page, applies marks, answers notes in the background, asks which new epics to start.
- DETAILS PAGES:  `/details` -- when a question needs a picture or more than the AskUserQuestion modal holds
  (4 options x 4 questions), Claude writes a small page (`epic ask new ...`), shows it in the Review tab, and the
  human answers ON the page (`<epic-ask>`, `<epic-text-box>`, Send);  `epic ask wait` in the background wakes the
  session.  CHOICE pages (`epic choices new --rows`):  a table of names Claude recommends, typed over, "Do it".
- BACKGROUND AGENTS:  `/bg ["name"] [n] <task>` -- a named fork does it, `epic agents add|done` lists it, and the
  epic page's "Agents running" panel lets the human send it a note.
- WAKING (epic `epic-workflow` P16):  Send / Review Now / Do Now with nobody listening makes the server TYPE
  `/epic review <epic>` into the epic's running session (`🚧 <epic>`), else open a new session tab in its worktree
  window, else a main window;  the human presses Enter.  Once per epic per 10 minutes.

### C.3 The `epic` CLI

- `bin/epic`:  runs `src/command/epicMain.ts` through `tsx` (no build step) + the kit's alias hook;  on every Claude
  session's `PATH` while the plugin is on;  `epic --help`, `epic <verb> --help`, `epic --version` (which code runs).
  Loads no spell:  starts in a fraction of a second.  Addressing:  `epic <verb> <epic>[#<id>]` (`seo#J3`) or a short
  address (`SAGA:/drawable-spell/python-target#T1`).
- Command groups (from `src/command/EpicProgram.ts` `commandsGroup()` headings and `epicGroups.ts`):
  - Requests from other sessions:  `send`, `requests`, `file`, `home`, `merge`
  - Epic page, making and reading:  `new`, `list`, `summary`, `summaries`, `items`, `docs`, `decisions`, `open`,
    `check`
  - Epic page, phases:  `add-phase`, `update`, `updated`, `phase`, `commit`, `commits`
  - Epic page, items:  `add`, `calm`, `decide`, `choose`, `close`, `reopen`, `cancel`, `details`, `status`,
    `restore`, `review`, `defer`, `queue`, `unqueue`
  - Epic page, the review inbox:  `inbox` (`listen`, `wait`, `apply`, `done`, `clear`, `working`, `unlisten`),
    `test`
  - Log and upkeep:  `log`, `prompt`, `bedtime`, `overnight`, `backfill`, `convert`, `split`, `join`, `migrate`
  - Sagas:  `saga` (`list`, `new`, `page`, `set` ...)
  - Worktrees, sessions and parked work:  `worktree` (`path`, `move`, `remove`, `merge-main`, `repos` ...),
    `session`, `park`
  - Shared content:  `shared` (`status`, `init`, `link`, `commit`, `migrate`, `repair`, `rename`)
  - Windows and the page server:  `window` (`open`, `stay`, `stay-check`, `handoff`, `launch`, `color`, `init`,
    `move` ...), `server`, `hub` (the one epic server:  `ensure`, `url`), `pages` (`index`, `update`, `new`, `open`,
    `link`, `fuss`, `offline`, `template`), `repo` (`add`, `list`)
  - The repo's settings:  `init`, `config`, `stock`
  - Pages answered on the page, agents, airplane mode:  `ask` (`new`, `show`, `wait`, `answer`, `draft`, `list`,
    `sweep`), `choices`, `comments` (`list`, `wait`, `gather`, `working`, `answer`), `notes`, `agents` (`list`,
    `add`, `set`, `done`, `wait`, `told`), `airplane`
- Old spellings still run:  `spell dev plan-doc <verb>`, `spell dev worktree ...`, `spell dev details ...`,
  `spell epic <verb>` (spell-app's CLI hands them on).

### C.4 The page components (`<epic-*>`, `spell-epic/src/components/`)

All one pack (`epics.pack.js`, prefix `epic-`), docs at `/components/epics/` (`spell-epic/src/docs/<tag>.html`).
A page file holds only DATA (attributes) and PROSE (children);  the elements draw chrome in shadow roots.
- Page structure:  `epic-page` (header, meta, step label, Send / Review Now, toolbar), `epic-overview`,
  `epic-summary`, `epic-prompt` (kickoff prompt), `epic-section` (by `kind`:  phases, questions, ..., log,
  overview-part), `epic-phase`, `epic-field` (Symptom, Changes, Goal, Done, Files, Verify, To review),
  `epic-item` (ONE element for every item kind), `epic-event` (a log line), `epic-commit`
- Prose blocks:  `epic-question`, `epic-choices` / `epic-option`, `epic-answer`, `epic-net-effect`, `epic-reply`,
  `epic-more` (More Details), `epic-original` / `epic-version` (Original Discussion), `epic-update`,
  `epic-note` (`state="update|done"`), `epic-aside`, `epic-code` (folded code), `epic-link` (`epic="seo"
  item="J3"`), `epic-updated` (RETIRED)
- Review:  `epic-review` (the buttons of an item / phase / summary), `epic-status` (Claude's Underway / Done /
  Noted card), `epic-new-item`, `epic-state-filter`, `epic-hidden-note`, `epic-agents` (running agents panel),
  `epic-test-run`
- Comments:  `epic-comment-pane`, `epic-thread`, `epic-thread-message`, `epic-threads`, `epic-page-note-head` (old
  page notes)
- Lists:  `epic-list` / `epic-card` / `epic-sort` (the Epics page:  Favorites, Active, Planning, Urgent, Done),
  `epic-cards` (a saga's epics)
- Answer pages:  `epic-ask`, `epic-text-box`, `epic-send`, `epic-choice-rows` / `epic-choice-row`,
  `epic-choices-bar`
- How a page draws:  `<ui-root>` -> `<ui-components source="/_epic/pack/epics.pack.js">` -> skeletons for the tags
  -> pack registers -> elements upgrade;  the page's docs bundle (`/_epic/assets/spell-ui.js`) supplies spell-ui and
  Solid.  From `file://` the skeleton draws;  part files (`parts/<id>.html`, loaded on first open) need the server.
- The epic tool (`src/tool/`) writes the same markup through the same element DEFINITIONS (`src/definitions/`):
  "Each element is described ONCE" (guide `guides/epic-components/epic-components.html`).

### C.5 Hooks (`spell-epic/hooks/hooks.json`;  each acts only in a repo with `.epic/config.json5`, always exits 0)

- `worktree.mjs create|remove` (`WorktreeCreate` / `WorktreeRemove`, timeout 900s):  replaces Claude's own worktree
  logic -- worktree `<worktreesFolder>/<name>` on branch `<name>` from LOCAL main, session kept saved at the repo
  root (so every window's Claude panel lists it), content links, optional install first;  remove stops the
  checkout's page/vite servers first.
- `behind-main.mjs` (`SessionStart`, `PostToolUse` on `EnterWorktree`):  tells the human and Claude when the
  worktree is behind `main`, and offers the merge.
- `worktree-guard.mjs` (`SessionStart`):  a worktree's session that starts outside it (or in it without
  `EnterWorktree`) is told to enter it.
- `server-prune.mjs` (`SessionStart`, at most hourly):  stops servers whose checkout is gone.
- `left-worktree.mjs` (`PostToolUse` on `ExitWorktree`):  reminds the reply to end with the closing line
  ("*You can close this tab*").
- `prompt-gate.mjs` (`UserPromptSubmit`):  checks `/isolate <name>`, `/epic <name>`, `/epic resume`, `/unpark`
  BEFORE Claude reads them:  renames the session (`🚧 <name>`, `📅 <name>` for future), refuses ones that would go
  wrong (plan mode, inside another worktree), saving the text to `~/.spell/prompts/<name>.md`.
- `handoff.mjs` (`Stop`):  moves a session to another window once its turn ends (armed by `epic window handoff`).
- `shared-commit.mjs` (`Stop`):  commits the content repo after every turn (detached, `epic shared commit`).

### C.6 Skills (`spell-epic/skills/*/SKILL.md`, one line each)

- Planning:  `epic` (plan + build an epic in its worktree;  `review`, `resume`, `future`, `phase`, `start`,
  `request`, `done`), `epics` (list open epics), `details` (a question as a side-bar page answered on the page),
  `comment` (review files inline in plan mode's editor tab), `docs-check` (make an epic's docs agree with what was
  built), `send` (send a request to another epic, wake its session)
- Worktrees and sessions:  `isolate` (move a session into its own worktree + window;  `done` merges / opens a PR),
  `park`, `unpark`, `wait-for` (park, wait for another session to finish, carry on), `worktrees` (take stock of
  sessions/worktrees and clean up), `session` (find/reopen a saved session), `title` (title this session), `wtf`
  (remind what's going on)
- Background and offline:  `bg` (named background helper), `bedtime` (overnight phases), `airplane`
  (offline-ready, `land`)
- In Claude Code they're `/spell-epic:epic`;  linking each into `~/.claude/skills/` keeps bare `/epic`.

### C.7 The VS Code extension (`spell-epic/vscode/`, id `spell-app.spell-epic`, "Spell Epic")

- Two webview views in the SECONDARY (right) side bar:
  - **Review** (`spellEpic.reviewView`, checklist icon):  the epic page being reviewed (`/epic review <name>`),
    details pages, test runs;  "Review: Open Epic..." to pick any registered repo's epic;  Home Page, Back/Forward,
    Reload, Restart Page Server, Open in Browser
  - **Epic Docs** (`spellEpic.docView`, the spell hat icon):  docs pages (`epic open`, `epic pages open`)
  - served live by the first that runs:  the epic server (`epic hub`, port 4848), the file's checkout's page server
    (spell-app's, 4747), or a small server of the extension's own
  - fixes Cmd-C/X/V/A/Z inside the side-bar pages (they forward into the framed page)
- The WINDOW BRIDGE (`vscode/src/WindowBridge.ts`):  a session finds its own window by PID (session -> extension host
  -> window) through a registry `~/.spell-epic/windows/<pid>.json` (token-protected localhost HTTP).  Ops:
  `add-folder`, `remove-folder`, `show-doc` (`view: docs|review`), `reload-view`, `close-window`,
  `open-session { sessionId?, prompt? }` (types a prompt, never sends it) -- the HANDOFF of `/isolate` to a
  worktree's window, and the waking of an epic.
- Built and installed by hand:  `yarn install` in `vscode/`, `yarn package` -> `spell-epic.vsix`,
  `code --install-extension spell-epic.vsix` (README "Checks":  `yarn vscode:package`, "NOT installed by any
  script").
- Windows and looks (guide `guides/windows-and-review.html`):  window files `<name>.code-workspace` in the content
  folder's `windows/`;  12 looks (Tomorrow Night Blue re-hued:  `/epic color teal`, `/epic x -teal`);  a worktree's
  window `⎇ <name>`.

### C.8 The epic server (one per machine)

- `epic hub ensure` -> `http://127.0.0.1:4848/` (`SPELL_EPIC_PORT`);  `epic repo add <main checkout> [--default]`.
- Routes:  `/_epic/assets/...` (docs bundle, `spell-doc.css`, runtime), `/_epic/pack/...` (`epics.pack.js`),
  `/components/epics/` (Epic UI), `/components/<set>/` (the default repo's sets), `/r/<repo>/...` (a repo's content
  folder), `/...` (the default repo's), `/editor/` (the repo's APP, started on demand from `app.start`),
  `/api/...` (review, details, choices, comments, agents, airplane, running, links).
- Files in `~/.spell-epic/` (`repos.json5`, `server.json`, `server.log`;  `SPELL_EPIC_HOME`).
- spell-app's page server serves `/_epic/` too.

### C.9 What is spell-specific vs reusable

What a stranger needs (README "Using spell-epic in another repo";  it ran end to end in a throwaway `~/www/epic-try`):
1. Claude Code with the plugin:  `claude plugin marketplace add <spell-epic folder> --scope user` then
   `claude plugin install spell-epic@spell-epic --scope user` (or try once:  `claude --plugin-dir <folder>`).
2. Bare `/epic`:  `for skill in skills/*/; do ln -s "$PWD/$skill" ~/.claude/skills/; done`.
3. `epic` on the terminal PATH:  `ln -s "$PWD/bin/epic" ~/.local/bin/epic`.
4. In the repo's main checkout (a git repo with a first commit):

   ```sh
   epic init --dry-run              # what it would write
   epic init                        # .epic/config.json5, the content repo, the links, .gitignore
   git add .epic/config.json5 .gitignore && git commit -m "epic init"
   epic repo add && epic hub ensure # the epic server serves its pages (at / when it's the only repo)
   ```

   `epic init` writes every config key with a comment, makes `../<repo>.epics` (a git repo:  `epics/`, `sagas/`,
   `guides/`, `pages/`, README, .gitignore), worktrees in `../<repo>.worktrees`, install command from the lock file
   (yarn / pnpm / bun / npm / uv / bundle).
5. The VS Code extension (`.vsix`) for the Review tab and window moves.
6. Then `/epic <name>` works there.
- The config file `.epic/config.json5` (`src/config/EpicConfig.ts`), every key optional:  `contentFolder`,
  `baseBranch`, `worktreesFolder`, `installCommand`, `installOnCreate`, `installTimeout`, `extraInstalls`,
  `windows.{default,repoName,contentName,worktreeOnly}`, `linkSessionFolders`, `sharedFolders`, `engineFolder`,
  `repoTemplates`, `windowsFolder`, `app.{path,url,urlFile,start}`, and (multi-repo) `repos`.  The kit's own:
  `.epic/config.json5` (`contentFolder: "spell.epics"`, `worktreesFolder: "../spell.worktrees"`,
  `repos: "repos.json5"` -> MULTI-REPO mode:  an epic's worktree is a worktree of the kit with a worktree of every
  child repo inside).
- Left to the repo's own `AGENTS.md`:  the checks to run, its changelog, its house style and text-rewriting skill
  (spell's WWOD + `/fussbudget`).
- SPELL-SPECIFIC today (a stranger would trip on these):
  - Install:  `workspace:*` deps on `spell-ui` + `spell-kit`, so it only installs inside the kit (no npm yet;
    README:  "At release:  publish those packages to npm").
  - Defaults are spell-app's layout (`contentFolder: "../spell-app-dev"`, `windows.default: "spell-app"` ...);
    `epic init` overrides them.
  - Names the project owner everywhere (skills, colours table, guides, element strings like the review line);
    page text assumes one reviewer.
  - The skills still name a few spell-app tools (`spell dev vscode`, the WWOD check, the changelog;  T24),
    `/fussbudget`, `~/.spell/prompts/`, `spell dev ...` spellings, `.spell-server.editor.json`.
  - The epic server serves the DEFAULT repo's API only:  "a second repo's pages draw, but their review controls
    reach the default repo" (T17).
  - Claude Code only;  relies on undocumented `sessionTitle` hook output (PromptGate, "undocumented, CLI 2.1.287").
  - VS Code + macOS assumptions (window bridge via process tree, `vscode://` avoided because macOS hands it to the
    focused window).

---

## D. Flows worth a picture

### D.1 A page loading its elements (spell-ui)

1. HTML arrives:  `<ui-root>` with `<ui-button>`, `<ui-card>`, `<epic-page>` ... all undefined;  `ui.css` /
   tokens may already style the page.
2. The page's one script defines `<ui-root>` (`import "spell-ui/ui-root"`, or the docs bundle).
3. The root hides its slot (inline style) and draws skeletons (`<ui-placeholder>`s in its own shadow) from each
   tag's catalog `skeleton`.
4. It lists undefined tags;  for each `ui-*` tag:  catalog -> family folder -> `import()` once per page.
5. For each `<ui-components source>`:  add the pack's `<script>` once;  the pack calls `SpellUI.registerPack()`,
   brings its catalog + prefix, and defines its tags with the page's Solid + spell-ui (`packModules`).
6. The first component to connect loads the `UI` runtime chunk (theme, icons, overlays, keyboard ...).
7. Each element renders into its shadow root with adopted sheets (layers first, app stylesheet last) and resolves
   its `ready`.
8. All settled (or `timeout`):  root gets `:state(ready)`, fires `ui-ready { failed }`, reveals the content;
   failures fire `ui-error` and show native fallbacks.

### D.2 An epic's life (name -> worktree -> plan -> phases -> review -> merge)

1. The human types `/epic <name> <what to plan>` in a Claude Code session.
2. Prompt gate hook:  renames the session `🚧 <name>`;  refuses if in plan mode / another worktree (saves the text).
3. Session, first turn:  `stay-check` (new window or stay) -> `EnterWorktree` -> `WorktreeCreate` hook makes
   `../<repo>.worktrees/<name>` on branch `<name>` (multi-repo:  a worktree of every child repo too), installs
   -> `epic new <name> --saga <saga> --prompt-file ...` writes the STUB epic page (prompt safe, "Plan hung?"
   notice) -> `epic window open` + `handoff` -> turn ends;  the `Stop` hook moves the session into the `⎇ <name>`
   window, typing `continue`.
4. Plan:  explore (read-only) -> minimal page (Overview + open questions as `Q` items) -> `EnterPlanMode` draft
   (phases `P1 · Name` with estimates, last = Doc Review) -> `AskUserQuestion` -> plan approved.
5. Fill the doc:  a background agent (`<name>-plan-doc`) runs `epic add-phase` per phase, items, etc.;  page shows in
   the Review tab.
6. Each phase:  `epic phase <name>#P1 active` -> work, recording `I`/`C`/`D`/`J`/`V` items as found -> commit
   `P1:  Name -- summary` (in EACH repo touched, same subject) -> `epic phase <name>#P1 done --done "<ul>..."` ->
   `epic commits --backfill` -> reply "P1 complete.  Next is P2" + AskUserQuestion (Start P2 / Fix I3 / Stop).
7. Review at any time:  the human marks the page;  a `/epic review <name>` session listens (D.3).
8. Doc Review (last phase):  prune items, "To test" complete, text pass (`/fussbudget`), write the epic's GUIDE
   (`epic pages new durable guides/<name>.html`), changelog entry, `epic pages fuss`.
9. `/isolate done`:  offers to merge into `main` (and/or open a PR), `epic worktree remove` (servers stopped
   first), window closed;  closing line "*You can close this tab*".  The epic page stays as the record.

### D.3 A review round (mark -> send -> session wakes -> answer on the page)

1. The human opens the epic page in VS Code's Review tab (`/epic review <name>`, or "Review: Open Epic...").
2. Marks items:  Approve / Revisit + note / Make Todo / Choose an option / a todo's plane or x / new todo `+`;
   drafts save to `<name>.inbox.json5` as typed;  marks show DASHED.
3. Presses Send (or Review Now;  or Do Now on one item, which needs no Send).  Marks turn OUTLINED.
4. If no session listens:  the server types `/epic review <name>` into the `🚧 <name>` session (or opens a tab in
   its window);  the human presses Enter.
5. The session:  `epic inbox <name> listen` (heartbeat every 30s) -> `epic inbox <name> wait` in the BACKGROUND,
   ends its turn -> `wait` exits when marks arrive, waking the session with a printed list.
6. `epic inbox <name> apply`:  mechanical marks (approve, pick, todo, next, drop, skip, new, test results) applied,
   each logged, "Claude • Noted" cards where a choice was recorded.
7. Revisits / Do Now:  `epic status <name>#<id> underway "<reading>"` (blue card, spinner) -> a background agent
   writes `epic details <name>#<id> --append|--more --file <html>` -> `status ... done` (green card) ->
   `inbox ... done`.  A reply with options turns the item ORANGE (your pick).
8. The page live-updates in place:  buttons clear, chips show results (green decided, yellow open, red needs you).
9. `wait` again;  `unlisten` when leaving.  Silent for 90s -> the page says nobody is reviewing.

---

## E. Stale / contradictory things the writer must NOT copy

1. Old package names:
   - `@spell-app/ui` (spell-ui `CHANGELOG.md` line 3 "All notable changes to `@spell-app/ui`";
     `guides/ui/notes/*.md` titles;  `guides/ui-component-creation.html` `import "@spell-app/ui/ui-root"`;
     `guides/spell-docs/spell-docs.html`;  `guides/ui-import/ui-import.html`) -> now `spell-ui`.
   - `@spell-app/brand` (design-system guide) -> `spell-brand`;  `@spell-app/epics` (epic-components guide) ->
     `spell-epic` (`$/epics`);  `@spell-app/solid-element` (notes `report.md`) -> the kit's `spell-kit/element`.
   - `<ui-brand-*>` (design-system guide, spell-brand saga) -> `<brand-*>` since epic `people-and-orgs` P18.
2. Old paths:
   - `packages/ui/...` (spell-ui `tools/README.md` "Run through `packages/ui`'s yarn scripts";  `docs/README.md`
     layout block `packages/ui/docs/`;  `docs/__parts/layout.html` comment;  getting-started:  "build it in the
     spell-app monorepo ... `packages/ui`", and a CHANGELOG link to
     `github.com/spell-app/spell-app/blob/main/packages/ui/CHANGELOG.md`;  "Report a bug" links to
     `spell-app/spell-app/issues`).
   - `packages/epics/...` (`spell-epic/src/README.md`:  `<ui-components source="../../packages/epics/components/__pack/epics.pack.js">`;
     "tests/epics/components/<tag>/";  plan-docs guide markup;  epic-components guide).  Today's address:
     `/_epic/pack/epics.pack.js`.
   - `/packages/brand/components/__pack/brand.pack.js` and `../epics/tools/_assets/spell-ui.js`
     (`spell-brand/README.md`) -> stale;  the docs bundle is `/_epic/assets/spell-ui.js`.
   - `~/www/spell-app/spell-epic`, `spell-app-dev`, `spell-app.epics`, `spell-app.worktrees`
     (spell-epic README install/switch-over steps, `guides/spell-epic/spell-epic.html`, spell-brand AGENTS "Edit them
     at their real path, `/Users/owen/www/spell-app/spell-app-dev/brand/`") -> now `~/www/spell/spell-epic`,
     `~/www/spell/spell.epics`, `~/www/spell.worktrees`.
   - `spell-epic/README.md` "Switching a repo over" (16 steps) and "Install ... Not run yet" are history from
     2026-10-17/18:  the switch is DONE.  `.spell-app` link step superseded (epic `epic-engine` P10).
   - `spell-epic/AGENTS.md` itself warns:  `src/AGENTS.md` "was written inside spell-app, as
     `packages/epics/AGENTS.md`:  its links ... mean what are now spell-ui's and the content folder's".
3. Old words:
   - "plan doc" / "epic doc" -> "epic page";  "durable doc" -> "the epic's guide";  "goals" -> sagas;  "docs index"
     -> home page;  "controller" -> component;  "host" (for the element) -> DOM element.  (spell-app `AGENTS.md`
     "Words";  `spell-ui/AGENTS.md` "The component and the DOM element").  `spell dev plan-doc` is an old spelling of
     `epic`.
   - "Fomantic UI reborn" as the LEDE (spell-ui README H1 "Fomantic UI's vocabulary as web components", the tagline,
     AGENTS "Overview", `package.json` description, saga purpose) -- the epic wants it demoted to a note.
   - "the fork" for solid-element (WWOD rule).
   - The README H1 `` `$/ui` -- ... `` uses the in-repo alias;  the published name is `spell-ui`.
   - "Spell Docs" tab -> the extension's view is "Epic Docs" (`vscode/package.json`);  the Review tab is the
     checklist icon.
4. Counts that drifted:
   - CHANGELOG "54 component families" / guide "54 families built" -> 62 family folders, 112 catalog tags today.
   - `report.md`:  "Eight component families, on Solid 2.0.0-rc.11" -> rc.13.
   - spell-epic guide "17 skills" (still 17:  OK);  "1293 tests" etc. are 2026-10-18 snapshots.
5. Contradictions:
   - Repo visibility:  `spell-ui/AGENTS.md` / `spell-brand/AGENTS.md` say "private";  the kit's `AGENTS.md` CI section
     says "The repos are public:  no token".  (Open question F2.)
   - Skeletons:  `guides/ui-component-creation.html` says "parts and wrappers say null";  `spell-ui/AGENTS.md` says
     a tag with none LEAVES `skeleton` OUT (never `null`, epic `wwod-spell-ui` J26).
   - Translation:  CHANGELOG lists "Translation" under Added;  `translation.md` says "Designed now, built later" /
     the runtime's `defineComponents` "not built yet" (per-class `define(tag, dictionary)` does exist).
   - Bedtime colouring:  `skills/bedtime/SKILL.md` "the night's judgement calls and issues show RED there";
     `plan-doc.md` "Neither age nor a `/bedtime` run colours a chip any more".
   - Getting-started:  "`yarn add spell-ui`" vs. "spell-ui isn't on npm yet".
   - Package `exports` point at TS source (in-kit), `publishConfig.exports` at `dist/` (published):  a reader
     copying `exports` would think the package ships `.ts`.
   - `site/README.md` / `docs/README.md` "Viewing" uses `spell dev server start --all` (spell-app's CLI);  in the kit,
     the spell-ui docs need spell-app's page server or the epic server (the kit's own `yarn server` has no
     `componentSets` of its own:  they're in `spell-app/package.json`).
6. The kickoff prompt says not to mention the project owner by name:  almost every source (plan-doc.md, guides,
   skills, element tooltips) names him;  write "you" / "the reviewer" / "a person".

---

## F. Open questions for the project owner (max 8)

1. Install story for spell-ui's README:  should "Install" show the future `npm install spell-ui solid-js@2.0.0-rc.13
   @solidjs/web@2.0.0-rc.13` (as if published), or only the in-kit path (`yarn clone spell-ui`, `yarn build`,
   import from `dist/`)?  And should the single-file classic bundle (spell-epic's `/_epic/assets/spell-ui.js`, or
   spell-brand's design `bundle.js`) be offered as the "no build step" option?
2. Are the spell-* GitHub repos public or private today (spell-ui/spell-brand AGENTS say private, the kit's CI notes
   say public)?  It decides whether READMEs link to GitHub issues / raw files.
3. Svelte (and Angular / Preact) are claimed in getting-started but never smoke-tested:  state them as "should work
   (standard custom-element contract)" or add a Svelte host page to `yarn smoke` before the README claims it?
4. Translation:  present it as a shipped feature (per-class `define("ie-boton", dictionary)`) or as "designed,
   partly built" (page-wide `UI.vocabulary.defineComponents` not built)?
5. spell-ui's tagline:  with "Fomantic reborn" demoted, what is the one-line lede you want?  (e.g. "Accessible,
   themeable web components that load themselves on demand, from plain HTML or any framework.")
6. spell-epic for outsiders:  should the README present `epic init` in a non-spell repo as supported today (it ran
   once in `~/www/epic-try`), given the `workspace:*` install, the default-repo-only API (T17) and the owner's name
   in the UI strings?  Or label it "experimental / for spell's own use"?
7. spell-brand's README:  is Claude Design's role (the `.dc.html` originals, the claude.ai "Spell" design system,
   `/design push|pull`) for public readers, or internal?  The `/design` skill lives in spell-app, not spell-epic.
8. Viewing docs in the kit:  should the READMEs tell a newcomer to run spell-app's page server (`spell dev server
   start`, port 4747) or the epic server (`epic hub ensure`, 4848) to browse `/components/ui/`, or is `yarn dev`
   (spell-ui's Vite demo) the recommended first step?
