import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { JsonLd } from '@/components/site/JsonLd'
import { PostCard } from '@/components/site/PostCard'
import { ToolCard } from '@/components/site/ToolCard'
import { ToolDirectory } from '@/components/site/ToolDirectory'
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

export default async function HomePage({ params }: Props) {
  const site = await getSiteByDomain((await params).tenant)
  if (!site) notFound()

  const [tools, categories, posts] = await Promise.all([
    getTools(site.id),
    getCategories(site.id),
    getPosts(site.id, { limit: 3 }),
  ])
  const cards = tools.map(toToolCard)
  const featured = cards.filter((t) => t.featured).slice(0, 3)
  const cats = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    count: cards.filter((t) => t.categories.some((x) => x.slug === c.slug)).length,
  }))

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: site.name,
          url: absoluteUrl(site, '/'),
          description: site.seo?.description || site.tagline,
        }}
      />
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 0%, hsl(var(--primary) / 0.18), transparent 70%), radial-gradient(40% 40% at 90% 10%, hsl(var(--brand-accent) / 0.15), transparent 70%)',
          }}
        />
        <div className="container relative py-20 text-center md:py-28">
          <p className="mx-auto mb-4 inline-flex rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            {cards.length} hand-picked tools · updated regularly
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            {site.heroTitle || site.tagline || site.name}
          </h1>
          {site.heroSubtitle && (
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">{site.heroSubtitle}</p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {cats.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} className="rounded-full border bg-background px-4 py-2 text-sm hover:border-primary hover:text-primary">
                {c.icon ? `${c.icon} ` : ''}
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container py-14">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold">Featured tools</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((t) => (
              <ToolCard key={t.id} tool={t} from="/" />
            ))}
          </div>
        </section>
      )}

      <div className="container py-6">
        <h2 className="mb-6 text-2xl font-bold">Browse the directory</h2>
        <ToolDirectory tools={cards} categories={cats} />
      </div>

      {posts.length > 0 && (
        <section className="container py-14">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold">Latest guides & reviews</h2>
            <Link href="/blog" className="text-sm font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
