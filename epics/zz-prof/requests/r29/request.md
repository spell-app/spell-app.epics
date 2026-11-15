---
id: r29
epic: epic-engine
from: elemental-spell-97
at: 2026-10-25T10:53-04:00
status: filed
filed: P40 · Shared Page Patch
phase: p-shared-page-patch
---

## Owen's words

Move the page patch (patchPage, planMorph, carryState, readingAnchor) into the kit, with each runtime's hooks, and use it on the component-set pages.  Include:  an open editor (Monaco inside a cell) counts as an element never replaced;  a page's own save is recognised by its ETag, so the page doesn't patch itself.  Owen, 2026-10-25, to elemental-spell:  'reloading/flashing the page is a no-go ... Maybe rather than reloading the page, we send the new page contents to the controller, and it does a granular diff and just updates what has actually changed?' and 'reload MUST NOT FLASH anything other than what has actually changed!'  Owen to epic-engine, same day:  'page server, when reloading a live page, sends the new content to the running page.  It then runs a diff on current/new HTML and only updates what has changed -- inserting/removing sections, updating prose, leaving <inputs> alone;  the insertions should be as granular as possible.  We're going to want this for live-updating pages in the editor as well.  An alternative ... have the server generate diffs that it sends to the page.  We are going to want this for multi-player spell anyway.'

## Context

elemental-spell's notebooks are .spellx Spell templates now and mostly re-render per cell, so they need this for (a) HTML component-set pages (Spell UI's Button page until it's a notebook) and (b) no flash when an outside change (an agent's edit) reaches an open page.  elemental-spell P16 won't wait on it.
