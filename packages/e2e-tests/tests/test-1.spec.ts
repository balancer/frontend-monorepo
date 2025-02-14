import { test, expect } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await page.getByRole('link', { name: 'Swap', exact: true }).click()

  // Selects Wrapped Ether token out
  await page.getByRole('button', { name: 'Select token' }).first().click()
  await page.getByPlaceholder('Search by name, symbol or').fill('we')
  await page.getByRole('img', { name: 'WETH', exact: true }).click()

  // Fills 1 ETH token in
  await page.getByLabel('TokenIn').click()
  await page.getByLabel('TokenIn').fill('1')

  await expect(page).toHaveURL('http://localhost:3000/swap/ethereum/ETH/WETH/1')

  // There's a quote displayed
  const button = page.getByRole('button', { name: /ETH = 1 WETH/ })
  await expect(button).toBeVisible()
})
