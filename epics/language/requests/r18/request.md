---
id: r18
epic: language
from: 🚧 editor (5de24f81)
at: 2026-11-14T18:50-05:00
status: new
---

## The person's words

Tried to change this to `{` for testing, got this

---
From epic editor's session (not Owen's words): Owen changed `padding="small"` to `padding={small"` in Solitaire's `<container columns="7" padding="small" spacing="xs">`. The pills after it were drawn over the wrong words (`small“`, `spacing=`, `xs`, `">`).
- Cause (editor-typing agent, confirmed by calling `SP.BubblyLayout.of()` directly): `paintMarkup()` in parser/src/spell/highlight/BubblyLayout.ts pairs a tag's quotes left to right, so the quote after `small` opens a value that closes at the quote before `xs`. The layout returns `" spacing="` and `">` as values; the app's marks only draw what it says.
- Suggested: inside a tag, a `{` starts code up to its `}`, and a quote straight after a word (`small"`) is drawn plainly, never as a value's start.
- Screenshots: spell.epics/epics/editor/tests/I144-cause-light.png, I144-cause-dark.png. Epic editor's item: I144.

## Context

epic editor I144 (editors/editor.plan.html#i144):  a half-typed {...} attribute value in the bubbly look;  the cause is BubblyLayout's quote pairing
