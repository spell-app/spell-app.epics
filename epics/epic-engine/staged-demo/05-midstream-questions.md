# 05 · Questions while building

After Owen's Accept Phases:  phase 1 starts, and two questions come up while it's built.
Before running this:  4 working lines, a pause after each (about 10 seconds).

## Commands

```sh
epic demo seen
epic phase demo#P1 active --no-open
epic inbox status demo "Building P1"
epic add demo#Q "Should the briefing mention meetings cancelled overnight?" --options "*Yes, in one short line | No, only what's still on" --details '<p>A meeting that vanished overnight is easy to miss.  Saying so takes one sentence:  "Your 10 o'"'"'clock with Sam was cancelled."</p>'
epic add demo#Q "What should Jarvis do when the weather service is slow?" --options "*Leave the weather out, and say so | Wait up to 5 seconds | Use yesterday's forecast" --details '<p>The weather service sometimes takes 10 seconds to answer.  We recommend leaving the weather out and saying so, rather than making you wait.  The cost:  some mornings you won'"'"'t hear the forecast.</p>'
epic open demo --review
```

## Say

Phase 1 is under way.

Two questions came up while building:  cancelled meetings, and a slow weather service.  They're on the page.  Answer them and press Send, and I'll finish the phase.
