import Link from 'next/link'
import React from 'react'

import type { Footer, Site } from '@/payload-types'

export const SiteFooter: React.FC<{ site: Site; footer: Footer | null }> = ({ site, footer }) => {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-24 border-t bg-muted/30">
      <div className="container grid gap-10 py-12 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
            {site.name}
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{footer?.about || site.tagline}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Explore</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/#directory" className="hover:text-foreground">All tools</Link></li>
            <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
            {(footer?.navItems || []).map((n, i) => (
              <li key={i}>
                <Link href={n.url} className="hover:text-foreground" {...(n.newTab ? { target: '_blank', rel: 'noopener' } : {})}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Company</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-foreground">About</Link></li>
            <li><Link href="/disclosure" className="hover:text-foreground">Affiliate disclosure</Link></li>
            <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
            <li><a href="/sitemap.xml" className="hover:text-foreground">Sitemap</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        {footer?.copyright || `© ${year} ${site.name}. All rights reserved.`}
      </div>
    </footer>
  )
}
