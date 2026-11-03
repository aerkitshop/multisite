#!/usr/bin/env bash
# Optional: tar the media volume to ./backups on the host (run from the project dir via cron).
set -euo pipefail
mkdir -p backups
docker run --rm -v multisite_media:/media:ro -v "$PWD/backups:/out" alpine \
  tar czf "/out/media-$(date +%Y%m%d).tgz" -C /media .
find backups -name 'media-*.tgz' -mtime +14 -delete
