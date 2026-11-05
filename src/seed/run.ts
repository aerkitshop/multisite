/**
 * Demo seed - guarded and non-destructive.
 *
 *   pnpm seed                 # create demo sites that don't exist yet (+ super-admin from env)
 *   pnpm seed -- --reset-demo # delete & recreate ONLY the demo sites' own documents
 *
 * Guards:
 *  - refuses to run when NODE_ENV=production unless ALLOW_SEED_IN_PRODUCTION=true
 *  - never touches a site whose slug is not one of the demo slugs
 *  - skips a demo site that already exists (unless --reset-demo)
 *  - creates the super-admin only if no user with SEED_ADMIN_EMAIL exists; never changes existing users
 */
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { demoSites, type SeedSite } from './data'
import { lexical } from './lexical'
import { ensureMedia } from './media'

const ctx = { disableRevalidate: true }

const wipeDemoSite = async (payload: Payload, siteId: number) => {
  // Only documents that belong to THIS demo site.
  for (const collection of ['clicks', 'posts', 'tools', 'categories', 'pages', 'header', 'footer', 'media'] as const) {
    await payload.delete({ collection, where: { tenant: { equals: siteId } }, context: ctx })
  }
  await payload.delete({ collection: 'sites', id: siteId, context: ctx })
}

const seedSite = async (payload: Payload, s: SeedSite) => {
  const site = await payload.create({
    collection: 'sites',
    context: ctx,
    data: {
      name: s.name,
      slug: s.slug,
      domains: s.domains.map((domain) => ({ domain })),
      primaryDomain: s.primaryDomain,
      useHttps: false,
      tagline: s.tagline,
      heroTitle: s.heroTitle,
      heroSubtitle: s.heroSubtitle,
      colors: s.colors,
      fonts: s.fonts as never,
      seo: s.seo,
      affiliateDisclosure: s.affiliateDisclosure,
      contactEmail: `hello@${s.slug}.example`,
    },
  })
  const tenant = site.id as number

  const logo = (await ensureMedia(payload, tenant, `site-${s.slug}-logo.webp`, `${s.name} logo`, `${s.slug}-site-${s.slug}-logo.webp`)).id
  const og = (await ensureMedia(payload, tenant, `site-${s.slug}-og.webp`, `${s.name} - ${s.tagline}`, `${s.slug}-site-${s.slug}-og.webp`)).id
  await payload.update({ collection: 'sites', id: tenant, data: { logo, favicon: logo, seo: { ...s.seo, ogImage: og } }, context: ctx })

  const catIds: Record<string, number> = {}
  for (const [i, c] of s.categories.entries()) {
    const doc = await payload.create({ collection: 'categories', data: { ...c, order: i, tenant }, context: ctx })
    catIds[c.slug] = doc.id as number
  }

  const toolIds: Record<string, number> = {}
  for (const [i, t] of s.tools.entries()) {
    const asset = async (file: string, alt: string) => (await ensureMedia(payload, tenant, file, alt, `${s.slug}-${file}`)).id
    const tLogo = await asset(t.images.logo, `${t.name} logo`)
    const tCover = await asset(t.images.cover, `${t.name} - ${t.tagline}`)
    const shots: number[] = []
    for (const g of t.images.gallery) shots.push(g === t.images.cover ? tCover : await asset(g, `${t.name} ${g.includes('-home') ? 'homepage' : 'product image'}`))
    const doc = await payload.create({
      collection: 'tools',
      context: ctx,
      data: {
        tenant,
        name: t.name,
        slug: t.slug,
        websiteUrl: t.websiteUrl,
        tagline: t.tagline,
        shortDescription: t.shortDescription,
        bestFor: t.bestFor,
        startingPrice: t.startingPrice,
        cover: tCover,
        description: lexical(t.about.map((p) => ['p', p] as ['p', string])) as never,
        features: t.features,
        pricingModel: t.pricingModel,
        pricingSummary: t.pricingSummary,
        categories: t.categories.map((c) => catIds[c]),
        tags: t.tags,
        featured: Boolean(t.featured),
        sortOrder: i,
        logo: tLogo,
        screenshots: shots,
        affiliateUrl: t.affiliateUrl,
        affiliatePlatform: t.affiliatePlatform,
        affiliateStatus: t.affiliateStatus ?? 'none',
        commissionNote: t.commissionNote,
        affiliateLastCheckedAt: t.affiliateStatus && t.affiliateStatus !== 'none' ? new Date().toISOString() : undefined,
        sourceUrls: [
          { url: t.websiteUrl, note: 'Official website' },
          { url: t.pricingUrl, note: 'Official pricing page (checked Nov 2026)' },
        ],
      },
    })
    toolIds[t.slug] = doc.id as number
  }

  for (const [i, p] of s.posts.entries()) {
    const hero = (await ensureMedia(payload, tenant, p.cover, p.title, `${s.slug}-${p.cover}`)).id
    await payload.create({
      collection: 'posts',
      context: ctx,
      draft: false,
      data: {
        tenant,
        title: p.title,
        slug: p.slug,
        type: p.type,
        excerpt: p.excerpt,
        heroImage: hero,
        content: p.content as never,
        relatedTools: p.tools.map((t) => toolIds[t]).filter(Boolean),
        faq: p.faq,
        publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
        _status: 'published',
        meta: { title: p.title, description: p.excerpt, image: hero },
      },
    })
  }

  const pages: [string, string, ReturnType<typeof lexical>][] = [
    ['About', 'about', lexical([['p', `${s.name}: ${s.tagline}.`], ['p', 'We test tools hands-on and update listings when pricing or features change.'], ['h2', 'How we review'], ['ul', ['We use each tool on a real project.', 'We note pricing and limits from the official site.', 'Affiliate commissions never decide rankings.']]])],
    ['Affiliate disclosure', 'disclosure', lexical([['p', s.affiliateDisclosure], ['p', 'Outbound links to tools pass through /go/ so we can count clicks. Links are marked rel="sponsored".']])],
    ['Privacy policy', 'privacy', lexical([['p', `${s.name} has no user accounts, comments or forms.`], ['p', 'For outbound clicks we store the tool, the page, your country (from our CDN header) and your browser user agent. No tracking cookies are set.']])],
  ]
  for (const [title, slug, content] of pages) {
    await payload.create({ collection: 'pages', data: { tenant, title, slug, content: content as never }, context: ctx })
  }

  await payload.create({
    collection: 'header',
    context: ctx,
    data: { tenant, navItems: [{ label: 'Tools', url: '/#directory' }, { label: 'Blog', url: '/blog' }, { label: 'About', url: '/about' }] },
  })
  await payload.create({
    collection: 'footer',
    context: ctx,
    data: { tenant, about: s.footerAbout, navItems: s.categories.map((c) => ({ label: c.name, url: `/category/${c.slug}` })) },
  })
  return tenant
}

const main = async () => {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED_IN_PRODUCTION !== 'true') {
    console.error('Refusing to seed: NODE_ENV=production and ALLOW_SEED_IN_PRODUCTION is not "true".')
    process.exit(1)
  }
  const reset = process.argv.includes('--reset-demo') || process.env.SEED_RESET_DEMO === '1'
  const payload = await getPayload({ config })

  // Super-admin from env (create-only)
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (email && password) {
    const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
    if (existing.docs.length === 0) {
      await payload.create({ collection: 'users', data: { email, password, name: 'Super Admin', roles: ['super-admin'] } })
      console.log(`created super-admin ${email}`)
    } else console.log(`super-admin ${email} already exists - left unchanged`)
  } else console.warn('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set - skipping super-admin')

  for (const s of demoSites) {
    const found = await payload.find({ collection: 'sites', where: { slug: { equals: s.slug } }, limit: 1 })
    if (found.docs[0]) {
      if (!reset) {
        console.log(`site "${s.slug}" exists - skipped (use --reset-demo to recreate demo content)`)
        continue
      }
      console.log(`resetting demo site "${s.slug}"`)
      await wipeDemoSite(payload, found.docs[0].id as number)
    }
    const id = await seedSite(payload, s)
    console.log(`seeded site "${s.slug}" (id ${id}) on ${s.domains.join(', ')}`)
  }
  console.log('seed done')
  process.exit(0)
}

// Top-level await: `payload run` exits as soon as the module's evaluation finishes.
try {
  await main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
