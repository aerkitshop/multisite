import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { RichText } from '@/components/site/RichText'
import { getPage } from '@/lib/data'
import { buildMetadata } from '@/lib/meta'
import { getSiteByDomain } from '@/lib/site'
import type { Site } from '@/payload-types'

export const revalidate = 3600
export const dynamicParams = true
export async function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ tenant: string; slug: string }> }

/** Built-in fallbacks so every site always has About / Disclosure / Privacy. */
const fallbacks: Record<string, (site: Site) => { title: string; body: string[] }> = {
  about: (site) => ({
    title: `About ${site.name}`,
    body: [site.tagline || '', `${site.name} is an independent directory of tools, with hands-on reviews, comparisons and tutorials.`],
  }),
  disclosure: (site) => ({
    title: 'Affiliate disclosure',
    body: [
      site.affiliateDisclosure || '',
      'Our editorial choices are independent: a commission never decides whether a tool is listed or how it is rated.',
    ],
  }),
  privacy: (site) => ({
    title: 'Privacy policy',
    body: [
      `${site.name} does not offer accounts, comments or forms, and does not collect personal data directly.`,
      'When you click an outbound link we log the tool, the page you came from, your country (from our CDN) and your browser user agent to measure which recommendations are useful. No cookies are set for this.',
      site.contactEmail ? `Questions: ${site.contactEmail}` : '',
    ],
  }),
}

const resolve = async (tenant: string, slug: string) => {
  const site = await getSiteByDomain(tenant)
  if (!site) return null
  const page = await getPage(site.id, slug)
  if (page) return { site, title: page.title, page, fallback: null }
  const fb = fallbacks[slug]?.(site)
  if (fb) return { site, title: fb.title, page: null, fallback: fb }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, slug } = await params
  const r = await resolve(tenant, slug)
  if (!r) return {}
  return buildMetadata({ site: r.site, path: `/${slug}`, title: r.page?.meta?.title || r.title, description: r.page?.meta?.description })
}

export default async function StaticPage({ params }: Props) {
  const { tenant, slug } = await params
  const r = await resolve(tenant, slug)
  if (!r) notFound()
  return (
    <div className="container max-w-3xl py-14">
      <h1 className="mb-8 text-3xl font-bold md:text-4xl">{r.title}</h1>
      {r.page ? (
        <RichText data={r.page.content} />
      ) : (
        <div className="prose prose-neutral max-w-none dark:prose-invert">
          {r.fallback!.body.filter(Boolean).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
    </div>
  )
}
