// Build one Vite config into a scratch folder and record what each chunk holds (epic `solid-2-final`, perf-bundle).
// - Usage:  node build-stats.mjs <kit root> <vite config file> <out dir> [<stats json>]
// - Resolves `vite` from the kit, so the kit's own Vite (Vite+'s core) builds it, as `vp build` would.
// - Writes `<out dir>/../<name>.stats.json` (or <stats json>):  per chunk, its file, entry kinds, imports, and each
//   module's rendered length (before minification is applied per module:  Rolldown's `renderedLength`).
// - Changes no tracked file:  `outDir` is overridden, `emptyOutDir` on.
import { readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { pathToFileURL } from "node:url"

const [, , kitRoot, configFile, outDir, statsArg] = process.argv
if (!kitRoot || !configFile || !outDir) {
  console.error("usage:  node build-stats.mjs <kit root> <vite config file> <out dir> [<stats json>]")
  process.exit(1)
}
const require = createRequire(path.join(path.resolve(kitRoot), "package.json"))
const vitePackage = require.resolve("vite/package.json")
const viteMain = JSON.parse(readFileSync(vitePackage, "utf8")).exports["."]
const vite = await import(pathToFileURL(path.join(path.dirname(vitePackage), typeof viteMain === "string" ? viteMain : viteMain.import ?? viteMain.default)).href)

const stats = { config: configFile, chunks: [], assets: [] }
const statsPlugin = {
  name: "perf-bundle:stats",
  enforce: "post",
  generateBundle(_options, bundle) {
    for (const item of Object.values(bundle)) {
      if (item.type === "chunk") {
        const modules = {}
        for (const [id, info] of Object.entries(item.modules ?? {})) modules[id] = info.renderedLength
        stats.chunks.push({
          fileName: item.fileName,
          name: item.name,
          isEntry: item.isEntry,
          isDynamicEntry: item.isDynamicEntry,
          facadeModuleId: item.facadeModuleId,
          imports: item.imports,
          dynamicImports: item.dynamicImports,
          codeLength: item.code.length,
          modules
        })
      } else {
        const size = typeof item.source === "string" ? Buffer.byteLength(item.source) : item.source.length
        stats.assets.push({ fileName: item.fileName, size })
      }
    }
  }
}

const root = path.dirname(path.resolve(configFile))
const started = Date.now()
await vite.build({
  configFile: path.resolve(configFile),
  root,
  logLevel: "warn",
  plugins: [statsPlugin],
  build: { outDir: path.resolve(outDir), emptyOutDir: true, sourcemap: false, reportCompressedSize: false }
})
const statsFile = statsArg ?? path.join(path.dirname(path.resolve(outDir)), `${path.basename(outDir)}.stats.json`)
writeFileSync(statsFile, JSON.stringify(stats, null, 2))
console.log(`built ${configFile} in ${((Date.now() - started) / 1000).toFixed(1)}s:  ${stats.chunks.length} chunks, ${stats.assets.length} assets => ${statsFile}`)
