import { describe, it, before, after } from 'mocha';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import assert from 'assert';
import { sleep, takeScreenshotOnFailure } from './helpers';

describe('Impersonation - Ver como Empresa', function() {
  let driver: WebDriver;
  const baseUrl = 'http://nginx:8080';

  before(async function() {
    driver = await new Builder()
      .forBrowser('chrome')
      .usingServer('http://selenium:4444/wd/hub')
      .build();
  });

  after(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  it('super admin should impersonate company and see company view', async function() {
    try {
      // 1. Login as super admin
      await driver.get(`${baseUrl}/login`);
      await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
      
      const emailInput = await driver.findElement(By.css('input[type="email"]'));
      const passwordInput = await driver.findElement(By.css('input[type="password"]'));
      
      await emailInput.sendKeys('admin@local');
      await passwordInput.sendKeys('Admin123!');
      
      const submitButton = await driver.findElement(By.css('button[type="submit"]'));
      await submitButton.click();
      
      // Wait for dashboard
      await driver.wait(until.urlContains('/dashboard'), 10000);
      await sleep(1000);
      
      // 2. Verify super admin sees "Super Admin" link
      const navbarText = await driver.findElement(By.css('.navbar')).getText();
      assert(navbarText.includes('Super Admin'), 'Super admin should see Super Admin link');
      assert(!navbarText.includes('Plans'), 'Super admin should not see Plans link before impersonation');
      
      // 3. Navigate to Super Admin page
      const superAdminLink = await driver.findElement(By.linkText('Super Admin'));
      await superAdminLink.click();
      await driver.wait(until.urlContains('/super-admin'), 10000);
      await sleep(2000);
      
      // 4. Get first company ID from table
      const firstCompanyRow = await driver.findElement(By.css('tbody tr'));
      const companyIdCell = await firstCompanyRow.findElement(By.css('td:first-child'));
      const companyId = await companyIdCell.getText();
      
      console.log(`Found company ID: ${companyId}`);
      
      // 5. Click "Ver como empresa" button for first company
      const impersonateButton = await firstCompanyRow.findElement(By.css('button.btn-warning'));
      const buttonText = await impersonateButton.getText();
      assert(buttonText.includes('Ver como empresa'), 'Should find impersonate button');
      
      await impersonateButton.click();
      
      // 6. Wait for redirect to dashboard (should happen after impersonation)
      await driver.wait(until.urlContains('/dashboard'), 10000);
      await sleep(2000);
      
      // 7. Verify navbar changed - should now see "Plans" instead of "Super Admin"
      const impersonatedNavbar = await driver.findElement(By.css('.navbar')).getText();
      console.log('Navbar after impersonation:', impersonatedNavbar);
      
      assert(impersonatedNavbar.includes('Plans'), 'After impersonation, should see Plans link');
      assert(!impersonatedNavbar.includes('Super Admin'), 'After impersonation, should NOT see Super Admin link');
      
      // 8. Verify can access Plans page (company view)
      const plansLink = await driver.findElement(By.linkText('Plans'));
      await plansLink.click();
      await driver.wait(until.urlContains('/plans'), 10000);
      await sleep(2000);
      
      // Should see plans page content
      const pageText = await driver.findElement(By.tagName('body')).getText();
      assert(pageText.includes('Plan') || pageText.includes('Subscription'), 'Should see Plans page content');
      
      // 9. Verify cannot access Super Admin page while impersonating
      await driver.get(`${baseUrl}/super-admin`);
      await sleep(1000);
      
      // Should either redirect or show access denied
      const currentUrl = await driver.getCurrentUrl();
      assert(!currentUrl.includes('/super-admin'), 'Should not be able to access Super Admin while impersonating');
      
      console.log('✓ Impersonation test passed!');
      
    } catch (error) {
      await takeScreenshotOnFailure(driver, 'impersonation-failed');
      throw error;
    }
  });

  it('should stop impersonation and return to super admin view', async function() {
    try {
      // First, logout if logged in
      try {
        await driver.get(`${baseUrl}/dashboard`);
        await sleep(1000);
        const logoutLink = await driver.findElement(By.linkText('Sair'));
        await logoutLink.click();
        await driver.wait(until.urlContains('/login'), 10000);
        await sleep(1000);
      } catch (e) {
        // Already logged out, continue
        await driver.get(`${baseUrl}/login`);
      }
      
      // Login as super admin
      await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
      
      const emailInput = await driver.findElement(By.css('input[type="email"]'));
      const passwordInput = await driver.findElement(By.css('input[type="password"]'));
      
      await emailInput.sendKeys('admin@local');
      await passwordInput.sendKeys('Admin123!');
      
      const submitButton = await driver.findElement(By.css('button[type="submit"]'));
      await submitButton.click();
      
      await driver.wait(until.urlContains('/dashboard'), 10000);
      await sleep(2000);
      
      // Verify we're back as super admin (should see Super Admin link)
      const navbarText = await driver.findElement(By.css('.navbar')).getText();
      assert(navbarText.includes('Super Admin'), 'Should see Super Admin link as super admin');
      
      console.log('✓ Stop impersonation test passed (logout clears impersonation)!');
      
    } catch (error) {
      await takeScreenshotOnFailure(driver, 'stop-impersonation-failed');
      throw error;
    }
  });
});
