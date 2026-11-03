import type { CollectionBeforeValidateHook } from 'payload'
import { ValidationError } from 'payload'

/** Ensures `slug` is unique within the same tenant (site). */
export const uniqueSlugPerTenant =
  (collection: 'tools' | 'categories' | 'posts' | 'pages'): CollectionBeforeValidateHook =>
  async ({ data, originalDoc, req }) => {
    const slug = data?.slug ?? originalDoc?.slug
    const tenantRaw = data?.tenant ?? originalDoc?.tenant
    const tenant = typeof tenantRaw === 'object' && tenantRaw ? tenantRaw.id : tenantRaw
    if (!slug || !tenant) return data
    const existing = await req.payload.find({
      collection,
      where: {
        and: [
          { slug: { equals: slug } },
          { tenant: { equals: tenant } },
          ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
        ],
      },
      limit: 1,
      depth: 0,
      pagination: false,
      overrideAccess: true,
      draft: true,
      req,
    })
    if (existing.docs.length > 0) {
      throw new ValidationError({
        collection,
        errors: [{ path: 'slug', message: `Slug "${slug}" is already used on this site.` }],
      })
    }
    return data
  }
