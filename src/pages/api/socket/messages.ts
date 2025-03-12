import payloadConfig from '../../../payload.config'
import { NextApiResponseServerIO } from '@/types'
import { NextApiRequest } from 'next'
import { getPayload } from 'payload'
import formidable from 'formidable'
import { File as PayloadFile } from 'payload'
import fs from 'fs/promises'
import path from 'path'
import { Media } from '@/payload-types'
import { CHAT_KEY } from '@/constants'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const payload = await getPayload({ config: payloadConfig })

  const { user } = await payload.auth({
    headers: new Headers(req.headers as any),
  })

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const form = formidable()

  const [fields, files] = await form.parse(req)

  const conversationId = fields.conversationId?.[0]
  const role = fields.role?.[0] as 'User' | 'Doctor'
  const content = fields.content?.[0]
  const attachments = files.attachments

  if (!conversationId || !role) {
    return res.status(400).json({ message: 'Missing pre-defined fields' })
  }

  const conversation = await payload.findByID({
    collection: 'conversations',
    id: conversationId,
  })

  if (!conversation) {
    return res.status(404).json({ message: 'Conversation not found' })
  }

  if (!content && !attachments) {
    return res.status(400).json({ message: 'Missing content or attachment' })
  }

  const chatKey = `${CHAT_KEY}:${conversationId}`

  const payloadMedias : Media[] = []

  if(attachments && attachments.length > 0) {
    for(const attachment of attachments) {
      const payloadFilePath = attachment.filepath
      const dataBuffer = await fs.readFile(payloadFilePath)
      
      const payloadFile : PayloadFile = {
        name: path.basename(payloadFilePath),
        data: Buffer.from(dataBuffer),
        mimetype: `image/${path.extname(payloadFilePath).slice(1)}`,
        size: dataBuffer.byteLength,
      }

      const payloadMedia = await payload.create({
        collection: 'media',
        data: {
          alt: attachment.originalFilename,
        },
        file: payloadFile,
      })

      payloadMedias.push(payloadMedia)
    }
  }

  const payloadMessage = await payload.create({
    collection: 'messages',
    data: {
      conversation: conversationId,
      role,
      content,
      attachments: (payloadMedias ?? []).map(media => 
        ({ media: String(media.id) })),
      sender: user.id,
    },
  })

  if (!payloadMessage) {
    return res.status(400).json({ message: 'Failed to send message' })
  }

  res?.socket?.server?.io?.emit(chatKey, payloadMessage)

  return res.status(200).json({ message: 'Message sent successfully' })
}
