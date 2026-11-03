'use client'

import React, { useEffect, useMemo, useState } from 'react'

import type { PublicToolCard } from '@/lib/data'
import { CategoryChips, CategorySidebar } from './CategoryNav'
import { ToolCard } from './ToolCard'

type Cat = { slug: string; name: string; icon?: string | null; count: number }

const PAGE = 24

/**
 * The whole homepage directory: compact hero (H1 + subtitle + search), then two columns:
 * a sticky category sidebar (lg+; a chip row on smaller screens) and the tool grid. Everything filters in place; the state is
 * mirrored to ?category= / ?q= so a filtered view can be shared.
 */
export const HomeDirectory: React.FC<{
  title: string
  subtitle?: string | null
  tools: PublicToolCard[]
  categories: Cat[]
  /** Rendered under the grid in the main column (e.g. the latest-posts strip). */
  children?: React.ReactNode
}> = ({ title, subtitle, tools, categories, children }) => {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string | null>(null)
  const [shown, setShown] = useState(PAGE)

  // Read initial filters from the URL (page itself is static/ISR, so do it on the client).
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const c = sp.get('category')
    if (c && categories.some((x) => x.slug === c)) setCat(c)
    const qq = sp.get('q')
    if (qq) setQ(qq)
  }, [categories])

  // Mirror filters to the URL without navigation.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (cat) url.searchParams.set('category', cat)
    else url.searchParams.delete('category')
    if (q.trim()) url.searchParams.set('q', q.trim())
    else url.searchParams.delete('q')
    if (url.href !== window.location.href) window.history.replaceState(null, '', url.href)
  }, [cat, q])

  useEffect(() => setShown(PAGE), [cat, q])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return tools.filter((t) => {
      if (cat && !t.categories.some((c) => c.slug === cat)) return false
      if (!needle) return true
      return [t.name, t.shortDescription, ...t.tags, ...t.categories.map((c) => c.name)]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(needle))
    })
  }, [tools, q, cat])

  return (
    <>
      <section className="container pb-6 pt-7 text-center md:pb-8 md:pt-10">
        <h1 className="mx-auto max-w-3xl text-2xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-2 max-w-4xl text-sm text-muted-foreground md:text-base">{subtitle}</p>}
        <form role="search" className="mx-auto mt-5 max-w-xl" onSubmit={(e) => e.preventDefault()}>
          <label className="relative block">
            <span className="sr-only">Search tools</span>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${tools.length} tools…`}
              className="h-11 w-full rounded-full border bg-background pl-10 pr-4 text-sm shadow-sm outline-none ring-primary/40 focus:ring-2"
            />
          </label>
        </form>
      </section>

      <section id="directory" aria-label="Tool directory" className="container lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <CategorySidebar categories={categories} total={tools.length} active={cat} onSelect={setCat} />

        <div className="min-w-0">
          <CategoryChips categories={categories} total={tools.length} active={cat} onSelect={setCat} />

          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No tools match your search.</p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.slice(0, shown).map((t) => (
                  <ToolCard key={t.id} tool={t} from="home" />
                ))}
              </div>
              {filtered.length > shown && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setShown((n) => n + PAGE)}
                    className="rounded-full border px-5 py-2 text-sm font-medium hover:border-primary hover:text-primary-text"
                  >
                    Load more ({filtered.length - shown})
                  </button>
                </div>
              )}
            </>
          )}
          {children}
        </div>
      </section>
    </>
  )
}
