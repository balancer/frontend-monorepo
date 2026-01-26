import { impersonate } from '@/helpers/e2e.helpers'
import { clickButton } from '@/helpers/user.helpers'
import { CreatePoolPage, POOL_CREATION_CONFIGS } from '@/helpers/create-pool.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

for (const config of POOL_CREATION_CONFIGS) {
  test(`Can create ${config.type} pool`, async ({ page }) => {
    const createPool = new CreatePoolPage(page, config)
    await createPool.goToPage()
    await impersonate(page, defaultAnvilAccount)

    await createPool.typeStep({ continue: true })
    await createPool.tokensStep({ continue: true })
    await createPool.detailsStep({ continue: true })
    await createPool.fundStep()
    await createPool.transactionSteps()
  })
}

test.describe('Can reset form on each step', () => {
  let createPool: CreatePoolPage

  test.beforeEach(async ({ page }) => {
    createPool = new CreatePoolPage(page)
    await createPool.goToPage()
    await impersonate(page, defaultAnvilAccount)
  })

  test('type', async ({ page }) => {
    await page.getByText('Plasma').click()
    await page.getByText('Weighted', { exact: true }).click()
    await createPool.resetAndConfirm()
    await createPool.expectInitialFormState()
  })

  test('tokens', async () => {
    await createPool.typeStep({ continue: true })
    await createPool.tokensStep()
    await createPool.resetAndConfirm()
    await createPool.expectInitialFormState()
  })

  test('details', async () => {
    await createPool.typeStep({ continue: true })
    await createPool.tokensStep({ continue: true })
    await createPool.detailsStep()
    await createPool.resetAndConfirm()
    await createPool.expectInitialFormState()
  })

  test('fund', async () => {
    await createPool.typeStep({ continue: true })
    await createPool.tokensStep({ continue: true })
    await createPool.detailsStep({ continue: true })
    await createPool.fundStep()
    await createPool.resetAndConfirm()
    await createPool.expectInitialFormState()
  })
})

test.describe('Build popover', () => {
  let createPool: CreatePoolPage

  test.beforeEach(async ({ page }) => {
    createPool = new CreatePoolPage(page)
    await createPool.goToPage()
    await impersonate(page, defaultAnvilAccount)
  })

  test('Sets form state for protocol', async ({ page }) => {
    const buildLink = page.getByText('Build', { exact: true })
    await expect(buildLink).toBeVisible()
    await buildLink.click()

    await page.getByText('CoW AMM', { exact: true }).click()
    await expect(page).toHaveURL(`${createPool.urls.base}?protocol=cow`)
    await expect(page.getByText('CoW AMM: 50/50')).toBeVisible()
  })

  test.describe('If pool creation in progress', () => {
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

    test('can continue', async ({ page }) => {
      await clickButton(page, 'Continue set up')
      // await expect(page).toHaveURL(createPool.urls.tokens) // fix me in useFormSteps hook
      await expect(page.getByText('Choose pool tokens')).toBeVisible()
    })

    test('can reset', async ({ page }) => {
      await clickButton(page, 'Delete and start over')
      await expect(page).toHaveURL(createPool.urls.type)
      await expect(page.getByText('Choose protocol')).toBeVisible()
    })
  })
})
