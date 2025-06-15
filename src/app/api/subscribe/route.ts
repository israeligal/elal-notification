import { NextRequest, NextResponse } from 'next/server'
import { createSubscription } from '@/services/subscription.service'
import { sendVerificationEmail } from '@/services/email-notification.service'
import { subscribeRequestSchema } from '@/types/notification.type'
import { logInfo, logError } from '@/lib/utils/logger'

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

    // Create subscription
    const { subscriber, verificationToken } = await createSubscription({ email })

    // Send verification email - handle failure gracefully
    try {
      await sendVerificationEmail({ email, verificationToken })
      
      logInfo('Subscription created and verification email sent', { 
        email,
        subscriberId: subscriber.id 
      })

      return NextResponse.json({
        success: true,
        message: 'Subscription created. Please check your email to verify.',
        requiresVerification: true
      })

    } catch (emailError) {
      logError('Failed to send verification email', emailError as Error, { email })
      
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