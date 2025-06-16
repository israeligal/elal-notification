import { checkForUpdatesWithPuppeteer } from './elal-puppeteer-scraper.service';
import type { ScrapedContent } from '@/types/notification.type';

interface UpdateCheckResult {
  hasChanged: boolean;
  contentHash: string;
  updates: ScrapedContent[];
  changeDetails?: string;
  significance: 'major' | 'minor' | 'none';
  newUpdates: string[];
  modifiedUpdates: string[];
  scrapeMethod?: 'playwright' | 'puppeteer';
}

export async function checkForUpdatesWithFallback({ 
  previousUpdates = [] 
}: { 
  previousUpdates?: ScrapedContent[] 
}): Promise<UpdateCheckResult> {
  const result = await checkForUpdatesWithPuppeteer({ previousUpdates });
  return {
    ...result,
    scrapeMethod: 'puppeteer' as const
  };
} 