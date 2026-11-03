/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import React from 'react'

import type { Post } from '@/payload-types'
import { mediaUrl } from '@/lib/site'

export const postTypeLabel: Record<string, string> = {
  review: 'Review',
  compare: 'Comparison',
  best: 'Best of',
  tutorial: 'Tutorial',
  news: 'News',
}

export const formatDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const img = mediaUrl(post.heroImage, 'card')
  return (
    <article className="group relative overflow-hidden rounded-2xl border bg-card transition hover:shadow-lg">
      <div className="aspect-[16/9] overflow-hidden bg-muted">
        {img ? (
          <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 to-primary/5" />
        )}
      </div>
      <div className="space-y-2 p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
            {postTypeLabel[post.type] || post.type}
          </span>
          <time dateTime={post.publishedAt || undefined}>{formatDate(post.publishedAt)}</time>
        </div>
        <h3 className="text-lg font-semibold leading-snug">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>}
      </div>
    </article>
  )
}
