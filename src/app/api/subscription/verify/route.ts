import { NextRequest, NextResponse } from 'next/server'
import { verifySubscription } from '@/services/subscription.service'
import { sendConfirmationEmail } from '@/services/email-notification.service'
import { logger } from '@/lib/utils/logger'
import { trackEvent } from '@/lib/utils/analytics'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Missing email or verification token' },
        { status: 400 }
      )
    }

    logger.info('Processing email verification', { email })

    await verifySubscription({ email, token })

    logger.info('Email verification successful', { email })

    // Track successful email verification
    await trackEvent({
      distinctId: email,
      event: 'email_verified',
      properties: {
        email_domain: email.split('@')[1],
        timestamp: new Date().toISOString(),
      }
    })

    // Send confirmation email after successful verification
    try {
      await sendConfirmationEmail({ email })
      logger.info('Confirmation email sent after verification', { email })

      // Track confirmation email sent
      await trackEvent({
        distinctId: email,
        event: 'confirmation_email_sent',
        properties: {
          email_domain: email.split('@')[1],
          timestamp: new Date().toISOString(),
        }
      })
    } catch (emailError) {
      // Log error but don't fail the verification process
      logger.error('Failed to send confirmation email after verification', { email, error: emailError })
      
      // Track confirmation email failure
      await trackEvent({
        distinctId: email,
        event: 'confirmation_email_failed',
        properties: {
          email_domain: email.split('@')[1],
          error_message: (emailError as Error).message,
          timestamp: new Date().toISOString(),
        }
      })
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/verification-success', request.url))

  } catch (error) {
    logger.error('Email verification failed', error as Error)
    
    // Track email verification failure
    await trackEvent({
      distinctId: request.nextUrl.searchParams.get('email') || 'unknown',
      event: 'email_verification_failed',
      properties: {
        error_message: (error as Error).message,
        timestamp: new Date().toISOString(),
      }
    })
    
    // Redirect to error page
    return NextResponse.redirect(new URL('/verification-error', request.url))
  }
} 