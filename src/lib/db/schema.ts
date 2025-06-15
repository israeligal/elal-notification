import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Subscribers table - manages email subscriptions
export const subscribers = pgTable('subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
  verifiedAt: timestamp('verified_at'),
  verificationToken: text('verification_token'),
})

// Update checks table - tracks monitoring runs
export const updateChecks = pgTable('update_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  checkTimestamp: timestamp('check_timestamp').notNull().defaultNow(),
  contentHash: text('content_hash').notNull(),
  hasChanged: boolean('has_changed').notNull().default(false),
  changeDetails: text('change_details'),
})

// Update content table - stores actual content for emails
export const updateContent = pgTable('update_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  updateCheckId: uuid('update_check_id').notNull().references(() => updateChecks.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  publishDate: timestamp('publish_date'),
  url: text('url'),
  isNew: boolean('is_new').notNull().default(true),
})

// Notification logs table - tracks email sending
export const notificationLogs = pgTable('notification_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  updateCheckId: uuid('update_check_id').notNull().references(() => updateChecks.id),
  subscriberEmails: text('subscriber_emails').array().notNull(),
  sentAt: timestamp('sent_at').notNull().defaultNow(),
  status: text('status').$type<'sent' | 'failed'>().notNull(),
  errorMessage: text('error_message'),
})

// Relations for better querying
export const updateChecksRelations = relations(updateChecks, ({ many }) => ({
  content: many(updateContent),
  notifications: many(notificationLogs),
}))

export const updateContentRelations = relations(updateContent, ({ one }) => ({
  updateCheck: one(updateChecks, {
    fields: [updateContent.updateCheckId],
    references: [updateChecks.id],
  }),
}))

export const notificationLogsRelations = relations(notificationLogs, ({ one }) => ({
  updateCheck: one(updateChecks, {
    fields: [notificationLogs.updateCheckId],
    references: [updateChecks.id],
  }),
})) 