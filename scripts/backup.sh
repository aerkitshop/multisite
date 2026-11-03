#!/bin/sh
# Nightly Postgres backup (run by the `backup` compose service, or manually:
#   docker compose exec backup /bin/sh /usr/local/bin/backup.sh)
# Writes /backups/<db>-YYYYmmdd-HHMMSS.dump (custom format, restorable with pg_restore).
set -eu
STAMP=$(date +%Y%m%d-%H%M%S)
FILE="/backups/${POSTGRES_DB}-${STAMP}.dump"
pg_dump -h "${PGHOST:-postgres}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -Fc -f "${FILE}.partial"
mv "${FILE}.partial" "${FILE}"
echo "[backup] wrote ${FILE} ($(du -h "${FILE}" | cut -f1))"
find /backups -name "${POSTGRES_DB}-*.dump" -type f -mtime +"${BACKUP_KEEP_DAYS:-14}" -delete
