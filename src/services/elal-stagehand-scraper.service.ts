import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { createStagehandConfig } from "@/lib/stagehand/config";
import { logInfo, logError } from "@/lib/utils/logger";
import type { ScrapedContent } from "@/types/notification.type";
import crypto from "crypto";

const ELAL_URL = 'https://www.elal.com/heb/about-elal/news/recent-updates';

// Enhanced schema for structured data extraction
const NewsArticleSchema = z.object({
  title: z.string().describe("The headline or title of the news article in Hebrew"),
  content: z.string().describe("The full content or summary of the article in Hebrew"),
  publishDate: z.string().optional().describe("Publication date if available"),
  category: z.string().optional().describe("Category or type of update"),
  importance: z.enum(["low", "medium", "high"]).optional().describe("Perceived importance level"),
  url: z.string().optional().describe("Full URL to the article if available")
});

const NewsExtractionSchema = z.object({
  articles: z.array(NewsArticleSchema),
  totalCount: z.number().describe("Total number of articles found"),
  lastUpdated: z.string().optional().describe("Last update timestamp from the page")
});

interface StagehandScrapeOptions {
  timeout?: number;
  maxRetries?: number;
  useCache?: boolean;
  useVision?: boolean;
}

export class ElAlStagehandScraper {
  private stagehand: Stagehand | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const config = createStagehandConfig();
      this.stagehand = new Stagehand(config);
      await this.stagehand.init();
      this.isInitialized = true;
      logInfo('Stagehand scraper initialized successfully', { 
        model: config.modelName,
        env: config.env 
      });
    } catch (error) {
      logError('Failed to initialize Stagehand scraper', error as Error);
      throw error;
    }
  }

  async scrapeElAlUpdates({
    timeout = 30000,
    maxRetries = 3,
    useCache = true,
    useVision = false
  }: StagehandScrapeOptions = {}): Promise<ScrapedContent[]> {
    if (!this.stagehand || !this.isInitialized) {
      await this.initialize();
    }

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        logInfo('Starting El Al updates scraping with Stagehand', { 
          url: ELAL_URL, 
          attempt: attempt + 1,
          useVision 
        });

        const page = this.stagehand!.page;

        // Navigate to the page
        await page.goto(ELAL_URL, { 
          waitUntil: 'domcontentloaded',
          timeout 
        });

        // Use Stagehand's observe to plan the scraping strategy
        const [strategy] = await page.observe(
          "Analyze the page and get the most recent news articles",

        );
        
        logInfo('Stagehand analysis strategy', { strategy });

        // Use act() to handle any dynamic content loading
        if (useCache) {
          await this.actWithCache(page, "Wait for all Hebrew news articles to fully load on the page");
        } else {
          await page.act("Wait for all Hebrew news articles to fully load on the page");
        }

        // Give the page a moment to fully render
        await page.waitForTimeout(2000);

        // Enhanced extraction with structured schema
        const extractedData = await page.extract({
          instruction: `
            Extract all news articles and updates from this Hebrew El Al Airlines page. 
            This is a Hebrew website with RTL (right-to-left) text.
            
            Look for:
            - Article titles/headlines in Hebrew
            - Full article content or summaries in Hebrew
            - Publication dates (could be in Hebrew or English format)
            - Any categorization or importance indicators
            - Direct links to full articles if available
            
            Pay special attention to Hebrew text and RTL formatting.
            Include all available articles, even if they seem minor.
            Focus on recent updates and news items.
          `,
          schema: NewsExtractionSchema,
        });

        logInfo('Successfully extracted El Al updates with Stagehand', { 
          articleCount: extractedData.articles.length,
          totalCount: extractedData.totalCount
        });

        // Convert to existing ScrapedContent format for compatibility
        const scrapedContent: ScrapedContent[] = extractedData.articles.map(article => ({
          title: article.title,
          content: article.content,
          publishDate: article.publishDate,
          url: article.url,
          // Enhanced metadata from Stagehand
          metadata: {
            category: article.category,
            importance: article.importance,
            extractedAt: new Date().toISOString(),
            extractionMethod: 'stagehand'
          }
        }));

        return scrapedContent;

      } catch (error) {
        attempt++;
        logError(`Stagehand scraping attempt ${attempt} failed`, error as Error, { 
          url: ELAL_URL,
          attempt,
          useVision
        });

        if (attempt >= maxRetries) {
          throw error;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }

    throw new Error(`Failed to scrape after ${maxRetries} attempts`);
  }

  // Cache frequently used actions to reduce LLM calls
  private async actWithCache(page: import("@browserbasehq/stagehand").Page, instruction: string): Promise<void> {
    // Simple caching mechanism - in production, use Redis or similar
    // For now, just use regular act - implement proper caching later
    await page.act(instruction);
  }

  async close(): Promise<void> {
    if (this.stagehand) {
      await this.stagehand.close();
      this.isInitialized = false;
    }
  }

  // Compatibility methods to match existing scraper interface
  generateContentHash(content: ScrapedContent[]): string {
    const contentString = JSON.stringify(content.map(item => ({
      title: item.title,
      content: item.content.substring(0, 200)
    })));
    
    return crypto.createHash('sha256').update(contentString).digest('hex');
  }

  detectChanges({ previousHash, currentHash }: { 
    previousHash: string; 
    currentHash: string; 
  }): boolean {
    return previousHash !== currentHash;
  }

  async checkForUpdates({ previousHash }: { previousHash?: string } = {}): Promise<{
    hasChanged: boolean;
    contentHash: string;
    updates: ScrapedContent[];
    changeDetails?: string;
  }> {
    try {
      logInfo('Checking El Al for updates with Stagehand', { previousHash });
      
      const updates = await this.scrapeElAlUpdates();
      const currentHash = this.generateContentHash(updates);
      const hasChanged = previousHash ? this.detectChanges({ previousHash, currentHash }) : true;

      const result = {
        hasChanged,
        contentHash: currentHash,
        updates,
        changeDetails: hasChanged ? `Found ${updates.length} updates via Stagehand` : undefined
      };

      logInfo('Stagehand update check completed', { 
        hasChanged, 
        updatesCount: updates.length,
        contentHash: currentHash
      });

      return result;

    } catch (error) {
      logError('Stagehand update check failed', error as Error);
      throw error;
    } finally {
      await this.close();
    }
  }
}

// Factory function for easy instantiation
export async function scrapeElAlUpdatesWithStagehand(
  options?: StagehandScrapeOptions
): Promise<ScrapedContent[]> {
  const scraper = new ElAlStagehandScraper();
  try {
    return await scraper.scrapeElAlUpdates(options);
  } finally {
    await scraper.close();
  }
}

// Compatibility functions matching existing interface
export async function checkForUpdatesWithStagehand({ 
  previousHash 
}: { 
  previousHash?: string 
} = {}): Promise<{
  hasChanged: boolean;
  contentHash: string;
  updates: ScrapedContent[];
  changeDetails?: string;
}> {
  const scraper = new ElAlStagehandScraper();
  return await scraper.checkForUpdates({ previousHash });
} 