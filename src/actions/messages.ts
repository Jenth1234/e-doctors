'use server'

import { getPayloadClient } from '@/get-payload'

export const getMessagesByConversationId = async (conversationId: string) => {
  const payloadClient = await getPayloadClient()

  const { docs: messages } = await payloadClient.find({
    collection: 'messages',
    pagination: false,
    depth: 1,
    where: {
      'conversation.id': {
        equals: conversationId,
      },
    },
    sort: 'createdAt',
  })

  return messages
}
