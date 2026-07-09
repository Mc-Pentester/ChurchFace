#!/bin/sh
set -e

echo "==> ChurchFace startup"
echo "==> DATABASE_URL host: $(echo "$DATABASE_URL" | sed -E 's|.*@([^/:]+).*|\1|')"

attempt=0
max=15

while [ "$attempt" -lt "$max" ]; do
  attempt=$((attempt + 1))
  if npx prisma migrate deploy; then
    echo "==> Prisma migrations applied"
    break
  fi
  if [ "$attempt" -eq "$max" ]; then
    echo "==> ERROR: migrate deploy failed after $max attempts"
    echo "==> Please check your database connection and migration files"
    exit 1
  else
    echo "==> Database not ready ($attempt/$max), retry in 5s..."
    sleep 5
  fi
done

echo "==> Starting Node server on port ${PORT:-3000}"
exec npm start
