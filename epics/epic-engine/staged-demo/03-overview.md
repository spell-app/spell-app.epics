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
<epic-summary>Say "good morning" and Jarvis answers with one short paragraph about your day:  your first meetings, the mail that matters, and the weather.  It uses what Jarvis can already see, and adds nothing you have to set up.</epic-summary>
```

The parts:

```html
<epic-section id="o1" kind="overview-part" title="What you'll hear">
  <p>One paragraph, about 20 seconds long, read in Jarvis's usual voice.  For example:</p>
  <blockquote><p>Good morning, Owen.  You have three meetings today, the first at 9:30 with Priya about the launch.  Two emails look urgent, both from Sam.  It'll be 14 degrees and dry until about four, so take a jacket for later.</p></blockquote>
  <p>A quiet day says so:  "Nothing on your calendar, and your inbox can wait."</p>
</epic-section>
```

```html
<epic-section id="o2" kind="overview-part" title="How it works">
  <p>Jarvis builds the briefing in three steps:</p>
  <ol>
    <li><b>Gather.</b>  Jarvis checks your calendar, mail and weather together, and gives them 3 seconds to answer.</li>
    <li><b>Pick.</b>  It keeps only what matters:  the next few meetings, the mail you'd answer first, and today's weather.</li>
    <li><b>Say it.</b>  It writes what it chose as one short paragraph, and reads it aloud.</li>
  </ol>
  <epic-code title="greetings.ts · after · 4 lines" language="ts"><pre>if (/good morning/i.test(phrase)) {
  const briefing = await Briefing.forToday(ctx)
  await ctx.speak(briefing.paragraph)
}</pre></epic-code>
</epic-section>
```

```html
<epic-section id="o3" kind="overview-part" title="What stays the same">
  <ul>
    <li>The wake phrase and every other skill work as they do today.</li>
    <li>Jarvis doesn't save your briefings.  It makes a new one each morning.</li>
    <li>No new accounts or settings to fill in.</li>
  </ul>
</epic-section>
```
