import { NextRequest, NextResponse } from 'next/server'
import { createSubscription } from '@/services/subscription.service'
import { sendVerificationEmail } from '@/services/email-notification.service'
import { subscribeRequestSchema } from '@/types/notification.type'
import { logInfo, logError } from '@/lib/utils/logger'
import { trackEvent } from '@/lib/utils/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request using Zod schema
    const validation = subscribeRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const { email } = validation.data

    logInfo('Processing subscription request', { email })

    // Track subscription attempt
    await trackEvent({
      distinctId: email,
      event: 'subscription_started',
      properties: {
        email_domain: email.split('@')[1],
        timestamp: new Date().toISOString(),
      }
    })

    // Create subscription
    const { subscriber, verificationToken } = await createSubscription({ email })

    // If already verified (reactivated verified user), no email needed
    if (!verificationToken) {
      logInfo('Reactivated already verified subscription', {
        email,
        subscriberId: subscriber.id
      })

      // Track subscription reactivation
      await trackEvent({
        distinctId: email,
        event: 'subscription_reactivated',
        properties: {
          subscriber_id: subscriber.id,
          email_domain: email.split('@')[1],
          timestamp: new Date().toISOString(),
        }
      })

      return NextResponse.json({
        success: true,
        message: 'You are already subscribed and will receive El Al updates.',
        alreadySubscribed: true
      })
    }

    // Send verification email - handle failure gracefully
    try {
      await sendVerificationEmail({ email, verificationToken })
      
      logInfo('Subscription created and verification email sent', { 
        email,
        subscriberId: subscriber.id 
      })

      // Track successful subscription creation with verification email sent
      await trackEvent({
        distinctId: email,
        event: 'subscription_created',
        properties: {
          subscriber_id: subscriber.id,
          email_domain: email.split('@')[1],
          verification_email_sent: true,
          timestamp: new Date().toISOString(),
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Subscription created. Please check your email to verify.',
        requiresVerification: true
      })

    } catch (emailError) {
      logError('Failed to send verification email', emailError as Error, { email })
      
      // Track subscription creation with failed verification email
      await trackEvent({
        distinctId: email,
        event: 'subscription_created',
        properties: {
          subscriber_id: subscriber.id,
          email_domain: email.split('@')[1],
          verification_email_sent: false,
          verification_email_error: (emailError as Error).message,
          timestamp: new Date().toISOString(),
        }
      })
      
      // Still return success but with different message
      return NextResponse.json({
        success: true,
        message: 'Subscription created, but we had trouble sending the verification email. Please try subscribing again.',
        requiresVerification: true,
        emailFailed: true
      })
    }

  } catch (error) {
    logError('Failed to process subscription', error as Error)
    
    // Track subscription failure
    await trackEvent({
      distinctId: 'unknown',
      event: 'subscription_failed',
      properties: {
        error_message: (error as Error).message,
        timestamp: new Date().toISOString(),
      }
    })
    
    if ((error as Error).message.includes('already subscribed')) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed and will receive El Al updates.',
        alreadySubscribed: true
      })
    }

    return NextResponse.json(
      { error: 'Failed to create subscription. Please try again.' },
      { status: 500 }
    )
  }
} 