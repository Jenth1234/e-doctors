import type { CollectionConfig } from 'payload'
import { protectRoles } from '@/hooks/protectRole'
import { anyone } from '@/access/anyone'
import { admins } from '@/access/admin'
import { authenticated } from '@/access/authenticated'
import { checkRole } from '@/access/checkRole'
import { createProfile } from '@/hooks/createProfile';
import { canViewOrEditOwn } from '@/access/canViewOrEditOwn'
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  access: {
    admin: ({ req: { user } }) => {
      if (user && 'roles' in user) {
        return checkRole(['admin'], user);
      }
      return false; // Hoặc xử lý theo cách khác nếu không phải là User
    },
    create: anyone,
    delete: admins,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      saveToJWT: true,
      required: true,
      hooks: {
        beforeChange: [protectRoles],
      },
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Doctor',
          value: 'doctor',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
    },
    {
      name: 'profileId',
      type: 'relationship',
      relationTo: 'profiles',
      hasMany: false,
    },
    {
      name: 'doctorId',
      type: 'relationship',
      relationTo: 'doctors',
      required: false,
    },
   
  ],
   hooks: {
      afterChange: [createProfile],
    },
  timestamps: true,
  
}
