import type { CollectionConfig, Field } from 'payload'

import { anyone, isStaff } from '@/access'
import { revalidateHooks } from '@/hooks/revalidateTenant'

export const navItemFields: Field[] = [
  {
    type: 'row',
    fields: [
      { name: 'label', type: 'text', required: true },
      { name: 'url', type: 'text', required: true, admin: { description: '/blog, /about or https://…' } },
      { name: 'newTab', type: 'checkbox' },
    ],
  },
]

/** Tenant-scoped "global" (one document per site, enforced by the multi-tenant plugin). */
export const Header: CollectionConfig = {
  slug: 'header',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  admin: { group: 'Navigation' },
  hooks: revalidateHooks,
  fields: [{ name: 'navItems', type: 'array', maxRows: 8, fields: navItemFields }],
}

export const Footer: CollectionConfig = {
  slug: 'footer',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  admin: { group: 'Navigation' },
  hooks: revalidateHooks,
  fields: [
    { name: 'about', type: 'textarea', admin: { description: 'Short blurb under the logo.' } },
    { name: 'navItems', type: 'array', maxRows: 12, fields: navItemFields },
    { name: 'copyright', type: 'text', admin: { description: 'Defaults to "© YEAR Site name".' } },
  ],
}
