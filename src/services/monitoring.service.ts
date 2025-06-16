import { desc, count } from 'drizzle-orm'
import { db, updateChecks, updateContent, notificationLogs } from '@/lib/db/connection'
import { checkForUpdatesWithFallback } from '@/services/scraper-factory.service'
import { getActiveSubscribers } from '@/services/subscription.service'
import { sendUpdateNotifications } from '@/services/email-notification.service'
import { logInfo, logError } from '@/lib/utils/logger'

export async function performMonitoringCheck(): Promise<{
  success: boolean
  hasUpdates: boolean
  updateCount: number
  notificationsSent?: number
  error?: string
}> {
  try {
    logInfo('Starting monitoring check')

    // Get the last check's content hash
    const lastCheck = await db
      .select()
      .from(updateChecks)
      .orderBy(desc(updateChecks.checkTimestamp))
      .limit(1)

    const previousHash = lastCheck.length > 0 ? lastCheck[0].contentHash : undefined

    // Check for updates using scraper factory (with feature flags)
    const { hasChanged, contentHash, updates, changeDetails, scrapeMethod } = await checkForUpdatesWithFallback({ 
      previousHash 
    })

    // Create update check record
    const updateCheckRecord = await db
      .insert(updateChecks)
      .values({
        contentHash,
        hasChanged,
        changeDetails
      })
      .returning()

    const updateCheckId = updateCheckRecord[0].id

    // Store update content if there are changes
    if (hasChanged && updates.length > 0) {
      logInfo('Updates detected, storing content', { 
        updateCount: updates.length,
        scrapeMethod: scrapeMethod || 'unknown'
      })

      // Store each update
      await Promise.all(
        updates.map(async (update) => {
          return db.insert(updateContent).values({
            updateCheckId,
            title: update.title,
            content: update.content,
            publishDate: update.publishDate ? new Date(update.publishDate) : null,
            url: update.url,
            isNew: true
          })
        })
      )

      // Send notifications if there are active subscribers
      const activeSubscribers = await getActiveSubscribers()
      
      if (activeSubscribers.length > 0) {
        logInfo('Sending notifications to subscribers', { 
          subscriberCount: activeSubscribers.length 
        })

        const { sent, failed } = await sendUpdateNotifications({
          updates,
          subscribers: activeSubscribers
        })

        // Log notification results
        const subscriberEmails = activeSubscribers.map(sub => sub.email)
        await db.insert(notificationLogs).values({
          updateCheckId,
          subscriberEmails,
          status: sent > 0 ? 'sent' : 'failed',
          errorMessage: failed > 0 ? `${failed} out of ${activeSubscribers.length} emails failed to send` : null
        })

        logInfo('Monitoring check completed with notifications', {
          updateCount: updates.length,
          notificationsSent: sent,
          notificationsFailed: failed,
          scrapeMethod: scrapeMethod || 'unknown'
        })

        return {
          success: true,
          hasUpdates: true,
          updateCount: updates.length,
          notificationsSent: sent
        }
      } else {
        logInfo('No active subscribers to notify')
        
        return {
          success: true,
          hasUpdates: true,
          updateCount: updates.length,
          notificationsSent: 0
        }
      }
    } else {
      logInfo('No updates detected')
      
      return {
        success: true,
        hasUpdates: false,
        updateCount: 0
      }
    }

  } catch (error) {
    logError('Monitoring check failed', error as Error)
    
    return {
      success: false,
      hasUpdates: false,
      updateCount: 0,
      error: (error as Error).message
    }
  }
}

export async function getMonitoringStatus(): Promise<{
  lastCheck?: Date
  totalChecks: number
  totalNotifications: number
  activeSubscribers: number
}> {
  try {
    const [lastCheckResult, totalChecksResult, totalNotificationsResult, activeSubscribersResult] = await Promise.all([
      // Last check
      db.select().from(updateChecks).orderBy(desc(updateChecks.checkTimestamp)).limit(1),
      // Total checks
      db.select({ count: count() }).from(updateChecks),
      // Total notifications
      db.select({ count: count() }).from(notificationLogs),
      // Active subscribers
      getActiveSubscribers()
    ])

    return {
      lastCheck: lastCheckResult.length > 0 ? lastCheckResult[0].checkTimestamp : undefined,
      totalChecks: Number(totalChecksResult[0]?.count || 0),
      totalNotifications: Number(totalNotificationsResult[0]?.count || 0),
      activeSubscribers: activeSubscribersResult.length
    }

  } catch (error) {
    logError('Failed to get monitoring status', error as Error)
    throw error
  }
} 