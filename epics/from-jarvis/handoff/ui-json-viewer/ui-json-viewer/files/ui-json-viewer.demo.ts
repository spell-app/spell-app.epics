/**
 * The `<ui-json-viewer>` demo page's script (`ui-json-viewer.html`):  Spell UI and `<ui-root>` from the kit,
 * `<ui-json-viewer>` from this folder, then the examples' data set through `value`.
 */
import "spell/ui"
import "spell/ui/components/ui-root"
import { UI } from "spell/ui/runtime"
import "./index"
import type { JsonNavigateDetail } from "./index"

// `?theme=matrix&scheme=dark`:  a theme, and a forced scheme, as `UI.themes` and `<ui-root theme>` set them
const params = new URLSearchParams(location.search)
const scheme = params.get("scheme")
if (scheme === "dark" || scheme === "light") {
  document.querySelector("ui-root")?.setAttribute("theme", scheme)
  document.documentElement.style.colorScheme = scheme
}
const theme = params.get("theme")
if (theme) void UI.load().then(({ themes }) => themes.apply(theme))

document.addEventListener("ui-json-navigate", (event) => {
  const { path, part, value } = (event as CustomEvent<JsonNavigateDetail>).detail
  const log = document.getElementById("navigate-log")
  if (log) log.textContent = `ui-json-navigate:  ${part} at ${JSON.stringify(path)}  =  ${JSON.stringify(value)?.slice(0, 80)}`
})

const deep = {
  netlist: {
    name: "av1p0",
    root: {
      type: "top",
      subcomponents: {
        ssx001: { type: "ssx_v2", ports: { in0: { type: "optical", direction: "in" }, out0: { type: "optical", direction: "out" } } },
        ctl: { type: "controller", attrs: { clock: 250e6, lanes: [0, 1, 2, 3] } }
      },
      connections: ["ssx001.out0 ctl.in", "in ssx001.in0"]
    }
  },
  generated: "2026-11-18T10:00:00Z"
}

const kinds = ["optical", "electrical", "comm"]
const directions = ["in", "out", "inout"]
const ports = Object.fromEntries(
  Array.from({ length: 387 }, (_, i) => [
    `p${String(i).padStart(3, "0")}`,
    { type: kinds[i % 3], direction: directions[i % 3], attrs: i % 5 ? {} : { lane: i, pitch_um: 127 } }
  ])
)
const big = { type: "fau62", attrs: { interface: { name: "fau", version: "62" } }, ports, connections: [] as string[] }

const viewerAt = (id: string) => document.getElementById(id) as unknown as { value: unknown }

customElements.whenDefined("ui-json-viewer").then(() => {
  viewerAt("json-deep").value = deep
  const started = performance.now()
  viewerAt("json-big").value = big
  requestAnimationFrame(() => console.info(`ui-json-viewer:  387 ports drawn in ${Math.round(performance.now() - started)} ms`))
})
