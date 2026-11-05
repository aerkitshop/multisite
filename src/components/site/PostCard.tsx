import Link from 'next/link'
import React from 'react'

import type { Post } from '@/payload-types'
import { mediaUrl } from '@/lib/site'
import { cn } from '@/utilities/ui'

import { CoverImage } from './CoverImage'

export const postTypeLabel: Record<string, string> = {
  review: 'Review',
  compare: 'Comparison',
  best: 'Best of',
  tutorial: 'Tutorial',
  news: 'News',
}

export const formatDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''

/** Blog card with a 16:9 cover. `compact` = smaller title, no excerpt (homepage strip / sidebars). */
export const PostCard: React.FC<{ post: Post; compact?: boolean; priority?: boolean; className?: string }> = ({
  post,
  compact,
  priority,
  className,
}) => {
  const img = mediaUrl(post.heroImage, 'card') || mediaUrl(post.heroImage)
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(16,24,40,0.25)]',
        className,
      )}
    >
      <CoverImage
        src={img}
        alt=""
        sizes={compact ? '(min-width: 1024px) 300px, (min-width: 768px) 33vw, 100vw' : '(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw'}
        priority={priority}
        fallbackLabel={postTypeLabel[post.type] || undefined}
        imgClassName="transition duration-500 group-hover:scale-[1.03]"
      />
      <div className={cn('flex flex-1 flex-col', compact ? 'gap-1.5 p-4' : 'gap-2 p-5')}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary-text">{postTypeLabel[post.type] || post.type}</span>
          <time dateTime={post.publishedAt || undefined}>{formatDate(post.publishedAt)}</time>
        </div>
        <h3 className={cn('font-semibold leading-snug tracking-tight', compact ? 'line-clamp-2 text-[15px]' : 'text-lg')}>
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-primary-text">
            {post.title}
          </Link>
        </h3>
        {!compact && post.excerpt && <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>}
      </div>
    </article>
  )
}
