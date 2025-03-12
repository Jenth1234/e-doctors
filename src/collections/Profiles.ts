import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { createProfile } from '@/hooks/createProfile';

import { anyone } from '@/access/anyone';
import { canViewOrEditOwn} from '@/access/canViewOrEditOwn';

export const Profiles: CollectionConfig = {
  slug: 'profiles',
  admin: {
    defaultColumns: ['user', 'phone', 'address'],
    useAsTitle: 'user',
  },
  access: {
    read: canViewOrEditOwn,
    create: authenticated,
    update: canViewOrEditOwn,
    delete: authenticated,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      hasMany: false
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      type: 'text',
    },
    {
      name: 'gender',
      type: 'select',
      required: true,
      options: [
        { label: 'Nam', value: 'male' },
        { label: 'Nữ', value: 'female' },
        { label: 'Khác', value: 'other' },
      ],
    },
    {
      name: 'dob',
      type: 'date',
      label: 'Date of Birth',
      required: true,
    },
  ],

 
}
