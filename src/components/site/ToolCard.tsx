import Link from 'next/link'
import React from 'react'

import type { PublicToolCard } from '@/lib/data'

import { OutboundLink } from './OutboundLink'
import { PricingBadge } from './PricingBadge'
import { ToolLogo } from './ToolLogo'

export const ToolCard: React.FC<{ tool: PublicToolCard; from?: string }> = ({ tool, from }) => (
  <article className="group relative flex flex-col gap-3 rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg">
    <div className="flex items-start gap-3">
      <ToolLogo src={tool.logoUrl} name={tool.name} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold">
          <Link href={`/tools/${tool.slug}`} className="after:absolute after:inset-0">
            {tool.name}
          </Link>
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <PricingBadge model={tool.pricingModel} />
          {tool.featured && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Featured</span>
          )}
        </div>
      </div>
    </div>
    <p className="line-clamp-2 text-sm text-muted-foreground">{tool.shortDescription}</p>
    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
      <div className="flex flex-wrap gap-1.5">
        {tool.categories.slice(0, 2).map((c) => (
          <span key={c.slug} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {c.name}
          </span>
        ))}
      </div>
      <OutboundLink
        slug={tool.slug}
        from={from}
        title={`Visit ${tool.name}`}
        className="relative z-10 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
      >
        Visit ↗
      </OutboundLink>
    </div>
  </article>
)
