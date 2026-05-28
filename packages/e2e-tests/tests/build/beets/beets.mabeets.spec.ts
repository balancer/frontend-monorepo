import { expect, test } from '@playwright/test'

test('Beets: /mabeets renders without console errors', async ({ page }) => {
  await page.goto('http://localhost:3001/mabeets')
  await expect(page.getByText('maBeets Numbers')).toBeVisible()
})
