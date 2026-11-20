# Solid 2: every feature, and its ecosystem

Research notes for epic `solid-2-final`, gathered 2026-11-20 by agent `solid-2-final-solid-docs`.
- What this is: the full list of what Solid 2.0 provides, old and new, and every library and tool solidjs.com lists.
  - Another agent maps how Spell does each thing today;  another writes the pages from these notes.
- Versions read:  `solid-js` 2.0.3, `@solidjs/web` 2.0.3, `@solidjs/signals` 2.0.3, `@solidjs/h` 2.0.2, `@solidjs/html` 2.0.1,
  `@solidjs/universal` 2.0.3, `@solidjs/element` 2.0.1, `@solidjs/vite-plugin` 3.0.1, `@solidjs/router` 2.0.1, `@solidjs/meta` 2.0.0,
  `@solidjs/testing-library` 1.0.0-rc.2.
  - Spell pins `2.0.0-rc.21` today (the kit's `package.json`, `agents/solid/solid-2.md`).
- How it was gathered:
  - the docs site whole, as its own agent corpus:  https://docs.solidjs.com/llms.txt (index), https://docs.solidjs.com/llms-small.txt
    (one line per `solid-js` export), https://docs.solidjs.com/llms-full.txt (every page, 1.8 MB)
  - the published packages' type declarations, read statically (TypeScript's checker, no package code run):
    every export of `solid-js` and `@solidjs/web`, diffed against Spell's installed rc.21
  - solidjs.com's home page and https://www.solidjs.com/ecosystem, plus the data file behind the ecosystem page
  - npm registry metadata for every package named here (dist-tags and their `solid-js` range)
  - the release notes another session gathered (`releases.md`, GitHub releases from rc.22 to 2.0.3)
- Every row carries its source URL.  Anything I concluded rather than read says (inferred).

Status words used in the tables:
- **new**:  not in Solid 1.x
- **changed**:  same name, different behaviour or shape
- **renamed from X**:  1.x's `X`, new name (and often a changed shape)
- **moved**:  same API, a different package or import path
- **unchanged**:  as in 1.x
- **removed**:  gone;  the row says what replaces it
- **internal**:  exported, but documented as compiler or integration plumbing, not for apps

## 0. The packages at a glance

| Package | What it is | Latest (2026-11-20) | Spell pins | Source |
| --- | --- | --- | --- | --- |
| `solid-js` | the reactive core, stores, control flow, context:  renderer-neutral | 2.0.3 (Node >= 22.12, ESM only) | 2.0.0-rc.21 | https://www.npmjs.com/package/solid-js |
| `@solidjs/signals` | the reactive engine `solid-js` re-exports;  usable alone | 2.0.3 | 2.0.0-rc.21 | https://www.npmjs.com/package/@solidjs/signals |
| `@solidjs/web` | the DOM and HTML renderer:  `render`, `hydrate`, SSR, `Portal`, `dynamic`, JSX types, server functions, request helpers | 2.0.3 | 2.0.0-rc.21 | https://docs.solidjs.com/reference/solid-web |
| `@solidjs/h` | hyperscript `h()`:  components without a JSX compiler | 2.0.2 | 2.0.0-rc.21 | https://www.npmjs.com/package/@solidjs/h |
| `@solidjs/html` | the `html` tagged template:  no build step, CSP-safe (no `eval`) since 2.0 | 2.0.1 | not used | https://www.npmjs.com/package/@solidjs/html |
| `@solidjs/universal` | `createRenderer()` for custom (non-DOM) renderers | 2.0.3 | not used | https://www.npmjs.com/package/@solidjs/universal |
| `@solidjs/element` | custom elements from Solid components (`customElement`, `withSolid`), on `component-register` | 2.0.1 | not used (Spell has its own `spell/element`) | https://www.npmjs.com/package/@solidjs/element |
| `@solidjs/compiler` | the JSX compiler, native (Rust, published as `@solidjs/compiler-*` binaries);  the Vite plugin's default | 2.0.2 | 2.0.0-rc.21 | https://www.npmjs.com/package/@solidjs/compiler |
| `@solidjs/babel-plugin` | the same compiler as a Babel plugin (replaces `babel-preset-solid`) | 2.0.2 | 2.0.0-rc.21 | https://www.npmjs.com/package/@solidjs/babel-plugin |
| `@solidjs/vite-plugin` | Vite integration:  JSX, HMR, SSR, start mode, server functions, diagnostics endpoint (replaces `vite-plugin-solid`) | 3.0.1 | 3.0.0-next.57 | https://docs.solidjs.com/reference/vite-plugin-solid |
| `@solidjs/router` | Solid Router 2:  `createRouter`, typed paths, query, form actions | 2.0.1 | 2.0.0-next.44 | https://docs.solidjs.com/reference/solid-router |
| `@solidjs/meta` | head tags as components, over the core head registry | 2.0.0 (the docs call it "Solid Meta 1.0") | not used | https://docs.solidjs.com/reference/solid-meta |
| `@solidjs/diagnostics` | captures dev diagnostics and re-runs as artifacts for tests and agents | 2.0.3 | not used | https://www.npmjs.com/package/@solidjs/diagnostics |
| `@solidjs/testing-library` | Testing Library bindings | `next` 1.0.0-rc.2 for Solid 2;  `latest` 0.8.10 is Solid 1 | not installed | https://docs.solidjs.com/guides/testing |
| `@solidjs/start-devtools` | the dev toolbar ("Solid Devtools" on solidjs.com) | 1.0.1 | 1.0.0-next.9 (the Vite plugin's peer) | https://github.com/solidjs/solid-start-devtools |
| `eslint-plugin-solid` | lint rules;  `configs/v2` and `configs/v2-strict` | 0.20.0 | not used | https://docs.solidjs.com/guides/ai-tools#lint |
| `filesystem-routing` | router-neutral file routes (scanner, conventions, Vite delivery, API dispatch) | 0.5.0 | not used | https://docs.solidjs.com/reference/filesystem-routing |
| `seroval`, `seroval-plugins` | serialization `solid-js` and `@solidjs/web` depend on | `^1.8.0` in 2.0.3 | 1.7.0 | https://www.npmjs.com/package/solid-js |

- The API froze at the release candidates:  2.0.3's `solid-js` exports are rc.21's plus ONE, `markRaw`
  (static diff of the two packages' declarations).
  - `@solidjs/web` 2.0.3 adds five:  `setTrustedTypesPolicy` (public), and `heldRead`, `installHostTagging`, `strictHandler`,
    `trustedHTML` (all marked internal).
  - Behaviour did change after rc.21:  rc.22, rc.23, 2.0.1, 2.0.2 and 2.0.3 carry dozens of fixes (`releases.md`).
- Solid 1.x lives on:  the `1.x` branch, npm `solid-js@v1-latest` (1.9.20), docs at https://v1.solidjs.com
  (source:  the 2.0.0 release notes, https://github.com/solidjs/solid/releases).

## 1. Solid core

### 1.1 Signals and memos

| API | What it does | vs Solid 1 | Docs |
| --- | --- | --- | --- |
| `createSignal(value, options?)` | a `[get, set]` pair holding one value | changed:  writes are STAGED, a read right after a write returns the old value until the microtask or `flush()` | https://docs.solidjs.com/reference/solid-js/reactivity/create-signal |
| `createSignal(fn, options?)` | a WRITABLE derived value:  recomputes from `fn`, and can also be set by hand until its inputs change | new (replaces write-back `createComputed` patterns) | https://docs.solidjs.com/reference/solid-js/reactivity/create-signal |
| signal options `name`, `equals` (`false` = always notify), `ownedWrite`, `unobserved`, `loadingValue`, `deferStream`, `ssrSource` | debug name, equality, allow writes in owned scopes, a callback when nobody reads it, a first value shown before async lands, SSR streaming and hydration source | changed:  `ownedWrite`, `unobserved`, `loadingValue`, `deferStream`, `ssrSource` are new;  1.x's `internal` is gone (inferred:  absent from `SignalOptions`) | https://docs.solidjs.com/reference/solid-js/reactivity/create-memo#signaloptions |
| `createMemo(compute, options?)` | a read-only derived value;  may return a Promise or AsyncIterable, and reads as pending until it lands | changed:  async values;  no `initialValue` argument (the compute's `prev` starts `undefined`);  the second argument is options;  eager by default | https://docs.solidjs.com/reference/solid-js/reactivity/create-memo |
| memo options `lazy`, `loadingValue`, `sync`, `transparent`, `id`, `name`, `equals`, `unobserved`, `deferStream`, `ssrSource` | lazy: compute on first read and tear down when unobserved;  sync: promise it never returns async;  transparent: invisible to hydration ids | new (all but `name`, `equals`) | https://docs.solidjs.com/reference/solid-js/reactivity/create-memo#memooptions |
| `createDeferred(fn)` | an async memo that may lag but never leads:  readers keep the last answer while a refetch is in flight, and `isPending` says so | changed:  same name, new meaning;  1.x's idle-time deferral and `timeoutMs` are gone | https://docs.solidjs.com/reference/solid-js/reactivity/create-deferred |
| `untrack(fn)` | runs `fn` without subscribing to what it reads | unchanged;  the docs say NEVER use it to silence `STRICT_READ_UNTRACKED` | https://docs.solidjs.com/reference/solid-js/reactivity/untrack |
| `flush()` / `flush(fn)` | applies queued writes now;  `flush(fn)` runs `fn` in a synchronous flush scope, then drains | new (tests and imperative boundaries) | https://docs.solidjs.com/reference/solid-js/reactivity/flush |
| microtask batching | every write in a tick commits together, on the microtask | changed:  replaces `batch()` | https://docs.solidjs.com/migration/from-solid-1#convert-signals-and-staged-writes |
| `isEqual` | the default equality of signals and memos | renamed from `equalFn` | https://docs.solidjs.com/llms-small.txt |
| `getObserver()` | the computation tracking right now, or `null` | renamed from `getListener` | https://docs.solidjs.com/reference/solid-js/advanced/owner-introspection/get-observer |
| `$TRACK`, `$PROXY` | symbols:  track a store's whole shape / reach a store's proxy | unchanged | https://docs.solidjs.com/llms-small.txt |
| `isStatic(props, key)` | whether a prop was passed as a literal, so `dynamic()` can skip tracking it | new, advanced (no docs page;  `@solidjs/signals` declaration) | https://www.npmjs.com/package/@solidjs/signals |
| Accessor, Setter, Signal, SourceAccessor types | the shapes of getters and setters | unchanged (SourceAccessor new) | https://docs.solidjs.com/reference/solid-js/types/reactive-types |
| `batch(fn)` | -- | removed:  writes batch by themselves;  `flush()` to apply now | https://docs.solidjs.com/migration/from-solid-1#replace-removed-apis-by-intent |
| `createComputed` | -- | removed:  `createMemo`, a two-function `createEffect`, or `createSignal(fn)` | https://docs.solidjs.com/migration/from-solid-1#replace-removed-apis-by-intent |
| `enableScheduling`, `writeSignal` | -- | removed | https://docs.solidjs.com/migration/from-solid-1#replace-removed-apis-by-intent |

### 1.2 Async values, pending state, refresh

| API | What it does | vs Solid 1 | Docs |
| --- | --- | --- | --- |
| async computations | any memo, `createSignal(fn)`, `createStore(fn)` or projection may return a Promise or AsyncIterable;  downstream just reads the value | new (replaces `createResource`) | https://docs.solidjs.com/concepts/async-reactivity |
| held updates | a write feeding pending async is held, with every other write in the same batch, until the new answer lands:  the screen never shows half an update | new (replaces `startTransition` / `useTransition`) | https://docs.solidjs.com/concepts/async-reactivity |
| `isPending(fn)` | true while a change to what `fn` reads is in flight (input changed, or `affects()` declared) | new (replaces `resource.loading` after the first load) | https://docs.solidjs.com/reference/solid-js/reactivity/is-pending |
| `latest(fn)` | reads the freshest in-flight value, falling back to the settled one | new (replaces `resource.latest`) | https://docs.solidjs.com/reference/solid-js/reactivity/latest |
| `refresh(source)` | re-asks one source after a server write;  returns a promise for its next settled state;  quiet unless `affects()` came first | new (replaces `refetch()`) | https://docs.solidjs.com/reference/solid-js/lifecycle-actions/refresh |
| `affects(source)` | marks a source or store slot pending while work that will change it is in flight | new | https://docs.solidjs.com/reference/solid-js/lifecycle-actions/affects |
| `until(predicate, { timeout, signal })` | a promise for the first time a reactive predicate turns truthy;  `yield` it in an action | new | https://docs.solidjs.com/reference/solid-js/lifecycle-actions/until |
| `resolve(fn)` | a promise for an expression's first settled value (tests) | new | https://docs.solidjs.com/reference/solid-js/advanced/interop-async/resolve |
| `NotReadyError` | what a read of an unresolved async source throws;  boundaries catch it | new (exported) | https://docs.solidjs.com/reference/solid-js/advanced/interop-async/not-ready-error |
| `TimeoutError` | what `until` rejects with when its `timeout` passes | new | https://docs.solidjs.com/llms-small.txt |
| `from(source)` | turns a subscribe function, an Observable (RxJS, TC39 Observable) or an async iterable into an async iterable a memo returns:  `createMemo(() => from(source))` | changed:  same name, now returns an async iterable | https://docs.solidjs.com/reference/solid-js/reactivity/from |
| `loadingValue` (signals, memos), `seedLoadingValue` (stores) | a declared placeholder that answers before the first result:  no suspension, `isPending` false until the real answer | new | https://docs.solidjs.com/migration/from-solid-1#replace-resources-with-async-computations |
| `deferStream`, `ssrSource: "server" \| "hybrid" \| "client"` | hold the SSR shell for this value / where the hydrating client gets it from | moved:  were `createResource` options, now on every async primitive | https://docs.solidjs.com/reference/solid-js/reactivity/create-memo#memooptions |
| `createResource` | -- | removed:  async `createMemo` + `<Loading>`;  `refresh`, `latest`, `isPending`, optimistic APIs for its parts | https://docs.solidjs.com/migration/from-solid-1#replace-resources-with-async-computations |
| `startTransition`, `useTransition` | -- | removed:  held updates + `isPending` | https://docs.solidjs.com/migration/from-solid-1#convert-mutations-and-remove-transition-apis |
| `observable(signal)` | -- | removed:  push changes from a two-function `createEffect` | https://docs.solidjs.com/migration/from-solid-1#replace-removed-apis-by-intent |

### 1.3 Stores and projections

| API | What it does | vs Solid 1 | Docs |
| --- | --- | --- | --- |
| `createStore(value, options?)` | a deep reactive proxy;  reads track per property;  write through the setter's DRAFT:  `set(d => { d.user.name = "B" })` | moved (`solid-js/store` => `solid-js`) and changed (draft setter is the only form;  writes staged) | https://docs.solidjs.com/reference/solid-js/stores/create-store |
| `createStore(fn, seed?, options?)` | a derived store:  `fn` mutates a draft or returns the whole value (sync, promise or async iterable) | new | https://docs.solidjs.com/reference/solid-js/stores/create-store |
| store option `shallow` | serve nested values plain (only the top level is reactive) | new | https://docs.solidjs.com/reference/solid-js/stores/create-store |
| store option `name` (and compiler-written `loc`) | debug labels (`todos.title`) | new | https://docs.solidjs.com/reference/solid-js/stores/create-store |
| `createProjection(fn, seed?, { key, seedLoadingValue })` | a read-only derived store, "createMemo for stores", with keyed reconciliation | new (replaces `createSelector`) | https://docs.solidjs.com/reference/solid-js/stores/create-projection |
| `reconcile(data, key)(draft.part)` | merges new data into a store subtree by key | changed:  curried, applied to a draft inside the setter | https://docs.solidjs.com/reference/solid-js/stores/reconcile |
| `snapshot(store)` | a plain, untracked copy (JSON, storage, tests) | renamed from `unwrap` | https://docs.solidjs.com/reference/solid-js/advanced/store-advanced/snapshot |
| `deep(store)` | subscribes to every nested level, returns the plain view | new | https://docs.solidjs.com/reference/solid-js/advanced/store-advanced/deep |
| `isWrappable(value)` | whether a value would become a store proxy | new as a public export (inferred) | https://docs.solidjs.com/reference/solid-js/advanced/store-advanced/is-wrappable |
| `markRaw(value \| Class)` | keeps a value, or every instance of a class and its subclasses, out of store wrapping | new in 2.0.3 | https://docs.solidjs.com/reference/solid-js/advanced/store-advanced/mark-raw |
| `storePath(...)` (from `@solidjs/signals`) | builds a 1.x-style path update (`storePath("user", "name", "G")`, filters, `storePath.DELETE`) for old code | new (compat for removed path setters) | https://docs.solidjs.com/reference/solid-js/advanced/store-advanced/store-path |
| class instances in stores | prototype getters run on the proxy and track what they read (2.0.2);  frozen objects now wrap and track (2.0.1) | changed after rc.21 | releases.md:  `@solidjs/signals` 2.0.1 (e57fc3f), 2.0.2 (8dd6497);  https://github.com/solidjs/solid/releases |
| writes outside the setter | a direct `store.x = 1` is ignored;  dev warns `STORE_WRITE_OUTSIDE_SETTER` | changed | https://docs.solidjs.com/reference/solid-js/diagnostics/store-write-outside-setter |
| Store, StoreSetter, StoreOptions, ProjectionOptions, SolidStore types | store shapes | changed (draft setter) | https://docs.solidjs.com/reference/solid-js/types/store-types |
| `produce(fn)` | -- | removed:  pass the draft function straight to the setter | https://docs.solidjs.com/migration/from-solid-1#convert-stores-to-draft-setters |
| path setters (`set("a", "b", v)`, ranges, filters, `undefined` to delete) | -- | removed:  draft writes, loops, `delete` (or `storePath`) | https://docs.solidjs.com/migration/from-solid-1#convert-stores-to-draft-setters |
| `createMutable`, `modifyMutable` | -- | removed:  `createStore` with draft setters (`@solid-primitives/mutable` 3.0.0 has a Solid 2 one) | https://docs.solidjs.com/migration/from-solid-1#replace-removed-apis-by-intent |
| `createSelector` | -- | removed:  `createProjection` or `createStore(fn)` | https://docs.solidjs.com/migration/from-solid-1#replace-removed-apis-by-intent |
| `$RAW`, `$NODE` | -- | not exported in 2.0 (inferred removed:  absent from 2.0.3's exports) | (static export list of `solid-js` 2.0.3) |

### 1.4 Effects, lifecycle, ownership and roots

| API | What it does | vs Solid 1 | Docs |
| --- | --- | --- | --- |
| `createEffect(compute, apply, options?)` | compute tracks and returns a value;  apply (untracked) does the side effect and may return a cleanup;  apply runs every time compute re-runs | changed:  two functions, always;  one argument is an error (`MISSING_EFFECT_FN`) | https://docs.solidjs.com/reference/solid-js/reactivity/create-effect |
| `createEffect(compute, { effect, error })` | the effect bundle:  `error` catches compute-phase errors in a writable scope | new (replaces `catchError` / `onError` for effects) | https://docs.solidjs.com/reference/solid-js/reactivity/create-effect#effectbundle |
| effect options `defer`, `schedule`, `sync`, `transparent`, `name`, `deferStream`, `ssrSource` | defer: skip the first run (replaces `on(..., { defer })`);  schedule: first run through the queue;  transparent: client-only effect invisible to hydration ids | new | https://docs.solidjs.com/reference/solid-js/reactivity/create-effect#effectoptions |
| `createRenderEffect(compute, apply, options?)` | an effect that runs during render, for DOM bindings | changed:  two functions | https://docs.solidjs.com/reference/solid-js/advanced/specialized-reactivity/create-render-effect |
| `createTrackedEffect(fn)` | one function that tracks and applies in the same scope;  may not create primitives | new (rare) | https://docs.solidjs.com/reference/solid-js/advanced/specialized-reactivity/create-tracked-effect |
| `createReaction(effectFn \| bundle, options?)` | returns `track(fn)`:  `effectFn` runs on the next change of what `fn` read | changed:  takes an effect function or bundle and options | https://docs.solidjs.com/reference/solid-js/advanced/specialized-reactivity/create-reaction |
| `onSettled(fn)` | runs once after the owner's async has settled and the queue flushed;  return a cleanup | new (replaces `onMount`) | https://docs.solidjs.com/reference/solid-js/lifecycle-actions/on-settled |
| `onFlush(fn)` | runs once right after the pending flush, before paint;  for event handlers and effect callbacks | new | https://docs.solidjs.com/reference/solid-js/lifecycle-actions/on-flush |
| `onCleanup(fn)` | cleanup when the owner is disposed or re-runs | unchanged, but forbidden in tracked effects, `onSettled` and ref callbacks (`CLEANUP_IN_FORBIDDEN_SCOPE`) | https://docs.solidjs.com/reference/solid-js/advanced/specialized-reactivity/on-cleanup |
| `createRoot(fn)` | an owner scope with its own `dispose()` | unchanged | https://docs.solidjs.com/reference/solid-js/advanced/owner-introspection/create-root |
| `getOwner()` | the current owner, to carry across an async gap | unchanged | https://docs.solidjs.com/reference/solid-js/advanced/owner-introspection/get-owner |
| `runWithOwner(owner, fn)` | runs `fn` under an owner;  `runWithOwner(null, fn)` detaches | unchanged (`null` form documented;  `RUN_WITH_DISPOSED_OWNER` in dev) | https://docs.solidjs.com/reference/solid-js/advanced/owner-introspection/run-with-owner |
| `isDisposed(owner)` | whether an owner is gone, to ignore late work | new | https://docs.solidjs.com/reference/solid-js/advanced/owner-introspection/is-disposed |
| Owner type | opaque owner of a scope | unchanged | https://docs.solidjs.com/reference/solid-js/types/owner |
| write rules | no signal or store writes in a component body, memo, effect compute or `createRoot` body;  write from handlers, `onSettled`, effect apply, actions, cleanups | new (dev throws `REACTIVE_WRITE_IN_OWNED_SCOPE`) | https://docs.solidjs.com/reference/solid-js/diagnostics/reactive-write-in-owned-scope |
| read rules | reactive reads belong in JSX, a memo or an effect compute;  a component body or flow callback body is an owner, not a tracking scope | new (dev warns `STRICT_READ_UNTRACKED`) | https://docs.solidjs.com/reference/solid-js/diagnostics/strict-read-untracked |
| halting | an uncaught error escaping every boundary stops scheduling for the page | new (`REACTIVITY_HALTED`) | https://docs.solidjs.com/reference/solid-js/diagnostics/reactivity-halted |
| `onMount` | -- | removed:  `onSettled` | https://docs.solidjs.com/migration/from-solid-1#split-effects-into-compute-and-effect-phases |
| `on(deps, fn, { defer })` | -- | removed:  the effect's compute + `defer` option | https://docs.solidjs.com/migration/from-solid-1#split-effects-into-compute-and-effect-phases |
| `onError`, `catchError` | -- | removed:  `<Errored>` or the effect bundle's `error` | https://docs.solidjs.com/migration/from-solid-1#split-effects-into-compute-and-effect-phases |
| `resetErrorBoundaries` | -- | removed:  boundaries heal from graph state or their `reset` | https://docs.solidjs.com/migration/from-solid-1#replace-removed-apis-by-intent |
| `resetErrorHalt()` | revives scheduling after a halt | internal (test / dev-reload hook) | (`@solidjs/signals` 2.0.3 declarations) |

### 1.5 Actions and optimistic updates

| API | What it does | vs Solid 1 | Docs |
| --- | --- | --- | --- |
| `action(function* (args) { ... })` | a mutation:  a generator (or async generator) whose writes cross an async gap as one transaction;  `yield` promises;  reverts on failure;  returns a promise | new (replaces `startTransition` + resource `mutate`) | https://docs.solidjs.com/reference/solid-js/lifecycle-actions/action |
| `createOptimistic(value \| fn)` | a signal whose writes inside an action show at once and revert (or reconcile) when the action settles | new | https://docs.solidjs.com/reference/solid-js/reactivity/create-optimistic |
| `createOptimisticStore(fn \| value, seed?)` | the store form of `createOptimistic` | new | https://docs.solidjs.com/reference/solid-js/stores/create-optimistic-store |
| action rules | call actions from event handlers, never a component body or computation;  never `flush()` inside one;  a bare `yield` re-enters the transaction after an `await` | new (`ACTION_CALLED_IN_OWNED_SCOPE`) | https://docs.solidjs.com/migration/from-solid-1#convert-mutations-and-remove-transition-apis |
| optimistic diagnostics | `OPTIMISTIC_WRITE_BEFORE_LOAD`, `OPTIMISTIC_WRITE_WHILE_LOADING`, `OPTIMISTIC_REVERTED` | new | https://docs.solidjs.com/reference/solid-js/diagnostics |

### 1.6 Control flow components and list primitives

| API | What it does | vs Solid 1 | Docs |
| --- | --- | --- | --- |
| `<For each fallback keyed>` | a list;  default keys by identity (`(item, index())`), `keyed={false}` by position (`(item(), index)`), `keyed={fn}` by key (both accessors) | changed:  absorbs `<Index>`;  key function new | https://docs.solidjs.com/reference/solid-js/components-jsx/for |
| `<Repeat count from fallback>` | renders a callback `count` times, `index` a plain number;  `from` for windowing | new | https://docs.solidjs.com/reference/solid-js/components-jsx/repeat |
| `<Show when keyed fallback>` | conditional;  a function child gets a narrowed accessor (or the raw value with `keyed`) | unchanged | https://docs.solidjs.com/reference/solid-js/components-jsx/show |
| `<Switch fallback>` / `<Match when keyed>` | first truthy branch wins;  `Match` takes function children like `Show` | unchanged | https://docs.solidjs.com/reference/solid-js/components-jsx/switch-and-match |
| `<Loading fallback on>` | async boundary:  fallback on FIRST load only;  later refetches keep content (held);  `on={value}` re-arms it | renamed from `Suspense`;  `on` new | https://docs.solidjs.com/reference/solid-js/components-jsx/loading |
| `<Errored fallback={(err, reset) => ...}>` | error boundary;  `err` is an accessor;  heals when the data recovers | renamed from `ErrorBoundary` (fallback's error is now an accessor) | https://docs.solidjs.com/reference/solid-js/components-jsx/errored |
| `<Reveal order collapsed>` | reveal order of sibling `<Loading>`s:  `order` = `"sequential"` (default), `"together"`, `"natural"`;  `collapsed` for sequential | renamed from `SuspenseList` (its `revealOrder` / `tail` props replaced;  the 1.x names are from memory, inferred) | https://docs.solidjs.com/reference/solid-js/components-jsx/reveal |
| `mapArray(list, fn, { keyed })` | the reactive map behind `<For>`;  reuses rows for unchanged items | changed:  absorbs `indexArray` (`keyed: false`) | https://docs.solidjs.com/reference/solid-js/advanced/jsx-component-primitives/map-array |
| `repeat(count, fn)` | the count-based map behind `<Repeat>` | new | https://docs.solidjs.com/reference/solid-js/advanced/jsx-component-primitives/repeat |
| list moves with `moveBefore()` | list reconciliation moves connected nodes with `Element.moveBefore()` where the browser has it:  moved rows stay connected (focus survives) | new (rc.22, all nodes;  before, only the focused one) | https://docs.solidjs.com/guides/lists ;  releases.md `@solidjs/web` rc.22 (b38d592) |
| `<Index>` | -- | removed:  `<For keyed={false}>` | https://docs.solidjs.com/migration/from-solid-1#update-boundaries-control-flow-and-jsx |
| `indexArray` | -- | removed:  `mapArray(..., { keyed: false })` | https://docs.solidjs.com/migration/from-solid-1#replace-removed-apis-by-intent |
| `createErrorBoundary`, `createLoadingBoundary`, `createRevealOrder` | the functions behind the boundaries | moved to `solid-js/internal` (rc.13);  apps call `<Errored>` / `<Loading>` / `<Reveal>` | `agents/solid/solid-2.md`;  `solid-js/internal` export list |

### 1.7 Components, props and children

| API | What it does | vs Solid 1 | Docs |
| --- | --- | --- | --- |
| components run once | a component is a function called once, untracked;  JSX expressions keep running | unchanged | https://docs.solidjs.com/concepts/components-and-jsx#how-jsx-executes |
| props are lazy getters | read `props.x` where used;  pass values (`<C v={x()} />`), never destructure | unchanged rule;  now warned in dev | https://docs.solidjs.com/concepts/components-and-jsx#props |
| `merge(...sources)` | merges props-like objects into one reactive proxy;  `undefined` overrides | renamed from `mergeProps` (`undefined` semantics changed) | https://docs.solidjs.com/reference/solid-js/stores/merge |
| `omit(props, ...keys)` | a reactive view of props without those keys | renamed from `splitProps` (returns one object, not a tuple of splits) | https://docs.solidjs.com/reference/solid-js/stores/omit |
| `children(() => props.children)` | resolves children once, memoized;  `.toArray()` helper | changed:  `.toArray()` new | https://docs.solidjs.com/reference/solid-js/components-context/children |
| `flatten(children)` | resolves nested accessors and arrays in a children tree (unmemoized) | new export | https://docs.solidjs.com/reference/solid-js/advanced/interop-async/flatten |
| `lazy(() => import(...), { export? })` | code-split component;  suspends through `<Loading>`;  `.preload()`;  `export` picks a named export | changed:  named-export option, `moduleUrl` for SSR preload links | https://docs.solidjs.com/reference/solid-js/components-context/lazy |
| `lazyModule(() => import(...))` | a cached dynamic import of a non-component module;  `.preload()`, `.peek()`;  hydrates by module id | new (rc.15) | https://docs.solidjs.com/reference/solid-js/components-context/lazy |
| `createUniqueId()` | an id that matches between server and client | unchanged | https://docs.solidjs.com/reference/solid-js/components-context/create-unique-id |
| `dynamic(() => source, options?)` (`@solidjs/web`) | a stable component whose rendered component or TAG comes from a reactive (even async) source;  create once, outside JSX;  `xmlns` prop for SVG tags (2.0.0) | new (replaces `<Dynamic>`) | https://docs.solidjs.com/reference/solid-web/components/dynamic |
| `dynamicComponent(() => Comp)` (`solid-js`) | the component-only factory behind `dynamic`:  no tag names, keeps the DOM runtime out of the bundle | new (in `solid-js` since rc.15) | https://docs.solidjs.com/reference/solid-web/components/dynamic |
| `<Dynamic component>` | -- | deprecated (still exported by `@solidjs/web`) | https://docs.solidjs.com/migration/from-solid-1#update-boundaries-control-flow-and-jsx |
| `createDynamic(source, props)` | -- | removed:  `dynamic(source)` | https://docs.solidjs.com/migration/from-solid-1#update-boundaries-control-flow-and-jsx |
| `createComponent(Comp, props, name?)` | what compiled JSX calls;  `name` labels owners after minification | unchanged (`name` new) | releases.md `@solidjs/compiler` 2.0.0 (01ac18c) |
| Component, ParentComponent, VoidComponent, FlowComponent, ParentProps, VoidProps, FlowProps, ComponentProps, ValidComponent, Ref types | component typing;  a plain `Component` has no implicit `children` | unchanged (DOM `ComponentProps` / `JSX` now from `@solidjs/web`) | https://docs.solidjs.com/reference/solid-js/types/component-types |
| `/*@once*/` | -- | removed:  keep values reactive, use `defaultValue`, or `untrack` | https://docs.solidjs.com/migration/from-solid-1#update-boundaries-control-flow-and-jsx |

### 1.8 Context

| API | What it does | vs Solid 1 | Docs |
| --- | --- | --- | --- |
| `createContext<T>(default?)` | the context object IS the provider component:  `<Theme value={v}>` | changed:  no default means a missing provider throws;  `undefined` counts as "not provided" | https://docs.solidjs.com/reference/solid-js/components-context/create-context |
| `useContext(ctx)` | reads the nearest value;  needs an owner | unchanged | https://docs.solidjs.com/reference/solid-js/components-context/use-context |
| `Context.Provider` | -- | removed:  `<Ctx value>` | https://docs.solidjs.com/migration/from-solid-1#update-boundaries-control-flow-and-jsx |
| context into custom elements | the compiler's default "custom-element context" stamps the owner on custom elements so `@solidjs/element` components inherit context from ancestor hosts and slots | unchanged idea;  2.0.0 fixed nested hosts (d2c423d) and a different Solid copy on the page (ea636af) | https://docs.solidjs.com/reference/vite-plugin-solid/options ;  releases.md `@solidjs/element` 2.0.0 |
| Context, ContextProviderComponent types | context typing | changed | https://docs.solidjs.com/reference/solid-js/types/context-types |

### 1.9 Refs and directives

| API | What it does | vs Solid 1 | Docs |
| --- | --- | --- | --- |
| `ref={(el) => ...}` | receives the element when Solid creates it;  runs untracked in the creating pass and OWNS NOTHING (no effects or `onCleanup` inside) | changed:  runs in the creating pass (2.0.0, 7230c08);  primitives inside throw `PRIMITIVE_IN_EFFECT_CALLBACK` | https://docs.solidjs.com/reference/solid-web/jsx-properties/ref |
| `ref={[a, b, c]}` | ref arrays, flattened recursively, called in order | new | https://docs.solidjs.com/concepts/components-and-jsx#refs-and-directives |
| directive factories | a function called in the component body (where it may create owned primitives) that returns the ref callback:  `ref={listen("input", fn, { passive: true })}` | new (replaces `use:`) | https://docs.solidjs.com/concepts/components-and-jsx#refs-and-directives |
| `use:directive` | -- | removed:  compile error naming the replacement | https://docs.solidjs.com/migration/from-solid-1#update-boundaries-control-flow-and-jsx |
| `applyRef`, `ref` (`@solidjs/web`) | the runtime behind `ref` | internal | (`@solidjs/web` 2.0.3 declarations) |

### 1.10 Events and delegation

| API | What it does | vs Solid 1 | Docs |
| --- | --- | --- | --- |
| `onClick` and other camelCase handlers | delegated where possible, through the OWNING render or hydration root;  the name after `on` is lowercased (`onDatechange` => `datechange`) | changed:  delegated per render root (1.x:  the document) | https://docs.solidjs.com/concepts/components-and-jsx#handling-events |
| only `on` + an uppercase letter is an event | lowercase `onclick={fn}` is a plain attribute;  dev warns `LOWERCASE_EVENT_ATTRIBUTE` | changed (rc.14) | https://docs.solidjs.com/reference/solid-js/diagnostics/lowercase-event-attribute |
| handler tuples `onClick={[fn, data]}` | `fn(data, event)` without a closure | unchanged (`BoundEventHandler` in the JSX types) | (`@solidjs/web` 2.0.3 `jsx.d.ts`) |
| handlers bind once | a handler expression is read once, where the element is made;  choose inside the handler;  dev wraps it (`strictHandler`) to warn on reactive reads | unchanged rule, new dev check | https://docs.solidjs.com/llms-small.txt |
| `on:` / `oncapture:` | -- | removed:  compile errors;  native options (capture, passive, once) through a ref directive with `addEventListener` | https://docs.solidjs.com/migration/from-solid-1#update-boundaries-control-flow-and-jsx |
| hyphenated or mixed-case event names | can't be written as `onXxx`;  listen from a ref directive with the exact name | unchanged limitation, documented | https://docs.solidjs.com/guides/integrate-non-solid-code#web-components |
| delegated events must bubble | a custom element that dispatches a delegated name (`input`, `click`) must set `bubbles: true` for the handler to run | unchanged | https://docs.solidjs.com/guides/integrate-non-solid-code#web-components |
| shadow DOM retargeting | the delegated handler walks `composedPath()`, so handlers inside shadow roots fire;  `target` is set to the shadow host as the walk leaves a shadow root;  disabled nodes are skipped | changed (inferred from the 2.0.3 runtime, `eventHandler()`) | (`@solidjs/web` 2.0.3 `dist/web.js`) |
| custom-element render roots registered for delegation | handlers inside a custom element's shadow-DOM render root fire | new fix in `@solidjs/element` 2.0.0 (adbdab3) | releases.md `@solidjs/element` 2.0.0 |
| pre-hydration event replay | events fired before hydration ends replay to their handlers, inside shadow roots too (2.0.2) | changed | releases.md `@solidjs/web` 2.0.2 (b884d6e) |
| re-dispatched events | a delegated handler runs again when the same Event object is dispatched a second time (2.0.1) | fix after rc.21 | releases.md `@solidjs/web` 2.0.1 (b9475d7) |
| `delegateEvents(names)` | what compiled output calls to delegate event types | unchanged (compiler) | (`@solidjs/web` 2.0.3 declarations) |
| `registerDelegatedRoot` / `unregisterDelegatedRoot`, `registerDelegatedContainer` / `unregister...`, `getDelegatedRoot`, `DelegatedEvents` | delegation plumbing for roots and foreign containers | new, internal | (`@solidjs/web` 2.0.3 declarations) |
| `dispatchAsInteraction(e, fn)` | runs a listener Solid didn't attach (a router's `document` click, analytics) inside the same interaction record | new | https://docs.solidjs.com/reference/solid-js/advanced/diagnostics-dev-hooks/dispatch-as-interaction |
| `clearDelegatedEvents` | -- | removed:  listeners dispose with their root | https://docs.solidjs.com/migration/from-solid-1#update-boundaries-control-flow-and-jsx |

### 1.11 DOM attributes and properties

| API | What it does | vs Solid 1 | Docs |
| --- | --- | --- | --- |
| attributes are HTML | lowercase built-in names (`tabindex`, `readonly`), boolean = presence (`true` adds, `false` / `undefined` / `null` removes), enumerated attributes accept `true` for `""` | changed (1.x took `tabIndex`, `readOnly` ...) | https://docs.solidjs.com/reference/solid-js/types/jsx-types |
| `class` string / object / nested array | static and conditional classes, never built strings;  `undefined` in an object is off | changed:  replaces `classList` | https://docs.solidjs.com/reference/solid-web/jsx-properties/class |
| `classList` | -- | removed:  compile error | https://docs.solidjs.com/migration/from-solid-1#update-boundaries-control-flow-and-jsx |
| `style` string / object | inline styles;  hyphenated CSS property names | unchanged (object form tracked per key, `readShallow`) | https://docs.solidjs.com/reference/solid-web/jsx-properties/style |
| `textContent`, `innerHTML` | whole contents as text / as parsed HTML | unchanged | https://docs.solidjs.com/reference/solid-web/jsx-properties/text-content , https://docs.solidjs.com/reference/solid-web/jsx-properties/inner-html |
| `prop:name={v}` | assigns a DOM property instead of an attribute, on native and custom elements;  the server skips it;  a valueless `prop:x` is `true` (rc.17) | unchanged;  typed `prop:*` keys now derived from each element's interface | https://docs.solidjs.com/guides/integrate-non-solid-code#web-components |
| custom elements:  plain props are attributes | on a tag with a hyphen, a plain prop is `setAttribute`d (a string;  `null` / `false` remove it;  arrays and objects stringify) | changed (inferred:  the v1 docs say "Solid can still assign some custom-element properties without `prop:*`") | https://docs.solidjs.com/guides/integrate-non-solid-code#web-components ;  https://v1.solidjs.com/reference/jsx-attributes/prop |
| `attr:`, `bool:` | -- | removed:  compile errors;  standard attributes and presence | https://docs.solidjs.com/migration/from-solid-1#update-boundaries-control-flow-and-jsx |
| stateful properties `value`, `checked`, `selected`, `muted` | written whenever their binding re-runs;  dev warns `UNCOMMITTED_INPUT_OVERWRITTEN` when that clobbers typing;  `defaultValue` / `defaultChecked` for uncontrolled | changed (new dev check) | https://docs.solidjs.com/reference/solid-js/diagnostics/uncommitted-input-overwritten |
| `$key` | entity identity for server markup (frame morph, server-component slots) | new | (`@solidjs/web` 2.0.3 `jsx.d.ts`) |
| `setTrustedTypesPolicy(policy)` | routes template HTML, server-component HTML and the `html` tagged template through a Trusted Types policy | new in 2.0.3 | https://docs.solidjs.com/reference/solid-web/rendering-ssr/set-trusted-types-policy |
| JSX types | owned by the renderer:  `jsxImportSource: "@solidjs/web"`;  augment `"@solidjs/web"` (with `export {}` in the file) or `"@solidjs/web/types/jsx.js"` | moved (from `solid-js`) | https://docs.solidjs.com/guides/typescript#custom-elements |
| `selectedcontent`, `data-*` in prop objects, `xmlns` on `a` / `script` / `style` / `title` | newer element and attribute typings | new (2.0.0) | releases.md `@solidjs/h` 2.0.0 |
| `setAttribute`, `setAttributeNS`, `setProperty`, `setStatefulProperty`, `className`, `style`, `setStyleProperty`, `spread`, `assign`, `dynamicProperty`, `insert`, `template`, `effect`, `memo`, `scope`, `readShallow`, `mergeProps`, `claimElement`, `claimElementTree`, `registerElementClaim`, `getNextElement` ... | the runtime compiled JSX calls | internal | (`@solidjs/web` 2.0.3 declarations) |

### 1.12 Rendering, SSR, streaming, hydration

| API | What it does | vs Solid 1 | Docs |
| --- | --- | --- | --- |
| `render(() => <App />, el, init?, { owner, renderId, onError })` | mounts a tree, returns `dispose`;  a ShadowRoot works as `el`;  the first attach can be held by async | moved (`solid-js/web` => `@solidjs/web`);  options new | https://docs.solidjs.com/reference/solid-web/rendering-ssr/render |
| `hydrate(fn, node, { renderId, owner, onError })` | attaches to server-rendered DOM, returns `dispose` | moved | https://docs.solidjs.com/reference/solid-web/rendering-ssr/hydrate |
| `renderToString(fn)` | synchronous HTML;  async reads under `<Loading>` render their fallback | moved | https://docs.solidjs.com/reference/solid-web/rendering-ssr/render-to-string |
| `renderToStream(fn)` | streams the shell, then each `<Loading>` as it settles;  one consumer:  `pipe`, `pipeTo` or `readable`;  awaiting it gives the settled string | moved and changed (replaces `renderToStringAsync`) | https://docs.solidjs.com/reference/solid-web/rendering-ssr/render-to-stream |
| `renderToStringAsync` | -- | removed:  `await renderToStream(...)` | https://docs.solidjs.com/migration/from-solid-1#update-client-rendering-and-ssr |
| `isServer`, `isDev` | build-time constants | moved | https://docs.solidjs.com/reference/solid-web/rendering-ssr/is-server |
| `<Portal mount>` | renders children elsewhere (default `document.body`), sharing the parent's scope;  client-only (the server renders nothing);  no wrapper element (text markers);  nested portals stack (2.0.1) | changed:  `useShadow`, `isSVG` and `ref` (the 1.x wrapper `<div>` / `<g>`) are gone | https://docs.solidjs.com/reference/solid-web/components/portal ;  https://v1.solidjs.com/reference/components/portal |
| `clientOnly(() => import(...), { fallback })` | a component that renders only in the browser;  the server renders the fallback | new in core (was SolidStart's) | https://docs.solidjs.com/reference/solid-web/rendering-ssr/client-only |
| `<NoHydration>` / `<Hydration>` | opt a subtree out of hydration / back in | moved (`NoHydration` into `solid-js`);  `Hydration` new | https://docs.solidjs.com/reference/solid-js/advanced/manual-hydration/no-hydration |
| `isHydrating()`, `isHydratable()` | whether code is claiming server DOM now / whether this owner is where hydration applies | new | https://docs.solidjs.com/reference/solid-js/advanced/manual-hydration/is-hydrating |
| `onHydrationEnd(fn)` | once, after the root pass and every streamed boundary resumed | new (public again in rc.15, experimental) | https://docs.solidjs.com/reference/solid-js/advanced/manual-hydration/on-hydration-end |
| `getHydrationWriter()` / `takeHydrationValue(key)` | a keyed server-to-client value channel for data libraries | new | https://docs.solidjs.com/reference/solid-web/rendering-ssr/get-hydration-writer |
| `HydrationScript`, `generateHydrationScript` | the bootstrap script for a hand-built document | unchanged (no docs page) | (`@solidjs/web` 2.0.3 declarations) |
| `useHead(tag \| tags \| fn)`, `HeadTag` | the ambient head registry:  titles, meta, links from any component;  streamed as patches | new in core (Solid Meta is now a layer over it) | https://docs.solidjs.com/reference/solid-web/head/use-head |
| `httpStatus(code, text?)`, `httpHeader(name, value, { append })` | declare the response status and headers from inside the tree during SSR | new in core (were SolidStart components) | https://docs.solidjs.com/reference/solid-web/rendering-ssr/http-status |
| `Assets`, `useAssets` | -- | not exported in 2.0.3 (inferred removed);  asset preload links come from `lazy()`, `clientOnly()` and `registerAsset("preload", ...)` | releases.md `@solidjs/h` 2.0.0 (07471da) |
| server functions (`"use server"`) | an RPC the Vite plugin compiles;  `GET` (cacheable reads), `live` (a value that changes over time, streamed), `broadcast` (the same live answer for every viewer), `invoke` (per-call `signal`, `keepalive`, `priority`), `withMeta`, `enableRichArguments`, `createNoJSHandler`, single-flight mutations (`decodeResponse` ...), `configureServerFunctionsClient` / `Server`, `getServerFunctionInvocation` | new in core (was SolidStart) | https://docs.solidjs.com/reference/solid-web/server-functions |
| request and response | `getRequestEvent`, `provideRequestEvent` (`@solidjs/web/storage`, AsyncLocalStorage), `redirect` / `isHref`, `reload`, `respond` / `isResponseEnvelope`, `parseCookieHeader` / `serializeCookie`, `markSafeError` / `isSafeError`, `getTraceContext` (W3C traceparent), `configureServerErrors` / `reportRequestFailure` | new in core (`getRequestEvent` existed in 1.8's `solid-js/web`) | https://docs.solidjs.com/reference/solid-web/request-response |
| server components (experimental) | a function returned from a `"use server"` function is markup rendered on the server, mounted with `dynamicComponent`;  client "slots" (`Slot<P>`) inside it;  `@solidjs/web/frames` transport | new, experimental preview | https://docs.solidjs.com/building-apps/server-functions/durable-generation ;  https://docs.solidjs.com/reference/solid-web/server-functions |
| islands | -- | not offered:  the SolidStart migration says to redesign islands | https://docs.solidjs.com/migration/from-solid-start |
| start mode | the Vite plugin serves a full-stack app:  generated entries, SSR, server functions, middleware, API routes, env, deployment;  NOT SolidStart | new (replaces SolidStart for Solid 2) | https://docs.solidjs.com/reference/vite-plugin-solid/start ;  https://docs.solidjs.com/migration/from-solid-start |
| `sharedConfig` | hydration state | moved to `solid-js/internal` (rc.13) | `agents/solid/solid-2.md` |

### 1.13 Dev mode, diagnostics, observability

| API | What it does | vs Solid 1 | Docs |
| --- | --- | --- | --- |
| coded dev diagnostics | 75 stable codes (`[CODE] message`, an `in <App> > ...` owner line, an `at file:line:col` line);  the first report names the repair guide | new | https://docs.solidjs.com/reference/solid-js/diagnostics |
| `node_modules/solid-js/CHEATSHEET.md`, `skills/solid-2.0`, `skills/reactivity-diagnostics`, `diagnostics.json` | agent docs inside the package, matching the installed version | new (rc.16) | https://docs.solidjs.com/guides/ai-tools |
| `@solidjs/diagnostics`:  `captureArtifact`, `expectNoDiagnostics`, `expectRerunBudget`, Vitest matchers (`toHaveNoDiagnostics`, `toStayWithinRerunBudget`), `skills/agent-loops` | diagnostics as test evidence | new | https://docs.solidjs.com/guides/ai-tools#solidjsdiagnostics-in-tests |
| dev-server endpoint `/__solid/diagnostics` | `begin`, `active`, `whyDidRun`, `costs`, `end` against the open page (`diagnostics: true` in the Vite plugin) | new | https://docs.solidjs.com/guides/ai-tools#the-dev-server-endpoint |
| `DEV` | the dev tier:  devtools hooks, graph walks, console reporting;  `undefined` in production | changed | https://docs.solidjs.com/reference/solid-js/advanced/diagnostics-dev-hooks/dev |
| `OBSERVE` | the observe tier:  records channel, diagnostics channel, attribution slot, `ownerPath()` | new | https://docs.solidjs.com/reference/solid-js/advanced/diagnostics-dev-hooks/observe |
| `solid-js/attribution`:  `attribution`, `costs`, `feedback`, `why`, `subscriptions`, `formatOrigin`, `formatRerun`, `graphSize` | the attribution engine:  interaction, navigation, hold and re-run records, and what each cost | new | https://docs.solidjs.com/reference/solid-js/advanced/diagnostics-dev-hooks/attribution |
| `configureClientErrors(hook)` | called once per error a boundary renders a fallback for | new | https://docs.solidjs.com/reference/solid-js/advanced/diagnostics-dev-hooks/configure-client-errors |
| `enablePerformanceTracks()` (`@solidjs/web/performance-tracks`) | paints attribution records and server-function calls as Chrome Performance panel tracks | new | https://docs.solidjs.com/reference/solid-web/performance-tracks/enable-performance-tracks |
| `name` options and compiler `sourceNames` | names signals, memos, effects, components and bindings (`span.textContent`) after minification, with `file:line:col` | new | https://docs.solidjs.com/reference/vite-plugin-solid/options |
| `$DEVCOMP` | dev component marker | moved to `solid-js/internal` | `agents/solid/solid-2.md` |

All 75 diagnostic codes, from the docs index (https://docs.solidjs.com/llms.txt;  one page each under
https://docs.solidjs.com/reference/solid-js/diagnostics/<code-in-kebab-case>):
- always on in dev:  `ACTION_CALLED_IN_OWNED_SCOPE`, `ASYNC_MEMO_ELEMENT`, `ASYNC_OUTSIDE_LOADING_BOUNDARY`, `ASYNC_STORE_SETTER`,
  `CAUGHT_REACTIVE_READ`, `CLEANUP_IN_FORBIDDEN_SCOPE`, `DYNAMIC_ASYNC_COMPONENT`, `FLUSH_IN_EFFECT_CALLBACK`, `FRAME_MARKER_CORRUPTED`,
  `HEAD_TAG_INVALID`, `HUGE_FAN_IN`, `HUGE_FAN_OUT`, `INVALID_AFFECTS_TARGET`, `INVALID_HTML_NESTING`, `INVALID_REFRESH_TARGET`,
  `INVARIANT_VIOLATION`, `LATE_HEADER_WRITE`, `LAZY_ASSET_UNMAPPED`, `LOADING_ON_ACCESSOR`, `LOADING_ON_OUTSIDE_HOLD`,
  `LOWERCASE_EVENT_ATTRIBUTE`, `MISSING_EFFECT_FN`, `NO_OWNER_BOUNDARY`, `NO_OWNER_CLEANUP`, `NO_OWNER_EFFECT`, `ON_FLUSH_IN_OWNED_SCOPE`,
  `OPTIMISTIC_WRITE_BEFORE_LOAD`, `OPTIMISTIC_WRITE_WHILE_LOADING`, `PENDING_ASYNC_FORBIDDEN_SCOPE`, `PENDING_ASYNC_UNTRACKED_READ`,
  `PRELOAD_DESCRIPTOR_INVALID`, `PRIMITIVE_IN_EFFECT_CALLBACK`, `PRIMITIVE_IN_FORBIDDEN_SCOPE`, `REACTIVE_WRITE_IN_OWNED_SCOPE`,
  `REACTIVITY_HALTED`, `REVEAL_IN_RENDER_TO_STRING`, `RUN_WITH_DISPOSED_OWNER`, `SERVER_ERROR_SANITIZED`, `SERVER_WRITE`,
  `SETTLE_WALK_UNINITIALIZED_SOURCE`, `SETTLED_CLEANUP_UNOWNED`, `SSR_BOUNDARY_WATERFALL`, `SSR_CLIENT_CONTENT_MASKED`,
  `SSR_LIVE_HOLE_LATCHED`, `SSR_RENDER_ERROR_CONTAINED`, `SSR_STREAM_ABANDONED`, `SSR_SUBTREE_ABANDONED`, `SSR_UNDECLARED_LIVE_SOURCE`,
  `STORE_WRITE_OUTSIDE_SETTER`, `STORE_WRITE_THROUGH_LOADING`, `STRICT_READ_UNTRACKED`, `SYNC_NODE_RECEIVED_ASYNC`,
  `UNCOMMITTED_INPUT_OVERWRITTEN`, `UNRECOGNIZED_INSERT_VALUE`, `UNSCOPED_HOLE_ALLOCATED_IDS`, `UNTRACKED_READ_AFTER_AWAIT`
- only with attribution on:  `ABANDONED_FLIGHTS`, `ASYNC_WATERFALL`, `EFFECT_RELAY_TEAR`, `EFFECT_WRITES_OWN_SOURCE`, `FALLBACK_FLASH`,
  `GRAPH_GROWTH`, `HOT_SCOPE_FANOUT`, `HOT_SCOPE_RERUNS`, `HOT_SCOPE_TIME`, `IMMUTABLE_UPDATE_IN_STORE`, `LONG_HOLD`, `OPTIMISTIC_REVERTED`,
  `SILENT_HOLD`, `STACKED_HOLDS`, `UNSTABLE_LIST_IDENTITY`, `UNSTABLE_MEMO_OUTPUT`, `UNTRACKED_ASYNC_HANDLER`, `WASTED_RECOMPUTE`,
  `WIDE_SCOPE_DEPS`

### 1.14 Interop, custom renderers, JSX compiler, hyperscript

| API | What it does | vs Solid 1 | Docs |
| --- | --- | --- | --- |
| `enableExternalSource(config)` | lets Solid computations track reads of another reactive system (MobX, Vue) | changed (config shape, `ExternalSourceConfig`) (inferred) | https://docs.solidjs.com/reference/solid-js/advanced/interop-async/enable-external-source |
| `@solidjs/universal`:  `createRenderer(options)` | build a renderer for any node tree (`createElement`, `insertNode`, `replaceText` ...);  returns `render`, `insert`, `spread`, `mergeProps` ... | moved (`solid-js/universal` => `@solidjs/universal`) | https://docs.solidjs.com/migration/from-solid-1#move-packages-and-jsx-ownership |
| `@solidjs/h`:  `h(tag \| Comp, props, ...children)` | hyperscript;  only functions are reactive;  returns a thunk (`HyperElement`);  arrays are fragments;  a zero-argument function prop on a component becomes a getter | moved (`solid-js/h` => `@solidjs/h`);  types and thunk behaviour changed in rc.17 and 2.0.0 | https://www.npmjs.com/package/@solidjs/h ;  releases.md `@solidjs/h` 2.0.0, 2.0.1, 2.0.2 |
| `@solidjs/html`:  `` html`<div>${() => x()}</div>` ``, `html.define({ For, Show })` | tagged templates, parsed at runtime with no `eval` (CSP-safe), with a component registry | moved (`solid-js/html` => `@solidjs/html`);  runtime rewritten (Tagged JSX) | https://www.npmjs.com/package/@solidjs/html |
| `@solidjs/web/jsx-runtime`, `jsx-dev-runtime` | the automatic JSX runtime entries | moved (from `solid-js/jsx-runtime`) | https://docs.solidjs.com/migration/from-solid-1#move-packages-and-jsx-ownership |
| `@solidjs/compiler` (native) and `@solidjs/babel-plugin` | the JSX compiler:  `generate` dom / ssr / universal, `hydratable`, `moduleName`, `sourceNames`, `componentNames`;  TSRX support | changed (dom-expressions absorbed;  `babel-preset-solid` deleted) | https://docs.solidjs.com/reference/vite-plugin-solid/options ;  releases.md `@solidjs/compiler` 2.0.0 |
| TSRX (`.tsrx`) | a TypeScript UI-language extension (`@for` loops, scoped CSS) the native compiler understands;  `.tsrx` is one of Solid's own file extensions in the Vite plugin | new (inferred from release notes;  no docs page) | https://github.com/tsrx-org/tsrx ;  https://docs.solidjs.com/reference/vite-plugin-solid/options |
| Vite plugin `frontends` | a language that lowers to Solid plugs in by file extension:  `compile(source, ctx)` returns code, map and CSS, then gets the lazy, refresh and server-function passes;  `.rx` (ReactiveScript) is built in | new | https://docs.solidjs.com/reference/vite-plugin-solid/options |
| Vite plugin options | `include`, `exclude`, `dev`, `observe`, `diagnostics`, `ssr`, `start`, `env`, `css`, `compiler` (`"native"` default or `"babel"`), `refresh` (HMR, granular), `extensions`, `babel`, `solid`, `frontends`, `serverFunctions` | changed (new package) | https://docs.solidjs.com/reference/vite-plugin-solid/options |
| `solid-js/refresh` | the HMR runtime the Vite plugin's refresh pass calls (`$$component`, `$$refresh`, `configureRefresh` ...) | new location (inferred;  was the separate `solid-refresh`) | (`solid-js` 2.0.3 `types/refresh`) |
| ESM only, Node >= 22.12 | every runtime package;  CommonJS hosts load them through `require(esm)` | changed (2.0.0, a39415c) | releases.md `@solidjs/h` 2.0.0 |
| `solid-js/web`, `solid-js/store`, `solid-js/h`, `solid-js/html`, `solid-js/universal` | -- | removed paths:  `@solidjs/web`, `solid-js`, `@solidjs/h`, `@solidjs/html`, `@solidjs/universal` | https://docs.solidjs.com/migration/from-solid-1#move-packages-and-jsx-ownership |

### 1.15 Web components:  `@solidjs/element`

| API | What it does | vs Solid 1 | Docs |
| --- | --- | --- | --- |
| `customElement(tag, defaults?, Comp)` | registers a custom element from a Solid component;  props become element properties and hyphenated attributes (only props with defaults are observed);  shadow DOM by default | renamed package (`solid-element` => `@solidjs/element`), same API | https://github.com/solidjs/solid/blob/main/packages/element#readme (README in the 2.0.1 tarball) |
| `withSolid` | the `component-register` mixin behind `customElement`, to compose with other mixins | unchanged | same |
| `noShadowDOM()` | render into light DOM instead | unchanged (re-exported from `component-register`) | same |
| `getCurrentElement()`, `hot(module, tag)` | the host element;  Webpack / Parcel HMR | unchanged (re-exported) | same |
| context from host pages | a nested custom element inherits context from ancestor hosts and assigned slots;  a different Solid copy on the page falls back to an ownerless root with a warning | changed in 2.0.0 (d2c423d, ea636af) | releases.md `@solidjs/element` 2.0.0 |
| enumerable declared props | `{ ...props }` and `Object.keys(props)` see declared props (2.0.1) | fix after rc.23 | releases.md `@solidjs/element` 2.0.1 (c6ce6d7) |

## 2. The ecosystem

- Where the list comes from:  https://www.solidjs.com/ecosystem ("Libraries and tools for Solid").
  - The page holds 225 entries, each with one or more categories, an "Official" flag and a maintained flag.
    It shows 153 by default ("Hide unmaintained" is ticked);  the other 72 appear when it's unticked.
  - Its category chips (each entry counts in every category it has):  Primitives 22, Routers 4, Data 24,
    Data Visualization 5, UI 86, Plugins 37, Starters 8, Build Utilities 20, Add Ons 24, Testing 3.
  - 18 entries are "Official";  ONE carries the site's Solid 2 flag:  Solid Devtools.
  - Read from the page's HTML and the data file behind it (`/assets/ecosystem-*.js`), both fetched 2026-11-20.
- The solidjs.com home page (https://www.solidjs.com/) picks 8 under "Libraries and tools",
  and says "Check each project's README for its Solid 2.0 status":
  Kobalte, Solid Router, Solid Primitives, SolidBase, Solid Meta, Testing Library, Solid Devtools, ESLint Plugin Solid.
- The "Solid 2" column is mine, from npm (registry metadata, 2026-11-20):
  - **yes**:  the `latest` release's `solid-js` peer (or dependency) range names 2.x
  - **prerelease**:  only a `next` / `alpha` / `beta` / `rc` tag does
  - **no**:  `latest` names 1.x only
  - **unknown: open range**:  `>=1.0.0` or `*`, which installs beside Solid 2 but says nothing about working there
  - **unknown (no npm package under that name)**:  I matched npm names from the entry's title;  a miss is a miss of the
    name, not proof of anything
- Counted that way, of the 225:
  - 16 yes (one inferred:  the playground), 3 prerelease, 105 no, 95 unknown
  - and 6 first-party entries whose Solid 2 successor has a new name or home (`solid-element`, `vite-plugin-solid`,
    `babel-plugin-jsx-dom-expressions`, `dom-expressions`, `solid-refresh`, `create-solid`), written out by hand

### 2.1 First-party packages and tools

The Solid team's own (the `solidjs` GitHub org and the Solid monorepo), plus the community-org pieces the home page features.

| Package | What it is | Solid 2 | URL |
| --- | --- | --- | --- |
| `@solidjs/router` 2.0.1 | Solid Router 2:  one `createRouter({ routes })` instance (it IS the provider);  `defineRoute`, `defineRoutes`, typed paths (`int` ...), plain `<a>` links, `useNavigate`, `useLocation`, `useParams`, `useSearchParams`, `useMatch`, `useRouteMatches`, `useIsRouting`, `useLinkState`, `pendingLinks`, `useBeforeLeave` / `createBeforeLeave`, preloading (`intentPreload`, `eagerPreload`, `tapPreload`, `viewportPreload`, `usePreloadRoute`), data (`query`, `liveQuery`, `revalidate`, `action`, `formAction`, `useAction`, `useSubmissions`), histories (`browserHistory`, `hashHistory`, `memoryHistory`), `@solidjs/router/fs` (file routes), `@solidjs/router/server` | yes (^2.0.0);  `<Router>`, `<Route>`, `<A>`, `<Navigate>` gone | https://docs.solidjs.com/reference/solid-router |
| `@solidjs/meta` 2.0.0 | `<Title>`, `<Meta>`, `<Link>`, `<Script>` (new), `<Style>`, `<Stylesheet>`, `<Base>`, `<Head>` (a group);  `<MetaProvider>` and `useHead` gone (core has `useHead`);  dedupes by name / property, last wins | yes (^2.0.0) | https://docs.solidjs.com/migration/from-solid-meta |
| `@solidjs/vite-plugin` 3.0.1 | JSX (native or Babel compiler), HMR, SSR, start mode, server functions, env, diagnostics endpoint, `frontends` | yes;  replaces `vite-plugin-solid` (2.11.17, Solid 1) | https://docs.solidjs.com/reference/vite-plugin-solid |
| start mode (in the Vite plugin) | full-stack serving:  `src/App.tsx` + `src/Document.tsx`, generated entries, middleware, API routes, sessions, deployment | yes;  replaces SolidStart for Solid 2 | https://docs.solidjs.com/reference/vite-plugin-solid/start |
| `@solidjs/start` 2.2.3 (SolidStart) | the 1.x-era app framework (Vinxi / Nitro;  "released SolidStart 2" on Vite) | **no**:  runs on Solid 1 (^1.9.15);  "do not install Solid 2 into an existing SolidStart application" | https://docs.solidjs.com/migration/from-solid-start |
| `@solidjs/start-devtools` 1.0.1 ("Solid Devtools") | the dev toolbar:  runtime errors, the runtime's diagnostics, an action timeline, async loads, server-function requests, a reactivity graph, an ownership tree | yes | https://github.com/solidjs/solid-start-devtools |
| `solid-devtools` 0.34.5 and `@solid-devtools/*` (community) | the 1.x browser-extension devtools | no (^1.9.0) | https://github.com/thetarnav/solid-devtools |
| `@solidjs/testing-library` | `render`, `renderHook`, `renderDirective`, `renderRef`, `testEffect`, `cleanup` | prerelease:  `next` 1.0.0-rc.2 (>=2.0.0-0);  `latest` 0.8.10 is for 1.x;  the docs install `@next` | https://docs.solidjs.com/guides/testing |
| `@solidjs/diagnostics` 2.0.3 | `captureArtifact`, assertions, Vitest matchers, browser and Playwright entries, an agent-loop skill | yes | https://docs.solidjs.com/guides/ai-tools |
| `@solidjs/element` 2.0.1 | custom elements (section 1.15) | yes (^2.0.3);  `solid-element` 1.9.2 stays on 1.x | https://www.npmjs.com/package/@solidjs/element |
| `@solidjs/h` 2.0.2, `@solidjs/html` 2.0.1, `@solidjs/universal` 2.0.3 | hyperscript, tagged templates, custom renderers (section 1.14) | yes | https://github.com/solidjs/solid/tree/main/packages |
| `@solidjs/signals` 2.0.3 | the reactive engine alone | yes | https://www.npmjs.com/package/@solidjs/signals |
| `@solidjs/compiler` 2.0.2, `@solidjs/babel-plugin` 2.0.2 | the JSX compilers | yes;  `babel-preset-solid` is deleted (its last 2.0 build, 2.0.0-rc.2) | https://github.com/solidjs/solid/tree/main/packages |
| `eslint-plugin-solid` 0.20.0 (solidjs-community) | lint;  `configs/v2` turns on `removed-api`, `no-single-arg-create-effect`, `no-accessor-as-prop`, `no-store-mutation-outside-setter`, `no-write-in-pure-computation` and the server-function rules;  `configs/v2-strict` adds `no-module-scope-reactive-primitive`, `no-restated-default-options` | yes (configs ship in 0.20.0) | https://docs.solidjs.com/guides/ai-tools#lint |
| `@solid-primitives/*` (solidjs-community) | 100 packages of primitives (section 2.3) | yes for 98:  all but `fetch` and `resource` | https://github.com/solidjs-community/solid-primitives |
| `filesystem-routing` 0.5.0 | router-neutral file routes:  scanner, conventions, `/tree`, `/vite`, `/api` | yes (no Solid dependency) | https://docs.solidjs.com/reference/filesystem-routing |
| `@solidjs/image` 1.0.0 | responsive `<picture>` component, lazy load, inline preview, a Vite plugin that resizes local images | yes (^2.0.0) | https://github.com/solidjs/solid-image |
| `@solidjs/ogp` 0.1.0 | Open Graph / dynamic images written as JSX, rendered to PNG in a server function | yes (^2.0.0-rc.21) | https://github.com/solidjs/solid-ogp |
| `prerender-crawler` 0.3.0, `@solidjs/prerender` 0.3.0 | build-time prerendering of a fetch-shaped app;  `prerendered()` server functions | yes (inferred:  built for start mode) | https://github.com/solidjs/prerender-crawler |
| `vite-env-schema` | typed, validated client and server env vars for Vite | unknown:  its README says `vite-env-schema@next` (1.0.0-next.0);  not found on npm under that name on 2026-11-20 | https://github.com/solidjs/vite-env-schema |
| templates (`npm create solid@latest`, `create-solid` 0.13.0) | `solid-v2` templates:  bare, basic, fullstack (and fullstack-tanstack), each with an `AGENTS.md` | yes | https://docs.solidjs.com/getting-started/project-shapes ;  https://github.com/solidjs/templates |
| Solid Playground | the online REPL | yes (inferred:  linked from the 2.0.0 release) | https://playground.solidjs.com |
| ReactiveScript (`@reactivescript/compiler` 0.3.1) | an experimental language (`.rx`) that carries Solid 2's reactive rules as language rules and compiles to Solid 2;  built into the Vite plugin | yes (experimental) | https://github.com/solidjs/reactivescript |
| `solid-refresh` | the 1.x HMR plugin | superseded:  the Vite plugin's `refresh` option and `solid-js/refresh`;  `next` 0.8.0-next.7 only covers 2.0 betas | https://github.com/solidjs/solid-refresh |
| `solid-transition-group` 0.3.0 | enter / exit transitions | no (^1.6.12);  `@solid-primitives/transition-group` 2.0.0 is Solid 2 | https://github.com/solidjs/solid-transition-group |
| `solid-styled-components` 0.28.5, `solid-styled-jsx` 0.27.1 | CSS-in-JS wrappers | no (1.x;  repos idle since 2024 / 2025) | https://github.com/solidjs/solid-styled-components |
| `solid-jest` 0.2.0 | Jest presets | no:  2.0 is ESM only and its `.cjs` mapping has nothing to map | releases.md `@solidjs/h` 2.0.0 (a39415c) |
| TanStack Router / Query / Start for Solid | the docs' other routing and data option (`fullstack-tanstack`) | prerelease:  `@tanstack/solid-router` and `@tanstack/solid-start` rc 2.0.0-rc.11 (>=2.0.1 <3);  `@tanstack/solid-query` rc 6.0.0-rc.6 (^2.0.0);  their `latest` tags are Solid 1 | https://docs.solidjs.com/routing/tanstack |
| Kobalte (`@kobalte/core`) | unstyled accessible components (home-page pick) | prerelease:  alpha 2.0.0-alpha.5 (^2.0.0);  latest 0.13.14 is Solid 1 | https://github.com/kobaltedev/kobalte |
| SolidBase (`@kobalte/solidbase`) 3.0.0 | a docs and content site framework;  the home page says solidjs.com uses it (home-page pick) | yes (^2.0.0-rc.16) | https://github.com/kobaltedev/solidbase |

### 2.2 Every entry shown by default (153, "Hide unmaintained" on)

Each entry appears ONCE, under the first category it lists;  its Categories column has all of them.
Names, categories, "Official" and descriptions are the page's;  descriptions are cut at 160 characters.

#### Primitives (3 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| solid-compose | Primitives |  | A set of reactive state for commonly used features in web apps. | no: latest 0.44.0 (solid-js ^1.8.1) | https://github.com/mathieuprog/solid-compose |
| solid-primitives | Primitives |  | A library of high-quality primitives that extend Solid's reactivity. | yes: 94 of the 100 `@solid-primitives/*` packages (section 2.3) | https://github.com/solidjs-community/solid-primitives |
| solid-undo-redo | Primitives |  | A list-based (O(1)) implementation of undo-redo for signals. | no: latest 1.4.1 (solid-js ^1.7) | https://github.com/elite174/solid-undo-redo |

#### Routers (4 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| solid-element | Routers | yes | Extensions to Solid.js that add a Web Component wrapper. | renamed: `@solidjs/element` 2.0.1 (solid-js ^2.0.3); `solid-element` 1.9.2 stays on 1.x | https://github.com/solidjs/solid/blob/main/packages/solid-element |
| solid-router | Routers | yes | Universal router for SolidJS, combining paradigms of React Router and Ember Router. Supports JSX or JSON routing, and nested routes. Part of Solid Start, making... | yes: `@solidjs/router` 2.0.1 (solid-js ^2.0.0) | https://github.com/solidjs/solid-router |
| solid-styled-jsx | Routers | yes | Wrapper for using Solid with Vercel's Styled JSX. | no: latest 0.27.1 (solid-js ^1.0.0) | https://github.com/solidjs/solid-styled-jsx |
| solidjs-treeview-component | Routers |  | Interactive tree of nodes, expand/collapse, fetch child nodes on demand. | unknown (no npm package under that name) | https://github.com/milahu/solidjs-treeview-component |

#### Data (11 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| @gapu/solid-query | Data, Primitives |  | Primitives for managing queries and cache in solid.js | unknown: open range (solid-js *), not tested on 2 | https://github.com/pureliani/solid-query |
| @stitchapi/solid | Data |  | Typed, validated, streaming-first API bindings for Solid — createStitch/createStitchStream primitives that reconcile a Solid store and re-render as response del... | no: latest 1.0.0-rc.2 (solid-js ^1.8.0) | https://github.com/rejifald/StitchAPI/tree/main/packages/solid |
| @tanstack/solid-query | Data |  | Provides a 1st-class API for using TanStack Query with SolidJS. | prerelease: rc 6.0.0-rc.6 (solid-js ^2.0.0); latest 5.108.2 is ^1.6.0 | https://tanstack.com/query/v4/docs/adapters/solid-query |
| @wundergraph/solid-query | Data |  | Brings all the good stuff from WunderGraph to the Solid.js ecosystem. | no: latest 0.5.33 (solid-js ^1.5.7) | https://github.com/wundergraph/wundergraph/tree/main/packages/solid-query |
| Orval Solid & SolidStart REST Codegen | Data |  | Orval is a RESTful generator that produces Solid and SolidStart bindings. | unknown (no npm package under that name) | https://orval.dev/guides/solid-start |
| solid-firebase | Data |  | A range of useful Solid hooks for Firebase. | unknown: open range (solid-js >=1.6.0), not tested on 2 | https://github.com/wobsoriano/solid-firebase |
| solid-start-auth-example | Data |  | This is the official SolidStart Auth example for Auth.js. | unknown (no npm package under that name) | https://github.com/nextauthjs/solid-start-auth-example |
| solid-swr | Data, Primitives |  | The beloved swr package ported over to solid | no: latest 5.0.2 (solid-js 1.x.x) | https://github.com/Tronikelis/solid-swr |
| solid-virtual-list | Data |  | Given a list of items, only render what's visible on the screen while allowing scrolling the whole list. | unknown (no npm package under that name) | https://github.com/nchudleigh/solid-virtual-list |
| solid-zustand | Data |  | Zustand state management for Solid. | no: latest 2.0.0 (solid-js ^1.6.0) | https://github.com/wobsoriano/solid-zustand/ |
| solidstart-urql | Data |  | @urql/solid-start provides URQL integration for SolidStart, built with SolidStart's native primitives like query, action, and createAsync. | unknown (no npm package under that name) | https://github.com/urql-graphql/urql/tree/main/packages/solid-start-urql |

#### Data Visualization (5 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| ag-grid-solid | Data Visualization, UI |  | All of the grid's core rendering (headers, rows, cells etc) is rendered using Solid. | unknown: open range (solid-js >=1.0.0), not tested on 2 | https://ag-grid.com/react-data-grid/solidjs/ |
| echarts-solid | Data Visualization |  | ECharts components for Solid | no: latest 0.2.0 (solid-js ^1.8.22) | https://github.com/alxnddr/echarts-solid |
| solid-apexcharts | Data Visualization |  | Build interactive visualizations in Solid. Powered by ApexCharts. | no: latest 0.6.0 (solid-js ^1.6.0) | https://github.com/wobsoriano/solid-apexcharts |
| solid-chartjs | Data Visualization |  | SolidJs component for Chart.js | no: latest 1.3.11 (solid-js ^1.7.5) | https://github.com/s0ftik3/solid-chartjs |
| uplot-solid | Data Visualization |  | Solid component wrapper around μPlot -- a small, fast and performant 2D canvas based chart for time series, lines, areas, ohlc & bars | unknown: open range (solid-js >=1.8.0), not tested on 2 | https://github.com/thedanchez/uplot-solid |

#### UI (56 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| @comvi/solid | UI, Data |  | SolidJS i18n with type-checked keys, ICU plurals and a <T> component for markup inside translations. | no: latest 0.7.1 (solid-js ^1.8.0) | https://github.com/comvi-io/comvi-js/tree/main/packages/solid |
| @gapu/formix | UI, Primitives, Data |  | @gapu/formix is a powerful form management library for SolidJS. It provides a simple and flexible API for handling complex form state, validation, and submissio... | unknown: open range (solid-js *), not tested on 2 | https://github.com/pureliani/formix |
| @klass/solid | UI, Primitives |  | A class variant utility library. | no: latest 3.4.11 (solid-js ^1.8.0) | https://github.com/flamrdevs/klass |
| @motionone/solid | UI |  | Offical Motion One library for hardware accelerated animations in Solid. | no: latest 10.16.4 (solid-js ^1.5.0) | https://github.com/solidjs-community/solid-motionone |
| @responsive-image/solid | UI, Primitives |  | Image component to render responsive images, provided as locally processed images or loaded remotely from Image CDNs | yes: latest 2.1.0 (solid-js ^1.6.0 \|\| ^2.0.0-rc.0) | https://responsive-image.dev/ |
| @rnwonder/solid-date-picker | UI |  | A simple and reusable Datepicker component for for web apps. | no: latest 1.5.0 (solid-js ^1.6.12) | https://github.com/rnwonder/solid-date-picker |
| @sect/solid-hiding-header | UI |  | SolidJS header that disappears on scroll down and appears on scroll up. | unknown: open range (solid-js >=1.0.0), not tested on 2 | https://github.com/sectsect/solid-hiding-header |
| @tanstack/solid-table | UI |  | Headless UI for building powerful tables & datagrids | unknown: open range (solid-js >=1.3), not tested on 2 | https://tanstack.com/table/v8/docs/adapters/solid-table |
| @tanstack/solid-virtual | UI |  | Headless UI for Virtualizing Large Element Lists | no: latest 3.13.53 (solid-js ^1.3.0) | https://tanstack.com/virtual/v3/docs/adapters/solid-virtual |
| ark-ui | UI |  | Ark UI is a headless library for building reusable, scalable Design Systems that works in any framework. | unknown: `@ark-ui/solid` 5.40.0 (solid-js >=1.6.0), open range | https://github.com/chakra-ui/ark |
| corvu | UI, Primitives |  | A collection of unstyled and accessible UI primitives that aim to be highly customizable while providing a delightful developer experience. | no: 0.7.2 (solid-js ^1.8) | https://corvu.dev/ |
| create-jd-app | UI |  | Create modern Solid / SolidStart web application within seconds (tRPC, Prisma, Tailwind, Zod and Auth.js). | unknown: latest 5.1.0 names no solid-js peer | https://github.com/OrJDev/create-jd-app |
| Felte | UI |  | An extensible form library that supports Solid. No Field or Form components are needed, just plain stores and actions. | unknown: latest 1.3.0 names no solid-js peer (`felte`) | https://github.com/pablo-abc/felte |
| Flowbite SolidJS | UI, Data, Plugins |  | Build websites even faster with components on top of Tailwind CSS. | unknown (no npm package under that name) | https://flowbite.com/docs/getting-started/solid-js/ |
| Formisch | UI, Primitives, Data |  | Formisch is a schema-based, headless form library for SolidJS. It manages form state and validation. It is type-safe, fast by default and its bundle size is sma... | yes: latest 1.3.0 (solid-js >=1.6 <2 \|\| >=2.0.0-0 <3) (`@formisch/solid`) | https://formisch.dev/solid/guides/introduction/ |
| kobalte | UI |  | A library of unstyled components for building accessible web apps and design systems with SolidJS. | prerelease: `@kobalte/core` alpha 2.0.0-alpha.5 (solid-js ^2.0.0); latest 0.13.14 is ^1.9.8 | https://kobalte.dev/ |
| lexical-solid | UI |  | An extensible text editor framework for SolidJS based on Lexical. | no: latest 0.21.0 (solid-js ^1.7.11) | https://github.com/mosheduminer/lexical-solid |
| lucide-solid | UI, Primitives, Data |  | Beautiful & consistent icon toolkit made by the community. Open-source project and a fork of Feather Icons. | no: latest 1.77.0 (solid-js ^1.4.7) | https://lucide.dev/ |
| Modular Forms | UI, Primitives, Data |  | Modular Forms is a JavaScript library that is build on top of SolidJS to validate and handle various types of forms. It is fast by default and the bundle size i... | no: latest 0.25.1 (solid-js ^1.3.1) (`@modular-forms/solid`) | https://modularforms.dev/ |
| Papanasi: The Universal UI Library | UI |  | Papanasi (pronunced pɑpənæʃ or papanash) is a UI library to use cross Frameworks. | unknown (no npm package under that name) | https://papanasi.js.org/ |
| solid-ai-chatbot | UI, Add Ons |  | Add the Asyntai AI chat assistant to a Solid or SolidStart app with one component. It answers visitors from your own content. | yes: latest 1.1.0 (solid-js ^1.6.0 \|\| ^2.0.0) | https://asyntai.com/documentation/integrations/solid/ |
| solid-code-input | UI |  | A small component that creates a lightweight text area component which will automatically syntax highlight the code you type in it. | unknown (no npm package under that name) | https://github.com/srsholmes/solid-code-input |
| solid-confetti-explosion | UI |  | Get the party started with Solid! A confetti Component. | no: latest 1.1.8 (solid-js ^1.6.9) | https://github.com/davedbase/solid-confetti-explosion |
| solid-dismissible | UI, Primitives |  | Utility for creating dismissible, nestable layers. Offers different strategies to dismiss the layer, such as on outside click, escape key press, or outside focu... | no: latest 0.1.1 (solid-js ^1.8) | https://corvu.dev/docs/utilities/dismissible/ |
| solid-dzone | UI, Primitives |  | A simple and easy to use Dropzone primitive for SolidJS. | no: latest 1.0.0 (solid-js ^1.6.0) | https://github.com/Jcanotorr06/solid-dzone |
| solid-flow | UI |  | A simple component for building interactive node-based diagrams and editors. | no: latest 1.0.4 (solid-js ^1.5.1) | https://github.com/miguelsalesvieira/solid-flow |
| solid-focus-trap | UI, Primitives |  | Utility that traps focus inside a given DOM element. | no: latest 0.1.9 (solid-js ^1.8) | https://corvu.dev/docs/utilities/focus-trap/ |
| solid-fontawesome | UI |  | A FontAwesomeIcon svg component for the font awesome icon library. | no: latest 0.3.0 (solid-js ^1.9.0) | https://github.com/gnomical/solid-fontawesome |
| solid-formlet | UI, Primitives |  | Functional combinators for building reactive forms with SolidJS | unknown: open range (solid-js >=1.0.0), not tested on 2 | https://github.com/functorism/solid-formlet |
| solid-giphy | UI |  | Solid bindings for Giphy API service. | no: latest 0.1.3 (solid-js ^1.2.0) | https://github.com/lxsmnsyc/solid-giphy |
| solid-imask | UI |  | Official Solid.js implementation for imaskjs. | unknown: open range (solid-js >=1.3.0), not tested on 2 | https://github.com/uNmAnNeR/imaskjs/tree/master/packages/solid-imask |
| solid-list | UI, Primitives |  | Utility to create accessible, keyboard navigable lists like search results, selects or autocompletes. | no: latest 0.3.0 (solid-js ^1.8) | https://corvu.dev/docs/utilities/list/ |
| solid-maplibre | UI |  | SolidJS wrapper around MapLibre GL JS | unknown: open range (solid-js *), not tested on 2 | https://github.com/shishkin/solid-maplibre |
| solid-marquee | UI |  | A simple and lightweight Marquee component for SolidJS. | no: latest 1.0.0 (solid-js ^1.6.0) | https://github.com/Jcanotorr06/solid-marquee |
| solid-mason | UI |  | Simple masonry layout in SolidJS. | yes: latest 1.0.0 (solid-js ^2.0.0) | https://github.com/lxsmnsyc/solid-mason |
| solid-multiselect | UI |  | A multi-select dropdown implementation for SolidJS. | unknown (no npm package under that name) | https://github.com/DigiChanges/solid-multiselect |
| solid-notifications | UI |  | Reactive, customizable toast notifications for SolidJS | no: latest 1.2.0 (solid-js ^1.9.4) | https://solid-notifications.vercel.app/ |
| solid-presence | UI, Primitives |  | Utility that manages the presence of an element in the DOM while being aware of pending animations. | no: latest 0.2.0 (solid-js ^1.8) | https://corvu.dev/docs/utilities/presence/ |
| solid-prevent-scroll | UI, Primitives |  | Utility that prevents scrolling outside of a given DOM element. Works by preventing events that else would lead to scrolling. | no: latest 0.1.11 (solid-js ^1.8) | https://corvu.dev/docs/utilities/prevent-scroll/ |
| solid-resizable-panels | UI |  | The set of components for building resizable panels. | no: latest 0.5.4 (solid-js ^1.7) | https://github.com/elite174/solid-resizable-panels |
| solid-route-progress | UI, Add Ons |  | Route progress bar for SolidJS and SolidStart: the thin loading bar along the top of the page. Follows @solidjs/router navigations, or the Navigation API withou... | no: latest 1.1.0 (solid-js ^1.9.0) | https://solid-route-progress.vercel.app |
| solid-select | UI |  | A Select component for Solid. | unknown: latest 0.0.1 names no solid-js peer | https://github.com/thisbeyond/solid-select |
| solid-simple-datepicker | UI |  | A nice, customizable and simple datepicker component for every day. | no: latest 1.1.1 (solid-js ^1.7) | https://github.com/elite174/solid-simple-datepicker |
| solid-simple-popover | UI, Primitives |  | A simple and customizable popover component for SolidJS based on floating-ui. | no: latest 3.0.0 (solid-js ^1.8) | https://github.com/elite174/solid-simple-popover |
| solid-slider | UI |  | A carousel/slider implementation in TypeScript for Solid using KeenSlider. | yes: latest 2.0.0 (solid-js ^2.0.1) | https://github.com/davedbase/solid-slider |
| solid-social | UI |  | Social components for solid-js. These components are a port of MDX Embed, but can be used in other contexts, hence solid-social. | no: latest 0.9.6 (solid-js ^1.3.0) | https://github.com/high1/solid-social#readme |
| solid-textarea-autosize | UI |  | <textarea /> component for Solid which grows with content. A port of react-textarea-autosize. | unknown: open range (solid-js >=1.0.0), not tested on 2 | https://github.com/bigmistqke/solid-textarea-autosize |
| solid-theme-provider | UI |  | Lightweight, customizable theme switcher that injects css variables into the :root style element. | no: latest 1.1.1 (solid-js ^1.9.0) | https://github.com/gnomical/solid-theme-provider |
| solid-transition-size | UI, Primitives |  | Utility which makes it possible to transition the width and height of elements that don't have a fixed size applied. | no: latest 0.1.4 (solid-js ^1.8) | https://corvu.dev/docs/utilities/transition-size/ |
| solid-uppy | UI |  | Sleek, modular open source JavaScript file uploader for Solid using Uppy. | no: latest 0.3.0 (solid-js ^1.9) | https://github.com/lxsmnsyc/solid-uppy |
| solid-virtual-container | UI |  | Efficient, single direction virtual list/grid for Solid-js. | unknown (no npm package under that name) | https://github.com/minht11/solid-virtual-container |
| solid-wizard | UI |  | A wizard component for solid-js. | unknown: latest undefined names no solid-js peer | https://github.com/DigiChanges/solid-wizard |
| SUID - Material UI | UI, Add Ons |  | A port of MUI built with SolidJS. | unknown (no npm package under that name) | https://suid.dev |
| swapy-solid | UI |  | Solid components enabling drag and swap layouts via Swapy. | unknown: latest 0.1.0 names no solid-js peer | https://github.com/thedanchez/swapy-solid |
| terracotta | UI |  | Headless UI for SolidJS. | yes: latest 2.0.0 (solid-js ^2.0.0) | https://github.com/lxsmnsyc/terracotta |
| tinymce-solid | UI |  | TinyMCE Component for SolidJS | no: latest 0.0.10 (solid-js ^1.9.7) | https://github.com/thednp/tinymce-solid |

#### Plugins (33 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| @thednp/solid-color-picker | Plugins, UI |  | Modern Color Picker for SolidJS | no: latest 0.0.14 (solid-js ^1.6.0) | https://github.com/thednp/solid-color-picker |
| babel-plugin-solid-undestructure | Plugins, Build Utilities |  | This babel plugin allows you to destructure your props in your Solid components without losing reactivity. | no: latest 1.1.0 (solid-js ^1.2.4) | https://github.com/orenelbaum/babel-plugin-solid-undestructure |
| better-captcha | Plugins |  | Framework-agnostic captcha library with support for multiple providers. | unknown: latest 1.0.3 names no solid-js peer | https://github.com/LuggaPugga/better-captcha |
| classy-solid | Plugins, Data |  | Tools for class-based reactivity powered by Solid.js, and for using classes as Solid components (f.e. in a JSX template). | no: latest 0.5.2 (solid-js ^1.3.13) | https://github.com/lume/classy-solid |
| eslint-plugin-solid | Plugins, Build Utilities |  | It is not yet stable, and some rules may change, but it's well tested and should be helpful in Solid projects today. | yes: 0.20.0 ships `configs/v2` and `configs/v2-strict` (docs, Solid for AI tools) | https://github.com/joshwilsonvu/eslint-plugin-solid |
| piying-view | Plugins, UI |  | Frontend form solution;Valibot define to form component;Strongly typed | unknown (no npm package under that name) | https://github.com/piying-org/piying-view |
| previewjs | Plugins, UI |  | Preview.js lets you preview Solid components instantly in your IDE. | unknown: latest 1.0.6 names no solid-js peer | https://github.com/fwouts/previewjs |
| solid-apollo | Plugins, Data |  | An Apollo client for Solid. | unknown: latest 0.0.2 names no solid-js peer | https://github.com/merged-js/solid-apollo |
| solid-bootstrap | Plugins, UI |  | The most popular front-end framework rebuilt for SolidJS. | unknown: open range (solid-js >=1.6.0), not tested on 2 | https://solid-libs.github.io/solid-bootstrap/#/ |
| solid-cached-resource | Plugins, Data |  | Create a solid resource attached to a cached state by a unique key. | unknown: latest 0.8.0 names no solid-js peer | https://github.com/yonathan06/solid-cached-resource |
| solid-color | Plugins, UI |  | Color Pickers for Sketch, Photoshop, Chrome & more with SolidJS. | unknown: open range (solid-js >=1.0.0), not tested on 2 | https://github.com/xbmlz/solid-color |
| solid-dismiss | Plugins, UI |  | Handle "click outside" behavior to close dropdowns/popups for Solid. | no: latest 1.8.2 (solid-js 1) | https://aquaductape.github.io/solid-dismiss/ |
| solid-dnd-directive | Plugins, UI |  | A feature-complete implementation of drag and drop for Solid JS using a custom directive. | no: latest 0.2.0 (solid-js ^1.0.0) | https://github.com/isaacHagoel/solid-dnd-directive |
| solid-feather-icon | Plugins, Add Ons |  | A solidjs component for feather icons | no: latest 1.0.1 (solid-js ^1.0.0) | https://github.com/jaoaustero/solid-feather-icon |
| solid-form-handler | Plugins, UI |  | SolidJS library for building form components and validating forms with them. It can be integrated with vanilla form components or any SolidJS UI library. | no: latest 1.2.3 (solid-js ^1) | https://github.com/webblocksapp/solid-form-handler |
| solid-hcaptcha | Plugins |  | hCaptcha Component Library for Solid. | no: latest 1.1.0 (solid-js ^1.6.0 \|\| ^1.7.0 \|\| ^1.8.0 \|\| ^1.9.0) | https://github.com/Vexcited/solid-hcaptcha |
| solid-i18n | Plugins, UI |  | Tiny translation library for solid-js inspired by Rosetta. | no: latest 1.1.0 (solid-js 1.x.x) | https://github.com/SanichKotikov/solid-i18n |
| solid-js-form | Plugins, UI |  | Form library for Solid.JS that uses yup as the validation schema. | no: latest 0.1.8 (solid-js ^1.1.2) | https://github.com/niliadu/solid-js-form |
| solid-map-gl | Plugins, UI |  | Solid Component Library for Mapbox GL JS. | no: latest 2.3.12 (solid-js ^1.8.0 <2.0.0) | https://github.com/GIShub4/solid-map-gl |
| solid-markdown | Plugins, UI |  | Ported version of react-markdown for Solid markdown generation. | no: latest 2.1.1 (solid-js ^1.6.0) | https://github.com/andi23rosca/solid-markdown |
| solid-meta | Plugins | yes | Asynchronous SSR-ready Document Head management for Solid based on React Head. | yes: `@solidjs/meta` 2.0.0 (solid-js ^2.0.0) | https://github.com/solidjs/solid-meta |
| solid-monaco | Plugins, UI |  | Monaco editor for Solid | no: latest 0.3.0 (solid-js ^1.8.0) | https://github.com/alxnddr/solid-monaco |
| solid-popper | Plugins, UI |  | Solid bindings for Popper.js. | yes: latest 1.0.0 (solid-js ^2.0.0) | https://github.com/LXSMNSYC/solid-popper |
| solid-refresh | Plugins | yes | This project aims to provide HMR for Solid for various bundlers. | built in: `@solidjs/vite-plugin` `refresh` option + `solid-js/refresh`; `solid-refresh@next` 0.8.0-next.7 targets 2.0 betas only | https://github.com/solidjs/solid-refresh |
| solid-services | Plugins, Data |  | Services are "global" objects useful for features that require shared state or persistent connections. | no: latest 4.3.2 (solid-js ^1.0.0) | https://github.com/Exelord/solid-services |
| solid-spotify-embed | Plugins, UI |  | A simple Solid component for embedding a Spotify song or album preview. | no: latest 0.1.0 (solid-js ^1.7.8) | https://github.com/jessyhq/solid-spotify-embed |
| solid-tiptap | Plugins, UI |  | Solid bindings for TipTap. | yes: latest 1.0.0 (solid-js ^2.0.0) | https://github.com/LXSMNSYC/solid-tiptap |
| solid-toast-notify | Plugins, UI |  | Toast notify element. | unknown (no npm package under that name) | https://github.com/swise0/solid-toast-notify |
| solid-ui | Plugins, Data |  | Reactive primitives and hooks for building declarative, accessible, composable UI components with SolidJS. | unknown: latest 5.1.0 names no solid-js peer | https://github.com/pheggeseth/solid-ui |
| solid-validation | Plugins, UI |  | simple & lightweight solidjs validation library | unknown (no npm package under that name) | https://github.com/odama626/solid-validation |
| Tawk.to Messenger | Plugins, Add Ons |  | Tawk messenger chat for SolidJS | unknown (no npm package under that name) | https://github.com/jaoaustero/solid-tawk-messenger |
| tiptap-solid | Plugins, UI |  | Solid components for tiptap v2. | no: latest 1.2.1 (solid-js ^1.8.17) | https://github.com/andi23rosca/tiptap-solid |
| vite-solid-svg | Plugins |  | The fastest Vite plugin that transforms SVG files into SolidJS Components | no: latest 0.1.1 (solid-js ^1.9.5) | https://github.com/thednp/vite-solid-svg |

#### Starters (8 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| @pdfslick/solid | Starters, Build Utilities |  | View and Interact with PDF documents in React, SolidJS, Svelte and JavaScript apps | unknown: open range (solid-js >=1.5.0), not tested on 2 | https://github.com/pdfslick/pdfslick |
| babel-plugin-jsx-dom-expressions | Starters, Build Utilities | yes | Babel plugin that converts JSX to DOM Expressions. | replaced: `@solidjs/babel-plugin` 2.0.2, or the default native `@solidjs/compiler` 2.0.2 | https://github.com/ryansolid/dom-expressions/tree/main/packages/babel-plugin-jsx-dom-expressions |
| create-solidbase-app | Starters, Build Utilities |  | Starter Templates CLI with Solid.js, Firebase, TailwindCSS, and Vite | unknown: latest undefined names no solid-js peer | https://github.com/jehaad1/SolidBase |
| refo | Starters, Build Utilities |  | Effortless static site generation with flexibility | unknown: latest 1.1.1 names no solid-js peer | https://github.com/kireerik/refo |
| solid-start-trpc-turborepo | Starters |  | Solid Start tRPC turborepo starter template | unknown (no npm package under that name) | https://github.com/vanillacode314/solid-start-trpc-turborepo |
| solid-ts-webpack | Starters, Build Utilities | yes | Typescript start with Webpack. | unknown (no npm package under that name) | https://github.com/ryansolid/solid-ts-webpack |
| solidjs/templates | Starters, Build Utilities |  | This repository holds most of the official starter templates for vite. | unknown (no npm package under that name) | https://github.com/solidjs/templates |
| vitesse-solid | Starters, UI, Build Utilities |  | Vitesse Solid is a template for building Solid apps with Vite. includes TypeScript, ESLint, Prettier, I18n, Markdown, UnoCSS, HopeUI and more. | unknown (no npm package under that name) | https://github.com/xbmlz/vitesse-solid |

#### Build Utilities (11 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| babel-plugin-solid-labels | Build Utilities, Plugins |  | Compile-time reactive expressions for SolidJS. | no: latest 0.15.1 (solid-js ^1.3) | https://github.com/LXSMNSYC/babel-plugin-solid-labels |
| bat | Build Utilities |  | Opinionated Vite Starter Template | unknown: latest 0.0.0 names no solid-js peer | https://github.com/olgam4/bat |
| dom-expressions | Build Utilities | yes | The renderer behind Solid.js that enables lightning fast fine grained performance. | absorbed into the Solid repo as `@solidjs/web`, `@solidjs/h`, `@solidjs/html`, `@solidjs/universal` (2.0.x) | https://github.com/ryansolid/dom-expressions |
| esbuild-plugin-solid | Build Utilities |  | Plugin to compile solid-js jsx components with esbuild. | unknown: open range (solid-js >= 1.0), not tested on 2 | https://github.com/amoutonbrady/esbuild-plugin-solid |
| jsx-lite | Build Utilities | yes | Generalized JSX that transpiles into Solid, React, Angular, Vue, etc. They have plugins for Figma, VSCode, & Builder.io. | unknown (no npm package under that name) | https://github.com/builderio/jsx-lite |
| lit-dom-expressions | Build Utilities |  | Tagged Template Literal API for DOM Expressions. | unknown: latest 0.40.15 names no solid-js peer | https://github.com/ryansolid/dom-expressions/tree/main/packages/lit-dom-expressions |
| Solid Devtools | Build Utilities | yes | Development toolbar for Solid 2.0 Start mode with runtime error inspection, server-function tracing, a reactivity graph and an ownership tree. | yes: `@solidjs/start-devtools` 1.0.1 (solid-js ^2.0.0) | https://github.com/solidjs/solid-start-devtools |
| solid-jsx | Build Utilities |  | Use Solid components with MDX. Enabled Vite and Rollup in general to parse MDX components into Solid. | unknown: open range (solid-js >=1.4.0), not tested on 2 | https://github.com/high1/solid-jsx |
| solid-marked | Build Utilities |  | MDX/Markdown compiler for SolidJS including GitHub-flavored markdown | yes: latest 1.0.0 (solid-js ^2.0.0) | https://github.com/LXSMNSYC/solid-marked |
| solid-mdx | Build Utilities |  | Easily use Markdown files for content and documentation in your solid-js apps. | no: latest 0.0.7 (solid-js ^1.2.6) | https://www.npmjs.com/package/solid-mdx/v/0.0.6 |
| vite-plugin-solid | Build Utilities, Plugins | yes | Plugin that allows SolidJS to run with Vite. | renamed: `@solidjs/vite-plugin` 3.0.1 (solid-js ^2.0.0); `vite-plugin-solid` 2.11.17 stays on 1.x | https://github.com/solidjs/vite-plugin-solid |

#### Add Ons (19 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| @css-hooks/solid | Add Ons |  | Hooks enhance native inline styles with CSS features like pseudo-classes and media queries. | no: latest 3.1.2 (solid-js >=1.0.0 <2.0.0) | https://css-hooks.com |
| @tsparticles/solid | Add Ons, UI |  | Official tsParticles implementation for Solid. | unknown: open range (solid-js >=1.0.0), not tested on 2 | https://github.com/tsparticles/solid |
| effector-solid | Add Ons, Data |  | A package that adapts effector units for perfect SolidJS performance with updates batching. | unknown: open range (solid-js >= 1.3.0), not tested on 2 | https://github.com/effector/effector/tree/master/packages/effector-solid |
| emotion-solid | Add Ons, UI |  | This library is an Emotion Styled port for Solid. | no: latest 2.1.0 (solid-js ^1.0.0) | https://github.com/Acidic9/emotion-solid |
| LocateJS | Add Ons, UI, Plugins |  | A React, Preact and Solid-supported dev tool that lets you click on any component in the browser to open its code in your IDE.. | unknown: latest 1.0.0 names no solid-js peer (`locatejs`) | https://www.locatorjs.com/install/solidjs |
| LUME | Add Ons, UI |  | Custom elements powered by Solid. LUME is a toolkit that creates 2D or 3D experiences for any device from mobile to desktop to AR/VR. | no: `lume` 0.3.0-alpha.46 and `@lume/element` 0.17.1 (solid-js ^1.0.0) | https://github.com/lume/lume |
| phosphor-solid | Add Ons, UI |  | Phosphor is a flexible icon family for interfaces, diagrams, presentations — whatever, really. | no: latest 1.1.5 (solid-js ^1.2.4) | https://www.npmjs.com/package/phosphor-solid |
| react-solid-state | Add Ons |  | React Hooks API to use Solid.js paradigm in your existing React apps. | no: latest 0.27.3 (solid-js ^1.3.3) | https://github.com/solidjs/react-solid-state |
| solid-algo-wallets | Add Ons |  | Integrate multiple Algorand wallets with a SolidJS web application client | no: latest 0.1.7 (solid-js ^1.8.11) | https://github.com/SilentRhetoric/solid-algo-wallets |
| solid-custom-scrollbars | Add Ons, UI |  | Custom Scrollbars for Solid. | no: latest 0.1.7 (solid-js ^1.4.1) | https://github.com/diragb/solid-custom-scrollbars |
| solid-dnd | Add Ons, Primitives |  | A lightweight and extremely performant drag and drop toolkit for Solid. | no: latest 0.7.5 (solid-js ^1.5) (`@thisbeyond/solid-dnd`) | https://github.com/thisbeyond/solid-dnd |
| solid-heroicons | Add Ons, UI |  | A convenient port of the Tailwind Heroicons. | no: latest 3.2.4 (solid-js >= ^1.2.5) | https://github.com/amoutonbrady/solid-heroicons |
| solid-icons | Add Ons, UI |  | The simplest way to use icons in SolidJS | yes: latest 2.0.0 (solid-js >=1.7.0 \|\| ^2.0.0) | https://github.com/x64Bits/solid-icons |
| solid-orbit | Add Ons, Data |  | This package provides Solid a provider and hooks for Orbit. Most notably, this provides a useQuery hook which is a query transform listener, updating component ... | no: latest 0.1.6 (solid-js ^0.20.3) | https://github.com/andgate/solid-orbit |
| solid-playground | Add Ons | yes | A playground and REPL for Solid. | yes (inferred): playground.solidjs.com is linked from the 2.0.0 release notes | https://github.com/solidjs/solid-playground |
| solid-start | Add Ons | yes | This is the home of the new official starter for Solid. This is still a work in progress. | no: `@solidjs/start` 2.2.3 runs on Solid 1 (^1.9.15); Solid 2 uses the Vite plugin's start mode instead | https://github.com/solidjs/solid-start |
| solid-styled-components | Add Ons | yes | This library provides Styled Components and css helper found in popular JS in CSS libraries. | no: latest 0.28.5 (solid-js ^1.4.4) | https://github.com/solidjs/solid-styled-components |
| solid-transition-group | Add Ons | yes | Animation library influenced by React Transition Group and Vue Transitions for the SolidJS library. | no: 0.3.0 (solid-js ^1.6.12); `@solid-primitives/transition-group` 2.0.0 is the Solid 2 one | https://github.com/solidjs/solid-transition-group |
| unplugin-icons | Add Ons, UI |  | Access thousands of icons (via Iconify) as components on-demand universally | unknown: latest 24.0.0 names no solid-js peer | https://github.com/unplugin/unplugin-icons |

#### Testing (3 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| @playwright/experimental-ct-solid | Testing |  | Fast and reliable component testing in a real browser simular to solid-testing-library | unknown: latest 1.48.2 names no solid-js peer | https://github.com/microsoft/playwright |
| solid-register | Testing |  | Allows running and testing Solid.js browser code in Node.js. | unknown: latest 0.2.5 names no solid-js peer | https://github.com/atk/solid-register |
| solid-testing-library | Testing | yes | Simple and complete Solid DOM testing utilities that encourage good testing practices. | prerelease: `@solidjs/testing-library@next` 1.0.0-rc.2 (solid-js >=2.0.0-0); the docs install `@next` | https://github.com/solidjs/solid-testing-library |



### 2.3 Solid Primitives, package by package

- Source:  the repo's README catalogue (https://github.com/solidjs-community/solid-primitives#readme) and its `packages/` folder,
  with each package's `latest` from npm (2026-11-20).
- The repo has 100 packages;  98 have a Solid 2 `latest` (^2.0.0).
  - The README:  "Every package in this release has been migrated to the new 2.0 APIs and is incompatible with Solid 1.x,
    with two exceptions:  `fetch` and `resource` still target Solid 1.x."
  - What changed in all of them:  resources became accessors that throw `NotReadyError`;  `use:` directives became ref
    factories;  `isServer` comes from `@solidjs/web`;  effects use the two-function form.
    Migration notes:  https://primitives.solidjs.community/migration
- Four npm packages are no longer in the repo and stay on Solid 1:  `autofocus` 0.1.5, `immutable` 1.1.5,
  `page-visibility` 2.1.6, `stream` 0.7.4 (all ^1.6.12;  `focus` exports `autofocus` now).
- Two packages aren't in the README's catalogue:  `gestures` 3.0.0 (^2.0.0) and `utils` 7.0.1 (^2.0.0, shared helpers:
  immutable array / object updates, math, color, `json` / `ndjson` / `lines` stream parsers ...).

| Package | Group (README) | Stage | Primitives it exports | Solid 2 (npm latest) |
| --- | --- | --- | --- | --- |
| [`@solid-primitives/a11y`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/a11y#readme) | Inputs | 3 | `createFormControl`, `createFormControlInput`, `FormControlContext`, `useFormControl`, `makeAnnounce`, `createAnnounce`, `createReducedMotion` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/active-element`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/active-element#readme) | Inputs | 3 | `createActiveElement` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/focus`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/focus#readme) | Inputs | 3 | `autofocus`, `createAutofocus`, `createFocusTrap`, `createFocusRestore`, `createFocusGroup`, `makeFocusListener`, `createFocusSignal` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/input-mask`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/input-mask#readme) | Inputs | 3 | `createInputMask`, `createMaskPattern` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/keyboard`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyboard#readme) | Inputs | 3 | `useKeyDownEvent`, `useKeyDownList`, `useCurrentlyHeldKey`, `useKeyDownSequence`, `createKeyHold`, `createShortcut` | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/list-state`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/list-state#readme) | Inputs | 3 | `createListState`, `createMultiSelectListState` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/mouse`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/mouse#readme) | Inputs | 3 | `createMousePosition`, `createPositionToElement` | yes 4.0.0 (^2.0.0) |
| [`@solid-primitives/pointer`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/pointer#readme) | Inputs | 3 | `createPointerListeners`, `createPerPointerListeners`, `createPointerPosition`, `createPointerList` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/scroll`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/scroll#readme) | Inputs | 3 | `createScrollPosition`, `useWindowScrollPosition`, `createPreventScroll` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/selection`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/selection#readme) | Inputs | 3 | `createSelection` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/analytics`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/analytics#readme) | Utilities | 2 | `makeAnalytics`, `createAnalytics`, `AnalyticsProvider`, `useAnalytics`, `makeAnalyticsGuard`, `createAnalyticsGuard`, `createServerPlugin` | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/controlled-props`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/controlled-props#readme) | Utilities | 3 | `createControlledProp` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/cursor`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/cursor#readme) | Utilities | 3 | `makeBodyCursor`, `makeElementCursor`, `createBodyCursor`, `createElementCursor`, `createDragCursor`, `cursorRef` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/date`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/date#readme) | Utilities | 3 | `createDate`, `createDateNow`, `createTimeDifference`, `createTimeDifferenceFromNow`, `createTimeAgo`, `createCountdown`, `createCountdownFromNow` | yes 3.0.1 (^2.0.0) |
| [`@solid-primitives/event-bus`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#readme) | Utilities | 3 | `createEventBus`, `createEmitter`, `createEventHub`, `createEventStack` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/event-dispatcher`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-dispatcher#readme) | Utilities | 3 | `createEventDispatcher` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/flux-store`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/flux-store#readme) | Utilities | 3 | `createFluxStore`, `createFluxStoreFactory`, `createActions`, `createAction` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/history`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/history#readme) | Utilities | 3 | `createUndoHistory` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/i18n`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/i18n#readme) | Utilities | 3 | `flatten`, `resolveTemplate`, `resolveRichTemplate`, `richText`, `translator`, `missingKeyAsTemplate`, `scopedTranslator`, `chainedTranslator` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/platform`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/platform#readme) | Utilities | 3 | `List of variables` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/promise`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/promise#readme) | Utilities | 3 | `promiseTimeout`, `raceTimeout`, `until`, `untilAll`, `untilAny`, `retry`, `changed` | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/props`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/props#readme) | Utilities | 3 | `combineProps`, `combineHandlers`, `filterProps`, `partitionProps` | yes 4.0.0 (^2.0.0) |
| [`@solid-primitives/queue`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/queue#readme) | Utilities | 3 | `makeQueue`, `createQueue`, `makePriorityQueue`, `createPriorityQueue`, `createTaskQueue`, `createConcurrentTaskQueue` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/scheduled`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/scheduled#readme) | Utilities | 3 | `debounce`, `throttle`, `scheduleIdle`, `leading`, `createScheduled`, `leadingAndTrailing` | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/script-loader`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/script-loader#readme) | Utilities | 3 | `createScriptLoader` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/share`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/share#readme) | Utilities | 3 | `createSocialShare`, `createWebShare`, `makeWebShare` | yes 4.0.0 (^2.0.0) |
| [`@solid-primitives/animation`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/animation#readme) | Animation | 2 | `makeAnimate`, `createAnimate`, `makeScrollAnimation`, `createScrollAnimation`, `makeViewAnimation`, `createViewAnimation`, `makeFlip`, `makeStagger`, ... | yes 1.0.1 (^2.0.0) |
| [`@solid-primitives/presence`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/presence#readme) | Animation | 3 | `createPresence` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/raf`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/raf#readme) | Animation | 3 | `createRAF`, `createMs`, `targetFPS`, `createCallbacksSet`, `useGlobalRAF`, `createScheduledLoop` | yes 4.0.0 (^2.0.0) |
| [`@solid-primitives/spring`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/spring#readme) | Animation | 3 | `createSpring`, `createDerivedSpring` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/transition-group`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/transition-group#readme) | Animation | 3 | `createSwitchTransition`, `createListTransition` | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/tween`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/tween#readme) | Animation | 3 | `createTween` | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/async`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/async#readme) | Reactivity | 1 | `fromStream`, `fromJSONStream`, `makeAbortable`, `createAbortable`, `makeRetrying`, `createAggregated` | yes 0.0.101 (^2.0.0) |
| [`@solid-primitives/controlled-signal`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/controlled-signal#readme) | Reactivity | 3 | `createControllableSignal`, `createControllableBooleanSignal`, `createControllableArraySignal`, `createControllableSetSignal`, `createToggleState` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/deep`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/deep#readme) | Reactivity | 3 | `trackDeep`, `trackStore`, `captureStoreUpdates` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/destructure`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/destructure#readme) | Reactivity | 3 | `destructure` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/lifecycle`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/lifecycle#readme) | Reactivity | 3 | `createIsMounted`, `isHydrated`, `onElementConnect` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/map`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/map#readme) | Reactivity | 3 | `ReactiveMap`, `ReactiveWeakMap` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/memo`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/memo#readme) | Reactivity | 3 | `createLatest`, `createLatestMany`, `createWritableMemo`, `createLazyMemo`, `createPureReaction`, `createMemoCache`, `createReducer` | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/mutable`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/mutable#readme) | Reactivity | 3 | `createMutable`, `modifyMutable` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/resource`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/resource#readme) | Reactivity | 3 | `createAggregated`, `createDeepSignal`, `makeAbortable`, `createAbortable`, `makeCache`, `makeRetrying` | no 0.4.3 (^1.6.0) |
| [`@solid-primitives/rootless`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#readme) | Reactivity | 3 | `createSubRoot`, `createCallback`, `createDisposable`, `createSharedRoot`, `createRootPool` | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/set`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/set#readme) | Reactivity | 3 | `ReactiveSet`, `ReactiveWeakSet`, `union`, `intersection`, `difference`, `symmetricDifference`, `readonlySet` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/signal-builders`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/signal-builders#readme) | Reactivity | 3 | `push`, `filter`, `sort`, `map`, `get`, `merge`, `update`, `add`, ... | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/sortable`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/sortable#readme) | Reactivity | 3 | `ascending`, `descending`, `by`, `combine`, `reverse`, `makeSorted`, `createSorted`, `sortedIndex`, ... | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/state-machine`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/state-machine#readme) | Reactivity | 3 | `createMachine` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/static-store`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/static-store#readme) | Reactivity | 3 | `createStaticStore`, `createDerivedStaticStore` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/trigger`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/trigger#readme) | Reactivity | 3 | `createTrigger`, `createTriggerCache` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/audio`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/audio#readme) | Display & Media | 3 | `makeAudio`, `makeAudioPlayer`, `createAudio` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/bounds`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/bounds#readme) | Display & Media | 3 | `createElementBounds` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/devices`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/devices#readme) | Display & Media | 3 | `createDevices`, `createMicrophones`, `createSpeakers`, `createCameras` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/filesystem`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/filesystem#readme) | Display & Media | 3 | `createFileSystem`, `createSyncFileSystem`, `createAsyncFileSystem`, `makeNoFileSystem`, `makeNoAsyncFileSystem`, `makeVirtualFileSystem`, `makeWebAccessFileSystem`, `makeNodeFileSystem`, ... | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/idle`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/idle#readme) | Display & Media | 3 | `createIdleTimer` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/intersection-observer`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/intersection-observer#readme) | Display & Media | 3 | `createIntersectionObserver`, `createViewportObserver`, `createVisibilityObserver` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/media`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/media#readme) | Display & Media | 3 | `makeMediaQueryListener`, `createMediaQuery`, `createBreakpoints`, `usePrefersDark` | yes 4.0.0 (^2.0.0) |
| [`@solid-primitives/page-utilities`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/page-utilities#readme) | Display & Media | 3 | `createPageVisibility`, `usePageVisibility`, `makePageLeave`, `createPageLeaveBlocker` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/resize-observer`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/resize-observer#readme) | Display & Media | 3 | `createResizeObserver`, `createWindowSize`, `createElementSize` | yes 4.0.0 (^2.0.0) |
| [`@solid-primitives/styles`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/styles#readme) | Display & Media | 3 | `createRemSize` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/video`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/video#readme) | Display & Media | 3 | `makeVideo`, `makeVideoPlayer`, `createVideo`, `createVideoPlayer`, `makeVideoFrameCallback`, `createVideoFrameCallback` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/broadcast-channel`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/broadcast-channel#readme) | Browser APIs | 3 | `makeBroadcastChannel`, `createBroadcastChannel` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/clipboard`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/clipboard#readme) | Browser APIs | 3 | `copyClipboard`, `writeClipboard`, `createClipboard` | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/event-listener`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener#readme) | Browser APIs | 3 | `createEventListener`, `createEventSignal`, `createEventListenerMap`, `WindowEventListener`, `DocumentEventListener` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/event-props`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-props#readme) | Browser APIs | 3 | `createEventProps` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/favicon`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/favicon#readme) | Browser APIs | 3 | `makeFavicon`, `createFavicon`, `makeFaviconAnimation`, `createFaviconAnimation`, `makeFaviconBadge`, `createFaviconBadge`, `makeFaviconScheme`, `createFaviconScheme`, ... | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/fullscreen`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/fullscreen#readme) | Browser APIs | 3 | `makeFullscreen`, `createFullscreen`, `fullscreen` | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/geolocation`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/geolocation#readme) | Browser APIs | 3 | `makeGeolocation`, `makeGeolocationWatcher`, `createGeolocation`, `createGeolocationWatcher`, `createDistance`, `createWithinRadius` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/interaction`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/interaction#readme) | Browser APIs | 3 | `makeInteractOutside`, `interactOutside`, `createInteractOutside`, `ariaHideOutside`, `createHideOutside` | yes 1.0.1 (^2.0.0) |
| [`@solid-primitives/mediastream`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/mediastream#readme) | Browser APIs | 3 | `createStream`, `createAmplitudeStream`, `createAmplitudeFromStream`, `createMediaPermissionRequest`, `createScreen` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/mutation-observer`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/mutation-observer#readme) | Browser APIs | 3 | `createMutationObserver` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/notification`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/notification#readme) | Browser APIs | 3 | `isNotificationSupported`, `makeNotification`, `createNotification`, `createNotificationPermission` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/permission`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/permission#readme) | Browser APIs | 3 | `createPermission` | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/storage`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/storage#readme) | Browser APIs | 3 | `makePersisted`, `cookieStorage`, `tauriStorage`, `multiplexStorage`, `storageSync`, `messageSync`, `wsSync`, `multiplexSync`, ... | yes 5.0.0 (^2.0.0) |
| [`@solid-primitives/timer`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/timer#readme) | Browser APIs | 3 | `makeTimer`, `createTimer`, `createTimeoutLoop`, `createPolled`, `createIntervalCounter` | yes 1.4.5 (^2.0.0) |
| [`@solid-primitives/upload`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/upload#readme) | Browser APIs | 3 | `createFilePicker`, `createDropzone`, `dropzone`, `createFileUploader`, `fileSender`, `fileUploader` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/url`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/url#readme) | Browser APIs | 3 | `createLocationState`, `useSharedLocationState`, `updateLocation`, `setLocationFallback`, `createURL`, `createURLRecord`, `ReactiveURL`, `createSearchParams`, ... | yes 0.2.0 (^2.0.0) |
| [`@solid-primitives/workers`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/workers#readme) | Browser APIs | 3 | `createWorker`, `createWorkerPool`, `createWorkerQuery`, `createReactiveWorker`, `workerScope` | yes 2.0.1 (^2.0.0) |
| [`@solid-primitives/connectivity`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/connectivity#readme) | Network | 3 | `createConnectivitySignal` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/cookies`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/cookies#readme) | Network | 3 | `createServerCookie`, `createUserTheme`, `getCookiesString` | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/fetch`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/fetch#readme) | Network | 3 | `createFetch` | no 2.5.2 (^1.6.12) |
| [`@solid-primitives/graphql`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/graphql#readme) | Network | 3 | `createGraphQLClient`, `createGraphQLMutation` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/sse`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/sse#readme) | Network | 3 | `makeSSE`, `createSSE`, `makeSSEWorker` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/websocket`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/websocket#readme) | Network | 3 | `makeWS`, `createWS`, `createWSState`, `createWSMessage`, `makeReconnectingWS`, `createReconnectingWS`, `makeHeartbeatWS`, `wsMessageIterable`, ... | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/context`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/context#readme) | Control Flow | 3 | `createContextProvider`, `createOptionalContextProvider`, `createLayeredContext`, `MultiProvider` | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/jsx-tokenizer`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/jsx-tokenizer#readme) | Control Flow | 3 | `createTokenizer`, `createToken`, `createObjectToken`, `resolveTokens`, `isToken` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/keyed`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyed#readme) | Control Flow | 3 | `keyArray`, `Key`, `Entries`, `MapEntries`, `SetValues` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/list`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/list#readme) | Control Flow | 3 | `listArray`, `List` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/match`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/match#readme) | Control Flow | 3 | `MatchTag`, `MatchValue` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/range`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/range#readme) | Control Flow | 3 | `createNumericRange`, `repeat`, `mapRange`, `indexRange`, `Repeat`, `IndexRange` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/refs`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/refs#readme) | Control Flow | 3 | `mergeRefs`, `resolveElements`, `resolveFirst`, `Ref`, `Refs` | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/drag-drop`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/drag-drop#readme) | UI Patterns | 2 | `makeDraggable`, `makeDroppable`, `makeNativeDroppable`, `createDraggable`, `createDroppable`, `createNativeDroppable`, `createSortable`, `createDragContext`, ... | yes 0.1.0 (^2.0.0) |
| [`@solid-primitives/form`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/form#readme) | UI Patterns | 2 | `createForm`, `toFormData`, `createFormResetListener`, `createFormControl`, `createFormControlInput`, `FormControlContext`, `useFormControl` | yes 1.0.1 (^2.0.0) |
| [`@solid-primitives/marker`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/marker#readme) | UI Patterns | 3 | `createMarker` | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/masonry`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/masonry#readme) | UI Patterns | 3 | `createMasonry` | yes 2.0.0 (^2.0.0) |
| [`@solid-primitives/pagination`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/pagination#readme) | UI Patterns | 3 | `createPagination`, `createSegment`, `createInfiniteScroll` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/virtual`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/virtual#readme) | UI Patterns | 3 | `createVirutalList`, `VirtualList` | yes 1.0.1 (^2.0.0) |
| [`@solid-primitives/orientation`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/orientation#readme) | Sensors | 3 | `makeOrientation`, `createOrientation` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/sensors`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/sensors#readme) | Sensors | 3 | `makeAccelerometer`, `createAccelerometer`, `makeGyroscope`, `createGyroscope`, `makeSensor`, `createSensor`, `makeCompass`, `createCompass`, ... | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/vibrate`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/vibrate#readme) | Sensors | 3 | `isVibrationSupported`, `makeVibrate`, `createVibrate`, `frequencyToPattern`, `makePulse`, `createPulse` | yes 1.0.0 (^2.0.0) |
| [`@solid-primitives/gestures`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/gestures#readme) | (not in the README catalogue) | -- | -- | yes 3.0.0 (^2.0.0) |
| [`@solid-primitives/utils`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/utils#readme) | Utilities (its own README table) | -- | shared helpers (see above) | yes 7.0.1 (^2.0.0) |
### 2.4 Entries the page hides as unmaintained (72)

Shown only when "Hide unmaintained" is unticked.  Same layout as 2.2.

#### Primitives (3 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| solidjs-flutterwave | Primitives, UI |  | Flutterwave payment gateway for SolidJS. | no: latest 0.1.5 (solid-js ^1.7.6) | https://github.com/rnwonder/solidjs-flutterwave |
| solidjs-paystack | Primitives, UI |  | Paystack payment gateway for SolidJS. | no: latest 0.2.1 (solid-js ^1.7.6) | https://github.com/rnwonder/solidjs-paystack |
| solidjs-scroll-essentials | Primitives, UI |  | solidjs-scroll-essentials provides you with required scroll based primitives to control scroll behavior such as scroll lock in solidjs. | no: latest 0.0.2 (solid-js ^1.6.0) | https://github.com/sacarvy/solidjs-scroll-essentials |

#### Routers (2 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| Solid Named Router | Routers |  | Easy to use named router for solid-js. Inspired by Vue Router. | unknown: open range (solid-js >=1.0.0), not tested on 2 (`solid-named-router`) | https://github.com/Supertigerr/solid-named-router |
| solid-typefu-router5 | Routers |  | This package provides a router with integration with router5 and solid-js, and features type safe router and link creation. | no: latest 1.6.3 (solid-js 1.4 \|\| 1.5 \|\| 1.6) | https://github.com/mikeplus64/solid-typefu-router5 |

#### Data (5 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| solid-dexie | Data |  | Integrates Dexie queries with Solid. | no: latest 0.0.5 (solid-js ^1.4.6) | https://github.com/faassen/solid-dexie |
| solid-meteor-data | Data |  | Integration between Solid and Meteor reactivity, including helpers for managing Meteor data in Solid components. | unknown: open range (solid-js >=1.0.0), not tested on 2 | https://github.com/edemaine/solid-meteor-data |
| solid-start-trpc | Data |  | A package that combines SolidStart and tRPC. | no: latest 0.0.16 (solid-js ^1.5.7) | https://github.com/OrJDev/solid-trpc |
| solid-trpc | Data |  | A package that combines Solid and tRPC. | no: latest 0.0.9 (solid-js ^1.5.3) | https://github.com/OrJDev/solid-trpc |
| solid-urql | Data |  | A highly customizable and versatile GraphQL client for Solid. | no: latest 0.2.0 (solid-js ^1.0.0) | https://www.npmjs.com/package/solid-urql |

#### UI (18 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| @amoutonbrady/solid-i18n | UI, Data |  | Tiny translation library for solid-js inspired by rosetta. | no: latest 0.4.0 (solid-js ^1.0.0) | https://github.com/amoutonbrady/solid-i18n |
| @cookbook/solid-intl | UI, Build Utilities, Plugins |  | A universal internationalization (i18n) for Solid inspired by React Intl & FormatJS. | unknown: open range (solid-js >=1.0.0), not tested on 2 | https://github.com/the-cookbook/solid-intl |
| @solidjs-material/core | UI |  | Solid-js high quality components built with tailwindcss and kobalte following material you guidelines. | no: latest 0.0.12 (solid-js ^1.6.0) | https://github.com/ceopaludetto/solid-material |
| capacitor-solidjs-templates | UI |  | This repository holds production ready Capacitor templates for building native mobile applications using SolidJS + vite. | unknown (no npm package under that name) | https://github.com/ionic-team/capacitor-solidjs-templates |
| fastify-dx-solid | UI |  | Fastify DX for Solid is a renderer adapter for fastify-vite. | no: latest 0.0.4 (solid-js ^1.4.4) | https://github.com/fastify/fastify-dx/tree/main/packages/fastify-dx-solid |
| hope-ui | UI |  | The SolidJS component library you've hoped for. | unknown (no npm package under that name) | https://hope-ui.com/ |
| motion-signals | UI |  | A wrapper over Motion One, An animation library, built on the Web Animations API for the smallest filesize and the fastest performance. | no: latest 0.0.3 (solid-js ~1.3.3) | https://github.com/tanvesh01/motion-signals |
| rx-controls-solid | UI |  | RxControls provides several javascript FormControl objects to make dealing with forms easier. | no: latest 0.9.0 (solid-js ^1.0.0) | https://gitlab.com/john.carroll.p/rx-controls |
| solid-bottomsheet | UI |  | A light-weight Bottomsheet UI component for Solid JS with zero dependencies. | unknown: open range (solid-js >=1.0.0), not tested on 2 | https://github.com/KarthikeyanRanasthala/solid-bottomsheet |
| solid-collapse | UI |  | Tiny and performant collapse component for SolidJS. | unknown: open range (solid-js >=1.2.0), not tested on 2 | https://github.com/smastrom/solid-collapse |
| solid-flip | UI |  | A lightweight transition library for solid-js. | unknown: open range (solid-js *), not tested on 2 | https://github.com/otonashixav/solid-flip |
| solid-knobs | UI |  | Primitives for building user-friendly parameter controls. | unknown: latest 0.5.2 names no solid-js peer | https://github.com/tahti-studio/solid-knobs |
| solid-outside-click-handler | UI |  | Detect and handle clicks outside a Solid component. | no: latest 0.1.0 (solid-js ^1.4.7) | https://github.com/diragb/solid-outside-click-handler |
| solid-reach | UI |  | This is a port of ReachUI for Solid that (hopefully) will serve you as The Accessible Foundation for Solid Apps and Design Systems. | unknown (no npm package under that name) | https://github.com/pablo-abc/solid-reach |
| solid-simple-table | UI |  | Solid SimpleTable is a blazing fast reactive table component that gives you freedom. | no: latest 2.0.0 (solid-js ~1.6.1) | https://github.com/aminya/solid-simple-table |
| solid-toast | UI |  | Customizable Toast Notifications for SolidJS | no: latest 0.5.0 (solid-js ^1.5.4) | https://github.com/ardeora/solid-toast |
| solid-typer | UI |  | Add text-typing animations to Solid. | no: latest 0.0.3 (solid-js ^1.3.5) | https://github.com/StillScripts/solid-typer |
| swiper/solid | UI |  | The most modern mobile touch slider for Solid. | unknown (no npm package under that name) | https://swiperjs.com/solid |

#### Plugins (22 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| CompendiumDevTools | Plugins, Data |  | A library for connecting frameworks and state management libraries to Compendium DevTools. | unknown (no npm package under that name) | https://github.com/CompendiumDevTools/library |
| form-gear | Plugins, UI |  | FormGear is a framework engine for dynamic form creation and complex form processing and validation for data collection. | no: latest 1.1.1 (solid-js 1.3.17) | https://github.com/AdityaSetyadi/form-gear |
| GStatem | Plugins, Data |  | GStatem is a small, simple and fast state-management tool. | unknown: latest 1.0.14 names no solid-js peer (`gstatem`) | https://github.com/gstatem/gstatem |
| melon-solid | Plugins, UI |  | This project fuses the awesome frameworks Melon.js (for game development) and Solid.js. | unknown: latest 0.1.0 names no solid-js peer | https://github.com/L1lith/Melon-Solid |
| ParaglideJS | Plugins, UI, Data |  | An ultra-efficient i18n library that scales to zero. Comes with first class integration with SolidStart | unknown (no npm package under that name) | https://inlang.com/c/solid |
| pyscript-solid | Plugins |  | Write python code in Solid.js using Pyscript. | no: latest 2.0.0 (solid-js ^1.9.0) | https://github.com/SushiWaUmai/pyscript-solid |
| react-solid | Plugins, Data |  | A way to use Solid components inside React. | unknown: latest 0.0.1-security names no solid-js peer | https://github.com/merged-js/react-solid |
| RevKit UI for SolidJS | Plugins, UI |  | Design System UI Kit for busy designers | unknown (no npm package under that name) | https://github.com/specialdoom/solid-rev-kit |
| slate-solid | Plugins, UI |  | Slate Solid is a solid-js wrapper for Slate rich text editor. | unknown: latest 0.0.0 names no solid-js peer | https://github.com/poudels14/slate-solid |
| solar-forms | Plugins, UI |  | Form library for SolidJS inspired by Angular's reactive forms. | no: latest 0.0.5 (solid-js ^1.3.0) | https://github.com/kajetansw/solar-forms |
| solid-auth0 | Plugins |  | Auth0 integration for solid-js which wraps @auth0/auth0-spa-js. | no: latest 2.1.0 (solid-js ^1.9.10) | https://github.com/rturnq/solid-auth0 |
| solid-bedrock | Plugins, UI |  | The Lodash of Web Layouts, a collection of utility components. | unknown (no npm package under that name) | https://github.com/Bedrock-Layouts/Solid-Bedrock |
| solid-boundaries | Plugins, UI |  | A utility to track the bounds of html-elements in SolidJS. | unknown: open range (solid-js >=1.0.0), not tested on 2 | https://github.com/everweij/solid-boundaries |
| solid-command-palette | Plugins, UI |  | Add a command palette to your Solid.js app. | no: latest 1.0.0 (solid-js ^1.3.2) | https://github.com/itaditya/solid-command-palette |
| solid-native | Plugins, UI |  | Solid Native expands the Solid ecosystem to include development of native mobile applications. | no: latest 0.1.2 (solid-js ^1.3.14) | https://github.com/tjjfvi/solid-native |
| solid-plyr | Plugins |  | A simple HTML5, YouTube and Vimeo player (Plyr) for SolidJS. | no: latest 1.0.10 (solid-js ^1.1.3) | https://github.com/git-ced/solid-plyr |
| solid-proxies | Plugins, Data |  | This package provides signaled versions of Javascript's built-in objects. | no: latest 2.0.2 (solid-js ^1.0.0) | https://github.com/Exelord/solid-proxies |
| solid-reactor | Plugins, Build Utilities |  | A compiler to ease the move from React to SolidJS. | unknown: latest 1.2.2 names no solid-js peer | https://github.com/yellowsink/solid-reactor |
| solid-spring | Plugins, UI |  | solid-spring is a spring-physics first animation library for SolidJS based on react-spring/core. | no: latest 0.0.7 (solid-js ^1.3.13) | https://github.com/Aslemammad/solid-spring |
| SolidGraph | Plugins, UI |  | SolidGraph lets you build applications with SolidJs and WunderGraph. | unknown (no npm package under that name) | https://github.com/verdavaine/solidgraph |
| solidjs-div-100vh | Plugins, UI |  | This is a workaround for iOS Safari and other mobile browsers forked from react-div-100vh by mvasin. | unknown: open range (solid-js >=1.0.0), not tested on 2 | https://github.com/TiagoCavalcante/solidjs-div-100vh |
| TurboSolid | Plugins, Data |  | Lightweight asynchronous data management for solid. | unknown (no npm package under that name) | https://github.com/StudioLambda/TurboSolid |

#### Starters (9 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| create-solid | Starters, Build Utilities | yes | Solid's port of Create React App. | the old CRA port; today `npm create solid@latest` makes `solid-v2` templates (docs) | https://github.com/solidjs/create-solid |
| parcel2-solid-ts-starter | Starters, Build Utilities |  | Minimal Solid starter based on yarn 2 pnp resolution (zero-install) and parcel 2 for bundling. | unknown (no npm package under that name) | https://github.com/amoutonbrady/parcel2-solid-ts-starter |
| snowpack-solid | Starters |  | Solid + snowpack + tailwindcss template You get HMR out of the box and full PWA compatible. | unknown (no npm package under that name) | https://github.com/amoutonbrady/snowpack-solid |
| solid-parcel-starter | Starters, Build Utilities |  | Solid starter with Tailwind and Parcel | unknown (no npm package under that name) | https://gitlab.com/enom/solid-parcel-starter |
| solid-rollup-boilerplate | Starters, Build Utilities |  | Simple starter for Rollup + Solid. | unknown (no npm package under that name) | https://github.com/MrFoxPro/solid-rollup-boilerplate |
| solid-snowpack-starter | Starters, Build Utilities |  | Solid + snowpack + tailwindcss template You get HMR out of the box and full PWA compatible. | unknown (no npm package under that name) | https://github.com/amoutonbrady/solid-snowpack-starter |
| solid-starter-kit | Starters |  | Solid Starter Kit is an opinionated boilerplate with Supabase, Tailwind, TS and Prettier. | unknown (no npm package under that name) | https://github.com/one-aalam/solid-starter-kit |
| solid-typescript-rollup | Starters, Build Utilities |  | Solid and Rollup support starter. | unknown (no npm package under that name) | https://github.com/high1/solid-typescript-rollup |
| solid-typescript-starter | Starters, Build Utilities |  | Typescript start with Solid. | unknown (no npm package under that name) | https://github.com/high1/solid-typescript-starter |

#### Build Utilities (5 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| babel-plugin-reactivars-solid | Build Utilities |  | A Babel plugin that lets you use a Svelte like syntax with Solid (a React version is a WIP). | no: latest 0.0.4 (solid-js ^1.3) | https://github.com/orenelbaum/babel-plugin-reactivars-solid |
| chrome-extension-boilerplate-solid | Build Utilities |  | Chrome Extensions boilerplate with SolidJS | unknown (no npm package under that name) | https://github.com/jherr/chrome-extension-boilerplate-solid |
| meteor-solid | Build Utilities |  | A Meteor plugin for the Solid JSX compiler. | unknown (no npm package under that name) | https://github.com/edemaine/meteor-solid |
| vite-plugin-pages-solid | Build Utilities |  | A fork of vite-plugin-pages for Vue adapted for Solid. | unknown: latest 0.0.2 names no solid-js peer | https://github.com/aldy505/vite-plugin-pages-solid |
| vite-plugin-solid-markdown | Build Utilities, Plugins, UI |  | Compile Markdown to Solid component. | unknown: latest 0.0.7 names no solid-js peer | https://github.com/xbmlz/vite-plugin-solid-markdown |

#### Add Ons (7 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| reatom-solid | Add Ons, Data |  | Solid bindings for Reatom store. | no: latest 2.0.1 (solid-js ^1.0.0) | https://github.com/skrylnikov/reatom-solid |
| solid-copy-to-clipboard | Add Ons, UI |  | Copy to clipboard for Solid with custom event triggers. | no: latest 0.1.0 (solid-js ^1.4.7) | https://github.com/diragb/solid-copy-to-clipboard |
| solid-custom-navigation | Add Ons, UI |  | Custom navigations for Solid, written in Typescript. Implement custom page transition logic and ✨ animations ✨. | no: latest 0.2.0 (solid-js ^1.4.6) | https://github.com/diragb/solid-custom-navigation |
| solid-form-action | Add Ons, UI |  | This package provides a function that accepts a definition of the initial state of your form, its validation, and submission. | no: latest 0.3.0 (solid-js ^1.0.0) | https://github.com/mosheduminer/solid-form-action |
| solid-keep-alive | Add Ons, Primitives |  | Keep alive components even after unmount, prevent rerendering on remount | no: latest 0.2.4 (solid-js ^1.9.6) | https://github.com/JulianSoto/solid-keep-alive |
| solid-storeon | Add Ons, Data |  | A package that helps to connect store with Solid.js to provide a better performance and developer experience while remaining so tiny. | unknown (no npm package under that name) | https://github.com/storeon/solidjs |
| solid-test-recorder | Add Ons |  | Chrome extension to generate UI unit/integration tests. | unknown (no npm package under that name) | https://github.com/chris-czopp/solid-test-recorder |

#### Testing (1 listed first here)

| Name | Categories | Official | What it is | Solid 2 (npm, 2026-11-20) | URL |
| --- | --- | --- | --- | --- | --- |
| solid-jest | Testing | yes | This library contains presets for SolidJS to easily get started testing with Jest for both browser and server rendering with Node. | no: 0.2.0 (2022); 2.0 packages are ESM only, so its `.cjs` mapping has nothing to map (2.0 release notes) | https://github.com/solidjs/solid-jest |


## 3. Notable for a web-components framework

What in Solid 2 or around it touches custom elements, shadow DOM and their neighbours.

1. **Plain props on a dashed tag are attributes now.**
   - On a tag with a hyphen, Solid 2 `setAttribute`s a plain prop:  a string, `null` / `false` remove it, arrays and objects
     stringify.  Rich data needs `prop:x={...}`, and the server skips `prop:` bindings.
   - 1.x assigned some custom-element props as properties by itself (v1 docs:  "Solid can still assign some custom-element
     properties without `prop:*`") (inferred change).
   - https://docs.solidjs.com/guides/integrate-non-solid-code#web-components
2. **Events:  only `onXxx` binds, and the name is lowercased.**
   - `onDatechange` listens for `datechange`;  a hyphenated or mixed-case event name can't be written as a prop at all:
     listen from a ref directive (`addEventListener` with the exact name).
   - Delegated names (`click`, `input`) reach their handler only if the element dispatches them with `bubbles: true`.
   - `on:` / `oncapture:` are compile errors;  lowercase `onclick={fn}` is an attribute, with a dev warning.
   - https://docs.solidjs.com/guides/integrate-non-solid-code#web-components ;
     https://docs.solidjs.com/reference/solid-js/diagnostics/lowercase-event-attribute
3. **Delegation is per render root, and walks shadow roots.**
   - Each `render()` / `hydrate()` root owns its delegated listeners and disposes them with itself
     (1.x put them on the document);  a shadow root works as a render root.
   - The handler walks `composedPath()`, so handlers inside shadow roots fire;  it re-targets `target` to the shadow host as
     the walk leaves a shadow root (read from the 2.0.3 runtime, inferred intent).
   - `@solidjs/element` 2.0.0 registers custom elements' shadow render roots for delegation (adbdab3).
   - 2.0.2 replays events fired inside a shadow root before hydration ends (b884d6e).
   - The migration guide:  "Rendering into nested roots, `ShadowRoot` instances, or portals needs integration testing."
   - https://docs.solidjs.com/migration/from-solid-1#update-boundaries-control-flow-and-jsx
4. **`Element.moveBefore()` for list moves.**
   - Since rc.22 list reconciliation moves every connected node with `moveBefore()` where the browser has it, and no longer
     uses `replaceChild()`:  moved rows stay connected, so focus survives a reorder.
   - For custom elements (the DOM spec's behaviour, not Solid's docs;  inferred):
     a `moveBefore()` move calls `connectedMoveCallback()` when the element defines one, instead of a disconnect and a
     reconnect;  an element without it still gets `disconnectedCallback()` then `connectedCallback()`.
     So an element that tears down on disconnect can skip that on reorders by defining `connectedMoveCallback()`.
   - https://docs.solidjs.com/guides/lists ;  releases.md `@solidjs/web` rc.22 (b38d592)
5. **`<Portal>` lost `useShadow`, `isSVG` and its wrapper.**
   - 2.0's `Portal` takes `mount` and `children` only, inserts between text markers (no `<div>`), defaults to `document.body`,
     and tags its nodes with a host so delegated events retarget to where the portal sits in the tree.
   - Inside a shadow root, pass `mount` (Spell's rule already says so).
   - https://docs.solidjs.com/reference/solid-web/components/portal ;  https://v1.solidjs.com/reference/components/portal
6. **`@solidjs/element` is Solid 2's custom-element wrapper**, on `component-register` (`customElement`, `withSolid`,
   `noShadowDOM`, `getCurrentElement`, `hot`).
   - Context flows from a Solid host page into nested custom elements through owner markers on hosts and slots (2.0.0).
   - A second copy of Solid on the page:  owner adoption now falls back to an independent root with a warning instead of
     crashing in `connectedCallback` (2.0.0, ea636af).  Spell's rule "two copies on one page fail silently" (`solid-2.md`)
     is about Spell's own fork's `register()`;  worth re-checking against this (inferred).
   - Declared props are enumerable since 2.0.1.
   - https://www.npmjs.com/package/@solidjs/element ;  releases.md `@solidjs/element` 2.0.0, 2.0.1
7. **SSR of custom elements:  attributes only.**
   - The server writes attributes and skips `prop:` bindings;  properties are assigned when the browser renders or hydrates.
   - I found nothing on Declarative Shadow DOM (`shadowrootmode`) in the docs corpus or the release notes:  Solid's SSR does
     not render a custom element's shadow root (inferred from absence).
   - `<Portal>` renders nothing on the server;  `clientOnly()` defers a component to the browser.
8. **Typed `prop:*` and custom tags in JSX.**
   - Each element's writable DOM properties are typed as `prop:*` keys, derived from its interface.
   - A custom tag is declared by augmenting `"@solidjs/web"`'s `JSX.IntrinsicElements`, in a `.d.ts` that has `export {}`
     (without it the block REPLACES the package's types).
   - https://docs.solidjs.com/guides/typescript#custom-elements
9. **The renderer-neutral split.**  `solid-js` no longer holds any DOM code:  `@solidjs/web` is one renderer,
   `@solidjs/universal` builds others, `@solidjs/h` and `@solidjs/html` draw without a JSX compiler
   (`html` is CSP-safe now, no `eval`).
10. **A plug-in point for languages that compile to Solid.**  The Vite plugin's `frontends` option hands a file extension's
    modules to a `compile()` function, then runs Solid's lazy, refresh and server-function passes on the result;
    ReactiveScript (`.rx`) is built in, and TSRX (`.tsrx`) is a Solid-owned extension.  A `.spell` front end would fit the same
    slot (inferred).
    - https://docs.solidjs.com/reference/vite-plugin-solid/options
11. **Signals interop.**
    - No adapter for the TC39 Signals proposal ships with Solid 2:  the 2.0.0 announcement only cites the proposal as company
      ("you will find it in Angular, Svelte, Vue Vapor and a TC39 proposal").
    - The bridge for another reactive system is `enableExternalSource` (Spell's spell cells already use it);  `from()` takes
      RxJS and TC39 Observables.
    - Searched:  the whole docs corpus, the `@solidjs/signals` and `solid-js` READMEs and CHEATSHEET.
12. **Stores and class instances.**  `markRaw(Class)` (2.0.3) keeps every instance of a class out of store wrapping;
    prototype getters now run on the proxy (2.0.2).  Relevant to "NEVER put Things in a Solid store" (`solid-2.md`).
13. **Trusted Types.**  `setTrustedTypesPolicy()` (2.0.3) routes template markup through a policy, for pages with
    `require-trusted-types-for 'script'`.
14. **Component labels survive minification.**  The compiler's `componentNames` / `sourceNames` write `<Home>`-style owner
    labels and `file:line:col`, which every diagnostic and the devtools use.
15. **Ecosystem pieces that are custom-element libraries:**
    - LUME (and its `@lume/element`):  "Custom elements powered by Solid" (ecosystem page, Add Ons / UI);  still Solid 1.
    - `@solidjs/element`, above.  Nothing else on the ecosystem page is a custom-element framework (a title / description
      search for "element", "web component", "custom").

## 4. Open questions and what I couldn't verify

1. Solid 1's default for plain props on custom elements:  the v1 docs pages I reached (`prop:`, `attr:`) don't say it outright,
   so "1.x assigned some props as properties" rests on one sentence there plus Spell's rule file.
2. `@solidjs/meta`:  npm's `latest` is 2.0.0, but the docs' migration page calls the new version "Solid Meta 1.0".
3. `createReaction` and `enableExternalSource`:  marked "changed" from their 2.0 signatures;  I didn't open the 1.x pages
   to diff them.
4. `$RAW`, `$NODE`, `Assets`, `useAssets`, 1.x's signal option `internal`:  absent from 2.0.3's exports or types, so marked
   removed (inferred);  no doc says so.
5. TSRX:  only the release notes and one line in the Vite plugin reference mention it;  what Solid supports of it is unread.
6. `vite-env-schema`:  its README names `vite-env-schema@next`, but npm had no package by that name on 2026-11-20.
7. The ecosystem's Solid 2 column:  95 entries are "unknown" (open peer ranges, or no npm package under the entry's title);
   none of them were tried.
8. `solid-refresh` vs the Vite plugin's `refresh`:  I read `solid-js/refresh`'s declarations, not the plugin's source, so
   "built in" is inferred.
9. Declarative Shadow DOM:  absence of evidence only (section 3, point 7).
10. `moveBefore()` and `connectedMoveCallback()`:  the custom-element half is the DOM spec's behaviour, not something Solid
    documents.
11. Not reached:  the GitHub RFC discussions (Road to 2.0 #2425, beta #2596, RC #2995) and the TanStack / Kobalte changelogs;
    the docs and the package declarations covered what they would have.

## Sources, in one place

- Docs:  https://docs.solidjs.com/llms.txt , https://docs.solidjs.com/llms-small.txt , https://docs.solidjs.com/llms-full.txt
- Migration:  https://docs.solidjs.com/migration/from-solid-1 , https://docs.solidjs.com/migration/from-solid-start ,
  https://docs.solidjs.com/migration/from-solid-router , https://docs.solidjs.com/migration/from-solid-meta
- Site:  https://www.solidjs.com/ , https://www.solidjs.com/ecosystem
- Packages:  https://registry.npmjs.org (metadata and tarballs of every package named above), read statically
- Release notes:  https://github.com/solidjs/solid/releases (gathered in another session's `releases.md`, rc.22 to 2.0.3)
- GitHub:  https://github.com/solidjs (org repo list), https://github.com/solidjs-community/solid-primitives
- Solid 1 docs:  https://v1.solidjs.com/reference/components/portal , https://v1.solidjs.com/reference/jsx-attributes/prop ,
  https://v1.solidjs.com/reference/jsx-attributes/attr
- TSRX:  https://github.com/tsrx-org/tsrx
