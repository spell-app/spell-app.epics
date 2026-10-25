---
id: r7
epic: epic-engine
from: 🚧 repo-split (8d334560)
at: 2026-10-20T02:13-04:00
status: filed
filed: P7 · Spell Out of Spell UI
phase: p-spell-out-of-spell-ui
---

## Owen's words

From epic repo-split (Owen approved sending this, 2026-10-20, modal: "send T2 to epic-engine"):  spell-epic's follow-up once repo-split's P2 (commit 16f85e1a1, branch repo-split) is on spell-app's main.  P2 takes everything spell out of Spell UI:  the committed spell highlighter (packages/ui/src/languages/spell.en.bundle.js), SpellLanguage, md.bundle.js, MDBundle, MDEngine, MarkdownRenderer.mdLoader / loadMD().  <spell-code> and <spell-markdown> now live in spell-app's app package, and spell-app's page server adds /element/spell-language.js to the pages it serves ("pageScripts" in the root package.json), so guides and epic pages stay coloured there.

What spell-epic must change, once P2 is on main (until then nothing breaks;  after, the next Spell UI bundle build fails at step 1):
1. bundle-spell-ui.js:  drop the `spell-en` LAZY entry (it reads ui's src/languages/spell.en.bundle.js, gone), the `SpellLanguage.bundleLoader` hook and `SpellLanguage` in lazyModule()'s import;  delete _assets/lazy/spell-en.js;  fix the header comment.  MarkdownRenderer's engineLoader / sanitizerLoader hooks are unchanged.
2. spell-ui.entry.js's packModules:  add "$/ui/components/ui-code" and "$/ui/components/ui-markdown" (import * as, from @spell-app/ui/ui-code / ui-markdown), so the app's <spell-code> / <spell-markdown> can run on epic pages;  then spell-app's pageScripts can name spell-code.js too.
3. check-spell.js:  `a.querySelector("pre, ui-code, spell-code")` (repo-split I1).
4. check-design-bundle.js:  drop its check that language="spell" is coloured in the Design bundle.
5. The markdown guide's <ui-markdown editable> demo now previews with marked:  <spell-markdown editable> keeps spell's engine.
6. On spell-epic's own server (4848) spell code shows plain (accepted:  repo-split Q23 A).
Repo-split will say when P2 lands on main.

## Context

repo-split epic page, T2 (epics/repo-split/repo-split.plan.html#c24);  P2 committed on branch repo-split, not on main yet
