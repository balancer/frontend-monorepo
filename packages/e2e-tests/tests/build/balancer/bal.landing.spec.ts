import { expect, test } from '@playwright/test'
import { captureConsoleErrors } from '@/helpers/e2e.helpers'

test('Balancer landing page', async ({ page }) => {
  const errors = captureConsoleErrors(page)
  await page.goto('http://localhost:3000/')
  await page.getByRole('link', { name: 'Launch app' }).click()
  // Finds a pool in the pool list
  await page.getByRole('group').filter({ hasText: 'wstETHwstETH20%AAVEAAVE80%' }).click()
  expect(errors).toEqual([])
})
