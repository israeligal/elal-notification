'use server'

import { ContactFormSchema, ContactFormState } from '@/lib/schemas/contact.schema'
import { logInfo, logError } from '@/lib/utils/logger'
import { trackEvent } from '@/lib/utils/analytics'
import {Resend} from "resend";


const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.FROM_EMAIL || 'notifications@flightfare.pro'

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  try {
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
      formType: formData.get('formType') as string,
    }

    // Validate the form data
    const validation = ContactFormSchema.safeParse(rawData)

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors
      return {
        success: false,
        message: 'אנא בדוק את הטופס לשגיאות',
        errors: fieldErrors,
      }
    }

    const { name, email, message, formType } = validation.data

    // Log the contact form submission
    logInfo('Contact form submitted', {
      name: name || 'Anonymous',
      email: email || 'No email provided',
      formType,
      messageLength: message.length,
    })

    // Track contact form submission
    await trackEvent({
      distinctId: email || `anonymous_${Date.now()}`,
      event: 'contact_form_submitted',
      properties: {
        form_type: formType,
        has_name: !!name,
        has_email: !!email,
        message_length: message.length,
        email_domain: email ? email.split('@')[1] : undefined,
        timestamp: new Date().toISOString(),
      }
    })

    await resend.emails.send({
      from: FROM_EMAIL,
      to: 'support_elal_notification@flightfare.pro',
      subject: `עדכונים חדשים מאל על - ${new Date().toLocaleDateString('he-IL')}`,
      html: message,
    })
    
    // For now, we'll just simulate success
    const successMessage = formType === 'feature' 
      ? 'תודה על בקשת התכונה! אנו מעריכים את המשאוב שלך ונשקול אותו לעדכונים עתידיים.'
      : 'תודה על הודעתך! קיבלנו את הפנייה שלך ונחזור אליך בקרוב.'

    return {
      success: true,
      message: successMessage,
    }
  } catch (error) {
    logError('Contact form submission error', error as Error)
    
    // Track contact form submission failure
    await trackEvent({
      distinctId: 'unknown',
      event: 'contact_form_failed',
      properties: {
        error_message: (error as Error).message,
        timestamp: new Date().toISOString(),
      }
    })
    
    return {
      success: false,
      message: 'משהו השתבש. אנא נסה שוב מאוחר יותר.',
      errors: {
        _form: ['נכשל בשליחת הטופס. אנא נסה שוב.'],
      },
    }
  }
} 