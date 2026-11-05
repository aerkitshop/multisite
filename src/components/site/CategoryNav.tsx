'use client'

import Link from 'next/link'
import React from 'react'

import { cn } from '@/utilities/ui'

import { CategoryIcon } from './CategoryIcon'

export type NavCat = { slug: string; name: string; icon?: string | null; count: number }

type Props = {
  categories: NavCat[]
  total: number
  /** Active category slug, null = "All". */
  active: string | null
  /** Filter in place (home). When omitted, items are links (category pages). */
  onSelect?: (slug: string | null) => void
  className?: string
}

const hrefFor = (slug: string | null) => (slug ? `/category/${slug}` : '/')

/** One sidebar / chip entry: a button when filtering in place, a link otherwise. */
const Item: React.FC<{
  slug: string | null
  active: boolean
  onSelect?: (slug: string | null) => void
  className: string
  children: React.ReactNode
}> = ({ slug, active, onSelect, className, children }) =>
  onSelect ? (
    <button type="button" aria-pressed={active} onClick={() => onSelect(slug)} className={className}>
      {children}
    </button>
  ) : (
    <Link href={hrefFor(slug)} aria-current={active ? 'page' : undefined} className={className}>
      {children}
    </Link>
  )

/**
 * Left column of the directory (desktop, lg+): a sticky boxed list with "All" + each
 * category (icon, name, count). Hidden below lg, where CategoryChips takes over.
 */
export const CategorySidebar: React.FC<Props> = ({ categories, total, active, onSelect, className }) => {
  const row = (on: boolean) =>
    cn(
      'group/item flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm leading-snug transition',
      on ? 'bg-primary/10 font-medium text-primary-text' : 'text-foreground/75 hover:bg-muted hover:text-foreground',
    )
  const count = (on: boolean) =>
    cn(
      'ml-auto shrink-0 rounded-full px-2 text-[11px] font-medium leading-5 tabular-nums',
      on ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
    )
  const iconBox = (on: boolean) =>
    cn(
      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition',
      on ? 'border-primary/30 bg-background text-primary-text' : 'bg-background text-muted-foreground group-hover/item:text-foreground',
    )
  return (
    <aside aria-label="Categories" className={cn('hidden lg:block', className)}>
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <nav className="space-y-0.5 rounded-2xl border bg-card p-2 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <h2 className="px-2.5 pb-2 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Categories</h2>
          <Item slug={null} active={!active} onSelect={onSelect} className={row(!active)}>
            <span className={iconBox(!active)}><CategoryIcon icon="all" /></span>
            <span className="min-w-0">All tools</span>
            <span className={count(!active)}>{total}</span>
          </Item>
          {categories.map((c) => {
            const on = active === c.slug
            return (
              <Item key={c.slug} slug={c.slug} active={on} onSelect={onSelect} className={row(on)}>
                <span className={iconBox(on)}><CategoryIcon icon={c.icon} /></span>
                <span className="min-w-0">{c.name}</span>
                <span className={count(on)}>{c.count}</span>
              </Item>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

/** Mobile/tablet (< lg): the same entries as one horizontally scrolling chip row. */
export const CategoryChips: React.FC<Props> = ({ categories, total, active, onSelect, className }) => {
  const chip = (on: boolean) =>
    cn(
      'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition',
      on ? 'border-primary bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground',
    )
  return (
    <div className={cn('-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden', className)}>
      <Item slug={null} active={!active} onSelect={onSelect} className={chip(!active)}>
        All <span className="opacity-70">{total}</span>
      </Item>
      {categories.map((c) => (
        <Item
          key={c.slug}
          slug={c.slug}
          active={active === c.slug}
          onSelect={onSelect && ((s) => onSelect(s === active ? null : s))}
          className={chip(active === c.slug)}
        >
          <CategoryIcon icon={c.icon} className="h-3.5 w-3.5" />
          {c.name} <span className="opacity-70">{c.count}</span>
        </Item>
      ))}
    </div>
  )
}
