import { expect } from 'chai'
import axios from 'axios'
import { By } from 'selenium-webdriver'
import { buildDriver, waitVisible, takeScreenshot, FRONT_URL, API_URL } from './helpers'

async function getToken(email: string, password: string) {
  const resp = await axios.post(`${API_URL}/auth/login`, { email, password })
  return resp.data.accessToken as string
}

describe('Role-based UI - Super Admin vs Company Admin', () => {
  let driver: any
  before(async () => { driver = await buildDriver(true) })
  after(async () => { if (driver) await driver.quit() })
  afterEach(async function() {
    if (this.currentTest?.state === 'failed' && driver) {
      await takeScreenshot(driver, this.currentTest.title.replace(/\s+/g, '_'))
    }
  })

  it('super admin should see Super Admin page', async () => {
    await driver.get(`${FRONT_URL}/`)
    const email = await waitVisible(driver, By.css('input[type="email"]'))
    const pass = await waitVisible(driver, By.css('input[type="password"]'))
    await email.clear(); await email.sendKeys('admin@local')
    await pass.clear(); await pass.sendKeys('Admin123!')
    const submit = await waitVisible(driver, By.css('button[type="submit"]'))
    await submit.click()
    await waitVisible(driver, By.xpath("//a[contains(., 'Super Admin')]"))
    const saLink = await driver.findElement(By.xpath("//a[contains(., 'Super Admin')]"))
    await saLink.click()
    const header = await waitVisible(driver, By.xpath("//h3[contains(., 'Super Admin')]"))
    expect(await header.getText()).to.contain('Super Admin')
  })

  it('company admin should not see Super Admin and should see Plans', async () => {
    // Create company + admin via API using super admin token
    const superToken = await getToken('admin@local', 'Admin123!')
    const suffix = Math.floor(Math.random() * 100000)
    const adminEmail = `owner${suffix}@example.com`
    const adminPass = 'Owner123!'
    await axios.post(`${API_URL}/super-admin/companies`, {
      name: `Company ${suffix}`,
      email: `company${suffix}@example.com`,
      adminEmail,
      adminPassword: adminPass
    }, { headers: { Authorization: `Bearer ${superToken}` } })

    // Login as company admin
    // Ensure logged out before logging as company admin
    await driver.get(`${FRONT_URL}/dashboard`)
    await driver.sleep(500)
    const sairLinkEls = await driver.findElements(By.xpath("//a[contains(., 'Sair')]"))
    if (sairLinkEls.length > 0) { await sairLinkEls[0].click(); await driver.sleep(500) }
    await driver.executeScript('localStorage.clear()');
    await driver.get(`${FRONT_URL}/`)
    const email = await waitVisible(driver, By.css('input[type="email"]'))
    const pass = await waitVisible(driver, By.css('input[type="password"]'))
    await email.clear(); await email.sendKeys(adminEmail)
    await pass.clear(); await pass.sendKeys(adminPass)
    const submit = await waitVisible(driver, By.css('button[type="submit"]'))
    await submit.click()

    // Should NOT see Super Admin link
    await driver.sleep(2000)
    const saLinks = await driver.findElements(By.xpath("//a[contains(., 'Super Admin')]"))
    expect(saLinks.length).to.equal(0)

    // Should see Plans link
    const plansLink = await waitVisible(driver, By.xpath("//a[contains(., 'Plans')]"))
    await plansLink.click()

    // On Plans page
    const header = await waitVisible(driver, By.xpath("//h3[contains(., 'Plans')]"))
    expect(await header.getText()).to.contain('Plans')
  })
})
