#!/usr/bin/env bash
set -euo pipefail

cd /workspace

bash .cursor/install.sh

# End-to-end dev workflow: create a throwaway commit on a temp branch, then discard it.
branch="cursor/smoke-$(date +%s)"
git checkout -b "$branch"
echo "# smoke $(date -Iseconds)" >> .smoke-tmp.md
git add .smoke-tmp.md
git -c user.email=cloud-agent@cursor.com -c user.name="Cloud Agent" commit -m "chore: environment smoke test"
git checkout -
git branch -D "$branch"
rm -f .smoke-tmp.md

echo "Dev smoke test passed"
