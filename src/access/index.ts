import type { Access, FieldAccess, PayloadRequest } from 'payload'

type MaybeUser = PayloadRequest['user']

export const hasRole = (user: MaybeUser, role: string): boolean =>
  Boolean(user && (user as { roles?: string[] | null }).roles?.includes(role))

/** Full admin: manages sites, users, sees clicks. */
export const isSuperAdminUser = (user: MaybeUser) => hasRole(user, 'super-admin')

/** Super-admin OR the automation (n8n) role: may write content. */
export const isStaffUser = (user: MaybeUser) =>
  isSuperAdminUser(user) || hasRole(user, 'automation')

export const anyone: Access = () => true
export const nobody: Access = () => false
export const isSuperAdmin: Access = ({ req }) => isSuperAdminUser(req.user)
export const isStaff: Access = ({ req }) => isStaffUser(req.user)
export const isLoggedIn: Access = ({ req }) => Boolean(req.user)

export const isSuperAdminField: FieldAccess = ({ req }) => isSuperAdminUser(req.user)
export const isLoggedInField: FieldAccess = ({ req }) => Boolean(req.user)

/** Public sees only published docs; staff sees everything incl. drafts. */
export const staffOrPublished: Access = ({ req }) => {
  if (isStaffUser(req.user)) return true
  return { _status: { equals: 'published' } }
}

export const superAdminOrSelf: Access = ({ req }) => {
  if (!req.user) return false
  if (isSuperAdminUser(req.user)) return true
  return { id: { equals: req.user.id } }
}
