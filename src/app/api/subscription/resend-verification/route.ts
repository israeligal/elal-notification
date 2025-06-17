import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, subscribers } from '@/lib/db/connection'
import { sendVerificationEmail } from '@/services/email-notification.service'
import { generateVerificationToken } from '@/lib/utils/crypto'
import { subscribeRequestSchema } from '@/types/notification.type'
import { logger } from '@/lib/utils/logger'

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

    logger.info('Processing resend verification request', { email })

    // Find subscriber
    const existingSubscriber = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .limit(1)

    if (!existingSubscriber.length) {
      return NextResponse.json(
        { error: 'Email not found. Please subscribe first.' },
        { status: 404 }
      )
    }

    const subscriber = existingSubscriber[0]

    // Check if already verified
    if (subscriber.verifiedAt) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified. You will receive updates.',
        alreadyVerified: true
      })
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken()
    
    // Update subscriber with new token
    await db
      .update(subscribers)
      .set({
        verificationToken,
        isActive: true
      })
      .where(eq(subscribers.id, subscriber.id))

    // Send verification email
    try {
      await sendVerificationEmail({ email, verificationToken })
      
      logger.info('Verification email resent successfully', { email })

      return NextResponse.json({
        success: true,
        message: 'Verification email sent. Please check your inbox.',
        requiresVerification: true
      })

    } catch (emailError) {
      logger.error('Failed to resend verification email', { email, error: emailError })
      
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      )
    }

  } catch (error) {
    logger.error('Failed to process resend verification', error as Error)
    
    return NextResponse.json(
      { error: 'Failed to resend verification. Please try again.' },
      { status: 500 }
    )
  }
} 