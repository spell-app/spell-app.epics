---
id: r45
epic: epic-engine
from: 🚧 debut (ad62dff0)
at: 2026-10-29T16:50-04:00
status: filed
filed: P54 · Stale Catalog Rebuild
phase: p-stale-catalog-rebuild
images: image-1.png
---

## Owen's words

can we make <ui-root> signal the page server somehow when something like that happens, so it can auto-regenerate?

## Context

From debut: after adding <ui-menu choose>, every page logged '[spell-ui] <ui-root>: <ui-docs-theme-bench> didn't load (failed): TypeError: <ui-menu>: its root's catalog is stale (no choose); regenerate it (yarn gen:root ...)' until debut ran yarn gen:root and epic's bundle-spell-ui.js by hand (debut I90). Owen wants <ui-root> to tell the page server about a stale catalog (or similar generated-file staleness) so the server regenerates it itself.
