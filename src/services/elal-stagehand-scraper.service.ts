import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { createHash } from "crypto";
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { createStagehandConfig } from "@/lib/stagehand/config";
import type { ScrapedContent } from "@/types/notification.type";
import { logInfo } from "@/lib/utils/logger";

const ELAL_URL = 'https://www.elal.com/heb/about-elal/news/recent-updates';

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

function cleanHtml(html: string): string {
  // Remove scripts, styles, and other unnecessary elements
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

export async function scrapeElAlUpdatesWithStagehand(): Promise<ScrapedContent[]> {
  const stagehand = new Stagehand(createStagehandConfig());
  
  try {
    await stagehand.init();
    const page = stagehand.page;

    logInfo('Navigating to El Al updates page', { url: ELAL_URL });
    await page.goto(ELAL_URL);
    
    // Wait for page to load completely
    await page.waitForTimeout(5000);
    
    logInfo('Getting raw HTML content from page');
    const rawHtml = await page.content();
    
    logInfo('Cleaning HTML content', { originalLength: rawHtml.length });
    const cleanedHtml = cleanHtml(rawHtml);
    logInfo('HTML cleaned', { cleanedLength: cleanedHtml.length });

    // Use AI SDK with Anthropic to extract news points
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
    await stagehand.close();
  }
}

export async function checkForUpdatesWithStagehand({ 
  previousUpdates = [] 
}: { 
  previousUpdates?: ScrapedContent[] 
} = {}) {
  const currentUpdates = await scrapeElAlUpdatesWithStagehand();
  
  const isFirstRun = previousUpdates.length === 0

  const contentHash = createHash('sha256')
    .update(JSON.stringify(currentUpdates.map(({ title, content }) => ({ title, content: content.substring(0, 200) }))))
    .digest('hex');

  // For first run, just return the updates without AI comparison
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

  // Use AI to compare with previous updates
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