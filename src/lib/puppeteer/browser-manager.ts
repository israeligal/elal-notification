import chromium from "@sparticuz/chromium-min";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";

const chromiumPack = "https://github.com/Sparticuz/chromium/releases/download/v137.0.0/chromium-v137.0.0-pack.tar";

let browser: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

export async function getBrowser() {
  if (browser) return browser;

  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENVIRONMENT === "production";
  
  // Default viewport as recommended in v137.0.0 release notes
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
  
  if (isProduction) {
    browser = await puppeteerCore.launch({
      args: [...chromium.args, ...args],
      executablePath: await chromium.executablePath(chromiumPack),
      headless: "shell", // Required for Puppeteer with v137.0.0
      defaultViewport: viewport,
    });
  } else {
    browser = await puppeteer.launch({
      args,
      headless: true,
      defaultViewport: viewport,
    });
  }
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