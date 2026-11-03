'use client'

import React, { useMemo, useState } from 'react'

import type { PublicToolCard } from '@/lib/data'
import { cn } from '@/utilities/ui'

import { ToolCard } from './ToolCard'

type Cat = { slug: string; name: string; icon?: string | null; count: number }

/** Client-side search + category filter (mkdirs-style sidebar + chips). */
export const ToolDirectory: React.FC<{ tools: PublicToolCard[]; categories: Cat[]; initialCategory?: string; from?: string }> = ({
  tools,
  categories,
  initialCategory,
  from = '/',
}) => {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string | null>(initialCategory ?? null)
  const [pricing, setPricing] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return tools.filter((t) => {
      if (cat && !t.categories.some((c) => c.slug === cat)) return false
      if (pricing && t.pricingModel !== pricing) return false
      if (!needle) return true
      return [t.name, t.shortDescription, ...t.tags, ...t.categories.map((c) => c.name)]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(needle))
    })
  }, [tools, q, cat, pricing])

  const chip = (active: boolean) =>
    cn(
      'whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition',
      active ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:border-primary/60',
    )

  return (
    <section id="directory" className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-1">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</p>
          <button type="button" onClick={() => setCat(null)} className={cn('flex w-full justify-between rounded-lg px-3 py-2 text-left text-sm', !cat ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-muted')}>
            <span>All tools</span>
            <span className="text-muted-foreground">{tools.length}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCat(c.slug)}
              className={cn('flex w-full justify-between rounded-lg px-3 py-2 text-left text-sm', cat === c.slug ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-muted')}
            >
              <span>
                {c.icon ? `${c.icon} ` : ''}
                {c.name}
              </span>
              <span className="text-muted-foreground">{c.count}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search tools</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${tools.length} tools…`}
              className="h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none ring-primary/40 focus:ring-2"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto">
            {['free', 'freemium', 'trial', 'paid'].map((p) => (
              <button key={p} type="button" onClick={() => setPricing(pricing === p ? null : p)} className={chip(pricing === p)}>
                {p === 'trial' ? 'Free trial' : p[0].toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          <button type="button" onClick={() => setCat(null)} className={chip(!cat)}>
            All
          </button>
          {categories.map((c) => (
            <button key={c.slug} type="button" onClick={() => setCat(c.slug)} className={chip(cat === c.slug)}>
              {c.icon ? `${c.icon} ` : ''}
              {c.name}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No tools match your filters.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t) => (
              <ToolCard key={t.id} tool={t} from={from} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
