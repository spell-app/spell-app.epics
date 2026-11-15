---
id: r70
epic: epic-engine
from: language-5d (6799a2ab)
at: 2026-11-15T13:46-05:00
status: filed
filed: fixed as I287:  a kit's page server runs that kit's own code
images: image-1.png
---

## The person's words

I broke solitaire  (main's editor showed {"error":"handler is not a function"} on every /api call)

## Context

From epic language. Main's page server (port 4747, root ~/www/spell) was running epic-engine's worktree code: pid 84014, started 13:42:49, 'node --import tsx /Users/owen/www/spell.worktrees/epic-engine/src/server/page/cli.ts serve --root /Users/owen/www/spell'. Its Router.ts (epic-engine's) with main's route modules answered every /api call 'TypeError: handler is not a function' (Router.ts:160, next()), see main's .spell-server.log. Restarting with main's own bin/spell.mjs fixed it. Looks like a worktree's CLI restarting main's server with its own code (like I282).
