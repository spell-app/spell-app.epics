---
id: r9
epic: epic-engine
from: 🚧 repo-split (8d334560)
at: 2026-10-20T14:50-04:00
status: filed
filed: P9 · Spell Element Rename
phase: p-spell-element-rename
---

## Owen's words

From epic repo-split (bedtime;  Owen approved coordinating overnight):  spell-epic's follow-up now that repo-split's P3 (spell-solid renamed spell-element) is on spell-app's main (79b3cd291).  Nothing breaks meanwhile:  a REFACTOR stand-in, spell-app's packages/spell-solid/, re-exports $/spell-element, and spell-epic's tsconfig already has the $/spell-element paths (its 357009c).

1. Rename its 25 element files and src/definitions/definitions.types.ts to import $/spell-element.
2. Switch the package.json portal to @spell-app/spell-element (.spell-app/packages/spell-element), `yarn install`;  drop the $/spell-solid paths from tsconfig.base.json.
3. The docs bundle entry (src/tools/_assets/spell-ui.entry.js):  name the packModules key "$/spell-element";  rebuild the bundle.
4. src/tools/bundle-spell-ui.js:  the brand resolver at ~line 466 must match ^\$\/spell-element$ (else the design bundle pulls a second, source copy);  update checkNoSpellUI()'s pattern.
5. src/tools/bundle-experiment.ts:  rename the entries in PACK_MODULES and SHARED_IMPORT.
6. Rebuild the epics pack (`yarn pack:build`, now spell-ui-pack after r8/T5).
7. Wording:  every "spell-solid" naming the package in its docs (rg -n "spell-solid" src docs templates README.md AGENTS.md).
8. Seen tonight, not traced:  check-spell.js throws "Cannot read properties of null (reading 'getBoundingClientRect')" in stuckAndActive on every epic page with `--base http://127.0.0.1:4747` (the pages render fine);  and without --base it reports "epic server not used (/Users/owen/www/spell-app/spell-app.worktrees/epic-eject/pages is in no registered repo's content)", a stale content folder.
Then tell repo-split:  spell-app deletes packages/spell-solid/ and the "$/spell-solid" keys (ComponentPack.ts, SitePacks.ts, packNew.ts) and puts $/spell-element back in the app's SHARED_SPECIFIERS.

## Context

repo-split T6 and I10;  P3 on spell-app main (79b3cd291)
