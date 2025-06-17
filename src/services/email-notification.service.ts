import { Resend } from 'resend'
import { render } from '@react-email/render'
import { logInfo, logError } from '@/lib/utils/logger'
import { UpdateNotificationEmail } from '@/components/emails/UpdateNotificationEmail'
import { VerificationEmail } from '@/components/emails/VerificationEmail'
import { ConfirmationEmail } from '@/components/emails/ConfirmationEmail'
import type { ScrapedContent, Subscriber } from '@/types/notification.type'
import { trackEvent } from '@/lib/utils/analytics'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required')
}

if (!process.env.APP_URL) {
  throw new Error('APP_URL environment variable is required')
}

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.FROM_EMAIL || 'notifications@flightfare.pro'

async function sendEmailWithRetry(
  subscriber: Subscriber,
  updates: ScrapedContent[]
): Promise<{ success: boolean; error?: string }> {
  const unsubscribeUrl = `${process.env.APP_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
  
  const emailHtml = await render(UpdateNotificationEmail({
    updates,
    unsubscribeUrl,
    timestamp: new Date()
  }))

  try {
    if (process.env.SEND_EMAIL_ENABLED) {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: subscriber.email,
        subject: `עדכונים חדשים מאל על - ${new Date().toLocaleDateString('he-IL')}`,
        html: emailHtml,
      })
      if (error) {
        throw new Error(error.message)
      }
    } else {
      await trackEvent({
        distinctId: 'system',
        event: 'scrape_elal_updates_with_puppeteer_html',
        properties: {
          disabled: true,
          timestamp: new Date().toISOString(),
        }
      })
    }

    return { success: true }
  } catch (error) {
    const errorMessage = (error as Error).message
    
    // Only retry if it's a rate limit error
    const isRateLimit = errorMessage?.toLowerCase().includes('rate') || 
                       errorMessage?.toLowerCase().includes('limit') ||
                       errorMessage?.toLowerCase().includes('429')

    if (isRateLimit) {
      logInfo('Rate limit detected, retrying after 600ms', { email: subscriber.email, error: errorMessage })
      await new Promise(resolve => setTimeout(resolve, 600))
      
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: subscriber.email,
          subject: `עדכונים חדשים מאל על - ${new Date().toLocaleDateString('he-IL')}`,
          html: emailHtml,
        })
        return { success: true }
      } catch (retryError) {
        logError('Retry failed after rate limit', retryError as Error, { email: subscriber.email })
        return { success: false, error: (retryError as Error).message }
      }
    }

    logError('Error sending email', error as Error, { email: subscriber.email })

    // For non-rate-limit errors, don't retry
    await trackEvent({
      distinctId: 'system',
      event: 'error_scrape_elal_updates_with_puppeteer_html',
      properties: {
        error: error,
        email: subscriber.email,
        timestamp: new Date().toISOString(),
      }
    })
    
    return { success: false, error: errorMessage }
  }
}

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
    logInfo('Starting bulk email notifications with rate limiting', { 
      updatesCount: updates.length, 
      subscribersCount: subscribers.length,
      estimatedTimeMinutes: Math.ceil(subscribers.length / 2 / 60) // 2 emails per second
    })

    // Process emails one by one to respect 2 emails/second crate limit
    // This gives us precise control over timing
    for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i]
      
      logInfo('Sending email', { 
        email: subscriber.email,
        progress: `${i + 1}/${subscribers.length}`,
        estimatedRemainingSeconds: Math.ceil((subscribers.length - i - 1) * 0.5)
      })

      const result = await sendEmailWithRetry(subscriber, updates)
      
      if (result.success) {
        results.sent++
        logInfo('Email sent successfully', { 
          email: subscriber.email,
          progress: `${results.sent}/${subscribers.length}`
        })
      } else {
        results.failed++
        const errorMessage = `Failed to send to ${subscriber.email}: ${result.error}`
        results.errors.push(errorMessage)
        logError('Failed to send email after retries', new Error(result.error || 'Unknown error'), { 
          email: subscriber.email
        })
      }

      // Rate limiting: Wait 500ms between emails (2 emails per second)
      // Only add delay if not the last email
      if (i < subscribers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    logInfo('Bulk email notifications completed', results)
    return results

  } catch (error) {
    await trackEvent({
      distinctId: 'system',
      event: 'error_scrape_elal_updates_with_puppeteer_html',
      properties: {
        error: error,
        timestamp: new Date().toISOString(),
      }
    })
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

