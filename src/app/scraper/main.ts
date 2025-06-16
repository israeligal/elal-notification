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