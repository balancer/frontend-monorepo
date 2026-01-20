import { impersonate } from '@/helpers/e2e.helpers'
import { clickButton, button } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

const BASE_URL = 'http://localhost:3000/create'

test('Create pool form step navigation', async ({ page }) => {
  await page.goto(`${BASE_URL}`)
  await expect(page).toHaveURL(`${BASE_URL}/step-1-type`)

  await impersonate(page, defaultAnvilAccount)

  await expect(page.getByText('Choose protocol')).toBeVisible()
  await expect(page.getByText('Choose network')).toBeVisible()

  await clickButton(page, 'Next')
  await expect(page).toHaveURL(`${BASE_URL}/step-2-tokens`)
  await expect(page.getByText('Choose pool tokens')).toBeVisible()
  const step2NextButton = button(page, 'Next')
  await expect(step2NextButton).toBeDisabled()
  await button(page, 'Select token').first().click()
  await page.getByText('Wrapped Ether', { exact: true }).click()
  await button(page, 'Select token').first().click()
  await page.getByText('Aave Token', { exact: true }).click()
  await expect(step2NextButton).toBeEnabled()

  await clickButton(page, 'Next')
  await expect(page).toHaveURL(`${BASE_URL}/step-3-details`)
  await expect(page.getByText('Pool details')).toBeVisible()
  await expect(page.getByText('Pool settings')).toBeVisible()

  await clickButton(page, 'Next')
  await expect(page).toHaveURL(`${BASE_URL}/step-4-fund`)
  await expect(page.getByText('Seed initial pool liquidity')).toBeVisible()
  await expect(button(page, 'Create Pool')).toBeDisabled()
})

test.describe('Build popover to pool page', () => {
  test('Sets form state for protocol', async ({ page }) => {
    await page.goto('http://localhost:3000/swap')

    await impersonate(page, defaultAnvilAccount)

    const buildLink = page.getByText('Build', { exact: true })
    await expect(buildLink).toBeVisible()
    await buildLink.click()

    await page.getByText('CoW AMM', { exact: true }).click()

    await expect(page).toHaveURL(`${BASE_URL}?protocol=cow`)

    await expect(page.getByText('CoW AMM: 50/50')).toBeVisible()
  })

  test.describe('Triggers warning modal', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}`)
      await expect(page).toHaveURL(`${BASE_URL}/step-1-type`)

      await impersonate(page, defaultAnvilAccount)

      await clickButton(page, 'Next')
      await expect(page).toHaveURL(`${BASE_URL}/step-2-tokens`)

      const buildLink = page.getByText('Build', { exact: true })
      await expect(buildLink).toBeVisible()
      await buildLink.click()

      await page.getByText('CoW AMM', { exact: true }).click()
      await expect(page).toHaveURL(`${BASE_URL}?protocol=cow`)

      await expect(page.getByText('Delete progress and start over')).toBeVisible()
    })

    test('can continue progress', async ({ page }) => {
      await clickButton(page, 'Continue set up')
      await expect(page).toHaveURL(`${BASE_URL}/step-2-tokens`)
      await expect(page.getByText('Choose pool tokens')).toBeVisible()
    })

    test('can reset progress', async ({ page }) => {
      await clickButton(page, 'Delete and start over')
      await expect(page).toHaveURL(`${BASE_URL}/step-1-type`)
      await expect(page.getByText('Choose protocol')).toBeVisible()
    })
  })
})
