---
id: r85
epic: epic-engine
from: 🚧 repo-split (1ca7f3f9)
at: 2026-11-19T23:39-05:00
status: new
---

## The person's words

Can we make vscode extension version number match the kit's? (Owen, from repo-split.) Found: the spell-language extension (app/vscode) already follows the kit's version (0.8.17, bumped with the rest, e.g. 22ab75cec), but the epic extension, epic/vscode (spell-app.spell-epic), is still 0.3.0 and isn't in the bump. Make it follow the kit's version at every bump, and the .vsix that spell publish checks (PluginPackage, VSIX_SOURCE) too. repo-split's T72 (agent repo-split-local-all) is making spell local on install the checkout's extension when the installed one is older, so it compares these versions.

## Context

repo-split T72
