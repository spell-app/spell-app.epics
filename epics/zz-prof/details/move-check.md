# Moving spell-epic behind a symlink:  what breaks (epic-engine, 2026-10-20)

Tested on throwaway copies moved into a `www/spell/` layout with compat links at the old paths, running spell-epic's real code (the `epic` CLI, EpicConfig, hooks/worktree.mjs).  Nothing real was changed.

Three facts behind most rows:
- git gives REAL paths (`git rev-parse --git-common-dir`), so `Git.mainRoot()` is the real path.
- Without git, the main checkout is what a worktree's `.git` file says (`checkoutOf()`, spell-app src/server/checkout.ts):  the OLD path until `git worktree repair`.
- Claude Code keys sessions by `realpathSync(process.cwd())`;  the Bash tool records a `cd` through a link as the old path.

| What | Breaks? | Fix |
|---|---|---|
| `.epic/config.json5` `contentFolder: "../spell-app.epics"` | YES, silently:  resolved from the REAL main checkout -> `~/www/spell/spell-app.epics` (missing);  `contentOf()` falls back to the checkout itself;  the turn-end hook skips content commits;  new window files drop the content folder | set `"contentFolder": "../spell.epics"` and `windows.contentName: "spell.epics"` at the move (spell-epic AND spell-app);  stopgap:  a link `~/www/spell/spell-app.epics -> spell.epics` |
| `.spell-app -> ../spell-app` (tracked) and `spell-epic.worktrees/spell-app -> ../spell-app` | ONLY IF `~/www/spell/spell-app` lacks `packages/{server,util,ui,spell-element,assembler,toolchain}`:  the portals, tsconfig aliases and `epic`/every hook load through it | move spell-epic only once the full spell-app is at `~/www/spell/spell-app`, or re-point the link, portals and aliases at the cut repos in the same commit |
| worktree registrations | YES until repaired:  `git worktree list` keeps the old path;  `Worktrees.named()` compares strings -> `epic worktree list` empty, `remove` says "no worktree";  the worktree guard goes silent | `git worktree repair ~/www/spell/spell-epic.worktrees/*/` with EXPLICIT real paths (a bare `repair` does nothing while the old path still resolves) |
| Claude session folders `~/.claude/projects/<slug>` | YES:  new sessions save under `-Users-owen-www-spell-spell-epic[-worktrees-X]`, empty;  history and memory are under `-Users-owen-www-spell-app-spell-epic` | `ln -s -- -Users-owen-www-spell-app-spell-epic ~/.claude/projects/-Users-owen-www-spell-spell-epic` and the same per worktree |
| session paths compared as strings (Worktrees.ts, Sessions.ts inRepo, Stock.ts, RunningEpics.ts) | ONLY for sessions started before the move:  a live worktree can look session-less and `/worktrees` offers discard | restart every session after the move;  don't run `/worktrees` clean-up meanwhile |
| VS Code window files | YES for the content folder (`../../spell-app.epics` missing from the real folder;  `epic window init` adds the new one but leaves the dead entry) | replace `spell-app.epics` with `spell.epics` in `workspaces/**/*.code-workspace` (spell-epic) / the windows folder;  reopen with `epic window open` |
| windows reopened from VS Code's recent list | ONLY then:  folders come up as old paths;  `WindowBridge.indexOf` compares strings | reopen with `epic window open` |
| `~/.spell-epic/repos.json5` | ONLY IF configs change but it doesn't:  old path + `../spell.epics` -> missing;  `add()` dedupes by string | edit to real paths in the same step;  then `epic hub ensure` |
| installed VS Code extension | ONLY IF `~/www/spell-app/spell-epic.worktrees` gets no compat link:  `ENGINE_ROUTE`/`ENGINE_ROOT` baked in at build | keep that compat link;  rebuild the extension from the real main checkout |
| `~/.claude/settings.json` extra folders and Edit rule | LIKELY permission prompts:  they name `/Users/owen/www/spell-app/spell-app-dev` | OWEN adds the new real path (`~/www/spell/spell.epics`) — a settings change is his, not a session's |
| tracked root links `agents`, `epics`, `guides`, `pages`, `sagas` -> `../../spell-app.epics/*` in spell-epic | no, but leftovers (broken in the main checkout today) | delete them.  AND repo-split's Q6 ("every repo links `agents/` to spell-util") must SKIP spell-epic:  a root `agents/` makes Claude Code load WWOD and the logs as plugin agents (I23) |
| `epic window which`, epic pages' `worktree=`, the worktree hook, the marketplace source, `~/.local/bin/epic`, servers | no (real paths, or resolve through the compat link);  stop servers before the move, restart after |  |

## Checklist for P9 (the move)
1. Before:  `~/www/spell/spell-app` holds its `packages/*` (or `.spell-app`, portals and aliases re-pointed first);  epic-engine committed;  spell-epic's sessions ended and windows closed;  servers stopped (`epic server stop`, spell-app's too).
2. Move with the links in the same command:  `mv` spell-epic and spell-epic.worktrees into `~/www/spell/`, `ln -s ../spell/spell-epic` and `ln -s ../spell/spell-epic.worktrees` at the old names;  the content folder to `~/www/spell/spell.epics` with `~/www/spell-app/spell-app.epics -> ../spell/spell.epics`.
3. `git worktree repair ~/www/spell/spell-epic.worktrees/*/` in `~/www/spell/spell-epic`;  check `git worktree list` shows only `~/www/spell/...`.
4. Configs committed on main:  `contentFolder: "../spell.epics"`, `windows.contentName: "spell.epics"` (spell-epic and spell-app).
5. `~/.spell-epic/repos.json5` to real paths, then `epic server ensure`.
6. The session-folder links (main and each worktree).
7. `epic shared link` in a worktree (makes `spell-epic.worktrees/spell.epics`);  delete the dangling `spell-epic.worktrees/spell-app.epics`.
8. Window files:  `spell-app.epics` -> `spell.epics`;  reopen with `epic window open`.
9. Owen:  the new real path in `~/.claude/settings.json`'s extra folders and Edit rule.
10. Verify from the main checkout and a worktree:  `epic config contentFolder` is `~/www/spell/spell.epics`;  `epic worktree list --json` lists the worktrees;  `epic window which`;  a new `/isolate` worktree gets its session-folder link;  `yarn ts && yarn test`.
11. Restart every session;  no `/worktrees` clean-up while pre-move sessions live.

Since epic-engine I59 (2026-10-20) spell-epic handles these itself (checked on the same moved, unrepaired layout:  `tests/command/MovedCheckout.test.ts`, the window and extension tests):
- every compare of checkout, worktree, content and session paths is by real path on both sides (`RealPath`):  `EpicConfig.main` and `worktreeNameOf()`, `Worktrees.named()` / `idle()` / `remove()` / `repoSessions()`, `Sessions.live()`'s `inRepo`, `Stock`, `RunningEpics`, `RepoList` (`add()` dedupes by real path and takes the real one), `WindowBridge.indexOf()`.  So an unrepaired worktree is listed, named and removed;  a pre-move session's old `cwd` still counts as in its worktree (no discard offer);  a window reopened from the recent list still finds its folders.
- a config folder missing beside the real main checkout but there beside its old spelling (`../spell-app.epics` through the compat link) is used, with one stderr line naming the folder to put in `.epic/config.json5`;  a named content folder found nowhere is said too, never a silent fall back to the checkout.
- `epic window init` drops a window file's dead content-folder entry and adds the one in force.

Still manual:  step 4 (the configs:  the old-name fallback needs the compat link AND an unrepaired worktree or an old-path caller, so commit `../spell.epics` at the move), step 3 (`git worktree repair`, for git's own commands), step 6 (the session-folder links), steps 1, 2, 5, 7-10 as written.  Step 11 is now only about sessions' own state:  `/worktrees` clean-up no longer mistakes a pre-move session's worktree for an idle one.
