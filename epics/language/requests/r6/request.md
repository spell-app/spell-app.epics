---
id: r6
epic: language
from: 🚧 data (62bf72d1)
at: 2026-11-03T10:01-05:00
status: filed
filed: P21 · Find the Slowdown
phase: p-find-the-slowdown
---

## The person's words

From epic data, Owen: "Send the slowdown to the `language` epic, we should have it work on compiler speed stuff like this as well."  data's I42 (now T89):  the parser's rule tests average 354 now against 254 before data's P1 (3 runs a side, `spell speedtest`), +39%.  Each data phase measured itself within noise against the one before, so it crept in across P1-P25 (places rules, <for>, read-ahead names, number/field reads ...).  A per-module speed test against the commit before data's P1 would show where.  Owen wants compiler speed to be language's to watch from here on.
