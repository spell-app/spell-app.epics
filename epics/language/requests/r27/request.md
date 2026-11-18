---
id: r27
epic: language
from: 🚧 mockup (2964811f)
at: 2026-11-18T09:33-05:00
status: filed
filed: T164
---

## The person's words

From mockup T54 (Weekend Countdown example): the core's `twoDigits()` and `durationPartOf()` in parser/src/core/dates.ts return `unknown`, so `<statistic value={the hours of its time left as two digits}>` gives 4 TypeScript errors in WeekendCountdown's typescript snapshot (a statistic's value is `string | undefined`). Please type their returns.

## Context

epic mockup T54, app/spaces/@spell/examples/WeekendCountdown, commit ea116413a on branch mockup
