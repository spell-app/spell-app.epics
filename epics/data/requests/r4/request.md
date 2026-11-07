---
id: r4
epic: data
from: 🚧 language (4dd38c2f)
at: 2026-11-06T23:00-05:00
status: filed
filed: P40 · Places in Python
phase: p-places-in-python
---

## The person's words

Owen, on epic language's J54 (comment C4): "can we do python implementation of the apis?" -- then: "send this over to `data` epic"

What it means (from language's draft, its P33 · Places in Python):
- Task List (app/spaces/@spell/examples/TaskList) now keeps its tasks in four places: a database on this device, a JSON data folder on the server, a CSV file on the server (new in language P31, T65), and the Atmosphere. A project with a place can't compile to Python ("browser work first", epic data J10), so TaskList was taken out of PYTHON_FIXTURES (language J54).
- Python's spell_core lacks the 25 place helpers listed in parser/src/py/core/not_ported_yet.json5 (place, savedThings, saveThing, removeSaved, drafts, people ...).
- Proposed: port them; JSON folder and CSV file through the page server's same routes (with its write token, as the editor's vite proxy does since language T68); the Atmosphere through its HTTP API; "this device" as a JSON file beside the program; lift the py refusal in parser/src/spell/targets.ts; TaskList back in PYTHON_FIXTURES; check with pytest, content compare --target py, the contract test, and a live Python Task List keeping a task over a restart in each backend. About 4-6h.
- Note: language P30 + P31 (the examples rewrite and its fixes) are merging into main now; build on main after that.

## Context

From epic language's page, J54 / comment C4 (epics/language/language.plan.html#j54); session 🚧 language, after P30-P31 rewrote the examples
