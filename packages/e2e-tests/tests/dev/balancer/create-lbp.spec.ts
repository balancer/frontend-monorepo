import { impersonate } from '@/helpers/e2e.helpers'
import { clickButton } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { oneDayInMs, toISOString } from '@repo/lib/shared/utils/time'
import {
  doProjectInfoStep,
  doReviewStep,
  doSaleStructureStep,
  expectInitialFormState,
  clickResetAndConfirm,
  mockCreateLbpMetadata,
  stepUrl,
  BASE_URL,
  LBP_CONFIGS,
} from '@/helpers/create-lbp.helpers'

test.describe('Create LBP page', () => {
  test.beforeEach(async ({ page }) => {
    await mockCreateLbpMetadata(page)
    await page.goto(BASE_URL)
    await impersonate(page, defaultAnvilAccount)
  })

  test.describe('create each sale type', () => {
    for (const lbpConfig of LBP_CONFIGS) {
      test(lbpConfig.saleType, async ({ page }) => {
        await doSaleStructureStep(page, { lbpConfig, continue: true })
        await doProjectInfoStep(page, { continue: true })
        await doReviewStep(page, { lbpConfig })
      })
    }
  })

  test('shows validation errors when required fields are missing', async ({ page }) => {
    await expect(page).toHaveURL(stepUrl(0))

    await clickButton(page, 'Next')

    await expect(page.getByText('Token address is required')).toBeVisible()
    await expect(page.getByText('Start date and time is required')).toBeVisible()
    await expect(page.getByText('End date and time is required')).toBeVisible()
    await expect(page.getByText('Sale token amount is required')).toBeVisible()
    await expect(page.getByText('Collateral token amount is required')).toBeVisible()
    await expect(page).toHaveURL(stepUrl(0))
  })

  test('blocks sale period shorter than 24 hours', async ({ page }) => {
    await doSaleStructureStep(page)

    const dateInputs = page.locator('input[type="datetime-local"]')
    const invalidEndTime = toISOString(Date.now() + oneDayInMs + 60 * 60 * 1000).slice(0, 16)
    await dateInputs.last().fill(invalidEndTime)

    await clickButton(page, 'Next')

    await expect(
      page.getByText('End time must be at least 24 hours after start time'),
    ).toBeVisible()
    await expect(page).toHaveURL(stepUrl(0))
  })

  test.describe('Form reset', () => {
    test('sale structure step', async ({ page }) => {
      await doSaleStructureStep(page)
      await clickButton(page, 'Next')

      await clickResetAndConfirm(page)
      await expectInitialFormState(page)
    })

    test('project info step', async ({ page }) => {
      await doSaleStructureStep(page, { continue: true })
      await doProjectInfoStep(page)

      await clickResetAndConfirm(page)
      await expectInitialFormState(page)
    })

    test('review step', async ({ page }) => {
      await doSaleStructureStep(page, { continue: true })
      await doProjectInfoStep(page, { continue: true })

      await expect(page).toHaveURL(stepUrl(2))
      await clickResetAndConfirm(page)
      await expectInitialFormState(page)
    })
  })
})
