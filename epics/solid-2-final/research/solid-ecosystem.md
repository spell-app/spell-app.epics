# Spell in the Solid ecosystem:  how to get listed, and what they might object to

Research for epic `solid-2-final`, item T1 (the ecosystem section).
Written 2026-11-20 by research agent `solid-2-final-ecosystem`, read-only:  no repo, GitHub or npm writes.

- Every claim has its source:  a URL, or a path in the kit (`src/element/ShadowEvents.ts`, as on `main` of
  [spell-app/spell](https://github.com/spell-app/spell)).
- `(inferred)` marks a conclusion drawn from the sources, not stated in them.
- Short version:
  1. Listing is a pull request (or a pre-filled issue) adding one entry to a TypeScript file in
     [solidjs/solid-site](https://github.com/solidjs/solid-site), reviewed by a maintainer, in practice David Di Biase.
     The bar is low:  nearly every recent submission was merged.
  2. Ryan Carniato's web-components skepticism is real, but the page already lists custom-element projects
     (`solid-element`, LUME).
     The likelier objection is plainer:  **Spell UI can't be installed into a Solid 2.0 app today**
     (its peers pin `2.0.0-rc.21` exactly;  npm `latest` is a placeholder;  the repo has no LICENSE file).
  3. Best first move:  re-test the shadow-root event fix on Solid 2.0.3, and file what's still broken upstream,
     with the minimal repro Spell already wrote and never sent.

---

## 1. How a project gets listed

### The page and its data

- The page:  [solidjs.com/ecosystem](https://www.solidjs.com/ecosystem), "Libraries and tools for Solid".
  - Fetched 2026-11-20:  153 results, a search box, an "Official only" switch, a "Submit your project" button.
- Its source:  the new Solid 2.0 site, [solidjs/solid-site](https://github.com/solidjs/solid-site), branch `main`.
  - Its README:  "Source for www.solidjs.com, the marketing site for Solid 2.0 ... Open to contributions.
    Fix a typo, add a blog post or add yourself to the team page."
    ([README.md](https://github.com/solidjs/solid-site/blob/main/README.md))
  - The data is ONE file, [src/ecosystem/utilities.ts](https://github.com/solidjs/solid-site/blob/main/src/ecosystem/utilities.ts):
    225 entries, each a `Resource` object.
  - Its shape:  [src/ecosystem/types.ts](https://github.com/solidjs/solid-site/blob/main/src/ecosystem/types.ts):
    `title`, `link`, `author`, `author_url`, `description`, `type` (`Package` or `Library`), `categories`,
    `official`, `maintained`, `solid2`, `keywords`, `published_at`.
  - The page:  [src/routes/ecosystem.tsx](https://github.com/solidjs/solid-site/blob/main/src/routes/ecosystem.tsx).
- `maintained: false` hides an entry by default ("Hide unmaintained" starts on).
  - 72 of the 225 carry it, so 153 show
    ([Directory.tsx](https://github.com/solidjs/solid-site/blob/main/src/components/directory/Directory.tsx), `hideUnmaintained`).
- The old registry, [solidjs/solidex](https://github.com/solidjs/solidex), is stale:  last pushed 2022-10-30.
  - Solid's [CONTRIBUTING.md](https://github.com/solidjs/solid/blob/main/CONTRIBUTING.md) still calls Solidex
    "our ecosystem directory";  the data now lives in solid-site (inferred, from the commit history below).

### The categories

From `ResourceCategory` in [types.ts](https://github.com/solidjs/solid-site/blob/main/src/ecosystem/types.ts),
with how many entries use each (counted in `utilities.ts`):

| Category | Entries | Spell's fit |
| --- | --- | --- |
| UI | 124 | Spell UI;  `spell/element` (LUME is here) |
| Plugins | 61 | `spell/element` (classy-solid is here) |
| Data | 38 | -- |
| Build Utilities | 34 | -- |
| Add Ons | 31 | possibly `spell/element` (LUME is here too) |
| Primitives | 26 | a typed custom-element event helper, if Spell made one (section 6) |
| Starters | 17 | -- |
| Routers | 6 | none:  `solid-element` is filed here by mistake (section 6) |
| Data Visualization | 5 | -- |
| Testing | 4 | -- |
| Educational | -- | articles and videos only, on the Resources page |

- The Resources page ([src/routes/resources.tsx](https://github.com/solidjs/solid-site/blob/main/src/routes/resources.tsx))
  lists articles, videos and podcasts, with a "Solid 2.0" tab (`solid2: true`, 8 articles so far, in
  [articles.ts](https://github.com/solidjs/solid-site/blob/main/src/ecosystem/articles.ts)).
  - An article about building on Solid 2 would go there, not on the Ecosystem page.
- No category fits a programming language:  no entry describes one (searched `utilities.ts` for language, DSL,
  compiler).

### The process

- The "Submit your project" button opens a form, then a PRE-FILLED GitHub issue on solid-site, labelled `ecosystem`,
  with the entry ready to paste
  ([SubmitDialog.tsx](https://github.com/solidjs/solid-site/blob/main/src/components/directory/SubmitDialog.tsx)).
  - Its words:  "This opens a pre-filled issue on GitHub.  A maintainer reviews every submission before it is
    listed.  You need a GitHub account."
  - Limits:  name 120 characters, description 400.
  - No issue has used the label yet (`gh issue list --label ecosystem`:  none;  the new site went up 2026-11-16).
- In practice, people open a PULL REQUEST that adds the entry.
  Solid's [CONTRIBUTING.md](https://github.com/solidjs/solid/blob/main/CONTRIBUTING.md):
  "If you would like your project listed here please submit a PR or contact a core/ecosystem member on Discord."
- Recent ecosystem PRs on solid-site, all merged by `davedbase` (David Di Biase):
  - [#602](https://github.com/solidjs/solid-site/pull/602) solid-ai-chatbot, opened 2026-11-18, merged 2026-11-20
  - [#592](https://github.com/solidjs/solid-site/pull/592) `@comvi/solid` (2026-10-22)
  - [#591](https://github.com/solidjs/solid-site/pull/591) solid-route-progress (2026-09-24)
  - [#587](https://github.com/solidjs/solid-site/pull/587) `@stitchapi/solid` (2026-07-03)
  - [#581](https://github.com/solidjs/solid-site/pull/581) Formisch, [#580](https://github.com/solidjs/solid-site/pull/580) better-captcha,
    [#578](https://github.com/solidjs/solid-site/pull/578) solid-validation (2025)
- Closed unmerged:  [#593](https://github.com/solidjs/solid-site/pull/593), [#594](https://github.com/solidjs/solid-site/pull/594),
  [#595](https://github.com/solidjs/solid-site/pull/595), all by `davedbase` within three seconds on 2026-11-17.
  - Each edited the OLD data file, `src/pages/Resources/Utilities.data.ts`, gone with the 2.0 site.
    So they were swept up by the relaunch, not judged (inferred).
  - #595 came back as #602 against the new file, now saying "supports Solid 1.6+ and Solid 2", and was merged.
- No review comments on any of these:  the bar is a clean entry (inferred).
- A PR body is a few lines:  what it is, the categories, links to npm and the source (#592, #602).

### Other places Solid projects get seen

- [one-aalam/awesome-solid-js](https://github.com/one-aalam/awesome-solid-js), 1,006 stars:
  sections "Web Components" (lists Solid Element and Lume Element), "Frameworks & Component Libraries",
  "Works with Solid", "Open Source" ([README.md](https://github.com/one-aalam/awesome-solid-js/blob/main/README.md)).
  - Slow:  last pushed 2026-07-29;  PRs #89 to #96 (2026-11-01 to 11-17) are all still open.
- docs.solidjs.com has NO ecosystem page:  none in [solidjs/solid-docs](https://github.com/solidjs/solid-docs)'s
  `main`, nor in its Solid 2 branch `v2-rebuild` (searched their file trees).
  - But the Solid 2 docs have a "Web components" section, in the guide "Integrate non-Solid code"
    (`src/routes/(5)guides/(13)integrate-non-solid-code.mdx` on `v2-rebuild`):  a docs contribution target (section 6).
- Discord, [discord.com/invite/solidjs](https://discord.com/invite/solidjs):  where the teams work
  ([CONTRIBUTING.md](https://github.com/solidjs/solid/blob/main/CONTRIBUTING.md), "Meetings and Schedules").
  - Its channels and any showcase norms:  NOT verified (Discord needs a login).
- [solid-primitives](https://github.com/solidjs-community/solid-primitives), under the `solidjs-community` org,
  which core members maintain.
  - Its [CONTRIBUTING.md](https://github.com/solidjs-community/solid-primitives/blob/main/CONTRIBUTING.md):
    a staged process "roughly modelled on TC39", Stage 0 (submission) to Stage 4 (shipped).
  - Its maxims include "A single primitive for a single purpose", "No dependencies or as few as possible",
    "SSR safe entries", "Wrap base level Browser APIs", "Strong TypeScript support".
  - `make` for a non-reactive primitive, `create` for a reactive one.
- SolidHack:  last held in 2024 ([solid-site's blog](https://github.com/solidjs/solid-site/tree/main/src/routes/blog),
  `solidhack-2024-announcement.mdx`);  no 2026 edition found
  ([solidjs/solidhack](https://github.com/solidjs/solidhack), last pushed 2026-05-05).
- An ecosystem working group:  none to apply to.
  - CONTRIBUTING.md:  "Most team members are part of the Ecosystem Team or Core Team.
    Entry into these groups is selected by Core Members only.  We do not accept applications or requests for entry."
  - Teams:  Docs (LadyBluenotes), Infrastructure and Growth (davedbase), Advocacy (eslachance), Translators.
  - The Solid 2.0 design talks ran in [solidjs/solid-workgroup](https://github.com/solidjs/solid-workgroup/discussions/2)
    (linked from the launch post below).

---

## 2. Who decides

- The team page ([src/team/people.ts](https://github.com/solidjs/solid-site/blob/main/src/team/people.ts)):
  - Ryan Carniato:  "Project Founder / OSS Engineer @ Sentry"
  - David Di Biase:  "Community Coordinator";  merges the ecosystem PRs (section 1)
  - maintainers:  Milo M., Alexis Munsayac, Atila Fassina, Dev Agrawal, ladybluenotes, Birk Skyum, Brenley,
    Katja Lutz, Gabriel Valfridsson, Brendan Allan
  - and, among the contributors thanked:  Joe Pea ("Founder of Lume"), whose LUME and classy-solid are Solid custom
    elements and Solid classes:  Spell's nearest neighbour, and a natural ally (inferred)
- Ryan touches the ecosystem data too:  he merged [#603](https://github.com/solidjs/solid-site/pull/603) himself
  (SUID's links), 2026-11-18.
- So:  David Di Biase decides a listing;  Ryan decides anything in Solid itself, `@solidjs/element` included (inferred).

### Ryan on web components:  the two essays

"Web Components Are Not the Future", published 2024-09-26, edited 2024-10-07
([dev.to](https://dev.to/ryansolid/web-components-are-not-the-future-48bh);  dates from dev.to's API).
Its key lines, verbatim:

- The thesis:  "Web Components possibly pose the biggest risk to the future of the web that I can see."
- His standing:  "I used them in production for 7 years.  I wrote several polyfills in the early days for things
  like the Shadow DOM to use them before they hit prime time."
- The core argument:  "So the fundamental problem with Web Components is that they are built on Custom Elements.
  Elements !== Components."
- Attributes and properties:  "Attributes accept only strings while properties being a JS interface can handle any
  value."  And:  "with custom elements we don't know.  So this is why some templating libraries have interesting
  prefixes to indicate how things should be set."
- Lifecycles:  "They have DOM-based lifecycles that can trigger synchronously or asynchronously depending on when
  they upgrade.  This wreaks havoc on things like Reactivity tracking and Context APIs."
- Shadow DOM events:  "Some events don't "compose" ie don't bubble beyond Shadow DOM boundaries.  Some events don't
  bubble consistently because they don't recognize a different target, like in "focusin", because the Shadow Host
  is always made the target no matter which child element gains focus."
- SSR:  "Yes, you can completely do SSR with Web Components.  Hydration is completely achievable.  But they are a
  DOM interface in a place with no DOM."
- The cost to frameworks:  "More code to ship and more code to execute to check these edge cases.
  It's a hidden tax that impacts everyone."
- Delegation:  "Improvements to hydration, things like Resumability, Partial or Selective Hydration depend on event
  delegation to work.  But if Shadow DOM messes with that then how could Web Components fit that model?"
- One library on a page:  "if you only have a single library on your page Web Components aren't doing anything for
  you but adding more overhead."
- Where he'd use them:  "The most compelling uses for Web Components are as a sort of Microfrontend container ...
  I'd take them for the ergonomics to put a Zendesk widget on my page, but is the abstraction worth the cost?"
- The conclusion:  "Web Components are a compromise through and through."  And:  "It's the promise that they are
  something that they aren't which is so dangerous."

The earlier, softer one:  "Maybe Web Components are not the Future?", 2020-03-27
([dev.to](https://dev.to/ryansolid/maybe-web-components-are-not-the-future-hfh)):
- "Progressive enhancements like `<a is="my-button" />`, 3rd party widgets, and micro-frontends all seem reasonable.
  I'd still use Web Components as an alternative to packaging a JS SDK, or as a reasonable way to isolate
  development on a single page."

### Ryan on custom elements since:  Solid 2

- No new essay on web components found for 2025-2026 (web search;  his dev.to list).
- Custom-element EVENTS in Solid 2, issue [#4100](https://github.com/solidjs/solid/issues/4100)
  ([his reply, 2026-10-16](https://github.com/solidjs/solid/issues/4100#issuecomment-6219726978)), closed NOT_PLANNED:
  - "Yes, this break is intentional.  JSX `on*` props are now camelCase only and go through Solid's event handling,
    so `on-…`, `on:` and event names with custom casing can't be written as a JSX prop anymore."
  - "The recommended path for custom-element events is a ref, which keeps the exact DOM event name, casing and
    hyphens included" (his example:  `<sl-input ref={on("sl-change", e => ...)} />`).
  - "We're deliberately leaving a packaged `on` helper to userland.  Custom-element libraries tend to want their own
    conventions (typed event maps, name mapping, options), so a single built-in shape would get in the way."
  - That reply ends "_Generated by Claude Code_" (section 5, "Built by agents").
- Shadow-DOM event targets, issue [#2103](https://github.com/solidjs/solid/issues/2103):
  - Ryan, 2024-03-19 ([comment](https://github.com/solidjs/solid/issues/2103#issuecomment-2007521637)):
    "Yeah I'm no longer deep in webcomponents ... I built apps that had nested levels of Solid web components ...
    Resetting on host seems reasonable."
  - Closed 2026-04-29 ([comment](https://github.com/solidjs/solid/issues/2103#issuecomment-4347750167)):
    "This was merged like 2 years ago."
  - Joe Pea (trusktr) in the same thread:  "I'd go for consistency with the standard on this one".
- `@solidjs/element` is still Solid's own package, shipped and fixed for 2.0 (section 3):
  so custom elements are supported, not just tolerated (inferred).
- The Solid 2 docs show custom elements as things a Solid app USES ("A custom element is a native element in JSX"),
  in "Integrate non-Solid code", beside charts and maps (solid-docs `v2-rebuild`,
  `src/routes/(5)guides/(13)integrate-non-solid-code.mdx`).
  - Its advice:  `prop:` for a property, `onXxx` for a lowercase event, a ref directive for any other event name.

### The Solid 2.0 launch post

"Solid 2.0 - The Long Hold", Ryan, 2026-11-16
([source](https://github.com/solidjs/solid-site/blob/main/src/routes/blog/solid-2-0-the-long-hold.mdx)):
- Its headings include "Built to Be Written by Agents":  coded diagnostics with "agent repair guide" links, and
  skills shipped in `node_modules/solid-js/skills/`.
- "23 release candidates in 14 weeks.  In that time alone, 971 pull requests were merged and 753 issues closed ...
  By the end, the bug reports coming in were from people(agents) deliberately hunting edge cases".
- Sponsors thanked include Anthropic.
- Nothing on web components.
- Versions (npm, 2026-11-20):  `solid-js` `latest` is 2.0.3 (2.0.0 on 2026-11-17, 2.0.3 on 2026-11-19).

---

## 3. `solid-element`, and Spell's `spell/element`

### Is it maintained for Solid 2?

Yes.
- Now `@solidjs/element`, in Solid's monorepo:  [packages/element](https://github.com/solidjs/solid/tree/main/packages/element).
  - npm:  2.0.0 on 2026-11-17, 2.0.1 on 2026-11-19, peers `solid-js` and `@solidjs/web` `^2.0.3`, one dependency,
    `component-register` `^0.8.7` (`npm view @solidjs/element`).
  - "`@solidjs/h`, `@solidjs/html` and `@solidjs/element` version on their own"
    (Solid's [AGENTS.md](https://github.com/solidjs/solid/blob/main/AGENTS.md)).
- Its 2.0 changelog ([CHANGELOG.md](https://github.com/solidjs/solid/blob/main/packages/element/CHANGELOG.md)):
  - `ea636af`:  an owner from ANOTHER copy of Solid falls back to an ownerless root, with a warning (#3053)
  - `d2c423d`:  nested elements inherit context from ancestor host markers, not only assigned slots
  - `adbdab3`:  "Register custom element render roots for delegated events so handlers inside shadow DOM render
    roots fire correctly"
  - 2.0.1, `c6ce6d7`:  declared props are enumerable (#5058)
- Still the thin wrapper:  `customElement(tag, props, fn)` over `component-register`, about 100 lines
  ([src/index.ts](https://github.com/solidjs/solid/blob/main/packages/element/src/index.ts)).
- `component-register` itself:  0.8.8, last published 2025-09-08 (`npm view component-register`).
- The ecosystem page still lists the OLD name, `solid-element`, linking
  `github.com/solidjs/solid/blob/main/packages/solid-element`, a folder `main` no longer has, and files it under
  Routers ([utilities.ts](https://github.com/solidjs/solid-site/blob/main/src/ecosystem/utilities.ts), its third entry).

### How `spell/element` relates

- Spell folded `@solidjs/element` and `component-register` into its own element layer in epic `spell-element`,
  2026-10-09 (`src/element/AGENTS.md`, "Overview";  `ui/AGENTS.md`, "Overview").
  - Four files began as theirs:  `UIComponent`, `DOMElement`, `ShadowEvents`, `HotDefinitions`.
  - Each carries the MIT notice as its first line:
    `/*! Derived from @solidjs/element and component-register:  MIT licence, (c) Ryan Carniato. */`
    (`src/element/ShadowEvents.ts:1` and the others).
- What it is now:  class components (`UIComponent`), a DOM element base (`DOMElement`), standard (TC39) decorators
  for reactive members (`@state`, `@controlled`, `@derived`, `@onChange` ...), vocabularies, form-associated
  controls, shadow-root event repair, hot reload ([README/element.md](https://github.com/spell-app/spell/blob/main/README/element.md)).
- Owen chose NOT to send the fixes upstream:
  - epic `spell-element`, Q3 (`spell.epics/epics/spell-element/parts/q3.html`):  "A · Fold in only what we use";
    not chosen:  "D (leave it, send the fixes upstream)".
  - Q12 (`parts/q12.html`):  "A · Package goes;  a notice per file";  not chosen:  "B (file the 11 fixes with Solid
    first)".  "UPSTREAM.md (the plan of one pull request to Solid per fix, never sent) stays in git history only".
- That plan still exists:  `git show f096c0d42^:app/packages/solid-element/UPSTREAM.md` in the kit.
  "**Nothing here has been filed.**  Owen decides what goes upstream and when."  Its PRs, each with problem,
  patch outline, whether it breaks anything, and its test:
  1. `options`:  a base class, a registry, the shadow root's options, form association
     (answers `component-register` issue #15, PR #34)
  2. accessors on the prototype, and the upgrade step (PRs #30, #39, issue #38)
  3. per-prop `type`, `converter`, `property`, and the boolean rule (issues #8, #40)
  4. attribute removals, the change's source, a synchronous reflection guard (issue #20);
     4b. don't reflect default values
  5. `ElementInternals` and the form callbacks (issue #15)
  6. lifecycle:  `keepAlive`, `onConnect` / `onDisconnect`, `dispose()` (issue #5)
  7. an error boundary per element
  8. owner lookup across shadow roots
  9. adopting a declarative shadow root
  10. delegated events leaking out of shadow roots
  11. a slotted element's root dying with its slot's branch
  - plus hot reload:  redefinition in place, a live-instance registry, a Vite plugin
- Upstream has fixed some of the same ground since, on its own (above, and below):
  #3053 (cross-runtime owners), `d2c423d` (owner lookup), `adbdab3` (delegated roots), the event-target restore.
  Which of the 11 still apply to `@solidjs/element` 2.0.1:  NOT checked here, one by one.
  - From its source:  `lookupContext()` still walks `parentNode` only, never a shadow root's `host`,
    so PR 8 looks still open (inferred, from
    [src/index.ts](https://github.com/solidjs/solid/blob/main/packages/element/src/index.ts)).

### `ShadowEvents`, and Solid's issues about it

What Spell's fix repairs (`src/element/ShadowEvents.ts`, its banner;  `UPSTREAM.md` PR 10):
1. `event.target` left as the INNER node for every listener outside the shadow root
2. `event.currentTarget` left as an own getter, for every later listener
3. the "already walked" marker left on the shadow root, so every OUTER Solid container drops the event:
   "a Solid app's `<ui-button onClick>`, or any handler above a nested element, never runs for events from inside
   that element"

Upstream since:
- 1 and 2 are FIXED in Solid 2:  [#4325](https://github.com/solidjs/solid/pull/4325) (2026-10-27, superseding #4311 by
  brenelz):  "Once its walk ends, delegated dispatch deletes its `currentTarget` and `target` overrides."
  - Today's `eventHandler` ends with `delete e.target;  delete e.currentTarget`
    ([packages/web/src/client.ts](https://github.com/solidjs/solid/blob/main/packages/web/src/client.ts), `eventHandler`).
  - Then [#4836](https://github.com/solidjs/solid/pull/4836) (2026-11-13):  `currentTarget` set as a value, not a getter.
- Nested LIGHT-DOM roots:  fixed in beta.16, issue [#2832](https://github.com/solidjs/solid/issues/2832)
  ("outer root's delegated handlers never fire for events bubbling out of a nested `render()` root").
  Ryan:  "Delegated events now resume the handler walk at root boundaries".
- 3, for SHADOW roots, may still be open (inferred):  the resume check is
  `if (prev === true || prev === container || !container.contains(prev)) return`, and `contains()` doesn't cross
  shadow boundaries, so an outer container still returns when `prev` is an element's shadow root.
  - NOT verified by running it:  the epic's move to 2.0.3 will tell, through `tests/element/ShadowEvents.test.tsx`.
- No open issue covers it:  searched `solidjs/solid` and `ryansolid/dom-expressions` for shadow / delegation /
  composedPath / nested root.  Closed ones nearby:  [#2103](https://github.com/solidjs/solid/issues/2103),
  [#2451](https://github.com/solidjs/solid/issues/2451), [#1891](https://github.com/solidjs/solid/issues/1891),
  [#5023](https://github.com/solidjs/solid/issues/5023).
- So there is no issue to contribute TO;  there is one to FILE, if 2.0.3 still drops the event.
  - The minimal repro is ready, no library needed (`UPSTREAM.md` PR 10):  a custom element that `render()`s a
    `<button onClick>` into its shadow root, inside a Solid app's `<div onClick>`.
  - So is the patch outline:  make the `contains(prev)` check shadow-including, or hand off at the host.
- `ShadowEvents` also reads Solid internals, "as of `@solidjs/web` rc.17" (its banner, "HACK"):  `_$SOLID_EVENT_OWNER`
  and `_$$<type>`.  Both names are still in 2.0's `client.ts` (`$$EVENT_OWNER`, `EVENT_KEY = "_$$"`).
- Spell's owner on GitHub, `owenoak`, has filed no issue or PR on `solidjs/*` or `ryansolid/*`
  (`gh search issues --author owenoak`).

---

## 4. Spell's readiness, from the repo

| | Today | Source |
| --- | --- | --- |
| Repo | PUBLIC, created 2026-10-21, 0 stars, 0 forks | `gh repo view spell-app/spell` |
| Licence | `package.json` says MIT;  NO LICENSE file anywhere in the repo, so GitHub shows none (`licenseInfo: null`) | `package.json`;  `find -iname "LICENSE*"` |
| npm `spell` | `latest` 0.8.1, a placeholder ("Coming soon");  `next` 0.8.18 | `npm view spell` |
| npm `spell-ui` | `latest` 0.8.5;  `next` 0.8.18;  MIT;  49.7 MB unpacked | `npm view spell-ui` |
| Solid peers | `spell-ui@next` peers `solid-js` and `@solidjs/web` at EXACTLY `2.0.0-rc.21`;  `spell@next` likewise | `npm view spell-ui@next peerDependencies` |
| Solid today | `latest` is 2.0.3;  a Solid 2.0 app can't take `spell-ui@next` without a peer conflict, or a second Solid (inferred) | `npm view solid-js dist-tags` |
| Spell UI's other deps | mermaid, elkjs, postcss, linkedom, marked, highlight.js, dompurify, lodash-es, temporal-polyfill | `npm view spell-ui@next dependencies` |
| First release | planned for December 1, 2026 | `README.md`, "Coming";  `ui/README.md` |
| Public docs site | none yet:  "Today the docs site runs locally, from the page server" | `README.md`, "Coming" |
| Docs in the repo | strong:  a front page per folder, a page on using Spell UI from React, Vue and Solid, checked by smoke pages | `ui/README-frameworks.md` |
| Tests | real-browser tests (Vitest browser mode, Chromium);  axe on every example of 72 of the 76 families | `ui/README.md`, line 58 |
| Size on a page | 115.7 kB gzipped once (Solid 24.9 kB of it), then 5.7 kB a family on average | `ui/README.md`, "What it costs" |

- The Solid path Spell UI documents (`ui/README-frameworks.md`, "Solid 2"):
  - events as `on-ui-change={fn}`, data as plain props (`options={options}`)
  - how:  Solid 2 sets an unknown prop with `setAttribute()`, and Spell UI's elements take that over;
    before a tag's component loads, "a patch on the browser's `setAttribute()` holds them" (`<ui-root pure>`
    turns it off;  `src/element/RichAttributes.ts`)
  - "your app must run the SAME Solid as Spell UI, `solid-js` and `@solidjs/web` 2.0.0-rc.21"
  - "Solid's context stops at the element":  app data goes to `<ui-root appContext={value}>`
- `spell/element` alone:  "never imports Spell UI", but "In practice that runtime is Spell UI's"
  (`README/element.md`, "What it costs, and what it won't do"):  its words, styles, focus and animations come
  from settings Spell UI installs (`src/element/AGENTS.md`, "Settings").
  So it isn't usable on its own by a stranger yet (inferred).
- The epic this research serves moves every Solid package to 2.0.3
  (`spell.epics/epics/solid-2-final/solid-2-final.plan.html`).

---

## 5. What they might object to, and how we'd answer

Ordered by how likely each is to come up, most likely first (inferred).

1. **"It doesn't install into a Solid 2.0 app."**
   - The fact:  peers pinned to `2.0.0-rc.21` exactly, while Solid shipped 2.0.3;  npm `latest` is a placeholder
     (section 4).  The listing PR that was merged said "supports Solid 1.6+ and Solid 2" (#602).
   - Answer:  don't apply until it does.
     The epic's move to 2.0.3, then peers as a range (`^2.0.3`, as `@solidjs/element` itself peers), then the
     December 1 release puts `spell-ui` on `latest`.
   - The trade:  Spell pins exactly so a page has ONE Solid (`agents/solid/solid-2.md`, "One Solid per page");
     a caret range within 2.x keeps that with the bundler's dedupe, as every Solid library does (inferred).
2. **"Web components are the wrong abstraction"** (Ryan, 2024, section 2).
   - Answer, in his own terms:
     - Spell UI is the use he grants:  "an alternative to packaging a JS SDK", components "added to any website
       without consideration of how the website is authored".  It's checked from React, Vue, Solid and plain HTML
       (`ui/README-frameworks.md`).
     - Written ON Solid:  inside, each element is a Solid render, fine-grained updates and all.
     - Not a new precedent:  LUME ("Custom elements powered by Solid") and `solid-element` are listed already.
     - His edge cases are tested, not waved off:  shadow-root events (`tests/element/ShadowEvents.test.tsx`),
       attributes vs properties (`RichAttributes`), context across the element (`appContext` on `<ui-root>`).
   - Don't argue the essay:  list what Spell UI costs, as its README already does (115.7 kB once, shadow DOM, a
     current browser).
3. **"Not idiomatic Solid"**:  classes, decorators, a page-wide `setAttribute()` patch.
   - Classes and decorators:  internal to the library.  A Solid app never writes a class to use Spell UI;
     it writes `<ui-dropdown options={...}>` in plain JSX.
     - Precedents on the page:  classy-solid ("class-based reactivity powered by Solid.js"), LUME.
     - Solid's own docs now document classes in stores:  `markRaw(Class)` "for self-managing classes"
       ([solid-docs #1712](https://github.com/solidjs/solid-docs/pull/1712), 2026-11-19).
   - The `setAttribute()` patch is the real friction:  Ryan chose refs for custom-element events, and said a packaged
     `on` helper is for userland (#4100, section 2).
     - Answer (inferred):  document the ref way FIRST for Solid apps, with a typed `on()` helper Spell UI exports;
       keep `on-ui-change` as the convenience;  say `<ui-root pure>` turns the patch off.
4. **"It's a fork of `solid-element`."**
   - Answer:  MIT allows it, and the notice travels with each derived file (section 3).
   - The better answer is goodwill:  file the fixes that still apply (section 6).  Today the fork took 11 fixes
     and sent none back, which reads poorly if anyone looks (inferred).
5. **"It's a whole new language, not a Solid library."**
   - Answer:  list Spell UI, which any Solid app can use, not the language.
   - The language is a story for the Resources page (an article) or Discord, not a directory entry.
6. **"It's heavy"** (Ryan's "hidden tax";  the headless kits beside it).
   - The fact:  about 91 kB gzipped beyond Solid before the first family (core 40.6, root 16.0, runtime 16.9, CSS
     17.3;  `ui/README.md`);  49.7 MB unpacked on npm, with mermaid and others as dependencies.
   - Answer:  styled, themed and accessible, not headless;  families load on demand, 5.7 kB each.
     Consider making the heavy optional pieces (mermaid, elkjs, linkedom) optional peers, as `spell` already does
     (`"spellPublish": { "optionalPeers" }`) (inferred).
7. **"SSR?"** (Ryan:  "a DOM interface in a place with no DOM").
   - The fact:  Spell UI has a STATIC render for search engines (`spell/ui/static`), not hydration inside a Solid
     SSR app;  first paint never needs a rich property (`ui/AGENTS.md`, "UI rules").
   - Answer:  say so plainly in the listing's README;  a server-rendered Solid page can emit `<ui-*>` tags, which
     draw on the client (inferred).
8. **Fomantic-derived UI, and licences.**
   - The facts:  Fomantic-UI is MIT ([fomantic/Fomantic-UI](https://github.com/fomantic/Fomantic-UI)).
     Each family's sheet is "a port of Fomantic's `button.less` + `button.variables`" (`ui/src/components/ui-button/UIButton.css`),
     with no Fomantic copyright line;  icon names credit Fomantic, icons credit Font Awesome under CC BY 4.0
     (`ui/src/icons/LICENSE.md`).
   - MIT asks that "The above copyright notice and this permission notice shall be included in all copies or
     substantial portions of the Software."  A ported stylesheet is arguably a substantial portion (inferred;  not
     legal advice).
   - Answer:  before applying, add a root LICENSE file, and a notice for Fomantic (one third-party notices file, or
     a line in each ported sheet).  Nobody on the Solid side has to raise this for it to matter.
9. **"It's new and unproven."**
   - The facts:  public a month, 0 stars, no public docs site, release December 1 (section 4).
     The page hides `maintained: false` entries, so maintenance is watched.
   - Answer:  apply after the release and a public docs site;  link the real-browser and axe tests.
10. **Naming.**
    - `spell` on npm is unscoped and old (created 2011-12-11), now Spell's;  `latest` is a placeholder until release.
    - "Spell UI" / `spell-ui` is clear enough for a listing.  A generic word may be hard to search for (inferred).
11. **Commercial intent.**
    - Not a bar:  commercial entries are listed (solid-ai-chatbot, a hosted chat service, merged 2026-11-20;
      Flowbite, TW Elements in awesome-solid-js).  Spell's packages are MIT.
12. **Built largely by AI agents.**
    - Not an objection in this community;  the norm is DISCLOSURE (inferred, from):
      - Solid's [AGENTS.md](https://github.com/solidjs/solid/blob/main/AGENTS.md), "Agent Voice on GitHub":
        agent-written replies MUST be blockquoted and end with an attribution line, "`— *Claude via Cursor*`",
        "so responsibility for agent actions (closes, merges, verdicts) is auditable".
        New issues and PRs are exempt:  "authorship is already clearly credited there".
      - Ryan's own reply on #4100, and solid-docs #1712, end "_Generated by Claude Code_".
      - The launch post:  "Built to Be Written by Agents";  bug reports from "people(agents)".
    - What would hurt:  large, unreviewed agent PRs.  Solid's AGENTS.md asks for a proposal first, a changeset on
      every source change ("CRITICAL — NEVER SKIP THIS STEP"), public API changes flagged "before it is made".

---

## 6. What Spell could contribute first:  goodwill before the ask

In order:  smallest and surest first (inferred).

1. **Re-test the shadow-root event leak on 2.0.3, and file what's left.**
   - During this epic's move:  run `tests/element/ShadowEvents.test.tsx` with `ShadowEvents.bridge()` turned off.
   - Whatever still fails is a Solid bug nobody has filed:  the repro and patch outline are in `UPSTREAM.md` PR 10
     (section 3).  It touches `@solidjs/web`'s `eventHandler`, a few lines.
   - If nothing fails, delete the part of `ShadowEvents` Solid now does:  less HACK on Solid's internals.
2. **Fix the `solid-element` entry on solidjs.com.**
   - One PR to [utilities.ts](https://github.com/solidjs/solid-site/blob/main/src/ecosystem/utilities.ts):
     title `@solidjs/element`, link `github.com/solidjs/solid/tree/main/packages/element` (the current link is
     dead), category UI (not Routers).
   - Same file and reviewer as the later listing;  plainly helpful (inferred).
3. **File the `UPSTREAM.md` fixes that still apply to `@solidjs/element` 2.0.1**, one issue each, proposal first
   (CONTRIBUTING:  "submit a proposal for a change before spending time implementing it").
   - Check each against 2.0.1 first;  PR 8 (owner lookup across shadow roots) and PR 9 (declarative shadow roots)
     look open (inferred).
   - Most of the others live in `component-register`, whose queue "has been idle for years" (`UPSTREAM.md`):
     ask Ryan whether `packages/element` should absorb it, the plan's route 1.
4. **A typed custom-element event helper**, the one Ryan left to userland (#4100).
   - A ref factory, `on(type, handler, options)`, with typed event maps from a Custom Elements Manifest.
   - As a Stage 0 proposal to solid-primitives, after checking `@solid-primitives/event-listener` (3.0.0, stage 3)
     for overlap.  Spell UI's generated JSX types (`spell/ui/jsx`) already know every event's `detail`.
5. **Docs:  the Solid 2 "Web components" section** (solid-docs `v2-rebuild`, "Integrate non-Solid code").
   - It covers USING custom elements;  nothing covers WRITING them with `@solidjs/element`, or one Solid per page
     (#3053), or shadow-root delegation.
   - Ask the docs team (LadyBluenotes) on Discord first.
6. **Report what this epic finds moving rc.21 to 2.0.3**, as issues with repros, not workarounds.
   - The code-debt log's "re-measure on every RC bump" entries, e.g. "Drawing works around Solid rc.13's
     `<Errored>`" (`spell.epics/agents/CODE-DEBT.md`, `## core`).
7. **The agent rules** (`agents/solid/solid-2.md`, 527 lines):  lowest priority.
   - Solid now ships its own:  `solid-js/skills/solid-2.0/SKILL.md`, `reactivity-diagnostics`, and a rules block
     for `AGENTS.md` (solid-docs `v2-rebuild`, `src/routes/(5)guides/(17)ai-tools.mdx`).
   - Better:  check ours against theirs, and send THEM what they lack (classes, custom elements), as small PRs to
     the skill (inferred).

---

## 7. The plan

### What to have ready first (blocking)

1. Spell on Solid 2.0.3 (this epic), and `spell-ui`'s peers as a range (`^2.0.3`).
2. A root LICENSE file (MIT, with the copyright holder), and the Fomantic notice (section 5, item 8).
3. The first release, December 1:  `spell-ui` on npm `latest`.
4. A public page to link:  Spell UI's docs site, deployed;  at least a live demo of a Solid app using it.
   Until then the link is the GitHub README, as most entries' are.
5. The Solid section of `ui/README-frameworks.md`:  the ref way first, the 2.0.3 version, the same-Solid caveat.

### In what order

1. Now, during this epic:  contribution 1 (re-test, file the shadow-root bug).
2. Within days:  contribution 2 (the `@solidjs/element` entry fix on solid-site).
3. Over the next weeks:  contributions 3 to 6, each an issue first, on Discord where the team asks.
4. After December 1, with the blocking list done:  the listing PR (below), against `src/ecosystem/utilities.ts`.
   - A PR, not the issue form:  PRs are what's been merged.
   - Its body as #602's:  what it is, the categories, "supports Solid 2.0", links to npm and the source.
   - If it's an agent opening it, the body is exempt from the blockquote rule;  replies in the thread are not
     (Solid's AGENTS.md, "Agent Voice on GitHub").
5. The same week:  a PR to awesome-solid-js, "Web Components" and "Frameworks & Component Libraries";
   expect a wait.
6. Later, once it stands alone:  `spell/element` as its own entry (UI, Plugins), as LUME and classy-solid are.
7. Later still:  an article for the Resources page's Solid 2.0 tab, e.g. what 23 release candidates taught a
   language built on Solid 2 (inferred);  and the language itself on Discord, not in the directory.

### The listing text

One paragraph, for the PR body and a Discord post:

> Spell UI is a library of accessible, themeable web components written on Solid 2:  76 families of `<ui-*>` custom
> elements (buttons, forms, dropdowns, menus, modals, tables, a calendar) that load themselves on demand.
> A Solid app uses them as plain JSX tags, with data as props and events through a ref;
> the same tags work from plain HTML, React or Vue.
> Each element draws semantic markup in its shadow root, every example is checked with axe in a real browser,
> and themes switch with one attribute.  MIT, on npm as `spell-ui`.

The entry, ready to paste (the description is 260 characters;  the form allows 400):

```ts
  {
    link: 'https://github.com/spell-app/spell/blob/main/ui/README.md',
    title: 'Spell UI',
    description:
      'Accessible, themeable web components written on Solid 2: 76 families of <ui-*> custom elements (buttons, forms, dropdowns, menus, modals, tables, a calendar) that load on demand. Use them from a Solid app as plain JSX tags, or from plain HTML or any framework.',
    author: 'Spell',
    author_url: 'https://github.com/spell-app',
    keywords: ['web components', 'custom elements', 'design system', 'accessible', 'themes', 'fomantic'],
    official: false,
    type: PackageType.Package,
    categories: [ResourceCategory.UI],
  },
```

- `link`:  the public docs site instead, once there is one.
- `solid2: true` is for RESOURCES about Solid 2.0 (articles), not packages (`types.ts`), so it stays off.

---

## Not verified

- Discord:  its channels, a showcase channel, any rule on self-promotion (needs a login).
- Whether `@solidjs/element` 2.0.1 still has each of the 11 problems in `UPSTREAM.md`:  only PR 8 was read against
  its source.
- Whether Solid 2.0.3 still drops an outer container's delegated handler for events from a shadow root:
  read from `client.ts`, not run.
- Ryan's views on web components after 2024:  none found in writing;  his streams weren't searched.
- How the live site's maintainers judge an entry beyond "a maintainer reviews every submission":  no review comments
  exist on the recent PRs to learn from.
