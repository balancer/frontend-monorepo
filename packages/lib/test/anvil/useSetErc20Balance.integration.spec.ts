import { daiAddress } from '@repo/lib/debug-helpers'
import { act, waitFor } from '@testing-library/react'
import { erc20Abi } from 'viem'
import { testHook } from '../utils/custom-renderers'
import { mainnetTestPublicClient } from '../utils/wagmi/wagmi-test-clients'
import { defaultTestUserAccount } from './anvil-setup'
import { testWagmiConfig } from './testWagmiConfig'
import { useSetErc20Balance } from './useSetErc20Balance'

function testUseSetErc20Balance() {
  const { result } = testHook(() => useSetErc20Balance())
  return result
}

test('When adding nested liquidity for a weighted pool', async () => {
  const result = testUseSetErc20Balance()

  const newBalance = 30_0000n

  await act(() =>
    result.current.mutateAsync({
      address: defaultTestUserAccount,
      tokenAddress: daiAddress,
      value: newBalance,
      wagmiConfig: testWagmiConfig,
      chainId: 1,
    })
  )

  await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

  const newDaiBalance = await mainnetTestPublicClient.readContract({
    address: daiAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [defaultTestUserAccount],
  })

  expect(newDaiBalance).toBe(newBalance)
})
