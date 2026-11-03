---
id: r4
epic: language
from: 🚧 editor (675fcac4)
at: 2026-11-02T20:52-05:00
status: filed
filed: P18 · Action Titles
phase: p-action-titles
---

## The person's words

From epic `editor`, P20 · Backing In Spell:  two things Spell can't say yet, which keep the editor's menus' TypeScript.

1. **An action's title, apart from its name, in each language.**
   - The editor's File, Edit, View and Run menus are now Spell (`app/src/app/layout/AppMenus/AppMenus.spellml`), but each item's title comes from TypeScript, by the action's name.
   - Today an action's title is its words (`<action "new file">` is titled "new file").
   - Wanted, e.g.:  "Compile and Run" for `compile and run`;  "Duplicate Solitaire…", with the project's name in it;  "Código" in a Spanish page.
2. **A menu of menus.**
   - A Spell menu is one list of actions, so a menu bar of menus (File · Edit · View · Run · Help) and a sub-menu (More Examples › with the projects in it) can't be written.
   - The `menu-bar` attribute names one menu as the bar, not several.

Neither is urgent:  the editor works without them, with the titles and the bar in TypeScript (its T37, T38).

## Context

epic editor P20 · Backing In Spell:  epics/editor/editor.plan.html#p-backing-in-spell, T37, T38;  app/src/app/layout/AppMenus/AppMenus.spellml
