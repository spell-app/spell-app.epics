// Sweep:  ui-section's old attribute names to the new, inside the start tags of the section family only.
// Usage:  node sweep.mjs [--write] <files...>
import { readFileSync, writeFileSync } from "fs"
const write = process.argv.includes("--write")
const files = process.argv.slice(2).filter((arg) => arg !== "--write")
const TAG = /<(ui-section|ui-panel|ui-property-group|ui-property-editor)\b[^>]*>/gs
const NAMES = { header: "label", subhead: "hint", info: "description" }
let total = 0
for (const file of files) {
  const text = readFileSync(file, "utf8")
  let count = 0
  const swept = text.replace(TAG, (tag) =>
    tag.replace(/(\s)(header|subhead|info)(=)/g, (_, space, name, eq) => {
      count++
      return `${space}${NAMES[name]}${eq}`
    })
  )
  if (count) {
    total += count
    console.log(`${count}\t${file}`)
    if (write) writeFileSync(file, swept)
  }
}
console.log(`${total} attributes${write ? " rewritten" : " to rewrite"}`)
