# DEVLOG

## 2026-11-03 - initial build (sandbox, local only, nothing pushed / no server touched)

Environment: Debian 13 sandbox, aarch64, 2 vCPU / 7 GB, Node 22.23, pnpm 10.34.9, PostgreSQL 17 (apt).
Source of truth: `/workspace/code/multisite`. Builds ran in a mirror at `/tmp/build` (rsync, excluding
node_modules/.next) because the workspace filesystem is a network FS and slow for node_modules.

### Steps
1. `git clone --depth 1 https://github.com/zubricks/multi-tenant-example` (commit 57f73fd). Upstream has
   **no LICENSE file**, only `"license": "MIT"` in package.json -> added `LICENSE` (MIT) + `NOTICE`.
2. Dependencies: removed db-mongodb, plugin-form-builder, plugin-nested-docs, plugin-redirects, plugin-search,
   admin-bar, live-preview, react-hook-form, next-sitemap, playwright/vitest test stack. Added db-postgres 3.85.1.
   - pnpm 12 (preinstalled) ignores `pnpm.onlyBuiltDependencies` -> pinned `packageManager: pnpm@10.34.9`.
3. Deleted hotel/demo code: blocks, heros, Amenities, Brands, Pages(blocks), forms, search, seed endpoints.
4. New collections: sites (tenant, label "Sites"), users (admin-only + API key), media, categories, tools,
   posts (drafts/versions), pages, header/footer (tenant globals), clicks.
5. Postgres adapter with `push:false` + migrations; `prodMigrations` so the standalone image migrates on boot.
   `pnpm payload migrate:create initial` -> `src/migrations/20261103_150039_initial.ts`; applied OK.
   Re-check after all edits: `migrate:create --skip-empty` produced nothing (schema == migration).
6. Frontend rewritten from scratch (mkdirs-like layout, no mkdirs code copied).
7. Seed (`payload run src/seed/run.ts`). First run printed nothing: `payload run` exits when module evaluation
   finishes -> switched to top-level `await main()`. Second run OK.
8. Build failed once: stale `importMap.js` referenced deleted components -> `pnpm generate:importmap`.
   Build failed once on lint (`<a href="/admin">` in the bare-localhost page) -> eslint-disable with reason;
   migrations/payload-types/(payload) excluded from lint.
9. `pnpm build` -> success. Ran standalone `node .next/standalone/server.js` with NODE_ENV=production.

### Verification (all against the production build on 127.0.0.1:3000)
- `curl -H 'Host: creator-ai.localhost' /` -> 200, `<title>CreatorStack AI</title>`, `--primary:262 83% 58%` (violet),
  h1 "The best AI video & audio tools for creators", canonical http://creator-ai.localhost:3000
- `curl -H 'Host: smb-ai.localhost' /` -> 200, `<title>SMB AI Toolkit</title>`, `--primary:175 77% 26%` (teal),
  h1 "AI tools for small business, minus the hype"
- Home: 9 outbound links, all `href="/go/<slug>?src=..." target="_blank" rel="sponsored nofollow noopener"`;
  0 occurrences of affiliate URLs in HTML/RSC payload.
- `/tools/descript` 200 (h1, screenshots, features, related articles, Visit website, SoftwareApplication +
  BreadcrumbList JSON-LD, og:title/og:image/og:url). `/blog/descript-review` 200 (TOC with heading ids,
  FAQ, Article + FAQPage JSON-LD). smb-ai host + `/tools/descript` -> 404 (tenant isolation).
- `/blog`, `/category/voice-audio`, `/about`, `/disclosure`, `/privacy`, `/sitemap.xml` (17 urls on smb-ai),
  `/robots.txt` -> 200; unknown path -> 404.
- `/go/descript` (cf-ipcountry: de, src=/blog/descript-review) -> `302 Location: https://example.com/aff/descript?ref=creatorstack-demo`,
  `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow`; click row: site creator-ai, tool descript,
  post_id 1, source_path /blog/descript-review, country DE.
  `/go/runway` (no affiliateUrl) -> 302 https://runwayml.com/. Googlebot UA -> 302 but no click row.
- Anonymous `GET /api/tools` -> 12 docs, keys contain no affiliateUrl/affiliatePlatform/affiliateStatus/
  commissionNote/affiliateLastCheckedAt.
- Anonymous POST /api/clicks, POST /api/users, GET /api/clicks, GET /api/users -> "not allowed".
- API key (`Authorization: users API-Key <key>`, role automation): create tool -> "Tool successfully created" (id 13);
  duplicate slug on same site -> validation error; same slug on other site -> OK; PATCH affiliateUrl -> /go/heygen
  redirects to the new URL; create draft post -> `_status: draft`, invisible to anonymous REST and frontend (404).
  Automation key cannot create sites/users or read clicks; super-admin JWT can read clicks.
- ISR: second request `x-nextjs-cache: HIT`; PATCH tool via API -> log `revalidated site:1` -> page shows new text.

### Notes / quirks
- The sandbox's tool output rewrites ISO timestamps for display (e.g. "Tue 2026-11-03 7:08 AM PST"); the real
  values are ISO-8601 (checked: length 24, matches `^\d{4}-\d\d-\d\dT`). Not an app issue.
- Docker is not available in the sandbox: Dockerfile / docker-compose.yml are written but NOT built or run here.
- Media filenames are globally unique (Payload renames duplicates), files live in MEDIA_DIR.

### Follow-up (same day)
- Visual check with headless Chromium (Playwright) - screenshots in `docs/screenshots/`.
  Found a dark-mode bug: the site's light `--foreground` (in `:root`) overrode the dark theme because both
  selectors had equal specificity -> dark vars now emitted under `html[data-theme='dark']` with explicit
  foreground/background. Rebuilt (`pnpm build` EXIT 0) and re-ran the checks -> `VERIFY.txt`.
- Note: during the rebuild the old server kept port 3000 (new one hit EADDRINUSE) - killed it and restarted;
  VERIFY.txt is from the rebuilt server.
- Not exercised in the sandbox: `pnpm dev`, Docker build/compose, cloudflared, backup cron (no Docker available).
