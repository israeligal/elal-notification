# El Al Notification System - Implementation Plan

## Project Overview
A real-time notification system that monitors El Al Airlines updates and sends email notifications to subscribers when new content is detected on their news page.

**Target URL**: https://www.elal.com/heb/about-elal/news/recent-updates

## Architecture Overview

### Core Components
1. **Web Scraper Service** - Monitors El Al updates page
2. **Subscription Management API** - Handles email subscriptions
3. **Email Notification Service** - Sends notifications via Resend
4. **Database Layer** - Stores subscriptions and change history
5. **Scheduled Jobs** - 10-minute interval checks via cron
6. **Frontend Interface** - Subscription management UI

## Phase 1: Foundation Setup (Database & Core Services)

### 1.1 Database Schema Design
```typescript
// Using Zod schemas and z.infer for type generation (following project guidelines)
import { z } from 'zod'

// Subscriber schema and type
export const subscriberSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  isActive: z.boolean(),
})
export type Subscriber = z.infer<typeof subscriberSchema>

// Update check schema and type
export const updateCheckSchema = z.object({
  id: z.string(),
  checkTimestamp: z.date(),
  contentHash: z.string(),
  hasChanged: z.boolean(),
  changeDetails: z.string().optional(),
})
export type UpdateCheck = z.infer<typeof updateCheckSchema>

// Update content schema and type
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

// Notification log schema and type
export const notificationLogSchema = z.object({
  id: z.string(),
  updateCheckId: z.string(),
  subscriberEmails: z.array(z.string()),
  sentAt: z.date(),
  status: z.enum(['sent', 'failed']),
})
export type NotificationLog = z.infer<typeof notificationLogSchema>
```

### 1.2 Core Services Setup
- Create database schema with Drizzle ORM
- Set up Resend email service configuration
- Create base service classes for scraping and notifications

## Phase 2: Web Scraping & Change Detection

### 2.1 El Al Page Scraper
- Implement web scraper using Puppeteer/Playwright for Hebrew content
- Extract complete content: titles, full text, dates, and URLs
- Parse Hebrew content with proper encoding
- Generate content hash for change detection
- Handle dynamic content loading and anti-bot measures
- Store full content for email inclusion

### 2.2 Change Detection Algorithm
- Compare current content hash with last stored hash
- Identify specific changes (new articles, updates)
- Store detailed change information for notifications

### 2.3 Alternative Monitoring Methods
- Check for RSS feeds or API endpoints
- Implement fallback scraping strategies
- Monitor meta tags and structured data

## Phase 3: Email Notification System

### 3.1 Email Service Integration
- Configure Resend service with custom domain
- Create rich email templates using React Email with full update content
- Implement Hebrew language support with proper RTL formatting
- Include update titles, full content, dates, and source links
- Support both HTML and plain text formats

### 3.2 Notification Logic
- Batch email sending to all active subscribers
- Rate limiting and retry mechanisms
- Unsubscribe link generation
- Email delivery tracking

## Phase 4: Subscription Management

### 4.1 API Endpoints
```typescript
POST /api/subscribe - Add new email subscription
DELETE /api/unsubscribe - Remove subscription
GET /api/subscription/verify - Email verification
POST /api/subscription/status - Check subscription status
```

### 4.2 Email Verification
- Double opt-in subscription process
- Verification email with secure tokens
- Automatic cleanup of unverified subscriptions

## Phase 5: Scheduled Monitoring

### 5.1 Cron Job Implementation
- 10-minute interval checks using Vercel Cron or GitHub Actions
- Error handling and retry logic
- Monitoring job health and performance

### 5.2 Backup Monitoring
- Multiple check intervals for reliability
- Failure detection and alerting
- Manual trigger capabilities

## Phase 6: Frontend Interface

### 6.1 Subscription Page
- Clean, mobile-first subscription form
- Real-time validation
- Success/error state handling
- Unsubscribe page

### 6.2 Admin Dashboard (Optional)
- Subscriber management
- Monitoring statistics
- Manual notification triggers
- System health monitoring

## Phase 7: Testing & Deployment

### 7.1 Testing Strategy
- Unit tests for core services
- Integration tests for email delivery
- Scraping reliability tests
- Load testing for subscriber management

### 7.2 Production Deployment
- Environment configuration (dev/prod)
- Database migrations
- Monitoring and logging setup
- Error tracking and alerting

## Technical Specifications

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM (NeonDB)
- **Email Service**: Resend with React Email templates
- **Web Scraping**: Puppeteer (headless browser automation)
- **Scheduling**: Vercel Cron or GitHub Actions
- **Package Manager**: PNPM
- **UI Framework**: Tailwind CSS + Shadcn UI components
- **Validation**: Zod schemas with z.infer types
- **Logging**: Better Stack (Logtail) structured logging
- **Language**: TypeScript

### File Structure
```
src/
├── app/
│   ├── api/
│   │   ├── subscribe/route.ts
│   │   ├── unsubscribe/route.ts
│   │   └── cron/check-updates/route.ts
│   ├── subscribe/page.tsx
│   └── unsubscribe/page.tsx
├── services/
│   ├── elal-scraper.service.ts
│   ├── email-notification.service.ts
│   └── subscription.service.ts
├── lib/
│   ├── db/
│   │   ├── schema.ts
│   │   └── connection.ts
│   └── utils/
├── types/
│   └── notification.type.ts
└── components/
    ├── subscribe-form/
    └── notification-status/
```

### Environment Variables
```env
DATABASE_URL=
RESEND_API_KEY=
NEXTAUTH_SECRET=
CRON_SECRET=
APP_URL=
```

## Risk Mitigation

### Anti-Bot Measures
- Rotate user agents and request headers
- Implement delays between requests
- Use residential proxies if needed
- Fallback to manual checking notifications

### Rate Limiting
- Respect El Al's robots.txt
- Implement exponential backoff
- Monitor for IP blocking

### Email Deliverability
- SPF/DKIM configuration
- Bounce handling
- Spam compliance (CAN-SPAM Act)
- Unsubscribe mechanisms

## Success Metrics
- Successful change detection rate (>95%)
- Email delivery rate (>98%)
- Response time for notifications (<5 minutes from change)
- Zero false positives
- Subscriber growth and retention

## Timeline Estimate
- **Phase 1-2**: 3-4 days (Foundation + Scraping)
- **Phase 3-4**: 2-3 days (Email + Subscriptions)
- **Phase 5-6**: 2-3 days (Scheduling + Frontend)
- **Phase 7**: 1-2 days (Testing + Deployment)

**Total Estimated Timeline**: 8-12 days

## Implementation Context - Critical Project Guidelines

### Code Quality & Architecture
- **Simple is king** - Keep all implementations straightforward, avoid over-engineering
- **Don't wrap functions** - Direct function calls, minimal abstraction layers
- **Use modules, not classes** - All services as functional modules with named exports
- **Object destructuring in parameters** - `function myFunc({ param1, param2 })` pattern
- **Prefer named exports** - `export function myFunction()` over default exports
- **Tree shaking optimization** - Import only what's needed

### Data & Validation
- **Don't add strict validations** - Keep validation minimal and flexible
- **Don't be strict about types** - Allow reasonable type flexibility
- **Use z.infer<typeof Schema>** - Generate types from Zod schemas instead of separate definitions
- **DB queries under organization** - All database operations properly scoped and organized

### React & Next.js Patterns
- **Mobile first** - All UI components designed mobile-first
- **Avoid useEffect** - Use server components, server actions, and URL search params
- **Minimize 'use client'** - Keep most components as React Server Components
- **RSC first approach** - Server components for data fetching, client components only when needed
- **Server actions for forms** - No traditional form handling with useState

### File Organization
- **Search for similar files first** - Check existing patterns before creating new files
- **Use existing types from @/types** - Reuse existing type definitions when possible
- **kebab-case directories** - `components/subscribe-form/`
- **PascalCase components** - `SubscribeForm.tsx`
- **Service naming** - `elal-scraper.service.ts`
- **Type files** - `notification.type.ts`

### Technical Standards
- **PNPM package manager** - Use `pnpm install` for all dependencies
- **Better Stack logging** - Add structured logging for monitoring
- **No test files** - Don't create test files unless specifically requested
- **Flexbox layouts** - Use flexbox for all layout implementations

## Next Steps
1. Analyze El Al website structure and anti-bot measures
2. Set up database schema and core services (following all naming conventions)
3. Implement web scraping with proper error handling and logging
4. Build email notification system with Hebrew RTL support
5. Create subscription management with minimal validation
6. Set up scheduled monitoring with Better Stack logging
7. Deploy and monitor system performance

---

*This plan strictly adheres to all project guidelines including mobile-first design, RSC-first architecture, proper file naming conventions, minimal useEffect usage, simple implementations, and the established tech stack with PNPM package management.* 