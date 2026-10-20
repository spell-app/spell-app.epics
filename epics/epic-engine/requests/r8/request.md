---
id: r8
epic: epic-engine
from: 🚧 repo-split (8d334560)
at: 2026-10-20T11:29-04:00
status: filed
filed: P8 · Server Split Follow-up
phase: p-server-split-follow-up
---

## Owen's words

From epic repo-split (Owen approved sending this, 2026-10-20, modal: "Commit, send T4, start P5"):  spell-epic's follow-up once repo-split's P4 · Server Split (commit 58e842066, branch repo-split) is on spell-app's main.  Nothing breaks until then, and stand-ins keep the old names working after (COMPONENT_SETS, SITE_BUNDLE, SETS_BUNDLE, HIGHLIGHT_JS, start({ bundles })), marked REFACTOR in spell-app, deleted once spell-epic has switched.

P4:  spell-app's server package is generic;  the component sets and engine routes are settings (the root package.json's "pageServer": componentSets { id: { name, dir, assets } }, engineRoutes), read with componentSets() / engineRoutes() in packages/server/src/page/settings.ts;  the bundle builds moved to a new package, page-server, a route module on the generic server.

What spell-epic must change:
1. Read the sets with componentSets(pageServerSettings(checkout)) instead of COMPONENT_SETS, and each set's `assets` instead of SITE_BUNDLE / SETS_BUNDLE:  tools/index.js, check-spell.js, ServedFolders.ts, commentsRoutes.ts, EpicServer.ts;  tests EpicServer.test.ts, pages.test.js.
2. The commentsRoutes test's scratch checkout writes pageServer.componentSets in its package.json.
3. Stop passing `bundles: false` (AirplaneMode.test.ts).
4. Own HIGHLIGHT_JS (offline.ts, EpicServer's localHighlight()).
5. Start its own server without waiting for spell-app's:  run `spell dev bundles build --stale` through .spell-app's CLI (only page-server builds Epic UI's site bundle now).
6. Reach the server through its package entries instead of @spell-app/server/src/... file paths, once there's an entry plain node can load.
7. Fix docs naming COMPONENT_SETS or page.types.ts (src/AGENTS.md:533, docs/__parts/layout.html:6, comments).
Unchanged:  PageServer, RouteModule, PageEditor, pageServerSettings, the cli.ts path, prune.ts, checkout.ts, $/server/test, $/server/site.
Also:  P1 (already on this branch) moved json5 to util;  the assembler's DataFile now imports it by package path, so spell-epic's docs tools keep working;  spell-epic's own two imports of $/assembler/json5 should become $/util/node/json5 (repo-split T1), then spell-app drops that re-export.
Repo-split will say when P1-P4 land on main.

## Context

repo-split epic page, T4 and T1;  P4 committed on branch repo-split, not on main yet
