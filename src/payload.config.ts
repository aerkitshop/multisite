import { postgresAdapter } from '@payloadcms/db-postgres'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { isSuperAdminUser, isStaffUser } from './access'
import { Categories } from './collections/Categories'
import { Clicks } from './collections/Clicks'
import { Footer, Header } from './collections/Header'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Sites } from './collections/Sites'
import { Tools } from './collections/Tools'
import { Users } from './collections/Users'
import { migrations } from './migrations'
import type { Config } from './payload-types'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const databaseURI = process.env.DATABASE_URI || ''
if (databaseURI && !/^postgres(ql)?:\/\//.test(databaseURI)) {
  throw new Error('DATABASE_URI must be a postgres:// or postgresql:// connection string')
}

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || undefined,
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' · Multisite admin' },
    components: { beforeLogin: ['@/components/BeforeLogin'] },
    importMap: { baseDir: path.resolve(dirname) },
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: databaseURI },
    // Schema changes always go through migrations (dev and prod) - no drizzle push.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
    // Applied automatically on server start when NODE_ENV=production (standalone image has no CLI).
    prodMigrations: migrations,
  }),
  collections: [Sites, Users, Media, Categories, Tools, Posts, Pages, Header, Footer, Clicks],
  graphQL: { disable: true },
  endpoints: [
    {
      path: '/health',
      method: 'get',
      handler: async () => Response.json({ ok: true, time: new Date().toISOString() }),
    },
  ],
  plugins: [
    seoPlugin({
      collections: ['posts', 'tools', 'pages'],
      uploadsCollection: 'media',
      tabbedUI: false,
      generateTitle: ({ doc }) => (doc as { title?: string; name?: string })?.title || (doc as { name?: string })?.name || '',
      generateDescription: ({ doc }) =>
        (doc as { excerpt?: string })?.excerpt || (doc as { shortDescription?: string })?.shortDescription || '',
    }),
    multiTenantPlugin<Config>({
      tenantsSlug: 'sites',
      tenantSelectorLabel: 'Site',
      cleanupAfterTenantDelete: false,
      collections: {
        media: {},
        categories: {},
        tools: {},
        posts: {},
        pages: {},
        clicks: {},
        header: { isGlobal: true },
        footer: { isGlobal: true },
      },
      // super-admin and the n8n automation user work across every site.
      userHasAccessToAllTenants: (user) => isSuperAdminUser(user as never) || isStaffUser(user as never),
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  telemetry: false,
})
