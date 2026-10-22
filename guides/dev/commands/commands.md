# Commands:  rules for agents

Distilled from `commands.html` (beside this), the map of every operation the `spell` CLI, the Claude skills and the
yarn scripts do.  READ this before adding, renaming or removing a CLI command, a skill or a yarn script.

## When this applies

- Owen asks for a new skill, or a new `spell` command
- you're about to add a yarn script (any package) to solve a problem
- you rename or remove any of the three

## Before building:  suggest

1. Look the operation up:  `commands.json5` (grep its `op` words and `names`), or the page's filter
   (`epic pages open guides/dev/commands/commands.html`).
   Does something already do it, under another name, or nearly?
2. Then tell Owen, in a numbered list, BEFORE building it:
   - where it belongs (see "Layers"):  usually a `spell <noun> <verb>`, with a skill or yarn alias on top
   - its name (see "Names")
   - what it would replace or merge with, and which roadmap move (`R1` ... on the page) it advances
   - whether an existing command should grow a verb or flag instead
3. A yarn script you add mid-task:  say so in the reply, with the same suggestion.
   Build what was asked;  the suggestion is for Owen to weigh.

## Layers

- skill:  judgement and dialog only (which name, which modal, what to say).
  - Every repo action is ONE `spell` or `epic` call, with `--json` when the skill reads the answer.
  - Steps written only as prose are debt:  name them.
- `spell` CLI:  every repo action, as `spell <noun> <verb>` (`spell server start`, `spell pack build`).
  - The kit's `spell` (its `src/cli/`) holds the base and the kit's own commands;
    each repo adds its own, named in its `package.json`'s `"spell": { "commands" }` (epic `repo-split` P13).
  - A new command goes in the repo whose code it runs:  the kit's, or that repo's `src/cli/`.
  - Each finds the NEAREST checkout from the cwd (`CLI.findCheckout()`), so it works in a worktree.
  - `spell dev` and its old spellings went in repo-split P13:  never name one.
- The epic tools live under their own command, `epic`:  `epic <verb> <epic>#<id>` (`epic add-phase seo "Name"`,
  `epic close seo#J3`, `epic update seo#P3 --estimate 2h`), from spell-epic's `src/cli/EpicProgram.ts`.
  - A new epic tool is an `epic` verb (or a verb of one of its groups:  `epic pages voice`), not a `spell` noun.
- yarn:  a package's tool-native scripts stay (`build`, `ts`, `lint`, `format`, `test`, `gen:*`, vite);
  repo actions are one-line aliases of a `spell` call (the kit's `"server": "node bin/spell.mjs server"`).
- Package-local tool CLIs stay (`spell-ui/src/tools/cli.ts`).
  Claude-only steps stay in skills (`EnterWorktree`, `SendMessage`, modals).
- One language:  tools are TypeScript (a repo's `src/cli/`) or node JS (`spell-epic/src/tools`),
  never python or shell scripts.

## Names

- Noun then verb, everywhere:  `spell server start` = yarn `server:start`;
  dashes inside a word (`add-phase`, `merge-check`), colons only between yarn's noun and verb.
- Spell-LANGUAGE commands stay bare:  `spell compile`, `spell lint`.
- A word two repos both want goes under each one's short name:  `spell lang check`, `spell app check`.
- Skills keep short workflow names (`/isolate`, `/park`).
- The nouns, and their verbs:  the page's "5.2 Names".  Reuse a noun before inventing one.

## Keep the page true, in the same change

- `commands.json5`:  every command sits in some row's `cli` / `skill` / `yarn` `names`
  (`spell x`, `epic x`, `/name`, `<package> <script>`, `root` for the kit's root).
  - A new operation gets a new row (`op`, marks, `runs`, `target`).
  - The JSON's shape:  `spell-epic/src/tools/_assets/commands.js`'s header.
  - An `epic` group's verbs are named by the group (`epic pages`), as the check lists them.
- `spell commands check` must pass:
  it exits 1 on a command the page lacks, or a name no command has.
- A new noun or verb, or a roadmap change:  edit the page's "5. Target" / "6. Roadmap" too.
- Building a roadmap move:  update the affected rows' marks and `target`.
