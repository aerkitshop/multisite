import type { CollectionConfig } from 'payload'

import { isStaff, staffOrPublished } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateHooks } from '@/hooks/revalidateTenant'
import { uniqueSlugPerTenant } from '@/hooks/uniquePerTenant'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: { read: staffOrPublished, create: isStaff, update: isStaff, delete: isStaff },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', '_status', 'publishedAt', 'tenant'],
    group: 'Content',
  },
  versions: {
    drafts: { schedulePublish: false },
    maxPerDoc: 30,
  },
  // DB-level guarantee: slug unique per site (tenant)
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  hooks: {
    ...revalidateHooks,
    beforeValidate: [uniqueSlugPerTenant('posts')],
    beforeChange: [
      ({ data }) => {
        if (data._status === 'published' && !data.publishedAt) data.publishedAt = new Date().toISOString()
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'review',
      options: [
        { label: 'Review', value: 'review' },
        { label: 'Comparison', value: 'compare' },
        { label: 'Best-of list', value: 'best' },
        { label: 'Tutorial', value: 'tutorial' },
        { label: 'News', value: 'news' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'excerpt', type: 'textarea' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText' },
    { name: 'relatedTools', type: 'relationship', relationTo: 'tools', hasMany: true },
    {
      name: 'faq',
      type: 'array',
      labels: { singular: 'Question', plural: 'FAQ' },
      fields: [
        { name: 'q', label: 'Question', type: 'text', required: true },
        { name: 'a', label: 'Answer', type: 'textarea', required: true },
      ],
    },
    {
      name: 'sourceUrls',
      type: 'array',
      fields: [
        { name: 'url', type: 'text', required: true },
        { name: 'note', type: 'text' },
      ],
    },
  ],
}
