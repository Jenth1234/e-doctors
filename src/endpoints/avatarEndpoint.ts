// import { Endpoint } from 'payload'
// import type { PayloadRequest } from 'payload'
// import type { Response, NextFunction } from 'express'

// interface FileRequest extends PayloadRequest {
//   files?: {
//     avatar?: Express.Multer.File[]
//   }
// }

// // ... rest of the code remains the same

// export const uploadAvatar: Endpoint = {
//   path: '/users/:id/avatar',
//   method: 'patch',
//   handler: async (req: FileRequest, res: Response) => {
//     try {
//       const { payload } = req // Lấy payload instance từ request
//       const { id } = req.params
//       const file = req.files?.avatar?.[0] // Lấy file đầu tiên từ mảng files

//       if (!file) {
//         return res.status(400).json({
//           error: 'No file provided'
//         })
//       }

//       // Upload file vào collection media
//       const mediaDoc = await payload.create({
//         collection: 'media',
//         data: {
//           alt: `Avatar for user ${id}`,
//         },
//         file,
//       })

//       // Cập nhật user với avatar mới
//       const updatedUser = await payload.update({
//         collection: 'users',
//         id: id,
//         data: {
//           avatar: mediaDoc.id,
//         },
//       })

//       return res.status(200).json({
//         message: 'Avatar updated successfully',
//         user: updatedUser
//       })
//     } catch (error) {
//       console.error('Error updating avatar:', error)
//       return res.status(500).json({
//         error: 'Failed to update avatar',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       })
//     }
//   },
//   middleware: [(req: FileRequest, res: Response, next: NextFunction) => {
//     if (!req.files?.avatar?.length) {
//       return res.status(400).json({
//         error: 'No avatar file provided'
//       })
//     }
//     next()
//   }]
// }

// export default uploadAvatar