#!/usr/bin/env bash
set -euo pipefail
# CURSOR: Build all projects under site/projects/* into site/exports/<name>

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE="$ROOT/site"
SRC="$SITE/projects"
OUT="$SITE/exports"

mkdir -p "$OUT"

echo "[build] scanning $SRC"
shopt -s nullglob
for dir in "$SRC"/*/ ; do
  name="$(basename "$dir")"
  dest="$OUT/$name"
  rm -rf "$dest"
  echo "----------------------------------------"
  echo "[build] $name"

  if [[ -f "$dir/package.json" ]]; then
    pushd "$dir" >/dev/null
    # Detect framework and produce a static build
    has_dep() { node -e "const p=require('./package.json'); const d={...p.dependencies,...p.devDependencies}; process.exit(d && d['$1']?0:1)" 2>/dev/null || return 1; }
    npm ci --no-audit --no-fund
    if has_dep next; then
      # Next.js: export static
      npx --yes next build
      npx --yes next export -o "$dest"
      [[ -f "$dest/index.html" ]] || { echo "[warn] Next export missing index.html for $name"; }
    else
      # Generic: rely on "build" script (Vite, CRA, etc.)
      if npm run -s build; then
        # Common output dirs
        for candidate in dist build out public; do
          if [[ -d "$candidate" && -e "$candidate/index.html" ]]; then
            mkdir -p "$dest"
            cp -R "$candidate"/. "$dest/"
            break
          fi
        done
        [[ -f "$dest/index.html" ]] || { echo "[warn] Could not locate build output for $name (dist/build/out/public)."; }
      else
        echo "[warn] npm build failed for $name; attempting static fallback."
      fi
    fi
    popd >/dev/null
  fi

  # If still no export, attempt static-fallback copy (plain HTML projects)
  if [[ ! -f "$dest/index.html" ]]; then
    if [[ -f "$dir/index.html" ]]; then
      mkdir -p "$dest"
      rsync -a --exclude node_modules --exclude ".git" "$dir" "$OUT/"
      # Ensure top-level index at $dest
      if [[ ! -f "$dest/index.html" && -f "$dest/$name/index.html" ]]; then
        mv "$dest/$name"/* "$dest"/ && rmdir "$dest/$name" || true
      fi
      echo "[build] static copied for $name"
    else
      echo "[warn] no static entrypoint found for $name; skipping."
      continue
    fi
  fi

  # Normalize deep index files (some builds nest under /public)
  if [[ ! -f "$dest/index.html" && -f "$dest/public/index.html" ]]; then
    rsync -a "$dest/public/" "$dest/" && rm -rf "$dest/public"
  fi

  # Fingerprint notice
  echo "[ok] $name → exports/$name/index.html"
done

echo "[done] exports ready at $OUT"
