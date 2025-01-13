/* This file is run once before integration tests to update the saved pool API mocks
(check api-mocks directory)
*/
import { boostedPoolExamples } from '@repo/lib/modules/pool/__mocks__/pool-examples/boosted'
import { flatPoolExamples } from '@repo/lib/modules/pool/__mocks__/pool-examples/flat'
import { nestedPoolExamples } from '@repo/lib/modules/pool/__mocks__/pool-examples/nested'
import { PoolExample } from '@repo/lib/modules/pool/__mocks__/pool-examples/pool-examples.types'
import { savePoolMock } from '@repo/lib/modules/pool/__mocks__/savePoolMock'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export default async function saveApiMocks() {
  const allPoolExamples = [...flatPoolExamples, ...boostedPoolExamples, ...nestedPoolExamples]

  const promises = allPoolExamples.map(example => {
    if (shouldSkipMock(example)) return

    return savePoolMock(example.poolId, example.poolChain, example.mockName)
  })

  await Promise.all(promises)

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
