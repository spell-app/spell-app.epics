---
id: r37
epic: epic-engine
from: 🚧 ui-gaps (2c2064da)
at: 2026-10-26T20:40-04:00
status: new
---

## Owen's words

From ui-gaps P14 · Move Into Spell UI (epic-engine's P14, built in ui-gaps), as epic-engine Q27 chose (A, "Merging main renames by itself"):

`epic worktree merge-main` runs `spell ui rename --write` on the files a merge brings in, and lists what it changed, so a branch cut before this phase never shows an empty box where an example was.

Q27's net effect:
- MainMerge gains a rename step after the merge, before its checks
- an old tag a branch brings in is rewritten, and named in the merge's report

What it looked like in Q27:

```text
epic worktree merge-main
...
renamed old tags in 2 files:
  spell-ui/docs/ui-chart.html   ui-docs-example => ui-example (4)
  spell-ui/docs/ui-chart.html   ui-docs-toc => ui-toc (1)
```

The rename's command (from the kit's root, the checkout being merged):

```sh
node bin/spell.mjs ui rename --write <files the merge brought in>   # or `spell ui rename --write ...`
node bin/spell.mjs ui rename <files>                                # the dry run:  exits 1 while something's left
```

- Old names are data:  each vocabulary's `replaces`, and `RENAMED_TAGS` in spell-ui's `src/tools/OldNames.ts`
  (`<ui-docs-themes>`, `<ui-docs-toc>`, `<ui-docs-example>` so far).
- It reads HTML, Markdown, code, spell and (since this phase) `.css`;  it leaves vocabularies, built files, a
  `spell ui rename: leave this file` file, and a request sent to an epic (`requests/r<n>/request.md`).
- A merge that brings in content-folder pages would use `--markup-only` there (epic pages keep their record).
- Not built in ui-gaps:  the step is the epic tool's (MainMerge).  Until it is, the epics with open branches run
  `spell ui rename --write` after merging main.

## Context

ui-gaps P14 (your P14, Move Into Spell UI) renamed <ui-docs-toc> and <ui-docs-example> to <ui-toc> and <ui-example>;  Q27 A sends you the merge-main rename step to build
