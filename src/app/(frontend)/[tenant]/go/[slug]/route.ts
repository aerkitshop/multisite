import { NextResponse } from 'next/server'

import { getPayloadClient, getSiteByDomain } from '@/lib/site'

export const dynamic = 'force-dynamic'

const BOT_RE = /bot|crawler|spider|slurp|facebookexternalhit|embedly|preview|lighthouse|headless/i

const safeUrl = (u?: string | null): string | null => {
  if (!u) return null
  try {
    const url = new URL(u)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

/**
 * GET /go/<tool-slug>[?src=/path]
 * Resolves the site from the Host header (rewritten into [tenant]), logs a click
 * via the Local API (server-side only) and 302-redirects to the affiliate URL,
 * falling back to the tool's website.
 */
export async function GET(req: Request, { params }: { params: Promise<{ tenant: string; slug: string }> }) {
  const { tenant, slug } = await params
  const site = await getSiteByDomain(tenant)
  if (!site) return new NextResponse('Unknown site', { status: 404 })

  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'tools',
    where: { and: [{ tenant: { equals: site.id } }, { slug: { equals: slug } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true, // need the private affiliateUrl
    select: { affiliateUrl: true, websiteUrl: true, slug: true },
  })
  const tool = res.docs[0]
  if (!tool) return new NextResponse('Not found', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } })

  const destination = safeUrl(tool.affiliateUrl) || safeUrl(tool.websiteUrl)
  if (!destination) return new NextResponse('Tool has no valid URL', { status: 404 })

  const url = new URL(req.url)
  const h = req.headers
  const ua = h.get('user-agent') || ''
  const referrer = h.get('referer') || ''
  let sourcePath = url.searchParams.get('src') || ''
  if (!sourcePath && referrer) {
    try {
      sourcePath = new URL(referrer).pathname
    } catch {}
  }

  if (!BOT_RE.test(ua) && req.method === 'GET') {
    let postId: number | undefined
    const m = sourcePath.match(/^\/blog\/([^/?#]+)/)
    if (m) {
      const p = await payload.find({
        collection: 'posts',
        where: { and: [{ tenant: { equals: site.id } }, { slug: { equals: m[1] } }] },
        limit: 1,
        depth: 0,
        select: { slug: true },
      })
      postId = p.docs[0]?.id
    }
    try {
      await payload.create({
        collection: 'clicks',
        overrideAccess: true,
        data: {
          tenant: site.id,
          tool: tool.id,
          ...(postId ? { post: postId } : {}),
          sourcePath: sourcePath.slice(0, 500),
          destination: new URL(destination).hostname,
          country: (h.get('cf-ipcountry') || '').toUpperCase().slice(0, 8) || null,
          userAgent: ua.slice(0, 500),
          referrer: referrer.slice(0, 1000),
        },
      })
    } catch (err) {
      payload.logger.error({ err, msg: 'click log failed' })
    }
  }

  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: destination,
      'Cache-Control': 'no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'no-referrer-when-downgrade',
    },
  })
}
