import { z } from 'zod'

// Subscriber schema and type - handles email subscriptions
export const subscriberSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  isActive: z.boolean(),
  verifiedAt: z.date().optional(),
  verificationToken: z.string().optional(),
})
export type Subscriber = z.infer<typeof subscriberSchema>

// Update check schema and type - tracks monitoring runs
export const updateCheckSchema = z.object({
  id: z.string(),
  checkTimestamp: z.date(),
  contentHash: z.string(),
  hasChanged: z.boolean(),
  changeDetails: z.string().optional(),
})
export type UpdateCheck = z.infer<typeof updateCheckSchema>

// Update content schema and type - stores actual content for emails
export const updateContentSchema = z.object({
  id: z.string(),
  updateCheckId: z.string(),
  title: z.string(),
  content: z.string(),
  publishDate: z.date().optional(),
  url: z.string().optional(),
  isNew: z.boolean(),
})
export type UpdateContent = z.infer<typeof updateContentSchema>

// Notification log schema and type - tracks email sending
export const notificationLogSchema = z.object({
  id: z.string(),
  updateCheckId: z.string(),
  subscriberEmails: z.array(z.string()),
  sentAt: z.date(),
  status: z.enum(['sent', 'failed']),
  errorMessage: z.string().optional(),
})
export type NotificationLog = z.infer<typeof notificationLogSchema>

// API request/response schemas
export const subscribeRequestSchema = z.object({
  email: z.string().email(),
})
export type SubscribeRequest = z.infer<typeof subscribeRequestSchema>

export const unsubscribeRequestSchema = z.object({
  email: z.string().email(),
  token: z.string().optional(),
})
export type UnsubscribeRequest = z.infer<typeof unsubscribeRequestSchema>

// Scraped content structure
export const scrapedContentSchema = z.object({
  title: z.string(),
  content: z.string(),
  publishDate: z.string().optional(),
  url: z.string().optional(),
  metadata: z.object({
    category: z.string().optional(),
    importance: z.enum(["low", "medium", "high"]).optional(),
    extractedAt: z.string().optional(),
    extractionMethod: z.enum(["playwright", "stagehand"]).optional(),
  }).optional(),
})
export type ScrapedContent = z.infer<typeof scrapedContentSchema>

// Email template data
export const emailTemplateDataSchema = z.object({
  updates: z.array(scrapedContentSchema),
  unsubscribeUrl: z.string(),
  timestamp: z.date(),
})
export type EmailTemplateData = z.infer<typeof emailTemplateDataSchema> 