import type { Payload, PayloadRequest } from 'payload'

export const seed = async ({ payload }: { payload: Payload; req: PayloadRequest }) => {
  payload.logger.info(`Seeding demo user...`)

  await Promise.all([
    await payload.delete({
      collection: 'users',
      depth: 0,
      where: {
        email: {
          equals: 'demo@edoctors.com',
        },
      },
    }),
    await payload.delete({
      collection: 'users',
      depth: 0,
      where: {
        email: {
          equals: 'doctor@edoctors.com',
        },
      },
    }),
  ])

  const [] = await Promise.all([
    payload.create({
      collection: 'users',
      data: {
        name: 'User',
        email: 'user@edoctors.com',
        password: 'user',
        roles: ['user'],
      },
    }),
    payload.create({
      collection: 'users',
      data: {
        name: 'Doctor',
        email: 'doctor@edoctors.com',
        password: 'doctor',
        roles: ['user', 'doctor'],
      },
    }),
  ])
}
