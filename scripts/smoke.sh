#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/site"
echo "[smoke] checking shell assets…"
test -f "index.html" && test -f "styles.css" && test -f "shell.js"
echo "[smoke] checking built exports…"
for p in CyberDorks databox OMNI DECOY ScriptRX; do
  if [[ ! -f "exports/$p/index.html" ]]; then
    echo "missing exports/$p/index.html"
    exit 1
  fi
done
echo "[smoke] ok"
