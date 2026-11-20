/**
 * Typing latency in the editor's code pane:  key event to the next frame painted, over `--keys` keystrokes (100).
 * - Two measures, per keystroke:
 *   - Event Timing (the browser's INP measure):  the longest `keydown` / `keypress` / `keyup` entry of the interaction,
 *     from the key's time stamp to the next paint after its handlers (8ms steps)
 *   - frame:  from `keydown`'s time stamp to a task queued after the next animation frame (rAF, then a message)
 * - Types into a comment (Card.spell, line 2), one key every `--gap` ms (120, a quick typist);  autosave is off and
 *   writes to the server are refused, so nothing on disk changes.
 * Usage (from the kit's root):
 *   node <this folder>/perf-typing.mjs [desktop|phonewide] [--keys 100] [--gap 120] [--out typing.json]
 * - The phone profile at phone width (`phone`) shows no code pane:  use `phonewide`, the phone's CPU and network.
 */
import { writeFileSync } from "node:fs"

import { PAGES, args, loadAverage, median, metricsAfterGC, openFresh, waitReadyAndQuiet } from "./perf-lib.mjs"

const { positional, flags } = args()
const [profileKey = "desktop"] = positional
const keys = Number(flags.keys ?? 100)
const gap = Number(flags.gap ?? 120)

const uptime = await loadAverage()
const { browser, page, cdp } = await openFresh("editor", profileKey)
await page.goto(PAGES.editor.url(), { timeout: 180_000, waitUntil: "commit" })
await waitReadyAndQuiet(page, { quietMs: 3000 })
await page.evaluate(() => {
  const { view } = window.editor.shownCodeEditor
  const line = view.state.doc.line(2)
  view.dispatch({ selection: { anchor: line.to }, scrollIntoView: true })
  view.focus()
  // frame latency:  keydown's time stamp -> after the next frame
  window.__frames = []
  addEventListener(
    "keydown",
    (event) => {
      const stamp = event.timeStamp
      requestAnimationFrame(() => {
        const channel = new MessageChannel()
        channel.port1.onmessage = () => window.__frames.push(performance.now() - stamp)
        channel.port2.postMessage(0)
      })
    },
    { capture: true }
  )
  window.__perf.events.length = 0
})
await page.waitForTimeout(500)
const before = await metricsAfterGC(cdp)
const text = " the quick brown fox jumps over the lazy dog and keeps on typing a long comment"
const started = Date.now()
for (let index = 0; index < keys; index++) {
  await page.keyboard.type(text[index % text.length])
  await page.waitForTimeout(gap)
}
const typingWall = Date.now() - started
await page.waitForTimeout(2000)
const after = await metricsAfterGC(cdp)
const { frames, events } = await page.evaluate(() => ({ frames: window.__frames, events: window.__perf.events }))
const typed = await page.evaluate(() => window.editor.shownCodeEditor.view.state.doc.line(2).text.length)
await browser.close()

// Event Timing:  the longest key entry of each interaction
const byInteraction = new Map()
for (const entry of events) {
  if (!/^key/.test(entry.name) || !entry.interactionId) continue
  const known = byInteraction.get(entry.interactionId)
  if (!known || entry.duration > known.duration) byInteraction.set(entry.interactionId, entry)
}
const durations = [...byInteraction.values()].map((entry) => entry.duration)
const processing = [...byInteraction.values()].map((entry) => entry.processing)
const delays = [...byInteraction.values()].map((entry) => entry.delay)
const percentile = (values, share) => [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(values.length * share))]
const summary = {
  profile: profileKey,
  uptime,
  keys,
  gap,
  typingWall,
  lineLengthAfter: typed,
  eventTiming: {
    interactions: durations.length,
    median: median(durations),
    p90: percentile(durations, 0.9),
    worst: Math.max(...durations),
    over50: durations.filter((value) => value > 50).length,
    over100: durations.filter((value) => value > 100).length,
    medianProcessing: median(processing),
    medianInputDelay: median(delays)
  },
  frame: {
    samples: frames.length,
    median: median(frames),
    p90: percentile(frames, 0.9),
    worst: Math.max(...frames)
  },
  heapBefore: before.JSHeapUsedSize,
  heapAfter: after.JSHeapUsedSize,
  heapPerKey: Math.round((after.JSHeapUsedSize - before.JSHeapUsedSize) / keys),
  nodesBefore: before.Nodes,
  nodesAfter: after.Nodes,
  listenersBefore: before.JSEventListeners,
  listenersAfter: after.JSEventListeners
}
writeFileSync(flags.out ?? `perf-typing-${profileKey}.json`, JSON.stringify(summary, null, 2))
console.log(JSON.stringify(summary, null, 1))
