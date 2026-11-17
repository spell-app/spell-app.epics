---
id: r73
epic: epic-engine
from: 🚧 codemirror (aa9a7982)
at: 2026-11-16T22:14-05:00
status: filed
filed: T89
images: image-1.jpg
---

## The person's words

test.spell.app on main is broken

## Context

From 🚧 codemirror: its agent added a dependency (@codemirror/lang-css, I20) and 'epic merge codemirror' fast-forwarded main, but main's checkout never ran yarn install, so main's editor (test.spell.app) failed: 'Failed to resolve import @codemirror/lang-css from FileStates.ts'. Fixed by hand: yarn install in ~/www/spell, then spell server stop all / start all (Vite had cached the failed resolve). Ask: epic merge should run the install command in the main checkout when the merge changed yarn.lock / a package.json, and restart the editor's Vite.
