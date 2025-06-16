"use server";

import { checkForUpdatesWithStagehand } from "@/services/elal-stagehand-scraper.service";
import { logInfo, logError } from "@/lib/utils/logger";
import type { ScrapedContent } from "@/types/notification.type";

export async function runStagehandScraper({ 
  previousUpdates = [] 
}: { 
  previousUpdates?: ScrapedContent[] 
} = {}) {
  try {
    const result = await checkForUpdatesWithStagehand({ previousUpdates });
    
    logInfo('Stagehand scraping and update check completed', { 
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
      updates: result.updates.slice(0, 3), // First 3 for preview
      allUpdates: result.updates,
      changeDetails: result.changeDetails,
      significance: result.significance,
      newUpdates: result.newUpdates,
      modifiedUpdates: result.modifiedUpdates,
      contentHash: result.contentHash,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logError('Stagehand scraping failed', error as Error);
    throw error;
  }
} 