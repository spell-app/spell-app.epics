# 03 · The Overview

The Overview goes onto the page:  a two-sentence summary and three short parts.  Then the session listens.
Run straight after the pause that follows step 02.

## Commands

```sh
epic demo overview 03
epic open demo --review
```

## Say

The Overview is up:  what you'll hear, how it works, and what stays the same.

Pick an answer to each question, then press **Accept Overview** when it looks right.  I'm listening.

## Overview

The summary:

```html
<epic-summary>Say "good morning" and Jarvis answers with one short paragraph:  your next meetings, the Jira and Confluence links worth a look, today's weather, and a joke.  Each part is built on its own, so the joke can come first.</epic-summary>
```

The parts:

```html
<epic-section id="o1" kind="overview-part" title="What you'll hear">
  <p>One paragraph, about 20 seconds long, in Jarvis's usual voice.  For example:</p>
  <blockquote><p>Good morning, Owen.  Your first meeting is at 9:30, the launch review with Priya.  Two tickets need you, and Sam tagged you on the release notes page.  It'll be 14 degrees and dry.  And a joke:  why did the calendar feel popular?  Its days were all booked.</p></blockquote>
  <p>A part with nothing to say is left out.</p>
</epic-section>
```

```html
<epic-section id="o2" kind="overview-part" title="How it works">
  <p>Each part of the briefing is a <code>BriefingSource</code>.  Jarvis asks all four at once, waits up to 3 seconds, and reads what came back, in order.</p>
  <epic-code title="greetings.ts · after · 4 lines" language="ts"><pre>if (/good morning/i.test(phrase)) {
  const briefing = await Briefing.forToday(ctx, [meetings, links, weather, joke])
  await ctx.speak(briefing.paragraph)
}</pre></epic-code>
</epic-section>
```

```html
<epic-section id="o3" kind="overview-part" title="What stays the same">
  <ul>
    <li>The wake phrase and every other skill work as they do today.</li>
    <li>A part that isn't built yet says nothing.  The briefing still works.</li>
  </ul>
</epic-section>
```
