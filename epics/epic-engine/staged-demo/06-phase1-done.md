# 06 · Phase 1 done

After Owen answers the two questions and presses Send:  phase 1 finishes, with the things found along the way.
Before running this:  6 working lines, a pause after each (about 15 seconds:  "building").

Each item shows in its own colour:
- J1 yellow:  a call Claude made that wouldn't surprise you
- J2 red:  a call you'd want a say in, with options to pick
- I1 red:  an open issue
- I2 orange:  fixed, waiting for your review
- I3 light orange:  your own request, done, until you look
- T1 yellow:  a todo;  T2 grey:  a limit to know about;  T3 blue:  under way in phase 2
- M1:  a manual test, for you to try by hand

## Commands

```sh
epic add demo#J "Meetings shorter than 15 minutes are left out of the briefing" --calm --details '<p>Quick check-ins crowd out the meetings that matter.  Anything under 15 minutes is skipped, unless you organised it.</p>'
epic add demo#J "Mail from your manager is always mentioned, even when you rarely write back" --options "*Always mention it | Treat it like any other mail" --details '<p>You seldom reply to your manager by email, so the usual rule would skip them.  It felt wrong to leave them out, but you might disagree.</p>'
epic add demo#I "Meeting times are read in the wrong time zone when you travel" --details '<p>The calendar gives times in the time zone you set at home.  On a trip, "9:30" can be an hour off.</p>'
epic add demo#I "Two all-day events were read out as one" --calm --details '<p>"Sam away" and "Office closed" both fell on Friday, and the briefing joined them into one line.</p>'
epic update demo#I2 fixed "Each all-day event now gets its own short line.  Test added for two on one day."
epic add demo#I "The greeting should use my nickname" --requested --details '<p>Your words:  <q>Call me Oz in the morning, not Owen.</q></p>'
epic close demo#I3
epic add demo#T "Let people choose which calendars count" --details '<p>A shared family calendar can fill the briefing with other people'"'"'s plans.  A setting could leave it out.</p>'
epic add demo#T "Only the 50 newest unread emails are checked" --limit --details '<p>Enough for a normal morning.  After a long holiday, older mail is not looked at.</p>'
epic add demo#M "Hear the briefing on your own laptop" --step '1. In Terminal: <pre><code>cd ~/www/jarvis
yarn dev</code></pre> 2. Wait for "Jarvis is listening". 3. Say "good morning, Jarvis".' --should 'Within 3 seconds Jarvis reads one paragraph:  your first meeting, any mail that matters, and the weather.'
epic phase demo#P1 done --no-open --done '<ul><li><code>Briefing.forToday()</code> gathers your meetings, the mail that matters and the forecast, all at once, in under 3 seconds.</li><li>A slow service is left out, never waited on:  the weather says "no forecast this morning" (Q4).</li><li>Meetings cancelled overnight get one short line (Q3).</li><li>Three calls made along the way, two issues found, one fixed, and your nickname used (I3).</li><li>Checked:  12 new tests, all passing;  one manual test for you (M1).</li></ul>'
epic phase demo#P2 active --no-open
epic add demo#T "Make the paragraph sound less like a list" --start "Meetings, then mail, then weather sounds robotic. Join them the way a person would."
epic inbox status demo "Building P2"
```

## Say

Phase 1 is done, and phase 2 is under way.
