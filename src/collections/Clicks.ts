import type { CollectionConfig } from 'payload'

import { isSuperAdmin, isSuperAdminUser, nobody } from '@/access'

/**
 * Outbound click log. Written ONLY server-side by /go/[slug] through the Local
 * API (overrideAccess). No create/update through REST/GraphQL/admin.
 */
export const Clicks: CollectionConfig = {
  slug: 'clicks',
  access: {
    read: isSuperAdmin,
    create: nobody,
    update: nobody,
    delete: isSuperAdmin,
  },
  admin: {
    group: 'Analytics',
    defaultColumns: ['tool', 'sourcePath', 'country', 'createdAt'],
    hidden: ({ user }) => !isSuperAdminUser(user as never),
  },
  timestamps: true,
  fields: [
    { name: 'tool', type: 'relationship', relationTo: 'tools', index: true },
    { name: 'post', type: 'relationship', relationTo: 'posts' },
    { name: 'sourcePath', type: 'text' },
    { name: 'destination', type: 'text' },
    { name: 'country', type: 'text', index: true },
    { name: 'userAgent', type: 'text' },
    { name: 'referrer', type: 'text' },
  ],
}
