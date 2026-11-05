import Link from 'next/link'
import React from 'react'

import type { PublicToolCard } from '@/lib/data'
import { cn } from '@/utilities/ui'

import { CoverImage } from './CoverImage'
import { OutboundLink } from './OutboundLink'
import { PricingBadge } from './PricingBadge'
import { ToolLogo } from './ToolLogo'

/**
 * Directory card: 16:9 product cover, logo + name + main category, tagline, two-line description,
 * then pricing (model badge + starting price) and a "Visit" button. The card body links to
 * /tools/<slug>; the Visit button goes through /go/<slug> (never the affiliate URL itself).
 */
export const ToolCard: React.FC<{ tool: PublicToolCard; from?: string; priority?: boolean; className?: string }> = ({
  tool,
  from,
  priority,
  className,
}) => (
  <article
    className={cn(
      'group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition duration-200',
      'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_32px_-12px_rgba(16,24,40,0.25)] dark:hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)]',
      className,
    )}
  >
    <div className="relative p-1.5 pb-0">
      <CoverImage
        src={tool.coverUrl}
        alt={tool.coverAlt || `${tool.name} product image`}
        sizes="(min-width: 1280px) 320px, (min-width: 640px) 45vw, 100vw"
        priority={priority}
        fallbackLabel={tool.name}
        className="rounded-xl ring-1 ring-inset ring-black/5"
        imgClassName="transition duration-500 group-hover:scale-[1.03]"
      />
      {tool.featured && (
        <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-amber-700 shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-black/60 dark:text-amber-300 dark:ring-white/10">
          <svg aria-hidden viewBox="0 0 20 20" className="h-3 w-3 fill-current">
            <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
          </svg>
          Featured
        </span>
      )}
    </div>

    <div className="flex flex-1 flex-col p-4 pt-3.5">
      <div className="flex items-center gap-2.5">
        <ToolLogo src={tool.logoUrl} name={tool.name} size={34} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-tight tracking-tight">
            <Link href={`/tools/${tool.slug}`} className="block truncate after:absolute after:inset-0 after:rounded-2xl">
              {tool.name}
            </Link>
          </h3>
          {tool.categories[0] && <p className="mt-0.5 truncate text-xs text-muted-foreground">{tool.categories[0].name}</p>}
        </div>
      </div>

      {tool.tagline && <p className="mt-3 line-clamp-2 text-[14px] font-medium leading-snug text-foreground/90">{tool.tagline}</p>}
      {tool.shortDescription && (
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{tool.shortDescription}</p>
      )}

      <div className="mt-auto pt-4">
      <div className="flex items-center gap-2 border-t border-dashed pt-3.5">
        <PricingBadge model={tool.pricingModel} />
        {tool.startingPrice && <span className="truncate text-xs font-medium text-muted-foreground">{tool.startingPrice}</span>}
        <OutboundLink
          slug={tool.slug}
          from={from}
          title={`Visit ${tool.name}`}
          className="relative z-10 ml-auto inline-flex shrink-0 items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition hover:bg-primary hover:text-primary-foreground"
        >
          Visit
          <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M5 11L11 5M6 5h5v5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </OutboundLink>
      </div>
      </div>
    </div>
  </article>
)
