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

## 2026-11-03 - simplified homepage (mkdirs demo/showcase style)

Goal: visitors land directly on the directory, no clicking around.
- `/` is now: compact hero (one-line H1 + subtitle + search) -> one row of category chips ("All" + categories
  with counts) -> tool grid (1/2/3/4 columns). Search and chips filter in place (`HomeDirectory.tsx`, client)
  and mirror to `?category=` / `?q=` via `history.replaceState` (page stays ISR/static). Sort: featured first,
  then newest (`createdAt`, now in the tools select). >24 results -> "Load more". Removed the big hero,
  "Featured tools" and "Browse the directory" sections; kept a 3-post "Latest posts" strip.
- Cards (`ToolCard.tsx`, also used on category/tool pages): logo, name (+ star if featured), category badges,
  2-line description, up to 3 #tags, pricing badge, "Visit" button -> `/go/<slug>?src=home`
  (`rel="sponsored nofollow noopener"`, `target=_blank`); card body -> `/tools/<slug>`.
- Header: logo + name, Home / Categories (dropdown, `CategoriesMenu.tsx`) / Blog / About + theme toggle.
  Nav is fixed in code now (the per-site `header` global is no longer rendered). Top disclosure banner removed;
  the disclosure sentence is in the one-line footer (About / Disclosure / Privacy / Sitemap).
- JSON-LD on `/`: `WebSite` + `ItemList` (ListItem per tool -> /tools/<slug>).
- Dark-mode contrast: new `--primary-text` var (Tailwind `text-primary-text`). Light = brand colour; dark =
  same hue with lightness >= 70% (TenantStyles). All `text-primary` usages switched, which fixes the
  unreadable dark-teal badges on smb-ai in dark mode.
- Local: Postgres 17 (apt) + migrate + seed in /tmp/build, `pnpm build` EXIT 0. Checks on the standalone
  server: both homes 200, 6 cards each with `/go/<slug>?src=home`, 0 affiliate URLs in HTML, ItemList present;
  tool/blog/category/about/disclosure/privacy/sitemap/robots 200, unknown 404, `/go/*` 302. Playwright
  (Debian chromium): chip filter 6 -> 3 and URL `?category=voice-audio`, search narrows to 1, `?category=` deep
  link works. Screenshots: `docs/screenshots/{creator,smb}-home-{desktop,desktop-dark,mobile}.png`,
  `creator-header-categories.png`.
- Gotcha: `pkill -f '<pattern>'` inside the same shell command line kills that shell too (pattern matches
  its own argv) - kill by PID instead.

## 2026-11-03 - homepage: two-column layout (bestdirectories.org style, without its clutter)

Reference: headless-Chromium screenshots of https://bestdirectories.org/ at 1440 / 390 px (kept outside the
repo). Its two columns = a left boxed category list + a 3-column card grid on the right; on mobile the
sidebar disappears. Its sidebar is NOT sticky (only the header is); ours is, as asked.
- New `CategoryNav.tsx`: `CategorySidebar` (lg+, `sticky top-20`, boxed list "All tools" + each category with
  icon, name and count; active = brand tint) and `CategoryChips` (< lg, horizontal scroll chip row above the
  grid). Both render buttons when given `onSelect` (filter in place) or links to `/category/<slug>` otherwise.
- `HomeDirectory.tsx`: compact hero (H1 + subtitle + search) then `lg:grid-cols-[248px_minmax(0,1fr)]`:
  sidebar | grid (`sm:2 / xl:3` columns -> 2 at 1024-1279 px, 3 at >= 1280 px). `?category=` / `?q=` sync kept.
  The 3-post "Latest posts" strip is passed as children and sits small under the grid in the main column.
- `ToolCard.tsx` restyled like their cards: 44px logo, name + amber "★ Featured" pill top-right, grey category
  badges, 2-line description, "# tag" row, pricing badge + Visit button; featured cards get an amber tint
  (dark: `amber-400/[0.06]`). Links unchanged (`/go/<slug>?src=home`, `_blank`, `sponsored nofollow noopener`;
  card body -> `/tools/<slug>`).
- Category page (`ToolDirectory.tsx`) uses the same sidebar/chips (as links, current one highlighted); its
  search + pricing chips are unchanged.
- Header at 390 px: "SMB AI Toolkit" / "CreatorStack AI" no longer truncated (smaller nav padding < 400 px,
  dropdown caret hidden < sm, 32px theme toggle on mobile). Checked: name span scrollWidth == clientWidth.
- Not added: newsletter, submit/sign-in/pricing/advertise, promo box, sort/filter dropdowns, badges, traffic/DR
  stats, big footer.
- Local: Postgres 17 + migrate + seed in /tmp/build, `pnpm build` EXIT 0. Playwright: sidebar click 6 -> 3 and
  URL `?category=voice-audio`, + search "podcast" -> 2 and `&q=podcast`, deep link `?category=` -> 3, aside
  `position: sticky`, mobile aside hidden + chip filter works; 0 affiliate URLs in HTML; 6 `/go/...?src=home`.
  Screenshots: `docs/screenshots/{creator,smb}-home-{desktop,desktop-dark,mobile,laptop}.png`, `creator-category.png`.
- Gotchas: the Next standalone process shows up as `next-server (v...)` in ps (not `node server.js`); a stale
  server on :3000 made the new one fail with EADDRINUSE. Sandbox Chromium must get `--no-proxy-server` for
  *.localhost (env proxy otherwise) and a local auth-adding forward proxy for external sites.

## 2026-11-05 - visual polish: real images, credible copy, idempotent content update

Goal: the directory looked like a template (letter-avatar logos, no images, text-only cards/blog). Layout kept
(sticky category sidebar + card grid), nothing added to the chrome (no newsletter/submit/pricing/sign-in).

### Images (real, small, committed under `src/seed/assets/`, ~1.1 MB webp total)
- Per tool: `<tool>-logo.webp` (apple-touch-icon / webclip from the official site; Grammarly + Canva from their
  official App Store listings because the sites expose only 32-48 px icons / block bots), `<tool>-og.webp` (the
  homepage og:image; Canva's read via headless Chromium), `<tool>-home.webp` (headless-Chromium screenshot of
  the official homepage, 1440x810, cookie banners removed), `runway-hero.webp` / `elevenlabs-hero.webp` (tight
  crops of their homepage hero - their og:image is a bare wordmark). Logos 256 px, covers 1280x720 q78-80.
- Blog covers `post-*.webp`: generated editorial illustrations (abstract clay-render, no text, no product UI).
- Site brand marks `site-<slug>-logo.webp` + `site-<slug>-og.webp` (1200x630 share image with the real tool logos),
  drawn with PIL (Poppins / Montserrat).
- New tool fields + migration `20261105_032810_tool_cover_tagline`: `tagline`, `bestFor`, `startingPrice`, `cover`
  (upload). `screenshots` is the tool-page gallery.
- `next/image` everywhere on the frontend (`images.unoptimized` removed; `localPatterns /api/media/file/**`,
  WebP output, 30-day cache in `.next/cache/images`, explicit `sizes`, lazy except above-the-fold `priority`).

### Copy (both sites)
- Hero title/subtitle, category descriptions (lucide icon names instead of emoji), every tool's tagline,
  2-line description, best-for, features, about text, starting price + pricing summary, 4 blog posts
  (titles, excerpts, bodies, FAQ). Pricing/features checked on each official pricing page on 2026-11-04
  (URLs stored in each tool's `sourceUrls`); no ratings / user counts / invented stats. Notable facts:
  Runway now lives at runway.com, Riverside at riverside.com, Grammarly is part of Superhuman.

### UI
- Home hero: grid + brand glow background, "Updated <Mon YYYY> · N tools hand-tested" pill (month of the
  newest tool `updatedAt`), larger H1, search, row of real tool logos. Result header ("All tools 6").
- `ToolCard`: 16:9 cover (hover zoom), Featured pill on the image, 34 px real logo, name + main category,
  tagline, 2-line description, pricing badge + starting price, Visit button. Gradient fallback without image.
- Sidebar/chips/menu use lucide icons (`CategoryIcon`, emoji still rendered for old data).
- Tool page: logo + tagline header, large screenshot hero with thumbnail gallery (`ToolGallery`), "Best for"
  callout, features with checks, sticky pricing card (starting price, summary, Visit), tags, sources.
- Blog index: lead post as a wide feature card + grid; home "Latest from the blog" uses image cards; post
  hero via next/image. Theme toggle uses lucide Sun/Moon.

### Updating live data: `pnpm content:update` (src/seed/update-content.ts)
- Never wipes/reseeds. Finds sites, categories, tools, posts BY SLUG and updates them; creates only what is
  missing. Affiliate fields are never touched; posts keep publishedAt/status.
- Media upserted by (site, filename) via `src/seed/media.ts`: matches `<stem>(-N).<ext>` (Payload suffixes taken
  names), keeps a doc whose file exists on disk, re-uploads if the file is missing; `-- --force-media` re-uploads
  all; `-- --dry` reports only. Payload re-encodes uploads, so sizes can't be compared with the source.
- Local: run twice on a copy of the old seeded DB -> 2nd run `media kept 46, created 0`. Fresh DB:
  migrate + `pnpm seed` (now uses the same assets) + `content:update` -> `kept 46`.

### Verification
- Local (Postgres 17, /tmp/build mirror): `pnpm build` OK; both homes 200, 6 `/go/<slug>?src=home` links each,
  0 affiliate URLs in HTML, `/go/descript` 302, tool/blog/post/category/about 200, `/_next/image` -> 200 webp.
- Screenshots (Playwright + Debian Chromium): `docs/screenshots/creator-home-desktop.png`,
  `creator-home-desktop-dark.png`, `creator-home-mobile.png` (390 px), `smb-home-desktop.png`,
  `creator-tool.png`, `creator-blog.png`, `creator-post.png`, `smb-tool-dark.png`. Old screenshots removed.
- InstaBox m_agq2dozxpck5jxkq45klnqw2fq: resumed, tarball (no node_modules/.next/media/.env) extracted over
  /data/home/multisite, `pnpm install`, `pnpm migrate` (applied the new migration), `pnpm content:update`
  (media created 46 -> /data/home/multisite/media), `rm -rf .next && pnpm build`, `bash start.sh`.
  https://3000-... and https://3001-... -> 200, all `/_next/image` URLs 200 image/webp, 0 broken images in
  Chromium, `/go/*` 302.
- Gotchas: InstaBox POST endpoints need an `Idempotency-Key` header; exec body is `{"cmd": "..."}`.
  The sandbox's proxy breaks fonts.googleapis.com TLS, so sandbox screenshots of the live site show fallback
  fonts - not an app issue (the <link> is present; local screenshots show Poppins/Montserrat).
