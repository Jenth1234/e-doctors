'use server'

import { getPayloadClient } from '@/get-payload'
import { getServerSideUser } from '@/get-serverside-user'

export const getConversationsByDoctorId = async (doctorId: string) => {
  if (!doctorId) {
    return {
      success: false,
      message: 'Doctor ID is required',
      data: [],
    }
  }

  const { user } = await getServerSideUser()

  if (!user || !user.roles.includes('doctor')) {
    return {
      success: false,
      message: 'You are not authorized to access this page',
      data: [],
    }
  }

  const payloadClient = await getPayloadClient()

  const { docs: conversations } = await payloadClient.find({
    collection: 'conversations',
    where: {
      participants: {
        contains: doctorId,
      },
    },
    depth: 0
  })

  if (!conversations) {
    return {
      success: false,
      message: 'No conversations found',
      data: [],
    }
  }

  return {
    success: true,
    message: 'Conversations found',
    data: conversations,
  }
}
