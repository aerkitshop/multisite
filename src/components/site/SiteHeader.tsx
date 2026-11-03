/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import React from 'react'

import type { Header, Site } from '@/payload-types'
import { mediaUrl } from '@/lib/site'

import { ThemeToggle } from './ThemeToggle'

const defaultNav = [
  { label: 'Tools', url: '/#directory' },
  { label: 'Blog', url: '/blog' },
  { label: 'About', url: '/about' },
]

export const SiteHeader: React.FC<{ site: Site; header: Header | null }> = ({ site, header }) => {
  const nav = header?.navItems?.length ? header.navItems : defaultNav
  const logo = mediaUrl(site.logo, 'thumbnail')
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {logo ? (
            <img src={logo} alt="" width={32} height={32} className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              {site.name.slice(0, 1)}
            </span>
          )}
          <span className="text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
            {site.name}
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {nav.map((item, i) => (
            <Link
              key={i}
              href={item.url}
              {...('newTab' in item && item.newTab ? { target: '_blank', rel: 'noopener' } : {})}
              className="hidden rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground sm:block"
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
