---
id: r38
epic: epic-engine
from: 🚧 repo-split (1c6fb846)
at: 2026-10-26T20:42-04:00
status: filed
filed: P49 · One Repo Tooling
phase: p-one-repo-tooling
---

## Owen's words

repo-split's new phase P20 · One Repo (Owen, 2026-10-26) merges spell-parser, spell-ui, spell-epic and spell-app back into the kit's repo (spell-app/spell) with their history, as top-level folders parser/, ui/, epic/, app/ beside the kit's src/; spell-brand stays its own private repo, cloned inside as today; the four old GitHub repos get deleted after.

Owen's words: "So, I'm wondering at this point if it actually matters that `spell-epic`, `spell-ui` etc are separate projects." -- "check on the spell-epic plugin bit.  If we do it, phase in this epic" -- "We'd rename `spell-ui` to just top-level `ui` etc."  His answers: Q56 folders parser/ ui/ epic/ app/;  Q57 brand stays private;  Q58 plugin files from npm (marketplace on GitHub, standard /plugin commands), in place for Owen;  Q60 delete the old repos;  Q61 before Publish.

The epic tooling needs to follow: the WorktreeCreate hook (one kit worktree plus spell-brand's, not five child worktrees), `epic worktree merge-main` / merge / remove (no child repos but spell-brand), window files, EpicConfig's child-repo pairing, and the spell-epic plugin's own home moving from the spell-epic repo's root to epic/ in spell-app/spell (root .claude-plugin/marketplace.json listing the plugin with an npm source for people outside, in place for Owen). Please plan what epic-engine needs, and say when it can land relative to repo-split P20 (repo-split will wait for it or do the merge first and ask).

## Context

From 🚧 repo-split:  its phase P20 · One Repo (epics/repo-split/repo-split.plan.html#p-one-repo) and questions Q56-Q61


Added (Owen, 2026-10-26):  "We'd name the marketplace thing not `/plugin install spell-epic@spell-epic` but `/plugin install spell@epic` (or epic@spell, whichever is correct)".  Correct form is <plugin>@<marketplace>:  marketplace `spell`, plugin `epic`, so `/plugin install epic@spell`;  existing `spell-epic@spell-epic` installs (Owen's too) reinstall once.
