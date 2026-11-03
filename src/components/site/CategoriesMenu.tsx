'use client'

import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

type Cat = { slug: string; name: string; icon?: string | null }

/** Small "Categories" dropdown in the header; closes on outside click, Escape or selection. */
export const CategoriesMenu: React.FC<{ categories: Cat[]; className?: string }> = ({ categories, className }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!categories.length) return null
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)} className={className}>
        Categories <span aria-hidden className="hidden text-xs sm:inline">▾</span>
      </button>
      {open && (
        <ul role="menu" className="absolute right-0 top-full z-50 mt-1 min-w-52 rounded-xl border bg-popover p-1 text-sm shadow-lg">
          {categories.map((c) => (
            <li key={c.slug} role="none">
              <Link
                role="menuitem"
                href={`/category/${c.slug}`}
                onClick={() => setOpen(false)}
                className="block whitespace-nowrap rounded-lg px-3 py-2 text-popover-foreground hover:bg-muted"
              >
                {c.icon ? `${c.icon} ` : ''}
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
