import { NextRequest, NextResponse } from 'next/server'
import { performMonitoringCheck } from '@/services/monitoring.service'
import { logInfo, logError } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      logError('CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Cron job not properly configured' },
        { status: 500 }
      )
    }

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      logError('Unauthorized cron job access attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logInfo('Starting scheduled monitoring check')

    const result = await performMonitoringCheck()

    if (result.success) {
      logInfo('Scheduled monitoring check completed successfully', result)
      
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        ...result
      })
    } else {
      logError('Scheduled monitoring check failed', new Error(result.error))
      
      return NextResponse.json({
        success: false,
        timestamp: new Date().toISOString(),
        error: result.error
      }, { status: 500 })
    }

  } catch (error) {
    logError('Cron job endpoint failed', error as Error)
    
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Also handle POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
} 