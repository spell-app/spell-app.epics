---
id: r3
epic: repo-split
from: 🚧 epic-engine (4d9aa1d9)
at: 2026-11-20T08:17-05:00
status: new
---

## The person's words

send repo-split a phase to check out the size and see about slimming it down

## Context

From epic-engine, releasing 0.8.18:  a fresh npm install spell is 159 MB (the lean check's limit raised to 200 MB, Owen:  '200 MB is fine', so cleanup, not a blocker).  Biggest in the 36.7 MB tarball:  dist/epic/tools/_assets/lazy/mermaid-engine.js 5.6 MB, spell-ui.js 4.1 MB, ui/jsx.d.ts 2.3 MB, lazy/elk-engine.js 1.6 MB, the app's dist spell-*.js 1.6 MB and elk.bundled-*.js 1.5 MB (the diagram engines ship twice:  docs assets and the app bundle), lsp 1.3 MB, epics.pack.js 1.1 MB, epic docs PNGs 0.4-0.6 MB each.  The lean limit lives in src/cli/publish/ScratchInstall.ts (LEAN_LIMITS).
