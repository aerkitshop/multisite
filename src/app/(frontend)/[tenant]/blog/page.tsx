import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { PostCard } from '@/components/site/PostCard'
import { getPosts } from '@/lib/data'
import { buildMetadata } from '@/lib/meta'
import { getSiteByDomain } from '@/lib/site'

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
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold md:text-4xl">Blog</h1>
      <p className="mt-3 text-muted-foreground">Reviews, comparisons, best-of lists and tutorials.</p>
      {posts.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  )
}
