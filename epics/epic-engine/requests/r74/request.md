---
id: r74
epic: epic-engine
from: 🚧 language (89f0bef2)
at: 2026-11-16T23:50-05:00
status: filed
filed: T90
---

## The person's words

this is taking too long!!!  Do we need to cut down on tests?

(Asked how, Owen picked:)  Run targeted tests, then full unit tests before merging.  After merging, other no other agents are running, run the full test suite -- the last agent standing will catch the full suite.

## Context

From 🚧 language: its agents each ran full parser/app suites per commit (10-25 min each under load, one turn at a time), again after merge-main, plus speed tests twice; the epic skill's 'The session answers; agents build' says a FULL test run in a turn. Wanted in the skill, guide.md and agent briefs: per change targeted tests; before merging the touched folders' full UNIT tests (no browser/integration); after merging the full suite only if no other agent runs; speed test only for hot-path parser changes.
