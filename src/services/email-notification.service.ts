import { Resend } from 'resend'
import { render } from '@react-email/render'
import { logInfo, logError } from '@/lib/utils/logger'
import { UpdateNotificationEmail } from '@/components/emails/UpdateNotificationEmail'
import { VerificationEmail } from '@/components/emails/VerificationEmail'
import { ConfirmationEmail } from '@/components/emails/ConfirmationEmail'
import type { ScrapedContent, Subscriber } from '@/types/notification.type'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required')
}

if (!process.env.APP_URL) {
  throw new Error('APP_URL environment variable is required')
}

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.FROM_EMAIL || 'notifications@flightfare.pro'

export async function sendUpdateNotifications({ 
  updates, 
  subscribers 
}: { 
  updates: ScrapedContent[] 
  subscribers: Subscriber[] 
}): Promise<{
  sent: number
  failed: number
  errors: string[]
}> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[]
  }

  try {
    logInfo('Starting bulk email notifications', { 
      updatesCount: updates.length, 
      subscribersCount: subscribers.length 
    })

    // Send emails in batches to avoid rate limiting
    const batchSize = 50
    const batches = []
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      batches.push(subscribers.slice(i, i + batchSize))
    }

    for (const batch of batches) {
      const emailPromises = batch.map(async (subscriber) => {
        try {
          // For verified subscribers (who receive notifications), no token needed for unsubscribe
          const unsubscribeUrl = `${process.env.APP_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
          
          const emailHtml = await render(UpdateNotificationEmail({
            updates,
            unsubscribeUrl,
            timestamp: new Date()
          }))

          if (subscriber.email === 'israeligal2@gmail.com') {
            await resend.emails.send({
              from: FROM_EMAIL,
              to: 'israeligal2@gmail.com',
              subject: `עדכונים חדשים מאל על - ${new Date().toLocaleDateString('he-IL')}`,
              html: emailHtml,
            })
          }

          results.sent++
          logInfo('Email sent successfully', { email: subscriber.email })

        } catch (error) {
          results.failed++
          const errorMessage = `Failed to send to ${subscriber.email}: ${(error as Error).message}`
          results.errors.push(errorMessage)
          logError('Failed to send email', error as Error, { email: subscriber.email })
        }
      })

      await Promise.allSettled(emailPromises)
      
      // Small delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    logInfo('Bulk email notifications completed', results)
    return results

  } catch (error) {
    logError('Bulk email notification failed', error as Error)
    throw error
  }
}

export async function sendVerificationEmail({ 
  email, 
  verificationToken 
}: { 
  email: string 
  verificationToken: string 
}): Promise<void> {
  try {
    logInfo('Sending verification email', { email })

    const verificationUrl = `${process.env.APP_URL}/api/subscription/verify?email=${encodeURIComponent(email)}&token=${verificationToken}`
    
    const emailHtml = await render(VerificationEmail({
      email,
      verificationUrl
    }))

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'אמת את הרשמתך לעדכוני אל על',
      html: emailHtml,
    })

    logInfo('Verification email sent successfully', { email })

  } catch (error) {
    logError('Failed to send verification email', error as Error, { email })
    throw error
  }
}

export async function sendConfirmationEmail({ 
  email 
}: { 
  email: string 
}): Promise<void> {
  try {
    logInfo('Sending confirmation email', { email })

    const unsubscribeUrl = `${process.env.APP_URL}/unsubscribe?email=${encodeURIComponent(email)}`
    
    const emailHtml = await render(ConfirmationEmail({
      email,
      unsubscribeUrl
    }))

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'הרשמה הושלמה בהצלחה!',
      html: emailHtml,
    })

    logInfo('Confirmation email sent successfully', { email })

  } catch (error) {
    logError('Failed to send confirmation email', error as Error, { email })
    throw error
  }
}

