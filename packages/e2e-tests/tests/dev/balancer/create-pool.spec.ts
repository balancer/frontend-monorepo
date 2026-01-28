import { clickButton } from '@/helpers/user.helpers'
import { POOL_CREATION_CONFIGS } from '@/helpers/create-pool.helpers'
import { test, expect } from './create-pool.fixture'

test.describe('Can create each pool type', () => {
  for (const config of POOL_CREATION_CONFIGS) {
    test(config.type, async ({ createPoolWithConfig }) => {
      const createPool = await createPoolWithConfig(config)

      await createPool.typeStep({ continue: true })
      await createPool.tokensStep({ continue: true })
      await createPool.detailsStep({ continue: true })
      await createPool.fundStep()
      await createPool.transactionSteps()
    })
  }
})

test.describe('Can reset form on each step', () => {
  test('type', async ({ page, createPool }) => {
    await page.getByText('Plasma').click()
    await page.getByText('Weighted', { exact: true }).click()
    await createPool.resetAndConfirm()
    await createPool.expectInitialFormState()
  })

  test('tokens', async ({ createPool }) => {
    await createPool.typeStep({ continue: true })
    await createPool.tokensStep()
    await createPool.resetAndConfirm()
    await createPool.expectInitialFormState()
  })

  test('details', async ({ createPool }) => {
    await createPool.typeStep({ continue: true })
    await createPool.tokensStep({ continue: true })
    await createPool.detailsStep()
    await createPool.resetAndConfirm()
    await createPool.expectInitialFormState()
  })

  test('fund', async ({ createPool }) => {
    await createPool.typeStep({ continue: true })
    await createPool.tokensStep({ continue: true })
    await createPool.detailsStep({ continue: true })
    await createPool.fundStep()
    await createPool.resetAndConfirm()
    await createPool.expectInitialFormState()
  })
})

test.describe('Build popover', () => {
  test('Sets form state for protocol', async ({ page, createPool }) => {
    const buildLink = page.getByText('Build', { exact: true })
    await expect(buildLink).toBeVisible()
    await buildLink.click()

    await page.getByText('CoW AMM', { exact: true }).click()
    await expect(page).toHaveURL(`${createPool.urls.base}?protocol=cow`)
    await expect(page.getByText('CoW AMM: 50/50')).toBeVisible()
  })

  test.describe('If pool creation in progress', () => {
    test('can continue', async ({ page, createPoolInProgress }) => {
      await clickButton(page, 'Continue set up')
      // await expect(page).toHaveURL(createPoolInProgress.urls.tokens) // fix me in useFormSteps hook
      await expect(page.getByText('Choose pool tokens')).toBeVisible()
    })

    test('can reset', async ({ page, createPoolInProgress }) => {
      await clickButton(page, 'Delete and start over')
      await expect(page).toHaveURL(createPoolInProgress.urls.type)
      await expect(page.getByText('Choose protocol')).toBeVisible()
    })
  })
})
