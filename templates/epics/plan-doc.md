# Plan docs

How to write and update `epics/<name>/<name>.plan.html`, the live doc behind a `/epic <name>` session.

- The tool: `packages/epics/src/tool/` (`spell dev plan-doc`) edits the structured parts, in `<epic-*>` markup
  (epic `epic-components`, switched over 2026-10-08).
- The template `new` copies: `packages/epics/src/tool/templates/plan.html`. NEVER copy it by hand.
- The MARKUP -- every element, attribute and child, where each goes:
  [`packages/epics/src/tool/PLAN-DOC.md`](../../packages/epics/src/tool/PLAN-DOC.md), and the element definitions
  it points to. This file holds what an author still needs: the rules, the prose, the ids, explaining a question,
  the review loop and the commands.

## Rules

- Use `spell dev plan-doc <command>` wherever one exists (below): it keeps ids, statuses, UPDATE markers and the
  "updated" date consistent, checks the markup before writing, and locks the file against parallel agents.
  Hand-edit only prose: the summary, Overview, phase bodies, item details.
  - in a SPLIT doc (see "Parts"; every new doc), a body's prose is in its part file, `parts/<id>.html`: edit it
    there, at its real path (`/Users/owen/www/spell-app/spell-app-dev/epics/<name>/parts/<id>.html`)
- Write for Owen coming back COLD (2026-10-04; the details skill's "Writing for Owen" is the same rule): he runs
  5+ epics, and reads an item weeks later, from another session. Enough that he can pick up ONE phase or item on
  its own. NOT caveman:
  - a plain lead sentence first: what it is, for whom, how he'd notice it
  - then bullets, one idea each, nested for sub-points; never a list run together inside a sentence ("a, b, c and
    d" is four bullets)
  - full words, the articles back in; short sentences
  - a concrete example for anything tricky: the real code, the command and what it prints, a before / after, a
    table of values
  - ids explained: "the inbox file decision (D1)", never a bare `D1`
  - identifiers, paths and numbers exact
- Questions, issues, judgement calls and decisions end with a **Net effect** (Owen, 2026-10-04): what concretely
  changes, one bullet each:

  ```html
  <epic-net-effect>
    <ul>
      <li><code>D7 (Q3)</code> becomes <code>Q3</code>, answered</li>
      <li>rule semantics changed: an answered question is no longer struck</li>
    </ul>
  </epic-net-effect>
  ```

  For a question: the recommended option's net effect, `<epic-net-effect option="A" recommended>` (drawn `Net
  effect (A, recommended):`); each option may carry its own, inside its `<epic-option>`. Worded otherwise ("once
  fixed"): a plain `<p><b>Net effect (once fixed):</b></p>` and its list.

- Lists: bulleted, or numbered when order or reference matters.
- NEVER delete an item: close it (`spell dev plan-doc close`), and it stays, closed (not struck). An item another
  decision made moot: `spell dev plan-doc cancel`, the one status shown struck through (J16 of `review-review`).
- NEVER drop an item's earlier text (Owen, 2026-10-04, I7 of `review-review`): the question as first asked, its
  explanation, its options, an earlier answer. Add Details doesn't rewrite: it adds a More Details card under the
  text (`details --more`). A rewrite -- an agent's or a phase's (e.g. `review-review`'s P8 "Rewrite The Rest"), or
  one by hand -- MOVES it into the item's folded **Original Discussion** (`PLAN-DOC.md`, "Items"):
  - `details <name> <id> --file` and `decide` (answering again) do it for you
  - rewriting by hand: write the new text through `details --file`, or put the old text in with `original <name>
<id> --file <old.html>`; never just overwrite it
  - text already lost: recover it from the shared content repo's git history, then `original ... --as-of
"YYYY-MM-DD HH:MM"` (when it was replaced)
- Keep the doc current as you go: a caveat, issue or decision found mid-phase goes in NOW, not at the end.

## Page header

`<epic-page>` draws the whole header from its attributes: the h1, the meta lines, the step label (the active phase,
else `DONE` once every phase is, else the next phase, or `FUTURE`), the bedtime label, and the review line ("To
review this doc, type `/epic review <name>`"). None of it is written by hand.

- The `<title>` reads `Epic: <Title>`; `<epic-page title>` holds the title alone (`new` writes both). Scripts
  reading the title drop the `Epic: ` (`TITLE_PREFIX`).
- The meta lines end with the durable doc, once Doc Review has written one (2026-10-04): a `<a slot="durable">`
  in `<epic-page>`. The durable doc's own meta list (`ui-list.spell-meta`) starts with the plan doc, ONE standard
  line:

  ```html
  <ui-item icon="map"
    ><b>Plan doc:</b>
    <a href="epics/unified-server/unified-server.plan.html" target="unified-server">epic unified-server</a></ui-item
  >
  ```

A FUTURE epic (`/epic future <name>`, epic `epic-future`, 2026-10-07): an idea written down, not planned yet.

- `new <name> --future`: no branch or worktree yet; the page says so, with a notice in place of "Plan hung?",
  linking its analysis page, `details/analysis.html` (its high-level open questions, answered in the Review tab; the
  answers land here as decided questions)
- `list` says `future`, between the epics in progress and the done ones; the Epics index gives it a seedling
- PLANNED by `new <name>` again (`/epic <name>`, "Reuse"): promoted where it is, the notice gone, the meta lines
  naming the branch and worktree; its prompt, decisions and analysis page stay. Its first phase (`add-phase`)
  plans it too

While planning (no phase yet), the page shows a folded "Plan hung?" notice (P3 of `windows-and-review`), drawn, never
written:

- How to restart a hung plan: a new session in the worktree's window, `/epic <name>`, "Reuse". Plus the kickoff
  prompt, with a copy button.
- Why: `/epic` writes this stub doc BEFORE planning, so the prompt survives a hung or lost session.
- It goes when the first phase is added (`add-phase`): the plan exists.

## Sections (ids are fixed)

| Section            | id            | What                                                                                                                                                                                                                                                                                                                                                      |
| ------------------ | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Overview        | `#overview`   | 2-sentence summary, the prompt that started the plan (folded in a "Kickoff prompt" aside), the total estimate (written by the tool), then the substance in numbered sub-sections (`#o1` "1.1 Structure" ...): becomes durable docs                                                                                                                        |
| 2. Phases          | `#phases`     | progress bar, then one block per phase (`#p1` ...): its estimate as the title's badge; Symptom, Changes, the details (Goal), Done (once done), Commits; Files and Verify hidden until the folder / flask toggle on the Phases title is pressed                                                                                                            |
| 3. Questions       | `#decisions`  | open questions first (waiting on the user; each also asked with AskUserQuestion), then the answered ones, in id order: settled unless new facts arrive. A decision IS an answered question (D13 of `review-review`, 2026-10-04): `decide` writes the answer INTO the question; `add ... decision` makes a question born answered                          |
| 4. Judgement calls | `#judgements` | choices Claude made WITHOUT the user (a `/bedtime` run, an agent mid-phase): title the choice, details "chose X over Y because Z" + the options; open until the user reviews it, `close` = accepted, disagreement becomes a question. Its phase's "To review" line lists it while it's open and not reviewed (never hand-write a "Judgement calls:" line) |
| 5. Caveats         | `#caveats`    | limits and risks we accept                                                                                                                                                                                                                                                                                                                                |
| 6. Todos           | `#todos`      | later work that isn't a caveat or an issue                                                                                                                                                                                                                                                                                                                |
| 7. Issues          | `#issues`     | problems found, open until fixed                                                                                                                                                                                                                                                                                                                          |
| 8. To test         | `#tests`      | what Owen checks by hand before merging: each a step and what should happen (`add <name> test`); `close` one once it passes                                                                                                                                                                                                                               |
| 9. Log             | `#log`        | one-liners of plan changes, stamped with local date and time                                                                                                                                                                                                                                                                                              |

- The elements draw each section's title, icon, rule, fold and `open/all` count: write only its contents.
- Everything starts folded; the reader opens what they want, and the page remembers. A link to any id inside
  (`#q3`, `#p2`) unfolds what hides it and lands on it.
- An Overview sub-section is written by hand: `<epic-section id="o3" kind="overview-part" title="...">`, prose
  inside, nested in `<epic-overview>` (`PLAN-DOC.md`, "The page"). Sub-sub-items: `<h4 id>`.
- NEVER change an `id`: the items, the log and other docs link to them.
- A doc still in the old `ui-*` markup (none since the switch, 2026-10-08): `spell dev plan-doc convert <name>`.
  `migrate` and `relayout` are gone: the converter replaced them.

## Ids: short, so they're easy to say in chat

- Items: `q1` questions (answered ones are the decisions), `j1` judgement calls, `c1` caveats, `i1` issues, `t1`
  todos, `v1` tests ("verify": `t` is taken). Shown as `Q1`, `J1`, `C1` ...
  - docs from before 2026-10-04 also had `d1` decisions; each lives on as the answer inside its question (old
    `#d7` links still land there, and `close d7` finds the question)
- Phases: `p1` ... Shown as `P1 · Short Name`: a 2-4 word name, so "start P2" is unambiguous.
- Overview sub-sections: `o1` ...
- Link to them in prose: `<a href="#i2">I2</a>`. `spell dev plan-doc check` fails on a link to a missing id.

## What phases and items say

The markup is in `PLAN-DOC.md` ("Phases", "Items", "Log"). What to write in each part:

- A phase reads Symptom (one line: what's wrong today), Changes (two or three lines: what changes), then the
  details (Owen, 2026-10-06; P3 of `windows-and-review`): `add-phase --symptom ... --changes ...`;
  `phase-body <name> <N> --symptom ...` sets them on a phase written before.
- Updated: a change to the phase's plan (after Owen's feedback, or found while building), FENCED right under
  Symptom / Changes, one dated line each: `updated <name> <N> "<p>what changed, and why</p>"`. Never an "Updated"
  word buried in the text. It STAYS once the phase is done (the record of how the plan moved); while its phase is
  still to do, it's also listed at the top of the phases, in a "Plan changes" box, so a re-review sees what moved.
- Goal: the details: a `<ul>`, one bullet per outcome, in Owen's terms (what he'll see or be able to do), not the
  build steps. Optional once the phase has a Symptom or Changes.
- Done: written when the phase is done (`phase <name> <N> done --done "<ul>..."`), a `<ul>` of what was BUILT,
  ordered by what Owen asks about first: where to see it, what changed in how he works, what's still rough or
  untested by hand, then the rest. Not the commit list: that's Commits.
- Commits: written by the tool, oldest first: `commit <name> <sha> --phase N "..."` adds one; `commits <name>
--backfill` reads the doc's git history and adds what's missing
  - phase commits by subject: `P3:  Name -- summary` (also `P4 + P5:`, `WIP P3:`, `<epic> P3:`, `P6a:`,
    `P1 follow-up:`); the sentence is what follows `--`, else the colon
  - item fixes: `Fix I3:  ...` (or `<epic> I3:`), listed in the item's details
- To review: written by the tool on every edit, LAST: the items added while this phase was active that are still
  open, not reviewed and not under way; none: no line.
- Files and Verify: still written for every phase; hidden on the page until the folder / flask toggle is pressed.
- Estimate: wall-clock time for Claude to do the phase, agents included, Owen's review not. `30m`, `2h`, `1h30m`,
  or a range, `1-2h`. `estimate <name> <N> "..."` changes it; the Overview's total follows (every phase's estimate
  added up, and the phases not done; an estimate that won't parse is named as not counted).
- An item's status: `open`; `decided` (an answered question: a decision in force); `done` (closed, never
  removed: fixed, passed, accepted; NOT struck); `canceled` (made moot by another decision: closed like `done`,
  its title struck through; `reopen` undoes it).
- An answered question reads in the order it happened (Owen, 2026-10-04, I9 of `review-review`): the question as
  asked, its options (folded "Choices", the chosen one ticked), then the answer. `decide` writes it; answering
  again replaces the answer, the old one into the Original Discussion. Never hand-write the Choices: write the
  question with its options through `details --file`, then `decide --option`.
- Add Details (`details --more`, P3 of `windows-and-review`): the item's text stays on top ("Original Reply"), the
  new text goes under it in a "More Details" card; a second Add Details replaces the card, the old one into the
  Original Discussion.
- An item's colour (its state), from its status and review marks, rewritten by the tool on every edit: "Colours",
  "Item states", below.
- Review marks (`/epic review`, and any session that talks an item through with Owen; `review`, `defer`, `queue`,
  `unqueue` write them):
  - reviewed: gone through with Owen, that day. Deferred: put off for now; still not reviewed. Queued, with
    its work: work a review decided on, not started yet; the next review offers it first.
  - the label shows the strongest: "to do" (yellow: open, not started), else "deferred" (grey, its date on
    hover), else "reviewed 10-03" (green while the item is `recent`, then grey)
  - REVIEWED also counts: closed (`done`, `canceled`), `decided`, or linked (`href="#i4"`) from an answered
    question's details
  - the outcome goes in the log (`I4 reviewed:  accepted`), not on the item

## Colours

ONE meaning per colour, on every doc page: plan docs, details pages, goals pages, the Epics index (Q20 of
`epic-components`, Owen 2026-10-08, settled on its colour-scheme details page). Read a page at a glance by it; a new
element takes its colour from this table, never a colour that means something else.

| Colour | Means                                       | Examples                                                                                                                                                                                                            |
| ------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| red    | needs you (Owen)                            | an open question's chip; an unreviewed judgement call or issue; the rail's count; a details question with nothing picked; a details page "waiting for your answer"; an open goals question; an epic with errors (every phase done, items need you) |
| yellow | open, still undecided                       | an open todo, caveat or test (a todo a review queued too); a reviewed issue or judgement call; "to do"; a goals topic "in dialog". DARK text and icons on a yellow fill                     |
| blue   | do it now, or Claude is working on it       | Do Now, Revisit, Send (everywhere: the page header, the agents panel, details pages); the Underway status card; an item Claude is working on (its chip, the spinner); an epic in progress; a goals topic "building" |
| green  | decided or done (however long ago)          | Approve, Make Todo, a todo's "next phase" plane; a pick, the chosen option (a details page's chosen card); a phase done, the Done status card; an item decided, done, or approved as it stands, for good; an epic done; a goals topic "agreed", "shipped" |
| orange | ONLY changed since you looked, and warnings; an item Claude answered with options, waiting for your pick (Owen, 2026-10-09) | UPDATE notes, the Updated fence, "Plan changes"; "nobody is listening" (inverted, to stand out); a `replied` item's chip (DARK text on it)                                         |
| violet | Claude's voice                              | his reply cards; "recommended" (a thumbs-up, no word)                                                                                                                                                               |
| ivory  | Owen's voice (the brand's brown tint)       | his note box, a marked note, his reply cards, the answer card; the rail                                                                                                                     |
| grey   | no longer relevant, inactive, not chosen    | a canceled item (made moot); a todo's "drop it" x; the note box's "skip this" x; buttons at rest, and once Claude has handled them; a phase to do; a future epic; a paused epic (phases left, untouched for 3 days); a goals topic "draft"                                                                                 |

- No light blue, no light green: one shade per meaning.
- Colour-blind readers tell red and green apart least: the chip's id, the icons and the words keep them readable.

### The fill

How far along a button, pill or chip with a lifecycle is (the review buttons, Send, the Choose pill, goals topic
labels):

| Fill                   | Means                                                                    |
| ---------------------- | ------------------------------------------------------------------------ |
| grey outline           | available: nothing pressed                                               |
| DASHED, in its colour  | Owen pressed it, not committed (not sent)                                |
| OUTLINE, in its colour | recorded (sent), or in progress (Claude is on it)                        |
| CLEARED                | handled: a review button is a grey outline again, the chip has the result |
| SOLID                  | only on chips, the step label's DONE, and a Choose pill once applied     |

- The review buttons are Owen's INPUT to Claude (Owen, 2026-10-08): dashed pressed, outline sent / in progress,
  then CLEARED once Claude has handled the mark; the id chip carries the result (green decided, yellow still open,
  red needs you). `review-as` stays in the doc as the record, never drawn on the buttons.
- It flips the old rule (solid meant "not sent yet", 2026-10-06).
- Send never goes solid on a details page: the page can't tell when Claude is done with the answer.
- An item's id chip MATCHES its chosen review button while Owen's mark is live (2026-10-08): that button's colour and fill (Approve pressed, not sent: dashed green); no mark, or one Claude handled: its state's colour, solid.

### The review buttons

On an item's line, ONE group, in this order:

1. Approve (check), green
2. Revisit (history), blue
3. Make Todo (list check), green

Then, APART from the group, Do Now (the magic wand, as the header's Review Now:  Owen, 2026-10-09;  it was a paper
plane), blue: it replaces Add Details Now on the line, and the note box's "now". An item Claude has answered or done
keeps the three-button group, so Owen can still approve it.

The NOTE BOX (every one but a todo's:  an item's, an Overview sub-section's, a phase's, the summary's) has two
buttons:  Revisit Later (history), blue, and Skip This (x), grey (Owen, 2026-10-09:  the x replaced the box's Make
Todo, which he never used there;  the line keeps its Make Todo). The x means "nothing to do here":  a `skip` mark,
with the note typed (or none);  no line button wears it, the id chip does, grey. `inbox apply`:  the item reviewed and
nothing else (an open question stays open, no status card), the note kept as Owen's `<epic-reply re="skip">`;  on a
phase, the summary or an Overview sub-section, logged and the note kept;  on a todo, as `drop`.

A TODO's line is different (Owen, 2026-10-09):  ONE group, no Approve, Make Todo or Do Now:

1. Do it in the next phase (paper plane), green:  `inbox apply` queues it into the first phase still to do
   (`queue <name> <id> "P10 · <name>"`, a Done card "Queued for P10 · ...";  no phase to do:  "the next phase")
2. Revisit (history), blue:  "I'm adding a note for you"
3. Drop it (x), grey:  `inbox apply` cancels it ("dropped by Owen in review":  struck through, grey)

Its note box matches:  the plane, Revisit Later, the x;  the plane or the x takes the note along (kept as Owen's
reply when applied).

### Item states

An item's chip (and its filter chip) by its `state`, which the tool writes from its status and review marks on every
edit. The FIRST row that applies wins, top to bottom (`PLAN-DOC.md`, "Items", the same table):

| State       | Colour | When                                                                                         |
| ----------- | ------ | -------------------------------------------------------------------------------------------- |
| `progress`  | blue   | Claude is working on it: an Underway status card, or the working spinner (closed or not)     |
| `old`       | grey   | canceled: no longer relevant (made moot, struck through)                                     |
| `recent`    | green  | decided or done (decided, done), however long ago                                            |
| `open`      | yellow | work a review queued (a todo mark), not started                                              |
| `replied`   | orange | open, and Claude's LAST reply holds options nothing is picked in yet: your turn to pick      |
| `attention` | red    | an open question; an open judgement call or issue not reviewed, unless `calm` (not urgent)   |
| `recent`    | green  | open, settled by a review: approved as it stands, or made a todo                             |
| `open`      | yellow | anything else open: still undecided, not urgent (todos, caveats, tests; reviewed issues and judgement calls; a revisit or Do Now Claude answered) |

- Green across the board for what's decided; grey only for what no longer matters (Owen, 2026-10-08). Neither age
  nor a `/bedtime` run colours a chip any more.
- `replied` (Owen, 2026-10-09; branch `spell-element` until it merges): a pick (`chosen`), a newer reply from you, or
  closing the item ends it; a reply asking without cards (a yes / no in prose) doesn't make it orange.
- The rail counts only what needs you, `attention` and `replied` items, in a red pill; none, no pill. The "only what
  needs you" filter shows both.
- In CSS: `<epic-page>`'s `--epic-state-*` (`packages/epics`), `spell-doc.css`'s `--spell-state-*` (the other doc
  pages): the same values.
- Goals pages colour their items by the same states (an open question `attention`, any other open item `open`, a
  decided or done one `recent`, a canceled one `old`): the kind shows only in the id's letter (G, Q, D, R, W, I).

### Folding

EVERYTHING boxed in a section folds (Owen, 2026-10-08): every card with a heading band folds from it, the chevron
first -- a reply (Owen's and Claude's), the answer, a status card, a note, an UPDATE note, the Updated fence, an open
question's option card; More Details, Choices, asides, code blocks, Original Discussion, Plan changes and Agents
running too. They start open (the item around them starts folded); folding is the page's, never written; find-in-page
reveals folded text.

## Parts

A plan doc is stored SPLIT (P3 of `claude-design`, 2026-10-05): a SKELETON plus one BODY file per bulky block, which
the page loads the first time it's opened. So the doc preview opens fast, an edit to one item patches that item, and
nothing flickers. The tool's `EpicParts` does it; the markup (`source`, `part-ids`, `commits`): `PLAN-DOC.md`,
"Parts".

- New docs start split (`new`); `split <name>` splits one, `join <name>` puts it back in one file. Every command
  reads and writes either shape: reading assembles a split doc into one document, the write splits it again.
- The skeleton, `epics/<name>/<name>.plan.html`, keeps everything a reader or a script needs without a body: every
  section, every phase (id, title, status, estimate), every item (id, title, status, state, review marks), the page's
  attributes, the Overview's summary and prompt. So `#id` links, counts, filters, review marks, the docs index and
  the main server's epic cards all work without a single body.
- The bodies, `epics/<name>/parts/<id>.html`, `<id>` the block's own id (`.htm` before the switch, 2026-10-08):

  | Host                           | Part             | Holds                                                                       |
  | ------------------------------ | ---------------- | --------------------------------------------------------------------------- |
  | an Overview sub-section, `#o3` | `parts/o3.html`  | its prose (not its title)                                                   |
  | a phase, `#p2`                 | `parts/p2.html`  | its fields: Symptom, Changes, Goal, Done, Commits, Files, Verify, To review |
  | an item with details, `#q7`    | `parts/q7.html`  | its details (not its title)                                                 |
  | the log, `#log`                | `parts/log.html` | its events                                                                  |

- How a part is told from a page: by its folder. Every page walker skips `parts/` folders (`packages/docs/tools/
pages.js` `findPages()`, `relocate.js`, `spell static`): the docs index, `docs update` and link repairs never take
  a part for a page.
- A part file: a one-line comment saying whose body it is, then the body's markup. Its relative URLs are relative to
  `parts/`: one `../` more than the skeleton's (`../../../guides/x.html`, not `../../guides/x.html`).
- Edit a body's prose in its part file, at its real path (shared content). Structured edits stay commands.
- Where each body goes is decided by rule on EVERY write: an item that gains details gets a part; a new Overview
  sub-section written whole into the skeleton has its body moved into a part by the next command. Content a host
  holds beside its part (a hand edit) is kept, after the part's: `check` notes it, the next edit moves it in.
- Each write: links and formatting (oxfmt) happen in memory; each file is written once, atomically, and only when
  its text changed: parts first, then the skeleton. A log line rewrites `parts/log.html`; closing an item rewrites
  the skeleton only.
- On the page (served by the page server; bodies don't load from `file://`): a changed part re-fetches its open
  host in place. Find-in-page misses text in bodies not yet opened (C4 of `claude-design`).
- `check` checks a split doc whole: ids and links across skeleton and parts; a missing part is a problem, a part
  nothing loads a note.

## UPDATE markers

While a phase is active, flag what changed so the user can spot it:

- a new or changed item gets an UPDATE marker in its title (the tool adds it: `PLAN-DOC.md`, "Items")
- a changed prose block gets, just before it, an orange UPDATE note of the active phase:
  `<epic-update phase="2"><p>what changed</p></epic-update>`
- `spell dev plan-doc phase <name> 2 done` removes phase 2's markers, notes and all
- a note that should STAY once the phase is done (an item partly fixed elsewhere, a decision done):
  `<epic-note state="update" title="partly fixed by J9, 2026-10-06"><p>...</p></epic-note>` (orange `UPDATE`), or
  `state="done"` (green `DONE`)
- a change to a PHASE's plan is not a marker: it's that phase's fenced Updated line (`updated <name> <N>`, "What
  phases and items say"), which stays

## Review inbox

Owen marks items ON the page (served by the page server): approve, todo, Add Details, revisit (soon / now, with a
note), pick an option. Picks work wherever option cards are (I8 of `epic-components`): a question's, a judgement
call's text, a reply, More Details; the mark names WHICH card set by position (`{ pick: "B", choices: 1 }`; none:
the item's own). An item may carry a pick AND a revisit note together ("pick B, but ..."): the revisit mark holds
the `pick`. A CLOSED item's cards (an answered question, an accepted call) take Choose pills too, on every option
but the chosen one (its pill solid), only while Owen revisits it (its Revisit box open, or a revisit or pick mark):
"pick B instead, because ..." is a revisit carrying the pick, talked over; a plain pick there, once applied, answers
(or approves) it again with that option. The
marks wait in `<name>.inbox.json` beside the doc (git-ignored) until "send to Claude"; Add Details and revisit now
go at once (the inbox's `now` queue), and Owen may call one off ("nevermind": `canceled`, handed to the waiting
session to stop that item's agent; `plan-doc details` then refuses its write). A todo may carry Owen's note (from
before 2026-10-09, when the note box had Make Todo), written into the new todo;  a skip (the note box's x) its note,
kept as his reply. Read it with `spell dev plan-doc inbox <name>`; shape, routes and helpers:
`packages/docs/AGENTS.md`, "Review inbox". NEVER edit the file by hand: go through `ReviewInbox`
(`packages/epics/src/tool/ReviewInbox.ts`, its lock).

The summary and every phase take marks too (epic `airplane` P2), as an Overview sub-section does: Revisit (with a
note), Make Todo, Do Now, no Approve; the summary is keyed `summary` (it has no id), a phase by its id (`p3`). And
Owen can ask for a NEW todo or question from the page: the `+` in the page header, or New todo / New question at the
end of the Todos and Questions sections, opens a small form (todo or question, title, note, what it's about). It
waits in the inbox as a mark under its own key, `new1`, `new2` ... (`{ action: "new", kind, title, note?, near? }`,
`POST new`), drawn at the end of its section until made (Edit, Remove), and goes with the next send like any mark.
All of it works with no session listening: the marks just wait, dashed, for the next `/epic review`.

Review Now (the page header's wand, beside Send; epic `windows-and-review` P4): sends every mark AND turns each
revisit waiting (unsent, or sent and still to talk over) into a request for now (`POST send { now: true }`,
`ReviewInbox.reviewNow()`): the listening session answers them all at once, by background agents, into the items.

How a `/epic review` session takes the marks (nothing outside a session can wake it, except a background command
it started ending):

1. `spell dev plan-doc inbox <name> listen`: the page stops saying nobody is reviewing.
   - a HEARTBEAT keeps it so: `wait` stamps `listening.seen` every 30s, and `apply`, `done`, `clear`, `working`
     each time; silent for 90s (a killed session, no `unlisten`), the page says nobody is reviewing again
2. `spell dev plan-doc inbox <name> wait` in the BACKGROUND, then end the turn. It exits when there's work, which wakes
   the session; it prints, for each item, its id, kind, status and title, the mark, the note, and a pick's option:

   ```text
   now (1):  start a background agent for each;  `spell dev plan-doc inbox review-review done <id>` after
     - I1  issue, open · The phases' progress bar label is cut off at its left end
         Add Details
   sent 2026-10-04T17:32:26.086-04:00 (4 marks):
     approve (1):
       - J9  judgement, open · A reload lands on the remembered section without unfolding it
     pick (1):
       - Q7  question, open · Should a reload land on the remembered section without unfolding it?
           picks B · Land and unfold it
     revisit, to talk over (1):
       - Q3  question, open · Where should the send button sit?
           picks A · In the page header, asks:  "A, but only on plan docs?"
     ...
   next:  `spell dev plan-doc inbox review-review apply` (approve, pick, todo, a todo's next phase or drop, skip, new, urgency)
   ```

   - `now`: Add Details and revisit now, TAKEN off the queue, each item marked `working` (its spinner); the mark
     stays until `done`, unless Owen changed it meanwhile to one waiting for a send (e.g. chose an option: a revisit
     `soon` with the pick): that one stays for the next send
   - `sent`: every mark the last "send to Claude" covered, once per send (`handedOver` in the inbox); a mark an
     earlier send already handed over (a revisit still being talked over) says "(sent before)"
   - timeout (3300s): exit 2, nothing taken; run it again

3. `spell dev plan-doc inbox <name> apply`: the mechanical marks, applied and cleared:

   | Mark                | On                                                                 | Does                                                                                                                                                                               |
   | ------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | approve             | an open question                                                   | answered with the option marked recommended (`decide`, that option chosen), reviewed; no recommended option: left, "needs talk"                                                    |
   | approve             | an open judgement call                                             | closed (accepted), reviewed                                                                                                                                                        |
   | approve             | an open test                                                       | closed (passed), reviewed                                                                                                                                                          |
   | approve             | anything else (open caveat, issue, todo; closed or answered items) | reviewed                                                                                                                                                                           |
   | pick                | a question                                                         | answered with that option's title, the option chosen (in the card set the mark names), reviewed                                                                                    |
   | pick                | any other item (judgement call, issue, todo, caveat)               | APPROVED with that option: its card set's `chosen` set, then as approve (an open judgement call closed, accepted; reviewed); the option in the log line                            |
   | todo                | any item                                                           | a new todo "Follow up: <title>" linking back, the item reviewed                                                                                                                    |
   | todo                | a phase, the summary, an Overview sub-section                      | a new todo "Follow up: P3 · <title>" (or "the summary", "<title>") linking back (`#p3`, `#overview`, `#o3`); a Done status card on what was marked                                 |
   | next                | a todo (its plane)                                                 | queued into the first phase still to do (`queued`, work `P10 · <name>`;  none: "the next phase", and the reply says so), a Done status card "Queued for P10 · <name>", reviewed;  a note kept as Owen's reply |
   | drop                | a todo (its x)                                                     | canceled, "dropped by Owen in review" (struck through, grey), reviewed;  a note kept as Owen's reply                                                                               |
   | skip                | any item but a todo (the note box's x)                             | reviewed, nothing else ("skipped:  nothing to do"):  its status and state as they were, no status card;  a note kept as Owen's reply (`re="skip"`).  On a todo:  as drop               |
   | skip                | a phase, the summary, an Overview sub-section                      | logged ("skipped:  nothing to do");  a note kept as for any of their marks                                                                                                         |
   | approve             | a phase, the summary, an Overview sub-section                      | logged only (the page has no Approve for them)                                                                                                                                     |
   | new                 | a new todo or question (`new1`)                                    | made as `add` makes it: Owen's note its details (a question's lead), "About P3." linking `near`; a Done status card "Made from the page: Owen's new todo, written <time>."         |
   | revisit soon        | any item                                                           | left: answered INTO the item as a reply (`details --append`), the chat only linking it (Q3 of `windows-and-review`), then `inbox <name> clear <id>`                                |
   | revisit with a pick | any item                                                           | left, NOT answered ("to talk over: picks B · ..., asks: ..."): answer the note about that option; once Owen agrees, he picks it plainly (a question: or `decide ... --option B`), then `clear` |

   Each applied mark logs one line (`J9 approved:  closed (accepted)`); a mark Owen changed meanwhile stays. Each
   pick and todo also gets a green "Claude • Done" status card saying what was filed (`Chose B · ...`, `Made todo
T23 ...`: Q19 of `epic-components`), each new item one saying where it came from; an approval none. A revisit on a
   phase or the summary is talked over as on an item; `clear` / `done` keep its note as Owen's `<epic-reply>` (in
   the phase, under its Updated lines; under the summary's lede, `slot="notes"`). `clear new1` drops a new item
   without making it.

4. Requests for now: FIRST `spell dev plan-doc status <name> <id> underway "<reading>"` (a blue "Claude •
   Underway" card under Owen's note: what Claude takes the task to be, one or two sentences, no file names; the
   spinner on); then a background agent per item writes into it with `spell dev plan-doc details <name> <id>
[--more | --append] --file <html>` (Add Details: `--more`, a More Details card under the item's text; revisit
   now: `--append` a reply), then `status <name> <id> done ["<summary>"]` (the same card turns green "Claude •
   Done"; a summary only when worth saying) and `inbox <name> done <id>`. A revisit talked over (step 3) the same:
   `underway` as it's taken up, `done` once answered. The card's markup: `PLAN-DOC.md` "Status cards".
5. `wait` again. On leaving: `inbox <name> unlisten`.

A reply to Owen's revisit note (`details --append`), dated, quoting the note:

```html
<epic-reply from="Claude" at="2026-10-04 17:20" re="why not reuse the details route?">
  <p>The answer ...</p>
  <ul>
    <li>bullets, one idea each</li>
  </ul>
  <epic-choices>
    <epic-option letter="A" title="Reuse it" recommended><ul><li>...</li></ul></epic-option>
    <epic-option letter="B" title="A route of its own"><ul><li>...</li></ul></epic-option>
  </epic-choices>
  <epic-net-effect option="A" recommended><ul><li>...</li></ul></epic-net-effect>
</epic-reply>
```

## Prose

The blocks below are ELEMENTS (P14 of `epic-components`): each draws its own label, fold and colours around prose
that stays plain HTML inside it. Never hand-shape them (`<p><b>Net effect:</b></p>`, `ui-accordion.spell-code`): the
tool turns those old shapes into the elements on the way in (`details --file`, `--details`, `updated`), but prose
edited by hand in a part file isn't passed through it. All of them, with an example each: `PLAN-DOC.md`, "Prose
elements".

- Code: ALWAYS folded and coloured, an `<epic-code>` holding ONE `<pre>` of the code as text (`&lt;` for a `<`):

  ```html
  <epic-code title="file.ts · N lines" language="ts"><pre>const a = 1 &lt; 2</pre></epic-code>
  ```

  Folded to start with (no `open`); `language` as `<ui-code>` takes it (`ts`, `html`, `css`, `json`, `spell`).
- Digressions: a folded `<epic-aside title="why not now">` (drawn `Aside:  why not now`), the prose inside.
- The **Net effect**: `<epic-net-effect>` around its list ("Rules").
- Options, on ANY item (a question's own, a judgement call's, the ones a reply weighs): `<epic-choices>`
  ("Explaining a question or issue").
- A labelled block ("Where:", "What should happen:", "Step:"): `<epic-field label="Where"><p>...</p></epic-field>`
  (no colon: drawn).
- A note that stays: `<epic-note state="update|done" title>` ("UPDATE markers").
- A question's text as first asked: the tool wraps it in `<epic-question>` (`add question`, `details --file` on a
  question); written by hand, it's the first thing in the item.
- Link caveats, issues, decisions and phases wherever prose mentions them.

## Explaining a question or issue

Anything the user must decide or weigh in on (a question, an issue with options) gets an explanation the user can
decide from WITHOUT asking back: in the item's details, or an Overview sub-section the item links to when it's long.

- Plain words first: what goes wrong (or what's being chosen), for whom, and how they'd notice. Define every
  coined or jargon word on first use: "stacking: things side by side go one under another when there's no room".
- The real thing: the actual code / markup / CSS rule it's about, excerpted from the file (a folded `<epic-code>`),
  never pseudo-code.
- Concrete cases: name the affected components / examples / tests ("breadcrumb `divider-icon`: the divider stays
  empty in Safari").
- Many values: a `ui-table` (the 19 renamed emoji: name, today, if changed, other names that reach each).
- Options: side by side, an `<epic-choices>` of `<epic-option letter="A" title="...">`, after the item's text (a
  question's) or where the prose weighs them (any item, a reply); each says what changes, the cost, and a short
  code sample; mark ONE `recommended` and say why:

  ```html
  <epic-choices>
    <epic-option letter="A" title="Descriptions move, the tool stays" recommended
      ><ul>
        <li>...</li>
      </ul></epic-option
    >
    <epic-option letter="B" title="The whole tool moves"
      ><ul>
        <li>...</li>
      </ul></epic-option
    >
  </epic-choices>
  ```

  Any item's options are picked (Choose; a question's also `decide --option`): a question is answered with the
  option, any other item approved with it (I8). (An old option grid, `ui-grid.spell-pros-cons`, is still turned into `<epic-choices>` on the way in,
  wherever it sits.)

- Live: when the doc's bundle has the components, a working example (a resizable box for layout; real buttons
  for behaviour); click it through in a browser before handing back.
- Keep code in side-by-side boxes short (~40 columns) or it clips; look at the screenshot.
- End with the **Net effect** (see "Rules").
- The AskUserQuestion that asks it uses the same option names and order as the doc.

## Commands (`spell dev plan-doc ...`, from anywhere in the repo)

Every checkout's `epics` is a link to ONE shared copy (epic `shared-content`): run from any checkout, a command
edits the same doc. `--here` (this checkout's copy) is no longer needed: accepted and ignored. `spell dev
plan-doc` with no command prints the usage.

| Command                                                                                                                                       | Does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new <name> [--title "..."] [--prompt "..." \| --prompt-file <path>] [--future]`                                                              | copy the tool's template to `epics/<name>/<name>.plan.html`, fill it (the prompt that started the plan goes in the Overview), update the docs index; `--future`: a future epic ("Page header"); on a future epic's doc: plans it, promoted where it is                                                                                                                                                                                                                                                                                                                            |
| `add-phase <name> "Short Name" --symptom <html> --changes <html> [--goal <html>] [--files ...] [--verify ...] [--estimate 1-2h] [--before N]` | append a phase: Symptom (one line), Changes (two or three), then the details (the goal a `<ul>`); the estimate the title's badge. Neither `--symptom` nor `--changes`: Goal / Files / Verify. `--before N` (epic `skillz`): insert it as PN instead; PN and every later phase move down one, with their ids, part files and every link and `phase` pointing at them (prose without a link isn't changed); refused once any of them has started. `/epic phase` uses it                                                                                                             |
| `phase-body <name> <N> [--symptom ...] [--changes ...] [--goal ...] [--files ...] [--verify ...]`                                             | set a phase's body fields, each in its place (`""` removes one)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `updated <name> <N> "<html>"` / `--file <path>`                                                                                               | a change to phase N's plan: a dated line in its fenced Updated block, under Symptom / Changes; kept once done; listed in "Plan changes" atop the phases while N is to do                                                                                                                                                                                                                                                                                                                                                                                                          |
| `phase <name> <N> todo\|active\|done [--done <html>] [--no-open]`                                                                             | set a phase's status; `done` removes its UPDATE markers, and `--done` writes its Done field; brings the doc forward in VS Code                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `estimate <name> <N> "1-2h"`                                                                                                                  | change a phase's estimate (its title's badge); the Overview's total follows                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `add <name> question\|judgement\|caveat\|issue\|todo\|test\|decision "<title>" [--details "<html>"] [--calm]`                                 | append an item, print its id; a `decision` is a question born answered (`Q7`); `--calm` (last): a judgement call or issue that simply follows WWOD, yellow (open) rather than red                                                                                                                                                                                                                                                                                                                                                                                                 |
| `close <name> <id>` / `reopen <name> <id>`                                                                                                    | close an item (`done`) / open it again                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `cancel <name> <id> ["why"]`                                                                                                                  | an item made moot by another decision: `canceled`, struck through; logs why; `reopen` undoes it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `decide <name> <Q id> "<answer>" [--details "<html>"] [--option B]`                                                                           | answer a question: the answer goes INTO it (`decided`), its details in the order it happened: the question's text, its options as a folded Choices (`--option`: the chosen one), then the answer; answering again replaces the answer in place, the old one into its Original Discussion; prints its id                                                                                                                                                                                                                                                                           |
| `commit <name> <sha> --phase N \| --item <id> "<sentence>"`                                                                                   | list a commit under a phase or an item (replaces its entry)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `commits <name> --backfill`                                                                                                                   | list every phase and item commit in the doc's git history that isn't yet (subjects `P3:  Name -- summary`, `Fix I3:  ...`)                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `log <name> "<text>"`                                                                                                                         | add a timestamped line to the log                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `prompt <name> "<text>"` / `prompt <name> --file <path>`                                                                                      | set (replace) the prompt quoted in the Overview; `""` removes it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `convert <name> ... \| --all [--dry-run] [--out <folder>] [--verbose]`                                                                        | rewrite docs from the old `ui-*` markup into `<epic-*>` markup, and prove nothing was lost (every id, link target and word); writes ONLY under `--out` (copies); replaced `migrate` and `relayout`                                                                                                                                                                                                                                                                                                                                                                                |
| `split <name> [--dry-run]` / `split --done [--dry-run]`                                                                                       | store a doc as a skeleton plus part files ("Parts"); `--done`: every finished epic with no worktree of its own; "already split" otherwise                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `join <name>`                                                                                                                                 | a split doc back into one file, its `parts/` folder removed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `bedtime <name> start "P3-P6"` / `bedtime <name> done "summary"`                                                                              | a `/bedtime` run: bedtime mode on (every change stays green until reviewed; `summary --json`'s `bedtime`) / off; both logged. No report section: the night's judgement calls and issues show red where they belong (D5 of `review-review`)                                                                                                                                                                                                                                                                                                                                        |
| `overnight <name> remove`                                                                                                                     | an older doc's Overnight report section (a `/bedtime` run's, before 2026-10-05): remove it once read                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `review <name> <id> ["outcome"]`                                                                                                              | mark an item reviewed today; the outcome goes in the log                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `defer <name> <id>`                                                                                                                           | put an item off: dated, still not reviewed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `queue <name> <id> "work"` / `unqueue <name> <id>`                                                                                            | work a review decided on, waiting / started or dropped                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `items <name> [--section <s>] [--filter unreviewed\|open\|reviewed\|queued\|all] [--json]`                                                    | what a review walks: where reviews stand, the to-do list, each section's counts and items                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `items <name> --section <s> --spec <file>`                                                                                                    | `/epic review`'s item picker as a details page spec (`spell dev details new --from`): a checkbox per open item, the not-reviewed ones ticked, each labelled by its id                                                                                                                                                                                                                                                                                                                                                                                                             |
| `list [--json]`                                                                                                                               | every epic: in progress / future / done, its worktree while it has one (`checkout`), not reviewed / all                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `backfill <name> \| --all [--apply]`                                                                                                          | one-off: items not reviewed that Owen named in a past session of the epic (his message, or a modal he answered); a dry run unless `--apply`, which marks them dated that day (`ReviewBackfill`)                                                                                                                                                                                                                                                                                                                                                                                   |
| `summary <name> [--json]`                                                                                                                     | open questions, judgement calls, issues, caveats, todos, tests, and the next phase                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `summaries <file.html> ...`                                                                                                                   | `summary --json` of each doc, by PATH (a worktree's too), as one JSON object `{ <file>: summary \| { error } }`; for `/epics`                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `check <name> [--no-browser] [--links]`                                                                                                       | ids unique, every `#id` link resolves, every phase has a status, a split doc's parts there (checked whole); its file links, printed as `LINK:`, failing only with `--links`; then `check-spell.js`                                                                                                                                                                                                                                                                                                                                                                                |
| `open <name>`                                                                                                                                 | show the doc rendered in VS Code's doc preview (the right side bar's "Spell Docs" tab); needs the spell extension (`spell dev vscode`)                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `inbox <name> [--json]`                                                                                                                       | the marks Owen left on the page (`<name>.inbox.json`), by action, with their items' titles, sent or not; the `now` queue, agents at work, the session listening                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `inbox <name> listen [--session <id>]` / `unlisten`                                                                                           | this session (`$CLAUDE_CODE_SESSION_ID`) waits on the inbox / stopped: the page tells Owen whether anyone is listening                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `inbox <name> wait [--timeout <s>] [--json]`                                                                                                  | block (polls every 1s, default 3300s) until there's work, print it, exit 0; timeout: exit 2. Work: requests for now (taken off the queue, their items marked working) and a send not yet handed over (its marks by action)                                                                                                                                                                                                                                                                                                                                                        |
| `inbox <name> apply [ids...]`                                                                                                                 | apply the sent approve / pick / todo / new marks, and the sent urgency (an id chip clicked: calm or not), to the doc and clear them; prints a line per item and what it left (revisits)                                                                                                                                                                                                                                                                                                                                                                                               |
| `inbox <name> working <id> on\|off`                                                                                                           | the page's spinner on an item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `status <name> <id> underway "<reading>"` / `done ["<summary>"]` / `done --filed "<what>"`                                                    | Claude's status card on an item, Overview sub-section, phase or the summary (`summary`): blue "Claude • Underway" with its reading of the task (spinner on), then the same card green "Claude • Done", a summary under it when worth saying (spinner off); `--filed`: a card born done                                                                                                                                                                                                                                                                                                                            |
| `inbox <name> done <id>...` / `clear <id>...`                                                                                                 | an agent finished the item: its mark and spinner go / drop marks (a revisit talked over); a mark's note is kept in the item first, as Owen's reply                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `details <name> <id> --file <html> [--append \| --more]`                                                                                      | `--more` (Add Details): the item's text stays on top as "Original Reply", the file's HTML in a "More Details" card under it (a second one replaces the card, the old into the Original Discussion); else replace an item's details with the file's HTML, or add it after them (a reply: after the replies); the answer, Original Discussion and commits stay; on an answered question the new text is the question's, laid out again (Choices, then the answer); replacing moves the old text into the item's Original Discussion; logs "I1 details rewritten" / "I1 reply added" |
| `original <name> <id> --file <html> [--as-of "YYYY-MM-DD HH:MM"]`                                                                             | put an item's earlier text (recovered from git; old markup welcome) into its Original Discussion: as first written, or dated `--as-of` (when it was replaced), in date order; prints `added` / `unchanged` / `empty`; doesn't stamp the item                                                                                                                                                                                                                                                                                                                                      |
