import { z } from "zod";
import { createHash } from "crypto";
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getBrowser } from "@/lib/puppeteer/browser-manager";
import type { ScrapedContent, ScrapingResult, UpdateCheckResult } from "@/types/notification.type";
import { logger } from "@/lib/utils/logger";
import posthog from "posthog-js";
import { trackEvent } from "@/lib/utils/analytics";

const ELAL_URL = 'https://www.elal.com/eng/about-elal/news/recent-updates';

// AI Prompts
const EXTRACTION_PROMPT = `
Extract English news updates from this El Al page HTML. Focus on security updates, flight changes, and announcements. Create short titles and include full content in Hebrew.
it should be under the title "Updates Following Recent Events"
and it should be near "Last update:"

IMPORTANT: If you cannot find any meaningful updates in the HTML content, or if the page indicates no updates are available, set hasActualUpdates to false and return an empty updates array.

Only return hasActualUpdates: true if you find actual, meaningful news updates about flights, security, or announcements.

HTML Content:
`;

const COMPARISON_PROMPT = `
Compare Hebrew El Al updates for SIGNIFICANT changes only.

ONLY mark as changed if there are:
- New flight cancellation dates
- New destinations affected  
- New security restrictions
- New policies or procedures
- Actually NEW information

IGNORE:
- Reordering of same items
- Minor wording changes
- Same content with different titles
- Formatting differences

If the core flight dates, destinations, and policies are identical, mark as hasChanged: false.

In your response be very true to the content don't make up any information or enhance it.
Try and be as accurate as possible and return the content as similar to the original as possible, while keeping the requirements above in mind.

PREVIOUS Updates:
[PREVIOUS_CONTENT]

CURRENT Updates:  
[CURRENT_CONTENT]

Be very strict - only real policy/date/destination changes matter.
`;

// Exact same schemas as Stagehand version
const NewsExtractionSchema = z.object({
  updates: z.array(z.object({
    title: z.string().describe('A short title summarizing the update in Hebrew'),
    content: z.string().describe('The full content of the news update in Hebrew'),
    updatedAt: z.string().optional().describe('Date/time if mentioned in the content')
  })),
  totalCount: z.number().describe('Total number of news updates found'),
  hasActualUpdates: z.boolean().describe('Whether any meaningful updates were actually found in the HTML content. Return false if no updates exist or if the content indicates no updates are available.')
});

const UpdateComparisonSchema = z.object({
  hasChanged: z.boolean().describe('Whether there are meaningful changes between the two sets of content'),
  changeDetails: z.string().optional().describe('Description of what changed in Hebrew'),
  newUpdates: z.array(z.string()).describe('List of completely new update titles that were not present before'),
  modifiedUpdates: z.array(z.string()).describe('List of update titles that were modified'),
  significance: z.enum(['major', 'minor', 'none']).describe('Significance level of the changes')
});

// Exact same HTML cleaning function from Stagehand version
import { cleanHtml } from '@/lib/utils/html-cleaner';

function extractLastUpdateTimestamp(html: string): string | undefined {
  const regex = /<em>Last update: ([^<]+)<\/em>/i;
  const match = html.match(regex);
  return match ? match[1].trim() : undefined;
}

export async function scrapeElAlUpdatesWithPuppeteer({ previousLastUpdate }: { previousLastUpdate?: string } = {}): Promise<ScrapingResult> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    // Set user agent and viewport for better compatibility
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    logger.info('Navigating to El Al updates page', { url: ELAL_URL });
    await trackEvent({
      distinctId: 'system',
      event: 'scrape_elal_updates_with_puppeteer_start',
      properties: {
        url: ELAL_URL,
        timestamp: new Date().toISOString(),
      }
    })
    await page.goto(ELAL_URL, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    logger.info('Waiting for page to load', { url: ELAL_URL });
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // logger.info('Getting raw HTML content from page');
    const rawHtml = await page.content();
    
    
    const cleanedHtml = cleanHtml(rawHtml);

        // Extract timestamp from raw HTML before cleaning
    const lastUpdate = extractLastUpdateTimestamp(cleanedHtml);

    logger.info('Got raw HTML content from page', { lastUpdate });

    if (previousLastUpdate && lastUpdate && previousLastUpdate === lastUpdate) {
      logger.info('Last update timestamp unchanged - skipping AI processing', { 
        previousLastUpdate,
        currentLastUpdate: lastUpdate
      })
      return { updates: [], lastUpdate };
    }


    await trackEvent({
      distinctId: 'system',
      event: 'scrape_elal_updates_with_puppeteer_html_cleaned',
      properties: {
        cleanedHtmlLength: cleanedHtml.length,
        timestamp: new Date().toISOString(),
        lastUpdate: lastUpdate,
      }
    })
    // Use AI SDK with Anthropic to extract news points (exact same as Stagehand)
    // logger.info('Using AI SDK with Anthropic to extract Hebrew news updates');

    posthog.capture('scrape_elal_updates_with_puppeteer_extraction_start');
    const result = await generateObject({
      model: anthropic('claude-3-5-haiku-latest'),
      schema: NewsExtractionSchema,
      prompt: EXTRACTION_PROMPT + cleanedHtml,
    });

    await trackEvent({
      distinctId: 'system',
      event: 'scrape_elal_updates_with_puppeteer_extraction_result',
      properties: {
        result: result.object,
        timestamp: new Date().toISOString(),
      }
    })

    // logger.info('AI extraction completed', { extractedCount: result.object.updates.length });
    // logger.info('AI extraction result', { result: result.object });

    // Check if AI actually found meaningful updates
    if (!result.object.hasActualUpdates || result.object.updates.length === 0) {
      // logger.info('No meaningful updates found by AI extraction', { 
      //   hasActualUpdates: result.object.hasActualUpdates,
      //   updatesCount: result.object.updates.length 
      // });
      await trackEvent({
        distinctId: 'system',
        event: 'scrape_elal_updates_with_puppeteer_extraction_no_updates',
        properties: {
          hasActualUpdates: result.object.hasActualUpdates,
          updatesCount: result.object.updates.length,
          timestamp: new Date().toISOString(),
        }
      })
      return { updates: [], lastUpdate };
    }



    const articles: ScrapedContent[] = result.object.updates.map((update: { title: string; content: string; updatedAt?: string }) => ({
      title: update.title,
      content: update.content,
      updatedAt: update.updatedAt
    }));

    await trackEvent({
      distinctId: 'system',
      event: 'scrape_elal_updates_with_puppeteer_articles',
      properties: {
        articles: articles,
        timestamp: new Date().toISOString(),
      }
    })


    // logger.info('Successfully extracted articles using AI SDK', { count: articles.length });
    return { updates: articles, lastUpdate };

  } catch (error) {
    logger.info('Error during AI-powered scraping', { error: (error as Error).message });
    throw error;
  } finally {
    await page.close();
  }
}

export async function checkForUpdatesWithPuppeteer({ 
  previousUpdates = [],
  previousLastUpdate
}: { 
  previousUpdates?: ScrapedContent[];
  previousLastUpdate?: string;
} = {}): Promise<UpdateCheckResult> {
  const scrapingResult = await scrapeElAlUpdatesWithPuppeteer({ previousLastUpdate });
  const { updates: currentUpdates, lastUpdate: currentLastUpdate } = scrapingResult;
  
  // Early exit: Check if timestamp is identical (before expensive operations)
  if (previousLastUpdate && currentLastUpdate && previousLastUpdate === currentLastUpdate) {
    logger.info('Last update timestamp unchanged - skipping AI processing', { 
      previousLastUpdate,
      currentLastUpdate
    })
    
    const contentHash = createHash('sha256')
      .update(currentLastUpdate || 'no-timestamp')
      .digest('hex');

    return {
      hasChanged: false,
      contentHash,
      updates: currentUpdates,
      changeDetails: 'No changes detected - timestamp unchanged',
      significance: 'none' as const,
      newUpdates: [],
      modifiedUpdates: [],
      lastUpdate: currentLastUpdate
    };
  } else {
      logger.info('Last update timestamp changed - continuing with AI processing', { 
        previousLastUpdate,
        currentLastUpdate
      })
  }
  
  // If no updates were found by AI extraction, return early with no changes
  if (currentUpdates.length === 0) {
    logger.info('No updates found during scraping - skipping comparison and notification', { 
      currentCount: currentUpdates.length,
      previousCount: previousUpdates.length
    });

    await trackEvent({
      distinctId: 'system',
      event: 'scrape_elal_updates_with_puppeteer_no_updates',
      properties: {
        currentCount: currentUpdates.length,
        previousCount: previousUpdates.length,
        timestamp: new Date().toISOString(),
      }
    })
    
    const contentHash = createHash('sha256')
      .update('no-updates')
      .digest('hex');

    return {
      hasChanged: false,
      contentHash,
      updates: [],
      changeDetails: 'לא נמצאו עדכונים בדף אל על',
      significance: 'none' as const,
      newUpdates: [],
      modifiedUpdates: [],
      lastUpdate: currentLastUpdate
    };
  }
  
  const isFirstRun = previousUpdates.length === 0;

  const contentHash = createHash('sha256')
    .update(JSON.stringify(currentUpdates.map(({ title, content }) => ({ title, content: content.substring(0, 200) }))))
    .digest('hex');

  // For first run, just return the updates without AI comparison (exact same logic)
  if (isFirstRun) {
    logger.info('First run - returning updates without comparison', { 
      currentCount: currentUpdates.length
    });

    await trackEvent({
      distinctId: 'system',
      event: 'scrape_elal_updates_with_puppeteer_first_run',
      properties: {
        currentCount: currentUpdates.length,
        previousCount: previousUpdates.length,
        timestamp: new Date().toISOString(),
      }
    })
    
    return {
      hasChanged: currentUpdates.length > 0,
      contentHash,
      updates: currentUpdates,
      changeDetails: currentUpdates.length > 0 ? `נמצאו ${currentUpdates.length} עדכונים חדשים` : 'לא נמצאו עדכונים',
      significance: currentUpdates.length > 0 ? 'major' as const : 'none' as const,
      newUpdates: currentUpdates.map(u => u.title),
      modifiedUpdates: [] as string[],
      lastUpdate: currentLastUpdate
    };
  }

  // Use AI to compare with previous updates (exact same logic)
  logger.info('Using AI to compare current updates with previous updates', { 
    currentCount: currentUpdates.length,
    previousCount: previousUpdates.length
  });
  
  const comparison = await generateObject({
    model: anthropic('claude-3-5-haiku-latest'),
    schema: UpdateComparisonSchema,
    prompt: COMPARISON_PROMPT
      .replace('[PREVIOUS_CONTENT]', previousUpdates.map((update, i) => `${i + 1}. ${update.title}\n   ${update.content}`).join('\n\n'))
      .replace('[CURRENT_CONTENT]', currentUpdates.map((update, i) => `${i + 1}. ${update.title}\n   ${update.content}`).join('\n\n')),
  });
  
  await trackEvent({
    distinctId: 'system',
    event: 'scrape_elal_updates_with_puppeteer_comparison_result',
    properties: {
      comparison: comparison.object,
      timestamp: new Date().toISOString(),
    }
  })

  return {
    hasChanged: comparison.object.hasChanged,
    contentHash,
    updates: currentUpdates,
    changeDetails: comparison.object.changeDetails,
    significance: comparison.object.significance,
    newUpdates: comparison.object.newUpdates,
    modifiedUpdates: comparison.object.modifiedUpdates,
    lastUpdate: currentLastUpdate
  };
} 