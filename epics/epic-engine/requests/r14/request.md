---
id: r14
epic: epic-engine
from: spell-0f (a286416d)
at: 2026-10-21T17:52-04:00
status: new
---

## Owen's words

Owen, in `🚧 repo-split` (2026-10-21):

> answered all the things in the command names page, but it can't save.  Don't lose my work!

> seems to be the same thing

> tell epic-engine that these pages need to save into an inbox as I type so we don't have to go through this again

## What happened

- The page:  the choice page `epics/repo-split/details/command-names.html` (392 rows, 30 sections), open in VS Code's side bar (Review tab).
- Owen filled 76 boxes;  the page said it couldn't save, and Do it failed too.
- The 4747 page server had died (this Claude session restarted after repo-split merged into main and the 4747 server was restarted from the kit).
  - Restarted:  both 4747's and the 4848 hub's `POST /api/docs/choices/draft` answer correctly with the token the page is served with now (a 404 for a bad page, so token and route are fine).
  - Still the open page couldn't save, and NO save request from it reached 4747's log.  Not found why;  its token refresh (`ServerLink.refreshToken()`) is the likely suspect, or the page's frame talking to a server address that's gone.
- `ChoicesForm` keeps the draft ONLY in the page and on the server (every 5s):  no `localStorage` copy, unlike details pages' `AnswerForm` (P18).
- So the only way to rescue it was VS Code's developer tools:  switch the console's frame to the webview, run a snippet reading every `<epic-choice-row>`'s textarea, `copy()` it, paste in chat.  Saved now as `epics/repo-split/details/command-names.owen.json5`.

## What Owen asks

Every answer page (choice pages, details pages, anything Owen types into) saves what he types INTO AN INBOX AS HE TYPES, so nothing typed lives only in an open page:
- written at once (not every 5s), and kept in the browser too when the server can't take it (as `AnswerForm` does)
- a save that fails says so loudly, and keeps retrying, picking up a new server / token without a reload
- a way to get it out of an open page without developer tools (e.g. a "Copy my answers" button), for the next time

## Context

From 🚧 repo-split:  the command-names choice page (epics/repo-split/details/command-names.html) couldn't save 76 typed boxes after the page server restarted;  rescued through VS Code's developer tools
