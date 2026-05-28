import { expect, test } from '@playwright/test'
import { captureConsoleErrors } from '@/helpers/e2e.helpers'

test('Beets: /stake renders without console errors', async ({ page }) => {
  const errors = captureConsoleErrors(page)

  await page.goto('http://localhost:3001/stake')
  await expect(page.getByText('stS rate')).toBeVisible()

  expect(errors).toEqual([])
})
