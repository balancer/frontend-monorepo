import { testHook } from '@/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'

import { getGqlChain } from '@/lib/config/app.config'
import { polAddress } from '@/lib/debug-helpers'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { Address, Hash } from 'viem'
import { polygon } from 'viem/chains'
import { useAddLiquidityReceipt, useRemoveLiquidityReceipt, useSwapReceipt } from './receipt.hooks'

async function testAddReceipt(userAddress: Address, txHash: Hash, chainId = 1) {
  const { result } = testHook(() => {
    return useAddLiquidityReceipt({
      chain: getGqlChain(chainId),
      txHash,
      userAddress,
    })
  })
  return result
}

async function testRemoveReceipt(userAddress: Address, txHash: Hash, chainId = 1) {
  const { result } = testHook(() => {
    return useRemoveLiquidityReceipt({
      txHash,
      userAddress,
      chain: getGqlChain(chainId),
    })
  })
  return result
}

async function testSwapReceipt(userAddress: Address, txHash: Hash, chain: GqlChain) {
  const { result } = testHook(() => {
    return useSwapReceipt({
      txHash,
      userAddress,
      chain,
    })
  })
  return result
}

test('queries add liquidity transaction', async () => {
  // https://etherscan.io/tx/0x887f144bdfe73c7e585b0630361038bda9665aa213933f637d1d6fae9046652e
  const userAddress = '0x2a88a454A7b0C29d36D5A121b7Cf582db01bfCEC'
  const txHash = '0x887f144bdfe73c7e585b0630361038bda9665aa213933f637d1d6fae9046652e'

  const result = await testAddReceipt(userAddress, txHash)

  await waitFor(() => expect(result.current.isLoading).toBeFalsy())

  await waitFor(() => expect(result.current.sentTokens).toBeDefined())

  expect(result.current.sentTokens).toEqual([
    {
      tokenAddress: '0x198d7387Fa97A73F05b8578CdEFf8F2A1f34Cd1F',
      humanAmount: '12',
    },
    {
      tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      humanAmount: '0.04',
    },
  ])

  expect(result.current.receivedBptUnits).toBe('7.669852124112308228')
})

test('queries add liquidity with native token', async () => {
  // https://polygonscan.com/tx/0x611a0eeeff15c2a5efc587b173fa577475134de2554a452259f112db67bd4de8
  const userAddress = '0xf76142b79Db34E57852d68F9c52C0E24f7349647'
  const txHash = '0x611a0eeeff15c2a5efc587b173fa577475134de2554a452259f112db67bd4de8'

  const result = await testAddReceipt(userAddress, txHash, polygon.id)

  await waitFor(() => expect(result.current.isLoading).toBeFalsy())
  await waitFor(() => expect(result.current.sentTokens).toBeDefined())

  expect(result.current.sentTokens).toEqual([
    {
      tokenAddress: polAddress,
      humanAmount: '1',
    },
  ])

  expect(result.current.receivedBptUnits).toBe('0.984524168989962117')
})

test('queries remove liquidity transaction', async () => {
  // https://etherscan.io/tx/0x71301b46984d3d2e6b58c1fc0c99cc0561ec0f26d53bda8413528a7fb6828fc3
  const userAddress = '0x84f240cA232917d771DFBbd8C917B4669Ed640CD'
  const txHash = '0x71301b46984d3d2e6b58c1fc0c99cc0561ec0f26d53bda8413528a7fb6828fc3'

  const result = await testRemoveReceipt(userAddress, txHash)

  await waitFor(() => expect(result.current.isLoading).toBeFalsy())
  await waitFor(() => expect(result.current.receivedTokens).toBeDefined())

  expect(result.current.receivedTokens).toEqual([
    {
      humanAmount: '16597.845312687911573359',
      tokenAddress: '0x198d7387Fa97A73F05b8578CdEFf8F2A1f34Cd1F',
    },
    {
      humanAmount: '4.553531492712836774',
      tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
  ])

  expect(result.current.sentBptUnits).toBe('6439.400687368663510166')
})

describe('queries swap transaction', () => {
  const polAddress = '0x0000000000000000000000000000000000001010'
  const wPolAddress = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
  const daiAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'

  test('when the native asset is not included (from DAI to WPOL)', async () => {
    const userAddress = '0xf76142b79Db34E57852d68F9c52C0E24f7349647'
    // https://polygonscan.com/tx/0x11380dcffb24c512da18f032d9f7354d154cfda6bbab0633df182fcd202c4244
    const txHash = '0x11380dcffb24c512da18f032d9f7354d154cfda6bbab0633df182fcd202c4244'

    const result = await testSwapReceipt(userAddress, txHash, GqlChain.Polygon)

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    expect(result.current.sentToken).toEqual({
      humanAmount: '1',
      tokenAddress: daiAddress,
    })

    expect(result.current.receivedToken).toEqual({
      humanAmount: '1.419839650912753603',
      tokenAddress: wPolAddress,
    })
  })

  test('when the native asset is the token in (from POL to DAI)', async () => {
    const userAddress = '0xf76142b79Db34E57852d68F9c52C0E24f7349647'
    // https://polygonscan.com/tx/0x78ddd90502509a264a5e8f4f3732668db669e7614f4887f2a233ce39e5eafa7c
    const txHash = '0x78ddd90502509a264a5e8f4f3732668db669e7614f4887f2a233ce39e5eafa7c'

    const result = await testSwapReceipt(userAddress, txHash, GqlChain.Polygon)

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    expect(result.current.sentToken).toEqual({
      humanAmount: '1',
      tokenAddress: polAddress,
    })

    expect(result.current.receivedToken).toEqual({
      humanAmount: '0.693570611425675513',
      tokenAddress: daiAddress,
    })
  })

  test('when the native asset is the token out (from DAI to POL)', async () => {
    const userAddress = '0xf76142b79Db34E57852d68F9c52C0E24f7349647'
    // https://polygonscan.com/tx/0xe0b75845d13ae12029c8dfef68488b3bf35347460fafdb3a15a5c7f884226288
    const txHash = '0xe0b75845d13ae12029c8dfef68488b3bf35347460fafdb3a15a5c7f884226288'

    const result = await testSwapReceipt(userAddress, txHash, GqlChain.Polygon)

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    expect(result.current.sentToken).toEqual({
      humanAmount: '0.1',
      tokenAddress: daiAddress,
    })

    expect(result.current.receivedToken).toEqual({
      humanAmount: '0.241277224191485579',
      tokenAddress: polAddress,
    })
  })
})

test('returns is loading when user is not provided', async () => {
  const userAddress = '' as Address
  const txHash = '0x887f144bdfe73c7e585b0630361038bda9665aa213933f637d1d6fae9046652e'

  const result = await testAddReceipt(userAddress, txHash)

  await waitFor(() => expect(result.current.isLoading).toBeTruthy())
})
