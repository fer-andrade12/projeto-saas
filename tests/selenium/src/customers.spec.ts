import { By } from 'selenium-webdriver'
import { expect } from 'chai'
import { buildDriver, waitVisible, takeScreenshot, FRONT_URL } from './helpers'

async function login(driver: any) {
  await driver.get(`${FRONT_URL}/`)
  const email = await waitVisible(driver, By.css('input[type="email"]'))
  const pass = await waitVisible(driver, By.css('input[type="password"]'))
  await email.sendKeys('admin@local')
  await pass.sendKeys('Admin123!')
  await (await waitVisible(driver, By.css('button[type="submit"]'))).click()
  await waitVisible(driver, By.xpath("//h2[contains(., 'Admin Dashboard')]"))
}

describe('Customers page', () => {
  let driver: any
  before(async () => { driver = await buildDriver(true) })
  after(async () => { if (driver) await driver.quit() })
  afterEach(async function() {
    if (this.currentTest?.state === 'failed' && driver) {
      await takeScreenshot(driver, this.currentTest.title.replace(/\s+/g, '_'))
    }
  })

  it('should create a customer and import via CSV', async () => {
    await login(driver)
    await (await waitVisible(driver, By.linkText('Customers'))).click()
    await waitVisible(driver, By.xpath("//h3[contains(., 'Customers')]"))

    // Quick add
    const company = await waitVisible(driver, By.css('input[placeholder="Company ID"]'))
    const name = await waitVisible(driver, By.css('input[placeholder="Name"]'))
    const email = await waitVisible(driver, By.css('input[placeholder="Email"]'))
    await company.clear(); await company.sendKeys('1')
    await name.sendKeys('Selenium User')
    await email.sendKeys('sel@ex.com')
    await (await waitVisible(driver, By.xpath("//button[contains(., 'Add')]"))).click()

    // Verify row
    await waitVisible(driver, By.xpath("//table//tr[td[contains(., 'Selenium User')]]"))

    // CSV Import
    const textarea = await waitVisible(driver, By.css('textarea'))
    await textarea.clear()
    await textarea.sendKeys('name,email,phone\nAlice,alice@example.com,\nBob,,+5511999999999')
    await (await waitVisible(driver, By.xpath("//button[contains(., 'Import CSV')]"))).click()

    // Expect info alert to appear
    await waitVisible(driver, By.xpath("//div[contains(@class,'alert') and contains(., 'Imported')]"))
  })
})
