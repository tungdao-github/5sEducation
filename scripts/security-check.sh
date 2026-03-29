#!/usr/bin/env bash
set -euo pipefail

echo "== Security Checks (API) =="
pushd "$(dirname "$0")/../apps/api" >/dev/null
dotnet --version >/dev/null
dotnet list package --vulnerable
dotnet list package --outdated
popd >/dev/null

echo
echo "== Security Checks (Web) =="
pushd "$(dirname "$0")/../apps/web" >/dev/null
npm --version >/dev/null
npm run lint
npm audit --omit=dev
popd >/dev/null

echo
echo "== Done =="
