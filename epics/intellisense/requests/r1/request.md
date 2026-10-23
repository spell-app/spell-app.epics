---
id: r1
epic: intellisense
from: 🚧 epic-engine
at: 2026-10-23T00:11-04:00
status: filed
filed: P8 · Read-Only Projects
phase: p-read-only-projects
---

## Owen's words

Spell's language server writes a __project.json5 into any folder of loose .spell files it opens:  it kept rewriting docs/drafts/card-example/__project.json5 in the kit's main checkout (and repo-split's worktree), so main looked dirty and other sessions' merges refused (Owen, 2026-10-23:  'urgent: something is continually writing docs/drafts/card-example/__project.json5 which is messing up merging in other sessions').  The server should never write a project file into a folder that has none -- the CLI already refuses to (resolveProject.ts:  'loading it would WRITE a project file there').

## Context

Found by epic-engine:  SpellDiskWorkspace.fileFor() -> locationForDiskPath() (disk-fetch.ts) falls back to the file's own folder when no project file is above it (findProjectDir);  parseOnce() loads that project's index through projectUtils.getIndex(), whose imports sync saves the project file (project-utils.ts ~393);  deleted, diskChanged() refreshes the project and getIndex() writes it again.  Stopgap on main:  the kit's .gitignore ignores /docs/**/__project.json5 (9334360).  Likely fix:  a read-only index for the language server (no saveProjectFile when the folder had no project file).
