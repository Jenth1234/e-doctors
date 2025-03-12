import type { CollectionConfig } from 'payload'

export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'content',
    listSearchableFields: ['content'],
  },
  fields: [
    {
      name: 'conversation',
      type: 'relationship',
      relationTo: 'conversations',
      required: true,
      hasMany: false,
    },
    {
      name: 'sender',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
    },
    {
      name: 'role',
      type: 'select',
      options: ['User', 'Doctor'],
      required: true,
    },
    {
      name: 'content',
      type: 'text',
    },
    {
      name: 'attachments',
      type: 'array',
      fields: [
        {
          name: 'media',
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
