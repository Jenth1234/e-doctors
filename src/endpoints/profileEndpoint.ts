// import  { Endpoint } from 'payload/types'
// import  { PayloadRequest } from 'payload/types'
// import type { Response, NextFunction } from 'express'

// const profileEndpoint: Endpoint = {
//   path: '/me',
//   method: 'get',
//   handler: async (req: PayloadRequest, res: Response, next: NextFunction) => {
//     try {
//       if (!req.user) {
//         return res.status(401).json({ message: 'Unauthorized' })
//       }

//       const profile = await req.payload.find({
//         collection: 'profiles',
//         where: { user: { equals: req.user.id } },
//       })

//       if (!profile.docs.length) {
//         return res.status(404).json({ message: 'Không tìm thấy hồ sơ' })
//       }

//       return res.json(profile.docs[0])
//     } catch (error) {
//       next(error) // ✅ Đẩy lỗi vào middleware Express
//     }
//   },
// }

// export default profileEndpoint
