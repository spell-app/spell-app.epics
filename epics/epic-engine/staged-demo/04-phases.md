# 04 · Two phases

After Owen's Accept Overview:  the page moves to its Phases stage, and two phases go on, each with its plan.
Before running this:  4 working lines, a pause after each (about 10 seconds).

## Commands

```sh
epic add-phase demo "Gather The Day" --estimate "1-2h" \
  --symptom "<p>Saying good morning gets a greeting, and nothing else.</p>" \
  --changes "<p>A new briefing step collects today's meetings, the mail that matters and the forecast.</p><p>It keeps only the top few of each.</p>" \
  --goal "<ul><li>One call, <code>Briefing.forToday()</code>, returns today's picks in under 3 seconds.</li><li>A slow or broken service is left out, never waited on.</li><li>Tested with a pretend calendar, inbox and forecast.</li></ul>" \
  --plan "<ol><li>Ask the calendar, mail and weather at the same time, with a 3 second limit.</li><li>Keep the next three meetings, the mail you'd answer first, and today's forecast.</li><li>Tests for a busy day, a quiet day and a service that doesn't answer.</li></ol>"
epic add-phase demo "Speak It Well" --estimate "1h" \
  --symptom "<p>Even with the facts gathered, Jarvis would read them out as a list.</p>" \
  --changes "<p>The picks become one short paragraph that sounds like a person.</p><p>The good morning handler speaks it.</p>" \
  --goal "<ul><li>One paragraph, about 20 seconds long, in Jarvis's usual voice.</li><li>A quiet day gets a short, friendly line.</li><li>Heard out loud on the laptop before it's called done.</li></ul>" \
  --plan "<ol><li>Write the paragraph from the picks:  meetings first, then mail, then weather.</li><li>Call it from the good morning handler.</li><li>A manual test:  say good morning and listen.</li></ol>"
epic open demo --review
```

## Say

Two phases are up, each with its plan:

1. **Gather The Day:**  collect what matters, quickly.
2. **Speak It Well:**  say it as one natural paragraph.

Press **Accept Phases** when they look right, and I'll start building.
