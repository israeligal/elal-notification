import { NextRequest, NextResponse } from 'next/server'
import { performMonitoringCheck } from '@/services/monitoring.service'
import { logger } from '@/lib/utils/logger'
import { trackEvent } from '@/lib/utils/analytics'


export const maxDuration = 500;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      logger.error('CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Cron job not properly configured' },
        { status: 500 }
      )
    }

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      logger.error('Unauthorized cron job access attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Starting scheduled monitoring check')

    const result = await performMonitoringCheck()

    if (result.success) {
      logger.info('Scheduled monitoring check completed successfully', result)
      
      // Track successful monitoring check
      await trackEvent({
        distinctId: 'system',
        event: 'monitoring_check_success',
        properties: {
          has_changes: result.hasUpdates || false,
          changes_count: result.updateCount || 0,
          notifications_sent: result.notificationsSent || 0,
          timestamp: new Date().toISOString(),
        }
      })
      
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        ...result
      })
    } else {
      logger.error('Scheduled monitoring check failed', { error: result.error })
      
      // Track failed monitoring check
      await trackEvent({
        distinctId: 'system',
        event: 'monitoring_check_failed',
        properties: {
          error_message: result.error,
          timestamp: new Date().toISOString(),
        }
      })
      
      return NextResponse.json({
        success: false,
        timestamp: new Date().toISOString(),
        error: result.error
      }, { status: 500 })
    }

  } catch (error) {
    logger.error('Cron job endpoint failed', error as Error)
    
    // Track cron job endpoint failure
    await trackEvent({
      distinctId: 'system',
      event: 'cron_job_failed',
      properties: {
        error_message: (error as Error).message,
        timestamp: new Date().toISOString(),
      }
    })
    
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