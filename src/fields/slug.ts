import type { Field, FieldHook } from 'payload'

import { slugify } from '@/utilities/slugify'

const formatSlug =
  (fallback: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.trim().length > 0) return slugify(value)
    const source = data?.[fallback] ?? originalDoc?.[fallback]
    if (typeof source === 'string' && source.length > 0) return slugify(source)
    return value
  }

/**
 * Slug field. Uniqueness is enforced per tenant by a compound DB index
 * (see `tenantSlugIndex`) plus a friendly validation hook, NOT globally,
 * so two sites may both have a tool called "descript".
 */
export const slugField = (fallback = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  required: true,
  admin: {
    position: 'sidebar',
    description: `Auto-generated from "${fallback}" if left empty. Unique per site.`,
  },
  hooks: { beforeValidate: [formatSlug(fallback)] },
})
