import { NextRequest, NextResponse } from 'next/server'
import { createSubscription } from '@/services/subscription.service'
import { sendConfirmationEmail } from '@/services/email-notification.service'
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

    // Create subscription (immediately active)
    const subscriber = await createSubscription({ email })

    // Send confirmation email
    await sendConfirmationEmail({ email })

    logInfo('Subscription created and confirmation email sent', { 
      email,
      subscriberId: subscriber.id 
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription successful! Welcome to El Al updates.',
      requiresVerification: false
    })

  } catch (error) {
    logError('Failed to process subscription', error as Error)
    
    if ((error as Error).message.includes('already subscribed')) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create subscription. Please try again.' },
      { status: 500 }
    )
  }
} 