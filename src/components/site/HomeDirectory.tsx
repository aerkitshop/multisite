'use client'

import React, { useEffect, useMemo, useState } from 'react'

import type { PublicToolCard } from '@/lib/data'
import { cn } from '@/utilities/ui'

import { ToolCard } from './ToolCard'

type Cat = { slug: string; name: string; icon?: string | null; count: number }

const PAGE = 24

/**
 * The whole homepage directory: compact hero (H1 + subtitle + search), one row of
 * category chips and the tool grid. Everything filters in place; the state is
 * mirrored to ?category= / ?q= so a filtered view can be shared.
 */
export const HomeDirectory: React.FC<{
  title: string
  subtitle?: string | null
  tools: PublicToolCard[]
  categories: Cat[]
}> = ({ title, subtitle, tools, categories }) => {
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

  const chip = (active: boolean) =>
    cn(
      'shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition',
      active ? 'border-primary bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground',
    )

  return (
    <>
      <section className="container pb-5 pt-8 text-center md:pt-10">
        <h1 className="mx-auto max-w-3xl text-2xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">{subtitle}</p>}
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

      <section id="directory" aria-label="Tool directory" className="container">
        <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:justify-center md:px-0">
          <button type="button" aria-pressed={!cat} onClick={() => setCat(null)} className={chip(!cat)}>
            All <span className="opacity-70">{tools.length}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              aria-pressed={cat === c.slug}
              onClick={() => setCat(cat === c.slug ? null : c.slug)}
              className={chip(cat === c.slug)}
            >
              {c.icon ? `${c.icon} ` : ''}
              {c.name} <span className="opacity-70">{c.count}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No tools match your search.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </section>
    </>
  )
}
