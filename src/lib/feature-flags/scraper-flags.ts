interface ScraperFeatureFlags {
  useStagehandScraper: boolean;
}

export function getScraperFeatureFlags(): ScraperFeatureFlags {
  return {
    useStagehandScraper: process.env.USE_STAGEHAND_SCRAPER === 'true'
  };
}

export function logFeatureFlags(): void {
  const flags = getScraperFeatureFlags();
  console.log('🚩 Scraper Feature Flags:', flags);
} 