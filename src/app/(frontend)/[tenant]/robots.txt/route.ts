import { absoluteUrl, getSiteByDomain } from '@/lib/site'

export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const site = await getSiteByDomain((await params).tenant)
  if (!site) return new Response('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain' } })
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /go/',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    `Sitemap: ${absoluteUrl(site, '/sitemap.xml')}`,
    '',
  ].join('\n')
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=600, s-maxage=3600' },
  })
}
