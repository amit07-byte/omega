#!/usr/bin/env bash
set -euo pipefail

# Baseline tooling used by Cloud Agents in this repository.
command -v git >/dev/null
command -v curl >/dev/null

if [[ ! -f README.md ]]; then
  echo "README.md missing" >&2
  exit 1
fi

grep -q omega README.md

# Confirm the worktree is usable for day-to-day development.
git rev-parse --is-inside-work-tree >/dev/null
git status >/dev/null

echo "omega environment ready"
