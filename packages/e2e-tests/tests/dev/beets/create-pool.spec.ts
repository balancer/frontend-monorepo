import { PoolType } from '@balancer/sdk'
import { CreatePoolPage, type PoolCreationConfig } from '@/helpers/create-pool.helpers'
import { impersonate } from '@/helpers/e2e.helpers'
import { test as base, expect } from '@/helpers/create-pool.fixtures'
import { defaultAnvilAccount, forkClient } from '@repo/lib/test/utils/wagmi/fork.helpers'

const BASE_URL = 'http://localhost:3001/create'

const POOL_CREATION_CONFIGS: [PoolCreationConfig, ...PoolCreationConfig[]] = [
  {
    type: PoolType.Stable,
    tokens: [
      { symbol: 'wS', amount: '10' },
      { symbol: 'stS', amount: '10' },
    ],
  },
  {
    type: PoolType.StableSurge,
    tokens: [
      { symbol: 'wS', amount: '10' },
      { symbol: 'stS', amount: '10' },
    ],
  },
  {
    type: PoolType.Weighted,
    tokens: [
      { symbol: 'BEETS', amount: '100' },
      { symbol: 'wS', amount: '1' },
    ],
  },
  {
    type: PoolType.GyroE,
    tokens: [
      { symbol: 'wS', amount: '1' },
      { symbol: 'stS', amount: undefined },
    ],
  },
]

const test = base.extend({
  createPool: async ({ page }, use) => {
    await use(async (config?: PoolCreationConfig) => {
      const pool = new CreatePoolPage(page, config ?? POOL_CREATION_CONFIGS[0], {
        baseUrl: BASE_URL,
        networkName: 'Sonic',
        hasProtocolChoice: false,
      })
      await pool.goToPage()
      await impersonate(page, defaultAnvilAccount)
      return pool
    })
  },
})

test.describe('Create each pool type on Sonic', () => {
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
