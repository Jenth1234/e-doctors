'use server'

import { getPayloadClient } from '@/get-payload'

export const getDoctors = async () => {
  const payloadClient = await getPayloadClient()

  const { docs: doctorDetails } = await payloadClient.find({
    collection: 'users',
    where: {
      'roles': {
        contains: 'doctor',
      },
    },
    pagination: false,
    depth: 0,
  })

  return doctorDetails
}