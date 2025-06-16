import { checkForUpdatesWithStagehand } from './elal-stagehand-scraper.service';
import type { ScrapedContent } from '@/types/notification.type';

interface UpdateCheckResult {
  hasChanged: boolean;
  contentHash: string;
  updates: ScrapedContent[];
  changeDetails?: string;
  significance: 'major' | 'minor' | 'none';
  newUpdates: string[];
  modifiedUpdates: string[];
  scrapeMethod?: 'playwright' | 'stagehand';
}

export async function checkForUpdatesWithFallback({ 
  previousUpdates = [] 
}: { 
  previousUpdates?: ScrapedContent[] 
}): Promise<UpdateCheckResult> {
  const result = await checkForUpdatesWithStagehand({ previousUpdates });
  return {
    ...result,
    scrapeMethod: 'stagehand' as const
  };
} 