import { z } from 'zod'

export const ContactFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('אנא הזן כתובת אימייל תקינה').optional().or(z.literal('')),
  message: z.string().min(1, 'הודעה נדרשת'),
  formType: z.enum(['contact', 'feature']),
})

export type ContactFormData = z.infer<typeof ContactFormSchema>

export interface ContactFormState {
  success: boolean
  message: string
  errors?: {
    name?: string[]
    email?: string[]
    message?: string[]
    formType?: string[]
    _form?: string[]
  }
} 