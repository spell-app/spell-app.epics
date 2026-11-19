# 00 · What Owen pastes

Type `/epic demo `, then paste everything inside the box below (not the four backticks).
It's a feature ask for Jarvis, with the code it starts from.

## Paste

````text
Jarvis should give me a morning briefing:  one short spoken paragraph that pulls together today's calendar, anything urgent in my inbox, and the weather.  Read it out the first time I say "good morning".

Here's where the wake phrase is handled today, and what a skill already has to work with:

```ts
// jarvis/src/skills/greetings.ts
export async function onWakePhrase(phrase: string, ctx: SkillContext) {
  if (/good morning/i.test(phrase)) {
    await ctx.speak(`Good morning, ${ctx.user.firstName}.`)
    // TODO: tell me what my day looks like
  }
}

// jarvis/src/skills/SkillContext.ts
export interface SkillContext {
  user: { firstName: string; timeZone: string }
  calendar: { eventsBetween(start: Date, end: Date): Promise<CalendarEvent[]> }
  mail: { unread(limit?: number): Promise<MailSummary[]> }
  weather: { forecast(day: Date): Promise<Forecast> }
  speak(text: string): Promise<void>
}
```
````
