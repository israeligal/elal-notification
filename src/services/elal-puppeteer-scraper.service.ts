import { z } from "zod";
import { createHash } from "crypto";
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getBrowser } from "@/lib/puppeteer/browser-manager";
import type { ScrapedContent } from "@/types/notification.type";
import { logInfo } from "@/lib/utils/logger";

const ELAL_URL = 'https://www.elal.com/eng/about-elal/news/recent-updates';

// AI Prompts
const EXTRACTION_PROMPT = `
Extract English news updates from this El Al page HTML. Focus on security updates, flight changes, and announcements. Create short titles and include full content in Hebrew.
it should be under the title "Updates Following Recent Events"
and it should be near "Last update:"
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
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><');

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
    await page.goto(ELAL_URL, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for page to load completely (same as Stagehand)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    logInfo('Getting raw HTML content from page');
    const rawHtml = await page.content();
    
    logInfo('Cleaning HTML content', { originalLength: rawHtml.length });
    const cleanedHtml = cleanHtml(rawHtml);
    logInfo('HTML cleaned', { cleanedLength: cleanedHtml.length });

    // Use AI SDK with Anthropic to extract news points (exact same as Stagehand)
    logInfo('Using AI SDK with Anthropic to extract Hebrew news updates');
    
    const result = await generateObject({
      model: anthropic('claude-3-5-haiku-latest'),
      schema: NewsExtractionSchema,
      prompt: EXTRACTION_PROMPT + cleanedHtml,
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
    model: anthropic('claude-3-5-haiku-latest'),
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