import type { CollectionConfig } from 'payload'

export const Conversations: CollectionConfig = {
  slug: 'conversations',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'participants',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      minRows: 2,
      maxRows: 2,
      required: true,
    },
    {
      name: 'messages',
      type: 'join',
      collection: 'messages',
      on: 'conversation',
    },
  ],
}
