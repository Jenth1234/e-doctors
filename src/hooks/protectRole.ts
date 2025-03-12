import type { FieldHook } from 'payload'
import type { User } from '@/payload-types'

export const protectRoles: FieldHook<{ id: string } & User> = ({ data, req }) => {
  const reqUser = req.user as User | null
  const isAdmin = reqUser?.roles?.includes('admin') || data?.email === 'admin@edoctors.com'

  if (!isAdmin) {
    return ['user']
  }

  const userRoles = new Set(data?.roles || [])
  userRoles.add('user')

  return [...userRoles]
}