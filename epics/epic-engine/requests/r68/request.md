---
id: r68
epic: epic-engine
from: 🚧 editor (5de24f81)
at: 2026-11-14T01:29-05:00
status: new
---

## The person's words

(follow-up to r66, from 🚧 editor:  test.spell.app went down twice today when main's page server restarted)

## Context

From 🚧 editor:  after epic merge restarted main's page server (new port each time:  55797, 58481 ...), test.spell.app answered nothing:  Caddy (~/.spell/local-site) had stopped though run.json5 still named its pid, and main's editor (vite, --strictPort 3001) failed 'Port 3001 is already in use' because the old vite hadn't exited yet;  the language worktree's server had taken 4747 and 3000.  Fixed by hand each time:  spell space local stop, spell server stop, wait for 3001 to free, spell server start all.  Wants:  the restart waits for the old editor to exit, and the local site checks its Caddy is really alive (Owen's standing rule r66).
