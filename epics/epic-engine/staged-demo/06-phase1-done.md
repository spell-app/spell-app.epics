# 06 · The picked phase done

After Owen answers the two questions and presses Send:  the phase he picked (A Joke) finishes, with the things found along the way.  The other three phases stay to do.
Before running this:  6 working lines, a pause after each (about 15 seconds:  "building").

Each item shows in its own colour:
- J1 yellow:  a call Claude made that wouldn't surprise you
- J2 red:  a call you'd want a say in, with options to pick
- I1 red:  an open issue
- I2 orange:  fixed, waiting for your review
- I3 light orange:  your own request, done, until you look
- T1 yellow:  a todo;  T2 grey:  a limit to know about;  T3 blue:  under way, for Upcoming Meetings
- M1:  a manual test, for you to try by hand

## Commands

```sh
epic add demo#J "Jokes about work are left out on Mondays" --calm --details '<p>A joke about meetings lands badly when your week starts with six of them.  On Mondays, Jarvis picks from the other jokes.</p>'
epic add demo#J "The joke comes last, after the weather" --options "*Last, to end on a smile | First, to wake you up" --details '<p>Ending on the joke felt right, but some people want it first, while they are still in bed.  You might disagree.</p>'
epic add demo#I "Puns with homophones sound wrong in Jarvis's voice" --details '<p>"I knead you" is read out as "I need you", so the joke is lost.  These puns need a different voice setting, or leaving out.</p>'
epic add demo#I "The same joke came up twice in one week" --calm --details '<p>Restarting Jarvis forgot which jokes it had told.</p>'
epic update demo#I2 fixed "Told jokes are now saved to disk, so a restart remembers them.  Test added."
epic add demo#I "No jokes about cats, please" --requested --details '<p>Your words:  <q>My cat is sensitive.  No cat jokes.</q></p>'
epic close demo#I3
epic add demo#T "Let people add their own jokes" --details '<p>A family in-joke beats anything on the list.  A short text file could add them.</p>'
epic add demo#T "Only 60 jokes:  after two months they come round again" --limit --details '<p>Enough for now.  A longer list, or a joke service, can come later.</p>'
epic add demo#M "Hear the joke on your own laptop" --step '1. In Terminal: <pre><code>cd ~/www/jarvis
yarn dev</code></pre> 2. Wait for "Jarvis is listening". 3. Say "good morning, Jarvis".' --should 'Jarvis says good morning, then tells one short joke.  Saying good morning again tells no second joke today.'
epic phase "demo#${PICK:-p-a-joke}" done --no-open --done '<ul><li>One short, clean joke ends every briefing, picked from a list of 60.</li><li>For example:  "Why did the calendar feel popular?  Its days were all booked."</li><li>Puns and wordplay only (Q3);  no reply if you don'"'"'t laugh (Q4).</li><li>No repeats within 30 days, even after a restart (I2).</li><li>No cat jokes (I3).</li><li>Checked:  9 new tests, all passing;  one manual test for you (M1).</li></ul>'
epic phase demo#p-upcoming-meetings active --no-open
epic add demo#T "Read meeting times in the time zone you're in today" --start "On a trip, 9:30 at home is not 9:30 where you are. Use the time zone you're in."
epic phase demo#p-upcoming-meetings todo --no-open
epic inbox status demo "A Joke done"
```

## Say

**A Joke** is done.  The other three phases are still to do.
