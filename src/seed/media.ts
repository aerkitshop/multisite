/**
 * Idempotent media upsert for seed / content-update scripts.
 *
 * A media doc is identified by (tenant, filename). Files come from src/seed/assets.
 *  - doc exists and its file is on disk -> reused as-is (Payload re-encodes uploads, so sizes
 *    can't be compared with the source; pass force=true / --force-media to re-upload)
 *  - doc exists but its file is missing  -> file replaced in place (same id)
 *  - no doc                              -> created
 * Payload appends "-1", "-2"… when a filename is taken, so lookups match "<stem>(-N).<ext>".
 */
import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

export const ASSETS_DIR = path.resolve(process.cwd(), 'src/seed/assets')
const MEDIA_DIR = process.env.MEDIA_DIR || path.resolve(process.cwd(), 'media')

const mime = (f: string) =>
  f.endsWith('.webp') ? 'image/webp' : f.endsWith('.png') ? 'image/png' : f.endsWith('.jpg') || f.endsWith('.jpeg') ? 'image/jpeg' : 'application/octet-stream'

const ctx = { disableRevalidate: true }
const escapeRe = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export type EnsureResult = { id: number; action: 'kept' | 'replaced' | 'created' }

export const ensureMedia = async (
  payload: Payload,
  tenant: number,
  asset: string,
  alt: string,
  /** stored filename; defaults to "<asset>" */
  filename = asset,
  force = false,
): Promise<EnsureResult> => {
  const src = path.join(ASSETS_DIR, asset)
  const data = fs.readFileSync(src)
  const file = { data, mimetype: mime(asset), name: filename, size: data.length }

  const ext = path.extname(filename)
  const stem = filename.slice(0, -ext.length)
  const re = new RegExp('^' + escapeRe(stem) + '(-\\d+)?' + escapeRe(ext) + '$')
  const found = await payload.find({
    collection: 'media',
    where: { and: [{ tenant: { equals: tenant } }, { filename: { like: stem } }] },
    limit: 50,
    depth: 0,
    sort: 'id',
    overrideAccess: true,
  })
  const doc = found.docs.find((d) => re.test(d.filename || ''))
  if (doc) {
    const onDisk = path.join(MEDIA_DIR, doc.filename || filename)
    const ok = !force && fs.existsSync(onDisk) && fs.statSync(onDisk).size > 0
    if (ok) {
      if (doc.alt !== alt) await payload.update({ collection: 'media', id: doc.id, data: { alt }, context: ctx, overrideAccess: true })
      return { id: doc.id as number, action: 'kept' }
    }
    await payload.update({ collection: 'media', id: doc.id, data: { alt }, file, context: ctx, overrideAccess: true })
    return { id: doc.id as number, action: 'replaced' }
  }
  const created = await payload.create({ collection: 'media', data: { alt, tenant }, file, context: ctx, overrideAccess: true })
  return { id: created.id as number, action: 'created' }
}
