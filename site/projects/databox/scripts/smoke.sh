#!/usr/bin/env bash
set -euo pipefail
(cd relay && cargo build)
(cd contracts && forge test -q)
(cd dashboard && npm i --silent && npm run build --silent)
echo "OK"