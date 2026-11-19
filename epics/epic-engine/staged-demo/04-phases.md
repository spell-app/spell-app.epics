# 04 · Four phases

After Owen's Accept Overview:  the page moves to its Phases stage, and four phases go on, one per part, each with its plan.
Before running this:  4 working lines, a pause after each (about 10 seconds).

## Commands

```sh
epic add-phase demo "Upcoming Meetings" --estimate "2h" \
  --symptom "<p>The briefing can't tell you what's next on your calendar.</p>" \
  --changes "<p>The meetings part reads your calendar, and names your next two meetings:  when, what, and who with.</p>" \
  --goal "<ul><li>Your next two meetings today, in one sentence.</li><li>No meetings left:  the part says nothing.</li><li>Tested with a pretend calendar.</li></ul>" \
  --plan "<ol><li>Ask the calendar for the rest of today.</li><li>Keep the next two meetings, and skip the ones you declined.</li><li>Tests for a busy day and an empty one.</li></ol>"
epic add-phase demo "Jira and Confluence Links" --estimate "3h" \
  --symptom "<p>Tickets and pages that need you are easy to miss first thing.</p>" \
  --changes "<p>The links part finds the tickets assigned to you and the pages you were tagged on, and says how many there are.</p><p>The links themselves go to your phone, so you can open them later.</p>" \
  --goal "<ul><li>One sentence:  how many tickets and pages, and the most important one by name.</li><li>Links sent to your phone, never read aloud.</li></ul>" \
  --plan "<ol><li>Ask Jira for your open tickets, and Confluence for pages that tag you since yesterday.</li><li>Name the most urgent one;  count the rest.</li><li>Send the links to your phone.</li></ol>"
epic add-phase demo "Today's Weather" --estimate "1h" \
  --symptom "<p>You find out it's raining when you're already outside.</p>" \
  --changes "<p>The weather part says today's high and whether to bring a coat.</p>" \
  --goal "<ul><li>One sentence, for where you are today.</li><li>A slow weather service is left out, never waited on.</li></ul>" \
  --plan "<ol><li>Ask for today's forecast, with a 3 second limit.</li><li>Say the high, and rain if it's likely.</li><li>Tests for sun, rain and no answer.</li></ol>"
epic add-phase demo "A Joke" --estimate "1h" \
  --symptom "<p>Mornings are serious enough.  The briefing should end with a smile.</p>" \
  --changes "<p>The joke part picks one short, clean joke a day, and never the same one twice in a month.</p>" \
  --goal "<ul><li>One joke at the end of every briefing, under 10 seconds out loud.</li><li>No repeats within 30 days.</li><li>Works on its own, before the other parts are built.</li></ul>" \
  --plan "<ol><li>A list of 60 short jokes, checked to be clean and kind.</li><li>Pick today's from the ones not told in 30 days, and remember it.</li><li>Call the briefing from the good morning handler, with the joke as its only part for now.</li></ol>"
epic open demo --review
```

## Say

Four phases are up, one per part, each with its plan:

1. **Upcoming Meetings:**  your next two meetings.
2. **Jira and Confluence Links:**  the tickets and pages that need you.
3. **Today's Weather:**  the high, and whether to bring a coat.
4. **A Joke:**  one short joke to end on.

Each part works on its own, so you can pick which one I build first.  Press **Looks good** (the thumbs up) on that phase, then **Accept Phases**.
