import { impersonate } from '@/helpers/e2e.helpers'
import { clickButton } from '@/helpers/user.helpers'
import { CreatePoolPage } from '@/helpers/create-pool.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test.describe('Create pool page', () => {
  let createPool: CreatePoolPage

  test.beforeEach(async ({ page }) => {
    createPool = new CreatePoolPage(page)
    await createPool.goToPage()
    await impersonate(page, defaultAnvilAccount)
  })

  test('can complete all steps', async () => {
    await createPool.typeStep({ continue: true })
    await createPool.tokensStep({ continue: true })
    await createPool.detailsStep({ continue: true })
    await createPool.fundStep()
    await createPool.transactionSteps()
  })

  test.describe('Form reset', () => {
    test('pool type step', async ({ page }) => {
      await page.getByText('Plasma').click()
      await page.getByText('Weighted', { exact: true }).click()
      await createPool.resetAndConfirm()
      await createPool.expectInitialFormState()
    })

    test('token step', async () => {
      await createPool.typeStep({ continue: true })
      await createPool.tokensStep()
      await createPool.resetAndConfirm()
      await createPool.expectInitialFormState()
    })

    test('details step', async () => {
      await createPool.typeStep({ continue: true })
      await createPool.tokensStep({ continue: true })
      await createPool.detailsStep()
      await createPool.resetAndConfirm()
      await createPool.expectInitialFormState()
    })

    test('fund step', async () => {
      await createPool.typeStep({ continue: true })
      await createPool.tokensStep({ continue: true })
      await createPool.detailsStep({ continue: true })
      await createPool.fundStep()
      await createPool.resetAndConfirm()
      await createPool.expectInitialFormState()
    })
  })

  test.describe('Build popover', () => {
    test('Sets form state for protocol', async ({ page }) => {
      const buildLink = page.getByText('Build', { exact: true })
      await expect(buildLink).toBeVisible()
      await buildLink.click()

      await page.getByText('CoW AMM', { exact: true }).click()
      await expect(page).toHaveURL(`${createPool.urls.base}?protocol=cow`)
      await expect(page.getByText('CoW AMM: 50/50')).toBeVisible()
    })

    test.describe('Progress warning modal', () => {
      test.beforeEach(async ({ page }) => {
        await clickButton(page, 'Next')
        await expect(page).toHaveURL(createPool.urls.tokens)

        const buildLink = page.getByText('Build', { exact: true })
        await expect(buildLink).toBeVisible()
        await buildLink.click()

        await page.getByText('CoW AMM', { exact: true }).click()
        await expect(page).toHaveURL(`${createPool.urls.base}?protocol=cow`)
        await expect(page.getByText('Delete progress and start over')).toBeVisible()
      })

      test('can continue progress', async ({ page }) => {
        await clickButton(page, 'Continue set up')
        // await expect(page).toHaveURL(createPool.urls.tokens) // fix me in useFormSteps hook
        await expect(page.getByText('Choose pool tokens')).toBeVisible()
      })

      test('can reset progress', async ({ page }) => {
        await clickButton(page, 'Delete and start over')
        await expect(page).toHaveURL(createPool.urls.type)
        await expect(page.getByText('Choose protocol')).toBeVisible()
      })
    })
  })
})
