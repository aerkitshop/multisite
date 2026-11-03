import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateHooks } from '@/hooks/revalidateTenant'
import { uniqueSlugPerTenant } from '@/hooks/uniquePerTenant'

/** Simple static pages per site: about, disclosure, privacy, … */
export const Pages: CollectionConfig = {
  slug: 'pages',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'tenant'], group: 'Content' },
  // DB-level guarantee: slug unique per site (tenant)
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  hooks: { ...revalidateHooks, beforeValidate: [uniqueSlugPerTenant('pages')] },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    { name: 'content', type: 'richText' },
  ],
}
