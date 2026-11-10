# 本地租赁/临时服务目录：数据与搜索设计（v1）

核心公式：**Service × City × Price × Business × Lead**
第一版只做「租赁/临时服务」大类。底座沿用本仓库（Payload CMS 3 + Next.js 15 + Postgres，按域名多租户）。

---

## 1. 站点与 URL

- 一个二级域名 = 一个城市站（tenant）：`springfield-il.example.com`。
- 页面：

| 路径 | 页面 | 维度 |
|---|---|---|
| `/` | 城市首页：全部租赁服务 + 搜索框 + 本城价格速览 | City |
| `/dumpster-rental` | **集合页**：本城该服务的全部商家与报价，带筛选 | Service × City |
| `/dumpster-rental/20-yard` | 尺寸集合页：只看 20 码报价，按总价排序 | Service × Size × City |
| `/dumpster-rental/cost` | 价格指南页：本城最低/中位/最高、影响价格的因素 | Service × City × Price |
| `/business/<slug>` | 商家详情页：服务、全部报价、服务范围、电话、询价表单 | Business |
| `/quote?service=…&size=…` | 询价表单（落 Lead） | Lead |
| `/search?…` | 通用搜索结果（与集合页同一组件，noindex） | 全部 |

规则：某城某服务报价少于 3 条时，集合页和尺寸页不生成（避免薄内容），只在首页列出。

---

## 2. 数据库集合

### 2.1 全局（不分站）

**service-groups** 服务大类
- name（Rental / Temporary Services）、slug、sortOrder

**services** 服务
- name、slug、group → service-groups
- priceBasis：`flat_per_rental` | `per_day` | `per_week` | `per_month` | `per_event` | `per_linear_foot_month` | `quote_only`
- sizeLabel（如 "Yards"、"Feet"、"kW"），用于显示
- sizes[]：value（数字，如 20）、label（"20 Yard"）、slug（"20-yard"）、notes（"适合 1,500 平方英尺装修"）
- projectTypes[]：如 cleanout、remodel、roofing、construction、event、moving
- faq[]、priceFactors[]（影响价格的因素，价格指南页用）
- defaultCompareDays：比较总价时默认租期（垃圾箱 7 天，储物箱 30 天）

第一版种子数据：

| 服务 | priceBasis | 尺寸 |
|---|---|---|
| Dumpster Rental | flat_per_rental | 10 / 15 / 20 / 30 / 40 Yard |
| Portable Toilet Rental | per_month / per_event | Standard、Deluxe、ADA、Hand-wash Station |
| Event Toilet Rental | per_event | Standard、Luxury Trailer |
| Temporary Fence Rental | per_linear_foot_month | 6×12 ft Panel |
| Storage Container Rental | per_month | 10 / 20 / 40 ft |
| Portable Storage | per_month | 8 / 12 / 16 ft |
| Equipment Rental | per_day / per_week | Skid Steer、Mini Excavator、Scissor Lift |
| Generator Rental | per_day / per_week | 20 / 45 / 100 kW |
| Temporary Power | flat_per_rental | Temp Power Pole |
| Trailer Rental | per_day | Dump Trailer、Utility Trailer |

**cities** 城市
- name、state、stateCode、county、slug（`springfield-il`）、lat、lng、population、zipCodes[]、nearbyCities → cities（hasMany）
- site → sites（一个城市对应一个站点；`sites` 增加 `city` 字段反向关联）

**businesses** 商家（全局，因为一家可服务多城）
- name、slug、phone、website、email、address、baseCity → cities、serviceAreas → cities（hasMany）、serviceRadiusMiles
- services → services（hasMany）
- logo、photos、description、yearsInBusiness、licensed、insured、hours
- rating、reviewCount、ratingSource（只填可查证来源，不编造）
- verified（是否核实过）、lastVerifiedAt、sourceUrls[]
- status：`active` | `hidden` | `closed`

**offers** 报价（Price 的核心表，一行 = 一家商家 × 一个服务 × 一个尺寸）
- business → businesses、service → services、sizeValue、sizeLabel
- price、priceType（同 priceBasis）、priceMin/priceMax（只有区间时）
- includedDays、includedTons、overagePerTon、extraDayFee、deliveryFee、deposit、minRentalDays
- cities → cities（hasMany，默认继承商家服务范围，可单独覆盖）
- priceSource：`website` | `phone` | `estimate`；priceVerifiedAt
- **计算字段（beforeChange 钩子写入，用于排序和筛选）**：
  - `compareTotal`：按服务 defaultCompareDays 算出的可比总价 = price + deliveryFee + 超出天数 × extraDayFee
  - `pricePerDay` = compareTotal ÷ defaultCompareDays
- 索引：(service, sizeValue)、(compareTotal)、cities 关联表上的 (city_id)

### 2.2 分站（tenant 字段由多租户插件自动加）

**placements** 排名位 / 出租位（Rank and Rent 的变现记录）
- site、service、business
- tier：`exclusive`（独家承租，置顶 + 表单线索只给它）| `featured` | `basic`
- trackingPhone（转接号码，用于统计来电）、startDate、endDate、active
- monthlyFee、notes（私有字段，未登录不返回）

**leads** 线索
- site、city、service、sizeValue、offer → offers、business → businesses（用户点了谁）
- projectType、startDate、rentalDays、zip、address（可选）
- name、phone、email、message、consent（勾选同意被联系，TCPA）
- sourcePath、utm、userAgent、ip 哈希
- routedTo → businesses、routedAt
- status：`new` | `sent` | `accepted` | `won` | `lost` | `invalid`、estValue
- 只能由服务端 /quote 写入；只有 super-admin 可读

**clicks**（扩展现有集合）
- type：`call` | `website` | `quote_open` | `directions`
- business、offer、service、sourcePath

**pages / posts / header / footer**：沿用现有。

---

## 3. 搜索设计

### 3.1 搜索参数（集合页、尺寸页、/search 共用）

| 维度 | 参数 | 说明 |
|---|---|---|
| City | 来自域名；`zip` 可选 | 用 zip 匹配 cities.zipCodes，或按距离筛服务范围 |
| Service | `service` | slug，集合页由路径确定 |
| Size | `size` | 多选，如 `20,30` |
| Price | `maxPrice`、`days` | 按 compareTotal 筛；传 days 时按该租期重新算总价 |
| Business | `verified`、`licensed`、`q` | 只看已核实 / 有执照 / 按名称搜 |
| Project | `project` | cleanout、roofing… 用于推荐尺寸 |
| Sort | `sort` | `recommended`（默认）、`price`、`rating` |

### 3.2 默认排序（recommended）

1. 本站该服务的 `exclusive` 承租商家
2. `featured`
3. 其余按 `compareTotal` 升序，同价按 rating 降序
4. 无价格（quote_only）放最后

### 3.3 实现

- 新建 `src/lib/search.ts`：`searchOffers({ siteId, cityId, service, sizes, maxPrice, days, verified, sort, page })`，用 Payload Local API `find('offers', { where })` + placements 合并排序；结果按商家分组（一家显示最低价，展开看全部尺寸）。
- 新建 `src/lib/priceStats.ts`：按 城市 × 服务 × 尺寸 算 min / 中位 / max / 报价数，给价格指南页和集合页顶部「本城 20 码垃圾箱通常 $X–$Y」。数据变动时 revalidate。
- 尺寸推荐：project → 推荐尺寸映射放在 services.projectTypes 里（例如 roofing → 20 码）。
- 筛选用 URL 参数同步（沿用首页已有做法），服务端渲染，可分享。

### 3.4 线索流

`/quote` 表单 → 服务端校验 + 简单防刷（蜜罐 + 频率限制）→ 写 leads → 有 `exclusive` 承租商家就只发给它，否则发给用户点选的商家 → 通知方式第一版只记录不发送（不上线）。

---

## 4. SEO 结构化数据

- 集合页：`ItemList` + 每家 `LocalBusiness`；价格用 `Offer`（priceCurrency USD）。
- 商家页：`LocalBusiness` + `areaServed` + `makesOffer`。
- 价格指南页：`FAQPage`。
- 不编造评分；无可查证评分就不输出 `aggregateRating`。

---

## 5. 开发阶段（由 pi + EXAONE 实现，每阶段一个 PR 到 `rental-v1` 分支）

1. 集合：service-groups、services、cities、businesses、offers、placements、leads；sites 加 city；迁移。
2. 种子数据：1 个示例城市 + 10 个服务 + 8 家虚构商家 + 约 40 条报价（明确标注示例数据）。
3. `search.ts`、`priceStats.ts` + 单元测试。
4. 前台：城市首页、集合页、尺寸页、价格指南页、商家详情页。
5. /quote 线索表单 + clicks 扩展。
6. sitemap、JSON-LD、去掉 AI 工具相关页面。

验收：`pnpm build` 通过；示例城市下 `/dumpster-rental?size=20&maxPrice=500` 返回正确排序结果；截图检查集合页与商家页。
