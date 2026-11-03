/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import React from 'react'

import type { Site } from '@/payload-types'
import { mediaUrl } from '@/lib/site'

import { CategoriesMenu } from './CategoriesMenu'
import { ThemeToggle } from './ThemeToggle'

type Cat = { slug: string; name: string; icon?: string | null }

const item = 'rounded-lg px-1.5 py-2 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground sm:px-3 sm:text-sm'

/** Slim header: logo + name, then Home / Categories / Blog / About and the theme toggle. Nothing else. */
export const SiteHeader: React.FC<{ site: Site; categories: Cat[] }> = ({ site, categories }) => {
  const logo = mediaUrl(site.logo, 'thumbnail')
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between gap-2">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold">
          {logo ? (
            <img src={logo} alt="" width={28} height={28} className="h-7 w-7 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
              {site.name.slice(0, 1)}
            </span>
          )}
          <span className="truncate" style={{ fontFamily: 'var(--font-heading)' }}>
            {site.name}
          </span>
        </Link>
        <nav className="flex shrink-0 items-center text-sm" aria-label="Main">
          <Link href="/" className={`hidden sm:block ${item}`}>
            Home
          </Link>
          <CategoriesMenu categories={categories} className={`flex items-center gap-1 ${item}`} />
          <Link href="/blog" className={item}>
            Blog
          </Link>
          <Link href="/about" className={item}>
            About
          </Link>
          <span className="ml-0.5 sm:ml-1">
            <ThemeToggle />
          </span>
        </nav>
      </div>
    </header>
  )
}
