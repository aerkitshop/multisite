import Link from 'next/link'
import React from 'react'

import type { PublicToolCard } from '@/lib/data'
import { cn } from '@/utilities/ui'

import { OutboundLink } from './OutboundLink'
import { PricingBadge } from './PricingBadge'
import { ToolLogo } from './ToolLogo'

/**
 * Directory card (bestdirectories-style): logo, name + "Featured" pill, category badges,
 * two-line description, "# tags", then pricing badge and a "Visit" button. Featured cards
 * get a warm tint. The card body links to /tools/<slug>; the Visit button goes through
 * /go/<slug> (never the affiliate URL itself).
 */
export const ToolCard: React.FC<{ tool: PublicToolCard; from?: string }> = ({ tool, from }) => (
  <article
    className={cn(
      'group relative flex h-full flex-col rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md',
      tool.featured
        ? 'border-amber-300/80 bg-amber-50/60 hover:border-amber-400 dark:border-amber-400/30 dark:bg-amber-400/[0.06] dark:hover:border-amber-400/60'
        : 'bg-card hover:border-primary/50',
    )}
  >
    <div className="flex items-start gap-3">
      <ToolLogo src={tool.logoUrl} name={tool.name} size={44} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 pt-0.5 text-[15px] font-semibold leading-tight">
            <Link href={`/tools/${tool.slug}`} className="block truncate after:absolute after:inset-0 after:rounded-xl">
              {tool.name}
            </Link>
          </h3>
          {tool.featured && (
            <span className="shrink-0 rounded-md bg-amber-500 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
              <span aria-hidden>★ </span>Featured
            </span>
          )}
        </div>
        {tool.categories.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {tool.categories.slice(0, 2).map((c) => (
              <span key={c.slug} className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground/75">
                {c.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{tool.shortDescription}</p>
    {tool.tags.length > 0 && (
      <div className="mt-2 flex h-4 flex-wrap gap-x-2.5 overflow-hidden text-xs text-muted-foreground/80">
        {tool.tags.slice(0, 3).map((t) => (
          <span key={t} className="whitespace-nowrap">
            <span aria-hidden className="opacity-60"># </span>
            {t}
          </span>
        ))}
      </div>
    )}
    <div className="mt-auto flex items-center justify-between gap-2 pt-4">
      <PricingBadge model={tool.pricingModel} />
      <OutboundLink
        slug={tool.slug}
        from={from}
        title={`Visit ${tool.name}`}
        className="relative z-10 ml-auto inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
      >
        Visit ↗
      </OutboundLink>
    </div>
  </article>
)
