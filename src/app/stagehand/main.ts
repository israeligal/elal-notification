"use server";

import { Stagehand } from "@browserbasehq/stagehand";
import { Browserbase } from "@browserbasehq/sdk";
import { ElAlStagehandScraper } from "@/services/elal-stagehand-scraper.service";
import { createStagehandConfig, getStagehandModelInfo } from "@/lib/stagehand/config";
import { logInfo, logError } from "@/lib/utils/logger";

/**
 * Main Stagehand scraping function
 */
async function runElAlScraping(stagehand: Stagehand) {
  const scraper = new ElAlStagehandScraper();
  
  try {
    // Use the existing Stagehand instance
    scraper['stagehand'] = stagehand;
    scraper['isInitialized'] = true;
    
    const updates = await scraper.scrapeElAlUpdates({
      timeout: 30000,
      useCache: true
    });
    
    return {
      success: true,
      updateCount: updates.length,
      updates: updates.slice(0, 3), // Preview only
      timestamp: new Date().toISOString(),
      modelInfo: getStagehandModelInfo()
    };
  } catch (error) {
    logError('Stagehand scraping failed in server action', error as Error);
    throw error;
  }
}

/**
 * Initialize and run Stagehand scraper
 */
export async function runStagehandScraper(sessionId?: string) {
  try {
    const config = createStagehandConfig();
    
    const stagehand = new Stagehand({
      ...config,
      browserbaseSessionID: sessionId,
      logger: console.log,
    });
    
    await stagehand.init();
    logInfo('Stagehand initialized for server action', { 
      model: config.modelName,
      env: config.env,
      sessionId 
    });
    
    const result = await runElAlScraping(stagehand);
    await stagehand.close();
    
    logInfo('Stagehand server action completed successfully', {
      updateCount: result.updateCount,
      model: result.modelInfo.modelName
    });
    
    return result;
  } catch (error) {
    logError('Stagehand server action failed', error as Error);
    throw error;
  }
}

/**
 * Start a Browserbase session for debugging
 */
export async function startBrowserbaseSession() {
  if (!process.env.BROWSERBASE_API_KEY || !process.env.BROWSERBASE_PROJECT_ID) {
    throw new Error('Browserbase credentials not configured. Set BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID environment variables.');
  }

  const browserbase = new Browserbase();
  const session = await browserbase.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
  });
  
  const debugUrl = await browserbase.sessions.debug(session.id);
  
  logInfo('Browserbase debug session created', {
    sessionId: session.id,
    debugUrl: debugUrl.debuggerFullscreenUrl
  });
  
  return {
    sessionId: session.id,
    debugUrl: debugUrl.debuggerFullscreenUrl,
  };
}

/**
 * Check Stagehand configuration and model availability
 */
export async function checkStagehandConfig() {
  try {
    const modelInfo = getStagehandModelInfo();
    const config = createStagehandConfig();
    
    return {
      success: true,
      modelInfo,
      config: {
        modelName: config.modelName,
        env: config.env,
        hasBrowserbase: !!(config.apiKey && config.projectId),
        verbose: config.verbose
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    };
  }
} 