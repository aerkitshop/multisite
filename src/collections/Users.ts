import type { CollectionConfig } from 'payload'

import { isSuperAdmin, isSuperAdminField, isSuperAdminUser, superAdminOrSelf } from '@/access'

/**
 * Admin-only users. There is NO public registration: create requires a
 * super-admin (the very first user is created through /admin/create-first-user,
 * which Payload only allows while the collection is empty).
 *
 * Roles:
 *  - super-admin: everything
 *  - automation:  API-key user for n8n; can write tools/posts/categories/media,
 *                 cannot touch users, sites or clicks.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req }) => Boolean(req.user),
    create: isSuperAdmin,
    read: superAdminOrSelf,
    update: superAdminOrSelf,
    delete: isSuperAdmin,
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'email',
    group: 'Admin',
    hidden: ({ user }) => !isSuperAdminUser(user as never),
  },
  auth: {
    useAPIKey: true,
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 10,
    lockTime: 15 * 60 * 1000,
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['super-admin'],
      options: [
        { label: 'Super admin', value: 'super-admin' },
        { label: 'Automation (n8n, API key)', value: 'automation' },
      ],
      access: {
        create: isSuperAdminField,
        update: isSuperAdminField,
      },
      admin: { position: 'sidebar' },
      saveToJWT: true,
    },
  ],
  timestamps: true,
}
