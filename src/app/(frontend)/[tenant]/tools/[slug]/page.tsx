import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { JsonLd } from '@/components/site/JsonLd'
import { OutboundLink } from '@/components/site/OutboundLink'
import { PostCard } from '@/components/site/PostCard'
import { PricingBadge } from '@/components/site/PricingBadge'
import { RichText } from '@/components/site/RichText'
import { ToolCard } from '@/components/site/ToolCard'
import { ToolGallery } from '@/components/site/ToolGallery'
import { ToolLogo } from '@/components/site/ToolLogo'
import { getPosts, getTool, getTools, toToolCard } from '@/lib/data'
import { buildMetadata } from '@/lib/meta'
import { absoluteUrl, getSiteByDomain, mediaAbsoluteUrl, mediaUrl } from '@/lib/site'
import type { Category, Media } from '@/payload-types'

export const revalidate = 3600
export const dynamicParams = true
export async function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ tenant: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, slug } = await params
  const site = await getSiteByDomain(tenant)
  if (!site) return {}
  const tool = await getTool(site.id, slug)
  if (!tool) return {}
  return buildMetadata({
    site,
    path: `/tools/${tool.slug}`,
    title: tool.meta?.title || `${tool.name} – features, pricing & alternatives`,
    description: tool.meta?.description || tool.shortDescription,
    image: tool.meta?.image || tool.cover || (Array.isArray(tool.screenshots) ? tool.screenshots[0] : null) || tool.logo,
  })
}

export default async function ToolPage({ params }: Props) {
  const { tenant, slug } = await params
  const site = await getSiteByDomain(tenant)
  if (!site) notFound()
  const tool = await getTool(site.id, slug)
  if (!tool) notFound()

  const path = `/tools/${tool.slug}`
  const categories = (tool.categories || []).filter((c): c is Category => typeof c === 'object' && c !== null)
  const screenshots = (tool.screenshots || []).filter((m): m is Media => typeof m === 'object' && m !== null)
  const cover = tool.cover && typeof tool.cover === 'object' ? tool.cover : null
  const gallery = [cover, ...screenshots]
    .filter((m): m is Media => Boolean(m && (m.url || m.sizes?.large?.url)))
    .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
    .map((m) => ({ src: mediaUrl(m, 'large') || mediaUrl(m) || '', alt: m.alt || `${tool.name} screenshot` }))
  const [related, allTools] = await Promise.all([getPosts(site.id, { toolId: tool.id, limit: 6 }), getTools(site.id)])
  const catSlugs = new Set(categories.map((c) => c.slug))
  const similar = allTools
    .map(toToolCard)
    .filter((t) => t.slug !== tool.slug && t.categories.some((c) => catSlugs.has(c.slug)))
    .slice(0, 3)

  return (
    <div className="container py-10">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: tool.name,
            url: absoluteUrl(site, path),
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'Web',
            description: tool.shortDescription,
            image: mediaAbsoluteUrl(site, tool.cover || tool.logo) || undefined,
            ...(tool.pricingModel === 'free' || tool.pricingModel === 'freemium'
              ? { offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }
              : {}),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl(site, '/') },
              ...(categories[0]
                ? [{ '@type': 'ListItem', position: 2, name: categories[0].name, item: absoluteUrl(site, `/category/${categories[0].slug}`) }]
                : []),
              { '@type': 'ListItem', position: categories[0] ? 3 : 2, name: tool.name, item: absoluteUrl(site, path) },
            ],
          },
        ]}
      />
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        {categories[0] && (
          <>
            {' / '}
            <Link href={`/category/${categories[0].slug}`} className="hover:text-foreground">{categories[0].name}</Link>
          </>
        )}
        {' / '}
        <span className="text-foreground">{tool.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-12">
        <div className="min-w-0">
          <header className="flex items-start gap-4 sm:gap-5">
            <ToolLogo src={mediaUrl(tool.logo, 'thumbnail')} name={tool.name} size={72} priority />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{tool.name}</h1>
                {tool.featured && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-500/30 dark:text-amber-300">
                    Featured
                  </span>
                )}
              </div>
              {tool.tagline && <p className="mt-1.5 text-lg leading-snug text-muted-foreground">{tool.tagline}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PricingBadge model={tool.pricingModel} />
                {categories.map((c) => (
                  <Link key={c.id} href={`/category/${c.slug}`} className="rounded-full border bg-card px-2.5 py-0.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </header>

          {gallery.length > 0 && (
            <section className="mt-8" aria-label="Screenshots">
              <ToolGallery images={gallery} name={tool.name} />
            </section>
          )}

          {tool.bestFor && (
            <div className="mt-8 flex gap-3 rounded-2xl border border-primary/20 bg-primary/[0.05] p-4 sm:p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2}>
                  <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary-text">Best for</p>
                <p className="mt-0.5 font-medium">{tool.bestFor}</p>
              </div>
            </div>
          )}

          <section className="mt-10">
            <h2 className="mb-3 text-2xl font-bold tracking-tight">What {tool.name} does</h2>
            {tool.shortDescription && <p className="text-[17px] leading-relaxed text-foreground/85">{tool.shortDescription}</p>}
            {tool.description && (
              <div className="mt-4">
                <RichText data={tool.description} />
              </div>
            )}
          </section>

          {tool.features && tool.features.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-2xl font-bold tracking-tight">Key features</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {tool.features.map((f, i) => (
                  <li key={f.id || i} className="rounded-2xl border bg-card p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                    <p className="flex items-center gap-2 font-semibold">
                      <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-primary-text" fill="none" stroke="currentColor" strokeWidth={2.2}>
                        <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f.title}
                    </p>
                    {f.description && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.description}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 text-2xl font-bold tracking-tight">Related articles</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {related.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border bg-card p-5 shadow-[0_8px_30px_-16px_rgba(16,24,40,0.25)]">
            <div className="flex items-center gap-3">
              <ToolLogo src={mediaUrl(tool.logo, 'thumbnail')} name={tool.name} size={40} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{tool.name}</p>
                <PricingBadge model={tool.pricingModel} className="mt-0.5" />
              </div>
            </div>
            {tool.startingPrice && <p className="mt-4 text-2xl font-bold tracking-tight">{tool.startingPrice}</p>}
            {tool.pricingSummary && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tool.pricingSummary}</p>}
            <OutboundLink slug={tool.slug} from={path} className="mt-5 flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90">
              Visit {tool.name} ↗
            </OutboundLink>
            <p className="mt-2.5 text-center text-[11px] text-muted-foreground">Pricing checked on the official site. Plans change - confirm before buying.</p>
          </div>
          {tool.tags && tool.tags.length > 0 && (
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Tags</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tool.tags.map((t) => (
                  <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-foreground/80">{t}</span>
                ))}
              </div>
            </div>
          )}
          {tool.sourceUrls && tool.sourceUrls.length > 0 && (
            <div className="rounded-2xl border bg-card p-5 text-sm">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Sources</h2>
              <ul className="mt-3 space-y-1.5">
                {tool.sourceUrls.map((s, i) => (
                  <li key={s.id || i} className="truncate">
                    <a href={s.url} rel="nofollow noopener" target="_blank" className="text-primary-text hover:underline">{s.note || s.url}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-2xl font-bold tracking-tight">Similar tools</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((t) => (
              <ToolCard key={t.id} tool={t} from={path} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
