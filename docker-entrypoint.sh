#!/bin/sh
set -e

echo "→ Running database migrations..."
npm run db:migrate

echo "→ Starting Ryde..."
exec npm run start
