import { button, clickButton } from '@/helpers/user.helpers'
import { test, expect } from '@playwright/test'

const GRAPHQL_URL = 'https://test-api-v3.balancer.fi/graphql'

test('Balancer: swap page renders', async ({ page }) => {
  const tokensResponsePromise = page.waitForResponse(
    res => res.url() === GRAPHQL_URL && res.status() === 200,
    { timeout: 90_000 },
  )
  await page.goto('http://localhost:3000/swap/ethereum/ETH')
  await tokensResponsePromise

  await expect(button(page, 'ETH')).toBeVisible()

  // Selects Wrapped Ether token out
  await clickButton(page, 'Select token')
  await page.getByPlaceholder('Search by name, symbol or').fill('we')
  await page.getByRole('img', { name: 'WETH', exact: true }).first().click()

  // Fills 1 ETH token in
  await page.getByLabel('TokenIn').click()
  await page.getByLabel('TokenIn').fill('1')

  await expect(page).toHaveURL('http://localhost:3000/swap/ethereum/ETH/WETH/1')
  await expect(page.getByText('1 ETH = 1 WETH')).toBeVisible()
})
