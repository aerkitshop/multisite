import Link from 'next/link'
import React from 'react'

import type { Footer, Site } from '@/payload-types'

/** One compact footer line: copyright + affiliate disclosure, and the legal/sitemap links. */
export const SiteFooter: React.FC<{ site: Site; footer: Footer | null }> = ({ site, footer }) => {
  const year = new Date().getFullYear()
  const disclosure =
    site.affiliateDisclosure || 'Some links on this site are affiliate links; we may earn a commission at no extra cost to you.'
  return (
    <footer className="mt-16 border-t">
      <div className="container flex flex-col gap-3 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p className="max-w-3xl">
          {footer?.copyright || `© ${year} ${site.name}.`} {disclosure}
        </p>
        <nav aria-label="Footer" className="flex shrink-0 flex-wrap gap-x-4 gap-y-1">
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/disclosure" className="hover:text-foreground">Disclosure</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <a href="/sitemap.xml" className="hover:text-foreground">Sitemap</a>
        </nav>
      </div>
    </footer>
  )
}
