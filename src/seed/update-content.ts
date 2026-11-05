/**
 * Idempotent content update for EXISTING installs (never wipes, never reseeds).
 *
 *   pnpm content:update            # apply
 *   pnpm content:update -- --dry   # only report what would change
 *   pnpm content:update -- --force-media   # re-upload every image from src/seed/assets
 *
 * For each demo site found by slug (sites that don't exist are skipped):
 *  - site: tagline / hero title / hero subtitle / SEO description
 *  - categories (by slug): name, description, icon (created if missing)
 *  - media: logos, covers, gallery and post covers from src/seed/assets, upserted by (site, filename)
 *  - tools (by slug): listing copy, pricing, images, features, tags, sources (created if missing).
 *    Affiliate fields (affiliateUrl/Platform/Status, commissionNote) are NEVER touched.
 *  - posts (by slug): title, excerpt, cover, content, FAQ, SEO meta, related tools. publishedAt and
 *    status are kept (a missing post is created as published).
 * Running it twice changes nothing the second time (media "kept").
 */
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { demoSites, type SeedSite } from './data'
import { lexical } from './lexical'
import { ensureMedia } from './media'

const ctx = { disableRevalidate: true }
const dry = process.argv.includes('--dry')
const forceMedia = process.argv.includes('--force-media')
const stats = { media: { kept: 0, replaced: 0, created: 0 }, tools: { updated: 0, created: 0 }, posts: { updated: 0, created: 0 }, categories: { updated: 0, created: 0 } }

const media = async (payload: Payload, tenant: number, siteSlug: string, asset: string, alt: string) => {
  if (dry) return 0
  const r = await ensureMedia(payload, tenant, asset, alt, `${siteSlug}-${asset}`, forceMedia)
  stats.media[r.action]++
  return r.id
}

const updateSite = async (payload: Payload, s: SeedSite) => {
  const found = await payload.find({ collection: 'sites', where: { slug: { equals: s.slug } }, limit: 1, depth: 0, overrideAccess: true })
  const site = found.docs[0]
  if (!site) {
    console.log(`site "${s.slug}" not found - skipped`)
    return
  }
  const tenant = site.id as number
  console.log(`site "${s.slug}" (id ${tenant})`)
  const siteLogo = await media(payload, tenant, s.slug, `site-${s.slug}-logo.webp`, `${s.name} logo`)
  const siteOg = await media(payload, tenant, s.slug, `site-${s.slug}-og.webp`, `${s.name} - ${s.tagline}`)
  if (!dry)
    await payload.update({
      collection: 'sites',
      id: tenant,
      overrideAccess: true,
      context: ctx,
      data: {
        tagline: s.tagline,
        heroTitle: s.heroTitle,
        heroSubtitle: s.heroSubtitle,
        logo: siteLogo,
        favicon: siteLogo,
        seo: { ...(site.seo || {}), description: s.seo.description, ogImage: siteOg },
      },
    })

  // categories
  const catIds: Record<string, number> = {}
  for (const [i, c] of s.categories.entries()) {
    const f = await payload.find({
      collection: 'categories',
      where: { and: [{ tenant: { equals: tenant } }, { slug: { equals: c.slug } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (f.docs[0]) {
      catIds[c.slug] = f.docs[0].id as number
      if (!dry) await payload.update({ collection: 'categories', id: f.docs[0].id, data: { name: c.name, description: c.description, icon: c.icon }, overrideAccess: true, context: ctx })
      stats.categories.updated++
    } else {
      if (!dry) {
        const d = await payload.create({ collection: 'categories', data: { ...c, order: i, tenant }, overrideAccess: true, context: ctx })
        catIds[c.slug] = d.id as number
      }
      stats.categories.created++
    }
  }

  // tools
  const toolIds: Record<string, number> = {}
  for (const [i, t] of s.tools.entries()) {
    const logo = await media(payload, tenant, s.slug, t.images.logo, `${t.name} logo`)
    const cover = await media(payload, tenant, s.slug, t.images.cover, `${t.name} - ${t.tagline}`)
    const gallery: number[] = []
    for (const g of t.images.gallery) {
      const label = g.includes('-home') ? `${t.name} homepage` : g.includes('-hero') ? `${t.name} homepage hero` : `${t.name} product image`
      gallery.push(g === t.images.cover ? cover : await media(payload, tenant, s.slug, g, label))
    }
    const data = {
      name: t.name,
      websiteUrl: t.websiteUrl,
      tagline: t.tagline,
      shortDescription: t.shortDescription,
      bestFor: t.bestFor,
      description: lexical(t.about.map((p) => ['p', p] as ['p', string])) as never,
      features: t.features,
      pricingModel: t.pricingModel,
      startingPrice: t.startingPrice,
      pricingSummary: t.pricingSummary,
      categories: t.categories.map((c) => catIds[c]).filter(Boolean),
      tags: t.tags,
      featured: Boolean(t.featured),
      logo: logo || undefined,
      cover: cover || undefined,
      screenshots: gallery.filter(Boolean),
      sourceUrls: [
        { url: t.websiteUrl, note: 'Official website' },
        { url: t.pricingUrl, note: 'Official pricing page (checked Nov 2026)' },
      ],
    }
    const f = await payload.find({
      collection: 'tools',
      where: { and: [{ tenant: { equals: tenant } }, { slug: { equals: t.slug } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (f.docs[0]) {
      toolIds[t.slug] = f.docs[0].id as number
      if (!dry) await payload.update({ collection: 'tools', id: f.docs[0].id, data, overrideAccess: true, context: ctx })
      stats.tools.updated++
    } else {
      if (!dry) {
        const d = await payload.create({
          collection: 'tools',
          data: { ...data, tenant, slug: t.slug, sortOrder: i, affiliateStatus: 'none' },
          overrideAccess: true,
          context: ctx,
        })
        toolIds[t.slug] = d.id as number
      }
      stats.tools.created++
    }
  }

  // posts
  for (const p of s.posts) {
    const hero = await media(payload, tenant, s.slug, p.cover, p.title)
    const f = await payload.find({
      collection: 'posts',
      where: { and: [{ tenant: { equals: tenant } }, { slug: { equals: p.slug } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      draft: true,
    })
    const data = {
      title: p.title,
      type: p.type,
      excerpt: p.excerpt,
      heroImage: hero || undefined,
      content: p.content as never,
      relatedTools: p.tools.map((t) => toolIds[t]).filter(Boolean),
      faq: p.faq,
      meta: { title: p.title, description: p.excerpt, image: hero || undefined },
    }
    const existing = f.docs[0]
    if (existing) {
      if (!dry)
        await payload.update({
          collection: 'posts',
          id: existing.id,
          data: { ...data, _status: existing._status === 'published' ? 'published' : 'draft' },
          draft: existing._status !== 'published',
          overrideAccess: true,
          context: ctx,
        })
      stats.posts.updated++
    } else {
      if (!dry)
        await payload.create({
          collection: 'posts',
          data: { ...data, tenant, slug: p.slug, _status: 'published', publishedAt: new Date().toISOString() },
          draft: false,
          overrideAccess: true,
          context: ctx,
        })
      stats.posts.created++
    }
  }
}

const main = async () => {
  const payload = await getPayload({ config })
  for (const s of demoSites) await updateSite(payload, s)
  console.log(`${dry ? '[dry run] ' : ''}content update done: ${JSON.stringify(stats)}`)
  process.exit(0)
}

try {
  await main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
