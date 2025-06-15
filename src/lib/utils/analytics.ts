import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

export function getPostHogClient(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return null
  }

  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: 'https://eu.i.posthog.com',
    })
  }

  return posthogClient
}

export async function trackEvent({
  distinctId,
  event,
  properties = {}
}: {
  distinctId: string
  event: string
  properties?: Record<string, unknown>
}): Promise<void> {
  const client = getPostHogClient()
  
  if (!client) {
    console.warn('PostHog not configured - skipping event tracking')
    return
  }

  try {
    client.capture({
      distinctId,
      event,
      properties
    })
    
    await client.flush()
  } catch (error) {
    console.error('Failed to track PostHog event:', error)
  }
}

export async function shutdownPostHog(): Promise<void> {
  if (posthogClient) {
    await posthogClient.shutdown()
  }
} 