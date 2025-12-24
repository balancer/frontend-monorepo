import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { useBuildUnstakeCallData } from './useBuildUnstakeCallData'
import { GaugeService } from '@repo/lib/shared/services/staking/gauge.service'
import { BatchRelayerService } from '@repo/lib/shared/services/batch-relayer/batch-relayer.service'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { Address } from 'viem'
import { aGqlPoolElementMock } from '@repo/lib/test/msw/builders/gqlPoolElement.builders'
import { act } from '@testing-library/react'

function testBuildUnstakeCallData(amount: bigint, userAddress: Address = defaultTestUserAccount) {
  const batchRelayerService = BatchRelayerService.create(
    mainnetNetworkConfig.contracts.balancer.relayerV6
  )

  const gaugeService = new GaugeService(batchRelayerService)
  const gauges = [aGqlPoolElementMock().staking?.id || ''] as Address[]
  const { result } = testHook(() =>
    useBuildUnstakeCallData({
      amount,
      gaugeService,
      gauges,
      hasUnclaimedBalRewards: false,
      hasUnclaimedNonBalRewards: false,
      userAddress,
    })
  )

  return result
}
describe('useBuildUnstakeCallData', () => {
  test('when no amount', () => {
    const result = testBuildUnstakeCallData(0n)
    expect(result.current).toEqual([])
  })

  test('when no connected user', () => {
    const notConnectedUserAddress = '' as Address
    const result = testBuildUnstakeCallData(10n, notConnectedUserAddress)
    expect(result.current).toEqual([])
  })

  test('generates a valid unstake call data', async () => {
    const result = await act(() => testBuildUnstakeCallData(10n))

    expect(result.current).toEqual([
      '0x65ca48040000000000000000000000002d42910d826e5500579d121596e98a6eb33c0a1b0000000000000000000000003b7d260597a3e3f90274563a9e481618c6b951eb0000000000000000000000003b7d260597a3e3f90274563a9e481618c6b951eb000000000000000000000000000000000000000000000000000000000000000a',
    ])
  })
})
