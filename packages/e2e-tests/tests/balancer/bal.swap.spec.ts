import { test, expect } from '@playwright/test'

test('Open swap page and try eth wrap', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await page.getByRole('link', { name: 'Swap', exact: true }).click()

  // Selects Wrapped Ether token out
  await page.getByRole('button', { name: 'Select token' }).click()
  await page.getByPlaceholder('Search by name, symbol or').click()
  await page.getByPlaceholder('Search by name, symbol or').fill('we')
  await page.getByText('Wrapped Ether').click()

  // Fills 1 ETH token in
  await page.getByPlaceholder('0.00').first().click()
  await page.getByPlaceholder('0.00').first().fill('1')

  await expect(page).toHaveURL('http://localhost:3000/swap/ethereum/ETH/WETH/1')

  // There's a quote displayed
  const button = page.getByRole('button', { name: /ETH = 1 WETH/ })
  await expect(button).toBeVisible()
})
