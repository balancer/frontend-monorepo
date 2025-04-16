import { ChainId } from '@balancer/sdk'
import { alternativeTestUserAccount } from '@repo/lib/test/anvil/anvil-setup'
import { setVeBalBptBalance } from '@repo/lib/test/integration/sdk-utils'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { connectAndImpersonate } from '@repo/lib/test/utils/wagmi/wagmi-connections'
import { waitFor } from '@testing-library/react'
import { parseUnits } from 'viem'
import { TokenBalancesProviderMock } from './__mocks__/provider-mocks'
import { useMaxAmountOfVeBAL } from './useMaxAmountOfVeBal'

describe('useMaxAmountOfVeBAL hook', () => {
  it('should calculate max veBAL amount and percentage', async () => {
    const veBalHolder = alternativeTestUserAccount
    await connectAndImpersonate(veBalHolder, ChainId.MAINNET)

    const veBalBptBalance: bigint = parseUnits('3000', 18)

    await setVeBalBptBalance({
      account: veBalHolder,
      balance: veBalBptBalance,
    })

    const { result } = testHook(() => useMaxAmountOfVeBAL(), { wrapper: TokenBalancesProviderMock })
    await waitFor(() => expect(result.current.isMaxAmountLoading).toBeFalsy())

    const maxAmount = result.current.maxAmount
    expect(maxAmount.isGreaterThan(0)).toBe(true)
    expect(maxAmount.isLessThan(5000)).toBe(true)

    const currentVeBalBalance = parseUnits('1000', 18)
    const veBalPercentage = result.current.calculateCurrentVeBalPercentage(currentVeBalBalance)
    expect(veBalPercentage).toBeGreaterThan(10)
    expect(veBalPercentage).toBeLessThan(100)
  })
})
