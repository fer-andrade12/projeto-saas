import { expect } from 'chai'
import axios from 'axios'
import { buildDriver, takeScreenshot, FRONT_URL, API_URL } from './helpers'
import { By } from 'selenium-webdriver'

async function getToken() {
  const resp = await axios.post(`${API_URL}/auth/login`, { email: 'admin@local', password: 'Admin123!' })
  return resp.data.accessToken as string
}

describe('Campaign send + click redirect', () => {
  let driver: any
  before(async () => { driver = await buildDriver(true) })
  after(async () => { if (driver) await driver.quit() })
  afterEach(async function() {
    if (this.currentTest?.state === 'failed' && driver) {
      await takeScreenshot(driver, this.currentTest.title.replace(/\s+/g, '_'))
    }
  })

  it('should create campaign, send, and click to landing', async () => {
    const token = await getToken()
    const camp = await axios.post(`${API_URL}/admin/campaigns`, { company_id: 1, name: 'E2E Campaign', landing_url: 'https://example.com' }, { headers: { Authorization: `Bearer ${token}` } })
    const send = await axios.post(`${API_URL}/admin/campaigns/${camp.data.id}/send`, { channel: 'both', customer_ids: [1] }, { headers: { Authorization: `Bearer ${token}` } })
    const clickUrl = send.data.sends[0].click_url as string

    await driver.get(`${FRONT_URL}/`) // open something first
    await driver.get(clickUrl)
    const current = await driver.getCurrentUrl()
    expect(current).to.equal('https://example.com/')
  })
})
