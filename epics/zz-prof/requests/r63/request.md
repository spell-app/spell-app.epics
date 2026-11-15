---
id: r63
epic: epic-engine
from: 🚧 mockup (006bc5ee)
at: 2026-11-09T09:31-05:00
status: filed
filed: P68 · Test Project Cleanup
phase: p-test-project-cleanup
images: image-1.png
---

## The person's words

delete drafts

how can we ensure that artifacts like that are cleaned up?

send to epic engine to do

## Context

From epic mockup. Test projects were left in the person's real space: owen@spell/drafts-test-<pid>, made by app/tests/app/pages/drafts.test.ts, whose afterAll never runs on a killed run and whose removal doesn't check the answer. Proposed and accepted: (1) a shared test helper that makes a test project with the run's process number in its name, deletes on start any with that prefix whose process is gone, and fails loudly if a removal fails; (2) a check at the end of yarn test and yarn test:integration that lists the real space before and after and fails naming anything new. About 20 other test files mention the space and haven't been audited; the check would show which write to it. Stricter option, only if leftovers continue: these tests start their own editor on a temporary SPELL_SPACES_DIR.
