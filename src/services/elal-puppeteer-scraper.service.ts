import { z } from "zod";
import { createHash } from "crypto";
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getBrowser } from "@/lib/puppeteer/browser-manager";
import type { ScrapedContent } from "@/types/notification.type";
import { logInfo } from "@/lib/utils/logger";
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
function cleanHtml(html: string): string {
  const cleaned = html
    // Remove script, style, meta, link, and title tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<title\b[^<]*(?:(?!<\/title>)<[^<]*)*<\/title>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
    .replace(/<base\b[^>]*>/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove common tracking/analytics elements
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
    // Remove CSS classes and IDs to reduce noise
    .replace(/\s(class|id)="[^"]*"/gi, '')
    // Remove inline styles
    .replace(/\sstyle="[^"]*"/gi, '')
    // Remove data attributes (with or without values)
    .replace(/\sdata-[^=>\s]+(?:="[^"]*")?/gi, '')
    // Remove angular attributes (with or without values)
    .replace(/\s_ng\S+/gi, '')
    .replace(/\sng-\S+/gi, '')
    // Remove aria-label and other accessibility attributes that might have noise
    .replace(/\saria-[^=]*="[^"]*"/gi, '')
    .replace(/\srole="[^"]*"/gi, '')
    .replace(/\stabindex="[^"]*"/gi, '')
    // Remove event handlers
    .replace(/\son[a-z]+="[^"]*"/gi, '')
    // Remove security and loading attributes
    .replace(/\scrossorigin="[^"]*"/gi, '')
    .replace(/\sintegrity="[^"]*"/gi, '')
    .replace(/\sasync="[^"]*"/gi, '')
    .replace(/\sasync\b/gi, '')
    .replace(/\scharset="[^"]*"/gi, '')
    .replace(/\stype="[^"]*"/gi, '')
    // Remove common framework attributes
    .replace(/\sdirection="[^"]*"/gi, '')
    .replace(/\slang="[^"]*"/gi, '')
    .replace(/\sdir="[^"]*"/gi, '')

  return cleaned;
}

export async function scrapeElAlUpdatesWithPuppeteer(): Promise<ScrapedContent[]> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    // Set user agent and viewport for better compatibility
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    logInfo('Navigating to El Al updates page', { url: ELAL_URL });
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
    
    // Wait for page to load completely (same as Stagehand)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    logInfo('Getting raw HTML content from page');
    const rawHtml = await page.content();
    await trackEvent({
      distinctId: 'system',
      event: 'scrape_elal_updates_with_puppeteer_raw_html',
      properties: {
        rawLength: rawHtml.length,
        timestamp: new Date().toISOString(),
      }
    })
    
    logInfo('Cleaning HTML content', { originalLength: rawHtml.length });
    const cleanedHtml = cleanHtml(rawHtml);
    logInfo('HTML cleaned', { cleanedLength: cleanedHtml.length });
    
    await trackEvent({
      distinctId: 'system',
      event: 'scrape_elal_updates_with_puppeteer_html_cleaned',
      properties: {
        cleanedLength: cleanedHtml.length,
        originalLength: rawHtml.length,
        timestamp: new Date().toISOString(),
      }
    })


    // Use AI SDK with Anthropic to extract news points (exact same as Stagehand)
    logInfo('Using AI SDK with Anthropic to extract Hebrew news updates');

    posthog.capture('scrape_elal_updates_with_puppeteer_extraction_start');
    const result = await generateObject({
      model: anthropic('claude-3-5-sonnet-latest'),
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

    logInfo('AI extraction completed', { extractedCount: result.object.updates.length });
    logInfo('AI extraction result', { result: result.object });

    // Check if AI actually found meaningful updates
    if (!result.object.hasActualUpdates || result.object.updates.length === 0) {
      logInfo('No meaningful updates found by AI extraction', { 
        hasActualUpdates: result.object.hasActualUpdates,
        updatesCount: result.object.updates.length 
      });
      await trackEvent({
        distinctId: 'system',
        event: 'scrape_elal_updates_with_puppeteer_extraction_no_updates',
        properties: {
          hasActualUpdates: result.object.hasActualUpdates,
          updatesCount: result.object.updates.length,
          timestamp: new Date().toISOString(),
        }
      })
      return [];
    }



    const articles: ScrapedContent[] = result.object.updates.map((update: { title: string; content: string; updatedAt?: string }) => ({
      title: update.title,
      content: update.content,
      updatedAt: update.updatedAt
    }));

    console.log('articles', articles);
    await trackEvent({
      distinctId: 'system',
      event: 'scrape_elal_updates_with_puppeteer_articles',
      properties: {
        articles: articles,
        timestamp: new Date().toISOString(),
      }
    })


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
  
  // If no updates were found by AI extraction, return early with no changes
  if (currentUpdates.length === 0) {
    logInfo('No updates found during scraping - skipping comparison and notification', { 
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
      modifiedUpdates: []
    };
  }
  
  const isFirstRun = previousUpdates.length === 0;

  const contentHash = createHash('sha256')
    .update(JSON.stringify(currentUpdates.map(({ title, content }) => ({ title, content: content.substring(0, 200) }))))
    .digest('hex');

  // For first run, just return the updates without AI comparison (exact same logic)
  if (isFirstRun) {
    logInfo('First run - returning updates without comparison', { 
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
      modifiedUpdates: [] as string[]
    };
  }

  // Use AI to compare with previous updates (exact same logic)
  logInfo('Using AI to compare current updates with previous updates', { 
    currentCount: currentUpdates.length,
    previousCount: previousUpdates.length
  });
  
  const comparison = await generateObject({
    model: anthropic('claude-3-5-sonnet-latest'),
    schema: UpdateComparisonSchema,
    prompt: COMPARISON_PROMPT
      .replace('[PREVIOUS_CONTENT]', previousUpdates.map((update, i) => `${i + 1}. ${update.title}\n   ${update.content}`).join('\n\n'))
      .replace('[CURRENT_CONTENT]', currentUpdates.map((update, i) => `${i + 1}. ${update.title}\n   ${update.content}`).join('\n\n')),
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
    modifiedUpdates: comparison.object.modifiedUpdates
  };
} 