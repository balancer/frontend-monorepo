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

const allPoolExamples = [...flatPoolExamples, ...boostedPoolExamples, ...nestedPoolExamples]

export default async function saveApiMocks() {
  if (process.env.NEXT_PUBLIC_UPDATE_API_MOCKS !== 'true') {
    console.log('Skipping api mocks update\n')
    return
  }
  const promises = allPoolExamples.map(example => {
    if (shouldSkipMock(example)) {
      return Promise.resolve(example.mockName)
    }

    return savePoolMock(example.poolId, example.poolChain, example.mockName)
  })

  const mockFileNames: string[] = (await Promise.all(promises)).filter(f => f !== undefined)

  await saveAllPoolApiMocksFile(mockFileNames)

  console.log(`✅ Updated mocks using api: ${process.env.NEXT_PUBLIC_BALANCER_API_URL} \n`)
}

function shouldSkipMock(example: PoolExample) {
  // Avoid saving mock in CI runs
  if (process.env.CI) return true

  // Skip Sepolia mock for non test-api
  if (
    !process.env.NEXT_PUBLIC_BALANCER_API_URL?.includes('test-api') &&
    example.poolChain === GqlChain.Sepolia
  ) {
    return true
  }
  return false
}
