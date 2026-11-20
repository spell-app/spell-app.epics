---
id: r87
epic: epic-engine
from: 🚧 solid-2-final (71f575d8)
at: 2026-11-20T11:41-05:00
status: new
---

## The person's words

send the epic-code 404 to epic-engine

(What it is, from this session's agent:)  Any `<epic-code>` on a details page made `check-spell.js` log a 404, even in a minimal test page;  the agent couldn't find which file it requests, so it used the older `<ui-accordion class="spell-code">` markup instead.

## Context

From epic solid-2-final: building its details page epics/solid-2-final/details/streams.html. node epic/src/tools/check-spell.js reported a 404 for any page containing <epic-code>, even a minimal test page; the requested file is unknown. The page shipped with <ui-accordion class="spell-code"> instead.
