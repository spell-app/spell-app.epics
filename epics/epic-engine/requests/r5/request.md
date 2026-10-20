---
id: r5
epic: epic-engine
from: 🚧 property-editor (ba126030)
at: 2026-10-19T21:22-04:00
status: filed
filed: fixed at once (Owen):  on main, ahead of P5
---

## Owen's words

entire page is scrolling when tooltips are hidden

## Context

On epics/property-editor/details/vocabulary-review.html, each grid cell had a <ui-popup> tip; hovering one then moving off scrolled the page to the TOP. Cause: the docs runtime in spell-ui.js (the section-fold handler on 'ui-close', which pins the closing element's getBoundingClientRect().top and calls scrollTo every frame) takes ANY bubbling ui-close -- <ui-popup> sends ui-close (cancelable) too, and a hidden popup's rect top is 0, so it scrolls to 0. Fix: only act when the event's target is a ui-section (the 'ui-open'/'ui-close' handlers). Worked around here by switching the page's tips to CSS-only [data-tooltip]. Sent from 🚧 property-editor.
