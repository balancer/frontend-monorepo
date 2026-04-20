import { clickButton } from '@/helpers/user.helpers'
import { POOL_CREATION_CONFIGS } from '@/helpers/create-pool.helpers'
import { test, expect } from '../../../helpers/create-pool.fixtures'
import { PoolType } from '@balancer/sdk'
import { forkClient } from '@repo/lib/test/utils/wagmi/fork.helpers'

test.describe('Create each pool type', () => {
  let snapshotId: `0x${string}`

  test.beforeEach(async () => {
    snapshotId = await forkClient.snapshot()
  })

  test.afterEach(async () => {
    await forkClient.revert({ id: snapshotId })
  })

  for (const config of POOL_CREATION_CONFIGS) {
    test(config.type, async ({ createPool }) => {
      const pool = await createPool(config)

      await pool.typeStep(true)
      await pool.tokensStep(true)
      await pool.detailsStep(true)
      await pool.fundStep()
      await pool.transactionSteps()
    })
  }
})

test.describe('Reset form on each step', () => {
  test('type', async ({ poolAtTypeStep }) => {
    await poolAtTypeStep.chooseNetwork('Arbitrum')
    await poolAtTypeStep.choosePoolType(PoolType.Weighted)
    await poolAtTypeStep.resetAndConfirm()
    await poolAtTypeStep.expectInitialFormState()
  })

  test('tokens', async ({ poolAtTokensStep }) => {
    await poolAtTokensStep.tokensStep()
    await poolAtTokensStep.resetAndConfirm()
    await poolAtTokensStep.expectInitialFormState()
  })

  test('details', async ({ poolAtDetailsStep }) => {
    await poolAtDetailsStep.detailsStep()
    await poolAtDetailsStep.resetAndConfirm()
    await poolAtDetailsStep.expectInitialFormState()
  })

  test('fund', async ({ poolAtFundStep }) => {
    await poolAtFundStep.fundStep()
    await poolAtFundStep.resetAndConfirm()
    await poolAtFundStep.expectInitialFormState()
  })
})

test.describe('Build popover', () => {
  test('protocol link sets form state for protocol', async ({ page, poolAtTypeStep }) => {
    await poolAtTypeStep.clickBuildPopoverToCowAmm()
    await expect(page.getByText('CoW AMM: 50/50')).toBeVisible()
  })

  test.describe('When pool creation already in progress', () => {
    test('can continue', async ({ page, poolAtTokensStep }) => {
      await poolAtTokensStep.clickBuildPopoverToCowAmm()
      await clickButton(page, 'Continue set up')
      await expect(page).toHaveURL(poolAtTokensStep.urls.tokens)
      await expect(page.getByText('Choose pool tokens')).toBeVisible()
    })

    test('can reset', async ({ page, poolAtTokensStep }) => {
      await poolAtTokensStep.clickBuildPopoverToCowAmm()
      await clickButton(page, 'Delete and start over')
      await expect(page).toHaveURL(poolAtTokensStep.urls.type)
      await expect(page.getByText('Choose protocol')).toBeVisible()
    })
  })
})
