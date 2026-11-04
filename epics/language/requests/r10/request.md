---
id: r10
epic: language
from: 🚧 editor (675fcac4)
at: 2026-11-03T22:24-05:00
status: filed
filed: fixed directly, e367f89bf, merged into main
---

## The person's words

Main's ui test fails since language P24 (2b7fb21a4, Units the Person Reads) added `ui/src/components/ui-dimension/`:  ui/tests/tools/PackageExports.test.ts, "every folder barrel has its own key in the kit's, `./ui/...`, pointing at its index.ts" -- missing `src/components/ui-dimension/index.ts`.  The kit's package.json `exports` needs its `./ui/components/ui-dimension` key.  Fails on main's own checkout too (dcabfdfd9).  Found by epic editor's gate run, 2026-11-03.

## Context

Epic editor's ui gate run; ui/tests/tools/PackageExports.test.ts
