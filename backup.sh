#!/bin/bash

set -e

BACKUP_DIR="$HOME/webapp/backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/webapp_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

docker compose -f "$HOME/webapp/docker-compose.yml" exec -T \
  postgres pg_dump -U webapp -d webapp > "$BACKUP_FILE"

find "$BACKUP_DIR" -type f -name "webapp_*.sql" -mtime +7 -delete

echo "Backup created: $BACKUP_FILE"
