#!/bin/bash
# Start all local development services
set -e

echo "🚀 Starting UrbanGar local services..."
docker compose -f "$(dirname "$0")/docker-compose.yml" up -d

echo "⏳ Waiting for services to be healthy..."
sleep 5

echo "✅ Services ready:"
echo "   PostgreSQL  → localhost:5432 (user: urbangar / pass: urbangar_dev)"
echo "   Redis       → localhost:6379 (pass: urbangar_dev)"
echo "   Meilisearch → http://localhost:7700 (key: urbangar_meili_dev)"
echo ""
echo "📦 Run migrations: pnpm db:migrate"
echo "🌱 Seed database:  pnpm db:seed"
