---
id: r28
epic: language
from: 🚧 mockup (2964811f)
at: 2026-11-18T10:15-05:00
status: filed
filed: T165
---

## The person's words

Follow-up to r27 (language T164): Weekend Countdown still has 4 TS2322 errors ("unknown is not assignable to string | undefined"). The root is `core.secondsBetween(later: unknown, earlier: unknown): unknown` in parser/src/core/dates.ts: `its "time left" is the next weekend - its time` comes from it, so durationPartOf() gets unknown and passes it on. secondsBetween would need to return `number | undefined`, and a statistic's value may need to take a number (the days line). Also: the new type declarations in dates.ts landed between `DurationStyle` and its docstring.

## Context

epic mockup T54, app/tests/spell/__examples__/WeekendCountdown typescript snapshot, branch mockup
