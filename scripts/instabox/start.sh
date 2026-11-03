#!/bin/bash
# Start (or restart) Postgres + the multisite app + the two Host-restoring proxies.
#   https://3000-agq2dozxpck5jxkq45klnqw2fq.instabox.tech -> creator-ai
#   https://3001-agq2dozxpck5jxkq45klnqw2fq.instabox.tech -> smb-ai
# Next.js itself listens on 127.0.0.1:3010 (internal only).
# Needed after a machine STOP/START (processes are gone). After an idle pause / resume,
# processes are preserved, so it is normally not needed (safe to rerun anyway).
set -u
cd /data/home/multisite
set -a; . ./.env; set +a
export NODE_ENV=production PORT=3010 HOSTNAME=127.0.0.1
H3000=3000-agq2dozxpck5jxkq45klnqw2fq.instabox.tech
H3001=3001-agq2dozxpck5jxkq45klnqw2fq.instabox.tech

# 1) Postgres (docker, restart=unless-stopped; data in /data/pgdata)
docker start multisite-pg >/dev/null 2>&1 || true
for i in $(seq 1 30); do docker exec multisite-pg pg_isready -U multisite -q && break; sleep 1; done

# 2) Stop old processes
pkill -f 'node .next/standalone/server.js' 2>/dev/null; pkill -f 'next-server' 2>/dev/null; pkill -f 'node hostproxy.mjs' 2>/dev/null; pkill -f 'node tcpproxy.mjs' 2>/dev/null; sleep 1

# 3) App (Next standalone server; Payload applies pending migrations on boot)
mkdir -p "$MEDIA_DIR" logs
rm -rf .next/standalone/.next/static .next/standalone/public
cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public
nohup node .next/standalone/server.js > logs/app.log 2>&1 &

# 4) Public-facing proxies (restore Host from X-Forwarded-Host)
nohup node hostproxy.mjs 3000 3010 "$H3000" > logs/proxy-3000.log 2>&1 &
nohup node hostproxy.mjs 3001 3010 "$H3001" > logs/proxy-3001.log 2>&1 &

for i in $(seq 1 60); do curl -fs -o /dev/null http://127.0.0.1:3000/api/health && { echo "app up"; exit 0; }; sleep 1; done
echo "app did not answer within 60s - see logs/app.log"; exit 1
