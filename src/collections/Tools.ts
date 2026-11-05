import type { CollectionConfig, Field } from 'payload'

import { anyone, isLoggedInField, isStaff } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateHooks } from '@/hooks/revalidateTenant'
import { uniqueSlugPerTenant } from '@/hooks/uniquePerTenant'

/** Hidden from unauthenticated REST/GraphQL reads (field-level access). */
const privateField = <T extends Field>(field: T): T =>
  ({ ...field, access: { read: isLoggedInField } }) as T

export const Tools: CollectionConfig = {
  slug: 'tools',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'pricingModel', 'featured', 'affiliateStatus', 'tenant'],
    group: 'Directory',
    listSearchableFields: ['name', 'slug', 'shortDescription'],
  },
  // DB-level guarantee: slug unique per site (tenant)
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  hooks: { ...revalidateHooks, beforeValidate: [uniqueSlugPerTenant('tools')] },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'sortOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Listing',
          fields: [
            { name: 'websiteUrl', type: 'text', required: true, admin: { description: 'Official site (https://…)' } },
            {
              name: 'tagline',
              type: 'text',
              maxLength: 90,
              admin: { description: 'One sharp line shown under the name on cards (e.g. "Edit video by editing the transcript").' },
            },
            { name: 'shortDescription', type: 'textarea', maxLength: 240, admin: { description: 'Two lines: what it does + concrete use cases.' } },
            { name: 'bestFor', type: 'text', maxLength: 140, admin: { description: 'Who should pick it, e.g. "Podcasters and talking-head YouTubers".' } },
            { name: 'description', type: 'richText' },
            {
              type: 'row',
              fields: [
                { name: 'logo', type: 'upload', relationTo: 'media' },
                {
                  name: 'pricingModel',
                  type: 'select',
                  defaultValue: 'freemium',
                  options: [
                    { label: 'Free', value: 'free' },
                    { label: 'Freemium', value: 'freemium' },
                    { label: 'Paid', value: 'paid' },
                    { label: 'Free trial', value: 'trial' },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'startingPrice', type: 'text', admin: { description: 'Short card label, e.g. "From $16/mo". Verify on the pricing page.' } },
                { name: 'pricingSummary', type: 'text', admin: { description: 'e.g. "Free plan; Pro from $12/mo"' } },
              ],
            },
            {
              name: 'cover',
              type: 'upload',
              relationTo: 'media',
              admin: { description: '16:9 product image (official og:image or screenshot). Shown on cards and as the tool-page hero.' },
            },
            { name: 'screenshots', type: 'upload', relationTo: 'media', hasMany: true, admin: { description: 'Gallery on the tool page.' } },
            {
              name: 'features',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
              ],
            },
            { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
            { name: 'tags', type: 'text', hasMany: true },
          ],
        },
        {
          label: 'Affiliate (private)',
          description: 'Never exposed to anonymous API reads; used only by /go redirects server-side.',
          fields: [
            privateField({ name: 'affiliateUrl', type: 'text' }),
            {
              type: 'row',
              fields: [
                privateField({
                  name: 'affiliatePlatform',
                  type: 'text',
                  admin: { description: 'PartnerStack, Impact, Rewardful, in-house…' },
                }),
                privateField({
                  name: 'affiliateStatus',
                  type: 'select',
                  defaultValue: 'none',
                  options: ['none', 'found', 'applied', 'approved', 'rejected'].map((v) => ({
                    label: v[0].toUpperCase() + v.slice(1),
                    value: v,
                  })),
                }),
              ],
            },
            privateField({ name: 'commissionNote', type: 'textarea' }),
            privateField({ name: 'affiliateLastCheckedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } }),
          ],
        },
        {
          label: 'Sources',
          fields: [
            {
              name: 'sourceUrls',
              type: 'array',
              admin: { description: 'Where facts on this listing came from (pricing page, docs, …).' },
              fields: [
                { name: 'url', type: 'text', required: true },
                { name: 'note', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
