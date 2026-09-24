import { getSdkTestUtils } from '@repo/lib/test/integration/sdk-utils'
import { toGqlWeighedPoolMock } from '@repo/lib/test/msw/builders/gqlPoolElement.builders'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { sonicTestPublicClient } from '@repo/test/utils/wagmi/wagmi-test-clients'
import { connectWithDefaultUser } from '@repo/test/utils/wagmi/wagmi-connections'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { ChainId } from '@balancer/sdk'
import { waitFor } from '@testing-library/react'
import { useOnchainUserPoolBalances } from './useOnchainUserPoolBalances'
import type { GqlPoolElement } from '@repo/lib/shared/services/api/graphql-derived-types'
import { getApiPoolMock } from '../__mocks__/api-mocks/api-mocks'
import { usdcFlyStS } from '../__mocks__/pool-examples/flat'
import { SONIC_CHAIN_ID } from '@repo/lib/test/integration/sonic-fixtures'

async function testUseChainPoolBalances(pool: GqlPoolElement) {
  const weightedPoolMock = toGqlWeighedPoolMock(pool)

  const { result } = testHook(() => {
    return useOnchainUserPoolBalances([weightedPoolMock])
  })

  return result
}

async function createSdkUtils(pool: GqlPoolElement) {
  return getSdkTestUtils({
    account: defaultTestUserAccount,
    chainId: SONIC_CHAIN_ID as ChainId,
    client: sonicTestPublicClient,
    pool,
  })
}

await connectWithDefaultUser()

describe('fetches onchain and overrides user balances', async () => {
  test('when the user has wallet balance', async () => {
    const poolMock = getApiPoolMock(usdcFlyStS) as unknown as GqlPoolElement
    const utils = await createSdkUtils(poolMock)

    // sets pool wallet balance
    await utils.setUserPoolBalance('40')

    const result = await testUseChainPoolBalances(poolMock)

    await waitFor(() => expect(result.current.data[0]!.userBalance?.walletBalance).toBe('40'))
  })

  test('when the pool does not have staking info', async () => {
    const poolMock = getApiPoolMock(usdcFlyStS) as unknown as GqlPoolElement
    poolMock.staking = undefined as any

    expect(poolMock.staking).toBeUndefined()

    const utils = await createSdkUtils(poolMock)

    // sets pool wallet balance
    await utils.setUserPoolBalance('50')

    const result = await testUseChainPoolBalances(poolMock)

    await waitFor(() => expect(result.current.isFetching).toBeFalsy())

    expect(result.current.data[0]!.userBalance?.walletBalance).toBe('50')
  })

  test('when the pool has no gaugeAddress', async () => {
    const poolMock = getApiPoolMock(usdcFlyStS) as unknown as GqlPoolElement

    // Empty staking address
    if (poolMock.staking?.gauge?.gaugeAddress) {
      poolMock.staking.gauge.gaugeAddress = ''
    }

    expect(poolMock.staking?.gauge?.gaugeAddress).toBe('')

    const utils = await createSdkUtils(poolMock)

    // sets pool wallet balance
    await utils.setUserPoolBalance('60')

    const result = await testUseChainPoolBalances(poolMock)

    await waitFor(() => expect(result.current.isFetching).toBeFalsy())
    expect(result.current.data[0]!.userBalance?.walletBalance).toBe('60')
  })
})
