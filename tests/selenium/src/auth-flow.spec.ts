import { By } from 'selenium-webdriver'
import { expect } from 'chai'
import { buildDriver, waitVisible, takeScreenshot, FRONT_URL } from './helpers'

describe('Auth Flow - Login/Logout/Navigation Guards', () => {
  let driver: any
  before(async () => { driver = await buildDriver(true) })
  after(async () => { if (driver) await driver.quit() })
  afterEach(async function() {
    if (this.currentTest?.state === 'failed' && driver) {
      await takeScreenshot(driver, this.currentTest.title.replace(/\s+/g, '_'))
    }
  })

  it('should show login page when not authenticated', async () => {
    await driver.get(`${FRONT_URL}/`)
    const email = await waitVisible(driver, By.css('input[type="email"]'), 8000)
    expect(await email.isDisplayed()).to.be.true
  })

  it('should login and redirect to dashboard', async () => {
    await driver.get(`${FRONT_URL}/`)
    const email = await waitVisible(driver, By.css('input[type="email"]'))
    const pass = await waitVisible(driver, By.css('input[type="password"]'))
    await email.clear()
    await email.sendKeys('admin@local')
    await pass.clear()
    await pass.sendKeys('Admin123!')
    const submit = await waitVisible(driver, By.css('button[type="submit"]'))
    await submit.click()
    await driver.sleep(2000)
    const url = await driver.getCurrentUrl()
    expect(url).to.contain('/dashboard')
    const h2 = await waitVisible(driver, By.xpath("//h2[contains(., 'Admin Dashboard')]"), 10000)
    expect(await h2.getText()).to.contain('Admin Dashboard')
  })

  it('should NOT allow going back to login after logged in', async () => {
    // User is logged in from previous test
    await driver.get(`${FRONT_URL}/`)
    await driver.sleep(1500)
    const url = await driver.getCurrentUrl()
    // Should redirect to /dashboard, not stay on /
    expect(url).to.contain('/dashboard')
  })

  it('should block access to protected routes when not logged in (after logout)', async () => {
    // First logout
    const sairLink = await waitVisible(driver, By.xpath("//a[contains(., 'Sair')]"), 8000)
    await sairLink.click()
    await driver.sleep(1500)
    
    // Should be on login page
    let url = await driver.getCurrentUrl()
    expect(url).to.not.contain('/dashboard')
    
    // Try to access /campaigns directly
    await driver.get(`${FRONT_URL}/campaigns`)
    await driver.sleep(1500)
    url = await driver.getCurrentUrl()
    // Should redirect to login (/)
    expect(url).to.not.contain('/campaigns')
    expect(url).to.match(/\/$/)
  })

  it('should show login form after logout', async () => {
    await driver.get(`${FRONT_URL}/`)
    const email = await waitVisible(driver, By.css('input[type="email"]'), 8000)
    expect(await email.isDisplayed()).to.be.true
  })

  it('should NOT allow back button to re-enter dashboard after logout', async () => {
    // Login again
    await driver.get(`${FRONT_URL}/`)
    const email = await waitVisible(driver, By.css('input[type="email"]'))
    const pass = await waitVisible(driver, By.css('input[type="password"]'))
    await email.clear()
    await email.sendKeys('admin@local')
    await pass.clear()
    await pass.sendKeys('Admin123!')
    const submit = await waitVisible(driver, By.css('button[type="submit"]'))
    await submit.click()
    await driver.sleep(2000)
    
    // Verify on dashboard
    let url = await driver.getCurrentUrl()
    expect(url).to.contain('/dashboard')
    
    // Logout
    const sairLink = await waitVisible(driver, By.xpath("//a[contains(., 'Sair')]"), 8000)
    await sairLink.click()
    await driver.sleep(1500)
    
    // Try browser back
    await driver.navigate().back()
    await driver.sleep(1500)
    
    // Should still be on login, not dashboard
    url = await driver.getCurrentUrl()
    expect(url).to.not.contain('/dashboard')
  })

  it('should show only public links when logged out', async () => {
    await driver.get(`${FRONT_URL}/`)
    await driver.sleep(1000)
    
    // Should see Sign Up and Forgot links
    const signupLink = await driver.findElements(By.xpath("//a[contains(., 'Sign Up')]"))
    const forgotLink = await driver.findElements(By.xpath("//a[contains(., 'Forgot')]"))
    
    expect(signupLink.length).to.be.greaterThan(0)
    expect(forgotLink.length).to.be.greaterThan(0)
    
    // Should NOT see Dashboard, Campaigns, Customers
    const dashboardLink = await driver.findElements(By.xpath("//a[contains(., 'Dashboard')]"))
    const campaignsLink = await driver.findElements(By.xpath("//a[contains(., 'Campaigns')]"))
    
    expect(dashboardLink.length).to.equal(0)
    expect(campaignsLink.length).to.equal(0)
  })

  it('should show only internal links when logged in', async () => {
    // Login
    const email = await waitVisible(driver, By.css('input[type="email"]'))
    const pass = await waitVisible(driver, By.css('input[type="password"]'))
    await email.clear()
    await email.sendKeys('admin@local')
    await pass.clear()
    await pass.sendKeys('Admin123!')
    const submit = await waitVisible(driver, By.css('button[type="submit"]'))
    await submit.click()
    await driver.sleep(2000)
    
    // Should see Dashboard, Campaigns, Customers, Sair
    const dashboardLink = await driver.findElements(By.xpath("//a[contains(., 'Dashboard')]"))
    const campaignsLink = await driver.findElements(By.xpath("//a[contains(., 'Campaigns')]"))
    const sairLink = await driver.findElements(By.xpath("//a[contains(., 'Sair')]"))
    
    expect(dashboardLink.length).to.be.greaterThan(0)
    expect(campaignsLink.length).to.be.greaterThan(0)
    expect(sairLink.length).to.be.greaterThan(0)
    
    // Should NOT see Sign Up or Forgot
    const signupLink = await driver.findElements(By.xpath("//a[contains(., 'Sign Up')]"))
    const forgotLink = await driver.findElements(By.xpath("//a[contains(., 'Forgot')]"))
    
    expect(signupLink.length).to.equal(0)
    expect(forgotLink.length).to.equal(0)
  })
})
