/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { JsonLd } from '@/components/site/JsonLd'
import { OutboundLink } from '@/components/site/OutboundLink'
import { formatDate, postTypeLabel } from '@/components/site/PostCard'
import { PricingBadge } from '@/components/site/PricingBadge'
import { extractHeadings, RichText } from '@/components/site/RichText'
import { ToolLogo } from '@/components/site/ToolLogo'
import { getPost } from '@/lib/data'
import { buildMetadata } from '@/lib/meta'
import { absoluteUrl, getSiteByDomain, mediaAbsoluteUrl, mediaUrl } from '@/lib/site'
import type { Tool } from '@/payload-types'

export const revalidate = 3600
export const dynamicParams = true
export async function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ tenant: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, slug } = await params
  const site = await getSiteByDomain(tenant)
  if (!site) return {}
  const post = await getPost(site.id, slug)
  if (!post) return {}
  return buildMetadata({
    site,
    path: `/blog/${post.slug}`,
    title: post.meta?.title || post.title,
    description: post.meta?.description || post.excerpt,
    image: post.meta?.image || post.heroImage,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  })
}

export default async function PostPage({ params }: Props) {
  const { tenant, slug } = await params
  const site = await getSiteByDomain(tenant)
  if (!site) notFound()
  const post = await getPost(site.id, slug)
  if (!post) notFound()

  const path = `/blog/${post.slug}`
  const headings = extractHeadings(post.content)
  const tools = (post.relatedTools || []).filter((t): t is Tool => typeof t === 'object' && t !== null)
  const hero = mediaUrl(post.heroImage, 'large')
  const faq = post.faq || []

  const ld: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      articleSection: postTypeLabel[post.type] || post.type,
      ...(tools.length ? { about: tools.map((t) => ({ '@type': 'SoftwareApplication', name: t.name, url: absoluteUrl(site, `/tools/${t.slug}`) })) } : {}),
      headline: post.title,
      name: post.title,
      description: post.excerpt,
      image: mediaAbsoluteUrl(site, post.heroImage, 'og') || undefined,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      mainEntityOfPage: absoluteUrl(site, path),
      author: { '@type': 'Organization', name: site.name, url: absoluteUrl(site, '/') },
      publisher: { '@type': 'Organization', name: site.name, url: absoluteUrl(site, '/') },
    },
  ]
  if (faq.length > 0)
    ld.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    })

  return (
    <article className="container py-10">
      <JsonLd data={ld} />
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link> / <Link href="/blog" className="hover:text-foreground">Blog</Link>
      </nav>
      <header className="mx-auto max-w-3xl text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">{postTypeLabel[post.type] || post.type}</span>
          <time dateTime={post.publishedAt || undefined}>{formatDate(post.publishedAt)}</time>
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}
      </header>
      {hero && <img src={hero} alt="" className="mx-auto mt-10 aspect-[2/1] w-full max-w-5xl rounded-2xl border object-cover" />}

      <div className="mx-auto mt-12 grid max-w-6xl gap-10 lg:grid-cols-[220px_1fr_260px]">
        <aside className="hidden lg:block">
          {headings.length > 0 && (
            <nav className="sticky top-24 text-sm" aria-label="Table of contents">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</p>
              <ul className="space-y-2 border-l">
                {headings.map((h) => (
                  <li key={h.id} className={h.level === 3 ? 'pl-6' : 'pl-3'}>
                    <a href={`#${h.id}`} className="text-muted-foreground hover:text-primary">{h.text}</a>
                  </li>
                ))}
                {faq.length > 0 && (
                  <li className="pl-3"><a href="#faq" className="text-muted-foreground hover:text-primary">FAQ</a></li>
                )}
              </ul>
            </nav>
          )}
        </aside>

        <div className="min-w-0">
          <RichText data={post.content} />

          {faq.length > 0 && (
            <section id="faq" className="mt-12 scroll-mt-24">
              <h2 className="mb-4 text-2xl font-bold">Frequently asked questions</h2>
              <div className="divide-y rounded-2xl border">
                {faq.map((f, i) => (
                  <details key={f.id || i} className="group p-5" open={i === 0}>
                    <summary className="cursor-pointer list-none font-medium marker:hidden">
                      <span className="mr-2 text-primary group-open:rotate-45">+</span>
                      {f.q}
                    </summary>
                    <p className="mt-3 text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {post.sourceUrls && post.sourceUrls.length > 0 && (
            <section className="mt-10 text-sm">
              <h2 className="mb-2 font-semibold">Sources</h2>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {post.sourceUrls.map((s, i) => (
                  <li key={s.id || i}>
                    <a href={s.url} target="_blank" rel="nofollow noopener" className="hover:text-primary">{s.note || s.url}</a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {tools.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tools in this article</p>
              {tools.map((t) => (
                <div key={t.id} className="rounded-2xl border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <ToolLogo src={mediaUrl(t.logo, 'thumbnail')} name={t.name} size={40} />
                    <div className="min-w-0">
                      <Link href={`/tools/${t.slug}`} className="block truncate font-medium hover:text-primary">{t.name}</Link>
                      <PricingBadge model={t.pricingModel} />
                    </div>
                  </div>
                  <OutboundLink slug={t.slug} from={path} className="mt-3 block rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground hover:opacity-90">
                    Visit {t.name} ↗
                  </OutboundLink>
                </div>
              ))}
            </>
          )}
        </aside>
      </div>
    </article>
  )
}
