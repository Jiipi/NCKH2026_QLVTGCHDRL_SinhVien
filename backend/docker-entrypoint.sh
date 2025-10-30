#!/bin/sh
set -e

echo "🚀 Starting backend container..."
echo "📅 Time: $(date)"
echo "🌍 Environment: $NODE_ENV"

# Wait for database
echo "⏳ Waiting for PostgreSQL..."
until wget --spider -q http://db:5432 2>/dev/null || nc -z db 5432; do
  echo "   Database is unavailable - sleeping"
  sleep 2
done
echo "✅ PostgreSQL is up!"

# Run Prisma migrations
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma Client (if needed)
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Seed database (optional)
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed || echo "⚠️  No seed script found or seed failed"
fi

echo "✅ Backend initialization complete!"
echo "🎯 Starting application on port $PORT..."

# Start application
exec "$@"
