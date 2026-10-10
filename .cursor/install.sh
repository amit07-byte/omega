#!/usr/bin/env bash
set -euo pipefail

# Baseline tooling used by Cloud Agents in this repository.
command -v git >/dev/null
command -v curl >/dev/null
command -v npm >/dev/null

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [[ ! -f README.md ]]; then
  echo "README.md missing" >&2
  exit 1
fi

# The product name is "Omega". Match it case-insensitively so a title-case
# README still satisfies this readiness check.
if ! grep -qi omega README.md; then
  echo "README.md does not mention Omega" >&2
  exit 1
fi

# Confirm the worktree is usable for day-to-day development.
git rev-parse --is-inside-work-tree >/dev/null
git status >/dev/null

if [[ ! -f package-lock.json ]]; then
  echo "package-lock.json missing" >&2
  exit 1
fi

npm ci

echo "omega environment ready"
