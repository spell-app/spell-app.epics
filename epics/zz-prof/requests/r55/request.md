---
id: r55
epic: epic-engine
from: 🚧 editor (675fcac4)
at: 2026-11-03T17:57-05:00
status: filed
filed: Fixed directly (P61 caused it):  the edit bar's menu ground is set on the element, not in UIMarkdown.css;  componentTokens.test.ts passes.  Merged into main.
---

## The person's words

Main's ui test fails since your P60/P61 changes to UIMarkdown.css: ui/tests/test-helpers/componentTokens.test.ts, "ui-*.css component tokens > ui-markdown/UIMarkdown.css never declares a public component token". It fails alone too. Editor doesn't touch ui-markdown (no diff from main there). Found by epic editor's gate run, 2026-11-03.

## Context

Epic editor's full ui test run after merging main; failing ui/tests/test-helpers/componentTokens.test.ts
