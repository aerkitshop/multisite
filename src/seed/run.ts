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
import sharp from 'sharp'

import { demoSites, type SeedSite } from './data'
import { lexical } from './lexical'

const ctx = { disableRevalidate: true }

const svgPng = async (svg: string, w: number, h: number) =>
  sharp(Buffer.from(svg)).resize(w, h).png().toBuffer()

const logoSvg = (letter: string, color: string) => `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="56" fill="${color}"/>
  <circle cx="200" cy="56" r="28" fill="#ffffff" fill-opacity="0.25"/>
  <text x="128" y="160" font-family="DejaVu Sans, Arial, sans-serif" font-size="128" font-weight="700" fill="#ffffff" text-anchor="middle">${letter}</text>
</svg>`

const shotSvg = (title: string, color: string, accent: string, n: number) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs>
  <rect width="1600" height="900" fill="url(#g)"/>
  <rect x="120" y="110" width="1360" height="680" rx="28" fill="#ffffff" fill-opacity="0.92"/>
  <rect x="120" y="110" width="1360" height="64" rx="28" fill="#0f172a" fill-opacity="0.08"/>
  <circle cx="165" cy="142" r="10" fill="#ef4444"/><circle cx="200" cy="142" r="10" fill="#f59e0b"/><circle cx="235" cy="142" r="10" fill="#22c55e"/>
  <rect x="180" y="230" width="${300 + n * 120}" height="36" rx="10" fill="${color}" fill-opacity="0.85"/>
  <rect x="180" y="300" width="900" height="22" rx="8" fill="#0f172a" fill-opacity="0.15"/>
  <rect x="180" y="342" width="760" height="22" rx="8" fill="#0f172a" fill-opacity="0.12"/>
  <rect x="180" y="420" width="560" height="300" rx="18" fill="${accent}" fill-opacity="0.25"/>
  <rect x="780" y="420" width="640" height="300" rx="18" fill="${color}" fill-opacity="0.18"/>
  <text x="800" y="840" font-family="DejaVu Sans, Arial, sans-serif" font-size="40" fill="#ffffff" text-anchor="middle">${title} - demo screenshot ${n}</text>
</svg>`

const upload = async (payload: Payload, tenant: number, name: string, alt: string, data: Buffer) => {
  const doc = await payload.create({
    collection: 'media',
    data: { alt, tenant },
    file: { data, mimetype: 'image/png', name, size: data.length },
    context: ctx,
  })
  return doc.id
}

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

  const logo = await upload(payload, tenant, `${s.slug}-logo.png`, `${s.name} logo`, await svgPng(logoSvg(s.name[0], s.colors.primary), 256, 256))
  const og = await upload(payload, tenant, `${s.slug}-og.png`, s.name, await svgPng(shotSvg(s.name, s.colors.primary, s.colors.accent, 1), 1600, 900))
  await payload.update({ collection: 'sites', id: tenant, data: { logo, favicon: logo, seo: { ...s.seo, ogImage: og } }, context: ctx })

  const catIds: Record<string, number> = {}
  for (const [i, c] of s.categories.entries()) {
    const doc = await payload.create({ collection: 'categories', data: { ...c, order: i, tenant }, context: ctx })
    catIds[c.slug] = doc.id as number
  }

  const toolIds: Record<string, number> = {}
  for (const [i, t] of s.tools.entries()) {
    const tLogo = await upload(payload, tenant, `${s.slug}-${t.slug}-logo.png`, `${t.name} logo`, await svgPng(logoSvg(t.name[0], t.color), 256, 256))
    const shots = [
      await upload(payload, tenant, `${s.slug}-${t.slug}-1.png`, `${t.name} screenshot 1`, await svgPng(shotSvg(t.name, t.color, s.colors.accent, 1), 1600, 900)),
      await upload(payload, tenant, `${s.slug}-${t.slug}-2.png`, `${t.name} screenshot 2`, await svgPng(shotSvg(t.name, t.color, s.colors.primary, 2), 1600, 900)),
    ]
    const doc = await payload.create({
      collection: 'tools',
      context: ctx,
      data: {
        tenant,
        name: t.name,
        slug: t.slug,
        websiteUrl: t.websiteUrl,
        shortDescription: t.shortDescription,
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
        sourceUrls: [{ url: t.websiteUrl, note: 'Official website' }],
      },
    })
    toolIds[t.slug] = doc.id as number
  }

  for (const [i, p] of s.posts.entries()) {
    const hero = await upload(payload, tenant, `${s.slug}-${p.slug}-hero.png`, p.title, await svgPng(shotSvg(p.title.slice(0, 40), s.colors.primary, s.colors.accent, i + 1), 1600, 900))
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
