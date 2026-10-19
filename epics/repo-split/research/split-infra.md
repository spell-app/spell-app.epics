# Repo split research:  infrastructure (split-infra agent, 2026-10-19)
SA = /Users/owen/www/spell-app/spell-app, SE = /Users/owen/www/spell-app/spell-epic.

## 1. util (SA/packages/util/src), three layers
- Generic (class.ts, decorators.ts, dom.ts, string.ts, util.types.ts), ~480 lines, no deps: @proto, @lazy, @once, kebabCase/camelCase, closestAcrossShadow.  Imported file by file only by ui (src/util/index.ts) and spell-solid (src/index.ts re-exports; Reactive.ts, UIComponent.tsx use).  parser uses proto (6 imports).
- Reactive (reactive/), ~1,370 lines, no lodash/Solid: cells, Schema, @prop/@state, bridgeSolid.  Used by core (getProp, setProp, Cell, schemaOf), app, cli (bridgeSolid), and util's own spell layer (Derivative.ts, Observable.ts, LoadableFile.ts import extend).  NOT by ui or spell-solid (spell-solid has its own Reactive.ts).
- Spell's own (spell/), ~2,900 lines: lodash wrappers, chalk, pluralize, Observable, Task/TaskList, Logger, $fetch/LoadableFile, prefs.  spell: 197 files;  parser: snakeCase, pluralize, Derivative, Assertable, Logger;  core/app: Observable, prefs;  spaces: $fetch, LoadableFile, getDier;  lsp: case helpers.
- spell-epic imports no $/util;  it portals util only because ui and spell-solid need it.
- util's tsconfig includes ../../types, whose global.d.ts refers to import("$/spell"): util's typecheck reaches into spell.
Options:  (a) generic -> spell-element (ui already gets them via spell-solid);  parser would then import spell-element for proto/camelCase (wrong direction) -> copy the ~5 helpers instead.  (b) tiny spell-util repo (generic + reactive), 3+ consumers each paying link costs.  Recommended:  generic -> spell-element;  reactive + spell/ -> spell-parser (parser and Derivative need both; app gets them from there);  copy 3-5 generic helpers the parser uses;  drop util as a package.

## 2. Server code
SA/packages/server, a leaf (node built-ins):
- Generic HTTP ~3,900 lines: WebServer, Router, StaticHandler, LiveReload/liveClient, PidFile, FileLock, FileOperations, Guard, ports, open, checkout, mainServer.
- page/: PageServer, BundleBuild, PageEditor, settings, prune, cli.
- site/: SiteHeader, favicon.
page/ is full of spell-app and spell-epic specifics: COMPONENT_SETS (page/page.types.ts:141) hardcodes packages/ui/docs, spell-epic/src/docs, packages/app/docs, packages/brand/docs;  SITE_BUNDLE/SETS_BUNDLE are ui's site build;  engineRoutePath() (PageServer.ts:533) maps /_epic/* to spell-epic/src/...;  BundleBuild runs spell's own CLI.
Users:  spell-epic uses the generic layer + pieces of page/ (EpicServer.ts imports SRV, PageEditor, pageServerSettings, SETS_BUNDLE, HIGHLIGHT_JS, RouteModule;  its tools import COMPONENT_SETS and checkout.ts by file path through the portal: SE/src/tools/index.js:63, check-spell.js:48, config/EpicConfig.ts:7).  spaces registers appRoutes.ts as a page-server route module (the app API; starts vite as a child, EditorServer.ts).  cli (serve.ts, serveCommand.ts, runTarget.ts), ui tools (StaticServer.ts, DockerBrowserServer.ts, site/ via $/server/site), brand use only generic SRV.  app has no server: vite dev server; app/vite.config.ts reaches into ../spaces/src/server/node/environment.ts for the proxy target.
Duplication today:  EpicServer is a second page server (4848 vs 4747) re-implementing content, writable folders, engine mounts on the same SRV parts;  EpicServer's Epic UI _assets/ come from spell-app's SETS_BUNDLE, built only by spell-app's page server (missing until it has run, EpicServer.ts:232);  spell-app's page server loads spell-epic's route modules (10 of 11 pageServer.routes) and serves /_epic/  =>  a runtime cycle (I21 a symptom).
Options:  split server (generic layer its own small lib repo, or into spell-epic, its heaviest user;  page/ to spell-app, without spell-epic paths, component sets + engine routes from config);  server goes with spell-epic (spell-app then depends on spell-epic for its own page server, reversing today);  keep in spell-app (today's cost: portal + file-path imports);  duplicate the generic layer (~3,900 lines in two places, fixes drift; I13 already seen).

## 3. assembler (Linker, formatHTML, Bundle, json5, DataFile, contentFolder; node-only, imports no package)
| Part | Users | Natural home |
| json5 | ui tools (7), app, spaces, brand, tests (6), spell-epic (3) | spell-app (or shared lib) |
| DataFile | cli (2), spell-epic (re-exported in SE/src/data/DataFile.ts, 17 importers) | spell-epic |
| contentFolder | cli (3: commands page, WWOD check) | spell-epic |
| Linker, formatHTML | spell-epic's docs tools (10, 14 uses) | spell-epic |
| Bundle | the page server's spell dev bundles | spell-app |

## 4. Shared toolchain:  what each repo needs a copy of (spell-epic already copies these)
- .yarnrc.yml catalog (vite-plus 1.0.0, vitest 5.0.1), "SAME versions as spell-app's catalog (bump the two together)".
- root resolutions: Solid rc.13 x4, vite, vitest, copied by hand into SE/package.json;  nmHoistingLimits: none in both (one Solid).  Pins already disagree inside spell-app: tsx 4.20.3 (server, assembler, spell-epic) vs ^4.23.15 (ui).
- vite.lint.patterns.ts identical in both;  vite.lint.ts a forked copy (62 diff lines; SE adds patternLintIn).
- types/app.d.ts identical;  SE skips global.d.ts (pulls in spell).
- tsconfig.base.json: SA's is the single alias table;  SE's is a second table pointing every $/ui, $/server ... through ./.spell-app/packages/...
Reached through the link (not copied): vite.decorators.ts only via ui's relative ../../vite.decorators.ts (why SE links the whole checkout, J13);  SE/vitest.config.ts imports ui's baseConfig and test/setup.ts from .spell-app;  vite.packageVersion.ts imports packages/spell/src/node/packageVersion.node.ts (spell-app-only; parser's and spell's vitest configs use it).
Per repo or missing:  .gitattributes + .epic/generators.json5 per repo;  CI:  SA/.github/workflows/review.yml + changed-packages.mjs, spell-epic has NO .github (can't run CI without a spell-app checkout beside it);  tests/<package>/ layout (each package's ts/lint reach ../../tests/<pkg>; moving a package moves its tests; SE flattened to tests/);  WWOD/agents shared content (agents link or CLAUDE.local.md; I24: links loaded WWOD as 14 plugin agents in SE).

## 5. How spell-epic consumes spell-app today, and the costs (the costs a wider split multiplies)
- Two links:  SE/.spell-app -> ../spell-app (portal: ui, server, assembler, util, spell-solid);  SA/spell-epic -> ../spell-epic per checkout ($/epics aliases, pageServer routes, COMPONENT_SETS, /_epic).
- SE borrows SA's CLI for its pack build (SE/scripts/spell-app.mjs, a REFACTOR note); SA's packBuild.ts taught SE's root layout (J44).
- SE commits a 2.3 MB copy of Spell UI (src/tools/_assets/spell-ui.js) built from SA's ui: stale whenever ui changes (Q5 option B).
- Recorded costs (epic-eject page):  two copies and drift (J32 froze SA's copies; J43: 35 files identical in both repos, 51 differ; T12 catch-up);  stale generated pack (I12, I15, J78);  link points at the wrong checkout (J13, I16, I20);  link and PATH upkeep (I6, I18, I24, I2);  cycle: SA runs SE's routes, SE runs SA's server, CLI and bundles (I21).
- A wider split multiplies each per pair of repos.

## 6. Ways for one repo to consume another
- portal:/link: via a sibling link (as SE does):  live source, no publishing;  costs: second alias table, hand-synced catalog/resolutions, Solid duplication risk, no CI, "which checkout?" bugs (J13, I16), deep .ts path imports (@spell-app/server/src/page/page.types.ts).
- npm publish (@spell-app/*), the release plan (Q5):  every package but ui and cli is "private": true at 0.0.0 shipping raw .ts (tsx / aliases): needs builds, exports, version bumps, a publish per cross-repo change.  ui already has files/exports and a build.
- git submodules:  unused here;  pin a commit (fixes "which checkout"), but every worktree needs submodule init + install;  alias problem stays.
- a yarn workspace across sibling folders:  Yarn 4 requires workspaces under the project root (SE's vscode/ is a separate yarn project for that reason) -> a parent folder as root = a meta repo.
- a meta repo (parent package.json whose workspaces are the sibling repos):  one lockfile, catalog, Solid, alias table;  costs: worktrees are per repo not per meta repo; clashes with each repo's .yarnrc.yml (SA's nmHoistingLimits comment already guards against a parent config leaking in).

## Summary
Streams cross in two places:  server (SE's paths baked into page/; EpicServer depends on SA's built bundle) and util (spell's heavy layer + generic helpers in one package).  Cleanest cuts:  generic util -> spell-element; reactive + spell util -> parser;  Linker, DataFile, contentFolder -> spell-epic;  json5 and Bundle -> spell-app;  generic server layer as one small lib, or into spell-epic, with page/ made configurable in spell-app.  Every new repo boundary repeats §5's costs unless published to npm or held by a meta root.
