import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateHooks } from '@/hooks/revalidateTenant'
import { uniqueSlugPerTenant } from '@/hooks/uniquePerTenant'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'tenant'], group: 'Directory' },
  // DB-level guarantee: slug unique per site (tenant)
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  hooks: { ...revalidateHooks, beforeValidate: [uniqueSlugPerTenant('categories')] },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    { name: 'description', type: 'textarea' },
    {
      name: 'icon',
      type: 'text',
      admin: { description: 'An emoji (🎬) or a lucide icon name (video, mic, …).' },
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
