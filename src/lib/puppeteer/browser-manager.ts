import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";

let browser: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

export async function getBrowser() {
  if (browser) return browser;

  const isProduction = process.env.NODE_ENV === "production";

  const viewport = {
    deviceScaleFactor: 1,
    hasTouch: false,
    height: 1080,
    isLandscape: true,
    isMobile: false,
    width: 1920,
  };


  if (isProduction) {
    const args = [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ];

    browser = await puppeteerCore.launch({
      args: [...chromium.args, ...args],
      executablePath: await chromium.executablePath(
        "https://www.dropbox.com/scl/fi/uvep7tdr557j8vmjtzzlq/chromium-v137.0.0-pack.x64.tar?rlkey=zh4jtxa4vbvn5ohm2jn8dv25f&st=7uhkqwcg&dl=1",
      ), // Use default chromium binary
      headless: "shell", // Required for Puppeteer with v137.0.0
      defaultViewport: viewport,
      timeout: 50_000,
    });
  } else {
    browser = await puppeteer.launch({
      executablePath: puppeteer.executablePath(),
      headless: false,
      defaultViewport: viewport,
      timeout: 50_000,
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

 