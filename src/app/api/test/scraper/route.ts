import { NextResponse } from 'next/server'
import { scrapeElAlUpdates, generateContentHash } from '@/services/elal-scraper.service'
import { logInfo, logError } from '@/lib/utils/logger'

export async function GET() {
  try {
    logInfo('Testing El Al scraper')

    const updates = await scrapeElAlUpdates()
    const contentHash = generateContentHash(updates)

    logInfo('Scraper test completed', { 
      updateCount: updates.length,
      contentHash 
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      updateCount: updates.length,
      contentHash,
      updates: updates.slice(0, 3), // Return first 3 updates to avoid large response
      note: 'Showing first 3 updates only. Full updates would be sent via email.'
    })

  } catch (error) {
    logError('Scraper test failed', error as Error)
    
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      error: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 })
  }
} 