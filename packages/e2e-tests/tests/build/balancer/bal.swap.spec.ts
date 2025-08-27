import { button, clickButton, clickLink } from '@/helpers/user.helpers'
import { test, expect } from '@playwright/test'

test('Open swap page and try eth wrap', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await clickLink(page, 'Swap')

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
