import type { CollectionConfig } from 'payload'
import path from 'path'

import { anyone, isStaff } from '@/access'

/**
 * Tenant-scoped media on local disk. In Docker the directory is a named
 * volume (MEDIA_DIR=/app/media). Files are served by Payload at /api/media/file/*.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: anyone,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  admin: { group: 'Content' },
  fields: [{ name: 'alt', type: 'text' }],
  upload: {
    staticDir: process.env.MEDIA_DIR || path.resolve(process.cwd(), 'media'),
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 300 },
      { name: 'card', width: 640 },
      { name: 'large', width: 1400 },
      { name: 'og', width: 1200, height: 630, crop: 'center' },
    ],
  },
}
