import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { act, waitFor } from '@testing-library/react'
import { Address } from 'viem'
import { useTokenAllowances } from './useTokenAllowances'
import {
  SONIC_CHAIN_ID,
  sonicContracts,
  sonicTokens,
} from '@repo/lib/test/integration/sonic-fixtures'

function testTokenAllowances(tokenAddresses: Address[]) {
  const { result } = testHook(() =>
    useTokenAllowances({
      chainId: SONIC_CHAIN_ID,
      userAddress: defaultTestUserAccount,
      spenderAddress: sonicContracts.vaultV2,
      tokenAddresses,
    })
  )

  return result
}

const tokenAddresses = [sonicTokens.ws, sonicTokens.sts]

test('fetches token allowances', async () => {
  const result = testTokenAllowances(tokenAddresses)
  await waitFor(() => expect(result.current.isAllowancesLoading).toBeFalsy())

  expect(result.current.allowances).toEqual(
    expect.objectContaining({
      [sonicTokens.ws]: expect.any(BigInt),
      [sonicTokens.sts]: expect.any(BigInt),
    })
  )
})

test('allows refetching allowances', async () => {
  const result = testTokenAllowances(tokenAddresses)

  await waitFor(() => expect(result.current.isAllowancesLoading).toBeFalsy())

  await act(() => result.current.refetchAllowances())

  expect(result.current.isAllowancesRefetching).toBeTruthy()
  await waitFor(() => expect(result.current.isAllowancesRefetching).toBeFalsy())
})
