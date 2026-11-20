#!/bin/sh
# Every page x profile load measurement, one browser at a time, 3 runs each.
# Run from the kit's root:  sh <this folder>/perf-all-loads.sh [outDir]
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="${1:-$HERE/../perf-results}"
mkdir -p "$OUT"
for target in "docs desktop" "docs phone" "epic desktop" "epic phone" "editor desktop" "editor phone" "editor phonewide" "run desktop" "run phone"; do
  set -- $target
  node "$HERE/perf-load.mjs" "$1" "$2" --runs 3 --out "$OUT/load-$1-$2.json" || echo "FAILED $1 $2"
done
