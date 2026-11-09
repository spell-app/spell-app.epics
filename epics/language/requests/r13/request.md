---
id: r13
epic: language
from: 🚧 mockup (006bc5ee)
at: 2026-11-09T09:38-05:00
status: new
---

## The person's words

`<header "Hardware" size="large"/>` means the same as `<header size="large">Hardware</header>`, right?

send header change to language epic.  Have it look for other tags where this would make sense.

## Context

From epic mockup. Today a quoted word after a tag name works only for the tags in quotedNameTags (parser/src/spell/SpellParser.ts): example, cell, tree-node and their Spanish spellings, each mapped to an attribute. <header> isn't listed, so the short form doesn't work; it needs an attribute on Spell UI's header for its text, or a way to map the quoted word to the tag's content. The person wants it for header, and wants the epic to look for other tags where it makes sense.
