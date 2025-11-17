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

describe('Campaigns page', () => {
  let driver: any
  before(async () => { driver = await buildDriver(true) })
  after(async () => { if (driver) await driver.quit() })
  afterEach(async function() {
    if (this.currentTest?.state === 'failed' && driver) {
      await takeScreenshot(driver, this.currentTest.title.replace(/\s+/g, '_'))
    }
  })

  it('should create and list campaigns', async () => {
    await login(driver)
    await (await waitVisible(driver, By.linkText('Campaigns'))).click()
    await waitVisible(driver, By.xpath("//h3[contains(., 'Campaigns')]"))
    const company = await waitVisible(driver, By.css('input[placeholder="Company ID"]'))
    const name = await waitVisible(driver, By.css('input[placeholder="Campaign name"]'))
    await company.clear(); await company.sendKeys('1')
    const testName = `Auto Test ${Date.now()}`
    await name.clear(); await name.sendKeys(testName)
    await (await waitVisible(driver, By.xpath("//button[contains(., 'Create')]"))).click()
    // Verify it appears in the table
    const row = await waitVisible(driver, By.xpath(`//table//tr[td[contains(., '${testName}')]]`))
    expect(await row.getText()).to.contain(testName)
  })
})
