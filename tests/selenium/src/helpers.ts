import { Builder, By, until, WebDriver } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'
import * as fs from 'fs'
import * as path from 'path'

export async function buildDriver(headless = true): Promise<WebDriver> {
  const opts = new chrome.Options()
  const shouldHeadless = (process.env.HEADLESS || 'true').toLowerCase() !== 'false' && headless
  if (shouldHeadless) {
    opts.addArguments('--headless=new')
  }
  opts.addArguments('--window-size=1366,768')
  const remote = process.env.SELENIUM_REMOTE_URL
  if (remote) {
    return await new Builder().forBrowser('chrome').setChromeOptions(opts).usingServer(remote).build()
  }
  return await new Builder().forBrowser('chrome').setChromeOptions(opts).build()
}

export async function waitVisible(driver: WebDriver, locator: By, timeout = 10000) {
  await driver.wait(until.elementLocated(locator), timeout)
  const el = await driver.findElement(locator)
  await driver.wait(until.elementIsVisible(el), timeout)
  return el
}

export async function takeScreenshot(driver: WebDriver, testName: string): Promise<string | null> {
  try {
    const screenshotDir = path.join(__dirname, '..', 'screenshots')
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true })
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${testName}_${timestamp}.png`
    const filepath = path.join(screenshotDir, filename)
    const screenshot = await driver.takeScreenshot()
    fs.writeFileSync(filepath, screenshot, 'base64')
    console.log(`Screenshot saved: ${filepath}`)
    return filepath
  } catch (error) {
    console.error('Failed to take screenshot:', error)
    return null
  }
}

export const FRONT_URL = process.env.FRONT_URL || 'http://localhost:5173'
export const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1'

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function takeScreenshotOnFailure(driver: WebDriver, testName: string): Promise<void> {
  await takeScreenshot(driver, testName)
}
