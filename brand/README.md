# brand/

Spell's brand pages and design files:  logo, colors, type, the `ui-brand-*` elements' showcase.

- `index.html` -- the Brand tab's page:  every brand page, written by `spell dev docs index` (between its
  `<!-- index:start -->` / `<!-- index:end -->` markers;  edit only outside them).
- `pony.html` -- the Spell pony, built in Claude Design and brought back with `spell dev design pull` (P10 of epic
  `claude-design`).
- `design-system.json` -- the design system's push record (`spell dev design pushed`).
- The rest arrive in P11 (Brand) of epic `claude-design` (`epics/claude-design/claude-design.plan.html`), once the
  `design-system` epic merges into `main` and its `packages/brand/` pages move here.
- Linked at the root of every checkout (the root `package.json`'s `"shared"`);  the top bar's Brand tab lights on
  its pages.
