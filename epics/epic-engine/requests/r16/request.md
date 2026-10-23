---
id: r16
epic: epic-engine
from: repo-split-13 (1c6fb846)
at: 2026-10-22T23:57-04:00
status: filed
filed: P21 · Explicit Test Steps
phase: p-explicit-test-steps
---

## Owen's words

Owen's feedback on hand tests (`#V`) and their test run, gathered during epic repo-split's testing pass, 2026-10-22.
Send to epic-engine when the pass is done (Owen:  "Gather all of this feedback that I'm giving and pass it on to epic-engine when we get done with this testing pass").

1. On V1's step ("cd into its spell-ui, say hi", "reload the list in both windows"):
   "Don't know what "cd into it's spell-ui, say hi" or "reload the list in both windows" means.  You need to be clearer.  If I'm supposed to do something in the terminal, or using vscode, be very explicit."
2. On V2's step ("Open the Output panel, pick Spell Language Server"):
   "What is "the output panel"?"
   (Also wrong:  the extension's output channel is `Spell`, not "Spell Language Server".)
3. On V3's step ("open the Actions tab of spell-kit and of spell-ui on GitHub"):
   ""open the actions tab" -- I'm dealing with many different interfaces here, WTF do you mean?"
   (And V3 was a check Claude could do itself with `gh run list`:  it never needed Owen.)
4. "You are making me think too much to do this stuff.
   When you give instructions like this in tests, put them in code blocks with exactly what I need to type.  If I'm supposed to wait between sections (e.g. to check something), make them separate blocks with what I"m supposed to do in the middle."
5. V2's comment (epic repo-split I70) -- ALREADY FIXED by windows.worktreeOnly (worktree windows hold no main root);  listed for the record:
   "Still seeing `repo-split` and `spell-app` files duplicated when I open a window"
   (Claude's reading:  the worktree window hides the main root's files with `files.exclude` `"*": { "when": ".spell-main" }`;  the Explorer obeys it, Quick Open (⌘P) doesn't, so each file shows under `⎇ repo-split` AND under `spell`.  A third copy comes from a stray folder in the main checkout, `~/www/spell/spell-epic.worktrees`.  Screenshot:  epics/repo-split/tests/v2-20261022-2042.png)
6. Claude's own note:  a new terminal in a worktree window makes VS Code ask "Select current working directory for new terminal" (three folders);  test steps must say which to pick, or `cd` first.  (Screenshot:  epics/repo-split/tests/v4-20261022-2038.png)

What Claude changed on its side (memory feedback_test_steps_explicit.md):  every `#V` step now names the app, window and menu or keys;  everything to type goes in a `<pre><code>` block, `cd` included;  a wait or a look between commands is its own step;  tests Claude can check itself (CI, CLI output) never go to Owen.
Ask for epic-engine:  make that the epic skill's rule for writing tests ("5. Each phase", the `add <name>#V` block), and make the test run show a step's code blocks as copyable blocks.

## Context

Owen's feedback on hand tests (#V) and the test run, gathered over epic repo-split's testing pass 2026-10-22 (V1-V7 in epics/repo-split/repo-split.plan.html);  Owen asked for it to be passed on when the pass was done.  Screenshots named are in epics/repo-split/tests/.
