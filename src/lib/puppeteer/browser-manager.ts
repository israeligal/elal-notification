import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";

let browser: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

export async function getBrowser() {
  if (browser) return browser;

  // Always use Sparticuz Chromium for consistency
  // This ensures we use the same Chrome version in all environments
  const viewport = {
    deviceScaleFactor: 1,
    hasTouch: false,
    height: 1080,
    isLandscape: true,
    isMobile: false,
    width: 1920,
  };
  
  const args = [
    "--no-sandbox", 
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-zygote",
    "--disable-gpu"
  ];
  
  browser = await puppeteerCore.launch({
    args: [...chromium.args, ...args],
    executablePath: await chromium.executablePath(), // Let the package handle the binary location
    headless: "shell", // Required for Puppeteer with v137.0.0
    defaultViewport: viewport,
  });
  
  return browser;
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export async function createPage() {
  const browserInstance = await getBrowser();
  return await browserInstance.newPage();
} 