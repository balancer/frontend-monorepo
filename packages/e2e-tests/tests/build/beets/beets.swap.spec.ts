import { button, clickButton, clickLink } from '@/helpers/user.helpers'
import { test, expect } from '@playwright/test'

test('Beets: swap page renders', async ({ page }) => {
  await page.goto('http://localhost:3001/')
  await clickLink(page, 'Swap')

  await expect(button(page, 'S')).toBeVisible()

  // Selects Wrapped Sonic token out
  await clickButton(page, 'Select token')
  await page.getByPlaceholder('Search by name, symbol or').fill('ws')
  await page.getByRole('img', { name: 'wS', exact: true }).first().click()

  // Fills 1 S token in
  await page.getByLabel('TokenIn').click()
  await page.getByLabel('TokenIn').fill('1')

  await expect(page).toHaveURL(
    'http://localhost:3001/swap/sonic/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee/wS/1',
  )
  await expect(page.getByText('1 S = 1 wS')).toBeVisible()
})
