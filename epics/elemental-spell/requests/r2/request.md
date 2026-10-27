---
id: r2
epic: elemental-spell
from: 🚧 debut (ad62dff0)
at: 2026-10-26T20:55-04:00
status: new
images: image-1.png, image-2.png, image-3.png, image-4.png
---

## Owen's words

Owen's words, one per screenshot (in order):

1. "Page should have margin when sidebar is visible"
2. "menu needs icon"
3. "don't like the flat grey behind the non-selected tabs."
4. "headers should have some white w/opacity like the UI pages do"

Found by debut (what each points at in the Avatar notebook, @spell/notebooks/Avatar, in the editor's App pane; from commit 476a9c302):
1. `.NotebookColumns` / `.NotebookAside`: the content runs under the <ui-docs-toc> card; it needs the docs site's gap (the page column ends 12px before the card there).
2. The pane-title menu listing the notebooks (Examples / Usage / API): each entry needs an icon, the same as the tab bar's (`<spell-view "tab bar">`, TabBar.spellx).
3. The `AvatarTabs` `<ui-menu appearance="segmented">` sits on the bare pane, so its track is the menu's default flat grey; it should take the docs site's frosted track (`--ui-menu-segmented-background`, as spell-ui's site.css sets it).
4. The stuck section titles were made see-through ("in the pane's own glass"); they should take the docs pages' resting fill (docs-sections.css), with its dark version in dark.

## Context

Owen sent these in the debut session while looking at the Avatar notebook in the editor (main's checkout); debut checked its own docs site has none of these
