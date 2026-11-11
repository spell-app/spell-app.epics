---
id: r65
epic: epic-engine
from: 🚧 language (4dd38c2f)
at: 2026-11-10T23:46-05:00
status: new
---

## The person's words

Owen: "why is bubbly.css not auto-formatting on save" ... "fix vscode settings here"

(Owen picked "Send to epic-engine" for the part below, which the language session found while fixing that.)

The kit's own files don't format on save in an epic's window (seen in ⎇ language):
- The window's first folder is the worktree's root, which has no `.vscode/settings.json`.
- Only `app/.vscode/settings.json` and `ui/.vscode/settings.json` pin oxfmt (`oxc.oxc-vscode`) with `editor.formatOnSave`,
  and VS Code reads a folder's settings only when that folder is itself a workspace folder.
- So `src/**/*.ts`, `app/**`, `ui/**` ... fall back to Owen's user settings, which name Prettier (`esbenp.prettier-vscode`),
  not installed:  nothing formats.
- Fix:  a root `.vscode/settings.json` in the kit (the app one's formatter block), or the same settings in the window files
  `epic window init` writes.

Done in the language session already, for the epic repo folder only:
- `spell.epics/.vscode/settings.json`:  `[css]` pinned to `oxc.oxc-vscode`, format on save
- `spell.epics/.oxfmtrc.json`:  the kit's `fmtConfig` values (no semicolons, double quotes, no trailing commas, 120 wide)

## Context

From epic language's session (worktree ⎇ language), fixing format-on-save for spell.epics/epics/language/details/bubbly.css
