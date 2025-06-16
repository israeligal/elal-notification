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
    
    // Fallback to manual extraction if AI fails
    logInfo('Falling back to manual extraction');
    try {
      const page = stagehand.page;
      
      const manualText = await page.evaluate(() => {
        const textElements: string[] = [];
        
        // Look for specific content areas
        const contentSelectors = [
          '.content',
          '[rteinnerhtml]',
          'app-paragraph',
          'li',
          'p'
        ];
        
        contentSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent?.trim();
            if (text && text.length > 30 && /[\u0590-\u05FF]/.test(text)) {
              textElements.push(text);
            }
          });
        });
        
        return textElements;
      });
      
      const filteredTexts = manualText
        .filter(text => 
          !text.includes('El Al') &&
          !text.includes('עדכונים בעקבות המצב הביטחוני | אל על') &&
          text.length > 50
        )
        .slice(0, 10);
      
      const fallbackArticles: ScrapedContent[] = filteredTexts.map((text, index) => ({
        title: `עדכון ${index + 1}`,
        content: text,
        updatedAt: undefined
      }));
      
      logInfo('Fallback extraction successful', { count: fallbackArticles.length });
      return fallbackArticles;
      
    } catch (fallbackError) {
      logInfo('Fallback extraction also failed', { error: (fallbackError as Error).message });
      throw error;
    }
  } finally {
    await stagehand.close();
  }
}

export async function checkForUpdatesWithStagehand({ previousHash }: { previousHash?: string } = {}) {
  const updates = await scrapeElAlUpdatesWithStagehand();
  const contentString = JSON.stringify(updates.map(item => ({
    title: item.title,
    content: item.content.substring(0, 200)
  })));
  const currentHash = createHash('sha256').update(contentString).digest('hex');
  const hasChanged = previousHash ? previousHash !== currentHash : true;

  return {
    hasChanged,
    contentHash: currentHash,
    updates,
    changeDetails: hasChanged ? `Found ${updates.length} updates` : undefined
  };
} 