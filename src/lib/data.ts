/**
 * Public data access for the frontend.
 *
 * - Every query runs with `overrideAccess: false` and no user, i.e. exactly
 *   what an anonymous visitor may read: drafts are excluded and private
 *   affiliate fields are stripped by field-level access.
 * - Every query is cached with the tag `site:<id>`; the afterChange hooks
 *   call revalidateTag(site:<id>) so ISR pages refresh on publish.
 */
import { unstable_cache } from 'next/cache'

import type { Category, Footer, Header, Page, Post, Tool } from '@/payload-types'

import { siteTag } from './cacheTags'
import { getPayloadClient } from './site'

type ID = number | string

const cached = <A extends unknown[], R>(name: string, siteId: ID, fn: (...args: A) => Promise<R>) =>
  unstable_cache(fn, [name, String(siteId)], { tags: [siteTag(siteId)], revalidate: 3600 })

const pub = { overrideAccess: false } as const

export const getCategories = (siteId: ID) =>
  cached('categories', siteId, async (): Promise<Category[]> => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'categories',
      where: { tenant: { equals: siteId } },
      sort: ['order', 'name'],
      limit: 200,
      depth: 0,
      ...pub,
    })
    return res.docs
  })()

export const getTools = (siteId: ID) =>
  cached('tools', siteId, async (): Promise<Tool[]> => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'tools',
      where: { tenant: { equals: siteId } },
      sort: ['-featured', 'sortOrder', 'name'],
      limit: 1000,
      depth: 1,
      select: {
        name: true,
        slug: true,
        tagline: true,
        shortDescription: true,
        bestFor: true,
        logo: true,
        cover: true,
        pricingModel: true,
        startingPrice: true,
        pricingSummary: true,
        categories: true,
        tags: true,
        featured: true,
        updatedAt: true,
        createdAt: true,
      },
      ...pub,
    })
    return res.docs as Tool[]
  })()

export const getTool = (siteId: ID, slug: string) =>
  cached('tool', siteId, async (s: string): Promise<Tool | null> => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'tools',
      where: { and: [{ tenant: { equals: siteId } }, { slug: { equals: s } }] },
      limit: 1,
      depth: 1,
      ...pub,
    })
    return res.docs[0] ?? null
  })(slug)

export const getPosts = (siteId: ID, opts: { limit?: number; toolId?: ID } = {}) =>
  cached('posts', siteId, async (limit: number, toolId: ID | null): Promise<Post[]> => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'posts',
      where: {
        and: [
          { tenant: { equals: siteId } },
          { _status: { equals: 'published' } },
          ...(toolId ? [{ relatedTools: { contains: toolId } }] : []),
        ],
      },
      sort: '-publishedAt',
      limit,
      depth: 1,
      select: { title: true, slug: true, type: true, excerpt: true, heroImage: true, publishedAt: true, updatedAt: true },
      ...pub,
    })
    return res.docs as Post[]
  })(opts.limit ?? 50, opts.toolId ?? null)

export const getPost = (siteId: ID, slug: string) =>
  cached('post', siteId, async (s: string): Promise<Post | null> => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'posts',
      where: {
        and: [{ tenant: { equals: siteId } }, { slug: { equals: s } }, { _status: { equals: 'published' } }],
      },
      limit: 1,
      depth: 2,
      ...pub,
    })
    return res.docs[0] ?? null
  })(slug)

export const getPage = (siteId: ID, slug: string) =>
  cached('page', siteId, async (s: string): Promise<Page | null> => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'pages',
      where: { and: [{ tenant: { equals: siteId } }, { slug: { equals: s } }] },
      limit: 1,
      depth: 1,
      ...pub,
    })
    return res.docs[0] ?? null
  })(slug)

export const getPages = (siteId: ID) =>
  cached('pages', siteId, async (): Promise<Page[]> => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'pages',
      where: { tenant: { equals: siteId } },
      limit: 100,
      depth: 0,
      select: { slug: true, title: true, updatedAt: true },
      ...pub,
    })
    return res.docs as Page[]
  })()

export const getHeader = (siteId: ID) =>
  cached('header', siteId, async (): Promise<Header | null> => {
    const payload = await getPayloadClient()
    const res = await payload.find({ collection: 'header', where: { tenant: { equals: siteId } }, limit: 1, depth: 0, ...pub })
    return res.docs[0] ?? null
  })()

export const getFooter = (siteId: ID) =>
  cached('footer', siteId, async (): Promise<Footer | null> => {
    const payload = await getPayloadClient()
    const res = await payload.find({ collection: 'footer', where: { tenant: { equals: siteId } }, limit: 1, depth: 0, ...pub })
    return res.docs[0] ?? null
  })()

/** Minimal, serialisable tool shape safe to hand to client components. */
export type PublicToolCard = {
  id: ID
  name: string
  slug: string
  tagline: string | null
  shortDescription: string | null
  bestFor: string | null
  logoUrl: string | null
  coverUrl: string | null
  coverAlt: string | null
  pricingModel: string | null
  startingPrice: string | null
  pricingSummary: string | null
  featured: boolean
  categories: { slug: string; name: string }[]
  tags: string[]
  createdAt: string | null
  updatedAt: string | null
}

export const toToolCard = (t: Tool): PublicToolCard => {
  const logo = t.logo && typeof t.logo === 'object' ? t.logo : null
  const cover = t.cover && typeof t.cover === 'object' ? t.cover : null
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    tagline: t.tagline ?? null,
    shortDescription: t.shortDescription ?? null,
    bestFor: t.bestFor ?? null,
    logoUrl: logo ? logo.sizes?.thumbnail?.url || logo.url || null : null,
    coverUrl: cover ? cover.sizes?.large?.url || cover.url || null : null,
    coverAlt: cover?.alt ?? null,
    pricingModel: t.pricingModel ?? null,
    startingPrice: t.startingPrice ?? null,
    pricingSummary: t.pricingSummary ?? null,
    featured: Boolean(t.featured),
    categories: (t.categories || [])
      .filter((c): c is Category => typeof c === 'object' && c !== null)
      .map((c) => ({ slug: c.slug, name: c.name })),
    tags: (t.tags || []).filter(Boolean) as string[],
    createdAt: t.createdAt ?? null,
    updatedAt: t.updatedAt ?? null,
  }
}
