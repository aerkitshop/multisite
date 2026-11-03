import { getCategories, getPages, getPosts, getTools } from '@/lib/data'
import { absoluteUrl, getSiteByDomain } from '@/lib/site'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const site = await getSiteByDomain((await params).tenant)
  if (!site) return new Response('Unknown site', { status: 404 })
  const [tools, categories, posts, pages] = await Promise.all([
    getTools(site.id),
    getCategories(site.id),
    getPosts(site.id, { limit: 5000 }),
    getPages(site.id),
  ])
  const staticSlugs = new Set(['about', 'disclosure', 'privacy', ...pages.map((p) => p.slug)])
  const entries: { loc: string; lastmod?: string | null }[] = [
    { loc: absoluteUrl(site, '/'), lastmod: site.updatedAt },
    { loc: absoluteUrl(site, '/blog') },
    ...tools.map((t) => ({ loc: absoluteUrl(site, `/tools/${t.slug}`), lastmod: t.updatedAt })),
    ...categories.map((c) => ({ loc: absoluteUrl(site, `/category/${c.slug}`), lastmod: c.updatedAt })),
    ...posts.map((p) => ({ loc: absoluteUrl(site, `/blog/${p.slug}`), lastmod: p.updatedAt })),
    ...[...staticSlugs].map((s) => ({ loc: absoluteUrl(site, `/${s}`) })),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((e) => `  <url><loc>${esc(e.loc)}</loc>${e.lastmod ? `<lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : ''}</url>`)
  .join('\n')}
</urlset>`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=600, s-maxage=3600' },
  })
}
