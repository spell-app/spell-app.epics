## Context from epic `ingest-jarvis-api`: required environment variables (JARVIS_TOKEN)

### What works today
- The Jarvis place (`spaces/@psiquantum/jarvis/jarvis-api/Jarvis.api.spell`) names its key by name only:
  `its key is the secret "JARVIS_TOKEN"`. The token is never written into a file.
- The token is a HallPass token minted by hand from a dev HallPass API key (manual test M1). It's saved to
  `~/.spell/jarvis-token` (mode 600) and passed in when Spell starts:
  `JARVIS_TOKEN="$(cat ~/.spell/jarvis-token)" yarn start`.
- Node-side reads work: `scripts/verify-place.mjs` hands the key in and has verified the Jarvis API's reads on dev.
  A direct `GET /api/jobs` with the token answers 200.

### What doesn't work
- **Pages in the browser can't read a keyed place (I5).** Spell refuses on purpose: "nothing in a browser holds a key,
  so a place that needs one refuses there" (`core/runtime.js`, `WebPlace`). Spell has a server half that holds keys
  (`PlaceServer`, `/api/places/<name>/`, which scrubs keys from every answer), but `spell server local` doesn't serve
  user places like `jarvis` through it. So setting JARVIS_TOKEN on the page server is NOT enough: the Jobs page in
  jarvis-new shows "Jarvis didn't answer" even with the token set. (An earlier note, T8, assumed the page server was
  the server side. That's wrong for Spell 0.8.9.)
- **Tokens expire after hours (T3).** Every read then answers 401 until a new token is saved and Spell is restarted.
- **The Control System API rejects API-key tokens (I3).** It wants the `user` audience a person's own sign-in gets.
  API-key tokens carry machine audiences instead.
- **Dev and prod need different tokens.** The HallPass key is dev-only. A prod token needs a prod key first (M4), saved
  to its own file (`~/.spell/jarvis-prod-token`). The place's server address is written into the place, so switching
  servers means re-running `scripts/openapi-to-place.mjs --address ...` (T5).
- **Starting Spell without the variable fails quietly.** Pages just show their failure line. Nothing checks for or
  names the missing variable at startup.

### What the person decided or said
- Q2 (decided): for now, a token the person generates by hand, put in JARVIS_TOKEN by the person. Claude never handles
  the token itself. Long-lived access is a later todo (T1), by one of two routes:
  (B) a read-only HallPass service principal (`jarvis-api:read`), with a small script that swaps its id and secret for a
  token before `yarn start`; or
  (C) a Spell change, a place line like "its key comes from HallPass", so Spell refreshes tokens itself.
- Q6 (decided): use dev for all the work, then do one final read against production.
- Rule: Jarvis data is read only, and no Jarvis rows are ever kept in any repo (T4).

### Open questions for the new epic
1. How should pages reach a keyed place: should Spell's page server serve keyed places through `PlaceServer`, or
   should this repo run its own small place server for `jarvis`?
2. Which variables are required, and how should Spell check for them at startup (name the missing one, never print
   its value)?
3. How do tokens get refreshed: B or C above?
4. How do you switch between dev and prod: a token per server, and an address per server?
