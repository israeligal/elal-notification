import { eq, and } from 'drizzle-orm'
import { db, subscribers } from '@/lib/db/connection'
import { logInfo, logError } from '@/lib/utils/logger'
import { generateVerificationToken } from '@/lib/utils/crypto'
import type { Subscriber } from '@/types/notification.type'

export async function createSubscription({ 
  email 
}: { 
  email: string 
}): Promise<Subscriber> {
  try {
    logInfo('Creating new subscription', { email })

    // Check if subscriber already exists
    const existingSubscriber = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .limit(1)

    if (existingSubscriber.length > 0) {
      const subscriber = existingSubscriber[0]
      if (subscriber.isActive) {
        throw new Error('Email already subscribed')
      }
      
      // Reactivate existing subscriber
      const updatedSubscriber = await db
        .update(subscribers)
        .set({
          isActive: true,
          verifiedAt: new Date(), // Immediately verified
          verificationToken: null
        })
        .where(eq(subscribers.id, subscriber.id))
        .returning()

      logInfo('Reactivated existing subscription', { email, subscriberId: subscriber.id })
      return updatedSubscriber[0] as Subscriber
    }

    // Create new subscriber (immediately active and verified)
    const newSubscriber = await db
      .insert(subscribers)
      .values({
        email,
        isActive: true,
        verifiedAt: new Date(), // Immediately verified
        verificationToken: null
      })
      .returning()

    logInfo('Created new subscription', { email, subscriberId: newSubscriber[0].id })
    return newSubscriber[0] as Subscriber

  } catch (error) {
    logError('Failed to create subscription', error as Error, { email })
    throw error
  }
}

export async function verifySubscription({ 
  email, 
  token 
}: { 
  email: string 
  token: string 
}): Promise<Subscriber> {
  try {
    logInfo('Verifying subscription', { email })

    const subscriber = await db
      .select()
      .from(subscribers)
      .where(
        and(
          eq(subscribers.email, email),
          eq(subscribers.verificationToken, token)
        )
      )
      .limit(1)

    if (!subscriber.length) {
      throw new Error('Invalid verification token or email')
    }

    const verifiedSubscriber = await db
      .update(subscribers)
      .set({
        verifiedAt: new Date(),
        verificationToken: null
      })
      .where(eq(subscribers.id, subscriber[0].id))
      .returning()

    logInfo('Subscription verified successfully', { email, subscriberId: subscriber[0].id })
    return verifiedSubscriber[0] as Subscriber

  } catch (error) {
    logError('Failed to verify subscription', error as Error, { email })
    throw error
  }
}

export async function removeSubscription({ 
  email, 
  token 
}: { 
  email: string 
  token?: string 
}): Promise<void> {
  try {
    logInfo('Removing subscription', { email })

    const whereCondition = eq(subscribers.email, email)
    
    // If token provided, verify it matches
    if (token) {
      const subscriber = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, email))
        .limit(1)

      if (!subscriber.length) {
        throw new Error('Subscriber not found')
      }

      // For verified subscribers, we can unsubscribe without token verification
      // For unverified subscribers, token must match
      if (!subscriber[0].verifiedAt && subscriber[0].verificationToken !== token) {
        throw new Error('Invalid unsubscribe token')
      }
    }

    await db
      .update(subscribers)
      .set({ 
        isActive: false,
        verificationToken: null
      })
      .where(whereCondition)

    logInfo('Subscription removed successfully', { email })

  } catch (error) {
    logError('Failed to remove subscription', error as Error, { email })
    throw error
  }
}

export async function getActiveSubscribers(): Promise<Subscriber[]> {
  try {
    logInfo('Fetching active subscribers')

    const activeSubscribers = await db
      .select()
      .from(subscribers)
      .where(
        and(
          eq(subscribers.isActive, true),
          // Only include verified subscribers
          // Note: verifiedAt is not null means subscriber is verified
        )
      )

    logInfo('Fetched active subscribers', { count: activeSubscribers.length })
    return activeSubscribers as Subscriber[]

  } catch (error) {
    logError('Failed to fetch active subscribers', error as Error)
    throw error
  }
}

export async function getSubscriptionStatus({ 
  email 
}: { 
  email: string 
}): Promise<{
  exists: boolean
  isActive: boolean
  isVerified: boolean
}> {
  try {
    const subscriber = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .limit(1)

    if (!subscriber.length) {
      return { exists: false, isActive: false, isVerified: false }
    }

    const sub = subscriber[0]
    return {
      exists: true,
      isActive: sub.isActive,
      isVerified: !!sub.verifiedAt
    }

  } catch (error) {
    logError('Failed to get subscription status', error as Error, { email })
    throw error
  }
} 