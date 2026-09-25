import { fakeTokenBySymbol } from '@repo/lib/test/data/all-gql-tokens.fake'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { act, waitFor } from '@testing-library/react'
import { connectWithDefaultUser } from '@repo/test/utils/wagmi/wagmi-connections'
import { useTokenBalancesLogic } from './TokenBalancesProvider'
import { seedSonicTestAccount, sonicTokens } from '@repo/lib/test/integration/sonic-fixtures'

await connectWithDefaultUser()

beforeAll(async () => {
  await seedSonicTestAccount()
})

test('fetches balance for native asset token', async () => {
  const nativeAssetBasicToken = fakeTokenBySymbol('S')
  const { result } = testHook(() => useTokenBalancesLogic([nativeAssetBasicToken]))

  await waitFor(() => expect(result.current.balances.length).toBe(1))

  const sBalance = result.current.balances[0]!

  expect(sBalance).toMatchObject({
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    chainId: 146,
    decimals: 18,
  })

  expect(sBalance.amount).toBeGreaterThan(0n)
})

test('fetches token balance', async () => {
  const wsBasicToken = fakeTokenBySymbol('wS')

  const { result } = testHook(() => useTokenBalancesLogic([wsBasicToken]))

  expect(result.current.balances).toEqual([])

  await waitFor(() => expect(result.current.balances.length).toBe(1))

  expect(result.current.balances[0]).toMatchObject({
    address: sonicTokens.ws,
    chainId: 146,
    decimals: 18,
  })

  expect(result.current.balances[0]!.amount).toBeGreaterThan(0n)
})

test('refetches balances', async () => {
  const stsBasicToken = fakeTokenBySymbol('stS')

  const { result } = testHook(() => useTokenBalancesLogic([stsBasicToken]))

  await waitFor(() => expect(result.current.isBalancesLoading).toBeFalsy())
  await waitFor(() => expect(result.current.balances.length).toBe(1))

  const refetchResult = await act(() => {
    return result.current.refetchBalances()
  })

  expect(refetchResult.length).toBe(1)
  expect(refetchResult[0]?.isSuccess).toBeTruthy()

  expect(result.current.balances[0]!.address).toBe(sonicTokens.sts)
})

test('Should not return balances when user is not connected (account is empty) ', async () => {
  const wsBasicToken = fakeTokenBySymbol('wS')
  const nativeAssetToken = fakeTokenBySymbol('S')

  const { result } = testHook(() => useTokenBalancesLogic([wsBasicToken, nativeAssetToken]))

  await waitFor(() => expect(result.current.balances.length).toBe(2))
  expect(result.current.isBalancesLoading).toBeFalsy()

  expect(result.current.balances[0]).toMatchObject({
    address: sonicTokens.ws,
    chainId: 146,
    decimals: 18,
  })

  expect(result.current.balances[1]).toMatchObject({
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    chainId: 146,
    decimals: 18,
  })
})
