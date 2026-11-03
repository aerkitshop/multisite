import Link from 'next/link'
import React from 'react'

import type { PublicToolCard } from '@/lib/data'

import { OutboundLink } from './OutboundLink'
import { PricingBadge } from './PricingBadge'
import { ToolLogo } from './ToolLogo'

/**
 * Directory card (mkdirs-style): logo, name, category badge(s), one-line description,
 * a few tags and a "Visit" button. The card body links to /tools/<slug>; the Visit
 * button goes through /go/<slug> (never the affiliate URL itself).
 */
export const ToolCard: React.FC<{ tool: PublicToolCard; from?: string }> = ({ tool, from }) => (
  <article className="group relative flex h-full flex-col gap-3 rounded-xl border bg-card p-4 transition hover:border-primary/60 hover:shadow-md">
    <div className="flex items-start gap-3">
      <ToolLogo src={tool.logoUrl} name={tool.name} size={40} />
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-1.5 text-base font-semibold leading-tight">
          <Link href={`/tools/${tool.slug}`} className="truncate after:absolute after:inset-0">
            {tool.name}
          </Link>
          {tool.featured && (
            <span title="Featured" className="shrink-0 text-xs text-amber-500" aria-label="Featured">
              ★
            </span>
          )}
        </h3>
        <div className="mt-1 flex flex-wrap gap-1">
          {tool.categories.slice(0, 2).map((c) => (
            <span key={c.slug} className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary-text">
              {c.name}
            </span>
          ))}
        </div>
      </div>
    </div>
    <p className="line-clamp-2 text-sm text-muted-foreground">{tool.shortDescription}</p>
    {tool.tags.length > 0 && (
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground/80">
        {tool.tags.slice(0, 3).map((t) => (
          <span key={t}>#{t}</span>
        ))}
      </div>
    )}
    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
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
