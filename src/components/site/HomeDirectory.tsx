'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { ToolLogo } from './ToolLogo'

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
  /** e.g. "Updated Nov 2026 · 6 tools hand-tested" */
  kicker?: string | null
  tools: PublicToolCard[]
  categories: Cat[]
  /** Rendered under the grid in the main column (e.g. the latest-posts strip). */
  children?: React.ReactNode
}> = ({ title, subtitle, kicker, tools, categories, children }) => {
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

  const activeName = cat ? categories.find((c) => c.slug === cat)?.name : null
  const logos = tools.filter((t) => t.logoUrl).slice(0, 8)

  return (
    <>
      <section className="relative isolate overflow-hidden border-b">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.055)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.055)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_75%_70%_at_50%_0%,#000_35%,transparent_100%)]" />
          <div className="absolute left-1/2 top-[-14rem] h-[30rem] w-[min(68rem,140vw)] -translate-x-1/2 rounded-full bg-primary/[0.16] blur-3xl dark:bg-primary/25" />
          <div className="absolute right-[8%] top-[4rem] h-56 w-56 rounded-full bg-[hsl(var(--brand-accent)/0.12)] blur-3xl" />
        </div>
        <div className="container pb-10 pt-10 text-center md:pb-14 md:pt-16">
          {kicker && (
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {kicker}
            </p>
          )}
          <h1 className="mx-auto mt-5 max-w-3xl text-balance text-[1.85rem] font-bold leading-[1.12] tracking-tight sm:text-4xl md:text-5xl md:leading-[1.08]">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground md:text-lg">{subtitle}</p>
          )}
          <form role="search" className="mx-auto mt-7 max-w-xl" onSubmit={(e) => e.preventDefault()}>
            <label className="relative block">
              <span className="sr-only">Search tools</span>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${tools.length} tools by name or use case…`}
                className="h-12 w-full rounded-xl border bg-background pl-11 pr-4 text-[15px] shadow-[0_8px_30px_-12px_rgba(16,24,40,0.25)] outline-none ring-primary/30 transition placeholder:text-muted-foreground/80 focus:border-primary/50 focus:ring-4"
              />
            </label>
          </form>
          {logos.length > 0 && (
            <div className="mt-7 flex flex-col items-center gap-2.5 sm:flex-row sm:justify-center">
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">In the directory</span>
              <ul className="flex items-center gap-2">
                {logos.map((t) => (
                  <li key={t.id} title={t.name}>
                    <ToolLogo src={t.logoUrl} name={t.name} size={30} priority />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section id="directory" aria-label="Tool directory" className="container pt-8 md:pt-10 lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <CategorySidebar categories={categories} total={tools.length} active={cat} onSelect={setCat} />

        <div className="min-w-0">
          <CategoryChips categories={categories} total={tools.length} active={cat} onSelect={setCat} />

          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-tight">
              {activeName || 'All tools'} <span className="ml-1 font-normal text-muted-foreground">{filtered.length}</span>
            </h2>
            <p className="hidden text-xs text-muted-foreground sm:block">Featured first · pricing checked on vendor sites</p>
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No tools match your search.</p>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.slice(0, shown).map((t, i) => (
                  <ToolCard key={t.id} tool={t} from="home" priority={i < 3} />
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
