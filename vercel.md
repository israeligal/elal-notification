# Stagehand to Puppeteer Migration Plan for Vercel Deployment

## Problem Statement
The current Stagehand implementation is failing with initialization errors on Vercel. The error indicates that the `page` object is being accessed before `stagehand.init()` is called. To ensure reliable deployment on Vercel, we need to migrate from Stagehand to a Puppeteer-based solution that works seamlessly with Vercel's serverless environment.

## Migration Strategy Overview
Replace Stagehand with a Puppeteer solution using:
- `@sparticuz/chromium-min` for production (Vercel)
- `puppeteer` for local development
- Keep existing AI-powered content extraction using Anthropic Claude
- Maintain same API structure for minimal disruption
- **Follow project guidelines**: Simple, no tests, use existing types, object destructuring, named exports

## Step-by-Step Migration Plan

### Phase 1: Install Dependencies

#### 1.1 Install Puppeteer Dependencies
```bash
pnpm add @sparticuz/chromium-min puppeteer-core puppeteer
```

#### 1.2 Remove Stagehand Dependencies
```bash
pnpm remove @browserbasehq/stagehand @browserbasehq/sdk
```

### Phase 2: Create Puppeteer Service

#### 2.1 Create Browser Manager Service
**File**: `src/lib/puppeteer/browser-manager.ts`
- Use **modules not classes** (per guidelines)
- **Named exports** only (per guidelines) 
- **Object destructuring** for parameters (per guidelines)
- **Simple implementation** (per guidelines)

**Code Example**:
```typescript
import chromium from "@sparticuz/chromium-min";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";

const chromiumPack = "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

let browser: any = null;

export async function getBrowser() {
  if (browser) return browser;

  if (process.env.NEXT_PUBLIC_VERCEL_ENVIRONMENT === "production") {
    browser = await puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(chromiumPack),
      headless: true,
    });
  } else {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
  }
  return browser;
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export async function createPage() {
  const browserInstance = await getBrowser();
  return await browserInstance.newPage();
}
```

#### 2.2 Create Puppeteer Configuration (Optional - Keep Simple)
**File**: `src/lib/puppeteer/config.ts`
```typescript
export const PUPPETEER_CONFIG = {
  timeout: 30000,
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
} as const;
```

### Phase 3: Replace Stagehand Scraper Service

#### 3.1 Create New Puppeteer Scraper Service  
**File**: `src/services/elal-puppeteer-scraper.service.ts`
- **Use existing types** from `@/types/notification.type` (per guidelines)
- **Object destructuring** for parameters (per guidelines)
- **Named exports** only (per guidelines)
- **Keep same function signatures** for compatibility

**Complete Implementation** (exactly like Stagehand but with Puppeteer):
```typescript
import { z } from "zod";
import { createHash } from "crypto";
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getBrowser } from "@/lib/puppeteer/browser-manager";
import type { ScrapedContent } from "@/types/notification.type";
import { logInfo } from "@/lib/utils/logger";

const ELAL_URL = 'https://www.elal.com/eng/about-elal/news/recent-updates';

// Exact same schemas as Stagehand version
const NewsExtractionSchema = z.object({
  updates: z.array(z.object({
    title: z.string().describe('A short title summarizing the update in Hebrew'),
    content: z.string().describe('The full content of the news update in Hebrew'),
    updatedAt: z.string().optional().describe('Date/time if mentioned in the content')
  })),
  totalCount: z.number().describe('Total number of news updates found')
});

const UpdateComparisonSchema = z.object({
  hasChanged: z.boolean().describe('Whether there are meaningful changes between the two sets of content'),
  changeDetails: z.string().optional().describe('Description of what changed in Hebrew'),
  newUpdates: z.array(z.string()).describe('List of completely new update titles that were not present before'),
  modifiedUpdates: z.array(z.string()).describe('List of update titles that were modified'),
  significance: z.enum(['major', 'minor', 'none']).describe('Significance level of the changes')
});

// Exact same HTML cleaning function from Stagehand version
function cleanHtml(html: string): string {
  const cleaned = html
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags and their content  
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove common tracking/analytics elements
    .replace(/<iframe[^>]*>/gi, '')
    .replace(/<\/iframe>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
    // Remove CSS classes and IDs to reduce noise
    .replace(/\s(class|id)="[^"]*"/gi, '')
    // Remove inline styles
    .replace(/\sstyle="[^"]*"/gi, '')
    // Remove data attributes
    .replace(/\sdata-[^=]*="[^"]*"/gi, '')
    // Remove angular attributes
    .replace(/\s_ng[^=]*="[^"]*"/gi, '')
    .replace(/\sng-[^=]*="[^"]*"/gi, '')
    // Remove aria-label and other accessibility attributes that might have noise
    .replace(/\saria-[^=]*="[^"]*"/gi, '')
    .replace(/\srole="[^"]*"/gi, '')
    .replace(/\stabindex="[^"]*"/gi, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><');

  return cleaned;
}

export async function scrapeElAlUpdatesWithPuppeteer(): Promise<ScrapedContent[]> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    logInfo('Navigating to El Al updates page', { url: ELAL_URL });
    await page.goto(ELAL_URL);
    
    // Wait for page to load completely (same as Stagehand)
    await page.waitForTimeout(5000);
    
    logInfo('Getting raw HTML content from page');
    const rawHtml = await page.content();
    
    logInfo('Cleaning HTML content', { originalLength: rawHtml.length });
    const cleanedHtml = cleanHtml(rawHtml);
    logInfo('HTML cleaned', { cleanedLength: cleanedHtml.length });

    // Use AI SDK with Anthropic to extract news points (exact same as Stagehand)
    logInfo('Using AI SDK with Anthropic to extract Hebrew news updates');
    
    const result = await generateObject({
      model: anthropic('claude-3-haiku-20240307'),
      schema: NewsExtractionSchema,
      prompt: `
        You are analyzing the HTML content of El Al Airlines' Hebrew news/updates page.
        
        The page contains security updates and flight information in Hebrew.
        
        Please extract all the news updates/bullet points from this HTML content. Focus on:
        1. Hebrew text content that represents news updates or announcements
        2. Bullet points (li elements) containing security updates
        3. Information about flight cancellations, changes, or important announcements
        4. Date/time information if available
        
        For each update:
        - Create a short, descriptive title in Hebrew (10-15 words max)
        - Include the full content in Hebrew
        - Extract any date/time information if present
        
        Ignore navigation menus, footers, headers, and promotional content.
        Focus only on the main news content.
        
        HTML Content:
        ${cleanedHtml}
      `,
    });

    logInfo('AI extraction completed', { extractedCount: result.object.updates.length });
    logInfo('AI extraction result', { result: result.object });

    const articles: ScrapedContent[] = result.object.updates.map((update: { title: string; content: string; updatedAt?: string }) => ({
      title: update.title,
      content: update.content,
      updatedAt: update.updatedAt
    }));

    logInfo('Successfully extracted articles using AI SDK', { count: articles.length });
    return articles;

  } catch (error) {
    logInfo('Error during AI-powered scraping', { error: (error as Error).message });
    throw error;
  } finally {
    await page.close();
  }
}

export async function checkForUpdatesWithPuppeteer({ 
  previousUpdates = [] 
}: { 
  previousUpdates?: ScrapedContent[] 
} = {}) {
  const currentUpdates = await scrapeElAlUpdatesWithPuppeteer();
  
  const isFirstRun = previousUpdates.length === 0;

  const contentHash = createHash('sha256')
    .update(JSON.stringify(currentUpdates.map(({ title, content }) => ({ title, content: content.substring(0, 200) }))))
    .digest('hex');

  // For first run, just return the updates without AI comparison (exact same logic)
  if (isFirstRun) {
    logInfo('First run - returning updates without comparison', { 
      currentCount: currentUpdates.length
    });

    return {
      hasChanged: currentUpdates.length > 0,
      contentHash,
      updates: currentUpdates,
      changeDetails: currentUpdates.length > 0 ? `נמצאו ${currentUpdates.length} עדכונים חדשים` : 'לא נמצאו עדכונים',
      significance: currentUpdates.length > 0 ? 'major' as const : 'none' as const,
      newUpdates: currentUpdates.map(u => u.title),
      modifiedUpdates: [] as string[]
    };
  }

  // Use AI to compare with previous updates (exact same logic)
  logInfo('Using AI to compare current updates with previous updates', { 
    currentCount: currentUpdates.length,
    previousCount: previousUpdates.length
  });
  
  const comparison = await generateObject({
    model: anthropic('claude-3-haiku-20240307'),
    schema: UpdateComparisonSchema,
    prompt: `
      You are analyzing Hebrew news updates from El Al Airlines.
      
      Compare previous with current updates for meaningful changes.
      Focus on: new flights affected, security changes, date changes, new restrictions.
      Ignore: minor wording, formatting, reordering.
      
      Set significance levels:
      - 'major': New flight cancellations, security updates, policy changes, new restrictions
      - 'minor': Small text changes, date formatting, minor clarifications
      - 'none': No meaningful changes
      
      PREVIOUS Updates:
      ${previousUpdates.map((update, i) => `${i + 1}. ${update.title}\n   ${update.content}`).join('\n\n')}
      
      CURRENT Updates:
      ${currentUpdates.map((update, i) => `${i + 1}. ${update.title}\n   ${update.content}`).join('\n\n')}
      
      Respond in Hebrew for changeDetails.
    `,
  });

  logInfo('AI comparison completed', { 
    comparison: comparison.object,
    hasChanged: comparison.object.hasChanged,
    significance: comparison.object.significance
  });

  logInfo('DEBUG: AI comparison result', {
    hasChanged: comparison.object.hasChanged,
    changeDetails: comparison.object.changeDetails,
    currentCount: currentUpdates.length,
    previousCount: previousUpdates.length,
    currentTitles: currentUpdates.map(u => u.title)
  });

  return {
    hasChanged: comparison.object.hasChanged,
    contentHash,
    updates: currentUpdates,
    changeDetails: comparison.object.changeDetails,
    significance: comparison.object.significance,
    newUpdates: comparison.object.newUpdates,
    modifiedUpdates: comparison.object.modifiedUpdates
  };
}
```

### Phase 4: Update Service Factory

#### 4.1 Modify Scraper Factory
**File**: `src/services/scraper-factory.service.ts`
- **Simple change** - just update imports and method calls (per guidelines)

```typescript
import { checkForUpdatesWithPuppeteer } from './elal-puppeteer-scraper.service';
import type { ScrapedContent } from '@/types/notification.type';

interface UpdateCheckResult {
  hasChanged: boolean;
  contentHash: string;
  updates: ScrapedContent[];
  changeDetails?: string;
  significance: 'major' | 'minor' | 'none';
  newUpdates: string[];
  modifiedUpdates: string[];
  scrapeMethod?: 'playwright' | 'puppeteer';
}

export async function checkForUpdatesWithFallback({ 
  previousUpdates = [] 
}: { 
  previousUpdates?: ScrapedContent[] 
}): Promise<UpdateCheckResult> {
  const result = await checkForUpdatesWithPuppeteer({ previousUpdates });
  return {
    ...result,
    scrapeMethod: 'puppeteer' as const
  };
}
```

### Phase 5: Update Server Actions

#### 5.1 Rename and Update Main Server Action
**File**: `src/app/scraper/main.ts` (renamed from `src/app/stagehand/main.ts`)
- **Named exports** only (per guidelines)
- **Object destructuring** for parameters (per guidelines)

```typescript
"use server";

import { checkForUpdatesWithPuppeteer } from "@/services/elal-puppeteer-scraper.service";
import { logInfo, logError } from "@/lib/utils/logger";
import type { ScrapedContent } from "@/types/notification.type";

export async function runPuppeteerScraper({ 
  previousUpdates = [] 
}: { 
  previousUpdates?: ScrapedContent[] 
} = {}) {
  try {
    const result = await checkForUpdatesWithPuppeteer({ previousUpdates });
    
    logInfo('Puppeteer scraping completed', { 
      hasChanged: result.hasChanged,
      updateCount: result.updates.length,
      significance: result.significance,
      newUpdates: result.newUpdates.length,
      modifiedUpdates: result.modifiedUpdates.length
    });
    
    return {
      success: true,
      hasChanged: result.hasChanged,
      updateCount: result.updates.length,
      updates: result.updates.slice(0, 3),
      allUpdates: result.updates,
      changeDetails: result.changeDetails,
      significance: result.significance,
      newUpdates: result.newUpdates,
      modifiedUpdates: result.modifiedUpdates,
      contentHash: result.contentHash,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logError('Puppeteer scraping failed', error as Error);
    throw error;
  }
}
```

### Phase 6: Update Feature Flags and Configuration

#### 6.1 Update Feature Flags
**File**: `src/lib/feature-flags/scraper-flags.ts`
```typescript
interface ScraperFeatureFlags {
  usePuppeteerScraper: boolean;
}

export function getScraperFeatureFlags(): ScraperFeatureFlags {
  return {
    usePuppeteerScraper: process.env.USE_PUPPETEER_SCRAPER === 'true'
  };
}
```

### Phase 7: Update Types and Schema

#### 7.1 Update Type Definitions
**File**: `src/types/notification.type.ts`
- **Use existing types** (per guidelines)
- Change enum value from 'stagehand' to 'puppeteer'

```typescript
// Update the existing enum
extractionMethod: z.enum(["playwright", "puppeteer"]).optional(),
```

### Phase 8: Clean Up Stagehand Files

#### 8.1 Remove Stagehand-Specific Files (Simple Deletion)
- Delete: `src/lib/stagehand/config.ts`
- Delete: `src/services/elal-stagehand-scraper.service.ts`  
- Delete: `src/components/stagehand/StagehandStatus.tsx`
- Delete: `STAGEHAND_SETUP.md`

#### 8.2 Update Directory Structure
- Delete: `src/app/stagehand/` directory
- Create: `src/app/scraper/` directory
- Create: `src/lib/puppeteer/` directory (kebab-case per guidelines)

### Phase 9: Update Documentation (Minimal)

#### 9.1 Update README 
- Remove Stagehand references from `README.md`
- Add simple Puppeteer setup instructions

### Phase 10: Environment Variables

#### 10.1 Update Environment Variables
```env
# Remove these:
# USE_STAGEHAND_SCRAPER=true

# Add these:
USE_PUPPETEER_SCRAPER=true
NEXT_PUBLIC_VERCEL_ENVIRONMENT=production  # Set by Vercel automatically
```

## Code Examples

### Basic Page Scraping Pattern
```typescript
export async function scrapePageContent(url: string) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const content = await page.content();
    return content;
  } finally {
    await page.close();
  }
}
```

### Environment Detection
```typescript
function isProduction(): boolean {
  return process.env.NEXT_PUBLIC_VERCEL_ENVIRONMENT === "production";
}
```

## Project Guidelines Compliance

✅ **Simple is king** - Minimal changes, reuse existing patterns  
✅ **No test files** - No test files created  
✅ **Use modules not classes** - All functions are modules  
✅ **Object destructuring** - All function parameters use destructuring  
✅ **Named exports** - No default exports used  
✅ **Use existing types** - Reusing types from `@/types/notification.type`  
✅ **Services with .service.ts suffix** - Following naming convention  
✅ **kebab-case directories** - `src/lib/puppeteer/` directory  
✅ **Don't wrap functions** - Direct implementation without wrappers  
✅ **Tree shaking** - Named exports enable tree shaking  
✅ **Single responsibility** - Each file has focused purpose  

## Benefits of This Migration

1. **Vercel Compatibility**: Puppeteer with Chromium works reliably on Vercel
2. **Proven Solution**: Based on established patterns for Vercel deployment  
3. **Maintained AI Capabilities**: Keep existing AI-powered content extraction
4. **Project Guidelines Compliant**: Follows all established patterns and conventions
5. **Simple Implementation**: Minimal code changes, maximum compatibility

## Timeline Estimate

- **Phase 1-2**: 2 hours (Dependencies and browser management)
- **Phase 3**: 3 hours (Main scraper service rewrite)  
- **Phase 4-6**: 2 hours (Factory and server actions update)
- **Phase 7-8**: 1 hour (Types and cleanup)
- **Phase 9-10**: 1 hour (Documentation and env vars)

**Total Estimated Time**: 9 hours

## Success Criteria

1. ✅ Puppeteer scraper works locally
2. ✅ Puppeteer scraper works on Vercel  
3. ✅ Same content extraction quality as Stagehand
4. ✅ Follows all project guidelines
5. ✅ No API changes for existing consumers
6. ✅ All Stagehand code removed from codebase

This migration plan ensures a smooth transition from Stagehand to Puppeteer while maintaining all existing functionality and improving Vercel deployment reliability. 