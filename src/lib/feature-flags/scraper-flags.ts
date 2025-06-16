interface ScraperFeatureFlags {
  usePuppeteerScraper: boolean;
}

export function getScraperFeatureFlags(): ScraperFeatureFlags {
  return {
    usePuppeteerScraper: process.env.USE_PUPPETEER_SCRAPER === 'true'
  };
}

export function logFeatureFlags(): void {
  const flags = getScraperFeatureFlags();
  console.log('🚩 Scraper Feature Flags:', flags);
} 