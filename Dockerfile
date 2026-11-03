# syntax=docker/dockerfile:1.7
# Multi-stage build for Next.js standalone output (Payload + Next in one process).
# Debian slim (glibc) instead of Alpine: sharp & pg native bits "just work".

ARG NODE_VERSION=22.17.0

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1 \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.34.9 --activate
WORKDIR /app

# ---- deps ----
FROM base AS deps
COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---- builder (also used as the "tools" image for migrate/seed) ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The build does not need a live database (all pages are ISR / on-demand),
# but Payload validates that DATABASE_URI looks like a postgres URL.
ENV DATABASE_URI=postgresql://build:build@127.0.0.1:5432/build \
    PAYLOAD_SECRET=build-time-placeholder \
    NODE_ENV=production
RUN pnpm build

FROM builder AS tools
# `docker compose run --rm tools pnpm payload migrate:status` / `pnpm seed`
ENV NODE_ENV=development
CMD ["pnpm", "payload", "migrate:status"]

# ---- runtime ----
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    MEDIA_DIR=/app/media

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs \
 && apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
RUN mkdir -p /app/media /app/.next/cache && chown -R nextjs:nodejs /app/media /app/.next

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

# Payload runs pending migrations on boot (prodMigrations) when NODE_ENV=production.
CMD ["node", "server.js"]
