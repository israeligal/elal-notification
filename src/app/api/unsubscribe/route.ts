import { NextRequest, NextResponse } from 'next/server'
import { removeSubscription } from '@/services/subscription.service'
import { unsubscribeRequestSchema } from '@/types/notification.type'
import { logger } from '@/lib/utils/logger'
import { trackEvent } from '@/lib/utils/analytics'

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

    logger.info('Processing unsubscribe request', { email })

    await removeSubscription({ email, token })

    logger.info('Unsubscribe successful', { email })

    // Track successful unsubscribe
    await trackEvent({
      distinctId: email,
      event: 'unsubscribed',
      properties: {
        email_domain: email.split('@')[1],
        had_token: !!token,
        timestamp: new Date().toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from El Al updates'
    })

  } catch (error) {
    logger.error('Unsubscribe failed', error as Error)
    
    // Track unsubscribe failure
    await trackEvent({
      distinctId: 'unknown',
      event: 'unsubscribe_failed',
      properties: {
        error_message: (error as Error).message,
        timestamp: new Date().toISOString(),
      }
    })
    
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
    const token = searchParams.get('token')

    if (!email) {
      return NextResponse.redirect(new URL('/unsubscribe-error', request.url))
    }

    // Track unsubscribe link click
    await trackEvent({
      distinctId: email,
      event: 'unsubscribe_link_clicked',
      properties: {
        email_domain: email.split('@')[1],
        had_token: !!token,
        source: 'email_link',
        timestamp: new Date().toISOString(),
      }
    })

    // Build redirect URL with both email and token (if provided)
    const unsubscribePageUrl = new URL('/unsubscribe', request.url)
    unsubscribePageUrl.searchParams.set('email', email)
    if (token) {
      unsubscribePageUrl.searchParams.set('token', token)
    }

    return NextResponse.redirect(unsubscribePageUrl)

  } catch (error) {
    logger.error('Unsubscribe GET request failed', error as Error)
    return NextResponse.redirect(new URL('/unsubscribe-error', request.url))
  }
} 