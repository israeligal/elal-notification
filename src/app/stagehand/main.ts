"use server";

import { scrapeElAlUpdatesWithStagehand } from "@/services/elal-stagehand-scraper.service";
import { logInfo, logError } from "@/lib/utils/logger";

export async function runStagehandScraper() {
  try {
    const updates = await scrapeElAlUpdatesWithStagehand();
    
    logInfo('Stagehand scraping completed', { updateCount: updates.length });
    
    return {
      success: true,
      updateCount: updates.length,
      updates: updates.slice(0, 3),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logError('Stagehand scraping failed', error as Error);
    throw error;
  }
} 