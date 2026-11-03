import type { Metadata } from 'next'

import type { Site } from '@/payload-types'

import { absoluteUrl, mediaAbsoluteUrl } from './site'

type MetaInput = {
  site: Site
  path: string
  title?: string | null
  description?: string | null
  image?: unknown
  type?: 'website' | 'article'
  publishedTime?: string | null
  modifiedTime?: string | null
}

/** Canonical + OpenGraph + Twitter metadata for a page on a given site. */
export const buildMetadata = ({ site, path, title, description, image, type = 'website', publishedTime, modifiedTime }: MetaInput): Metadata => {
  const url = absoluteUrl(site, path)
  const desc = description || site.seo?.description || site.tagline || undefined
  const img = mediaAbsoluteUrl(site, image, 'og') || mediaAbsoluteUrl(site, site.seo?.ogImage, 'og')
  const siteTitle = site.seo?.title || site.name
  return {
    ...(title ? { title } : {}),
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      siteName: site.name,
      title: title ? `${title} | ${siteTitle}` : siteTitle,
      description: desc,
      ...(img ? { images: [{ url: img, width: 1200, height: 630 }] } : {}),
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
      ...(type === 'article' && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: img ? 'summary_large_image' : 'summary',
      title: title ? `${title} | ${siteTitle}` : siteTitle,
      description: desc,
      ...(site.seo?.twitterHandle ? { site: site.seo.twitterHandle } : {}),
      ...(img ? { images: [img] } : {}),
    },
  }
}
