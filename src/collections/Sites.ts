import type { CollectionConfig } from 'payload'

import { anyone, isSuperAdmin, isSuperAdminUser } from '@/access'
import { revalidateSiteAfterChange } from '@/hooks/revalidateTenant'

const hex = (name: string, label: string, placeholder: string) => ({
  name,
  label,
  type: 'text' as const,
  admin: { placeholder, width: '33%' },
  validate: (v: unknown) =>
    !v || /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(v)) || 'Use a hex colour like #4f46e5',
})

const normaliseDomain = (v: unknown) =>
  typeof v === 'string'
    ? v
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .replace(/:\d+$/, '')
    : v

/**
 * Tenants. Slug kept as `sites`; labelled "Sites" in the admin.
 * Public read is required so the frontend can resolve Host -> site,
 * and only contains public branding data.
 */
export const Sites: CollectionConfig = {
  slug: 'sites',
  labels: { singular: 'Site', plural: 'Sites' },
  access: {
    read: anyone,
    create: isSuperAdmin,
    update: isSuperAdmin,
    delete: isSuperAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'domains', 'updatedAt'],
    group: 'Admin',
    hidden: ({ user }) => !isSuperAdminUser(user as never),
  },
  hooks: { afterChange: [revalidateSiteAfterChange] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            { name: 'name', type: 'text', required: true },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              admin: { description: 'Short machine name, e.g. creator-ai' },
            },
            {
              name: 'domains',
              type: 'array',
              required: true,
              minRows: 1,
              admin: {
                description:
                  'Every hostname that should serve this site (no protocol/port). e.g. example.com, www.example.com, creator-ai.localhost',
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'domain',
                  type: 'text',
                  required: true,
                  index: true,
                  hooks: { beforeValidate: [({ value }) => normaliseDomain(value)] },
                },
              ],
            },
            {
              name: 'primaryDomain',
              type: 'text',
              admin: {
                description:
                  'Canonical host (may include a port for dev, e.g. creator-ai.localhost:3000) used in canonical URLs, sitemap and OG tags. Defaults to the first domain.',
              },
              hooks: {
                beforeValidate: [
                  ({ value }) =>
                    typeof value === 'string'
                      ? value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
                      : value,
                ],
              },
            },
            {
              name: 'useHttps',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Build canonical URLs with https:// (untick for *.localhost dev).' },
            },
            { name: 'tagline', type: 'text' },
            {
              name: 'heroTitle',
              type: 'text',
              admin: { description: 'Big headline on the homepage. Defaults to the tagline.' },
            },
            { name: 'heroSubtitle', type: 'textarea' },
            {
              type: 'row',
              fields: [
                { name: 'logo', type: 'upload', relationTo: 'media' },
                { name: 'favicon', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
        {
          label: 'Theme',
          fields: [
            {
              name: 'colors',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    hex('primary', 'Primary', '#4f46e5'),
                    hex('primaryForeground', 'Text on primary', '#ffffff'),
                    hex('accent', 'Accent', '#f59e0b'),
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    hex('background', 'Background (light)', '#ffffff'),
                    hex('foreground', 'Text (light)', '#0f172a'),
                    hex('darkBackground', 'Background (dark)', '#0b0b12'),
                  ],
                },
              ],
            },
            {
              name: 'fonts',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'heading',
                      type: 'select',
                      defaultValue: 'inter',
                      options: [
                        { label: 'Inter', value: 'inter' },
                        { label: 'Poppins', value: 'poppins' },
                        { label: 'Montserrat', value: 'montserrat' },
                        { label: 'Raleway', value: 'raleway' },
                        { label: 'Playfair Display', value: 'playfair-display' },
                      ],
                    },
                    {
                      name: 'body',
                      type: 'select',
                      defaultValue: 'inter',
                      options: [
                        { label: 'Inter', value: 'inter' },
                        { label: 'Open Sans', value: 'open-sans' },
                        { label: 'Lato', value: 'lato' },
                        { label: 'Roboto', value: 'roboto' },
                        { label: 'Source Sans 3', value: 'source-sans-3' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'SEO & Legal',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: 'Default SEO',
              fields: [
                { name: 'title', type: 'text', admin: { description: 'Default <title>; pages use "Page | Title".' } },
                { name: 'description', type: 'textarea' },
                { name: 'ogImage', type: 'upload', relationTo: 'media' },
                { name: 'twitterHandle', type: 'text', admin: { placeholder: '@yoursite' } },
              ],
            },
            {
              name: 'affiliateDisclosure',
              type: 'textarea',
              admin: {
                description:
                  'Short disclosure shown in the banner above content and on the Disclosure page (FTC).',
              },
              defaultValue:
                'Some links on this site are affiliate links. If you buy through them we may earn a commission at no extra cost to you.',
            },
            { name: 'contactEmail', type: 'email' },
          ],
        },
      ],
    },
  ],
}
