# brand/

Spell's brand pages and design files:  Claude Design's export and its Spell UI copies, the `brand-*` elements'
docs pages, and pages pulled back from Claude Design.

- `index.html` -- the Brand tab's home:  every Claude Design page with its copy and Compare, the elements, and (between
  its `<!-- index:start -->` / `<!-- index:end -->` markers, written by `epic pages index`) every other page here.
- `compare.html?page=<Name>` -- an original and its copy side by side, or one over the other.
- `spell-design-system/` -- Claude Design's output, AS EXPORTED (never edit):  `readme.md` (the brand rules), tokens,
  logo assets, the 13 `*.dc.html` pages;  beside each, its copy on Spell UI, `<Name>.spell.html`.
- `components/<tag>.html` -- each `<brand-*>` family's docs page;  `components/components.spell.html` the specimen.
- `leonardo/` -- the reference images and brief from before Claude Design.
- `pony.html` -- the Spell pony, built in Claude Design and brought back with `spell design pull` (P10 of epic
  `claude-design`).
- `design-system.json` -- the design system's push record (`spell design pushed`).
- What stays TRACKED in `spell-brand/` (versioned per branch):  the elements' code (`components/<tag>/`), `src/`,
  `scripts/`, the built bundles and page scripts (`_assets/`), the docs data (`_data/`).  The pages load them as
  `../spell-brand/_assets/...` (one folder deeper:  `../../`).  Moved here from `spell-brand/` by P11 (Brand) of
  epic `claude-design` (`epics/claude-design/claude-design.plan.html`).
- Linked at the root of every checkout (the root `package.json`'s `"shared"`);  the top bar's Brand tab opens
  `index.html` and lights on every page here.
