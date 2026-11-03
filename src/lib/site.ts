import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type { Media, Site } from '@/payload-types'

export const getPayloadClient = () => getPayload({ config: configPromise })

/** "WWW.Example.com:443" -> "www.example.com" */
export const normalizeHost = (host: string | null | undefined): string =>
  decodeURIComponent(host || '')
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '')
    .replace(/\.$/, '')

const findSite = async (domain: string): Promise<Site | null> => {
  const payload = await getPayloadClient()
  const candidates = [domain]
  if (domain.startsWith('www.')) candidates.push(domain.slice(4))
  else candidates.push(`www.${domain}`)
  for (const d of candidates) {
    const res = await payload.find({
      collection: 'sites',
      where: { 'domains.domain': { equals: d } },
      depth: 1,
      limit: 1,
      overrideAccess: false,
    })
    if (res.docs[0]) return res.docs[0]
  }
  return null
}

/** Resolve the tenant from the hostname (the `[tenant]` route param set by the Host rewrite). */
export const getSiteByDomain = async (rawDomain: string): Promise<Site | null> => {
  const domain = normalizeHost(rawDomain)
  if (!domain) return null
  return unstable_cache(() => findSite(domain), ['site-by-domain', domain], {
    tags: ['sites'],
    revalidate: 3600,
  })()
}

export const siteBaseUrl = (site: Pick<Site, 'primaryDomain' | 'domains' | 'useHttps'>): string => {
  const host = site.primaryDomain || site.domains?.[0]?.domain || 'localhost:3000'
  return `${site.useHttps === false ? 'http' : 'https'}://${host}`
}

export const absoluteUrl = (site: Site, path = '/') =>
  `${siteBaseUrl(site)}${path.startsWith('/') ? path : `/${path}`}`

export const mediaUrl = (m: unknown, size?: 'thumbnail' | 'card' | 'large' | 'og'): string | null => {
  if (!m || typeof m !== 'object') return null
  const media = m as Media
  const sized = size ? media.sizes?.[size]?.url : null
  return sized || media.url || null
}

export const mediaAbsoluteUrl = (site: Site, m: unknown, size?: 'thumbnail' | 'card' | 'large' | 'og') => {
  const u = mediaUrl(m, size)
  if (!u) return null
  return u.startsWith('http') ? u : absoluteUrl(site, u)
}
