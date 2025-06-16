import { chromium } from 'playwright'
import crypto from 'crypto'
import { logInfo, logError } from '@/lib/utils/logger'
import type { ScrapedContent } from '@/types/notification.type'

const ELAL_URL = 'https://www.elal.com/eng/about-elal/news/recent-updates'

interface ScrapeOptions {
  timeout?: number
  userAgent?: string
}

export async function scrapeElAlUpdates({ 
  timeout = 30000,
  userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
}: ScrapeOptions = {}): Promise<ScrapedContent[]> {
  let browser
  
  try {
    logInfo('Starting El Al updates scraping with Playwright', { url: ELAL_URL })
    
    // Launch Playwright browser - works great on Vercel!
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
      ]
    })

    const context = await browser.newContext({
      userAgent,
      locale: 'he-IL',
      extraHTTPHeaders: {
        'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8'
      }
    })

    const page = await context.newPage()

    logInfo('Navigating to El Al page')
    await page.goto(ELAL_URL, { 
      waitUntil: 'networkidle',
      timeout 
    })

    // Wait for content to load
    await page.waitForTimeout(3000)

    // Extract content - adjust selectors based on actual page structure
    const updates = await page.evaluate(() => {
      const updateElements = document.querySelectorAll('[data-testid="news-item"], .news-item, .update-item, article')
      const results: Array<{
        title: string
        content: string
        publishDate?: string
        url?: string
      }> = []

      updateElements.forEach((element) => {
        const titleEl = element.querySelector('h1, h2, h3, .title, [class*="title"]')
        const contentEl = element.querySelector('.content, .description, p, [class*="content"]')
        const dateEl = element.querySelector('.date, time, [class*="date"]')
        const linkEl = element.querySelector('a')

        if (titleEl && contentEl) {
          results.push({
            title: titleEl.textContent?.trim() || '',
            content: contentEl.textContent?.trim() || '',
            publishDate: dateEl?.textContent?.trim() || dateEl?.getAttribute('datetime') || undefined,
            url: linkEl?.href
          })
        }
      })

      return results
    })

    logInfo('Successfully scraped El Al updates with Playwright', { count: updates.length })
    return updates

  } catch (error) {
    logError('Failed to scrape El Al updates', error as Error, { url: ELAL_URL })
    throw error
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

export function generateContentHash(content: ScrapedContent[]): string {
  const contentString = JSON.stringify(content.map(item => ({
    title: item.title,
    content: item.content.substring(0, 200) // First 200 chars to avoid minor changes
  })))
  
  return crypto.createHash('sha256').update(contentString).digest('hex')
}

export function detectChanges({ 
  previousHash, 
  currentHash 
}: { 
  previousHash: string 
  currentHash: string 
}): boolean {
  return previousHash !== currentHash
}

export async function checkForUpdates({ 
  previousHash 
}: { 
  previousHash?: string 
} = {}): Promise<{
  hasChanged: boolean
  contentHash: string
  updates: ScrapedContent[]
  changeDetails?: string
}> {
  try {
    logInfo('Checking El Al for updates', { previousHash })
    
    const updates = await scrapeElAlUpdates()
    const currentHash = generateContentHash(updates)
    const hasChanged = previousHash ? detectChanges({ previousHash, currentHash }) : true

    const result = {
      hasChanged,
      contentHash: currentHash,
      updates,
      changeDetails: hasChanged ? `Found ${updates.length} updates` : undefined
    }

    logInfo('Update check completed', { 
      hasChanged, 
      updatesCount: updates.length,
      contentHash: currentHash
    })

    return result

  } catch (error) {
    logError('Update check failed', error as Error)
    throw error
  }
} 