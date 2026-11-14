---
id: r69
epic: epic-engine
from: 🚧 editor (5de24f81)
at: 2026-11-14T17:30-05:00
status: new
---

## The person's words

send the  worktree running problem to epic-engine

---
The problem (from epic editor's session, not Owen's words):
- A worktree's page server started with the `spell` on the PATH (`spell server start all`) runs the MAIN checkout's CLI.
- It then answers every `/api` request with 500 "handler is not a function":  its stack mixes main's `Router.ts` with the worktree's route modules.
- Workaround:  stop it, and start from the worktree with its own `node bin/spell.mjs server start all`.
- Hit again today (2026-11-14) by epic editor's agent working I135;  already in PAPERCUTS.md under "## server" twice (search "handler is not a function").

## Context

From epic editor's session (worktree editor):  an agent hit this restarting the worktree's servers while fixing I135;  the papercuts log's ## server section has the earlier two.
