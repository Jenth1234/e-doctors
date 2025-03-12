'use server'

import { getPayloadClient } from '@/get-payload'
import { getServerSideUser } from '@/get-serverside-user'

export const getConversations = async () => {
  const { user } = await getServerSideUser()

  if (!user) return { success: false, message: 'User not found', data: null }

  const payloadClient = await getPayloadClient()

  const { docs: conversations } = await payloadClient.find({
    collection: 'conversations',
    where: {
      participants: { contains: user.id },
    },
    pagination: false,
    depth: 0,
  })

  return { success: true, message: 'Conversations fetched successfully', data: conversations ?? [] }
}

export const createConversation = async (doctorId: string) => {
  const { user } = await getServerSideUser()

  if(!user) {
    return  {
      success: false,
      message: 'Your are not authorized to create a conversation',
      data: null,
    }
  }

  if (user.roles.includes('doctor') || user.roles.includes('admin'))
    return {
      success: false,
      message: 'You must only be a user to create a conversation',
      data: null,
    }

  const payloadClient = await getPayloadClient()

  const doctor = await payloadClient.findByID({
    collection: 'users',
    id: doctorId,
    depth: 0,
  })

  if (!doctor) return { success: false, message: 'Doctor not found', data: null }

  const { docs: existingConversations } = await payloadClient.find({
    collection: 'conversations',
    where: {
      and: [
        { participants: { contains: user.id } },
        { participants: { contains: doctorId } },
      ],
    },
    pagination: false,
    depth: 0,
  })

  if (existingConversations.length > 0) {
    return {
      success: false,
      message: 'Conversation already exists',
      data: existingConversations[0],
    }
  }

  const conversation = await payloadClient.create({
    collection: 'conversations',
    data: {
      name: `${user?.name} / ${doctor.name}`,
      participants: [user.id, doctorId],
    },
  })

  return { success: true, message: 'Conversation created successfully', data: conversation }
}
