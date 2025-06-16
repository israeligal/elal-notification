import { checkForUpdates as checkWithPlaywright } from './elal-scraper.service';
import { checkForUpdatesWithStagehand } from './elal-stagehand-scraper.service';
import { getScraperFeatureFlags, logFeatureFlags } from '@/lib/feature-flags/scraper-flags';
import { logInfo, logError } from '@/lib/utils/logger';
import type { ScrapedContent } from '@/types/notification.type';

interface UpdateCheckResult {
  hasChanged: boolean;
  contentHash: string;
  updates: ScrapedContent[];
  changeDetails?: string;
  scrapeMethod?: 'playwright' | 'stagehand' | 'fallback';
}

export async function checkForUpdatesWithFallback({ 
  previousHash 
}: { 
  previousHash?: string 
} = {}): Promise<UpdateCheckResult> {
  const flags = getScraperFeatureFlags();
  logFeatureFlags();
  
  if (flags.useStagehandScraper) {
    try {
      logInfo('Using Stagehand scraper', { 
        fallbackEnabled: flags.stagehandFallbackToPlaywright,
        visionEnabled: flags.enableStagehandVision,
        cachingEnabled: flags.enableStagehandCaching
      });
      
      const result = await checkForUpdatesWithStagehand({ previousHash });
      return {
        ...result,
        scrapeMethod: 'stagehand'
      };
    } catch (error) {
      logError('Stagehand scraper failed', error as Error);
      
      if (flags.stagehandFallbackToPlaywright) {
        logInfo('Falling back to Playwright scraper');
        try {
          const result = await checkWithPlaywright({ previousHash });
          return {
            ...result,
            scrapeMethod: 'fallback',
            changeDetails: `${result.changeDetails || ''} (fallback from Stagehand)`
          };
        } catch (fallbackError) {
          logError('Fallback to Playwright also failed', fallbackError as Error);
          throw new Error(`Both Stagehand and Playwright scrapers failed. Stagehand: ${(error as Error).message}, Playwright: ${(fallbackError as Error).message}`);
        }
      }
      
      throw error;
    }
  } else {
    logInfo('Using Playwright scraper');
    const result = await checkWithPlaywright({ previousHash });
    return {
      ...result,
      scrapeMethod: 'playwright'
    };
  }
}

// Enhanced version with comparison capability
export async function checkForUpdatesWithComparison({ 
  previousHash 
}: { 
  previousHash?: string 
} = {}): Promise<{
  primary: UpdateCheckResult;
  comparison?: UpdateCheckResult;
  discrepancies?: string[];
}> {
  const flags = getScraperFeatureFlags();
  
  if (!flags.enableScraperComparison) {
    // Just run the primary scraper
    const primary = await checkForUpdatesWithFallback({ previousHash });
    return { primary };
  }

  logInfo('Running scraper comparison mode');
  
  // Run both scrapers in parallel
  const [stagehandResult, playwrightResult] = await Promise.allSettled([
    checkForUpdatesWithStagehand({ previousHash }),
    checkWithPlaywright({ previousHash })
  ]);

  const primary: UpdateCheckResult = flags.useStagehandScraper 
    ? (stagehandResult.status === 'fulfilled' 
        ? { ...stagehandResult.value, scrapeMethod: 'stagehand' as const }
        : await (async () => {
            const fallback = await checkWithPlaywright({ previousHash });
            return { ...fallback, scrapeMethod: 'fallback' as const };
          })()
      )
    : (playwrightResult.status === 'fulfilled' 
        ? { ...playwrightResult.value, scrapeMethod: 'playwright' as const }
        : await (async () => {
            const fallback = await checkForUpdatesWithStagehand({ previousHash });
            return { ...fallback, scrapeMethod: 'fallback' as const };
          })()
      );

  const comparison: UpdateCheckResult | undefined = flags.useStagehandScraper
    ? (playwrightResult.status === 'fulfilled' 
        ? { ...playwrightResult.value, scrapeMethod: 'playwright' as const }
        : undefined
      )
    : (stagehandResult.status === 'fulfilled' 
        ? { ...stagehandResult.value, scrapeMethod: 'stagehand' as const }
        : undefined
      );

  // Analyze discrepancies
  const discrepancies: string[] = [];
  if (comparison) {
    if (primary.hasChanged !== comparison.hasChanged) {
      discrepancies.push(`Change detection mismatch: ${primary.scrapeMethod}=${primary.hasChanged}, ${comparison.scrapeMethod}=${comparison.hasChanged}`);
    }
    
    if (primary.updates.length !== comparison.updates.length) {
      discrepancies.push(`Update count mismatch: ${primary.scrapeMethod}=${primary.updates.length}, ${comparison.scrapeMethod}=${comparison.updates.length}`);
    }
    
    if (Math.abs(primary.updates.length - comparison.updates.length) > 2) {
      discrepancies.push(`Significant update count difference (>2): ${primary.scrapeMethod}=${primary.updates.length}, ${comparison.scrapeMethod}=${comparison.updates.length}`);
    }
  }

  if (discrepancies.length > 0) {
    logInfo('Scraper comparison found discrepancies', { discrepancies });
  } else {
    logInfo('Scraper comparison: results are consistent');
  }

  return {
    primary,
    comparison,
    discrepancies: discrepancies.length > 0 ? discrepancies : undefined
  };
} 