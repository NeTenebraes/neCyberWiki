#!/usr/bin/env bash
set -euo pipefail

for file in *.{png,jpg,jpeg}; do
  [ -f "$file" ] || continue
  magick "$file" "${file%.*}.webp" && rm "$file"
done

