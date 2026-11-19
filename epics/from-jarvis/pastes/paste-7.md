## Two Jarvis API lists that fail on dev (from epic `ingest-jarvis-api`, issue I2)

### 1. Layer stacks: `GET /jarvis/v1/api/registry/layers/stack`
- Dev answers **400**: "Provide either `system` (design scope) or `instance_id` (instance scope)".
- The OpenAPI spec marks both `system` and `instance_id` as optional (`required: false`), so any client built from the
  spec calls it without them and fails.
- Fix, either:
  - **Jarvis:** say in the spec that one of the two is needed, or split the route in two
    (`/layers/stack?system=` and `/layers/stack?instance_id=`); or
  - **Spell / the converter:** let a collection be "asked for by" a query parameter that the thing has no field for.
    Today `layer stacks are asked for by their system` can't be written, because a layer stack has no `system` field.

### 2. Loaded netlist designs: `GET /jarvis/v1/api/registry/netlist/design/load`
- Dev answers **404**: the server is missing the netlist file for its default system, `pre_alpha3`.
- Fix: on the Jarvis dev server, either deploy the `pre_alpha3` netlist file or change the default system.
  It's not a client problem.

### State in ingest-jarvis-api
- Both collections stay marked failed in the Jarvis place, with the reason, until they can be read.
- The place only reads; nothing is written to Jarvis.
