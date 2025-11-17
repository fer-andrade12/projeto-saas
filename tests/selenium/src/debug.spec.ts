import { By } from 'selenium-webdriver'
import { buildDriver, waitVisible, FRONT_URL } from './helpers'

describe('Debug login', () => {
  let driver: any
  before(async () => { driver = await buildDriver(true) })
  after(async () => { if (driver) await driver.quit() })

  it('should debug login flow', async () => {
    console.log('Navigating to:', FRONT_URL)
    await driver.get(`${FRONT_URL}/`)
    
    // Wait a bit and get page title and URL
    await driver.sleep(2000)
    const title = await driver.getTitle()
    const url = await driver.getCurrentUrl()
    console.log('Page title:', title)
    console.log('Current URL:', url)
    
    // Get page source to see what's rendered
    const source = await driver.getPageSource()
    console.log('Page source length:', source.length)
    console.log('Has input[type="email"]:', source.includes('type="email"'))
    console.log('Has "Login":', source.includes('Login'))
    
    // Try to find and fill the login form
    const email = await waitVisible(driver, By.css('input[type="email"]'))
    const pass = await waitVisible(driver, By.css('input[type="password"]'))
    await email.clear(); await email.sendKeys('admin@local')
    await pass.clear(); await pass.sendKeys('Admin123!')
    
    console.log('Filled credentials, clicking submit...')
    const submit = await waitVisible(driver, By.css('button[type="submit"]'))
    await submit.click()
    
    // Wait and see where we land
    await driver.sleep(3000)
    const afterUrl = await driver.getCurrentUrl()
    const afterTitle = await driver.getTitle()
    const afterSource = await driver.getPageSource()
    console.log('After login URL:', afterUrl)
    console.log('After login title:', afterTitle)
    console.log('Has "Admin Dashboard":', afterSource.includes('Admin Dashboard'))
    console.log('Has "error":', afterSource.toLowerCase().includes('error'))
    console.log('Has "alert":', afterSource.toLowerCase().includes('alert'))
    
    // Try to find alert element and get its text
    try {
      const alerts = await driver.findElements(By.css('.alert'))
      console.log('Found alerts:', alerts.length)
      for (let i = 0; i < alerts.length; i++) {
        const text = await alerts[i].getText()
        console.log('Alert', i, 'text:', text)
      }
    } catch (e) {
      console.log('No alerts found')
    }
    
    // Save screenshot
    try {
      const screenshot = await driver.takeScreenshot()
      console.log('Screenshot taken, length:', screenshot.length)
    } catch (e) {
      console.log('Screenshot error:', e)
    }
  })
})
