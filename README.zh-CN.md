# Multisite：多域名、多租户 AI 工具推广站

一个 Payload CMS 3 + Next.js 15 应用同时服务多个推广站（目录 + 博客）。每个站点有自己的域名、品牌色、字体、分类、工具和文章，访问者看到的是完全独立的网站；后台只有一个。

- 基于 [zubricks/multi-tenant-example](https://github.com/zubricks/multi-tenant-example)（MIT），已改为 **Postgres**、去掉表单/酒店相关内容，新增工具目录、`/go` 跳转统计、SEO。
- 视觉参考 [Mkdirs](https://demo.mkdirs.com)（只参考布局，未复制代码，见 `NOTICE`）。
- 纯推广站：**没有前台用户、注册、投稿、评论、表单、支付**。

---

## 1. 架构

```
浏览器 ──► Cloudflare（DNS + Tunnel）──► cloudflared 容器 ──► app:3000（Next.js + Payload，一个进程）
                                                                │
                                                                ├── Postgres 16（命名卷 pgdata）
                                                                └── /app/media（命名卷 media，上传的图片）
n8n（VPS-A，Tailscale）──REST + API Key──► /api/*
```

**按域名分站（多租户）**

1. `next.config.js` 里的 rewrite 把 `creator-ai.com/tools/descript` 内部改写为 `/creator-ai.com/tools/descript`，即 `src/app/(frontend)/[tenant]/…`，`[tenant]` = 主机名。
2. `/admin`、`/api`、`/_next` 不改写，所以每个域名下都能打开后台和 API；裸 `localhost` 也不改写（用于本地进后台）。
3. `src/lib/site.ts#getSiteByDomain()` 在 **Sites** 集合的 `domains[].domain` 里查主机名（自动去端口，`www.` 与非 `www.` 互相兜底）。
4. 内容集合由 `@payloadcms/plugin-multi-tenant` 自动加 `tenant` 字段；后台左上角可切换站点。

**集合（collections）**

| 集合 | 说明 | 公开读 |
|---|---|---|
| `sites`（后台显示 "Sites"，即租户） | 名称、slug、多个域名、主域名、logo、favicon、标语、主题色、字体、默认 SEO、联盟披露文字 | 是（仅品牌信息） |
| `users` | 仅后台账号：`super-admin`、`automation`（给 n8n，开 API Key）。**无公开注册** | 否 |
| `tools` | 工具：官网、logo、截图、简介、富文本详情、功能列表、定价、分类、标签、精选；**联盟字段**（affiliateUrl / Platform / Status / commissionNote / affiliateLastCheckedAt）字段级权限：**未登录读取时不返回** | 是（不含联盟字段） |
| `categories` | 名称、slug、描述、图标（emoji） | 是 |
| `posts` | 标题、slug、类型（review/compare/best/tutorial/news）、摘要、头图、正文（Lexical）、相关工具、FAQ、来源链接、**草稿/版本**、发布时间、SEO 字段 | 仅已发布 |
| `pages` | About / Disclosure / Privacy 等静态页（缺省时有内置兜底内容） | 是 |
| `header` / `footer` | 每站一份的"全局"导航（插件 `isGlobal`） | 是 |
| `clicks` | 出站点击：tool、post、sourcePath、country、userAgent、referrer、createdAt。**只能由 `/go` 服务端写入**，只有 super-admin 能读 | 否 |
| `media` | 按站隔离，存本地磁盘（Docker 卷） | 是 |

slug 在**同一站点内唯一**（数据库复合唯一索引 `tenant_id + slug` + 友好的校验提示），不同站点可以有同名工具。

**前台页面**（每个站点）

| 路径 | 内容 |
|---|---|
| `/` | Hero、分类入口、精选工具、目录（左侧分类栏 / 移动端分类 chips、搜索框和定价筛选，纯前端过滤）、最新文章 |
| `/tools/<slug>` | 截图、详情、功能、定价卡片、标签、来源、相关文章、同类工具、"Visit website" 按钮；JSON-LD `SoftwareApplication` + `BreadcrumbList` |
| `/category/<slug>` | 分类页 |
| `/blog`、`/blog/<slug>` | 文章列表；文章页三栏：目录（TOC）/正文+FAQ/相关工具；JSON-LD `Article` + `FAQPage` |
| `/about` `/disclosure` `/privacy` | 静态页 |
| `/go/<slug>` | 记录点击 → 302 到 affiliateUrl（没有则官网） |
| `/sitemap.xml`、`/robots.txt` | 每站独立 |

- 所有出站工具链接都走 `/go/<slug>?src=<来源页>`，带 `rel="sponsored nofollow noopener"` 和 `target="_blank"`，HTML 里永远不出现联盟链接。
- 每页有 canonical、OG、Twitter 卡片（域名取站点的 `primaryDomain`）。
- 页面是 ISR（首个请求生成并缓存，`revalidate=3600` 兜底）；内容保存/发布时 `afterChange` 钩子调用 `revalidateTag('site:<id>')`，该站所有页面立即失效重建。草稿保存不会触发。
- 主题色/字体通过 CSS 变量注入（`src/components/TenantStyles`），支持亮/暗模式切换。

**目录结构要点**

```
src/
  payload.config.ts          # Postgres 适配器、多租户插件、SEO 插件、/api/health
  access/index.ts            # 角色与权限函数
  collections/               # Sites Users Media Categories Tools Posts Pages Header(Footer) Clicks
  hooks/revalidateTenant.ts  # 按站点按需重新验证
  hooks/uniquePerTenant.ts   # 同站 slug 唯一校验
  lib/site.ts                # Host → 站点解析、URL 工具
  lib/data.ts                # 前台只读查询（overrideAccess:false + 缓存标签）
  lib/meta.ts                # canonical / OG 元数据
  app/(frontend)/[tenant]/   # 前台页面、/go、sitemap、robots
  app/(payload)/             # 后台与 REST API（Payload 生成）
  components/site/           # 卡片、目录、富文本、JSON-LD 等
  migrations/                # Postgres 迁移（生产启动时自动执行）
  seed/                      # 演示数据
Dockerfile  docker-compose.yml  scripts/backup.sh  .env.example
```

---

## 2. 本地开发

需要 Node 22、pnpm 10、Postgres 16（或 17）。

```bash
cp .env.example .env              # 改 DATABASE_URI / PAYLOAD_SECRET / SEED_ADMIN_*
pnpm install
pnpm payload migrate              # 建表（本项目不用 drizzle push，开发与生产都走迁移）
pnpm seed                         # 演示数据：2 个站点 + 超级管理员（见下）
pnpm dev                          # http://localhost:3000/admin
```

打开：

- 后台：http://localhost:3000/admin（用 `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` 登录）
- 站点 A：http://creator-ai.localhost:3000 （AI 视频/音频创作者工具，紫色）
- 站点 B：http://smb-ai.localhost:3000 （小企业 AI 工具，青绿色）

`*.localhost` 在 Chrome/Firefox/curl 中自动解析到 127.0.0.1，无需改 hosts。命令行测试：
`curl -H 'Host: smb-ai.localhost' http://127.0.0.1:3000/`

**种子脚本的保护措施**（`src/seed/run.ts`）

- `NODE_ENV=production` 时拒绝运行，除非 `ALLOW_SEED_IN_PRODUCTION=true`；
- 只处理 slug 为 `creator-ai`、`smb-ai` 的演示站；已存在就跳过；
- `pnpm seed -- --reset-demo`（或 `SEED_RESET_DEMO=1 pnpm seed`）只删除并重建这两个演示站自己的文档；
- 管理员只在该邮箱不存在时创建，从不修改已有用户。

**修改数据结构后**

```bash
pnpm payload migrate:create <名称>   # 生成 src/migrations/<时间>_<名称>.ts
pnpm payload migrate
pnpm generate:types                  # 更新 src/payload-types.ts
pnpm generate:importmap              # 新增/删除后台自定义组件时
```

---

## 3. 新增一个站点 / 域名

1. **Cloudflare**：把新域名加入 Cloudflare（改 NS）。
2. **Tunnel**：Zero Trust → Networks → Tunnels → 你的隧道 → *Public Hostname* → 添加
   `newsite.com` → `http://app:3000`，需要的话再加 `www.newsite.com` → `http://app:3000`。
   （隧道和 app 在同一 compose 网络，所以服务地址写 `app:3000`。）
3. **后台**：Sites → Create
   - `domains` 填 `newsite.com`、`www.newsite.com`（不要带 `https://` 和路径）；
   - `primaryDomain` 填 canonical 用的主域名，`useHttps` 勾选；
   - 上传 logo / favicon，填主题色、字体、默认 SEO、联盟披露。
4. 左上角切换到新站点 → 建分类、工具、文章；Header/Footer 可选（不建则用默认导航）。
5. 不需要重新构建或重启：站点解析缓存会在保存 Site 时自动失效。

本地测试新站：在 `domains` 里多加一个 `newsite.localhost`，然后访问 `http://newsite.localhost:3000`。

---

## 4. n8n 通过 REST API 写内容

### 4.1 准备 API Key

1. 后台 → Users → Create：邮箱如 `n8n@yourdomain`，角色选 **Automation**（可写工具/文章/分类/媒体，不能动用户、站点、点击数据）。
2. 编辑该用户 → 勾选 **Enable API Key** → 复制生成的 key → 保存。
3. n8n 中建一个 *Header Auth* 凭据：
   - Name: `Authorization`
   - Value: `users API-Key <你的key>`

所有请求都带这个头。`tenant` 字段写站点 ID（后台 Sites 列表里能看到，或 `GET /api/sites?where[slug][equals]=creator-ai`）。

> 网络：compose 默认只把 app 绑定到 `127.0.0.1:3000`。n8n 在另一台机器时，可走公网域名（`https://creator-ai.com/api/...`，建议在 Cloudflare Access 中给 `/api/*` 加 Service Token），或在 compose 里再加一行端口 `"<VPS-C的Tailscale IP>:3000:3000"`，n8n 通过 Tailnet 访问。

下面用 curl 演示，n8n 里用 *HTTP Request* 节点照填即可（`BASE=https://creator-ai.com` 或 `http://100.x.y.z:3000`）。

### 4.2 创建工具

```bash
curl -X POST "$BASE/api/tools" \
  -H "Authorization: users API-Key $KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant": 1,
    "name": "HeyGen",
    "slug": "heygen",
    "websiteUrl": "https://www.heygen.com",
    "shortDescription": "AI avatar videos and video translation.",
    "pricingModel": "freemium",
    "pricingSummary": "Free plan; paid plans for more credits",
    "categories": [1],
    "tags": ["avatar", "translation"],
    "features": [{"title": "AI avatars"}, {"title": "Video translation"}],
    "sourceUrls": [{"url": "https://www.heygen.com/pricing", "note": "pricing page"}],
    "affiliateStatus": "found"
  }'
```

返回 `{"doc": {"id": 13, ...}, "message": "..."}`。

### 4.3 更新 affiliateUrl

先按 slug 查 ID（带 API Key 时会返回联盟字段）：

```bash
curl -G "$BASE/api/tools" -H "Authorization: users API-Key $KEY" \
  --data-urlencode 'where[and][0][slug][equals]=heygen' \
  --data-urlencode 'where[and][1][tenant][equals]=1' \
  --data-urlencode 'depth=0' --data-urlencode 'limit=1'
```

再 PATCH：

```bash
curl -X PATCH "$BASE/api/tools/13" \
  -H "Authorization: users API-Key $KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "affiliateUrl": "https://heygen.partnerlinks.io/xxxx",
    "affiliatePlatform": "PartnerStack",
    "affiliateStatus": "approved",
    "commissionNote": "e.g. 25% recurring 12 months",
    "affiliateLastCheckedAt": "2026-11-03T08:00:00.000Z"
  }'
```

（也可以不查 ID，直接 `PATCH $BASE/api/tools?where[slug][equals]=heygen&where[tenant][equals]=1` 批量更新。）保存后该站缓存自动失效，`/go/heygen` 立刻跳到新链接。

### 4.4 创建草稿文章（人工审核后再发布）

```bash
curl -X POST "$BASE/api/posts?draft=true" \
  -H "Authorization: users API-Key $KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant": 1,
    "_status": "draft",
    "title": "HeyGen review: AI avatars for YouTube?",
    "slug": "heygen-review",
    "type": "review",
    "excerpt": "We tested HeyGen avatars and translation on three videos.",
    "relatedTools": [13],
    "faq": [{"q": "Is HeyGen free?", "a": "There is a limited free plan."}],
    "content": {"root": {"type": "root", "format": "", "indent": 0, "version": 1, "direction": "ltr",
      "children": [
        {"type": "heading", "tag": "h2", "format": "", "indent": 0, "version": 1, "direction": "ltr",
         "children": [{"type": "text", "text": "What is HeyGen?", "format": 0, "detail": 0, "mode": "normal", "style": "", "version": 1}]},
        {"type": "paragraph", "format": "", "indent": 0, "version": 1, "direction": "ltr", "textFormat": 0, "textStyle": "",
         "children": [{"type": "text", "text": "HeyGen creates talking-avatar videos from a script.", "format": 0, "detail": 0, "mode": "normal", "style": "", "version": 1}]}
      ]}}
  }'
```

草稿对外不可见（公开 API 和前台都只返回 `published`）。在后台审核后点 **Publish** 才上线；发布会触发重新验证。
（LLM 生成 Markdown 时，可以在 n8n 的 Code 节点里转成上面的 Lexical 结构，`src/seed/lexical.ts` 是现成的参考实现。）

### 4.5 其它常用

- 上传图片：`POST /api/media`，`multipart/form-data`，字段 `file`（二进制）+ `_payload`（JSON 字符串，如 `{"alt":"HeyGen logo","tenant":1}`），返回的 `doc.id` 填到工具的 `logo` / `screenshots`。
- 点击统计：只有 super-admin 能读 `GET /api/clicks?where[tenant][equals]=1&sort=-createdAt`。
- 健康检查：`GET /api/health`。

---

## 5. 部署（Ubuntu 24.04 + Docker + Cloudflare Tunnel）

### 5.1 服务器准备

```bash
# Docker Engine + compose 插件
sudo apt-get update && sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu noble stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER   # 重新登录生效

# 防火墙：只放 SSH（Tunnel 是出站连接，不需要开 80/443）
sudo ufw allow OpenSSH && sudo ufw enable
```

### 5.2 代码与配置

```bash
git clone <你的私有仓库> /opt/multisite && cd /opt/multisite
cp .env.example .env
# 必改：POSTGRES_PASSWORD、PAYLOAD_SECRET（openssl rand -hex 32）、NEXT_PUBLIC_SERVER_URL（如 https://creator-ai.com）
# 可选：TUNNEL_TOKEN、BACKUP_KEEP_DAYS、TZ
```

### 5.3 Cloudflare Tunnel

1. Cloudflare Zero Trust → Networks → Tunnels → Create tunnel（类型 Cloudflared）→ 复制 Docker 命令里的 token，填入 `.env` 的 `TUNNEL_TOKEN`。
2. 在该隧道的 *Public Hostname* 里为每个域名添加 `→ http://app:3000`。
3. SSL/TLS 模式用 *Full*；可为 `/admin*` 配置 Cloudflare Access（只允许你的邮箱）。

### 5.4 启动

```bash
docker compose --profile tunnel up -d --build
docker compose ps
docker compose logs -f app        # 首次启动会自动执行数据库迁移（prodMigrations）
curl -s http://127.0.0.1:3000/api/health
```

- 首次进入 `https://<任一域名>/admin` 创建第一个管理员（仅在用户表为空时允许）；
  或用种子脚本建：`docker compose --profile tools run --rm -e ALLOW_SEED_IN_PRODUCTION=true tools pnpm seed`（会同时建两个演示站，可在后台删除）。
- 不用 Tunnel 时去掉 `--profile tunnel`，app 只监听 `127.0.0.1:3000`，可前置 Caddy/Nginx。

### 5.5 备份与恢复

- `backup` 服务每天 03:15 执行 `scripts/backup.sh`，`pg_dump -Fc` 到命名卷 `backups`，保留 `BACKUP_KEEP_DAYS` 天。
- 手动备份：`docker compose exec backup /bin/sh /usr/local/bin/backup.sh`
- 拷出：`docker compose cp backup:/backups ./backups`
- 恢复：`docker compose exec -T postgres pg_restore -U multisite -d multisite --clean --if-exists < ./backups/multisite-XXXX.dump`
- 媒体文件：`scripts/backup-media.sh`（打包 `multisite_media` 卷），建议配合 rclone 同步到异地（如 R2/B2）。

### 5.6 更新

```bash
git pull
docker compose --profile tunnel up -d --build   # 新迁移在 app 启动时自动执行
```

---

## 6. 安全要点

- 无前台账号体系；`users` 创建需 super-admin，第一个用户只能在空库时通过 `/admin/create-first-user` 创建。
- 联盟字段对匿名请求不可见（字段级 `access.read`）；前台查询也以匿名身份执行（`overrideAccess:false`），联盟链接只在 `/go` 服务端读取。
- `clicks` 不能通过 REST/后台创建或修改；机器人 UA 不计入点击。
- GraphQL 已关闭；Postgres 不对外暴露端口；app 只绑定回环地址。
