import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { siteTag } from '@/lib/cacheTags'

const tenantIdOf = (doc: Record<string, unknown> | undefined | null): string | number | null => {
  if (!doc) return null
  const t = doc.tenant as unknown
  if (t && typeof t === 'object' && 'id' in (t as object)) return (t as { id: string | number }).id
  if (typeof t === 'string' || typeof t === 'number') return t
  return null
}

const doRevalidate = async (ids: Array<string | number | null>, log: (m: string) => void) => {
  const unique = [...new Set(ids.filter((v): v is string | number => v !== null))]
  if (unique.length === 0) return
  try {
    // Dynamic import so this module can be used from scripts run outside Next.js.
    const { revalidateTag } = await import('next/cache')
    for (const id of unique) {
      revalidateTag(siteTag(id))
      log(`revalidated ${siteTag(id)}`)
    }
  } catch {
    // Not running inside a Next.js request (e.g. seed script) - nothing to revalidate.
  }
}

/**
 * On-demand ISR: any change to tenant-scoped content invalidates every cached
 * page/data entry of that site (tag `site:<id>`). Cheap and always correct for
 * small promo sites. Drafts don't trigger revalidation unless they unpublish.
 */
export const revalidateTenantAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  if (context?.disableRevalidate) return doc
  const status = (doc as { _status?: string })._status
  const prevStatus = (previousDoc as { _status?: string } | undefined)?._status
  if (status === 'draft' && prevStatus !== 'published') return doc
  await doRevalidate([tenantIdOf(doc), tenantIdOf(previousDoc)], (m) => req.payload.logger.info(m))
  return doc
}

export const revalidateTenantAfterDelete: CollectionAfterDeleteHook = async ({ doc, req, context }) => {
  if (context?.disableRevalidate) return doc
  await doRevalidate([tenantIdOf(doc)], (m) => req.payload.logger.info(m))
  return doc
}

/** For the Sites collection itself: the doc IS the tenant. */
export const revalidateSiteAfterChange: CollectionAfterChangeHook = async ({ doc, req, context }) => {
  if (context?.disableRevalidate) return doc
  await doRevalidate([doc.id], (m) => req.payload.logger.info(m))
  try {
    const { revalidateTag } = await import('next/cache')
    revalidateTag('sites')
  } catch {}
  return doc
}

export const revalidateHooks = {
  afterChange: [revalidateTenantAfterChange],
  afterDelete: [revalidateTenantAfterDelete],
}
