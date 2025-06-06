import { vaultV2Address, wETHAddress, wjAuraAddress } from '@repo/lib/debug-helpers'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { act, waitFor } from '@testing-library/react'
import { Address } from 'viem'
import { useTokenAllowances } from './useTokenAllowances'

function testTokenAllowances(tokenAddresses: Address[]) {
  const { result } = testHook(() =>
    useTokenAllowances({
      chainId: 1,
      userAddress: defaultTestUserAccount,
      spenderAddress: vaultV2Address,
      tokenAddresses,
    })
  )
  return result
}

const tokenAddresses = [wETHAddress, wjAuraAddress]

test('fetches token allowances', async () => {
  const result = testTokenAllowances(tokenAddresses)
  await waitFor(() => expect(result.current.isAllowancesLoading).toBeFalsy())

  expect(result.current.allowances).toEqual(
    expect.objectContaining({
      [wjAuraAddress]: expect.any(BigInt),
      [wETHAddress]: expect.any(BigInt),
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
