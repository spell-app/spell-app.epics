# Sweep 2:  epic-tools-kit

Area:  spell-epic's `src/` (but `components/`, `tools/_assets/`, `answers/`, `review/`) and `hooks/`;
the kit's `src/`, `tools/`, `scripts/`.
By the coherence agent, 2026-10-26 (epic `coherence`, sweep 2).  No code changed.

- The score here:  87 of the 238 copies `spell coherence score` counts today
  (Timing 32, Fetching 16, A command 7, Numbers 5, A JSON5 file 4, A new syntax 4, Watching files 3 ...).
- New code since sweep 1 that rebuilt what the catalog has:
  - BundleBuild's own watcher, 2h39m after the catalog named LiveReload THE watcher (finding 8)
  - WorkTime's regex escape, 50 minutes after P6 moved every escaper onto `escapeRegExp()` (finding 15)
  - ActiveTime's transcript reader, beside four others (finding 1)
  - RootLinks' walk of the content folder, beside ContentRelink's (finding 9)
- Owners:  epic-engine's branch changes `Sessions.ts`, `EpicProgram.ts`, `InboxCommands.ts`, `ReviewInbox.ts`,
  `PlanDocCommands.ts` and `epicArgs.ts` (findings 1, 2, 3, 6, 7, 12);  no open epic's branch changes the rest
  (`epic owns ... --json`).

## Findings

### 1. One reader for Claude Code's folder:  its live sessions and its transcripts

- **Kind:**  twice
- **Where:**
  - Claude Code's folder, six ways, with three different variables:
    - `spell-epic/src/command/Sessions.ts:683` `claudeHome()`:  `SPELL_CLAUDE_HOME`, else `~/.claude`
    - `spell-epic/src/config/SessionFolders.ts:49` `home()`:  `CLAUDE_CONFIG_DIR`, else `~/.claude`
    - `spell-epic/src/list/RunningEpics.ts:78` and `spell-epic/src/window.mjs:1857`:  `SPELL_CLAUDE_HOME`
    - `spell-epic/src/tool/ReviewBackfill.ts:136`:  `~/.claude/projects`, no variable
    - `spell-epic/src/command/PromptGate.ts:200`:  `SPELL_SESSION_TITLES_DIR`, else `~/.claude/session-titles`
  - its live sessions (`sessions/<pid>.json`, the process alive), three readers:
    `Sessions.ts:369` `running()`, `RunningEpics.ts:288` `liveSessions()`, `window.mjs:1856` `liveSessions()`
    (its docstring:  "the same records `RunningEpics.liveSessions()` reads");
    two types named `LiveSession` (`spell-epic/src/command/command.types.ts:167`, `RunningEpics.ts:313`)
  - a session's transcript by id, line for line twice:  `Sessions.ts:578` and `SessionFolders.ts:219` `transcriptOf()`
  - a file's last bytes, twice:  `Sessions.ts:841` `readTail()`, `SessionFolders.ts:283` `readEnd()`
  - an epic's sessions:  `Sessions.ts:515` `named()` (indexed:  `spell-epic/src/command/TranscriptIndex.ts:93` `scan()`)
    and `ReviewBackfill.ts:46` `sessionsOf()` with its own `scan()` (`:157`), every transcript read whole each run
  - a session's title, four rules:  `Sessions.ts:596` `title()` (custom, else ai:  "the same rule as the handoff hook"),
    `SessionFolders.ts:250` `lastTitle()` and `:268` `lastCustomTitle()`, `ReviewBackfill.ts:157` `scan()`,
    `spell-epic/hooks/handoff.mjs:69` `sessionTitles()`
  - a line as an entry:  `Sessions.ts:737` `parseJSONLine()`, `spell-epic/src/command/ActiveTime.ts:129` `parsed()`
    (new, epic-engine P41), `ReviewBackfill.ts:225` `parse()`, `handoff.mjs:76`
  - a message's content as blocks, a string one text block:  `ActiveTime.ts:139` `blocks()` (new), `Sessions.ts:630`,
    `ReviewBackfill.ts:182`
  - an `AskUserQuestion` not answered yet, twice in one file:  `Sessions.ts:633-647` (`digest()`) and `:811`
    `pendingQuestion()`
  - "a prompt Owen typed", four rules with four lists of the harness's own text:
    `Sessions.ts:751` `entryPrompt()`, `:774` `promptText()`, `:803` `HARNESS_MESSAGES`;  `ReviewBackfill.ts:147`
    `NOT_OWEN`;  `ActiveTime.ts:95` `gapBefore()`;  `spell-epic/src/command/Requests.ts:296` `promptBlocks()`
- **Shared:**  find Claude Code's folder, its live sessions and a session's transcript;  read the transcript's lines as
  entries and their content as blocks;  tell Owen's words from the harness's;  find a title.
- **Differs:**
  - which title:  the custom one only, custom else ai, or the last of either
  - the whole file, or its tail first;  which lines are parsed (a cheap `includes()` first)
  - sidechains skipped, or counted (`ActiveTime` reads an agent's own transcript)
- **The one:**  `ClaudeHome`, in spell-epic's `config/` beside `SessionFolders` (node's modules only, so the hooks and the
  window script load it):  `home()` (one rule for the variables), `liveSessions()`, `transcriptOf(id)`, `transcripts()`;
  and a `Transcript` reader beside it:  `entries()`, `blocksOf(entry)`, `titles()` (`{ custom, ai, last }`),
  `tail(bytes)`, `pendingQuestion()`, `isOwensPrompt(entry)`.
- **Net effect:**
  - `CLAUDE_CONFIG_DIR` stops meaning one folder to `SessionFolders` and another to `Sessions`, `RunningEpics` and the
    window script
  - `Sessions`, `SessionFolders`, `RunningEpics`, the window script, `ActiveTime` / `WorkTime`, `Requests`,
    `ReviewBackfill`, `PromptGate` and the handoff hook all ask it
  - `epic backfill` finds an epic's sessions through `Sessions.named()`, and its index
- **Saves:**  about 170 lines, about 23 copies.
- **Evidence:**
  - `git grep -n -P 'SPELL_CLAUDE_HOME|CLAUDE_CONFIG_DIR|homedir\(\), "\.claude"' -- spell-epic/src` -> the six
  - `Sessions.ts:578-590` beside `SessionFolders.ts:219-230`:  the same loop over `projects/`, the newest by mtime
- **Owner:**  epic-engine (its branch changes `Sessions.ts`;  its P41 wrote `ActiveTime` and `WorkTime`).

### 2. The `epic` command's base is the kit's `spell/cli`

- **Kind:**  rebuilt
- **Where:**
  - `spell-epic/src/cli/EpicProgram.ts:793` `runVerb()`:  the kit's `src/cli/run.ts:12` `runCommand()`, without its
    2-second cap on stdout's drain
    - the kit added the cap for a command that printed its answer on CI and never exited (repo-split I73, `da7eaff`,
      2026-10-23);  `runVerb()` still waits for the drain forever
  - `EpicProgram.ts:845` `rawArgs()`:  `src/cli/run.ts:37` `rawArgsAfter()`
  - `spell-epic/src/command/EpicTools.ts:91` `runChild()`:  `src/cli/tools.ts:66` `runChild()`, line for line;
    the kit's docstring (`tools.ts:64`) calls itself the copy, "which the kit can't import"
  - `EpicTools.ts:79` `toolArgs()`:  `src/cli/tools.ts:50` `toolArgs()`, without the real path
  - `EpicTools.ts:268` `flushed()`:  the drain again, with no cap
  - `spell-epic/src/command/command.types.ts:15` `EXIT` and `:29` `EpicCommandError`:  `src/cli/cli.types.ts:14` `EXIT`
    and `:28` `CliError`, the same values and the same body;  the kit's rule (`cli.types.ts:26`):  "Every repo's
    commands throw THIS class"
  - ten private `out()` in `spell-epic/src/command/`:  `Hub.ts:118`, `LinesOfCode.ts:392`, `Parking.ts:161`,
    `RepoInit.ts:343`, `Repos.ts:75`, `Requests.ts:663`, `Sessions.ts:806`, `Shared.ts:528`, `Stock.ts:415`,
    `Worktrees.ts:667`:  six are `CLI.out()` (`src/cli/run.ts:45`) exactly, four always add a newline
  - the tools' own start, "run me only as a script":  13 hand guards in four spellings
    - `spell-epic/src/tools/airplane.ts:209`, `choices.js:464`, `comments.ts:58`, `design.js:287`, `details.js:738`,
      `doc-links.js:156`, `fuss.ts:935`, `index.js:251`, `migrate.js:434`, `offline.ts:193`, `plan-doc.js:26`,
      `voice.ts:166`, `spell-epic/src/window.mjs:2002`;  and the kit's `tools/content-links.ts:550`
    - a hand guard is false when the script is run through a link, so the kit's `toolArgs()` runs every tool by its
      real path (`src/cli/tools.ts:46-49` says why)
- **Shared:**  run a verb and exit with its code, a known error's message alone, a crash's stack;  the words after a
  verb, as typed;  a child with the terminal attached, signals passed on;  the exit codes;  a line to stdout.
- **Differs:**  the error class's name;  the drain cap;  `toolArgs()`'s `tsx` loaders.
- **The one:**  the kit's `spell/cli`:  `runCommand()`, `rawArgsAfter()`, `runChild()`, `toolArgs()`, `out()`, `EXIT`,
  `CliError` (`EpicCommandError` a re-export, as spell-app's is);  `import.meta.main` for the guards (node 24, as the
  kit's `readme-check`, `readme-test`, `repos` and `mermaid-pretty` do already).
  - spell-epic's rule says its `cli/` and `command/` "NEVER import the kit's `spell` program (`spell/cli`), and load
    no spell" (`spell-epic/src/AGENTS.md:301`, `:401`).
  - The barrel isn't the program:  it leaves out `main.ts`, and loads node's modules, commander, chalk, `json5` and
    `RealPath` (`src/cli/*.ts` imports), no spell.  So the rule can say "never `spell/cli/main`".
- **Net effect:**
  - `epic` exits within 2s of its answer, as `spell` does:  the I73 fix reaches it
  - one error class for every repo's commands;  ten `out()`s and four helpers go
  - a tool run through a link starts;  the kit's real-path workaround can go
- **Saves:**  about 110 lines, 17 copies, and 14 guards.
- **Evidence:**
  - `git grep -n 'function out(text' -- spell-epic/src/command` -> 10
  - a probe in node 24.21:  the hand guard, run through a link, prints `false`;  `import.meta.main` prints `true`
    plainly, through a link and under `tsx`, and `false` when imported
- **Owner:**  epic-engine (its branch changes `EpicProgram.ts`).

### 3. Timing node code can reach:  `after()`, `every()` and `waitUntil()`

- **Kind:**  twice (the catalog's Wanted, "Waiting until something is true";  Timing's node copies)
- **Where:**
  - why no node code uses `after()` / `every()`:  their home is `spell/element` (`src/element/timing.ts`), and the
    kit's server and CLI may import util's generic files, never `element` (`src/server/AGENTS.md`, "of the kit,
    only";  `src/cli/AGENTS.md`, "Imports");  `git grep` finds no node user of either
  - waiting until something is true, 17 loops:
    - the kit:  `src/server/PidFile.ts:93` (a started server answers), `:153-157` (a process is gone, then again after
      `SIGKILL`), `src/server/FileLock.ts:88` `runAsync()` (the lock is free), `src/cli/commands/serverCommand.ts:69`
      `editorRow()` (the editor answers)
    - spell-epic:  `src/tools/details.js:584` `waitForAnswer()`, `src/tools/comments.ts:139` `wait()`,
      `src/tools/agents.ts:71` `waitForRedirects()`, `src/command/Parking.ts:139` `waitFor()`,
      `src/tool/InboxCommands.ts:268` `waitForWork()`, `src/window.mjs:713` `applyColors()` and `:838` `waitFor()`
      (one condition twice in one file, on its own `delay()`, `:1755`)
    - blocking, for sync callers (`Atomics.wait`):  `src/server/FileLock.ts:74` `run()`,
      `spell-epic/src/command/CheckoutServers.ts:137` `kill()`
    - the demo checks:  `spell-epic/src/demo/check-test-run.mjs:586` `waitFor()`, `:596` `waitForMark()`;
      `spell-epic/src/demo/check-review-epics.mjs:890` `waitInbox()`, `:899` `waitHeader()`
  - the other raw timers in node code, each an `after()` or an `every()`:
    - a sleep:  `src/cli/commands/ponyCommand.ts:97`, `spell-epic/src/demo/DemoServer.ts:151`;  node's own
      `timers/promises` one:  `spell-epic/src/tool/InboxCommands.ts:284`, `spell-epic/src/tools/agents.ts:85`
    - every N seconds:  `src/server/LiveReload.ts:71` (the sockets' ping), `src/server/runs/CommandRun.ts:504`
      (the heartbeat and the answers' poll), `spell-epic/src/tools/AskListeners.ts:76`
    - once, cancellable:  `src/cli/run.ts:24` and `src/server/page/BundleBuild.ts:199` (a timeout raced against a
      promise), `src/server/runs/CommandRun.ts:506` (the wait's end), `spell-epic/src/tools/showRoutes.ts:55`
    - `src/util/spell/TaskList.ts:193`, `:196`:  `after()` and `soon()`, but util can't import `element` either
- **Shared:**  look;  if it isn't so yet, wait a moment and look again, until a deadline;  then say it timed out.
- **Differs:**
  - what's looked at:  a file, a process, a server's answer, the window registry, an inbox
  - how often (50ms to 2s);  what a timeout does (`undefined`, exit 2, a throw);  blocking or not
  - a heartbeat stamped while waiting (`inbox wait`)
  - the timeout on the command line, in three units:  `epic ask wait --timeout 8h`, `epic inbox wait --timeout 3300`
    (seconds), `epic agents wait --max 3600` (seconds)
- **The one:**  `src/element/timing.ts` moved to `src/util/timing.ts`, re-exported by `spell/element`
  (it imports nothing, so plain node loads `spell/util/timing.ts`);
  `waitUntil(read, { timeout, every })` beside `after()` and `every()`, and a blocking form for the two sync callers.
- **Net effect:**
  - the kit's server and CLI may use `after()` and `every()` under their folders' rules
  - 17 hand loops become `waitUntil()` calls;  the wait commands take one kind of `--timeout`
  - Spell UI's bundles don't change:  its util barrel re-exports the file already
- **Saves:**  about 100 lines, 17 loops;  11 more raw timers named for when they run.
- **Evidence:**
  - `git grep -n -P '\b(after|every|soon)\(' -- src/server src/cli` -> only arrays' `.every()`
  - `git grep -n -P '(deadline|end|until)\s*=\s*Date\.now\(\)\s*\+'` -> the loops above
- **Owner:**  none for most;  epic-engine's branch changes `InboxCommands.ts`.

### 4. Where a moved file went:  one table, the Linker's

- **Kind:**  twice
- **Where:**
  - `tools/content-links.ts` (551 lines;  its test `tests/tools/content-links.test.ts`, 86):  repo-split I61's repair
    of the content's links;  `PATH_RULES` (`:136`, `rule()` `:139`) and a moved file's one namesake (`Layout`, `:40`)
  - `src/server/Linker.ts:381` `mendedPath()`, `:422` `movedPaths()`, `:410` `sameNamed()` (epic-engine P46):  the
    same moves (`packages/<name>/`, a folder into its repo's `src/`, `spell-lang` to `spell-parser`) and the same
    one-namesake fallback, for the root-links pass
  - content-links finds the content folder at `<kit>/spell.epics` (`tools/content-links.ts:526`), not by
    `contentFolderOf()`:  in a worktree it stops with ENOENT
- **Shared:**  map a path from before repo-split's moves to its file's one home now.
- **Differs:**  content-links mends path `title`s and `file`s written from the checkout's root (`tests/spell/...`);
  the Linker mends links (`href`, a `title="../x"`), as it writes every page, and lacks some of content-links' old
  names (`spell-util/`, `spell-server/`).
- **The one:**  the Linker's `mendedPath()`, given content-links' remaining rules;  the root-links pass
  (`epic migrate --step root-links`) mending path `title`s too;  then content-links.ts goes.
- **Net effect:**
  - the 81 stale path `title`s in 55 files that content-links' dry run finds today are mended by `epic migrate`
  - one place to add a move;  a 551-line tool and its test go
- **Saves:**  about 500 lines;  one of two move tables.
- **Evidence:**
  - `node tools/content-links.ts --kit ~/www/spell --content ~/www/spell/spell.epics` (a dry run) ->
    `would change 55 files:  {"title":81}`, e.g. `title="tests/spell/rules/es/methods/methods.test.ts"`
  - no epic page's skeleton holds an `href="../../`:  0 of 59 (P46's pass ran)
- **Owner:**  none (repo-split's and coherence's pages only name it).

### 5. Comments in code, for `epic pages fuss`:  oxc's

- **Kind:**  rebuilt (the catalog's "Comments in code")
- **Where:**
  - `spell-epic/src/tools/fuss.ts:540-647`:  `commentsIn()`, `readCode()`, `skipString()`, `skipTemplate()`,
    `skipRegex()`, `startsRegex()`, `REGEX_KEYWORDS`;  in its own words (`:545`):  "A light lexer, not a parser:
    JSX text with a `//` in it reads as a comment"
  - and its line starts, by hand (`fuss.ts:484`)
- **Shared:**  the comments of JS / TS source, in order, each with its offset and text.
- **Differs:**  nothing it needs:  `{ type, value, start, end }` is what it reads.
- **The one:**  `parseSync(file, source, { lang: "tsx" }).comments` from `vite-plus` (oxc), as spell-parser's
  `src/spell/node/spellSyntax.ts:303` reads a code example's comments;  every repo has `vite-plus` (spell-epic's
  `devDependencies`, `catalog:`).
- **Net effect:**
  - `fuss` stops flagging JSX text that holds a `//`;  no regex literal can fool it
  - a 100-line lexer goes
- **Saves:**  about 100 lines, 1 copy.
- **Evidence:**  from spell-epic, `parseSync()` of `const a = <p>see // not a comment</p>`, a `// a real one` line and
  `/\/\//g /* block */` gives the two real comments only.
- **Owner:**  none.

### 6. One heartbeat for a process that waits on Owen

- **Kind:**  twice
- **Where:**
  - three writers, each stamping `{ pid, seen }` every 30s and removing it as the process ends:
    - `src/server/runs/CommandRun.ts:447` `beat`, `:454` its removal, `:504` its interval;
      `src/server/runs/runs.types.ts:26-29` (90s stale, 30s beat)
    - `spell-epic/src/tools/AskListeners.ts:74` `hold()`;  `:117-120` (30s, 90s:  each docstring says "the review
      inbox's")
    - `spell-epic/src/tool/InboxCommands.ts:283`, `:305` `heartbeat()`, `spell-epic/src/tool/ReviewInbox.ts:608`
      `touchListening()`;  `ReviewInbox.ts:1233-1239` (30s, 90s)
  - three readers, "fresh, and its process runs":  `CommandRun.ts:133` `isWaiting()`, `AskListeners.ts:60`
    `liveFor()`, `ReviewInbox.ts:619` `liveListener()`
  - with them, the process checks epic `coherence` P7 left ("three process checks plain node can't share yet":
    `PidFile` imports the server's other files):  `AskListeners.ts:147` `isRunning()`,
    `spell-epic/src/command/CheckoutServers.ts:181` `alive()`, `spell-epic/src/window.mjs:1555` `isAlive()`;
    and `CheckoutServers.ts:137` `kill()`, the blocking twin of `src/server/PidFile.ts:144` `endProcess()`
  - `AskListeners.ts:123` `SIGNAL_NUMBERS`:  a hand table of what `os.constants.signals` holds
    (as `src/cli/tools.ts` uses it)
- **Shared:**  while a process waits on Owen, stamp a record every 30s, and remove it as the process ends, however it
  ends;  a reader takes the record as live while it's fresh (90s) and its process runs.
- **Differs:**  where the stamp lives (a file of its own, the run's `waiting.json5`, inside the review inbox);  the
  inbox's monitor holds it by its pid alone, with no stamp;  sync or async.
- **The one:**  `Heartbeat`, in the kit's server, in a file of node's modules alone (an `exports` entry, as
  `FileLock`'s), with `isProcessAlive()` and `endProcess()` moved beside it:  `hold(file, record)` -> stop,
  `isLive(record, { now })`, one pair of numbers.
- **Net effect:**
  - a wait for Owen is gone by one rule:  90s without a beat, or its process gone
  - the three process checks P7 left go:  plain node loads the new file
- **Saves:**  about 70 lines;  3 writers, 3 readers, 3 process checks (left out in P7:  plain node couldn't load
  `PidFile`;  still 3 copies).
- **Evidence:**  `git grep -n -P '(HEARTBEAT|STALE)_MS\s*=' -- src spell-epic/src` -> `30_000` and `90_000`, three
  times each.
- **Owner:**  epic-engine's branch changes `ReviewInbox.ts`, `InboxCommands.ts`.

### 7. One flag reader for the epic tools

- **Kind:**  twice (the catalog's "A command")
- **Where:**
  - two shared readers already:  `spell-epic/src/command/command.types.ts:51` `parseVerbArgs()` (10 files:  `Hub`,
    `LinesOfCode`, `Parking`, `RepoInit`, `Repos`, `Requests`, `Sessions`, `Shared`, `Stock`, `Worktrees`), and
    `spell-epic/src/tools/pages.js:697` `parseArgs()` (8 tools import it)
  - six more by hand:  `spell-epic/src/tool/PlanDocCommands.ts:1385` (names camelCased, as `parseVerbArgs()`),
    `spell-epic/src/tools/design.js:269` and `spell-epic/src/tools/details.js:725` (`pages.js`' own, word for word),
    `spell-epic/src/tools/new-page.js:67` (any next word a value), `spell-epic/src/window.mjs:1985` (a repeated flag
    a list), `spell-epic/src/command/epicArgs.ts:273` `flagsOf()` (a positional refused);  and
    `spell-epic/src/tools/check-spell.js:56` by `indexOf("--base")`
  - a flag's text value:  `spell-epic/src/tools/agents.ts:127` `stringFlag()`, `spell-epic/src/tool/SagaCommands.ts:269`
    `flagValue()`, and 28 inline `typeof flags.x === "string" ? ...` in 12 files (`window.mjs` 5, `Requests.ts` 5,
    `InboxCommands.ts` 4 ...)
- **Shared:**  `--key value` flags, bare `--switch`es, the rest in order.
- **Differs:**  names camelCased or as typed;  which flags take no value;  a repeated flag;  a positional refused.
- **The one:**  `parseVerbArgs()`, taking a repeated flag as a list, with `stringFlag()` beside it;  `pages.js`'
  `parseArgs()` a re-export.  Later, each verb's flags on commander, as the catalog says.
- **Net effect:**  one rule for what `--flag word` means across `epic`'s verbs and tools.
- **Saves:**  about 65 lines, 8 copies.
- **Evidence:**  `git grep -n -P 'function (parseArgs|parseVerbArgs|flagsOf|stringFlag|flagValue)\b' -- spell-epic/src`;
  `git grep -c -P 'typeof flags\.\w+ === "string" \?' -- spell-epic/src` -> 28.
- **Owner:**  epic-engine's branch changes `PlanDocCommands.ts`, `epicArgs.ts`.

### 8. Watching files:  LiveReload's watcher, on its own

- **Kind:**  twice (the catalog's Wanted, "A file watcher");  one copy new since sweep 1
- **Where:**
  - the home's watching half:  `src/server/LiveReload.ts:104` `watch()` (its ignore list, `:209`), `:131`
    `changed()` (quiet 250ms)
  - `src/server/page/BundleBuild.ts:138` `watch()`:  a recursive `fs.watch` per source root, a 3s quiet of its own
    (`:148`);  written 2026-10-25 11:54 (`9bc821d`), 2h39m after the catalog's "Watching files" named LiveReload
    (`2f99008`, 09:15)
  - `spell-epic/src/list/RunningEpics.ts:134` `watch()`:  a recursive `fs.watch`, a test of the path, then
    `live.changed()`
  - `src/server/runs/CommandRun.ts:512`:  the run's folder, `answers.json5` only, beside a poll
- **Shared:**  a recursive watch, what to skip, a quiet time, a callback;  closed with its owner.
- **Differs:**  what's skipped (an ignore list, or only these files);  how quiet (none, 250ms, 3s);  what a change does
  (report a page, rebuild, read the answers).
- **The one:**  LiveReload's watching half as its own class in `spell/server`, `FolderWatch`:
  `watch(dir, { ignore, only, quiet }, onChange)`, `close()`;  LiveReload uses it.
- **Net effect:**  BundleBuild, RunningEpics and CommandRun watch through it, and skip the editors' temp files and the
  locks LiveReload skips.
- **Saves:**  about 40 lines, 3 copies.
- **Evidence:**  `git log -S'### Watching files' -- agents/coherence/catalog.md` -> 10-25 09:15;
  `git log -S'watch(quiet = REBUILD_QUIET_MS)' -- src/server/page/BundleBuild.ts` -> 10-25 11:54.
- **Owner:**  none.

### 9. The content folder:  one list of its areas, one walk over its files

- **Kind:**  twice
- **Where:**
  - 13 lists of its folders in code, each its own subset:
    - where pages take notes and comments, the same three in three orders:  `spell-epic/src/tools/AirplaneInbox.ts:16`
      and `spell-epic/src/tools/GuideChanges.ts:22` `NOTE_FOLDERS`, `spell-epic/src/tools/PageInboxes.ts:14`
      `COMMENT_FOLDERS`
    - what pages may write:  `spell-epic/src/server/EpicServer.ts:639` `WRITABLE` (with `sagas`), beside the content
      repo's own `page-server.json5` `writable` (without)
    - the rest:  `src/server/Linker.ts:682` `AREAS`, `src/server/page/PageServer.ts:615` `DEFAULT_WATCH`,
      `spell-epic/src/tools/pages.js:115` `AREAS`, `spell-epic/src/tool/migrations/RootLinks.ts:191` `AREAS`,
      `spell-epic/src/tools/migrate.js:249-251`, `spell-epic/src/tools/offline.ts:107` `DOCS_FOLDERS`,
      `spell-epic/src/tool/SagaCommands.ts:260` `LINKED_FOLDERS`, `spell-epic/src/command/RepoInit.ts:319`
      `INIT_FOLDERS`, `spell-epic/src/config/EpicConfig.ts:77` (`sharedFolders`' default)
  - walking it for pages, each with its own skip list:  `pages.js:360` `findPages()` (`SKIP_DIRS`, `:335`),
    `spell-epic/src/tools/notesOnDisk.ts:53` `htmlFiles()` (`SKIPPED`, `:50`), `RootLinks.ts:168` `files()` (dot
    folders), `spell-epic/src/tool/migrations/ContentRelink.ts:113` `files()`
  - rewriting its files as text:  `RootLinks.ts:71` `run()`, each file under its page's lock (`lockOf()`, `:159`;
    `LOCK`, `:197`, copied from `migrate.js:355` `withLocks()`), and `ContentRelink.ts:31` `run()`, which writes with
    no lock (`:50`)
- **Shared:**  the content folder's areas;  every page or text file in them;  a text pass that writes only a change.
- **Differs:**  which areas a job needs (pages to check, notes, writable, migrated);  which files (`.html`, `.md`,
  `.json5`);  a census or a count.
- **The one:**  a table of the areas, each saying what it holds, in the kit's `src/server/contentFolder.ts` (every side
  imports it, plain node too):  each list a named filter of it, the three note lists one;  and one locked text pass
  in `migrations/`, `ContentPass`, handed `RootLinks`' and `ContentRelink`'s `rewrite()`.
- **Net effect:**
  - a new area (as `sagas/` was in epic-workflow P15) is added once
  - `ContentRelink` takes each page's lock, as `RootLinks` does:  an epic's session writing that page meanwhile no
    longer loses a write (inferred, not run)
- **Saves:**  about 45 lines;  13 lists, 2 walkers, 1 pass.
- **Evidence:**  `git grep -n -P '\[\s*"(epics|guides|pages|sagas)",\s*"(epics|guides|pages|sagas|goals|brand)"'` -> the
  lists;  `ContentRelink.ts:50` `if (!dryRun) writeFileSync(file, text)`, beside `RootLinks.ts:93` `FileLock.run(...)`.
- **Owner:**  none.

### 10. The kit's child repos, found one way

- **Kind:**  twice
- **Where:**
  - `src/cli/repos.ts:17` `spellRepos()` (`:37` `childRepoNames()`):  `repos.json5`'s names, each in the kit, its
    `node_modules`, or beside a kit installed from npm (`:32` `besideKit()`)
  - `src/server/page/settings.ts:168` `childRepos()`:  the same names, but never beside the kit
  - `src/cli/commands/commandsCommand.ts:90` `childRepos()`:  every `spell-*` folder with a `package.json`, sorted by
    name, not in `repos.json5`'s order
  - `src/cli/commands/publishCommand.ts:118` `publishedRepos()` and `src/cli/map/CodeMap.ts:42` `repos`:
    `repos.json5`'s names, in the kit only
  - `tools/repos.ts:50` `repos()`:  the whole records (`url`, `needs`)
  - the marker twice, `src/cli/findCheckout.ts:23` `KIT_MARKER` and `settings.ts:121` `REPOS_FILE`;  the walk to it
    twice, `settings.ts:149` `kitOf()` and `findCheckout.ts:15` `findCheckout()`
  - and `settings.ts:160` `findRoot()`:  `checkoutOf(start)?.root`, by hand (sweep 1's #3 listed it;  P7 didn't move it)
- **Shared:**  the kit's child repos that are there, lowest first.
- **Differs:**  where to look;  the order;  what's kept of each (a `"spell"` entry, `"spellPublish"`, its package name).
- **The one:**  `kitRepos(kit)` in `spell/server/page/settings.ts`, beside `kitOf()` (the CLI may import the server, not
  the other way):  each installed child repo, lowest first, `{ name, root, manifest }`;  the CLI's filter it.
  `tools/repos.ts` keeps its own:  the `postinstall` runs it before `node_modules/spell` exists.
- **Net effect:**
  - the page server finds a child repo beside an npm-installed kit, as `spell` does
  - `spell commands` lists the repos in `repos.json5`'s order
- **Saves:**  about 40 lines, 7 copies.
- **Evidence:**  `git grep -n -P 'spellRepos\(|childRepos\(|KIT_MARKER|REPOS_FILE|kitOf\(' -- src tools`.
- **Owner:**  none.

### 11. A path inside a folder, and the same place:  `isInside()` and `RealPath`

- **Kind:**  rebuilt
- **Where:**
  - the homes:  `src/server/safePath.ts:88` `isInside()` (its header, `:1-4`, names the three hand forms it replaced);
    `src/server/RealPath.ts:43` `same()`, `isIn()`, `from()`, and its private `insideOf()` (`:63`)
  - by hand, inside a folder:  `src/server/page/PageServer.ts:585`, `src/server/Linker.ts:265`,
    `spell-epic/src/server/RepoList.ts:110`, `spell-epic/src/tool/EpicDocs.ts:150`, `:337`,
    `spell-epic/src/tool/migrations/RootLinks.ts:82`, `spell-epic/src/tools/ComponentSetFolders.ts:46`,
    `spell-epic/src/tools/migrate.js:384`, `spell-epic/src/tools/showRoutes.ts:86`, `spell-epic/src/window.mjs:827`,
    `:1092`, `:1528`, `spell-epic/src/command/CheckoutServers.ts:173` `inside()`, and
    `spell-epic/src/tools/pages.js:201` `insideOf()` (RealPath's private one, again)
  - by hand, the same real place:  `src/server/mainServer.ts:125` `isShared()` and
    `spell-epic/src/config/SessionFolders.ts:306` `sameFolder()`:  both files import `RealPath` already
- **Shared:**  whether a path is a folder or under it (or its path from there);  whether two paths are one place.
- **Differs:**  a yes, or the path inside;  links followed or not;  a missing path (false, where `RealPath` compares its
  nearest real folder).
- **The one:**  `isInside()`;  RealPath's `insideOf()` exported as `pathInside(folder, path)`, links not followed
  (RealPath loads in plain node, so the window script and `CheckoutServers` can use it);  `RealPath.same()`.
- **Net effect:**  one rule for "inside":  `relative().startsWith("..")` takes a folder named `..x` for outside, and
  `startsWith(folder + sep)` misses a path spelled through a link.
- **Saves:**  about 25 lines, 16 checks.
- **Evidence:**  `git grep -n -P 'startsWith\("\.\."\)\s*(\|\||&&)\s*!?isAbsolute|!\w+\.startsWith\("\.\."\) && !isAbsolute|startsWith\(\w+ \+ sep\)'`.
- **Owner:**  none.

### 12. Item ids and their letters, one home

- **Kind:**  twice
- **Where:**
  - the letters, three tables:  `spell-epic/src/definitions/definitions.types.ts:210` `ItemLetters`,
    `spell-epic/src/tool/planDoc.types.ts:126` `KINDS` (`prefix`), `spell-epic/src/command/epicArgs.ts:452`
    `KIND_LETTERS` ("a private copy", `:449`)
  - an item's id, seven patterns:  `epicArgs.ts:434` `ITEM_REF`, `spell-epic/src/tool/PhaseTakes.ts:102` `ITEM_ID`
    (new, epic-engine I128), `spell-epic/src/tool/PlanDoc.ts:2560` `ITEM_REF`, `spell-epic/src/tool/ReviewInbox.ts:1257`
    `ITEM_ID`, `spell-epic/src/tool/migrations/ToReviewMarks.ts:48`, `spell-epic/src/tool/migrations/ItemRenames.ts:155`
    (one letter:  the old ids it renames), `spell-epic/src/tool/ReviewBackfill.ts:139` (letters `[qcitvd]`)
  - and `epicArgs.ts:439` `STABLE_PHASE_ID`, a stated copy of `PhaseIds`'
- **Shared:**  which letter each kind of item takes, and what an item's id looks like.
- **Differs:**  case;  whether a phase's id counts too (`ReviewInbox`);  the old letters, on purpose (`ItemRenames`).
- **The one:**  `ItemLetters` (it imports types only, so `epicArgs` loads it as cheaply as its copy) and, beside it, an
  `ITEM_ID` built from its letters, and `isItemId()`.
- **Net effect:**
  - the next letter change (as P44's) touches one table
  - `epic backfill` finds the judgement calls (J) and manual tests (M) Owen named:  `[qcitvd]` never had `j`, and lost
    `m` at P44 (inferred, not run)
- **Saves:**  about 20 lines, 8 copies.
- **Evidence:**  `git grep -n -P '(ITEM_ID|ITEM_REF)\s*=\s*/' -- spell-epic/src` -> 6, and `ToReviewMarks.ts:48`.
- **Owner:**  epic-engine's branch changes `epicArgs.ts`, `ReviewInbox.ts`.

### 13. `.epic/config.json5` read with `json5`, as the kit reads it

- **Kind:**  rebuilt (the catalog's "A JSON5 file")
- **Where:**
  - `spell-epic/src/config/EpicConfig.ts:762` `parse()` and `:1069` `outsideStrings()`:  JSON5's JSON part by hand
    (comments and trailing commas dropped, then `JSON.parse()`)
  - the same file read by the kit's `src/server/contentFolder.ts:37` `contentFolderOf()`, with `json5`
  - its reason (`spell-epic/src/AGENTS.md:281`):  "not through `DataFile`, which needs `json5`", since plain node
    loads it before a worktree's install;  but it imports `spell/server/checkout`, `Git` and `RealPath`
    (`EpicConfig.ts:8-10`) the same way, from the same install `json5` is in
- **Shared:**  read the repo's epic settings.
- **Differs:**  nothing a person writes:  the hand parser refuses valid JSON5.
- **The one:**  `JSON5.parse()` (or `readJSON5File()`, `spell/util/node/json5`, which has an `exports` entry for plain
  node), keeping `parse()`'s error that names the file.
- **Net effect:**  a hand-edited setting with an unquoted key or single quotes reads in `epic`, as it already does in
  the page server;  today every `epic` verb stops on it.
- **Saves:**  about 30 lines, 1 copy.
- **Evidence:**  in plain node, `EpicConfig.parse('{ contentFolder: "../spell.epics" }')` throws "won't read:  Expected
  property name";  `JSON5.parse()` of the same text gives `{ contentFolder: "../spell.epics" }`;  the same for single
  quotes.
- **Owner:**  none (epic-engine's and repo-split's pages only name it).

### 14. `spell publish`'s page check serves its folder with the server package

- **Kind:**  rebuilt
- **Where:**
  - `src/cli/publish/ScratchInstall.ts:206` `serveFolder()` and `:226` `CONTENT_TYPES` (repo-split P19, 2026-10-23):
    a static server of its own, its own content types, a path check by `file.startsWith(dir)` (no separator:
    a sibling `<dir>-x/` passes), `listen(0)`
  - the server package's:  `src/server/WebServer.ts` (mounts), `src/server/safePath.ts:38` `resolveInside()`,
    `src/server/mime.ts:64` `typeFor()`, `src/server/ports.ts:45` `listenPreferred()`
- **Shared:**  serve a folder's files on a free local port, for a headless page.
- **Differs:**  nothing it needs.
- **The one:**  `new SRV.WebServer({ mounts: [{ prefix: "/", dir }] })`, `listen()`, `close()`.
- **Net effect:**  the kit's seventh static server goes (the server's `AGENTS.md`:  "six servers each had their own mime
  table, path check, port choice and opener.  Now they share these").
- **Saves:**  about 25 lines;  a copy each of four mechanisms.
- **Evidence:**  `ScratchInstall.ts:208`:  `const path = normalize(join(dir, decodeURIComponent(...)))`;  `:210`:
  `if (!file.startsWith(dir) || !existsSync(file))`.
- **Owner:**  none (coherence's page names the file).

### 15. Escaping a regex:  two left by hand, one new

- **Kind:**  rebuilt (the catalog's "Text")
- **Where:**
  - `spell-epic/src/command/WorkTime.ts:129` `` epic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") `` and `:128`
    `` phase.replace(/\./g, "\\.") ``:  epic-engine P41, 2026-10-25 15:01, 50 minutes after P6 moved spell-epic's ten
    escapers onto `escapeRegExp()` (`5537ad6`, 14:11)
  - `src/cli/map/CodeMap.ts:231` `` base.replace(".", "\\.") ``:  the first dot only (P1, before P6;  the Score line
    can't find it)
- **Shared:**  text made safe inside a `RegExp`.
- **Differs:**  nothing.
- **The one:**  `escapeRegExp()`, `spell/util/string`.
- **Net effect:**  a name with two dots matches as written in the map's subclass search.
- **Saves:**  3 lines, 2 copies.
- **Evidence:**  `git log -L127,130:src/command/WorkTime.ts` (spell-epic) -> `27c0ce7`, 10-25 15:01.
- **Owner:**  none.

## Score lines that overcount

- **The score's scope:**  it reads each repo's `src/` only (`src/cli/coherence/RepoCode.ts:107` `isScored()`), so this
  area's `tools/`, `scripts/` (the kit) and `hooks/` (spell-epic) are never counted.
  - Missed there:  `tools/content-links.ts:526` (`"spell.epics"`, the shared content folder by hand), its flag reader
    (`:519`), `scripts/favicon.ts:186` `argument()`, `tools/repos.ts:52` (`JSON5.parse`),
    `spell-epic/hooks/handoff.mjs:69` (a transcript's titles).
- **Timing** (32 here):  23 real, 7 that can't import anything, 2 blocked.
  - real:  the sleeps and waits of finding 3;  `src/server/LiveReload.ts:71`, `src/server/runs/CommandRun.ts:504`,
    `spell-epic/src/tools/AskListeners.ts:76` (`every()`);  `src/cli/run.ts:24`, `src/server/page/BundleBuild.ts:199`,
    `CommandRun.ts:506`, `spell-epic/src/tools/showRoutes.ts:55` (`after()`);  `LiveReload.ts:137` and
    `BundleBuild.ts:148` (a debounce, finding 8);  `CommandRun.ts:288` (a throttle)
  - blocked until timing lives in util:  `src/util/spell/TaskList.ts:193`, `:196`
  - can't import anything:  `src/server/liveClient.ts:353`, `:715`, `:738`, `:895`, `:1120` (served as one function's
    text:  "MUST stay self-contained");  `spell-epic/src/server/RepoApp.ts:188` (an inline `<script>` in an HTML
    string);  `spell-epic/src/demo/check-header-epics.mjs:200` (inside `page.evaluate()`)
  - tighter:  `not src/server/liveClient.ts`, with a "Fine:" line;  and `|from "node:timers/promises"|Atomics\.wait\(`
    to find the four sleeps it misses (`spell-epic/src/tool/InboxCommands.ts:3`, `spell-epic/src/tools/agents.ts:27`,
    `src/server/FileLock.ts:78`, `spell-epic/src/command/CheckoutServers.ts:148`), with a Fine line for `InboxPoller.mjs`
- **Fetching** (16 here):  15 with no home they may import;  1 that could take `$fetch()`
  (`spell-epic/src/tool/ReviewStart.ts:399`, which checks its bridge's own `ok` too).
  - `src/server/liveClient.ts` ×7 (self-contained);  `spell-epic/src/window.mjs` (plain node can't load the `spell/util`
    barrel)
  - the kit's own pages and node code:  `src/server/site/SectionEditor.ts:116`, `:136`,
    `src/server/site/SiteHeader.ts:312`, `src/util/persist/ServerPlace.ts:83`, `src/server/mainServer.ts:49`, `:115`,
    `src/cli/commands/serverCommand.ts:91`:
    `$fetch()` is behind the `spell/util` barrel (lodash in every page:  the server's `AGENTS.md` forbids it), and
    `fetchOk()` is Spell UI's, a repo above
  - tighter:  `not src/server/liveClient.ts`;  then either Spell UI's `fetchOk()` / `fetchText()` moved down into a
    generic util file of the kit (they import nothing of Spell UI), which gives these seven a home, or
    `not src/server/site/, src/util/persist/, src/server/mainServer.ts, src/cli/`
- **A file a script writes, kept current** (2 here, both false):  `spell-epic/src/config/EpicConfig.ts:140`, `:913`:
  its `readOrEmpty()` reads the config.  Tighter:  drop `readOrEmpty` (P11 moved the copies it named):  `stale:  .*yarn`.
- **Numbers** (5 here):  1 real, `spell-epic/src/tools/update.js:128` (`kb()`).
  - `src/util/color.ts:180`:  the generic util files import nothing, by rule;  `spell-epic/src/tool/InboxPoller.mjs:80`:
    node's modules only;  `spell-epic/src/tool/reviewRoutes.ts:107`:  MB, which `kb()` doesn't say;
    `spell-epic/src/window.mjs:1747`:  HSL colour maths, a Colour copy the Colour line misses
  - tighter:  `not src/util/color.ts`
- **A text position and its offset** (2 here, no home they may import):  `src/cli/map/CodeMap.ts:237`,
  `spell-epic/src/tools/offline.ts:139`.
  - `getLineStarts()` / `positionForOffset()` are spell-parser's, which neither the kit nor spell-epic may import
    (spell-epic needs `spell` and `spell-ui` only);  `spell-epic/src/tools/fuss.ts:484` builds line starts too, unfound
  - either the two helpers move down to the kit's util (they're generic), or `in spell-parser/, spell-app/`
- **The shared content folder** (1 here, false):  `src/cli/map/DocsMap.ts:105` `CONTENT_NAME` labels the map's content
  pages;  it finds no folder.
- **The page server, from an epic page** (1 here, false):  `spell-epic/src/demo/check-comments-epic-ui.mjs:590` reads the
  token inside `page.waitForFunction()`.  Tighter:  `not spell-epic/src/demo/`.
- **Building a bundle on demand** (1 here):  `spell-epic/src/tools/bundle-spell-ui.js`:  its bundles are committed, which
  `Bundle`'s never are (sweep 1 left it):  a Fine line.
- **A new syntax** (4 here):  `src/server/DataFile.ts:304` (a JSON5 layout's tokens) and `spell-epic/src/window.mjs:1542`
  (a JSON list's end, for an edit that keeps every other byte) can't use the parser, a repo above;
  `spell-epic/src/tools/fuss.ts:558`, `:613` are a real copy, but of "Comments in code" (finding 5).
- **Text** (3 here):  `spell-epic/src/command/WorkTime.ts:129` real (finding 15);  `spell-epic/src/tool/PlanMarkup.ts:84`
  and `spell-epic/src/tools/PageNotes.js:464` keep `'` as written, on purpose (PageNotes says why):  Fine lines.
  Missed:  `src/cli/map/CodeMap.ts:231`.
- **A command** (7 here, all real):  it misses `parseVerbArgs`, `flagsOf`, `stringFlag`, `flagValue` (finding 7):
  `function (parseArgs|parseVerbArgs|flagsOf)\(|argv\.indexOf\(["']--` finds the readers.
- **A JSON5 file** (4 here, real, a line each):  it misses `spell-epic/src/config/EpicConfig.ts:762` (finding 13) and
  `src/server/page/settings.ts:172` (a separate read, then `JSON5.parse(text)`).

## Considered, left out

- `spell-epic/src/tool/InboxPoller.mjs`'s sleep, process check and clamp:  node's modules only, on purpose (the catalog).
- The hooks' boilerplate:  "Fine as it is";  `spell-epic/hooks/worktree.mjs:141` `isLive()` reads a `.git` file's
  `gitdir` as `checkoutOf()` does, but asks another thing:  is this worktree dead?
- `tools/rename-packages.ts`:  kept on purpose, for branches open at repo-split P17.
- `spell-epic/src/tools/bundle-spell-ui.js`'s own esbuild:  committed bundles, `Bundle`'s opposite (sweep 1).
- The two migration runners (`Migrations.run()` with `MigrateCommands`;  `migrate.js`' `STEPS`):  assembled epic pages,
  and single files.  `migrate.js:52` `KINDS` copies `PAGE_KINDS` (its test checks them), and could import it now that
  `migrate.js` runs under `tsx` and imports `RootLinks`:  small.
- Durations:  `PlanTime.parseDuration()` (estimates, minutes, ranges) and `spell-epic/src/tools/details.js:712`
  `duration()` (`--timeout`, ms);  `PlanTime.formatMinutes()` and `spell-epic/src/tools/agents.ts:119` `age()`:
  two each, in different units (finding 3 takes the timeout flags).
- A file written all at once (a temp file, then a rename):  `src/server/DataFile.ts:114`,
  `spell-epic/src/command/TranscriptIndex.ts:70`, `spell-epic/src/tool/PlanParts.ts:105`,
  `spell-epic/src/tools/AirplaneMode.ts:53` (no pid in its temp name), and `FileOperations`' private one:
  four lines each;  a public `writeAtomic()` would serve them.
- `split(sep).join("/")` (29) and `(error as Error).message` (42):  one-line idioms.
- `git log -1 --format=%ct` and the like (6):  all through `Git` already.
- `spell-epic/src/window.mjs:1726` `rehue()`, `:1738` `hslHex()`:  HSL, which `spell/util/color` doesn't have.
- What counts as history on an epic page (`PhaseNumbers.ts:197` `HISTORY`, `:205` `KEPT_WORDS`, `ProseRewrite.ts:267`,
  `PathTooltips.ts:58`, `PlanItem.inOriginal()`):  each keeps what its own job must.
- Where a new details or choice page goes (`choices.js:135-136`, `details.js:182-183`):  three lines.
- `EpicCheckout.nearest()` beside `CLI.findCheckout()`:  it adds a second test, "a repo `epic init` set up".
- `src/util/spell/json.ts:9` `parseJSON()` and `:35` `parseJSON5()`:  one body twice, the parser its only difference
  (20 lines, small).
- `PhaseNumbers.followMentions()` beside the item renames:  phases by number, items by id:  different rewrites.
