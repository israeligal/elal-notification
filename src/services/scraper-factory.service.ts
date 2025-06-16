import { checkForUpdatesWithStagehand } from './elal-stagehand-scraper.service';
import type { ScrapedContent } from '@/types/notification.type';

interface UpdateCheckResult {
  hasChanged: boolean;
  contentHash: string;
  updates: ScrapedContent[];
  changeDetails?: string;
  scrapeMethod?: 'playwright' | 'stagehand';
}

export async function checkForUpdatesWithFallback({ 
  previousHash 
}: { 
  previousHash?: string 
} = {}): Promise<UpdateCheckResult> {

  const result = await checkForUpdatesWithStagehand({ previousHash });
  return {
    ...result,
    scrapeMethod: 'stagehand'
  };
} 