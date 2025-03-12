import type { CollectionConfig } from 'payload';

export const Doctors: CollectionConfig = {
  slug: 'doctors',
  auth: false,
  admin: {
    useAsTitle: 'specialization',
    group: 'Content',
  },
  access: {
    create: ({ req: { user } }) => {
      return user?.roles?.includes('admin') || false;
    },
    read: () => true,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      admin: {
        description: 'Chọn tài khoản user cho bác sĩ',
      },
    },
    {
      name: 'specialization',
      type: 'text',
      required: true,
    },
    {
      name: 'degree',
      type: 'text',
      required: true,
    },
    {
      name: 'experience',
      type: 'number',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        const payload = req.payload;
        await payload.update({
          collection: 'users',
          id: data.user,
          data: {
            roles: ['doctor'],
          },
        });
        return data;
      },
    ],
  },
}; 