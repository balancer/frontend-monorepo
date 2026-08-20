import { beforeEach, describe, expect, it, vi } from 'vitest'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { useBalTokenRewards } from './useBalRewards'
import { ClaimablePool } from '@repo/lib/modules/pool/actions/claim/ClaimProvider'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { bn } from '@repo/lib/shared/utils/numbers'

const { useUserAccountMock, useReadContractsMock } = vi.hoisted(() => ({
  useUserAccountMock: vi.fn(),
  useReadContractsMock: vi.fn(),
}))

vi.mock('wagmi', async importOriginal => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return {
    ...actual,
    useReadContracts: useReadContractsMock,
  }
})

vi.mock('@repo/lib/modules/web3/UserAccountProvider', async importOriginal => {
  const actual = await importOriginal<typeof import('@repo/lib/modules/web3/UserAccountProvider')>()
  return {
    ...actual,
    useUserAccount: useUserAccountMock,
  }
})

const USER_ADDRESS = '0x1234567890123456789012345678901234567890'
const GAUGE_ADDRESS = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
const mainnetBalAddress = getNetworkConfig(GqlChainValues.Mainnet).tokens.addresses.bal

function claimablePool(): ClaimablePool {
  return {
    id: '0xpool1',
    chain: GqlChainValues.Mainnet,
    protocolVersion: 2,
    symbol: 'BAL-WETH',
    address: '0xpool1',
    staking: { gauge: { id: GAUGE_ADDRESS } },
  } as unknown as ClaimablePool
}

describe('useBalTokenRewards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUserAccountMock.mockReturnValue({ userAddress: USER_ADDRESS, isConnected: true })
  })

  it('returns empty rewards when the onchain read reports no claimable balance', async () => {
    useReadContractsMock.mockReturnValue({
      data: [{ status: 'success', result: 0n }],
      refetch: vi.fn(),
      isLoading: false,
      status: 'success',
    })

    const { result } = testHook(() => useBalTokenRewards([claimablePool()]))

    await waitFor(() => expect(result.current.isLoadedBalRewards).toBe(true))
    expect(result.current.balRewardsData).toEqual([])
  })

  it('maps a claimable balance to a BAL reward with human and fiat value', async () => {
    useReadContractsMock.mockReturnValue({
      data: [{ status: 'success', result: 1000000000000000000n }], // 1 BAL (18 decimals)
      refetch: vi.fn(),
      isLoading: false,
      status: 'success',
    })

    const { result } = testHook(() => useBalTokenRewards([claimablePool()]))

    await waitFor(() => expect(result.current.balRewardsData).toHaveLength(1))

    const reward = result.current.balRewardsData[0]!
    expect(reward.gaugeAddress).toBe(GAUGE_ADDRESS)
    expect(reward.humanBalance).toBe('1')
    expect(reward.tokenAddress).toBe(mainnetBalAddress)
    expect(reward.pool.chain).toBe(GqlChainValues.Mainnet)
    expect(bn(reward.fiatBalance).isGreaterThanOrEqualTo(0)).toBe(true)
  })

  it('drops failed gauge reads', async () => {
    useReadContractsMock.mockReturnValue({
      data: [{ status: 'failure', error: new Error('rpc error') }],
      refetch: vi.fn(),
      isLoading: false,
      status: 'success',
    })

    const { result } = testHook(() => useBalTokenRewards([claimablePool()]))

    await waitFor(() => expect(result.current.isLoadedBalRewards).toBe(true))
    expect(result.current.balRewardsData).toEqual([])
  })
})
