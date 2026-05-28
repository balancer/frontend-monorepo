import { expect, test } from '@playwright/test'
import { captureConsoleErrors } from '@/helpers/e2e.helpers'

test('beets landing', async ({ page }) => {
  const errors = captureConsoleErrors(page)
  await page.goto('http://localhost:3001')
  await page.getByRole('link', { name: 'Launch app' }).click()
  await page.getByText('Details').click()
  expect(errors).toEqual([])
})
