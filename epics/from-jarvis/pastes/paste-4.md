## Deployments: context from epic `ingest-jarvis-api`

### What the person asked for (their words, verbatim)
- "phase to address `deployments` if we don't have one already" (2026-11-18, in `ingest-jarvis-api`'s session).
- That's all they've said about it. Everything below is Claude's research, not their decisions.

### What Claude found (unconfirmed by the person)
Jarvis means two different things by "deployment", and they live in two different services.

**Job deployments**
- What they are: the Prefect deployment a job runs from. Every Jarvis job has a `deployment id` field that points at one.
- Where they're listed: only in the Control System, which is the jarvis-console's own backend. The Jarvis API has
  no route for them.
  - `GET /api/v1/option3/job-engine/deployments` answers each one's id, name, flow name, status and tags, inside a
    `data` envelope. "option3" in the path suggests a prototype route that could change.
  - `GET /api/v1/prefect/deployments` answers the same, plus each one's latest run and whether a worker is free. The
    spec doesn't describe its shape, so its fields would have to come from real rows.
- Blocker: the Control System rejects HallPass API-key tokens with "401 Invalid token audience". It wants the `user`
  audience that a person's own sign-in gets (issue I3 in ingest-jarvis-api). So nothing here can be read until there's
  a sign-in token, or another way in.

**System deployments**
- What they are: a system design put onto real hardware. The Jarvis API reads the result per instance, and the API-key
  token works for it.
  - `GET /api/registry/netlist/instances`: deployed instances. Already in the Jarvis place and verified on dev.
  - `GET /api/instance-netlists/{instance_id}/reservation-surface`: the deployment status (not deployed, pending,
    succeeded or failed), plus readiness counts.
  - `GET /api/systems/instance/{instance_id}/snapshot`: the full component tree, as deployed.
  - The last two answer one record per instance, not a list. The converter (`scripts/openapi-to-place.mjs`) skips
    routes like that today, so it would need to learn to write them as part of a record.

**Writes: left out on purpose (Jarvis is read only in Spell)**
- `POST /api/systems/deploy`, `PUT /api/systems/deploy` and `POST /api/netlists/deployments` are in the place only as
  comments.

**Where deployments show up in the redesign**
- The Jobs page in `jarvis-new` (`jobs-screen.spell`) has the subtitle "Deployments, In-Flight, Completed", but it
  has no deployments list yet.

### Open questions (none answered yet)
1. Which deployments belong on the Jobs page: job deployments or system deployments? Claude recommended job
   deployments, with the page step waiting for a sign-in token (Q9 in ingest-jarvis-api).
2. How does Spell get a token the Control System accepts? See I3, and the separate environment-variables epic.
3. Can a page show any of this at all? Today a Spell page can't read a place that needs a secret key (I5 in
   ingest-jarvis-api), so this depends on that being solved.

### Related state in ingest-jarvis-api
- P9 · Deployments was drafted there, with a build plan that hasn't been accepted, along with question Q9. If this
  new epic takes deployments over, mark P9 dropped there, "moved to its own epic", the same way P5 was.
