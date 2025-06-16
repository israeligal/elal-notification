export interface ScraperFeatureFlags {
  useStagehandScraper: boolean;
  enableScraperComparison: boolean;
  stagehandFallbackToPlaywright: boolean;
  enableStagehandCaching: boolean;
  enableStagehandVision: boolean;
}

export function getScraperFeatureFlags(): ScraperFeatureFlags {
  return {
    useStagehandScraper: process.env.USE_STAGEHAND_SCRAPER === 'true',
    enableScraperComparison: process.env.ENABLE_SCRAPER_COMPARISON === 'true',
    stagehandFallbackToPlaywright: process.env.STAGEHAND_FALLBACK === 'true',
    enableStagehandCaching: process.env.ENABLE_STAGEHAND_CACHING !== 'false', // Default true
    enableStagehandVision: process.env.ENABLE_STAGEHAND_VISION === 'true',
  };
}

export function logFeatureFlags(): void {
  const flags = getScraperFeatureFlags();
  console.log('🚩 Scraper Feature Flags:', {
    useStagehandScraper: flags.useStagehandScraper,
    enableScraperComparison: flags.enableScraperComparison,
    stagehandFallbackToPlaywright: flags.stagehandFallbackToPlaywright,
    enableStagehandCaching: flags.enableStagehandCaching,
    enableStagehandVision: flags.enableStagehandVision,
  });
} 