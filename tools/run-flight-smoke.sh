#!/usr/bin/env bash
set -euo pipefail

# Defaults
BASE_URL=${BASE_URL:-http://127.0.0.1:5000/api/v1}
ORIGIN=${ORIGIN:-DEL}
DEST=${DEST:-BOM}
DATE=${DATE:-}

echo "Running flight smoke test against ${BASE_URL}"
export BASE_URL ORIGIN DEST DATE X_API_KEY

node ./tools/flight-smoke.mjs
