# Writer's brief:  one phase of epic `readme`

You are one of several background agents writing the READMEs of the Spell repos, one phase each.  Work only on your
phase's pages.  Read everything below before writing a line.

## Where things are

- The worktree:  `/Users/owen/www/spell.worktrees/readme` (the kit `spell-kit`, with the child repos spell-lang,
  spell-ui, spell-brand, spell-epic, spell-app cloned inside it, all on branch `readme`).  Use ABSOLUTE paths;  never
  `cd` outside the worktree (the shell guard then refuses every command).  `git` only read-only (`status`, `diff`,
  `log`, `grep`), run as `git -C <repo folder> ...`;  NEVER commit, stage, stash or checkout:  the owner reviews the
  pages uncommitted in Source Control.
- The epic page and its parts:  `/Users/owen/www/spell/spell.epics/epics/readme/` (a shared content folder;  the
  Write/Edit tools refuse paths there, so READ them, and change the page only through the `epic` command).
  - `parts/o2.html`:  THE BRIEF:  audience, shape, the layout the pages describe, pictures, links, stubs, words,
    checks.  Follow it exactly.
  - `parts/o1.html`:  the map of every page and what it replaces.
  - your outline part (named in your task):  the sections, pictures, expands, stubs and sources of each page you
    write.  It's the owner's reviewed spec:  every section it names appears, in that order, unless the facts
    forbid it (then say so in your report).
  - `parts/q2.html` (the layout the pages describe), `parts/q5.html` (old READMEs fold in and are deleted),
    `parts/q10.html` (the stubs), `parts/q12.html` (shared editing in stages), `parts/q4.html` (WWOD is written
    "WWOD, What Would Owen Do?" where introduced, and the name appears nowhere else), `parts/q3.html` (no links
    into the content folder), `parts/q1.html` (Mermaid everywhere;  hero SVGs are P8's, not yours).
  - `research/explore-*.md`:  the five research reports.  Every fact you need is there, with file paths.  Verify a
    fact in the code when the report says it was not verified.  Each report's "stale" section lists names a page
    must never use.
- The house style for writing:  `/Users/owen/www/spell.worktrees/readme/agents/wwod/WWOD.md` §6 ("Comments & docs":
  plain words, a lead then bullets, break lines at phrases, no path in prose) and `agents/wwod/writing.md`.
  "People", never "users".

## What a page is

- Markdown, GitHub-flavoured:  `<details><summary>...</summary>` for expands (a blank line after `<summary>` so
  Markdown renders inside), ```` ```mermaid ```` blocks for pictures (a one-line italic caption under each), tables
  for anything with three or more rows of one shape, relative links only.
- The page reads whole with every expand closed.  A front page gives a full orientation (300-500 lines closed is
  fine);  a secondary page goes deep on one thing.
- Every page ends with "See also":  the pages beside it, the repo's front page, the kit's front page
  (`../README.md` from a child repo).  And, where the outline says so, a folded "More in the docs site" list naming
  guides by title and served path (never a link into `spell.epics`).
- Pictures:  draw PLAIN Mermaid (no styling directives);  P8's prettifier styles every block later.  Flowcharts for
  structure, `sequenceDiagram` for a request or a load.  Keep labels short;  a diagram wider than ~8 nodes splits
  in two.
- Screenshots the outline asks for:  take them yourself with Playwright, headless, never the Chrome tools.  The page
  server for a page:  `spell dev server url <file>` from the main checkout's spell-app (or `epic pages link`);
  spell-ui's `yarn site:check` and `tools/visual/` show how a Playwright screenshot is taken in this repo;
  spell-epic's `check-spell` script (grep for it) checks a page headless.  Save PNGs under 300 KB into the repo's
  `docs/images/...` as the outline names, with alt text in the page.  If a screenshot can't be taken, write the
  page without it and add a test for the owner:  `epic add readme#V "<what>" --step "<how>" --should "<what should show>"`.
- Commands you quote in a setup or "try it" section:  RUN them once (in a scratch folder under
  `/private/tmp/claude-501/-Users-owen-www-spell/d5a307a4-0de5-4c43-817b-d113b0c12ede/scratchpad/`) and paste what
  they print.  A command that can't be run here is marked in a test for the owner (`epic add readme#V`).
- The layout the pages describe is the END STATE after repo-split P13 and P14 (`parts/q2.html`):  the command line's
  base in the kit's `cli/`, each repo's commands in its own `cli/`, package names everywhere and `#/` for a package's
  own deep files, no `$/`, the assembler inside the server.  Setup sections use only commands that work today AND
  after;  a page naming a planned command carries ONE folded note "Until repo-split P13 lands" with today's spelling.
- Stubs:  a "🌱 Coming" section, one paragraph of what it will do, one line of where it stands, never a date;
  nothing shown as working that a reader can't run today.
- Never:  the owner's name outside WWOD's expansion;  `packages/`, `@spell-app/...`, "monorepo", "plan doc",
  "Fomantic reborn", "the fork", `spell-hub`, `spell-spaces`, `.compiled.js`, `$/`;  epic names in running prose
  (an expand may name one);  a link into `spell.epics`;  a file path in running prose (name the thing, link the
  file).

## Folding the old READMEs (`parts/q5.html`)

- Each old in-folder README your outline names is FOLDED into the new page (every fact kept:  long references go in
  expands, or a second page `README-<x>-reference.md` if the front page passes ~400 lines closed), then DELETED.
- Then grep all six repos (and the kit's `agents/`, every `AGENTS.md`, `CLAUDE.md`, `.claude/skills`, and the
  content folder's `guides/dev/commands/commands.json5`) for links to the deleted file, and repoint each to the
  new page.  List what you repointed in your report;  a reference you can't repoint (a guide in the content folder)
  goes in your report as an issue to log.

## Recording on the epic page (through `epic`, from the worktree)

- A fact the outline assumed that turned out wrong, or a thing you couldn't do:
  `epic add readme#I "<title>" --calm --details "<p>...</p>"`.
- A limit you accepted:  `epic add readme#C "<title>" --details "..."`.
- A choice you made without the owner (two reasonable readings, you picked one):
  `epic add readme#J "<title>" --calm --details "<p>chose X over Y because Z</p>"`.
- A hand check only the owner can do:  `epic add readme#V "<what>" --step "..." --should "..."`.
- Never edit the page or its parts by hand;  never touch other phases' pages or files.

## When your phase's pages are written

1. Checks:  every relative link in your pages resolves (write a tiny node script, or `grep` + `test -e`);  every
   Mermaid block has a caption;  run `yarn format` in the repo you changed (oxfmt formats Markdown;  it may touch
   only your files:  if it changes others, revert those with `git -C <repo> checkout -- <file>` and say so) and
   `yarn lint` if the repo lints Markdown;  reread each page cold, top to bottom, as the developer it's for.
2. `epic phase readme#P<N> done --done "<ul><li>...</li></ul>"`:  what was BUILT, ordered by what the owner asks
   about first:  the pages (with line counts), what changed in how he works, what's rough or untested by hand.
3. Report back:  the pages and their line counts, the old files deleted and the links repointed, every `epic add`
   you made (ids), the commands you ran and what failed, and anything the next phase (P8 · Cross-links) must fix.
