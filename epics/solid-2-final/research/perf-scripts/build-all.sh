#!/bin/bash
# Build every app bundle into a scratch folder, with module stats (epic `solid-2-final`, perf-bundle).
# - Usage:  build-all.sh <kit root> <out folder> [editor|element|page|runner ...]
# - Mirrors `yarn build`, `build:element`, `build:page`, `build:runner` (app's folder manifest), without `tsc`,
#   and never into the checkout:  every outDir is under <out folder>.
set -euo pipefail
KIT="$1"; OUT="$2"; shift 2
HERE="$(cd "$(dirname "$0")" && pwd)"
build() { node "$HERE/build-stats.mjs" "$KIT" "$@" 2>&1 | grep -E "^built|error|Error" || true; }
cd "$KIT/app/app"
for target in "${@:-editor element page runner}"; do
  case "$target" in
    editor) build vite.config.ts "$OUT/editor" "$OUT/editor.stats.json" ;;
    element)
      build vite.solid.config.ts "$OUT/element" "$OUT/element.solid.stats.json"
      build vite.element.config.ts "$OUT/element" "$OUT/element.element.stats.json" --keep
      build vite.editor.config.ts "$OUT/element" "$OUT/element.editor.stats.json" --keep
      build vite.code.config.ts "$OUT/element" "$OUT/element.code.stats.json" --keep ;;
    page)
      build vite.solid.config.ts "$OUT/page" "$OUT/page.solid.stats.json"
      build vite.page.config.ts "$OUT/page" "$OUT/page.page.stats.json" --keep ;;
    runner)
      build vite.solid.config.ts "$OUT/runner" "$OUT/runner.solid.stats.json"
      build vite.runner.config.ts "$OUT/runner" "$OUT/runner.runner.stats.json" --keep ;;
  esac
done
