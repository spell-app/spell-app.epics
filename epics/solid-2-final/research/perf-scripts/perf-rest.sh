#!/bin/sh
# Everything but the editor / run loads, one browser at a time.
# Run from the kit's root, with the editor's builds served (see perf-lib.mjs):  sh <this folder>/perf-rest.sh [outDir]
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="${1:-$HERE/../perf-results}"
mkdir -p "$OUT"
for target in "docs desktop" "docs phone" "epic desktop" "epic phone"; do
  set -- $target
  node "$HERE/perf-load.mjs" "$1" "$2" --runs 3 --out "$OUT/load-$1-$2.json" || echo "FAILED load $1 $2"
done
for page in editor docs epic; do
  uptime; node "$HERE/perf-leaks.mjs" $page desktop --out "$OUT/leaks-$page-desktop.json" || echo "FAILED leaks $page"
done
for profile in desktop phonewide; do
  uptime; node "$HERE/perf-typing.mjs" $profile --out "$OUT/typing-$profile.json" | grep -A3 '"eventTiming"\|"frame"' || echo "FAILED typing $profile"
done
for page in editor docs epic run; do
  uptime; node "$HERE/perf-a11y.mjs" $page desktop --out "$OUT/a11y-$page-desktop.json" || echo "FAILED a11y $page"
done
uptime; node "$HERE/perf-listeners.mjs" editor desktop --out "$OUT/listeners-editor.json" | head -40 || echo "FAILED listeners"
uptime; PERF_EDITOR=http://localhost:53991/ node "$HERE/perf-cpu.mjs" phonewide --out "$OUT/cpu-editor-phonewide.json" || echo "FAILED cpu"
