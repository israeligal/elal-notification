import { NextRequest, NextResponse } from 'next/server'
import { getSubscriptionStatus } from '@/services/subscription.service'
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

    logInfo('Checking subscription status', { email })

    const status = await getSubscriptionStatus({ email })

    return NextResponse.json({
      success: true,
      ...status
    })

  } catch (error) {
    logError('Failed to check subscription status', error as Error)
    
    return NextResponse.json(
      { error: 'Failed to check subscription status. Please try again.' },
      { status: 500 }
    )
  }
} 