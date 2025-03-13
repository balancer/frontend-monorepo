import { Page } from '@playwright/test'

export async function impersonate(page: Page, impersonationAddress: string) {
  await page.getByLabel('Mock address').fill(impersonationAddress)
  await page.getByLabel('Impersonate').click()
  await acceptPolicies(page)
}

export async function acceptPolicies(page: Page) {
  await page
    .getByRole('dialog', { name: 'Accept Balancer policies' })
    .locator('span')
    .first()
    .check()
  await page.getByRole('button', { name: 'Proceed' }).click()
}
