#!/bin/bash

set -e

cd "$(dirname "$0")"

TARGET_COMMIT="${1:-main}"

echo "=== Starting deployment ==="
echo "Target: $TARGET_COMMIT"

echo "Fetching latest Git history..."
git fetch origin

if [ "$TARGET_COMMIT" = "main" ]; then
    echo "Deploying latest origin/main..."
    git checkout main
    git reset --hard origin/main
else
    echo "Deploying specific commit..."
    git checkout --detach "$TARGET_COMMIT"
fi

echo "Deployment version:"
git log -1 --oneline

echo "Building Docker images..."
docker compose build

echo "=== Building and starting containers ==="
docker compose up -d --build

echo "=== Waiting for services ==="
sleep 5

echo "=== Container status ==="
docker compose ps

echo "=== Checking application health ==="

if curl --fail --silent http://localhost/api/health > /dev/null; then
    echo "Application health check passed."
else
    echo "Application health check FAILED."
    exit 1
fi

echo
echo "=== Deployment successful ==="