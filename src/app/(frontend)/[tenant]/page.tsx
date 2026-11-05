import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { HomeDirectory } from '@/components/site/HomeDirectory'
import { JsonLd } from '@/components/site/JsonLd'
import { PostCard } from '@/components/site/PostCard'
import { getCategories, getPosts, getTools, toToolCard } from '@/lib/data'
import { buildMetadata } from '@/lib/meta'
import { absoluteUrl, getSiteByDomain } from '@/lib/site'

export const revalidate = 3600
export const dynamicParams = true
export async function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSiteByDomain((await params).tenant)
  if (!site) return {}
  return buildMetadata({ site, path: '/' })
}

const time = (d?: string | null) => (d ? new Date(d).getTime() : 0)

/** Homepage = the directory itself: short hero + search, then sidebar (categories) | tool grid. */
export default async function HomePage({ params }: Props) {
  const site = await getSiteByDomain((await params).tenant)
  if (!site) notFound()

  const [tools, categories, posts] = await Promise.all([
    getTools(site.id),
    getCategories(site.id),
    getPosts(site.id, { limit: 3 }),
  ])
  // Featured first, then newest.
  const cards = tools
    .map(toToolCard)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || time(b.createdAt) - time(a.createdAt))
  // "Updated Nov 2026 · 6 tools hand-tested" - month of the most recent listing update.
  const lastUpdate = Math.max(0, ...cards.map((t) => time(t.updatedAt)))
  const kicker = cards.length
    ? `${lastUpdate ? `Updated ${new Date(lastUpdate).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })} · ` : ''}${cards.length} tools hand-tested`
    : null
  const cats = categories
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      icon: c.icon,
      count: cards.filter((t) => t.categories.some((x) => x.slug === c.slug)).length,
    }))
    .filter((c) => c.count > 0)

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: site.name,
            url: absoluteUrl(site, '/'),
            description: site.seo?.description || site.tagline,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `${site.name} directory`,
            numberOfItems: cards.length,
            itemListElement: cards.map((t, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: t.name,
              url: absoluteUrl(site, `/tools/${t.slug}`),
            })),
          },
        ]}
      />
      <HomeDirectory
        title={site.heroTitle || site.tagline || site.name}
        subtitle={site.heroSubtitle}
        kicker={kicker}
        tools={cards}
        categories={cats}
      >
        {posts.length > 0 && (
          <section className="mt-14" aria-label="Latest from the blog">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Latest from the blog</h2>
              <Link href="/blog" className="text-sm font-medium text-primary-text hover:underline">
                All posts →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} compact />
              ))}
            </div>
          </section>
        )}
      </HomeDirectory>
    </>
  )
}
