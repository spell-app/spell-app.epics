# Sweep 2:  commands

Surface:  the commands people and agents type.  That means every `spell` command (each repo's), every `epic` verb,
every repo's yarn scripts, and the skills that run them.
By the coherence agent, 2026-10-26 (epic `coherence`, sweep 2).  No file changed but this one.

- Read against:
  - the commands guide (`guides/dev/commands/commands.md`):  `spell <noun> <verb>`, the CLI drives everything,
    skills keep judgement, yarn keeps a repo's own scripts and aliases the rest
  - its data, `commands.json5`, and the page's "5.2 Names";  the word list and the catalog
- What was run:
  - `node bin/spell.mjs help` and every command's `--help` (29 nested verbs among them)
  - `epic --help` and all 68 verbs' `--help`
  - every `package.json`'s scripts (the kit, five repos, the VS Code extension), and the 25 skills
    (20 in spell-epic, 5 in spell-app;  the kit has no `.claude/skills`)
  - then each doubt tried by hand, with mistakes on purpose:  a misspelled verb, a misspelled flag, the other wait's
    time unit
    - reading only, except `spell design build` into a scratch folder:  it crashes before writing anything
- `spell commands check` exits 1 today:
  - `epic change` and `epic move`:  on main, with no rows on the page
  - `spell readme pictures` / `root readme:pictures`:  ui-gaps' branch, the shared page's known branch effect
- Owners (`epic owns ... --json`):  no open epic's branch changes the files below today, but two:
  - ui-gaps' branch changes the kit's `package.json`:  finding 8, where it adds `readme:pictures` the same way
  - ui-gaps' branch changes `spell-brand/scripts/design-check.ts`:  its markup only
  - epic-engine, the tooling home, names `EpicProgram.ts` and the page server's `cli.ts` on its page
- Three findings are this surface's side of code findings in this sweep's epic-tools-kit report:
  - 2 (its #7, the flag readers, and #2, the kit's `spell/cli`)
  - 7 (its #2:  the two EXIT tables)
  - 9 (its #3:  `waitUntil()`)
  - the rest are new

## Findings

### 1. One page server command:  `epic server` takes `spell server`'s verbs

- **Kind:**  twice, and two words (its verbs)
- **Where:**
  - `spell server` (the kit's `src/cli/commands.ts:32-69`):
    `local`, `start [all]`, `stop [local|all]`, `status`, `url <file>`, `prune [--dry-run]`
  - `epic server` (spell-epic's `src/cli/epicGroups.ts:527-566`, run by `src/cli/EpicProgram.ts:507-516`):
    `serve`, `start [--all]`, `ensure`, `stop`, `status`, `url <file>`, `prune [--dry-run]`
    - it hands each verb straight to the kit's page server command line, which keeps two hidden verbs only for it:
      - `src/server/page/cli.ts:7-8`:  "`ensure`:  the same, hidden:  the old name, which spell-epic's
        `epic server ensure` still hands on"
      - `serve`:  the same case as `local` (`:61-62`)
    - its `--all` is rewritten into the kit's `start all` (`EpicProgram.ts:514`)
  - the skills and hooks say `epic server`:
    - `spell-epic/skills/details/SKILL.md:215,219` (`stop`, `ensure`, `url`)
    - `skills/epic/SKILL.md:730` (`ensure`), `skills/worktrees/SKILL.md:153` (`prune`)
    - `hooks/worktree.mjs:464`, `hooks/server-prune.mjs:5`
  - the docs say `spell server`:
    - the kit's `AGENTS.md:142,282,461`, `README-cli.md:234-248` (its table of verbs), `README-server.md` (10 times)
    - spell-app's `/spell-serve` and `/spell-docs` skills, spell-ui's `README-site.md`
    - spell-epic's own READMEs (`README-adopting.md:469` ...)
  - counted:  108 mentions of `spell server <verb>` and 66 of `epic server <verb>` across the repos;
    46 and 1 in the guides
  - the commands page lists both on each of its seven page-server rows (`commands.json5:3014-3135`);
    its targets say skills call `spell server url`
- **Shared:**  one page server, one command line (`src/server/page/cli.ts`), the same seven jobs.
- **Differs:**
  - running it in the foreground:  `local` / `serve`
  - starting it and saying where it is:  `start` / `ensure`
    - `epic server start`'s help says nothing of what it prints, though it prints the same JSON
  - every web server:  `start all`, a word / `--all`, a flag
    - every other "all" in both tools is `--all`, but `spell server stop all`
  - in a repo with no page server of its own (one `epic init` set up), `epic server` is the machine's epic server,
    `epic hub` (`EpicProgram.ts:510-512`):  the one real reason for a second name
- **The one:**  the kit's verbs, which Owen settled when he deleted `spell server ensure`
  (epic `repo-split` J120:  "it was the same as start"):
  - `epic server` takes them as they are:  `local`, `start [--all]`, `stop`, `status`, `url`, `prune`
    - it maps them onto `epic hub` where there's no page server;  `epic hub` takes the same words
  - `all` one way in both:  `--all`
  - the page server's hidden `serve` and `ensure` go
  - the skills and hooks say `epic server start` (or `spell server`):  one spelling in every doc
- **Net effect:**
  - a person or a skill learns one set of verbs for the page server, whichever command they type
  - `src/server/page/cli.ts` loses the two names it keeps for a caller;  `start` reads the same in every help
- **Saves:**  the two hidden verbs and the `--all` rewrite (about 15 lines);  66 mentions down to one spelling.
- **Evidence:**
  - `epic server --help` beside `spell server --help`;  `grep -n ensure src/server/page/cli.ts`
  - repo-split J119 and J120 (`parts/j119.html`, `parts/j120.html`) leave `epic`'s verb names to "the epic-renames
    step";  no open epic's page plans that step (its only mentions:  J119, J120, Q46)
- **Owner:**  no branch owner;  epic-engine's page names `EpicProgram.ts` and `cli.ts` (the tooling home).

### 2. `epic`'s verbs on commander:  their flags in their help, a typo an error

- **Kind:**  twice:  the catalog's "A command"
  - merges with epic-tools-kit #7 (one flag reader) and #2 (the kit's `spell/cli` base):
    this is what people see of them
- **Where:**
  - all 68 verbs' `epic <verb> --help` list one option, `-h, --help`
    - every flag lives only in a hand-written usage line:  `EpicProgram.ts`' `.usage()` calls,
      `epicGroups.ts`' `usage` strings
  - that usage is written again in each tool's own reader, and a third time in `PlanDocCommands.ts:1154-1330`
    (`USAGE`, the old `yarn plan-doc` order);  they drift:
    - `epic pages update --help`:  `[<page>...]`, its example `epic pages update guides/greet.html`
      (`epicGroups.ts:633-637`);  the tool takes no page (`spell-epic/src/tools/update.js:24-30`)
    - `epic open` shows the Epic Docs tab, `--review` the Review tab (`EpicProgram.ts:222-226`)
    - `PlanDocCommands.ts:931-938`'s `open <name> [--docs]` shows the Review tab, `--docs` Epic Docs
      (the CLI passes `--docs`)
  - a misspelled flag:
    - `spell` (commander):  `spell map status --jsn` -> "error: unknown option '--jsn' (Did you mean --json?)"
    - `epic`, most verbs:  ignored
      - `epic summary coherence --jsn` prints the text summary, and exits 0
      - `epic list --jsn`, `epic config --jsn`, `epic worktree list --jsn` print text
      - `epic airplane check --fx` runs the check and fixes nothing, without a word
    - `epic`, a few tools:  refused, each its own way:  `pages fuss` (`fuss.ts:154`), `pages update`
      (`update.js:27-30`), `pages offline`
- **Shared:**  a verb, its arguments, its flags, its help.
- **Differs:**  which flags each verb takes;  `epic`'s `<epic>#<id>` first argument.
- **The one:**  each verb's flags as commander options, as every `spell` command has them
  (and as the catalog's "A command" says):
  - commander writes the help, refuses an unknown flag and suggests the near one
  - epic-tools-kit #7's one reader is the step before
- **Net effect:**
  - `epic <verb> --help` lists its flags
  - a skill's misspelled `--json` is an error, never text read as JSON
  - one usage per verb, so the help's examples run
- **Saves:**  the usage strings written twice for 68 verbs, and the third copy in `PlanDocCommands`;
  epic-tools-kit #7's 65 lines.
- **Evidence:**
  - the four misspellings above, run
  - `epic pages update guides/greet.html` -> "unknown argument(s):  guides/greet.html", exit 2
  - `awk` over the 68 helps:  none lists a flag
- **Owner:**  no branch owner today;  epic-engine (the tooling home).

### 3. One page check for every kind of page:  "Finishing a page" as a command

- **Kind:**  twice
- **Where:**
  - the steps, as prose:  spell-epic's `src/AGENTS.md:2257-2266`, "Finishing a page"
    - five raw tool runs from spell-epic's root:  `yarn tsx src/tools/doc-links.js <page>`, `yarn vp fmt`,
      `doc-links.js --check`, `node src/tools/check-spell.js <page>`, `epic pages index`
  - copied:  `spell-epic/skills/voice/SKILL.md:67-70`;  `src/AGENTS.md:633-635` and `:703` (check-spell by hand)
  - pointed at:
    - `skills/epic/SKILL.md:647,1112`, `skills/details/SKILL.md:117`, `skills/docs-check/SKILL.md:134`
    - spell-app's `.claude/skills/design/SKILL.md:91-95,149`
    - the kit's `AGENTS.md:685`:  every changelog entry
  - the commands that do part of it:
    - `epic lint <epic>` (`PlanDocCommands.ts:867-929`):  the same link check (`EpicTargets.problemsIn()`, as
      `doc-links.js --check`), then `check-spell.js`, for an epic page only
    - `epic pages update` (`update.js:1-12`):  rebuilds `spell-ui.js` and re-indexes, then runs the link check and
      `check-spell.js` on EVERY page, never one
      - its help calls it "check the docs pages against their template"
- **Shared:**  links resolve, and the page draws without problems in a headless browser, for one page.
- **Differs:**  the page's kind (an epic page's ids and parts too);  whether to link, format and re-index first.
- **The one:**  what the commands page already plans (`commands.json5:2729-2794`, R2:  "Five-step sequence lives only
  in prose;  strong CLI / script candidate"):
  - `epic pages check <page>...`:  links and the browser, for any kind of page
    - `epic lint` runs it for an epic page, after its own checks
  - `epic pages finish <page>`:  link, format, check, and re-index when the page is new or retitled
  - `epic pages update` keeps the bundle and the every-page run, and says so in its help
- **Net effect:**
  - every skill says one line, `epic pages finish <page>`;  the steps live in one place, the command
  - a guide is checked the way an epic page is, by one command
- **Saves:**  the five-step prose and its copy in `/voice`;  eight pointers become one call.
- **Evidence:**
  - `grep -rn 'Finishing a page'`:  8 hits
  - no open epic's page names `pages check`, `pages finish` or "Finishing a page"
- **Owner:**  no branch owner;  epic-engine (the tooling home).
  - The agent-files surface may report `/voice`'s copy:  it's the same finding.

### 4. One switch for "change nothing, tell me what you'd do"

- **Kind:**  two words (a flag), with opposite defaults
  - the word list has no entry:  a question for it
- **Where:**
  - `--dry-run`, on 16 commands that write by default:
    - `spell publish`, `spell server prune` (the kit's `src/cli/commands.ts:219,68`);  `spell spellx convert`
      (spell-parser's `src/cli/commands.ts:251`)
    - `epic split`, `migrate`, `init`, `phase ... took` (`EpicProgram.ts:272,408,414,580`)
    - `epic ask fold`, `worktree move`, `worktree patch`, `session icons`, `shared migrate`, `window move`,
      `server prune`, `pages create` (`epicGroups.ts:73,275,307,348,421,440,561,640`)
    - the kit's `tools/rename-packages.ts:69`
  - `--write`, changing nothing by default:  `spell ui rename` (spell-ui's `src/cli/commands.ts:60`)
  - `--apply`, changing nothing by default:  `epic backfill` (`EpicProgram.ts:401-403`);
    the kit's `tools/content-links.ts:524`
  - `--check`, writing by default:  `spell format` (spell-parser's `src/cli/commands.ts:106`), and the scripts on
    `writeOrCheck()`:  `tools/mermaid-pretty.ts:82`, spell-app's `scripts/examples-readme.ts:82` and
    `scripts/vscode-grammar.ts:26`, spell-brand's `scripts/site-data.ts:59`
  - `--check-only`:  `spell watch` (spell-parser's `src/cli/commands.ts:96`)
- **Shared:**  report what would change, change nothing.
- **Differs:**
  - the default:
    - `spell ui rename src/` and `epic backfill seo` change nothing unless told
    - `epic migrate --all`, `spell format` and `spell spellx convert` change files unless told
  - the exit code:
    - `--dry-run` exits 0 whatever it found (`migrate.js:422-425`)
    - `--check` and `ui rename`'s dry run exit 1 when something would change:  for a gate
- **The one:**  two words, one contract each:
  - `--dry-run`:  say what it would do, exit 0
  - `--check`:  the same, but exit 1 if anything would change
  - every command writes by default;  `--write`, `--apply` and `--check-only` go
  - or, if Owen keeps a safe default for the two that rewrite many files (`ui rename`, `backfill`):
    `--write` the one word for those, `--apply` renamed to it
- **Net effect:**
  - the next command that writes picks its switch from one rule
  - nobody runs `epic backfill` thinking it changed things, or `spell ui rename` expecting a dry run's exit 0
- **Saves:**  three flag names;  four flags renamed.
- **Evidence:**  each command's `--help`;  `grep -n -e --dry-run -e --apply` over `EpicProgram.ts` and
  `epicGroups.ts`.
- **Owner:**  no branch owner;  the word list's "Open" first (Owen's call), then each repo's commands.

### 5. The commands page's nouns and verbs, read from the CLI

- **Kind:**  twice:  each command's verbs and facts, written by hand on the page and in the CLI
- **Where:**
  - the guide sends every new command's author to the page's "5.2 Names" (`commands.md:53`):
    "The nouns, and their verbs ... Reuse a noun before inventing one"
  - that table (`commands.html:622-925`):
    - `new` in six rows, where the CLI settled on `create` and `add` (repo-split Q46):
      `worktree` (:656), `park` (:700), `bedtime` (:707), `docs` (:737), `choices` (:758), `pack` (:831)
    - nouns and verbs the CLI renamed or dropped:
      - `docs` (now `epic pages`), `bundles build check` (`spell bundle [names]`, `check`),
        `vscode` (`spell app vscode`), `stock` (`epic status`)
      - `server start [--all]` (`start all`), `design build push pull` (seven verbs today)
      - `shared ... repair` (gone, Q45), `repo check` (never built;  `epic repo` is the epic server's repos)
    - 20 of today's nouns missing:  `pages`, `ask`, `comments`, `notes`, `inbox`, `saga`, `hub`, `config`, `voice`,
      `airplane`, `readme`, `publish`, `ui`, `app`, `projects`, `icon`, `ssr`, `spellx`, `translate`, `bundle`
  - the rows:  67 of 325 name a command or path that's gone
    - `spell dev`, `packages/...`, `.claude/hooks/`, `scripts/serve.mjs`, the python scripts, `/whassup`
    - 33 of them in `runs`, 25 in `target`
  - `spell commands check` compares only each row's `names` (`src/cli/commands/commandsCommand.ts:10-22`):
    it sees none of this
- **Shared:**  a command's noun, its verbs and arguments, and what it runs.
- **Differs:**  the page's copy was right on the day it was written.
- **The one:**  the CLI's own tree:  commander knows every verb, argument, option and description
  (`spell help` and `epic help` print them)
  - `spell commands` writes each command's verbs and usage into the page's data, and the Names table from it
  - `spell commands check` compares verbs too, and fails on a gone one
  - the rows keep only what a person adds:  the operation, its marks, the target, notes
- **Net effect:**
  - the page a new command's author reads lists today's nouns and verbs
  - `check` catches a renamed verb, not only a renamed command
- **Saves:**  the Names table and the 67 stale rows' copied facts, kept by hand.
- **Evidence:**
  - `node bin/spell.mjs commands check`:  exit 1 (`epic change`, `epic move`)
  - a JSON5 read of `commands.json5` for the 67 rows;  the table against `spell help` and `epic --help`
- **Owner:**  the guide is shared content;  `spell commands` has no branch owner.

### 6. `spell design`:  one way to the design system's tools, and it runs

- **Kind:**  twice:  two ways that differ, and one is broken
- **Where:**
  - `spell design build` exits 1 before it starts:
    "Cannot resolve tsconfig at path: .../spell-ui/scripts/tsconfig.json"
    - spell-ui's `src/cli/designCommand.ts:38` names it;  the file went in repo-split P14 (`6d05d4f5`)
  - `spell design <verb> --help` reaches the tool, not commander (`.helpOption(false)`,
    spell-ui's `src/cli/commands.ts:159`)
    - `spell design check --help` -> "!! no bundle at .../--help:  run `yarn design:bundle` first"
    - `spell design build --help` crashes as above
  - the other way:  spell-ui's `yarn design:build` (`package.json:568`), spell-brand's `design:bundle` and
    `design:check` (`package.json:101-102`)
    - `design:build` runs without the `--brand` that `spell design build` adds (`designCommand.ts:12,57`)
  - each script's header names both ways (`design-build.ts:2`, `design-bundle.ts:2`, `design-check.ts:2`);
    the check's message names the yarn one (`design-check.ts:95`)
  - the `/design` skill pushes with `spell design build` first (spell-app's `.claude/skills/design/SKILL.md:44-46`):
    it fails there today
- **Shared:**  the same three scripts.
- **Differs:**  the tsconfig (one missing), the brand argument, `--help`, what the messages tell you to run.
- **The one:**  `spell design <verb>`:
  - its verbs with commander options, so each has its own `--help`
  - the scripts' messages name `spell design bundle`
  - the yarn scripts its aliases (`"design:build": "spell design build"`), or gone
- **Net effect:**
  - the design push works from its first step again
  - one command in the docs (the yarn names have 50 mentions)
- **Saves:**  three yarn scripts that differ become aliases;  the tsconfig path goes.
- **Evidence:**
  - `node bin/spell.mjs design build --out <scratch>` -> exit 1, nothing written
  - `node bin/spell.mjs design check --help`
- **Owner:**  no branch owner;  ui-gaps' branch changes `design-check.ts`'s markup only.

### 7. One exit code for a mistyped command:  2, never the "found something" 1

- **Kind:**  two words:  an exit code a skill reads
  - merges with epic-tools-kit #2, which makes the two EXIT tables one
- **Where:**
  - exit 1, commander's default:
    - "unknown command":  `spell readme chek`, `spell pack chek`, `spell map stauts`, `spell coherence scor`
    - "unknown option":  `spell map status --jsn`, `spell readme check --jsn`, `spell bundle check --jsn`
    - the kit's `src/cli/program.ts:22` sets `showHelpAfterError`, and no `exitOverride`
  - exit 2:  `spell commands chek`, `spell wwod chek`:  their verb is an argument, so it's a `CliError`
  - exit 1:  `epic airplane chek` (`unknownVerb()`, `EpicProgram.ts:812-819`, `EXIT.ERRORS`)
  - exit 0:  `epic summary coherence --jsn` (finding 2)
  - the two tables disagree:
    - the kit's says a usage mistake is 2, "e.g. an unknown project or verb" (`src/cli/cli.types.ts:14-21`)
    - spell-epic's says 1, "it failed, or found problems;  an unknown verb" (`src/command/command.types.ts:15-22`)
  - exit 1 is "found something" for about twenty verbs skills branch on:
    - `spell lint`, `test`, `format --check`, `bundle | pack | readme | commands | translate check`, `readme test`,
      `ui rename`, `server status`
    - `epic lint`, `airplane check`, `ask answer` and `choices answer` ("exit 1 if none"), `ask draft`, `agents add`
- **Shared:**  "the command line was wrong", told apart from "the work found something".
- **Differs:**  who builds the command:  commander, a verb taken as an argument, `epic`'s dispatcher.
- **The one:**  2 for every usage mistake:
  - `spellProgram()` with commander's `exitOverride()`, mapping an unknown command, unknown option or missing
    argument to `EXIT.USAGE`
  - `unknownVerb()` exiting USAGE;  one EXIT table
- **Net effect:**  a skill reading exit 1 as "stale" or "no answer yet" never mistakes a misspelling for it.
- **Saves:**  no lines;  one rule instead of three outcomes.
- **Evidence:**  the eleven runs above, their exit codes printed.
- **Owner:**  no branch owner.

### 8. Yarn scripts that run a command's tool, and tools that name the yarn script

- **Kind:**  twice
  - the guide:  repo actions are "one-line aliases of a `spell` call" (`commands.md:40`)
- **Where:**
  - the kit:
    - `readme:check` runs `tools/readme-check.ts` (`package.json:188`), as `spell readme check` does
    - `readme:test` runs Vitest's `readme` project (`:189`), not `spell readme test`'s `tools/readme-test.ts`
      - that tool's header documents `yarn readme:test README.md` and `yarn readme:test --list`
        (`tools/readme-test.ts:28-30`)
      - only the `spell` path takes them:  `vitest run` reads test-file filters, and has no `--list`
  - copied now:  ui-gaps' branch adds `readme:pictures` as `node tools/readme-pictures.ts`, the same shape
  - spell-epic:
    - `docs:update | index | new | open | link` (`package.json:301-307`) run the tools `epic pages update | index |
      create | open | link` run (`EpicTools.ts:190-195`), under the old noun, and `new`
    - `details` (`:306`) runs `epic ask`'s tool (`EpicTools.ts:183`), which spell-app calls `yarn ask`
      (`spell-app/package.json:130`)
  - the tools say the yarn name:
    - `epic pages create` -> "docs:new:  usage:  epic pages create ..." (`new-page.js:80`)
    - `epic pages open x` -> "docs:open:  no page x" (`open.js:31`)
    - `epic pages update` prints "== docs:update summary" (`update.js:63,102`)
    - `spell design check` -> "run `yarn design:bundle` first" (finding 6)
  - spell-epic's `src/AGENTS.md:580` documents `yarn docs:* ~== epic pages update | index | new | open | link`
- **Shared:**  the same tool file.
- **Differs:**  the name (`docs` / `pages`, `new` / `create`, `details` / `ask`), the runner (`readme:test`), and the
  arguments each takes.
- **The one:**  the commands page's R8 move:
  - each yarn script an alias of its command (`"readme:check": "node bin/spell.mjs readme check"`),
    or deleted where nobody types it
  - each tool's messages name its command
- **Net effect:**
  - one name per job in every message and doc
  - `yarn readme:test README.md` does what its tool says
- **Saves:**  about 12 scripts become aliases or go;  five tools' messages renamed.
- **Evidence:**  `epic pages create` and `epic pages open no/such/page.html`, run;  each `package.json`'s scripts.
- **Owner:**  ui-gaps' branch changes the kit's `package.json`:  cheapest to tell now, before `readme:pictures`
  merges.  The rest:  no branch owner.

### 9. One way to say how long to wait

- **Kind:**  two words:  a flag and its unit
  - merges with epic-tools-kit #3 (`waitUntil()`), which names three of the units
  - this adds the flag names, a fourth unit, and what a wrong one does
- **Where:**
  - `--timeout 8h`, a unit required:  `epic ask | choices | comments wait`
    (`details.js:712-717`, `duration()`;  imported by `comments.ts:54` and `choices.js:47`)
  - `--timeout <seconds>`, a unit refused:  `epic inbox wait` (`InboxCommands.ts:268-271`)
  - `--max` and `--every <seconds>`, nothing refused:  `epic park wait` (`Parking.ts:63`), `epic agents wait`
    (`agents.ts:72-73`)
    - `Number("2h")` is NaN:  a NaN deadline never passes (`Parking.ts:148,153`), and
      `setTimeout(done, NaN)` doesn't pause (`:155`)
  - `--review-timeout`, a bare number in MINUTES:  `spell translate` (spell-parser's `src/cli/NamesReview.ts:441-451`)
  - `/epic` types `epic inbox wait <epic> --timeout 5` (`skills/epic/SKILL.md:699`);
    `/details` types `epic ask wait <slug>` (`skills/details/SKILL.md:201`)
- **Shared:**  how long to wait, and how often to look.
- **Differs:**  what a bare number means (seconds, minutes, refused);  the flag's name.
- **The one:**  `duration(text)` in the kit's `spell/util/time`, standalone so plain node loads it:
  - a unit always accepted, a bare number in seconds, anything else refused
  - `--timeout` for how long and `--every` for how often, on every wait
- **Net effect:**
  - a session types one kind of time limit on every wait
  - a wrong one is an error, never a wait without end
- **Saves:**  two parsers and three `Number()` reads become one;  `--max` and `--review-timeout` renamed.
- **Evidence:**
  - `epic inbox wait coherence --timeout 8h` -> "--timeout in seconds, not '8h'"
  - `epic ask wait debut-themes --timeout 3300` -> "a duration is like 8h, 30m or 1h30m:  '3300'"
  - the NaN:  read from the code, not run
- **Owner:**  no branch owner.

### 10. JSON by default, or `--json`:  one rule

- **Kind:**  two words:  how a command is asked for JSON
- **Where:**
  - JSON with no flag:  `spell server start | status` (the kit's `src/cli/commands.ts:42,58`), `epic server status`,
    `epic hub status`, `epic worktree status`, `epic park list | candidates` (`epicGroups.ts:550,592,262,376,382`)
  - text, and JSON with `--json`:  `epic status`, `list`, `summary`, `worktree list | repos`, `spell map status`,
    `spell bundle`, and most others
  - `--json <file>`, writing a file:  `spell translate speedtest` (spell-parser's `src/cli/commands.ts:235`)
  - the commands page knows:  "`spell server status` (JSON already;  `--json` not yet)" (`commands.json5:3108`)
- **Shared:**  a reader's answer, as JSON.
- **Differs:**  whether the flag exists, and what it takes.
- **The one:**  the guide's rule, "with `--json` when the skill reads the answer" (`commands.md:28`):
  - text by default, JSON with `--json`, everywhere
  - a file with its own flag (`--out <file>`)
- **Net effect:**  a skill writes `--json` whenever it reads, and gets JSON;  a person gets text.
- **Saves:**  seven verbs gain the flag;  one flag stops taking a value.
- **Evidence:**  `epic worktree status coherence`, `epic park list`, `spell server status` print JSON;
  `epic status` prints a table.
- **Owner:**  no branch owner.

### 11. "Don't open a browser" and "skip the browser check":  one flag each

- **Kind:**  two words:  a flag, not in the word list yet:  a question
- **Where:**
  - don't open one for a person:
    - `--headless`:  `spell app serve`, `spell app preview serve` (spell-app's `src/cli/commands.ts:45,67`);
      yarn `start` uses it
    - `--no-browser`:  `spell run` (spell-parser's `src/cli/commands.ts:76`)
    - `--no-open`:  `epic window open`, `epic phase ... done` (`epicGroups.ts:478`, `PlanDocCommands.ts:197`)
    - `SPELL_NO_BROWSER`:  the kit's `src/server/open.ts:4,15`
  - skip the headless check:
    - `--no-browser`:  `epic lint` (`EpicProgram.ts:231`)
    - `--no-check`:  `epic pages update` (`update.js:5,26`)
- **Shared:**  open nothing for a person;  or, run no headless check.
- **Differs:**  the name;  and `--no-browser` means each, in turn.
- **The one:**  `--no-browser` for "open nothing", as `spell run` and `SPELL_NO_BROWSER` say it;
  `--no-check` for "skip the check".
- **Net effect:**  `spell app serve --no-browser` works as `spell run`'s does;  `epic lint`'s flag says what it skips.
- **Saves:**  two flag names.
- **Evidence:**  each command's `--help`.
- **Owner:**  no branch owner.

### 12. The epic a verb acts on:  one way to name it

- **Kind:**  two words:  the first word, or a flag
- **Where:**
  - `epic --help`, "Naming what a verb acts on":  the epic is the first word (`seo`, `seo#J3`)
  - `--epic <epic>` instead:  `epic ask create`, `epic choices create`, `epic comments gather`, `epic agents list`
    (`epicGroups.ts:17,83,141,183`)
  - the first word, beside them in the same groups:  `epic ask list [<epic>]`, `epic choices list [<epic>]`,
    `epic comments list [<epic>]`, `epic notes list [<epic>]` (`:61,117,125,161`)
  - `--epic` as a switch meaning "isolating for an epic":  `epic window should-stay --epic` (`:510`)
- **Shared:**  which epic.
- **Differs:**  where the epic goes when the verb has a subject of its own:  a slug, a page.
- **The one:**  one rule for every group:  the epic first, as `epic --help` says, or `--epic <epic>` wherever a group's
  verb names one;  `should-stay`'s switch under another name.
- **Net effect:**  the next group verb takes the epic the way its siblings do.
- **Saves:**  four or five usages change.
- **Evidence:**  `epic ask --help`, `epic comments --help`, `epic agents --help`.
- **Owner:**  no branch owner.

### 13. Showing a page:  one verb, one default place

- **Kind:**  two words (`open` and `show`)
  - the word list's "Open" already asks about show / hide:  a question
- **Where:**  all on `Window.show()` (`window.mjs:973`), most through `openInVSCode()` (`pages.js:611`):
  - `epic open <epic> [--review]`:  Epic Docs by default (`EpicProgram.ts:222-226`)
  - `epic pages open <page> [--vs | --review]`:  Chrome by default (`epicGroups.ts:655`)
  - `epic window show <file> [--review]`:  Epic Docs (`:465`)
  - `epic pages link <page> --show [--review]`:  Epic Docs (`:661`)
  - `epic ask show`:  the Review tab (`details.js:117`);  `epic choices show`:  Epic Docs (`choices.js:82`)
  - `yarn plan-doc open <name> [--docs]`:  the Review tab (`PlanDocCommands.ts:931-938`)
  - and `open` means more:  `epic window open` opens a VS Code window, `epic session open` a session
- **Shared:**  put a page in front of Owen.
- **Differs:**  the verb, the default place, the flag for the Epic Docs tab (`--vs`, `--docs`, nothing).
- **The one:**  one verb for it (Owen's call:  `show`, as `window show` and `ask show` say, or `open`):
  - the side bar by default, `--review` for its Review tab, a flag for Chrome
  - the two pages Owen answers on (details, choice) in one tab
- **Net effect:**  one command to show any page;  a details page and a choice page open in the same tab.
- **Saves:**  `--vs` and `--docs` go;  six verbs agree.
- **Evidence:**  the six helps;  `grep -n 'openInVSCode(file'` over `details.js` and `choices.js`.
- **Owner:**  no branch owner.

### 14. `epic inbox status` writes:  call it `doing`

- **Kind:**  two words:  one verb, two ideas
- **Where:**
  - `epic inbox status <epic> "<text>"` sets the page's toolbar line (`InboxCommands.ts:104-130`, `setDoing()`;
    `EpicProgram.ts:1038`)
  - every other `status` only reads:  `epic status`, `epic worktree | shared | airplane | server | hub status`,
    `spell server | map status`
  - `/epic` types it three times (`skills/epic/SKILL.md:414,744,816-817`)
- **Shared:**  the word.
- **Differs:**  reading, against writing.
- **The one:**  `epic inbox doing <epic> "<text>"`:  the inbox's own name for it (`doing`, `setDoing()`).
- **Net effect:**  `status` reads everywhere;  a verb that sets something says so.
- **Saves:**  one verb renamed, three skill lines.
- **Evidence:**  `epic inbox --help`.
- **Owner:**  no branch owner.

## Considered, left out

- `spell-pack build | check` beside `spell pack build | check`:  one mechanism (`ComponentPack`), two front ends;
  the bin runs a pack with its own tsconfig, and the packs' `pack:build` / `pack:check` alias it.
- `spell test` / `epic test` / `spell readme test` / yarn `test`, and `spell lint` / `epic lint` / yarn `lint`:
  different jobs and targets;  the guide keeps the spell language's commands bare.
- spell-app's `yarn stop` beside `spell server stop all`:  different servers (the dev servers, found by process;
  the page server and its editor, by their records).
- `epic status` beside `epic worktree list`:  the stock-take includes the list, on purpose.
- The worktree steps still in skill prose (the merge check, carrying edits, cleanup;  `/isolate done`'s raw
  `git status` and `git log main..HEAD` beside `epic worktree repos`):  no command does them yet;
  the commands page's roadmap plans them (R3).
- `epic hub`'s verbs, the same as `epic server`'s:  a different server (the machine's one);  it follows finding 1.
- `--list` (`spell readme test`, `epic test`, `epic migrate`):  one meaning everywhere.
- `create` (`epic create`, `epic pages | ask | choices | saga create`, `spell pack | app create`):  one verb already
  (repo-split Q46).
- `--stale` (`spell bundle`, `spell compile`), `--quiet` (only `spell ui rename`), `--verbose` (global):
  one meaning each.
- `epic ask` beside "details page" (the page kind's one name;  `/details`, yarn `details`):  `ask` was decided in epic
  `epic-workflow` P9, before the page-kind words (P14);  a question if Owen wants one noun.
- The docs pages' engine bundle (`spell-ui.js`) outside `spell bundle`:  committed on purpose, since it loads from
  `file://` (sweep 1 left its esbuild as `Bundle`'s opposite).
- Top-level commands with no verb (`spell icon`, `ssr`, `projects`, `speedtest`, `bundle`):  each one job, one way;
  the Names table (finding 5) should list them.
- `spell commands [verb]` and `spell wwod [verb]` taking the verb as an argument:  typed like a sub-command;
  only their exit code for a misspelling differs (finding 7).
- `yarn plan-doc`'s old argument order:  "a name only code reads", by the kit's `AGENTS.md`, "Words";
  its `open` default is evidence in finding 2.
- `readme pictures` failing `spell commands check`:  ui-gaps' branch, the known effect of a shared page and a
  branch's CLI (the code-debt log, "docs").
