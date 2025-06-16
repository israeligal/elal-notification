import chromium from "@sparticuz/chromium-min";
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
  try {
    browser = await puppeteerCore.launch({
      args: [...chromium.args, ...args],
      executablePath: await chromium.executablePath("https://www.dropbox.com/scl/fi/uvep7tdr557j8vmjtzzlq/chromium-v137.0.0-pack.x64.tar?rlkey=zh4jtxa4vbvn5ohm2jn8dv25f&st=7uhkqwcg&dl=1"), // Use default chromium binary
      headless: "shell", // Required for Puppeteer with v137.0.0
      defaultViewport: viewport,
    });
    
  } catch {
    browser = await puppeteerCore.launch({
      args: [...chromium.args, ...args],
      executablePath: await chromium.executablePath("https://www.dropbox.com/scl/fi/b7stjtchpnu7nphms7dd4/chromium-v137.0.0-pack.arm64.tar?rlkey=0bt7t9l1xsujbble6wzs915y7&st=d9tpd52g&dl=1"), // Use default chromium binary
      headless: "shell", // Required for Puppeteer with v137.0.0
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

 