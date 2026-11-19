# Netlist Viewer: make it a real Spell page

## Background

Epic `netlists` (its page: `~/psi/qos/epics/epics/netlists/netlists.plan.html`) built a viewer for Apollo netlists. A netlist is a recursive JSON wiring list that Jarvis uses: components, their ports, and the connections between them.

The viewer is meant to be a Spell page in the Jarvis space. For now it is a plain HTML page plus TypeScript, served by Spell UI's Vite dev server. The agents found three things a Spell page can't do yet, and a fourth problem with which Spell gets installed. This brief is to close those gaps, so the viewer can become an ordinary Spell page in the Netlists project.

## Where things are

- **Netlists project:** `~/psi/qos/epics/spaces/@psiquantum/jarvis/netlists/`, beside `jarvis-api`
  - `Netlists.spell`: the classes `netlist`, `netlist node`, `netlist port`, `netlist connection`, `netlist endpoint`, `netlist problem`
  - `netlists.lib.ts`: those classes compiled with the `ts/lib` target
  - `netlistReader.ts`: `readNetlist(text, { name, classes?, resolveSubnetlist? })`, which reads the JSON into those classes
  - `viewer/`: the page as it is now:
    - `index.html`
    - `viewer.ts`: upload, the tree's items, the property panels
    - `NetlistColumns.ts` / `.css`: `<netlist-columns>`, a subclass of `<ui-tree>` that is always `mode="columns"`
    - `serve.mts`: starts Spell UI's Vite server and lets it read this folder
  - `samples/`: `tiny.netlist.json`, `av1p0-small.netlist.json`
- **Spell repo:** worktree `~/psi/spell.worktrees/netlists`, branch `netlists`, not pushed
  - `<ui-tree mode="columns">`, with an `items` property, `path` and a `rowClass(item)` hook: `ui/src/components/ui-tree/`
  - `<ui-graph>` (new, generic): `ui/src/components/ui-graph/`
- **jarvis-spell**, the app that runs the Jarvis space with `yarn start`: `~/psi/qos/jarvis-spell`. It installs Spell from a packed file, `spell-0.8.9.tgz`.

## Run the viewer as it is now

```sh
cd ~/psi/spell.worktrees/netlists
NODE_PATH=$PWD/node_modules npx tsx ~/psi/qos/epics/spaces/@psiquantum/jarvis/netlists/viewer/serve.mts
```

Then open the URL it prints (port 5391, or the next free one).

## The gaps

These are what the agents hit while building. Check each one against the Spell repo before building on it; one may already have a way the agents missed.

1. **A Spell page can't take an uploaded file.**
   - There's no Spell word for a file input or a drop zone, and none for reading a `File`'s text.
   - The viewer needs: pick or drop a `.json` file, read its text, and hand it to `readNetlist`.
2. **A Spell page can't call a TypeScript helper.**
   - Spell has no words for parsing JSON or walking an object's keys, so the reading lives in `netlistReader.ts`.
   - Spell code can't call it.
   - A project can't import a `.js` file either: the compiler skips active `.js` imports.
   - Also, a page that runs its own compiled copy of the classes (`netlists.spell.js`) has different classes from the library's (`netlists.lib.ts`), so the reader takes `options.classes`. That's a wart: one copy of the classes would be better.
3. **A Spell page can't define a subclass element.**
   - A Spell `view` extends `View`. Nothing lets a project declare an element that extends a `<ui-*>` element.
   - The viewer needs `<netlist-columns>` (extends `<ui-tree>`, always in column mode, own stylesheet, overrides `rowClass`).
   - It will soon need `<jarvis-netlist>` (extends `<ui-graph>`, overrides `nodeLabel`, `nodeClass`, `edgeClass`, `portClass`).
   - Today `<netlist-columns>` is TypeScript: `class NetlistColumns extends UITree`, with `@E.proto static vocabulary` (the tree's vocabulary under tag `netlist-columns`) and `@E.protoMerged static elementSetup` adding its sheet, then `define()`.
4. **jarvis-spell's Spell is too old.**
   - `yarn start` runs Spell from `spell-0.8.9.tgz`, which has neither `<ui-tree mode="columns">` nor `<ui-graph>`.
   - Those are only on the Spell repo's `netlists` branch.
   - Even with gaps 1-3 fixed, the page won't work under `yarn start` until Spell is packed again from a branch that has them, and the tgz replaced.

## What's wanted

- For each gap, the Spell-native way to do it, as Spell words or project rules, written up before it's built. Name where each one belongs in the Spell repo (parser rules, core runtime, element tools, the project compiler).
- Then the Netlist Viewer rewritten as a Spell page in the Netlists project:
  - upload a netlist
  - `<netlist-columns>` declared in the project
  - the property panels as Spell views
  - it runs under jarvis-spell's `yarn start` once Spell is packed again

## Rules

- Spell repo: read `AGENTS.md`, `ui/AGENTS.md` and `agents/wwod/WWOD.md` first. Work on branch `netlists` or a branch off it.
- Record decisions and problems in the epic page with the CLI at its full path, run from `~/psi/qos/jarvis-spell.worktrees/netlists`:
  - `/Users/mwilliams/.local/bin/epic add netlists#J "title" --details "<p>...</p>" --calm` for a decision
  - `#I` instead of `#J` for a problem
- Don't commit in `~/psi/qos/epics`: a hook commits it.
