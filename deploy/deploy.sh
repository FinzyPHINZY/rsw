#!/usr/bin/env bash
set -euo pipefail

# Run from the app directory on the server. Pulls, installs, migrates, builds, restarts.
echo "==> Pulling latest"
git pull --ff-only

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Applying migrations"
pnpm prisma migrate deploy

echo "==> Building"
pnpm build

echo "==> Restarting service"
sudo systemctl restart rsw

echo "==> Done"
