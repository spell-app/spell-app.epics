# 05 · Questions while building

After Owen's Accept Phases:  the phase he picked starts (`$PICK`:  the one he pressed Looks good on;  none:  A Joke), and two questions come up while it's built.
Before running this:  4 working lines, a pause after each (about 10 seconds).

## Commands

```sh
epic demo seen
epic phase "demo#${PICK:-p-a-joke}" active --no-open
epic inbox status demo "Building A Joke"
epic add demo#Q "What kind of jokes should Jarvis tell?" --options "*Puns and wordplay | Short one-liners | Facts that sound like jokes" --details '<p>Jokes heard before coffee need to be short.  Puns land in one sentence:  "I used to hate facial hair, but then it grew on me."</p>'
epic add demo#Q "What happens when you don't laugh?" --options "*Nothing:  Jarvis moves on | Jarvis says \"Tough crowd\" | Jarvis explains the joke" --details '<p>Jarvis can'"'"'t tell if you laughed.  The cost of moving on:  Jarvis never gets a comeback.</p>'
epic open demo --review
```

## Say

**A Joke** is under way, as you picked.

Two questions came up while building:  what kind of jokes, and what happens when you don't laugh.  They're on the page.  Answer them and press Send, and I'll finish the phase.
