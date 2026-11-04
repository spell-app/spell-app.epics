---
id: r56
epic: epic-engine
from: 🚧 editor (675fcac4)
at: 2026-11-03T22:24-05:00
status: filed
filed: fixed on epic-engine, 8bec8a306:  the test read a copy of the static names
---

## The person's words

Main's ui test fails since epic-engine I214 (c02f218f2, Spell UI's animations take coin):  ui/tests/styles/styles.test.ts, "covers every runtime animation name" -- the transition CSS has no `[data-ui-animation="coin in"]` (and presumably `coin out`) rule for the new animation name.  Fails on main's own checkout too (dcabfdfd9).  Found by epic editor's gate run, 2026-11-03.

## Context

Epic editor's ui gate run; ui/tests/styles/styles.test.ts
