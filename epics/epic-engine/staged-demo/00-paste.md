# 00 · What Owen pastes

Type `/epic demo `, then paste everything inside the box below (not the four backticks).
It's a feature ask for Jarvis, with the code it starts from.

## Paste

````text
Jarvis should give me a morning briefing.  When I say "good morning", read me one short spoken paragraph:  my upcoming meetings, the Jira and Confluence links worth checking, today's weather, and a joke to start the day.

Here's where the wake phrase is handled today, and the shape I have in mind.  Only the joke is real so far:  meetings, Jira / Confluence and weather are stubs.

```ts
// jarvis/src/skills/greetings.ts
export async function onWakePhrase(phrase: string, ctx: SkillContext) {
  if (/good morning/i.test(phrase)) {
    await ctx.speak(`Good morning, ${ctx.user.firstName}.`)
    // TODO: the briefing
  }
}

// jarvis/src/briefing/BriefingSource.ts
/** One part of the morning briefing:  gathers what it needs, and says it in a sentence or two. */
export interface BriefingSource {
  title: string
  /** what this part says, or nothing on a quiet morning */
  sentence(ctx: SkillContext): Promise<string | undefined>
}

export const meetings: BriefingSource = { title: "Upcoming meetings", sentence: async () => undefined } // stub
export const links: BriefingSource = { title: "Jira and Confluence", sentence: async () => undefined } // stub
export const weather: BriefingSource = { title: "Today's weather", sentence: async () => undefined } // stub
export const joke: BriefingSource = {
  title: "A joke",
  sentence: async () => "Why did the calendar feel popular?  Its days were all booked."
}
```
````
