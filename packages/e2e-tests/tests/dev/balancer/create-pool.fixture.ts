import { test as base, expect } from '@playwright/test'
import { CreatePoolPage, PoolCreationConfig } from '@/helpers/create-pool.helpers'
import { impersonate } from '@/helpers/e2e.helpers'
import { clickButton } from '@/helpers/user.helpers'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

type CreatePoolFixtures = {
  createPool: CreatePoolPage
  createPoolWithConfig: (config: PoolCreationConfig) => Promise<CreatePoolPage>
  createPoolInProgress: CreatePoolPage
}

export const test = base.extend<CreatePoolFixtures>({
  createPool: async ({ page }, use) => {
    const createPool = new CreatePoolPage(page)
    await createPool.goToPage()
    await impersonate(page, defaultAnvilAccount)
    await use(createPool)
  },

  createPoolWithConfig: async ({ page }, use) => {
    const factory = async (config: PoolCreationConfig) => {
      const createPool = new CreatePoolPage(page, config)
      await createPool.goToPage()
      await impersonate(page, defaultAnvilAccount)
      return createPool
    }
    await use(factory)
  },

  createPoolInProgress: async ({ page, createPool }, use) => {
    await clickButton(page, 'Next')
    await expect(page).toHaveURL(createPool.urls.tokens)

    const buildLink = page.getByText('Build', { exact: true })
    await expect(buildLink).toBeVisible()
    await buildLink.click()

    await page.getByText('CoW AMM', { exact: true }).click()
    await expect(page).toHaveURL(`${createPool.urls.base}?protocol=cow`)
    await expect(page.getByText('Delete progress and start over')).toBeVisible()

    await use(createPool)
  },
})

export { expect } from '@playwright/test'
