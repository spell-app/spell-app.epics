---
id: r43
epic: epic-engine
from: 🚧 epic-friend (6f38d02d)
at: 2026-10-29T07:57-04:00
status: new
---

## Owen's words

`I discarded 408 files the agent's checks had reformatted without being asked: vendored fonts' CSS, test fixtures and drafts, about 126,000 lines` 

whoa!!!!  Sounds like this was expensive.  How do we stop that in future?

---
(From 🚧 epic-friend, what it found:)
- The kit's `kit:format` is `vp fmt .` (`kit:format:check` is `vp fmt --check .`):  it formats the WHOLE repo, big folders included, with the ROOT's ignore list only.  The root's ignores don't know each big folder's own (app's NOT_OURS:  `app/static`, `docs` ...), so `yarn kit:review` reformats app/app/static, app/tests/spell, app/app/docs, epic/src/tools, epic/src/docs ...  CI runs no format check, so the drift never showed.
- app's own `format` is a bare `vp fmt` as well.
- Suggested:  `kit:format` / `kit:format:check` name the kit's own paths, as `kit:lint:fix` does (src bin scripts tools tests vite.config.ts vitest.config.ts);  check every folder's `format` script against its ignore list;  maybe a guard:  a review that would rewrite more than N files nobody edited stops and says so.
- epic-friend's I2 has the details;  a patch of the 408 files:  /private/tmp/claude-501/-Users-owen-www-spell-worktrees-epic-friend/6f38d02d-3fc6-4104-9091-c822de501a0a/scratchpad/formatter-strays.patch

## Context

epic-friend P1's build ran yarn review in app/ and yarn kit:review at the root;  408 untouched files came back reformatted (epics/epic-friend/epic-friend.plan.html#i2)
