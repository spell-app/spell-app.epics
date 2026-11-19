# Staged demo:  what you do

About 20 minutes.  Claude's waits are about 10 seconds each;  the rest is you talking.

## Before the room

1. In a terminal, from `~/www/spell`:

   ```sh
   epic demo check
   ```

   It should say "staged demo ready" and "nothing left from an earlier run".
   If it lists leftovers:  `epic demo reset`, then check again.
2. Open a NEW Claude Code tab in the `spell` window (not inside a worktree's window).
3. Open `00-paste.md` beside it, ready to copy.

## The run

| # | You do | What happens | Time |
| --- | --- | --- | --- |
| 0 | Install:  show `npx spell@next epic init` from `00-paste.md`'s "Install" (don't run it:  this machine has it).  Say:  one command, any git repo, no Spell needed.  `~/.local/bin` must be on `PATH` for `epic` | Nothing:  you talk | 1 min |
| 1 | Type `/epic demo `, paste the box from `00-paste.md`, press Enter | Silly working lines;  the Morning Briefing epic page opens in the side bar;  two questions appear, then the Overview | 1 min, then talk 3 min |
| 2 | On the page:  pick an answer on Q1 and Q2 (the cards), then **Accept Overview** (green thumbs up on the Overview's title row) | Working lines;  four phases appear, one per part, each with Claude's plan | 30 s, then talk 3 min |
| 3 | Pick the Joke:  on **P4 · A Joke**'s title row, press **Looks good** (the thumbs up, left of the clock).  Then **Accept Phases** (on the Phases title row) | P4 · A Joke starts, the other three stay to do;  two more questions appear (Q3, Q4) | 30 s, then talk 2 min |
| 4 | Pick answers on Q3 and Q4, then press **Send** (the paper plane at the top) | Working lines ("building");  A Joke done;  "0. While you were out" opens at the top | 1 min, then talk 5 min |
| 5 | Walk through "While you were out", then the coloured items:  Judgement calls, Todo, Issues, Manual tests | Nothing:  it's all on the page | 3 min |

Picking the phase, the details:
- The thumbs up on a phase is **Looks good**.  The demo builds the last phase you gave one, wherever it sits in the list.
- The clock beside it is **Defer**:  it moves that phase to the end.  You don't need it.
- You forget the thumbs up and just press Accept Phases:  the demo builds A Joke anyway.
- Each step's words are about the joke, so pick A Joke:  a thumbs up on another phase would mark THAT phase done, with the joke's words.

The colours on the items, for the walk-through:
- **Red:**  needs you.  J2 (a call Claude made that you'd want a say in:  where the joke goes), I1 (an open issue).
- **Yellow:**  open, but calm.  J1 (a call that wouldn't surprise you), T1 (a todo), M1 (a test for you to try).
- **Orange:**  fixed, waiting for you to look.  I2.  **Light orange:**  your own request, done (I3:  no cat jokes).
- **Blue:**  Claude is on it.  T3, for P1 · Upcoming Meetings.
- **Grey:**  a limit to know about (T2).
- **Green:**  P4 · A Joke, done.  P1-P3 stay to do.

## If something goes wrong

- Nothing happens after an Accept:  press **Send** (the paper plane);  it sends the Accept at once.
- The page sent your thumbs up by itself, before Accept Phases:  Claude says "Got your pick".  Press Accept Phases;  the pick is kept.
- You pressed Send before Accept:  Claude says "press Accept ... when it looks right".  Just press it.
- Claude is stuck:  type `next` in the chat;  it runs `epic demo next` and carries on from where the page is.

## After

```sh
epic demo reset
epic demo check
```

Then close the demo's Claude tab.  The next run starts from "Before the room".

## Changing the words

Every word Claude says or writes is in this folder:  `01-analysis.md` ... `07-while-you-were-out.md`.
- What Claude says in chat:  each file's "Say" section.
- What goes on the page:  its "Commands" section (the Overview's text:  `03-overview.md`, "Overview").
- The working lines:  `silly-lines.txt`, one per line.
Tell Claude what to change ("make the questions about privacy"), or edit them yourself;  `epic demo check` after.
