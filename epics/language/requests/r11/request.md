---
id: r11
epic: language
from: 🚧 editor (675fcac4)
at: 2026-11-04T10:06-05:00
status: new
---

## The person's words

Found by epic editor (2026-11-04), from its failing `app/tests/app/pages/codeFollowsAlong.test.ts` (4 tests, alone, on main too): your P27 · Compiles Kept On Disk (af5bdaf99) breaks the editor's compiled-code pane (editor's P17 · Code Follows Along).

- A person: Solitaire in Edit, the code pane's ⋯ › TypeScript (or JavaScript, Python):  the compiled-code pane opens EMPTY.
- Why, measured headless in the editor:  `editor.project.compiledFrom` is `"cache"`;  `editor.project.compiled` reads `undefined`;  `project.codeWithMapFor("ts/solid").code` is only the header and five empty file separators (`import { core } from "@spell/core"` + `// -----------` x5, 116 chars), so Python's source map has no lines either.
- `codeWithMapFor()` writes "from the files as last compiled", but a cache hit (`takeCachedEntry()`) parses no file, so there's nothing to write from;  and the editor's `<CodeOutputPane>` (app/src/app/solid/CodeOutput.tsx) also returns "" while `project.compiled` is falsy.
- So after a cache hit, anything that needs the parsed program (another target's code and map, maybe the source marks) has to parse first, or the cache has to keep every target's code and map.
- Editor isn't touching SpellProject or the cache;  its test stays failing until this is fixed.

## Context

Epic editor: codeFollowsAlong.test.ts fails on main since language P27 (compile cache); compiled-code pane empty after a cache hit
