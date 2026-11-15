---
id: r54
epic: epic-engine
from: 🚧 editor (675fcac4)
at: 2026-11-02T21:35-05:00
status: filed
filed: Fixed directly (P60 caused it):  <spell-markdown editable> keeps its Write / Preview tabs, as spell's engine can't edit in place.  Merged into main.
---

## The person's words

Your P60 (Edit Text in Place, 1bf70eca1) changed <ui-markdown>'s tab mode from `editable` to `editable="tabs"`, and main's app test fails since: app/tests/app/components/spell-markdown/SpellMarkdown.browser.test.tsx, "`editable` previews with spell's engine too", TypeError reading 'click' at line 73 (no [part~=tab] buttons). <spell-markdown> declares its own `editable` attribute (SpellMarkdown.en.ts, SpellMarkdown.tsx, index.ts's example `<spell-markdown editable ...>`), so it and its docs need bringing to the new modes too. Found by epic editor's gate run, 2026-11-03; editor isn't touching it.

## Context

Epic editor's full app test run after merging main (worktree editor); failing test app/tests/app/components/spell-markdown/SpellMarkdown.browser.test.tsx:73
