import { expect, test } from '@playwright/test'

test('Beets: stake page renders', async ({ page }) => {
  await page.goto('http://localhost:3001/stake')
  await expect(page.getByRole('button', { name: 'Stake' })).toBeVisible()
})
