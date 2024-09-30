import { vaultV2Address, wETHAddress, wjAuraAddress } from '../../debug-helpers'
import { act, waitFor } from '@testing-library/react'
import { Address } from 'viem'
import { useTokenAllowances } from './useTokenAllowances'
import { defaultTestUserAccount } from '../../test/anvil/anvil-setup'
import { testHook } from '../../test/utils/custom-renderers'

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

  act(() => {
    result.current.refetchAllowances()
  })

  expect(result.current.isAllowancesRefetching).toBeTruthy()
  await waitFor(() => expect(result.current.isAllowancesRefetching).toBeFalsy())
})
