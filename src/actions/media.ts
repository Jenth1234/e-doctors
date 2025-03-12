// 'use server'

// import { getPayloadClient } from '@/get-payload'

// export const getMedia = async (id: string) => {
//   const payload = await getPayloadClient()

//   const media = await payload.findByID({
//     collection: 'media',
//     id,
//   })

//   return media ?? null
// }

// export const uploadAvatar = async (userId: string, file: File) => {
//   try {
//     const payload = await getPayloadClient()

//     const formData = new FormData()
//     formData.append('file', file)

//     // Upload file vào collection media trước
//     const mediaDoc = await payload.create({
//       collection: 'media',
//       data: {
//         alt: `Avatar for user ${userId}`,
//       },
//       file: file,
//     })

//     // Cập nhật user với avatar mới
//     const updatedUser = await payload.update({
//       collection: 'users',
//       id: userId,
//       data: {
//         avatar: mediaDoc.id,
//       },
//     })

//     return {
//       success: true,
//       data: updatedUser,
//     }
//   } catch (err) {
//     console.error('Error uploading avatar:', err)
//     return {
//       success: false,
//       error: 'Failed to upload avatar',
//     }
//   }
// }
