import { impersonate } from '@/helpers/e2e.helpers'
import { button, clickButton, isButtonVisible } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

const BASE_URL = 'http://localhost:3000/create'

test('Create pool form step navigation', async ({ page }) => {
  await page.goto(`${BASE_URL}`)
  await expect(page).toHaveURL(`${BASE_URL}/step-1-type`)

  await impersonate(page, defaultAnvilAccount)

  await expect(page.getByText('Choose protocol')).toBeVisible()
  await expect(page.getByText('Choose network')).toBeVisible()

  const step1NextButton = page.getByRole('link', { name: 'Next' })
  await step1NextButton.click()

  await expect(page).toHaveURL(`${BASE_URL}/step-2-tokens`)
  await expect(page.getByText('Choose pool tokens')).toBeVisible()

  const step2NextButton = page.getByRole('link', { name: 'Next' })
  await expect(step2NextButton).toHaveAttribute('disabled', '')

  await page.getByRole('button', { name: 'Select token' }).first().click()
  await page.getByText('Wrapped Ether', { exact: true }).click()

  await page.getByRole('button', { name: 'Select token' }).first().click()
  await page.getByText('Aave Token', { exact: true }).click()

  await expect(step2NextButton).not.toHaveAttribute('disabled', '')
  await step2NextButton.click()

  await expect(page).toHaveURL(`${BASE_URL}/step-3-details`)
  await expect(page.getByText('Pool details')).toBeVisible()
  await expect(page.getByText('Pool settings')).toBeVisible()

  const step3NextButton = page.getByRole('link', { name: 'Next' })
  await step3NextButton.click()
  await expect(page).toHaveURL(`${BASE_URL}/step-4-fund`)

  await expect(page.getByText('Seed initial pool liquidity')).toBeVisible()

  const createPoolButton = page.getByRole('button', { name: 'Create Pool' })
  await expect(createPoolButton).toBeVisible()
  await expect(createPoolButton).toHaveAttribute('disabled', '')
})
