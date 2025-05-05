import { ChainId } from '@balancer/sdk'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { connectAndImpersonate } from '@repo/test/utils/wagmi/wagmi-connections'
import { waitFor } from '@testing-library/react'
import { useVebalUserStats } from './useVeBalUserStats'
import { TokenBalancesProviderMock } from '../__mocks__/provider-mocks'

describe('useVebalUserStats hook', () => {
  it('should return user veBAL stats', async () => {
    const veBalHolder = '0xaf52695e1bb01a16d33d7194c28c42b10e0dbec2'

    await connectAndImpersonate(veBalHolder, ChainId.MAINNET)

    const { result } = testHook(() => useVebalUserStats(), { wrapper: TokenBalancesProviderMock })

    await waitFor(() => expect(result.current.lockedInfoIsLoading).toBeFalsy())
    await waitFor(() => expect(result.current.userDataIsLoading).toBeFalsy())

    const userStats = result.current.userStats

    if (!userStats) throw new Error('User stats should be defined')

    expect(userStats.balance).toBeGreaterThan(0n)
    expect(userStats.lockExpired).toBeFalsy()
    expect(userStats.rank).toBe(1)

    const percentOfAllSupply = userStats.percentOfAllSupply?.toNumber()
    expect(percentOfAllSupply).toBeGreaterThan(0)
    expect(percentOfAllSupply).toBeLessThan(100)
  })
})
