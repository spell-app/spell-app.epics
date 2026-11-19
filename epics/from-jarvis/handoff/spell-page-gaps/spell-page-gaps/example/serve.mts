/**
 * Serves the Netlist Viewer:  Spell UI's Vite dev server (the kit's `ui/`), which also serves this folder's page
 * through `/@fs/`, compiling its TypeScript and resolving `spell/*` as the kit's own pages do.
 * - Why not a Spell page:  a Spell page can't yet take a file, call a TS helper or define a subclass element
 *   (judgement call, epic `netlists` P5);  and `yarn start`'s Spell (npm) has no `<ui-tree mode="columns">` yet.
 * - Run (KIT is a spell checkout or worktree with ui-tree columns, e.g. ~/psi/spell.worktrees/netlists):
 *     cd $KIT && NODE_PATH=$PWD/node_modules npx tsx <this folder>/serve.mts
 *   It prints the page's URL.  `SPELL_KIT` overrides the kit folder (default:  the current one).
 * - It also serves this project's `<ui-graph>` demo, `../ui-graph/ui-graph.html`, and the netlist the page opens
 *   with at `/netlist.json` (`NETLIST`, default `~/Downloads/av1p0.r005.netlist.json`).
 */
import { basename, dirname, join, resolve } from "node:path"
import { createReadStream, existsSync } from "node:fs"
import { homedir } from "node:os"
import { createRequire } from "node:module"
import { fileURLToPath, pathToFileURL } from "node:url"
import type { Plugin } from "vite"

const KIT = resolve(process.env.SPELL_KIT ?? process.cwd())
const UI = join(KIT, "ui")
const HERE = dirname(fileURLToPath(import.meta.url))
const PROJECT = resolve(HERE, "..")
// vite, from the kit (this folder has no node_modules)
const { createServer } = (await import(
  pathToFileURL(createRequire(join(KIT, "package.json")).resolve("vite")).href
)) as typeof import("vite")

/** Bare imports from this project (`spell/ui/...`, `solid-js`) resolve as if from the kit's `ui/`. */
function fromKit(): Plugin {
  const anchor = join(UI, "src", "index.ts")
  return {
    name: "netlists-from-kit",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (!importer || !importer.startsWith(PROJECT) || source.startsWith(".") || source.startsWith("/")) return null
      return this.resolve(source, anchor, { ...options, skipSelf: true })
    }
  }
}

/** The netlist the page opens with:  `NETLIST`, else the av1p0 system netlist in Downloads.  Served at `/netlist.json`. */
const NETLIST = resolve(process.env.NETLIST ?? join(homedir(), "Downloads", "av1p0.r005.netlist.json"))

/** `/netlist.json`:  the NETLIST file, as it is on disk (404 when it's not there). */
function defaultNetlist(): Plugin {
  return {
    name: "netlists-default-netlist",
    configureServer(server) {
      server.middlewares.use("/netlist.json", (_request, response) => {
        if (!existsSync(NETLIST)) {
          response.statusCode = 404
          response.end(`no netlist at ${NETLIST}`)
          return
        }
        response.setHeader("Content-Type", "application/json")
        response.setHeader("X-Netlist-Name", basename(NETLIST))
        createReadStream(NETLIST).pipe(response)
      })
    }
  }
}

const vite = await createServer({
  root: UI,
  configFile: join(UI, "vite.config.ts"),
  logLevel: "warn",
  plugins: [fromKit(), defaultNetlist()],
  server: { port: Number(process.env.PORT ?? 5391), strictPort: false, open: false, fs: { allow: [KIT, PROJECT] } }
})
await vite.listen()
const origin = (vite.resolvedUrls?.local[0] ?? "http://localhost:5391/").replace(/\/$/, "")
console.log(`Netlist Viewer:  ${origin}/@fs${join(HERE, "index.html")}`)
console.log(`  opens with:   ${NETLIST}${existsSync(NETLIST) ? "" : "  (NOT FOUND:  set NETLIST=<file>)"}`)
