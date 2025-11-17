import { By } from 'selenium-webdriver'
import { expect } from 'chai'
import { buildDriver, waitVisible, takeScreenshot, FRONT_URL } from './helpers'

describe('Login flow (CEO/Admin)', () => {
  let driver: any
  before(async () => { driver = await buildDriver(true) })
  after(async () => { if (driver) await driver.quit() })
  afterEach(async function() {
    if (this.currentTest?.state === 'failed' && driver) {
      await takeScreenshot(driver, this.currentTest.title.replace(/\s+/g, '_'))
    }
  })

  it('should login and land on Dashboard', async () => {
    await driver.get(`${FRONT_URL}/`)
    const email = await waitVisible(driver, By.css('input[type="email"]'))
    const pass = await waitVisible(driver, By.css('input[type="password"]'))
    await email.clear(); await email.sendKeys('admin@local')
    await pass.clear(); await pass.sendKeys('Admin123!')
    const submit = await waitVisible(driver, By.css('button[type="submit"]'))
    await submit.click()
    const h2 = await waitVisible(driver, By.xpath("//h2[contains(., 'Admin Dashboard')]"))
    expect(await h2.getText()).to.contain('Admin Dashboard')
  })
})
