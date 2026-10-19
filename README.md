# spell-app.epics

Shared content for `spell-app` (epic `shared-content`;  `spell-app-dev` until epic `epic-eject` P8):  its epic pages,
sagas, guides, pages, brand pages and the agents' logs, one copy for every checkout.

- Content only:  the epic tooling, spell-epic, reads and writes it here, never through a link (epic `epic-eject` P12).
- Every checkout of `spell-app` (main and each worktree) links in only what its `.epic/config.json5` names
  (`sharedFolders`:  `agents`).
- Every Claude Code turn commits here by itself (`epic shared commit`).
