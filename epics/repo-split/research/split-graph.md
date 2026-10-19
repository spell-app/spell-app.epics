# Repo split research:  the import graph (split-graph agent, 2026-10-19;  main 85efa25b9 + spell-epic)
Counts are import sites:  src / tool / test.

| pkg | deps (src/tool/test) | thin/deep |
| util | none by import;  BUT vite.packageVersion.ts imports packages/spell/src/node/packageVersion.node.ts (util's PACKAGE_VERSION = spell's version);  types/global.d.ts imports $/spell types | hidden util->spell link |
| parser | util 18/0/6 ($/util barrel, $/util/spell);  LibraryWriter writes the string @spell-app/core/model into generated code | medium;  core link only in generated code |
| markdown | parser 4/0/1 (util declared, unused) | thin |
| core | util 15/0/5 | medium |
| py | parser 3/0/1;  its Python tests read core.declarations.json5 | thin |
| spell | parser 229, util 198, core 3/0/25, py 3/0/6, spaces 0/0/5 (tests) | deep |
| spaces | spell 12/0/6, server 11 (SRV, RouteModule, one ../../../../server/src/checkout.ts climb), util 4, core/model 1, assembler/json5 1;  tests reach cli, lsp | medium |
| lsp | spell 9/0/6, parser 3, spaces 3/0/2, util 2, markdown 1, core.types 1 | medium |
| app | spell 21/0/7, lsp 13/0/4, core 10/0/3, ui 8/5/19, parser 7/0/5, util 8/0/6, spaces 5/2/3, spell-solid 5, markdown 2, assembler 0/2/1;  by path ../ui/src/core.ts, ../ui/test/setup.ts, ../ui/tools/RootCatalog.ts, ../spaces/.../routes/cli.ts, ../cli/bin/spell.mjs | deep |
| cli | spell 32/0/8, lsp 14, spaces/server 11, server 6, assembler 6, ui 6 ($/ui/tools/RootCatalog, StaticRenderer, $/ui/icons), core 2, parser 2, py 1, util 1;  tsconfig extends ../spell/tsconfig.json | deep |
| server | no package imports;  hardcoded paths: packages/ui/site/_assets, ui/docs, app/docs, brand/docs, spell-epic/src/docs, /_epic/ -> spell-epic/src/tools/_assets, packages/cli/bin/spell.mjs | leaf by imports only |
| assembler | no package imports;  src/format.ts imports the root vite.lint.ts;  BUNDLES names packages/ui/{src,components,vite.config.ts,site}, spell-solid/src, server/src/site, brand/* | leaf by imports only |
| spell-solid | util generic files 7 (re-exported whole);  tests -> ui 0/1/26 (../ui/test/setup.ts, tests' tsconfig points at ui) | thin in src, deep in tests |
| ui | spell-solid 19/4/75 (re-exports whole), util 5 (src/util/index.ts re-exports class, decorators, dom, string, util.types: 482 lines), assembler 0/7/4, server 0/3/1 (site bundle takes $/server/site, + StaticServer);  by path: cli (site-dev), brand docs (DesignBrand) | deep only on spell-solid |
| brand | ui 19/8/23 ($/ui/core, forms, icons, tools/SiteDataBuilder), spell-solid 18, server/site 1, assembler 0/1;  pack scripts run ../cli/bin/spell.mjs | deep on ui |
| vscode | no package imports;  at runtime starts packages/lsp/src/server.ts under the repo's tsx (REPO_ROOT baked into the bundle), loads packages/app/dist-runner and static;  build.mjs runs app's yarn build:runner, pins its version to spell's package.json | linked by path |
| spell-epic | server 39/0/32 (SRV: HttpError x63, FileOperations, FileLock, StaticHandler, Guard, PidFile;  $/server/page RouteModule x11, COMPONENT_SETS, SETS_BUNDLE), ui 37/1/89 ($/ui/core E/UI x21, docs-components types, PageOutline, EmojiData, MarkdownRenderer;  tests ElementFixture x31, expectAccessible x30), spell-solid 21 (E x20), assembler 6/1/2 (AS, DataFile, json5), util 0;  by path: brand (bundle-spell-ui.js builds ../brand vite.design.config.ts), spell-app's CLI (scripts/spell-app.mjs for pack build/check epics), packages/server/src/page/cli.ts (pages.js, EpicTools), spell-app's ui/vite.config.ts and ui/test/setup.ts in its vitest config | deep on server and ui;  util portal not needed directly |

Root files:  tsconfig.base.json (every package incl. vscode; cli via spell's tsconfig);  vite.lint.ts (every package);  vite.decorators.ts (vitest configs of app, cli, core, lsp, markdown, parser, py, spaces, spell, util; ui's vite.config);  vite.packageVersion.ts (same vitest configs except ui's);  types/ (app, cli, core, lsp, markdown, parser, py, spaces, spell, util).
Declared but unused:  app -> server (a script only), markdown -> util, py -> util.

## Generated cross-package artifacts
| Artifact | Built by | From | Committed? |
| ui/src/languages/spell.en.bundle.js (703 KB) + .d.ts + spell.en.ts | ui gen:spell (browserBundles.ts uses packages/spell/tsconfig.json) | spell src/highlight/browser.ts + parser + util + core | yes |
| ui/components/ui-markdown/md.bundle.js (267 KB) + MDBundle.ts | ui gen:markdown | markdown + parser + util | yes |
| core/core.declarations.json5 | core gen:declarations | core | yes;  read by py's Python tests, py/core/not_ported_yet.json5, spell's tests, cli's staleBecause |
| spell/spellSyntax.json | spell gen:syntax | spell | yes |
| spaces/@spell/** compiled projects (21 files) | spell compile (cli+spell+parser+py) | import @spell-app/core/model | yes |
| packages/ui/site/_assets (incl. sets/), packages/brand/_assets/ui | page server BundleBuild -> spell dev bundles build --stale -> assembler BUNDLES -> ui site:bundle, brand build | ui, spell-solid, util, server/site, brand | no (gitignored) |
| spell-epic/src/components/__pack/epics.*, brand/components/__pack | spell-app cli spell dev pack build ($/ui/tools/RootCatalog, ui vite.config) | each pack + ui | yes |
| app/dist-element (spell.pack.js), dist-runner, dist-page | app vite configs (via ../ui paths) | app + ui + spell | no;  served by spaces appRoutes, vscode, cli runInBrowser/runTarget |
| spell-epic/src/tools/_assets/spell-ui.js, lazy/{spell-en,markdown-engine,code-engine}.js | epic bundle-spell-ui.js (SPELL_UI_DIR = spell-app ui + brand's design build) | ui, spell-solid, util, brand, spell highlighter, markdown | yes, in epic |
| site data (docs/__data) | site:data in ui, brand, app, epic | $/ui/tools/SiteDataBuilder, $/assembler/json5 | yes |

## Runtime-by-path links
- root pageServer.routes: 10 spell-epic route modules (import only $/server, $/server/page) + spaces' appRoutes.ts;  run under spell-app's tsx + alias table ($/epics -> the spell-epic link).
- cli -> epic: passThrough.ts runs design bundle/check/sync from spell-epic/src/tools/*, server (packages/server/src/page/cli.ts), design build (packages/ui/scripts/design-build.ts), finds the epic binary (epicBin());  commandsCommand reads spell-epic/src/command/EpicProgram.ts and spell-epic/skills;  vscodeCommand runs yarn in packages/vscode, asks epic for the base branch.
- back-calls into the cli: spaces' ProjectBuild and server's BundleBuild spawn packages/cli/bin/spell.mjs.
- broken: epic's vscode/src/DocView.ts runs node packages/cli/bin/epic.mjs (doesn't exist) -> issue I25.

## Cross-boundary edges and cycles under Owen's proposal (unplaced packages assumed in spell-app)
- spell-parser -> spell-app: parser needs util's heavy half (util/spell, reactive: ~4.3k lines);  its vitest config and types/ reach spell (packageVersion.node.ts, $/spell types).  Would-be cycle unless util is split (generic -> spell-element, heavy -> spell-parser) and version injection decoupled.
- spell-element <-> spell-ui: ui -> spell-solid in src;  spell-solid's tests (26 sites, setup, tsconfig) -> ui.  Test-level cycle.  spell-element also needs util's generic files.
- spell-ui <-> spell-app: shipped @spell-app/ui carries bundles built from spell and markdown/parser, while app, cli, brand import ui.  Build-time cycle.  ui's tools also use assembler, server/site and the cli by path;  its DesignBrand reads brand's docs.
- spell-epic <-> spell-app: epic depends on ui, spell-element, server, assembler, brand by path, and on spell-app's cli for pack builds;  spell-app loads epic routes, server hardcodes epic paths, cli calls epic tools.  Runtime cycle;  worse if server and assembler stay in spell-app (epic's heaviest deps, and they name ui, brand, app paths).
- inside spell-app (fine together): cli <-> spaces, cli <-> app, server <-> cli, vscode -> lsp/app/spell, spell tests -> spaces.
- brand <-> ui <-> epic: brand imports ui deeply;  ui tools and epic's design bundle read brand by path.
Suggested low-cost moves:  server and assembler in their own repo or with epic, after making their path lists configurable;  gen:spell and gen:markdown on the producer side (ui takes in a published highlighter);  split util as above;  markdown with parser;  keep core, py, spell, spaces, lsp, cli, vscode together.
