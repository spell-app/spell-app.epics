# Spell page gaps:  what a Spell page couldn't do for the Netlist Viewer

Written for:  the agent of the Spell epic that closes these, coming to it cold.

## Background

Epic `netlists` built a Netlist Viewer for Jarvis (an Apollo netlist:  a recursive JSON wiring list).  It's meant to
be a Spell page in the Jarvis space;  for now it's a plain HTML page plus TypeScript, served by Spell UI's Vite dev
server (`example/serve.mts`), because a Spell page couldn't do four things.  Closing them lets the viewer become an
ordinary Spell page in the Netlists project (`spaces/@psiquantum/jarvis/netlists/`).

Check each against the kit first:  one may already have a way the agents missed.

## The gaps

1. **A Spell page can't take an uploaded file.**
   - No Spell word for a file input or a drop zone, none for reading a `File`'s text.
   - Wanted:  pick or drop a `.json`, read its text, hand it to the reader.
2. **A Spell page can't call a TypeScript helper.**
   - Spell has no words for parsing JSON or walking an object's keys, so the reading lives in `netlistReader.ts`
     (`example/`);  Spell code can't call it.  A project can't import a `.js` file either:  the compiler skips active
     `.js` imports.
   - A page running its own compiled copy of the classes (`netlists.spell.js`) has different classes from the
     library's (`netlists.lib.ts`), so the reader takes `options.classes`:  a wart;  one copy would be better.
3. **A Spell page can't define a subclass element.**
   - A Spell `view` extends `View`;  nothing lets a project declare an element extending a `<ui-*>` element.
   - The viewer has several, all TypeScript today:  `<netlist-columns>` (extends `<ui-tree>`), `<jarvis-netlist>`
     (extends `<ui-graph>`), `<ui-json-viewer>` (extends `<ui-json>`), `<netlist-ref>` (its own).  Each defines a
     vocabulary (`@E.proto static vocabulary`), adds a sheet (`@E.protoMerged static elementSetup`), and calls
     `define()` from the project.
   - Two gotchas found:  a vocabulary missing `slots` or `texts` crashes `Vocabulary.resolve` ("vocabulary.slots is
     not iterable"):  the type could default them;  and a percentage height doesn't reach through a shadow root.
4. **jarvis-spell's Spell is too old.**
   - jarvis-spell's `yarn start` runs Spell from `spell-0.8.9.tgz`, without `<ui-tree mode="columns">`.
   - Even with 1-3 closed, the page needs Spell packed again from a branch that has it (the kit's `netlists`).

## What's in this bundle

| Path | What |
| --- | --- |
| `example/Netlists.spell` | the classes (`netlist`, `netlist node`, `netlist port`, `netlist connection`, `netlist endpoint`, `netlist problem`) |
| `example/netlistReader.ts` | `readNetlist(text, { name, classes?, resolveSubnetlist? })` and helpers:  the TS a Spell page can't call |
| `example/serve.mts` | the workaround:  Spell UI's Vite server, serving the project's page through `/@fs/` |

## What's wanted

- For each gap, the Spell-native way:  words or project rules, written up before it's built, saying where each
  belongs in the kit (parser rules, core runtime, element tools, the project compiler).
- Then the viewer rewritten as a Spell page in the Netlists project, running under jarvis-spell's `yarn start`.

## See also

- The epic page:  `~/psi/qos/epics/epics/netlists/netlists.plan.html` (J12, I1, I3).
