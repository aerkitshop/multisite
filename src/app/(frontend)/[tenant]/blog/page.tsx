import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { CoverImage } from '@/components/site/CoverImage'
import { PostCard, formatDate, postTypeLabel } from '@/components/site/PostCard'
import { getPosts } from '@/lib/data'
import { buildMetadata } from '@/lib/meta'
import { getSiteByDomain, mediaUrl } from '@/lib/site'

export const revalidate = 3600
export const dynamicParams = true
export async function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSiteByDomain((await params).tenant)
  if (!site) return {}
  return buildMetadata({ site, path: '/blog', title: 'Blog', description: `Reviews, comparisons and tutorials from ${site.name}.` })
}

export default async function BlogPage({ params }: Props) {
  const site = await getSiteByDomain((await params).tenant)
  if (!site) notFound()
  const posts = await getPosts(site.id, { limit: 100 })
  const [lead, ...rest] = posts
  return (
    <div className="container py-10 md:py-14">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary-text">The {site.name} blog</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Reviews, comparisons & how-tos</h1>
        <p className="mt-3 text-muted-foreground">Hands-on reviews, head-to-head comparisons and step-by-step guides - with pricing checked against each vendor’s site.</p>
      </header>
      {posts.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No posts yet.</p>
      ) : (
        <>
          <Link
            href={`/blog/${lead.slug}`}
            className="group mt-10 grid overflow-hidden rounded-3xl border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:shadow-[0_16px_40px_-20px_rgba(16,24,40,0.3)] md:grid-cols-[1.25fr_1fr]"
          >
            <CoverImage
              src={mediaUrl(lead.heroImage, 'large') || mediaUrl(lead.heroImage)}
              alt=""
              priority
              sizes="(min-width: 1024px) 700px, 100vw"
              className="md:aspect-auto md:h-full md:min-h-[320px]"
              imgClassName="transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="flex flex-col justify-center gap-3 p-6 md:p-10">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary-text">{postTypeLabel[lead.type] || lead.type}</span>
                <time dateTime={lead.publishedAt || undefined}>{formatDate(lead.publishedAt)}</time>
              </div>
              <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight group-hover:text-primary-text md:text-3xl">{lead.title}</h2>
              {lead.excerpt && <p className="text-muted-foreground">{lead.excerpt}</p>}
              <span className="mt-1 text-sm font-semibold text-primary-text">Read the article →</span>
            </div>
          </Link>
          {rest.length > 0 && (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
