import { test as base } from '@playwright/test'
import { CreatePoolPage, PoolCreationConfig } from '@/helpers/create-pool.helpers'
import { impersonate } from '@/helpers/e2e.helpers'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

type CreatePoolFixtures = {
  createPool: (config?: PoolCreationConfig) => Promise<CreatePoolPage>
  poolAtTypeStep: CreatePoolPage
  poolAtTokensStep: CreatePoolPage
  poolAtDetailsStep: CreatePoolPage
  poolAtFundStep: CreatePoolPage
}

export const test = base.extend<CreatePoolFixtures>({
  createPool: async ({ page }, use) => {
    const factory = async (config?: PoolCreationConfig) => {
      const createPool = new CreatePoolPage(page, config)
      await createPool.goToPage()
      await impersonate(page, defaultAnvilAccount)
      return createPool
    }
    await use(factory)
  },

  poolAtTypeStep: async ({ createPool }, use) => {
    const pool = await createPool()
    await use(pool)
  },

  poolAtTokensStep: async ({ createPool }, use) => {
    const pool = await createPool()
    await pool.typeStep(true)
    await use(pool)
  },

  poolAtDetailsStep: async ({ createPool }, use) => {
    const pool = await createPool()
    await pool.typeStep(true)
    await pool.tokensStep(true)
    await use(pool)
  },

  poolAtFundStep: async ({ createPool }, use) => {
    const pool = await createPool()
    await pool.typeStep(true)
    await pool.tokensStep(true)
    await pool.detailsStep(true)
    await use(pool)
  },
})

export { expect } from '@playwright/test'
