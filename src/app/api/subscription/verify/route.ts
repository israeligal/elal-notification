import { NextRequest, NextResponse } from 'next/server'
import { verifySubscription } from '@/services/subscription.service'
import { sendConfirmationEmail } from '@/services/email-notification.service'
import { logInfo, logError } from '@/lib/utils/logger'

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

    logInfo('Processing email verification', { email })

    await verifySubscription({ email, token })

    logInfo('Email verification successful', { email })

    // Send confirmation email after successful verification
    try {
      await sendConfirmationEmail({ email })
      logInfo('Confirmation email sent after verification', { email })
    } catch (emailError) {
      // Log error but don't fail the verification process
      logError('Failed to send confirmation email after verification', emailError as Error, { email })
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/verification-success', request.url))

  } catch (error) {
    logError('Email verification failed', error as Error)
    
    // Redirect to error page
    return NextResponse.redirect(new URL('/verification-error', request.url))
  }
} 