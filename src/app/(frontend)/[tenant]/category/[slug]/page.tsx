import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { CategoryIcon } from '@/components/site/CategoryIcon'
import { ToolDirectory } from '@/components/site/ToolDirectory'
import { getCategories, getTools, toToolCard } from '@/lib/data'
import { buildMetadata } from '@/lib/meta'
import { getSiteByDomain } from '@/lib/site'

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
  const cat = (await getCategories(site.id)).find((c) => c.slug === slug)
  if (!cat) return {}
  return buildMetadata({ site, path: `/category/${cat.slug}`, title: `Best ${cat.name} tools`, description: cat.description })
}

export default async function CategoryPage({ params }: Props) {
  const { tenant, slug } = await params
  const site = await getSiteByDomain(tenant)
  if (!site) notFound()
  const [categories, tools] = await Promise.all([getCategories(site.id), getTools(site.id)])
  const cat = categories.find((c) => c.slug === slug)
  if (!cat) notFound()
  const cards = tools.map(toToolCard)
  const cats = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    count: cards.filter((t) => t.categories.some((x) => x.slug === c.slug)).length,
  }))
  return (
    <div className="container py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link> / <span className="text-foreground">{cat.name}</span>
      </nav>
      <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight md:text-4xl">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-card text-primary-text shadow-sm">
          <CategoryIcon icon={cat.icon} className="h-5 w-5" />
        </span>
        Best {cat.name} tools
      </h1>
      {cat.description && <p className="mt-3 max-w-2xl text-muted-foreground">{cat.description}</p>}
      <div className="mt-10">
        <ToolDirectory tools={cards} categories={cats} initialCategory={cat.slug} from={`/category/${cat.slug}`} />
      </div>
    </div>
  )
}
