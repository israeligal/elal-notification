import { NextRequest, NextResponse } from 'next/server'
import { removeSubscription } from '@/services/subscription.service'
import { unsubscribeRequestSchema } from '@/types/notification.type'
import { logInfo, logError } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request using Zod schema
    const validation = unsubscribeRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const { email, token } = validation.data

    logInfo('Processing unsubscribe request', { email })

    await removeSubscription({ email, token })

    logInfo('Unsubscribe successful', { email })

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from El Al updates'
    })

  } catch (error) {
    logError('Unsubscribe failed', error as Error)
    
    if ((error as Error).message.includes('not found')) {
      return NextResponse.json(
        { error: 'Email not found in subscription list' },
        { status: 404 }
      )
    }

    if ((error as Error).message.includes('Invalid')) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to unsubscribe. Please try again.' },
      { status: 500 }
    )
  }
}

// Handle GET requests for unsubscribe links in emails
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.redirect(new URL('/unsubscribe-error', request.url))
    }

    // Redirect to unsubscribe page with email
    return NextResponse.redirect(new URL(`/unsubscribe?email=${encodeURIComponent(email)}`, request.url))

  } catch (error) {
    logError('Unsubscribe GET request failed', error as Error)
    return NextResponse.redirect(new URL('/unsubscribe-error', request.url))
  }
} 