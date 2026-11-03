import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { HomeDirectory } from '@/components/site/HomeDirectory'
import { JsonLd } from '@/components/site/JsonLd'
import { formatDate } from '@/components/site/PostCard'
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

/** Homepage = the directory itself (mkdirs demo style): short hero, category chips, tool grid. */
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
        tools={cards}
        categories={cats}
      />

      {posts.length > 0 && (
        <section className="container mt-12" aria-label="Latest posts">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Latest posts</h2>
            <Link href="/blog" className="text-sm font-medium text-primary-text hover:underline">
              All posts →
            </Link>
          </div>
          <ul className="grid gap-3 md:grid-cols-3">
            {posts.map((p) => (
              <li key={p.id} className="rounded-xl border bg-card p-4">
                <Link href={`/blog/${p.slug}`} className="line-clamp-2 font-medium leading-snug hover:text-primary-text">
                  {p.title}
                </Link>
                <time dateTime={p.publishedAt || undefined} className="mt-1 block text-xs text-muted-foreground">
                  {formatDate(p.publishedAt)}
                </time>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
