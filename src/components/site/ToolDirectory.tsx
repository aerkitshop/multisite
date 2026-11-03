'use client'

import React, { useMemo, useState } from 'react'

import type { PublicToolCard } from '@/lib/data'
import { cn } from '@/utilities/ui'

import { CategoryChips, CategorySidebar } from './CategoryNav'
import { ToolCard } from './ToolCard'

type Cat = { slug: string; name: string; icon?: string | null; count: number }

/** Category page directory: category sidebar (links; chips on mobile) + search/pricing filter + grid. */
export const ToolDirectory: React.FC<{ tools: PublicToolCard[]; categories: Cat[]; initialCategory?: string; from?: string }> = ({
  tools,
  categories,
  initialCategory,
  from = '/',
}) => {
  const [q, setQ] = useState('')
  const cat = initialCategory ?? null
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
    <section id="directory" className="lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:items-start lg:gap-8">
      <CategorySidebar categories={categories} total={tools.length} active={cat} />

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
        <CategoryChips categories={categories} total={tools.length} active={cat} />
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
