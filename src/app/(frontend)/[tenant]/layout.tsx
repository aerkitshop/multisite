import type { Metadata } from 'next'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { TenantFonts } from '@/components/TenantFonts'
import { TenantStyles } from '@/components/TenantStyles'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { getCategories, getFooter } from '@/lib/data'
import { absoluteUrl, getSiteByDomain, mediaUrl, siteBaseUrl } from '@/lib/site'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { cn } from '@/utilities/ui'

import './globals.css'

type Props = { children: React.ReactNode; params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  const site = await getSiteByDomain(tenant)
  if (!site) return { title: 'Site not found', robots: { index: false } }
  const title = site.seo?.title || site.name
  const favicon = mediaUrl(site.favicon, 'thumbnail')
  return {
    metadataBase: new URL(siteBaseUrl(site)),
    title: { default: title, template: `%s | ${title}` },
    description: site.seo?.description || site.tagline || undefined,
    alternates: { canonical: absoluteUrl(site, '/') },
    icons: favicon ? { icon: favicon } : { icon: '/favicon.svg' },
  }
}

export default async function TenantLayout({ children, params }: Props) {
  const { tenant } = await params
  const site = await getSiteByDomain(tenant)

  if (!site) {
    return (
      <html lang="en">
        <body style={{ fontFamily: 'system-ui', padding: 40 }}>
          <h1>No site is configured for this domain.</h1>
          <p>Add the hostname to a Site&apos;s &quot;domains&quot; list in the admin.</p>
        </body>
      </html>
    )
  }

  const [categories, footer] = await Promise.all([getCategories(site.id), getFooter(site.id)])
  const navCats = categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon }))

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <TenantFonts site={site} />
        <TenantStyles site={site} />
      </head>
      <body data-site={site.slug}>
        <Providers>
          <SiteHeader site={site} categories={navCats} />
          <main className="flex-1">{children}</main>
          <SiteFooter site={site} footer={footer} />
        </Providers>
      </body>
    </html>
  )
}
