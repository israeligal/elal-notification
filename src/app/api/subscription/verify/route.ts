import { NextRequest, NextResponse } from 'next/server'
import { verifySubscription } from '@/services/subscription.service'
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

    // Redirect to success page
    return NextResponse.redirect(new URL('/verification-success', request.url))

  } catch (error) {
    logError('Email verification failed', error as Error)
    
    // Redirect to error page
    return NextResponse.redirect(new URL('/verification-error', request.url))
  }
} 