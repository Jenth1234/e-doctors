import { z } from 'zod'

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const PayloadMessageValidator = z.object({
  conversationId: z.string(),
  role: z.enum(['User', 'Doctor']),
  content: z.string().optional(),
  attachments: z.array(z.instanceof(File))
    .refine(files => {return Array.from(files).every(file => file instanceof File)}, { message: "Expected a file" })
    .refine(files => Array.from(files).every(file => ACCEPTED_IMAGE_TYPES.includes((file as File).type)), "Only these types are allowed .jpg, .jpeg, .png and .webp")
    .refine(files => Array.from(files).every(file => (file as File).size < 7000000), { message: 'File size must be less than 7MB.' })
})


export const PayloadUserLoginValidator = z.object({
  email: z.string().email(),
  password: z.string().min(1, {
    message: 'Password must not be blank.',
  }),
})

export const PayloadUserSignUpValidator = z.object({
  email: z.string().email(),
  password: z.string().min(3, {
    message: 'Password must be 3 characters.',
  }),
  name: z.string().min(1, {
    message: 'First name must not be blank.',
  }),
})

export type TPayloadMessageValidator = z.infer<typeof PayloadMessageValidator>
export type TPayloadUserLoginValidator = z.infer<typeof PayloadUserLoginValidator>
export type TPayloadUserSignUpValidator = z.infer<typeof PayloadUserSignUpValidator>