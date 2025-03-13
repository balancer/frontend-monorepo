/* This file is run once before integration tests to update the saved pool API mocks
(check api-mocks directory)
*/
import { boostedPoolExamples } from '@repo/lib/modules/pool/__mocks__/pool-examples/boosted'
import { flatPoolExamples } from '@repo/lib/modules/pool/__mocks__/pool-examples/flat'
import { nestedPoolExamples } from '@repo/lib/modules/pool/__mocks__/pool-examples/nested'
import { PoolExample } from '@repo/lib/modules/pool/__mocks__/pool-examples/pool-examples.types'
import {
  saveAllPoolApiMocksFile,
  savePoolMock,
} from '@repo/lib/modules/pool/__mocks__/savePoolMock'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'

const allPoolExamples = [...flatPoolExamples, ...boostedPoolExamples, ...nestedPoolExamples]

export type ApiMockOptions = {
  apiUrl: string // We can generate mocks from test (includes sepolia pools) or production
  poolId?: string // Only save the mock for the given poolId
}

export default async function saveApiMocks({ apiUrl, poolId }: ApiMockOptions) {
  if (poolId) console.log('Saving mock for poolId:', { poolId })

  const promises = allPoolExamples.map(example => {
    if (shouldSkipMock(apiUrl, example) || (poolId && !isSameAddress(example.poolId, poolId))) {
      return Promise.resolve(example.mockName)
    }

    return savePoolMock({
      poolId: example.poolId,
      chain: example.poolChain,
      apiUrl,
      fileName: example.mockName,
      isFrozen: example.isFrozen,
    })
  })

  const mockFileNames: string[] = (await Promise.all(promises)).filter(f => f !== undefined)

  await saveAllPoolApiMocksFile(mockFileNames)

  console.log(`✅ Updated mocks using api: ${apiUrl} \n`)
}

function shouldSkipMock(apiUrl: string, example: PoolExample) {
  // Avoid saving mock in CI runs
  if (process.env.CI) return true

  // Skip Sepolia mock for non test-api
  if (!apiUrl?.includes('test-api') && example.poolChain === GqlChain.Sepolia) {
    return true
  }
  return false
}
