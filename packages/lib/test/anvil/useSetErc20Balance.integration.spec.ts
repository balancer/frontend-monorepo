import { act, waitFor } from '@testing-library/react'
import { erc20Abi, parseUnits } from 'viem'
import { testHook } from '../utils/custom-renderers'
import { useSetErc20Balance } from './useSetErc20Balance'
import { sonicTestPublicClient } from '@repo/test/utils/wagmi/wagmi-test-clients'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { testWagmiConfig } from '@repo/test/anvil/testWagmiConfig'
import { TokenBalance } from '../utils/wagmi/fork-options'
import { SONIC_CHAIN_ID, sonicTokens } from '../integration/sonic-fixtures'

function testUseSetErc20Balance() {
  const { result } = testHook(() => useSetErc20Balance())
  return result
}

test('sets the erc20 balance of an account on the Sonic fork', async () => {
  const result = testUseSetErc20Balance()

  const newBalance = '30000'

  const balance: TokenBalance = {
    tokenAddress: sonicTokens.ws,
    value: newBalance,
  }

  await act(() =>
    result.current.mutateAsync({
      address: defaultTestUserAccount,
      balance,
      wagmiConfig: testWagmiConfig,
      chainId: SONIC_CHAIN_ID,
    })
  )

  await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

  const newWsBalance = await sonicTestPublicClient.readContract({
    address: sonicTokens.ws,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [defaultTestUserAccount],
  })

  expect(newWsBalance).toBe(parseUnits(newBalance, 18))
})
