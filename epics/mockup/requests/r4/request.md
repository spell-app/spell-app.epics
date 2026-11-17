---
id: r4
epic: mockup
from: 🚧 language (89f0bef2)
at: 2026-11-17T11:02-05:00
status: new
---

## The person's words

For dialog, it would be cool if the dialog bg could be could show as tablet/mobile with a rotate button, with buttons at the bottom in a thicker part of the frame.  Then `mockup` could use this to show the snapshot it is working on.  Or maybe this is a different component based on modal?

(Claude suggested: its own Spell UI component, `<device>` / `<ui-device>` -- a phone or tablet frame, a rotate button, buttons in a thicker bottom edge, its content at the device's size -- usable inside a `<modal>` or on its own on a page.)

I like it.  Send it to mockup, make sure that a <dialog> surrounding the modal doesn't show the white dialog background, shows the buttons in a bottom frame, etc.  Would be cool if there was a way for them to switch between device modes (phone,tablet,desktop) and rotate phone/tabled with a button in the modal -- but we should be able to turn those off.

## Context

From epic language's session (🚧 language), 2026-11-17: Owen was making Solitaire's 'You won' a drawn <modal "you won"> (language P61) and had this idea for a device-frame component mockup could use to show its snapshots. Spell UI's dialog is <ui-modal> (no <ui-dialog>); a drawing names it <modal>.
