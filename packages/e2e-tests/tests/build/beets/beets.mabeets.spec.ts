import { expect, test } from '@playwright/test'
import { captureConsoleErrors } from '@/helpers/e2e.helpers'

test('Beets: /mabeets renders without console errors', async ({ page }) => {
  const errors = captureConsoleErrors(page)

  await page.goto('http://localhost:3001/mabeets')
  await expect(page.getByText('maBeets Numbers')).toBeVisible()

  expect(errors).toEqual([])
})
