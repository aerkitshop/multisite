/* eslint-disable @next/next/no-img-element */
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
    image: tool.meta?.image || (Array.isArray(tool.screenshots) ? tool.screenshots[0] : null) || tool.logo,
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
            image: mediaAbsoluteUrl(site, tool.logo) || undefined,
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

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <ToolLogo src={mediaUrl(tool.logo, 'thumbnail')} name={tool.name} size={80} />
            <div className="flex-1">
              <h1 className="text-3xl font-bold md:text-4xl">{tool.name}</h1>
              <p className="mt-2 text-muted-foreground">{tool.shortDescription}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <PricingBadge model={tool.pricingModel} />
                {categories.map((c) => (
                  <Link key={c.id} href={`/category/${c.slug}`} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
            <OutboundLink slug={tool.slug} from={path} className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground shadow hover:opacity-90">
              Visit website ↗
            </OutboundLink>
          </header>

          {screenshots.length > 0 && (
            <section className="mt-8 flex snap-x gap-4 overflow-x-auto pb-2" aria-label="Screenshots">
              {screenshots.map((s) => (
                <img key={s.id} src={mediaUrl(s, 'large') || ''} alt={s.alt || `${tool.name} screenshot`} loading="lazy" className="aspect-video w-[85%] shrink-0 snap-start rounded-2xl border object-cover md:w-[70%]" />
              ))}
            </section>
          )}

          {tool.description && (
            <section className="mt-10">
              <h2 className="mb-4 text-2xl font-bold">About {tool.name}</h2>
              <RichText data={tool.description} />
            </section>
          )}

          {tool.features && tool.features.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-2xl font-bold">Key features</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {tool.features.map((f, i) => (
                  <li key={f.id || i} className="rounded-xl border bg-card p-4">
                    <p className="font-medium">✓ {f.title}</p>
                    {f.description && <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 text-2xl font-bold">Related articles</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {related.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Pricing</h2>
            <div className="mt-3"><PricingBadge model={tool.pricingModel} /></div>
            {tool.pricingSummary && <p className="mt-3 text-sm">{tool.pricingSummary}</p>}
            <OutboundLink slug={tool.slug} from={path} className="mt-4 block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground hover:opacity-90">
              Try {tool.name} ↗
            </OutboundLink>
          </div>
          {tool.tags && tool.tags.length > 0 && (
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tags</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tool.tags.map((t) => (
                  <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-xs">#{t}</span>
                ))}
              </div>
            </div>
          )}
          {tool.sourceUrls && tool.sourceUrls.length > 0 && (
            <div className="rounded-2xl border bg-card p-5 text-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sources</h2>
              <ul className="mt-3 space-y-1">
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
          <h2 className="mb-5 text-2xl font-bold">Similar tools</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {similar.map((t) => (
              <ToolCard key={t.id} tool={t} from={path} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
